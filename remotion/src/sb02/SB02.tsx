// SB02 V01.1 — global 10.0–20.0 s (300 f @30). Output frame f = master frame (10.0 s + f/30); original cut at
// f61 (master 12.033 s): seated Shot B → standing Shot C. V01.1 (user review of V01): every subtitle and
// illustration is locked to what the talent is saying at that moment, the camera tracks the face and punches in on
// every key subtitle, VO louder. Frame map: qa/sb02/SB02_FRAME_MAP.md.
import React from 'react';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from '../lib/fonts';
import {C, FONT_SANS, H, W} from '../lib/tokens';
import {INK} from '../sb01v051/layout';
import {fitStr} from '../sb01v051/metrics';
import {mono} from '../sb01v051/refTracks';
import {Hero, Mask, Sans} from '../sb01v051/Type';
import {BookIcon, FragCursor, ProtoIcon, Ticks} from '../sb01v051/WorkshopDashboardFragment';
import {AudioMixSB02} from './AudioMixSB02';
import {WorkshopFragmentScene} from '../sb01v051/UiuxBeat';
import {GOLD, MODULE, RedesignCard, TrainingModule} from './Cards';
import face from './faceTrack.json';

loadFonts();

const SRC = staticFile('master/IMG_6757_10-20.5_v03_graded_cfr30.mp4');
export const CUT = 61;
const K = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUTE = Easing.bezier(0.16, 1, 0.3, 1);
const INE = Easing.bezier(0.55, 0, 0.9, 0.35);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const SOFT = Easing.bezier(0.22, 1, 0.36, 1);
const ease = (f: number, a: number, b: number, v0 = 0, v1 = 1, e: (t: number) => number = OUTE) => interpolate(f, [a, b], [v0, v1], {...K, easing: e});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ======================= CAMERA / FOOTAGE =======================
// Face-tracking camera (user V01 review: "ga ada tracking kamera? zoom in ke per subtitle"):
//  - translation keeps the smoothed face centre on a fixed screen target (Shot B: the SB01 shot-2 framing point
//    557,727; Shot C: 540,860 so the top band stays free for the subtitle), clamped so the frame is always covered;
//  - scale is keyed to the dialogue: a quick punch-in (5 f, ease-out) on every key subtitle word, slow drift
//    in between, a pull-back where an illustration needs the lower frame.
const ZOOM = mono([
  [0, 1.5], [10, 1.42], [16, 1.44], [24, 1.5], [56, 1.47], [60, 1.47], // "PERCAYA?" f8
  [61, 1.3], [69, 1.18], [88, 1.18], [128, 1.24], [132, 1.25], [137, 1.34], // "DUA HAL" f132
  [145, 1.3], [152, 1.22], [158, 1.25], [167, 1.27], [172, 1.34], [188, 1.3], // "BANGUN BISNIS" f158/f167
  [198, 1.24], [200, 1.25], [205, 1.35], [218, 1.33], [224, 1.22], // "Kabar baiknya," f200
  [256, 1.29], [257, 1.3], [262, 1.4], [270, 1.39], // "ILMU" f257
  [271, 1.37], [279, 1.24], [299, 1.34], // "UI/UX WORKSHOP" f271 (pull back for the card), push into the exit
]);
const at = (a: number[], f: number) => a[Math.max(0, Math.min(a.length - 1, Math.round(f)))];
const TARGET = (f: number) => (f < CUT ? {x: 557, y: 727} : {x: 540, y: 860});
export const footT = (f: number) => {
  const s = ZOOM(f);
  const t = TARGET(f);
  const tx = Math.min(0, Math.max(W - W * s, t.x - at(face.cx, f) * s));
  const ty = Math.min(0, Math.max(H - H * s, t.y - at(face.cy, f) * s));
  return {s, tx, ty};
};
/** face centre/size in screen px */
export const faceScreen = (f: number) => {
  const {s, tx, ty} = footT(f);
  return {cx: at(face.cx, f) * s + tx, cy: at(face.cy, f) * s + ty, h: at(face.h, f) * s};
};

