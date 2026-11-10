# QA_REPORT_v051 — SB01 V05.1 (UI/UX illustration rebuild + lighter typography)

V05 tidak diubah. V05.1 = `remotion/src/sb01v051/` (composition `SB01-v051`). Belum disetujui pengguna.

## Deliverable
| File | Isi |
|---|---|
| `renders/v051/SB01_V051_UIUX_PREVIEW.mp4` | 7.7–10.0 s (f231–f299), dipotong frame-akurat dari full |
| `renders/v051/SB01_V051_UIUX_CONTACT_SHEET.png` | setiap 3 frame f231–f299 |
| `renders/v051/SB01_V051_BEFORE_AFTER.png` | V05 \| V05.1 di 8.3 s, 8.8 s, 9.2 s |
| `renders/v051/SB01_V051_FULL.mp4` | 10 s penuh, 1080×1920, 30 fps, 300 f, yuv420p tv BT.709, −16.0 LUFS / −2.4 dBTP, tanpa frame hitam/beku |
| `qa/v051/STILL_8p3s.png`, `STILL_8p8s.png`, `STILL_9p2s.png` | still resolusi penuh |
| `qa/v051/MOBILE_360x640_V051.png` | skala ponsel (opening + beat UI/UX) |
| `qa/v051/TYPE_V05_vs_V051_f270.png` | perbandingan perlakuan tipografi |
| `remotion/src/sb01v051/WorkshopDashboardFragment.tsx` | komponen reusable |

## 1. Ilustrasi UI/UX — yang diganti
**Dihapus (V05):** panel dashboard selebar layar (952×404) berisi header dan tab, kartu info, tiga baris modul, anotasi putus-putus, dan badge "?". Isinya terlalu banyak teks kecil dan bersaing dengan talent dan headline.

**Baru — `WorkshopDashboardFragment`** (gambar konsep pengguna dipakai sebagai panduan komponen, bukan overlay PNG):
- **A. MainWorkshopCard** (640×410 px ≈ 21 % H): bingkai putih dengan ketebalan 2.5D, panel deep teal, label emas "DESIGN WORKSHOP", judul "Learn. Design. Build." (serif BI putih), "Tingkatkan skill UI/UX.", CTA "Mulai Belajar →", jendela wireframe kecil di atas blob orange. Tanpa wordmark brand, karena ini UI fiktif.
- **B. ModuleFloatCard "01 — UI/UX Basics"** dengan ikon buku. Menindih sudut kiri-atas kartu A; total komposisi ≈ 26 % H.
- **C. ModuleFloatCard "03 — Interactive Prototype"** dengan ikon kursor/prototype. Hanya mengintip ≈ 175 px dari tepi kanan, jadi tidak pernah tampil penuh.
- **D. Isyarat interaksi gagal:** kursor salah ke judul, kembali ke CTA, klik tanpa hasil, lalu "?" emas kecil. Ditambah konektor kurva emas putus-putus (A↔B, A↔C) dan aksen garis emas kecil.
- **Cacat UX (rapi, tetap terbaca):**
  - CTA pucat (putih 42 %) dan terdorong ke bawah;
  - tepi kiri label dan judul tidak sama (34 vs 22 px);
  - wireframe meleset keluar tepi kanan kartu dan miring 7°, tanpa menutupi teks.
- **Arsitektur SB02:** `FRAGMENT_STATES.poor` / `.polished` mengubah posisi, ukuran, dan hierarki pada komponen yang sama. SB02 belum dibuat.

## 2. Animasi (frame dikunci ke ucapan dan bomb-in yang ada)
| Waktu | Frame | Aksi |
|---|---|---|
| 7.7–8.2 s | f231–f246 | "kalau" lalu "UI/UX" masuk (tidak berubah); fragmen belum tampil |
| 8.2–8.6 s | f246–f258 | Kartu A naik dari tepi bawah, rotateX 32°→0 (ease-out), motion blur grafis |
| 8.5–8.7 s | f254–f262 | Wireframe naik ke posisinya yang meleset |
| 8.6–9.1 s | f258–f271 | Kartu B melayang dari kiri-atas, kurva dan kecepatan berbeda (parallax 1.25×), rotasi −11°→−3° |
| 8.9–9.1 s | f266–f274 | Konektor A↔B tergambar (reveal lewat mask), titik emas, aksen garis |
| 9.1–9.5 s | f272–f288 | Kursor ke judul (target salah), kembali ke CTA, klik f283, "?" kecil f284; kartu C mengintip f276–f286 (parallax 1.35×) |
| 9.6–10 s | f288–f299 | Bomb-in tetap: panel teal kartu A berakselerasi ke pusat frame (×6.6, tilt mendatar), kartu B/C terlempar keluar, isi memudar f288–f293, pita emas masih bergerak di f299. SFX impact f297 tidak berubah |

Setiap layer punya kurva, kecepatan, dan kedalaman sendiri, mengikuti skala kamera di sekitar titik wajah. Blok teks UI/UX dinaikkan ke pusat 0.62 H (sebelumnya 0.655 H) agar fragmen tidak bertabrakan dengan "nggak dipikirin".

## 3. Tipografi (permintaan pengguna)
- **Hero (semua, termasuk UI/UX):**
  - Dihapus: outline teal tebal dan bayangan offset keras bertumpuk.
  - Pengganti: gradasi dengan highlight putih (orange `#FFD7A6 → #FFFFFF → #FFC07A → #FE9831 → #E2742A`, atau putih ke abu sangat muda), glow hangat tipis, satu bayangan kedalaman lembut, dan tepi gelap 1 px agar tetap tajam di atas footage.
- **Teks kecil:** putih dengan bayangan lembut, tanpa offset keras.
- **Cream → putih:** IVORY `#F7F4ED` menjadi `#FFFFFF` (teks, kartu, grid, coretan, handle), highlight cream di gradasi menjadi putih, field Panel 04 menjadi putih dengan bayangan abu dingin, highlight koin menjadi putih.

## Hasil cek (dilihat langsung di still dan contact sheet)
| Kriteria | Status |
|---|---|
| Talent dominan | Ya. Fragmen di bawah dada, tidak menyentuh wajah/mulut |
| "UI/UX" terbaca | Ya, termasuk di 360×640 |
| Teks sekunder tidak bertabrakan dengan ilustrasi | Ya ("nggak dipikirin" vs kartu B/A terpisah) |
| Kartu utama dikenali tanpa membaca paragraf | Ya ("Learn. Design. Build." + CTA) |
| Kartu pendukung menambah kedalaman | Ya (B menindih, C mengintip) |
| Kursor mengomunikasikan interaksi gagal | Ya (salah target → klik gagal → "?") |
| Tanpa mockup ponsel / screenshot dashboard penuh / ilustrasi lain | Ya |
| Energi transisi ke SB02 | Dipertahankan (lihat contact sheet f288–f299) |
| Semua komponen bisa diedit | Ya (React/CSS/SVG, `FRAGMENT_STATES`) |

## Catatan / masih terbuka
- Teks kecil di dalam kartu ("Tingkatkan skill UI/UX.", "DESIGN WORKSHOP") hanya tipis terbaca di 360×640. Ini disengaja karena ilustrasi bersifat sekunder; bisa diperbesar bila diinginkan.
- Perubahan tipografi berlaku di seluruh video (opening, Panel 04, beat produk), sesuai permintaan "begitupun typography yang lain". Gerak tidak berubah.
- `VO_REPLACEMENT_PENDING` (8.12–8.76 s); "nggak dipikirin" masih usulan copy. Audio tidak berubah dari V04/V05 dan belum diuji dengar.
