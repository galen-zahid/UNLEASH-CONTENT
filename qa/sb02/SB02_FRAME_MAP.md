# SB02_FRAME_MAP — SB02 V01.1 (global 10.0–20.0 s)

Komposisi `SB02-v01` (`remotion/src/sb02/`), 300 f @ 30 fps, 1080×1920.
- **Frame lokal:** f = master `IMG_6757.MOV` pada 10.0 s + f/30. Proxy: `remotion/public/master/IMG_6757_10-20.5_v03_graded_cfr30.mp4`, dengan grade yang sama seperti SB01 (`audit/v03/GRADE_DENOISE_FILTER.txt`).
- **Global:** frame global = 300 + f.
- **Cut asli:** master 12.033 s = **f61** (Shot B duduk → Shot C berdiri). Terverifikasi lewat face track (`audit/sb02/FACE_TRACK.json`, ukuran wajah melompat dari 224 ke 165 px tepat di f61) dan selisih frame (56.5, puncak di f60→f61).

## Dialog terukur (ASR + cek energi, `audit/MASTER_ASR_words.json`)
| Kata | Frame lokal |
|---|---|
| "Siapa yang mau percaya?" | f-3–f26 ("percaya" f8) |
| (diam) | f26–f88 |
| "Nah," / "makanya" / "kalian" / "butuh" | f88 / f100 / f112 / f123 |
| "dua hal" | f132–f145 |
| "itu buat bangun bisnis kalian." | f145–f188 ("buat" f152, "bangun" f158, "bisnis" f167) |
| "Kabar baiknya" | f200–f220 |
| "kalian bisa mendapatkan" | f220–f257 |
| "ilmu" | f257–f270 (akhir energi 18.94 s) |
| **"personal branding"** | **f271–f299** (19.05–20.00 s) → **di-mute**, `VO_REPLACEMENT_PENDING` |
| "sekaligus upgrading skill" | f299+ (masuk SB03) |

## Panel V01.1 — subtitle dan ilustrasi = kalimat yang sedang diucapkan
V01.1 menggantikan V01 setelah review pengguna: "ga nyambung antara subtitle dengan ilustrasi; suara talent kerasin; tracking kamera, zoom-in per subtitle".

| Frame | Talent bilang | Subtitle | Ilustrasi | Kamera (face-track + zoom) |
|---|---|---|---|---|
| f0–16 | (akhir "kalau UI/UX…" SB01) | — | Layer bomb-in SB01 dilanjutkan di global f300, terangkat seperti tirai | — |
| f1–60 | "Siapa yang mau percaya?" | "Siapa yang mau" (per kata f1/3/5), **PERCAYA?** f8 | Tanda **"?" emas** + cincin putus-putus di samping wajah (f12) | Zoom 1.50→1.42 (settle), push 1.44→1.50 |
| f58–64 | — | — | Blur cut 3 f menutup cut asli f61 | Pull-back 1.30→1.18 |
| f61–88 | (jalan, tanpa ucapan) | — | Frame bersih, hanya talent | Wajah dikunci di (540, 860) |
| f88–145 | "Nah, makanya kalian butuh dua hal" | per kata f88/100/112/123, **DUA HAL** f131 | **Dua kartu kosong 01 / 02** jatuh dari tepi atas pada "dua hal" (f131/134, ayunan teredam) | Drift 1.18→1.24, **punch-in 1.25→1.34** f132–137 |
| f145–188 | "itu buat bangun bisnis kalian." | "itu buat" f145/152, **BANGUN** f158 (putih), **BISNIS** f167 (oranye), "kalian." f176 | Kartu 01/02 turun menjadi **fondasi**. Tiga lantai gedung bertumpuk (f156–170), atap dan bendera di "bisnis" (f167), lampu jendela menyala di "kalian" (f176) | Pull-back 1.22 untuk memberi ruang gedung, **punch-in** di "BISNIS" (1.27→1.34) |
| f199–221 | "Kabar baiknya," | **Kabar baiknya,** f199 | **Kilau emas** (burst + bintang) di sekitar headline | **Punch-in 1.25→1.35** f200–205 |
| f220–270 | "kalian bisa mendapatkan ilmu" | per kata f220/229/238, **ILMU** f256 | **Buku** naik dari bawah (f220–232), **terbuka** di "mendapatkan" (f238–247), **ide (lampu)** keluar dari halaman, ikon ilmu (buku, kursor, lampu, wireframe) mengalir keluar (f246–268) | Drift 1.22→1.29, **punch-in 1.30→1.40** pada "ILMU" |
| f271–299 | [VO di-mute: "personal branding" → `VO_REPLACEMENT_PENDING` "UI/UX workshop"] | **UI/UX WORKSHOP** f271 | **Kartu workshop** (polished) naik, CTA menyala, kursor klik f283 + ripple | Pull-back 1.37→1.24 untuk kartu, lalu push 1.34 ke exit |
| f286–299 | — | mengerucut | Semua menyusut ke titik emas, panel teal/emas menyapu dari kiri dan masih bergerak di f299 | — |

**Kamera:** translasi menjaga pusat wajah (face track yang dihaluskan) di titik target. Bingkai selalu tertutup (clamp). Zoom berupa track mono-cubic dengan punch 5 f di setiap kata kunci (`ZOOM` di `SB02.tsx`).



## Kontinuitas
- **SB01 f299 → SB02 f0:** layer yang sama dirender di global frame 300 (pita teal/biru diagonal dan sapuan emas). Selisih frame di batas 5.0, median seluruh video 3.8; tanpa frame beku.
- **Musik:** band v06b yang sama dengan `trimBefore` 300 f. Tidak ada restart atau fade-in. Lompatan sampel di batas 0.0016 (tipikal 0.19).
