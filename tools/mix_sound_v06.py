"""Numpy mirror of AudioMixV06.tsx: grouped stems, MUSIC_ONLY / VO_MUSIC / FULL_MIX, latency-compensated
pre-limit + linear two-pass loudness, and measurements (VO margin, SFX audibility, groove, beat alignment).
python -I tools/mix_sound_v06.py <out_dir> [remotion_mix.wav]"""
import json, re, subprocess, sys
import numpy as np, soundfile as sf
from scipy import signal
out = sys.argv[1]; rmix = sys.argv[2] if len(sys.argv) > 2 else None
A = 'remotion/public/audio_v06/'; SR = 48000; FPS = 30; N = 10 * SR
sd = json.load(open('remotion/src/sb01v051/sound_v06.json')); cues = json.load(open('remotion/src/sb01v051/cues.json'))
def ld(n):
    x, sr = sf.read(A + n + '.wav'); assert sr == SR
    x = x if x.ndim == 2 else np.stack([x, x], 1); y = np.zeros((N, 2)); y[:min(N, len(x))] = x[:N]; return y
lv = lambda x: 20*np.log10(np.sqrt((np.asarray(x)**2).mean())+1e-12)
fr = np.floor(np.arange(N) / SR * FPS)
sp = np.zeros(N)
for a, b in cues['speech']:
    sp = np.maximum(sp, np.minimum(np.clip((fr - (a - 3)) / 3, 0, 1), np.clip(1 - (fr - b) / 8, 0, 1)))
stems = {k: np.zeros((N, 2)) for k in ['vo', 'music', 'opening', 'typographic', 'coin', 'gear', 'transition', 'ui', 'bomb']}
stems['vo'] = ld('vo_clean')
for b in sd['music']['bands']:
    g = sd['music']['gain'][b] * (1 - (1 - sd['music']['duck'][b]) * sp)
    stems['music'] += ld(b) * g[:, None]
for group, name, t, gain in sd['place']:
    x, _ = sf.read(A + 'sfx_' + name + '.wav'); x = x if x.ndim == 2 else np.stack([x, x], 1)
    s = int(round(round(t * FPS) / FPS * SR)); e = min(N, s + len(x)); stems[group][s:e] += x[:e - s] * gain
full = sum(stems.values())
if rmix:
    r, _ = sf.read(rmix); n = min(len(r), N)
    c = np.dot(full[:n].mean(1), r[:n].mean(1)) / np.sqrt(np.dot(full[:n].mean(1), full[:n].mean(1)) * np.dot(r[:n].mean(1), r[:n].mean(1)))
    print(f'Remotion mix vs numpy mirror: r = {c:.5f}, level diff {lv(r[:n]) - lv(full[:n]):+.2f} dB')
# ---- master
def ebu(p):
    s = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',p,'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS',s)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS',s)[-1])
tmp = f'{out}/_pre.wav'; sf.write(tmp, full.astype(np.float32), SR, subtype='FLOAT'); I0, TP0 = ebu(tmp)
ceil = 10 ** ((-1.5 - (-16 - I0) - 0.8) / 20); lim = f'{out}/_lim.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-af',f'aresample=192000,alimiter=limit={ceil:.5f}:attack=4:release=60:level=false:latency=true,aresample=48000','-c:a','pcm_f32le',lim],check=True)
p1 = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',lim,'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j1 = json.loads(p1[p1.rindex('{'):p1.rindex('}')+1])
af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j1['input_i']}:measured_TP={j1['input_tp']}:measured_LRA={j1['input_lra']}:measured_thresh={j1['input_thresh']}:offset={j1['target_offset']}:linear=true:print_format=json"
p2 = subprocess.run(['ffmpeg','-hide_banner','-nostats','-y','-i',lim,'-af',af,'-ar','48000','-c:a','pcm_s24le',f'{out}/SB01_V06_FULL_MIX.wav'],capture_output=True,text=True).stderr
j2 = json.loads(p2[p2.rindex('{'):p2.rindex('}')+1]); I1, TP1 = ebu(f'{out}/SB01_V06_FULL_MIX.wav'); g = 10 ** ((I1 - I0) / 20)
sf.write(f'{out}/SB01_V06_MUSIC_ONLY.wav', np.clip(stems['music'] * g, -1, 1).astype(np.float32), SR, subtype='PCM_24')
sf.write(f'{out}/SB01_V06_VO_MUSIC.wav', np.clip((stems['vo'] + stems['music']) * g, -1, 1).astype(np.float32), SR, subtype='PCM_24')
for k, x in stems.items(): sf.write(f'{out}/stem_{k}.wav', np.clip(x * g, -1, 1).astype(np.float32), SR, subtype='PCM_24')
print(f'premaster I {I0:.1f} TP {TP0:.1f} | pass2 {j2["normalization_type"]} I {j2["output_i"]} TP {j2["output_tp"]} | final I {I1:.1f} TP {TP1:.1f}')
# ---- measurements
vo = stems['vo'].mean(1); rest = (full - stems['vo']).mean(1); mus = stems['music'].mean(1)
sos = signal.butter(4,[300,4000],btype='band',fs=SR,output='sos'); vb, rb = signal.sosfilt(sos, vo), signal.sosfilt(sos, rest)
for a, b, n in [(22,97,'B hook'),(116,188,'D panel04'),(188,285,'E'),(286,300,'F')]:
    s, e = int(a/30*SR), int(b/30*SR); print(f'  speech-band VO margin {n:9s} {lv(vb[s:e]) - lv(rb[s:e]):+5.1f} dB | music {lv(vo[s:e]) - lv(mus[s:e]):+5.1f} dB under VO')
