# SB01 V05.1 — audio dari paket LARG_AUDIO_STEMS (permintaan pengguna)

Sumber: `LARG_AUDIO_STEMS.zip` (Drive pengguna). Stem hasil pemisahan audio reels referensi larg8ak17f8d, bukan rekaman studio. Stem asli disalin ke `remotion/public/audio_ref/` (WAV tidak di-commit). Video V05.1 tidak berubah; hanya audio yang di-mux.

**Hak pakai:** musik/SFX ini berasal dari reels pihak lain (@motion.nish_). Aman untuk preview internal, tetapi berisiko klaim hak cipta jika dipublikasikan.

## Pengukuran stem (tanpa pendengaran)
- Vokal referensi tidak terdeteksi di 03/04: Whisper hanya berhalusinasi "Thanks for watching!" (ciri audio tanpa ucapan), dan korelasi envelope ucapan dengan stem 02 ≈ 0.
- 03 = 04 + 05 (residu −118 dB). Tempo ≈ 92 BPM.
- Transien 05 (s): 0.01, 1.41, 2.23, 2.56, 3.10, 3.24, 3.52, 3.75, 3.91, 4.16, 4.39, 4.78, 5.25, 5.73, 6.56, 6.77, 7.23, 7.43, 8.09, 8.32, 8.97, 9.62.

## Varian
| | Isi | Sinkron visual |
|---|---|---|
| **A** `SB01_V051_REFAUDIO_A.mp4` | 03 (musik + SFX referensi) utuh dari 0 s + suara talent | 0–3.2 s pas (opening mengikuti timing referensi). Setelahnya SFX referensi meleset −0.45…+0.35 s dari visual kita |
| **B** `SB01_V051_REFAUDIO_B.mp4` | 04 (musik) utuh + 10 potongan 05 yang digeser ke frame visual kita (wipe, koin, gear, NOL, kartu, focus pull, UI/UX, bomb-in) | Event SFX tepat di visual; musik tetap utuh |

Daftar potongan (asal → tujuan) ada di `remotion/src/sb01v051/refAudio.json`; bisa diedit, lalu jalankan ulang `tools/mix_ref_stems.py A|B <out>`.

## Level (setelah master −16 LUFS)
| | Margin VO pita bicara B / D / E / F | Bed di jeda / saat bicara |
|---|---|---|
| A | +14.7 / +8.5 / +12.0 / +15.8 dB | −24.1 / −29.0 dBFS |
| B | +12.7 / +7.3 / +11.4 / +16.3 dB | −20.7 / −28.3 dBFS |

Sync suara talent vs master: −0.94 ms (sama dengan versi sebelumnya). SFX buatan saya sebelumnya tidak dipakai di A maupun B.

## Perlu didengar pengguna
1. Pilih A atau B.
2. Apakah musik terlalu pelan saat talent bicara (ducking 55 %)?
3. Apakah ada artefak pemisahan (bunyi "berair" atau sisa vokal) di stem 04/05?
4. Apakah tiap potongan SFX di B cocok dengan gambarnya?
