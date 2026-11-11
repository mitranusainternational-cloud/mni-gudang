---
type: epic
id: E-02
title: "Aplikasi berjalan lokal"
release: v0.9
theme: Fondasi
priority: P0
status: active
progress: 22
tasks_total: 33
tasks_done: 11
updated: 2026-11-11
---

# E-02 Aplikasi berjalan lokal

Rilis target: **v0.9** · Tema: Fondasi · Prioritas: P0
Induk: [[roadmap/PRODUCT_ROADMAP|Roadmap produk]]

## Hasil yang diinginkan

mni-app berjalan penuh di mesin pengembang dengan Supabase lokal dan data sintetis.

## Risiko dan asumsi

Docker belum aktif di mesin kerja (T-010).

## Tugas

- [x] [[tasks/T-004-scaffold-mni-app-masuk-repo-dan-build-lolos|T-004]] Scaffold mni-app masuk repo dan build lolos · done · P1 · 0.5 hari
- [x] [[tasks/T-005-perbaiki-bootstrap-mni-app-app-js-error|T-005]] Perbaiki bootstrap mni-app (app.js error) · done · P0 · 0.5 hari
- [ ] [[tasks/T-010-aktifkan-docker-engine-di-windows|T-010]] Aktifkan Docker engine di Windows · blocked · P0 · 0.5 hari
- [ ] [[tasks/T-011-jalankan-supabase-local-stack-dan-terapkan-migrati|T-011]] Jalankan Supabase local stack dan terapkan migration · todo · P0 · 0.5 hari
- [ ] [[tasks/T-012-hubungkan-mni-app-ke-supabase-lokal|T-012]] Hubungkan mni-app ke Supabase lokal · todo · P0 · 0.5 hari
- [ ] [[tasks/T-013-seed-data-sintetis-per-role|T-013]] Seed data sintetis per role · todo · P1 · 1 hari
- [x] [[tasks/T-014-tetapkan-sumber-kebenaran-ui-untuk-extract|T-014]] Tetapkan sumber kebenaran UI untuk extract · done · P1 · 0.5 hari
- [x] [[tasks/T-016-pratinjau-lokal-mode-mock-dengan-login|T-016]] Pratinjau lokal mode mock dengan login · done · P0 · 1 hari
- [ ] [[tasks/T-017-rapikan-identitas-pengguna-dan-teks-backend-di-mni|T-017]] Rapikan identitas pengguna dan teks backend di mni-app · todo · P2 · 0.5 hari
- [ ] [[tasks/T-168-rapikan-dashboard-ringkasan-kpi-dan-analisis|T-168]] Rapikan dashboard: ringkasan kondisi, KPI bertingkat, funnel SPK · review · P1 · 0.5 hari
- [ ] [[tasks/T-173-berat-otomatis-pada-spk-dari-kalkulator|T-173]] Berat otomatis pada SPK dari kalkulator penghitung berat · doing · P1 · 3 hari
- [ ] [[tasks/T-174-produksi-multi-work-center-rute-antrian-kapasitas|T-174]] Produksi multi work center: rute, antrian mesin, kapasitas, posisi, dan kualifikasi vendor · review · P1 · 4 hari
- [x] [[tasks/T-175-impor-stok-barang-jadi-oktober-2026|T-175]] Impor stok barang jadi dari Stock Barang 2026 ke production (data saja) · done · P1 · 0.5 hari
- [x] [[tasks/T-176-filter-type-gudang-barang-jadi|T-176]] Filter Type di Gudang Barang Jadi (STU, STC, SLU, SLW, SLHD) · done · P2 · 0.25 hari
- [ ] [[tasks/T-177-skema-produksi-tiga-pintu-spk-berjalan|T-177]] Skema produksi tiga pintu: SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa (Tahap 1) · review · P1 · 1.5 hari
- [ ] [[tasks/T-178-kinerja-dan-analisa-produksi-tahap-2|T-178]] Kinerja & Analisa produksi (Tahap 2): per work center, produk, vendor, dan pengiriman · review · P1 · 3 hari
- [ ] [[tasks/T-179-produksi-hari-ini-v2-dan-laporan-produksi|T-179]] Produksi Hari Ini v2 dan Laporan Produksi: input otomatis, analisa qty, tonase, kecepatan, produk bertingkat, KPI operator dan mesin · review · P1 · 2 hari
- [x] [[tasks/T-180-jadwal-spk-gantt|T-180]] Jadwal SPK (Gantt): garis waktu SPK berjalan dari terbit, produksi, vendor, kirim sampai due date · done · P1 · 1 hari
- [ ] [[tasks/T-181-uji-alur-spk-awal-sampai-akhir|T-181]] Uji alur lengkap SPK dari terbit sampai selesai, dengan tangkapan layar dan dokumentasi · review · P1 · 1 hari
- [ ] [[tasks/T-182-papan-jadwal-v2-dan-rapikan-layout-spk|T-182]] Papan jadwal v2 (per SPK dan per mesin) dan perapian layout Berjalan, KPI & Analisa, Target waktu proses · review · P1 · 1 hari
- [ ] [[tasks/T-183-produksi-hari-ini-papan-mesin-dan-kapasitas-aktual|T-183]] Produksi Hari Ini: papan mesin dan kapasitas aktual (output, laju, pemakaian mesin, proyeksi, tren) · review · P1 · 1 hari
- [x] [[tasks/T-184-muat-data-bahan-baku-oktober-ke-production|T-184]] Muat data bahan baku (plat) 27 Oktober ke Supabase production · done · P1 · 1 hari
- [x] [[tasks/T-185-papan-jadwal-v3-interaktif-dan-urutan-tab-spk|T-185]] Papan jadwal v3 interaktif (tooltip, panel detail, zoom, geser, buka/lipat semua) dan urutan tab SPK · done · P1 · 1 hari
- [x] [[tasks/T-186-jadwal-tampilan-progres-matriks-posisi-item|T-186]] Berjalan memuat matriks posisi item; Jadwal menjadi timeline bersih per SPK dengan perkiraan otomatis · done · P1 · 2 hari
- [x] [[tasks/T-195-surat-jalan-alamat-partial-dan-penomoran-otomatis|T-195]] Surat jalan: alamat pengiriman, tabel partial, penomoran otomatis, dokumen baru · done · P1 · 1.5 hari
- [ ] [[tasks/T-196-gudang-bahan-baku-dokumen-mutasi-dan-master-fleksibel|T-196]] Gudang Bahan Baku: dokumen semua mutasi, jenis material fleksibel, item nonaktif, kartu HP · review · P1 · 3 hari
- [ ] [[tasks/T-197-gudang-sparepart-modul-baru|T-197]] Gudang Sparepart: modul baru dari tabel stok Excel (impor, opname, dokumen, buffer) · review · P1 · 3 hari
- [ ] [[tasks/T-199-spk-stok-alur-ujung-ke-ujung|T-199]] SPK stok ujung ke ujung: ceklis produk, filter jenis SPK, terima di gudang barang jadi, penjaga hasil produksi · review · P1 · 2.5 hari
- [ ] [[tasks/T-205-audit-mandiri-dan-perbaikan-pemakaian-di-hp|T-205]] Audit mandiri dan perbaikan pemakaian di HP (kartu per item, form tanpa terpotong) · review · P1 · 1 hari
- [ ] [[tasks/T-207-master-data-bahan-baku-jenis-material-dan-massa-jenis|T-207]] Master Data > Bahan baku: jenis material, massa jenis, hapus dan pulihkan, ganti nama mengikuti semua modul · review · P1 · 2 hari
- [ ] [[tasks/T-209-gudang-bahan-baku-posisi-stok-dan-stock-opname-dipoles|T-209]] Gudang Bahan Baku: Posisi stok, lembar hitung opname, dan berita acara opname · review · P1 · 1 hari
- [ ] [[tasks/T-213-uji-alur-spk-lengkap-dan-penjaga-vendor-berbasis-rute|T-213]] Uji alur SPK lengkap (customer, stok, tanpa vendor) dan penjaga vendor berbasis rute · review · P1 · 1 hari
- [ ] [[tasks/T-214-input-item-spk-terstruktur-dan-kalkulator-full-hole|T-214]] Input item SPK terstruktur (bentuk, ukuran, berat otomatis) dan kalkulator full hole · review · P1 · 2 hari

> Properti status, progress, dan jumlah tugas serta daftar ini dibuat otomatis oleh `node scripts/progress-report.mjs`. Jangan ubah manual. Tampilan interaktif: [[PROGRESS_DASHBOARD]].
