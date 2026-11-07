"""Patch stats (RGB 0-255, full-range decode) for grading decisions. python -I tools/measure_grade.py src.mp4 FACE_TRACK.json [vf]"""
import sys, json, subprocess, numpy as np
src, ft = sys.argv[1], sys.argv[2]; vf = sys.argv[3] if len(sys.argv) > 3 else 'null'
face = json.load(open(ft))['frames']
for t in [1.5, 5.0, 8.5]:
    f = int(t * 30); b = face[f]
    raw = subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',src,'-frames:v','1','-vf',vf+',format=rgb24','-f','rawvideo','-'],capture_output=True).stdout
    im = np.frombuffer(raw, np.uint8).reshape(1920,1080,3).astype(float)
    cx, cy, w = b['cx'], b['cy'], b['w']
    def p(x0,y0,x1,y1): return im[int(y0):int(y1),int(x0):int(x1)].reshape(-1,3).mean(0).round(1)
    cheek = p(cx-0.3*w, cy+0.05*w, cx-0.12*w, cy+0.22*w)
    blouse = p(cx-0.5*w, cy+1.4*w, cx+0.5*w, cy+1.9*w)
    wall = p(820, 300, 1000, 420) if t < 3.5 else p(930,700,1050,900)
    luma = im.mean(2)
    print(f't={t} cheek {cheek} blouse {blouse} wall {wall} | p1 {np.percentile(luma,1):.0f} p50 {np.percentile(luma,50):.0f} p99 {np.percentile(luma,99):.0f} clip>250 {(im.max(2)>250).mean()*100:.1f}%')
