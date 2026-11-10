# SB02_REFERENCE_MOTION_MAP

**Referensi** (hanya bagian AFTER; talent, border, dan watermark pihak ketiga tidak dipakai):
- MAIN `jxdzwc9awa6j.mp4` — 720×1280, 29.97 fps
- SECONDARY `9gightyfqu5k.mp4` — 30 fps
- SUPPORTING `0uqzshinqvol.mp4` — 30 fps

**Cara ukur:** strip frame-by-frame dengan timestamp per frame (`jx_0`, `jx_6`, `jx_18`, `g9_5`, `g9_12`, `u0_12`), lalu jumlah frame tiap fase dihitung manual. Hasil berupa durasi dan jenis gerak, bukan track sub-piksel. Pasangannya bisa dilihat di `renders/sb02/SB02_REFERENCE_COMPARISON.mp4` (7 pasang, kiri referensi, kanan SB02).

| # | Ref | Waktu sumber (frame ref) | Gerak terukur | Easing terbaca | Target SB02 | Adaptasi |
|---|---|---|---|---|---|---|
| 1 | jx | 18.133–18.267 s (f543–547) | Cut dengan blur penuh 3 frame: blur naik di frame sebelum cut, puncak di frame cut, tajam lagi 2 f kemudian | simetris cepat | f58–64, puncak f61 | Blur footage 0→7→16→7→0 px menutup cut asli master 12.033. Grafik ikut blur 60 % |
| 2 | jx | 18.27–18.53 s | Setelah cut, kamera pull-back sedikit dan teks ikut | ease-out | f61–69 | CAM_C 1.21→1.15 (mono cubic) |
| 3 | jx | 0.47–0.67 s (f14–20) | Kata sans naik dari tepi bawah barisnya (mask) ±6 f, baris bertumpuk tiap +6/+10 f | ease-out kuat | f88, 100, 112, 123 (per kata ucapan) | `Word`: Mask naik 6 f, bezier(.22,1,.36,1). Timing tiap kata dikunci ke onset ASR, bukan jarak tetap |
| 4 | jx | 1.67 s | Serif masuk dengan blur-fade ±2 f | linear cepat | "DUA HAL" f131 | Mask 6 f + scale pop 1.12→1 (overshoot), karena kata ini kunci ucapan |
| 5 | jx | 18.27–18.40 s | Serif masuk geser dari kiri, settle 2–3 f | ease-out tajam | "UPGRADING SKILL" f141–150 (dari kiri), "UI/UX WORKSHOP" f180–189 (dari kanan) | Geser 140 px + blur 7→0, 9 f (diperpanjang karena headline lebih panjang). Arah dibalik untuk item kedua |
| 6 | 9g | 5.33–5.60 s (f160–168) | Teks keluar: dissolve + blur sambil naik ±8 f | ease-in | P01 f53–60, P02 f139–146, P03 f172–178, P04 f260–266 | `exitStyle`: opacity 1→0, blur 0→10 px, naik 46–60 px, ease-in quad 6–7 f |
| 7 | 9g | 5.67 s | Serif baru blur-in 2 f setelah exit | — | Dipakai pada transisi P02→P03 dan P03→P04 | Headline baru masuk 1–2 f setelah yang lama selesai keluar (tanpa tumpang tindih) |
| 8 | 9g | 6.20–6.60 s (f186–198) | Kartu kaca gelap naik dari bawah ±12 f dengan blur dan skala. Teks bertumpuk di atasnya | ease-out | Fragmen low-fi f70–82, kartu workshop f178–190 | Naik 640 px, skala 0.92→1, blur 7→0, rotasi 8°→0 |
| 9 | 0u | 12.70–13.03 s (f381–391) | Badge ID jatuh dari tepi atas, ayunan teredam ±10 f (+12° → −5° → settle) | jatuh ease-out, lalu pendulum | Training module f63–82 | Jatuh 9 f, lalu θ = 12°·e^(−0.2t)·cos(0.45t) pada tali emas yang ditambatkan di tepi atas |
| 10 | 0u | 12.6–15.2 s | Ilustrasi vektor semantik yang berubah keadaan di dalam satu komponen | — | P04 redesign f186–262 | Satu komponen (`RedesignCard`) dengan state poor → wireframe → polished → prototype, mengikuti brief (≤ 1 panel utama + ≤ 2 kartu pendukung) |
| 11 | SB01 | V05.1 f288–299 | Bomb-in teal (×6.6, ease-in), sapuan emas | ease-in | SB02 f0–16 | Komponen yang sama dilanjutkan di global f300+. Skala +40 % meluruh, lalu terangkat ke atas (tirai) f1–16 |

## Yang tidak diambil dari referensi
- Talent, setting, dan warna (neon pink) referensi.
- Angka/statistik di jx ("260,000").
- Bingkai showcase dan watermark.
- Tipografi referensi diganti token GSM: Source Serif 4 BI dan Instrument Sans, putih/oranye, tanpa krem.
