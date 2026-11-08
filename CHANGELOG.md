<img src="documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Catatan perubahan

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/); versi mengikuti [SemVer](https://semver.org/lang/id/). Tugas dan bukti rinci ada di [documentation/PROJECT_PROGRESS.md](documentation/PROJECT_PROGRESS.md) dan [documentation/TEST_MATRIX.md](documentation/TEST_MATRIX.md); peta sumber daya di [documentation/SISTEM_MAP.md](documentation/SISTEM_MAP.md).

## [Belum dirilis]

### Ditambahkan (Master Mesin dan alur sparepart, 2026-11-08)
- Master Data › **Mesin**: mesin produksi (dari Work Centre) dan peralatan pendukung dengan kode aset, merek, lokasi, aktif/nonaktif.
- Sparepart **keluar ke mesin** (jenis pemakaian, mesin, pengambil), **masuk lewat PR** atau dengan alasan tanpa PR; tab **Pemakaian mesin** dan filter riwayat per mesin; dokumen SP-M/SP-K memuat PR atau mesin.
- Koreksi penerimaan dari PR mengembalikan qTerima dan status PR.

### Ditambahkan (Surat Jalan ke customer, 2026-11-06)
- Isian **alamat pengiriman** pada surat jalan (otomatis dari Master Data customer, bisa diubah per surat jalan, tombol Ubah alamat di laci detail). Disimpan di bidang tambahan surat jalan, tanpa migration.
- Dokumen PDF dan Excel surat jalan dengan tata letak baru; **status tidak lagi ikut** di dokumen.
- Tabel **rincian pengiriman partial** (Partial 1, 2, dst., total terkirim, sisa) yang muncul otomatis hanya bila barang dikirim bertahap.
- Penomoran surat jalan otomatis format `{tahun}/{bulan romawi}/MNI/{nomor urut}` (mis. `26/XI/MNI/1800`) yang melanjutkan nomor sebelumnya; tetap bisa diketik manual.
- Tidak ada perubahan skema, migration, atau data yang ada.

### Ditambahkan (lokal, belum dirilis, 2026-11-06)
- **Gudang Sparepart** (modul baru): impor Excel, stok minimum dan buffer, opname, dokumen SP-M, SP-K, SP-OPN, tren, rencana pembelian dan PR. Perlu migration 18.
- **Gudang Bahan Baku:** dokumen untuk semua mutasi (RCV, PK, OPN) dengan PDF dan Excel, jenis material fleksibel dengan massa jenis, nonaktif item, lembar hitung opname, kartu per item di HP.
- **Gudang Barang Jadi:** buffer, riwayat mutasi berdokumen (BJ-M, BJ-K) tertaut SPK, tren, rencana produksi, ceklis produk menjadi SPK stok.
- **SPK stok** ujung ke ujung: filter Semua SPK, SPK Customer, SPK Stok; terima di gudang barang jadi; penjaga hasil produksi.
- **Nama penanda tangan** dapat diketik pada semua dokumen, dengan saran dari nama yang pernah diketik.
- Pustaka PDF dan Excel dilayani dari aplikasi sendiri; produksi multi work center (rute, antrian, kapasitas, jadwal, laporan; perlu migration 14).

### Diubah (lokal, belum dirilis)
- **Perilaku:** kirim ke customer hanya sebesar hasil produksi yang selesai (override "kirim lebih" dengan keterangan); SPK lama yang produksinya tidak pernah dicatat tertahan sampai dicatat atau override dipakai.
- Menu Penawaran dan Sales Order disembunyikan.

### Diperbaiki (lokal)
- Teks progres "N dari M item dikirim" di laci SPK selalu 0; kini memakai jumlah terkirim sebenarnya.
- Pembaca angka salah untuk teks berpemisah ribuan (`1.500,75` terbaca 1,5): kini mengenali koma desimal, titik ribuan, dan format en.
- Koreksi barang masuk gudang jadi dari SPK stok tidak mengurangi progres SPK dan jumlah yang sedang diproduksi; kini ikut berkurang.
- Mengganti nama supplier di Master Data kini mengubah supplier pada PR; hitungan pemakaian master memuat sparepart, PR, dan barang jadi keluar (supplier atau customer yang dipakai tidak bisa dihapus permanen); ganti nama customer mengikutkan Penawaran dan Sales Order.
- Dashboard: SPK stok tidak lagi masuk Top customer, funnel pengiriman customer, dan hitungan telat.
- Work Center yang dilewati rute SPK aktif, punya catatan produksi, atau ada di aturan rute tidak lagi bisa dihapus (ditawarkan Nonaktifkan) dan tidak bisa diganti nama.
- Modal dan laci mengelola fokus keyboard: Tab tetap di dalam dialog, fokus kembali ke tombol pemicu saat ditutup.
- Penghapusan yang ditolak kebijakan database kini menampilkan galat, bukan sukses palsu.
- SPK dengan langkah vendor tidak lagi "Siap kirim" sebelum finishing: barang baru boleh dikirim ke customer (atau diterima gudang untuk SPK stok) setelah kembali dari vendor; tahap baru "Siap ke vendor". SPK stainless, aluminium, dan Non Finishing tetap tanpa vendor.
- SPK stok membawa berat per pcs dari kalkulator berat bila katalog terpasang.
- **Aturan section SPK dan stok di editor (T-220, lokal):** Cable Tray/Perforated/Ladder hanya Straight, ACCS memuat fitting dan aksesori, Cover memuat tutup; aturan dapat diubah di Master Data › Aturan section; tombol Section COVER; keterangan pemakaian stok (cocok/tidak, Pakai stok) selalu tampil di tiap baris editor SPK. SPK lama tidak berubah.
- **Tema dokumen diperluas (T-219, lokal):** PR bahan baku dan sparepart, dokumen mutasi stok, lembar opname, kartu stok, dan penawaran cetak memakai kop dan tema yang sama (kode IN, OUT, OPN, KOR, PR, KS, PNW); tombol PDF baru untuk PR dan kartu stok.
- **Desain dokumen modern dan kop di Master Data (T-219, lokal):** tab "Kop dokumen" (nama, alamat, kontak, warna, logo); surat jalan customer/vendor, BTB, laporan produksi, KPI, dan checklist memakai tata letak baru yang sama untuk pratinjau, PDF, dan Excel, dengan kode dan warna pembeda per jenis (SJ, SJV, BTB, LPP, KPI, CL).
- **Surat jalan gabungan beberapa SPK dalam satu armada (T-218, lokal):** tombol "Tambah SPK lain di armada yang sama" pada kirim ke vendor dan surat jalan customer; satu nomor surat jalan untuk beberapa SPK (dokumen tetap per SPK), cetak memuat judul per SPK, ceklis Bongkar Muat dikelompokkan per SPK, pembatalan sebagian tidak merusak kelompok. Ceklis surat jalan keluar hanya dari catatan Loading.
- **SPK customer memakai stok barang jadi sebagian (T-216, lokal):** kolom "Dari stok" di editor SPK; bagian dari stok dicadangkan (stok tersedia turun), target produksi hanya sisanya, stok fisik keluar otomatis saat surat jalan customer dibuat (dibalik bila dibatalkan), tanpa hitung ganda, kartu stok menampilkan cadangan.
- **Bongkar Muat (T-217, lokal):** ceklis digital tersimpan per butir (waktu dan pengguna), foto bukti dari kamera atau unggahan (dikompres, keterangan, pilih yang ikut dicetak), kolom Cek (✓) dan lampiran foto muncul di surat jalan vendor dan customer (pratinjau, PDF, Excel), antrian lebih ringkas dengan pencarian dan kolom Selesai dibatasi 8 terbaru. Penyimpanan foto ke Supabase Storage baru berupa draf migration 23.
- **SPK stok ke Gudang Barang Jadi diperbaiki:** tautan produk gudang tidak lagi hilang saat SPK stok disimpan ulang di editor (penyebab barang yang sudah selesai diproduksi tidak bisa diterima); tautan yang sudah terlanjur hilang dipulihkan lewat kecocokan nama; memilih SPK stok di form Barang masuk mengisi produk dan jumlah otomatis dari hasil produksi yang siap; label SPK stok memakai "Masuk gudang barang jadi", bukan "Terkirim ke customer".
- **Snapshot rute per item:** rute produksi dan mesin alternatif disalin ke tiap item saat SPK diterbitkan atau direvisi, sehingga mengubah rute produk di Master Data tidak menggeser SPK yang sedang berjalan. SPK lama tanpa snapshot tetap dijaga dan dibekukan saat direvisi; pengecualian vendor item yang sudah punya catatan tidak bisa diubah.
- Master Data, tab **Opsi SPK**: daftar produk, type, tebal, finishing, distribusi lembar SPK, pilihan lead time, dan penandatangan bawaan kini diatur di Master Data (bukan tertanam di kode); produk baru langsung muncul di tab Rute produksi. Perbaikan kartu KPI Master Data yang kehilangan gaya.
- Audit alur hulu ke hilir: revisi SPK terbit dijaga (item bercatatan tidak boleh dihapus, dipindah, diganti nama, atau qty diturunkan di bawah yang berjalan); **Batalkan SPK** dan **Aktifkan kembali** (status Batal tidak dihitung aktif); perubahan rute produk yang menggeser SPK berjalan ditolak; surat jalan vendor yang sudah menerima barang tidak bisa dibatalkan.
- Update produksi di drawer SPK kini sejalan dengan Produksi Hari Ini: terakhir update, riwayat, ekspor, dan tanggal produksi selesai membaca hasil mesin; tombol Catat tersedia di setiap langkah yang berantrian; item selesai dihitung dari progres efektif; total manual lama tidak hilang saat hasil mesin masuk. Kode monitoring lama yang tidak terpakai dihapus.
- Editor SPK terstruktur dan tab Rute produksi lolos uji aksesibilitas WCAG 2 A dan AA; urutan langkah rute dipertahankan saat mencentang work center.
- Master Data, tab **Rute produksi**: work center yang dilewati per produk dan rute khusus per bentuk. Vendor mengikuti material (SPHC ke vendor sesuai finishing; stainless dan aluminium tanpa vendor); pilihan vendor per baris (ikut aturan, wajib, tanpa) dan peringatan baja tanpa finishing di editor SPK.
- Input item SPK terstruktur: pilih bentuk (Straight, Elbow, Tee, Cross, Reducer, Cover, aksesori) lalu isi ukuran W, H, L atau R; nama item, type, tebal, finishing, berat per pcs, berat per item, dan tonase terisi otomatis dari kalkulator. Pilihan Lubang Bawah atau Full hole untuk Straight tray (kalkulator baru); Perforated Cable Tray otomatis Full hole, bisa diganti manual. Teks bebas tetap tersedia; SPK lama terbuka apa adanya.

### Aksesibilitas dan kualitas (lokal)
- Kontras warna tema gelap dan terang memenuhi WCAG 2 AA; pilihan, isian, dan tabel yang dapat digulir diberi nama dan dapat diakses keyboard; avatar berkontras cukup.
- Pemeriksaan otomatis: ESLint (`npm run lint`), uji unit di CI, uji XSS, uji aksesibilitas (axe-core), dan pemeriksa invarian data.

### Direncanakan sebelum dipakai tim
- Database production terpisah dan terverifikasi di Supabase (akun mitranusainternational), akun admin dan role tim, Auth (Site URL, Redirect URL, sign-up dimatikan).
- Backup dan uji pemulihan; keputusan repo publik atau privat. Daftar lengkap: documentation/AUDIT_KESIAPAN.md.

## [0.9.0] - 2026-11-03 (staging pertama)

### Ditambahkan
- Aplikasi MNI Gudang & Logistik (10 modul) berjalan di Vercel (`mni-gudang.vercel.app`) dengan adapter Supabase.
- Model role aplikasi di database: `role_modules`, `can_mod`, `can_any`, `is_admin`; role admin, ppic, gbb, gbj, logistik, viewer.
- Penomoran dokumen atomik (`try_lock`, migration 10).
- CI GitHub Actions: pemeriksaan vault, build, regresi UI 38 pemeriksaan, uji role 12 pemeriksaan.
- Vault Obsidian: tugas, epic, roadmap, audit kesiapan, peta sistem; agen dan skill proyek untuk Claude Code.

### Diubah
- Struktur repo dirapikan: `apps/gudang-logistik` (sumber UI) dan `apps/platform` (Vite, adapter, migration, tes); repo GitHub dan project Vercel memakai nama `mni-gudang`.
- Pembaruan data antar sesi memakai polling 15 detik (Realtime Supabase tidak mengirim event; T-162).
- Supabase-js dibundel dari npm (bukan CDN); CSP, HSTS, dan Permissions-Policy ditambahkan.

### Diperbaiki
- B-014 data baru tidak muncul setelah simpan; B-015 nomor dokumen berulang; B-016 kolom relasi `item_id`/`spk_id` kosong; B-017 data sesi lain tidak muncul; B-018 aplikasi berjalan sebagai "Tamu" bila login sangat cepat; placeholder env tertinggal di HTML produksi; permintaan data sebelum login (401).
- Bug sebelumnya B-001 sampai B-013 (lihat TEST_MATRIX).

### Keamanan
- RLS aktif di 21 tabel; role lama (manager, gudang, produksi) tidak lagi punya hak; viewer tidak dapat menulis log.
- `anon` dicabut dari fungsi pembantu; `pg_trgm` dipindah dari schema `public`; secret scanning dan push protection aktif.
