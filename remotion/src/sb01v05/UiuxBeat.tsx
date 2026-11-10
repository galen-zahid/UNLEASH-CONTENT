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
import {Annotation, CTA_BOX, CursorGlyph, InfoCard, ModuleRow, PANEL, PanelSurface, ROW, TITLE_BOX} from './Dashboard';

const K = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const outE = Easing.bezier(0.2, 0.8, 0.2, 1);
const inE = Easing.bezier(0.55, 0, 0.9, 0.35);
const ease = (f: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number = outE) => interpolate(f, [a, b], [v0, v1], {...K, easing: e});
const WD = CUES.words;

const S_KALAU = fitStr('sans700', 'kalau', 0.2);
const S_UIUX = fitStr('serif', 'UI/UX', 0.67); // ref "Busier" spans 0.18–0.85 W
const UI_TOP = 0.655 * H - S_UIUX * 0.55; // v05: raised so the tidy dashboard fits fully below the copy
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

// ======================= DASHBOARD (poor state, v05 tidy redesign) =======================
const D0 = 251; // entrance start (after the hero settles f247)
const PX = (W - PANEL.w) / 2; // 64
const PY = UI_TOP + S_UIUX * 1.02 + 62 + 34; // below the "nggak dipikirin" label with a 34 px gap

/** camera tracking about the face point; depth > 1 = nearer layer (parallax) */
const track = (f: number, x: number, y: number, depth: number) => {
  const cam = CAM_E(f);
  const fs = faceScreen(f);
  const k = 1 + (cam - 1) * depth;
  const drift = -Math.max(0, f - D0) * 0.35 * depth;
  return {x: fs.cx + (x - fs.cx) * k, y: fs.cy + (y - fs.cy) * k + drift, k};
};

// cursor path (panel-local): enters bottom-right, stops on the weak title, drifts to the faint CTA, hesitates
const CURSOR: [number, number, number][] = [
  [262, 980, 470], [268, 300, 150], [272, 310, 156], [277, 140, 340], [280, 150, 334], [283, 132, 344], [287, 145, 338],
];
const cursorAt = (f: number) => {
  const fr = CURSOR.map((c) => c[0]);
  const e = Easing.bezier(0.45, 0, 0.25, 1);
  const o = {...K, easing: e};
  return {x: interpolate(f, fr, CURSOR.map((c) => c[1]), o), y: interpolate(f, fr, CURSOR.map((c) => c[2]), o)};
};

export const DashboardPoor: React.FC = () => {
  const f = useCurrentFrame();
  if (f < D0) return null;
  const bp = bombP(f);
  const enter = ease(f, D0, D0 + 10, 0, 1);
  const p = track(f, PX, PY, 1);
  // bomb-in: the panel (dominant visual) accelerates into camera — centre → frame centre, ×5.6 (covers 1080×1920)
  const cx0 = p.x + (PANEL.w / 2) * p.k;
  const cy0 = p.y + (PANEL.h / 2) * p.k + (1 - enter) * 140;
  const s = p.k * (0.96 + 0.04 * enter) * interpolate(bp, [0, 1], [1, 5.6]);
  const cx = interpolate(bp, [0, 1], [cx0, W / 2]);
  const cy = interpolate(bp, [0, 1], [cy0, H / 2]);
  const content = 1 - ease(f, 288, 293, 0, 1, Easing.in(Easing.quad)); // contents clear early so the frame ends on the teal surface
  const cur = cursorAt(f);
  const press = (f >= 271 && f < 273) || (f >= 281 && f < 283) ? 0.86 : 1;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: PANEL.w,
          height: PANEL.h,
          transformOrigin: '0 0',
          transform: `translate(${cx - (PANEL.w / 2) * s}px, ${cy - (PANEL.h / 2) * s}px) scale(${s})`,
          opacity: Math.min(1, enter * 1.8),
        }}
      >
        {/* Layer A */}
        <PanelSurface contentOpacity={content} />
        <div style={{opacity: content * ease(f, D0 + 3, D0 + 9, 0, 1), transform: `translateY(${ease(f, D0 + 3, D0 + 11, 24, 0)}px)`}}>
          <InfoCard state="poor" />
        </div>
        {/* Layer B: rows slide in from the right, staggered */}
        {[0, 1, 2].map((i) => {
          const r = ROW(i);
          const a = D0 + 5 + i * 3;
          return (
            <div key={i} style={{position: 'absolute', left: r.x, top: r.y, opacity: content * ease(f, a, a + 5, 0, 1), transform: `translateX(${ease(f, a, a + 9, 70, 0)}px)`}}>
              <ModuleRow i={i} />
            </div>
          );
        })}
        {/* Layer C: critique annotations */}
        <div style={{opacity: content}}>
          {f >= 266 && <Annotation box={TITLE_BOX} draw={ease(f, 266, 272, 0, 1)} badge={ease(f, 270, 274, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1))} />}
          {f >= 274 && <Annotation box={CTA_BOX} draw={ease(f, 274, 280, 0, 1)} badge={ease(f, 278, 282, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1))} />}
          {f >= 262 && (
            <div style={{position: 'absolute', left: cur.x, top: cur.y, opacity: ease(f, 262, 264, 0, 1)}}>
              <CursorGlyph press={press} />
            </div>
          )}
        </div>
      </div>
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
