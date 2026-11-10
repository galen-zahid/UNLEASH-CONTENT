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
- Musik (pass 4, permintaan pengguna: +3 dB): jeda −20.3 dBFS, saat bicara −17.7 dBFS broadband (didominasi bas). Margin suara talent di pita bicara setelah +3 dB: +8.9 / +7.5 / +7.1 / +3.0 dB. Groove di pita hat terdeteksi 137.9 BPM.
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

## v06b — musik di awal tidak terdengar (feedback pengguna)
**Penyebab (terukur):**
- 0–2 s musik hanya −44/−50 dBFS (intro terlalu redam).
- Setelah itu ±90 % energi musik ada di bawah 150 Hz (kick/808), padahal **speaker HP/laptop hampir tidak memutar < 150 Hz**. Musik baru "muncul" saat riser UI/UX karena riser berfrekuensi lebih tinggi.

**Perbaikan:**
- Intro hadir sejak 0 s: filter dibuka (pad 900 Hz, hat 4 kHz, pluck 1.4 kHz → terbuka saat drop), pluck main sejak awal, hat tidak dilemahkan.
- Kick diberi klik beater 1.8–6 kHz + harmonik ke-2; 808 diberi harmonik ke-2/3, supaya bas terbaca di speaker kecil.
- Hat dan shaker 16th lebih keras; pad +4 dB.
- Mix: pita mid ×0.75 (ducking 0.45), air ×0.8 (0.6), low ×0.48 (0.62), riser ×0.3.

**Diukur dengan simulasi speaker HP (HPF 180 Hz), musik vs suara talent per detik (dBFS):**
- sebelum: 0–1 −40.7/−41.6, 1–2 **−47.0/−23.1**, 2–3 −38.9/−22.2, 3–10 umumnya 12–14 dB di bawah VO
- v06b: 0–1 −34.0/−42.1, 1–2 −38.4/−23.6, 2–3 −30.9/−22.7, 3–4 −28.8/−25.6, 4–5 −29.8/−23.4, 5–6 −33.5/−27.5, 6–7 −33.5/−22.3, 7–8 −30.1/−23.3, 8–9 −32.6/−22.3, 9–10 −25.6/−29.1

Groove pita hat 137.9 BPM, kekuatan 0.54 (v04 0.37, v03 0.22). Margin suara talent di pita bicara: +6.8 / +6.0 / +5.5 dB; F −0.2 dB (0.47 s impact bomb + awal "Siapa"). Master −16.0 LUFS / −2.1 dBTP. File: `renders/v06/SB01_V051_SOUND_V06B.mp4`.
