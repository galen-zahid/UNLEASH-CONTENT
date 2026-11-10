// SB02 V01 — global 10.0–20.0 s (300 f @30). Output frame f = master frame (10.0 s + f/30); original cut at
// f61 (master 12.033 s): seated Shot B → standing Shot C. Panels are locked to the measured dialogue
// (audit/MASTER_ASR_words.json + energy check), see qa/sb02/SB02_FRAME_MAP.md:
//  P01 f0–60   continue the SB01 bomb-in (teal panel lifts away), "Siapa yang mau PERCAYA?", two gold paths
//  P02 f61–140 3-frame blur cut; training module drops from the top edge, low-fi fragment rises; "DUA HAL"
//  P03 f140–178 UPGRADING SKILL: module drops into place, opens, task card, completed check (camera push)
//  P04 f178–262 UI/UX WORKSHOP: the low-fi fragment becomes the workshop card and is redesigned
//               poor → pull apart → guides/wireframe → reassemble → hierarchy/CTA → click → prototype
//  P05 f262–290 UPGRADING SKILL × UI/UX WORKSHOP + gold connector (VO muted: VO_REPLACEMENT_PENDING)
//  P06 f286–299 contract into the gold motif, directional teal/gold exit still moving into SB03
import React from 'react';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from '../lib/fonts';
import {C, FONT_SANS, H, W} from '../lib/tokens';
import {INK} from '../sb01v051/layout';
import {fitStr} from '../sb01v051/metrics';
import {mono} from '../sb01v051/refTracks';
import {Hero, Mask, Sans} from '../sb01v051/Type';
import {BookIcon, FragCursor, GoldConnector, ModuleFloatCard, ProtoIcon, Ticks} from '../sb01v051/WorkshopDashboardFragment';
import {AudioMixSB02} from './AudioMixSB02';
import {WorkshopFragmentScene} from '../sb01v051/UiuxBeat';
import {GOLD, LOFI, LofiFragment, MODULE, RedesignCard, TrainingModule} from './Cards';
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
// Shot B keeps the SB01 shot-2 framing (×1.4, +20/−47) with a settling push 1.10→1.0 out of the bomb-in.
// Shot C (standing): ×1.15 base, face centre ≈ y 850 so the top band (y < 600) is free for headlines.
// jx-style pull-back after the cut (1.21→1.15), push in P03, release in P04, final push in P05/P06.
const CAM_C = mono([[61, 1.21], [69, 1.15], [140, 1.15], [176, 1.22], [188, 1.18], [262, 1.18], [299, 1.25]]);
const shotB = (f: number) => ({s: 1.4 * lerp(1.1, 1.0, ease(f, 0, 22)), dx: 20, dy: -47});
const C_DY = -18;
export const footT = (f: number) => (f < CUT ? shotB(f) : {s: CAM_C(f), dx: 0, dy: C_DY});
const at = (a: number[], f: number) => a[Math.max(0, Math.min(a.length - 1, Math.round(f)))];
/** face centre/size in screen px (smoothed Haar track, audit/sb02/FACE_TRACK.json) */
export const faceScreen = (f: number) => {
  const {s, dx, dy} = footT(f);
  return {cx: (at(face.cx, f) - W / 2) * s + W / 2 + dx, cy: (at(face.cy, f) - H / 2) * s + H / 2 + dy, h: at(face.h, f) * s};
};
/** graphics parallax: layer scale relative to the footage camera, depth 0 = screen-locked, 1 = with footage */
const PIV = {x: 540, y: 850};
const par = (f: number, depth: number) => {
  if (f < CUT) return 1;
  return 1 + (CAM_C(f) / 1.15 - 1) * depth;
};
const Par: React.FC<{f: number; depth: number; children: React.ReactNode}> = ({f, depth, children}) => (
  <AbsoluteFill style={{transformOrigin: `${PIV.x}px ${PIV.y}px`, transform: `scale(${par(f, depth)})`}}>{children}</AbsoluteFill>
);

/** 3-frame blur cut at f61 (jx 18.13–18.27 s: blur peak on the cut frame, gone 2 f later) */
const cutBlur = (f: number) => interpolate(f, [58, 60, 61, 62, 64], [0, 7, 16, 7, 0], K);

