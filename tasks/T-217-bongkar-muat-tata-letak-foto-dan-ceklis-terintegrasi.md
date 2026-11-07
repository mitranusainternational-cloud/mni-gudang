---
type: task
id: T-217
title: "Bongkar Muat: tata letak rapi, foto bukti, dan ceklis terintegrasi surat jalan"
phase: P9
epic: E-12
release: v1.2
status: todo
priority: P1
env: dev
effort_days: 4
depends: [T-152]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-217 Bongkar Muat: tata letak rapi, foto bukti, dan ceklis terintegrasi surat jalan

Epic: [[roadmap/epics/E-12-pelaporan-notifikasi-dan-dokumen|E-12]]
Fase: P9
Bergantung pada: T-152

## Kriteria selesai

- [ ] Tata letak antrian bongkar muat tetap rapi saat data banyak (pengelompokan, pencarian, penumpukan dibatasi, tampilan ringkas dan rinci)
- [ ] Ambil foto atau unggah foto bukti di proses bongkar muat, jumlah foto bebas per kendaraan
- [ ] Foto muncul sebagai lampiran di surat jalan vendor dan customer saat dicetak, jumlahnya dapat dipilih pengguna
- [ ] Ceklis barang tidak terpisah dari surat jalan: centang digital di Bongkar Muat langsung muncul di surat jalan vendor atau customer yang dicetak
- [ ] Penyimpanan foto aman (bucket privat, ukuran dibatasi) dan uji unggah di mock dan Supabase

## Bukti

(belum ada)

## Catatan

Permintaan pemilik 2026-11-07. Foto memerlukan penyimpanan file (Supabase Storage di production, penyimpanan lokal di mock) dan kebijakan akses; dirancang sebelum dibangun.
