# SB02_QA_REPORT — SB02 V01 (global 10–20 s)

Status: **render teknis selesai, belum disetujui pengguna.** Validasi teknis bukan persetujuan. SB03 belum dimulai.

## Deliverable
| File | Isi |
|---|---|
| `renders/sb02/SB02_V01_FULL.mp4` | 300 f, 1080×1920, 30 fps CFR, yuv420p tv BT.709, AAC 256k, −15.7 LUFS / −2.1 dBTP (paruh kedua master gabungan) |
| `renders/sb02/SB01_SB02_JOIN_20S.mp4` | SB01 V05.1 (gambar) + SB02, 600 f, satu master audio 20 s: −16.1 LUFS / −2.1 dBTP |
| `renders/sb02/SB02_REFERENCE_COMPARISON.mp4` | 7 pasang gerak, referensi \| SB02 (7.5 s) |
| `renders/sb02/SB02_CONTACT_SHEET.png` | Setiap 6 frame, f0–f294 |
| `renders/sb02/SB02_MUSIC_ONLY.wav`, `SB02_FULL_MIX.wav`, `SB01_SB02_JOIN_20S_MIX.wav` | 48 kHz / 24-bit |
| `renders/sb02/stems/SB02_STEM_{VOICE,MUSIC,TEXT_SFX,CARD_SFX,UI_INTERACTION_SFX,TRANSITION_SFX}.wav` | Stem terpisah; jumlahnya = mix sebelum limiter, dengan gain master yang sama |
| `qa/sb02/SB02_FRAME_MAP.md`, `qa/sb02/SB02_REFERENCE_MOTION_MAP.md` | Peta frame dan peta gerak referensi |
| `qa/sb02/MOBILE_360x640_SB02.png`, `qa/sb02/STILL_f*.png` | Uji keterbacaan ponsel dan still resolusi penuh |

## Gate
| Cek | Hasil |
|---|---|
| 300 frame, 10.000 s | ✔ (ffprobe count 300; join 600) |
| Cut asli di 12.033 s = f61 | ✔ (face track: tinggi wajah 224→165 px di f61; selisih frame puncak f60→61) |
| Frame hitam / beku | 0 / 0 (blackdetect + freezedetect), tidak ada frame statis (diff < 0.3) |
| Lompatan | Diff > 30 hanya pada angkat tirai f7–9 (gerak yang disengaja) dan cut f61 |
| Masuk dari SB01 | Layer bomb-in SB01 yang sama dilanjutkan di global f300. Diff batas 5.0 (median 3.8), tanpa fade, kartu judul, atau hitam |
| Keluar ke SB03 | Panel teal/emas berakselerasi dan masih bergerak di f299; tanpa CTA atau poster penutup |
| Panel 04 terlihat dan beranimasi | ✔ f178–262, semua state (poor / pull apart / wireframe / polished / klik / prototype) terlihat di contact sheet |
| Wajah tidak tertutup | ✔ Headline di pita atas (y < 600, kepala mulai ≈ y 630), kartu di y > 1230 atau di tepi kiri/kanan di luar kotak wajah (dicek di contact sheet) |
| Mobile 360×640 | Headline, "Nah, makanya / kalian butuh", "Kabar baiknya", dan CTA terbaca. Teks kecil di dalam kartu ("Latihan 01", label modul) sengaja sekunder dan hanya tipis terbaca |
| Token / font | GSM tealDark/teal/orange/gold; Source Serif 4 BI + Instrument Sans; putih, bukan krem |
| Larangan brief | Tidak ada mockup ponsel, bezel tebal, foto produk, TOKO LOKAL, e-commerce, kartu profil, grafik atau persen palsu, KUOTA TERBATAS, AMANKAN SEAT, LINK DI BIO, poster penutup, reveal UNLEASH |

