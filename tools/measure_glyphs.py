"""Per-glyph advance widths (px at font-size 100) for printable ASCII + a few Indonesian-safe chars.
python -I tools/measure_glyphs.py -> remotion/src/sb01v04/glyphMetrics.json"""
import json
from fontTools.ttLib import TTFont
F = 'remotion/public/fonts/'
out = {}
for k, fn in {'serif': 'SourceSerif4-BoldItalic.ttf', 'sans700': 'InstrumentSans-700.ttf', 'sans600': 'InstrumentSans-600.ttf', 'sans500': 'InstrumentSans-500.ttf'}.items():
    f = TTFont(F + fn); upm = f['head'].unitsPerEm; cmap = f.getBestCmap(); hm = f['hmtx']
    out[k] = {chr(c): round(hm[cmap[c]][0] / upm * 100, 2) for c in range(32, 127) if c in cmap}
    out[k]['—'] = round(hm[cmap[0x2014]][0] / upm * 100, 2) if 0x2014 in cmap else out[k]['-']
json.dump(out, open('remotion/src/sb01v04/glyphMetrics.json', 'w'))
print({k: (v['M'], v['—']) for k, v in out.items()})
