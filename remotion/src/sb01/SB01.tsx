import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BACK, IN, INOUT, OUT, track} from '../lib/anim';
import {loadFonts} from '../lib/fonts';
import {C, CYAN_LABEL, FONT_SANS, FONT_SERIF, H, ORANGE_GLOW_TEXT, ORANGE_SIMPLE, W} from '../lib/tokens';
import * as T from './timeline';

loadFonts();

const MASTER = staticFile('master/IMG_6757_0-10.5_cfr30.mp4');
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (f: number, a: number, b: number, v0: number, v1: number, e = OUT) =>
  interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});

// ---------- footage ----------
const Footage: React.FC<{frame: number; extraScale?: number; blur?: number; muted?: boolean; volume?: number}> = ({
  frame,
  extraScale = 1,
  blur = 0,
  muted = true,
  volume = 1,
}) => {
  const o = frame < T.MASTER_CUT_1 ? T.FOOT.shot1 : T.FOOT.shot2;
  const s = T.FOOT.scale * extraScale;
  return (
    <AbsoluteFill style={{transform: `translate(${o.dx}px, ${o.dy}px) scale(${s})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
      <OffthreadVideo src={MASTER} muted={muted} volume={volume} style={{width: W, height: H}} />
    </AbsoluteFill>
  );
};

// ---------- text primitives ----------
const Serif: React.FC<{size: number; children: React.ReactNode; style?: React.CSSProperties}> = ({size, children, style}) => (
  <div style={{position: 'absolute', filter: 'drop-shadow(0 3px 0 rgba(9,41,47,0.85)) drop-shadow(0 10px 22px rgba(9,41,47,0.7))', ...style}}>
    <span
      style={{
        fontFamily: FONT_SERIF,
        fontWeight: 700,
        fontStyle: 'italic',
        fontSize: size,
        lineHeight: 1,
        letterSpacing: -1,
        whiteSpace: 'nowrap',
        backgroundImage: ORANGE_GLOW_TEXT,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        paddingRight: size * 0.12,
      }}
    >
      {children}
    </span>
  </div>
);

const Sans: React.FC<{size: number; weight?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  size,
  weight = 600,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      fontFamily: FONT_SANS,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.1,
      color: C.white,
      whiteSpace: 'nowrap',
      textShadow: '0 2px 10px rgba(9,41,47,0.6)',
      ...style,
    }}
  >
    {children}
  </div>
);

const typed = (s: string, f: number, a: number, b: number) => s.slice(0, Math.round(lerp(f, a, b, 0, s.length, (t) => t)));

// pop-in used for big words: opacity, scale overshoot, blur
const popIn = (f: number, at: number, from = 0.6) => ({
  opacity: lerp(f, at, at + 2, 0, 1),
  transform: `scale(${track(f, [[at, from], [at + 4, 1.06], [at + 7, 1]], [OUT, INOUT])})`,
  filter: `blur(${lerp(f, at, at + 4, 10, 0)}px)`,
});

const Handles: React.FC = () => (
  <>
    {[
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ].map(([x, y], i) => (
      <div
        key={i}
        style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 12, height: 12, marginLeft: -6, marginTop: -6, background: C.white, borderRadius: 2}}
      />
    ))}
  </>
);

// ---------- Beat A ----------
const BeatA: React.FC<{f: number}> = ({f}) => {
  const ww = track(f, T.WIN_W, OUT) * W;
  const wh = track(f, T.WIN_H, OUT) * H;
  const cy = track(f, T.WIN_CY, INOUT) * H;
  const left = W / 2 - ww / 2;
  const top = cy - wh / 2;
  const pre = track(f, T.PREWIPE, IN);
  const shakeX = f >= 98 ? Math.sin(f * 2.3) * pre * 0.9 : 0;
  const full = f >= 75;
  const gridOp = f >= 1 && f < 73 ? 0.45 : 0;
  const winBlur = track(f, T.WIN_BLUR) + pre;

  // texts
  const siapaOut = lerp(f, T.T_SIAPA_OUT, T.T_SIAPA_OUT + 3, 1, 0);
  const box = lerp(f, T.T_BOX[0], T.T_BOX[1], 0, 1);
  const uangReveal = lerp(f, T.T_UANG[0], T.T_UANG[1], 0, 1, (t) => t);
  const textBlur = pre * 0.6;

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.tealDark}}>
      {/* blurred, brand-tinted background plate (ref: pink-tinted blur of the same footage) */}
      {!full && (
        <AbsoluteFill>
          <Footage frame={f} extraScale={1.5} blur={70} />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${C.tealDark} 0%, ${C.teal} 38%, ${C.cyan1} 62%, ${C.teal} 82%, ${C.tealDark} 100%)`,
              opacity: 0.8,
              mixBlendMode: 'normal',
            }}
          />
        </AbsoluteFill>
      )}
      {/* sharp footage through window */}
      <AbsoluteFill style={{clipPath: full ? undefined : `inset(${top}px ${W - left - ww}px ${H - top - wh}px ${left}px)`, transform: `translateX(${shakeX * 3}px) scale(${1 + pre * 0.003})`}}>
        <Footage frame={f} blur={winBlur} muted={false} />
      </AbsoluteFill>
      {/* grid guides on window edges */}
      {gridOp > 0 && (
        <AbsoluteFill style={{opacity: gridOp}}>
          {[left, left + ww].map((x, i) => (
            <div key={'v' + i} style={{position: 'absolute', left: x - 1, top: 0, width: 2, height: H, background: C.white}} />
          ))}
          {[top, top + wh].map((y, i) => (
            <div key={'h' + i} style={{position: 'absolute', top: y - 1, left: 0, height: 2, width: W, background: C.white}} />
          ))}
        </AbsoluteFill>
      )}
      {/* white scribble (ref f3–f16) */}
      <svg width={W} height={H} style={{position: 'absolute', opacity: lerp(f, T.SCRIBBLE.fade[0], T.SCRIBBLE.fade[1], 1, 0, IN)}}>
        <path
          d="M 720 640 C 770 560, 760 480, 690 470 C 640 462, 560 470, 520 500"
          stroke={C.white}
          strokeWidth={22}
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={lerp(f, T.SCRIBBLE.draw[0], T.SCRIBBLE.draw[1], 1, 0)}
        />
      </svg>

      <AbsoluteFill style={{filter: textBlur > 0.1 ? `blur(${textBlur}px)` : undefined, transform: `translateX(${shakeX * 4}px)`}}>
        {/* small "Kata" (ref "If there's") */}
        {f >= T.T_KATA && f < T.T_SIAPA_OUT + 3 && (
          <Sans size={44} style={{left: 0.25 * W, top: 0.535 * H, opacity: lerp(f, T.T_KATA, T.T_KATA + 3, 0, 1) * siapaOut, transform: `translateY(${lerp(f, T.T_KATA, T.T_KATA + 5, 14, 0)}px)`}}>
            Kata
          </Sans>
        )}
        {/* big 1 "Siapa?" (ref "One Thing") */}
        {f >= T.T_SIAPA_IN && f < T.T_SIAPA_OUT + 3 && (
          <div style={{position: 'absolute', left: 0, width: W, top: 0.56 * H, display: 'flex', justifyContent: 'center', opacity: siapaOut}}>
            <div style={{position: 'relative', ...popIn(f, T.T_SIAPA_IN)}}>
              <Serif size={150} style={{position: 'relative'}}>Siapa?</Serif>
            </div>
          </div>
        )}
        {/* big 2 "Bangun Bisnis" (ref "LOOking") */}
        {f >= T.T_BISNIS_IN && (
          <div style={{position: 'absolute', left: 0, width: W, top: 0.565 * H, display: 'flex', justifyContent: 'center'}}>
            <div style={{position: 'relative', ...popIn(f, T.T_BISNIS_IN, 0.7)}}>
              <Serif size={128} style={{position: 'relative'}}>Bangun Bisnis</Serif>
            </div>
          </div>
        )}
        {/* orange slash beside headline (ref pink slash) */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: lerp(f, T.T_SWOOSH[1] - 3, T.T_SWOOSH[1], 1, 0)}}>
          <path
            d="M 905 1040 C 950 1080, 940 1140, 880 1170"
            stroke={C.orange1}
            strokeWidth={20}
            strokeLinecap="round"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={f < T.T_SWOOSH[0] ? 1 : lerp(f, T.T_SWOOSH[0], T.T_SWOOSH[0] + 6, 1, 0)}
          />
        </svg>
        {/* small "cuma butuh" right-aligned (ref "forward to") */}
        {f >= T.T_CUMA && (
          <Sans size={40} style={{right: 0.22 * W, top: 0.632 * H, opacity: lerp(f, T.T_CUMA, T.T_CUMA + 3, 0, 1)}}>
            {typed('cuma butuh', f, T.T_CUMA, T.T_CUMA + 6)}
          </Sans>
        )}
        {/* rule + dot (ref) */}
        <div style={{position: 'absolute', left: 0.5 * W, top: 0.66 * H, height: 3, width: lerp(f, T.T_RULE[0], T.T_RULE[1], 0, 0.26 * W), background: C.white, opacity: 0.9}} />
        {f >= T.T_RULE[0] && <div style={{position: 'absolute', left: 0.5 * W - 9, top: 0.66 * H - 8, width: 18, height: 18, borderRadius: 9, background: C.orange1}} />}
        {/* box with handles (ref "2025") */}
        {f >= T.T_BOX[0] && (
          <div
            style={{
              position: 'absolute',
              left: 0.25 * W,
              top: 0.675 * H,
              width: 0.5 * W,
              height: 0.075 * H,
              transformOrigin: 'left center',
              transform: `scaleX(${box})`,
              background: 'rgba(9,41,47,0.72)',
              border: `2px solid ${C.white}`,
            }}
          >
            <Handles />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                clipPath: `inset(0 ${(1 - uangReveal) * 100}% 0 0)`,
                filter: `blur(${(1 - uangReveal) * 5}px)`,
              }}
            >
              <span style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: 92, color: C.white, letterSpacing: 4}}>UANG?</span>
            </div>
          </div>
        )}
      </AbsoluteFill>

      {/* circle wipe (ref white circle f115–119; brand plate colour) */}
      {f >= 102 && (
        <div
          style={{
            position: 'absolute',
            left: T.CIRCLE_CENTER.x * W,
            top: T.CIRCLE_CENTER.y * H,
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: C.tealDark,
            boxShadow: `0 0 0 ${track(f, T.CIRCLE_R, IN)}px ${C.tealDark}`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ---------- Beat B plate + graphics ----------
const Plate: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 45% at 50% 30%, rgba(46,188,213,0.22) 0%, rgba(24,98,111,0.18) 45%, rgba(9,41,47,0) 75%), ${C.tealDark}`,
    }}
  />
);

const Banknote: React.FC = () => (
  <svg width={300} height={190} viewBox="0 0 300 190">
    <defs>
      <linearGradient id="bn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.orange2} />
        <stop offset="1" stopColor={C.orange1} />
      </linearGradient>
    </defs>
    <rect x="18" y="8" width="270" height="160" rx="22" fill={C.teal} transform="rotate(-8 150 90)" />
    <rect x="10" y="20" width="270" height="160" rx="22" fill="url(#bn)" />
    <rect x="28" y="38" width="234" height="124" rx="14" fill="none" stroke={C.white} strokeOpacity="0.7" strokeWidth="4" />
    <circle cx="145" cy="100" r="36" fill="none" stroke={C.white} strokeWidth="8" />
    <circle cx="60" cy="100" r="8" fill={C.white} />
    <circle cx="230" cy="100" r="8" fill={C.white} />
  </svg>
);

const Cursor: React.FC<{press: number}> = ({press}) => (
  <svg width={56} height={70} viewBox="0 0 28 35" style={{transform: `scale(${press})`, transformOrigin: '4px 4px'}}>
    <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill={C.white} stroke={C.tealDark} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const Tile: React.FC<{i: number}> = ({i}) => {
  // mini UI screens (native, editable) — illustrative only, no data
  const accent = i % 3 === 0 ? ORANGE_SIMPLE : i % 3 === 1 ? CYAN_LABEL : `linear-gradient(180deg, ${C.teal}, ${C.tealDark})`;
  return (
    <div style={{width: 160, height: 150, borderRadius: 18, background: '#0F3A42', border: `2px solid rgba(46,188,213,0.35)`, padding: 12, boxSizing: 'border-box'}}>
      <div style={{height: 64, borderRadius: 10, background: accent}} />
      <div style={{height: 10, width: '80%', marginTop: 12, borderRadius: 5, background: 'rgba(255,255,255,0.75)'}} />
      <div style={{height: 10, width: '55%', marginTop: 8, borderRadius: 5, background: 'rgba(255,255,255,0.4)'}} />
    </div>
  );
};

const BeatBGraphics: React.FC<{f: number}> = ({f}) => {
  const groupY = lerp(f, T.GROUP_UP[0], T.GROUP_UP[1], 0, -1300, IN);
  // icon
  const iconT = lerp(f, T.ICON_IN[0], T.ICON_IN[1], 0, 1);
  const iconX = interpolate(iconT, [0, 1], [0.12 * W, 0.5 * W]);
  const iconY = interpolate(iconT, [0, 1], [0.95 * H, 0.5 * H]);
  const iconRot = interpolate(iconT, [0, 1], [-320, 0]);
  const iconS = interpolate(iconT, [0, 1], [0.6, 1.3]) * lerp(f, T.ICON_OUT[0], T.ICON_OUT[1], 1, 0.25, IN);
  const iconOp = lerp(f, T.ICON_OUT[0], T.ICON_OUT[1], 1, 0, IN);
  const iconBlur = lerp(f, T.ICON_IN[0], T.ICON_IN[0] + 10, 8, 0);
  // pill → card
  const pillW = lerp(f, T.PILL_GROW[0], T.PILL_GROW[1], 120, 480);
  const m = lerp(f, T.CARD_MORPH[0], T.CARD_MORPH[1], 0, 1, INOUT);
  const boxW = interpolate(m, [0, 1], [pillW, 600]);
  const boxH = interpolate(m, [0, 1], [86, 470]);
  const boxCY = interpolate(m, [0, 1], [0.5 * H, 0.48 * H]);
  const pillOp = lerp(f, T.PILL_GROW[0], T.PILL_GROW[0] + 2, 0, 1);
  const knobX = lerp(f, T.CURSOR.click, T.CURSOR.click + 5, 1, 0, INOUT); // 1 = on (right)
  const curT = lerp(f, T.CURSOR.enter, T.CURSOR.arrive, 0, 1, OUT);
  const press = f >= T.CURSOR.click && f < T.CURSOR.click + 3 ? 0.85 : 1;
  const pillContentOp = 1 - m;

  return (
    <AbsoluteFill style={{transform: `translateY(${groupY}px)`}}>
      {f >= T.ICON_IN[0] && f < T.ICON_OUT[1] && (
        <div style={{position: 'absolute', left: iconX - 150, top: iconY - 95, transform: `rotate(${iconRot}deg) scale(${iconS})`, opacity: iconOp, filter: `blur(${iconBlur}px) drop-shadow(0 18px 30px rgba(0,0,0,0.35))`}}>
          <Banknote />
        </div>
      )}
      {f >= T.PILL_GROW[0] && (
        <div
          style={{
            position: 'absolute',
            left: W / 2 - boxW / 2,
            top: boxCY - boxH / 2,
            width: boxW,
            height: boxH,
            borderRadius: interpolate(m, [0, 1], [43, 36]),
            background: m < 0.5 ? CYAN_LABEL : '#0E3A42',
            border: m < 0.5 ? 'none' : `2px solid rgba(46,188,213,0.55)`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
            opacity: pillOp,
            overflow: 'hidden',
          }}
        >
          {/* pill content */}
          <div style={{position: 'absolute', inset: 0, opacity: pillContentOp}}>
            <div style={{position: 'absolute', left: 34, top: 0, height: 86, display: 'flex', alignItems: 'center', fontFamily: FONT_SANS, fontWeight: 600, fontSize: 36, color: C.white}}>
              {typed('skill eksekusi', f, T.PILL_TYPE[0], T.PILL_TYPE[1])}
            </div>
            <div style={{position: 'absolute', right: 12, top: 12, width: 110, height: 62, borderRadius: 31, background: knobX > 0.5 ? 'rgba(255,255,255,0.28)' : 'rgba(9,41,47,0.55)'}}>
              <div style={{position: 'absolute', top: 4, left: 4 + knobX * 48, width: 54, height: 54, borderRadius: 27, background: C.white}} />
            </div>
          </div>
          {/* card content */}
          {m > 0.4 && (
            <div style={{position: 'absolute', inset: 0, opacity: lerp(m, 0.4, 1, 0, 1)}}>
              <div style={{position: 'absolute', left: 34, top: 30, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 36, color: C.white}}>produk</div>
              <div style={{position: 'absolute', right: 30, top: 24, width: 50, height: 50, borderRadius: 25, background: CYAN_LABEL}}>
                <svg width={50} height={50} viewBox="0 0 50 50">
                  <circle cx="22" cy="22" r="9" fill="none" stroke={C.white} strokeWidth="4" />
                  <path d="M29 29 L36 36" stroke={C.white} strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{position: 'absolute', left: 34, top: 110, display: 'grid', gridTemplateColumns: 'repeat(3, 160px)', gap: 16}}>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const at = T.TILES[0] + i * 1.5;
                  return (
                    <div key={i} style={{transform: `scale(${track(f, [[at, 0], [at + 5, 1]], BACK)})`}}>
                      <Tile i={i} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {/* cursor */}
      {f >= T.CURSOR.enter && f < T.CARD_MORPH[0] + 2 && (
        <div style={{position: 'absolute', left: interpolate(curT, [0, 1], [0.8 * W, W / 2 + 205]), top: interpolate(curT, [0, 1], [0.64 * H, 0.5 * H + 4])}}>
          <Cursor press={press} />
        </div>
      )}
      {/* "0" chip on "nol" (ref emoji pops) */}
      {f >= T.CHIP[0] && f < T.CARD_MORPH[0] + 3 && (
        <div
          style={{
            position: 'absolute',
            left: W / 2 + 190,
            top: 0.5 * H - 140,
            width: 92,
            height: 92,
            borderRadius: 46,
            background: ORANGE_SIMPLE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_SANS,
            fontWeight: 700,
            fontSize: 54,
            color: C.tealDark,
            transform: `scale(${track(f, [[T.CHIP[0], 0], [T.CHIP[1], 1]], BACK) * lerp(f, T.CARD_MORPH[0], T.CARD_MORPH[0] + 3, 1, 0, IN)})`,
          }}
        >
          0
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- talent card + Beat C ----------
const TalentCard: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
  const k = track(f, T.CARD_K, INOUT);
  const x = track(f, T.CARD_X, INOUT) * W;
  const top = track(f, T.CARD_TOP, [OUT, OUT, INOUT]) * H;
  const r = track(f, T.CARD_R, INOUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top,
        width: W * k,
        height: H * k,
        borderRadius: r,
        overflow: 'hidden',
        boxShadow: k < 1 ? '18px 24px 40px rgba(0,0,0,0.45)' : undefined,
      }}
    >
      <div style={{width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0', position: 'relative'}}>{children}</div>
    </div>
  );
};

const BeatC: React.FC<{f: number}> = ({f}) => {
  const focus = track(f, T.FOCUS_BLUR, INOUT);
  const punch = track(f, T.PUNCH, OUT) * (f >= T.CUT_PUNCH ? 1.15 : 1);
  const vig = lerp(f, T.VIGNETTE_IN[0], T.VIGNETTE_IN[1], 0, 1);
  const ghost = track(f, T.GHOST);
  const ghostBlur = lerp(f, T.CUT_PUNCH, T.CUT_PUNCH + 8, 0, 6);
  const strokeT = lerp(f, T.STROKE_FLY[0], T.STROKE_FLY[1], 0, 1, OUT);
  const vol = lerp(f, T.AUDIO_TAIL[0], T.AUDIO_TAIL[1], 1, 0, (t) => t);
  return (
    <AbsoluteFill>
      <TalentCard f={f}>
        <Footage frame={f} extraScale={punch} blur={focus} muted={false} volume={vol} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 42%, rgba(9,41,47,0) 55%, rgba(9,41,47,0.75) 100%)', opacity: vig}} />
      </TalentCard>

      {/* Beat B texts riding with the card (ref "Let me / Explain") */}
      {f >= T.T_DAN[0] && f < 222 && (
        <AbsoluteFill style={{transform: `translateY(${lerp(f, T.T_B_EXIT[0], T.T_B_EXIT[1], 0, -520, IN)}px)`, opacity: lerp(f, T.T_B_EXIT[0], T.T_B_EXIT[1], 1, 0, IN)}}>
          <Sans size={42} style={{left: 0.15 * W, top: 0.268 * H}}>{typed('dan percuma', f, T.T_DAN[0], T.T_DAN[1])}</Sans>
          {f >= T.T_PRODUK && (
            <div style={{position: 'absolute', left: 0.08 * W, top: 0.29 * H, transformOrigin: 'left center', ...popIn(f, T.T_PRODUK, 0.85)}}>
              <Serif size={116} style={{position: 'relative'}}>Produk Bagus</Serif>
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* Beat C texts */}
      {f >= T.T_KALAU && (
        <AbsoluteFill style={{opacity: ghost, filter: ghostBlur > 0.1 ? `blur(${ghostBlur}px)` : undefined}}>
          <Sans size={42} style={{left: 0, width: W, textAlign: 'center', top: 0.618 * H, opacity: lerp(f, T.T_KALAU, T.T_KALAU + 3, 0, 1), transform: `translateY(${lerp(f, T.T_KALAU, T.T_KALAU + 5, 12, 0)}px)`}}>
            kalau
          </Sans>
          {/* flying orange stroke (ref pink blob) */}
          {f >= T.STROKE_FLY[0] && f < T.T_UIUX + 2 && (
            <div
              style={{
                position: 'absolute',
                left: interpolate(strokeT, [0, 1], [1.05 * W, 0.6 * W]),
                top: 0.69 * H,
                width: 120,
                height: 34,
                borderRadius: 17,
                background: ORANGE_SIMPLE,
                transform: `rotate(${interpolate(strokeT, [0, 1], [-30, 10])}deg) scaleX(${interpolate(strokeT, [0, 1], [1.6, 0.6])})`,
                filter: `blur(${(1 - strokeT) * 3}px)`,
              }}
            />
          )}
          {f >= T.T_UIUX && (
            <div style={{position: 'absolute', left: 0, width: W, top: 0.648 * H, display: 'flex', justifyContent: 'center'}}>
              <div style={{position: 'relative', ...popIn(f, T.T_UIUX, 0.5)}}>
                <Serif size={250} style={{position: 'relative'}}>UI/UX</Serif>
              </div>
            </div>
          )}
          {/* white splash (ref) */}
          {f >= T.SPLASH[0] &&
            f < T.SPLASH[1] &&
            [0, 1, 2, 3, 4].map((i) => {
              const t = lerp(f, T.SPLASH[0], T.SPLASH[1], 0, 1);
              const a = (-160 + i * 35) * (Math.PI / 180);
              const d = 40 + t * (90 + i * 14);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 0.27 * W + Math.cos(a) * d,
                    top: 0.71 * H + Math.sin(a) * d,
                    width: 22 - i * 2,
                    height: 22 - i * 2,
                    borderRadius: 12,
                    background: C.white,
                    opacity: 1 - t,
                  }}
                />
              );
            })}
          {f >= T.T_BOX2[0] && (
            <div
              style={{
                position: 'absolute',
                right: 0.18 * W,
                top: 0.775 * H,
                height: 64,
                paddingLeft: 22,
                paddingRight: 22,
                display: 'flex',
                alignItems: 'center',
                background: CYAN_LABEL,
                borderRadius: 6,
                transformOrigin: 'right center',
                transform: `scaleX(${lerp(f, T.T_BOX2[0], T.T_BOX2[1], 0, 1)})`,
                fontFamily: FONT_SANS,
                fontWeight: 600,
                fontSize: 36,
                color: C.white,
                minWidth: 300,
              }}
            >
              {typed('nggak dipikirin', f, T.T_BOX2_TYPE[0], T.T_BOX2_TYPE[1])}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const SB01: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.tealDark}}>
      {f < T.MASTER_CUT_1 && <BeatA f={f} />}
      {f >= T.MASTER_CUT_1 && (
        <>
          <Plate />
          {f < T.GROUP_UP[1] + 1 && <BeatBGraphics f={f} />}
          {f >= T.CARD_TOP[0][0] && <BeatC f={f} />}
          {/* master audio while the talent is hidden behind graphics (f107–f198) */}
          {f < T.CARD_TOP[0][0] && (
            <AbsoluteFill style={{opacity: 0}}>
              <Footage frame={f} muted={false} />
            </AbsoluteFill>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
