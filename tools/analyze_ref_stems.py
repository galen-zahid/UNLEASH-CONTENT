"""Measure the user-supplied LARG reference stems (untrusted input, read-only):
residual reference vocals (ASR), tempo/beat grid, transient events, cross-stem leakage.
python -I tools/analyze_ref_stems.py <stems_dir>"""
import sys, json, numpy as np, soundfile as sf
from scipy import signal
d = sys.argv[1]; SR = 48000
def ld(n): x, sr = sf.read(f'{d}/{n}'); assert sr == SR; return x.mean(1) if x.ndim > 1 else x
lv = lambda x: 20*np.log10(np.sqrt((x**2).mean())+1e-12)
names = ['01_FULL_MIX_FIRST10.wav','02_VO_VOCALS_ESTIMATE_FIRST10.wav','03_NO_VO_MUSIC_PLUS_SFX_FIRST10.wav','04_BACKSOUND_MUSIC_ESTIMATE_FIRST10.wav','05_SFX_TRANSIENTS_ESTIMATE_FIRST10.wav']
S = {n[:2]: ld(n) for n in names}
print('RMS dBFS', {k: round(lv(v),1) for k,v in S.items()})
# reconstruction checks
print('01 vs 02+03 residual %.1f dB' % (lv(S['01']-(S['02']+S['03'])) - lv(S['01'])))
print('03 vs 04+05 residual %.1f dB' % (lv(S['03']-(S['04']+S['05'])) - lv(S['03'])))
# vocal leakage: speech-band (300-3400) correlation of envelopes between 02 and 03/04
sos = signal.butter(4,[300,3400],btype='band',fs=SR,output='sos')
def env(x):
    y = np.abs(signal.sosfilt(sos,x)); return np.array([y[i:i+480].mean() for i in range(0,len(y)-480,480)])
e2 = env(S['02'])
for k in ('03','04','05'):
    e = env(S[k]); print(f'speech-envelope corr 02 vs {k}: {np.corrcoef(e2,e)[0,1]:.2f}')
# tempo of 04 (80-150 BPM window) and beat phase
def onset(x):
    hop=480; e=np.array([np.sqrt((x[i:i+hop]**2).mean()) for i in range(0,len(x)-hop,hop)])
    o=np.maximum(0,np.diff(np.log(e+1e-6))); return o-o.mean()
for k in ('04','03','01'):
    o=onset(S[k]); a=np.correlate(o,o,'full')[len(o)-1:]; lags=np.arange(len(a))*0.01
    sel=(lags>0.4)&(lags<0.75); i=np.argmax(a[sel]); print(f'tempo {k}: {60/lags[sel][i]:.1f} BPM (strength {a[sel][i]/a[0]:.2f})')
# transient events in 05 and 03 (strong onsets)
def events(x, thr):
    o=onset(x); pk,_=signal.find_peaks(o,height=thr*o.max(),distance=12); return [round(p*0.01,2) for p in pk]
print('05 strong transients (s):', events(S['05'],0.35))
print('03 strong transients (s):', events(S['03'],0.35))
