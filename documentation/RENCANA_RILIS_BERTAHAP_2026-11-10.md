---
type: rencana
status: menunggu-persetujuan-tahap-1
updated: 2026-11-10
---

# Rencana rilis bertahap ke production (disusun 2026-11-10)

Cakupan: rilis **semua** fitur build lokal (`fitur/produksi-multi-wc`, 81 commit di depan live `ad73c89`), bertahap, tanpa mengubah data live. Keputusan pemilik 2026-11-10: "Rilis semua bertahap".

Aturan: setiap tahap butuh persetujuan eksplisit pemilik sebelum dijalankan; verifikasi tiap tahap; rollback siap; tidak ada data yang dihapus atau diubah.

## Tahap 0: pra-cek (selesai, hanya baca)

| Pemeriksaan | Hasil |
|---|---|
| Versi live | `origin/main` = `ad73c89`; build lokal 81 commit di depannya |
| Migration terpasang di production | 1 sampai 13. Tahap ini hanya membutuhkan 14 dan 18 (tambahan) |
| Kebutuhan skema kode baru | Hanya tabel baru `produksi_log` (14) dan `sp` (18); tabel lama tidak berubah kolomnya (`schema-columns.js` hanya menambah tabel) |
| Prasyarat | Fungsi `audit_row`, `can_view`, `can_mod`, `update_updated_at`, `table_stamps` ada; kebijakan `mutasi_*` dan `pr_*` bernama sama dengan draf; tabel `sp` dan `produksi_log` belum ada |
| Stok negatif | Tidak ada (migration 17 tidak ikut) |
| Baseline baris (2026-11-10, siang) | rm 24, fg 92, mutasi 21, spk 15, pr 0, kirim 8, vendor 9, bongkar 29, muser 10, log 201, audit_log 414 |
| Uji versi baru dengan salinan data live (lokal, dari backup) | `tests/e2e/uji-data-live.mjs`: 6 PASS (14 menu, 12 laci SPK, tanpa galat, isi baris tidak berubah) |
| Regresi penuh | 33 suite, 0 FAIL setelah perbaikan kontras Cek Data |

Catatan penting: data live **terus bertambah** (backup pagi: spk 13, kirim 7, vendor 5, bongkar 23, log 171). Backup baru wajib diambil tepat sebelum Tahap 1.

Tidak ikut rilis: migration 15, 16 (Penawaran dan Sales Order, menu disembunyikan), 17 (stok tidak negatif, belum diuji), 19 sampai 22 (draf ERP lanjutan), 23 (storage foto; aplikasi masih menyimpan foto di dokumen).

## Tahap 1: database (hanya menambah)

Prasyarat: backup baru (data JSON, sama seperti backup 2026-11-10), persetujuan pemilik.

1. Terapkan draf 14 (`produksi_log`, RLS, audit, `table_stamps`).
2. Terapkan draf 18 (`sp`, RLS, kebijakan `mutasi` dan `pr` diperluas untuk sparepart, peran `gbb` mendapat modul sparepart, `table_stamps`).
3. Verifikasi (harus sama dengan baseline, kecuali `audit_log` yang boleh naik):
   - jumlah baris tiap tabel di atas;
   - `produksi_log` dan `sp` ada, kosong, RLS aktif;
   - advisor Supabase: tidak ada peringatan keamanan baru.

Kode live yang sekarang berjalan tidak memakai kedua tabel itu, jadi tahap ini tidak mengubah perilaku live.

**Rollback tahap 1:**
```sql
DROP TABLE IF EXISTS public.produksi_log;
DROP TABLE IF EXISTS public.sp;  -- hanya bila masih kosong
-- kebijakan semula (hasil baca production 2026-11-10)
ALTER POLICY mutasi_read ON public.mutasi USING (public.can_view(CASE WHEN gudang = 'rm' THEN 'bahan-baku' ELSE 'barang-jadi' END));
ALTER POLICY mutasi_ins_v2 ON public.mutasi WITH CHECK (public.can_mod(CASE WHEN gudang = 'rm' THEN 'bahan-baku' ELSE 'barang-jadi' END));
ALTER POLICY mutasi_upd_v2 ON public.mutasi USING (public.can_mod(CASE WHEN gudang = 'rm' THEN 'bahan-baku' ELSE 'barang-jadi' END)) WITH CHECK (public.can_mod(CASE WHEN gudang = 'rm' THEN 'bahan-baku' ELSE 'barang-jadi' END));
ALTER POLICY pr_read ON public.pr USING (public.can_view('bahan-baku'));
ALTER POLICY pr_ins_v2 ON public.pr WITH CHECK (public.can_mod('bahan-baku'));
ALTER POLICY pr_upd_v2 ON public.pr USING (public.can_mod('bahan-baku')) WITH CHECK (public.can_mod('bahan-baku'));
DELETE FROM public.role_modules WHERE role = 'gbb' AND module = 'sparepart';
-- table_stamps kembali ke versi migration 12 (tanpa produksi_log dan sp)
```

## Tahap 2: kode ke GitHub dan CI

1. Push cabang `fitur/produksi-multi-wc` (tidak menyentuh `main`).
2. Buka PR ke `main`: CI dua pemeriksaan harus hijau; satu approval (pemilik admin boleh `--admin`).
3. Vercel membuat Preview (bukan production). Preview dibuka dan diperiksa: login, tiap menu, tanpa galat. Perhatian: Preview memakai Supabase production yang sama; **jangan menyimpan data uji** di Preview.

## Tahap 3: merge dan deploy production

1. Merge PR ke `main`; Vercel Production deploy.
2. Rollback kode: Vercel, Promote deploy sebelumnya (`ad73c89`), tanpa menyentuh database.

## Tahap 4: verifikasi production

- Login, tiap menu terbuka, jumlah baris sama dengan baseline (ditambah yang diinput tim sejak itu).
- Buka beberapa SPK live: laci dan lembar tampil benar.
- Satu catatan hasil produksi uji di SPK uji khusus (bukan SPK live) bila pemilik setuju.
- Catat bukti (`verified in browser` dan `verified in database`) di vault.

## Perubahan perilaku yang akan dirasakan tim (informasikan sebelum Tahap 3)

- Kirim ke customer dibatasi sebesar hasil produksi yang dicatat; SPK lama tanpa catatan produksi tertahan sampai dicatat atau memakai override dengan keterangan.
- Editor SPK baru (per dimensi, Kg estimasi dan real), menu SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa.
- Gudang Sparepart, dokumen bertema, surat jalan gabungan beberapa SPK dalam satu armada, Bongkar Muat dengan ceklis dan foto.
- Work Centre di Master Data: pastikan nama sesuai rute (Shearing, Punching, Bending, CNC Laser, Welding); tombol Tambahkan otomatis tersedia.
