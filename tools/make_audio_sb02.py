"""SB02 audio assets (global 10–20 s): full-length cleaned VO, VO mute for the "personal branding" region,
and SB02 SFX one-shots. Music is NOT regenerated: SB02 plays the v06b 32 s music bands from 10.0 s
(trimBefore = 300 frames), so the groove continues across the SB01→SB02 boundary with no restart.

python -I tools/make_audio_sb02.py   (writes remotion/public/audio_sb02/ and remotion/src/sb02/sound_sb02.json)
"""
import json, os, subprocess
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000; FPS = 30
OUT = 'remotion/public/audio_sb02'; os.makedirs(OUT, exist_ok=True)
SRC = '_src_untracked/IMG_6757.MOV'
rng = np.random.default_rng(2002)
BPM = 137.8; BEAT = 60 / BPM; PHASE = 3.37  # same grid as SB01 v06b (global seconds)
beat_local = lambda k: PHASE + k * BEAT - 10.0

# ---------------- VO (same chain as v03–v06; processed 0–30.5 s in one pass so SB01/SB02 join is seamless) ----
VO_CHAIN = ('[0:a]highpass=f=80:p=2,asplit=2[d][w];[w]anlmdn=s=1.5:p=0.004:r=0.006:m=15,atrim=start_sample=480,asetpts=PTS-STARTPTS[n];'
            '[d]volume=0.35[dd];[n]volume=0.65[nn];[dd][nn]amix=inputs=2:normalize=0,'
            'equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3800:t=q:w=1.0:g=2.5,'
            'acompressor=threshold=-24dB:ratio=2:attack=8:release=150:makeup=2[o]')
full = f'{OUT}/_vo_clean_0-30.5.wav'
if not os.path.exists(full):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-t', '30.5', '-vn', '-filter_complex', VO_CHAIN,
                    '-map', '[o]', '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s24le', full], check=True)
x, sr = sf.read(full); assert sr == SR
vo = x[int(10.0 * SR):int(20.5 * SR)].copy()          # local 0 = global 10.0
raw = vo.copy()
# "personal branding" (global 19.05–20.00, measured energy dips: "ilmu" ends 18.94, "p" burst 19.08, "branding"
# ends 19.98) → VO_REPLACEMENT_PENDING. Mute with 25 ms fades and fill with room tone from the cleaned VO's own
# silence (global 11.20–12.60, talent between sentences) so the bed does not drop out. No synthetic speech.
M0, M1 = 9.05, 10.0
s0, s1 = int(M0 * SR), int(M1 * SR); fd = int(0.025 * SR)
tone = x[int(11.2 * SR):int(12.6 * SR)]
need = len(vo) - s0
reps = int(np.ceil(need / len(tone))) + 1
rt = np.concatenate([tone] * reps)[:need]
env = np.ones(len(vo)); env[s0:s0 + fd] = np.linspace(1, 0, fd); env[s0 + fd:] = 0
renv = 1 - env
vo = vo * env[:, None] + np.concatenate([np.zeros((s0, 2)), rt]) * renv[:, None]
sf.write(f'{OUT}/vo_clean_sb02.wav', vo.astype(np.float32), SR, subtype='PCM_24')
sf.write(f'{OUT}/vo_clean_sb02_unmuted.wav', raw.astype(np.float32), SR, subtype='PCM_24')  # reference only
open(f'{OUT}/VO_CHAIN.txt', 'w').write(VO_CHAIN + '\n')

# ---------------- SFX helpers (same design language as tools/make_sound_v06.py) ----------------
t_of = lambda n: np.arange(n) / SR
noise = lambda n: rng.standard_normal(n)
env_exp = lambda n, k: np.exp(-np.arange(n) / SR * k)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, min(hi, SR / 2 - 200)], btype='band', fs=SR, output='sos'), x)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, min(fc, SR / 2 - 200), fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, btype='high', fs=SR, output='sos'), x)
def sweep(n, f0, f1, q=1.5):
    src = noise(n); y = np.zeros(n); zi = None
    for i in range(0, n, 480):
        fc = f0 * (f1 / f0) ** (i / max(1, n - 1))
        sos = signal.butter(2, [fc / q, min(fc * q, SR / 2 - 200)], btype='band', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y[i:i + 480], zi = signal.sosfilt(sos, src[i:i + 480], zi=zi)
    return y
def room(x, rt=0.35, mix=0.18):
    n = int(rt * SR); irs = []
    for _ in range(2):
        ir = lp(noise(n) * np.exp(-np.arange(n) / SR * 6.9 / rt), 6000); irs.append(ir / np.sqrt((ir ** 2).sum()))
    m = x if x.ndim == 1 else x.mean(1)
    wet = np.stack([signal.fftconvolve(m, irs[0])[:len(m)], signal.fftconvolve(m, irs[1])[:len(m)]], 1)
    dry = np.stack([m, m], 1) if x.ndim == 1 else x
    return dry * (1 - mix) + wet * mix
def pan_st(x, p0, p1):
    p = np.linspace(p0, p1, len(x)); a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)
