// SB01 v03 — hard rebuild. Output frame == master frame (0.000 s start, lip-sync verified).
// Beats (cues.json): A 0–23 aperture | B 24–104 hook type | C 105–116 ivory wipe | D 117–197 coins→gears→0%→NOL |
// E 198–287 card re-entry + UI/UX | F 288–299 bomb-in / transfer to SB02.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {BACK, IN, INOUT, OUT, track} from '../lib/anim';
import {loadFonts} from '../lib/fonts';
import {C, CYAN_LABEL, H, ORANGE_SIMPLE, W} from '../lib/tokens';
import {AudioMix} from './AudioMix';
import {Hero2Doodles, LiveOpen, OpeningScribble, OpeningScribble2, OpeningType} from './Opening';
import {CAM_E, WIPE_R} from './refTracks';
import {DashboardPoor, UiuxType} from './UiuxBeat';
import {COIN_T, COIN_W, Coin, Gear, Grain} from './Illustration';
import {CUES, FOOT_SCALE, INK, IVORY, fit, shotOffset, textAnchor} from './layout';
import {Capsule, Hero, Mask, Sans} from './Type';

loadFonts();

const SRC = staticFile('master/IMG_6757_0-10.5_v03_graded_cfr30.mp4');
const K = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (f: number, a: number, b: number, v0: number, v1: number, e = OUT) => interpolate(f, [a, b], [v0, v1], {...K, easing: e});
const WD = CUES.words;
const inWin = (f: number, a: number, b: number) => f >= a && f <= b;

/** Motion blur only for graphics, only inside the given windows. */
const MB: React.FC<{windows: [number, number][]; children: React.ReactNode; samples?: number; shutter?: number}> = ({windows, children, samples = 6, shutter = 200}) => {
  const f = useCurrentFrame();
  return windows.some(([a, b]) => inWin(f, a, b)) ? (
    <CameraMotionBlur samples={samples} shutterAngle={shutter}>
      {children}
    </CameraMotionBlur>
  ) : (
    <>{children}</>
  );
};

// ======================= FOOTAGE =======================
const Footage: React.FC<{f: number; extra?: number; blur?: number}> = ({f, extra = 1, blur = 0}) => {
  const {dx, dy} = shotOffset(f);
  return (
    <AbsoluteFill style={{transform: `translate(${dx * extra}px, ${dy * extra}px) scale(${FOOT_SCALE * extra})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
      <OffthreadVideo src={SRC} muted style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};

/** Teal gradient plate behind lower-third type (never over the face). */
const Plate: React.FC<{op: number}> = ({op}) => (
  <AbsoluteFill
    style={{
      opacity: op,
      background: 'linear-gradient(180deg, rgba(9,41,47,0) 0%, rgba(9,41,47,0) 46%, rgba(9,41,47,0.55) 62%, rgba(9,41,47,0.78) 80%, rgba(9,41,47,0.85) 100%)',
    }}
  />
);

// ======================= BEAT C: ivory circle wipe (covers true cut f107) =======================
const IvoryField: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 40%, #FFFDF8 0%, ${IVORY} 55%, #EDE6D8 100%)`}}>
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.35}}>
        <path d={`M-80 ${0.78 * H} C ${0.3 * W} ${0.7 * H}, ${0.7 * W} ${0.9 * H}, ${1.1 * W} ${0.74 * H}`} stroke={C.cyan2} strokeWidth={3} fill="none" />
        <path d={`M-80 ${0.2 * H} C ${0.35 * W} ${0.12 * H}, ${0.6 * W} ${0.3 * H}, ${1.1 * W} ${0.16 * H}`} stroke={C.orange2} strokeWidth={2} fill="none" />
      </svg>
      <Grain frame={f} opacity={0.08} />
    </AbsoluteFill>
  );
};

