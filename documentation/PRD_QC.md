---
type: design
status: active
updated: 2026-11-14
---

# PRD Modul QC — Daily Check Sheet (DCS) dan Sertifikat QC

Status: **dalam pembangunan** (2026-11-14), mengikuti format DCS yang dipakai MNI saat ini (benchmark dari berkas DCS SPK 512-513 dan DCS SPK 635-640 yang diberikan pemilik).
Tugas: [[tasks/T-239-alur-lengkap-tonase-plate-qc]]. Prinsip pemilik: **input sesedikit mungkin, laporan sebanyak mungkin, dapat dipertanggungjawabkan**; laporan dapat dikirim ke customer dan berfungsi sebagai **sertifikat lolos QC**.

## Format DCS yang ada (hasil membaca berkas contoh)

Lembar "DAILY CHECK SHEET (DCS) · Raw Material Control & Quality Control Section": kop PT Mitra Nusa Internasional, legenda (W = Wide mm, H = Height mm, L/R = Length/Radius), tanggal, lalu satu blok per SPK: `customer - nomor PO/SO`, `SPK NO`, `Lead time`. Tabel per section SPK (judul section = produk, type, tebal, finishing):

| Kolom | Isi |
|---|---|
| No, Description, Qty, Satuan | dari SPK |
| **Standard dimension** | Thickness, W, H, L/R (spesifikasi) |
| **Actual dimension before finishing** | Thickness, W, H, L/R terukur sebelum finishing |
| **Actual dimension finishing** | Thickness, W, H, L/R terukur sesudah finishing |
| **Visual after finishing** | jumlah pcs bercacat: Crack, Burry, Porosity, Rusty, Peel off, Scratch; Jointing fit to tray (Ya/Tidak) |
| Repaired | jumlah pcs yang diperbaiki |
| Judgment | Ok / Oke |
| Penutup | tanda tangan Inspector dan PPIC |

Temuan dari contoh: standar tebal kadang tidak sama dengan judul section, angka bisa salah ketik (mis. tebal 1117), sebagian kolom kosong. Di WMS standar **terisi otomatis dari SPK** dan angka aktual divalidasi terhadap toleransi.

## Pemetaan ke alur

```
produksi selesai -> QC PROSES (ukuran sebelum finishing) -> vendor ELG/HDG/PWD -> QC AKHIR (ukuran finishing + visual) -> Gudang Barang Jadi / kirim customer
```

Item tanpa finishing: QC Proses dan QC Akhir bisa dilakukan sekali (kolom finishing diisi ukuran akhir). Aturan wajib atau tidaknya tiap titik ada di Master Data > Aturan proses.

## Data (koleksi `qc`, satu dokumen per SPK)

- `noQC` (`QC/2026/11/001`), `spk`, `status` (`Menunggu QC Proses`, `Proses OK`, `Menunggu QC Akhir`, `Selesai`), `inspector`, `ppic`, `tglProses`, `tglAkhir`, `catatan`.
- `baris[]` satu per item SPK: `ix`, `d`, `q`, `u`, `std {t,w,h,l}`, `proses {t,w,h,l,tgl,oleh}`, `akhir {t,w,h,l,tgl,oleh}`, `visual {crack,burr,porosity,rusty,peel,scratch}`, `jointing` (`Ya`/`Tidak`/kosong), `repaired`, `sesuaiStandar` (ditandai bila hanya dinyatakan sesuai tanpa angka ukur), `judgment` (dihitung), `ket`.
- Toleransi bawaan di setting `qcToleransi` (dapat diubah admin): tebal ±0,15 mm, W dan H ±2 mm, L dan R ±3 mm. **Nilai awal ini perlu dikonfirmasi tim QC sesuai standar customer.**

## Aturan judgement (otomatis, tidak diketik)

- **OK**: semua angka aktual yang diisi berada dalam toleransi terhadap standar dan tidak ada cacat visual (atau semua cacat sudah diperbaiki: `repaired >= total cacat`).
- **OK setelah repair**: ada cacat visual dan `repaired >= total cacat`.
- **NG**: ada angka di luar toleransi, atau cacat belum diperbaiki, atau jointing tidak fit. Item NG kembali lewat alur reject dan rework yang sudah ada.
- Hasil dokumen: **Lulus** bila semua item OK atau OK setelah repair; **Lulus bersyarat** bila ada item NG yang sudah dibuat rework dan diperiksa ulang; **Belum lulus** selain itu.

## Input minimum