def sfx(name, x, peak_db=-8, rt=0.3, rmix=0.15):
    x = np.asarray(x, float)
    y = room(x, rt, rmix) if rmix > 0 else (np.stack([x, x], 1) if x.ndim == 1 else x)
    y = y / (np.abs(y).max() + 1e-12) * 10 ** (peak_db / 20)
    sf.write(f'{OUT}/sfx_{name}.wav', y.astype(np.float32), SR, subtype='PCM_24')
def pop(f, d=0.14):
    n = int(d * SR); tt = t_of(n); ff = f * (1 + 1.2 * np.exp(-tt * 60))
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tt * 30) + bp(noise(n), 1500, 6000) * np.exp(-tt * 120) * 0.2

# TEXT
def type_hit(f_lo, f_hi, thud_f, d=0.22):
    n = int(d * SR); tt = t_of(n)
    sw = sweep(n, f_lo, f_hi) * np.sin(np.pi * (tt / d) ** 0.7) ** 2
    th = np.zeros(n); m = int(0.18 * SR); mt = t_of(m); o = int(0.07 * SR)
    th[o:o + m] = (np.sin(2 * np.pi * np.cumsum(thud_f + 60 * np.exp(-mt * 40)) / SR) * np.exp(-mt * 22))[:n - o]
    return sw * 0.7 + th * 0.6
sfx('type_hero', type_hit(900, 5200, 70), -9)
sfx('type_hero_big', type_hit(600, 6500, 55, 0.3), -7)
n = int(0.04 * SR); sfx('type_small', bp(noise(n), 2500, 8000) * env_exp(n, 120), -16, 0.15, 0.1)
# "×" combine: two short swishes converging + glassy tick
n = int(0.32 * SR); tt = t_of(n)
conv = pan_st(sweep(n, 700, 4200) * np.sin(np.pi * tt / 0.32) ** 2, -0.8, 0) + pan_st(sweep(n, 800, 4600) * np.sin(np.pi * tt / 0.32) ** 2, 0.8, 0)
tick = np.zeros(n); k = int(0.24 * SR); m = n - k; mt = t_of(m)
tick[k:] = sum(np.sin(2 * np.pi * f * mt) * np.exp(-mt * 30) for f in (2637, 3951)) * 0.5
sfx('type_combine', conv + np.stack([tick, tick], 1), -8, 0.4, 0.2)
# CARD
n = int(0.5 * SR); xr = sweep(n, 300, 3500, 1.4) * np.linspace(0, 1, n) ** 1.6 * np.concatenate([np.ones(int(0.42 * SR)), np.linspace(1, 0, n - int(0.42 * SR))])
sfx('card_rise', xr, -10, 0.3, 0.15)
# module drop from the top edge: descending air + soft clack + two damped swing "creaks" (the pendulum settle)
n = int(0.7 * SR); tt = t_of(n); d = np.zeros(n)
d[:int(0.22 * SR)] += sweep(int(0.22 * SR), 3200, 600) * np.linspace(0, 1, int(0.22 * SR)) ** 1.5
k = int(0.22 * SR); m = int(0.12 * SR); mt = t_of(m)
d[k:k + m] += np.sin(2 * np.pi * 330 * mt) * np.exp(-mt * 45) * 0.8 + bp(noise(m), 1200, 5000) * np.exp(-mt * 140) * 0.4
for j, (o, g) in enumerate([(0.36, 0.25), (0.52, 0.12)]):
    k = int(o * SR); m = int(0.08 * SR); mt = t_of(m); d[k:k + m] += bp(noise(m), 2000, 4500) * np.sin(np.pi * mt / 0.08) * g
