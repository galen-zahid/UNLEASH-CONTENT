// SB01 v01 timeline — all values are OUTPUT frames @30 fps (output time == master time, no retime).
// Each entry notes the reference frame it reconstructs: ref = larg8ak17f8d "After" panel
// (crop 474x844 @ 202,210 of the 720x1280 file), 30 fps, so ref frame n = n/30 s.
// Where output differs from ref, the reason is written next to it. See audit/REFERENCE_BEATS.md.

import type {Key} from '../lib/anim';

// ---- Master edit facts (IMG_6757.MOV, measured 2026-11-07) ----
export const MASTER_CUT_1 = 107; // master shot1→shot2 at 3.567 s (scene score 0.70)

// Footage framing. Ref "After" frames the talent tighter than its "Before"; master face is ~0.17 W wide
// vs ~0.28 W in ref, so we scale 1.4 (upscale limited to keep detail) and put the face at y≈0.40 H.
export const FOOT = {
  scale: 1.4,
  shot1: {dx: -45, dy: 77}, // face centre master (0.53, 0.40)
  shot2: {dx: 30, dy: 77}, // face centre master (0.48, 0.40)
};

// ---- Beat A: grid window opening (ref f0–f119) ----
// Window = sharp footage revealed through a rect; rest = heavily blurred footage + brand tint.
// Sizes as fraction of W/H, centre (0.5, 0.46). Measured from ref per-frame sheet fr_a/fr_b.
export const WIN_W: Key[] = [[0, 0], [1, 0.03], [3, 0.16], [9, 0.31], [13, 0.41], [17, 0.53], [21, 0.63], [23, 0.64], [72, 0.68], [73, 0.8], [74, 0.92], [75, 1.0]];
export const WIN_H: Key[] = [[0, 0], [1, 0.02], [3, 0.11], [9, 0.19], [13, 0.24], [17, 0.31], [21, 0.4], [23, 0.42], [72, 0.44], [73, 0.62], [74, 0.85], [75, 1.0]];
export const WIN_CY: Key[] = [[0, 0.43], [23, 0.46], [72, 0.46], [75, 0.5]];
export const WIN_BLUR: Key[] = [[72, 0], [73, 9], [74, 6], [75, 0]]; // ref f73–74 motion-blurred expand

export const SCRIBBLE = {draw: [3, 12] as const, fade: [13, 18] as const}; // ref white stroke f3–f16

// Text (ref slots → UNLEASH copy). Master words: Kata 0.00 | siapa 1.20 | bangun 1.76 | bisnis 2.02 |
// cuma 2.34 | butuh 2.60 | uang 2.86–3.20 (faster-whisper medium, word timestamps).
export const T_KATA = 5; // ref "If" f5
export const T_SIAPA_IN = 36; // ref "One Thing" f25–30; moved to the spoken word "siapa" (1.20 s)
export const T_SIAPA_OUT = 50; // ref One Thing → LOOking swap f50–56
export const T_BISNIS_IN = 53; // spoken "bangun" 1.76 s (ref LOOking settled f57)
export const T_SWOOSH = [55, 68] as const; // ref pink slash beside LOOking f66–f71
export const T_CUMA = 70; // spoken "cuma" 2.34 s (ref "forward to" f60–f72)
export const T_RULE = [72, 80] as const; // ref underline + dot under "forward to" f77–f84
export const T_BOX = [80, 84] as const; // ref 2025 box with handles appears f80
export const T_UANG = [84, 92] as const; // spoken "uang" 2.86 s; ref scribble→"2025" f81–f95

// Pre-wipe shake/blur + circle wipe. Ref: blur f112–114, circle f115–119.
// Shifted −13 f so the circle fully covers the master hard cut at f107 (3.567 s).
export const PREWIPE: Key[] = [[98, 0], [101, 12], [103, 14]];
export const CIRCLE_R: Key[] = [[102, 50], [103, 160], [104, 380], [105, 700], [106, 1250]];
export const CIRCLE_CENTER = {x: 0.5, y: 0.47};

// ---- Beat B: graphic section (ref f119–f219) ----
// Master: "Percuma 3.96 | modal 4.24 | gede 4.52 | kalau 4.86 | skill 5.14 | eksekusinya 5.42 | nol 5.96–6.22 |
//          dan 6.22 | percuma 6.66 | produk 7.04 | bagus 7.34–7.70"
export const ICON_IN = [116, 130] as const; // ref 3D icon spins in f124–f140 (→ "Percuma modal gede")
export const ICON_OUT = [145, 150] as const; // ref icon collapses into pill f147–f150
export const PILL_GROW = [146, 152] as const;
export const PILL_TYPE = [152, 166] as const; // ref "switching to" typed f151–f160 (→ "skill eksekusi")
export const CURSOR = {enter: 160, arrive: 176, click: 179} as const; // ref cursor click f170–f175; ours on "nol" 5.96 s
export const CHIP = [181, 187] as const; // ref emoji pops f160–f170; ours: "0" chip on "nol"
export const CARD_MORPH = [186, 194] as const; // ref pill → search card f180–f185 (→ "dan percuma produk")
export const TILES = [192, 200] as const; // ref apparel icons pop f188–f196
export const GROUP_UP = [199, 210] as const; // ref group scrolls up/out f195–f205

// Talent card (ref f197–f219): slides up, holds, then scales to full frame.
export const CARD_TOP: Key[] = [[199, 1.02], [208, 0.38], [216, 0.355], [222, 0]];
export const CARD_K: Key[] = [[199, 0.84], [216, 0.84], [222, 1]];
export const CARD_X: Key[] = [[199, 0.08], [216, 0.08], [222, 0]];
export const CARD_R: Key[] = [[199, 40], [216, 40], [222, 0]];
export const T_DAN = [200, 206] as const; // ref "Let me" typed f199–f205
export const T_PRODUK = 209; // ref "Explain" f208–209; spoken "produk" 7.04 s (f211)
export const T_B_EXIT = [216, 220] as const; // ref text pushed up with card f216–f219

// ---- Beat C: talent full frame + emphasis (ref f219–f300) ----
// Master: "kalau 7.70 | personal 8.08 | branding 8.52 | [ASR: 'mengelakuan'] 8.76–9.46 | Siapa 9.90"
export const VIGNETTE_IN = [224, 227] as const; // ref vignette from f221
export const FOCUS_BLUR: Key[] = [[224, 0], [226, 14], [229, 4], [231, 0]]; // ref defocus f223–f227
export const PUNCH: Key[] = [[224, 1], [230, 1.1]]; // ref push-in during defocus
export const T_KALAU = 231; // spoken "kalau" 7.70 s (ref "Our" f235)
export const STROKE_FLY = [234, 245] as const; // ref pink blob flies in f240–f252
export const T_UIUX = 245; // spoken "personal" 8.08 s (f242); ref "Busier" lands f252–f255
export const SPLASH = [245, 257] as const; // ref white splash left of "Busier" f255–f262
export const T_BOX2 = [262, 268] as const; // ref "than ever" box f262–f270; spoken 8.76 s
export const T_BOX2_TYPE = [264, 272] as const;
export const CUT_PUNCH = 280; // ref hard cut to B-roll f280 (9.33 s). No B-roll in master → punch-in cut.
export const GHOST: Key[] = [[279, 1], [280, 0.5], [288, 0]]; // ref "Busier" ghosts over the new shot f280–f286
export const AUDIO_TAIL = [296, 300] as const; // fade: SB01 ends mid-word ("Siapa" 9.90 s)
