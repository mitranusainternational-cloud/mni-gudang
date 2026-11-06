---
type: operational-data-dictionary
status: draft-needs-owner-validation
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Kamus data Operasional — draft

Kamus ini mencatat label dan bentuk data yang **terlihat pada workbook**, bukan definisi bisnis yang telah disepakati. Arti, satuan, key, grain, sumber resmi, dan aturan status perlu divalidasi pemilik proses sebelum desain aplikasi atau migrasi.

## Monitoring PPIC

Sumber: tiga workbook dashboard PPIC bulanan. Header berada di baris 8 pada Agustus/September dan baris 9 pada Oktober.

| Label sumber                      | Makna kandidat                    | Validasi yang diperlukan                                        |
| --------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `No`                              | Nomor urut pada tabel             | Apakah nomor tampilan atau identitas?                           |
| `Date`                            | Tanggal terkait order/SPK         | Definisi tanggal dan timezone/cut-off.                          |
| `Customer Name`                   | Nama customer                     | Master dan relasi ke customer/order.                            |
| `No PO`                           | Nomor purchase/order customer     | Definisi PO dan keunikan per customer.                          |
| `No SPK`                          | Nomor perintah kerja              | Format kanonis, revisi, serta relasi ke PO.                     |
| `Jenis Material/ Finishing`       | Material atau finishing           | Apakah satu field gabungan atau dua atribut?                    |
| `Thickness Material (mm)`         | Ketebalan material                | Sumber nilai, satuan, toleransi, dan tipe.                      |
| `Type`                            | Jenis produk                      | Relasi ke master SKU/produk.                                    |
| `Estimasi Kebutuhan Plat (Lbr)`   | Estimasi kebutuhan lembar plat    | Definisi rumus, pembulatan, dan status estimasi/final.          |
| `Pengadaan Material`              | Status/keterangan pengadaan       | Nilai yang diperbolehkan dan arti tiap status.                  |
| `Lead Time`                       | Lead time rencana                 | Titik awal/akhir dan unit hari kerja/kalender.                  |
| `Actual kirim`                    | Tanggal atau realisasi pengiriman | Tipe data dan apakah satu/tahap pengiriman.                     |
| `Actual leadtime`                 | Lead time aktual                  | Rumus dan batas tanggal yang digunakan.                         |
| `telat kirim (berjalan)`          | Keterlambatan yang masih berjalan | Definisi, tanda angka, dan kapan berhenti dihitung.             |
| `telat kirim (days)`              | Hari keterlambatan                | Aturan hari kerja/kalender dan nilai nol/kosong.                |
| `status`                          | Status order/SPK                  | Daftar status, transisi, owner update.                          |
| `Progress`                        | Persentase/progres                | Grain, basis perhitungan, tahap, dan skala.                     |
| `Alasan keterlambatan Pengiriman` | Alasan keterlambatan              | Taksonomi versus catatan bebas, pemilik, dan histori perubahan. |

## Detail SPK

| Label sumber | Sumber/variasi | Validasi yang diperlukan |
|---|---|---|
| `No`, `DESCRIPTION`, `QTY`, `Satuan` | Tab detail pada dashboard dan workbook SPK individual | Key baris dan aturan revisi; definisi qty target/revisi. |
| `Berat / pcs`, `Berat / item` | Detail SPK | Unit berat, sumber, presisi, dan formula. |
| `Kirim Ke Subcont / Vendor`, `Subcont / Vendor` | Dashboard/SPK individual | Apakah vendor, qty keluar, status, atau gabungan? |
| `Kirim Ke Customer`, `Terkirim Customer` | Dashboard/SPK individual | Qty atau event kirim; pengiriman parsial dan bukti. |
| `Produksi Selesai`, `KEKURANGAN`, `PROGRESS (%)`, `Keterangan` | Workbook individual memiliki label ini | Arti status, rumus progress, sumber shortage, dan histori. |
| `Kirim`, `Balik`, `Blm Produksi`, `Di Vendor`, `Blm Kirim`, `Produksi`, `Finishing` | Subheader/tahap pada SPK 438 | Definisi satuan per tahap dan aturan rekonsiliasi kuantitas. |
| `Tanggal`, `PRODUKSI`, `KIRIM CUSTOMER`, `FINISHING` | Kelompok kolom pada dashboard PPIC | Relasi setiap tanggal/kuantitas dengan tahap dan baris. |

