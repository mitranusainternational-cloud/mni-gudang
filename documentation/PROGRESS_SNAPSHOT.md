---
type: progress-snapshot
status: generated
updated: 2026-11-07
generated: 2026-11-07
---

# Snapshot progress

> Dibuat otomatis oleh `node scripts/progress-report.mjs` dari catatan di `tasks/`. Jangan edit manual; ubah status di catatan tugas lalu jalankan ulang. Tampilan interaktif: [[PROGRESS_DASHBOARD]]. Rencana: [[GO_LIVE_PLAN]] dan [[roadmap/PRODUCT_ROADMAP]].

## Ringkasan

- Tugas selesai: **39 / 139** (28%)
- Bobot effort selesai: **42 / 239.59999999999997 hari kerja** (18%)
- Sisa effort: **197.60000000000002 hari kerja**; jalur kritis sisa menuju go-live (T-065): **26.5 hari kerja** (T-030 → T-033 → T-034 → T-035 → T-050 → T-051 → T-052 → T-053 → T-063 → T-065)
- Cakupan go-live (fase P0-P7): **35 / 105** tugas selesai; tugas pasca go-live (P8-P10) sengaja dijadwalkan ulang setelah hypercare.
- Diblokir: **1**, sedang dikerjakan: **6**
- Estimasi effort bersifat indikatif dan belum memuat waktu tunggu pihak lain.

## Per fase

| Fase | Selesai | Effort selesai | Status |
|---|---|---|---|
| P0 Workspace dan tracking | 7/7 | 5/5 hari (100%) | selesai |
| P1 Fondasi lokal | 2/8 | 1.5/4.7 hari (32%) | ada blocker |
| P2 Aplikasi siap uji | 17/50 | 22/77 hari (29%) | berjalan |
| P3 Data dan proses | 0/7 | 0/13.5 hari (0%) | belum mulai |
| P4 Environment cloud | 6/9 | 3.5/6 hari (58%) | berjalan |
| P5 UAT pilot | 2/12 | 2/15.899999999999999 hari (13%) | berjalan |
| P6 Hardening dan rilis | 1/7 | 0.5/9.5 hari (5%) | berjalan |
| P7 Operasi dan dokumentasi | 0/5 | 0/5.5 hari (0%) | belum mulai |
| P8 v1.1 Stabilisasi, akses, kualitas data | 1/8 | 3/21 hari (14%) | berjalan |
| P9 v1.2 Integrasi dan pelaporan | 3/18 | 4.5/54.5 hari (8%) | berjalan |
| P10 v2.0 Modernisasi dan perluasan | 0/8 | 0/27 hari (0%) | belum mulai |

## Per rilis

| Rilis | Tema | Tugas | Effort | Status |
|---|---|---|---|---|
| v0.9 | Fondasi | 18/41 | 14.75/50.45 hari (29%) | active |
| v1.0 | Pilot go-live | 15/55 | 18.5/75.9 hari (24%) | active |
| v1.1 | Stabilisasi, akses, kualitas data | 2/14 | 4/30 hari (13%) | active |
| v1.2 | Integrasi dan pelaporan | 4/20 | 4.75/55.75 hari (9%) | active |
| v2.0 | Modernisasi dan perluasan | 0/9 | 0/27.5 hari (0%) | active |

## Per epic

