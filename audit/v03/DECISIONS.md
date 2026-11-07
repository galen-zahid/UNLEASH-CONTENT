# SB01 v03 — keputusan & konflik (dengan sumber)

| # | Topik | Keputusan | Sumber / alasan |
|---|---|---|---|
| 1 | Offset master (+0.667 s?) | **Tidak di-trim.** Output frame = master frame, mulai 0.000 s | Stream video & audio MOV sama-sama start 0.000. Onset ucapan pertama 0.74 s = f22, tepat di awal Beat B (f24). Cut asli 3.567 s = f107 jatuh di Beat C, "nol" f179 di Beat D. Lip-sync dicek manual per frame pada konsonan bilabial (`LIPSYNC_bilabials.png`): penutupan bibir mendahului letupan audio ±1 f di "Percuma", "modal", "produk", "bagus", "personal". |
| 2 | Pertanyaan penutup | "Siapa yang mau percaya?" mulai **9.82 s (f295)** → berlanjut ke SB02. **"PERCAYA?" tidak ditampilkan** di SB01. VO tidak di-fade | Brief butir 7; onset diukur dari envelope 10 ms |
| 3 | Token warna | GSM_TOKENS.md otoritatif: tealDark #09292F, teal #18626F, cyan #238FA2–#2EBCD5, orange #FE9831–#FFB36A, orange glow stops. Nilai provisional brief (#163C43, #21555F, #337685, #F29A38) **tidak** dipakai | Brief butir 4 ("use GSM_TOKENS as authority if values differ") |
| 4 | Ivory #F7F4ED | Dipakai untuk wipe Beat C dan field Beat D/E | Diminta eksplisit di brief v03. Ini menggantikan arahan lama "jangan cream sebagai surface" khusus untuk panel ilustrasi; kartu/teks tetap teal–orange |
| 5 | "UI/UX" vs audio "personal branding" (8.12–8.76 s) | Overlay "UI/UX" tetap, dikunci ke onset kata yang diucapkan (f243). Status **VO_REPLACEMENT_PENDING** | Arah editorial pengguna = UI/UX Workshop. Tidak ada take VO pengganti; tidak ada voice clone/dub. Capsule "nggak dipikirin" = usulan copy, belum disetujui |
| 6 | Konsep Gemini (`SB01.mp4` upload, 24 fps) | Dipakai hanya sebagai acuan konsep Panel 04 (koin → gear → 0% → NOL, field ivory). Tidak ada frame/wajah/layout Gemini yang dipakai | Talent Gemini adalah orang hasil AI; brief melarang dipakai sebagai base |
| 7 | Grain | SVG feTurbulence, seed = frame, 8 % multiply pada ivory | GSM: noise layer ±8 % pada satu layer; bukan file grain resmi (tidak tersedia) |
| 8 | Parallax | Layer foreground (kartu UI ponsel melintasi tepi bawah, kursor melintasi tepi kanan-atas) bergerak independen di atas footage | **Separasi subjek/background tidak diimplementasikan**: tidak ada model matting yang bisa dijalankan di sesi ini. Lihat QA |
| 9 | Motion blur | `@remotion/motion-blur` CameraMotionBlur (shutter 200°, 5–6 sampel) hanya untuk layer grafis pada jendela gerak cepat. Live action tidak pernah di-blend antar frame | Brief "Animation smoothness" |
| 10 | Musik | Disintesis original (`tools/make_audio_v03.py`, seed tetap): pad Dm–B♭–F–C, pluck, kick/hat lembut, riser ke bomb-in. Bebas lisensi pihak ketiga | Brief: "do not reuse the reference soundtrack" |
| 11 | SFX | Semua disintesis (noise sweep, partial logam koin, ratchet gear, thud LF). Tidak ada sample pihak ketiga | Lisensi bersih |
