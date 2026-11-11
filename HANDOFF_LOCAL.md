# HANDOFF — pindah dari sesi cloud ke sesi Claude Code lokal

Ringkasan seluruh sesi cloud (proyek UNLEASH × TDC ITS, SB01 + SB02), cara menyiapkan mesin lokal, daftar lampiran,
dan prompt pembuka untuk sesi baru. Kondisi per commit terakhir di branch `ccr-a54f6557-i6gwaj`.

---

## 1. Proyek singkat
- Reel vertikal **UNLEASH × TDC ITS** (promosi UI/UX Workshop), 1080×1920, 30 fps, Rec.709, dibangun di **Remotion 4.0.541**
  (React 19.1, TypeScript 5.8) dari footage master **`IMG_6757.MOV`**. Talent asli tidak boleh diganti AI.
- Dipecah per storyboard 10 detik: **SB01** = global 0–10 s, **SB02** = global 10–20 s, **SB03** = 20 s+ (belum dimulai).
- Gaya visual mengikuti **GSM TDC**:
  - Warna: tealDark `#09292F`, teal `#18626F`, cyan `#238FA2/#29A6BB/#2EBCD5`, orange `#FE9831/#FFB36A`, gold `#EBBB6E`, putih `#FFFFFF`.
  - Font: **Source Serif 4 Bold Italic** + **Instrument Sans** (OFL, sudah ada di `remotion/public/fonts/`).
  - Token di `remotion/src/lib/tokens.ts`.
- Referensi gerak (hanya bagian AFTER-nya; talent, watermark, dan border mereka tidak dipakai):

  | Peran | File | Dipakai untuk |
  |---|---|---|
  | SB01 | `larg8ak17f8d.mp4` | gerak SB01 |
  | MAIN | `jxdzwc9awa6j.mp4` | tipografi editorial, mask, kamera |
  | SECONDARY | `9gightyfqu5k.mp4` | overlay depan, kartu |
  | SUPPORTING | `0uqzshinqvol.mp4` | ilustrasi vektor semantik |

## 2. Preferensi & aturan pengguna (WAJIB diikuti)
1. **Subtitle dan ilustrasi harus sesuai kalimat yang sedang diucapkan talent.** Tidak boleh ada ilustrasi yang mendahului ucapan atau tidak nyambung (feedback SB02 V01).
2. **Kamera tracking wajah + zoom-in (punch) di tiap subtitle kunci.**
3. **Suara talent harus jelas/keras.** VO +4 dB di atas musik dan SFX; musik tetap terdengar sejak detik 0, juga di speaker HP.
4. **Tipografi ringan ala GSM:** gradasi + highlight putih + glow tipis + satu bayangan lembut + tepi 1 px. Tanpa outline tebal dan tanpa bayangan offset keras.
5. **Semua warna krem diganti putih.**
6. Ilustrasi UI harus **rapi, ringkas, dan sekunder**; tidak pernah menutupi wajah. Jarak huruf hero tidak boleh renggang dan teks tidak boleh bertumpuk.
7. **Jangan pernah menimpa versi lama.** Buat versi/folder baru. Jangan klaim "disetujui" hanya karena lolos cek teknis.
8. **Copy:**
   - "Personal Branding" diganti **UI/UX Workshop**.
   - DILARANG: mockup ponsel penuh, bezel tebal, foto produk, TOKO LOKAL, e-commerce, kartu audiens/profil, grafik atau persen palsu, KUOTA TERBATAS, AMANKAN SEAT, LINK DI BIO, poster penutup, reveal UNLEASH sebelum waktunya.
9. **Tidak ada voice cloning, suara tiruan, atau perubahan bibir.** Kata "personal branding" yang terucap di-mute dan ditandai `VO_REPLACEMENT_PENDING` sampai talent merekam ulang.
10. **Audio harus aman hak cipta.** Stem musik referensi (LARG / @motion.nish_) hanya untuk analisis, tidak untuk publikasi. SFX yang dipakai: sintesis sendiri, atau rekaman **CC0** / Mixkit / Pixabay yang lisensinya sudah dicek.
11. Pengguna berbahasa Indonesia santai. Balas dalam bahasa Indonesia.

## 3. Status per storyboard

