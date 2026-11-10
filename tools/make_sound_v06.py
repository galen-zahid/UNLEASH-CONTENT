"""UNLEASH sound design v06 (v06b: intro present from 0 s, bass harmonics + louder hats/shaker/pluck so the music reads on phone speakers) — original music + SFX, written for the picture (not generic library placement).

Musical grid: 137.8 BPM half-time feel, beat phase locked so key picture events land on beats
(expand 2.50 s, UANG? 2.94 s, wipe 3.37 s, NOL 5.98 s, re-entry 6.42 s, UI/UX 8.16 s, bomb 9.90 s).
Arrangement (SB01): filtered intro → drop at the expand → snare roll into the wipe → groove → tape-stop on the
gear stall → silence + sub boom on NOL → groove back on the card re-entry → build → impact on the bomb-in →
continues into SB02 (32 s rendered so later segments continue the same track).

python -I tools/make_sound_v06.py <out_dir>   (writes WAV stems + sound_v06.json cue sheet)
Deterministic (fixed seeds). Everything synthesized here → no third-party audio.
"""
import json, sys
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = sys.argv[1]
rng = np.random.default_rng(1378)
BPM = 137.8
BEAT = 60 / BPM
PHASE = 3.37  # a beat lands on the wipe cover
DUR = 32.0
N = int(DUR * SR)
FPS = 30
beat_t = lambda k: PHASE + k * BEAT  # k may be negative
t_of = lambda n: np.arange(n) / SR


def add(buf, x, at, pan=0.0, g=1.0):
    s = int(round(at * SR))
    if s < 0:
        x = x[-s:]; s = 0
    if s >= len(buf) or len(x) == 0:
        return
    e = min(len(buf), s + len(x)); x = x[: e - s] * g
    a = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    if buf.ndim == 2:
        buf[s:e, 0] += x * np.cos(a); buf[s:e, 1] += x * np.sin(a)
    else:
        buf[s:e] += x


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, min(hi, SR / 2 - 200)], btype='band', fs=SR, output='sos'), x)


def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, min(fc, SR / 2 - 200), fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, btype='high', fs=SR, output='sos'), x)


def noise(n):
    return rng.standard_normal(n)


def env_exp(n, k):
    return np.exp(-np.arange(n) / SR * k)


def sweep(n, f0, f1, q=1.5, src=None):
    """time-varying band-pass noise (10 ms blocks)"""
    x = noise(n) if src is None else src
    y = np.zeros(n); zi = None
    for i in range(0, n, 480):
        p = i / max(1, n - 1); fc = f0 * (f1 / f0) ** p
        sos = signal.butter(2, [fc / q, min(fc * q, SR / 2 - 200)], btype='band', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y[i:i + 480], zi = signal.sosfilt(sos, x[i:i + 480], zi=zi)
    return y


def room(x, rt=0.35, mix=0.18):
    """small synthetic room: exponentially decaying noise IR (stereo decorrelated)"""
    n = int(rt * SR); ir = noise(n) * np.exp(-np.arange(n) / SR * 6.9 / rt); ir = lp(ir, 6000); ir /= np.sqrt((ir ** 2).sum())
    ir2 = noise(n) * np.exp(-np.arange(n) / SR * 6.9 / rt); ir2 = lp(ir2, 6000); ir2 /= np.sqrt((ir2 ** 2).sum())
    m = x if x.ndim == 1 else x.mean(1)
    wl = signal.fftconvolve(m, ir)[: len(m)]; wr = signal.fftconvolve(m, ir2)[: len(m)]
    dry = np.stack([m, m], 1) if x.ndim == 1 else x
    return dry * (1 - mix) + np.stack([wl, wr], 1) * mix


def write(name, x, peak_db=None):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    if peak_db is not None: x = x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)
    sf.write(f'{OUT}/{name}.wav', x.astype(np.float32), SR, subtype='PCM_24')
    return x


