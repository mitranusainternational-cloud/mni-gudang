---
type: task
id: T-175
title: "Impor stok barang jadi dari Stock Barang 2026 ke production (data saja)"
phase: P2
epic: E-02
release: v0.9
status: done
priority: P1
env: production
effort_days: 0.5
depends: []
owner: "dev + pemilik"
updated: 2026-11-04
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-175 Impor stok barang jadi dari Stock Barang 2026 ke production (data saja)

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2

## Kriteria selesai

- [x] Hanya data: tabel `fg` di Supabase production (`lggqigmvtefkquqjrjsb`); tidak ada perubahan skema, kode, GitHub, atau Vercel
- [x] Sumber: sheet **Straight** (stok berjalan, sudah memuat transaksi Sep dan Okt); sheet transaksi tidak diimpor agar tidak terhitung dua kali
- [x] 92 item, total 1.382 batang, cocok dengan file per kategori (Cable Tray 673, Ladder 152, Duct 7, Cover 372, Cage 178) `verified in database`
- [x] Rumus di kolom Qty dihitung dulu (mis. 50-21-29 menjadi 0); 6 item bernilai 0
- [x] Cut-off `tgl_stok_awal` = 2026-10-17 (tanggal transaksi terakhir di file); perlu dikonfirmasi pemilik
- [x] Cable Cage: tebal `D5` disimpan sebagai tebal 5 dengan keterangan "Diameter kawat 5 mm (D5)" karena kolom `tebal` numerik
- [x] Semua baris bertanda `created_by = import-stok-2026-11-04` (mudah dicabut bila perlu); audit trigger mencatat 92 baris

## Bukti

- `verified in database` (2026-11-04, kriteria di atas) dan pra-cek baca-saja 2026-11-06: tabel `fg` production berisi 92 baris (lihat [[HANDOFF]]).
- Penandaan `created_by = import-stok-2026-11-04` memungkinkan pencabutan terukur; jejak audit mencatat 92 baris.

## Catatan

- Workbook sumber tidak disalin ke repo (aturan data privat).
- Koreksi bila cut-off atau angka berbeda: lewat Opname atau ubah item, bukan impor ulang.
- Pekerjaan produksi multi work center (T-174) ditahan dan tetap di branch lokal `fitur/produksi-multi-wc`.
- Stok bahan baku lama (3 item `rm`, 7 mutasi, 1 opname; semuanya data uji) akan dikosongkan; penghapusan permanen dilakukan pemilik sendiri (SQL disiapkan di percakapan).