### SB01 (global 0–10 s) — versi terbaru **V05.1 + sound v06b**
- **Kode:** `remotion/src/sb01v051/`, composition **`SB01-v051`**. Versi lama v01, v02, v03, v04, v05 tetap ada.
- **Render:** `renders/v051/SB01_V051_FULL.mp4` (gambar) dan `renders/v06/SB01_V051_SOUND_V06B.mp4` (gambar + audio v06b).
- **Isi:**
  - Aperture opening, hook "Kata siapa bangun bisnis cuma butuh UANG?"
  - Wipe, lalu Panel 04: koin → gear → 0 % → NOL.
  - Re-entry, lalu "kalau UI/UX nggak dipikirin" + `WorkshopDashboardFragment` (state poor, kursor gagal klik).
  - Bomb-in teal/emas (f288–299) sebagai jembatan ke SB02.
- **Audio v06b:**
  - Musik sintetis 137.8 BPM half-time, panjang 32 s supaya bersambung ke SB02.
  - SFX dikunci ke beat.
  - Total −16 LUFS.
- **QA:** `qa/QA_REPORT_v051.md`, `qa/v051/SOUND_DESIGN_V06.md`.
- **Masih terbuka:** `VO_REPLACEMENT_PENDING` di 8.12–8.76 s ("personal branding" diucapkan di SB01).

### SB02 (global 10–20 s) — versi terbaru **V01.1**
- **Kode:** `remotion/src/sb02/` (`SB02.tsx`, `Cards.tsx`, `AudioMixSB02.tsx`, `sound_sb02.json`, `faceTrack.json`), composition **`SB02-v01`** (300 f).
- **Render:**
  - `renders/sb02/SB02_V01_FULL.mp4`
  - `renders/sb02/SB01_SB02_JOIN_20S.mp4`
  - `renders/sb02/SB02_REFERENCE_COMPARISON.mp4`
  - `renders/sb02/SB02_CONTACT_SHEET.png`
  - WAV dan 6 stem (VOICE, MUSIC, TEXT, CARD, UI, TRANSITION)
- **Dokumen:** `qa/sb02/SB02_FRAME_MAP.md`, `qa/sb02/SB02_REFERENCE_MOTION_MAP.md`, `qa/sb02/SB02_QA_REPORT.md`, `qa/sb02/SB02_AUDIO_METRICS.txt`.
- **Cut asli** di master 12.033 s = frame lokal **f61** (duduk → berdiri).
- **Peta V01.1** (frame lokal; global = 300 + f):

  | Frame | Ucapan | Subtitle | Ilustrasi |
  |---|---|---|---|
  | f0–60 | "Siapa yang mau percaya?" | **PERCAYA?** | "?" emas |
  | f61–88 | jalan, diam | — | bersih |
  | f88–145 | "Nah, makanya kalian butuh dua hal" | **DUA HAL** | kartu 01/02 jatuh |
  | f145–188 | "itu buat bangun bisnis kalian" | **BANGUN BISNIS** | kartu → fondasi → gedung, atap + bendera, lampu |
  | f199–221 | "Kabar baiknya," | — | kilau emas |
  | f220–270 | "kalian bisa mendapatkan ilmu" | **ILMU** | buku terbuka + ide + ikon ilmu |
  | f271–299 | VO di-mute | **UI/UX WORKSHOP** | kartu workshop + klik CTA |
  | f286–299 | — | — | exit teal/emas ke SB03 |

- **Kamera:** track `ZOOM` + face-lock.
- **Masuk dari SB01:** layer bomb-in SB01 yang sama di-render ulang di global f300+, jadi sambungannya mulus.
- **Audio:**
  - Musik v06b disambung (`trimBefore` 300).
  - VO +4 dB (`voGain` 1.585).
  - Master gabungan 20 s: −16.1 LUFS / −1.5 dBTP.
- **Masih terbuka:**
  1. `VO_REPLACEMENT_PENDING` di 19.05–20.00 s ("personal branding" → "UI/UX workshop").
  2. **Ganti SFX sintetis dengan rekaman asli CC0** (sedang berjalan, lihat §5).
  3. Belum ada review dengar atau tonton oleh pengguna untuk V01.1.

### SB03 — belum dimulai
- Ucapan dimulai f299+ SB02: "sekaligus upgrading skill …".

## 4. Lampiran untuk sesi lokal — jawabannya: **prompt + repo Git + file sumber yang tidak ada di Git**

