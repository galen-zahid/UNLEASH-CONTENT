# UNLEASH / TDC ITS — Remotion

Remotion 4.0.541 (exact), React 19.1, TypeScript. Composition `SB01` (1080×1920, 30 fps, 300 f).

## Setup
```bash
npm ci
# master proxy (not committed): source = Drive IMG_6757.MOV
mkdir -p public/master
ffmpeg -i IMG_6757.MOV -t 10.5 -vf "fps=30,format=yuv420p" -c:v libx264 -crf 15 -g 15 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -ar 48000 -b:a 192k \
  public/master/IMG_6757_0-10.5_cfr30.mp4
```

## Preview / render
```bash
npm run studio                 # interactive preview
npm run render:sb01:preview    # 540×960 → ../renders/UNLEASH_SB01_v02_PREVIEW.mp4
npm run render:sb01:final      # 1080×1920 H.264 yuv420p BT.709 AAC
```
In the cloud container set `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
Elsewhere leave it unset.

## Layout
- `src/lib/tokens.ts` — GSM colours/fonts (see `../audit/GSM_TOKENS.md`)
- `src/sb01/timeline.ts` — every keyframe, in output frames, annotated with the reference frame it rebuilds
- `src/sb01/SB01.tsx` — layers (footage, window/grid, texts, graphics, talent card)
- `src/sb01v03/` — **SB01 v03** (composition `SB01-v03`): `cues.json` (all frames), `mix.json` (levels), `SB01v03.tsx`, `Type.tsx`, `Illustration.tsx`, `AudioMix.tsx`. Pipeline: see `../qa/QA_REPORT_v03.md` → Reproduksi
- `public/fonts/` — Source Serif 4 Bold/SemiBold Italic, Instrument Sans 400–700 (OFL, Google Fonts)