| Epic | Rilis | Tugas | Progress | Status |
|---|---|---|---|---|
| [[roadmap/epics/E-01-fondasi-workspace-dan-repo\|E-01]] Fondasi workspace dan repo | v0.9 | 7/8 | 96% | active |
| [[roadmap/epics/E-02-aplikasi-berjalan-lokal\|E-02]] Aplikasi berjalan lokal | v0.9 | 11/33 | 22% | active |
| [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data\|E-03]] Kualitas aplikasi dan keamanan data | v1.0 | 8/17 | 51% | active |
| [[roadmap/epics/E-04-proses-data-dan-pilot\|E-04]] Proses, data, dan pilot | v1.0 | 0/7 | 0% | planned |
| [[roadmap/epics/E-05-environment-cloud-dan-ci-cd\|E-05]] Environment cloud dan CI/CD | v1.0 | 5/11 | 44% | active |
| [[roadmap/epics/E-06-uat-hardening-dan-go-live\|E-06]] UAT, hardening, dan go-live | v1.0 | 1/13 | 2% | active |
| [[roadmap/epics/E-07-dokumentasi-dan-situs-docs\|E-07]] Dokumentasi dan situs Docs | v1.0 | 1/5 | 17% | active |
| [[roadmap/epics/E-08-operasi-dan-dukungan\|E-08]] Operasi dan dukungan | v1.0 | 0/2 | 0% | planned |
| [[roadmap/epics/E-09-akses-peran-dan-audit\|E-09]] Akses, peran, dan audit | v1.1 | 2/7 | 32% | active |
| [[roadmap/epics/E-10-kualitas-data-dan-kontrol-stok\|E-10]] Kualitas data dan kontrol stok | v1.1 | 0/7 | 0% | active |
| [[roadmap/epics/E-11-integrasi-sumber-data\|E-11]] Integrasi sumber data | v1.2 | 0/3 | 0% | planned |
| [[roadmap/epics/E-12-pelaporan-notifikasi-dan-dokumen\|E-12]] Pelaporan, notifikasi, dan dokumen | v1.2 | 0/5 | 0% | active |
| [[roadmap/epics/E-13-modernisasi-frontend-dan-pengujian\|E-13]] Modernisasi frontend dan pengujian | v2.0 | 0/5 | 0% | active |
| [[roadmap/epics/E-14-multi-site-dan-mobile\|E-14]] Multi-site dan mobile | v2.0 | 0/2 | 0% | planned |
| [[roadmap/epics/E-15-self-host-vps-dan-layanan-pendamping\|E-15]] Self-host VPS dan layanan pendamping | v2.0 | 0/2 | 0% | planned |
| [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring\|E-16]] ERP hulu: Penawaran, estimasi, dan monitoring operasional | v1.2 | 4/12 | 16% | active |

## Siap dikerjakan sekarang (dependensi terpenuhi)

- P0 · [[tasks/T-030-walkthrough-proses-dengan-process-owner|T-030]] Walkthrough proses dengan process owner · 3 hari · tim Operasional
- P0 · [[tasks/T-032-konfirmasi-owner-dan-cut-off-enam-workbook|T-032]] Konfirmasi owner dan cut-off enam workbook · 1 hari · tim Operasional
- P0 · [[tasks/T-061-backup-restore-drill-dan-rencana-rollback|T-061]] Backup, restore drill, dan rencana rollback · 1 hari · dev
- P1 · [[tasks/T-024-perbaikan-bug-hasil-verifikasi-buffer|T-024]] Perbaikan bug hasil verifikasi (buffer) · 3 hari · dev
- P1 · [[tasks/T-166-putuskan-repo-publik-atau-privat-dan-aktifkan-depe|T-166]] Putuskan repo publik atau privat dan aktifkan Dependabot · 0.2 hari · pemilik
- P2 · [[tasks/T-017-rapikan-identitas-pengguna-dan-teks-backend-di-mni|T-017]] Rapikan identitas pengguna dan teks backend di mni-app · 0.5 hari · dev
- P2 · [[tasks/T-025-screenshot-fitur-utama-dan-panduan-pengguna|T-025]] Screenshot fitur utama dan panduan pengguna · 1 hari · dev
- P2 · [[tasks/T-027-uji-sisa-ui-mock-void-koreksi-pr-dan-role|T-027]] Uji sisa UI mock: void, koreksi, PR, dan role · 1.5 hari · dev
- P2 · [[tasks/T-070-pilih-generator-situs-docs-dan-klasifikasi-materi|T-070]] Pilih generator situs docs dan klasifikasi materi · 1 hari · dev
- P2 · [[tasks/T-162-selidiki-event-realtime-supabase-tidak-tiba|T-162]] Selidiki event Realtime Supabase yang tidak tiba · 0.5 hari · dev + pemilik akun Supabase
- P2 · [[tasks/T-165-pensiunkan-project-supabase-dev-lama|T-165]] Pensiunkan project Supabase dev lama · 0.2 hari · pemilik akun Supabase

## Sedang dikerjakan

