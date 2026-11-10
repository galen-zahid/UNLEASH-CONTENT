// SB01 v04 — 7.7–10.0 s (f231–f299): "kalau UI/UX …" typography on the reference "Our lives are / Busier /
// than ever" mechanics, flawed WorkshopLearningDashboard as foreground support, and the bomb-in where the
// dominant visual (the dashboard's main panel) accelerates into camera and becomes the transition to SB02.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, CYAN_LABEL, H, ORANGE_SIMPLE, W} from '../lib/tokens';
import {CUES, INK, IVORY, faceScreen} from './layout';
import {fitStr} from './metrics';
import {CAM_E} from './refTracks';
import {Hero, Sans} from './Type';
import {FragCursor, GoldConnector, MainWorkshopCard, ModuleFloatCard, TEAL, Ticks} from './WorkshopDashboardFragment';

const K = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const outE = Easing.bezier(0.2, 0.8, 0.2, 1);
const inE = Easing.bezier(0.55, 0, 0.9, 0.35);
const ease = (f: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number = outE) => interpolate(f, [a, b], [v0, v1], {...K, easing: e});
const WD = CUES.words;

const S_KALAU = fitStr('sans700', 'kalau', 0.2);
const S_UIUX = fitStr('serif', 'UI/UX', 0.67); // ref "Busier" spans 0.18–0.85 W
const UI_TOP = 0.62 * H - S_UIUX * 0.55; // v05.1: copy block centred at 0.62 H ("kalau" stays below the chin), fragment below
const S_TAIL = 40;

/** bomb-in progress shared by every layer: accelerating (ease-in) f288 → f298 */
export const bombP = (f: number) => ease(f, 288, 299, 0, 1, inE); // still accelerating on the last frame (momentum into SB02)

// ======================= TYPE =======================
export const UiuxType: React.FC = () => {
  const f = useCurrentFrame();
  if (f < WD.kalau2) return null;
  // camera tracking: type rides the footage push about the face point
  const cam = CAM_E(f);
  const fs = faceScreen(f);
  const exit = ease(f, 287, 294, 0, 1, inE);
  const blob = ease(f, 236, 244, 0, 1); // ref blob f244→f251 (8 f), ours f236→f244 ending on "personal"
  const uP = ease(f, WD.personal, WD.personal + 4, 0, 1); // ref "Busier" blurred→sharp f252→f256 (4 f)
  const boxRot = interpolate(f, [247, 253, 255], [-20, -20, 0], {...K, easing: Easing.inOut(Easing.quad)}); // ref f256 tilted → flat f262–264
  const boxIn = ease(f, 247, 250, 0, 1);
  const typed = Math.round(ease(f, 255, 262, 0, 15, Easing.linear));
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${fs.cx}px ${fs.cy}px`,
        transform: `scale(${cam * (1 + exit * 0.35)}) translateY(${-exit * 90}px)`,
        opacity: 1 - exit,
      }}
    >
      {/* small line (ref "Our lives are" f235, centred above the hero) */}
      <div style={{position: 'absolute', left: 0, width: W, top: UI_TOP - S_KALAU * 0.75, display: 'flex', justifyContent: 'center'}}>
        <div style={{opacity: ease(f, WD.kalau2, WD.kalau2 + 2, 0, 1, Easing.linear), transform: `translateY(${ease(f, WD.kalau2, WD.kalau2 + 4, 26, 0)}px)`, filter: `blur(${ease(f, WD.kalau2, WD.kalau2 + 3, 6, 0)}px)`}}>
          <Sans text="kalau" size={S_KALAU} />
        </div>
      </div>
      {/* travelling orange blob (ref pink blob from the right edge, shrinking) */}
      {f >= 236 && f < WD.personal + 2 && (
        <div
          style={{
            position: 'absolute',
            left: interpolate(blob, [0, 1], [1.02 * W, 0.66 * W]),
            top: UI_TOP + S_UIUX * 0.48,
            width: 150,
            height: 44,
            borderRadius: 22,
            background: ORANGE_SIMPLE,
            transform: `rotate(${interpolate(blob, [0, 1], [-14, 18])}deg) scale(${interpolate(blob, [0, 1], [1.5, 0.6])}, ${interpolate(blob, [0, 1], [1, 0.8])})`,
            filter: `blur(${(1 - blob) * 4}px)`,
          }}
        />
      )}
      {/* hero UI/UX: enters big + heavily blurred, sharpens over 4 frames (no bounce: the reference settles straight) */}
      {f >= WD.personal && (
        <div style={{position: 'absolute', left: 0, width: W, top: UI_TOP, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${1 + 0.24 * (1 - uP)})`, filter: `blur(${16 * (1 - uP)}px)`, opacity: Math.min(1, 0.35 + uP)}}>
            <Hero text="UI/UX" size={S_UIUX} fill="orange" />
          </div>
        </div>
      )}
      {/* ivory splash flying from the top-left of the hero (ref f255–f264) */}
      {f >= 246 && f <= 258 &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const at = 246 + i * 0.7;
          const p = ease(f, at, at + 9, 0, 1);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0.2 * W - p * (40 + i * 22),
                top: UI_TOP - 10 - p * (30 + i * 9),
                width: 56 - i * 7,
                height: 22 - i * 2,
                borderRadius: 14,
                background: IVORY,
                opacity: interpolate(p, [0, 0.1, 0.7, 1], [0, 1, 0.8, 0]),
                transform: `rotate(${-20 + i * 6}deg)`,
              }}
            />
          );
        })}
      {/* tilted box with handles → flattens → text types in (ref "than ever" f256–f264) */}
      {f >= 247 && (
        <div
          style={{
            position: 'absolute',
            right: 0.14 * W,
            top: UI_TOP + S_UIUX * 1.02,
            height: 62,
            minWidth: 330,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            background: CYAN_LABEL,
            border: `2px solid ${IVORY}`,
            transformOrigin: 'right center',
            transform: `rotate(${boxRot}deg) scale(${boxIn})`,
          }}
        >
          {[
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ].map(([x, y], i) => (
            <div key={i} style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 12, height: 12, margin: -6, background: IVORY, border: `2px solid ${INK}`}} />
          ))}
          <Sans text={'nggak dipikirin'.slice(0, typed)} size={S_TAIL} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ======================= WORKSHOP DASHBOARD FRAGMENT (V05.1) =======================
