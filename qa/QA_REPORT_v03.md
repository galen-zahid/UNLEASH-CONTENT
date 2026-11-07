# QA_REPORT_v03 — SB01 V03 HARD REBUILD

Branch `ccr-a54f6557-i6gwaj`. v01 dan v02 tetap utuh (`src/sb01/`, composition `SB01`, file `renders/UNLEASH_SB01_v0[12]_*`). v03 berada di `remotion/src/sb01v03/` sebagai composition `SB01-v03`.

## File
| File | Isi |
|---|---|
| `renders/v03/SB01_v03.mp4` | **Final** 1080×1920, 30 CFR, 300 f, H.264 High yuv420p, BT.709 limited range, AAC 48 kHz, −15.8 LUFS |
| `renders/v03/A_0-3p9.mp4`, `B_3p9-6p6.mp4`, `C_6p6-10.mp4` | Preview tiga segmen (dipotong frame-akurat dari final) |
| `renders/v03/*_r1_pre-fix.mp4` | Preview segmen render pertama, sebelum perbaikan review (disimpan sebagai bukti) |
| `renders/v03/SB01_REF_vs_v03_0-10s.mp4` | REF AFTER \| v03 dengan grid waktu 0–10 s yang sama (frame & timecode di overlay) |
| `renders/v03/SB01_REF_vs_v02_vs_v03.mp4` | REF \| v02 \| v03 |
| `qa/v03/SB01_REF_v02_v03_beats_grid.png` | Still per beat REF \| v02 \| v03 (f12, 45, 80, 95, 104, 130, 170, 185, 210, 255, 275, 292) |
| `renders/v03/stems/` | `vo_clean`, `music_bed_ducked`, 9 × `sfx_*` (ditempatkan + gain), `_sum_of_stems` |
| `renders/v03/SB01_v03_mix_premaster.wav`, `SB01_v03_mix_master.wav` | Mix sebelum/sesudah mastering |
| `audit/v03/AUDIO_QC_v03.md`, `STEM_BALANCE.txt`, `QC_FINAL_v03.txt` | Bukti audio & teknis |
| `qa/v03/CLEANUP_before_after_*.png` | Perbandingan grade/denoise di timecode yang sama |
| `qa/v03/TRANSITIONS_all.png` | Frame −2…+2 di f75, 107, 117, 198, 230, 292 |
| `qa/v03/PANEL04_evidence.png`, `PANEL04_gears_f154-f180.png` | Bukti Panel 04 |
| `qa/v03/MOBILE_360x640_legibility.png` | Keterbacaan di 360×640 |

