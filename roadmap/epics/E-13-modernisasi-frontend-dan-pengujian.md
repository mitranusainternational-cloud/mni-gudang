---
type: epic
id: E-13
title: "Modernisasi frontend dan pengujian"
release: v2.0
theme: Teknik
priority: P2
status: active
progress: 0
tasks_total: 5
tasks_done: 0
updated: 2026-11-11
---

# E-13 Modernisasi frontend dan pengujian

Rilis target: **v2.0** · Tema: Teknik · Prioritas: P2
Induk: [[roadmap/PRODUCT_ROADMAP|Roadmap produk]]

## Hasil yang diinginkan

Kode modular, uji otomatis untuk kalkulasi, aset lokal tanpa CDN, CSP ketat.

## Risiko dan asumsi

app.js satu file besar (sekitar 3.500 baris); refactor berisiko regresi.

## Tugas

- [ ] [[tasks/T-141-modularisasi-app-js-bertahap-es-modules|T-141]] Modularisasi app.js bertahap (ES modules) · todo · P2 · 8 hari
- [ ] [[tasks/T-142-uji-unit-untuk-kalkulasi-stok-dan-spk|T-142]] Uji unit untuk kalkulasi stok dan SPK · todo · P2 · 4 hari
- [ ] [[tasks/T-143-aset-lokal-tanpa-cdn-dan-csp-ketat|T-143]] Aset lokal tanpa CDN dan CSP ketat · doing · P2 · 2 hari
- [ ] [[tasks/T-144-keputusan-tetap-vanilla-js-atau-migrasi-framework|T-144]] Keputusan: tetap vanilla JS atau migrasi framework · todo · P2 · 1 hari
- [ ] [[tasks/T-208-pustaka-pdf-dan-excel-dari-aplikasi-sendiri|T-208]] Pustaka PDF dan Excel dilayani dari aplikasi sendiri (tanpa bergantung CDN) · review · P2 · 0.5 hari

> Properti status, progress, dan jumlah tugas serta daftar ini dibuat otomatis oleh `node scripts/progress-report.mjs`. Jangan ubah manual. Tampilan interaktif: [[PROGRESS_DASHBOARD]].
