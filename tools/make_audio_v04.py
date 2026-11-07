"""SB01 v04 audio: original upbeat kinetic music bed (108 BPM, 32 s for the future 30 s edit), split into
frequency bands for frequency-aware ducking, plus the v04 bomb-in one-shot. VO + other SFX are reused from
the v03 generator (same cleaning chain). Deterministic, synthesized here → no third-party audio.

python -I tools/make_audio_v04.py <out_dir>
Writes: music_full.wav (unducked reference), music_low.wav (<180 Hz), music_mid.wav (180–4500 Hz),
        music_air.wav (>4500 Hz), sfx_bomb_in_v04.wav
"""
import json, sys
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
out = sys.argv[1]
cue = json.load(open('remotion/src/sb01v04/audioCues.json'))
BPM = cue['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; DUR = 32.0; N = int(DUR * SR)
rng = np.random.default_rng(108)
t = lambda d: np.arange(int(d * SR)) / SR


def add(buf, x, at, pan=0.0):
    s = int(at * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(x)); x = x[: e - s]
    a = (pan + 1) * np.pi / 4
    buf[s:e, 0] += x * np.cos(a); buf[s:e, 1] += x * np.sin(a)


def noise(n, lo, hi):
    sos = signal.butter(4, [lo, min(hi, SR / 2 - 200)], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, rng.standard_normal(n))


def write(name, x, gain=1.0):
    sf.write(f'{out}/{name}', (x * gain).astype(np.float32), SR, subtype='PCM_24')
    print(f'{name:22s} peak {20*np.log10(np.abs(x*gain).max()+1e-12):6.1f} dBFS  rms {20*np.log10(np.sqrt(((x*gain)**2).mean())+1e-12):6.1f}')


mus = np.zeros((N, 2))
# progression (D minor, bright voicing): Dm – B♭ – F – C, one chord per bar
roots = [73.42, 58.27, 87.31, 65.41]
chords = [[293.66, 349.23, 440.0], [233.08, 293.66, 349.23], [349.23, 440.0, 523.25], [261.63, 329.63, 392.0]]
nbars = int(DUR / BAR) + 1
kick_times = []
for bar in range(nbars):
    b0 = bar * BAR; ci = bar % 4
    for k in range(4):  # four-on-the-floor kick, controlled
        at = b0 + k * BEAT; kick_times.append(at)
        tt = t(0.42); f = 46 + 95 * np.exp(-tt * 38)
        kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7.5) * 0.55
        kick[:int(0.004 * SR)] += noise(int(0.004 * SR), 2000, 8000) * 0.25  # beater click
        add(mus, kick, at)
    for k in (1, 3):  # soft clap on 2 & 4
        tt = t(0.22); cl = noise(len(tt), 900, 5500) * (np.exp(-tt * 28) + 0.5 * np.exp(-((tt - 0.012) ** 2) / 1e-5)) * 0.22
        add(mus, cl, b0 + k * BEAT, 0.1)
    for k in range(8):  # offbeat closed hats + 16th shaker
        if k % 2 == 1:
            tt = t(0.05); add(mus, noise(len(tt), 7000, 15000) * np.exp(-tt * 70) * 0.16, b0 + k * BEAT / 2, 0.3)
        for s16 in range(2):
            tt = t(0.035); add(mus, noise(len(tt), 5000, 12000) * np.exp(-tt * 90) * (0.05 if s16 else 0.035), b0 + k * BEAT / 2 + s16 * BEAT / 4, -0.3)
    for k in range(8):  # warm bass pulse on 8ths, pumped by the kick
        tt = t(BEAT / 2 * 0.92); fr = roots[ci] * (2 if k in (3, 7) else 1)
        saw = sum(np.sin(2 * np.pi * fr * h * tt) / h for h in range(1, 7))
        env = np.minimum(1, tt / 0.01) * np.exp(-tt * 5)
        add(mus, saw * env * 0.2, b0 + k * BEAT / 2)
    # syncopated pluck motif (16th grid): steps 0,3,6,8,11,14
    for j, st in enumerate([0, 3, 6, 8, 11, 14]):
        fr = chords[ci][j % 3] * (2 if j in (2, 5) else 1)
        tt = t(0.28)
        pl = (np.sin(2 * np.pi * fr * tt) + 0.35 * np.sin(4 * np.pi * fr * tt) + 0.12 * np.sin(6 * np.pi * fr * tt)) * np.exp(-tt * 16) * 0.09
        add(mus, pl, b0 + st * BEAT / 4, [-0.35, 0.35][j % 2])
    # soft pad bed
    tt = t(BAR + 0.1); pad = np.zeros(len(tt))
    for fr in chords[ci]:
        for det in (-0.15, 0.15):
            pad += sum(np.sin(2 * np.pi * fr / 2 * (1 + det / 100) * h * tt) / h for h in range(1, 5))
    pad *= np.minimum(1, tt / 0.15) * np.minimum(1, (tt[-1] - tt + 1e-3) / 0.2) * 0.012
    add(mus, signal.sosfilt(signal.butter(2, 2200, fs=SR, output='sos'), pad), b0)