/** 3-frame blur cut at f61 (jx 18.13–18.27 s: blur peak on the cut frame, gone 2 f later) */
const cutBlur = (f: number) => interpolate(f, [58, 60, 61, 62, 64], [0, 7, 16, 7, 0], K);

const Footage: React.FC<{f: number}> = ({f}) => {
  const {s, tx, ty} = footT(f);
  const b = cutBlur(f);
  return (
    <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})`, filter: b > 0.05 ? `blur(${b}px)` : undefined}}>
      <OffthreadVideo src={SRC} muted style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};

/** soft teal vignette at the top so white/orange headlines keep contrast over the bright ceiling */
const TopPlate: React.FC<{op: number}> = ({op}) => (
  <AbsoluteFill style={{opacity: op, background: 'linear-gradient(180deg, rgba(9,41,47,0.62) 0%, rgba(9,41,47,0.45) 18%, rgba(9,41,47,0.12) 30%, rgba(9,41,47,0) 38%)'}} />
);
const LowPlate: React.FC<{op: number}> = ({op}) => (
  <AbsoluteFill style={{opacity: op, background: 'linear-gradient(180deg, rgba(9,41,47,0) 52%, rgba(9,41,47,0.5) 66%, rgba(9,41,47,0.72) 82%, rgba(9,41,47,0.8) 100%)'}} />
);

// ======================= TYPE HELPERS =======================
/** jx kinetic word: rises from the line's lower edge inside a mask in 6 f */
const Word: React.FC<{f: number; at: number; children: React.ReactNode; dur?: number; dir?: 'up' | 'left'}> = ({f, at: a, children, dur = 6, dir = 'up'}) => {
  if (f < a) return <div style={{visibility: 'hidden', display: 'inline-block', verticalAlign: 'top'}}>{children}</div>;
  return (
    <div style={{display: 'inline-block', verticalAlign: 'top'}}>
      <Mask p={ease(f, a, a + dur, 0, 1, SOFT)} dir={dir} pad={30}>
        {children}
      </Mask>
    </div>
  );
};
/** 9g exit: dissolve + blur + drift up over n frames */
const exitStyle = (f: number, a: number, n = 7, dy = -46): React.CSSProperties => {
  const p = ease(f, a, a + n, 0, 1, Easing.in(Easing.quad));
  return {opacity: 1 - p, filter: p > 0.01 ? `blur(${p * 10}px)` : undefined, transform: `translateY(${p * dy}px)`};
};

// ======================= SUBTITLE + ILLUSTRATION, LOCKED TO WHAT THE TALENT SAYS =======================
// V01 review (user): subtitle and illustration did not match the speech → V01.1: every illustration now shows the
// sentence being spoken, and nothing is shown before it is said.
//   "Siapa yang mau percaya?"          → gold question mark
//   (walk, no speech f26–88)            → clean frame, talent only
//   "Nah, makanya kalian butuh dua hal" → two empty numbered cards 01 / 02 drop in on "dua hal"
//   "itu buat bangun bisnis kalian."    → the two cards become the foundation; a business building is built on them
//   "Kabar baiknya,"                    → gold sparkle burst
//   "kalian bisa mendapatkan ilmu"      → a book opens, knowledge icons flow out of it
//   [VO_REPLACEMENT_PENDING "UI/UX workshop"] → the workshop card, CTA clicked
const TOP = 150;
const S_LINE = 60;
const S_SMALL = 50;
const S_PERCAYA = fitStr('serif', 'PERCAYA?', 0.74);
const S_DUAHAL = fitStr('serif', 'DUA HAL', 0.6);
const S_BB = fitStr('serif', 'BANGUN BISNIS', 0.84);
const S_KABAR = fitStr('serif', 'Kabar baiknya,', 0.8);
const S_ILMU = fitStr('serif', 'ILMU', 0.42);
const S_UIUXW = fitStr('serif', 'UI/UX WORKSHOP', 0.86);

/** one line of kinetic words, centred; words = [text, onset frame] */
const Line: React.FC<{f: number; top: number; words: [string, number][]; size: number; color?: string}> = ({f, top, words, size, color}) => (
  <div style={{position: 'absolute', left: 0, width: W, top, textAlign: 'center'}}>
    {words.map(([w, a]) => (
      <span key={w + a} style={{display: 'inline-block', verticalAlign: 'top', margin: `0 ${size * 0.14}px`}}>
        <Word f={f} at={a}>
          <Sans text={w} size={size} color={color} />
        </Word>
      </span>
    ))}
  </div>
);
const HeroLine: React.FC<{f: number; top: number; at: number; text: string; size: number; fill?: 'orange' | 'ivory'; pop?: boolean}> = ({f, top, at: a, text, size, fill = 'orange', pop = true}) => {
  const sc = pop ? lerp(1.12, 1, ease(f, a, a + 9, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1))) : 1;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top, display: 'flex', justifyContent: 'center', transform: `scale(${sc})`, transformOrigin: '540px 40%'}}>
      <Word f={f} at={a} dur={6}>
        <Hero text={text} size={size} fill={fill} pad={0.1} />
      </Word>
    </div>
  );
};

// ---------- P01 "Siapa yang mau percaya?" (Shot B, lower third below the chin) ----------
const P01_Y = 1150;
const P01: React.FC<{f: number}> = ({f}) => {
  if (f > 62) return null;
  const y0 = P01_Y + 54 * 1.25;
  const q = ease(f, 12, 22, 0, 1, Easing.bezier(0.3, 1.6, 0.5, 1));
  const wob = f > 22 ? Math.sin((f - 22) * 0.25) * 4 : 0;
  return (
    <AbsoluteFill style={exitStyle(f, 50, 8)}>
      <Line f={f} top={P01_Y} size={54} words={[['Siapa', 1], ['yang', 3], ['mau', 5]]} />
      <div style={{position: 'absolute', left: 0, width: W, top: y0, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(1.08, 1, ease(f, 8, 16, 0, 1, Easing.bezier(0.3, 1.45, 0.5, 1)))})`, transformOrigin: '540px 50%'}}>
        <Word f={f} at={8} dur={7}>
          <Hero text="PERCAYA?" size={S_PERCAYA} pad={0.1} />
        </Word>
      </div>
      {/* gold question mark: the doubt in the question (secondary, beside the face, never on it) */}
      {q > 0 && (
        <div style={{position: 'absolute', left: 790, top: 400, transform: `scale(${q * 1.35}) rotate(${12 + wob}deg)`, transformOrigin: '50% 80%'}}>
          <svg width={150} height={190} viewBox="0 0 150 190" style={{overflow: 'visible', filter: 'drop-shadow(0 8px 14px rgba(9,41,47,0.5))'}}>
            <circle cx={75} cy={86} r={72} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="10 9" opacity={0.7} />
            <text x={75} y={128} textAnchor="middle" fontFamily='"Source Serif 4 UNL", serif' fontStyle="italic" fontWeight={700} fontSize={130} fill={GOLD}>?</text>
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- P02 "Nah, makanya kalian butuh DUA HAL" ----------
const P02Type: React.FC<{f: number}> = ({f}) => {
  if (f < 86 || f > 146) return null;
  return (
    <AbsoluteFill style={exitStyle(f, 138, 6, -60)}>
      <Line f={f} top={TOP} size={S_LINE} words={[['Nah,', 88], ['makanya', 100]]} />
      <Line f={f} top={TOP + S_LINE * 1.15} size={S_LINE} words={[['kalian', 112], ['butuh', 123]]} />
      <HeroLine f={f} top={TOP + S_LINE * 2.45} at={131} text="DUA HAL" size={S_DUAHAL} />
    </AbsoluteFill>
  );
};

// ---------- P03 "itu buat BANGUN BISNIS kalian." ----------
const P03Type: React.FC<{f: number}> = ({f}) => {
  if (f < 144 || f > 196) return null;
  const s = S_BB;
  return (
    <AbsoluteFill style={exitStyle(f, 189, 6, -60)}>
      <Line f={f} top={TOP} size={S_SMALL} words={[['itu', 145], ['buat', 152]]} />
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + S_SMALL * 1.3, display: 'flex', justifyContent: 'center', gap: s * 0.22}}>
        <Word f={f} at={158} dur={6}>
          <Hero text="BANGUN" size={s} fill="ivory" pad={0.08} />
        </Word>
        <Word f={f} at={167} dur={6}>
          <Hero text="BISNIS" size={s} pad={0.08} />
        </Word>
      </div>
      <Line f={f} top={TOP + S_SMALL * 1.3 + s * 1.08} size={S_SMALL} words={[['kalian.', 176]]} />
    </AbsoluteFill>
  );
};