const Footage: React.FC<{f: number}> = ({f}) => {
  const {s, dx, dy} = footT(f);
  const b = cutBlur(f);
  return (
    <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${s})`, filter: b > 0.05 ? `blur(${b}px)` : undefined}}>
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

// ======================= P01: carry from SB01 + question =======================
// (P01 entry = the SB01 V05.1 WorkshopFragmentScene itself, continued at global frame 300+f — see root)
const S_SIAPA = 54;
const S_PERCAYA = fitStr('serif', 'PERCAYA?', 0.74);
const P01_Y = 1150; // below the chin (face ≈ y 730, chin ≈ y 930 in the Shot B framing)
const P01: React.FC<{f: number}> = ({f}) => {
  if (f > 62) return null;
  const pathsP = ease(f, 28, 46, 0, 1, IO);
  const ex = exitStyle(f, 53, 7);
  const scale = lerp(1.08, 1, ease(f, 8, 16, 0, 1, Easing.bezier(0.3, 1.45, 0.5, 1)));
  const y0 = P01_Y + S_SIAPA * 1.25;
  const yP = y0 + S_PERCAYA * 1.0;
  const iconP = (a: number) => ease(f, a, a + 8, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1));
  return (
    <AbsoluteFill style={ex}>
      <div style={{position: 'absolute', left: 0, width: W, top: P01_Y, textAlign: 'center'}}>
        {['Siapa', 'yang', 'mau'].map((w, i) => (
          <span key={w} style={{display: 'inline-block', verticalAlign: 'top', margin: '0 8px'}}>
            <Word f={f} at={[1, 3, 5][i]}>
              <Sans text={w} size={S_SIAPA} />
            </Word>
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: y0, display: 'flex', justifyContent: 'center', transform: `scale(${scale})`, transformOrigin: '540px 50%'}}>
        <Word f={f} at={8} dur={7}>
          <Hero text="PERCAYA?" size={S_PERCAYA} pad={0.1} />
        </Word>
      </div>
      {/* two slender gold paths branching out of the question: the "two things" before they are named */}
      <GoldConnector W={W} H={H} d={`M 540 ${yP + 30} C 520 ${yP + 160}, 300 ${yP + 120}, 230 ${yP + 250}`} draw={pathsP} end={[230, yP + 250]} />
      <GoldConnector W={W} H={H} d={`M 540 ${yP + 30} C 560 ${yP + 160}, 780 ${yP + 120}, 850 ${yP + 250}`} draw={ease(f, 32, 50, 0, 1, IO)} end={[850, yP + 250]} />
      <div style={{position: 'absolute', left: 230 - 45, top: yP + 270, transform: `scale(${iconP(44) * 0.9})`, transformOrigin: '45px 0'}}>
        <BookIcon />
      </div>
      <div style={{position: 'absolute', left: 850 - 45, top: yP + 270, transform: `scale(${iconP(48) * 0.9})`, transformOrigin: '45px 0'}}>
        <ProtoIcon />
      </div>
    </AbsoluteFill>
  );
};

// ======================= TOP-BAND HEADLINES (P02–P05) =======================
const S_LINE = 60;
const S_DUAHAL = fitStr('serif', 'DUA HAL', 0.6);
const S_UPSKILL = fitStr('serif', 'UPGRADING SKILL', 0.84);
const S_UIUXW = fitStr('serif', 'UI/UX WORKSHOP', 0.86);
const S_UPSKILL2 = fitStr('serif', 'UPGRADING SKILL', 0.72);
const S_UIUXW2 = fitStr('serif', 'UI/UX WORKSHOP', 0.76);
const TOP = 150;

const Index: React.FC<{n: string; f: number; at: number}> = ({n, f, at: a}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: ease(f, a, a + 5), transform: `translateX(${(1 - ease(f, a, a + 8)) * -30}px)`}}>
    <div style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: 34, color: GOLD, letterSpacing: 2}}>{n}</div>
    <div style={{width: 70 * ease(f, a + 2, a + 10), height: 3, background: GOLD, borderRadius: 2}} />
  </div>
);

const P02Type: React.FC<{f: number}> = ({f}) => {
  if (f < 86 || f > 150) return null;
  const ex = exitStyle(f, 139, 7, -60);
  const pop = lerp(1.12, 1, ease(f, 132, 141, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1)));
  return (
    <AbsoluteFill style={ex}>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP, textAlign: 'center'}}>
        {[['Nah,', 88], ['makanya', 100]].map(([w, a]) => (
          <span key={w as string} style={{display: 'inline-block', verticalAlign: 'top', margin: '0 9px'}}>
            <Word f={f} at={a as number}>
              <Sans text={w as string} size={S_LINE} />
            </Word>
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + S_LINE * 1.15, textAlign: 'center'}}>
        {[['kalian', 112], ['butuh', 123]].map(([w, a]) => (
          <span key={w as string} style={{display: 'inline-block', verticalAlign: 'top', margin: '0 9px'}}>
            <Word f={f} at={a as number}>
              <Sans text={w as string} size={S_LINE} />
            </Word>
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + S_LINE * 2.45, display: 'flex', justifyContent: 'center', transform: `scale(${pop})`, transformOrigin: '540px 40%'}}>
        <Word f={f} at={131} dur={6}>
          <Hero text="DUA HAL" size={S_DUAHAL} pad={0.1} />
        </Word>
      </div>
    </AbsoluteFill>
  );
};

const P03Type: React.FC<{f: number}> = ({f}) => {
  if (f < 140 || f > 179) return null;
  const ex = exitStyle(f, 172, 6, -60); // gone by f178, before UI/UX WORKSHOP enters at f180
  const slide = ease(f, 141, 150, 0, 1, Easing.bezier(0.12, 1, 0.3, 1));
  return (
    <AbsoluteFill style={ex}>
      <div style={{position: 'absolute', left: 80, top: TOP}}>
        <Index n="01" f={f} at={141} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + 52, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - slide) * -140}px)`, opacity: Math.min(1, slide * 2.2), filter: slide < 0.6 ? `blur(${(0.6 - slide) * 12}px)` : undefined}}>
        <Hero text="UPGRADING SKILL" size={S_UPSKILL} fill="ivory" pad={0.1} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + 52 + S_UPSKILL * 1.12, textAlign: 'center'}}>
        {[['buat', 152], ['bangun', 158], ['bisnis', 167]].map(([w, a]) => (
          <span key={w as string} style={{display: 'inline-block', verticalAlign: 'top', margin: '0 7px'}}>
            <Word f={f} at={a as number}>
              <Sans text={w as string} size={46} />
            </Word>
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const P04Type: React.FC<{f: number}> = ({f}) => {
  if (f < 178 || f > 270) return null;
  const ex = exitStyle(f, 260, 6, -50);
  const slide = ease(f, 180, 189, 0, 1, Easing.bezier(0.12, 1, 0.3, 1));
  return (
    <AbsoluteFill style={ex}>
      <div style={{position: 'absolute', left: 80, top: TOP}}>
        <Index n="02" f={f} at={180} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + 52, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - slide) * 140}px)`, opacity: Math.min(1, slide * 2.2), filter: slide < 0.6 ? `blur(${(0.6 - slide) * 12}px)` : undefined}}>
        <Hero text="UI/UX WORKSHOP" size={S_UIUXW} pad={0.1} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + 52 + S_UIUXW * 1.12, textAlign: 'center'}}>
        <Word f={f} at={200}>
          <Sans text="Kabar baiknya," size={46} color={GOLD} />
        </Word>
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + 52 + S_UIUXW * 1.12 + 56, textAlign: 'center'}}>
        {[['kalian', 220], ['bisa', 229], ['mendapatkan', 238], ['ilmu', 257]].map(([w, a]) => (
          <span key={w as string} style={{display: 'inline-block', verticalAlign: 'top', margin: '0 7px'}}>
            <Word f={f} at={a as number}>
              <Sans text={w as string} size={42} />
            </Word>
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** ×-sign drawn as two gold strokes */
const Times: React.FC<{p: number; size: number}> = ({p, size}) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{overflow: 'visible'}}>
    <line x1={-7 * p} y1={-7 * p} x2={7 * p} y2={7 * p} stroke={GOLD} strokeWidth={2.4} strokeLinecap="round" />
    <line x1={7 * p} y1={-7 * p} x2={-7 * p} y2={7 * p} stroke={GOLD} strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);

const P05Type: React.FC<{f: number}> = ({f}) => {
  if (f < 262) return null;
  const a = ease(f, 266, 274, 0, 1, Easing.bezier(0.12, 1, 0.3, 1));
  const b = ease(f, 268, 276, 0, 1, Easing.bezier(0.12, 1, 0.3, 1));
  const x = ease(f, 270, 278, 0, 1, Easing.bezier(0.3, 1.5, 0.5, 1));
  // P06: contract toward the gold motif point (right edge), still moving on f299
  const c = ease(f, 288, 299, 0, 1, INE);
  return (
    <AbsoluteFill style={{transformOrigin: `${W * 0.86}px 330px`, transform: `scale(${1 - 0.55 * c})`, opacity: 1 - c * 0.85, filter: c > 0.1 ? `blur(${c * 6}px)` : undefined}}>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + 10, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - a) * -160}px)`, opacity: Math.min(1, a * 2)}}>
        <Hero text="UPGRADING SKILL" size={S_UPSKILL2} fill="ivory" pad={0.1} />
      </div>
      <div style={{position: 'absolute', left: W / 2 - 34, top: TOP + 10 + S_UPSKILL2 * 1.05}}>
        <Times p={x} size={68} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: TOP + 10 + S_UPSKILL2 * 1.05 + 76, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - b) * 160}px)`, opacity: Math.min(1, b * 2)}}>
        <Hero text="UI/UX WORKSHOP" size={S_UIUXW2} pad={0.1} />
      </div>
    </AbsoluteFill>
  );
};

// ======================= CARDS (P02–P06) =======================
// Training module: hangs from the top edge on a gold thread (P02, upper-left, clear of the face), then drops
// into the lower-left (P03), opens, task card, completed; shrinks into a chip for P05.
const MOD_ANCHOR = {x: 175, y: -10};
const MOD_LEN = 600; // thread length → module top at y ≈ 590
const swing = (f: number) => {
  // 0u ID-badge drop: damped pendulum +12° → −5° settle in ≈10 f after landing (f72)
  const t = f - 72;
  if (t < 0) return 12;
  return 12 * Math.exp(-t * 0.2) * Math.cos(t * 0.45);
};
const Module: React.FC<{f: number}> = ({f}) => {
  if (f < 63) return null;
  const drop = ease(f, 63, 72, 0, 1, Easing.bezier(0.3, 0.9, 0.4, 1.06));
  const hangS = 0.8;
  // P03 relocation f142–154: string releases, module glides to the lower-left and grows
  const rel = ease(f, 142, 154, 0, 1, Easing.bezier(0.5, 0, 0.2, 1));
  // P04/P05: shrink into a chip (f182–192), slide to the P05 left node (f262–272)
  const chip = ease(f, 172, 184, 0, 1, IO);
  const p5 = ease(f, 262, 272, 0, 1, IO);
  const c6 = ease(f, 288, 299, 0, 1, INE);
  const hangX = MOD_ANCHOR.x - (MODULE.w * hangS) / 2;
  const hangY = MOD_ANCHOR.y + MOD_LEN - (1 - drop) * (MOD_LEN + MODULE.h + 40);
  const p3 = {x: 70, y: 1240, s: 1.08};
  const p4 = {x: 40, y: 1250, s: 0.5};
  const p5n = {x: 70, y: 1290, s: 0.62};
  let x = lerp(hangX, p3.x, rel);
  let y = lerp(hangY, p3.y, rel);
  let s = lerp(hangS, p3.s, rel);
  x = lerp(x, p4.x, chip);
  y = lerp(y, p4.y, chip);
  s = lerp(s, p4.s, chip);
  x = lerp(x, p5n.x, p5);
  y = lerp(y, p5n.y, p5);
  s = lerp(s, p5n.s, p5);
  // P06 contraction toward the motif point
  x = lerp(x, W * 0.86, c6);
  y = lerp(y, 1450, c6);
  s *= 1 - 0.8 * c6;
  const rot = rel < 1 ? swing(f) * (1 - rel) + lerp(0, -4, rel) : -4 + 4 * chip;
  const open = ease(f, 150, 158, 0, 1, Easing.bezier(0.4, 0, 0.2, 1)) * (1 - ease(f, 172, 179));
  const task = ease(f, 158, 167, 0, 1, Easing.bezier(0.2, 1.2, 0.4, 1)) * (1 - ease(f, 171, 176));
  const check = ease(f, 167, 176, 0, 1, IO);
  const threadOp = 1 - ease(f, 142, 147);
  const blur = f >= 63 && f < 70 ? (1 - drop) * 8 : rel > 0.15 && rel < 0.85 ? 4 : 0;
  return (
    <>
      {threadOp > 0 && (
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: threadOp}}>
          <line
            x1={MOD_ANCHOR.x}
            y1={-20}
            x2={MOD_ANCHOR.x + Math.sin((rot * Math.PI) / 180) * (hangY + 6 - MOD_ANCHOR.y) * -1}
            y2={hangY + 6}
            stroke={GOLD}
            strokeWidth={3}
          />
        </svg>
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`,
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
          opacity: 1 - c6 * 0.6,
        }}
      >
        <div style={{transformOrigin: `${MODULE.w / 2}px 0`}}>
          <TrainingModule open={open} task={task} check={check} />
        </div>
        {f >= 168 && f < 178 && (
          <div style={{position: 'absolute', left: MODULE.w - 10, top: 230}}>
            <Ticks p={ease(f, 170, 176)} rot={30} />
          </div>
        )}
      </div>
    </>
  );
};

