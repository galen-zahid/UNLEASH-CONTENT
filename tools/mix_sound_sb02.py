"""SB02 mix (numpy mirror of AudioMixSB02.tsx) + joint SB01→SB02 20 s master.

The SB01 V06b mix and the SB02 mix are summed on one 20 s timeline (SB01 0–10 s, SB02 10–20 s; the music bands
are ONE continuous 32 s track, the SB01 bomb-impact tail rings across the boundary) and mastered together
(latency-compensated pre-limit + linear two-pass loudnorm −16 LUFS / −1.5 dBTP). The SB02 deliverables are the
10–20 s half of that master, so SB01 + SB02 join with no level step.
python -I tools/mix_sound_sb02.py <out_dir> [remotion_sb02_mix.wav]
"""
import json, re, subprocess, sys
import numpy as np, soundfile as sf
from scipy import signal
args = [a for a in sys.argv[1:] if not a.startswith("--")]; out = args[0]; rmix = args[1] if len(args) > 1 else None
SR = 48000; FPS = 30; N = 20 * SR; H = 10 * SR
A6 = 'remotion/public/audio_v06/'; A2 = 'remotion/public/audio_sb02/'
s1 = json.load(open('remotion/src/sb01v051/sound_v06.json')); c1 = json.load(open('remotion/src/sb01v051/cues.json'))
s2 = json.load(open('remotion/src/sb02/sound_sb02.json'))
SPEECH2 = [[-3, 26], [88, 188], [200, 270]]  # = AudioMixSB02.tsx SPEECH
def rd(p):
    x, sr = sf.read(p); assert sr == SR
    return x if x.ndim == 2 else np.stack([x, x], 1)
def put(buf, x, s):
    if s < 0: x = x[-s:]; s = 0
    e = min(len(buf), s + len(x));
    if e > s: buf[s:e] += x[:e - s]
lv = lambda x: 20 * np.log10(np.sqrt((np.asarray(x) ** 2).mean()) + 1e-12)
def speech(windows, n):
    fr = np.floor(np.arange(n) / SR * FPS); sp = np.zeros(n)
    for a, b in windows:
        sp = np.maximum(sp, np.minimum(np.clip((fr - (a - 3)) / 3, 0, 1), np.clip(1 - (fr - b) / 8, 0, 1)))
    return sp
G = ['vo', 'music', 'text', 'card', 'ui', 'transition']
MAP1 = {'vo': 'vo', 'music': 'music', 'opening': 'transition', 'typographic': 'text', 'coin': 'card', 'gear': 'card', 'transition': 'transition', 'ui': 'ui', 'bomb': 'transition'}
st = {k: np.zeros((N, 2)) for k in G}
# ---- SB01 (exactly the v06b mix, truncated at 10.0 s like the SB01 render)
v = rd(A6 + 'vo_clean.wav'); st['vo'][:H] += v[:H] * s2.get('voGain', 1.0)  # join: same VO lift on the SB01 half so the voice level does not step at 10 s
sp1 = speech(c1['speech'], H)
for b in s1['music']['bands']:
    m = rd(A6 + b + '.wav'); g = s1['music']['gain'][b] * (1 - (1 - s1['music']['duck'][b]) * sp1)
    st['music'][:H] += m[:H] * g[:, None]
for grp, name, t, gain in s1['place']:
    x = rd(A6 + 'sfx_' + name + '.wav') * gain; s = int(round(round(t * FPS) / FPS * SR)); b1 = np.zeros((N, 2)); put(b1, x, s)
    st[MAP1[grp]][:H] += b1[:H]
    if name == 'bomb_impact': st['transition'][H:] += b1[H:]  # tail continues into SB02 (AudioMixSB02 trimBefore 12)
