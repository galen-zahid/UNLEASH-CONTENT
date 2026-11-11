#!/usr/bin/env bash
# Rebuild every asset that is NOT in git (proxies + audio), on a fresh local clone.
# Needs: ffmpeg/ffprobe on PATH, Python 3.10+ with numpy scipy soundfile, Node 18+.
# Needs the source files placed by hand in _src_untracked/ (see HANDOFF_LOCAL.md §4):
#   IMG_6757.MOV (master, required), jxdzwc9awa6j.mp4 9gightyfqu5k.mp4 0uqzshinqvol.mp4 larg8ak17f8d.mp4 (references, optional)
# Usage (from the repo root):  bash tools/bootstrap_local.sh [python]
set -euo pipefail
PY=${1:-python3}
cd "$(dirname "$0")/.."
MOV=_src_untracked/IMG_6757.MOV
[ -f "$MOV" ] || { echo "missing $MOV — put the master from Google Drive there first"; exit 1; }
GRADE=$(cat audit/v03/GRADE_DENOISE_FILTER.txt)
mkdir -p remotion/public/master remotion/public/audio_v06 remotion/public/audio_sb02

echo "== 1/4 graded CFR30 proxies (same grade/denoise chain as SB01 v03+)"
# SB01: master 0–10.5 s ; SB02: master 10.0–20.5 s (output-side -ss = frame-accurate)
[ -f remotion/public/master/IMG_6757_0-10.5_v03_graded_cfr30.mp4 ] || \
  ffmpeg -nostdin -v error -y -i "$MOV" -t 10.5 -an -vf "$GRADE" -c:v libx264 -preset slow -crf 12 \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv remotion/public/master/IMG_6757_0-10.5_v03_graded_cfr30.mp4
[ -f remotion/public/master/IMG_6757_10-20.5_v03_graded_cfr30.mp4 ] || \
  ffmpeg -nostdin -v error -y -i "$MOV" -ss 10 -t 10.5 -an -vf "$GRADE" -c:v libx264 -preset slow -crf 12 \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv remotion/public/master/IMG_6757_10-20.5_v03_graded_cfr30.mp4

echo "== 2/4 SB02 VO (cleaned 0–30.5 s, 'personal branding' muted) + SB02 SFX + sound_sb02.json"
"$PY" -I tools/make_audio_sb02.py

echo "== 3/4 SB01 VO = first 10.5 s of the same cleaned pass (identical to the v06 file, r = 1.0)"
ffmpeg -nostdin -v error -y -i remotion/public/audio_sb02/_vo_clean_0-30.5.wav -t 10.5 -c:a pcm_s24le remotion/public/audio_v06/vo_clean.wav

echo "== 4/4 v06b music bands (32 s) + SB01 SFX (seeded, deterministic)"
"$PY" -I tools/make_sound_v06.py remotion/public/audio_v06
# the generator also writes a cue sheet into public/; the source of truth is remotion/src/sb01v051/sound_v06.json
rm -f remotion/public/audio_v06/sound_v06.json

echo "== npm install"
(cd remotion && npm install --no-audit --no-fund)
echo "done. Studio: cd remotion && npx remotion studio src/index.ts  (compositions SB01-v051, SB02-v01)"
