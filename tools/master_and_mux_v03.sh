#!/usr/bin/env bash
# Two-pass loudness mastering of the Remotion mix + final mux to delivery spec.
# Usage: tools/master_and_mux_v03.sh <raw_video.mp4> <mix_premaster.wav> <out_dir>
set -euo pipefail
RAW=$1; MIX=$2; OUT=$3
I=-16; TP=-1.5; LRA=11

# ---- pass 0: transparent peak limiter so pass 2 can stay LINEAR ----
# required gain ≈ I_target - I_in; limit peaks to (TP_target - gain - 1 dB margin) before gain
PRE=$(ffmpeg -hide_banner -nostats -i "$MIX" -af ebur128=peak=true -f null - 2>&1 | python3 -c "
import sys,re;t=sys.stdin.read();i=float(re.findall(r'I:\s+(-?[\d.]+) LUFS',t)[-1]);print(i)")
LIM=$(python3 -c "g=$I-($PRE);print(round(10**(($TP-g-1.0)/20),4))")
echo "pre-limit: input I=$PRE LUFS, gain needed $(python3 -c "print(round($I-($PRE),2))") dB, limiter ceiling $LIM (linear)" | tee "$OUT/limiter_pass0.txt"
ffmpeg -hide_banner -v error -y -i "$MIX" -af "aresample=192000,alimiter=limit=$LIM:attack=4:release=60:level=false,aresample=48000" -c:a pcm_s24le "$OUT/SB01_v03_mix_prelimited.wav"
MIX="$OUT/SB01_v03_mix_prelimited.wav"

# ---- pass 1: measure ----
ffmpeg -hide_banner -nostats -i "$MIX" -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" -f null - 2> "$OUT/loudnorm_pass1.log"
J=$(sed -n '/^{/,/^}/p' "$OUT/loudnorm_pass1.log")
echo "$J" > "$OUT/loudnorm_pass1.json"
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
MI=$(g input_i); MTP=$(g input_tp); MLRA=$(g input_lra); MTH=$(g input_thresh); OFF=$(g target_offset)

# ---- pass 2: apply (linear when possible) ----
ffmpeg -hide_banner -nostats -y -i "$MIX" -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:measured_I=$MI:measured_TP=$MTP:measured_LRA=$MLRA:measured_thresh=$MTH:offset=$OFF:linear=true:print_format=json" \
  -ar 48000 -c:a pcm_s24le "$OUT/SB01_v03_mix_master.wav" 2> "$OUT/loudnorm_pass2.log"
sed -n '/^{/,/^}/p' "$OUT/loudnorm_pass2.log" > "$OUT/loudnorm_pass2.json"

# ---- verify master (independent meter) ----
ffmpeg -hide_banner -nostats -i "$OUT/SB01_v03_mix_master.wav" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > "$OUT/ebur128_master.txt"

# ---- final mux: video → limited-range yuv420p BT.709, AAC 48 kHz ----
ffmpeg -hide_banner -v error -y -i "$RAW" -i "$OUT/SB01_v03_mix_master.wav" \
  -map 0:v:0 -map 1:a:0 \
  -vf "scale=out_range=tv:out_color_matrix=bt709:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -profile:v high -r 30 -fps_mode cfr \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest \
  "$OUT/SB01_v03.mp4"
echo done
