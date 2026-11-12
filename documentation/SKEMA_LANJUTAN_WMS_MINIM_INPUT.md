---
type: skema
status: draf-dijalankan-bertahap
updated: 2026-11-11
---

# Skema lanjutan WMS: input minimal, otomatis, laporan optimal

Arah dari pemilik (2026-11-11): sistem **tidak banyak input**. SPK terbit lalu bahan baku diminta otomatis dan valid, sisa bahan baku terdeteksi, produksi, barang jadi, kirim vendor, kirim customer, dan pemakaian sparepart ikut terdeteksi. Laporan sesederhana dan seoptimal mungkin. Melengkapi [[ALUR_SISTEM_FRAMEWORK]] dan [[RENCANA_PERBAIKAN_LOKAL]]. Semua dikerjakan **di lokal**; rilis hanya setelah persetujuan pemilik.

## 1. Prinsip

1. **Satu sumber: SPK.** Kebutuhan, PR, status, posisi, dan laporan adalah turunan SPK, bukan input baru.
2. **Satu kejadian, satu input.** Tujuh kejadian saja yang diketik orang: Terbit SPK, Serah plate, Isi hasil produksi, Kirim vendor (dan Terima kembali), Kirim customer, Terima masuk gudang (SPK stok), Pakai sparepart.
3. **Isian terisi otomatis** dari data yang sudah ada; pengguna cukup mengecek dan menekan satu tombol.
4. **Setiap angka bisa ditelusuri** ke satu dokumen (SPK, surat jalan, mutasi).
5. **Selisih terdeteksi sendiri** dan muncul di Cek Data sebagai "Kesehatan data", bukan ditemukan saat rapat.

## 2. Alur dan apa yang otomatis

| # | Tahap | Input manusia (minimal) | Otomatis (sudah ada) | Otomatis (akan dibangun) | Deteksi dan validasi |
|---|---|---|---|---|---|
| 1 | SPK terbit | isi SPK | nomor, snapshot rute, kebutuhan plat per bahan dan tebal, reservasi stok | **PR draf otomatis** untuk kekurangan; **ceklis siap terbit** | item tanpa berat, tanpa RM, bahan atau tebal tidak ada di master |
| 2 | Permintaan bahan baku | tidak ada | kebutuhan = berat item × faktor sisa potong | PR draf per supplier terkumpul, 1 klik ajukan | permintaan melebihi wajar, stok kurang, lead time lewat |
| 3 | Serah plate ke produksi | 1 klik (form terisi dari kebutuhan) | stok bahan baku berkurang, ref SPK | tombol **Serahkan semua** untuk beberapa SPK | plate belum diserahkan padahal produksi jalan (sudah ada) |
| 4 | Produksi (admin) | jumlah selesai per item | progres, tonase, siap ke vendor | - | kirim vendor tidak melebihi selesai (sudah ada) |
| 5 | **Sisa bahan baku** | hanya bila sisa dikembalikan ke gudang | - | **susut per SPK** = plat keluar (kg) − tonase hasil; sisa wajar atau berlebih; **Kembalikan sisa** 1 input | susut di atas faktor sisa potong; plat keluar tanpa hasil |
| 6 | Barang jadi | 1 klik Terima | status "siap masuk stok" | **Terima semua** yang siap (SPK stok) | hasil selesai belum masuk gudang; stok FG tidak cocok dengan SPK |
| 7 | Kirim vendor | 1 form dari antrian siap | antrian Siap dikirim ke vendor, batas jumlah | - | barang lama di vendor, kembali melebihi kirim |
| 8 | Kirim customer | 1 form (banyak SPK satu armada) | siap kirim, status Terkirim | - | kirim melebihi siap, SPK terlambat |
| 9 | **Sparepart** | 1 input Pakai (mesin dan pengambil) | stok, minimum, kartu stok | **PR draf otomatis** saat di bawah minimum; pemakaian per mesin per bulan | pemakaian jauh di atas rata-rata, stok negatif, keluar tanpa mesin |

## 3. Laporan (output)

Satu pintu **Laporan**, bahasa sederhana, tiap angka bisa diklik ke dokumennya, ekspor satu klik (CSV dan PDF):

