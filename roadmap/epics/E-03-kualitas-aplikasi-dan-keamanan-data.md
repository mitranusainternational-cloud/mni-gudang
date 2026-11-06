---
type: epic
id: E-03
title: "Kualitas aplikasi dan keamanan data"
release: v1.0
theme: Kualitas
priority: P0
status: active
progress: 57
tasks_total: 15
tasks_done: 8
updated: 2026-11-06
---

# E-03 Kualitas aplikasi dan keamanan data

Rilis target: **v1.0** · Tema: Kualitas · Prioritas: P0
Induk: [[roadmap/PRODUCT_ROADMAP|Roadmap produk]]

## Hasil yang diinginkan

Login OTP, CRUD, realtime, dan RLS per role terbukti dengan uji otomatis.

## Risiko dan asumsi

Adapter meniru API Firestore di atas Postgres; perilaku realtime dan lock perlu pembuktian.

## Tugas

- [x] [[tasks/T-018-uji-asap-10-modul-ui-pada-pratinjau-mock|T-018]] Uji asap 10 modul UI pada pratinjau mock · done · P0 · 1 hari
- [x] [[tasks/T-019-perbaiki-bug-hasil-uji-ui-b-001-sampai-b-005|T-019]] Perbaiki bug hasil uji UI (B-001 sampai B-005) · done · P0 · 1.5 hari
- [ ] [[tasks/T-020-verifikasi-login-otp-end-to-end-lokal|T-020]] Verifikasi login OTP end-to-end (lokal) · todo · P0 · 1 hari
- [x] [[tasks/T-021-verifikasi-crud-dan-realtime-semua-koleksi|T-021]] Verifikasi CRUD dan realtime semua koleksi · done · P0 · 3 hari
- [x] [[tasks/T-022-uji-rls-per-role-dengan-skenario-negatif|T-022]] Uji RLS per role dengan skenario negatif · done · P0 · 2 hari
- [ ] [[tasks/T-023-smoke-test-playwright|T-023]] Smoke test Playwright · review · P1 · 2 hari
- [ ] [[tasks/T-024-perbaikan-bug-hasil-verifikasi-buffer|T-024]] Perbaikan bug hasil verifikasi (buffer) · todo · P1 · 3 hari
- [x] [[tasks/T-026-uji-lanjutan-ui-mock-fitur-yang-belum-tercakup|T-026]] Uji lanjutan UI mock: fitur yang belum tercakup · done · P1 · 3 hari
- [ ] [[tasks/T-027-uji-sisa-ui-mock-void-koreksi-pr-dan-role|T-027]] Uji sisa UI mock: void, koreksi, PR, dan role · todo · P2 · 1.5 hari
- [x] [[tasks/T-028-verifikasi-adapter-id-no-spk-dan-master-di-supabas|T-028]] Verifikasi adapter id, no SPK, dan master di Supabase · done · P0 · 1 hari
- [x] [[tasks/T-077-jadikan-regresi-e2e-runner-mandiri-dan-bagian-ci|T-077]] Jadikan regresi E2E runner mandiri dan bagian CI · done · P1 · 1.5 hari
- [x] [[tasks/T-078-jalankan-migration-pembersihan-policy-role-lama|T-078]] Jalankan migration pembersihan policy role lama · done · P0 · 0.5 hari
- [ ] [[tasks/T-079-uji-role-lewat-aplikasi-dengan-akun-uji-per-role|T-079]] Uji role lewat aplikasi dengan akun uji per role · review · P1 · 1 hari
- [ ] [[tasks/T-162-selidiki-event-realtime-supabase-tidak-tiba|T-162]] Selidiki event Realtime Supabase yang tidak tiba · todo · P2 · 0.5 hari
- [ ] [[tasks/T-210-audit-fitur-dan-suite-uji-fitur|T-210]] Audit fitur dan rencana, suite uji fitur (aksi UI yang belum diuji) · review · P1 · 1 hari

> Properti status, progress, dan jumlah tugas serta daftar ini dibuat otomatis oleh `node scripts/progress-report.mjs`. Jangan ubah manual. Tampilan interaktif: [[PROGRESS_DASHBOARD]].
