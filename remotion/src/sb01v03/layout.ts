// SB01 v03 layout helpers: measured text sizing, footage framing, face-anchored text positions.
import {C, H, W} from '../lib/tokens';
import cues from './cues.json';
import face from './faceTrack.json';
import metrics from './textMetrics.json';

export const CUES = cues;
export const IVORY = '#F7F4ED'; // user-locked v03 illustration field (brief SB01 V03); see audit/v03/DECISIONS.md
export const INK = C.tealDark; // #09292F (GSM, authoritative over provisional #163C43)

type Family = 'serif' | 'sans';
/** font-size (px) so that `text` spans `frac` of the 1080 px width (advance widths measured with fontTools). */
export const fit = (family: Family, text: string, frac: number) => {
  const w100 = (metrics as Record<Family, Record<string, number>>)[family][text];
  if (!w100) throw new Error(`no metric for ${family} "${text}" — run tools/measure_text.py`);
  return Math.round(((frac * W) / w100) * 100);
};

// Footage framing (graded proxy, 1080x1920). Scale 1.4 about centre, per-shot offset puts the face
// centre at ≈0.37 H so the lower half stays free for type (face never under text).
export const FOOT_SCALE = 1.4;
export const shotOffset = (f: number) => (f < CUES.masterCut ? {dx: 76, dy: -85} : {dx: 20, dy: -47});

const at = (arr: number[], f: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.round(f)))];

/** Face centre / chin in SCREEN space for full-frame footage at frame f (Haar track, smoothed per shot). */
export const faceScreen = (f: number, extraScale = 1) => {
  const {dx, dy} = shotOffset(f);
  const s = FOOT_SCALE * extraScale;
  const cx = (at(face.cx, f) - W / 2) * s + W / 2 + dx * extraScale;
  const cy = (at(face.cy, f) - H / 2) * s + H / 2 + dy * extraScale;
  const h = at(face.h, f) * s;
  return {cx, cy, h, chin: cy + 0.62 * h};
};

/** Lower-third text anchor: below the chin with margin, x follows the face but is clamped to keep type on screen. */
export const textAnchor = (f: number, extraScale = 1) => {
  const fs = faceScreen(f, extraScale);
  return {x: Math.max(0.42 * W, Math.min(0.58 * W, fs.cx)), y: Math.max(fs.chin + 60, 0.5 * H)};
};
