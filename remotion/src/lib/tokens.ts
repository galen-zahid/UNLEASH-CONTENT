// GSM TDC tokens. Source: Figma 1uKgzzPdaTcT9yyI1FTrk0 (frame 652:1812 "Incoming Message to",
// screenshot verified 2026-11-07) + palette values in the user brief (audit BRIEF_CLAUDE_GSM_TDC_VERIFIED).
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const SB01_FRAMES = 300; // 10.0 s

export const C = {
  tealDark: '#09292F',
  teal: '#18626F',
  cyan1: '#238FA2',
  cyan2: '#29A6BB',
  cyan3: '#2EBCD5',
  orange1: '#FE9831',
  orange2: '#FFB36A',
  white: '#FFFFFF',
  offWhite: '#F6F6F6',
};

// "orange glow" paint style stops (GSM). Direction approximated as top→bottom;
// the Figma transform matrix was not re-read in this session.
export const ORANGE_GLOW =
  'linear-gradient(180deg, #A3652A 0%, #EFB06E 21%, #FEFBF2 38%, #F9C176 53%, #E77B33 69.5%, #DC702A 84%, #733D19 100%)';
// Headline fill: inner segment of the GSM "orange glow" stops (21 %→84 %), re-spread over the glyph box.
// v01 used the full ramp; its darkest stops read as muddy brown over footage (QA v01).
export const ORANGE_GLOW_TEXT =
  'linear-gradient(180deg, #EFB06E 0%, #FEFBF2 27%, #F9C176 50%, #E77B33 77%, #DC702A 100%)';
export const ORANGE_SIMPLE = `linear-gradient(180deg, ${C.orange2} 0%, ${C.orange1} 100%)`;
export const CYAN_LABEL = `linear-gradient(90deg, ${C.cyan1} 0%, ${C.cyan2} 50%, ${C.cyan3} 100%)`;

export const FONT_SERIF = '"Source Serif 4 UNL", serif';
export const FONT_SANS = '"Instrument Sans UNL", sans-serif';