# ============================ MUSIC ============================
# progression in D minor, one chord per half-time bar (4 beats): Dm – B♭ – F – C
ROOT = [36.71, 29.14, 43.65, 32.70]           # sub/808 roots (D1 B♭0 F1 C1)
CHORD = [[293.66, 349.23, 440.0], [233.08, 293.66, 349.23], [349.23, 440.0, 523.25], [261.63, 329.63, 392.0]]
FIRST = -int(np.ceil(PHASE / BEAT)) - 1        # first beat index before 0 s
LAST = int((DUR - PHASE) / BEAT) + 1

# sections (seconds) → which layers play
DROP = beat_t(-2)        # 2.50 s full-frame expand
WIPE = beat_t(0)         # 3.37 s
STOP0, STOP1 = 5.60, 5.80  # tape-stop on the gear stall
NOL = beat_t(6)          # 5.98 s
BACK = beat_t(7)         # 6.42 s card re-entry
BOMB = beat_t(15)        # 9.90 s
SB02 = 10.0

kick = np.zeros(N); snare = np.zeros(N); hats = np.zeros((N, 2)); bass = np.zeros(N); keys = np.zeros((N, 2)); pad = np.zeros((N, 2)); fx = np.zeros((N, 2))


def k_sample():
    tt = t_of(int(0.5 * SR)); f = 42 + 120 * np.exp(-tt * 34)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6.5)
    x[: int(0.003 * SR)] += noise(int(0.003 * SR)) * 0.35
    x[: int(0.012 * SR)] += bp(noise(int(0.012 * SR)), 1800, 6000) * np.exp(-np.arange(int(0.012 * SR)) / SR * 300) * 0.9  # v06b: beater click for phone speakers
    x += np.sin(2 * np.pi * 2 * np.cumsum(f) / SR) * np.exp(-tt * 14) * 0.35  # 2nd harmonic of the body
    return np.tanh(x * 1.6) * 0.8


def s_sample():
    tt = t_of(int(0.35 * SR))
    body = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 28) * 0.5
    nz = bp(noise(len(tt)), 1200, 9000) * np.exp(-tt * 16)
    clap = sum(bp(noise(len(tt)), 900, 4000) * np.exp(-np.maximum(0, tt - d) * 60) * (tt >= d) for d in (0, 0.009, 0.019))
    return (body + nz * 0.55 + clap * 0.35) * 0.7