// ---------- P04a "Kabar baiknya," ----------
const P04aType: React.FC<{f: number}> = ({f}) => {
  if (f < 197 || f > 224) return null;
  return (
    <AbsoluteFill style={exitStyle(f, 216, 5, -60)}>
      <HeroLine f={f} top={TOP + 40} at={199} text="Kabar baiknya," size={S_KABAR} fill="ivory" />
    </AbsoluteFill>
  );
};

// ---------- P04b "kalian bisa mendapatkan ILMU" ----------
const P04bType: React.FC<{f: number}> = ({f}) => {
  if (f < 219 || f > 272) return null;
  return (
    <AbsoluteFill style={exitStyle(f, 265, 5, -60)}>
      <Line f={f} top={TOP} size={S_SMALL} words={[['kalian', 220], ['bisa', 229], ['mendapatkan', 238]]} />
      <HeroLine f={f} top={TOP + S_SMALL * 1.3} at={256} text="ILMU" size={S_ILMU} />
    </AbsoluteFill>
  );
};

// ---------- P05 [VO pending: "UI/UX workshop"] ----------
const P05Type: React.FC<{f: number}> = ({f}) => {
  if (f < 270) return null;
  const c = ease(f, 288, 299, 0, 1, INE);
  return (
    <AbsoluteFill style={{transformOrigin: `${W * 0.86}px 330px`, transform: `scale(${1 - 0.5 * c})`, opacity: 1 - c * 0.85, filter: c > 0.1 ? `blur(${c * 6}px)` : undefined}}>
      <HeroLine f={f} top={TOP + 30} at={271} text="UI/UX WORKSHOP" size={S_UIUXW} />
    </AbsoluteFill>
  );
};