- **Produksi:** qty dan tonase per tebal, tipe produk, material (sudah ada).
- **Bahan baku:** stok vs buffer (ada), **susut per SPK, bahan, dan tebal** (baru), PR terbuka dan umurnya.
- **Barang jadi dan kirim:** siap masuk, siap kirim, terkirim, OTD (sebagian ada).
- **Vendor:** di vendor, lama, kembali (ada).
- **Sparepart:** pemakaian per mesin dan bulan, di bawah minimum (baru ringkas).
- **Kesehatan data:** semua selisih di atas dalam satu daftar.

## 4. Tahap pelaksanaan (satu paket per sesi, satu commit, regresi di akhir tiap tahap)

| Tahap | Isi | Selesai bila |
|---|---|---|
| T4 | **Validitas laporan:** cek silang angka antar layar dan aturan Kesehatan data (plat keluar vs hasil, stok FG vs SPK, kirim vs selesai) | angka sama di semua layar untuk data uji; selisih terdeteksi |
| T5 | **Permintaan bahan baku otomatis:** ceklis siap terbit, PR draf otomatis, Serahkan semua | SPK terbit menghasilkan PR draf yang benar; kebutuhan valid |
| T6 | **Sisa dan susut bahan baku:** laporan susut, Kembalikan sisa | susut per SPK cocok hitungan manual |
| T7 | **Barang jadi:** Terima semua yang siap | SPK stok selesai produksi muncul siap masuk dan stok benar |
| T8 | **Sparepart:** PR draf di bawah minimum, pemakaian per mesin, anomali | pemakaian terdeteksi tanpa input tambahan |
| T9 | **Laporan satu pintu** dan ekspor | satu halaman, ekspor CSV dan PDF |
| T10a | **Pengguna & Akses selaras alur baru:** peran dan hak per modul mengikuti WMS (SPK, Gudang, Logistik, Master Data), peran Penawaran/Sales tidak ada; perubahan hak **berlaku langsung (realtime)** tanpa muat ulang, dan ada uji untuk itu | ubah peran pengguna: menu dan akses berubah seketika; tiap peran hanya melihat modulnya |
| T10b | **KPI dan Kinerja Tim selaras alur baru, realtime:** ukuran per orang dari kejadian nyata (SPK diterbitkan, **laporan hasil produksi admin** (qty dan tonase), serah plate, surat jalan vendor dan customer, penerimaan, pemakaian sparepart), ketepatan waktu, dan tidak lagi bergantung pada operator per mesin; laporan hasil produksi admin ikut tercatat atas nama pelapor | angka per orang naik seketika saat ia mencatat; sama dengan jumlah dokumennya |
| T10 | **Penyederhanaan tampilan:** menu ringkas, isian default terisi, halaman awal berupa daftar tindakan hari ini | tim baru bisa memakai tanpa panduan |
| T11 | Skenario uji untuk pemilik dan rencana rilis | lolos di lokal; rilis menunggu persetujuan |

## 5. Keputusan bawaan (bisa diganti pemilik kapan saja)

- PR otomatis berbentuk **draf**; tidak terkirim ke supplier sebelum satu klik persetujuan.
- **Sisa = kg plat keluar − tonase hasil.** Wajar bila dalam faktor sisa potong (bawaan 1,1, toleransi ±5%); di luar itu ditandai.
- Perhitungan susut butuh **berat per pcs** di katalog; item tanpa berat ditandai di Kesehatan data, bukan dihitung nol diam-diam.
- Laporan per Work Centre tetap tersedia tetapi **mati** selama operator lapangan belum siap (`produksiAdmin`); nanti cukup dinyalakan.

## 6. Batas dan risiko

- Validitas sisa dan susut bergantung pada berat di katalog dan pencatatan plat keluar per SPK; datanya harus lengkap atau ditandai.
- Satu admin melapor produksi: akurasi waktu dan per mesin tidak tersedia sampai operator siap.
- Tidak ada perubahan production, Supabase, atau Vercel di skema ini; rilis adalah keputusan terpisah.
