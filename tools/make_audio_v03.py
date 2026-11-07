"""SB01 v03 audio stems: VO cleanup (FFmpeg), original synthesized music bed and SFX (numpy, fixed seeds).
Everything is generated here -> no third-party or reference audio is used.

python -I tools/make_audio_v03.py <master.MOV> <out_dir>
Writes 48 kHz stereo 24-bit WAVs:
  vo_original.wav (A/B reference, untouched), vo_clean.wav, music_bed.wav,
  sfx_aperture.wav, sfx_text_reveal_01.wav, sfx_text_reveal_02.wav, sfx_circle_wipe.wav, sfx_coins.wav,
  sfx_gears_start_stop.wav, sfx_zero_hit.wav, sfx_footage_reentry.wav, sfx_bomb_in.wav
SFX files are one-shots placed in Remotion at cues.json "sfx" frames; multi-hit files (coins, gears)
carry their internal offsets from the same cues.json.
"""
import json, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
src, out = sys.argv[1], sys.argv[2]
cues = json.load(open('remotion/src/sb01v03/cues.json'))
FPS = cues['fps']


def write(name, x, peak_db=None):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    if peak_db is not None:
        x = x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)
    sf.write(f'{out}/{name}', x.astype(np.float32), SR, subtype='PCM_24')
    print(f'{name:28s} {len(x)/SR:6.3f}s peak {20*np.log10(np.abs(x).max()+1e-12):6.1f} dBFS')


def t(dur):
    return np.arange(int(dur * SR)) / SR


def env_ad(n, a, d, curve=4.0):
    """attack (s) then exponential-ish decay to end"""
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na) ** 2
    rest = n - na
    e[na:] = np.exp(-curve * np.linspace(0, 1, rest)) if d else 1
    return e


def bandnoise(n, lo, hi, rng):
    sos = signal.butter(4, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, rng.standard_normal(n))


def sweep_noise(dur, f0, f1, rng, q=1.4):
    """noise through a time-varying band-pass (processed in 10 ms blocks)."""
    n = int(dur * SR); x = rng.standard_normal(n); y = np.zeros(n); blk = 480
    zi = None
    for i in range(0, n, blk):
        p = i / n
        fc = f0 * (f1 / f0) ** p
        lo, hi = fc / q, min(fc * q, SR / 2 - 100)
        sos = signal.butter(2, [lo, hi], btype='band', fs=SR, output='sos')
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        y[i:i + blk], zi = signal.sosfilt(sos, x[i:i + blk], zi=zi)
    return y


def pan(x, p):
    """p -1..1 (constant power), p can be array"""
    p = np.broadcast_to(p, x.shape)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


# ---------------- VO ----------------
# Chosen after A/B (audit/v03/AUDIO_QC_v03.md): afftdn barely moved the 80-1000 Hz ambience floor;
# anlmdn (fixed 480-sample latency, trimmed) alone removed it but made gap levels fluctuate (pumping risk) -> conservative 65 % wet / 35 % dry blend.
VO_CHAIN = ('[0:a]highpass=f=80:p=2,asplit=2[d][w];[w]anlmdn=s=1.5:p=0.004:r=0.006:m=15,atrim=start_sample=480,asetpts=PTS-STARTPTS[n];'
            '[d]volume=0.35[dd];[n]volume=0.65[nn];[dd][nn]amix=inputs=2:normalize=0,'
            'equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3800:t=q:w=1.0:g=2.5,'
            'acompressor=threshold=-24dB:ratio=2:attack=8:release=150:makeup=2[o]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-t', '10.5', '-vn', '-ac', '2', '-ar', str(SR),
                '-c:a', 'pcm_s24le', f'{out}/vo_original.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-t', '10.5', '-vn', '-filter_complex', VO_CHAIN,
                '-map', '[o]', '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s24le', f'{out}/vo_clean.wav'], check=True)
open(f'{out}/VO_CHAIN.txt', 'w').write(VO_CHAIN + '\n')
print('vo_clean.wav via', VO_CHAIN)

# ---------------- music bed (original) ----------------
rng = np.random.default_rng(7)
BPM = 120; beat = 60 / BPM; DUR = 10.5
N = int(DUR * SR); mus = np.zeros((N, 2))
# chords (Hz roots): Dm - Bb - F - C , 2 s each (D minor / F major colour, warm & light)
chords = [[146.83, 174.61, 220.0, 293.66], [116.54, 146.83, 174.61, 233.08],
          [174.61, 220.0, 261.63, 349.23], [130.81, 164.81, 196.0, 261.63]]
