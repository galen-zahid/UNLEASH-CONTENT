"""Frame-by-frame measurements of the reference AFTER panel (larg8ak17f8d, crop 474x844 @202,210, 30 fps).
Outputs audit/v04/REF_MOTION.json + diagnostic sheets. Values are normalised to the panel (0..1).

python -I tools/ref_motion_analysis.py <ref_after_crop.mp4> <out_dir>
Measures:
  aperture   f0-f80   sharp-region bounding box (Laplacian energy) + grid-line positions
  pinkText   f15-f110, f225-f290  bbox / area of saturated magenta type (headline entrances, overshoot)
  white      f0-f20   white scribble bbox
  wipe       f110-f122 white-disc equivalent radius (circle wipe)
  camera     ORB similarity scale/translation between consecutive frames (push-ins)
"""
import json, sys
import numpy as np, cv2

src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
frames = []
while True:
    ok, fr = cap.read()
    if not ok or len(frames) >= 315:
        break
    frames.append(fr)
H, W = frames[0].shape[:2]
res = {'panel': [W, H], 'fps': 30, 'frames': {}}

def sharp_box(g):
    lap = np.abs(cv2.Laplacian(cv2.GaussianBlur(g, (3, 3), 0), cv2.CV_32F))
    e = cv2.blur(lap, (21, 21))
    thr = max(4.0, np.percentile(e, 99) * 0.18)
    m = e > thr
    cols = m.mean(0); rows = m.mean(1)
    cx = np.where(cols > 0.12)[0]; ry = np.where(rows > 0.12)[0]
    if len(cx) < 3 or len(ry) < 3:
        return None
    return [cx[0] / W, ry[0] / H, (cx[-1] + 1) / W, (ry[-1] + 1) / H]

def grid_lines(g):
    hp = g.astype(np.float32) - cv2.blur(g, (9, 9)).astype(np.float32)
    col = np.clip(hp, 0, None).mean(0); row = np.clip(hp, 0, None).mean(1)
    def peaks(p, n):
        p = p.copy(); out = []
        for _ in range(n):
            k = int(np.argmax(p))
            if p[k] < 2.0: break
            out.append(k); p[max(0, k - 12):k + 12] = 0
        return sorted(out)
    return [x / W for x in peaks(col, 2)], [y / H for y in peaks(row, 2)]

def pink(fr):
    hsv = cv2.cvtColor(fr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0].astype(int), hsv[..., 1], hsv[..., 2]
    m = (((h >= 160) | (h <= 3)) & (s > 110) & (v > 140)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 25]
    if not keep:
        return None
    xs = np.concatenate([[st[i, 0], st[i, 0] + st[i, 2]] for i in keep]); ys = np.concatenate([[st[i, 1], st[i, 1] + st[i, 3]] for i in keep])
    area = sum(st[i, cv2.CC_STAT_AREA] for i in keep)
    return {'box': [xs.min() / W, ys.min() / H, xs.max() / W, ys.max() / H], 'area': area / (W * H)}

orb = cv2.ORB_create(1500)
prev_kp = prev_des = None
for i, fr in enumerate(frames):
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    d = {}
    if i <= 80:
        d['aperture'] = sharp_box(g)
        d['gridX'], d['gridY'] = grid_lines(g)
    if 15 <= i <= 110 or 225 <= i <= 290:
        d['pink'] = pink(fr)
    if i <= 20:
        wm = ((g > 235) & (cv2.cvtColor(fr, cv2.COLOR_BGR2HSV)[..., 1] < 30)).astype(np.uint8)
        ys, xs = np.where(wm)
        d['white'] = [xs.min() / W, ys.min() / H, xs.max() / W, ys.max() / H] if len(xs) > 40 else None
    if 108 <= i <= 124:
        wm = (g > 240).astype(np.uint8)
        d['wipeRadius'] = float(np.sqrt(wm.sum() / np.pi) / H)
    # camera (similarity) between i-1 and i, on the central region
    kp, des = orb.detectAndCompute(g, None)
    if prev_des is not None and des is not None and len(kp) > 30:
        mt = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(prev_des, des)
        if len(mt) > 25:
            p0 = np.float32([prev_kp[m.queryIdx].pt for m in mt]); p1 = np.float32([kp[m.trainIdx].pt for m in mt])
            M, inl = cv2.estimateAffinePartial2D(p0, p1, method=cv2.RANSAC, ransacReprojThreshold=2.0)
            if M is not None and inl is not None and inl.sum() > 20:
                d['cam'] = {'scale': float(np.hypot(M[0, 0], M[1, 0])), 'dx': float(M[0, 2] / W), 'dy': float(M[1, 2] / H), 'inliers': int(inl.sum())}
    prev_kp, prev_des = kp, des
    res['frames'][i] = d

json.dump(res, open(f'{out}/REF_MOTION.json', 'w'), indent=0)
# compact print
print('f  aperture(x0,y0,x1,y1)            gridX            gridY')
for i in range(0, 81):
    d = res['frames'][i]
    a = d.get('aperture'); print(f"{i:3d} {[round(v,3) for v in a] if a else None}  {[round(v,3) for v in d['gridX']]}  {[round(v,3) for v in d['gridY']]}")
