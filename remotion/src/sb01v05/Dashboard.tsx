// WorkshopLearningDashboard v05 — editorial, floating learning interface for a FICTIONAL UI/UX workshop
// (visual metaphor only: no stats, prices, instructors, certificates). Native, editable React/CSS/SVG.
//
// v05 redesign after user review ("ga rapi sama sekali"): ONE tidy panel on a clear 2-column grid.
// The 'poor' state keeps the layout clean and expresses the UX problems as design-critique annotations:
//   · weak hierarchy  — title smaller/lighter than the description
//   · weak CTA        — small low-contrast ghost button
// marked with dashed orange outlines + "?" badges, and a cursor that hesitates between them.
// The 'polished' state (SB02, not rendered here) uses the same grid with fixed hierarchy, a solid CTA and no
// annotations, so POOR → WIREFRAME → POLISHED can be animated later on the same geometry.
import React from 'react';
import {C, FONT_SANS, FONT_SERIF, ORANGE_SIMPLE} from '../lib/tokens';
import {INK, IVORY} from './layout';

export type DashState = 'poor' | 'polished';

export const COPY = {
  label: 'DESIGN WORKSHOP',
  title: 'Learn. Design. Build.',
  desc: 'Tingkatkan skill UI/UX lewat praktik desain.',
  modules: ['01 — UI/UX Basics', '02 — Wireframing', '03 — Interactive Prototype'],
  cta: 'Mulai Belajar',
  nav: ['Beranda', 'Modul', 'Praktik'],
};

// ---- grid (panel-local px). Panel 952 × 404; 32 px outer margin, 24 px gutter, 2 columns.
export const PANEL = {w: 952, h: 404, r: 32};
export const G = {
  pad: 32,
  headerH: 52,
  top: 100, // content top (below header)
  colL: {x: 32, w: 420},
  colR: {x: 476, w: 444},
  rowH: 82,
  rowGap: 14,
};
export const INFO = {x: G.colL.x, y: G.top, w: G.colL.w, h: 3 * G.rowH + 2 * G.rowGap}; // 274 tall
export const ROW = (i: number) => ({x: G.colR.x, y: G.top + i * (G.rowH + G.rowGap), w: G.colR.w, h: G.rowH});

type StateStyle = {titleSize: number; titleOpacity: number; descSize: number; descWeight: number; cta: 'ghost' | 'solid'; annotations: boolean};
export const STATES: Record<DashState, StateStyle> = {
  poor: {titleSize: 28, titleOpacity: 0.55, descSize: 31, descWeight: 600, cta: 'ghost', annotations: true},
  polished: {titleSize: 46, titleOpacity: 1, descSize: 24, descWeight: 500, cta: 'solid', annotations: false},
};

// panel-local positions of the elements the annotations point at
export const TITLE_BOX = {x: INFO.x + 26, y: INFO.y + 24, w: 330, h: 44};
export const CTA_BOX = {x: INFO.x + 26, y: INFO.y + INFO.h - 66, w: 160, h: 40};

// ---------- icons (native SVG, one family: 46 px rounded square, 3 px ink strokes) ----------
export const ModuleIcon: React.FC<{i: number}> = ({i}) => (
  <svg width={46} height={46} viewBox="0 0 46 46">
    <rect x="0" y="0" width="46" height="46" rx="12" fill={[C.orange1, C.cyan2, '#EBBB6E'][i]} />
    <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {i === 0 && (
        <>
          <circle cx="16" cy="17" r="6" />
          <rect x="25" y="11" width="11" height="11" rx="2.5" />
          <path d="M11 33 H35" />
        </>
      )}
      {i === 1 && (
        <>
          <rect x="10" y="10" width="26" height="26" rx="3" />
          <path d="M10 19 H36 M20 19 V36" />
        </>
      )}
      {i === 2 && (
        <>
          <rect x="9" y="10" width="20" height="15" rx="3" />
          <path d="M26 23 V38 L30 34 L33 40 L36 38.5 L33 33 H38 Z" fill={INK} stroke="none" />
        </>
      )}
    </g>
  </svg>
);

