"""Event-by-event comparison: our V05.1 SFX vs the reference transient stem (05) at the equivalent moment.
Classifies each reference slice from measurements (no listening): length of energy, spectral centroid,
low-band share, attack time. python -I tools/compare_sfx_events.py"""
import json, numpy as np, soundfile as sf
from scipy import signal
SR = 48000
ref, _ = sf.read('remotion/public/audio_ref/05_SFX_TRANSIENTS_ESTIMATE_FIRST10.wav'); ref = ref.mean(1)
ac = json.load(open('remotion/src/sb01v051/audioCues.json'))
ours = {name: fr / 30 for name, (fr, g) in ac['place'].items()}
def char(a, b):
    x = ref[int(a*SR):int(b*SR)]
    if len(x) < 100: return {}
    f, P = signal.welch(x, SR, nperseg=1024); cen = (f*P).sum()/P.sum()
    low = P[f < 200].sum()/P.sum()
    env = np.array([np.sqrt((x[i:i+240]**2).mean()) for i in range(0, len(x)-240, 240)])
    pk = env.argmax(); att = pk*5; thr = env.max()*0.3; dur = (env > thr).sum()*5
    rms = 20*np.log10(np.sqrt((x**2).mean())+1e-12)
    kind = 'thump/LF hit' if low > 0.45 else ('click/tick' if dur < 60 and cen > 2500 else ('whoosh/swish' if dur >= 120 else 'hit/pop'))
    return dict(rms=round(rms,1), centroid=int(cen), low=round(low,2), attack_ms=att, dur_ms=dur, kind=kind)
# visual events (our frames) and the reference moment that plays the same role
events = [
  ('aperture opens', 0, 'aperture', (0.0, 0.6)),
  ('hero 1 "Kata siapa?"', 25, 'text_reveal_01', (0.64, 1.1)),
  ('hero 2 "Bangun bisnis"', 55, 'text_reveal_01b', (2.0, 2.3)),
  ('expand to full frame f72–75', 72, None, (2.38, 2.7)),
  ('box + UANG? letters f78–f92', 86, 'text_reveal_02', (2.95, 3.35)),
  ('pre-wipe + circle wipe', 99, 'circle_wipe', (3.45, 4.0)),
  ('coins fly / stack', 112, 'coins', (4.05, 4.9)),
  ('gears start/stall', 156, 'gears_start_stop', (5.12, 5.55)),
  ('NOL hit', 179, 'zero_hit', (5.62, 6.0)),
  ('card collapse → re-entry', 194, 'footage_reentry', (6.45, 6.95)),
  ('card expand + focus pull f224–232', 228, None, (7.12, 7.6)),
  ('UI/UX hero', 243, 'text_reveal_02b', (8.0, 8.45)),
  ('workshop card enters f246–258', 247, None, (8.05, 8.4)),
  ('module 01 card floats in f258', 259, None, (8.85, 9.15)),
  ('cursor failed click f283', 283, None, (5.15, 5.45)),
  ('bomb-in / impact f297', 288, 'bomb_in', (9.45, 10.0)),
]
rows = []
print(f"{'event':36s} {'frame':>5s} {'our SFX':18s} | ref slice      kind           rms  cen   low  dur")
for name, fr, our, (a, b) in events:
    c = char(a, b)
    rows.append(dict(event=name, frame=fr, ours=our, ref=[a, b], **{k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, np.floating) else v) for k, v in c.items()}))
    print(f"{name:36s} {fr:5d} {str(our):18s} | {a:4.2f}-{b:4.2f}s {c.get('kind',''):14s} {c.get('rms','')!s:>5s} {c.get('centroid','')!s:>5s} {c.get('low','')!s:>4s} {c.get('dur_ms','')!s:>4s}")
json.dump(rows, open('audit/v051/SFX_EVENT_COMPARE.json', 'w'), indent=1)
