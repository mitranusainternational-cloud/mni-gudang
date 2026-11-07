---
type: audit
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Audit progres proyek (2026-11-06)

Lanjutan: [[AUDIT_PROGRESS_2026-11-07]] (audit silang ketiga, bug B-019 sampai B-025, perapian tugas dan roadmap).

Lanjutan [[AUDIT_PROGRESS_2026-11-05]]. Pemeriksaan silang seluruh catatan tugas (`tasks/`), kode, git, tes, dan Supabase production (baca-saja) atas permintaan pemilik: "mana yang belum dikerjakan, mana yang sudah, pastikan semua terdeteksi". Peta modul: [[PETA_MODUL]]. Angka tugas dari [[PROGRESS_SNAPSHOT]]. Tugas audit: [[T-204-audit-dokumentasi-dan-peta-modul-hulu-hilir]].

## Posisi singkat

Aplikasi dan cloud tetap **live** (`main` ad73c89, migration 1 sampai 13). Dalam dua hari terakhir pekerjaan terpusat pada gudang, SPK stok, dan dokumen: semuanya **selesai di lokal dan teruji (mock)**, belum tayang. Jalur proses dan data (walkthrough, pilot, UAT) **masih belum dimulai** dan tetap penentu go-live.

| Ukuran | 2026-11-05 | 2026-11-06 |
|---|---|---|
| Tugas selesai | 29 dari 105 (28%) | 37 dari 130 (28%) |
| Effort selesai | 27,75 dari 172,35 hari | 40 dari 219,6 hari (18%) |
| Cakupan go-live (P0 sampai P7) | 29 dari 83 | 33 dari 100 |
| Jalur kritis menuju go-live | 26,5 hari kerja | 26,5 hari kerja (tidak bergerak) |
| Diblokir / dikerjakan | 1 / 4 | 1 / 6 |

Jumlah tugas naik 25 karena pekerjaan yang sebelumnya tidak tercatat kini terdeteksi (T-195 sampai T-209). Hitungan selesai tidak naik banyak karena sebagian besar pekerjaan baru berstatus `review` (menunggu pemilik), bukan `done`.

## Yang sudah dikerjakan (terdeteksi dan tercatat)

| Pekerjaan | Tugas | Status | Lingkungan |
|---|---|---|---|
| Surat jalan: alamat, partial, nomor otomatis | [[T-195-surat-jalan-alamat-partial-dan-penomoran-otomatis]] | done | **tayang** (PR 15) |
| Gudang Bahan Baku: dokumen semua mutasi, jenis fleksibel, nonaktif | [[T-196-gudang-bahan-baku-dokumen-mutasi-dan-master-fleksibel]] | review | lokal |
| Master Data bahan baku: massa jenis, jenis, rename berantai | [[T-207-master-data-bahan-baku-jenis-material-dan-massa-jenis]] | review | lokal |
| Posisi stok, lembar hitung opname, berita acara | [[T-209-gudang-bahan-baku-posisi-stok-dan-stock-opname-dipoles]] | review | lokal |
| Gudang Sparepart (modul baru, impor Excel, buffer, PR) | [[T-197-gudang-sparepart-modul-baru]] | review | lokal, migration 18 draf |
| Barang jadi: buffer, mutasi berdokumen, rencana produksi | [[T-198-barang-jadi-buffer-mutasi-berdokumen-dan-rencana-produksi]] | review | lokal |
| SPK stok ujung ke ujung dan penjaga hasil produksi | [[T-199-spk-stok-alur-ujung-ke-ujung]] | review | lokal |
| Tren pergerakan dan rencana pembelian sparepart | [[T-200-tren-pergerakan-stok-dan-rencana-pembelian-sparepart]] | review | lokal |
| Nama penanda tangan dokumen | [[T-201-nama-penanda-tangan-dokumen]] | review | lokal |
| Audit mandiri dan perbaikan HP | [[T-205-audit-mandiri-dan-perbaikan-pemakaian-di-hp]] | review | lokal |
| Pustaka PDF/Excel dari aplikasi sendiri | [[T-208-pustaka-pdf-dan-excel-dari-aplikasi-sendiri]] | review | lokal |
| Modul Penjualan disembunyikan | [[T-202-sembunyikan-modul-penjualan-fokus-operasional]] | done | lokal |
| Jejak audit perubahan (ditutup, dipenuhi T-172) | [[T-102-jejak-audit-perubahan-stok-dan-spk]] | done | **tayang** (migration 13) |
| Produksi multi work center, jadwal, kapasitas | T-174, T-177 sampai T-186 | review | lokal, migration 14 draf |
| ERP hulu: Penawaran, Sales Order, kebutuhan material | T-189 sampai T-194 | review (T-193 todo) | lokal, disembunyikan |

