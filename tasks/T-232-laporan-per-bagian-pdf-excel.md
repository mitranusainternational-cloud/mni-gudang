---
type: task
id: T-232
title: "Laporan per bagian: unduh PDF dan Excel dengan ringkasan dan tabel rinci untuk analisa dan bottleneck"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-229, T-230, T-231]
owner: "dev + pemilik"
updated: 2026-11-12
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-232 Laporan per bagian (PDF dan Excel)

Permintaan pemilik 2026-11-12: di menu Laporan, tiap bagian (Produksi, Pengiriman, Bahan baku, Barang jadi, Vendor, Sparepart, Kesehatan data) dapat diunduh sendiri ke PDF atau Excel, tersegmen, rapi, dan rinci supaya mudah menganalisa data dan bottleneck.

## Isi unduhan per bagian

- **Produksi:** ringkasan, SPK aktif dan posisinya (progres, terlambat, tonase, alasan belum produksi), item belum mulai produksi (umur dan alasan), hasil per jenis produk (tonase aktual dan estimasi), lama produksi per SPK
- **Pengiriman:** surat jalan customer periode ini, ringkasan per customer, barang menunggu kirim, SPK terlambat
- **Bahan baku:** plat masuk, plat keluar per SPK, stok per item (cakupan hari, saran beli), susut per SPK, PR terbuka dan draf
- **Barang jadi:** stok, siap masuk stok (SPK stok), mutasi periode ini
- **Vendor:** SJ masih di vendor (umur, sisa), ringkasan per vendor, siap dikirim ke vendor, SJ periode ini
- **Sparepart:** pemakaian per item, di bawah minimum (saran beli), stok semua sparepart
- **Kesehatan data:** semua temuan dengan tingkat, kategori, keterangan

Tabel tanpa data tetap ada dengan keterangan "Tidak ada data", supaya tidak terkesan hilang. Periode mengikuti pilihan di atas halaman; angka "saat ini" memakai kondisi sekarang.

## Bukti

`verified in browser` (mock, katalog dan SPK contoh uji). PH-51: 14 tombol, tujuh bagian menghasilkan Excel dan PDF, tiap baris sesuai jumlah kolom. Regresi, fitur, akses, produksihh PASS. Belum diuji di Supabase; format pencetakan PDF belum dibandingkan dengan dokumen resmi.
