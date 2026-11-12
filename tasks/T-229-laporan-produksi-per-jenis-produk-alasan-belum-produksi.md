---
type: task
id: T-229
title: "Laporan produksi per jenis produk (triwulan), alasan belum produksi, Ladder dan Duct tanpa lubang, posisi Berjalan satu langkah Produksi"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-226, T-227, T-228]
owner: "dev + pemilik"
updated: 2026-11-12
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-229 Laporan produksi per jenis produk dan alasan belum produksi

Permintaan pemilik 2026-11-12 (sesi lanjutan): Cable Ladder dan Cable Duct tanpa lubang, Berjalan dan KPI cukup satu langkah Produksi karena admin yang melapor, alasan item belum diproduksi dicatat admin dan terlihat di monitoring SPK, dan laporan produksi diperkuat: output per jenis produk (Cable Tray per type, Accs per bentuk, Other Support), qty, tonase aktual, finishing, lama dari SPK turun sampai laporan, dan bisa diunduh untuk laporan triwulan.

## Kriteria selesai

- [x] Cable Ladder dan Cable Duct tanpa pilihan Lubang (berat memakai kolom tanpa lubang); Cable Tray tetap Bawah/Full hole. Uji S-25
- [x] Berjalan: posisi item cukup **Produksi** (langkah vendor dan kirim tetap) selama laporan dipegang admin
- [x] **Alasan belum produksi**: pilihan di Update produksi per item (Menunggu plate, Mesin rusak, Mesin penuh, Menunggu gambar atau approval, Menunggu proses lain, Lainnya + keterangan); tersimpan di item dan di log produksi, tampil di monitoring SPK (langkah Produksi), kartu Berjalan, dan Cek Data. Uji PH-46
- [x] Laporan Produksi: periode **Triwulan ini** dan **Triwulan lalu**; susunan produk (kelompok › type › material, kelompok › bentuk › type, kelompok › tebal › material, kelompok › finishing › type, section › bentuk › type); tabel **Rincian per jenis produk** (kelompok, section, bentuk, type, tebal, material, finishing, qty, tonase aktual, tonase estimasi); tabel **Lama produksi per SPK**; unduh **Excel** (ringkasan kelompok, finishing, rincian, lama produksi) dan **CSV**. Uji PH-47, unit S-60..S-64
- [ ] Format kolom laporan triwulan Kemenperin belum dicocokkan dengan formulir resmi (menunggu contoh formulir dari pemilik)
- [ ] Diuji di Supabase (belum)

## Catatan keterbatasan

Admin melapor saat barang selesai, jadi lama produksi hanya dari SPK terbit ke laporan pertama dan ke selesai; rincian per langkah tidak ada sampai operator per Work Centre dipakai lagi. Tonase aktual = jumlah x berat real per pcs; item tanpa berat tercatat 0 kg (ada peringatan di Cek Data).

## Bukti

`verified in browser` (mock). Unit semua PASS (statistik 39), spkstruktur 31, produksihh 47, lint 0 error. Regresi penuh: lihat [[documentation/RENCANA_PERBAIKAN_LOKAL]].