## Raw material

Sumber `RM (30)` pada workbook raw material dan tab RM di dashboard PPIC.

| Label sumber | Makna kandidat | Validasi yang diperlukan |
|---|---|---|
| `NO` | Nomor tampilan | Bukan key kecuali disetujui. |
| `TANGGAL` | Tanggal terkait stok/pemakaian | Tanggal snapshot, transaksi, atau pencatatan? |
| `ITEM` | Nama/kode item | Kode master kanonis dan aturan alias. |
| `UKURAN` | Ukuran/specifikasi item | Format canonical dan satuan dimensi. |
| `BUFFER STOK` | Buffer/minimum stok | Definisi parameter, unit, owner, dan kebijakan. |
| `STOK` | Nilai stok | On-hand/available/reserved, tanggal as-of, dan sumber hitung. |
| `SATUAN` | Unit item/stok | UOM kanonis dan konversi. |
| `data 3 bulan terakhir` | Ringkasan historis pada tab dashboard | Definisi periode, agregat, dan formula. |

## Barang jadi

### Master `Straight`

Observed fields: `Type`, `Size (WxH)`, `Length (mm)`, `Finishing`, `Thickness`, `Qty`, `Unit`.

Identitas komposit tersebut masih **candidate key**, belum terbukti unik: ditemukan satu pasangan baris berulang pada atribut itu. Owner perlu menentukan SKU/kode item dan apakah baris berulang memiliki arti bisnis berbeda.

### Transaksi `Transaksi - Sep` / `Transaksi - Okt`

Observed fields: `Tanggal`, `Type (1)`, `Type (2)`, `Ukuran`, `Thk`, `Finishing`, `Masuk`, `Keluar`, `Keterangan`.

- `Masuk` dan `Keluar` berupa nilai numerik pada baris yang terisi di sumber yang diprofilkan.
- Tanggal kosong pada baris berikutnya tampak dikelompokkan di bawah tanggal sebelumnya. Itu pola yang terlihat, bukan aturan yang disetujui.
- Belum ada transaction ID yang terlihat. Import perlu menyimpan `source_id + sheet + row + snapshot/file hash` untuk lineage/idempotensi.
- Rumus saldo: belum ditetapkan. Tetapkan saldo awal, tanggal efektif, jenis transaksi, retur/transfer/koreksi, dan aturan posted/void sebelum menghitung.

## Candidate keys dan relasi — perlu validasi

| Entitas | Candidate key | Batas saat ini |
|---|---|---|
| SPK | Nomor SPK + revisi | Nama sheet/nomor saja belum membedakan revisi dan snapshot. |
| Baris SPK | SPK + revisi + `No` baris, dengan deskripsi/qty/satuan untuk cross-check | Nomor baris dapat berubah antar revisi; deskripsi bukan product ID. |
| Material raw | `ITEM` + `UKURAN` + `SATUAN` + tanggal as-of | Tidak ada kode item kanonis yang terkonfirmasi. |
| Produk jadi | SKU kanonis; sementara atribut tipe/ukuran/panjang/finishing/ketebalan | Kombinasi atribut saat ini tidak selalu unik. |
| Mutasi barang jadi | Transaction ID; sementara sumber + sheet + row + snapshot + product key | Belum ada ID transaksi; blank date/grouping dan cut-off harus disahkan. |
| Monitoring order | SPK + revisi + timestamp snapshot | Satu SPK dapat muncul lebih dari sekali; grain monitor belum disepakati. |

## Status validasi

- `Observed`: label/header, posisi header, pola pengulangan, tipe nilai dasar, formula/cache error, dan kecocokan terbatas SPK 438 tercatat di [[DATA_SOURCE_CATALOG|katalog dan audit bukti]].
- `Observed`: pada 22 kandidat key raw material yang sama, tiga dashboard cocok satu sama lain; file raw berbeda stok pada 11 key dan tanggal pada satu key, serta memiliki satu key tambahan. Detail dan batasnya ada pada isu `DQ-RM-001` di katalog. Nilai item tidak disalin ke dokumentasi.
- `Inferred`: date carry-forward pada mutasi; kandidat komposit key; pengelompokan monitor; semua harus dikonfirmasi.
- `Pending owner`: sumber resmi/as-of, proses yang didukung, grain, kunci, definisi status/progress/stok, satuan, formula bisnis, dan siapa yang boleh mengubah.

