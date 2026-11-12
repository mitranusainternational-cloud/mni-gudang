---
type: design
status: review
updated: 2026-11-12
---

# Skema Modul Maintenance

Permintaan pemilik 2026-11-12: modul Maintenance yang tersambung ke Gudang Sparepart, untuk melacak mesin apa yang sudah dimaintenance, mesin yang perlu maintenance rutin, mesin yang sering bermasalah, dan sparepart apa yang sudah diganti, dengan akumulasi hari, minggu, bulan, triwulan, tahun, dan selamanya.

## Prinsip

- Satu tabel baru `mtc` dengan dua jenis dokumen (`kind`): **catat** (satu kejadian maintenance) dan **rutin** (jadwal rutin per mesin). Tanpa tabel stok baru: sparepart yang diganti memakai pergerakan stok Gudang Sparepart yang sudah ada (`mutasi`, gudang `sp`, jenis keluar, `tujuan = mesin`), jadi stok sparepart, Pemakaian mesin, dan riwayat mutasi otomatis ikut.
- Daftar mesin berasal dari Master Data › Work Centre › Mesin (tidak ada daftar mesin kedua). Mesin yang belum ada di master boleh diketik langsung di form (aturan "input di modul"); tersimpan di catatan dan tampil di ranking.
- Angka turunan (akumulasi, MTBF, jatuh tempo) dihitung dari catatan, tidak disimpan.
- Hak akses: modul baru `maintenance` (lihat atau ubah). Bawaan: admin semua; peran baru **Maintenance** mengubah modul Maintenance dan Sparepart (butuh sparepart untuk mencatat penggantian); Produksi, Gudang, PPIC, Logistik, dan Viewer hanya melihat. Pengguna tanpa hak mengubah Sparepart tetap bisa mencatat maintenance, tanpa baris sparepart.

## Dokumen `catat`

| Bidang | Arti |
|---|---|
| `no` | nomor `MTC/tahun/bulan/urut` |
| `tgl` | tanggal kejadian |
| `mesin`, `wc` | nama mesin (dari master atau diketik) dan Work Centre-nya |
| `jenis` | **Preventif** (perawatan terjadwal), **Korektif** (perbaikan kerusakan), **Inspeksi**, **Kalibrasi** |
| `status` | **Selesai**, **Dikerjakan**, **Menunggu sparepart** |
| `masalah`, `tindakan` | keluhan atau tugas, dan yang dikerjakan |
| `teknisi` | pelaksana |
| `mulai`, `selesai`, `downtime` | jam mulai dan selesai; lama henti mesin (menit), diisi langsung atau dihitung dari jam |
| `biaya` | biaya perbaikan di luar sparepart gudang (opsional) |
| `parts[]` | sparepart terpakai: `{sp (id item), nama, q, mut (id mutasi)}`; tiap baris membuat mutasi keluar di Gudang Sparepart |
| `rutin` | id jadwal rutin yang dikerjakan (bila dari jadwal) |
| `foto[]` | foto dokumentasi: `{id, data (JPEG terkompres), w, h, at, by, tahap (Sebelum, Sesudah, Bukti / nota, Lainnya), ket}`; maksimal 8 per catatan; ditambah saat mencatat, saat menyelesaikan, atau kapan saja dari tombol Foto di Catatan |

## Dokumen `rutin`

`mesin`, `wc`, `tugas` (mis. "Ganti oli hidrolik"), `interval` (hari), `mulai` (tanggal pertama jatuh tempo), `aktif`.
Jatuh tempo = catatan Selesai terakhir untuk jadwal itu + interval (atau `mulai` bila belum pernah). Status: **Terlambat** (lewat), **Segera** (7 hari), **Aman**.

## Tautan ke Gudang Sparepart

1. Form Catat maintenance memilih sparepart dan qty dari daftar Gudang Sparepart (stok terlihat, tidak boleh melebihi stok).
2. Saat disimpan, tiap baris membuat mutasi: `gudang sp`, `jenis keluar`, `tujuan mesin`, `mesin`, `ref MTC/...`, `pihak` mesin.
3. Stok sparepart berkurang, tab Pemakaian mesin dan Riwayat mutasi di Gudang Sparepart langsung menampilkan pemakaian itu, dan rencana pembelian ikut menghitungnya.
4. Membatalkan catatan membuat mutasi koreksi (mutasi tidak dihapus permanen, aturan migration 13) dan mengembalikan stok.

## Foto dan dokumen

- Setiap catatan bisa diberi foto **sebelum**, **sesudah**, dan **bukti atau nota** penggantian sparepart, lengkap dengan waktu dan pengunggah; keterangan dan tahap bisa diedit, foto bisa dihapus (hanya yang berhak mengubah).
- Tombol **Foto** di tiap catatan membuka galeri dan unduhan **dokumen PDF atau Excel per catatan** (uraian, sparepart diganti, dan lampiran foto), memakai mesin dokumen yang sama dengan lampiran foto Bongkar Muat.
- Foto disimpan di catatan (JSONB `data.foto`, mode inline seperti Bongkar Muat); untuk Supabase, penyimpanan ke bucket privat mengikuti draf migration 23 saat bucket dipasang.
- Keabsahan data: KPI **Berdokumentasi foto**, kolom Foto di laporan Excel dan PDF, dan Cek Data **maintenance selesai tanpa foto dokumentasi**.

## Laporan dan akumulasi

- **Ringkasan** per periode (Hari ini, Minggu ini, Bulan ini, Triwulan ini, Triwulan lalu, Tahun ini, Semua): jumlah maintenance, preventif dan korektif, mesin terlibat, downtime (jam), sparepart diganti (qty dan jenis), biaya, dan yang belum selesai; tren per hari, minggu, atau bulan.
- **Per mesin**: frekuensi, korektif, preventif, downtime, sparepart diganti, terakhir dimaintenance, **MTBF** (rata-rata hari antar kerusakan), ranking "paling sering maintenance".
- **Riwayat mesin**: lini waktu satu mesin dengan sparepart yang diganti.
- **Jadwal rutin**: daftar jatuh tempo dan keterlambatan.
- Cek Data: jadwal rutin terlambat, mesin korektif 3 kali atau lebih dalam 30 hari, maintenance menunggu sparepart lebih dari 3 hari.
- Unduh PDF dan Excel.

## Database

Draf `apps/platform/supabase/draft/20240101000024_maintenance.sql`: tabel `mtc` (kolom `kind`, `no`, `tgl`, `mesin`, `wc`, `jenis`, `status`, `downtime`, `teknisi`, `data` jsonb), RLS mengikuti modul `maintenance`, pemicu audit dan stempel. **Belum diterapkan** ke Supabase mana pun (butuh persetujuan pemilik). Tabel dibaca kosong bila belum ada (`OPSIONAL`).