| Apa | Dari mana | Wajib? |
|---|---|---|
| **Repo** `galen-zahid/unleash-content`, branch **`ccr-a54f6557-i6gwaj`** | `git clone` lalu `git checkout ccr-a54f6557-i6gwaj` | wajib — kode, tools, QA, render, dokumen ini |
| **`IMG_6757.MOV`** (master, ±42 MB) → taruh di `_src_untracked/` | Google Drive kamu (folder brief awal) | **wajib** — semua proxy dan VO dibuat dari file ini |
| Video referensi → `_src_untracked/`: `jxdzwc9awa6j.mp4`, `9gightyfqu5k.mp4`, `0uqzshinqvol.mp4`, `larg8ak17f8d.mp4` | file snapgram yang dulu kamu kirim (nama file `snapgram.io_<id>.mp4`; ganti nama jadi `<id>.mp4`) | perlu untuk perbandingan gerak dan analisis referensi |
| File SFX CC0 hasil download manual (§5) → `audio_src/sfx_cc0/` (folder baru) | Freesound (login gratis), Mixkit, Pixabay | untuk tugas berikutnya |
| `HANDOFF_LOCAL.md` (file ini) | sudah ada di repo | cukup sebut di prompt |

**Tidak perlu dilampirkan** karena dibuat ulang otomatis oleh `bash tools/bootstrap_local.sh`:
- proxy footage di `remotion/public/master/`
- semua WAV di `remotion/public/audio_v06/` dan `remotion/public/audio_sb02/`

Hasil generate ulang sudah diverifikasi identik: 0 selisih pada semua WAV v06; proxy SB02 sejajar di offset 0 frame.
Stem musik referensi (`remotion/public/audio_ref/*.wav`) tidak diperlukan.

**Perangkat lunak di mesin lokal:**
- Node 18+
- ffmpeg/ffprobe di PATH
- Python 3.10+ dengan `numpy scipy soundfile` (opsional `faster-whisper` untuk ASR, `opencv-python<5` untuk face track)
- Git

Remotion akan mengunduh browser-nya sendiri. Variabel `REMOTION_BROWSER` tidak perlu diset di lokal.

**Langkah setup:**
```bash
git clone https://github.com/galen-zahid/unleash-content.git UNLEASH-CONTENT
cd UNLEASH-CONTENT && git checkout ccr-a54f6557-i6gwaj
mkdir -p _src_untracked   # taruh IMG_6757.MOV + video referensi di sini
python3 -m pip install numpy scipy soundfile
bash tools/bootstrap_local.sh python3
cd remotion && npx remotion studio src/index.ts   # cek SB01-v051 dan SB02-v01
```

## 5. Tugas yang sedang berjalan: SFX rekaman asli (CC0)
- Shortlist dari Openverse ada di `audit/sb02/sfx_real/SHORTLIST.md` dan `candidates.json` (12 kategori, hanya CC0).
- Dari server cloud, CDN Freesound dan Mixkit menolak download otomatis (403). Di lokal, **download manual lewat browser**.
- Rekomendasi 1 file per cue (pastikan "Creative Commons 0" tertulis di sidebar halaman):

  | Kategori | File | Link |
  |---|---|---|
  | whoosh cepat | Quick Swish | https://freesound.org/people/deleted_user_6479820/sounds/388004 |
  | whoosh lembut | Swipe Whoosh | https://freesound.org/people/qubodup/sounds/60007 |
  | riser | reverse cymbal.wav | https://freesound.org/people/John%20Rayson/sounds/23127 |
  | pop bernada | Bubble Pop | https://freesound.org/people/Mafon2/sounds/253956 |
  | knock | Wood block hit | https://freesound.org/people/thomasjaunism/sounds/218460 |
  | klik CTA | Mouse Click | https://freesound.org/people/Sillyslimeball/sounds/333575 |
  | tick kata | t key | https://freesound.org/people/uEffects/sounds/181001 |
  | lampu | Light Switch | https://freesound.org/people/LoafDV/sounds/238290 |
  | chime | Chime Notification | https://freesound.org/people/Jofae/sounds/380482 |
  | ide | Sparkle | https://freesound.org/people/nomiqbomi/sounds/578803 |
  | buku | Page Turn 1 | https://freesound.org/people/mateusboga/sounds/614079 |
  | hit kata kunci | Thump | https://freesound.org/people/SamsterBirdies/sounds/368606 |

- Yang harus dikerjakan:
  1. Trim, ukur, dan normalisasi tiap file. Pop untuk lantai gedung dibuat bernada naik.
  2. Petakan ke cue di `tools/make_audio_sb02.py` (`place`) dan `AudioMixSB02.tsx`.
  3. Mix ulang dengan `tools/mix_sound_sb02.py`. Gate: VO−SFX speech-band ≥ +6 dB, −16 LUFS, ≤ −1.5 dBTP setelah AAC.
  4. Render ulang `SB02_V01_FULL` dan `JOIN_20S` ke **folder versi baru** (mis. `renders/sb02_v012/`).
  5. Catat lisensi per file di manifest.
