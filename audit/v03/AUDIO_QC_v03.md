# AUDIO QC — SB01 v03

Semua angka diukur di sesi ini dari file yang di-render. **Batasan:** sesi ini tidak bisa memutar audio, jadi tidak ada penilaian dengar. Penilaian artefak memakai proxy terukur. A/B dengar oleh manusia tetap diperlukan (file `vo_original.wav` vs `vo_clean.wav` ada di `remotion/public/audio_v03/`, bisa dibuat ulang dengan `tools/make_audio_v03.py`).

## 1. Sinkronisasi (bukan hanya dari ASR)
- Stream audio/video MOV sama-sama mulai di 0.000 s. Output frame = master frame (tanpa trim).
- **Manual**, crop mulut per frame di sekitar konsonan bilabial (`LIPSYNC_bilabials.png`): bibir menutup lalu letupan audio terjadi dalam ±1 frame pada "Percuma" (f115–116→f117), "modal", "produk" (f210–211→f212), "bagus" (f219–220), dan "personal" (f241–243→f244).
- Korelasi otomatis gerak-mulut vs envelope lemah (r 0.12–0.18) dan **tidak dipakai sebagai bukti**.
- Final vs master (pita 300–3400 Hz): lag konstan **3.1 ms** di ketiga segmen (r 0.84–0.86; turun karena musik dan SFX ikut terjumlah).
- Onset kata kunci dari envelope 10 ms: "uang" 2.90 s (f87), "nol" 5.96 s / puncak 6.04 s (f179), "personal" /p/ 8.12 s (f243–244), "Siapa" **9.82 s (f295)**.

## 2. VO cleanup (`vo_clean.wav`)
Rantai: `highpass 80 Hz → [65 % anlmdn s=1.5 (latensi 480 sampel dikompensasi) + 35 % dry] → EQ −1.5 dB @250 Hz, +2.5 dB @3.8 kHz → compressor 2:1 @−24 dB`.

| Kandidat | Floor jeda | SNR | Std level jeda (proxy pumping) | Catatan |
|---|---|---|---|---|
| original | −51.6 dBFS | 18.2 dB | 3.2 dB | |
| afftdn nr10–16 | −44…−48 | 18.7–19.3 | 3.4–3.6 | Hampir tidak efektif: noise ada di 80–1000 Hz (ambience koridor) |
| anlmdn s=4 | −63.9 | 35.0 | **5.0** | Agresif; HF bicara −12 dB → risiko tumpul/metalik |
| anlmdn s=1.5 (100 % wet) | −61.6 | 32.9 | **6.0** | Fluktuasi level di jeda |
| **dipilih: 65/35 blend** | −55.1 | **23.2** | 3.6 | Konservatif; std ≈ asli |

Temuan: `anlmdn` menambah latensi 480 sampel (10 ms). Tanpa kompensasi, blend dengan sinyal dry akan menjadi comb filter (terdengar metalik; centroid sempat naik 417→488 Hz). Setelah dikompensasi: lag −44 sampel (0.9 ms), centroid 406 Hz.

## 3. Musik & SFX
- `music_bed.wav`: original, disintesis (`tools/make_audio_v03.py`, seed tetap). Tidak memakai audio referensi.
- Ducking per frame dari `cues.speech` (base 0.34 → duck 0.06, attack 4 f, release 8 f).
- SFX one-shot ditempatkan di frame `cues.sfx`: aperture f0, text_reveal_01 f53, text_reveal_02 f87, circle_wipe f99, coins f112 (8 klink di f118…f139), gears f156 (start/stop f174), zero_hit f179, footage_reentry f194, bomb_in f288 (impact f293).

## 4. Keberadaan & keseimbangan stem
Mix Remotion vs penjumlahan stem yang diekspor: **r = 1.0000, lag 0, selisih −0.01 dB**. Semua track benar-benar ada di mix. Detail: `STEM_BALANCE.txt`.

Margin VO di pita bicara (300–4000 Hz) atas musik+SFX: B **+9.9**, D **+8.9**, D saat "nol"+zero_hit **+17.0**, E **+13.1**, F (impact + onset "Siapa", 0.4 s) **+4.3 dB**.

Keterdengaran SFX di pitanya, diukur di puncak event: aperture +18.9, text_reveal_01 +4.6, text_reveal_02 +8.1, circle_wipe +12.2, coins +3.5, gears (klik) +18.5 (6 klik, median +16.7), zero_hit +18.8, footage_reentry +24.9, bomb_in +15.6 dB.

Iterasi mix: pass 1 margin VO hanya +2.8/−3.0/+3.3/−11.5 dB (gagal) → pass 2 dan 3 (SFX/musik diturunkan) → pass 4 (koin/gear +4 dB; klik gear diperkuat di generator setelah terdeteksi tertutup ucapan, −4.5 → −2.1 dB RMS jendela, +18.5 dB di puncak).

## 5. Mastering (dua pass + pre-limiter)
| Tahap | I | TP | Mode |
|---|---|---|---|
| Premaster (mix Remotion) | −29.2 LUFS | −14.3 dBTP | |
| Pass 0 limiter (ceiling 0.1641 lin., hanya puncak) | | −15.7 dBTP | Diperlukan agar pass 2 tidak jatuh ke mode *dynamic* (uji tanpa limiter: dynamic) |
| Pass 1 (ukur) | −29.45 | −15.80 | |
| Pass 2 (terapkan) | **−15.82 LUFS** | **−2.31 dBTP** | **linear** |
| Meter independen (ebur128) master WAV | −15.8 | −2.3 | |
| Final MP4 (AAC 256 k) | **−15.8 LUFS** | **−2.4 dBTP** | LRA 1.2 LU |

Target −16 ±1 LUFS dan ≤ −1.5 dBTP: **terpenuhi**.
