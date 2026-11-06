<img src="documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Catatan perubahan

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/); versi mengikuti [SemVer](https://semver.org/lang/id/). Tugas dan bukti rinci ada di [documentation/PROJECT_PROGRESS.md](documentation/PROJECT_PROGRESS.md) dan [documentation/TEST_MATRIX.md](documentation/TEST_MATRIX.md); peta sumber daya di [documentation/SISTEM_MAP.md](documentation/SISTEM_MAP.md).

## [Belum dirilis]

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