## Cacat v02 → perbaikan v03
| Cacat v02 (terukur/teramati) | v03 |
|---|---|
| Tipografi kecil, kontras rendah: UANG? 92 px sans (≈0.33 W), headline serif dengan satu soft shadow di atas blus kuning | Ukuran dihitung dari lebar advance terukur (fontTools): UANG? 265 px (0.70 W), NOL 349 px (0.56 W), UI/UX 279 px (0.64 W), Bangun 174 px (0.52 W), Produk 181 px (0.50 W). Hero = Source Serif 4 BI dengan 3 tahap kedalaman (outline teal gelap ≈3 px, offset keras 6–10 px, shadow lembut blur 16–31 px) + plate gradasi teal di bawah dagu (tidak pernah di wajah) |
| Teks tidak mengikuti subjek | Posisi teks di-anchor ke track wajah Haar (315/315 frame terdeteksi, smoothed per shot): blok teks mulai ≥60 px di bawah dagu, x mengikuti wajah dan di-clamp |
| Reveal lemah | Mask travel per kata dengan arah berbeda (kiri/atas), skala berbeda, overshoot hero, underline/scribble orange draw-on, kompresi berlapis saat UANG? masuk (gaya LOOking) |
| Cut 3.567 s tanpa energi | Pre-wipe blur/shake f97–104, koin hook berkumpul ke titik asal wipe, circle wipe ivory f101–106 (cut f107 tertutup penuh), ring teal meluas, koin pertama meneruskan gerak dari titik wipe (tidak ada dead frame f106–109) |
| Panel 04: ikon kecil + toggle di field teal kosong | Field ivory + grain + lengkung tipis; 8 koin 2.5D terpisah naik bertahap ke tumpukan dengan kamera virtual mendekat (zoom 1.45 → 2.0); dua koin diumpan ke gear; dua gear bergigi dengan hub, lubang, ekstrusi, dan shadow berputar (gear 1 ±108°, gear 2 berlawanan ×1.5) lalu melambat, wobble, dan berhenti; progress 0 → 9 % → kembali 0 %; NOL bomb-in tepat di "nol" (f179) dan ditahan 10 f; lalu kolaps menjadi kartu |
| Re-entry footage lemah | Kartu 2.5D naik dari bawah (rotateX 26° → 0, perspective 1800), ditahan dengan "dan percuma / Produk / bagus" di atas field ivory, lalu ekspansi ke full frame; focus pull + vignette |
| Kedalaman atas/bawah | Kartu UI ponsel melintasi tepi bawah (UI rapi → berantakan + "?" saat UI/UX), kursor melintasi tepi kanan-atas berlawanan arah |
| Tidak ada bomb-in ke SB02 | f288–293 punch hero ×1.2 (ease-out, naik 120 px, motion blur grafis) + footage ×1.06→1.22; wipe teal/emas mulai dari sudut f291–299; f299 teal dengan pita emas (bukan hitam) |
| Audio ≈ master mentah (−31.3 LUFS) | VO cleanup, musik original, 9 SFX bernama, ducking, mix pass 4, pre-limiter + loudnorm 2 pass linear → −15.8 LUFS / −2.4 dBTP |
| Grade/denoise belum ada | `hqdn3d=1.5:1.2:5:4` + colorbalance netralisasi cast hangat + roll-off highlight + sat 0.94, limited range eksplisit. Dinding koridor 224/218/206 → 212/212/207; kulit tetap hangat; tidak ada tint teal di kulit |

## Kriteria penerimaan
| # | Kriteria | Status | Bukti |
|---|---|---|---|
| 1 | Kode & render v03 terpisah, v02 tidak ditimpa | **PASS** | `src/sb01v03/`, `renders/v03/` |
| 2 | 3 preview terisolasi dirender & ditinjau sebelum final | **PASS** | `*_r1_pre-fix.mp4` ditinjau → 6 perbaikan (ring wipe ter-render sebagai cakram, Panel 04 terlalu kecil, dead frame f106–109, koin terbaca satu silinder, gear hanya 66°, bomb-in tidak terbaca); preview final dipotong dari master |
| 3 | REF \| v03 grid 0–10 s dan REF \| v02 \| v03 | **PASS** | lihat File |
| 4 | Panel 04: koin menumpuk, 2 gear mencoba lalu berhenti, 0 %, NOL terbaca | **PASS** | `PANEL04_evidence.png` (f112–194), `PANEL04_gears_f154-f180.png` (lubang bergeser f154–171, diam f172–180) |
| 5 | Tipografi: ukuran/hierarki/kontras terbaca di 360×640, ejaan benar | **PASS dengan catatan** | `MOBILE_360x640_legibility.png`: hero, capsule, 0 % terbaca; ejaan dicek. **Catatan:** "cuma butuh" setelah kompresi grup ≈10 px tinggi pada 360 px, hanya tipis terbaca |
| 6 | Audio: VO/musik/SFX terpisah & terdengar, dialog utuh, sync dicek manual, −16 ±1 LUFS, ≤ −1.5 dBTP | **PASS (terukur)** | AUDIO_QC_v03.md. Batasan: tidak ada uji dengar di sesi ini |
| 7 | Video: 1080×1920 / 30 CFR / yuv420p / Rec.709, 300 f, tanpa frame hitam/beku, bomb-in 10–12 f | **PASS** | `QC_FINAL_v03.txt`: blackdetect 0, freezedetect 0, metadata bt709/tv; nilai piksel token cocok (ivory 244/240/232 vs 247/244/237 dengan grain; teal 7/41/44 vs 9/41/47); bomb-in f288–299 |
| 8 | Tidak mengklaim 1:1 | — | Lihat perbedaan tersisa |

