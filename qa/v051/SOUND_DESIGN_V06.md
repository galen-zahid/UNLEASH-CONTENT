# SOUND DESIGN v06 — SB01 (dan lanjutan ke SB02)

Semua suara original, disintesis di `tools/make_sound_v06.py` (seed tetap, tanpa audio pihak ketiga). Level dan timing ada di `remotion/src/sb01v051/sound_v06.json`; Remotion memutar setiap kategori sebagai track terpisah (`AudioMixV06.tsx`). Dinilai lewat pengukuran, **belum didengar** (sesi ini tidak bisa memutar audio).

## Konsep
Video ternyata jatuh pas di grid **137.8 BPM (nuansa half-time, karakter mirip referensi)**. Ketukan dikunci di wipe (3.37 s), sehingga momen penting mendarat di ketukan tanpa mengubah gambar:

| Momen | Waktu | Posisi ketukan | Selisih |
|---|---|---|---|
| Frame melebar penuh (drop) | 2.500 s | −2 | 1 ms |
| UANG? | 2.933 s | −1 | 1 ms |
| Wipe | 3.367 s | 0 | 3 ms |
| NOL | 5.967 s | 6 | 16 ms |
| Kartu kembali | 6.433 s | 7 | 15 ms |
| UI/UX | 8.167 s | 11 | 7 ms |
| Bomb-in | 9.900 s | 15 | 1 ms |

## Aransemen musik (32 s, terus jalan ke SB02)
- **0–2.5 s:** intro tertahan. Pad dan hat difilter (low-pass membuka 350 Hz → terbuka), reverse swell menuju drop.
- **2.5 s, drop:** groove penuh tepat saat frame melebar. Kick half-time di ketukan 1, ghost kick, clap di ketukan 3, sub 808 dengan glide, hat 1/8 + shaker, pluck sinkopasi, pad Dm–B♭–F–C.
- **3.0–3.37 s:** snare roll 1/16 dan riser ke wipe.
- **5.60–5.80 s:** **tape-stop** (musik melambat mati) tepat saat gear macet, lalu **hening**. NOL dihantam sub boom di 5.97 s.
- **6.42 s:** groove masuk lagi dengan riser bersama kartu footage.
- **8.3–9.9 s:** riser panjang dan snare roll ke bomb-in. Musik **tidak berhenti** di 10 s (siap lanjut SB02).

## SFX per stem
| Stem | Isi | Momen |
|---|---|---|
| opening | swell udara + kilau kaca; tick garis grid | f0, f1 |
| typographic | swish + thud untuk kata besar (Kata, siapa?, Bangun, bisnis, UI/UX), tick untuk teks kecil, **5 tick bernada naik untuk U-A-N-G-?** | f25…f92, f231, f243 |
| transition | reverse swell yang berakhir saat wipe menutup, whoosh stereo wipe, kartu naik, "napas" saat focus pull | f99–f106, f194, f229 |
| coin | 8 klink logam, masing-masing sedikit beda, di tiap koin mendarat | f118…f139 |
| gear | ratchet yang makin cepat, wind-down, bunyi macet; sub boom NOL | f156, f179 |
| ui | pop kartu workshop, pop kartu 01 / 03, klik ganda tumpul (klik gagal) + blip kecil | f247, f259, f277, f283, f284 |
| bomb | whoosh berakselerasi → impact + sub drop | impact f297 |

## Mix (setelah master)
- Margin suara talent di pita bicara: hook +9.1, Panel 04 +7.8, E +7.3, F +3.9 dB (F = impact bomb + awal kata "Siapa").
- Ducking per pita: mid (pluck/pad) turun paling dalam saat talent bicara; low (kick/808) dan air (hat) hanya sedikit, supaya groove tetap terasa.
- Musik: jeda −22.4 dBFS, saat bicara −19.8 dBFS broadband (didominasi bas). Groove di pita hat terdeteksi 137.9 BPM.
- Setiap SFX terdengar di puncaknya: median +7.9 (tipografi) sampai +36 dB (opening).
- Master −15.9 LUFS / −2.1 dBTP (linear). Mix Remotion = mirror numpy (r 0.99999).
- Analisis menunjukkan yang menutup suara talent di pass awal adalah **SFX** (swish tipografi, koin, transisi), bukan musik. Gain SFX per kelompok sudah diturunkan.

## File
- `renders/v06/SB01_V051_SOUND_V06.mp4`: video V05.1 + sound design v06
- `renders/v06/SB01_V06_MUSIC_ONLY.wav`, `SB01_V06_VO_MUSIC.wav`, `SB01_V06_FULL_MIX.wav`
- `renders/v06/stem_{vo,music,opening,typographic,coin,gear,transition,ui,bomb}.wav`

## Untuk didengar pengguna
1. Karakter musik (half-time ~138 BPM) cocok atau tidak.
2. Tape-stop + hening di gear macet → NOL: dramatis atau terlalu "jeda".
3. Tick bernada di U-A-N-G-?: tidak norak.
4. Klik gagal kursor (f283) terdengar "salah".
5. Level musik di bawah dialog.