// Workshop card: low-fi fragment rises from the lower edge (P02, lower-right), steps aside in P03, then GROWS
// INTO the workshop card at P04 (same component idea) and is redesigned.
const CARD = {x: 230, y: 1300, s: 0.95};
const cardTimeline = (f: number) => ({
  critique: ease(f, 186, 192) * (1 - ease(f, 193, 197)),
  explode: ease(f, 193, 201, 0, 1, Easing.bezier(0.2, 0.9, 0.3, 1)) * (1 - ease(f, 207, 219, 0, 1, Easing.bezier(0.5, 0, 0.2, 1))),
  guides: ease(f, 196, 208, 0, 1, IO) * (1 - ease(f, 226, 234)),
  wire: ease(f, 196, 204) * (1 - ease(f, 216, 226)),
  fix: ease(f, 207, 219, 0, 1, Easing.bezier(0.5, 0, 0.2, 1)),
  hier: ease(f, 219, 230, 0, 1, Easing.bezier(0.3, 1.3, 0.5, 1)),
  ripple: ease(f, 245, 256, 0, 1, Easing.out(Easing.quad)),
  proto: ease(f, 248, 258, 0, 1, Easing.bezier(0.6, 0, 0.2, 1)),
});
// cursor (card-local px) → CTA (polished: x 34+18 = 52, y 214+64 = 278, ≈ 230 × 48)
const CURSOR: [number, number, number][] = [[232, 760, 560], [238, 420, 420], [242, 190, 318], [244, 176, 306], [258, 184, 312]];
const cursorAt = (f: number) => {
  const o = {...K, easing: Easing.bezier(0.45, 0, 0.25, 1)};
  const fr = CURSOR.map((c) => c[0]);
  return {x: interpolate(f, fr, CURSOR.map((c) => c[1]), o), y: interpolate(f, fr, CURSOR.map((c) => c[2]), o)};
};

