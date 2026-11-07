---
type: design
status: active
updated: 2026-11-03
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Kerangka hitung berat otomatis pada SPK

Tujuan: saat pengguna mengisi item SPK (mis. `Cable Tray W100xH100xL3000 1.2`), sistem mengenali produknya dan mengisi **berat per pcs** dan **berat per item** otomatis sesuai perhitungan di workbook `kalkulator penghitung berat.xlsx`, tanpa pengguna mengetik berat. Dokumen ini memuat kerangka, pemetaan, keputusan, dan status integrasi. Tugas: T-173.

## 1. Isi workbook (hasil pembacaan)

Enam sheet, satu per **keluarga produk**. Struktur identik: 32 bentuk per sheet, total 192 bentuk dan 1.505 sel rumus.

| Sheet | Keluarga | Judul section SPK yang sesuai |
|---|---|---|
| STU, STC | Cable Tray (tipe U dan C) | `CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED` |
| SLU, SLW, SLHD, SLHDC | Cable Ladder (tipe U, W, HD, HDC) | `CABLE LADDER TYPE SLW 2.0 HOTDIP GALVANIZED` |

Bentuk yang ada di tiap sheet (32): Straight, Elbow, Tee, Cross, Inside (riser), Outside (riser), Reducer, Cover Straight, Cover Elbow, Cover Tee, Cover Cross, Cover Inside, Cover Outside, Cover Reducer, Jointing, Horizontal Fish Plate, Vertical Fish Plate, Splice Plate Set for Stand, Bracket Support, Double Channel Bracket, Single Channel Bracket, Hanger Beam, U Channel 20x20, Hanger Clevis, Cover Clamp, Cover Clamp Heavy Duty, Separator, Support Separator, Hold Down Clip, Hold Down Clamp, End Stop, Drop Out.

Setiap baris punya **dua perhitungan** berdampingan:

| Sisi | Judul di workbook | Isi |
|---|---|---|
| Kiri | Kg ESTIMASI | Rumus kasar dengan faktor tambahan sekitar 10% |
| Kanan | Kg REAL | Rumus rinci (pengurangan lekukan dan tumpang tindih, faktor tambahan sekitar 2,5%) |
| Tambahan (Cable Tray lurus, elbow, tee, dst.) | Total Dikurangi Lubang | Pengurangan berat lubang perforasi pada dasar tray |
| Kolom akhir | Selisih Berat | Estimasi dikurangi real |

Setiap bentuk memakai parameter dimensi sendiri: `w` (lebar), `h` (tinggi), `l` (panjang), `r` (radius), `t` atau `thk` (tebal), `bj` (massa jenis), dan untuk tee, cross, reducer: `w1` sampai `w4`.

## 2. Kerangka yang dibangun

```text
 workbook xlsx ──(sekali, build-weight-catalog.mjs)──► catalog.json (rumus Excel per bentuk, apa adanya)
                                                              │
 teks item SPK + judul section + material SPK                 ▼
        │            ┌────────────── parser.js ──────────────────────────┐
        └──────────► │ 1. keluarga + tebal dari judul section            │
                     │ 2. bentuk dari kata kunci deskripsi               │
                     │ 3. ukuran W, H, L, R dari teks                    │
                     │ 4. massa jenis dari material SPK                  │
                     └───────────────► engine.js + formula.js ──► berat per pcs
```

- **formula.js**: pengevaluasi rumus Excel (angka, referensi sel dan rentang, operator, IF, ROUND, MIN, MAX, SQRT, PI, AND). Tanpa `eval`.
- **engine.js**: menjalankan rumus sebuah bentuk dengan parameter masukan; mengembalikan estimasi, estimasi dikurangi lubang, real, real dikurangi lubang. Bila masukan kurang atau rumus galat, hasilnya `null` (tidak pernah angka tebakan).
- **parser.js**: memetakan teks item ke bentuk dan parameter (bagian 3). Yang tidak dikenali dikembalikan sebagai `ok:false` beserta alasannya.
- Rumus **tidak ditulis ulang manual**: katalog diambil langsung dari workbook, sehingga bila workbook diperbarui cukup bangun ulang katalog.

