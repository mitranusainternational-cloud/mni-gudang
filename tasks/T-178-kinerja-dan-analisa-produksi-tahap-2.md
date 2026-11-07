---
type: task
id: T-178
title: "Kinerja & Analisa produksi (Tahap 2): per work center, produk, vendor, dan pengiriman"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 3
depends: [T-177]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-178 Kinerja & Analisa produksi (Tahap 2)

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-177
Kebutuhan: [[PRD_PRODUKSI]]

## Kriteria selesai

- [x] Tab **Work Center**: output per hari, kapasitas, utilisasi, reject, menit per pcs, tonase, dan tren harian; periode 7, 14, 30, 90 hari; beban antrian tetap di bawahnya
- [x] Tab **Produk**: lama proses per jenis produk dari SPK terbit sampai terkirim, dipecah tunggu mulai, produksi, tunggu kirim vendor, di vendor, ke customer, dengan bilah komposisi waktu
- [x] Tab **Vendor**: barang keluar, masuk, dan sisa per vendor dan proses; rata-rata, tercepat, dan terlama (hari kerja); reject; daftar surat jalan yang masih di vendor; kualifikasi yang sudah ada tetap di bawahnya
- [x] Tab **Pengiriman**: lama tunggu dan proses loading dan unloading per jenis muatan dan per pihak. Hasil cek: antrian Bongkar Muat sudah menyimpan jam masuk, mulai, dan selesai, jadi **tidak perlu isian baru**
- [x] Uji unit analisa 21 lulus; e2e produksi 74, regresi 42, role 12, akses 34, tampilan 71 (mock, `verified in browser`, bukan bukti Supabase); PRD dan dokumen diperbarui
- [ ] Ditinjau pemilik di pratinjau lokal

## Bukti

- `verified in browser` (mock, Playwright) dan unit: unit analisa 21 lulus; regresi 42, role 12, akses 34 dan produksi 134 lulus pada regresi penuh 2026-11-07.
- Bukan bukti Supabase (migration 14 belum diterapkan).

## Catatan

Dikerjakan lokal. Penayangan (migration 14, push, PR ke `main`) hanya setelah persetujuan eksplisit pemilik.
