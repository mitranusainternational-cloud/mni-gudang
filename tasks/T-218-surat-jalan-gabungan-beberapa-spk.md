---
type: task
id: T-218
title: "Surat jalan vendor dan customer gabungan beberapa SPK dalam satu armada"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 4
depends: [T-217]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-218 Surat jalan vendor dan customer gabungan beberapa SPK dalam satu armada

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-217

## Kriteria selesai

- [x] Satu pengiriman ke vendor dapat memuat item dari beberapa SPK (SPK customer dan SPK stok) dalam satu armada (pilihan SPK per blok, bukan per baris)
- [ ] Satu pengiriman ke customer dapat menggabungkan SPK stok dan SPK customer dalam satu armada (sebagian: beberapa SPK customer satu customer, termasuk yang mengambil sebagian dari stok barang jadi lewat T-216; SPK stok murni belum bisa dikirim ke customer dari form ini)
- [ ] Cetak surat jalan memuat struktur per SPK dengan subtotal (sebagian: judul per SPK dan total keseluruhan sudah ada; subtotal per SPK belum)
- [x] Bongkar Muat mengikuti struktur yang sama (ceklis per SPK) dan centangnya muncul di surat jalan
- [x] Status, sisa, dan progres tiap SPK tetap benar setelah pengiriman gabungan (uji neraca per SPK)

## Bukti

Tingkat bukti: `verified in browser` (mock lokal), bukan Supabase. Suite e2e `gabungan` GB-01..GB-08 (9 PASS) di `tests/e2e/gabungan.mjs`.

Rancangan (tanpa mengubah skema data): satu pengiriman gabungan = **beberapa dokumen vendor/kirim, satu per SPK, dengan no surat jalan yang sama**. Dengan begitu sisa, progres, status, dan stok tiap SPK tetap dihitung seperti biasa dan tidak perlu migrasi. "Kelompok" = dokumen aktif ber-no SJ sama (`sjGrup`), urut pembuatan.
- Form kirim ke vendor dan surat jalan customer: tombol **Tambah SPK lain di armada yang sama** (blok SPK dan item sendiri; kirim customer hanya menawarkan SPK customer yang sama).
- Cetak (Excel, PDF, pratinjau) dari dokumen SPK mana pun memuat seluruh kelompok: baris judul per SPK, nomor butir berlanjut, total keseluruhan, Ref SPK/PO digabung, ✓ ceklis, lampiran foto.
- Bongkar Muat: satu antrian untuk satu armada; butir dikelompokkan per SPK dan ceklis tersimpan menurut urutan butir kelompok.
- Membatalkan satu dokumen hanya membatalkan bagian SPK itu; antrian Bongkar Muat baru ikut batal bila tidak ada dokumen aktif lain dengan no SJ itu.
- Perbaikan terkait: ceklis yang tercetak di surat jalan keluar kini hanya dari catatan Loading (sebelumnya catatan Unloading penerimaan kembali bisa ikut).

Batas yang jujur: nomor butir ceklis mengikuti komposisi kelompok; bila satu bagian dibatalkan setelah ceklis diisi, nomor butir bisa bergeser. Belum ada subtotal per SPK. Belum diuji di Supabase.

## Catatan

Permintaan pemilik 2026-11-07. Saat ini satu dokumen vendor atau kirim terikat satu SPK (kolom spk_id); perlu perubahan model data secara hati-hati (draf migration, tanpa merusak data lama).
