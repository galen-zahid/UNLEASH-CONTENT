import {Easing, interpolate} from 'remotion';

export type Key = [number, number];
type Ease = (t: number) => number;

/** Piecewise keyframe track (frame → value), clamped. Optional per-segment easing. */
export const track = (frame: number, keys: Key[], ease: Ease | Ease[] = Easing.linear) => {
  if (keys.length === 1) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (f1 <= f0) throw new Error(`keys out of order at ${f0}`);
    if (frame <= f1 || i === keys.length - 2) {
      const e = Array.isArray(ease) ? ease[i] ?? Easing.linear : ease;
      return interpolate(frame, [f0, f1], [v0, v1], {
        easing: e,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  }
  return keys[keys.length - 1][1];
};

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN = Easing.bezier(0.7, 0, 0.84, 0);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Linear time remap: output = outStart + (src - srcStart) * (outEnd-outStart)/(srcEnd-srcStart) */
export const remap = (src: number, srcStart: number, srcEnd: number, outStart: number, outEnd: number) => {
  if (srcEnd === srcStart) return outStart;
  return outStart + ((src - srcStart) * (outEnd - outStart)) / (srcEnd - srcStart);
};
