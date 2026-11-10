"""Search Openverse for CC0 sound effects per SB02 cue role and write a shortlist with item links.
Freesound / Mixkit CDNs refuse scripted downloads from this server (403 from the origin), so files are downloaded
by hand from the item pages; --download tries the preview anyway.
python -I tools/openverse_sfx_search.py   → audit/sb02/sfx_real/candidates.json + _dl/<role>/<id>.mp3
Only CC0 (no attribution, commercial + edits allowed). Licence = Openverse record (from the Freesound item)."""
import json, os, subprocess, time, urllib.parse, urllib.request
OUT = 'audit/sb02/sfx_real'; DL = OUT + '/_dl'
ROLES = {
    'whoosh_fast': ['swipe whoosh', 'fast whoosh', 'swish'],
    'whoosh_soft': ['soft whoosh', 'air whoosh'],
    'riser': ['riser', 'reverse cymbal'],
    'ui_pop': ['bubble pop', 'ui pop', 'pop'],
    'wood_knock': ['wood block', 'wood knock'],
    'mouse_click': ['mouse click'],
    'key_tick': ['keyboard key', 'typewriter key', 'key press'],
    'switch': ['light switch', 'switch click'],
    'chime': ['chime', 'bell ding', 'glockenspiel'],
    'sparkle': ['sparkle', 'magic shimmer', 'twinkle'],
    'page_flip': ['page turn', 'book open', 'paper flip'],
    'hit_soft': ['soft impact', 'thump', 'kick drum'],
}
os.makedirs(DL, exist_ok=True)
UA = {'User-Agent': 'sfx-search-script/1.0'}  # Openverse 403s the default Python-urllib agent
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30)
cands = {}
for role, qs in ROLES.items():
    seen = {}
    for q in qs:
        url = 'https://api.openverse.org/v1/audio/?' + urllib.parse.urlencode({'q': q, 'license': 'cc0', 'source': 'freesound', 'page_size': 20})
        try:
            d = json.load(get(url))
        except Exception as e:
            print('search fail', role, q, e); continue
        for r in d.get('results', []):
            dur = r.get('duration') or 0
            if r['license'] != 'cc0' or not (80 <= dur <= 4000) or r['id'] in seen: continue
            seen[r['id']] = {'id': r['id'], 'title': r['title'], 'creator': r.get('creator'), 'license': r['license'], 'license_version': r.get('license_version'),
                             'duration_ms': dur, 'url': r['url'], 'landing': r['foreign_landing_url'], 'tags': [t['name'] for t in r.get('tags') or []][:12], 'query': q}
        time.sleep(1.0)
    picks = sorted(seen.values(), key=lambda c: c['duration_ms'])[:8]
    for c in picks if '--download' in __import__('sys').argv else []:
        os.makedirs(f'{DL}/{role}', exist_ok=True)
        p = f"{DL}/{role}/{c['id'][:8]}.mp3"
        if not os.path.exists(p):
            try:
                open(p, 'wb').write(get(c['url']).read()); time.sleep(0.5)
            except Exception as e:
                print('dl fail', c['url'], e); continue
        c['file'] = p
    cands[role] = picks
    print(f'{role:12s} {len(cands[role])} cands: ' + ' | '.join(f"{c['title'][:24]} ({c['duration_ms']}ms)" for c in cands[role]))
json.dump(cands, open(OUT + '/candidates.json', 'w'), indent=1)
md = ['# SB02 — kandidat SFX rekaman asli (Openverse → Freesound, hanya CC0)', '',
      'CC0 = bebas dipakai komersial dan diedit, tanpa wajib kredit. Lisensi dari data Openverse; cek lagi di halaman item sebelum dipakai.', '']
for role, cs in cands.items():
    md += [f'## {role}', '', '| judul | durasi | pembuat | link |', '|---|---|---|---|']
    md += [f"| {c['title'][:50]} | {c['duration_ms'] / 1000:.2f} s | {c['creator']} | {c['landing']} |" for c in cs] + ['']
open(OUT + '/SHORTLIST.md', 'w').write('\n'.join(md))