# ---- SB02
v = rd(A2 + 'vo_clean_sb02.wav'); st['vo'][H:] += v[:H] * s2.get('voGain', 1.0)
sp2 = speech(SPEECH2, H)
for b in s2['music']['bands']:
    m = rd(A6 + b + '.wav'); g = s2['music']['gain'][b] * (1 - (1 - s2['music']['duck'][b]) * sp2)
    st['music'][H:] += m[H:2 * H] * g[:, None]
for grp, name, t, gain in s2['place']:
    x = rd(A2 + 'sfx_' + name + '.wav') * gain; b2 = np.zeros((H, 2)); put(b2, x, int(round(round(t * FPS) / FPS * SR))); st[grp][H:] += b2
full = sum(st.values())
if rmix:
    r = rd(rmix); n = min(len(r), H); a = full[H:H + n].mean(1); rr = r[:n].mean(1)
    print(f'Remotion SB02 mix vs numpy mirror: r = {np.dot(a, rr) / np.sqrt(np.dot(a, a) * np.dot(rr, rr)):.5f}, level diff {lv(rr) - lv(a):+.2f} dB')
# ---- joint master
def ebu(p, extra=[]):
    s = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *extra, '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', s)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', s)[-1])
tmp = f'{out}/_pre20.wav'; sf.write(tmp, full.astype(np.float32), SR, subtype='FLOAT'); I0, TP0 = ebu(tmp)
ceil = 10 ** ((-1.5 - (-16 - I0) - 1.6) / 20); lim = f'{out}/_lim20.wav'  # extra 0.8 dB margin: AAC added ≈1.2 dB TP on the join
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'aresample=192000,alimiter=limit={ceil:.5f}:attack=4:release=60:level=false:latency=true,aresample=48000', '-c:a', 'pcm_f32le', lim], check=True)
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', lim, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j1 = json.loads(p1[p1.rindex('{'):p1.rindex('}') + 1])
af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j1['input_i']}:measured_TP={j1['input_tp']}:measured_LRA={j1['input_lra']}:measured_thresh={j1['input_thresh']}:offset={j1['target_offset']}:linear=true:print_format=json"
J = f'{out}/SB01_SB02_JOIN_20S_MIX.wav'
p2 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y', '-i', lim, '-af', af, '-ar', '48000', '-c:a', 'pcm_s24le', J], capture_output=True, text=True).stderr
j2 = json.loads(p2[p2.rindex('{'):p2.rindex('}') + 1]); I1, TP1 = ebu(J); g = 10 ** ((I1 - I0) / 20)
jm, _ = sf.read(J)
sf.write(f'{out}/SB02_FULL_MIX.wav', jm[H:2 * H].astype(np.float32), SR, subtype='PCM_24')
sf.write(f'{out}/SB02_MUSIC_ONLY.wav', np.clip(st['music'][H:] * g, -1, 1).astype(np.float32), SR, subtype='PCM_24')
names = {'vo': 'VOICE', 'music': 'MUSIC', 'text': 'TEXT_SFX', 'card': 'CARD_SFX', 'ui': 'UI_INTERACTION_SFX', 'transition': 'TRANSITION_SFX'}
for k in G: sf.write(f'{out}/stems/SB02_STEM_{names[k]}.wav', np.clip(st[k][H:] * g, -1, 1).astype(np.float32), SR, subtype='PCM_24')
I2, TP2 = ebu(f'{out}/SB02_FULL_MIX.wav')
print(f'joint premaster I {I0:.1f} TP {TP0:.1f} | pass2 {j2["normalization_type"]} | JOIN 20 s I {I1:.1f} TP {TP1:.1f} | SB02 half alone I {I2:.1f} TP {TP2:.1f}')
# ---- measurements
mus = st['music'] * g
print('  music continuity at the 10.0 s boundary (RMS dBFS, 0.5 s windows): before %.1f | after %.1f' % (lv(mus[H - SR // 2:H]), lv(mus[H:H + SR // 2])))
d = np.abs(np.diff(mus.mean(1)[H - 48:H + 48])).max(); print(f'  max sample step across boundary (music): {d:.4f} (no discontinuity if ≈ typical {np.abs(np.diff(mus.mean(1)[H - 4800:H - 48])).max():.4f})')
vo = st['vo'][H:].mean(1); rest = (full - st['vo'])[H:].mean(1); mu = st['music'][H:].mean(1)
sos = signal.butter(4, [300, 4000], btype='band', fs=SR, output='sos'); vb, rb = signal.sosfilt(sos, vo), signal.sosfilt(sos, rest)
for a, b, nm in [(0, 26, 'percaya'), (88, 188, 'nah..kalian'), (200, 270, 'kabar..ilmu')]:
    s, e = int(max(0, a) / 30 * SR), int(b / 30 * SR); print(f'  speech-band VO margin {nm:12s} {lv(vb[s:e]) - lv(rb[s:e]):+5.1f} dB | music {lv(vo[s:e]) - lv(mu[s:e]):+5.1f} dB under VO')
hpf = signal.butter(4, 180, btype='high', fs=SR, output='sos'); mph = signal.sosfilt(hpf, mus[H:].mean(1)); vph = signal.sosfilt(hpf, (st['vo'][H:] * g).mean(1))
print('  PHONE SIM (HPF 180 Hz) music/VO dBFS per second: ' + ' '.join(f'{s}:{lv(mph[s*SR:(s+1)*SR]):.0f}/{lv(vph[s*SR:(s+1)*SR]):.0f}' for s in range(10)))
for grp in ['text', 'card', 'ui', 'transition']:
    x = st[grp][H:].mean(1); r = (full - st[grp])[H:].mean(1); res = []
    for _, name, t, _g in [p for p in s2['place'] if p[0] == grp]:
        s = int(round(t * FPS) / FPS * SR); e = min(H, s + int(0.25 * SR)); xs = x[s:e]
        if len(xs) < 1200: continue
        f_, P = signal.welch(xs, SR, nperseg=1024); fc = f_[np.argmax(P[1:]) + 1]
        bs = signal.butter(2, [max(30, fc / 1.5), min(23000, fc * 1.5)], btype='band', fs=SR, output='sos')
        xb, rb_ = signal.sosfilt(bs, xs), signal.sosfilt(bs, r[s:e])
        ex = np.array([np.sqrt((xb[i:i + 240] ** 2).mean()) for i in range(0, len(xb) - 240, 240)]); er = np.array([np.sqrt((rb_[i:i + 240] ** 2).mean()) for i in range(0, len(rb_) - 240, 240)])
        k = ex.argmax(); res.append(20 * np.log10(ex[k] / (er[k] + 1e-12)))
    print(f'  {grp:10s} SFX at-peak over rest: min {min(res):+5.1f} median {np.median(res):+5.1f} dB ({len(res)} events)')
m0 = int(9.05 * SR); print(f'  VO mute region 9.05–10.0 s (personal branding): VO level {lv(st["vo"][H + m0:] * g):.1f} dBFS (room tone), music {lv(mus[H + m0:]):.1f} dBFS')
# ---- diagnostics: speech-band VO margin vs music only / vs SFX only, SB01 half for comparison
if '--diag' in sys.argv:
    sfxs = sum(st[k] for k in ['text', 'card', 'ui', 'transition'])
    for half, nm, wins in [(0, 'SB01', [(22, 97), (116, 188), (188, 285)]), (H, 'SB02', [(0, 26), (88, 188), (200, 270)])]:
        v_ = signal.sosfilt(sos, st['vo'][half:half + H].mean(1)); m_ = signal.sosfilt(sos, st['music'][half:half + H].mean(1)); x_ = signal.sosfilt(sos, sfxs[half:half + H].mean(1))
        for a, b in wins:
            s, e = int(a / 30 * SR), int(b / 30 * SR); print(f'  {nm} f{a}-{b}: VO-music {lv(v_[s:e]) - lv(m_[s:e]):+5.1f}  VO-sfx {lv(v_[s:e]) - lv(x_[s:e]):+5.1f}')