KS, SS = k_sample(), s_sample()
for k in range(FIRST, LAST):
    t = beat_t(k)
    if t < -0.5 or t > DUR: continue
    bar_pos = (k % 4)
    in_stop = STOP0 - 0.02 < t < BACK - 0.02
    groove = t >= DROP - 0.01 and not in_stop
    if groove:
        # half-time: kick on 1 (+ ghost on the "and" of 2), snare/clap on 3
        if bar_pos == 0: add(kick, KS, t)
        if bar_pos == 1: add(kick, KS * 0.55, t + BEAT * 0.5)
        if bar_pos == 2: add(snare, SS, t)
        # 808 sub on 1 with glide, short re-hit on the "and" of 3
        ci = ((k - FIRST) // 4) % 4
        if bar_pos in (0, 2):
            n = int(BEAT * (2 if bar_pos == 0 else 1.4) * SR); tt = t_of(n)
            f = ROOT[ci] * (1 + 0.6 * np.exp(-tt * 40))
            sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tt / 0.004) * np.exp(-tt * 1.6)
            harm = np.sin(2 * np.pi * 2 * np.cumsum(f) / SR) * 0.45 + np.sin(2 * np.pi * 3 * np.cumsum(f) / SR) * 0.25  # v06b: harmonics so the bass reads on small speakers
            env = np.minimum(1, tt / 0.004) * np.exp(-tt * 1.6)
            add(bass, (np.tanh(sub * 1.4) * 0.55 + np.tanh(harm * env * 1.2) * 0.3), t + (0 if bar_pos == 0 else BEAT * 0.5))
    # hats: 8ths always after the drop, 16th rolls into transitions; filtered intro before the drop
    for sub8 in range(2):
        th = t + sub8 * BEAT / 2
        if th < 0 or (STOP0 - 0.02 < th < BACK - 0.02): continue
        n = int(0.06 * SR); h = hp(noise(n), 7000) * env_exp(n, 75)
        g = (0.17 if sub8 else 0.11) * (0.85 if th < DROP else 1.0)  # v06b: louder, intro present
        add(hats, h * g, th, pan=0.28 if sub8 else -0.12)
    # 16th shaker (v06b)
    if not (STOP0 - 0.02 < t < BACK - 0.02) and t >= 0:
        for s16 in (1, 3):
            n = int(0.045 * SR); add(hats, hp(noise(n), 6000) * env_exp(n, 95) * 0.06, t + s16 * BEAT / 4, pan=-0.3)
    # pluck motif (syncopated 16ths): v06b also plays (filtered) in the intro
    if (groove or t < DROP) and t >= 0:
        ci = ((k - FIRST) // 4) % 4
        for j, s16 in enumerate([0, 3] if bar_pos in (0, 2) else [2]):
            fr = CHORD[ci][(k + j) % 3] * 2
            n = int(0.32 * SR); tt = t_of(n)
            pl = (np.sin(2 * np.pi * fr * tt) + 0.4 * np.sin(4 * np.pi * fr * tt) + 0.15 * np.sin(6 * np.pi * fr * tt)) * np.exp(-tt * 13)
            add(keys, pl * (0.11 if t >= DROP else 0.08), t + s16 * BEAT / 4, pan=-0.35 if j % 2 else 0.35)

# 16th hat roll + snare roll into the wipe and into the bomb
for (a, b, gs) in [(WIPE - 0.42, WIPE, 0.6), (BOMB - 0.85, BOMB, 1.0)]:
    n16 = int((b - a) / (BEAT / 4))
    for i in range(n16):
        th = a + i * BEAT / 4; p = i / max(1, n16 - 1)
        add(snare, SS * (0.15 + 0.5 * p) * gs, th)

# pad: warm chords per bar, filtered intro (LPF opens toward the drop)
bar_starts = [beat_t(k) for k in range(FIRST, LAST) if k % 4 == 0]
for i, b0 in enumerate(bar_starts):
    if b0 > DUR: break
    ci = i % 4; n = int((4 * BEAT + 0.2) * SR); tt = t_of(n)
    x = np.zeros(n)
    for fr in CHORD[ci]:
        for det in (-0.18, 0.18):
            x += sum(np.sin(2 * np.pi * fr / 2 * (1 + det / 100) * h * tt + rng.uniform(0, 6)) / h for h in range(1, 6))
    x *= np.minimum(1, tt / 0.12) * np.minimum(1, (tt[-1] - tt + 1e-3) / 0.2) * 0.016  # v06b: +4 dB
    add(pad, x, b0, pan=0)

pad[:, 0] = lp(pad[:, 0], 2400); pad[:, 1] = lp(pad[:, 1], 2400)
# intro: low-pass sweep on keys/pad/hats from 0 → DROP (300 Hz → open)
def sweep_lp(x, t0, t1, f0, f1):
    y = x.copy(); s0, s1 = int(max(0, t0) * SR), int(t1 * SR); zi = None; blk = 480
    for i in range(s0, s1, blk):
        p = (i - s0) / max(1, s1 - s0); fc = f0 * (f1 / f0) ** p
        sos = signal.butter(2, fc, fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2, 2))
        for c in range(2):
            y[i:i + blk, c], zi[:, c] = signal.sosfilt(sos, x[i:i + blk, c], zi=zi[:, c])
    return y
pad = sweep_lp(pad, 0, DROP, 900, 9000); hats = sweep_lp(hats, 0, DROP, 4000, 16000); keys = sweep_lp(keys, 0, DROP, 1400, 12000)  # v06b: intro audible

# risers / transitions baked into the track (musical, not SFX)
def riser(d, f0, f1, g):
    n = int(d * SR); x = sweep(n, f0, f1, 1.3) * (np.arange(n) / n) ** 2
    return x * g
add(fx, riser(0.9, 300, 6000, 0.16), WIPE - 0.9, pan=0)
add(fx, riser(0.75, 250, 5000, 0.14), BACK - 0.75)
add(fx, riser(1.6, 200, 9000, 0.2), BOMB - 1.6)
# reverse swell into the drop
n = int(0.6 * SR); rs = (lp(noise(n), 3000) * (np.arange(n) / n) ** 3)[:: 1] * 0.18
add(fx, rs, DROP - 0.6)

