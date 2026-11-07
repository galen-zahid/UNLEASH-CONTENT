#!/usr/bin/env bash
# Comparison deliverables for SB01 v03.
# Usage: tools/compare_v03.sh <ref_after_crop.mp4> <v02_preview.mp4> <v03_final.mp4> <out_dir>
set -euo pipefail
REF=$1; V02=$2; V03=$3; OUT=$4
mkdir -p "$OUT"
LBL="fontfile=/home/user/UNLEASH-CONTENT/remotion/public/fonts/InstrumentSans-700.ttf:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.65:x=10:y=10"

# 1) REF | v03 matched 0–10 s time grid (both 30 fps; ref = AFTER panel crop 474x844 @202,210)
ffmpeg -hide_banner -v error -y -i "$REF" -i "$V03" -filter_complex \
 "[0:v]trim=0:10,setpts=PTS-STARTPTS,fps=30,scale=540:960,drawtext=$LBL:text='REF AFTER  %{pts\:hms}  f%{n}'[a];\
  [1:v]trim=0:10,setpts=PTS-STARTPTS,scale=540:960,drawtext=$LBL:text='v03  %{pts\:hms}  f%{n}'[b];[a][b]hstack" \
 -map 1:a -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$OUT/SB01_REF_vs_v03_0-10s.mp4"

# 2) REF | v02 | v03 three-way video
ffmpeg -hide_banner -v error -y -i "$REF" -i "$V02" -i "$V03" -filter_complex \
 "[0:v]trim=0:10,setpts=PTS-STARTPTS,fps=30,scale=360:640,drawtext=$LBL:text='REF'[a];\
  [1:v]trim=0:10,setpts=PTS-STARTPTS,scale=360:640,drawtext=$LBL:text='v02'[b];\
  [2:v]trim=0:10,setpts=PTS-STARTPTS,scale=360:640,drawtext=$LBL:text='v03  f%{n}'[c];[a][b][c]hstack=3" \
 -map 2:a -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$OUT/SB01_REF_vs_v02_vs_v03.mp4"

# 3) per-beat stills grid REF | v02 | v03 at matched output frames
FR="12 45 80 95 104 130 170 185 210 255 275 292"
SEL=$(for f in $FR; do printf "eq(n\\\\,%s)+" "$f"; done); SEL=${SEL%+}
ffmpeg -hide_banner -v error -y -i "$OUT/SB01_REF_vs_v02_vs_v03.mp4" -vf "select='$SEL',scale=540:-1,tile=2x6" -vsync 0 -frames:v 1 "$OUT/SB01_REF_v02_v03_beats_grid.png"
echo done
