# REFERENCE_BEATS — opening `snapgram.io_larg8ak17f8d.mp4`, 0–10 s

Audit 2026-11-07. Sumber diunduh dari folder Drive yang dibagikan pengguna (salinan `D:/download/...` tidak dapat diakses dari sesi cloud ini).

## Metadata (ffprobe)

| File | Video | fps | Durasi | Audio |
|---|---|---|---|---|
| larg8ak17f8d.mp4 (opening utama) | H.264 720×1280 | 30/1 CFR, tb 1/15360, 685 f | 22.953 s | AAC 48 kHz st |
| IMG_6757.MOV (master) | HEVC 1080×1920, yuvj420p BT.709 | r 30/1, avg 29.999 (VFR ringan), 914 f | 30.465 s | AAC 44.1 kHz st |
| 9gightyfqu5k.mp4 | H.264 720×1280 | 30 | 15.299 s | AAC 44.1k |
| 0uqzshinqvol.mp4 | H.264 716×1274 | 30 | 35.753 s | AAC 48k |
| 4ok6p7vncsas.mp4 | H.264 720×1280 | **24** | 18.225 s | AAC 44.1k |
| jxdzwc9awa6j.mp4 (= "(1)" duplikat, ukuran identik) | H.264 720×1280 | 29.97 | 71.259 s | AAC 44.1k |

Master metadata memuat tag `DreaminaMetaInfo` dan `te_is_reencode=1` (file sudah melewati re-encode aplikasi editor). Dicatat, tidak mengubah keputusan.

## Temuan struktural penting

larg8ak17f8d adalah **video showcase Before/After** (watermark @motion.nish_): panel "Before" kecil di kiri (footage mentah), panel **"After"** di tengah = hasil edit. Target rekonstruksi = isi panel After saja.

- Panel After diukur dari transisi luminans (frame 3.0 s): **x 202–676, y 210–1054 → crop 474×844** (rasio 0.5616 ≈ 9:16). Semua koordinat di bawah adalah fraksi panel ini (0–1).
- Chrome showcase (label Before/After, panel Before, latar putih) dan watermark **tidak** direkonstruksi.

## Ucapan referensi (faster-whisper medium, en) — untuk ritme saja

`0.00–3.46 And there's one thing that I'm really looking forward to 2025, | 3.84–6.80 is that how people will start switching to intelligent apparel. | 7.02–7.68 Let me explain. | 7.96–9.46 Our lives are busier than ever. | 9.84– Long days…`

## Tabel beat

Kepastian: **T** = teramati langsung pada frame; **P** = perkiraan rekonstruksi; **B** = belum terbaca/terdengar jelas.

