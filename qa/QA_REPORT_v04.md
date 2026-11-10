# QA_REPORT_v04 — SB01 V04.1

Status: tes terisolasi sudah direview; atas permintaan pengguna ("lanjutin") dilanjutkan ke **render final 10 s** `renders/v04/SB01_V04.mp4` (lihat bagian *Final* di bawah). SB02/SB03 belum dikerjakan. v01–v03 utuh; v04 = `remotion/src/sb01v04/` (composition `SB01-v04`).

## Deliverable
| File | Isi |
|---|---|
| `renders/v04/SB01_V04_OPENING_TEST.mp4` | 0–3.6 s, 1080×1920, 30 fps, 108 f, yuv420p/BT.709 tv, audio = potongan master mix |
| `renders/v04/SB01_V04_UIUX_TEST.mp4` | 7.7–10.0 s (f231–f299), 69 f |
| `renders/v04/SB01_V04_MUSIC_ONLY.wav` | musik saja, dengan ducking dan gain master yang sama |
| `renders/v04/SB01_V04_VO_MUSIC.wav` | VO + musik |
| `renders/v04/SB01_V04_FULL_MIX.wav` | full mix, −16.0 LUFS / −2.4 dBTP (linear) |
| `renders/v04/audio/stem_{vo,music,opening,typographic,coin,gear,transition,bomb}.wav` | 8 stem terpisah |
| `renders/v04/REF_AFTER_vs_SB01_V04.mp4` | REF AFTER \| V04, kedua segmen, nomor frame di label |
| `audit/v04/FRAME_MAP.md` | timing REF → output per event |
| `qa/v04/FRAMESTEP_*.png` | frame-by-frame REF \| V04 di 0.3–1.2 s, 2.3–2.8 s, 2.9–3.5 s, 8.0–10.0 s |

## Perubahan inti & bukti

### 1. Aperture (sebelumnya "kaku mekanis")
Tepi diukur ulang per frame dari referensi. Ternyata referensi membuka dengan **sedikit akselerasi** (0.022→0.032 W/f), berhenti, lalu berakselerasi lagi ke full frame. v03 memakai ease-out dengan key linear sehingga gerakannya tersendat. Hasil pengukuran ulang pada render (`audit/v04/APERTURE_COMPARE.txt`):

| | galat lebar vs REF (f3–f71) | kecepatan per frame f2–f19 | akselerasi maks f1–f30 |
|---|---|---|---|
| v03 | rata-rata 0.038 W, maks 0.081 W | 0.127, 0.004, 0.104, 0.009, 0.083, … (tersendat) | 0.123 W/f² |
| **v04** | **≤0.003 W per frame** (f3–f19, f68–f71) | 0.021→0.032, mulus seperti REF | **0.011 W/f²** |
| REF | — | 0.021→0.032 | 0.032 W/f² (berhenti mendadak di f20) |

Interpolasi monotone cubic (C1, tanpa overshoot). Tepi yang bergerak diberi feather sebesar setengah jarak tempuh per frame (motion blur 180°). Kamera di dalam aperture memakai skala ORB terukur: zoom-out −13 % di f5–11 dan push-in +7.5 % di f69–79. Satu deviasi disengaja: berhenti di f20 dilandaikan di f19–23.

### 2. Tipografi
- Hero pertama kini mulai di **f25 (0.83 s)**, sama dengan referensi.
- Setiap frasa memakai mekanik pasangannya di referensi: naik+blur ("Kata"), geser dari kanan ("siapa?"), exit blur dissolve, pop ("Bangun"/"bisnis"), kata per kata ("cuma butuh"), kotak dengan handle lalu huruf jatuh berotasi ("UANG?"), besar-blur lalu tajam ("UI/UX"), dan kotak miring yang menjadi rata.
- Hero memakai Source Serif 4 BI dengan 3 tahap kedalaman. Ukuran mengikuti referensi: hero 0.64 W (ref 0.61), "UANG?" 0.56 W (ref LOOking ≈0.6), "UI/UX" 0.67 W (ref "Busier" 0.67).

