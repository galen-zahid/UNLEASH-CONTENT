"""Track saturated, sharp-edged magenta type in the reference AFTER crop (excludes the blurred pink background).
python -I tools/ref_text_track.py <ref_after_crop.mp4> <out_json>"""
import sys, json, numpy as np, cv2
cap = cv2.VideoCapture(sys.argv[1]); out = {}
i = 0
while True:
    ok, fr = cap.read()
    if not ok or i > 300: break
    if 15 <= i <= 112 or 225 <= i <= 290:
        hsv = cv2.cvtColor(fr, cv2.COLOR_BGR2HSV); g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
        h, s, v = hsv[..., 0].astype(int), hsv[..., 1], hsv[..., 2]
        pinkm = ((h >= 160) | (h <= 3)) & (s > 140) & (v > 170)
        grad = cv2.magnitude(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
        edge = cv2.dilate((grad > 120).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
        m = (pinkm & edge).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
        n, lab, st, cen = cv2.connectedComponentsWithStats(m)
        keep = [k for k in range(1, n) if st[k, 4] > 30]
        if keep:
            H, W = g.shape
            x0 = min(st[k, 0] for k in keep); y0 = min(st[k, 1] for k in keep)
            x1 = max(st[k, 0] + st[k, 2] for k in keep); y1 = max(st[k, 1] + st[k, 3] for k in keep)
            area = sum(st[k, 4] for k in keep)
            out[i] = {'box': [round(x0 / W, 3), round(y0 / H, 3), round(x1 / W, 3), round(y1 / H, 3)], 'area': round(area / (W * H) * 1000, 2), 'n': len(keep)}
    i += 1
json.dump(out, open(sys.argv[2], 'w'))
for k, v in out.items(): print(k, v['box'], 'w=%.3f h=%.3f' % (v['box'][2] - v['box'][0], v['box'][3] - v['box'][1]), 'area', v['area'], 'n', v['n'])
