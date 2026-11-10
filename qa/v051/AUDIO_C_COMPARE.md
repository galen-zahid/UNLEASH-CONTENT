# SB01 V05.1 — audio C (milik kita + tambahan selektif dari referensi)

Permintaan pengguna: kembali ke audio sendiri, bandingkan dengan referensi sesuai kebutuhan; bukan 1:1, tetapi menambah/menyesuaikan.

**Dasar:** mix V05.1 milik kita (musik original 108 BPM + SFX sendiri + suara talent), tidak diubah.
**Tambahan:** potongan dari stem transien referensi (05) hanya pada momen yang memang membutuhkan dan punya isi terukur. Musik referensi (≈92 BPM) **tidak** dicampur karena akan bentrok dengan tempo musik kita.

## Perbandingan per momen (`audit/v051/SFX_EVENT_COMPARE.txt`)
Mayoritas potongan stem 05 adalah sisa kick drum (porsi frekuensi rendah 0.5–0.8) atau nyaris senyap (−40…−45 dBFS), sehingga hanya sebagian yang layak.

| Momen | Sebelumnya | Audio C | Terdengar di puncak (pita sendiri) |
|---|---|---|---|
| Aperture f0 | SFX kita | + lapisan ref 0.00–0.60 s (timing sama) | +17.5 dB (dentum bas 31–70 Hz) |
| Hero 1 f25 | SFX kita | + lapisan ref 0.64–1.10 s (timing sama) | +5.8 dB |
| Ekspansi full frame f72 | kosong | **baru**: ref 0.00–0.50 s di 2.36 s | +8.8 dB |
| Kartu re-entry f194 | SFX kita | + lapisan pop ref 6.45–6.95 s (timing sama) | +14.4 dB |
| Kartu workshop masuk f246 | kosong | **baru**: pop ref 6.45–6.80 s di 8.17 s | +13.0 dB |
| Kursor klik gagal f283 | kosong | **baru**: pop ref 5.15–5.45 s di 9.38 s | +6.9 dB |
| Kartu modul 01 f258 | kosong | dicoba, **dibuang** (tidak terdengar, +0.1 dB) | — |
| Wipe, koin, gear, NOL, UI/UX, bomb-in | SFX kita | tetap milik kita (potongan ref lemah atau berisi kick) | — |

Margin suara talent di pita bicara setelah tambahan: B +7.8, D +10.0, E +9.6, F +5.0 dB (V05.1 asli: +8.1 / +10.0 / +12.1 / +5.6). Master −16.0 LUFS, −2.4 dBTP (linear).

## File
- `renders/v051/SB01_V051_FULL.mp4`: audio kita tanpa tambahan (baseline, tidak diubah)
- `renders/v051/SB01_V051_AUDIO_C.mp4`: baseline + tambahan referensi di atas
- `renders/v051/SB01_V051_REFAUDIO_A.mp4` / `_B.mp4`: versi berbasis referensi sebelumnya, tetap disimpan
- Peta potongan dan gain: `remotion/src/sb01v051/refAudio.json` → `"C"`; jalankan ulang `tools/mix_ref_stems.py C <out>`

Belum didengar oleh saya (sesi ini tidak bisa memutar audio). Lapisan di aperture, hero 1, dan ekspansi sebagian besar berupa bas; bila terasa terlalu "boomy", gain-nya bisa diturunkan atau dihapus.
