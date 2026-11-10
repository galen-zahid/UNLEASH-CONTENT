// SB02 card components — same visual family as SB01 V05.1 WorkshopDashboardFragment (white 2.5D bezel,
// deep-teal panel, gold/orange accents), React/CSS/SVG only. All copy is fictional workshop UI (no stats,
// prices, percentages, instructors, phone mockups).
import React from 'react';
import {C, FONT_SANS, FONT_SERIF} from '../lib/tokens';
import {INK} from '../sb01v051/layout';
import {BookIcon, Card25D, FRAG_COPY, FRAGMENT_STATES, MAIN, TEAL} from '../sb01v051/WorkshopDashboardFragment';

export const GOLD = '#EBBB6E';
const WHITE = '#FFFFFF';
const SKEL = '#DCE5E7';
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ======================= TRAINING MODULE (P02 closed → P03 open → task → completed) =======================
export const MODULE = {w: 270, h: 330, r: 26};
export const TrainingModule: React.FC<{open: number; task: number; check: number}> = ({open, task, check}) => {
  const cover = open * -168; // hinge on the left edge
  return (
    <div style={{position: 'relative', width: MODULE.w, height: MODULE.h}}>
      {/* task card slides out of the open module to the right/below (P03 f158–168) */}
      {task > 0 && (
        <div style={{position: 'absolute', left: lerp(40, 120, task), top: lerp(150, 262, task), opacity: clamp01(task * 3), zIndex: 3}}>
          <TaskCard check={check} />
        </div>
      )}
      <Card25D w={MODULE.w} h={MODULE.h} r={MODULE.r} rx={4} ry={-8} depth={9}>
        {/* inner page (visible once the cover opens) */}
        <div style={{position: 'absolute', inset: 14, borderRadius: 18, background: '#F3F7F8'}}>
          <div style={{position: 'absolute', left: 22, top: 24, fontFamily: FONT_SANS, fontWeight: 700, fontSize: 17, letterSpacing: 3, color: C.teal}}>MODUL 01</div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 22, top: 66 + i * 30, width: [190, 160, 176][i], height: 12, borderRadius: 6, background: SKEL}} />
          ))}
        </div>
        {/* cover */}
        <div
          style={{
            position: 'absolute',
            inset: 14,
            borderRadius: 18,
            background: `linear-gradient(155deg, ${C.teal} 0%, #12505B 55%, ${INK} 100%)`,
            transformOrigin: '0 50%',
            transform: `perspective(900px) rotateY(${cover}deg)`,
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
          }}
        >
          <div style={{position: 'absolute', right: -50, bottom: -60, width: 190, height: 170, borderRadius: '48% 52% 40% 60%', background: `linear-gradient(160deg, ${C.orange2}, ${C.orange1})`, opacity: 0.9}} />
          <div style={{position: 'absolute', left: 22, top: 24, fontFamily: FONT_SANS, fontWeight: 700, fontSize: 17, letterSpacing: 3, color: GOLD}}>MODUL 01</div>
          <div style={{position: 'absolute', left: 20, top: 66, transform: 'scale(1.15)', transformOrigin: '0 0'}}>
            <BookIcon />
          </div>
          <div style={{position: 'absolute', left: 22, top: 168, fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 38, lineHeight: 1.0, color: WHITE}}>
            Upgrading
            <br />
            Skill
          </div>
        </div>
      </Card25D>
    </div>
  );
};

/** task card with a gold check ring that draws on (check 0..1) */
export const TaskCard: React.FC<{check: number}> = ({check}) => {
  const ring = clamp01(check / 0.6);
  const mark = clamp01((check - 0.55) / 0.45);
  return (
    <Card25D w={250} h={92} r={22} rx={3} ry={-6} depth={7}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px'}}>
        <svg width={52} height={52} viewBox="0 0 52 52">
          <circle cx={26} cy={26} r={21} fill={mark > 0 ? GOLD : 'none'} fillOpacity={mark * 0.25} stroke="#DCE5E7" strokeWidth={4} />
          <circle cx={26} cy={26} r={21} fill="none" stroke={GOLD} strokeWidth={4.5} strokeLinecap="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 - ring * 100} transform="rotate(-90 26 26)" />
          <path d="M16 27 L23 34 L37 19" fill="none" stroke={C.teal} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 - mark * 100} />
        </svg>
        <div style={{fontFamily: FONT_SANS, color: INK, lineHeight: 1.15}}>
          <div style={{fontWeight: 700, fontSize: 24}}>Latihan 01</div>
          <div style={{fontWeight: 600, fontSize: 18, color: mark > 0.5 ? C.teal : '#8BA0A4'}}>{mark > 0.5 ? 'Selesai' : 'Berjalan'}</div>
        </div>
      </div>
    </Card25D>
  );
};

