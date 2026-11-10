"""Face track + lip-sync estimate for the master proxy (0-10.5 s).
Writes audit/v03/FACE_TRACK.json and prints AV offset estimate.
Run: python -I tools/analyze_master.py <proxy.mp4> <out_dir>"""
import sys, json, subprocess, numpy as np, cv2
src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
faces, mouth = [], []
prev = None; last = None; i = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    small = cv2.resize(g, (540, 960))
    det = casc.detectMultiScale(small, 1.08, 5, minSize=(60, 60))
    if len(det):
        # pick the biggest
        x, y, w, h = max(det, key=lambda d: d[2] * d[3])
        last = [float(x * 2), float(y * 2), float(w * 2), float(h * 2)]
        hit = True
    else:
        hit = False
    faces.append({'f': i, 'hit': hit, 'box': last})
    if last:
        x, y, w, h = [int(v) for v in last]
        m = g[y + int(h * 0.68): y + int(h * 0.95), x + int(w * 0.28): x + int(w * 0.72)]
        m = cv2.resize(m, (64, 32)).astype(np.float32)
        mouth.append(float(np.abs(m - prev).mean()) if prev is not None else 0.0)
        prev = m
    else:
        mouth.append(0.0)
    i += 1
n = i
# smooth face boxes (interpolate misses, then moving average) per shot
boxes = np.array([f['box'] if f['box'] else [np.nan] * 4 for f in faces], dtype=float)
for c in range(4):
    v = boxes[:, c]; idx = np.arange(n); ok = ~np.isnan(v)
    boxes[:, c] = np.interp(idx, idx[ok], v[ok])
CUT = int(sys.argv[3]) if len(sys.argv) > 3 else 107
sm = boxes.copy()
for a, b in [(0, CUT), (CUT, n)]:
    for c in range(4):
        seg = boxes[a:b, c]; k = 7
        pad = np.pad(seg, (k // 2, k // 2), mode='edge')
        sm[a:b, c] = np.convolve(pad, np.ones(k) / k, mode='valid')
json.dump({'note': 'Haar face box per output frame (px, 1080x1920 master space), smoothed 7f within each shot; cut at f107',
           'frames': [{'f': j, 'hit': faces[j]['hit'], 'cx': round(sm[j,0]+sm[j,2]/2,1), 'cy': round(sm[j,1]+sm[j,3]/2,1), 'w': round(sm[j,2],1), 'h': round(sm[j,3],1)} for j in range(n)]},
          open(out + '/FACE_TRACK.json', 'w'), indent=0)
hits = sum(f['hit'] for f in faces)
print('frames', n, 'face hits', hits)
for j in [0, 30, 60, 100, 110, 150, 200, 250, 290]:
    print(j, faces[j]['hit'], [round(v) for v in sm[j]])
# audio envelope at 30 fps
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '48000', '-f', 's16le', '-'], capture_output=True).stdout
a = np.frombuffer(pcm, dtype=np.int16).astype(float)
hop = 1600
env = np.array([np.sqrt((a[k*hop:(k+1)*hop] ** 2).mean() + 1e-9) for k in range(n)])
env = np.log(env + 1); d_env = np.abs(np.diff(env, prepend=env[0]))
mo = np.array(mouth); mo = (mo - mo.mean()) / (mo.std() + 1e-9)
best = []
for seg in [(0, 105), (110, 315)]:
    s0, s1 = seg
    x = mo[s0:s1]; 
    for name, y in [('env', env[s0:s1]), ('denv', d_env[s0:s1])]:
        y = (y - y.mean()) / (y.std() + 1e-9)
        cc = {lag: float(np.mean(x[max(0, -lag):len(x) - max(0, lag)] * y[max(0, lag):len(y) - max(0, -lag)])) for lag in range(-8, 9)}
        lag = max(cc, key=cc.get)
        print(f'seg {seg} mouth-motion vs audio {name}: best lag {lag} f ({lag*33.3:.0f} ms, + = audio after video) r={cc[lag]:.3f}  r@0={cc[0]:.3f}')
np.save(out + '/env30.npy', env)