1. Daftar "Menunggu QC" otomatis (SPK yang selesai produksi dan belum diperiksa).
2. Standar terisi dari SPK. Inspector mengetik hanya angka terukur (Tab berpindah antar kolom) dan jumlah cacat bila ada.
3. Tombol **Sesuai standar** per item: dipakai bila pemeriksaan visual saja; tercatat sebagai "dinyatakan sesuai standar (tanpa angka ukur)" dan terlihat jelas di dokumen, supaya tidak ada angka karangan.
4. **Simpan**: inspector dan waktu dari akun, nomor dokumen otomatis, judgement otomatis.

## Dokumen dan sertifikat

- **Laporan Hasil QC (DCS)** PDF dan Excel dengan tata letak mengikuti DCS di atas (kop, legenda, blok SPK, tabel standar/aktual/visual/judgement, tanda tangan Inspector dan PPIC).
- **Sertifikat Lolos QC**: halaman ringkas untuk customer (nomor, customer, PO, SPK, ringkasan item dengan tebal dan tonase, hasil Lulus, tanggal, penandatangan). Hanya tersedia bila hasil Lulus.
- Tonase = qty lulus x berat per pcs SPK (angka yang sama dengan SPK dan surat jalan).

## Laporan dan visual

Cincin persentase lulus (First Pass Yield), Pareto jenis cacat, tren reject per minggu, daftar menunggu QC dengan lama tunggu, rekap per customer, per produk, dan per inspector.

## Integrasi

- SPK: chip status QC dan tautan ke dokumen; SPK terkirim bila qty terkirim, QC tetap terlihat.
- Gudang Barang Jadi dan surat jalan: bila setting `qcWajib` aktif, hanya qty lulus QC Akhir yang boleh masuk atau dikirim; bila tidak aktif, alur lama tidak berubah.
- Produksi: reject QC memakai alur reject dan rework yang ada.
- Hak akses: modul `qc` dengan peran QC (ubah), PPIC (ubah), admin (semua), yang lain lihat sesuai pengaturan.

## Tahap pembangunan

1. Pustaka murni dan uji unit (standar dari SPK, toleransi, judgement, ringkasan).
2. Koleksi `qc`, modul dan hak akses, menu QC.
3. Layar QC dan form inspeksi.
4. Dokumen PDF dan Excel dan sertifikat.
5. Integrasi (SPK, Gudang Barang Jadi, surat jalan) dan laporan.
6. Uji e2e, regresi penuh, catatan vault.

## Pertanyaan terbuka untuk pemilik

1. Toleransi bawaan di atas sesuai standar QC dan customer MNI?
2. QC Akhir wajib sebelum barang jadi masuk gudang (`qcWajib`), atau hanya dicatat?
3. Apakah sertifikat perlu nomor tersendiri atau cukup nomor QC?

## Keputusan skema (2026-11-15, atas arahan pemilik: "buat skema terbaiknya, QC diaktifkan dulu, foto sebagai dokumentasi nyata")

| Butir | Keputusan | Alasan |
|---|---|---|
| Acuan toleransi bawaan | **Gambar kerja MNI** (W/H ±2, L/R ±3 mm; tebal per JIS G 3193 untuk 1,6 mm ke atas); profil **NEMA VE 1-2017** tersedia per customer | gambar kerja MNI (1 sampai 3 mm) lebih ketat daripada NEMA untuk lebar (±6) dan kedalaman (±10), sehingga produk yang lulus bawaan juga memenuhi NEMA |
| Standar lapisan galvanis | ASTM A123 bawaan, EN ISO 1461 sebagai pilihan | NEMA VE 1 merujuk ASTM A123 (Tipe 1) |
| QC wajib | **aktif bawaan**: barang jadi masuk gudang dan surat jalan customer hanya setelah QC Lulus; dapat dimatikan admin di QC > Toleransi | arahan pemilik: aktifkan dulu sampai hasilnya optimum |
| Foto bukti | per item (maks 4) dan foto umum; dokumen maks 24 foto; terkompres 960 px; tersimpan dengan waktu dan pengambil; dilampirkan di Laporan QC (PDF dan Excel) | dokumentasi nyata dan dapat dipertanggungjawabkan |
| Sertifikat Lolos QC | hanya bila semua item Lulus **dan** ada minimal satu foto bukti | sertifikat tanpa bukti lapangan tidak dikeluarkan |
| Penandaan produk | sertifikat memuat merek, material (SPHC JIS G3131), tipe finishing NEMA (Tipe 1/3), dan Ventilated/Nonventilated bila dapat ditentukan | NEMA VE 1 pasal 6.1.2 |
| Foto di database produksi | inline (data URL terkompres) dulu; bucket privat Supabase disiapkan di migration terpisah | sama dengan foto Bongkar Muat |