- [[tasks/T-044-vercel-preview-dari-development-production-dari-ma|T-044]] Vercel: preview dari development, production dari main · dev
- [[tasks/T-047-konfigurasi-auth-supabase-produksi|T-047]] Konfigurasi Auth Supabase produksi · dev
- [[tasks/T-133-dokumen-cetak-dan-ekspor-terstandar|T-133]] Dokumen cetak dan ekspor terstandar · dev
- [[tasks/T-143-aset-lokal-tanpa-cdn-dan-csp-ketat|T-143]] Aset lokal tanpa CDN dan CSP ketat · dev
- [[tasks/T-164-samakan-nama-folder-lokal-ke-mni-gudang|T-164]] Samakan nama folder lokal ke mni-gudang · pemilik + dev
- [[tasks/T-173-berat-otomatis-pada-spk-dari-kalkulator|T-173]] Berat otomatis pada SPK dari kalkulator penghitung berat · dev + pemilik

## Diblokir

- [[tasks/T-010-aktifkan-docker-engine-di-windows|T-010]] Aktifkan Docker engine di Windows · pemilik mesin (BIOS + admin Windows)

## Menunggu review

- [[tasks/T-023-smoke-test-playwright|T-023]] Smoke test Playwright · dev
- [[tasks/T-060-review-security-dan-performance-advisor|T-060]] Review security dan performance advisor · dev
- [[tasks/T-079-uji-role-lewat-aplikasi-dengan-akun-uji-per-role|T-079]] Uji role lewat aplikasi dengan akun uji per role · pemilik + dev
- [[tasks/T-101-tegakkan-role-di-ui-selaras-rls-role-on|T-101]] Tegakkan role di UI selaras RLS (ROLE_ON) · dev
- [[tasks/T-103-manajemen-user-oleh-admin-dari-ui|T-103]] Manajemen user oleh admin dari UI · dev
- [[tasks/T-167-hak-akses-per-pengguna-dan-per-modul|T-167]] Hak akses per pengguna dan per modul, kelola pengguna dari aplikasi · dev + pemilik
- [[tasks/T-168-rapikan-dashboard-ringkasan-kpi-dan-analisis|T-168]] Rapikan dashboard: ringkasan kondisi, KPI bertingkat, funnel SPK · dev
- [[tasks/T-169-akun-saya-ganti-dan-lupa-password-dan-keluar|T-169]] Akun saya: ganti password, lupa password, dan tombol keluar · dev
- [[tasks/T-170-kesiapan-pilot-cadangan-dan-impor-csv|T-170]] Kesiapan pilot: cadangan data dan impor CSV master dan stok awal · dev + pemilik
- [[tasks/T-171-logo-perusahaan-di-sistem-dan-dokumen|T-171]] Logo PT Mitra Nusa Internasional di sistem dan semua dokumen · dev
- [[tasks/T-174-produksi-multi-work-center-rute-antrian-kapasitas|T-174]] Produksi multi work center: rute, antrian mesin, kapasitas, posisi, dan kualifikasi vendor · dev + pemilik
- [[tasks/T-177-skema-produksi-tiga-pintu-spk-berjalan|T-177]] Skema produksi tiga pintu: SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa (Tahap 1) · dev + pemilik
- [[tasks/T-178-kinerja-dan-analisa-produksi-tahap-2|T-178]] Kinerja & Analisa produksi (Tahap 2): per work center, produk, vendor, dan pengiriman · dev + pemilik
- [[tasks/T-179-produksi-hari-ini-v2-dan-laporan-produksi|T-179]] Produksi Hari Ini v2 dan Laporan Produksi: input otomatis, analisa qty, tonase, kecepatan, produk bertingkat, KPI operator dan mesin · dev + pemilik
- [[tasks/T-181-uji-alur-spk-awal-sampai-akhir|T-181]] Uji alur lengkap SPK dari terbit sampai selesai, dengan tangkapan layar dan dokumentasi · dev + pemilik
- [[tasks/T-182-papan-jadwal-v2-dan-rapikan-layout-spk|T-182]] Papan jadwal v2 (per SPK dan per mesin) dan perapian layout Berjalan, KPI & Analisa, Target waktu proses · dev + pemilik
- [[tasks/T-183-produksi-hari-ini-papan-mesin-dan-kapasitas-aktual|T-183]] Produksi Hari Ini: papan mesin dan kapasitas aktual (output, laju, pemakaian mesin, proyeksi, tren) · dev + pemilik
- [[tasks/T-190-modul-penawaran-lokal|T-190]] Modul Penawaran lokal (daftar, lembar, revisi, cetak) · dev + pemilik
- [[tasks/T-191-muat-dari-penawaran-ke-spk-dan-snapshot-po|T-191]] Muat dari penawaran ke SPK dan snapshot PO · dev + pemilik
- [[tasks/T-192-kebutuhan-material-dan-reservasi-stok|T-192]] Kebutuhan material dan reservasi stok · dev + pemilik
- [[tasks/T-194-sales-order-penghubung-penawaran-dan-spk|T-194]] Sales Order: penghubung Penawaran dan SPK · dev + pemilik
- [[tasks/T-196-gudang-bahan-baku-dokumen-mutasi-dan-master-fleksibel|T-196]] Gudang Bahan Baku: dokumen semua mutasi, jenis material fleksibel, item nonaktif, kartu HP · dev + pemilik
- [[tasks/T-197-gudang-sparepart-modul-baru|T-197]] Gudang Sparepart: modul baru dari tabel stok Excel (impor, opname, dokumen, buffer) · dev + pemilik
- [[tasks/T-198-barang-jadi-buffer-mutasi-berdokumen-dan-rencana-produksi|T-198]] Gudang Barang Jadi: buffer, mutasi berdokumen tertaut SPK, rencana produksi stok · dev + pemilik
- [[tasks/T-199-spk-stok-alur-ujung-ke-ujung|T-199]] SPK stok ujung ke ujung: ceklis produk, filter jenis SPK, terima di gudang barang jadi, penjaga hasil produksi · dev + pemilik
- [[tasks/T-200-tren-pergerakan-stok-dan-rencana-pembelian-sparepart|T-200]] Tren pergerakan stok (sparepart dan barang jadi) dan rencana pembelian PR sparepart · dev + pemilik
- [[tasks/T-201-nama-penanda-tangan-dokumen|T-201]] Nama penanda tangan pada semua dokumen: ketik manual, saran dari nama yang pernah diketik · dev + pemilik
- [[tasks/T-205-audit-mandiri-dan-perbaikan-pemakaian-di-hp|T-205]] Audit mandiri dan perbaikan pemakaian di HP (kartu per item, form tanpa terpotong) · dev + pemilik
- [[tasks/T-207-master-data-bahan-baku-jenis-material-dan-massa-jenis|T-207]] Master Data > Bahan baku: jenis material, massa jenis, hapus dan pulihkan, ganti nama mengikuti semua modul · dev + pemilik
- [[tasks/T-208-pustaka-pdf-dan-excel-dari-aplikasi-sendiri|T-208]] Pustaka PDF dan Excel dilayani dari aplikasi sendiri (tanpa bergantung CDN) · dev + pemilik
- [[tasks/T-209-gudang-bahan-baku-posisi-stok-dan-stock-opname-dipoles|T-209]] Gudang Bahan Baku: Posisi stok, lembar hitung opname, dan berita acara opname · dev + pemilik
- [[tasks/T-210-audit-fitur-dan-suite-uji-fitur|T-210]] Audit fitur dan rencana, suite uji fitur (aksi UI yang belum diuji) · dev + pemilik
- [[tasks/T-211-audit-kerangka-dan-standar-industri|T-211]] Audit kerangka dan standar industri: keamanan, aksesibilitas, kode, data, bug · dev + pemilik
- [[tasks/T-212-uji-menyeluruh-semua-modul-dan-perbaikan-bug|T-212]] Uji menyeluruh semua modul hulu ke hilir dan perbaikan bug yang ditemukan · dev + pemilik
- [[tasks/T-213-uji-alur-spk-lengkap-dan-penjaga-vendor-berbasis-rute|T-213]] Uji alur SPK lengkap (customer, stok, tanpa vendor) dan penjaga vendor berbasis rute · dev + pemilik
- [[tasks/T-214-input-item-spk-terstruktur-dan-kalkulator-full-hole|T-214]] Input item SPK terstruktur (bentuk, ukuran, berat otomatis) dan kalkulator full hole · dev + pemilik
- [[tasks/T-215-cetak-biru-skema-database-spk-dan-bahan-baku|T-215]] Cetak biru skema database: peruntukan SPK dan kebutuhan bahan baku (draf migration 19) · dev + pemilik

