---
type: audit
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Audit fitur dan rencana (2026-11-06)

Dua pemeriksaan: (1) **fitur**: apa yang ada di aplikasi dibanding apa yang diuji otomatis, plus celah yang ditutup hari ini; (2) **rencana**: apakah [[GO_LIVE_PLAN]] dan [[roadmap/PRODUCT_ROADMAP|roadmap]] masih sesuai kenyataan. Lanjutan [[AUDIT_PROGRESS_2026-11-06]]. Peta modul: [[PETA_MODUL]]. Tugas: [[T-210-audit-fitur-dan-suite-uji-fitur]].

## 1. Audit fitur

### 1.1 Ukuran

| Ukuran | Nilai |
|---|---|
| Aksi UI berbeda (`data-act`) di `app.js` (5.754 baris) | 167 |
| Diacu langsung oleh uji otomatis, sebelum audit | 77 (46%) |
| Diacu langsung oleh uji otomatis, sesudah suite `fitur` | 91 (54%) |
| Suite uji | regresi 42, role 12, akses 34, produksi 134, sparepart 35, **fitur 13 (baru)**, tampilan 72 = 342; unit 266 |

"Diacu langsung" = nama aksi muncul di berkas uji. Ini batas bawah: banyak aksi lain (mis. `kartu`, `doc`, `go`, `filtsel`, `dwtab`) terpakai tidak langsung lewat klik teks. Angka ini penanda celah, bukan ukuran cakupan baris kode.

### 1.2 Celah yang ditutup hari ini (suite `fitur.mjs`, F-1 sampai F-14)

| Uji | Fitur | Hasil |
|---|---|---|
| F-1 | Koreksi transaksi stok membuat pembalik dan menandai transaksi asli | lulus |
| F-2 | Nonaktifkan dan aktifkan item bahan baku | lulus |
| F-3 | Form mutasi: tambah dan hapus baris item | lulus |
| F-4 | Ceklis produk menjadi SPK stok Draft (qty), lalu Terbitkan (status dan waktu terbit) | lulus |
| F-5, F-6 | Opname bahan baku: Isi semua = sistem, Kosongkan, lembar hitung kosong | lulus |
| F-7 | Unduh Excel SPK | lulus |
| F-8 | Jenis material: tambah, hapus bawaan, pulihkan | lulus |
| F-9 | Surat jalan dari SPK selesai produksi, lalu ubah alamat | lulus |
| F-11 | Pilih semua di bawah buffer dan Batal pilih | lulus |
| F-12, F-13 | Unduh Excel lembar hitung opname dan dokumen penerimaan | lulus |
| F-14 | Tanpa galat JavaScript | lulus |

Temuan dari penulisan uji: tidak ada bug fungsional baru. Satu perilaku perlu dicatat: Terima material dengan supplier baru meminta "simpan sekali lagi" untuk mendaftarkan supplier (disengaja, menghindari typo masuk Master Data).

### 1.3 Aksi yang belum diacu uji (76), dikelompokkan

| Kelompok | Aksi | Risiko | Saran |
|---|---|---|---|
| Opname sparepart | `spopnfill`, `spopnclear`, `spopnsave` | sedang (mengubah stok) | uji dengan data sparepart sintetis di `sparepart.mjs` (SP-9 menguji simpan lewat isian, bukan tombol isi dan kosongkan) |
| Dokumen | `prxlsx` (PR bahan baku), `ksxlsx`, `ksprint` (kartu stok), `printbm` (checklist bongkar muat) | sedang | tambah unduhan ke `fitur.mjs` |
| SPK editor | `ed-addline`, `ed-delline`, `ed-addsec`, `ed-delsec`, `ed-up`, `ed-down`, `ed-addacc` | tinggi (mengubah isi SPK) | uji alur ubah SPK (tambah baris, section, urut) di `produksi.mjs` atau `alur-spk.mjs` |
| Master Data | `medit`, `mdel`, `mmerge`, `mreg`, `mepage`, `grupedit`, `grupdel`, `katedit`, `katdel`, `katmerge`, `katauto`, `katgo`, `listnew`, `listedit`, `listdel`, `setcat` | tinggi (ganti nama berantai) | uji gabung dan ganti nama master mengikuti modul |
| Bahan baku | `rmedit`, `rmset` | sedang | uji ubah item dan pengaturan |
| Bongkar muat | `bmstep`, `bmkoreksi`, `openbm` | sedang | uji langkah dan koreksi antrean |
| Produksi | `mesinmsn`, `mesinop`, `mesinwc`, `wcdel`, `wcedit`, `wcseed`, `wcmesinseed`, `pgpos`, `papanbuka`, `prodfix`, `lapf`, `jdhariini` | sedang | sebagian tercakup di `produksi.mjs` lewat klik teks |
| Penawaran dan SO (tersembunyi) | `pqbuka`, `pqsalin`, `pqvarian`, `pmpilih`, `sobuka`, `sohapus`, `prnew` | rendah (modul disembunyikan) | uji saat modul ditampilkan lagi |
| Laporan | `kpicsv`, `kpiuser`, `kpivendor`, `spcsv` | rendah | uji ekspor CSV |
| Lain | `setvendor`, `openkirim`, `openvendor`, `upw`, `auditrefresh`, `bbgo`, `cekgrp`, `kendal`, `dwtab`, `filtsel`, `go`, `kartu`, `doc`, `spkstage` | rendah | umumnya terpakai tidak langsung |

Prioritas berikutnya (urut risiko): editor SPK, Master Data (ganti nama, gabung), opname sparepart, dokumen kartu stok dan PR.