// ======================= ILLUSTRATIONS =======================
// --- two things → foundation → business building ---
const SLOT = {w: 270, h: 140};
const SLOT_HANG = [{x: 36, y: 640}, {x: W - 36 - SLOT.w, y: 640}];
const SLOT_BASE = [{x: 540 - SLOT.w - 6, y: 1620}, {x: 546, y: 1620}];
const FLOOR_W = 470;
const FLOOR_H = 112;

const Slot: React.FC<{n: string; filled: number}> = ({n, filled}) => (
  <div style={{width: SLOT.w, height: SLOT.h, borderRadius: 22, background: 'rgba(255,255,255,0.96)', boxShadow: '6px 10px 0 #C9D4D6, 10px 24px 34px rgba(9,41,47,0.4)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', boxSizing: 'border-box'}}>
    <div style={{fontFamily: '"Source Serif 4 UNL", serif', fontStyle: 'italic', fontWeight: 700, fontSize: 70, color: C.orange1, lineHeight: 1}}>{n}</div>
    <div style={{flex: 1, height: 74, borderRadius: 14, border: `3px dashed ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SANS, fontWeight: 700, fontSize: 34, color: GOLD, background: `rgba(235,187,110,${0.15 * filled})`}}>?</div>
  </div>
);

const Building: React.FC<{f: number}> = ({f}) => {
  // floors stack on "bangun" (f158–170), roof + flag on "bisnis" (f167–176), lights on "kalian" (f176–184)
  const fl = [ease(f, 156, 162, 0, 1, Easing.bezier(0.2, 1.3, 0.4, 1)), ease(f, 160, 166, 0, 1, Easing.bezier(0.2, 1.3, 0.4, 1)), ease(f, 164, 170, 0, 1, Easing.bezier(0.2, 1.3, 0.4, 1))];
  const roof = ease(f, 167, 175, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1));
  const lights = ease(f, 176, 184);
  const x0 = 540 - FLOOR_W / 2;
  const base = SLOT_BASE[0].y;
  return (
    <>
      {fl.map((p, i) => {
        if (p <= 0) return null;
        const y = base - (i + 1) * (FLOOR_H + 8);
        return (
          <div key={i} style={{position: 'absolute', left: x0, top: y - (1 - p) * 260, width: FLOOR_W, height: FLOOR_H, opacity: Math.min(1, p * 2), borderRadius: 16, background: `linear-gradient(155deg, ${C.teal} 0%, #12505B 60%, ${INK} 100%)`, border: '5px solid #FFFFFF', boxSizing: 'border-box', boxShadow: '6px 10px 0 #C9D4D6, 10px 24px 34px rgba(9,41,47,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', padding: '0 14px'}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} style={{width: 46, height: 54, borderRadius: 8, background: lights > (k * 0.15 + i * 0.1) % 1 ? GOLD : 'rgba(255,255,255,0.18)', boxShadow: lights > (k * 0.15 + i * 0.1) % 1 ? '0 0 16px rgba(235,187,110,0.7)' : undefined}} />
            ))}
          </div>
        );
      })}
      {roof > 0 && (
        <svg width={FLOOR_W + 40} height={200} style={{position: 'absolute', left: x0 - 20, top: base - 3 * (FLOOR_H + 8) - 190, overflow: 'visible', opacity: Math.min(1, roof * 2)}}>
          <g transform={`translate(${(FLOOR_W + 40) / 2} 190) scale(${roof}) translate(${-(FLOOR_W + 40) / 2} -190)`}>
            <path d={`M 10 186 L ${(FLOOR_W + 40) / 2} 96 L ${FLOOR_W + 30} 186 Z`} fill={C.orange1} stroke="#FFFFFF" strokeWidth={6} strokeLinejoin="round" />
            <line x1={(FLOOR_W + 40) / 2} y1={98} x2={(FLOOR_W + 40) / 2} y2={6} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
            <path d={`M ${(FLOOR_W + 40) / 2 + 3} 8 L ${(FLOOR_W + 40) / 2 + 74} 26 L ${(FLOOR_W + 40) / 2 + 3} 46 Z`} fill={GOLD} />
          </g>
        </svg>
      )}
    </>
  );
};

