---
type: design
status: active
updated: 2026-11-15
---

# Acuan standar untuk QC dan standar di sistem (cable tray)

Dipakai oleh modul QC ([[documentation/PRD_QC]], [[tasks/T-239-alur-lengkap-tonase-plate-qc]]). Prinsip: hanya angka yang punya dasar tercatat yang dijadikan aturan; sisanya ditandai nilai awal MNI yang perlu dikonfirmasi tim QC. Teks standar berhak cipta tidak disalin ke vault; hanya angka dan nomor pasal yang dirujuk.

## Berkas dari pemilik (zip Drive, 2026-11-15)

| Berkas | Isi | Dipakai |
|---|---|---|
| `NEMA V1 NMI.pdf` | NEMA VE 1-2017 / CSA C22.2 No. 126.1-17, Metal Cable Tray Systems (teks resmi, 13+ pasal) | ya, sumber angka di bawah |
| `NEMA-VE-2-2018 (NMI).pdf` | NEMA VE 2-2018, penanganan, penyimpanan, pemasangan | belum dibaca; relevan untuk panduan pemasangan di lokasi customer, bukan QC pabrik |
| `NEMA FG 1-1993.pdf` | cable tray fiberglass (FRP) | tidak dipakai (MNI membuat baja, stainless, aluminium) |

## NEMA VE 1-2017 (terverifikasi dari teks resmi)

| Butir | Nilai | Pasal |
|---|---|---|
| Panjang tray lurus (tanpa konektor) | 3 m ±15 mm; 3,66 m ±15 mm; 6 m ±19 mm; 7,32 m ±19 mm | 4.3.2 |
| Lebar dalam, tray tangga/dasar padat/palung | tipikal 150, 225, 300, 450, 600, 750, 900 mm; toleransi ±6 mm; lebar luar tidak lebih dari lebar dalam + 100 mm | 4.3.3.1 |
| Lebar dalam, channel | tipikal 75 sampai 600 mm; toleransi ±3 mm | 4.3.3.2 |
| Kedalaman (fill depth) | tipikal 75, 100, 125, 150 mm; toleransi ±10 mm; kedalaman luar tidak lebih dari dalam + 30 mm | 4.3.4 |
| Jarak anak tangga | tipikal 150, 225, 300 mm (tanpa toleransi di standar) | 4.3.5 |
| Radius dalam bagian lengkung | tipikal 75, 150, 300, 600, 900, 1200 mm | 4.3.6 |
| Sudut elbow | tipikal 15°, 30°, 45°, 60°, 90° | 4.3.7 |
| Dimensi lain | "other dimensions shall also be acceptable": nilai tipikal bukan batas wajib | 4.3.1 |
| Kualitas pekerjaan | bebas dari burr atau tonjolan tajam yang dapat melukai selubung kabel (dasar kolom "Burry" di DCS) | 4.4 |
| Finishing baja karbon | Tipe 1: hot-dip galvanized pasca fabrikasi (ASTM A123/A123M); Tipe 2: mill galvanized (ASTM A653/A653M, G90); Tipe 3: elektro-zinc (ASTM B633, SC 2 minimum) | 4.2.1 |
| Material | logam tahan korosi (aluminium, stainless) atau logam berfinishing tahan korosi | 4.1 |
| Penandaan | tiap tray dan fitting: nama atau merek pabrikan, Ventilated/Nonventilated, beban terukur per bentang, jenis material (dan Tipe 1/2/3 untuk baja karbon) | 6.1.2 |
| Fitting | tidak diuji beban; toleransi dimensi untuk fitting tidak diatur | 4.5 |

## Standar lain (free)

| Butir | Nilai | Sumber |
|---|---|---|
| Toleransi tebal pelat canai panas (SPHC, JIS G 3131), dikutip dari JIS G 3193 (2019) | 1,60 sampai <2,00 mm: ±0,19; 2,00 sampai <2,50: ±0,20; 2,50 sampai <3,15: ±0,22; 3,15 sampai <4,00: ±0,24 mm. Di bawah 1,60 mm: tidak ada acuan terverifikasi (tabel katalog tidak memuat) | katalog Kobelco "usuita_en_final.pdf" (kutipan JIS G 3193:2019, per pabrik, bukan teks JIS) |
| Lapisan HDG minimum rata-rata (ASTM A123 Tabel 1, strip/bar/plate) | baja <1,6 mm: 45 µm; 1,6 sampai <3,2 mm: 65 µm; 3,2 mm ke atas: 75 µm | [AGA Inspection Guide](https://galvanizeit.org/uploads/publications/Inspection-Guide-web1.pdf) Tabel 1A |
| Toleransi dimensi gambar kerja MNI | 1 mm sampai 3 mm; material SPHC JIS G3131; finishing natural; lubang 11 x 15 mm | gambar MNI `DRAWING TRAY STC - SPHC JIS G3131.pdf` |

## Belum ada acuan terverifikasi

- Toleransi tebal pelat di bawah 1,60 mm (1,0 sampai 1,5 mm yang dipakai MNI): memakai nilai awal ±0,15 mm.
- Toleransi tebal stainless (ASTM A480) dan aluminium; ketebalan lapisan powder coating; syarat lapisan elektro-zinc selain "SC 2 minimum".
- Edisi NEMA VE 1 yang berlaku sekarang: berkas yang diberikan edisi 2017; sumber lain menyebut edisi 2024 (NEMA BI 50015) menggantikannya.

## Penerapan di sistem

- Profil toleransi di QC: **Gambar kerja MNI** (W dan H ±2, L dan R ±3 mm; tebal per JIS G 3193 untuk 1,6 mm ke atas, selain itu ±0,15), **NEMA VE 1-2017** (tray lurus: W ±6, H ±10, L ±15 atau ±19 menurut panjang; fitting dan aksesoris tetap nilai MNI), dan kustom. Profil, angka, dan sumbernya dicetak di Laporan QC dan Sertifikat.
- Kolom opsional **Lapisan (µm)** pada item hot-dip galvanized, dinilai terhadap minimum ASTM A123 di atas.
- Material SPHC dicetak "SPHC (JIS G3131)" di dokumen.
- Penerapan tambahan yang mungkin: penandaan produk menurut 6.1.2 (nama pabrikan, jenis material, Tipe 1/2/3) pada sertifikat, dan nilai tipikal NEMA sebagai petunjuk di editor SPK (bukan batas wajib).
