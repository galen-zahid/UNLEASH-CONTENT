"""Manual lip-sync evidence: mouth crops per frame around bilabial onsets + audio envelope (10 ms).
python -I tools/lipsync_strips.py proxy.mp4 FACE_TRACK.json outdir"""
import sys, json, subprocess, numpy as np, cv2
src, ft, out = sys.argv[1:4]
face = json.load(open(ft))['frames']
pcm = subprocess.run(['ffmpeg','-v','error','-i',src,'-ac','1','-ar','48000','-f','s16le','-'],capture_output=True).stdout
a = np.frombuffer(pcm,dtype=np.int16).astype(float)
env = np.array([np.sqrt((a[k*480:(k+1)*480]**2).mean()) for k in range(len(a)//480)])  # 10 ms
db = 20*np.log10(env+1)
words = [('bangun',1.76),('butuh',2.60),('Percuma',3.96),('modal',4.24),('produk',7.04),('bagus',7.34),('personal',8.08)]
cap = cv2.VideoCapture(src); frames=[]
while True:
    ok,fr=cap.read()
    if not ok: break
    frames.append(fr)
rows=[]; report=[]
for w,t in words:
    # acoustic onset: first 10ms bin within ±150 ms of ASR time where level rises >9 dB over previous 50 ms min
    k0=int(t*100)
    cand=[k for k in range(k0-15,k0+15) if db[k]-db[k-5:k].min()>9]
    on = cand[0]/100 if cand else None
    f0=int(round(t*30))
    tiles=[]
    for f in range(f0-4,f0+5):
        b=face[f]; cx,cy,wd,h=b['cx'],b['cy'],b['w'],b['h']
        y0=int(cy+0.15*h); y1=int(cy+0.5*h); x0=int(cx-0.3*wd); x1=int(cx+0.3*wd)
        m=cv2.resize(frames[f][y0:y1,x0:x1],(120,70))
        lvl=db[int(f/30*100):int(f/30*100)+3].mean()
        cv2.putText(m,f'f{f}',(2,12),0,0.4,(0,255,255),1); cv2.putText(m,f'{lvl:.0f}dB',(2,66),0,0.4,(0,255,0),1)
        if on and int(on*30)==f: cv2.rectangle(m,(0,0),(119,69),(0,0,255),2)
        tiles.append(m)
    row=np.hstack(tiles); cv2.putText(row,f'{w} asr {t:.2f}s onset {on}',(130*4,12),0,0.4,(255,255,255),1)
    rows.append(row); report.append((w,t,on))
cv2.imwrite(out+'/LIPSYNC_bilabials.png',np.vstack(rows))
for r in report: print(r)