# sidechain pump on everything except the kick (re-synthesised kick has its own transient)
pump = np.ones(N)
for kt in kick_times:
    s = int(kt * SR); n = int(0.22 * SR)
    if s < N:
        e = min(N, s + n); pump[s:e] = np.minimum(pump[s:e], 1 - 0.35 * np.exp(-np.arange(e - s) / SR * 14))
mus *= pump[:, None] ** 0.6

# transition risers (into the circle wipe, the card re-entry and the bomb-in), cut at the hit
for hit in cue['risersInto']:
    d = 0.7; n = int(d * SR); tt = np.arange(n) / SR
    x = np.zeros(n); blk = 480; zi = None
    src = rng.standard_normal(n)
    for i in range(0, n, blk):
        fc = 500 * (9000 / 500) ** (i / n); sos = signal.butter(2, [fc / 1.5, min(fc * 1.5, SR / 2 - 100)], btype='band', fs=SR, output='sos')
        if zi is None: zi = signal.sosfilt_zi(sos) * 0
        x[i:i + blk], zi = signal.sosfilt(sos, src[i:i + blk], zi=zi)
    x *= (tt / d) ** 2 * 0.22
    add(mus, x, hit / cue['fps'] - d)

mus[:int(0.12 * SR)] *= np.linspace(0, 1, int(0.12 * SR))[:, None]
mus /= np.abs(mus).max(); mus *= 10 ** (-3 / 20)
write('music_full.wav', mus)
# frequency bands (linear-phase-ish via zero-phase filtering so bands sum back to the full bed)
lo = signal.sosfiltfilt(signal.butter(4, 180, fs=SR, output='sos'), mus, axis=0)
air = signal.sosfiltfilt(signal.butter(4, 4500, btype='high', fs=SR, output='sos'), mus, axis=0)
mid = mus - lo - air
write('music_low.wav', lo); write('music_mid.wav', mid); write('music_air.wav', air)
print('band recombination error %.1f dB' % (20 * np.log10(np.abs(lo + mid + air - mus).max() + 1e-12)))

# bomb-in v04: whoosh building into the cover moment, controlled LF impact
FPS = cue['fps']; off = (cue['bombImpact'] - cue['place']['bomb_in'][0]) / FPS
n = int((off + 1.0) * SR); b = np.zeros(n)
pre_n = int(off * SR); src = rng.standard_normal(pre_n); x = np.zeros(pre_n); zi = None
for i in range(0, pre_n, 480):
    fc = 400 * (7000 / 400) ** (i / pre_n); sos = signal.butter(2, [fc / 1.5, min(fc * 1.5, SR / 2 - 100)], btype='band', fs=SR, output='sos')
    if zi is None: zi = signal.sosfilt_zi(sos) * 0
    x[i:i + 480], zi = signal.sosfilt(sos, src[i:i + 480], zi=zi)
b[:pre_n] = x * np.linspace(0, 1, pre_n) ** 2 * 0.6
tt = t(1.0); f = 33 + 70 * np.exp(-tt * 16)
imp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4) + noise(len(tt), 150, 2200) * np.exp(-tt * 30) * 0.3
b[pre_n:pre_n + len(imp)] += imp[: n - pre_n]
b /= np.abs(b).max(); b *= 10 ** (-9 / 20)
write('sfx_bomb_in_v04.wav', np.stack([b, b], 1))
