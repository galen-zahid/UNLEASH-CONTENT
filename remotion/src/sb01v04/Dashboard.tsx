// WorkshopLearningDashboard — editorial, floating, modular learning interface for a FICTIONAL UI/UX workshop.
// Visual metaphor only (no real platform, stats, prices, instructors, certificates). All parts are native,
// editable React/CSS/SVG layers with their own position/scale/rotation/opacity/depth.
//
// States: 'poor' (SB01: weak hierarchy, overlapping modules, inconsistent spacing, weak CTA, disconnected nav,
// hesitant cursor) and 'polished' (SB02 target: grid, clear nav, readable modules, strong CTA). Only the
// 'polished' LAYOUT is defined here; it is not rendered or animated in SB01.
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {C, FONT_SANS, FONT_SERIF, ORANGE_SIMPLE} from '../lib/tokens';
import {INK, IVORY} from './layout';

export type DashState = 'poor' | 'polished';
export type Box = {x: number; y: number; w: number; h: number; rot: number; depth: number};

export const COPY = {
  label: 'DESIGN WORKSHOP',
  title: 'Learn. Design. Build.',
  desc: 'Tingkatkan skill UI/UX lewat praktik desain.',
  modules: ['01 — UI/UX Basics', '02 — Wireframing', '03 — Interactive Prototype'],
  cta: 'Mulai Belajar',
  nav: ['Beranda', 'Modul', 'Praktik'],
};

type Layout = {
  panel: Box;
  modules: Box[];
  nav: Box[];
  cursorPath: [number, number, number][]; // [localFrame, x, y]
  // inner panel typography (poor = inverted hierarchy)
  titleSize: number;
  titleOpacity: number;
  descSize: number;
  labelPos: 'left' | 'right';
  ctaStyle: 'ghost' | 'solid';
};

// Frame-space coordinates (1080×1920). Poor layout lives below the hero line and crosses the bottom edge.
export const LAYOUTS: Record<DashState, Layout> = {
  poor: {
    panel: {x: 470, y: 1585, w: 560, h: 400, rot: 3.5, depth: 1.0},
    modules: [
      {x: 34, y: 1610, w: 330, h: 118, rot: -6, depth: 1.35},
      {x: 118, y: 1668, w: 330, h: 118, rot: 3.5, depth: 1.5},
      {x: 58, y: 1742, w: 330, h: 118, rot: -1.5, depth: 1.65},
    ],
    nav: [
      {x: 360, y: 1545, w: 120, h: 44, rot: 7, depth: 1.9},
      {x: 300, y: 1880, w: 110, h: 44, rot: -9, depth: 2.0},
      {x: 905, y: 1540, w: 120, h: 44, rot: -4, depth: 1.8},
    ],
    cursorPath: [
      [0, 980, 2010], [8, 760, 1760], [12, 742, 1752], [17, 320, 1700], [21, 300, 1712], [26, 520, 1820], [30, 540, 1810], [36, 860, 1900], [44, 610, 1760],
    ],
    titleSize: 30,
    titleOpacity: 0.55,
    descSize: 31,
    labelPos: 'right',
    ctaStyle: 'ghost',
  },
  polished: {
    panel: {x: 90, y: 1060, w: 900, h: 640, rot: 0, depth: 1},
    modules: [
      {x: 130, y: 1420, w: 820, h: 74, rot: 0, depth: 1},
      {x: 130, y: 1510, w: 820, h: 74, rot: 0, depth: 1},
      {x: 130, y: 1600, w: 820, h: 74, rot: 0, depth: 1},
    ],
    nav: [
      {x: 130, y: 1100, w: 140, h: 48, rot: 0, depth: 1},
      {x: 290, y: 1100, w: 140, h: 48, rot: 0, depth: 1},
      {x: 450, y: 1100, w: 140, h: 48, rot: 0, depth: 1},
    ],
    cursorPath: [[0, 900, 1900], [12, 760, 1670]],
    titleSize: 64,
    titleOpacity: 1,
    descSize: 30,
    labelPos: 'left',
    ctaStyle: 'solid',
  },
};

// ---------- icons (native SVG) ----------
const Icon: React.FC<{i: number; size?: number}> = ({i, size = 54}) => (
  <svg width={size} height={size} viewBox="0 0 54 54">
    <rect x="1" y="1" width="52" height="52" rx="14" fill={i === 0 ? C.orange1 : i === 1 ? C.cyan2 : '#EBBB6E'} />
    {i === 0 && (
      <g fill="none" stroke={INK} strokeWidth="3.5">
        <circle cx="19" cy="20" r="7" />
        <rect x="29" y="13" width="13" height="13" rx="3" />
        <path d="M13 40 L41 40" strokeLinecap="round" />
      </g>
    )}
    {i === 1 && (
      <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <rect x="12" y="12" width="30" height="30" rx="3" />
        <path d="M12 22 L42 22 M24 22 L24 42" />
      </g>
    )}
    {i === 2 && (
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round" fill="none">
        <rect x="11" y="11" width="24" height="18" rx="3" />
        <path d="M30 26 L30 44 L35 39 L39 47 L42 45.5 L38 37.5 L44 37.5 Z" fill={C.orange1} />
      </g>
    )}
  </svg>
);

