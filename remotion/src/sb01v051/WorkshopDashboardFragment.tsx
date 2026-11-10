// WorkshopDashboardFragment (SB01 V05.1) — compact, fragmented 2.5D learning-workshop interface for a FICTIONAL
// UI/UX workshop (visual metaphor; no stats, prices, instructors, certificates). Component-design guide:
// user-approved concept image (white bezel, deep-teal panel, gold/orange accents, 2.5D cards, dashed gold
// connectors). Rebuilt as independent React/CSS/SVG layers — never a flattened image.
//
// SB01 shows the 'poor' state: weak CTA (faint, pushed low), inconsistent label/title spacing, one misaligned
// element (the wireframe window breaks out of the grid), cursor fails to find the primary action.
// 'polished' (SB02, NOT rendered here) re-uses the same parts with corrected props — see FRAGMENT_STATES.
import React from 'react';
import {C, FONT_SANS, FONT_SERIF} from '../lib/tokens';
import {INK} from './layout';

export type FragState = 'poor' | 'polished';
export const FRAG_COPY = {
  label: 'DESIGN WORKSHOP',
  title: 'Learn. Design. Build.',
  sub: 'Tingkatkan skill UI/UX.',
  cta: 'Mulai Belajar',
  module01: ['01 —', 'UI/UX Basics'],
  module03: ['03 —', 'Interactive Prototype'],
};

const GOLD = '#EBBB6E';
const WHITE = '#FFFFFF';
const EDGE = '#C9D4D6'; // 2.5D card thickness (cool light grey, not cream)

// Main card geometry (local px). Bezel 18 px around a deep-teal panel.
export const MAIN = {w: 640, h: 410, bezel: 18, r: 34};
export const TEAL = {x: MAIN.bezel, y: 64, w: MAIN.w - 2 * MAIN.bezel, h: MAIN.h - 64 - MAIN.bezel};

type S = {labelX: number; titleX: number; titleY: number; ctaX: number; ctaY: number; ctaSolid: boolean; wireX: number; wireY: number; wireRot: number};
export const FRAGMENT_STATES: Record<FragState, S> = {
  // poor: label/title on different left edges (inconsistent spacing), CTA faint and pushed to the bottom edge,
  // wireframe window pushed past the card's right edge (misaligned element) — kept clear of all text
  poor: {labelX: 34, titleX: 22, titleY: 70, ctaX: 30, ctaY: 254, ctaSolid: false, wireX: 424, wireY: 152, wireRot: 7},
  polished: {labelX: 34, titleX: 34, titleY: 66, ctaX: 34, ctaY: 214, ctaSolid: true, wireX: 360, wireY: 96, wireRot: 0},
};