# stems for the tape-stop: everything that plays during the stop window pitches down to silence
def tape_stop(x, t0, t1):
    """read-head slowdown 1→0 between t0 and t1 (quadratic), silence until BACK"""
    y = x.copy(); s0, s1 = int(t0 * SR), int(t1 * SR); n = s1 - s0
    if y.ndim == 1: y = y[:, None]
    rate = (1 - np.arange(n) / n) ** 1.3
    pos = s0 + np.cumsum(rate)
    for c in range(y.shape[1]):
        y[s0:s1, c] = np.interp(pos, np.arange(len(y)), x if x.ndim == 1 else x[:, c]) * np.linspace(1, 0.2, n)
    y[s1:int(BACK * SR)] = 0
    return y[:, 0] if x.ndim == 1 else y

low_mix = kick + bass
music_low = tape_stop(np.stack([low_mix, low_mix], 1), STOP0, STOP1)
mid_mix = np.stack([snare, snare], 1) + keys + pad
music_mid = tape_stop(mid_mix, STOP0, STOP1)
music_air = tape_stop(hats, STOP0, STOP1)
music_fx = fx  # risers keep running (they lead into the re-entry)
# glue: gentle bus saturation, then scale the whole bed together (no per-stem normalisation)
bed = music_low + music_mid + music_air + music_fx
peak = np.abs(bed).max()
for nm, x in [('music_low', music_low), ('music_mid', music_mid), ('music_air', music_air), ('music_fx', music_fx)]:
    write(nm, x / peak * 10 ** (-3 / 20))
write('music_full', bed / peak * 10 ** (-3 / 20))

# ============================ SFX ============================
SFX = {}
def sfx(name, x, peak_db=-6, rt=0.3, rmix=0.15):
    x = room(np.asarray(x, float), rt, rmix) if rmix > 0 else (np.stack([x, x], 1) if np.asarray(x).ndim == 1 else x)
    SFX[name] = write('sfx_' + name, x, peak_db)

# opening: air swell + glassy shimmer as the aperture opens
n = int(0.75 * SR); tt = t_of(n)
swell = sweep(n, 600, 7000, 1.6) * np.sin(np.pi * np.minimum(1, tt / 0.75)) ** 1.5
shim = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5) for f in (2093, 3136, 4186)) * 0.08 * (tt > 0.05)
sfx('aperture_open', swell * 0.8 + shim, -8, 0.6, 0.3)
# grid tick
n = int(0.05 * SR); sfx('grid_tick', hp(noise(n), 4000) * env_exp(n, 140), -14, 0.2, 0.1)
# type: swish + low thud for big words
def type_hit(f_lo, f_hi, thud_f, d=0.22):
    n = int(d * SR); tt = t_of(n)
    sw = sweep(n, f_lo, f_hi, 1.5) * np.sin(np.pi * (tt / d) ** 0.7) ** 2
    th = np.zeros(n); m = int(0.18 * SR)
    th_t = t_of(m); th[int(0.07 * SR):int(0.07 * SR) + m] = (np.sin(2 * np.pi * np.cumsum(thud_f + 60 * np.exp(-th_t * 40)) / SR) * np.exp(-th_t * 22))[: n - int(0.07 * SR)]
    return sw * 0.7 + th * 0.6
sfx('type_hero', type_hit(900, 5200, 70), -9)
sfx('type_hero_big', type_hit(600, 6500, 55, 0.3), -7)
n = int(0.04 * SR); sfx('type_small', bp(noise(n), 2500, 8000) * env_exp(n, 120), -16, 0.15, 0.1)
# UANG? letters: 5 ticks with rising pitch (one file each)
for i, f in enumerate([880, 988, 1109, 1175, 1319]):
    n = int(0.12 * SR); tt = t_of(n)
    x = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.01 * tt)) * np.exp(-tt * 35) + hp(noise(n), 5000) * np.exp(-tt * 200) * 0.3
    sfx(f'letter_{i + 1}', x, -12, 0.25, 0.15)
