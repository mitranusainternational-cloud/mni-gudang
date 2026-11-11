---
type: rencana
status: draf-untuk-disepakati
updated: 2026-11-11
---

# Rencana perbaikan lokal (hemat token)

Dasar: [[ALUR_SISTEM_FRAMEWORK]]. Semua kerja **hanya lokal** (cabang `fitur/produksi-multi-wc`). Tidak ada push, PR, merge, migration, atau perubahan Supabase/Vercel tanpa persetujuan baru.

## Aturan hemat token

1. **Satu paket = satu sesi = satu commit.** Selesai satu paket, commit, lalu sesi baru (konteks bersih). Jangan menumpuk beberapa paket dalam satu percakapan panjang.
2. **Jangan membaca `app.js` utuh.** Cari dengan Grep (nama fungsi), baca hanya rentang barisnya.
3. **Patch lewat skrip kecil** (Write ke scratchpad, `sub(x,y)` yang mewajibkan potongan unik), bukan menulis ulang blok besar.
4. **Uji secukupnya:** per paket jalankan `ONLY=<suite terkait>` plus `npm run lint` dan `npm run test:unit`. Regresi penuh (33 suite, ±28 menit) **hanya sekali** di akhir tiap gelombang, di latar belakang dan keluaran ke berkas.
5. **Cek di browser dengan `get_page_text`/`read_page`**, screenshot hanya bila tampilan yang diuji.
6. **Catat ringkas:** satu catatan `tasks/T-xxx` per paket, satu entri `PROJECT_PROGRESS`; `sync-vault.mjs` sekali per commit.
7. Setelah mengubah `apps/gudang-logistik`: `node scripts/extract-app.js` (di `apps/platform`).

## Gelombang 1: perbaikan pasti (kecil, tanpa keputusan)

| Paket | Isi | Uji | Selesai bila |
|---|---|---|---|
| A | Dashboard "Aktivitas terbaru" menampilkan `undefined undefined Lundefined` pada mutasi keluar barang jadi | suite dashboard/gudang terkait + uji baru 1 kasus | nama item dan ukuran tampil atau dilewati rapi, tanpa kata `undefined` di halaman mana pun |
| B | Work Centre mock/seed sama dengan nama langkah rute (Shearing, Punching, Bending, CNC Laser, Welding); daftar kecocokan untuk production disiapkan **sebagai dokumen**, tidak diterapkan | `ONLY=produksihh,matriksrute` | tidak ada "rute WC hilang" di Cek Data pada data contoh |
| C | Cek Data: aturan plate belum diserahkan, rute kosong, WIP tertahan (F-14) | suite cekdata | tiap aturan punya satu uji lulus dan satu uji gagal |

## Gelombang 2: alur hulu ke hilir yang masih bolong

| Paket | Isi | Uji | Selesai bila |
|---|---|---|---|
| D (F-11) | Antrian "Siap dikirim ke vendor" dan serah terima WIP dari produksi | suite vendor + produksihh | hasil langkah internal terakhir muncul sebagai antrian, tidak bisa dikirim melebihi jumlahnya |
| E (F-12) | Aturan SPK menjadi **Terkirim** (semua item sampai customer; SPK stok = masuk gudang) | suite spk + pengiriman | status otomatis benar pada SPK satu armada banyak SPK |
| F | Laporan susut (estimasi lawan real) dari data yang sudah ada | suite laporan | angka cocok dengan hitungan manual pada data contoh |

## Gelombang 3: perlu keputusan pemilik dulu

| Paket | Pertanyaan |
|---|---|
| G | Laporan produksi: pakai Dashboard Produksi lama atau Kinerja & Analisa (data sama)? |
| H | Input SPK dengan katalog berat terpasang: cukup teks Description, atau per dimensi? |
| I | F-13 duplikasi tab Item di SPK: gabung atau biarkan? |

Gelombang 3 tidak dikerjakan sebelum dijawab.

## Urutan dan titik berhenti

A → B → C → regresi penuh gelombang 1 → laporan ke pemilik → D → E → F → regresi penuh gelombang 2.
Setelah tiap gelombang: ringkasan hasil, bukti (`source-level` atau `verified in browser`), dan **tanya** apakah lanjut. Rilis ke live adalah keputusan terpisah dan bukan bagian rencana ini.

## Hasil gelombang 1 (2026-11-11)

