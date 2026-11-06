---
type: task
id: T-208
title: "Pustaka PDF dan Excel dilayani dari aplikasi sendiri (tanpa bergantung CDN)"
phase: P2
epic: E-13
release: v2.0
status: review
priority: P2
env: dev
effort_days: 0.5
depends: []
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-208 Pustaka PDF dan Excel dilayani dari aplikasi sendiri (tanpa bergantung CDN)

Epic: [[roadmap/epics/E-13-modernisasi-frontend-dan-pengujian|E-13]]
Fase: P2
Bergantung pada: -

## Kriteria selesai

- [x] ExcelJS 4.4.0, jsPDF 2.5.1, jsPDF-AutoTable 3.8.2, html2canvas 1.4.1 disimpan di `apps/platform/public/vendor/` (identik byte demi byte dengan CDN; versi, lisensi, hash di `README.md`)
- [x] Pemuat mencoba `/vendor/` lebih dulu, CDN sebagai cadangan (CSP production hanya mengizinkan cdnjs)
- [x] Unduhan Excel dan PDF berhasil memakai berkas lokal
- [ ] CSP ketat tanpa domain CDN (lanjutan di T-143)

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd). Verified in browser (mock): unduhan Excel memuat `/vendor/exceljs.min.js`.

## Catatan

- Sebagian dari T-143 (aset lokal tanpa CDN). Ukuran berkas vendor bertambah di repo; lisensi dicatat.
