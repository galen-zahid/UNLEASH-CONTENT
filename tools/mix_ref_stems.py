"""Mix SB01 audio from the user-supplied LARG reference stems (variants A / B in refAudio.json),
master (latency-compensated pre-limit + linear two-pass loudnorm) and report metrics.
python -I tools/mix_ref_stems.py <A|B> <out_dir>"""
import json, sys, subprocess, re
import numpy as np, soundfile as sf
from scipy import signal
var, out = sys.argv[1], sys.argv[2]
cfg = json.load(open('remotion/src/sb01v051/refAudio.json')); cues = json.load(open('remotion/src/sb01v051/cues.json'))
P = 'remotion/public/'; SR = 48000; N = 10 * SR
def ld(p):
    x, sr = sf.read(P + p); assert sr == SR, (p, sr)
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    y = np.zeros((N, 2)); y[:min(N, len(x))] = x[:N]; return y
lv = lambda x: 20*np.log10(np.sqrt((np.asarray(x)**2).mean())+1e-12)
vo = ld(cfg['vo']['file']) * cfg['vo']['gain']
# ducking envelope (smooth) from the speech windows
d = np.zeros(N); t = np.arange(N) / SR; D = cfg['duck']
for a, b in cues['speech']:
    a /= 30; b /= 30
    d = np.maximum(d, np.clip(np.minimum((t - (a - D['attack'])) / D['attack'], 1 - (t - b) / D['release']), 0, 1))
duck = (1 - D['depth'] * d)[:, None]
V = cfg[var]
if var == 'C':
    # base = our own premaster (already contains VO, ducked music and our SFX) -> keep VO separate for metrics
    base = ld(V['base']['file']) * V['base']['gain']
    bed = base - vo  # our music + our SFX
else:
    bed = ld(V['bed']['file']) * V['bed']['gain'] * duck
fx = np.zeros((N, 2))
if var in ('B', 'C'):
    src = ld(V['fx']['file'])
    for s in V['slices']:
        a, b = int(s['src'][0] * SR), int(s['src'][1] * SR); seg = src[a:b].copy()
        fi, fo = int(0.008 * SR), int(0.04 * SR)
        seg[:fi] *= np.linspace(0, 1, fi)[:, None]; seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
        at = int(s['at'] * SR); e = min(N, at + len(seg)); fx[at:e] += seg[:e - at] * s.get('gain', 1.0)
    fx *= V['fx'].get('gain', 1.0) * duck
pre = vo + bed + fx
tmp = f'{out}/_pre_{var}.wav'; sf.write(tmp, pre.astype(np.float32), SR, subtype='FLOAT')
def ebu(p):
    s = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',p,'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS',s)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS',s)[-1])
I0, TP0 = ebu(tmp); g = -16 - I0; ceil = 10 ** ((-1.5 - g - 0.8) / 20)
lim = f'{out}/_lim_{var}.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-af',f'aresample=192000,alimiter=limit={ceil:.5f}:attack=4:release=60:level=false:latency=true,aresample=48000','-c:a','pcm_f32le',lim],check=True)
p1 = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',lim,'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j1 = json.loads(p1[p1.rindex('{'):p1.rindex('}')+1])
af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j1['input_i']}:measured_TP={j1['input_tp']}:measured_LRA={j1['input_lra']}:measured_thresh={j1['input_thresh']}:offset={j1['target_offset']}:linear=true:print_format=json"
fin = f'{out}/SB01_V051_REFAUDIO_{var}_MIX.wav'
p2 = subprocess.run(['ffmpeg','-hide_banner','-nostats','-y','-i',lim,'-af',af,'-ar','48000','-c:a','pcm_s24le',fin],capture_output=True,text=True).stderr
j2 = json.loads(p2[p2.rindex('{'):p2.rindex('}')+1]); I1, TP1 = ebu(fin)
glin = 10 ** ((I1 - I0) / 20)
for nm, x in {'VO': vo, 'BED': bed, 'FX': fx}.items():
    if np.abs(x).max() > 0: sf.write(f'{out}/stem_{var}_{nm}.wav', np.clip(x * glin, -1, 1).astype(np.float32), SR, subtype='PCM_24')
sos = signal.butter(4,[300,4000],btype='band',fs=SR,output='sos'); vb = signal.sosfilt(sos, vo.mean(1)); rb = signal.sosfilt(sos, (bed + fx).mean(1))
print(f'[{var}] premaster I {I0:.1f} TP {TP0:.1f} | pass2 {j2["normalization_type"]} I {j2["output_i"]} TP {j2["output_tp"]} | final I {I1:.1f} TP {TP1:.1f}')
for a, b, n in [(22,97,'B hook'),(116,188,'D panel04'),(188,285,'E'),(286,300,'F')]:
    s, e = int(a/30*SR), int(b/30*SR)
    print(f'   {n:10s} speech-band VO margin {lv(vb[s:e]) - lv(rb[s:e]):+5.1f} dB | music+fx under VO (broadband) {lv(vo[s:e]) - lv((bed+fx)[s:e]):+5.1f} dB')
gap = np.ones(N, bool)
for a, b in cues['speech']: gap[int(a/30*SR):int(b/30*SR)] = False
print(f'   bed level: gaps {lv((bed+fx)[gap]*glin):.1f} dBFS, under speech {lv((bed+fx)[~gap]*glin):.1f} dBFS')
