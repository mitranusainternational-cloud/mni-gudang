---
type: registry
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Peta modul: dari hulu ke hilir

Satu halaman untuk menjawab "modul apa saja, dari mana datanya, ke mana mengalir, sudah di mana (lokal atau production), dan tugas serta ujinya apa". Peta sumber daya (GitHub, Vercel, Supabase) ada di [[SISTEM_MAP]]. Aturan stok dan dokumen gudang: [[PRD_GUDANG]]. Aturan produksi: [[PRD_PRODUKSI]]. Status tugas: [[PROGRESS_SNAPSHOT]]. Diperbarui setiap modul berubah (skill `vault-progress`).

## Alur utama

```text
HULU                                                                                    HILIR
Penawaran ─► Sales Order ─► SPK (Draft ─► Terbit) ─► Produksi (work center) ─► Vendor finishing ─┬─► Kirim ke Customer (SJ)
 (tersembunyi) (tersembunyi)     ▲                     │ produksi_log                (SJ-V)       │
                                 │                     ▼                                          └─► Gudang Barang Jadi (BJ-M)  ◄─ SPK stok
Gudang Bahan Baku ──(PK: pakai untuk SPK)────────────►─┘                                              │  buffer ─► Rencana produksi ─► SPK stok
   ▲  (RCV: terima)     Bongkar Muat (unloading/loading)                                              └─► BJ-K keluar ke customer (tertaut SPK)
   │
Rencana pembelian bahan baku ─► PR ─► supplier           Gudang Sparepart ─► Rencana pembelian ─► PR ─► supplier (terima = SP-M)
```

Pengikat lintas modul: nomor SPK (`mutasi.spk`), nomor dokumen (`mutasi.noDok`), tanda SPK stok (`spk.stokReq`), dan Master Data (customer, vendor, supplier, armada, work center).

## Peta per modul

Kolom status: **Prod** = sudah tayang di production, **Lokal** = hanya di cabang `fitur/produksi-multi-wc` (mock), **Draf** = migration belum diterapkan.

| Modul | Rute | Hulu (sumber) | Hilir (tujuan) | Koleksi / tabel | Migration | Dokumen | Status | Tugas | Uji |
|---|---|---|---|---|---|---|---|---|---|
| Dashboard | `#dashboard` | semua modul | keputusan harian | turunan (`calc()`) | - | - | Prod (versi lama), Lokal (KPI bertingkat, funnel) | T-168 | regresi, tampilan |
| Gudang Bahan Baku | `#bahan-baku` | supplier, PR, Bongkar Muat | SPK (pakai), produksi | `rm`, `mutasi` (gudang `rm`), `rmhist`, `pr`, `opname` | 1 sampai 13 (Prod) | RCV, PK, OPN, PR (PDF, Excel) | Prod (dasar), Lokal (dokumen semua mutasi, master fleksibel, nonaktif, kartu HP) | T-170, T-184, T-196 | regresi, tampilan |
| Gudang Barang Jadi | `#barang-jadi` | hasil produksi, SPK stok, vendor finishing | customer (BJ-K), SPK | `fg`, `mutasi` (gudang `fg`) | tanpa (buffer di `fg.data`) | BJ-M, BJ-K, opname | Prod (dasar, filter Type), Lokal (buffer, dokumen, tren, rencana produksi, ceklis SPK stok) | T-175, T-176, T-198, T-200 | `sparepart.mjs` SP-17 sampai SP-26, SP-29 sampai SP-35; `fitur.mjs` F-11 |
| Gudang Sparepart | `#sparepart` | supplier, PR, impor Excel | mesin dan bagian (pengeluaran) | `sp`, `mutasi` (gudang `sp`), `pr` (`data.gudang=sp`) | 18 (Draf) | SP-M, SP-K, SP-OPN, PR | Lokal | T-197, T-200 | `sparepart.mjs` SP-1 sampai SP-21 |
| Bongkar Muat | `#bongkar-muat` | terima material, kirim vendor, surat jalan | armada dan dok | `bongkar`, `marmada` | 1 sampai 13 | antrian dok | Prod | T-171 | regresi |
| Kirim ke Vendor | `#vendor` | SPK (produksi selesai sebagian) | kembali dari vendor, SPK | `vendor`, `mvendor` | 1 sampai 13 | SJ-V, Bukti Terima Barang | Prod | - | regresi |
| Kirim ke Customer | `#pengiriman` | SPK (hasil siap), gudang | customer | `kirim`, `mcustomer` | 1 sampai 13 | SJ (alamat, partial, nomor otomatis) | Prod (surat jalan baru), Lokal (penjaga hasil produksi siap) | T-195, T-199 | regresi |
| SPK Berjalan | `#spk` | Sales Order (tersembunyi), input manual, SPK stok | produksi, vendor, kirim, gudang jadi | `spk`, `produksi_log` | 14 (Draf, untuk `produksi_log`) | SPK (PDF, Excel), laporan | Prod (SPK dasar), Lokal (Jadwal, Berjalan, KPI, filter jenis SPK) | T-173, T-180, T-182, T-185, T-186, T-199 | `produksi.mjs`, `alur-spk.mjs` |
| Produksi Hari Ini | `#mesin` | SPK Terbit | `produksi_log`, posisi SPK | `produksi_log`, `mwc` | 14 (Draf) | laporan produksi | Lokal | T-174, T-177, T-179, T-183 | `produksi.mjs` (134) |
| Kinerja & Analisa | `#produksi` | `produksi_log`, vendor, kirim | manajemen | turunan | 14 (Draf) | Laporan Produksi | Lokal | T-178, T-179 | `produksi.mjs` |
| Penawaran | `#penawaran` | katalog harga (lokal, tidak di Git) | Sales Order | `penawaran` | 15 (Draf) | penawaran cetak | Lokal, **disembunyikan** (`MODUL_PENJUALAN=false`) | T-189, T-190, T-202 | `penawaran.mjs` (dilewati) |
| Sales Order | `#salesorder` | penawaran Disetujui | SPK Draft otomatis | `salesorder` | 16 (Draf) | - | Lokal, **disembunyikan** | T-191, T-192, T-194, T-202 | `alur-penawaran.mjs` |
| Cek Data | `#cek-data` | semua koleksi | koreksi data | turunan | - | - | Prod | T-111 (aturan belum disepakati) | regresi |
| Master Data | `#master-data` | pemilik data | semua modul (nama dan jenis mengikuti) | `master`, `mcustomer`, `msupplier`, `mvendor`, `marmada`, `mwc` | 1 sampai 13 | - | Prod, Lokal (jenis material fleksibel, ganti nama berantai) | T-196 | regresi |
| Pengguna & Akses | `#pengguna` | admin | peran dan modul per pengguna | `muser`, `role_modules`, `user_module_access` | 4 sampai 13 | - | Prod | T-167, T-169, T-172 | `roles.mjs`, `access.mjs` |
| Kinerja Tim | `#kinerja` | `log` | admin | `log`, `audit_log` | 13 | - | Prod | T-172 | regresi |

