# SB02_FRAME_MAP — SB02 V01 (global 10.0–20.0 s)

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

## Panel (dikunci ke dialog; ada deviasi dari timing brief, lihat QA)
| Panel | Frame | Visual | Grid musik (137.8 BPM) |
|---|---|---|---|
| P01 | f0–f60 | f0–f16: layer bomb-in SB01 (WorkshopFragmentScene di global f300+, motion blur 24 sampel) membesar lalu terangkat ke atas seperti tirai. Footage Shot B push 1.10→1.0 (f0–22). "Siapa / yang / mau" f1/3/5, hero "PERCAYA?" f8 (mask + overshoot). Dua jalur emas f28–50 berakhir di ikon buku dan kursor (f44/f48). Exit dissolve + blur ke atas f53–60 | beat 16 = f10 |
| cut | f58–f64 | Blur cut 3-frame (puncak 16 px di f61), grafik ikut blur 60 % | beat 20 = f62.3 |
| P02 | f61–f140 | Kamera pull-back 1.21→1.15 (f61–69). Training module jatuh dari tepi atas dengan tali emas (f63–72) dan berayun teredam sampai ±f82. Fragmen low-fi naik dari tepi bawah ke kanan-bawah (f70–82, blur/skala). "Nah, makanya" f88/f100, "kalian butuh" f112/f123, "DUA HAL" f131 (pop). Dua goresan emas ke kedua objek f133–143 | "Nah" = beat 22 (f88.5) |
| P03 | f140–f178 | "DUA HAL" keluar (blur ke atas, f139–146). Index 01 + "UPGRADING SKILL" (putih) masuk geser dari kiri f141–150. "buat bangun bisnis" per kata f152/158/167. Modul lepas dari tali, turun ke kiri-bawah dan membesar (f142–154). Kamera push 1.15→1.22. Modul terbuka f150–158 → task card f158–167 → cincin check f167–176 ("Selesai") | f140.6 / f153.7 / f166.8 |
| P04 | f178–f262 | Index 02 + "UI/UX WORKSHOP" (oranye) masuk geser dari kanan f180–189. Fragmen low-fi tumbuh menjadi kartu workshop (f178–190). Redesign: **poor** + tanda kritik f186–193 → **pull apart** f193–201 → **guides/wireframe** f196–208 → **reassemble** f207–219 → **hierarchy/CTA** f219–230 → kursor f232–244, **klik** f245 + ripple → **prototype** (layar 2 meluncur) f248–258, kartu pendukung "03 — Interactive Prototype" f250. "Kabar baiknya," f200, "kalian bisa mendapatkan ilmu" per kata f220–257 | f180 / 193 / 206 / 219 / 232 / 245 / 258 |
| P05 | f262–f290 | Kartu menyusut ke node kanan, modul ke node kiri (f262–272). "UPGRADING SKILL" f266, "×" emas f270, "UI/UX WORKSHOP" f268. Konektor emas f268–280 (wilayah VO yang di-mute) | beat 36 = f271.3 |
| P06 | f286–f299 | Semua mengerucut ke titik emas (kanan, y 1450). Panel teal miring dengan tepi emas menyapu dari kiri, berakselerasi dan masih bergerak di f299 (≈ 60 % layar). Tidak ada reveal UNLEASH dan tidak ada CTA | beat 38 = f297.4 |

## Kontinuitas
- **SB01 f299 → SB02 f0:** layer yang sama dirender di global frame 300 (pita teal/biru diagonal dan sapuan emas). Selisih frame di batas 5.0, median seluruh video 3.8; tanpa frame beku.
- **Musik:** band v06b yang sama dengan `trimBefore` 300 f. Tidak ada restart atau fade-in. Lompatan sampel di batas 0.0016 (tipikal 0.19).
