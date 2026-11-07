"""VO A/B metrics: python -I tools/vo_ab.py dir"""
import sys, soundfile as sf, numpy as np
from scipy import signal
d = sys.argv[1]
for f in ['vo_original', 'vo_clean']:
    x, sr = sf.read(f'{d}/{f}.wav'); x = x.mean(1)
    lv = lambda a, b: 20 * np.log10(np.sqrt((x[int(a*sr):int(b*sr)] ** 2).mean()) + 1e-9)
    fr, P = signal.welch(x[int(1*sr):int(3.2*sr)], sr, nperseg=4096)
    cent = (fr * P).sum() / P.sum()
    hf = 10*np.log10(P[(fr>6000)&(fr<12000)].mean()/P[(fr>300)&(fr<3000)].mean())
    # noise-floor flatness in a gap (musical-noise proxy: higher variance of short-time level in a gap = more "warble")
    g = x[int(0.1*sr):int(0.6*sr)]; st = np.array([np.sqrt((g[k:k+480]**2).mean()) for k in range(0, len(g)-480, 480)])
    warble = np.std(20*np.log10(st+1e-9))
    print(f'{f:12s} floor(0.1-0.6s) {lv(0.1,0.6):6.1f} dBFS | speech(1-3.2s) {lv(1,3.2):6.1f} | SNR {lv(1,3.2)-lv(0.1,0.6):5.1f} dB | centroid {cent:5.0f} Hz | HF/mid {hf:5.1f} dB | gap level std {warble:4.1f} dB')