## Penghubung antar modul (apa yang harus tetap benar)

| Penghubung | Aturan | Dijaga oleh |
|---|---|---|
| Stok | stok = stok awal + jumlah `mutasi.delta` per (gudang, item); tidak ada kolom stok yang disimpan | `calc()` di `app.js` |
| SPK ke gudang bahan baku | pemakaian bahan baku memuat nomor SPK; pemakaian tanpa SPK wajib berketerangan | form Pakai, [[PRD_GUDANG]] |
| SPK stok ke barang jadi | SPK `stokReq` tidak dikirim ke customer; barang masuk gudang jadi hanya sebesar hasil produksi selesai | `fgSiapMap`, `sisaLine`, [[PRD_GUDANG]] |
| SPK customer ke pengiriman | kirim ke customer hanya sebesar hasil produksi siap (selesai, kembali dari vendor); override tercatat | `sisaLine`, `checkCap` |
| Master ke modul | mengganti nama atau menonaktifkan master mengikuti semua modul terkait | adapter dan form master |
| Dokumen | setiap pergerakan mempunyai nomor dokumen berurutan per tahun dan bulan (`nextDocNo`) | `DOCFMT` |
| Hapus | tidak ada hapus permanen data transaksi (migration 13); koreksi dengan transaksi pembalik, item dengan nonaktif | RLS dan UI |

## Keadaan lingkungan (2026-11-06)

| Lingkungan | Isi |
|---|---|
| Production | `main` (ad73c89, surat jalan); Supabase migration 1 sampai 13; baris: rm 24, fg 92, mutasi 19, spk 8, pr 0, kirim 7, vendor 5, user 10 |
| Lokal | `fitur/produksi-multi-wc` (35bf7f7): produksi multi work center, gudang bahan baku dan sparepart, SPK stok, dokumen, tren; belum di-push; regresi penuh hijau |
| Draf migration | 14 `produksi_log`, 15 `penawaran`, 16 `salesorder`, 17 anti stok negatif (ditunda), 18 `sparepart` |
| Rencana rilis | [[T-203-rilis-paket-gudang-dan-produksi-ke-production]], dijeda atas permintaan pemilik |

## Celah yang masih terbuka

- Hak per modul `sparepart` untuk peran selain `gbb` dan admin belum dibahas dengan pemilik.
- Aturan Cek Data (T-111), opname terjadwal (T-112), dan validasi buffer (T-113) belum disepakati; tren dan usulan memakai ambang sementara.
- Monitoring estimasi lawan aktual (T-193) belum dikerjakan; Penawaran dan Sales Order disembunyikan sampai pemilik meminta.
- Daftar nama penanda tangan hanya per perangkat (T-201).
- Migration 17 belum diuji; stok negatif pada data lama perlu dicek lebih dulu.