// ======================= LOW-FI DASHBOARD FRAGMENT (P02 seed of the P04 component) =======================
export const LOFI = {w: 280, h: 200, r: 22};
export const LofiFragment: React.FC = () => (
  <Card25D w={LOFI.w} h={LOFI.h} r={LOFI.r} rx={5} ry={9} depth={8}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 30, background: '#E9EFF0', display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 14}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 9, height: 9, borderRadius: 5, background: '#B8C6C9'}} />
      ))}
    </div>
    <svg width={LOFI.w} height={LOFI.h - 30} viewBox={`0 0 ${LOFI.w} ${LOFI.h - 30}`} style={{position: 'absolute', top: 30, left: 0}}>
      <rect x="16" y="16" width="96" height="70" rx="8" fill={SKEL} />
      <path d="M16 16 L112 86 M112 16 L16 86" stroke="#B8C6C9" strokeWidth="2" />
      <rect x="126" y="18" width="136" height="16" rx="6" fill={SKEL} />
      <rect x="126" y="44" width="110" height="12" rx="6" fill={SKEL} />
      <rect x="126" y="64" width="80" height="22" rx="11" fill="none" stroke="#B8C6C9" strokeWidth="2.5" strokeDasharray="6 5" />
      <rect x="16" y="104" width="246" height="14" rx="6" fill={SKEL} />
      <rect x="16" y="128" width="170" height="14" rx="6" fill={SKEL} />
    </svg>
  </Card25D>
);

// ======================= REDESIGN CARD (P04: poor → pull apart → wireframe → polished → prototype) =======================
export type RedesignParams = {
  fix: number; // 0 poor layout → 1 polished layout
  explode: number; // 0..1 parts pulled apart (radial offsets)
  wire: number; // 0..1 parts shown as wireframe skeletons (content fades)
  guides: number; // 0..1 gold layout guides drawn on the panel
  hier: number; // 0..1 hierarchy emphasis (title scale, CTA solid + glow)
  proto: number; // 0..1 prototype: screen slides to the next view after the CTA click
  ripple: number; // 0..1 click ripple on the CTA
  critique: number; // 0..1 gold dashed critique marks on the poor layout
  tilt?: number;
};

const P = FRAGMENT_STATES.poor;
// SB02 QC: the SB01 'polished' preset (never rendered in SB01) put the wireframe over the enlarged title → it sits
// in the right column below the title row instead (x 384, y 150 → clear of title, subline and CTA).
const Q = {...FRAGMENT_STATES.polished, wireX: 384, wireY: 150};

const Part: React.FC<{x: number; y: number; ex: number; ey: number; rot: number; explode: number; wire: number; w: number; h: number; r?: number; children: React.ReactNode}> = ({
  x,
  y,
  ex,
  ey,
  rot,
  explode,
  wire,
  w,
  h,
  r = 8,
  children,
}) => (
  <div style={{position: 'absolute', left: x + ex * explode, top: y + ey * explode, transform: `rotate(${rot * explode}deg)`}}>
    <div style={{opacity: 1 - wire}}>{children}</div>
    {wire > 0 && <div style={{position: 'absolute', left: -4, top: -4, width: w + 8, height: h + 8, borderRadius: r, border: `2.5px dashed ${GOLD}`, background: 'rgba(255,255,255,0.10)', opacity: wire}} />}
  </div>
);