- **A selesai** (b1c50ef): mutasi sparepart tampil benar di Dashboard dan riwayat; uji PH-21.
- **B selesai di lokal:** seed Work Centre sudah sama dengan langkah rute (PH-01 lulus). **Production belum disentuh.** Dari backup lokal (10 Nov) Work Centre production hanya `SHEARING` dan `CNC LASER`. Pencocokan nama tidak membedakan huruf besar kecil, jadi yang kurang untuk rute standar: **Punching, Bending, Welding** (dan Coating/QC/Packing bila dipakai). Menambahkannya ke production adalah perubahan data live, menunggu persetujuan terpisah; di aplikasi sudah ada tombol "Tambahkan otomatis" di Cek Data.
- **C selesai di lokal:** Cek Data kategori Produksi punya dua aturan baru: (1) produksi sudah jalan tetapi plate belum lengkap diserahkan (perhatian), (2) hasil produksi selesai tetapi belum dikirim ke vendor (info). Aturan (1) terbukti menyala di pratinjau berkatalog (SPK 1005). Aturan (2) **belum terbukti memicu** karena data contoh tidak punya SPK di tahap "Siap ke vendor". Uji PH-22 hanya memastikan tidak galat dan tanpa `undefined`.
- Regresi penuh gelombang 1 belum dijalankan.

## Paket K: laporan produksi terpusat admin (2026-11-11, lokal)

Keputusan pemilik: operator lapangan belum siap, jadi sementara **satu admin** mengisi laporan produksi seperti versi pertama. Admin hanya mengisi **jumlah item yang sudah selesai (siap kirim ke vendor atau customer)**, tidak ada laporan per Work Centre dan tidak ada pilihan mesin.

- **Input:** tombol *Isi hasil* di Produksi Hari Ini membuka form SPK; satu isian total selesai per item. Disimpan sebagai total manual item (`prod`) dan `prodLog` tanpa WC. Tidak ada catatan `produksi_log` baru (PH-23b).
- **Laporan:** Produksi Hari Ini kini memuat laporan **qty dan tonase (kg)** per Tebal, Tipe produk, Material, Finishing, atau Customer (cakupan SPK aktif atau semua SPK terbit), serta daftar progres per item SPK. Sumbernya angka selesai per item yang sama dengan SPK Berjalan, jadi cocok untuk input admin maupun catatan mesin.
- **Bendera:** bawaan aktif. Mati lewat setting `produksiAdmin=false` (Master Data › setting) untuk kembali ke Antrian Mesin per Work Centre; Antrian Mesin dan kode operator **tidak dihapus**, siap dipakai saat operator lapangan siap. Uji lama memakai `window.__PRODUKSI_MESIN`.
- **Catatan:** item yang sudah punya catatan mesin: isian admin dihitung **tambahan** di luar catatan mesin (angka dijumlah, dibatasi target). Tonase memakai berat per pcs item; item tanpa berat dihitung 0 dan diberi catatan.
- **Bukti:** PH-23a/b lulus (produksihh 23 PASS), terlihat di pratinjau lokal. Laporan Kinerja & Analisa dan Laporan Produksi lama tetap bersumber dari catatan mesin, jadi belum memuat angka admin; ini keputusan terbuka.

**Lanjutan Paket K (tanpa Work Centre di mode admin):**
- Laporan Produksi (Kinerja & Analisa) memuat input admin: kejadian "hasil" dibentuk dari selisih `prodLog` hanya saat membaca laporan (`evAdmin`), tidak disimpan (PH-24).
- Mode admin menyembunyikan semua tampilan per Work Centre: Jejak produksi di drawer SPK (Produksi selesai › Vendor bila ada › Terkirim), rantai Work Centre dan "Posisi" di form Isi hasil, tab Work Center, Progres WC, dan Produk di Kinerja & Analisa, kelompok Work Centre, Mesin, Operator di Laporan Produksi, serta aturan Cek Data rute dan Work Centre (PH-25).
- Bukti: regresi penuh sampai Paket K = 33 suite, 742 PASS, 0 FAIL; setelah perubahan ini suite regresi, produksi, matriksrute, dan produksihh (25) lulus 0 FAIL; tampilan dicek di pratinjau lokal. Regresi penuh belum diulang setelah perubahan terakhir.
- Tab yang tetap per Work Centre (Antrian Mesin, Papan, Work Center, Progres WC) hanya muncul bila `produksiAdmin=false`, siap dipakai saat operator lapangan siap.