const TwoThings: React.FC<{f: number}> = ({f}) => {
  if (f < 130 || f > 200) return null;
  // "dua hal" f132: both cards drop from the top edge (0u badge drop, damped swing)
  const drop = [ease(f, 131, 139, 0, 1, Easing.bezier(0.3, 0.9, 0.4, 1.06)), ease(f, 134, 142, 0, 1, Easing.bezier(0.3, 0.9, 0.4, 1.06))];
  // "itu buat" f145–156: they slide down and lock side by side as the foundation
  const toBase = ease(f, 146, 156, 0, 1, Easing.bezier(0.6, 0, 0.2, 1));
  const out = ease(f, 189, 197, 0, 1, Easing.in(Easing.quad)); // leaves downward before "Kabar baiknya"
  return (
    <AbsoluteFill style={{transform: `translateY(${out * 700}px)`, opacity: 1 - out * 0.6}}>
      {[0, 1].map((i) => {
        const t = f - (139 + i * 3);
        const sw = t < 0 ? 10 : 10 * Math.exp(-t * 0.25) * Math.cos(t * 0.5);
        const x = lerp(SLOT_HANG[i].x, SLOT_BASE[i].x, toBase);
        const y = lerp(SLOT_HANG[i].y - (1 - drop[i]) * 900, SLOT_BASE[i].y, toBase);
        const rot = (i === 0 ? sw : -sw) * (1 - toBase);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, transformOrigin: '50% -400px', filter: drop[i] < 0.7 ? `blur(${(0.7 - drop[i]) * 10}px)` : toBase > 0.15 && toBase < 0.85 ? 'blur(3px)' : undefined}}>
            <Slot n={i === 0 ? '01' : '02'} filled={ease(f, 156, 166)} />
          </div>
        );
      })}
      <Building f={f} />
    </AbsoluteFill>
  );
};

