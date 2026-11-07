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
import {Box, CursorGlyph, LAYOUTS, MainPanel, ModuleCard, NavPill, cursorAt} from './Dashboard';

const K = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const outE = Easing.bezier(0.2, 0.8, 0.2, 1);
const inE = Easing.bezier(0.55, 0, 0.9, 0.35);
const ease = (f: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number = outE) => interpolate(f, [a, b], [v0, v1], {...K, easing: e});
const WD = CUES.words;

const S_KALAU = fitStr('sans700', 'kalau', 0.2);
const S_UIUX = fitStr('serif', 'UI/UX', 0.67); // ref "Busier" spans 0.18–0.85 W
const UI_TOP = 0.7 * H - S_UIUX * 0.55;
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
            top: 0.69 * H,
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

// ======================= DASHBOARD (poor state) =======================
const D0 = 251; // dashboard entrance start (after the hero settles f247)

/** per-layer world transform: entrance from below/left, parallax drift by depth, camera tracking, bomb exit */
const layerTf = (f: number, b: Box, delay: number, fromX: number, kind: 'panel' | 'other') => {
  const cam = CAM_E(f);
  const fs = faceScreen(f);
  const enter = ease(f, D0 + delay, D0 + delay + 9, 0, 1);
  const drift = -(f - D0) * 0.55 * b.depth; // nearer layers rise faster → parallax
  const bp = bombP(f);
  // camera tracking (scale about the face point, nearer layers exaggerated)
  const camK = 1 + (cam - 1) * b.depth;
  let x = fs.cx + (b.x - fs.cx) * camK + fromX * (1 - enter);
  let y = fs.cy + (b.y - fs.cy) * camK + drift + 520 * (1 - enter);
  let s = camK * (0.86 + 0.14 * enter);
  let rot = b.rot + (1 - enter) * (kind === 'panel' ? 8 : -10);
  let op = Math.min(1, enter * 1.6);
  if (kind === 'panel') {
    // dominant visual accelerates into camera. Pivot = the panel's deep-teal lower area (0.5 w, 0.8 h), driven
    // to frame centre while scaling ×9.5, so the frame ends on the panel's teal surface with its gold edge
    // passing through (TDC teal/gold system) — not on the ivory text strip.
    const px = 0.5 * b.w;
    const py = 0.74 * b.h; // below-pivot extent 0.26·400·9.5 = 988 px > 960 → full cover; ivory strip ends 1140 px above → off-frame
    const sx0 = x + px * s;
    const sy0 = y + py * s;
    const tcx = interpolate(bp, [0, 1], [sx0, W / 2]);
    const tcy = interpolate(bp, [0, 1], [sy0, H / 2]);
    s = s * interpolate(bp, [0, 1], [1, 9.5]);
    rot = rot * (1 - bp);
    x = tcx - px * s;
    y = tcy - py * s;
  } else {
    // other layers are thrown outward away from the panel and fade (directional)
    const dirX = b.x + b.w / 2 < W / 2 ? -1 : 1;
    x += dirX * bp * 520;
    y += bp * 380;
    s *= 1 + bp * 0.5;
    op *= 1 - bp;
  }
  return {position: 'absolute' as const, left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`, opacity: op};
};

export const DashboardPoor: React.FC = () => {
  const f = useCurrentFrame();
  if (f < D0) return null;
  const L = LAYOUTS.poor;
  const lf = f - (D0 + 10);
  const cur = cursorAt(L.cursorPath, lf);
  const conn = ease(f, D0 + 14, D0 + 22, 1, 0);
  const cam = CAM_E(f);
  const bp = bombP(f);
  return (
    <AbsoluteFill>
      {/* connectors (Layer C): dashed, deliberately not reaching their targets (disconnected navigation) */}
      <svg width={W} height={H} style={{position: 'absolute', opacity: (1 - bp) * ease(f, D0 + 12, D0 + 14, 0, 1)}}>
        {[
          'M 360 1640 C 420 1610, 440 1600, 452 1618',
          'M 455 1722 C 500 1730, 520 1760, 540 1760',
          'M 470 1570 C 520 1540, 560 1545, 600 1548',
        ].map((d, i) => (
          <path key={i} d={d} stroke={C.cyan3} strokeWidth={4} strokeDasharray="10 9" fill="none" pathLength={1} strokeDashoffset={conn} transform={`translate(0 ${-(f - D0) * 0.8}) scale(${cam})`} style={{transformOrigin: '540px 900px'}} />
        ))}
      </svg>
      {/* Layer A */}
      <div style={layerTf(f, L.panel, 0, 260, 'panel')}>
        <MainPanel state="poor" box={L.panel} />
      </div>
      {/* Layer B */}
      {L.modules.map((b, i) => (
        <div key={i} style={layerTf(f, b, 3 + i * 3, -360, 'other')}>
          <ModuleCard i={i} box={b} state="poor" />
        </div>
      ))}
      {/* Layer C: nav fragments */}
      {L.nav.map((b, i) => (
        <div key={i} style={layerTf(f, b, 9 + i * 2, i === 2 ? 200 : -200, 'other')}>
          <NavPill i={i} box={b} />
        </div>
      ))}
      {/* Layer C: hesitant cursor (dwells, reverses) */}
      {lf >= 0 && (
        <div style={{position: 'absolute', left: cur.x, top: cur.y - (f - D0) * 0.55 * 2.2, opacity: (1 - bp) * ease(f, D0 + 10, D0 + 12, 0, 1), transform: `scale(${1 + bp * 0.6})`}}>
          <CursorGlyph press={[12, 21, 30].some((k) => lf >= k && lf < k + 2) ? 0.86 : 1} />
        </div>
      )}
      {/* gold edge sweep (TDC teal/gold system): crosses the frame f292→f299 and is still travelling on the
          last frame so SB02 can pick up the motion */}
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
