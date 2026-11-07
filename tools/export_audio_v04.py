"""Mirror of remotion/src/sb01v04/AudioMix.tsx in numpy: grouped stems + MUSIC_ONLY / VO_MUSIC / FULL_MIX,
verification against the Remotion-rendered mix, music audibility metrics, two-pass loudness (linear).

python -I tools/export_audio_v04.py <audio_dir> <remotion_mix.wav> <out_dir>
"""
import json, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal

adir, rmix, out = sys.argv[1:4]
cues = json.load(open('remotion/src/sb01v04/cues.json'))
ac = json.load(open('remotion/src/sb01v04/audioCues.json'))
SR, FPS = 48000, ac['fps']; N = int(cues['frames'] / FPS * SR)
fr = np.floor(np.arange(N) / SR * FPS)  # Remotion evaluates volume per frame
ld = lambda n: sf.read(f'{adir}/{n}.wav')[0]
lv = lambda x: 20 * np.log10(np.sqrt((np.asarray(x) ** 2).mean()) + 1e-12)


def duck(f):
    m = ac['music']; d = np.zeros_like(f)
    for a, b in cues['speech']:
        att = np.clip((f - (a - m['attackFrames'])) / m['attackFrames'], 0, 1)
        rel = np.clip(1 - (f - b) / m['releaseFrames'], 0, 1)
        d = np.maximum(d, np.minimum(att, rel))
    return d


def place(x, frame, g):
    y = np.zeros((N, 2)); s = int(round(frame / FPS * SR)); e = min(N, s + len(x)); y[s:e] = x[: e - s] * g; return y


G = ac['groups']; d = duck(fr); fade = np.clip(fr / ac['music']['fadeInFrames'], 0, 1)
stems = {'vo': place(ld('vo_clean'), 0, G['vo'])}
music = np.zeros((N, 2))
for b in ('low', 'mid', 'air'):
    p = ac['music'][b]; g = G['music'] * fade * (p['base'] + (p['duck'] - p['base']) * d)
    music += ld(f'music_{b}')[:N] * g[:, None]
stems['music'] = music
for grp in ('opening', 'typographic', 'coin', 'gear', 'transition', 'bomb'):
    stems[grp] = np.zeros((N, 2))
for name, (frame, gain) in ac['place'].items():
    grp = ac['groupOf'][name]; stems[grp] += place(ld(ac['files'][name]), frame, gain * G[grp])
full = sum(stems.values())

r, rsr = sf.read(rmix); n = min(len(r), N)
c = np.dot(full[:n].mean(1), r[:n].mean(1)) / np.sqrt(np.dot(full[:n].mean(1), full[:n].mean(1)) * np.dot(r[:n].mean(1), r[:n].mean(1)))
print(f'Remotion mix vs numpy mirror: r = {c:.5f}, level diff {lv(r[:n]) - lv(full[:n]):+.2f} dB')

# ---- two-pass loudness on FULL mix (pre-limit peaks so pass 2 is linear), same gain applied to all deliverables
tmp = f'{out}/_full_premaster.wav'; sf.write(tmp, full.astype(np.float32), SR, subtype='FLOAT')
def ebu(p):
    t = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    import re
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', t)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', t)[-1])
I0, TP0 = ebu(tmp)
gain_db = -16.0 - I0
ceil = 10 ** ((-1.5 - gain_db - 0.8) / 20)
lim = f'{out}/_full_prelim.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'aresample=192000,alimiter=limit={ceil:.5f}:attack=4:release=60:level=false:latency=true,aresample=48000', '-c:a', 'pcm_f32le', lim], check=True)
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', lim, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j1 = json.loads(p1[p1.rindex('{'):p1.rindex('}') + 1])
af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j1['input_i']}:measured_TP={j1['input_tp']}:measured_LRA={j1['input_lra']}:"
      f"measured_thresh={j1['input_thresh']}:offset={j1['target_offset']}:linear=true:print_format=json")
p2 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y', '-i', lim, '-af', af, '-ar', '48000', '-c:a', 'pcm_s24le', f'{out}/SB01_V04_FULL_MIX.wav'], capture_output=True, text=True).stderr
j2 = json.loads(p2[p2.rindex('{'):p2.rindex('}') + 1])
lim_x = sf.read(lim)[0]; fin = sf.read(f'{out}/SB01_V04_FULL_MIX.wav')[0]
g_lin = np.sqrt((fin ** 2).mean() / (lim_x ** 2).mean())  # linear gain loudnorm applied
for nm, x in {'SB01_V04_MUSIC_ONLY.wav': stems['music'], 'SB01_V04_VO_MUSIC.wav': stems['vo'] + stems['music']}.items():
    sf.write(f'{out}/{nm}', np.clip(x * g_lin, -1, 1).astype(np.float32), SR, subtype='PCM_24')