// Secondary visual: talent + "UI/UX" stay dominant. Footprint: main card 640×410 (21 % H), with the 01 card
// overlapping its top-left ≈ 26 % H in total. Only main card + one supporting card are fully visible; the 03 card
// only peeks in from the right edge. Frames: 8.2–8.6 s main card, 8.6–9.1 s module 01, 9.1–9.5 s failed cursor,
// 9.5–10 s bomb-in (unchanged timing, impact cue f297).
const A_X = 380; // main card position (frame px, before camera tracking)
const A_Y = 1470;
const B_X = 80; // module 01 — overlaps the main card's top-left corner
const B_Y = 1410;
const C_X = 905; // module 03 — peeks from the right edge (≈175 px visible)
const C_Y = 1752;

/** camera tracking about the face point; depth > 1 = nearer layer (parallax) + gentle upward drift */
const camTrack = (f: number, x: number, y: number, depth: number, from: number) => {
  const cam = CAM_E(f);
  const fs = faceScreen(f);
  const k = 1 + (cam - 1) * depth;
  const drift = -Math.max(0, f - from) * 0.3 * depth;
  return {x: fs.cx + (x - fs.cx) * k, y: fs.cy + (y - fs.cy) * k + drift, k};
};

// cursor (frame px): comes in from the lower right, first goes to the title (wrong target), back to the faint
// CTA, presses (nothing happens), small hesitation
const CURSOR: [number, number, number][] = [
  [272, 1010, 1930], [276, 700, 1600], [278, 690, 1596], [281, 470, 1776], [283, 478, 1770], [286, 462, 1782], [288, 470, 1776],
];
const cursorAt = (f: number) => {
  const fr = CURSOR.map((c) => c[0]);
  const o = {...K, easing: Easing.bezier(0.45, 0, 0.25, 1)};
  return {x: interpolate(f, fr, CURSOR.map((c) => c[1]), o), y: interpolate(f, fr, CURSOR.map((c) => c[2]), o)};
};