# transition: pre-wipe reverse swell (ends on the cover) + stereo whoosh
n = int(0.5 * SR); x = sweep(n, 400, 4000, 1.4) * (np.arange(n) / n) ** 2.4
sfx('prewipe_swell', x, -9, 0.3, 0.15)
n = int(0.55 * SR); w = sweep(n, 2500, 300, 1.5) * np.sin(np.pi * t_of(n) / 0.55) ** 2
wst = np.stack([w * np.cos((np.linspace(-0.7, 0.7, n) + 1) * np.pi / 4), w * np.sin((np.linspace(-0.7, 0.7, n) + 1) * np.pi / 4)], 1)
sfx('wipe_whoosh', wst, -8, 0.4, 0.2)
# coins: metallic clink (inharmonic partials), slightly different per landing
def clink(seed):
    r = np.random.default_rng(seed); n = int(0.4 * SR); tt = t_of(n)
    x = sum(np.sin(2 * np.pi * p * r.uniform(0.97, 1.03) * tt + r.uniform(0, 6)) * np.exp(-tt * r.uniform(12, 22)) * a for p, a in zip([2350, 3870, 5620, 7180, 9050], [1, .7, .45, .3, .2]))
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return x + lp(noise(n), 900) * np.exp(-tt * 60) * 0.25  # small body knock
for i in range(8):
    sfx(f'coin_{i + 1}', clink(200 + i), -12, 0.25, 0.12)
# gears: ratchet speeding up then a wind-down and a stall clunk
d = 0.95; n = int(d * SR); tt = t_of(n)
spd = np.where(tt < 0.2, tt / 0.2, np.clip(1 - (tt - 0.2) / 0.4, 0, 1) ** 1.4)
ph = np.cumsum(spd * 24 / SR); clicks = np.where(np.diff(np.floor(ph), prepend=0) > 0)[0]
g = np.zeros(n)
for c in clicks:
    m = int(0.014 * SR); seg = bp(noise(m), 1800, 7000) * env_exp(m, 280); g[c:c + m] += seg[: n - c] * 0.8
motor = np.sin(2 * np.pi * np.cumsum(70 + 60 * spd) / SR) * spd * 0.12
k0 = int(0.6 * SR); m = int(0.2 * SR); ct = t_of(m)
clunk = np.sin(2 * np.pi * 110 * ct) * np.exp(-ct * 26) * 0.7 + bp(noise(m), 250, 2200) * np.exp(-ct * 40) * 0.4
g[k0:k0 + m] += clunk
sfx('gears_run_stall', g + motor, -9, 0.3, 0.15)
# NOL: sub boom + dull body + short reverse tail before (handled by placement)
n = int(1.2 * SR); tt = t_of(n); f = 30 + 55 * np.exp(-tt * 14)
boom = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6) * 1.5) + bp(noise(n), 200, 1800) * np.exp(-tt * 30) * 0.3
sfx('nol_boom', boom, -5, 0.6, 0.18)
# card re-entry: rising slide + soft land
n = int(0.5 * SR); x = sweep(n, 300, 3500, 1.4) * np.linspace(0, 1, n) ** 1.6 * np.concatenate([np.ones(int(0.42 * SR)), np.linspace(1, 0, n - int(0.42 * SR))])
sfx('card_rise', x, -9, 0.3, 0.15)
# UI: soft pop (card in), double dull "thock" (failed click), tiny blip ("?")
def pop(f):
    n = int(0.14 * SR); tt = t_of(n); ff = f * (1 + 1.2 * np.exp(-tt * 60))
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tt * 30) + bp(noise(n), 1500, 6000) * np.exp(-tt * 120) * 0.2
sfx('ui_card_pop', pop(420), -11, 0.25, 0.15)
sfx('ui_card_pop_small', pop(560), -14, 0.25, 0.15)
n = int(0.22 * SR); tt = t_of(n)
th = lambda d0: (np.sin(2 * np.pi * 220 * np.maximum(0, tt - d0)) * np.exp(-np.maximum(0, tt - d0) * 70) + lp(noise(n), 1500) * np.exp(-np.maximum(0, tt - d0) * 160) * 0.5) * (tt >= d0)
sfx('ui_click_fail', th(0) + th(0.085) * 0.7, -12, 0.2, 0.1)
n = int(0.12 * SR); tt = t_of(n); sfx('ui_blip', np.sin(2 * np.pi * (1200 - 500 * tt / 0.12) * tt) * np.exp(-tt * 25), -17, 0.2, 0.15)
# focus pull: soft breath whoosh
n = int(0.35 * SR); sfx('focus_breath', sweep(n, 1800, 500, 1.6) * np.sin(np.pi * t_of(n) / 0.35) ** 2, -13, 0.4, 0.25)
# bomb-in: accelerating whoosh into the impact + sub drop (impact at +0.30 s)
pre = 0.30; n = int((pre + 1.3) * SR); b = np.zeros(n)
w = sweep(int(pre * SR), 500, 7000, 1.4) * np.linspace(0, 1, int(pre * SR)) ** 2
b[: len(w)] += w * 0.9
tt = t_of(n - int(pre * SR)); f = 28 + 80 * np.exp(-tt * 12)
imp = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2) * 1.6) + bp(noise(len(tt)), 300, 5000) * np.exp(-tt * 28) * 0.45
b[int(pre * SR):] += imp
sfx('bomb_impact', b, -4, 0.8, 0.22)

