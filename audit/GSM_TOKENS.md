# GSM TDC — token yang dipakai SB01 v01

Kode: `remotion/src/lib/tokens.ts`.

## Verifikasi sesi ini
- Figma `1uKgzzPdaTcT9yyI1FTrk0`, frame `652:1812` "Incoming Message to": screenshot read-only → `audit/GSM_figma_652-1812_Incoming_Message.png`. Terlihat: dasar teal gelap + grain + glow cyan + lengkung tipis; headline Source Serif Italic dengan gradasi orange → highlight terang; label pill gradasi cyan-teal dengan teks putih bold sans; logo-logo resmi di kiri-atas.
- `get_variable_defs` pada frame itu hanya mengembalikan satu variabel kosong ("biru coba2"); konsisten dengan audit lama (tidak ada variabel/text style). Paint style tidak diekstrak ulang.
- File audit lama (`FIGMA_COLOR_STYLES_RAW.json`, dll. di `C:/Users/HP/...`) **tidak dapat diakses** dari sesi cloud; nilai HEX diambil dari brief pengguna.

## Warna
| Token | HEX | Pemakaian |
|---|---|---|
| tealDark | #09292F | Plate grafis, circle wipe, vignette, shadow teks |
| teal | #18626F | Gradasi tint plate opening |
| cyan1→3 | #238FA2 → #29A6BB → #2EBCD5 | Pill/label, ikon cari, glow |
| orange1→2 | #FE9831 → #FFB36A | Stroke aksen, chip, ikon |
| orange glow | 0 #A3652A · 21 #EFB06E · 38 #FEFBF2 · 53 #F9C176 · 69.5 #E77B33 · 84 #DC702A · 100 #733D19 | Headline serif. Arah 180° = **perkiraan** (matriks transform belum dibaca ulang); `background-size 100% 125%` agar stop tergelap jatuh di bawah baseline |
| white | #FFFFFF | Teks kecil, garis grid, handle |

Tidak ada surface cream. Biru royal "biru tdc" tidak dipakai.

## Keputusan konflik referensi ↔ GSM
| Elemen | Referensi | UNLEASH | Alasan |
|---|---|---|---|
| Tint plate opening | Pink/magenta | Gradasi teal | Warna ikut GSM, struktur sama |
| Circle wipe + plate grafis | Putih | Teal gelap #09292F | Surface utama GSM = teal; **keputusan terbuka** — bisa dibuat off-white #F6F6F6 bila ingin lebih dekat ke ref |
| Headline | Rounded sans pink + outline putih | Source Serif 4 Bold Italic, orange glow | Font headline editorial GSM |
| Teks kecil | Sans putih | Instrument Sans 600 putih | GSM |
| Pill/kotak aksen | Gelap / pink | Gradasi cyan (label "Staff TDC ITS") / teal transparan | GSM |

## Font
| Font | File | Sumber | Lisensi |
|---|---|---|---|
| Source Serif 4 Bold Italic (+ SemiBold Italic) | `remotion/public/fonts/SourceSerif4-*.ttf` | Google Fonts API, instance statis **opsz 60** | SIL OFL 1.1 |
| Instrument Sans 400/500/600/700 (wdth 100) | `remotion/public/fonts/InstrumentSans-*.ttf` | Google Fonts API, instance statis | SIL OFL 1.1 |

Catatan: optical size Figma belum diverifikasi; opsz 60 dipilih untuk ukuran display. Font dimuat via `FontFace` + `delayRender`; gagal muat = render gagal (tidak ada fallback diam-diam). File Instrument Sans lokal pengguna (`D:/download/Instrument_Sans`) tidak dapat diakses; dipakai instance Google Fonts dari famili yang sama.

## Aset kurang
- Logo resmi TDC ITS / UNLEASH: tidak dipakai di SB01 (referensi tidak menampilkan logo di 0–10 s). Logo terlihat di frame Figma 652:1812 dan dapat diekspor nanti.
- Tekstur grain GSM: belum diterapkan (referensi tidak memakai grain di opening).