const Workshop: React.FC<{f: number}> = ({f}) => {
  if (f < 69) return null;
  // P02: low-fi rises from the lower edge (9g card rise ≈12 f with blur/scale)
  const rise = ease(f, 70, 82, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const lofi0 = {x: 760, y: 1380, s: 1.0};
  // P03: steps back (smaller, dimmer) so the module leads
  const back = ease(f, 142, 154, 0, 1, IO) * (1 - ease(f, 176, 186));
  // P04: morph lo-fi → workshop card (f176–188)
  const morph = ease(f, 178, 190, 0, 1, Easing.bezier(0.5, 0, 0.15, 1));
  const p5 = ease(f, 262, 272, 0, 1, IO);
  const c6 = ease(f, 288, 299, 0, 1, INE);
  const tl = cardTimeline(f);
  // lo-fi placement
  const lx = lofi0.x + back * 120;
  const ly = lofi0.y + (1 - rise) * 640 + back * 60;
  const ls = lofi0.s * (0.92 + 0.08 * rise) * (1 - back * 0.25);
  // main card placement (P04) and its P05 node (right, smaller)
  const mx = lerp(CARD.x, 470, p5);
  const my = lerp(CARD.y, 1300, p5);
  const ms = lerp(CARD.s, 0.85, p5) * (1 - 0.82 * c6);
  const mxx = lerp(mx, W * 0.86, c6);
  const myy = lerp(my, 1450, c6);
  const cur = cursorAt(f);
  const press = f >= 244 && f < 246 ? 0.82 : 1;
  const proto03 = ease(f, 250, 259, 0, 1, Easing.bezier(0.22, 1, 0.36, 1)) * (1 - ease(f, 262, 268));
  return (
    <>
      {morph < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transformOrigin: '0 0',
            transform: `translate(${lerp(lx, CARD.x, morph)}px, ${lerp(ly, CARD.y, morph)}px) scale(${lerp(ls, (CARD.s * 640) / LOFI.w, morph)}) rotate(${(1 - rise) * 8}deg)`,
            opacity: Math.min(1, rise * 1.6) * (1 - back * 0.35) * (1 - ease(f, 185, 189)),
            filter: rise < 0.7 ? `blur(${(0.7 - rise) * 10}px)` : morph > 0.2 ? `blur(${Math.sin(morph * Math.PI) * 4}px)` : undefined,
          }}
        >
          <LofiFragment />
        </div>
      )}
      {f >= 180 && (
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${mxx}px, ${myy}px) scale(${ms})`, opacity: ease(f, 184, 189) * (1 - c6 * 0.6)}}>
          <RedesignCard {...tl} tilt={0.55} />
          {/* cursor + click (in card space so it stays on the CTA) */}
          {f >= 232 && f < 262 && (
            <div style={{position: 'absolute', left: cur.x, top: cur.y, opacity: ease(f, 232, 235) * (1 - ease(f, 256, 261))}}>
              <FragCursor press={press} />
            </div>
          )}
        </div>
      )}
      {/* support card (≤2 total with the module chip): 03 Interactive Prototype pops in after the click */}
      {proto03 > 0 && (
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${lerp(1100, 700, proto03)}px, ${1700}px) rotate(${-3 * proto03}deg) scale(0.82)`, opacity: Math.min(1, proto03 * 1.5)}}>
          <ModuleFloatCard kind="03" />
        </div>
      )}
    </>
  );
};