## Checklist pengesahan

- [ ] Pemilik data dan process owner disetujui untuk setiap workbook.
- [ ] Cut-off setiap snapshot dan sumber resmi per bidang dikonfirmasi.
- [ ] Nomor SPK/revisi/PO dan identitas baris ditetapkan.
- [ ] Definisi progress, status, tanggal target/aktual, dan lead time disepakati.
- [ ] Kode produk, varian, UOM, dan key inventory disepakati.
- [ ] Aturan tanggal kosong, masuk/keluar, saldo awal, retur/koreksi, serta rekonsiliasi disepakati.
- [ ] Formula error pada PPIC ditinjau dan hasil diverifikasi oleh owner.
- [ ] Isu `DQ-RM-001` direkonsiliasi dengan owner berdasarkan cut-off dan sumber resmi.
- [ ] Sampel lintas sumber direkonsiliasi dan disetujui sebelum model aplikasi dibuat.

## Navigasi

- [[DATA_SOURCE_CATALOG|Katalog sumber dan audit awal]]
- [[OPERATIONAL_DISCOVERY|Discovery kebutuhan Operasional]]
- [[PROJECT_PROGRESS|Log progress]]
- [[ROADMAP|Roadmap]]

## Koleksi dan field aplikasi (diperbarui 2026-11-06)

Kamus di atas berasal dari workbook sumber (draf). Bagian ini mencatat bentuk data **di aplikasi** untuk modul gudang dan SPK stok. Tabel database: migration 1 sampai 13 (terpasang); `produksi_log` (draf 14), `sp` (draf 18). Field tanpa kolom disimpan di jsonb `data`.

| Koleksi | Field penting | Catatan |
|---|---|---|
| `rm` (bahan baku) | item, ukuran, satuan, grade, tebal, lebar, panjang, stok_awal, min, buffer, lokasi, `data.aktif` | stok = stok awal + jumlah mutasi; nonaktif lewat `data.aktif=false` |
| `fg` (barang jadi) | kategori, type, ukuran, panjang, finishing, tebal, satuan, stok_awal, `data.buffer` | buffer dijaga di jsonb |
| `sp` (sparepart, draf 18) | kode, item, satuan, lokasi, min, buffer, stok_awal, tgl_stok_awal, aktif, ket | kode unik bila diisi |
| `mutasi` | gudang (`rm`, `fg`, `sp`), item, jenis (masuk, keluar, opname, koreksi), delta, tgl, ref, spk, pihak, ket, noDok, stokSistem, stokFisik, koreksiDari, dikoreksi | satu baris per item per transaksi; nomor dokumen dipakai bersama oleh barisnya |
| `pr` | noPR, tgl, supplier, items [{item, q, qTerima}], status (Diajukan, Dipesan, Selesai, Batal), butuh, `data.gudang` (`sp` untuk sparepart) | dipakai bahan baku dan sparepart |
| `spk` | no, nomor, tgl, customer, po, due, lead, items [{d, g, q, u, w, prod, ket, `fg`}], status (Draft, Terbit, Batal), `data.stokReq`, terbitAt | `stokReq` menandai SPK stok; `fg` menautkan baris ke produk |
| `kirim` | spk, customer, noSJ, tgl, items, status, `data.alamat`, nopol, driver | alamat pengiriman di jsonb |
| `master/setting` | `dens` (massa jenis per jenis bawaan), `mats` (jenis buatan: nama, kunci, dens, dasar), `jenisOff` (jenis bawaan yang dihapus) | jenis material fleksibel |

Nomor dokumen (`DOCFMT`): RCV, PK, BJ-M, BJ-K, SP-M, SP-K, SP-OPN, PR, OPN, SJ, SJ-V; counter per tahun dan bulan di tabel `master`. Aturan: [[PRD_GUDANG]]; peta modul: [[PETA_MODUL]].
