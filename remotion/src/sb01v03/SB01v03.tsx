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
const MB: React.FC<{windows: [number, number][]; children: React.ReactNode; samples?: number}> = ({windows, children, samples = 6}) => {
  const f = useCurrentFrame();
  return windows.some(([a, b]) => inWin(f, a, b)) ? (
    <CameraMotionBlur samples={samples} shutterAngle={200}>
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

// Beat A/B footage with aperture window (ref f0–f75 measurements, window centred on the face).
const WIN_W: [number, number][] = [[0, 0], [1, 0.03], [3, 0.16], [9, 0.31], [13, 0.41], [17, 0.53], [21, 0.63], [23, 0.64], [72, 0.68], [73, 0.8], [74, 0.92], [75, 1]];
const WIN_H: [number, number][] = [[0, 0], [1, 0.02], [3, 0.11], [9, 0.19], [13, 0.24], [17, 0.31], [21, 0.4], [23, 0.42], [72, 0.44], [73, 0.62], [74, 0.85], [75, 1]];
const WIN_CY: [number, number][] = [[0, 0.4], [23, 0.43], [72, 0.43], [75, 0.5]];

const LiveAB: React.FC = () => {
  const f = useCurrentFrame();
  const ww = track(f, WIN_W, OUT) * W;
  const wh = track(f, WIN_H, OUT) * H;
  const cy = track(f, WIN_CY, INOUT) * H;
  const l = W / 2 - ww / 2;
  const t = cy - wh / 2;
  const full = f >= 75;
  const push = track(f, [[0, 0.9], [30, 1]], OUT); // camera-to-aperture push-in (scale only, no perspective change)
  const pre = track(f, [[97, 0], [101, 10], [104, 14]], IN); // pre-wipe energy
  const shake = f >= 97 ? Math.sin(f * 2.1) * pre * 1.6 : 0;
  const expBlur = track(f, [[72, 0], [73, 8], [74, 5], [75, 0]]);
  return (
    <AbsoluteFill style={{backgroundColor: INK, overflow: 'hidden'}}>
      {!full && (
        <AbsoluteFill>
          <Footage f={f} extra={push * 1.45} blur={60} />
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${INK} 0%, ${C.teal} 42%, ${C.cyan1} 64%, ${C.teal} 84%, ${INK} 100%)`, opacity: 0.82}} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{clipPath: full ? undefined : `inset(${t}px ${W - l - ww}px ${H - t - wh}px ${l}px)`, transform: `translateX(${shake}px)`}}>
        <Footage f={f} extra={push} blur={expBlur + pre} />
      </AbsoluteFill>
      {f >= 1 && f < 73 && (
        <AbsoluteFill style={{opacity: 0.5}}>
          {[l, l + ww].map((x, i) => (
            <div key={'v' + i} style={{position: 'absolute', left: x - 1, top: 0, width: 2, height: H, background: IVORY}} />
          ))}
          {[t, t + wh].map((y, i) => (
            <div key={'h' + i} style={{position: 'absolute', top: y - 1, left: 0, height: 2, width: W, background: IVORY}} />
          ))}
        </AbsoluteFill>
      )}
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

// ======================= BEAT B TYPE =======================
const S_KATA = fit('sans', 'Kata siapa,', 0.36);
const S_BANGUN = fit('serif', 'Bangun', 0.52);
const S_BISNIS = fit('serif', 'bisnis', 0.4);
const S_CUMA = fit('sans', 'cuma butuh', 0.34);
const S_UANG = fit('serif', 'UANG?', 0.7);

const TypeB: React.FC = () => {
  const f = useCurrentFrame();
  if (f < WD.Kata - 1 || f > 106) return null;
  const a = textAnchor(Math.min(f, 104));
  const y0 = a.y;
  const exit = (d: number) => ({
    opacity: lerp(f, 99 + d, 104 + d, 1, 0, IN),
    transform: `translateY(${lerp(f, 99 + d, 105 + d, 0, -160, IN)}px) scale(${lerp(f, 99 + d, 105 + d, 1, 1.1, IN)})`,
    filter: `blur(${lerp(f, 99 + d, 104 + d, 0, 10, IN)}px)`,
  });
  // group-2 compresses when UANG? lands (LOOking-style layering)
  const comp = lerp(f, WD.uang - 2, WD.uang + 5, 0, 1, INOUT);
  const g2s = 1 - 0.36 * comp;
  const g2y = -40 * comp;
  const katOut = lerp(f, WD.uang - 3, WD.uang + 3, 1, 0, IN);
  const uP = lerp(f, WD.uang, WD.uang + 6, 0, 1);
  const uS = track(f, [[WD.uang, 1.35], [WD.uang + 5, 0.96], [WD.uang + 8, 1]], [OUT, INOUT]);
  const ul = lerp(f, WD.bangun + 4, WD.bangun + 12, 1, 0);
  const cumaLine = lerp(f, WD.butuh, WD.butuh + 8, 1, 0);
  const scrib = lerp(f, WD.uang + 4, WD.uang + 12, 1, 0);
  return (
    <AbsoluteFill>
      {/* row 1: Kata siapa, (secondary) */}
      <div style={{position: 'absolute', left: 0, width: W, top: y0, display: 'flex', justifyContent: 'center', gap: S_KATA * 0.28, opacity: katOut, transform: `translateY(${-60 * (1 - katOut)}px)`}}>
        <Mask p={lerp(f, WD.Kata, WD.Kata + 6, 0, 1)}>
          <Sans text="Kata" size={S_KATA} />
        </Mask>
        <Mask p={lerp(f, WD.siapa, WD.siapa + 6, 0, 1)}>
          <Sans text="siapa," size={S_KATA} />
        </Mask>
      </div>
      {/* group 2 */}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, ...exit(2)}}>
      <div style={{position: 'absolute', left: 0, top: y0 + S_KATA * 1.25, width: W, height: 600, transformOrigin: '50% 0%', transform: `translateY(${g2y}px) scale(${g2s})`}}>
        {f >= WD.bangun && (
          <div style={{position: 'absolute', left: 0.1 * W, top: 0}}>
            <Mask p={lerp(f, WD.bangun, WD.bangun + 7, 0, 1)} dir="left" pad={60}>
              <div style={{transform: `scale(${track(f, [[WD.bangun, 1.18], [WD.bangun + 7, 1]], OUT)})`, transformOrigin: 'left center'}}>
                <Hero text="Bangun" size={S_BANGUN} fill="orange" />
              </div>
            </Mask>
            <svg width={0.52 * W} height={40} style={{position: 'absolute', left: 6, top: S_BANGUN * 1.02, overflow: 'visible'}}>
              <path d={`M4 22 C ${0.15 * W} 6, ${0.32 * W} 34, ${0.5 * W} 14`} stroke={C.orange1} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={ul} />
            </svg>
          </div>
        )}
        {f >= WD.bisnis && (
          <div style={{position: 'absolute', right: 0.08 * W, top: S_BANGUN * 0.92}}>
            <Mask p={lerp(f, WD.bisnis, WD.bisnis + 7, 0, 1)} dir="up" pad={60}>
              <Hero text="bisnis" size={S_BISNIS} fill="ivory" />
            </Mask>
          </div>
        )}
        {f >= WD.cuma && (
          <div style={{position: 'absolute', right: 0.1 * W, top: S_BANGUN * 0.92 + S_BISNIS * 1.08, display: 'flex', gap: S_CUMA * 0.28}}>
            <Mask p={lerp(f, WD.cuma, WD.cuma + 5, 0, 1)}>
              <Sans text="cuma" size={S_CUMA} />
            </Mask>
            <Mask p={lerp(f, WD.butuh, WD.butuh + 5, 0, 1)}>
              <Sans text="butuh" size={S_CUMA} />
            </Mask>
            <svg width={0.36 * W} height={24} style={{position: 'absolute', right: 0, top: S_CUMA * 1.12, overflow: 'visible'}}>
              <line x1={0.36 * W} y1={8} x2={0} y2={8} stroke={C.orange1} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={cumaLine} />
              <circle cx={0.36 * W * cumaLine} cy={8} r={9} fill={C.orange1} opacity={f >= WD.butuh ? 1 : 0} />
            </svg>
          </div>
        )}
      </div>
      </div>
      {/* hero UANG? */}
      {f >= WD.uang && (
        <div style={{position: 'absolute', left: 0, width: W, top: y0 + S_KATA * 1.25 + 360, display: 'flex', justifyContent: 'center', ...exit(4)}}>
          <div style={{position: 'relative', opacity: Math.min(1, uP * 3), transform: `scale(${uS})`, filter: `blur(${(1 - uP) * 8}px)`}}>
            <Hero text="UANG?" size={S_UANG} fill="orange" />
            <svg width={0.66 * W} height={60} style={{position: 'absolute', left: 0.02 * W, top: S_UANG * 0.98, overflow: 'visible'}}>
              <path
                d={`M6 30 C ${0.12 * W} 4, ${0.2 * W} 52, ${0.33 * W} 26 S ${0.52 * W} 8, ${0.64 * W} 30`}
                stroke={C.orange1}
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={scrib}
                style={{filter: `drop-shadow(0 5px 0 ${INK})`}}
              />
            </svg>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Small coins popping around UANG? then converging into the wipe origin (coin → circle).
const WIPE_O = {x: 0.5 * W, y: 0.7 * H};
const HookCoins: React.FC = () => {
  const f = useCurrentFrame();
  if (f < WD.uang + 4 || f > 106) return null;
  const a = textAnchor(Math.min(f, 104));
  const uy = a.y + S_KATA * 1.25 + 360 + S_UANG * 0.4;
  const items = [
    {at: WD.uang + 5, x: 0.13 * W, y: uy - 150, r: -18},
    {at: WD.uang + 8, x: 0.83 * W, y: uy - 190, r: 14},
    {at: WD.uang + 11, x: 0.76 * W, y: uy + S_UANG * 0.75, r: -8},
  ];
  return (
    <AbsoluteFill>
      {items.map((c, i) => {
        const s = track(f, [[c.at, 0], [c.at + 6, 0.62]], BACK);
        const conv = lerp(f, 97 + i, 102, 0, 1, IN);
        const x = interpolate(conv, [0, 1], [c.x, WIPE_O.x]);
        const y = interpolate(conv, [0, 1], [c.y, WIPE_O.y]);
        return (
          <div key={i} style={{position: 'absolute', left: x - COIN_W / 2, top: y - 40, transform: `rotate(${c.r + conv * 120}deg) scale(${s * (1 - conv * 0.6)})`, filter: 'drop-shadow(0 10px 12px rgba(9,41,47,0.5))'}}>
            <Coin id={`h${i}`} tilt={0.7 + 0.3 * Math.cos((f - c.at) * 0.35)} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

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

const Wipe: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const r = track(f, [[101, 0], [102, 90], [103, 300], [104, 620], [105, 1000], [106, 1420]], IN);
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
          const sy = i === 0 ? 1245 : 2150;
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
  const push = track(f, [[230, 1], [237, 1.06], [288, 1.06], [CUES.bombImpact, 1.22]], [OUT, (t) => t, OUT]);
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
        <Mask p={lerp(f, 197, 202, 0, 1)}>
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

const S_KALAU = fit('sans', 'kalau', 0.2);
const S_UIUX = fit('serif', 'UI/UX', 0.64);
const S_TAIL = 50;

/** Phone UI card crossing the bottom edge (foreground parallax): clean UI → scrambled UI on "personal"(→UI/UX). */
const PhoneFG: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 232) return null;
  const y = track(f, [[232, 1.03], [262, 0.755], [299, 0.71]], [OUT, (t) => t]) * H;
  const sc = lerp(f, WD.personal, WD.personal + 8, 0, 1, INOUT);
  const rows = [0, 1, 2, 3];
  const off = [[-40, 6], [55, -9], [-25, 12], [35, -5]];
  return (
    <div style={{position: 'absolute', left: 0.04 * W, top: y, width: 300, height: 560, borderRadius: 42, background: '#0E3A42', border: `6px solid ${INK}`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', overflow: 'hidden', transform: `rotate(${-6 + sc * 3}deg)`}}>
      <div style={{height: 110, background: ORANGE_SIMPLE, transform: `translateX(${sc * -30}px) rotate(${sc * -4}deg)`}} />
      {rows.map((r) => (
        <div
          key={r}
          style={{
            margin: '22px 22px 0',
            height: 64,
            borderRadius: 14,
            background: r % 2 ? 'rgba(46,188,213,0.55)' : 'rgba(247,244,237,0.85)',
            transform: `translate(${off[r][0] * sc}px, ${off[r][1] * sc}px) rotate(${off[r][1] * sc * 0.6}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          right: 18,
          top: 130,
          width: 92,
          height: 92,
          borderRadius: 46,
          background: C.orange1,
          border: `5px solid ${INK}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Instrument Sans UNL',
          fontWeight: 700,
          fontSize: 62,
          color: INK,
          transform: `scale(${track(f, [[WD.personal + 4, 0], [WD.personal + 10, 1]], BACK)})`,
        }}
      >
        ?
      </div>
    </div>
  );
};

/** Cursor + capsule crossing the top-right edge (moves opposite → parallax depth). */
const CursorFG: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 236) return null;
  const p = track(f, [[236, 0], [262, 1], [299, 1.35]], [OUT, (t) => t]);
  const x = interpolate(p, [0, 1], [1.08 * W, 0.8 * W]);
  const y = interpolate(p, [0, 1], [-0.06 * H, 0.13 * H]);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'rotate(-8deg)'}}>
      <svg width={84} height={104} viewBox="0 0 28 35">
        <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill={IVORY} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const TypeE2: React.FC = () => {
  const f = useCurrentFrame();
  if (f < WD.kalau2) return null;
  const a = textAnchor(Math.min(f, 287), track(f, [[230, 1], [237, 1.06]], OUT));
  const y0 = a.y + 40;
  const uP = lerp(f, WD.personal, WD.personal + 6, 0, 1);
  const uS = track(f, [[WD.personal, 1.3], [WD.personal + 5, 0.96], [WD.personal + 8, 1]], [OUT, INOUT]);
  const slash = lerp(f, WD.personal + 5, WD.personal + 12, 1, 0);
  // Beat F bomb-in
  const bomb = track(f, [[288, 1], [CUES.bombImpact, 1.2]], OUT);
  const bombY = lerp(f, 288, CUES.bombImpact, 0, -120, OUT);
  return (
    <AbsoluteFill style={{transformOrigin: `50% ${y0 + 200}px`, transform: `translateY(${bombY}px) scale(${bomb})`}}>
      <div style={{position: 'absolute', left: 0, width: W, top: y0, display: 'flex', justifyContent: 'center'}}>
        <Mask p={lerp(f, WD.kalau2, WD.kalau2 + 5, 0, 1)}>
          <Sans text="kalau" size={S_KALAU} />
        </Mask>
      </div>
      {f >= WD.personal && (
        <div style={{position: 'absolute', left: 0, width: W, top: y0 + S_KALAU * 1.05, display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', opacity: Math.min(1, uP * 3), transform: `scale(${uS})`, filter: `blur(${(1 - uP) * 8}px)`}}>
            <Hero text="UI/UX" size={S_UIUX} fill="orange" />
            <svg width={0.6 * W} height={40} style={{position: 'absolute', left: 0.04 * W, top: S_UIUX * 0.98, overflow: 'visible'}}>
              <path d={`M4 26 C ${0.2 * W} 6, ${0.4 * W} 34, ${0.58 * W} 10`} stroke={C.orange1} strokeWidth={12} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={slash} style={{filter: `drop-shadow(0 4px 0 ${INK})`}} />
            </svg>
          </div>
        </div>
      )}
      {f >= WD.tail && (
        <div style={{position: 'absolute', right: 0.1 * W, top: y0 + S_KALAU * 1.05 + S_UIUX * 1.12, transformOrigin: 'right center', transform: `scale(${track(f, [[WD.tail, 0], [WD.tail + 6, 1]], BACK)})`}}>
          <Capsule text="nggak dipikirin" size={S_TAIL} bg={ORANGE_SIMPLE} color={INK} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ======================= BEAT F: gold/teal wipe =======================
const TransferWipe: React.FC = () => {
  const f = useCurrentFrame();
  if (f < CUES.wipeF[0]) return null;
  // diagonal band travelling from bottom-right to top-left; at f299 the teal body covers the frame except
  // the top-left corner where the gold leading edge is still travelling (hand-off to SB02, never flat black)
  const p = track(f, [[CUES.wipeF[0], 0], [CUES.wipeF[1], 1]], INOUT);
  const d = interpolate(p, [0, 1], [0.55, -0.36]) * Math.hypot(W, H); // starts at the bottom-right corner (no off-screen dead time)
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: W / 2, top: H / 2, width: 0, height: 0, transform: 'rotate(-35deg)'}}>
        <div style={{position: 'absolute', left: -2000, width: 4000, top: d - 0, height: 4000, background: `linear-gradient(180deg, ${C.teal} 0px, #12505B 500px, ${INK} 1600px)`}} />
        <div style={{position: 'absolute', left: -2000, width: 4000, top: d - 90, height: 90, background: `linear-gradient(180deg, rgba(235,187,110,0) 0%, ${C.orange2} 40%, #EBBB6E 100%)`}} />
        <div style={{position: 'absolute', left: -2000, width: 4000, top: d - 4, height: 30, background: C.teal}} />
      </div>
    </AbsoluteFill>
  );
};

// ======================= ROOT =======================
export const SB01v03: React.FC = () => {
  const f = useCurrentFrame();
  const plateB = lerp(f, 40, 52, 0, 1) * lerp(f, 99, 104, 1, 0);
  const plateE = lerp(f, 231, 240, 0, 1);
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      {/* A + B live action (until wipe completes) */}
      {f <= 106 && <LiveAB />}
      {f <= 106 && <Plate op={plateB} />}
      {f <= 106 && (
        <MB windows={[[WD.uang, WD.uang + 6], [97, 106]]}>
          <TypeB />
          <HookCoins />
        </MB>
      )}
      {/* C + D: ivory field with Panel 04 */}
      {f >= 101 && f <= 232 && (
        <Wipe>
          <IvoryField />
          <MB windows={[[109, 140], [WD.nol, WD.nol + 5], [188, 198]]} samples={5}>
            <Panel04 />
          </MB>
        </Wipe>
      )}
      {/* E: card re-entry + type */}
      {f >= 192 && <LiveE />}
      {f >= 196 && f <= 230 && (
        <MB windows={[[224, 230]]}>
          <TypeE1 />
        </MB>
      )}
      {f >= 230 && <Plate op={plateE} />}
      {f >= 232 && (
        <MB windows={[[236, 246], [287, 299]]}>
          <PhoneFG />
          <CursorFG />
        </MB>
      )}
      {f >= WD.kalau2 && (
        <MB windows={[[WD.personal, WD.personal + 6], [288, 294]]}>
          <TypeE2 />
        </MB>
      )}
      {/* F transfer */}
      <TransferWipe />
      <AudioMix />
    </AbsoluteFill>
  );
};
