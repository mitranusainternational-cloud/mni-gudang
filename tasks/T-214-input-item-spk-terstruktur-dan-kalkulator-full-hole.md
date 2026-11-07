---
type: task
id: T-214
title: "Input item SPK terstruktur (bentuk, ukuran, berat otomatis) dan kalkulator full hole"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 2
depends: [T-173, T-213]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-214 Input item SPK terstruktur dan kalkulator full hole

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-173, T-213
Rancangan: [[INPUT_SPK_TERSTRUKTUR]], [[KALKULATOR_BERAT]]

Permintaan pemilik: input SPK memakai bentuk dan ukuran (W H L, aksesori W H R) dengan nama item, type, tebal, finishing, berat, dan tonase otomatis; kalkulator terbaru memuat full hole.

## Kriteria selesai

- [x] Katalog dibangun dari `kalkulator penghitung berat MNI include full hole.xlsx`: 192 bentuk sama, rumus tidak berubah selain format; kolom baru Total Full Hole (Bawah+Samping) pada Straight STU dan STC; uji unit berat 6 dan parser 24 tetap lulus
- [x] Modul murni `berat/bentuk.js`: bentuk per produk, dimensi per bentuk, nama item otomatis, berat dengan pilihan full hole; unit 11 lulus dengan katalog sintetis
- [x] Editor SPK: kolom Bentuk dan nama item, Spesifikasi otomatis, Ukuran (mm) dinamis, berat per pcs, berat per item, dan tonase otomatis; Teks bebas tetap tersedia; section berubah menghitung ulang; berat manual tidak ditimpa
- [x] Penyimpanan: item membawa bentuk, ukuran, dan lubang; baris tidak lengkap menolak simpan dengan pesan; baris kosong dilewati; membuka SPK untuk diubah memulihkan keadaan terstruktur; lembar SPK menampilkan nama dan berat
- [x] E2E `spk-terstruktur.mjs` 20 lulus (S-19: Perforated Cable Tray otomatis Full hole, pilihan manual dipertahankan); regresi penuh 0 FAIL
- [x] Keputusan pemilik 2026-11-07: Perforated Cable Tray otomatis Full hole
- [x] Tahap 2: tab Master Data Rute produksi (per produk dan rute khusus bentuk), aturan vendor menurut material, pilihan vendor per baris dan peringatan baja tanpa finishing; unit R-90..R-95 dan E2E S-20..S-23 lulus (mock; asumsi di [[INPUT_SPK_TERSTRUKTUR]] bagian 4a menunggu koreksi pemilik)
- [ ] Unggah ulang katalog berat dari workbook baru di production (Master Data, Katalog berat; tindakan super admin) agar full hole muncul
- [ ] Keputusan pemilik yang masih terbuka: full hole bentuk lain dan tahap routing (lihat [[INPUT_SPK_TERSTRUKTUR]] bagian 4)

## Bukti

- `verified in browser` (mock, Playwright) dengan katalog sintetis dan, untuk pemeriksaan visual, katalog asli lokal: Straight STU W100 H50 L3000 t1,2 SPHC = 5,377 kg (lubang bawah) dan 5,100 kg (full hole).
- Unit: bentuk 11, berat 6, parser 24. E2E: spk-terstruktur 18.
- Bukan bukti production: katalog di database production belum diganti.

## Catatan

Routing per produk dan bentuk, aturan vendor per material, dan pengecualian per item dikerjakan sebagai lanjutan, memakai kriteria terbuka [[T-174-produksi-multi-work-center-rute-antrian-kapasitas|T-174]] (bukan tugas baru, agar tidak ganda).