// --- "Kabar baiknya," sparkle burst around the headline ---
const GoodNews: React.FC<{f: number}> = ({f}) => {
  if (f < 199 || f > 224) return null;
  const p = ease(f, 200, 210, 0, 1, Easing.bezier(0.2, 1.2, 0.4, 1));
  const o = 1 - ease(f, 214, 221);
  const pts: [number, number, number, number][] = [[110, 230, -30, 1], [970, 230, 30, 1], [180, 420, -70, 0.8], [900, 430, 70, 0.8], [540, 120, 0, 0.9]];
  return (
    <AbsoluteFill style={{opacity: o}}>
      {pts.map(([x, y, r, s], i) => (
        <div key={i} style={{position: 'absolute', left: x - 30, top: y - 30, transform: `scale(${s * 1.6})`}}>
          <Ticks p={p} rot={r} />
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <svg key={i} width={60} height={60} viewBox="-30 -30 60 60" style={{position: 'absolute', left: [250, 820, 560][i], top: [150, 140, 470][i], transform: `scale(${p * [1, 0.8, 0.7][i]}) rotate(${p * 45}deg)`}}>
          <path d="M0 -26 C3 -6 6 -3 26 0 C6 3 3 6 0 26 C-3 6 -6 3 -26 0 C-6 -3 -3 -6 0 -26 Z" fill={GOLD} />
        </svg>
      ))}
    </AbsoluteFill>
  );
};

