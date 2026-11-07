// Native 2.5D SVG illustration parts for Panel 04 (Beat D). Every coin / gear is its own element so it can
// be animated independently. Colours: GSM orange/teal tokens.
import React from 'react';
import {C} from '../lib/tokens';

export const COIN_W = 200;
export const COIN_T = 26; // thickness (side band height)

/** One 2.5D coin seen from ~30° above. `tilt` 0..1 squashes the face (spin), `id` keeps gradient ids unique. */
export const Coin: React.FC<{id: string; tilt?: number; shade?: number}> = ({id, tilt = 1, shade = 0}) => {
  const rx = COIN_W / 2;
  const ry = 34 * Math.max(0.15, tilt);
  const h = COIN_T;
  return (
    <svg width={COIN_W + 8} height={ry * 2 + h + 8} viewBox={`-4 -4 ${COIN_W + 8} ${ry * 2 + h + 8}`} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id={`side-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8A4A16" />
          <stop offset="0.35" stopColor="#D9822C" />
          <stop offset="0.6" stopColor="#F2A548" />
          <stop offset="1" stopColor="#9C5419" />
        </linearGradient>
        <radialGradient id={`face-${id}`} cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#FFF1CF" />
          <stop offset="0.35" stopColor={C.orange2} />
          <stop offset="0.8" stopColor={C.orange1} />
          <stop offset="1" stopColor="#D8761F" />
        </radialGradient>
      </defs>
      {/* side band */}
      <path d={`M0 ${ry} L0 ${ry + h} A${rx} ${ry} 0 0 0 ${COIN_W} ${ry + h} L${COIN_W} ${ry} Z`} fill={`url(#side-${id})`} />
      {/* ridges */}
      {Array.from({length: 13}).map((_, i) => {
        const x = 14 + i * 14.3;
        const yb = ry + h + ry * Math.sqrt(Math.max(0, 1 - ((x - rx) / rx) ** 2)) - ry;
        return <line key={i} x1={x} x2={x} y1={ry + 4 + (yb - ry - h) * 0} y2={yb} stroke="#7A3F12" strokeOpacity={0.35} strokeWidth={2} />;
      })}
      {/* top face */}
      <ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={`url(#face-${id})`} stroke="#B9661F" strokeWidth={2} />
      <ellipse cx={rx} cy={ry} rx={rx * 0.72} ry={ry * 0.72} fill="none" stroke="#FFF6E2" strokeOpacity={0.75} strokeWidth={4} />
      <ellipse cx={rx} cy={ry} rx={rx * 0.72} ry={ry * 0.72} fill="none" stroke="#B9661F" strokeOpacity={0.5} strokeWidth={2} transform={`translate(0 2)`} />
      {/* specular */}
      <ellipse cx={rx * 0.62} cy={ry * 0.55} rx={rx * 0.28} ry={ry * 0.18} fill="#FFFFFF" opacity={0.35} />
      {shade > 0 && <ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={C.tealDark} opacity={shade} />}
    </svg>
  );
};

const gearPath = (teeth: number, rOut: number, rIn: number) => {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const seq: [number, number][] = [
      [a - step * 0.5, rIn],
      [a - step * 0.22, rIn],
      [a - step * 0.14, rOut],
      [a + step * 0.14, rOut],
      [a + step * 0.22, rIn],
    ];
    for (const [ang, r] of seq) pts.push(`${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
};

/** Gear with teeth, hub, spoke holes and a 2.5D extrusion (offset dark copy). angle in degrees. */
export const Gear: React.FC<{id: string; teeth: number; r: number; angle: number}> = ({id, teeth, r, angle}) => {
  const rIn = r * 0.82;
  const d = gearPath(teeth, r, rIn);
  const size = r * 2 + 40;
  const holes = Array.from({length: 5}).map((_, i) => {
    const a = (i * Math.PI * 2) / 5;
    return <circle key={i} cx={Math.cos(a) * r * 0.5} cy={Math.sin(a) * r * 0.5} r={r * 0.13} fill="#F7F4ED" />;
  });
  return (
    <svg width={size} height={size} viewBox={`${-r - 20} ${-r - 20} ${size} ${size}`} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.cyan1} />
          <stop offset="0.45" stopColor={C.teal} />
          <stop offset="1" stopColor="#0E3F48" />
        </linearGradient>
      </defs>
      {/* cast shadow */}
      <g transform={`translate(${r * 0.1} ${r * 0.16})`} opacity={0.22}>
        <circle r={r * 1.02} fill={C.tealDark} />
      </g>
      {/* extrusion */}
      <g transform={`translate(${r * 0.05} ${r * 0.08}) rotate(${angle})`}>
        <path d={d} fill={C.tealDark} />
      </g>
      <g transform={`rotate(${angle})`}>
        <path d={d} fill={`url(#g-${id})`} stroke={C.tealDark} strokeWidth={5} strokeLinejoin="round" />
        <circle r={r * 0.68} fill="none" stroke={C.tealDark} strokeOpacity={0.35} strokeWidth={4} />
        {holes}
        <circle r={r * 0.24} fill={C.orange1} stroke={C.tealDark} strokeWidth={5} />
        <circle r={r * 0.08} fill={C.tealDark} />
      </g>
    </svg>
  );
};

/** Animated film grain (deterministic: seed = frame). opacity ~0.07 like the GSM noise layer. */
export const Grain: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 0.07}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity, mixBlendMode: 'multiply'}}>
    <filter id={`grain-${frame}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 97} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
  </svg>
);
