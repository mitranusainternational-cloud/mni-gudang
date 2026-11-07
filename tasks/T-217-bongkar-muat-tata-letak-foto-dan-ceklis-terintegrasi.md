---
type: task
id: T-217
title: "Bongkar Muat: tata letak rapi, foto bukti, dan ceklis terintegrasi surat jalan"
phase: P9
epic: E-12
release: v1.2
status: review
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

- [x] Tata letak antrian bongkar muat tetap rapi saat data banyak (pengelompokan, pencarian, penumpukan dibatasi, tampilan ringkas dan rinci)
- [x] Ambil foto atau unggah foto bukti di proses bongkar muat, jumlah foto bebas per kendaraan
- [x] Foto muncul sebagai lampiran di surat jalan vendor dan customer saat dicetak, jumlahnya dapat dipilih pengguna
- [x] Ceklis barang tidak terpisah dari surat jalan: centang digital di Bongkar Muat langsung muncul di surat jalan vendor atau customer yang dicetak
- [ ] Penyimpanan foto aman (bucket privat, ukuran dibatasi) dan uji unggah di mock dan Supabase (mock selesai; bucket privat baru berupa draf migration 23, belum diterapkan dan belum diuji di Supabase)

## Bukti

Tingkat bukti: `verified in browser` (mock lokal), bukan Supabase.

- Ceklis digital disimpan di catatan bongkar muat (`ceklis`, per butir, dengan waktu dan pengguna), tidak lagi hilang saat drawer ditutup; tombol Centang semua; konfirmasi bila Selesai dengan ceklis belum lengkap.
- Foto bukti: ambil dari kamera atau unggah banyak berkas; dikompres di peramban (sisi terpanjang 1280 px, JPEG), keterangan per foto, pilihan "Sertakan di surat jalan" per foto, hapus; maksimal 24 foto per kendaraan.
- Surat jalan vendor dan customer (pratinjau, PDF, Excel): kolom Cek (✓) muncul bila ada catatan bongkar muat yang terhubung, foto terpilih menjadi lampiran (halaman terakhir PDF, lembar "Lampiran Foto" di Excel). Surat jalan tanpa catatan bongkar muat tidak berubah.
- Antrian: kartu ringkas dengan lencana Cek n/m dan jumlah foto, pencarian (plat, pihak, SJ, driver), kolom Selesai menampilkan 8 terbaru dengan "Tampilkan semua", kolom bergulir sendiri.
- Uji: suite e2e baru `bongkarmuat` BM-01..BM-14 (15 PASS) di `tests/e2e/bongkar-muat.mjs`; regresi penuh dan lint tercatat di PROJECT_PROGRESS.
- Draf `supabase/draft/20240101000023_bongkar_foto_storage.sql` (bucket privat `bongkar-foto` dan kebijakan). Belum diterapkan dan belum diuji; PGlite tidak punya skema storage.

## Catatan

Permintaan pemilik 2026-11-07. Sisa: sambungkan foto ke Supabase Storage (FOTO.mode = storage, URL bertanda tangan) dan uji di dev; sampai itu foto disimpan inline di kolom data dokumen bongkar, yang berat bila banyak foto. Catatan awal: foto memerlukan penyimpanan file (Supabase Storage di production, penyimpanan lokal di mock) dan kebijakan akses; dirancang sebelum dibangun.
