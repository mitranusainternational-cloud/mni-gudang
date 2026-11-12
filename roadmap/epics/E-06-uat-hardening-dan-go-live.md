---
type: epic
id: E-06
title: "UAT, hardening, dan go-live"
release: v1.0
theme: Rilis
priority: P0
status: active
progress: 2
tasks_total: 13
tasks_done: 1
updated: 2026-11-12
---

# E-06 UAT, hardening, dan go-live

Rilis target: **v1.0** · Tema: Rilis · Prioritas: P0
Induk: [[roadmap/PRODUCT_ROADMAP|Roadmap produk]]

## Hasil yang diinginkan

UAT disetujui, backup teruji, rilis ke main, hypercare lima hari tanpa isu kritis.

## Risiko dan asumsi

Waktu perbaikan setelah UAT sulit diprediksi.

## Tugas

- [ ] [[tasks/T-050-siapkan-data-dan-akun-uat-di-dev|T-050]] Siapkan data dan akun UAT di dev · todo · P0 · 1 hari
- [ ] [[tasks/T-051-jalankan-uat-skenario-pilot|T-051]] Jalankan UAT skenario pilot · todo · P0 · 5 hari
- [ ] [[tasks/T-052-perbaiki-issue-uat-dan-regresi|T-052]] Perbaiki issue UAT dan regresi · todo · P0 · 3 hari
- [ ] [[tasks/T-053-sign-off-uat|T-053]] Sign-off UAT · todo · P0 · 0.5 hari
- [ ] [[tasks/T-060-review-security-dan-performance-advisor|T-060]] Review security dan performance advisor · review · P0 · 1 hari
- [ ] [[tasks/T-061-backup-restore-drill-dan-rencana-rollback|T-061]] Backup, restore drill, dan rencana rollback · todo · P0 · 1 hari
- [x] [[tasks/T-062-header-keamanan-dan-https|T-062]] Header keamanan dan HTTPS · done · P1 · 0.5 hari
- [ ] [[tasks/T-063-impor-data-awal-ke-production-dan-rekonsiliasi|T-063]] Impor data awal ke production dan rekonsiliasi · todo · P0 · 1 hari
- [ ] [[tasks/T-064-checklist-rilis-dan-merge-development-ke-main|T-064]] Checklist rilis dan merge development ke main · todo · P0 · 0.5 hari
- [ ] [[tasks/T-065-go-live-dan-hypercare-lima-hari|T-065]] Go-live dan hypercare lima hari · todo · P0 · 5 hari
- [ ] [[tasks/T-066-domain-kustom|T-066]] Domain kustom · todo · P2 · 0.5 hari
- [ ] [[tasks/T-170-kesiapan-pilot-cadangan-dan-impor-csv|T-170]] Kesiapan pilot: cadangan data dan impor CSV master dan stok awal · review · P0 · 1 hari
- [ ] [[tasks/T-171-logo-perusahaan-di-sistem-dan-dokumen|T-171]] Logo PT Mitra Nusa Internasional di sistem dan semua dokumen · review · P1 · 0.5 hari

> Properti status, progress, dan jumlah tugas serta daftar ini dibuat otomatis oleh `node scripts/progress-report.mjs`. Jangan ubah manual. Tampilan interaktif: [[PROGRESS_DASHBOARD]].