## Tugas P0 yang belum selesai

- [[tasks/T-010-aktifkan-docker-engine-di-windows|T-010]] Aktifkan Docker engine di Windows · blocked
- [[tasks/T-011-jalankan-supabase-local-stack-dan-terapkan-migrati|T-011]] Jalankan Supabase local stack dan terapkan migration · todo · menunggu T-010
- [[tasks/T-012-hubungkan-mni-app-ke-supabase-lokal|T-012]] Hubungkan mni-app ke Supabase lokal · todo · menunggu T-011
- [[tasks/T-020-verifikasi-login-otp-end-to-end-lokal|T-020]] Verifikasi login OTP end-to-end (lokal) · todo · menunggu T-012, T-013
- [[tasks/T-030-walkthrough-proses-dengan-process-owner|T-030]] Walkthrough proses dengan process owner · todo
- [[tasks/T-031-pilih-pilot-pertama-dan-acceptance-criteria|T-031]] Pilih pilot pertama dan acceptance criteria · todo · menunggu T-030
- [[tasks/T-032-konfirmasi-owner-dan-cut-off-enam-workbook|T-032]] Konfirmasi owner dan cut-off enam workbook · todo
- [[tasks/T-035-rekonsiliasi-saldo-hasil-impor|T-035]] Rekonsiliasi saldo hasil impor · todo · menunggu T-034
- [[tasks/T-044-vercel-preview-dari-development-production-dari-ma|T-044]] Vercel: preview dari development, production dari main · doing
- [[tasks/T-045-secrets-github-actions-dan-vercel|T-045]] Secrets GitHub Actions dan Vercel · todo · menunggu T-044
- [[tasks/T-047-konfigurasi-auth-supabase-produksi|T-047]] Konfigurasi Auth Supabase produksi · doing
- [[tasks/T-050-siapkan-data-dan-akun-uat-di-dev|T-050]] Siapkan data dan akun UAT di dev · todo · menunggu T-035, T-036, T-044
- [[tasks/T-051-jalankan-uat-skenario-pilot|T-051]] Jalankan UAT skenario pilot · todo · menunggu T-050, T-031
- [[tasks/T-052-perbaiki-issue-uat-dan-regresi|T-052]] Perbaiki issue UAT dan regresi · todo · menunggu T-051
- [[tasks/T-053-sign-off-uat|T-053]] Sign-off UAT · todo · menunggu T-052
- [[tasks/T-060-review-security-dan-performance-advisor|T-060]] Review security dan performance advisor · review
- [[tasks/T-061-backup-restore-drill-dan-rencana-rollback|T-061]] Backup, restore drill, dan rencana rollback · todo
- [[tasks/T-063-impor-data-awal-ke-production-dan-rekonsiliasi|T-063]] Impor data awal ke production dan rekonsiliasi · todo · menunggu T-053
- [[tasks/T-064-checklist-rilis-dan-merge-development-ke-main|T-064]] Checklist rilis dan merge development ke main · todo · menunggu T-053, T-060, T-061
- [[tasks/T-065-go-live-dan-hypercare-lima-hari|T-065]] Go-live dan hypercare lima hari · todo · menunggu T-064, T-063, T-047
- [[tasks/T-167-hak-akses-per-pengguna-dan-per-modul|T-167]] Hak akses per pengguna dan per modul, kelola pengguna dari aplikasi · review
- [[tasks/T-169-akun-saya-ganti-dan-lupa-password-dan-keluar|T-169]] Akun saya: ganti password, lupa password, dan tombol keluar · review · menunggu T-167
- [[tasks/T-170-kesiapan-pilot-cadangan-dan-impor-csv|T-170]] Kesiapan pilot: cadangan data dan impor CSV master dan stok awal · review · menunggu T-167