## Status tugas lama yang dikoreksi hari ini

| Tugas | Dari | Ke | Alasan |
|---|---|---|---|
| T-102 jejak audit | todo | done | seluruh kriteria sudah dipenuhi T-172 (production, verified in database) |
| T-103 manajemen user | todo | review | dikerjakan di T-167 |
| T-101 peran di UI | todo | review | terbukti roles.mjs 12, access.mjs 34; menunggu pengesahan matriks |
| T-023 smoke Playwright | todo | review | `npm run test:e2e` ada dan dijalankan CI |
| T-060 advisor | todo | review | advisor production ditinjau hari ini, tidak ada temuan kritis |
| T-174 produksi multi WC | doing | review | semua yang dapat dikerjakan lokal selesai; sisa keputusan pemilik dan rilis |
| T-133 dokumen terstandar | todo | doing | sebagian dikerjakan (T-201, T-208, T-195) |
| T-143 aset tanpa CDN | todo | doing | pustaka PDF/Excel sudah lokal (T-208) |

Catatan tanpa perubahan status (kemungkinan sudah tercapai atau sudah tidak relevan): T-017 (kemungkinan selesai, perlu verifikasi di production), T-027 (sebagian tercakup tes), T-142 (butuh T-141), T-011, T-012, T-013 (terhalang Docker, tidak lagi di jalur kritis; usul ditutup sebagai digantikan), T-020, T-044, T-045, T-047, T-061, T-064, T-065 (catatan keadaan terbaru ditambahkan).

## Yang belum dikerjakan (terdeteksi)

| Kelompok | Tugas | Penahan |
|---|---|---|
| **Jalur kritis proses dan data** | T-030, T-031, T-032, T-033, T-034, T-035, T-036, T-050 sampai T-053, T-063 | wawancara dan keputusan pemilik; belum dimulai |
| **Rilis production** | [[T-203-rilis-paket-gudang-dan-produksi-ke-production]], [[T-206-anti-stok-negatif-dan-penimpaan-bersamaan-draf-migration-17]] | persetujuan pemilik; rilis dijeda untuk memoles lokal |
| **Hardening production** | T-044, T-045, T-047, T-061, T-064, T-065, T-066 | aksi pemilik di dashboard (Preview, SMTP, redirect URL, backup, domain) |
| **Keamanan/kebersihan** | T-165, T-166 (Dependabot dan repo publik), proteksi password bocor (T-047) | keputusan dan paket berbayar |
| **Pasca go-live** | T-104, T-111 sampai T-114, T-121 sampai T-123, T-131 sampai T-133, T-141 sampai T-144, T-151, T-152, T-160, T-161, T-072 sampai T-074 | sengaja dijadwalkan setelah hypercare |
| **Fitur tertunda** | T-193 (monitoring estimasi lawan aktual) | Penawaran disembunyikan |
| **Lingkungan lokal** | T-010 (Docker), T-011, T-012, T-013, T-162 (Realtime) | virtualisasi BIOS nonaktif; polling 15 detik sebagai cadangan |
| **Dokumentasi** | T-025 (screenshot dan panduan pengguna), T-070, T-071 | panduan pengguna perlu mengikuti modul baru |

## Temuan audit (keadaan terkini dari delapan temuan 2026-11-05)

