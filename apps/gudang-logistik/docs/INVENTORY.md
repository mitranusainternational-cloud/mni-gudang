---
type: inventory
status: active
updated: 2026-11-06
---

# Inventaris fitur aplikasi (2026-11-06)

Inventaris tingkat tinggi per modul. Peta lengkap (hulu, hilir, koleksi, migration, status): [[documentation/PETA_MODUL]]. Audit cakupan uji: [[documentation/FEATURE_AUDIT]]. Berkas sumber awal `MNI Gudang & Logistik.html` tetap sebagai referensi.

## Navigasi dan umum
- Dashboard (KPI bertingkat, funnel SPK), tema terang, gelap, otomatis, navigasi responsif, kartu per item di HP.
- Cek Data, Kinerja Tim, Pengguna & Akses (hak per pengguna dan per modul, riwayat perubahan), akun saya.

## Gudang
- **Bahan baku:** Posisi stok, Analisa, Kartu Stok, Rencana pembelian dan PR, Stock opname (lembar hitung), Riwayat mutasi berdokumen (RCV, PK, OPN), jenis material fleksibel dengan massa jenis, nonaktif item.
- **Barang jadi:** Posisi stok dengan buffer dan ceklis SPK stok, Tren, Rencana produksi, Riwayat mutasi berdokumen (BJ-M, BJ-K) tertaut SPK.
- **Sparepart:** impor Excel, stok minimum dan buffer, Tren, Rencana pembelian dan PR, opname, dokumen (SP-M, SP-K, SP-OPN).

## Produksi dan logistik
- SPK Berjalan (Daftar, Jadwal, Berjalan, KPI & Analisa), filter SPK Customer dan SPK Stok, SPK stok ujung ke ujung dengan penjaga hasil produksi.
- Produksi Hari Ini (papan mesin, input fleksibel), Kinerja & Analisa, Laporan Produksi.
- Kirim ke Vendor (SJ-V), Kirim ke Customer (SJ dengan alamat, partial, nomor otomatis), Bongkar Muat.

## Dokumen dan data
- Ekspor CSV, Excel, PDF; nama penanda tangan diketik dengan saran; pustaka PDF dan Excel dilayani lokal (`public/vendor`).
- Data lewat adapter `window.claude` ke Supabase (production) atau mock lokal; polling 15 detik.

## Disembunyikan
- Penawaran dan Sales Order (`MODUL_PENJUALAN=false`), Papan Produksi dan Laporan Produksi sebagai halaman terpisah.

## Batasan
- Peran ditegakkan lewat hak per pengguna dan per modul di production; mock meniru batasan Postgres tetapi bukan bukti Supabase.
- Font dimuat dari CDN; pustaka ekspor sudah lokal.
