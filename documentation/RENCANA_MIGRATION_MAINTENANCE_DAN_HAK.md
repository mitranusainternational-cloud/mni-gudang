---
type: plan
status: review
updated: 2026-11-12
---

# Rencana migration: Maintenance (24) dan hak modul ketat (25)

**Status: disiapkan, BELUM diterapkan ke Supabase mana pun.** Persetujuan pemilik 2026-11-12 ("siapkan migration, saya setuju") dibaca sebagai persetujuan menyiapkan; penerapan ke production menunggu perintah terpisah dengan cakupan yang disebut (lihat bagian Keputusan).

## Isi

| Berkas (`apps/platform/supabase/draft/`) | Fungsi | Pembatalan |
|---|---|---|
| `20240101000024_maintenance.sql` | tabel `mtc` (catat dan rutin) dengan RLS modul `maintenance`, pemicu audit dan stempel, `table_stamps()` ditambah `mtc`, hak peran baru (maintenance, gudang, logistik memegang vendor) | `..._maintenance_rollback.sql` (menghapus tabel `mtc` beserta isinya) |
| `20240101000025_hak_modul_ketat.sql` | kolom `role_modules.level`, paket peran lengkap (ubah dan lihat), pengaman terhadap pengguna yang akan kehilangan akses, `mod_level()` dan `can_any()` ketat | `..._hak_modul_ketat_rollback.sql` |

Semuanya hanya menambah atau mengganti fungsi (CREATE OR REPLACE); tidak ada DROP data. Aman diputar ulang.

## Temuan saat menyiapkan

- **`can_any()` harus ikut diganti** di migration 25. Fungsi ini menganggap "ada baris `role_modules` untuk peran ini" berarti boleh mencatat. Setelah paket peran memuat baris hak *lihat* (viewer, sales), tanpa perubahan itu Viewer bisa mencatat ke koleksi yang memakai hak "salah satu modul" (mis. master). Sudah diperbaiki: hanya baris `level = 'ubah'` yang dihitung.
- Definisi `mod_level()` dan `table_stamps()` di production diperiksa (hanya baca, 2026-11-12): sama dengan migration 11 dan daftar tabel hingga `sp`; migration 24 menambah `mtc` pada daftar itu.
- Pemeriksaan jumlah pengguna tanpa peta modul di production **tidak dapat saya jalankan** (akses baca tabel `muser` ditolak oleh penjaga izin). Pemeriksaan itu sudah ada sebagai pengaman otomatis di migration 25 (berhenti dengan pesan bila ada yang akan kehilangan akses); pemilik juga dapat menjalankan query di bawah.

## Pemeriksaan sebelum menerapkan (baca saja)

```sql
-- pengguna aktif non-admin tanpa peta modul: setelah migration 25 mereka ikut paket peran (bukan lagi "lihat semua")
SELECT email, role FROM public.muser
WHERE aktif AND role <> 'admin' AND jsonb_typeof(data -> 'modul') IS DISTINCT FROM 'object' ORDER BY role, email;
-- bentuk role_modules saat ini (harus: role, module)
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'role_modules';
-- tabel mtc belum ada
SELECT to_regclass('public.mtc');
```

Untuk tiap pengguna di daftar pertama, bandingkan hasilnya dengan yang seharusnya dilihat. Bila perlu isi peta modulnya lebih dulu lewat Pengguna & Akses (tombol Atur) supaya tidak berubah mendadak.

## Langkah penerapan (bertahap, tiap tahap diverifikasi)

1. **Cadangan** data (Pengguna & Akses › Unduh cadangan, atau cadangan Supabase) dan catat versi migration terakhir.
2. **Uji di cabang** (disarankan): cabang Supabase dari production (berbiaya; konfirmasi biaya dulu) atau salinan, jalankan 24 lalu 25, lalu login sebagai tiap peran.
3. **Terapkan 24** (Maintenance). Verifikasi: `SELECT to_regclass('public.mtc')` ada; `SELECT table_stamps() ? 'mtc'` benar; aplikasi lama tetap jalan (tabel `mtc` opsional di aplikasi).
4. **Terapkan 25** (hak ketat). Verifikasi: tiap peran login dan menu sesuai tabel di Pengguna & Akses; `SELECT public.mod_level('bahan-baku')` per peran sesuai; Viewer tidak dapat menyimpan apa pun.
5. **Rilis kode aplikasi** (butuh PR ke `main` dengan persetujuan terpisah): kode lokal sudah ketat dan memuat modul Maintenance; tanpa migration 24 modul Maintenance tidak dapat menyimpan.
6. **Uji akhir** dengan login nyata: Maintenance (catat dengan sparepart dan foto), Gudang, Logistik, Produksi, Viewer.

Urutan penting: **24 sebelum 25**, dan migration sebelum rilis kode yang menulis ke `mtc`.

## Verifikasi hak per peran sesudah migration 25

| Peran | Ubah | Lihat |
|---|---|---|
| ppic | spk, vendor | bahan-baku, barang-jadi, pengiriman, bongkar-muat, maintenance |
| gudang | bahan-baku, barang-jadi, sparepart | spk, bongkar-muat, vendor, pengiriman, maintenance |
| gbb | bahan-baku, bongkar-muat, sparepart | spk, maintenance |
| gbj | barang-jadi, vendor, pengiriman, bongkar-muat | spk, maintenance |
| logistik | bongkar-muat, vendor, pengiriman | spk, bahan-baku, barang-jadi, maintenance |
| produksi | spk | vendor, maintenance |
| maintenance | maintenance, sparepart | spk |
| sales | - | spk |
| viewer | - | bahan-baku, barang-jadi, sparepart, vendor, pengiriman, spk, bongkar-muat, maintenance |
| admin | semua | semua |

Sama dengan `ROLES` di aplikasi dan pengguna contoh di pratinjau lokal (diuji MG-02, MG-03).

## Keputusan yang dibutuhkan dari pemilik

1. Terapkan **24 saja**, atau **24 lalu 25**, ke project **MNI Gudang - Production** (`lggqigmvtefkquqjrjsb`)? Dev lama sudah dipensiunkan, jadi tidak ada lingkungan uji kecuali cabang berbiaya.
2. Mau diuji dulu di cabang Supabase (berbiaya) atau langsung ke production dengan cadangan dan pembatalan siap?
3. Izin saya membaca daftar pengguna aktif tanpa peta modul (email dan peran saja) untuk pemeriksaan di atas, atau pemilik menjalankannya sendiri.
