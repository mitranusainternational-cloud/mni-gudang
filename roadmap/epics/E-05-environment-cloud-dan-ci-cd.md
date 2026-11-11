---
type: epic
id: E-05
title: "Environment cloud dan CI/CD"
release: v1.0
theme: Platform
priority: P0
status: active
progress: 44
tasks_total: 11
tasks_done: 5
updated: 2026-11-11
---

# E-05 Environment cloud dan CI/CD

Rilis target: **v1.0** · Tema: Platform · Prioritas: P0
Induk: [[roadmap/PRODUCT_ROADMAP|Roadmap produk]]

## Hasil yang diinginkan

Dev dan prod terpisah (Supabase, Vercel, secrets), CI memblokir build rusak.

## Risiko dan asumsi

Biaya dan manajemen secret; akun pemilik harus tersedia.

## Tugas

- [x] [[tasks/T-029-buat-admin-awal-dan-uji-login-otp-di-supabase-dev|T-029]] Buat admin awal dan uji login OTP di Supabase dev · done · P0 · 0.5 hari
- [x] [[tasks/T-042-supabase-project-development|T-042]] Supabase project development · done · P0 · 0.5 hari
- [x] [[tasks/T-043-supabase-project-production-kosong|T-043]] Supabase project production (kosong) · done · P1 · 0.5 hari
- [ ] [[tasks/T-044-vercel-preview-dari-development-production-dari-ma|T-044]] Vercel: preview dari development, production dari main · doing · P0 · 1 hari
- [ ] [[tasks/T-045-secrets-github-actions-dan-vercel|T-045]] Secrets GitHub Actions dan Vercel · todo · P0 · 0.5 hari
- [x] [[tasks/T-046-ci-build-dan-smoke-test-pada-pr|T-046]] CI: build dan smoke test pada PR · done · P1 · 1 hari
- [ ] [[tasks/T-047-konfigurasi-auth-supabase-produksi|T-047]] Konfigurasi Auth Supabase produksi · doing · P0 · 1 hari
- [x] [[tasks/T-163-aktifkan-supabase-production-dan-arahkan-vercel|T-163]] Aktifkan Supabase production dan arahkan Vercel · done · P0 · 1 hari
- [ ] [[tasks/T-165-pensiunkan-project-supabase-dev-lama|T-165]] Pensiunkan project Supabase dev lama · todo · P2 · 0.2 hari
- [ ] [[tasks/T-166-putuskan-repo-publik-atau-privat-dan-aktifkan-depe|T-166]] Putuskan repo publik atau privat dan aktifkan Dependabot · todo · P1 · 0.2 hari
- [ ] [[tasks/T-203-rilis-paket-gudang-dan-produksi-ke-production|T-203]] Rilis paket Gudang, SPK stok, dan produksi multi WC ke production (bertahap) · todo · P1 · 1.5 hari

> Properti status, progress, dan jumlah tugas serta daftar ini dibuat otomatis oleh `node scripts/progress-report.mjs`. Jangan ubah manual. Tampilan interaktif: [[PROGRESS_DASHBOARD]].