## Audio
- **Musik:** track v06b yang sama dilanjutkan dari 10.0 s (`trimBefore` 300), gain dan ducking sama dengan SB01. Batas 10 s: RMS −16.7 → −17.4 dBFS, lompatan sampel 0.0016. Tempo 137.8 BPM tetap; beat jatuh di cut (f62.3), "Nah" (f88.5), P03 (f140.6), P04 (f180), dan "×" (f271.3).
- **Mix Remotion vs mirror numpy:** r = 1.00000, selisih level 0.00 dB.
- **Margin VO speech-band (300–4000 Hz):**

  | Segmen | VO−musik | VO−SFX |
  |---|---|---|
  | f0–26 | +9.8 dB | +7.2 dB |
  | f88–188 | +10.3 dB | +5.9 dB |
  | f200–270 | +9.8 dB | +7.4 dB |
  | SB01 (pembanding) | +9.7 – +10.6 dB | +7.6 – +9.1 dB |

  Pass pertama SFX 10 dB terlalu keras (VO−SFX −2…−7 dB), lalu diturunkan ke ×0.32 dengan pengecualian per-event (lihat `tools/make_audio_sb02.py`).
- **Simulasi speaker ponsel (HPF 180 Hz):** musik −24 sampai −33 dBFS dan selalu hadir. Saat VO di-mute (9.05–10 s), musik naik ke −24.
- **SFX:** 36 event dalam 4 grup.
  - Median at-peak: text +7.4, card +4.6, transition +14.9, UI −2.7 dB.
  - SFX UI sengaja halus karena jatuh di tengah ucapan; check dan click masih terdengar sebagai transien.
  - Ekor impact bomb-in SB01 berbunyi melewati batas.
- **VO:** chain sama (0–30.5 s diproses dalam satu pass, identik dengan SB01 pada 0–10 s, r = 1.0).
  - **"personal branding" 19.05–20.00 s di-mute** (fade 25 ms) dan diisi room tone dari jeda talent sendiri (11.2–12.6 s) → **`VO_REPLACEMENT_PENDING`**.
  - Tanpa suara tiruan, perubahan bibir, atau time-stretch. Bibir talent tetap bergerak di f271–299 tanpa suara; ini perlu diganti dengan rekaman VO asli talent.

## Deviasi dari brief (jujur)
1. **Timing panel mengikuti dialog, bukan angka di brief.** Contoh: "DUA HAL" diucapkan di f132, jadi P02 berlangsung f61–140. "Kabar baiknya" diucapkan f200, jadi muncul di dalam P04 sebagai baris sekunder; P06 tidak memuat headline "KABAR BAIKNYA".
2. **P03 "UPGRADING SKILL" tampil sebelum diucapkan.** Talent baru menyebut "upgrading skill" di SB03 (20.5 s). Di SB02 ia hanya berkata "dua hal itu buat bangun bisnis kalian", sehingga headline ini berfungsi sebagai pengantar visual, bukan teks ucapan.
3. **P05 "UPGRADING SKILL × UI/UX WORKSHOP"** berada tepat di wilayah VO yang di-mute (f271–299). Kalau VO pengganti "UI/UX workshop" sudah direkam, posisinya cocok dengan dialog.
4. **"PERCAYA?" di P01.** Kata ini memang diucapkan di 10.28 s, jadi bukan copy baru.
5. **Gerak referensi diukur sebagai durasi/fase dari strip frame, bukan track sub-piksel** (lihat motion map).

## Masih terbuka
- `VO_REPLACEMENT_PENDING` (19.05–20.00 s) dan juga SB01 8.12–8.76 s.
- Belum diuji dengar oleh manusia; angka di atas hasil pengukuran, bukan penilaian telinga.
- Ikon di ujung jalur emas P01 kecil (±80 px); bisa diperbesar bila perlu.
- Hak pakai musik/SFX: semuanya disintesis sendiri (v06b dan `make_audio_sb02.py`), tidak memakai stem referensi.