pad = np.zeros(N)
for ci in range(6):
    ch = chords[ci % 4]; s0 = int(ci * 2 * SR); s1 = min(N, int((ci + 1) * 2 * SR + 0.3 * SR))
    tt = np.arange(s1 - s0) / SR
    e = np.minimum(1, tt / 0.25) * np.minimum(1, (tt[-1] - tt + 1e-3) / 0.3)
    for fr in ch:
        for det in (-0.12, 0.0, 0.12):
            ph = rng.uniform(0, 2 * np.pi)
            # soft saw: 6 harmonics
            v = sum(np.sin(2 * np.pi * fr * (1 + det / 100) * k * tt + ph) / k for k in range(1, 7))
            pad[s0:s1] += v * e * 0.03
pad = signal.sosfilt(signal.butter(2, 1800, fs=SR, output='sos'), pad)
mus += pan(pad, 0.0) * 0.9
# pluck arpeggio on 8ths
arp = np.zeros(N)
for k in range(int(DUR / (beat / 2))):
    ch = chords[int(k * beat / 2 // 2) % 4]; fr = ch[[0, 2, 3, 1][k % 4]] * 2
    s0 = int(k * beat / 2 * SR); tt = t(0.35); seg = np.sin(2 * np.pi * fr * tt) * np.exp(-tt * 14) + 0.3 * np.sin(4 * np.pi * fr * tt) * np.exp(-tt * 20)
    e = min(len(seg), N - s0); arp[s0:s0 + e] += seg[:e] * 0.10
mus += pan(arp, np.sin(np.arange(N) / SR * 1.3) * 0.35)
# kick (soft) on beats, hats on off-beats
for k in range(int(DUR / beat)):
    s0 = int(k * beat * SR); tt = t(0.32)
    f = 48 + 70 * np.exp(-tt * 30); kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.32
    e = min(len(kick), N - s0); mus[s0:s0 + e] += np.stack([kick[:e]] * 2, 1)
    h0 = int((k + 0.5) * beat * SR); hat = bandnoise(int(0.06 * SR), 6000, 12000, rng) * np.exp(-t(0.06) * 60) * 0.05
    e = min(len(hat), N - h0)
    if e > 0:
        mus[h0:h0 + e] += pan(hat[:e], 0.25)
# riser into bomb-in (f270 -> f290)
r0, r1 = cues['bombImpact'] - 20, cues['bombImpact']
rs = sweep_noise((r1 - r0) / FPS, 400, 5000, rng) * np.linspace(0, 1, int((r1 - r0) / FPS * SR)) ** 2 * 0.12
mus[int(r0 / FPS * SR):int(r0 / FPS * SR) + len(rs)] += pan(rs, 0)
# short fade-in 0.4 s
mus[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]
write('music_bed.wav', mus, peak_db=-6)

# ---------------- SFX ----------------
rng = np.random.default_rng(11)
# aperture: soft airy whoosh opening (0.7 s)
d = 0.7; x = sweep_noise(d, 300, 2600, rng) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 1.5
write('sfx_aperture.wav', pan(x, np.linspace(-0.3, 0.3, len(x))), peak_db=-14)


def reveal(seed, f0, f1, dur):
    r = np.random.default_rng(seed); n = int(dur * SR)
    w = sweep_noise(dur, f0, f1, r) * np.sin(np.pi * np.linspace(0, 1, n) ** 0.6) ** 2
    tick = np.zeros(n); tt = t(0.03); k0 = int(dur * 0.62 * SR)
    tick[k0:k0 + len(tt)] = np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 160) * 0.6
    return w * 0.8 + tick


write('sfx_text_reveal_01.wav', pan(reveal(21, 900, 4000, 0.32), 0.15), peak_db=-15)
write('sfx_text_reveal_02.wav', pan(reveal(22, 600, 5000, 0.42) + np.concatenate([np.zeros(int(0.22 * SR)), np.sin(2 * np.pi * 90 * t(0.2)) * np.exp(-t(0.2) * 18) * 0.5])[:int(0.42 * SR)], 0), peak_db=-13)

# circle wipe: whoosh with stereo travel (0.55 s)
d = 0.55; x = sweep_noise(d, 250, 3200, rng, q=1.6) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 2
write('sfx_circle_wipe.wav', pan(x, np.linspace(-0.6, 0.6, len(x))), peak_db=-13)


def clink(r, gain):
    tt = t(0.35); partials = [2350, 3870, 5620, 7180, 9050]
    x = sum(np.sin(2 * np.pi * p * r.uniform(0.97, 1.03) * tt + r.uniform(0, 6)) * np.exp(-tt * r.uniform(14, 26)) * a
            for p, a in zip(partials, [1, 0.7, 0.45, 0.3, 0.2]))
    x[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return x * gain


base = cues['sfx']['coins']; coins = np.zeros((int(1.5 * SR), 2))
for i, lf in enumerate(cues['coinLand']):
    s0 = int((lf - base) / FPS * SR); c = clink(np.random.default_rng(100 + i), 0.55 + 0.05 * (i % 3))
    coins[s0:s0 + len(c)] += pan(c, -0.35 + 0.08 * i)
write('sfx_coins.wav', coins, peak_db=-16)

# gears: ratchet clicks following the visual speed profile + low motor tone that runs down, then a stop clunk
g = cues['gears']; dur = (g['wobbleEnd'] - g['start']) / FPS + 0.35; n = int(dur * SR); gear = np.zeros(n)
tt = np.arange(n) / SR
tp, ts = (g['peak'] - g['start']) / FPS, (g['stop'] - g['start']) / FPS
speed = np.where(tt < tp, tt / tp, np.clip(1 - (tt - tp) / (ts - tp), 0, 1) ** 1.5)  # 0..1
phase = np.cumsum(speed * 22 / SR)  # up to 22 teeth/s
clicks = np.where(np.diff(np.floor(phase), prepend=0) > 0)[0]
for k in clicks:
    c = bandnoise(int(0.012 * SR), 1500, 6000, rng) * np.exp(-t(0.012) * 300)
    gear[k:k + len(c)] += c[:max(0, min(len(c), n - k))] * 0.5
motor = np.sin(2 * np.pi * np.cumsum(55 + 45 * speed) / SR) * speed * 0.18
gear += motor
k = int(ts * SR); cl = np.sin(2 * np.pi * 120 * t(0.15)) * np.exp(-t(0.15) * 30) * 0.6 + bandnoise(int(0.15 * SR), 300, 2500, rng) * np.exp(-t(0.15) * 45) * 0.4
gear[k:k + len(cl)] += cl[:n - k]
k = int(((g['wobbleEnd'] - g['start']) / FPS - 0.08) * SR); cl2 = bandnoise(int(0.04 * SR), 800, 4000, rng) * np.exp(-t(0.04) * 120) * 0.25
gear[k:k + len(cl2)] += cl2
write('sfx_gears_start_stop.wav', pan(gear, 0.25), peak_db=-15)

# zero hit: controlled low thud + muted body click (no distortion)
tt = t(0.6); f = 42 + 40 * np.exp(-tt * 25)
z = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7) + bandnoise(len(tt), 400, 3000, rng) * np.exp(-tt * 60) * 0.25
write('sfx_zero_hit.wav', z, peak_db=-11)

# footage re-entry: rising whoosh 0.5 s
d = 0.5; x = sweep_noise(d, 200, 3800, rng) * np.linspace(0, 1, int(d * SR)) ** 1.8 * np.concatenate([np.ones(int(0.42 * SR)), np.linspace(1, 0, int(d * SR) - int(0.42 * SR))])
write('sfx_footage_reentry.wav', pan(x, np.linspace(0.4, -0.2, len(x))), peak_db=-14)

# bomb-in: pre-whoosh into impact at (bombImpact - sfx.bomb_in) frames, then LF impact tail
off = (cues['bombImpact'] - cues['sfx']['bomb_in']) / FPS; n = int((off + 0.9) * SR); b = np.zeros(n)
pre = sweep_noise(off, 500, 6000, rng) * np.linspace(0, 1, int(off * SR)) ** 2
b[:len(pre)] += pre * 0.7
tt = t(0.9); f = 34 + 60 * np.exp(-tt * 18)
imp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5) + bandnoise(len(tt), 200, 2500, rng) * np.exp(-tt * 35) * 0.3
k = int(off * SR); b[k:k + len(imp)] += imp[:n - k]
write('sfx_bomb_in.wav', pan(b, 0), peak_db=-9)