### 3. WorkshopLearningDashboard (pengganti)
- `PhoneFG` (ponsel dengan bezel, garis acak, dan "?") serta `CursorFG` dari v03 dihapus. **`UMKMProductPage` / TOKO LOKAL / keranjang tidak pernah ada di branch ini.**
- Komponen baru `Dashboard.tsx` terdiri dari: Layer A panel utama (teal gelap dan ivory, tepi emas), Layer B tiga kartu modul dengan ikon SVG native, dan Layer C pill navigasi, garis konektor putus, kursor, serta tombol. Semua copy sesuai brief.
- State `poor` dirender: hierarki terbalik (judul lebih lemah dari deskripsi), kartu bertumpuk, jarak tidak konsisten, CTA ghost pucat, navigasi terputus, kursor ragu-ragu (berhenti dan berbalik arah).
- Layout `polished` hanya didefinisikan sebagai data untuk SB02 dan tidak dirender.
- Posisi dashboard di bawah garis hero, sebagian terpotong tepi bawah frame, dan tidak menutupi wajah. Tiap layer punya kedalaman parallax sendiri dan ikut skala kamera di sekitar titik wajah.

### 4. Bomb-in
Panel dashboard (visual dominan) berakselerasi ke kamera (ease-in, ×9.5) dengan motion blur grafis 16 sampel/160°. Layer lain terlempar keluar, dan teks UI/UX ikut maju lalu memudar. Frame akhir berupa permukaan teal panel dengan pita emas yang masih bergerak di f299 (bukan kartu warna statis), tanpa frame hitam. Impact terjadi di f297.

### 5. Musik (sebelumnya "tidak terdengar")
Bukti objektif v03: tempo **tidak terdeteksi** di full mix (estimator yang sama: 87 BPM untuk bed 120 BPM, kekuatan 0.05), dan musik 11 dB di bawah VO saat dialog.

V04: bed original 108 BPM (kick four-on-the-floor, clap 2 & 4, hat offbeat dan shaker 16th, bass pulse dengan pumping, pluck sinkopasi, pad, riser ke wipe/re-entry/bomb), 32 s untuk edit 30 s. Musik dipecah 3 pita dengan ducking terpisah: mid ×0.2, low ×0.72, air ×0.61.

| Metrik (master −16 LUFS) | v03 | **v04** |
|---|---|---|
| Level musik keseluruhan | −25.6 dBFS | **−23.4** (+2.2 dB) |
| Level musik di bawah dialog (f116–188) | −31.2 dBFS | **−24.1** (+7.1 dB) |
| Tempo terdeteksi di full mix | 87 BPM (salah; bed 120) | **107.1 BPM** (target 108) |
| Periodisitas groove, pita kick / hat | 0.10 / 0.22 | **0.20 / 0.37** |
| Margin VO di pita bicara B / D / E / F | +9.9 / +8.9 / +13.1 / +4.3 dB | **+8.1 / +10.0 / +12.1 / +5.6 dB** |
| Kedalaman ducking | ≈15 dB | 2.1 dB broadband (dalam di pita mid) |

- Mix Remotion = mirror numpy (r = 1.00000).
- Loudness dua pass: pre-limiter dengan **kompensasi latency** (delay 0 sampel; ini juga menjelaskan lag 3.1 ms di v03, yang ternyata berasal dari lookahead limiter, bukan AAC), lalu loudnorm **linear** → −16.0 LUFS / −2.4 dBTP.

### 6. Grading & denoise
Proxy v03 dipakai ulang tanpa perubahan (`hqdn3d=1.5:1.2:5:4` + koreksi warna, konversi range sekali saja dan terverifikasi). Tidak ada perubahan grade di v04.

