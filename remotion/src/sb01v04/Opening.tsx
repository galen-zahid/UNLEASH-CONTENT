// SB01 v04 opening (f0–f107): measured aperture + camera, reference-mapped kinetic typography.
// Every keyframe below cites its reference frame (ref = larg8ak17f8d AFTER crop); see audit/v04/FRAME_MAP.md.
import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, H, W} from '../lib/tokens';
import {FOOT_SCALE, INK, IVORY, shotOffset} from './layout';
import {APERTURE, CAM_OPEN, mono} from './refTracks';
import {fitStr} from './metrics';
import {Hero, Sans} from './Type';

const SRC = staticFile('master/IMG_6757_0-10.5_v03_graded_cfr30.mp4');
const K = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (f: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number = Easing.bezier(0.2, 0.8, 0.2, 1)) =>
  interpolate(f, [a, b], [v0, v1], {...K, easing: e});
const easeIn = Easing.bezier(0.6, 0, 0.9, 0.4);

const Footage: React.FC<{f: number; extra?: number; blur?: number}> = ({f, extra = 1, blur = 0}) => {
  const {dx, dy} = shotOffset(f);
  return (
    <AbsoluteFill style={{transform: `translate(${dx * extra}px, ${dy * extra}px) scale(${FOOT_SCALE * extra})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
      <OffthreadVideo src={SRC} muted style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};

/** edge velocity (px/frame) → feather (px) for a 180° shutter */
const vel = (fn: (t: number) => number, f: number, scale: number) => Math.abs(fn(f + 0.5) - fn(f - 0.5)) * scale;

// ======================= APERTURE + CAMERA =======================
export const LiveOpen: React.FC = () => {
  const f = useCurrentFrame();
  const l = APERTURE.L(f) * W;
  const r = APERTURE.R(f) * W;
  const t = APERTURE.T(f) * H;
  const b = APERTURE.B(f) * H;
  const full = f >= 75;
  // motion blur on moving edges: feather = half the edge travel per frame (180° shutter), min 0.75 px
  const fl = Math.max(0.75, vel(APERTURE.L, f, W) * 0.5);
  const fr = Math.max(0.75, vel(APERTURE.R, f, W) * 0.5);
  const ft = Math.max(0.75, vel(APERTURE.T, f, H) * 0.5);
  const fb = Math.max(0.75, vel(APERTURE.B, f, H) * 0.5);
  const cam = CAM_OPEN(f);
  // pre-wipe energy (ref f112–f114 blur burst, shifted −13 f): blur + small directional shake
  const pre = interpolate(f, [97, 100, 103], [0, 9, 14], {...K, easing: easeIn});
  const shake = f >= 97 ? Math.sin(f * 2.1) * pre * 1.4 : 0;
  // full-frame expand f72–f75 carries a short motion blur on the footage (ref f73–f74 smear)
  const smear = interpolate(f, [72, 73, 74, 75], [0, 6, 4, 0], K);
  const mask = full
    ? undefined
    : `linear-gradient(to right, transparent ${l - fl}px, #000 ${l + fl}px, #000 ${r - fr}px, transparent ${r + fr}px), linear-gradient(to bottom, transparent ${t - ft}px, #000 ${t + ft}px, #000 ${b - fb}px, transparent ${b + fb}px)`;
  const lineBlurX = (v: number) => (v > 1.5 ? `blur(${Math.min(6, v * 0.35)}px)` : undefined);
  return (
    <AbsoluteFill style={{backgroundColor: INK, overflow: 'hidden'}}>
      {!full && (
        <AbsoluteFill>
          {/* background: same footage, heavily blurred, follows the camera more slowly (depth) */}
          <Footage f={f} extra={1.42 + (cam - 1) * 0.5} blur={60} />
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${INK} 0%, ${C.teal} 40%, ${C.cyan1} 62%, ${C.teal} 84%, ${INK} 100%)`, opacity: 0.8}} />
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
          transform: `translateX(${shake}px)`,
        }}
      >
        <Footage f={f} extra={cam} blur={smear + pre} />
      </AbsoluteFill>
      {f >= 1 && f < 73 && (
        <AbsoluteFill style={{opacity: interpolate(f, [1, 2, 70, 72.5], [0, 0.55, 0.55, 0], K)}}>
          <div style={{position: 'absolute', left: l - 1, top: 0, width: 2, height: H, background: IVORY, filter: lineBlurX(fl)}} />
          <div style={{position: 'absolute', left: r - 1, top: 0, width: 2, height: H, background: IVORY, filter: lineBlurX(fr)}} />
          <div style={{position: 'absolute', top: t - 1, left: 0, height: 2, width: W, background: IVORY, filter: lineBlurX(ft)}} />
          <div style={{position: 'absolute', top: b - 1, left: 0, height: 2, width: W, background: IVORY, filter: lineBlurX(fb)}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ======================= DOODLES =======================
/** Ref f3–f17: a white brush stroke travels around the head (dash segment moving along a path, trailing). */
/** a dash segment travelling along a path (lead = head position 0..1, seg = trail length) */
const Trail: React.FC<{d: string; lead: number; seg: number; op: number; w: number; color?: string}> = ({d, lead, seg, op, w, color = IVORY}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
    <path d={d} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${seg} 2`} strokeDashoffset={-(lead - seg)} style={{filter: 'drop-shadow(0 3px 0 rgba(9,41,47,0.5))'}} />
  </svg>
);

/** Ref f17–f25: second gesture sweeps down the left side of the head; f27–f36: short tick near the forehead. */
export const OpeningScribble2: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 17 || f > 37) return null;
  return (
    <>
      {f <= 26 && (
        <Trail
          d="M 600 500 C 470 470, 380 560, 392 700"
          lead={mono([[17, 0], [20, 0.55], [24, 1]])(f)}
          seg={interpolate(f, [17, 19, 23, 25], [0.1, 0.5, 0.45, 0.05], K)}
          op={interpolate(f, [17, 18, 24, 26], [0, 1, 1, 0], K)}
          w={26}
        />
      )}
      {f >= 27 && (
        <Trail
          d="M 430 610 C 452 578, 492 582, 506 612"
          lead={mono([[27, 0], [31, 0.8], [35, 1]])(f)}
          seg={interpolate(f, [27, 30, 34, 36], [0.15, 0.7, 0.6, 0.1], K)}
          op={interpolate(f, [27, 28, 34, 37], [0, 1, 1, 0], K)}
          w={18}
        />
      )}
    </>
  );
};

export const OpeningScribble: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 3 || f > 19) return null;
  const head = mono([[3, 0.0], [6, 0.28], [10, 0.62], [14, 0.86], [17, 1.0]])(f); // leading point along path
  const seg = interpolate(f, [3, 6, 12, 17], [0.08, 0.3, 0.32, 0.05], K); // stroke length (trail)
  const op = interpolate(f, [3, 4, 16, 18], [0, 1, 1, 0], K);
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: op}}>
      <path
        d="M 820 860 C 900 760, 860 600, 760 548 C 680 506, 560 500, 470 540"
        stroke={IVORY}
        strokeWidth={24}
        strokeLinecap="round"
        fill="none"
        pathLength={1}
        strokeDasharray={`${seg} 2`}
        strokeDashoffset={-(head - seg)}
        style={{filter: 'drop-shadow(0 3px 0 rgba(9,41,47,0.5))'}}
      />
    </svg>
  );
};