for k, x in stems.items():
    sf.write(f'{out}/stem_{k}.wav', np.clip(x * g_lin, -1, 1).astype(np.float32), SR, subtype='PCM_24')
I1, TP1 = ebu(f'{out}/SB01_V04_FULL_MIX.wav')
print(f'premaster I {I0:.2f} LUFS TP {TP0:.2f} | limiter ceiling {ceil:.4f} | pass1 I {j1["input_i"]} TP {j1["input_tp"]} | '
      f'pass2 {j2["normalization_type"]} out I {j2["output_i"]} TP {j2["output_tp"]} | ebur128 final I {I1:.1f} TP {TP1:.1f} | linear gain {20*np.log10(g_lin):+.2f} dB')

# ---- music audibility / rhythm metrics
def tempo(x):
    x = x.mean(1); hop = 480
    e = np.array([np.sqrt((x[i:i + hop] ** 2).mean()) for i in range(0, len(x) - hop, hop)])
    on = np.maximum(0, np.diff(np.log(e + 1e-6))); on -= on.mean()
    a = np.correlate(on, on, 'full')[len(on) - 1:]; lags = np.arange(len(a)) * hop / SR
    sel = (lags > 0.4) & (lags < 0.75); k = np.argmax(a[sel])  # 80–150 BPM window (avoids half/double-tempo octave errors)
    return 60 / lags[sel][k], a[sel][k] / a[0]
fin_m = stems['music'] * g_lin; fin_v = stems['vo'] * g_lin; pre_full = full * g_lin  # pre-limiter (exact)
lagx = np.correlate(fin[48000:96000].mean(1), pre_full[48000 + 480:96000 - 480].mean(1), 'valid')
print('limiter/loudnorm delay vs premaster: %d samples' % (np.argmax(lagx) - 480))
print('tempo FULL MIX %.1f BPM (strength %.2f) | MUSIC ONLY %.1f BPM (%.2f) | target %d' % (*tempo(fin), *tempo(fin_m), ac['bpm']))
print('music vs VO (broadband): whole %.1f dB under VO' % (lv(fin_v) - lv(fin_m)))
for a, b in cues['speech']:
    s, e = int(a / FPS * SR), int(min(b, 300) / FPS * SR)
    print(f'  speech f{a}-{b}: music {lv(fin_v[s:e]) - lv(fin_m[s:e]):+5.1f} dB under VO')
sos = signal.butter(4, [300, 4000], btype='band', fs=SR, output='sos'); vb = signal.sosfilt(sos, fin_v.mean(1)); tb = signal.sosfilt(sos, pre_full.mean(1))
for a, b, nm in [(22, 97, 'B'), (116, 188, 'D'), (188, 285, 'E'), (286, 300, 'F')]:
    s, e = int(a / FPS * SR), int(b / FPS * SR); print(f'  speech-band VO margin {nm} f{a}-{b}: {lv(vb[s:e]) - lv(tb[s:e] - vb[s:e]):+5.1f} dB')
# music level in gaps (no speech) vs during speech: audible, not vanishing
gap = np.ones(N, bool)
for a, b in cues['speech']: gap[int(a / FPS * SR):int(b / FPS * SR)] = False
print('music RMS: gaps %.1f dBFS, under speech %.1f dBFS (ducking depth %.1f dB)' % (lv(fin_m[gap]), lv(fin_m[~gap]), lv(fin_m[gap]) - lv(fin_m[~gap])))

# groove perceptibility: tempo periodicity in the kick band (<150 Hz) and hat band (>6 kHz) of the FULL mix,
# where speech energy is low — this is what a listener tracks as rhythm under dialogue
def band_tempo(x, lo, hi):
    sos_ = signal.butter(4, [lo, hi] if lo else hi, btype='band' if lo else 'low', fs=SR, output='sos') if (lo or hi) else None
    y = signal.sosfilt(sos_, x.mean(1)) if sos_ is not None else x.mean(1)
    return tempo(np.stack([y, y], 1))
for nm, p in [('v04', f'{out}/SB01_V04_FULL_MIX.wav'), ('v03', 'renders/v03/SB01_v03_mix_master.wav')]:
    x = sf.read(p)[0][:N]
    print(f'{nm} FULL MIX groove: kick band %.1f BPM strength %.2f | hat band %.1f BPM strength %.2f' % (*band_tempo(x, None, 150), *band_tempo(x, 6000, 16000)))