const WIPE_O = {x: 0.5 * W, y: 0.49 * H}; // ref circle origin (0.5, 0.49) of the AFTER panel
const Wipe: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const r = WIPE_R(f); // ref coverage curve f115–f119, shifted −13 f
  const full = f >= 106;
  return (
    <AbsoluteFill style={{clipPath: full ? undefined : `circle(${r}px at ${WIPE_O.x}px ${WIPE_O.y}px)`}}>
      {children}
      {/* energy ring continuing after full cover (ring, not disc) */}
      {f >= 104 && f <= 116 && (() => {
        const R = lerp(f, 104, 116, 220, 1500);
        return (
          <div
            style={{
              position: 'absolute',
              left: WIPE_O.x - R,
              top: WIPE_O.y - R,
              width: R * 2,
              height: R * 2,
              borderRadius: '50%',
              border: `${lerp(f, 104, 116, 14, 4)}px solid ${C.teal}`,
              boxSizing: 'border-box',
              opacity: lerp(f, 108, 116, 0.7, 0),
            }}
          />
        );
      })()}
    </AbsoluteFill>
  );
};

// ======================= BEAT D: Panel 04 =======================
const STACK = {x: 340, base: 1010};
const G1 = {x: 745, y: 905, r: 150, teeth: 12};
const G2 = {x: 922, y: 727, r: 100, teeth: 8};
const BAR = {x: 170, y: 1235, w: 600, h: 62};

// camera (world → screen): zoom about focus point
const CAM: {f: number; z: number; x: number; y: number}[] = [
  {f: 101, z: 1.45, x: 420, y: 980},
  {f: 118, z: 1.65, x: 360, y: 940},
  {f: 140, z: 2.0, x: 350, y: 880},
  {f: 153, z: 1.1, x: 560, y: 1000},
  {f: 166, z: 1.12, x: 560, y: 1080},
  {f: 197, z: 1.12, x: 560, y: 1080},
];
const cam = (f: number) => {
  const ks = (k: 'z' | 'x' | 'y') => track(f, CAM.map((c) => [c.f, c[k]] as [number, number]), INOUT);
  return {z: ks('z'), x: ks('x'), y: ks('y')};
};

// gear-1 angle: integrate speed profile (deg/frame), deterministic for fractional frames (motion blur)
const G = CUES.gears;
const speed = (t: number) => {
  if (t < G.start) return 0;
  if (t < G.peak) return 18 * ((t - G.start) / (G.peak - G.start)) ** 2;
  if (t < G.stop) return 18 * (1 - (t - G.peak) / (G.stop - G.peak)) ** 2;
  return 0;
};
const gearAngle = (t: number) => {
  let a = 0;
  for (let x = G.start; x < Math.min(t, G.stop); x += 0.1) a += speed(x) * 0.1;
  if (t > G.stop) a += -5 * Math.sin(Math.min(1, (t - G.stop) / (G.wobbleEnd - G.stop)) * Math.PI) * Math.exp(-(t - G.stop) * 0.25);
  return a;
};

const S_NOL = fit('serif', 'NOL', 0.56);
const S_CAP = 46;