// ======================= TYPOGRAPHY =======================
// Layout from the reference: hero line centre y ≈ 0.61 H, left edge aligned to the aperture's left edge
// (≈0.19 W), hero width ≈ 0.61 W ("One Thing" / "LOOking"). Box (ref "2025"): 0.23–0.78 W × 0.655–0.75 H.
const HERO_L = 0.19 * W;
const HERO_Y = 0.575 * H;
const S1 = fitStr('serif', 'Kata siapa?', 0.64);
const S2 = fitStr('serif', 'Bangun bisnis', 0.64);
const S_SMALL = fitStr('sans700', 'cuma butuh', 0.25);
const BOX = {l: 0.17 * W, r: 0.83 * W, t: 0.668 * H, b: 0.79 * H};
const S_UANG = fitStr('serif', 'UANG?', 0.56); // prominence of ref 'LOOking' (≈0.6 W)
const GAP = (s: number) => s * 0.26;

/** word entrance: rise (dy) or slide (dx) + blur, 3-frame settle with no overshoot (ref "One"/"Thing") */
const wordIn = (f: number, at: number, from: {dx?: number; dy?: number; s?: number; blur?: number}) => {
  const p = ease(f, at, at + 3, 0, 1);
  return {
    opacity: ease(f, at, at + 1.5, 0, 1, Easing.linear),
    transform: `translate(${(from.dx ?? 0) * (1 - p)}px, ${(from.dy ?? 0) * (1 - p)}px) scale(${1 + ((from.s ?? 1) - 1) * (1 - p)})`,
    filter: `blur(${(from.blur ?? 10) * (1 - p)}px)`,
  };
};