sfx('module_drop', d, -10, 0.3, 0.15)
# module open: two paper flaps (book cover) + airy lift
n = int(0.32 * SR); tt = t_of(n); o = np.zeros(n)
for k0, g in [(0, 1), (0.07, 0.7)]:
    k = int(k0 * SR); m = int(0.09 * SR); mt = t_of(m)
    o[k:k + m] += bp(noise(m), 600, 3800) * np.exp(-mt * 45) * g + np.sin(2 * np.pi * 180 * mt) * np.exp(-mt * 50) * 0.3 * g
o += sweep(n, 1500, 5500) * np.sin(np.pi * tt / 0.32) ** 2 * 0.35
sfx('module_open', o, -11, 0.3, 0.15)
# task card slide-out
n = int(0.22 * SR); tt = t_of(n); sfx('task_slide', sweep(n, 900, 4200) * np.sin(np.pi * tt / 0.22) ** 1.5 + pop(700, 0.22) * (tt > 0.15) * 0.4, -13, 0.25, 0.12)
# assembly pops (card parts snapping back), 3 pitches + final snap
for i, f in enumerate([520, 620, 740]): sfx(f'assemble_{i + 1}', pop(f), -14, 0.25, 0.12)
n = int(0.12 * SR); tt = t_of(n)
sfx('assemble_snap', np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 55) + bp(noise(n), 2000, 9000) * np.exp(-tt * 160) * 0.7, -10, 0.2, 0.1)
# pull apart (reverse swell, stereo spread)
n = int(0.4 * SR); tt = t_of(n); pa = sweep(n, 500, 3000) * (tt / 0.4) ** 0.6 * np.exp(-np.maximum(0, tt - 0.3) * 30)
sfx('pull_apart', np.stack([pa, sweep(n, 520, 3100) * (tt / 0.4) ** 0.6 * np.exp(-np.maximum(0, tt - 0.3) * 30)], 1), -11, 0.35, 0.2)
# UI
n = int(0.05 * SR); sfx('wire_tick', hp(noise(n), 4000) * env_exp(n, 140) + np.sin(2 * np.pi * 2400 * t_of(n)) * env_exp(n, 90) * 0.3, -16, 0.2, 0.1)
n = int(0.45 * SR); tt = t_of(n)
sfx('check_ding', sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * k) * a for f, k, a in [(1568, 7, 1), (2349, 9, 0.6), (3136, 14, 0.25)]) * np.minimum(1, tt / 0.002), -13, 0.5, 0.2)
n = int(0.5 * SR); tt = t_of(n)
sfx('cta_glow', sum(np.sin(2 * np.pi * f * tt) for f in (1175, 1760)) * np.sin(np.pi * np.minimum(1, tt / 0.5)) ** 2 * 0.3 + sweep(n, 2000, 8000) * np.sin(np.pi * tt / 0.5) ** 2 * 0.3, -16, 0.4, 0.25)
# successful click: crisp click + two-note confirm (vs SB01's dull failed "thock")
n = int(0.3 * SR); tt = t_of(n); c = np.zeros(n)
m = int(0.012 * SR); c[:m] += bp(noise(m), 2500, 9000) * env_exp(m, 300)
for k0, f in [(0.03, 1319), (0.11, 1976)]:
    k = int(k0 * SR); mt = t_of(n - k); c[k:] += np.sin(2 * np.pi * f * mt) * np.exp(-mt * 18) * 0.5
sfx('click_success', c, -11, 0.3, 0.15)
n = int(0.06 * SR); sfx('ui_tap', bp(noise(n), 1800, 7000) * env_exp(n, 160), -16, 0.15, 0.1)
# TRANSITION
n = int(0.18 * SR); tt = t_of(n)  # 3-frame blur cut
sfx('blur_cut', pan_st(sweep(n, 4500, 900) * np.sin(np.pi * tt / 0.18) ** 2, 0.5, -0.5) + np.stack([lp(noise(n), 400) * np.exp(-tt * 30) * 0.4] * 2, 1), -9, 0.3, 0.15)
n = int(0.7 * SR); tt = t_of(n)
sfx('curtain_lift', pan_st(sweep(n, 400, 5000) * np.sin(np.pi * tt / 0.7) ** 2 * np.exp(-tt * 1.5), 0, 0), -10, 0.4, 0.2)
n = int(0.9 * SR); tt = t_of(n)
sh = sweep(n, 1200, 9000, 1.3) * np.sin(np.pi * tt / 0.9) ** 2 * 0.5 + sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4) for f in (2093, 2637, 3136, 4186)) * 0.05
sfx('connector_shimmer', pan_st(sh, -0.6, 0.6), -11, 0.6, 0.3)
n = int(0.45 * SR); sfx('exit_swell', sweep(n, 400, 5000, 1.4) * (np.arange(n) / n) ** 2.2, -9, 0.3, 0.15)
n = int(0.5 * SR); w = sweep(n, 2800, 350) * np.sin(np.pi * t_of(n) / 0.5) ** 2
sfx('exit_whoosh', pan_st(w, -0.7, 0.8), -8, 0.4, 0.2)