## 3. Pemetaan teks item ke bentuk

| Contoh teks item (SPK 633) | Bentuk | Parameter diambil |
|---|---|---|
| Cable Ladder W300xH100xL3000 mm | Straight | w, h, l |
| Cover Ladder W300xL3000 mm | Cover Straight | w, l |
| Cover Clamp W300xH100, c/w Bolt Hex | Cover Clamp | w, h |
| Jointing Ladder H100, c/w Bolt Nut | Jointing | h |
| Horizontal Adjustable H100 c/w RHSN M10x20 | Horizontal Fish Plate (asumsi) | h |
| Vertical Adjustable H100 c/w RHSN M10x20 | Vertical Fish Plate (asumsi) | h |
| End Plate W300xH100 c/w RHSN M10x20 | End Stop (asumsi) | w, h |
| Horizontal Elbow Ladder W300xH100xR600 mm | Elbow | w, h, r |
| Cover Elbow Ladder W300xR600 mm | Cover Elbow | w, r |
| Cover Equal Tee Ladder W300xR600 mm | Cover Tee (lebar sama) | w1=w2=w3=w, r |
| Inside Riser Ladder W300xH100xR600 mm | Inside | w, h, r |
| Cover Inside Riser Ladder W300xR600 mm | Cover Inside | w, r |
| Outside Riser Ladder W300xH100xR600 mm | Outside | w, h, r |
| Cover Outside Riser W300xR600 mm | Cover Outside | butuh h: **ukuran kurang, diisi manual** |
| Cable Tray W100xH100xL3000 1.2 | Straight (Cable Tray STU) | w, h, l, tebal 1.2 di akhir teks |

Aturan: bagian setelah `c/w` (baut dan sejenisnya) diabaikan; tebal diambil dari angka polos di akhir teks, lalu dari judul section, lalu dari tebal SPK; keluarga dari judul section (`STU`, `STC`, `SLU`, `SLW`, `SLHD`, `SLHDC`).

## 4. Keputusan pemilik (disetujui 2026-11-03)

| # | Pertanyaan | Keputusan |
|---|---|---|
| 1 | Berat yang dipakai di SPK: **Estimasi** atau **Real**? Untuk Cable Tray, **dikurangi lubang** atau tidak? | Real; untuk Cable Tray real dikurangi lubang (paling dekat "aktual") |
| 2 | Massa jenis per material | Baja (SPHC, SPCC, GI): **7,85** (sama dengan workbook); SS304: **7,93**; SS316: **7,98**; Aluminium: **2,70** |
| 3 | Apakah "Adjustable" = Fish Plate, dan "End Plate" = End Stop? | Ya (ditandai asumsi pada hasil) |
| 4 | Tee dan Cross tidak sama lebar (mis. W300/200/300): format penulisannya? | Sementara dianggap lebar sama; selain itu diisi manual |
| 5 | Item di luar 32 bentuk (mis. baut, aksesori khusus) | Berat tetap diisi manual |
| 6 | Bolehkah pengguna menimpa berat otomatis? | Ya, dengan penanda "manual". **Pengguna tetap fleksibel mengubah angka kapan saja** |

## 5. Rencana integrasi ke formulir SPK (setelah keputusan di atas)

1. Saat deskripsi item selesai diketik (atau ditempel dari Excel lama), sistem menghitung berat per pcs dan berat per item (× qty) dan mengisinya, dengan lencana kecil "dari kalkulator".
2. Bila tidak dikenali atau ukuran kurang, kolom berat dibiarkan kosong dengan pesan singkat; pengguna mengisi manual seperti sekarang.
3. Pengguna dapat menimpa angka otomatis; angka manual tidak ditimpa lagi.
4. Tombol "Periksa berat" di lembar SPK menampilkan bentuk dan parameter yang dikenali (transparan, mudah diaudit).
5. **Katalog rumus dimuat dari database setelah login** (tabel `master`, kunci `katalog_berat`), bukan dikemas di berkas JavaScript publik, agar rumus internal perusahaan tidak bisa diunduh siapa pun yang membuka situs.