export const CursorGlyph: React.FC<{press?: number}> = ({press = 1}) => (
  <svg width={52} height={65} viewBox="0 0 28 35" style={{transform: `scale(${press})`, transformOrigin: '4px 4px', filter: 'drop-shadow(0 6px 6px rgba(9,41,47,0.45))'}}>
    <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill={IVORY} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

// ---------- Layer A: panel surface + header ----------
export const PanelSurface: React.FC<{contentOpacity?: number}> = ({contentOpacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: PANEL.r,
      background: `linear-gradient(165deg, #12505B 0%, ${INK} 62%)`,
      boxShadow: '0 30px 60px rgba(9,41,47,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}
  >
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg, #EBBB6E, ${C.orange2})`}} />
    <div style={{opacity: contentOpacity}}>
      <div style={{position: 'absolute', left: G.pad, top: 24, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 17, letterSpacing: 3.2, color: C.cyan3}}>{COPY.label}</div>
      <div style={{position: 'absolute', right: G.pad, top: 18, display: 'flex', gap: 8}}>
        {COPY.nav.map((n, i) => (
          <div
            key={n}
            style={{
              height: 32,
              padding: '0 16px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: 16,
              color: i === 1 ? INK : 'rgba(247,244,237,0.75)',
              background: i === 1 ? IVORY : 'rgba(247,244,237,0.08)',
            }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ---------- Layer A: info card (title / description / CTA) ----------
export const InfoCard: React.FC<{state: DashState}> = ({state}) => {
  const st = STATES[state];
  return (
    <div style={{position: 'absolute', left: INFO.x, top: INFO.y, width: INFO.w, height: INFO.h, borderRadius: 22, background: IVORY, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 26, top: 26, fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: st.titleSize, color: INK, opacity: st.titleOpacity, whiteSpace: 'nowrap'}}>
        {COPY.title}
      </div>
      <div style={{position: 'absolute', left: 26, top: 82, width: INFO.w - 52, fontFamily: FONT_SANS, fontWeight: st.descWeight, fontSize: st.descSize, lineHeight: 1.18, color: INK}}>{COPY.desc}</div>
      <div
        style={{
          position: 'absolute',
          left: CTA_BOX.x - INFO.x,
          top: CTA_BOX.y - INFO.y,
          width: CTA_BOX.w,
          height: CTA_BOX.h,
          borderRadius: CTA_BOX.h / 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_SANS,
          fontWeight: 700,
          fontSize: st.cta === 'solid' ? 20 : 17,
          color: st.cta === 'solid' ? INK : 'rgba(24,98,111,0.55)',
          background: st.cta === 'solid' ? ORANGE_SIMPLE : 'transparent',
          border: st.cta === 'solid' ? 'none' : '1.5px solid rgba(24,98,111,0.3)',
        }}
      >
        {COPY.cta}
      </div>
    </div>
  );
};

// ---------- Layer B: module row ----------
export const ModuleRow: React.FC<{i: number}> = ({i}) => {
  const r = ROW(i);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: r.w,
        height: r.h,
        borderRadius: 20,
        background: IVORY,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 18px',
        boxSizing: 'border-box',
        boxShadow: '0 10px 20px rgba(9,41,47,0.28)',
      }}
    >
      <ModuleIcon i={i} />
      <div style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: 23, color: INK, whiteSpace: 'nowrap'}}>{COPY.modules[i]}</div>
    </div>
  );
};

// ---------- Layer C: critique annotation (dashed outline + "?" badge) ----------
export const Annotation: React.FC<{box: {x: number; y: number; w: number; h: number}; draw: number; badge: number}> = ({box, draw, badge}) => {
  const m = 8;
  const w = box.w + 2 * m;
  const h = box.h + 2 * m;
  return (
    <div style={{position: 'absolute', left: box.x - m, top: box.y - m, width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', overflow: 'visible'}}>
        <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={14} fill="none" stroke={C.orange1} strokeWidth={3} strokeDasharray="9 7" pathLength={400} strokeDashoffset={(1 - draw) * 400} />
      </svg>
      <div
        style={{
          position: 'absolute',
          right: -18,
          top: -18,
          width: 36,
          height: 36,
          borderRadius: 18,
          background: C.orange1,
          border: `3px solid ${INK}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_SANS,
          fontWeight: 700,
          fontSize: 22,
          color: INK,
          transform: `scale(${badge})`,
        }}
      >
        ?
      </div>
    </div>
  );
};