export const OpeningType: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 24 || f > 106) return null;
  // global pre-wipe exit (ref f112–f114): everything blurs/scales with the shake
  const pre = interpolate(f, [97, 100, 103], [0, 8, 12], {...K, easing: easeIn});
  const preOp = interpolate(f, [100, 104], [1, 0], K);
  // hero 1 exit (ref f48–f53 blur dissolve)
  const out1 = ease(f, 48, 53, 0, 1, Easing.inOut(Easing.quad));
  // scribble on hero 2 (ref pink loop over "LOOking" f88–f93)
  const scrib = ease(f, 88, 94, 1, 0);
  const rule = ease(f, 77, 84, 0, 1);
  const boxIn = ease(f, 78, 80, 0, 1);
  const fill = ease(f, 79, 85, 0, 1);
  return (
    <AbsoluteFill style={{filter: pre > 0.1 ? `blur(${pre}px)` : undefined, opacity: preOp, transform: `scale(${1 + pre * 0.004})`}}>
      {/* HERO 1: Kata (ref "One" f25 rise+blur) · siapa? (ref "Thing" f30 slide-from-right; ours f33 = spoken "siapa" f36 − 3 f pre-roll) */}
      {f < 54 && (
        <div style={{position: 'absolute', left: HERO_L, top: HERO_Y, display: 'flex', gap: GAP(S1), opacity: 1 - out1, filter: `blur(${out1 * 12}px)`, transform: `scale(${1 + out1 * 0.04})`, transformOrigin: 'left center'}}>
          <div style={wordIn(f, 25, {dy: 46, blur: 12, s: 1.04})}>
            <Hero text="Kata" size={S1} fill="ivory" />
          </div>
          {f >= 33 && (
            <div style={wordIn(f, 33, {dx: 70, blur: 14})}>
              <Hero text="siapa?" size={S1} fill="orange" />
            </div>
          )}
        </div>
      )}
      {/* HERO 2: Bangun (ref "LOOking" pop f60–f62; ours f55 = spoken "bangun" f53 + 2) · bisnis (spoken f61) */}
      {f >= 55 && (
        <div style={{position: 'absolute', left: HERO_L, top: HERO_Y, display: 'flex', gap: GAP(S2)}}>
          <div style={wordIn(f, 55, {s: 1.22, blur: 12})}>
            <Hero text="Bangun" size={S2} fill="orange" />
          </div>
          {f >= 61 && (
            <div style={wordIn(f, 61, {s: 1.22, blur: 12})}>
              <Hero text="bisnis" size={S2} fill="ivory" />
            </div>
          )}
          {/* orange loop scribble over the hero (ref f88–f93) */}
          <svg width={0.62 * W} height={S2 * 1.4} style={{position: 'absolute', left: 0, top: -S2 * 0.1, overflow: 'visible', pointerEvents: 'none'}}>
            <path
              d={`M ${0.03 * W} ${S2 * 1.1} C ${0.18 * W} ${S2 * 1.32}, ${0.33 * W} ${S2 * 0.86}, ${0.38 * W} ${S2 * 1.08} S ${0.52 * W} ${S2 * 1.34}, ${0.6 * W} ${S2 * 0.98}`}
              stroke={C.orange1}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={scrib}
              style={{filter: `drop-shadow(0 4px 0 ${INK})`}}
            />
          </svg>
        </div>
      )}
      {/* orange slash right of hero 2 (ref pink slash f66–f71) */}
      {f >= 66 && f <= 74 && (
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
          <path
            d={`M ${0.84 * W} ${HERO_Y - 10} C ${0.88 * W} ${HERO_Y + 40}, ${0.87 * W} ${HERO_Y + 100}, ${0.82 * W} ${HERO_Y + 140}`}
            stroke={C.orange1}
            strokeWidth={16}
            strokeLinecap="round"
            fill="none"
            pathLength={1}
            strokeDasharray={`${ease(f, 66, 69, 0, 0.9)} 2`}
            strokeDashoffset={-ease(f, 69, 74, 0, 0.9, easeIn)}
          />
        </svg>
      )}
      {/* small "cuma butuh" right-aligned under the hero (ref "forward to" f60–f72), word by word on speech */}
      {f >= 70 && (
        <div style={{position: 'absolute', right: 0.22 * W, top: HERO_Y + S2 * 1.0, display: 'flex', gap: S_SMALL * 0.28}}>
          <div style={wordIn(f, 70, {dy: 24, blur: 6})}>
            <Sans text="cuma" size={S_SMALL} />
          </div>
          {f >= 78 && (
            <div style={wordIn(f, 78, {dy: 24, blur: 6})}>
              <Sans text="butuh" size={S_SMALL} />
            </div>
          )}
        </div>
      )}
      {/* rule + travelling dot (ref f77–f84) */}
      {f >= 77 && (
        <>
          <div style={{position: 'absolute', left: 0.5 * W, top: HERO_Y + S2 * 1.0 + S_SMALL * 1.18, height: 3, width: rule * 0.28 * W, background: IVORY, opacity: 0.9}} />
          <div style={{position: 'absolute', left: 0.5 * W + rule * 0.28 * W - 9, top: HERO_Y + S2 * 1.0 + S_SMALL * 1.18 - 8, width: 18, height: 18, borderRadius: 9, background: C.orange1}} />
        </>
      )}
      {/* BOX (ref "2025"): outline+handles f78, fill f79–f85, splash f82–f89, letters drop f88–f92, settle f95 */}
      {f >= 78 && (
        <div style={{position: 'absolute', left: BOX.l, top: BOX.t, width: BOX.r - BOX.l, height: BOX.b - BOX.t, opacity: boxIn}}>
          <div style={{position: 'absolute', inset: 0, background: 'rgba(9,41,47,0.78)', transformOrigin: 'left center', transform: `scaleX(${fill})`}} />
          <div style={{position: 'absolute', inset: 0, border: `3px solid ${IVORY}`}} />
          {[
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0.5, 0],
          ].map(([x, y], i) => (
            <div key={i} style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 16, height: 16, margin: -8, background: IVORY, border: `2px solid ${INK}`}} />
          ))}
          {/* ivory paint splash sweeping along the lower edge */}
          {f <= 92 &&
            [0, 1, 2, 3, 4, 5, 6].map((i) => {
              const at = 82 + i;
              const p = ease(f, at, at + 4, 0, 1);
              const fade = interpolate(f, [at + 3, at + 7], [1, 0], K);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${8 + i * 13}%`,
                    top: `${62 + (i % 3) * 8}%`,
                    width: 70 - i * 4,
                    height: 26 - (i % 2) * 8,
                    borderRadius: 20,
                    background: IVORY,
                    opacity: Math.min(p * 2, 1) * fade,
                    transform: `translateX(${p * 30}px) scaleX(${0.4 + p * 0.9})`,
                  }}
                />
              );
            })}
          {/* letters */}
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {'UANG?'.split('').map((ch, i) => {
              const at = 88 + i;
              if (f < at) return <span key={i} style={{width: 0}} />;
              const p = ease(f, at, at + 3, 0, 1, Easing.bezier(0.3, 1.4, 0.5, 1)); // small overshoot like the ref digits
              const rot = [-14, 10, -8, 12, -6][i];
              return (
                <div key={i} style={{transform: `translateY(${(1 - p) * -48}px) rotate(${rot * (1 - p)}deg)`, opacity: Math.min(1, p * 2)}}>
                  <Hero text={ch} size={S_UANG} fill="orange" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* typographic accent dot under hero 1 (ref white dot under "One Thing" f36–f50) */}
      {f >= 36 && f < 52 && <div style={{position: 'absolute', left: 0.5 * W - 7, top: HERO_Y + S1 * 1.18, width: 14, height: 14, borderRadius: 7, background: IVORY, opacity: 1 - out1}} />}
    </AbsoluteFill>
  );
};

/** Ref f75–f96: the pink accent keeps moving around "LOOking" (small loops/ticks). v04: two orange trailing
 *  strokes around hero 2 between the full-frame expand and the box (f74–f87), then the loop scribble f88–f94. */
export const Hero2Doodles: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 74 || f > 88) return null;
  const y = 0.575 * H;
  return (
    <>
      <Trail
        d={`M ${0.84 * W} ${y + 30} C ${0.9 * W} ${y - 40}, ${0.8 * W} ${y - 90}, ${0.74 * W} ${y - 40}`}
        lead={mono([[74, 0], [78, 0.7], [81, 1]])(f)}
        seg={interpolate(f, [74, 76, 79, 81], [0.12, 0.55, 0.5, 0.05], K)}
        op={interpolate(f, [74, 75, 80, 82], [0, 1, 1, 0], K)}
        w={14}
        color={C.orange1}
      />
      <Trail
        d={`M ${0.16 * W} ${y + 150} C ${0.12 * W} ${y + 110}, ${0.13 * W} ${y + 60}, ${0.2 * W} ${y + 52}`}
        lead={mono([[80, 0], [84, 0.75], [87, 1]])(f)}
        seg={interpolate(f, [80, 82, 85, 87], [0.12, 0.6, 0.5, 0.05], K)}
        op={interpolate(f, [80, 81, 86, 88], [0, 1, 1, 0], K)}
        w={12}
        color={C.orange1}
      />
    </>
  );
};