## 6. Bukti saat ini

| Pemeriksaan | Hasil |
|---|---|
| Mesin mereproduksi semua sel rumus workbook (192 bentuk, 1.505 sel) | 0 selisih |
| Contoh kunci sheet STU (estimasi dan real) cocok dengan angka yang disimpan Excel | lulus |
| Pemetaan 14 item SPK 633 dan contoh Cable Tray | 13 dikenali penuh, 1 diminta ukuran tambahan |
| Material kosong, bentuk asing, ukuran kurang | ditolak, tidak pernah menebak angka |
| Uji otomatis | `npm run test:berat` (di `apps/platform`): 6 + 24 lulus |

**Catatan keamanan data:** katalog turunan workbook (`catalog.json`) dan nilai uji Excel tidak disimpan di Git selama repo masih publik (keputusan T-166). Katalog dibangun lokal dengan `node scripts/build-weight-catalog.mjs "<xlsx>"`.

## 7. Status integrasi ke formulir SPK (selesai di kode)

Perilaku di editor SPK:

| Situasi | Perilaku |
|---|---|
| Deskripsi item selesai diketik atau ditempel dari Excel lama dan berat kosong | Berat per pcs terisi otomatis dari kalkulator, lencana **auto** di samping angka |
| Pengguna mengubah angka berat | Lencana menjadi **manual**; angka tidak pernah ditimpa otomatis lagi |
| Pengguna mengosongkan berat lalu mengubah deskripsi | Dihitung ulang otomatis |
| Judul section, tebal, atau material SPK berubah | Baris berlencana **auto** dihitung ulang; baris manual tidak disentuh |
| Item tidak dikenali, ukuran kurang, atau katalog belum terpasang | Berat dibiarkan kosong untuk diisi manual (tidak ada angka perkiraan) |
| Berat per item | Tetap qty dikali berat per pcs, seperti sebelumnya |

Perkiraan lama (skala dari berat acuan, mengabaikan lebar dan tinggi) sudah dihapus karena bisa memberi angka salah.

### Memasang katalog (super admin, sekali, dan setiap workbook berubah)

1. Bangun katalog lokal: `node scripts/build-weight-catalog.mjs "<jalur workbook>"` di `apps/platform` (hasil: `src/lib/berat/catalog.json`, tidak masuk Git).
2. Di aplikasi: **Master Data → Katalog berat → pilih catalog.json → Pasang katalog**.
3. Katalog disimpan terkompresi di database (`master/katalog_berat`, sekitar 16 KB) dan dimuat otomatis setelah login oleh semua pengguna. Tidak ada rumus di berkas situs atau Git.
4. Ganti katalog: ulangi langkah 1 dan 2. Pengguna menerima versi baru saat data disinkronkan.

### Bukti

- Unit: mesin mereproduksi 1.505 sel workbook dengan 0 selisih; pemetaan teks lulus (`npm run test:berat`).
- Mock (verified in browser): e2e A-29 sampai A-34, memakai katalog uji sederhana buatan sendiri (bukan rumus perusahaan): katalog terpasang dari database, berat auto, timpa manual, manual tidak ditimpa, hitung ulang, item tak dikenali dikosongkan.
- **Belum:** uji di production dengan katalog asli dan SPK nyata dibandingkan hitungan Excel.

## 9. Pembaruan 2026-11-07: full hole dan input terstruktur

- Workbook terbaru `kalkulator penghitung berat MNI include full hole.xlsx` memuat rumus yang sama (192 bentuk) dan menambah kolom **Total Full Hole (Bawah+Samping)** pada Straight STU dan STC (jumlah lubang bawah dan samping dikurangkan dari berat). Pembangun katalog mendeteksi judul itu (`estimasiFullHole`, `realFullHole`) dan mesin mengembalikannya.
- Input item di SPK kini dapat berupa bentuk dan ukuran terstruktur: lihat [[INPUT_SPK_TERSTRUKTUR]]. Teks bebas dan parser (bagian 3) tetap dipakai untuk item di luar kalkulator dan SPK lama.
