---
type: task
id: T-228
title: "Kembalikan input SPK, laporan produksi, dan tab Berjalan ke versi sebelumnya (bawaan), fitur baru di balik bendera"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 0.5
depends: [T-226, T-227]
owner: "dev + pemilik"
updated: 2026-11-10
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-228 Kembalikan ke versi sebelumnya (bawaan)

Keputusan pemilik 2026-11-10 setelah melihat production: metode input SPK versi baru belum matang; laporan produksi kembali ke versi sebelumnya; tab Berjalan di SPK Berjalan disembunyikan dulu, Jadwal dipertahankan; selebihnya jangan mengacak sistem live.

## Kriteria selesai

- [x] Editor SPK bawaan = versi sebelumnya (kolom Description, Qty, Satuan, **Dari stok**, Berat). Layout per dimensi hanya aktif lewat setting `spkDimBaru` (Master Data › Opsi SPK) atau bendera uji
- [x] Menu Produksi bawaan = **Dashboard Produksi** versi sebelumnya; Kinerja & Analisa baru (Progres WC, Laporan Produksi baru) di balik setting `kinerjaBaru`
- [x] SPK Berjalan: tab Berjalan disembunyikan (setting `tabBerjalan`), tab **Jadwal** tetap
- [x] Uji PH-18 dan PH-19; suite lama menguji fitur penuh lewat bendera; lint 0 error
- [x] Pengguna & Akses: akses per modul tanpa Penawaran, peran Sales disembunyikan (PH-20)
- [x] Regresi penuh 33 suite: 740 PASS, 0 FAIL; lint 0 error
- [ ] Rilis ke production: DITUNDA atas permintaan pemilik (fokus pengembangan lokal)

## Catatan

Data tidak berubah: hanya tampilan yang dipilih. Fitur baru tetap ada dan dapat dinyalakan kembali lewat setting tanpa kode baru.