## Perbedaan terlihat/terdengar yang tersisa (jujur)
1. **Tidak ada padanan teks kecil "If there's" (f5–f24).** Selama 0–0.83 s, v04 hanya menampilkan aperture dan coretan.
2. **Wajah di dalam aperture lebih kecil** (≈0.18 W vs ≈0.27 W di referensi). Footage sudah ×1.4–1.6; memperbesarnya lagi akan membuat upscale lunak.
3. Hero 2 dan "cuma butuh" bergeser −5…+10 f dari referensi karena dikunci ke ucapan. Bagian UI/UX juga datang 9 f lebih awal ("personal" diucapkan f243).
4. Coretan pink yang terus bergerak di sekitar "LOOking" (f75–f96) hanya diwakili satu loop orange di f88–94. Gimmick mata pada huruf O tidak dibuat.
5. Referensi melakukan **hard cut ke B-roll di f280**. v04 tetap di footage (B-roll AI dilarang) dan menggantinya dengan dashboard dan bomb-in.
6. Teks modul dashboard kecil di ukuran 360×640; ini disengaja karena dashboard adalah ilustrasi pendukung, bukan subjek utama.
7. Motion blur kamera grafis tetap menampilkan streak bertingkat ringan pada zoom paling cepat (f294–296).
8. **Audio belum diuji dengar** (sesi ini tidak bisa memutar audio). Tempo "pita hat" 142.9 BPM adalah artefak estimator karena shaker 16th; tempo full mix 107.1 BPM.
9. `VO_REPLACEMENT_PENDING`: audio 8.12–8.76 s masih berbunyi "personal branding". "nggak dipikirin" masih usulan copy.
10. Panel 04 (3.9–6.6 s) dipertahankan dari v03 dan tidak termasuk tes terisolasi ini.

## Final (setelah tes terisolasi)
Perubahan setelah tes `_r1`:
- coretan aksen orange di sekitar hero 2 (f74–f87), padanan coretan pink yang terus bergerak di sekitar "LOOking" (ref f75–f96);
- motion blur bomb-in dinaikkan ke 24 sampel / 160° sehingga streak bertingkat berkurang;
- **bug `Mask` diperbaiki**: kata kecil sempat mengintip sebelum entrance karena geseran tidak menghitung padding bayangan. Ditemukan di QA transisi f196–f200; v03 punya bug yang sama tetapi tidak diubah;
- "dan" baru masuk setelah kartu kolaps hilang (f199).

| Gate | Hasil | Bukti |
|---|---|---|
| Format | 1080×1920, 30/1 CFR, 300 f, 10.000 s, H.264 High, yuv420p, tv, BT.709 | `audit/v04/QC_FINAL_v04.txt` |
| Frame hitam / beku | 0 / 0 | idem |
| Loudness final MP4 (setelah AAC) | −16.0 LUFS, TP −2.4 dBTP | idem |
| Sync audio vs master | −0.94 ms konstan (dari kompensasi VO cleanup) | idem |
| Transisi −2…+2 | f20, 75, 106, 117, 198, 230, 243, 292 tanpa lompatan atau dead frame | `qa/v04/TRANSITIONS_V04_m2_p2.png` |
| Mobile 360×640 | hero, label Panel 04, dan copy dashboard utama terbaca | `qa/v04/MOBILE_360x640_V04.png` |
| Perbandingan | REF \| v03 \| V04 (0–10 s), REF \| V04 (0–10 s), REF \| V04 (dua segmen tes) | `renders/v04/SB01_REF_vs_v03_vs_V04.mp4`, `REF_AFTER_vs_SB01_V04_full_0-10s.mp4`, `REF_AFTER_vs_SB01_V04.mp4`, `qa/v04/SB01_REF_v03_V04_beats_grid.png` |

Tes terisolasi (`SB01_V04_OPENING_TEST.mp4`, `SB01_V04_UIUX_TEST.mp4`) kini dipotong frame-akurat dari final; versi pertama disimpan sebagai `*_r1.mp4`.

Perbedaan tersisa dan status `VO_REPLACEMENT_PENDING` tetap seperti daftar di atas. SB02 dan SB03 belum dikerjakan.
