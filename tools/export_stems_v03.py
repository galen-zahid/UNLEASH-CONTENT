"""Export placed, gain-applied stems (10.000 s, 48 kHz stereo) with the same cues.json / mix.json as the
Remotion <Audio> tracks, and compare their sum against the Remotion-rendered mix.

python -I tools/export_stems_v03.py <audio_dir> <remotion_mix.wav> <out_stems_dir>
"""
import json, sys
import numpy as np
import soundfile as sf

adir, rmix, out = sys.argv[1:4]
cues = json.load(open('remotion/src/sb01v03/cues.json'))
mix = json.load(open('remotion/src/sb01v03/mix.json'))
SR, FPS, N = 48000, cues['fps'], int(cues['frames'] / cues['fps'] * 48000)


def load(n):
    x, sr = sf.read(f'{adir}/{n}.wav')
    assert sr == SR
    return x


def place(x, frame, gain):
    y = np.zeros((N, 2)); s = int(round(frame / FPS * SR)); e = min(N, s + len(x))
    y[s:e] = x[: e - s] * gain
    return y


def music_gain(fr):
    m = mix['music']; duck = 0.0
    for a, b in cues['speech']:
        att = np.clip((fr - (a - m['attackFrames'])) / m['attackFrames'], 0, 1)
        rel = np.clip(1 - (fr - b) / m['releaseFrames'], 0, 1)
        duck = np.maximum(duck, np.minimum(att, rel))
    fade = np.clip(fr / m['fadeInFrames'], 0, 1)
    return fade * (m['base'] + (m['duck'] - m['base']) * duck)


stems = {'vo_clean': place(load('vo_clean'), 0, mix['vo'])}
mu = load('music_bed')[:N]
fr = np.arange(N) / SR * FPS
# Remotion evaluates volume per frame (step); mirror that
stems['music_bed_ducked'] = mu * music_gain(np.floor(fr))[:, None]
for name, frame in cues['sfx'].items():
    stems[f'sfx_{name}'] = place(load(f'sfx_{name}'), frame, mix['sfx'][name])

lv = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)
pk = lambda x: 20 * np.log10(np.abs(x).max() + 1e-12)
total = np.zeros((N, 2))
print(f'{"stem":28s} {"RMS dBFS":>9s} {"peak dBFS":>9s}')
for n, x in stems.items():
    sf.write(f'{out}/{n}.wav', x.astype(np.float32), SR, subtype='PCM_24')
    total += x
    nz = x[np.abs(x).sum(1) > 1e-6]
    print(f'{n:28s} {lv(nz) if len(nz) else -999:9.1f} {pk(x):9.1f}   (active {len(nz)/SR:5.2f}s)')
sf.write(f'{out}/_sum_of_stems.wav', total.astype(np.float32), SR, subtype='PCM_24')

r, rsr = sf.read(rmix)
assert rsr == SR, rsr
n = min(len(r), N); a, b = total[:n].mean(1), r[:n].mean(1)
c = np.dot(a, b) / np.sqrt(np.dot(a, a) * np.dot(b, b))
xc = np.correlate(b[48000:96000], a[48000 + 480:96000 - 480], 'valid')
print(f'Remotion mix vs sum-of-stems: r = {c:.4f}, lag = {np.argmax(xc) - 480} samples, level diff = {lv(b) - lv(a):+.2f} dB')
# per-section balance: VO vs everything else during speech
vo = stems['vo_clean'][:n].mean(1); rest = (total - stems['vo_clean'])[:n].mean(1)
for a_, b_ in cues['speech']:
    s, e = int(a_ / FPS * SR), int(min(b_, cues['frames']) / FPS * SR)
    print(f'speech f{a_}-{b_}: VO {lv(vo[s:e]):6.1f} dBFS | music+SFX {lv(rest[s:e]):6.1f} dBFS | VO margin {lv(vo[s:e]) - lv(rest[s:e]):+5.1f} dB')