// --- "kalian bisa mendapatkan ilmu": a book rises, opens on "mendapatkan", knowledge icons flow out on "ilmu" ---
const BOOK = {x: 540 - (MODULE.w * 1.15) / 2, y: 1330, s: 1.15};
const Knowledge: React.FC<{f: number}> = ({f}) => {
  if (f < 219 || f > 282) return null;
  const rise = ease(f, 220, 232, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const open = ease(f, 238, 247, 0, 1, Easing.bezier(0.4, 0, 0.2, 1));
  const out = ease(f, 268, 276, 0, 1, Easing.in(Easing.quad)); // makes way for the workshop card
  const flow = (k: number) => ease(f, 246 + k * 3, 262 + k * 3, 0, 1, Easing.bezier(0.3, 0, 0.2, 1));
  const icons: [React.ReactNode, number, number][] = [
    [<BookIcon key="b" />, 170, 1050],
    [<ProtoIcon key="p" />, 910, 1060],
    [
      <svg key="l" width={70} height={70} viewBox="0 0 70 70">
        <rect width="70" height="70" rx="18" fill="#DCE8EA" />
        <path d="M35 14 C24 14 18 22 18 30 C18 37 23 41 26 45 L26 50 L44 50 L44 45 C47 41 52 37 52 30 C52 22 46 14 35 14 Z" fill={GOLD} stroke={C.teal} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M28 56 H42" stroke={C.teal} strokeWidth={4} strokeLinecap="round" />
      </svg>,
      200,
      1260,
    ],
    [
      <div key="w" style={{width: 92, height: 70, borderRadius: 12, background: '#F2F6F7', border: '3px solid #fff', boxShadow: '4px 6px 0 #B9C7CA', overflow: 'hidden'}}>
        <div style={{height: 16, background: C.teal}} />
        <div style={{margin: 8, height: 14, borderRadius: 4, background: '#DCE5E7'}} />
        <div style={{margin: '0 8px', height: 14, width: 40, borderRadius: 4, background: C.orange1}} />
      </div>,
      880,
      1270,
    ],
  ];
  const src = {x: 540, y: BOOK.y + 120};
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateY(${out * 400}px)`}}>
      {/* light from the open book */}
      {open > 0 && <div style={{position: 'absolute', left: 540 - 260, top: BOOK.y - 220, width: 520, height: 420, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 70%, rgba(255,215,166,0.55) 0%, rgba(235,187,110,0.18) 45%, rgba(235,187,110,0) 70%)', opacity: open}} />}
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${BOOK.x}px, ${BOOK.y + (1 - rise) * 700}px) scale(${BOOK.s})`, filter: rise < 0.7 ? `blur(${(0.7 - rise) * 10}px)` : undefined}}>
        <TrainingModule open={open} task={0} check={0} label="MODUL" title={['Ilmu', 'Baru']} />
      </div>
      {/* "ilmu": a glowing idea rises out of the open pages */}
      {open > 0.3 && (
        <div style={{position: 'absolute', left: 540 - 60, top: BOOK.y + 60 - ease(f, 244, 254, 0, 1) * 150, transform: `scale(${ease(f, 243, 252, 0, 1, Easing.bezier(0.3, 1.6, 0.5, 1)) * 1.7})`, filter: 'drop-shadow(0 0 26px rgba(255,215,166,0.95))'}}>
          <svg width={120} height={120} viewBox="0 0 70 70">
            <path d="M35 10 C23 10 16 19 16 28 C16 36 21 40 25 45 L25 51 L45 51 L45 45 C49 40 54 36 54 28 C54 19 47 10 35 10 Z" fill="#FFD7A6" stroke="#FFFFFF" strokeWidth={3} strokeLinejoin="round" />
            <path d="M27 57 H43 M29 63 H41" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
          </svg>
        </div>
      )}
      {icons.map(([node, tx, ty], k) => {
        const p = flow(k);
        if (p <= 0) return null;
        const x = lerp(src.x, tx, p) - 35;
        const y = lerp(src.y, ty, p) - 35 - Math.sin(p * Math.PI) * 160;
        return (
          <div key={k} style={{position: 'absolute', left: x, top: y, filter: 'drop-shadow(0 0 18px rgba(255,215,166,0.8))', transform: `scale(${(0.5 + 1.1 * p) * 1.3}) rotate(${(1 - p) * (k % 2 ? 30 : -30)}deg)`, opacity: Math.min(1, p * 3)}}>
            {node}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// --- [VO pending "UI/UX workshop"]: the workshop card, polished, CTA clicked ---
const CARD = {x: 230, y: 1300, s: 0.95};
const CURSOR: [number, number, number][] = [[276, 760, 560], [281, 300, 380], [284, 176, 306], [292, 184, 312]];
const cursorAt = (f: number) => {
  const o = {...K, easing: Easing.bezier(0.45, 0, 0.25, 1)};
  const fr = CURSOR.map((c) => c[0]);
  return {x: interpolate(f, fr, CURSOR.map((c) => c[1]), o), y: interpolate(f, fr, CURSOR.map((c) => c[2]), o)};
};
const Workshop: React.FC<{f: number}> = ({f}) => {
  if (f < 268) return null;
  const rise = ease(f, 269, 280, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const c6 = ease(f, 288, 299, 0, 1, INE);
  const s = CARD.s * (0.92 + 0.08 * rise) * (1 - 0.82 * c6);
  const x = lerp(CARD.x, W * 0.86, c6);
  const y = lerp(CARD.y + (1 - rise) * 700, 1450, c6);
  const cur = cursorAt(f);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`, opacity: Math.min(1, rise * 1.6) * (1 - c6 * 0.6), filter: rise < 0.7 ? `blur(${(0.7 - rise) * 10}px)` : undefined}}>
      <RedesignCard fix={1} explode={0} wire={0} guides={0} hier={ease(f, 276, 284, 0, 1, Easing.bezier(0.3, 1.3, 0.5, 1))} proto={0} ripple={ease(f, 284, 294, 0, 1, Easing.out(Easing.quad))} critique={0} tilt={0.55} />
      {f >= 276 && (
        <div style={{position: 'absolute', left: cur.x, top: cur.y, opacity: ease(f, 276, 279, 0, 1) * (1 - c6)}}>
          <FragCursor press={f >= 283 && f < 285 ? 0.82 : 1} />
        </div>
      )}
    </div>
  );
};

// ======================= P06: directional teal/gold exit (still moving on f299) =======================
const Exit: React.FC<{f: number}> = ({f}) => {
  if (f < 286) return null;
  const p = ease(f, 286, 299, 0, 1, Easing.bezier(0.6, 0, 0.9, 0.6)); // accelerating, not finished at f299
  const x = lerp(-1.25 * W, -0.32 * W, p);
  const dot = ease(f, 286, 292, 0, 1, Easing.bezier(0.3, 1.6, 0.5, 1));
  return (
    <AbsoluteFill>
      {/* gold motif point the content contracts into */}
      <div style={{position: 'absolute', left: W * 0.86 - 14, top: 1450 - 14, width: 28, height: 28, borderRadius: 14, background: GOLD, transform: `scale(${dot * (1 + p * 0.6)})`, boxShadow: '0 0 30px rgba(235,187,110,0.8)'}} />
      <div style={{position: 'absolute', left: 0, top: -400, width: W * 1.1, height: H + 800, transform: `translateX(${x}px) skewX(-12deg)`, background: `linear-gradient(155deg, ${C.teal} 0%, #12505B 55%, ${INK} 100%)`, boxShadow: '30px 0 60px rgba(9,41,47,0.5)'}}>
        <div style={{position: 'absolute', right: -6, top: 0, bottom: 0, width: 14, background: `linear-gradient(90deg, ${GOLD}, ${C.orange2})`, filter: 'blur(1px)'}} />
      </div>
    </AbsoluteFill>
  );
};

export const SB02: React.FC = () => {
  const f = useCurrentFrame();
  const topOp = f < CUT ? 0 : ease(f, 84, 92) * (1 - ease(f, 290, 299));
  const lowOp = f < CUT ? ease(f, 2, 12) * 0.9 * (1 - ease(f, 54, 61)) : Math.max(ease(f, 146, 156) * (1 - ease(f, 190, 198)), ease(f, 220, 230)) * 0.7 * (1 - ease(f, 290, 299));
  const gfxBlur = cutBlur(f);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Footage f={f} />
      <TopPlate op={topOp} />
      <LowPlate op={lowOp} />
      <AbsoluteFill style={{filter: gfxBlur > 0.05 ? `blur(${gfxBlur * 0.6}px)` : undefined}}>
        <P01 f={f} />
        <TwoThings f={f} />
        <Knowledge f={f} />
        <Workshop f={f} />
        <GoodNews f={f} />
        <P02Type f={f} />
        <P03Type f={f} />
        <P04aType f={f} />
        <P04bType f={f} />
        <P05Type f={f} />
      </AbsoluteFill>
      <Exit f={f} />
      {f <= 16 && (
        <AbsoluteFill style={{transformOrigin: '540px 960px', transform: `translateY(${-ease(f, 1, 16, 0, 1, Easing.bezier(0.45, 0.05, 0.55, 1)) * 4300}px) scale(${1 + 0.4 * (1 - Math.exp(-(f + 1) / 2.2))})`, filter: f > 4 ? `blur(${Math.min(6, (f - 4) * 0.8)}px)` : undefined}}>
          {/* the SB01 V05.1 bomb-in layer itself, continued at global frame 300+f (same 24-sample motion blur) */}
          <Sequence from={-300} layout="none">
            <CameraMotionBlur samples={24} shutterAngle={160}>
              <WorkshopFragmentScene />
            </CameraMotionBlur>
          </Sequence>
        </AbsoluteFill>
      )}
      <AudioMixSB02 />
    </AbsoluteFill>
  );
};