# ============================ CUE SHEET ============================
def f2s(fr): return fr / FPS
cues = {
  "_doc": "v06 sound design cue sheet (SB01 global 0–10 s). time in seconds; gain linear; group = delivery stem. Music bands are a 32 s continuous track (continues into SB02).",
  "bpm": BPM, "beatPhase": PHASE,
  "music": {"bands": ["music_low", "music_mid", "music_air", "music_fx"],
            "gain": {"music_low": 0.5, "music_mid": 0.5, "music_air": 0.5, "music_fx": 0.5},
            "duck": {"music_low": 0.72, "music_mid": 0.35, "music_air": 0.62, "music_fx": 0.5}},
  "place": [
    ["opening", "aperture_open", 0.0, 0.55], ["opening", "grid_tick", f2s(1), 0.4],
    ["typographic", "type_hero", f2s(25) - 0.07, 0.5], ["typographic", "type_hero", f2s(33) - 0.07, 0.38],
    ["typographic", "type_hero", f2s(55) - 0.07, 0.5], ["typographic", "type_hero", f2s(61) - 0.07, 0.38],
    ["typographic", "type_small", f2s(70), 0.4], ["typographic", "type_small", f2s(78), 0.4],
    ["typographic", "type_small", f2s(78), 0.35],
    *[["typographic", f"letter_{i + 1}", f2s(88 + i), 0.42] for i in range(5)],
    ["transition", "prewipe_swell", f2s(106) - 0.5, 0.5], ["transition", "wipe_whoosh", f2s(101), 0.55],
    *[["coin", f"coin_{i + 1}", f2s(fr), 0.36] for i, fr in enumerate([118, 121, 124, 127, 130, 133, 136, 139])],
    ["gear", "gears_run_stall", f2s(156), 0.5],
    ["gear", "nol_boom", f2s(179), 0.62],
    ["transition", "card_rise", f2s(194), 0.45],
    ["transition", "focus_breath", f2s(229), 0.4],
    ["typographic", "type_small", f2s(231), 0.35],
    ["typographic", "type_hero_big", f2s(243) - 0.09, 0.55],
    ["ui", "ui_card_pop", f2s(247), 0.45], ["ui", "ui_card_pop_small", f2s(259), 0.4], ["ui", "ui_card_pop_small", f2s(277), 0.3],
    ["ui", "ui_click_fail", f2s(283), 0.45], ["ui", "ui_blip", f2s(284), 0.35],
    ["bomb", "bomb_impact", f2s(297) - 0.30, 0.6]
  ]
}
json.dump(cues, open(f'{OUT}/sound_v06.json', 'w'), indent=1)
print('music + %d SFX written; beats: expand %.3f wipe %.3f NOL %.3f back %.3f bomb %.3f' % (len(SFX), DROP, WIPE, NOL, BACK, BOMB))