/** 2.5D wrapper: perspective tilt + extruded bottom/right edge + soft cast shadow */
export const Card25D: React.FC<{w: number; h: number; r: number; rx?: number; ry?: number; children: React.ReactNode; depth?: number}> = ({
  w,
  h,
  r,
  rx = 6,
  ry = -9,
  depth = 10,
  children,
}) => (
  <div style={{width: w, height: h, transform: `perspective(1600px) rotateX(${rx}deg) rotateY(${ry}deg)`, transformStyle: 'preserve-3d'}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: r,
        background: WHITE,
        boxShadow: `${depth * 0.4}px ${depth}px 0 ${EDGE}, ${depth * 1.6}px ${depth * 3}px ${depth * 4}px rgba(9,41,47,0.38)`,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  </div>
);

// ---------- icons ----------
export const BookIcon: React.FC = () => (
  <svg width={70} height={70} viewBox="0 0 70 70">
    <rect width="70" height="70" rx="18" fill="#DCE8EA" />
    <g fill="none" stroke={C.teal} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M14 22 C22 19 29 20 35 25 C41 20 48 19 56 22 V50 C48 47 41 48 35 53 C29 48 22 47 14 50 Z" />
      <path d="M35 25 V53" />
    </g>
  </svg>
);
export const ProtoIcon: React.FC = () => (
  <svg width={70} height={70} viewBox="0 0 70 70">
    <rect width="70" height="70" rx="18" fill="#DCE8EA" />
    <g stroke={C.teal} strokeWidth="4" strokeLinecap="round" fill="none">
      <path d="M22 18 L25 23 M16 28 L22 29 M30 15 L30 21" />
    </g>
    <path d="M30 28 L30 54 L36 48 L41 58 L46 55.5 L41 46 L49 46 Z" fill={WHITE} stroke={C.teal} strokeWidth="3.5" strokeLinejoin="round" />
  </svg>
);
export const FragCursor: React.FC<{press?: number}> = ({press = 1}) => (
  <svg width={56} height={70} viewBox="0 0 28 35" style={{transform: `scale(${press})`, transformOrigin: '4px 4px', filter: 'drop-shadow(0 6px 6px rgba(9,41,47,0.45))'}}>
    <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill={WHITE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

/** small gold tick burst (decorative accent from the concept, used sparingly) */
export const Ticks: React.FC<{p: number; rot?: number}> = ({p, rot = 0}) => (
  <svg width={60} height={60} viewBox="-30 -30 60 60" style={{transform: `rotate(${rot}deg)`, overflow: 'visible'}}>
    {[-40, 0, 40].map((a, i) => {
      const rad = ((a - 90) * Math.PI) / 180;
      const r0 = 10 + 6 * p;
      const r1 = r0 + 14 * p;
      return <line key={i} x1={Math.cos(rad) * r0} y1={Math.sin(rad) * r0} x2={Math.cos(rad) * r1} y2={Math.sin(rad) * r1} stroke={GOLD} strokeWidth={5} strokeLinecap="round" opacity={Math.min(1, p * 2)} />;
    })}
  </svg>
);

// ---------- A. main workshop card ----------
export const MainWorkshopCard: React.FC<{state: FragState; contentOpacity?: number; wireIn?: number; tilt?: number}> = ({state, contentOpacity = 1, wireIn = 1, tilt = 1}) => {
  const s = FRAGMENT_STATES[state];
  return (
    <Card25D w={MAIN.w} h={MAIN.h} r={MAIN.r} rx={6 * tilt} ry={-9 * tilt}>
      {/* bezel header */}
      <div style={{position: 'absolute', left: 28, top: 18, display: 'flex', alignItems: 'center', gap: 10, opacity: contentOpacity}}>
        <svg width={24} height={24} viewBox="-12 -12 24 24">
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1={0} y1={-10} x2={0} y2={10} stroke={C.orange1} strokeWidth={3.4} strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
        </svg>
        {/* neutral chrome dots — no brand wordmark: this is a fictional workshop UI, not a real platform */}
        {[0, 1].map((i) => (
          <div key={i} style={{width: 46 - i * 18, height: 10, borderRadius: 5, background: '#DCE5E7'}} />
        ))}
      </div>
      {/* teal panel */}
      <div style={{position: 'absolute', left: TEAL.x, top: TEAL.y, width: TEAL.w, height: TEAL.h, borderRadius: 24, background: `linear-gradient(155deg, ${C.teal} 0%, #12505B 55%, ${INK} 100%)`, overflow: 'hidden'}}>
        <div style={{opacity: contentOpacity}}>
          {/* orange blob behind the wireframe */}
          <div style={{position: 'absolute', right: -60, bottom: -70, width: 300, height: 260, borderRadius: '48% 52% 40% 60%', background: `linear-gradient(160deg, ${C.orange2}, ${C.orange1})`, opacity: 0.95}} />
          <div style={{position: 'absolute', left: s.labelX, top: 28, fontFamily: FONT_SANS, fontWeight: 700, fontSize: 18, letterSpacing: 4, color: GOLD}}>{FRAG_COPY.label}</div>
          <div style={{position: 'absolute', left: s.titleX, top: s.titleY, fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 46, color: WHITE, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
            {FRAG_COPY.title}
          </div>
          <div style={{position: 'absolute', left: s.titleX + 2, top: s.titleY + 66, fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, color: 'rgba(255,255,255,0.86)'}}>{FRAG_COPY.sub}</div>
          {/* CTA — poor: faint, low, low contrast */}
          <div
            style={{
              position: 'absolute',
              left: s.ctaX,
              top: s.ctaY,
              height: 42,
              padding: '0 20px',
              borderRadius: 21,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 19,
              color: s.ctaSolid ? INK : 'rgba(255,255,255,0.42)',
              background: s.ctaSolid ? `linear-gradient(180deg, ${C.orange2}, ${C.orange1})` : 'rgba(255,255,255,0.10)',
            }}
          >
            {FRAG_COPY.cta}
            <svg width={18} height={12} viewBox="0 0 18 12">
              <path d="M1 6 H16 M11 1 L16 6 L11 11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      {/* wireframe window (the misaligned element in 'poor': breaks out of the panel grid) */}
      <div
        style={{
          position: 'absolute',
          left: s.wireX,
          top: TEAL.y + s.wireY,
          width: 230,
          height: 160,
          borderRadius: 14,
          background: '#F2F6F7',
          border: `3px solid ${WHITE}`,
          boxShadow: '6px 10px 0 #B9C7CA, 10px 22px 30px rgba(9,41,47,0.35)',
          transform: `rotate(${s.wireRot}deg) translateY(${(1 - wireIn) * 40}px)`,
          opacity: contentOpacity * wireIn,
          overflow: 'hidden',
        }}
      >
        <div style={{height: 26, background: C.teal, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 10}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 8, height: 8, borderRadius: 4, background: GOLD}} />
          ))}
        </div>
        <svg width={224} height={130} viewBox="0 0 224 130" style={{position: 'absolute', left: 0, top: 26}}>
          <rect x="12" y="12" width="78" height="56" rx="6" fill="#DCE5E7" />
          <path d="M12 12 L90 68 M90 12 L12 68" stroke="#B8C6C9" strokeWidth="2" />
          <rect x="102" y="12" width="108" height="16" rx="5" fill="#DCE5E7" />
          <rect x="102" y="36" width="108" height="32" rx="6" fill="#DCE5E7" />
          <rect x="12" y="80" width="198" height="18" rx="5" fill="#DCE5E7" />
        </svg>
      </div>
    </Card25D>
  );
};

// ---------- B / C. floating module card ----------
export const MODULE_CARD = {w: 340, h: 120, r: 26};
export const ModuleFloatCard: React.FC<{kind: '01' | '03'}> = ({kind}) => {
  const [num, label] = kind === '01' ? FRAG_COPY.module01 : FRAG_COPY.module03;
  return (
    <Card25D w={MODULE_CARD.w} h={MODULE_CARD.h} r={MODULE_CARD.r} rx={4} ry={kind === '01' ? 10 : -10} depth={8}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px'}}>
        {kind === '01' ? <BookIcon /> : <ProtoIcon />}
        <div style={{fontFamily: FONT_SANS, fontWeight: 700, color: INK, lineHeight: 1.15}}>
          <div style={{fontSize: 24}}>{num}</div>
          <div style={{fontSize: kind === '01' ? 27 : 24, whiteSpace: 'nowrap'}}>{label}</div>
        </div>
      </div>
    </Card25D>
  );
};

/** dashed gold connector curve (frame coordinates), drawn on with `draw` 0..1 and ending in a gold dot */
export const GoldConnector: React.FC<{d: string; draw: number; end: [number, number]; W: number; H: number}> = ({d, draw, end, W, H}) => {
  // dashed line revealed by a solid mask stroke (dash-offset alone cannot reveal an already dashed path)
  const id = `gc-${Math.round(end[0])}-${Math.round(end[1])}`;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <path d={d} stroke="#fff" strokeWidth={14} fill="none" pathLength={300} strokeDasharray="300 300" strokeDashoffset={(1 - draw) * 300} />
        </mask>
      </defs>
      <path d={d} stroke={GOLD} strokeWidth={4} strokeDasharray="12 10" strokeLinecap="round" fill="none" mask={`url(#${id})`} />
      {draw > 0.95 && <circle cx={end[0]} cy={end[1]} r={7} fill={GOLD} />}
    </svg>
  );
};
