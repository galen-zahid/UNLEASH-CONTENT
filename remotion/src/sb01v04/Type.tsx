// Editable typography layers for v03. Hero = Source Serif 4 Bold Italic with 3-stage depth
// (a) dark-teal outline, (b) hard offset shadow, (c) soft blurred shadow. Secondary = Instrument Sans Bold.
import React from 'react';
import {C, FONT_SANS, FONT_SERIF, ORANGE_GLOW_TEXT} from '../lib/tokens';
import {INK, IVORY} from './layout';

type HeroProps = {
  text: string;
  size: number;
  fill?: 'orange' | 'ivory';
  style?: React.CSSProperties;
};

const base = (size: number): React.CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  fontFamily: FONT_SERIF,
  fontWeight: 700,
  fontStyle: 'italic',
  fontSize: size,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  letterSpacing: -size * 0.01,
  paddingRight: size * 0.14,
});

export const Hero: React.FC<HeroProps> = ({text, size, fill = 'orange', style}) => {
  const stroke = Math.max(2, Math.round(size * 0.028)); // ≈2–4 px visible outside after centring
  const hard = Math.max(6, Math.round(size * 0.035));
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      {/* invisible sizer */}
      <span style={{...base(size), position: 'relative', visibility: 'hidden'}}>{text}</span>
      {/* (c) soft shadow */}
      <span style={{...base(size), color: INK, opacity: 0.55, filter: `blur(${Math.round(size * 0.09)}px)`, transform: `translate(0px, ${hard * 1.6}px)`}}>{text}</span>
      {/* (b) hard offset */}
      <span style={{...base(size), color: INK, WebkitTextStroke: `${stroke * 2}px ${INK}`, transform: `translate(${hard * 0.35}px, ${hard}px)`}}>{text}</span>
      {/* (a) outline */}
      <span style={{...base(size), color: INK, WebkitTextStroke: `${stroke * 2}px ${INK}`}}>{text}</span>
      {/* fill */}
      <span
        style={{
          ...base(size),
          ...(fill === 'orange'
            ? {backgroundImage: ORANGE_GLOW_TEXT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
            : {color: IVORY}),
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const Sans: React.FC<{
  text: string;
  size: number;
  color?: string;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({text, size, color = IVORY, shadow = true, style}) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-block',
      fontFamily: FONT_SANS,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.05,
      whiteSpace: 'nowrap',
      color,
      textShadow: shadow ? `0 ${Math.round(size * 0.05)}px 0 ${INK}, 0 ${Math.round(size * 0.12)}px ${Math.round(size * 0.3)}px rgba(9,41,47,0.75)` : undefined,
      ...style,
    }}
  >
    {text}
  </div>
);

/** Rounded capsule label (GSM "Staff TDC ITS" style family). */
export const Capsule: React.FC<{text: string; size: number; bg: string; color: string; style?: React.CSSProperties}> = ({
  text,
  size,
  bg,
  color,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: size * 1.7,
      padding: `0 ${size * 0.7}px`,
      borderRadius: size,
      background: bg,
      color,
      fontFamily: FONT_SANS,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: 'nowrap',
      boxShadow: `0 ${size * 0.12}px 0 ${C.tealDark}, 0 ${size * 0.35}px ${size * 0.6}px rgba(9,41,47,0.35)`,
      ...style,
    }}
  >
    {text}
  </div>
);

/** Mask reveal wrapper: content travels in from `dir` inside an overflow-hidden box. p: 0..1 */
export const Mask: React.FC<{p: number; dir?: 'up' | 'down' | 'left' | 'right'; children: React.ReactNode; pad?: number}> = ({
  p,
  dir = 'up',
  children,
  pad = 40,
}) => {
  // travel = own size + the padding (the padding exists so shadows are not clipped; without adding it, short
  // words peeked through before their entrance — bug found in v04 QA at f196–f200)
  const d = (1 - p) * 105;
  const px = (1 - p) * pad;
  const tr =
    dir === 'up'
      ? `translateY(calc(${d}% + ${px}px))`
      : dir === 'down'
        ? `translateY(calc(${-d}% - ${px}px))`
        : dir === 'left'
          ? `translateX(calc(${d}% + ${px}px))`
          : `translateX(calc(${-d}% - ${px}px))`;
  if (p >= 1) return <>{children}</>;
  return (
    <div style={{overflow: 'hidden', padding: pad, margin: -pad, display: 'inline-block'}}>
      <div style={{transform: tr}}>{children}</div>
    </div>
  );
};
