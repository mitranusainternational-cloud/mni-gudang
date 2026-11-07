---
type: design
status: active
updated: 2026-11-07
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Cetak biru database ERP (empat alur integrasi)

Permintaan pemilik 2026-11-07: merapikan versi lokal menjadi sistem terintegrasi (peruntukan SPK, stok bahan baku otomatis, pipeline vendor, dashboard agregat) lalu menayangkannya tanpa merusak data production. Dikerjakan **berurutan, satu langkah per persetujuan**. Semua DDL tinggal di `apps/platform/supabase/draft/` dan **tidak diterapkan ke database mana pun** sebelum pemilik menyetujui ([[INTEGRATION_PATH]], [[documentation/DECISIONS|DECISIONS]]).

## 1. Kenyataan sistem yang menentukan rancangan

| Asumsi di permintaan | Kenyataan (dicek di kode dan migration) | Akibat pada rancangan |
|---|---|---|
| Next.js | Aplikasi aktif JavaScript biasa (`apps/gudang-logistik`) lewat Vite, Supabase sebagai backend | Frontend tidak diganti; view dan realtime dipakai dari kode yang ada |
| Tabel `spk` baru | `spk` sudah ada di production (`no` TEXT unik, `customer` TEXT, `po`, `status` Draft/Terbit/Selesai/Batal, `items` JSONB, `data` JSONB berisi `stokReq`) | Hanya **menambah** kolom dan batasan; tidak membuat ulang tabel |
| `master_customer`, `master_bahan_baku` | Tabel bernama `mcustomer` dan `rm` | Relasi memakai nama yang ada |
| Stok dipotong dari `master_bahan_baku` | Stok bahan baku adalah **turunan** buku `mutasi` (stok awal + jumlah delta); tidak ada kolom stok yang dipotong | Potong stok = menambah baris `mutasi` keluar; kolom stok tidak ditambah (dua sumber kebenaran pasti selisih) |
| Tabel `log_stok` | Fungsinya sudah dipegang `mutasi` (dengan audit di `audit_row`) | Tidak dibuat tabel kedua |
| Status "Proses/Berjalan" | Aplikasi memakai `Terbit` untuk berjalan; posisi barang diturunkan dari catatan produksi, vendor, kirim | Enum `posisi_barang` tidak disimpan di SPK; diturunkan di view (langkah 3) |
| Trigger potong stok saat Draft → Berjalan | Material sudah dihitung dan dicadangkan sebagai turunan (T-192); pengeluaran fisik tercatat saat bahan benar-benar keluar | Cadangan pada penerbitan, potong fisik pada pengeluaran bertanda SPK (lihat keputusan K-1) |

## 2. Urutan langkah

1. **Skema SPK dan kebutuhan bahan** (draf `apps/platform/supabase/draft/20240101000019_spk_peruntukan_materials.sql` (migration 19)): enum `spk_peruntukan` ('customer', 'stok_buffer'), `customer_id` terhubung ke `mcustomer`, batasan (customer dan PO wajib untuk SPK customer terbit, stok tanpa customer, status valid, nomor angka), pemicu penjaga peruntukan dan nomor setelah terbit, tabel `spk_materials` (kebutuhan, cadangan, keluar per bahan dan item, unik per SPK-bahan-item, tanpa DELETE).
2. **Cadangan bahan di database** (draf `apps/platform/supabase/draft/20240101000020_spk_cadangan_bahan.sql`, keputusan K-1 = cadangan dulu): pemicu saat SPK Draft → Terbit memeriksa `tersedia = stok - cadangan SPK lain` untuk SELURUH baris dan menggagalkan penerbitan dengan pesan bahan, kebutuhan, dan tersedia; Batal dan Selesai melepas cadangan, dibuka kembali mencadangkan ulang; pengeluaran fisik tetap baris `mutasi` bertanda SPK dan otomatis menyinkronkan `qty_keluar` (tidak pernah menggagalkan pergerakan stok). Bagian 6 memuat hasil tinjauan dan uji.
3. **Pipeline posisi dan vendor**: tabel `vendor_finishing_jobs` hanya bila perlu; saat ini `vendor` (dokumen kirim ke vendor dengan `items[].q/kembali/reject`) sudah memuat kirim dan kembali. View menurunkan posisi barang dan angka "kembali/kirim"; aturan SPK tidak boleh Selesai bila barang di vendor belum kembali.
4. **View agregasi dashboard dan realtime**: view untuk bahan baku kritis, SPK berjalan, progres, OTD; realtime hanya pada tabel yang perlu (`spk`, `vendor`, `produksi_log`).

## 3. Langkah 1: keputusan rancangan

