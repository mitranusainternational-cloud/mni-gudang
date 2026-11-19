---
type: task
id: T-235
title: "Foto Bongkar Muat dan Maintenance ke Supabase Storage (opsional, bawaan tetap di database)"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-234]
owner: "dev + pemilik"
updated: 2026-11-19
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-235 Foto ke Storage

Latar: foto bukti disimpan sebagai data URL di dalam dokumen `bongkar` dan `mtc`, sehingga Bongkar Muat memuat sekitar 6,9 MB tiap pemuatan penuh dan terasa lambat (3 sampai 7 detik). Foto dipindah ke bucket privat `bongkar-foto`; dokumen hanya menyimpan `path`.

## Kriteria selesai

- [x] Objek `FOTO` mendukung dua mode berdampingan: `inline` (bawaan, tidak berubah) dan `storage` (aktif hanya bila `master/setting.fotoStorage=true` dan backend menyediakan `DB.storage`)
- [x] Tampilan, daftar cetak, PDF dan Excel menangani foto campuran (data URL dan path); ekspor mengunduh foto Storage ke salinan tanpa mengubah dokumen
- [x] Galat unggah dilempar ke pengguna; dokumen tidak disentuh dan tidak ada jatuh diam-diam ke database
- [x] Panel super admin **Penyimpanan foto** (di Pengguna & Akses): hitung foto, **Pindahkan foto lama** (foto di dokumen dihapus hanya setelah berkas di Storage terbukti terbaca), aktifkan atau matikan mode (diuji unggah-unduh dahulu)
- [x] Adapter `DB.storage` (upload, signedUrls) dan Storage tiruan di mock
- [x] Draf migration `20240101000027_foto_storage_policy.sql` (+ rollback): kebijakan per awalan `bongkar/` dan `mtc/`; **belum diterapkan**
- [x] Kekokohan kecil: tombol Mulai pada kartu Bongkar Muat tidak jatuh bila `jenis` kosong
- [ ] Draf 27 diterapkan ke Supabase `mni-wms` lalu diuji dengan unggah dan unduh nyata (butuh persetujuan; tambah saja)
- [ ] Migrasi foto lama di `mni-wms` lewat panel setelah Unduh cadangan, lalu ukur waktu muat Bongkar Muat
- [ ] Keputusan pemilik: aktifkan di live (Vercel) atau tetap inline

## Bukti

`verified in browser` (mock, Storage tiruan di memori). e2e `fotostorage` 10 PASS (FS-01..FS-09, FS-99), unit 249 PASS, lint 0 error (batas 43 peringatan). Belum ada bukti Supabase Storage nyata; mock bukan bukti Supabase. Bawaan tetap `inline`, jadi merge tidak mengubah perilaku live sampai super admin mengaktifkannya.