- Opsi lain yang sudah dibahas:
  - **Earshot** (github.com/Leonxlnx/earshot, MIT): bank 252 SFX dari kode, plus `earshot critique` untuk cek sinkron dan masking. Belum dipasang karena butuh izin install.
  - **Epidemic Sound**: berbayar. Untuk konten promosi organisasi kemungkinan perlu lisensi komersial.

## 6. Pipeline teknis yang terbukti jalan (jangan diubah tanpa alasan)
- **Render:** `npx remotion render src/index.ts <ID> out.mp4 --image-format=png --crf=10 --muted`. Audio di-render terpisah: `--codec=wav <ID> mix.wav`.
- **Mux final:**
  ```
  ffmpeg -i raw.mp4 -i MIX.wav -map 0:v -map 1:a -vf "scale=out_range=tv:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 16 -profile:v high -r 30 -fps_mode cfr -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest out.mp4
  ```
- **Join SB01 + SB02:** concat video dari `renders/v051/SB01_V051_FULL.mp4` + raw SB02, ditambah `SB01_SB02_JOIN_20S_MIX.wav` dari `tools/mix_sound_sb02.py`.
- **Mix SB02:** `python -I tools/mix_sound_sb02.py renders/sb02 [remotion_mix.wav] --diag`. Script ini adalah mirror numpy dari `AudioMixSB02` (r = 1.00000) dan melakukan master gabungan 20 s (pre-limit 192 kHz `alimiter latency=true` + loudnorm linear dua pass).
- **QC wajib:**
  - 300 frame
  - blackdetect/freezedetect = 0
  - selisih frame di batas SB01→SB02 kecil
  - contact sheet tiap 6 frame
  - still mobile 360×640
  - wajah tidak tertutup
  - LUFS/TP setelah AAC
- **Grade footage:** `audit/v03/GRADE_DENOISE_FILTER.txt`. Jangan set `in_range` eksplisit, karena pernah menyebabkan range terkompres dua kali.
- **Data dialog:**
  - `audit/MASTER_ASR_words.json` (onset per kata)
  - `audit/sb02/FACE_TRACK.json` / `remotion/src/sb02/faceTrack.json` (wajah, dihaluskan)
  - `remotion/src/sb01v051/cues.json`

---

## 7. PROMPT untuk sesi lokal baru (salin semua di bawah ini)

```
Lanjutan proyek UNLEASH × TDC ITS (reel vertikal Remotion). Aku pindah dari sesi Claude Code cloud ke lokal.
Repo sudah di-clone di folder ini, branch ccr-a54f6557-i6gwaj. BACA DULU HANDOFF_LOCAL.md sampai habis — isinya
ringkasan semua keputusan, preferensi aku, status SB01/SB02, pipeline render/mix/QC, dan tugas yang sedang jalan.

Langkah pertama:
1. Cek _src_untracked/ sudah berisi IMG_6757.MOV (+ video referensi jxdzwc9awa6j, 9gightyfqu5k, 0uqzshinqvol,
   larg8ak17f8d). Kalau belum ada, bilang ke aku.
2. Jalankan `bash tools/bootstrap_local.sh python3` untuk membuat ulang proxy footage + semua WAV, lalu typecheck
   (cd remotion && npx tsc --noEmit) dan render 1 still SB02-v01 frame 160 untuk memastikan setup benar.
3. Tugas berikutnya: ganti SFX sintetis SB02 dengan rekaman asli CC0 yang aku download ke audio_src/sfx_cc0/
   (daftar & cue di HANDOFF_LOCAL.md §5). Tiap SFX harus nempel ke gerakan visual yang sesuai dengan kalimat
   talent; suara talent tetap paling dominan (VO−SFX ≥ +6 dB), musik tetap terdengar. Render ke folder versi baru,
   jangan timpa versi lama. Catat lisensi tiap file.

Aturan: subtitle & ilustrasi harus sesuai yang diucapkan talent; kamera face-tracking + punch-in per subtitle kunci;
tipografi ringan ala GSM, putih bukan krem; ilustrasi rapi dan tidak menutupi wajah; tanpa voice cloning
("personal branding" tetap di-mute = VO_REPLACEMENT_PENDING); jangan klaim aku sudah approve. Jangan mulai SB03
sebelum aku minta. Commit + push ke branch yang sama setelah tiap versi. Balas pakai bahasa Indonesia santai.
```