gap = sp < 0.01
print(f'  music level: gaps {lv(stems["music"][gap]*g):.1f} dBFS, under speech {lv(stems["music"][~gap]*g):.1f} dBFS')
def tempo(x, lo=None, hi=None):
    y = x.mean(1)
    if hi: y = signal.sosfilt(signal.butter(4, hi, fs=SR, output='sos'), y)
    if lo: y = signal.sosfilt(signal.butter(4, lo, btype='high', fs=SR, output='sos'), y)
    e = np.array([np.sqrt((y[i:i+240]**2).mean()) for i in range(0, len(y)-240, 240)]); o = np.maximum(0, np.diff(np.log(e+1e-6))); o -= o.mean()
    a = np.correlate(o, o, 'full')[len(o)-1:]; lags = np.arange(len(a))*240/SR; sel = (lags > 0.35) & (lags < 0.9); k = np.argmax(a[sel])
    return 60/lags[sel][k], a[sel][k]/a[0]
fin, _ = sf.read(f'{out}/SB01_V06_FULL_MIX.wav')
print('  groove in FULL MIX: kick band %.1f BPM (%.2f), hat band %.1f BPM (%.2f) | target %.1f (or half 68.9)' % (*tempo(fin, hi=150), *tempo(fin, lo=6000), sd['bpm']))
# beat alignment of key picture events against the music grid
grid = lambda t: (t - sd['beatPhase']) / (60 / sd['bpm'])
for nm, f in [('expand', 75), ('UANG?', 88), ('wipe', 101), ('NOL', 179), ('re-entry', 193), ('UI/UX', 245), ('bomb', 297)]:
    k = grid(f / 30); print(f'  {nm:9s} f{f}: {f/30:.3f}s → beat {k:+.2f} (off {abs(k - round(k)) * 60 / sd["bpm"] * 1000:.0f} ms)')
# SFX audibility at their own peaks
for group in ['opening', 'typographic', 'coin', 'gear', 'transition', 'ui', 'bomb']:
    x = stems[group].mean(1); r = (full - stems[group]).mean(1); res = []
    for _, name, t, _g in [p for p in sd['place'] if p[0] == group]:
        s = int(round(t * FPS) / FPS * SR); e = min(N, s + int(0.25 * SR)); xs = x[s:e]
        if len(xs) < 480: continue
        f_, P = signal.welch(xs, SR, nperseg=1024); fc = f_[np.argmax(P[1:]) + 1]; bs = signal.butter(2, [max(30, fc/1.5), min(23000, fc*1.5)], btype='band', fs=SR, output='sos')
        xb, rb_ = signal.sosfilt(bs, xs), signal.sosfilt(bs, r[s:e]); ex = np.array([np.sqrt((xb[i:i+240]**2).mean()) for i in range(0, len(xb)-240, 240)]); er = np.array([np.sqrt((rb_[i:i+240]**2).mean()) for i in range(0, len(rb_)-240, 240)])
        k = ex.argmax(); res.append(20*np.log10(ex[k]/(er[k]+1e-12)))
    print(f'  {group:12s} SFX at-peak over rest: min {min(res):+5.1f}  median {np.median(res):+5.1f} dB  ({len(res)} events)')
