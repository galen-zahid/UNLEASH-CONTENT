# QA_REPORT — SB01 (preview v02)

Files: `renders/UNLEASH_SB01_v02_PREVIEW.mp4` (540×960), `renders/UNLEASH_SB01_v02_SIDEBYSIDE_REF.mp4` (REF | UNLEASH).
v01 files are kept for comparison.

## Versions
- **v01**: first build. QA found muddy headline gradient (full orange-glow ramp incl. #733D19) and "UI/UX" much smaller than the ref "Busier".
- **v02**: headline fill = inner orange-glow stops 21–84 %, harder dark-teal shadow; "UI/UX" 190→250 px; texts re-spaced.

## Checks

| Check | Result | Evidence |
|---|---|---|
| Duration / frames | PASS | 300 frames, 10.005 s, 30 fps |
| Black frames (blackdetect d≥0.05 s) | PASS | 0 detections |
| Audio sync vs master | PASS | cross-corr. offset 0.0 ms in 0–3.5 / 3.6–6.6 / 6.7–9.8 s (r = 0.997 / 0.966 / 0.995); no gaps at layer switches f107, f199, f222 |
| Loudness | NOT DONE (on purpose) | Output −31.3 LUFS, TP −15.2 dBFS = same as master (−31.2 LUFS). Master to ≈ −15 LUFS / ≤ −1 dBTP after the replacement VO is recorded |
| Fonts | PASS | Fonts load through FontFace + delayRender; a failed load fails the render (no fallback) |
| Typecheck | PASS | `tsc --noEmit` |
| No cream surfaces | PASS | Surfaces are teal / cyan / orange only |
| No Gemini layout, no SIMPLE/POWERFUL/decorative numbers | PASS | Every element maps to a ref slot (timeline.ts) |
| No price/date/speaker/quota/metric | PASS | Chip "0" = the spoken word "nol" |
| Pixel format | PARTIAL | Preview is yuvj420p (Remotion JPEG frames). The final script passes `--pixel-format=yuv420p --color-space=bt709`, but the final has **not been rendered** yet |
| Framing / layout vs ref | PARTIAL | Window sizes and expand frames match the measurements; ref framing is tighter (face 0.28 W vs ours ≈0.24 W at ×1.4) |
| Timing vs ref | PARTIAL | Within ±11 f of the ref except the circle wipe, which is −13 f so it hides the master cut at 3.567 s |
| Headline legibility | **FAIL / needs a decision** | The orange serif sits on the talent's khaki/gold blouse, so contrast is low (ref: pink on grey). See the decisions below |
| Motion detail | PARTIAL | Not rebuilt: hand-scribbled "2025" (ours is a wipe), "LOOking" eye gimmick, ref emoji pops (replaced by chip "0") |
| B-roll beat (ref 9.33 s) | PARTIAL | The master has no B-roll; a punch-in cut stands in for it |
| Personal Branding → UI/UX audio | **OPEN** | Inside SB01 the talent still says "personal branding" at 8.08–8.76 s while the overlay says "UI/UX". Replacement VO needed at 8.08–9.46 s (and 19.02–19.96, 24.96–25.92 outside SB01) |

## Decisions needed
1. **Headline colour on the khaki blouse.** Options: (a) keep the orange glow with a dark-teal outline; (b) white Source Serif with an orange accent word; (c) teal label behind the headline.
2. **Graphics plate:** dark teal (current) or off-white #F6F6F6 (closer to the ref's white).
3. **SB01 length:** 10 s ends mid-"Siapa…". 10.9 s would end on the sentence.
4. **VO copy for 8.08–9.46 s**, e.g. "…kalau UI/UX-nya nggak dipikirin", and who records it.