# ---------------- cue sheet (local seconds; frame = round(t*30)) ----------------
f2s = lambda f: f / FPS
sheet = {
  "_doc": "SB02 sound cue sheet. Local time (s) = global − 10.0. Groups = delivery stems. Music: v06b bands from global 10.0 s (trimBefore 300 f), same gains/duck as SB01.",
  "bpm": BPM, "beatPhase": PHASE, "voMute": [M0, M1],
  "music": json.load(open('remotion/src/sb01v051/sound_v06.json'))['music'],
  "place": [
    # P01 — curtain lift out of the SB01 bomb-in, question words, two gold paths
    ["transition", "curtain_lift", f2s(0), 0.55],
    ["text", "type_small", f2s(1), 0.6], ["text", "type_hero", f2s(8), 0.75],
    ["card", "assemble_1", f2s(34), 0.45], ["card", "assemble_2", f2s(44), 0.45],
    # cut f61: 3-frame blur cut on the beat (beat 20 = f62.3)
    ["transition", "blur_cut", f2s(59), 0.8],
    # P02 — module drops from the top edge, low-fi fragment rises, kinetic words, DUA HAL
    ["card", "module_drop", f2s(66), 0.75], ["card", "card_rise", f2s(70), 0.6],
    ["text", "type_small", f2s(88), 0.65], ["text", "type_small", f2s(100), 0.55], ["text", "type_small", f2s(112), 0.55], ["text", "type_small", f2s(123), 0.55],
    ["text", "type_hero_big", f2s(130), 0.85],
    # P03 — UPGRADING SKILL: module open → task card → completed
    ["text", "type_hero", f2s(141), 0.7], ["card", "module_open", f2s(150), 0.8], ["ui", "task_slide", f2s(158), 0.7], ["ui", "check_ding", f2s(168), 0.75],
    # P04 — UI/UX WORKSHOP redesign on the beat grid (f180 / 193 / 206 / 219 / 232 / 245)
    ["text", "type_hero", f2s(180), 0.75], ["card", "card_rise", f2s(176), 0.5], ["ui", "ui_tap", f2s(188), 0.5],
    ["card", "pull_apart", f2s(193), 0.5], ["text", "type_small", f2s(200), 0.5],
    ["ui", "wire_tick", f2s(198), 0.6], ["ui", "wire_tick", f2s(201), 0.5], ["ui", "wire_tick", f2s(204), 0.5], ["ui", "wire_tick", f2s(207), 0.45],
    ["card", "assemble_1", f2s(210), 0.6], ["card", "assemble_2", f2s(214), 0.6], ["card", "assemble_3", f2s(217), 0.6], ["card", "assemble_snap", f2s(219), 0.7],
    ["ui", "cta_glow", f2s(226), 0.45],
    ["ui", "click_success", f2s(245), 0.85],
    # P05 — UPGRADING SKILL × UI/UX WORKSHOP, gold connector (beat 36 = f271.3)
    ["text", "type_combine", f2s(266), 0.8], ["transition", "connector_shimmer", f2s(268), 0.7],
    # P06 — exit toward SB03
    ["transition", "exit_swell", f2s(285), 0.6], ["transition", "exit_whoosh", f2s(292), 0.75],
  ],
}
# Level match to SB01 v06b: the first pass measured SFX 10 dB hotter than SB01 (speech-band VO−SFX −2…−7 dB vs
# +8 dB in SB01) → all SB02 placements × 0.32 (−10 dB); the curtain lift and "PERCAYA?" hit sit on speech → extra trim.
EXTRA = {'curtain_lift': 0.55, 'type_hero': 0.8, 'check_ding': 1.8, 'task_slide': 1.5}  # key UI beats kept audible
for p_ in sheet['place']:
    p_[3] = round(p_[3] * 0.32 * EXTRA.get(p_[1], 1.0), 3)
json.dump(sheet, open('remotion/src/sb02/sound_sb02.json', 'w'), indent=1)
print('SB02 audio written:', sorted(os.listdir(OUT)))