| Sumber + timecode/frame | Yang terlihat/terdengar | Bukti | Cara rekonstruksi | Kepastian |
|---|---|---|---|---|
| ref f0 (0.000) | Seluruh panel = footage di-blur sangat kuat, tint magenta/pink, gradasi vertikal (atas gelap, tengah terang) | fr_a f0 | Plate: footage master blur 70 px ×1.5 + overlay gradasi teal GSM 80 % | T (nilai blur P) |
| ref f1–f2 | Garis panduan putih tipis membentuk salib di (0.48, 0.43); window sharp mulai ~0.03 W | fr_a f1–2 | Garis 2 px putih 45 % mengikuti 4 tepi window, melintang penuh | T |
| ref f3–f23 (0.10–0.77) | Window sharp membesar ease-out: lebar 0.16→0.31(f9)→0.41(f13)→0.53(f17)→0.63(f21)→0.64(f23); tinggi 0.11→0.42; pusat (0.5, 0.43→0.46). Footage di dalam window **tidak** ikut diskala (window = mask) | fr_a | Track `WIN_W/WIN_H/WIN_CY` memakai nilai ini persis | T (±0.02) |
| ref f3–f16 | Coretan putih tebal tangan-bebas menggambar di kanan-atas kepala lalu hilang | fr_a | Path SVG putih, stroke-dashoffset f3–f12, fade f13–f18 | T bentuk / P path |
| ref f5–f11 | Teks kecil putih "If there's" muncul kata-per-kata, kiri-bawah window | fr_a | Slot teks kecil → "Kata" | T |
| ref f25–f48 (0.83–1.6) | Headline besar pink rounded-sans "One Thing" (outline/highlight putih, shadow), tengah, y≈0.58; teks kecil "that I'm really" di bawah | after_0 | Slot headline 1 → "Siapa?" (Source Serif 4 BI, orange glow) | T |
| ref f50–f57 | "One Thing" keluar (blur), "LOOking" masuk; huruf O = mata animasi | after_0, fr_b | Slot headline 2 → "Bangun Bisnis". **Gimmick mata tidak dibawa** (khusus kata "LOOking") | T / keputusan |
| ref f60–f72 | "forward to" kecil rata-kanan di bawah headline; garis putih + titik pink | fr_b | Slot → "cuma butuh" + garis putih + titik orange | T |
| ref f66–f71 | Sabetan stroke pink di kanan headline | fr_b | Stroke orange, draw-on | T |
| ref f72–f75 (2.40–2.50) | Window melebar ke full frame dalam **3 frame** dengan motion blur (f73 ~0.80 W, f74 ~0.92 W, f75 full). Teks tetap di posisi layar | fr_b f72–75 | `WIN_*` f72–75 + blur 9→6→0 px | T |
| ref f80–f95 (2.67–3.17) | Kotak "2025": isi gelap transparan, border putih, 4 handle sudut (gaya bounding box), y 0.67–0.75, x 0.23–0.74; isi ditulis coretan tangan lalu menjadi teks bold putih | after_0, fr_b, fr_c | Kotak + handle; "UANG?" wipe kiri→kanan dengan blur 5→0 (coretan tangan **tidak** dibuat ulang, P) | T kotak / P tulisan |
| ref f96–f111 | Hold kotak + headline | fr_c | Hold | T |
| ref f112–f114 (3.73–3.80) | Kamera goyang + blur besar pada footage dan teks | fr_c | Blur 0→14 px + jitter horizontal | T (amplitudo P) |
| ref f115–f119 (3.83–3.97) | **Circle wipe putih** tumbuh dari (0.5, ~0.47), ease-in, menutup penuh dalam 5 frame; tepi sedikit organik | fr_c | Lingkaran **teal gelap #09292F** (keputusan warna, lihat GSM_TOKENS); dimajukan −13 f untuk menutup cut master f107 | T |
| ref f119–f124 | Layar putih kosong | fr_c | Plate teal gelap + glow cyan lembut | T |
| ref f124–f140 (4.13–4.67) | Ikon 3D (kaos) masuk berputar dari kiri-bawah ke tengah dengan motion blur, settle | after_3.5 | Ikon uang kertas native SVG (orange/teal), lintasan & rotasi sama | T gerak / ikon diganti isi |
| ref f147–f170 (4.9–5.67) | Ikon kolaps menjadi pill gelap "switching to" (teks diketik), toggle di kanan; kursor masuk & klik toggle; emoji pop di sekitar | after_3.5 | Pill gradasi cyan-teal "skill eksekusi"; kursor klik pada kata "nol" (5.96 s) → toggle off + chip "0" orange (pengganti emoji) | T / P |
| ref f180–f196 (6.0–6.53) | Pill memekar menjadi kartu pencarian "intelligent apparel" + ikon cari; grid ikon produk pop berurutan | after_3.5, fr_d | Kartu "produk" + 6 tile mini-UI (native, tanpa data) | T |
| ref f195–f205 | Grup kartu bergulir ke atas keluar; "Let me" diketik; kartu talent (sudut membulat, shadow kanan-bawah) naik dari bawah ke top ≈0.42 → 0.36, x 0.08, lebar ~0.84 | fr_d | `CARD_TOP/K/X/R` | T |
| ref f208–f215 | "Explain" besar pink muncul (blur-in cepat), "Let me" kecil terselip | fr_d | Slot → "dan percuma" + "Produk Bagus" | T |
| ref f216–f219 (7.2–7.3) | Kartu membesar ke full frame, teks terdorong ke atas | fr_d | Scale kartu → 1, radius → 0 | T |
| ref f221–f227 (7.37–7.57) | Vignette gelap muncul dan menetap; defocus besar lalu tajam kembali + push-in | fr_d | Vignette teal gelap, blur 0→14→0, scale ×1.1 | T |
| ref f235–f247 | "Our lives are" kecil tengah y≈0.65; blob pink terbang dari kanan | after_7 | "kalau" + stroke orange | T |
| ref f252–f262 (8.4–8.73) | "Busier" besar pink mendarat (overshoot), cipratan putih di kiri | after_7 | "UI/UX" + 5 titik putih | T (cipratan P) |
| ref f262–f270 | Kotak kecil "than ever" kanan-bawah headline | after_7 | Label cyan "nggak dipikirin" | T |
| ref f280 (9.33) | **Hard cut** ke B-roll ilustrasi (wanita stres + doodle kata); "Busier" tertinggal semi-transparan lalu hilang ±6 f | after_7 | Master tidak punya B-roll → **punch-in cut** (×1.15) pada f280 + ghost teks | T / keputusan terbuka |
| Audio 0–10 s | VO EN + musik latar; transien SFX tidak dianalisis | ASR | Tidak ada audio referensi yang dipakai; hanya audio master | B (SFX belum didengar — sesi ini tidak bisa mendengar) |

Teks Arab: **tidak ditemukan** pada 0–10 s referensi ini.

## Reels tambahan (peran, belum dipakai di SB01)

| File | Isi singkat | Relevansi |
|---|---|---|
| 9gightyfqu5k | Talent berjalan di luar ruangan; tipografi campur serif italic + bold sans; kartu statistik & mockup layar HP (12–14 s) | Kandidat untuk shot berjalan master 12–22 s dan beat mockup HP |
| 0uqzshinqvol | Showcase Before/After; headline kuning; overlay kartu ID | Kandidat untuk kartu modul (beat solusi) |
| 4ok6p7vncsas (24 fps) | Showcase Raw/My Edit; tembok pecah, kartu putih teks | Rendah |
| jxdzwc9awa6j | Dua talent; kinetic type serif/sans, neon; layar profil sosial (54–58 s) | Kandidat untuk beat UI layar & CTA |
| rpv3riq8o6cx | Tidak tersedia | Tidak dianalisis |

Contact sheet: `audit/contact_sheets/`.