export const CursorGlyph: React.FC<{press?: number}> = ({press = 1}) => (
  <svg width={64} height={80} viewBox="0 0 28 35" style={{transform: `scale(${press})`, transformOrigin: '4px 4px', filter: 'drop-shadow(0 6px 6px rgba(9,41,47,0.45))'}}>
    <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill={IVORY} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

// ---------- Layer A: main workshop panel ----------
export const MainPanel: React.FC<{state: DashState; box: Box}> = ({state, box}) => {
  const L = LAYOUTS[state];
  const poor = state === 'poor';
  return (
    <div
      style={{
        width: box.w,
        height: box.h,
        borderRadius: 30,
        background: `linear-gradient(160deg, #12505B 0%, ${INK} 70%)`,
        borderTop: `8px solid #EBBB6E`,
        boxShadow: '0 28px 50px rgba(9,41,47,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_SANS,
      }}
    >
      {/* ivory info strip */}
      <div style={{position: 'absolute', left: poor ? 26 : 40, top: poor ? 26 : 40, right: poor ? 60 : 40, height: poor ? 150 : 210, borderRadius: 18, background: IVORY}} />
      <div style={{position: 'absolute', top: poor ? 34 : 56, [L.labelPos]: poor ? 80 : 64, fontWeight: 600, fontSize: 18, letterSpacing: 3, color: poor ? 'rgba(24,98,111,0.55)' : C.teal}}>{COPY.label}</div>
      <div style={{position: 'absolute', left: poor ? 46 : 64, top: poor ? 66 : 92, fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: L.titleSize, color: INK, opacity: L.titleOpacity, whiteSpace: 'nowrap'}}>{COPY.title}</div>
      <div style={{position: 'absolute', left: poor ? 46 : 64, top: poor ? 106 : 180, width: poor ? 430 : 700, fontWeight: 500, fontSize: L.descSize, lineHeight: 1.12, color: poor ? 'rgba(9,41,47,0.8)' : INK}}>{COPY.desc}</div>
      {/* CTA: poor = small ghost button overlapping the description edge */}
      <div
        style={{
          position: 'absolute',
          right: poor ? 74 : 64,
          top: poor ? 196 : 270,
          padding: poor ? '6px 14px' : '16px 34px',
          borderRadius: 40,
          fontWeight: 700,
          fontSize: poor ? 17 : 32,
          color: poor ? 'rgba(46,188,213,0.7)' : INK,
          border: poor ? '1.5px solid rgba(46,188,213,0.45)' : 'none',
          background: poor ? 'transparent' : ORANGE_SIMPLE,
        }}
      >
        {COPY.cta}
      </div>
      {/* fragment rows (component fragments) with inconsistent spacing in the poor state */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: poor ? 40 + i * 18 : 64,
            top: poor ? 252 + i * [0, 30, 74][i] : 330 + i * 70,
            width: poor ? [300, 210, 360][i] : 772,
            height: poor ? [18, 26, 14][i] : 48,
            borderRadius: 9,
            background: i === 1 ? 'rgba(46,188,213,0.4)' : 'rgba(247,244,237,0.22)',
          }}
        />
      ))}
    </div>
  );
};

// ---------- Layer B: learning module card ----------
export const ModuleCard: React.FC<{i: number; box: Box; state: DashState}> = ({i, box, state}) => {
  const poor = state === 'poor';
  return (
    <div
      style={{
        width: box.w,
        height: box.h,
        borderRadius: 22,
        background: IVORY,
        border: `3px solid ${INK}`,
        boxShadow: '0 16px 30px rgba(9,41,47,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: poor ? [10, 22, 14][i] : 18,
        padding: poor ? `0 ${[14, 26, 18][i]}px` : '0 22px',
        boxSizing: 'border-box',
        fontFamily: FONT_SANS,
      }}
    >
      <Icon i={i} size={poor ? [54, 46, 58][i] : 54} />
      <div style={{fontWeight: 700, fontSize: poor ? [25, 22, 21][i] : 28, color: INK, whiteSpace: 'nowrap'}}>{COPY.modules[i]}</div>
    </div>
  );
};

// ---------- Layer C: interaction fragments ----------
export const NavPill: React.FC<{i: number; box: Box}> = ({i, box}) => (
  <div
    style={{
      width: box.w,
      height: box.h,
      borderRadius: box.h / 2,
      background: i === 1 ? C.teal : 'rgba(9,41,47,0.85)',
      border: `2px solid ${i === 1 ? C.cyan3 : 'rgba(247,244,237,0.35)'}`,
      color: IVORY,
      fontFamily: FONT_SANS,
      fontWeight: 600,
      fontSize: 19,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {COPY.nav[i]}
  </div>
);

/** cursor position from a [frame,x,y] path with eased segments and dwell (uncertainty in the poor state) */
export const cursorAt = (path: [number, number, number][], lf: number) => {
  const fr = path.map((p) => p[0]);
  const e = Easing.bezier(0.45, 0, 0.25, 1);
  return {
    x: interpolate(lf, fr, path.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e}),
    y: interpolate(lf, fr, path.map((p) => p[2]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e}),
  };
};
