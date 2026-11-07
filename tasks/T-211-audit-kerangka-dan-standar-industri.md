---
type: task
id: T-211
title: "Audit kerangka dan standar industri: keamanan, aksesibilitas, kode, data, bug"
phase: P2
epic: E-03
release: v1.0
status: review
priority: P1
env: dev
effort_days: 1.5
depends: [T-210]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-211 Audit kerangka dan standar industri

Epic: [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data|E-03]]
Fase: P2
Bergantung pada: T-210

## Kriteria selesai

- [x] Kerangka diperiksa: Vite 5.4.21, supabase-js 2.118 (dokumentasi diperiksa lewat Context7), `npm audit --omit=dev` 0 kerentanan, 4 temuan hanya di alat pengembangan
- [x] Uji XSS permanen (`keamanan.mjs`, 8 uji): payload di 53 bidang teks, semua menu, laci, lembar, kartu, dokumen: tidak ada eksekusi
- [x] Aksesibilitas WCAG 2 A dan AA dengan axe-core (`aksesibilitas.mjs`, 3 uji): 5 kelas pelanggaran dibenahi; 16 menu x 2 tema dan 11 form, laci, kartu x 2 tema: 0 pelanggaran
- [x] ESLint kebenaran (`npm run lint`, 0 galat, 43 peringatan kode mati) dan uji unit (`npm run test:unit`) masuk CI
- [x] Invarian data hulu ke hilir (`invarian.mjs`, 10 invarian) dipasang di akhir suite sparepart dan fitur
- [x] Bug diperbaiki dengan uji: pembaca angka berpemisah ribuan (F-16), koreksi barang masuk SPK stok tidak mengurangi progres (F-17)
- [x] Kesenjangan terhadap standar sistem gudang dan logistik dan rencana pemenuhan di [[STANDAR_INDUSTRI]]
- [x] Sisa CSP tanpa `unsafe-inline` dipindah ke [[T-143-aset-lokal-tanpa-cdn-dan-csp-ketat|T-143]] (satu pemilik kriteria)
- [x] Nama default penanda tangan SPK dipindah dari kode ke pengaturan dilacak di [[T-201-nama-penanda-tangan-dokumen|T-201]] (keputusan pemilik; satu pemilik kriteria)
- [x] Pembersihan variabel kode mati (42 peringatan lint) dan modularisasi `app.js` dipindah ke [[T-141-modularisasi-app-js-bertahap-es-modules|T-141]] (satu pemilik kriteria)
- [x] Pemantauan galat produksi dan pemeriksaan kesehatan dipindah ke [[T-073-monitoring-dan-dukungan|T-073]] (satu pemilik kriteria)

## Bukti

- Verified in browser (mock, Playwright dan axe-core): suite keamanan 8, aksesibilitas 3, fitur 16, sparepart 36 lulus; regresi penuh 0 FAIL. Lint: 0 galat.
- Commit/branch: `fitur/produksi-multi-wc`.

## Catatan

- Perubahan perilaku UI: warna status tema terang lebih gelap, aksen tema gelap lebih terang, label dan nama aksesibel otomatis; tidak ada perubahan alur.
- Minifikasi `app.js` dicoba dan dibuang: hemat hanya 9 persen karena sumber sudah padat.
