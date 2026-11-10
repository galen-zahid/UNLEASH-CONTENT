# QA_REPORT_v05 — SB01 V05 (perbaikan review pengguna atas V04)

V04 tidak diubah. V05 = `remotion/src/sb01v05/` (composition `SB01-v05`), render `renders/v05/SB01_V05.mp4`.

## Feedback → perbaikan
| Feedback | Penyebab (terukur) | Perbaikan V05 | Bukti |
|---|---|---|---|
| Jarak antarhuruf "UANG?" terlalu lebar | Tiap huruf dirender sebagai komponen Hero terpisah, masing-masing dengan padding overhang italic 0.14 × 212 px ≈ 30 px → total celah ekstra ≈ 120 px | Prop `pad` di `Hero`; huruf dirangkai tanpa padding, sehingga jarak = advance asli font (sama dengan kata utuh). Animasi jatuh per huruf dipertahankan | `qa/v05/V04_vs_V05_fixes.png` (f96) |
| "cuma butuh" ketumpuk | Bawah "cuma butuh" di y 1272, garis di y 1278, tetapi kotak UANG? mulai di y 1282. Ekor huruf "g" juga turun ke area yang sama | Susunan dihitung: hero → "cuma butuh" di +1.22 × ukuran hero (di bawah ekor huruf) → garis → jarak 30 px → kotak. Coretan loop dipindah melingkari "bisnis" agar tidak menyeberang ke teks kecil | idem (f82, f96) |
| Ilustrasi UI/UX jelek, tidak rapi | Versi "poor" V04 diwujudkan sebagai kekacauan visual: kartu bertumpuk dan miring, pill tercecer, garis putus menggantung | **Desain ulang total**: satu panel 952×404 dengan grid 2 kolom (margin 32, gutter 24), header (label + tab), kartu info ivory di kiri, tiga baris modul sejajar di kanan, satu keluarga ikon. "UX buruk" ditunjukkan secara rapi lewat **anotasi kritik desain** (garis putus oranye + badge "?") pada masalah yang benar-benar ada di layout: judul lebih lemah dari deskripsi, dan CTA ghost pucat. Kursor berhenti di judul, lalu ragu di CTA. State `polished` memakai grid yang sama (hierarki diperbaiki, CTA solid, tanpa anotasi), siap untuk SB02 | idem (f284), `qa/v05/MOBILE_360x640_V05.png` |

Konsekuensi tata letak: blok "kalau / UI/UX / nggak dipikirin" dinaikkan (pusat 0.655 H, sebelumnya 0.70 H) agar panel muat utuh di bawahnya.

Bomb-in: panel tetap menjadi visual dominan yang berakselerasi ke kamera (×5.6, tepi atas dan bawah ±1131 px dari pusat, jadi frame tertutup). Isi panel memudar di f288–293, sehingga frame berakhir di permukaan teal dengan pita emas yang masih bergerak di f299.

## QC final V05
| Gate | Hasil |
|---|---|
| Format | 1080×1920, 30 fps, 300 f, 10.000 s, yuv420p tv, BT.709 |
| Frame hitam / beku | 0 / 0 |
| Loudness (setelah AAC) | −16.0 LUFS, −2.4 dBTP (mix audio sama dengan V04) |
| Mobile 360×640 | hero, "cuma butuh", isi dashboard terbaca |

## File
`renders/v05/SB01_V05.mp4`, `renders/v05/SB01_V04_vs_V05.mp4`, `renders/v05/REF_AFTER_vs_SB01_V05.mp4`, `renders/v05/SB01_V05_FULL_MIX.wav`, `qa/v05/*.png`.

## Masih terbuka
- `VO_REPLACEMENT_PENDING` (8.12–8.76 s masih berbunyi "personal branding"); "nggak dipikirin" masih usulan copy.
- Perbedaan lain terhadap referensi sama seperti daftar di `qa/QA_REPORT_v04.md`.
- Audio belum diuji dengar.
