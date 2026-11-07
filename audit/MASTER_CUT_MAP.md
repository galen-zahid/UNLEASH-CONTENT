# MASTER_CUT_MAP — IMG_6757.MOV

## Shot master (ffmpeg scene score > 0.15)

| Shot | Master | Isi | Framing |
|---|---|---|---|
| M1 | 0.000–3.567 | Talent duduk menyamping di meja, tablet di kiri, menoleh ke kamera | Wajah ≈ (0.53, 0.40), lebar wajah ≈ 0.17 W |
| M2 | 3.567–12.033 | Frontal di meja, tablet di depan dada | Wajah ≈ (0.48, 0.40) |
| M3 | 12.033–22.167 | Berjalan ke kamera di koridor | — |
| M4 | 22.167–30.465 | Bersandar railing, setengah badan | — |

Silence (−35 dB, ≥0.35 s): 0–0.74 s, 11.98–12.53 s.

## Pemetaan SB01 (output 30 fps, 300 f)

Output time = master time (tidak ada retime; ucapan tidak dipercepat). Hanya grafis yang dipetakan ke waktu referensi; tabel lengkap per frame ada di `remotion/src/sb01/timeline.ts`.

| Output f | Master | Ref f | Beat | Selisih & alasan |
|---|---|---|---|---|
| 0–75 | M1 0.00–2.50 | 0–75 | Grid window → full | 0 f |
| 36 / 53 | "siapa" 1.20 / "bangun" 1.76 | 25 / 57 | Headline 1 / 2 | +11 / −4 f — dikunci ke kata yang diucapkan |
| 80–92 | "uang" 2.86 | 80–95 | Kotak "UANG?" | 0 f |
| 98–106 | 3.27–3.53 | 112–119 | Blur + circle wipe | **−13 f**: wipe harus menutup cut master M1→M2 di f107; referensi tidak punya cut di titik itu |
| 107 | **cut M1→M2** | — | Tersembunyi di bawah plate | — |
| 116–210 | M2 (talent tersembunyi; audio jalan) | 124–205 | Grafis | −8…+5 f, dikunci ke "modal", "nol", "produk" |
| 199–222 | M2 | 197–219 | Kartu talent → full | +2…+3 f |
| 224–231 | M2 7.47–7.70 | 221–227 | Defocus + vignette | +3 f |
| 245 | "personal" 8.08 | 252 | Headline "UI/UX" | −7 f, dikunci ke kata |
| 280 | M2 9.33 | 280 | Hard cut | 0 f; B-roll ref → punch-in master |
| 296–300 | "Siapa" 9.90 | — | Fade audio 4 f | SB01 10 s berakhir di tengah "Siapa yang mau percaya?" (selesai 10.86 s) |

Crop: master diskala ×1.4 (wajah ref ≈0.28 W vs master ≈0.17 W; skala dibatasi agar upscale tidak terlalu lunak), offset M1 (−45, +77) px, M2 (+30, +77) px pada 1080×1920.

Proxy kerja: `remotion/public/master/IMG_6757_0-10.5_cfr30.mp4` (H.264 CRF 15, 30 fps CFR, BT.709, AAC 48 kHz; konversi yuvj→yuv range oleh swscale). Tidak di-commit (ukuran); buat ulang dengan perintah di `remotion/README.md`.