## Perbedaan & kegagalan tersisa (jujur)
1. **VO_REPLACEMENT_PENDING**: di 8.12–8.76 s talent masih mengucapkan "personal branding", sementara overlay menampilkan **UI/UX** (dikunci ke onset kata). Belum ada take pengganti; tidak ada dub/clone. Capsule "nggak dipikirin" adalah usulan copy dan menggantikan ucapan asli "[lu nggak kuat]" yang belum terdengar jelas.
2. **Separasi subjek/background untuk parallax tidak diimplementasikan.** Tidak ada model matting yang bisa dijalankan di sesi ini. Parallax hanya dari layer foreground grafis; tidak ada objek yang lewat di belakang talent.
3. Beat A–B vs REF: REF menampilkan hero "One Thing" di 0.83 s; v03 menunggu kata "bangun" (f53) sesuai aturan "entrance ikut dialog". Jadi 0.8–1.7 s di v03 hanya berisi teks sekunder "Kata siapa,".
4. REF memotong ke B-roll ilustrasi di 9.33 s; v03 tetap memakai footage master (B-roll palsu dilarang). Gimmick mata "LOOking" dan tulisan tangan "2025" tidak dibuat ulang.
5. Proporsi/framing: wajah master di-crop ×1.4 (wajah ≈0.24 W) vs REF ≈0.28 W; upscale dibatasi demi detail.
6. "cuma butuh" kecil setelah kompresi (lihat kriteria 5).
7. Audio belum diuji dengar; margin di Beat F hanya +4.3 dB selama impact 0.4 s yang disengaja (onset "Siapa").
8. Optical size Source Serif 4 = instance opsz 60 (Google Fonts); opsz di Figma belum diverifikasi.

## Keputusan yang perlu pengguna
- Take VO pengganti untuk 8.08–9.46 s (dan 19.02–19.96 s, 24.96–25.92 s untuk SB02/SB03) dan copy final pengganti "nggak dipikirin".
- Apakah 0.8–1.7 s perlu hero besar lebih awal (melanggar aturan entrance-ikut-dialog) agar lebih dekat ke REF.
- Lanjut ke SB02 setelah SB01 v03 disetujui.

## Reproduksi
```bash
python -I tools/make_audio_v03.py _src_untracked/IMG_6757.MOV remotion/public/audio_v03
# proxy graded: ffmpeg -i IMG_6757.MOV -t 10.5 -vf "$(cat audit/v03/GRADE_DENOISE_FILTER.txt)" ... (see MASTER_CUT_MAP / README)
cd remotion && npx remotion render src/index.ts SB01-v03 ../renders/v03/SB01_v03_remotion_raw.mp4 --image-format=png --crf=10 --muted
npx remotion render src/index.ts SB01-v03 ../renders/v03/SB01_v03_mix_premaster.wav --codec=wav
cd .. && python -I tools/export_stems_v03.py remotion/public/audio_v03 renders/v03/SB01_v03_mix_premaster.wav renders/v03/stems
tools/master_and_mux_v03.sh renders/v03/SB01_v03_remotion_raw.mp4 renders/v03/SB01_v03_mix_premaster.wav renders/v03
tools/compare_v03.sh _src_untracked/ref_after_0-10.mp4 renders/UNLEASH_SB01_v02_PREVIEW.mp4 renders/v03/SB01_v03.mp4 renders/v03
```
