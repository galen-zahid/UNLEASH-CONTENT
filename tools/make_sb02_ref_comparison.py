"""SB02_REFERENCE_COMPARISON.mp4: reference AFTER motion (left, full frame) vs the SB02 adaptation (right).
python -I tools/make_sb02_ref_comparison.py <tmpdir>"""
import subprocess, sys
T = sys.argv[1]; R = '_src_untracked/'; B = 'renders/sb02/SB02_V01_FULL.mp4'
PAIRS = [  # ref, ref start s, dur s, SB02 start frame, label  (V01.1)
    ('jxdzwc9awa6j', 17.9, 0.8, 52, '1 jx 3-frame blur cut (18.13-18.27 s) -> SB02 cut f61'),
    ('jxdzwc9awa6j', 0.4, 0.8, 86, '2 jx word rise 6 f + stack (0.47 s) -> Nah, makanya / kalian butuh'),
    ('0uqzshinqvol', 12.6, 0.8, 128, '3 0u badge drop + damped swing (12.7 s) -> cards 01/02 drop on "dua hal"'),
    ('0uqzshinqvol', 12.6, 1.6, 144, '4 0u semantic vector build -> foundation + building on "bangun bisnis"'),
    ('9gightyfqu5k', 5.2, 0.8, 184, '5 9g exit blur-up + serif blur-in (5.33/5.67 s) -> BANGUN BISNIS out, Kabar baiknya in'),
    ('9gightyfqu5k', 6.1, 0.8, 216, '6 9g dark card rise ~12 f (6.2 s) -> book rises on "kalian bisa"'),
    ('jxdzwc9awa6j', 18.1, 0.8, 250, '7 jx punch/pull camera on key word -> face-tracked punch-in on ILMU f257'),
]
parts = []
for i, (ref, rs, d, sf, lab) in enumerate(PAIRS):
    o = f'{T}/p{i}.mp4'
    fc = (f"[0:v]fps=30,scale=540:960:force_original_aspect_ratio=decrease,pad=540:960:(ow-iw)/2:(oh-ih)/2,setsar=1,"
          f"drawtext=text='REF {ref} {rs:.2f}s+':fontcolor=yellow:fontsize=22:x=10:y=10:box=1:boxcolor=black@0.6[a];"
          f"[1:v]scale=540:960,setsar=1,drawtext=text='SB02 f%{{frame_num}}':start_number={sf}:fontcolor=yellow:fontsize=22:x=10:y=10:box=1:boxcolor=black@0.6[b];"
          f"[a][b]hstack,drawtext=text='{lab}':fontcolor=white:fontsize=20:x=10:y=h-36:box=1:boxcolor=black@0.6,format=yuv420p[v]")
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(rs), '-t', str(d), '-i', R + ref + '.mp4', '-ss', str(sf / 30), '-t', str(d), '-i', B,
                    '-filter_complex', fc, '-map', '[v]', '-an', '-r', '30', '-c:v', 'libx264', '-crf', '18', o], check=True)
    parts.append(o)
open(f'{T}/list.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{T}/list.txt', '-c', 'copy', 'renders/sb02/SB02_REFERENCE_COMPARISON.mp4'], check=True)