- **Tambah, jangan ganti:** tidak ada DROP atau ubah tipe; aplikasi yang berjalan sekarang tetap bisa menyimpan SPK karena pemicu menyelaraskan `peruntukan` dengan `data.stokReq`.
- **Batasan NOT VALID:** aturan berlaku untuk baris baru dan yang diubah; baris lama tidak dipaksa. Setelah data lama dirapikan (daftar periksa ada di akhir berkas SQL) baru di-`VALIDATE`.
- **Customer tertaut:** `customer_id` diisi dari kecocokan nama persis dengan master customer aktif dan tidak ambigu; yang tidak cocok dibiarkan kosong dan dilaporkan, tidak ditebak.
- **Peruntukan dan nomor terkunci setelah terbit:** mengubahnya setelah produksi merusak stok dan penagihan.
- **`spk_materials`:** `qty_dicadangkan <= qty_butuh`, `qty_keluar <= qty_butuh`; unik per (SPK, bahan, item) selama tidak batal; tanpa kebijakan DELETE (batal lewat status); RLS mengikuti modul `spk` dan `bahan-baku`; audit dan stempel waktu seperti tabel lain.

## 4. Keputusan yang menunggu pemilik

- **K-1 (DIPUTUSKAN 2026-11-07: cadangan dulu):** bahan dicadangkan saat Terbit; stok fisik turun hanya saat pengeluaran bertanda SPK; SPK dibatalkan tinggal melepas cadangan.
- **K-2 Customer wajib terdaftar** dan **K-3 PO wajib:** DIBUAT BERTAHAP karena tinjauan membuktikan aplikasi saat ini belum mengisi `customer_id` dan tidak mewajibkan PO, sehingga batasan ketat akan membuat aplikasi tidak bisa menerbitkan SPK. Tahap sekarang: SPK customer terbit wajib bernama customer dan `customer_id` ditautkan otomatis dari nama yang cocok; tahap ketat (customer_id dan PO wajib, Batal dan Selesai dikecualikan) ada di akhir draf 19 dan baru dipasang setelah UI menegakkannya. **K-3 DIPUTUSKAN 2026-11-07: ada SPK customer sah tanpa PO.** Maka PO kosong hanya sah bila `tanpa_po_alasan` terisi (sampel, komplain, garansi, lainnya; daftar mudah ditambah) dan aturan ketatnya: customer_id terisi DAN (PO terisi ATAU alasan terisi); diuji K-01 sampai K-04. Tampilan SPK perlu kolom alasan saat PO dikosongkan (pekerjaan UI, belum dibuat). Masih terbuka: apakah ada SPK lama dengan nama customer yang tidak cocok dengan master?
- **K-4 Penerapan:** draf ini diuji dulu di project dev atau branch Supabase (bukan production), lalu rilis bertahap sesuai [[INTEGRATION_PATH]].

## 5. Langkah 2: keputusan rancangan

- **Satu kunci advisory global** untuk semua pencadangan dan sinkron (bukan per bahan): pabrik kecil, dan kunci per bahan terbukti bisa saling bersilang (deadlock) antara penerbitan dan pengeluaran multi-baris. Sinkron pengeluaran menelan kegagalan kunci sehingga pergerakan stok tidak pernah gagal; `spk_materials_hitung_ulang()` memperbaikinya.
- **Status baris:** rencana, dicadangkan, dikeluarkan, **lepas** (dilepas karena SPK Batal atau Selesai, dihidupkan lagi saat dibuka), **batal** (dibatalkan sengaja oleh pengguna, tidak dihidupkan otomatis).
- **Klien tidak bisa memalsukan** `qty_keluar`, `qty_dicadangkan`, `spk_id`, `rm_id`, atau status sistem; hanya pemicu.
- **Batas yang disengaja:** pengeluaran fisik SPK lain tidak diblokir walau memakan cadangan SPK lain; `tersedia` negatif menjadi peringatan di `v_rm_ketersediaan`.

## 6. Tinjauan dan uji

Empat peninjau independen (konkurensi, semantik, Supabase/RLS, keselamatan migrasi) memeriksa draf 19 dan 20; tiap temuan diverifikasi satu agen dengan mencoba mereproduksinya di Postgres lokal. 21 temuan, 19 terbukti nyata (17 direproduksi): pergerakan stok bisa gagal oleh batasan status, cadangan hantu pada SPK Selesai, buka kembali Selesai tidak mencadangkan, baris batal sengaja dihidupkan, kolom sistem bisa dipalsukan klien, fungsi hitung membocorkan stok lewat RPC, aplikasi saat ini tidak bisa menerbitkan SPK karena batasan customer, dan potensi deadlock. Semuanya diperbaiki di draf dan dikunci dengan uji. Dua temuan ditolak (FK customer RESTRICT adalah perilaku wajar; Realtime ditangani di langkah 4).

Uji: `apps/platform/tests/sql/cadangan.sql.test.mjs` menjalankan draf 17, 19, 20 di Postgres lokal (PGlite, tanpa Docker dan tanpa Supabase): 52 PASS. Pasang sekali `npm i --no-save @electric-sql/pglite` lalu `node tests/sql/cadangan.sql.test.mjs`. **Belum teruji:** konkurensi sungguhan (PGlite satu koneksi), RLS dengan peran Supabase asli, dan perilaku di project Supabase.

## 7. Status bukti

`verified in database` hanya untuk Postgres lokal (PGlite, 52 uji lulus); belum dijalankan di Supabase (dev maupun production). Skema `spk` production dibaca (kolom saja); batasan dan pemicu production tidak dibaca (pembacaan kedua ditolak izin). Uji konkurensi sungguhan dan RLS peran Supabase tetap wajib di project dev atau branch sebelum rilis.