export const WorkshopFragmentScene: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 246) return null;
  const bp = bombP(f);
  // A: main card rises from the lower edge with a flattening 2.5D tilt (8.2–8.6 s = f246–f258)
  const aIn = ease(f, 246, 258, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const a = camTrack(f, A_X, A_Y, 1.0, 258);
  const aTiltX = interpolate(aIn, [0, 1], [32, 0]);
  // bomb: the teal panel (dominant visual) accelerates to frame centre, ×6.6, tilt flattens
  const sA = a.k * interpolate(bp, [0, 1], [1, 6.6]);
  const pivX = TEAL.x + TEAL.w / 2;
  const pivY = TEAL.y + TEAL.h / 2;
  const cx = interpolate(bp, [0, 1], [a.x + pivX * a.k, W / 2]);
  const cy = interpolate(bp, [0, 1], [a.y + pivY * a.k + (1 - aIn) * 520, H / 2]);
  const content = 1 - ease(f, 288, 293, 0, 1, Easing.in(Easing.quad));
  // B: module 01 floats into the upper-left of A (8.6–9.1 s = f258–f273), different speed/depth
  const bIn = ease(f, 258, 271, 0, 1, Easing.bezier(0.22, 1, 0.36, 1));
  const b = camTrack(f, B_X, B_Y, 1.25, 271);
  // C: module 03 only peeks in from the right edge, later (f276–f286)
  const cIn = ease(f, 276, 286, 0, 1, Easing.bezier(0.22, 1, 0.36, 1));
  const c = camTrack(f, C_X, C_Y, 1.35, 286);
  const away = (dir: number) => ({x: dir * bp * 620, y: bp * 260, s: 1 + bp * 0.6, o: 1 - ease(f, 288, 292, 0, 1)});
  const ab = away(-1);
  const ac = away(1);
  const cur = cursorAt(f);
  const press = f >= 283 && f < 285 ? 0.84 : 1;
  const q = ease(f, 284, 288, 0, 1, Easing.bezier(0.3, 1.4, 0.5, 1));
  return (
    <AbsoluteFill>
      {/* connectors (behind cards) */}
      <div style={{opacity: content}}>
        <GoldConnector W={W} H={H} d={`M ${b.x + 300 * b.k} ${b.y + 120 * b.k} C ${b.x + 360 * b.k} ${b.y + 170 * b.k}, ${a.x + 260 * a.k} ${a.y - 40}, ${a.x + 300 * a.k} ${a.y + 4}`} draw={ease(f, 266, 274, 0, 1)} end={[a.x + 300 * a.k, a.y + 4]} />
        <GoldConnector W={W} H={H} d={`M ${a.x + 520 * a.k} ${a.y + 410 * a.k} C ${a.x + 540 * a.k} ${a.y + 460 * a.k}, ${c.x - 40} ${c.y + 90}, ${c.x + 6} ${c.y + 70}`} draw={ease(f, 279, 286, 0, 1)} end={[c.x + 6, c.y + 70]} />
      </div>
      {/* A — main workshop card */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(${cx - pivX * sA}px, ${cy - pivY * sA}px) scale(${sA}) perspective(1400px) rotateX(${aTiltX * (1 - bp)}deg)`,
          opacity: Math.min(1, aIn * 1.6),
        }}
      >
        <MainWorkshopCard state="poor" contentOpacity={content} wireIn={ease(f, 254, 262, 0, 1)} tilt={1 - bp} />
      </div>
      {/* B — module 01 */}
      {f >= 258 && (
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${b.x - (1 - bIn) * 260 + ab.x}px, ${b.y - (1 - bIn) * 90 + ab.y}px) rotate(${-8 * (1 - bIn) - 3}deg) scale(${b.k * (0.9 + 0.1 * bIn) * ab.s})`, opacity: Math.min(1, bIn * 1.5) * ab.o}}>
          <ModuleFloatCard kind="01" />
          <div style={{position: 'absolute', right: -40, top: -46}}>
            <Ticks p={ease(f, 268, 274, 0, 1)} rot={20} />
          </div>
        </div>
      )}
      {/* C — module 03, peeking from the right edge */}
      {f >= 276 && (
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${c.x + (1 - cIn) * 260 + ac.x}px, ${c.y + ac.y}px) rotate(4deg) scale(${c.k * ac.s})`, opacity: Math.min(1, cIn * 1.5) * ac.o}}>
          <ModuleFloatCard kind="03" />
        </div>
      )}
      {/* D — failed interaction cue */}
      {f >= 272 && (
        <div style={{position: 'absolute', left: cur.x, top: cur.y, opacity: ease(f, 272, 274, 0, 1) * content}}>
          <FragCursor press={press} />
          <div style={{position: 'absolute', left: 50, top: 34, fontFamily: 'Instrument Sans UNL', fontWeight: 700, fontSize: 38, color: '#EBBB6E', transform: `scale(${q})`, transformOrigin: 'left bottom', textShadow: '0 3px 8px rgba(9,41,47,0.5)'}}>?</div>
        </div>
      )}
      {/* gold edge sweep (TDC teal/gold system), still travelling on the last frame */}
      {f >= 292 && (() => {
        const g = interpolate(f, [292, 299], [0, 1], K);
        return (
          <div
            style={{
              position: 'absolute',
              left: -200,
              right: -200,
              top: interpolate(g, [0, 1], [H * 1.02, H * 0.18]),
              height: interpolate(g, [0, 1], [14, 46]),
              background: `linear-gradient(180deg, rgba(235,187,110,0) 0%, #EBBB6E 55%, ${C.orange2} 100%)`,
              transform: 'rotate(-7deg)',
              filter: `blur(${1.5 + g * 3}px)`,
              boxShadow: '0 -30px 60px rgba(235,187,110,0.25)',
            }}
          />
        );
      })()}
    </AbsoluteFill>
  );
};