const Panel04: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 100 || f > 198) return null;
  const c = cam(f);
  // collapse f188–197 into a card that flies up
  const col = lerp(f, 188, 197, 0, 1, IN);
  const worldTf = `translate(${W / 2 - c.x * c.z}px, ${H / 2 - c.y * c.z}px) scale(${c.z})`;
  const a1 = gearAngle(f);
  const a2 = -a1 * (G1.teeth / G2.teeth) + 15;
  // progress: fill 0 → 9 % → back to 0 (stall), then 0 %
  const fill = track(f, [[164, 0], [168, 0.09], [171, 0.09], [175, 0]], [OUT, INOUT, IN]);
  const pct = Math.round(fill * 100);
  const flash = f >= 175 && f <= 180 ? 1 - (f - 175) / 5 : 0;
  const nolP = lerp(f, WD.nol, WD.nol + 3, 0, 1);
  const nolS = track(f, [[WD.nol, 1.75], [WD.nol + 4, 0.93], [WD.nol + 7, 1]], [OUT, INOUT]);
  const arrow = lerp(f, 142, 150, 1, 0);
  return (
    <AbsoluteFill
      style={{
        transformOrigin: '50% 30%',
        transform: `translateY(${-col * 1250}px) scale(${1 - col * 0.62})`,
        borderRadius: col * 120,
        overflow: col > 0 ? 'hidden' : undefined,
        border: col > 0 ? `${10 + col * 10}px solid ${C.teal}` : undefined,
        boxShadow: col > 0 ? '0 40px 80px rgba(9,41,47,0.45)' : undefined,
        opacity: lerp(f, 194, 198, 1, 0, IN),
      }}
    >
      {col > 0 && <IvoryField />}
      <AbsoluteFill style={{transformOrigin: '0 0', transform: worldTf}}>
        {/* arrow stack → gear */}
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d="M 470 800 C 540 740, 600 760, 640 830" stroke={C.teal} strokeWidth={9} strokeLinecap="round" strokeDasharray="0.04 0.03" pathLength={1} strokeDashoffset={arrow} fill="none" opacity={f >= 142 ? 1 : 0} />
          <path d="M 622 812 L 648 842 L 652 800" stroke={C.teal} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={f >= 150 ? 1 : 0} />
        </svg>
        {/* gears */}
        <div style={{position: 'absolute', left: G2.x - G2.r - 20, top: G2.y - G2.r - 20, transform: `scale(${track(f, [[134, 0], [142, 1]], BACK)})`}}>
          <Gear id="g2" teeth={G2.teeth} r={G2.r} angle={a2} />
        </div>
        <div style={{position: 'absolute', left: G1.x - G1.r - 20, top: G1.y - G1.r - 20, transform: `scale(${track(f, [[131, 0], [139, 1]], BACK)})`}}>
          <Gear id="g1" teeth={G1.teeth} r={G1.r} angle={a1} />
        </div>
        {/* coin stack: 8 coins, each its own flight */}
        {CUES.coinLand.map((land, i) => {
          // coin 0 continues the hook coin out of the wipe origin (no dead ivory frames f106–f109)
          const start = i === 0 ? 104 : land - 9;
          if (f < start) return null;
          const p = lerp(f, start, land, 0, 1, (t) => 1 - (1 - t) ** 3);
          const tx = STACK.x + [0, 6, -5, 7, -6, 4, -4, 5][i];
          const ty = STACK.base - i * COIN_T;
          const sx = i === 0 ? 420 : STACK.x + [-220, 180, -120, 240, -260, 120, -60, 200][i];
          const sy = i === 0 ? 967 : 2150;
          const x = interpolate(p, [0, 1], [sx, tx]);
          const y = interpolate(p, [0, 1], [sy, ty]) - Math.sin(p * Math.PI) * 140;
          const spin = (1 - p) * (5 + i * 0.7);
          const squash = track(f, [[land, 0.9], [land + 3, 1]], OUT);
          // the top two coins feed the gear (f146–f158)
          const feed = i >= 6 ? lerp(f, 146 + (i - 6) * 3, 157 + (i - 6) * 3, 0, 1, INOUT) : 0;
          const fx = interpolate(feed, [0, 1], [x, G1.x]);
          const fy = interpolate(feed, [0, 1], [y, G1.y]) - Math.sin(feed * Math.PI) * 160;
          if (feed >= 1) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: fx - COIN_W / 2,
                top: fy - 34,
                zIndex: i,
                transform: `scale(${(1 - feed * 0.55) * 1}, ${squash * (1 - feed * 0.55)}) rotate(${(1 - p) * (i % 2 ? 40 : -40)}deg)`,
                opacity: 1 - Math.max(0, feed - 0.8) * 5,
                filter: i === 0 ? 'drop-shadow(0 22px 18px rgba(9,41,47,0.28))' : undefined,
              }}
            >
              <Coin id={`s${i}`} tilt={Math.abs(Math.cos(spin))} shade={i < 7 && f >= CUES.coinLand[i + 1] ? 0.05 : 0} />
            </div>
          );
        })}
        {/* labels */}
        {f >= WD.modal && (
          <div style={{position: 'absolute', left: STACK.x, top: 640, transform: `translate(-50%, 0) scale(${track(f, [[WD.modal, 0], [WD.modal + 6, 1]], BACK)})`}}>
            <Capsule text="MODAL GEDE" size={S_CAP} bg={ORANGE_SIMPLE} color={INK} />
          </div>
        )}
        {f >= WD.skill && (
          <div style={{position: 'absolute', left: G1.x - 10, top: 1095, transform: `translate(-50%, 0) scale(${track(f, [[WD.skill, 0], [WD.skill + 6, 1]], BACK)})`}}>
            <Capsule text="SKILL EKSEKUSI" size={S_CAP} bg={CYAN_LABEL} color="#FFFFFF" />
          </div>
        )}
        {/* progress */}
        {f >= 158 && (
          <div style={{position: 'absolute', left: BAR.x, top: BAR.y, opacity: lerp(f, 158, 162, 0, 1), transform: `translateY(${lerp(f, 158, 163, 30, 0)}px)`}}>
            <div style={{position: 'relative', width: BAR.w, height: BAR.h, borderRadius: BAR.h / 2, background: 'rgba(24,98,111,0.14)', border: `6px solid ${flash > 0 ? C.orange1 : C.teal}`, boxSizing: 'border-box', overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: ORANGE_SIMPLE}} />
            </div>
            <div style={{position: 'absolute', left: BAR.w + 30, top: -10, transform: `scale(${1 + flash * 0.25})`, transformOrigin: 'left center'}}>
              <Sans text={`${pct}%`} size={78} color={INK} shadow={false} />
            </div>
          </div>
        )}
        {/* NOL */}
        {f >= WD.nol && (
          <div style={{position: 'absolute', left: 0, width: W, top: 1360, display: 'flex', justifyContent: 'center'}}>
            <div style={{opacity: nolP, transform: `scale(${nolS})`, filter: `blur(${(1 - nolP) * 10}px)`}}>
              <Hero text="NOL" size={S_NOL} fill="orange" />
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ======================= BEAT E =======================
const CARD = {
  top: [[192, 1.12], [206, 0.36], [224, 0.345], [230, 0]] as [number, number][],
  rot: [[192, 26], [206, 0]] as [number, number][],
  k: [[192, 0.84], [224, 0.84], [230, 1]] as [number, number][],
  x: [[192, 0.08], [224, 0.08], [230, 0]] as [number, number][],
  r: [[192, 44], [224, 44], [230, 0]] as [number, number][],
};

const LiveE: React.FC = () => {
  const f = useCurrentFrame();
  const k = track(f, CARD.k, INOUT);
  const top = track(f, CARD.top, [OUT, INOUT, INOUT]) * H;
  const x = track(f, CARD.x, INOUT) * W;
  const rad = track(f, CARD.r, INOUT);
  const rot = track(f, CARD.rot, OUT);
  const focus = track(f, [[230, 0], [232, 12], [235, 3], [237, 0]], INOUT);
  const push = CAM_E(f); // ref push f221–222, pull-out ≈9 % f224–234, bomb push f286–294
  const vig = lerp(f, 230, 234, 0, 1);
  return (
    <AbsoluteFill style={{perspective: 1800}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top,
          width: W * k,
          height: H * k,
          borderRadius: rad,
          overflow: 'hidden',
          transform: `rotateX(${rot}deg)`,
          transformOrigin: '50% 0%',
          boxShadow: k < 1 ? '20px 30px 50px rgba(9,41,47,0.45)' : undefined,
        }}
      >
        <div style={{width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0', position: 'relative'}}>
          <Footage f={f} extra={push} blur={focus} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 38%, rgba(9,41,47,0) 55%, rgba(9,41,47,0.7) 100%)', opacity: vig}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S_DAN = fit('sans', 'dan percuma', 0.34);
const S_PRODUK = fit('serif', 'Produk', 0.5);
const S_BAGUS = fit('serif', 'bagus', 0.4);

const TypeE1: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 196 || f > 230) return null;
  const ex = lerp(f, 224, 229, 0, 1, IN);
  return (
    <AbsoluteFill style={{transform: `translateY(${-ex * 600}px)`, opacity: 1 - ex}}>
      <div style={{position: 'absolute', left: 0.08 * W, top: 0.07 * H, display: 'flex', gap: S_DAN * 0.28}}>
        <Mask p={lerp(f, 198, 203, 0, 1)}>
          <Sans text="dan" size={S_DAN} color={INK} shadow={false} />
        </Mask>
        <Mask p={lerp(f, WD.percuma2, WD.percuma2 + 5, 0, 1)}>
          <Sans text="percuma" size={S_DAN} color={INK} shadow={false} />
        </Mask>
      </div>
      {f >= WD.produk && (
        <div style={{position: 'absolute', left: 0.06 * W, top: 0.07 * H + S_DAN * 1.2}}>
          <Mask p={lerp(f, WD.produk, WD.produk + 6, 0, 1)} dir="left" pad={60}>
            <Hero text="Produk" size={S_PRODUK} fill="orange" />
          </Mask>
        </div>
      )}
      {f >= WD.bagus && (
        <div style={{position: 'absolute', right: 0.08 * W, top: 0.07 * H + S_DAN * 1.2 + S_PRODUK * 0.86}}>
          <Mask p={lerp(f, WD.bagus, WD.bagus + 5, 0, 1)} dir="up" pad={60}>
            <Hero text="bagus" size={S_BAGUS} fill="orange" />
          </Mask>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ======================= ROOT =======================
export const SB01v04: React.FC = () => {
  const f = useCurrentFrame();
  const plateB = lerp(f, 40, 52, 0, 1) * lerp(f, 99, 104, 1, 0);
  const plateE = lerp(f, 231, 240, 0, 1) * lerp(f, 292, 297, 1, 0);
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      {/* A–B: measured aperture, camera, doodles, typography */}
      {f <= 106 && <LiveOpen />}
      {f <= 106 && <Plate op={plateB} />}
      {f <= 106 && (
        <MB windows={[[3, 37], [54, 64], [74, 95], [97, 106]]} samples={6}>
          <OpeningScribble />
          <OpeningScribble2 />
          <Hero2Doodles />
          <OpeningType />
        </MB>
      )}
      {/* C–D: ivory wipe + Panel 04 (retained from v03) */}
      {f >= 101 && f <= 232 && (
        <Wipe>
          <IvoryField />
          <MB windows={[[104, 140], [WD.nol, WD.nol + 5], [188, 198]]} samples={5}>
            <Panel04 />
          </MB>
        </Wipe>
      )}
      {/* E: card re-entry + copy (retained), then UI/UX beat */}
      {f >= 192 && <LiveE />}
      {f >= 196 && f <= 230 && (
        <MB windows={[[224, 230]]}>
          <TypeE1 />
        </MB>
      )}
      {f >= 230 && <Plate op={plateE} />}
      {f >= 251 && (
        <MB windows={[[251, 264], [287, 299]]} samples={24} shutter={160}>
          <DashboardPoor />
        </MB>
      )}
      {f >= WD.kalau2 && (
        <MB windows={[[WD.personal, WD.personal + 4], [287, 295]]}>
          <UiuxType />
        </MB>
      )}
      <AudioMix />
    </AbsoluteFill>
  );
};
