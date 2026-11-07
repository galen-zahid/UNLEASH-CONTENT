"""Advance width (px at font-size 100, incl. kerning via GPOS-less approximation: hmtx + kern pairs ignored)
for every v03 string. Output remotion/src/sb01v03/textMetrics.json. python -I tools/measure_text.py"""
import json
from fontTools.ttLib import TTFont
F = 'remotion/public/fonts/'
fonts = {'serif': TTFont(F + 'SourceSerif4-BoldItalic.ttf'), 'sans': TTFont(F + 'InstrumentSans-700.ttf')}
strings = {
  'serif': ['Bangun', 'bisnis', 'UANG?', 'NOL', 'Produk', 'bagus', 'Produk bagus', 'UI/UX'],
  'sans': ['Kata', 'siapa,', 'Kata siapa,', 'cuma', 'butuh', 'cuma butuh', 'MODAL GEDE', 'SKILL EKSEKUSI', '0%', 'dan percuma', 'kalau', 'nggak dipikirin', 'NOL'],
}
out = {}
for k, f in fonts.items():
    upm = f['head'].unitsPerEm; cmap = f.getBestCmap(); hmtx = f['hmtx']
    out[k] = {}
    for s in strings[k]:
        w = sum(hmtx[cmap[ord(c)]][0] for c in s)
        out[k][s] = round(w / upm * 100, 2)
json.dump(out, open('remotion/src/sb01v03/textMetrics.json', 'w'), indent=1)
print(json.dumps(out, indent=1))
