// Text sizing from measured per-glyph advances (tools/measure_glyphs.py, fontTools on the shipped TTFs).
import {W} from '../lib/tokens';
import glyphs from './glyphMetrics.json';

export type GFamily = 'serif' | 'sans700' | 'sans600' | 'sans500';

/** advance width (px) of `text` at font-size `size` */
export const textWidth = (family: GFamily, text: string, size: number) => {
  const g = (glyphs as Record<GFamily, Record<string, number>>)[family];
  let w = 0;
  for (const ch of text) {
    const a = g[ch];
    if (a === undefined) throw new Error(`no glyph metric for "${ch}" (${family})`);
    w += a;
  }
  return (w / 100) * size;
};

/** font-size (px) so that `text` spans `frac` of the 1080 px frame width */
export const fitStr = (family: GFamily, text: string, frac: number) => Math.round((frac * W * 100) / textWidth(family, text, 100));
