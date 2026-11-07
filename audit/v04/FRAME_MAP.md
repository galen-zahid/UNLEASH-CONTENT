# FRAME MAP — reference AFTER (larg8ak17f8d, crop 474×844 @202,210, 30 fps) → SB01 V04 output (30 fps)

Data diukur, bukan diperkirakan: `tools/ref_motion_analysis.py` (garis grid → tepi aperture, ORB → skala kamera, luas putih → radius wipe), `tools/ref_text_track.py` (luas teks pink), dan strip per frame di `audit/v04/strips/` (entrance tipografi). Nilai lengkap: `REF_MOTION.json`, `REF_MOTION_summary.txt`, `REF_TEXT_TRACK.txt`. Implementasi: `remotion/src/sb01v04/refTracks.ts`, `Opening.tsx`, `UiuxBeat.tsx`.

Selisih **0** berarti frame output sama dengan frame referensi. Selisih lain selalu disertai alasan.

## Opening 0–3.6 s

| Event | REF frame (terukur) | V04 frame | Δ | Mekanik terukur → implementasi |
|---|---|---|---|---|
| Garis grid muncul (salib) | f1 | f1 | 0 | lebar aperture 0.068 W |
| Aperture membuka | f1→f20 | f1→f23 | 0 / +3 di ujung | Tepi per frame dari garis grid (lebar 0.068→0.631 W, tinggi 0.13→0.42 H, pusat (0.50, 0.455)); kecepatan tepi naik 0.022→0.032 W/f. Ref **berhenti mendadak** f20→f21; V04 melandaikan berhenti di f19–f23 (permintaan brief: tanpa diskontinuitas). Interpolasi monotone cubic (C1) |
| Kamera di dalam aperture | zoom-out f5–f11 (rasio .985 .972 .965 .961 .994 .992 ≈ −13 %) | f5–f16 | 0 | `CAM_OPEN` = produk kumulatif rasio ORB |
| Coretan putih 1 (atas kepala) | f3–f17 | f3–f18 | 0 | segmen dash berjalan sepanjang path (trailing) |
| Coretan 2 (sisi kiri kepala) | f17–f24 | f17–f26 | 0 | idem |
| Coretan 3 (tik dekat dahi) | f25–f36 | f27–f37 | +2 | idem |
| Teks kecil "If there's" | f5/f11 | — | — | **Tidak ada padanan**: tidak ada ucapan di 0–0.74 s, dan hero 1 sudah memuat "Kata" |
| Hero 1 kata 1 ("One" → **Kata**) | f25 (naik + blur, settle f27) | f25→f27 | 0 | rise 46 px, blur 12→0, 3 frame, tanpa overshoot |
| Hero 1 kata 2 ("Thing" → **siapa?**) | f30 (geser dari kanan, settle f32) | f33→f35 | +3 | dikunci ke ucapan "siapa" (f36; pre-roll 3 f) |
| Hero 1 exit | f48→f53 (blur dissolve) | f48→f53 | 0 | opacity→0, blur→12, scale 1.04 |
| Hero 2 ("LOOking" → **Bangun / bisnis**) | f60–f62 | f55 / f61 | −5 / −1 | dikunci ke ucapan "bangun" f53 dan "bisnis" f61; pop scale 1.22→1 + blur |
| Slash aksen di kanan hero 2 | f66–f71 | f66–f74 | 0 | draw-on lalu exit di sepanjang path |
| Teks kecil ("forward to" → **cuma butuh**) | f60–f72 | f70 / f78 | +10 | per kata, dikunci ke ucapan "cuma" f70 dan "butuh" f78 |
| Garis + titik berjalan | f77–f84 | f77–f84 | 0 | |
| Aperture → full frame + push-in | f68–f72 ease-in, f73–f74 lompat, full f75; push +7.5 % f69–f79 | sama | 0 | feather tepi = setengah jarak tempuh per frame (motion blur 180°); smear footage 6/4 px di f73–f74 |
| Kotak ("2025" → **UANG?**) muncul | f78 (outline + handle), isi f79–f84 | f78, isi f79–f85 | 0 | |
| Percikan menyapu | f82–f89 | f82–f92 | 0 | blob ivory |
| Isi kotak ditulis | digit f89–f94, settle f95 | huruf f88–f92, settle f95 | −1 | jatuh + rotasi, overshoot kecil (seperti digit ref); "uang" diucapkan f87 |
| Coretan loop di hero | f88–f93 | f88–f94 | 0 | |
| Blur/shake pra-wipe | f112–f114 | f97–f104 | −15 | menutup cut master di 3.567 s (f107) |
| Circle wipe | f115–f119 (cakupan 5/21/51/79/98 %) | f101–f106 | −14 | kurva radius sama; tertutup penuh sebelum f107 |

## 7.7–10.0 s

| Event | REF frame | V04 frame | Δ | Catatan |
|---|---|---|---|---|
| Push / focus pull | f221–f227 | f230–f237 | +9 | kartu v03 penuh di f230; push 1.0→1.1, pull-out ≈9 % (ref f224–f234) |
| Teks kecil ("Our lives are" → **kalau**) | f235 | f231 | −4 | ucapan "kalau" f231 |
| Blob meluncur dari tepi kanan, mengecil | f244→f251 | f236→f244 | −8 | berakhir di onset "personal" |
| Hero ("Busier" → **UI/UX**) besar + blur → tajam | f252→f256 | f243→f247 | −9 | dikunci ke /p/ "personal" (8.12 s); `VO_REPLACEMENT_PENDING` |
| Percikan putih kiri-atas | f255–f264 | f246–f258 | −9 | |
| Kotak miring (−20°) → rata → teks | f256 / f262–f264 / f264 | f247 / f253–f255 / f255–f262 | −9 | |
| **Hard cut ke B-roll** | f280 | — | — | **Tidak direplikasi**: B-roll/AI dilarang; diganti dashboard + bomb-in |
| Dashboard poor (A/B/C) | — | masuk f251–f268, kursor ragu-ragu f261+ | — | elemen baru sesuai brief |
| Bomb-in (panel dashboard ke kamera) | — | f288→f299 (ease-in, terus berakselerasi di f299) | — | impact SFX f297; pita emas melintas f292–f299 |