### 1.4 Keputusan desain yang diaudit

| Hal | Hasil |
|---|---|
| Hapus permanen | tidak ada; terverifikasi (item nonaktif, transaksi dikoreksi) |
| Stok bisa minus lewat UI | ditolak form (keluar melebihi stok, koreksi yang membuat minus); celah pengeluaran bersamaan hanya ditutup draf migration 17 ([[T-206-anti-stok-negatif-dan-penimpaan-bersamaan-draf-migration-17]]) |
| SPK stok dikirim ke customer | tidak mungkin: SPK stok tidak ada di pilihan surat jalan, tombolnya diganti |
| Penerimaan atau pengiriman melebihi hasil produksi | ditolak kecuali override yang bermakna (kirim lebih, keterangan wajib) |
| Nama penanda tangan | per perangkat (localStorage), belum dibagi pengguna |
| Tren | ambang 25 persen sementara; Data baru bila riwayat < 45 hari |

## 2. Audit rencana

### 2.1 Rencana vs kenyataan (per fase, dari [[PROGRESS_SNAPSHOT]])

| Fase | Selesai | Catatan audit |
|---|---|---|
| P0 Workspace dan tracking | 7/7 | selesai |
| P1 Fondasi lokal | 2/8 | tertahan Docker (T-010); tidak lagi di jalur kritis karena production dipakai langsung |
| P2 Aplikasi siap uji | 15/45 | banyak pekerjaan nyata berstatus `review` (menunggu pemilik), bukan `done` |
| P3 Data dan proses | 0/7 | **belum dimulai**; penentu jalur kritis |
| P4 Environment cloud | 6/9 | production tayang; sisa Preview, Auth, secrets |
| P5 UAT pilot | 2/12 | belum |
| P6 Hardening dan rilis | 1/7 | advisor ditinjau; backup, pulih, domain belum |
| P7 Operasi dan dokumentasi | 0/5 | belum; panduan pengguna baru ditulis ulang hari ini (draf) |
| P8 sampai P10 | 1/8, 3/14, 0/8 | pasca go-live; sebagian pekerjaan sudah dikerjakan lebih awal (E-16, E-10) |

### 2.2 Deviasi dari rencana

1. **Urutan terbalik:** rencana awal (pilot dulu, fitur kemudian) tidak dijalankan; fitur produksi, gudang, dan ERP dibangun lebih dulu atas permintaan pemilik. Efeknya: nilai fungsional tinggi, tetapi go-live resmi tidak bergerak (26,5 hari kerja sejak 2026-11-05).
2. **Production sebelum UAT:** production tayang dan dipakai pemilik dengan data nyata sebagian; ini melanggar gerbang S4 tetapi dicatat sebagai keputusan pemilik.
3. **Cabang panjang:** `fitur/produksi-multi-wc` membawa 175 berkas; rilis bertahap diperlukan.
4. **Tugas tidak tercatat:** 15 pekerjaan (T-195 sampai T-209) tidak punya catatan sampai audit hari ini.
5. **Dokumen status usang:** sebagian besar dokumen rencana bertanggal 2026-11-02; diperbarui hari ini (daftar di [[AUDIT_PROGRESS_2026-11-06]] dan [[PROJECT_PROGRESS]]).

### 2.3 Usul penyesuaian rencana (menunggu pemilik)

| # | Usul | Alasan |
|---|---|---|
| 1 | Tambahkan **P2b: pemolesan modul atas permintaan pemilik** ke GO_LIVE_PLAN sebagai fase sah dengan batas waktu | fase ini nyata dan memakan kapasitas; tanpa tempat di rencana, hitungan selesai dan jalur kritis menyesatkan |
| 2 | Pakai modul yang sudah jadi sebagai **bahan walkthrough** (T-030) dengan tim gudang, PPIC, logistik | mempercepat jalur kritis: kebutuhan divalidasi langsung pada layar, bukan wawancara kosong |
| 3 | Jadwalkan **rilis bertahap** (T-203) setelah backup (T-061) dan keputusan SPK lama | menurunkan risiko; membuka bukti Supabase untuk migration 14 dan 18 |
| 4 | Tutup T-011, T-012, T-013 sebagai digantikan; pindahkan T-020 ke production | Docker tidak lagi jalur; verifikasi di production lebih bernilai |
| 5 | Sesi tinjauan pemilik per modul untuk menutup 33 tugas `review` | membuat hitungan selesai mencerminkan pekerjaan jadi |
| 6 | Putuskan aturan lingkup: pemolesan atas permintaan langsung diizinkan sementara jalur proses dan data menunggu | menutup temuan audit 2026-11-05 nomor 1 |

### 2.4 Risiko aktif

| Risiko | Dampak | Penanganan |
|---|---|---|
| Jalur proses dan data tidak dimulai | go-live tidak pernah dijadwalkan | usul 2 dan keputusan pemilik nomor 1 di [[AUDIT_PROGRESS_2026-11-06]] |
| Rilis paket besar | sulit ditinjau, perilaku berubah di production | rilis bertahap, ukur cakupan, cadangan, rollback |
| Penjaga kirim ke customer | SPK lama tertahan | keputusan pemilik sebelum rilis |
| Tanpa backup terjadwal dan uji pulih | kehilangan data tidak dapat dipulihkan | T-061 sebelum rilis besar |
| Bukti hanya di mock untuk 14 dan 18 | bug khusus Postgres baru tampak di production | pra-cek baca-saja selesai; uji pada branch database bila disetujui |
| Cakupan uji aksi UI 54% | regresi pada editor SPK dan Master Data tidak terdeteksi | prioritas di bagian 1.3 |