export const RedesignCard: React.FC<RedesignParams> = ({fix, explode, wire, guides, hier, proto, ripple, critique, tilt = 1}) => {
  const L = (k: keyof typeof P) => lerp(P[k] as number, Q[k] as number, fix);
  const ctaSolid = clamp01(hier);
  const titleS = 1 + 0.1 * hier;
  const slide = proto * -TEAL.w; // screen 1 slides out to the left, screen 2 in from the right
  return (
    <Card25D w={MAIN.w} h={MAIN.h} r={MAIN.r} rx={6 * tilt} ry={-9 * tilt}>
      {/* bezel header (neutral chrome; no brand wordmark) */}
      <div style={{position: 'absolute', left: 28, top: 18, display: 'flex', alignItems: 'center', gap: 10}}>
        <svg width={24} height={24} viewBox="-12 -12 24 24">
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1={0} y1={-10} x2={0} y2={10} stroke={C.orange1} strokeWidth={3.4} strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
        </svg>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 46 - i * 18, height: 10, borderRadius: 5, background: '#DCE5E7'}} />
        ))}
        {/* screen dots: 1 → 2 after the click */}
        <div style={{marginLeft: 330, display: 'flex', gap: 8}}>
          {[0, 1].map((i) => (
            <div key={i} style={{width: 10, height: 10, borderRadius: 5, background: (i === 0 ? 1 - proto : proto) > 0.5 ? C.orange1 : '#DCE5E7'}} />
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: TEAL.x, top: TEAL.y, width: TEAL.w, height: TEAL.h, borderRadius: 24, background: `linear-gradient(155deg, ${C.teal} 0%, #12505B 55%, ${INK} 100%)`, overflow: 'hidden'}}>
        {/* ---- screen 1 ---- */}
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${slide}px)`}}>
          <div style={{position: 'absolute', right: -60, bottom: -70, width: 300, height: 260, borderRadius: '48% 52% 40% 60%', background: `linear-gradient(160deg, ${C.orange2}, ${C.orange1})`, opacity: 0.95 * (1 - wire * 0.7)}} />
          {/* layout guides: 2 column edges + baseline rules */}
          {guides > 0 && (
            <svg width={TEAL.w} height={TEAL.h} style={{position: 'absolute', left: 0, top: 0}}>
              {[34, 330, TEAL.w - 34].map((x, i) => (
                <line key={i} x1={x} y1={0} x2={x} y2={TEAL.h * clamp01(guides * 1.4 - i * 0.15)} stroke={GOLD} strokeWidth={2} strokeDasharray="8 7" opacity={0.85} />
              ))}
              {[28, 66, 214].map((y, i) => (
                <line key={i} x1={0} y1={y} x2={TEAL.w * clamp01(guides * 1.4 - 0.2 - i * 0.15)} y2={y} stroke={GOLD} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} />
              ))}
            </svg>
          )}
          <Part x={L('labelX')} y={28} ex={-40} ey={-26} rot={-4} explode={explode} wire={wire} w={240} h={22}>
            <div style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: 18, letterSpacing: 4, color: GOLD, whiteSpace: 'nowrap'}}>{FRAG_COPY.label}</div>
          </Part>
          <Part x={L('titleX')} y={L('titleY')} ex={-30} ey={6} rot={-3} explode={explode} wire={wire} w={420 * titleS} h={56 * titleS}>
            <div style={{fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 46 * titleS, color: WHITE, whiteSpace: 'nowrap', letterSpacing: -0.5}}>{FRAG_COPY.title}</div>
          </Part>
          <Part x={L('titleX') + 2} y={L('titleY') + 66 + 8 * hier} ex={-20} ey={30} rot={2} explode={explode} wire={wire} w={260} h={28}>
            <div style={{fontFamily: FONT_SANS, fontWeight: 500, fontSize: 22, color: 'rgba(255,255,255,0.86)', whiteSpace: 'nowrap'}}>{FRAG_COPY.sub}</div>
          </Part>
          <Part x={L('ctaX')} y={L('ctaY')} ex={-26} ey={44} rot={4} explode={explode} wire={wire} w={200 + 20 * hier} h={42 + 6 * hier} r={24}>
            <div style={{position: 'relative'}}>
              {/* CTA glow (hierarchy) */}
              {hier > 0 && <div style={{position: 'absolute', inset: -14, borderRadius: 40, background: 'rgba(254,152,49,0.45)', filter: 'blur(14px)', opacity: hier}} />}
              <div
                style={{
                  position: 'relative',
                  height: 42 + 6 * hier,
                  padding: `0 ${20 + 6 * hier}px`,
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: FONT_SANS,
                  fontWeight: 700,
                  fontSize: 19 + 3 * hier,
                  whiteSpace: 'nowrap',
                  color: ctaSolid > 0.5 ? INK : `rgba(255,255,255,${0.42 + 0.5 * ctaSolid})`,
                  background: ctaSolid > 0 ? `linear-gradient(180deg, ${C.orange2}, ${C.orange1})` : 'rgba(255,255,255,0.10)',
                  opacity: 1,
                  boxShadow: ctaSolid > 0 ? `0 ${6 * ctaSolid}px ${14 * ctaSolid}px rgba(9,41,47,0.35)` : undefined,
                }}
              >
                {FRAG_COPY.cta}
                <svg width={18} height={12} viewBox="0 0 18 12">
                  <path d="M1 6 H16 M11 1 L16 6 L11 11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {ripple > 0 && ripple < 1 && (
                <div style={{position: 'absolute', left: '50%', top: '50%', width: 60 + 200 * ripple, height: 60 + 200 * ripple, marginLeft: -(30 + 100 * ripple), marginTop: -(30 + 100 * ripple), borderRadius: '50%', border: `3px solid ${WHITE}`, opacity: 1 - ripple}} />
              )}
            </div>
          </Part>
          {/* wireframe window (misaligned in poor → aligned in polished) */}
          <Part x={L('wireX') - TEAL.x} y={L('wireY')} ex={50} ey={-30} rot={6} explode={explode} wire={wire} w={230} h={160} r={14}>
            <div style={{width: 230, height: 160, borderRadius: 14, background: '#F2F6F7', border: `3px solid ${WHITE}`, boxShadow: '6px 10px 0 #B9C7CA, 10px 22px 30px rgba(9,41,47,0.35)', transform: `rotate(${L('wireRot')}deg)`, overflow: 'hidden', position: 'relative'}}>
              <div style={{height: 26, background: C.teal, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 10}}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{width: 8, height: 8, borderRadius: 4, background: GOLD}} />
                ))}
              </div>
              <svg width={224} height={130} viewBox="0 0 224 130" style={{position: 'absolute', left: 0, top: 26}}>
                <rect x="12" y="12" width="78" height="56" rx="6" fill={SKEL} />
                <path d="M12 12 L90 68 M90 12 L12 68" stroke="#B8C6C9" strokeWidth="2" />
                <rect x="102" y="12" width="108" height="16" rx="5" fill={SKEL} />
                <rect x="102" y="36" width="108" height="32" rx="6" fill={SKEL} />
                <rect x="12" y="80" width="198" height="18" rx="5" fill={SKEL} />
              </svg>
            </div>
          </Part>
          {/* critique marks on the poor layout: misaligned left edge + faint CTA */}
          {critique > 0 && (
            <svg width={TEAL.w} height={TEAL.h} style={{position: 'absolute', left: 0, top: 0, opacity: critique}}>
              <ellipse cx={P.ctaX + 100} cy={P.ctaY + 21} rx={128 * critique} ry={36 * critique} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="9 7" />
              <line x1={P.titleX} y1={20} x2={P.titleX} y2={20 + 120 * critique} stroke={GOLD} strokeWidth={3} strokeDasharray="6 6" />
              <line x1={P.labelX} y1={20} x2={P.labelX} y2={20 + 120 * critique} stroke={GOLD} strokeWidth={3} strokeDasharray="6 6" />
            </svg>
          )}
        </div>
        {/* ---- screen 2 (prototype: next view after the CTA) ---- */}
        {proto > 0 && (
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${slide + TEAL.w}px)`}}>
            <div style={{position: 'absolute', left: 34, top: 28, fontFamily: FONT_SANS, fontWeight: 700, fontSize: 18, letterSpacing: 4, color: GOLD}}>MODUL WORKSHOP</div>
            {['UI/UX Basics', 'Wireframe', 'Interactive Prototype'].map((t, i) => (
              <div key={t} style={{position: 'absolute', left: 34, top: 74 + i * 76, width: TEAL.w - 68, height: 60, borderRadius: 16, background: i === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', boxSizing: 'border-box'}}>
                <div style={{width: 34, height: 34, borderRadius: 17, background: i === 0 ? GOLD : 'transparent', border: `3px solid ${GOLD}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {i === 0 && (
                    <svg width={18} height={14} viewBox="0 0 18 14">
                      <path d="M2 7 L7 12 L16 2" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: 24, color: WHITE, whiteSpace: 'nowrap'}}>
                  {String(i + 1).padStart(2, '0')} — {t}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card25D>
  );
};
