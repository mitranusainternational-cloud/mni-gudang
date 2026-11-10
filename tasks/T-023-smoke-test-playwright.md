---
type: task
id: T-023
title: "Smoke test Playwright"
phase: P2
epic: E-03
release: v1.0
status: review
priority: P1
env: development
effort_days: 2
depends: [T-021]
owner: "dev"
updated: 2026-11-06
---

# T-023 Smoke test Playwright

Epic: [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data|E-03]]  
Fase: P2 Aplikasi siap uji  
Bergantung pada: T-021

## Kriteria selesai

- [x] Skenario: login, buat SPK, mutasi stok, kirim
- [x] Berjalan dengan satu perintah npm
- [x] Data sintetis saja

## Bukti

- Skrip awal: `apps/platform/tests/e2e/modules.mjs` (smoke 10 modul) dan `flows.mjs` (alur inti). Dijalankan manual lewat Playwright MCP. Sisa: runner `npm run test:e2e`, dependensi Playwright, dan integrasi CI (T-046).
- `npm run test:e2e` menjalankan semua suite (regresi, role, akses, produksi, sparepart, tampilan) dan dijalankan oleh CI GitHub (job "Aplikasi (build dan regresi mock)"); data sintetis. 2026-11-06: 42, 12, 34, 134, 35, 72 lulus.

## Catatan

-

> [!note] Audit 2026-11-06
> Syarat awal (runner, perintah npm, CI) sudah ada sejak T-077 dan T-046; dicentang dari bukti itu.