/** P02 accents: two short gold strokes from "DUA HAL" to the two objects; P05 connector between the nodes */
const Connectors: React.FC<{f: number}> = ({f}) => {
  const p2 = f >= 133 && f < 146;
  const op2 = 1 - ease(f, 140, 146);
  const draw5 = ease(f, 268, 280, 0, 1, IO);
  const c6 = ease(f, 288, 299, 0, 1, INE);
  return (
    <>
      {p2 && (
        <div style={{opacity: op2}}>
          <GoldConnector W={W} H={H} d={`M 330 ${TOP + S_LINE * 2.45 + S_DUAHAL * 0.95} C 260 ${TOP + 420}, 200 ${TOP + 440}, ${MOD_ANCHOR.x} 600`} draw={ease(f, 133, 140, 0, 1, IO)} end={[MOD_ANCHOR.x, 600]} />
          <GoldConnector W={W} H={H} d={`M 760 ${TOP + S_LINE * 2.45 + S_DUAHAL * 0.95} C 900 ${TOP + 520}, 960 1100, 900 1370`} draw={ease(f, 135, 143, 0, 1, IO)} end={[900, 1370]} />
        </div>
      )}
      {f >= 266 && (
        <div style={{opacity: 1 - c6}}>
          <GoldConnector W={W} H={H} d={`M 245 1500 C 300 1700, 520 1720, 560 1570`} draw={draw5} end={[560, 1570]} />
        </div>
      )}
    </>
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
  const topOp = f < CUT ? 0 : ease(f, 84, 92) * (1 - ease(f, 290, 299)) + (f >= 61 && f < 84 ? 0 : 0);
  const lowOp = f < CUT ? ease(f, 2, 12) * 0.9 * (1 - ease(f, 54, 61)) : ease(f, 176, 186) * 0.75 * (1 - ease(f, 290, 299));
  const gfxBlur = cutBlur(f);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Footage f={f} />
      <TopPlate op={topOp} />
      <LowPlate op={lowOp} />
      <AbsoluteFill style={{filter: gfxBlur > 0.05 ? `blur(${gfxBlur * 0.6}px)` : undefined}}>
        <P01 f={f} />
        <Par f={f} depth={0.35}>
          <P02Type f={f} />
          <P03Type f={f} />
          <P04Type f={f} />
          <P05Type f={f} />
        </Par>
        <Par f={f} depth={1.15}>
          <Connectors f={f} />
          <Module f={f} />
          <Workshop f={f} />
        </Par>
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
