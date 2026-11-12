---
type: task
id: T-233
title: "Input langsung di modul memunculkan Master Data otomatis; uji ujung ke ujung di Playwright; perbaikan rework"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-230, T-231, T-232]
owner: "dev + pemilik"
updated: 2026-11-12
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-233 Input langsung di modul dan uji ujung ke ujung

Permintaan pemilik 2026-11-12: tombol SPK contoh uji dihapus; uji sebenarnya dari awal sampai laporan lewat Playwright yang bisa dipantau; pengguna tidak perlu mengisi Master Data lebih dulu, cukup input di modul dan data otomatis muncul di Master Data terkait.

## Perubahan

- Tombol dan kode **SPK contoh uji dihapus**.
- **Vendor dan supplier** yang diketik di modul (Kirim ke Vendor, Terima material, PR) otomatis didaftarkan ke Master Data pada simpan pertama, tanpa klik simpan kedua. Penulisan yang hanya beda awalan atau tanda baca dipakai sebagai nama terdaftar. Customer (SPK, Barang keluar), alamat customer, dan armada (nopol, jenis, driver) sudah otomatis. Uji PH-53.

## Uji ujung ke ujung (Playwright, pratinjau lokal, data bersih)

SPK 1003 (customer baru PT KARYA BAJA NUSANTARA diketik langsung di SPK; Cable Tray 2 item, Accs Elbow, Cover; berat otomatis dari kalkulator) → serah plate semua (PK, 52 lembar) → Update produksi admin dengan alasan belum produksi (Mesin penuh, Menunggu plate) → alasan hilang setelah produksi mulai, log tetap → kirim ke vendor (vendor baru diketik) dua SJ-V → terima kembali dengan 2 pcs reject (catatan wajib) → kirim ulang (rework) → surat jalan customer dua kali (alamat dan armada otomatis masuk Master Data) → berangkat dan diterima → SPK Selesai 118/118 → Laporan Produksi (rincian per jenis produk, tonase aktual 1,29 ton, lama produksi, alasan) dan Kinerja Tim (118 pcs) sama dengan Laporan.

## Bug ditemukan dan diperbaiki

- **Rework pengganti reject membuat SPK macet:** 2 pcs reject lalu 2 pcs dikirim ulang (rework) dan kembali, tetapi barang siap kirim tetap 38 dari 40 sehingga SPK tidak bisa selesai. Rework dihitung sebagai keluar tambahan padahal pengganti. Kini rework dikurangkan dari keluar sebanyak reject yang ada; selama masih di vendor yang siap tetap 38; rework barang yang sudah kembali tetap dihitung keluar. Uji PH-52.

## Catatan

- Mengetik proses vendor di form yang otomatis terisi dari Master Data bisa tergandakan hanya pada otomasi Playwright (nilai terisi lalu ditimpa teks); bukan masalah pengguna.
- Item bahan baku (plat) tetap dibuat di Gudang Bahan Baku › Item baru; SPK yang butuh plat tanpa item menampilkan peringatan "Tanpa item RM".

## Bukti

`verified in browser` (mock). produksihh 53 PASS (PH-52, PH-53). Regresi penuh dijalankan ulang (lihat catatan akhir di RENCANA_PERBAIKAN_LOKAL).