1. **Aturan lingkup dilanggar sejak 4 Nov** (fitur baru sebelum pilot): masih berlaku dan bertambah (gudang, sparepart, SPK stok). Sudah dicatat sebagai keputusan pemilik langsung; belum ada keputusan tertulis yang mengubah aturan 3 Nov. **Usul:** catat di [[documentation/DECISIONS|DECISIONS]] bahwa pemolesan modul oleh permintaan pemilik diizinkan sementara jalur proses dan data menunggu.
2. **Cabang panjang berisiko:** membesar menjadi 175 berkas, 3 commit baru di atas merge `main` (35bf7f7). `main` sudah digabung ke cabang (konflik satu, selesai). Rilis satu paket besar sulit ditinjau; usul rilis bertahap di T-203.
3. **T-044 dan T-047 masih `doing`:** tidak berubah; menunggu pemilik.
4. **Tugas `review` menunggu tinjauan:** naik dari 13 menjadi 30-an; hitungan selesai tidak mencerminkan pekerjaan jadi. Usul sesi tinjau pemilik per modul.
5. **Bukti Supabase untuk fitur baru:** tetap hanya mock; migration 14 dan 18 belum diterapkan. Pra-cek baca-saja production menunjukkan draf cocok dengan skema nyata.
6. **Risiko lama:** backup terjadwal dan uji pulih (T-061) masih terbuka dan menjadi syarat sebelum rilis besar; repo publik; proteksi password bocor.
7. **Data awal:** bahan baku (T-184) dan barang jadi (T-175) termuat; rekonsiliasi (T-035) dan cut-off (T-032) belum. Baris production hari ini: rm 24, fg 92, mutasi 19, spk 8, pr 0, kirim 7, vendor 5, user 10.
8. **Skema cadangan `arsip_20261105`** masih ada (4 tabel tanpa kunci primer; terlihat di advisor performa): hapus setelah pemilik puas.

**Temuan baru hari ini**
- Banyak pekerjaan (surat jalan, gudang, sparepart, SPK stok, tren, dokumen, audit HP, pustaka lokal, Master Data bahan baku) tidak punya catatan tugas sehingga tidak terdeteksi di snapshot; kini T-195 sampai T-209.
- Dokumen status tertinggal (PRODUCT_ROADMAP, ROADMAP, CLAUDE.md, TEAM_AND_SKILLS): sudah diperbarui (T-204).
- Penjaga kirim ke customer mengubah perilaku di production begitu dirilis (SPK lama tanpa catatan produksi tertahan); belum diputuskan.
- Advisor production 2026-11-06: 8 WARN fungsi bantu RLS (disengaja), 1 WARN proteksi password bocor, 3 WARN kebijakan permisif ganda (`muser`, `role_modules`, `ureq`), INFO 22 indeks belum terpakai; tidak ada temuan kritis.

## Keputusan yang ditunggu pemilik

| # | Keputusan | Menggerakkan |
|---|---|---|
| 1 | Jadwalkan sesi walkthrough dan pilih pilot pertama (jalur kritis belum bergerak) | T-030, T-031 |
| 2 | Konfirmasi cut-off dan sumber resmi workbook | T-032, T-035 |
| 3 | Izin rilis bertahap paket gudang dan produksi multi WC (migration 14 lalu 18, PR, deploy) setelah memoles lokal | [[T-203-rilis-paket-gudang-dan-produksi-ke-production]] |
| 4 | Perlakuan SPK lama yang produksinya tidak pernah dicatat saat penjaga kirim aktif | [[T-199-spk-stok-alur-ujung-ke-ujung]] |
| 5 | Hak modul sparepart untuk peran selain gbb dan admin; hak membuat SPK stok untuk gbj | T-101, [[T-197-gudang-sparepart-modul-baru]] |
| 6 | Ambang tren dan aturan usulan (buffer, 2x minimum) | T-113, [[T-200-tren-pergerakan-stok-dan-rencana-pembelian-sparepart]] |
| 7 | Backup terjadwal dan uji pulih sebelum rilis besar | T-061 |
| 8 | SMTP, redirect URL, proteksi password bocor, variabel Preview | T-044, T-047 |
| 9 | Tinjau tugas `review` agar bisa ditutup (urut per modul) | hitungan selesai |
| 10 | Tampilkan lagi Penawaran dan Sales Order atau tetap tersembunyi | T-190 sampai T-194 |
| 11 | Daftar nama penanda tangan dibagi antar pengguna lewat database | [[T-201-nama-penanda-tangan-dokumen]] |

## Rekomendasi urutan kerja

1. Sesi tinjauan pemilik modul demi modul (Gudang Bahan Baku, Barang Jadi, Sparepart, SPK stok) untuk menutup `review` atau mencatat perbaikan.
2. Backup dan uji pulih (T-061), lalu rilis bertahap T-203 setelah persetujuan, dengan keputusan SPK lama (nomor 4) sebelum rilis.
3. Mulai jalur proses dan data (T-030, T-031) paralel; tanpanya UAT dan go-live tidak bergerak.
4. Tahan fitur baru lain sampai pilot berjalan, kecuali permintaan langsung pemilik yang dicatat.
