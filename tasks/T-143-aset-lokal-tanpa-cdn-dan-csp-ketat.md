---
type: task
id: T-143
title: "Aset lokal tanpa CDN dan CSP ketat"
phase: P10
epic: E-13
release: v2.0
status: doing
priority: P2
env: main
effort_days: 2
depends: [T-065]
owner: "dev"
updated: 2026-11-07
---

# T-143 Aset lokal tanpa CDN dan CSP ketat

Epic: [[roadmap/epics/E-13-modernisasi-frontend-dan-pengujian|E-13]] · Rilis v2.0 · Fase P10 v2.0 Modernisasi dan perluasan
Bergantung pada: T-065

## Kriteria selesai

- [x] Pustaka ekspor (ExcelJS, jsPDF, AutoTable, html2canvas) dibundel di `public/vendor/` (selesai lewat [[T-208-pustaka-pdf-dan-excel-dari-aplikasi-sendiri|T-208]])
- [ ] Font dibundel (belum dicek: font tampilan dan dokumen)
- [ ] CSP diterapkan tanpa `unsafe-inline` dan tanpa domain CDN (skrip inline, 12 penangan inline, halaman cetak; temuan [[T-211-audit-kerangka-dan-standar-industri|T-211]])

## Bukti

- Belum ada.

## Catatan

- Tugas pasca go-live: lingkup dan prioritas ditinjau ulang setelah hypercare (T-065) dan temuan UAT.

> [!note] Audit 2026-11-06
> Sebagian: pustaka PDF dan Excel kini lokal ([[T-208-pustaka-pdf-dan-excel-dari-aplikasi-sendiri]]). Sisa: font dan aset lain, lalu CSP ketat tanpa domain CDN.
