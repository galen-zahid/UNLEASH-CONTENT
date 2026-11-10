// Editable typography layers for v03. Hero = Source Serif 4 Bold Italic with 3-stage depth
// (a) dark-teal outline, (b) hard offset shadow, (c) soft blurred shadow. Secondary = Instrument Sans Bold.
import React from 'react';
import {FONT_SANS, FONT_SERIF} from '../lib/tokens';
import {INK, IVORY} from './layout';

type HeroProps = {
  text: string;
  size: number;
  fill?: 'orange' | 'ivory';
  style?: React.CSSProperties;
  /** right padding (fraction of size) reserved for the italic overhang; 0 when glyphs are set side by side */
  pad?: number;
};

const base = (size: number, pad = 0.14): React.CSSProperties => ({
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
  paddingRight: size * pad,
});

// v05.1 GSM-style treatment (user: outline + stacked hard shadows felt like a pasted title effect).
// Gradient fill with a white highlight band, a faint warm glow, ONE soft depth shadow and a 1 px dark edge
// for crispness on bright footage. No thick outline, no hard offset.
const ORANGE_FILL = 'linear-gradient(180deg, #FFD7A6 0%, #FFFFFF 20%, #FFC07A 44%, #FE9831 72%, #E2742A 100%)';
const WHITE_FILL = 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 55%, #E3ECEE 100%)';

export const Hero: React.FC<HeroProps> = ({text, size, fill = 'orange', style, pad = 0.14}) => {
  const depth = Math.max(3, Math.round(size * 0.04));
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      {/* invisible sizer */}
      <span style={{...base(size, pad), position: 'relative', visibility: 'hidden'}}>{text}</span>
      {/* soft depth shadow (single) */}
      <span style={{...base(size, pad), color: 'rgba(9,41,47,0.55)', filter: `blur(${Math.round(size * 0.05)}px)`, transform: `translateY(${depth}px)`}}>{text}</span>
      {/* faint glow (warm for orange, cool-white for white) */}
      <span style={{...base(size, pad), color: fill === 'orange' ? 'rgba(254,152,49,0.45)' : 'rgba(255,255,255,0.35)', filter: `blur(${Math.round(size * 0.12)}px)`}}>{text}</span>
      {/* 1 px edge */}
      <span style={{...base(size, pad), color: 'transparent', WebkitTextStroke: `2px rgba(9,41,47,0.45)`}}>{text}</span>
      {/* fill */}
      <span style={{...base(size, pad), backgroundImage: fill === 'orange' ? ORANGE_FILL : WHITE_FILL, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{text}</span>
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
      textShadow: shadow ? `0 ${Math.round(size * 0.04)}px ${Math.round(size * 0.14)}px rgba(9,41,47,0.6), 0 0 ${Math.round(size * 0.3)}px rgba(9,41,47,0.3)` : undefined,
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
      boxShadow: `0 ${size * 0.3}px ${size * 0.6}px rgba(9,41,47,0.35)`,
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
