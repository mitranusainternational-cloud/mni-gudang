---
type: design
status: draft
updated: 2026-11-04
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# PRD Produksi dan Tracking (SPK, work center, vendor, pengiriman)

Dokumen kebutuhan untuk modul produksi. Detail rute dan aturan hitung ada di [[RUTE_PRODUKSI]]; tugas ada di [[T-174-produksi-multi-work-center-rute-antrian-kapasitas]], [[T-177-skema-produksi-tiga-pintu-spk-berjalan]], dan [[T-178-kinerja-dan-analisa-produksi-tahap-2]]. Pengganti form laporan harian produksi (Excel, 15 lembar).

## 1. Masalah

Form Excel menyulitkan: tidak terlihat SPK mana yang sedang jalan, item sudah sampai mana, dan seberapa cepat tiap work center atau vendor bekerja. Tampilan awal sistem juga membingungkan karena terlalu banyak menu dan banyak tempat input.

## 2. Tiga kebutuhan inti (dari pemilik, 2026-11-04)

1. **SPK mana yang sedang dikerjakan.**
2. **Progres tiap item dalam SPK** sampai mana, serta output per work center secepat apa dan kapasitas per hari berapa, agar manajemen dapat memantau.
3. **Posisi SPK secara keseluruhan:** sudah selesai semua atau belum, dan bila belum sudah sampai mana.

## 3. Kebutuhan lanjutan

- **Tracking vendor finishing:** barang keluar dan masuk tercatat, kecepatan (lama proses, tepat waktu, reject) dinilai sehingga terlihat vendor mana yang cepat dan mana yang kurang.
- **Analisa per work center, per produk,** dari work center awal sampai selesai, termasuk kirim ke vendor dan kembali.
- **Loading dan unloading** ke customer tercatat waktunya dan dianalisa.
- Mudah dipakai, tidak ribet, nyaman di HP untuk operator.

## 4. Prinsip rancangan

- **Input hanya di tiga tempat:** Produksi Hari Ini (operator), Kirim ke Vendor (barang keluar dan masuk), Bongkar Muat dan Kirim ke Customer (loading dan unloading). Layar lain hanya untuk dilihat.
- **Satu aksi utama per layar:** operator menekan Mulai lalu Selesai; selebihnya otomatis (rute, pindah ke langkah berikutnya, durasi, tonase).
- **Rute otomatis** dari judul section SPK dan deskripsi item (Cable Tray, Cable Ladder, Accs); langkah vendor ikut sebagai bagian rute.
- Bukti dibedakan: `source-level`, `verified in browser`, `verified in database`. Mock bukan bukti Supabase.

## 5. Skema menu (keputusan 2026-11-04)

| Menu Produksi | Fungsi | Jenis | Menjawab |
|---|---|---|---|
| **SPK Berjalan** | Kartu per SPK: status, progres, jalur tiap item dari work center awal sampai terkirim; filter Berjalan, Telat, Di vendor, Siap kirim, Selesai | Lihat | Kebutuhan 1 dan 3, sebagian 2 |
| **Produksi Hari Ini** | Kartu pekerjaan per mesin; Mulai, jumlah selesai (+ dan −), Selesai | **Input** | Sumber data semua menu |
| **Kinerja & Analisa** | Lima tab: Work Center (output, kapasitas, utilisasi, tren, beban antrian), Produk (lama proses per tahap), Vendor (keluar, masuk, kecepatan, kualifikasi), Pengiriman (loading dan unloading), Laporan harian | Lihat | Kebutuhan 2 dan analisa (Tahap 2 selesai di lokal) |

Rute tersembunyi (masih bisa dibuka lewat alamat): Papan Produksi dan Laporan Produksi. Menu lama Monitoring SPK, Dashboard Produksi, dan Antrian Mesin digantikan tiga menu di atas.

## 6. Pemetaan kebutuhan ke data

| Kebutuhan | Sumber data | Tabel dan kolom |
|---|---|---|
| SPK dan item berjalan | Sesi Mulai yang belum selesai | `produksi_log` (jenis `mulai`, `spk_id`, `item_idx`, `mesin`, `operator`) |
| Progres item per langkah | Penjumlahan hasil per work center, reject dicabut dari langkah sebelumnya | `produksi_log` (jenis `hasil`, `wc`, `qty`, `reject`) |
| Output dan kapasitas per work center | Hasil per mesin per hari, kapasitas di master | `produksi_log`, `mwc` (`kapasitas`, `mesin`) |
| Kecepatan vendor | Tanggal kirim dan kembali per surat jalan, reject | `vendor` (`tgl`, `riwayat`, `items`) |
| Lama proses per produk | Waktu mulai dan selesai per langkah | `produksi_log` (`mulai`, `selesai`, `menit`) |
| Loading dan unloading | Jam masuk, mulai, dan selesai di antrian Bongkar Muat (sudah ada; Loading dan Unloading, jenis muatan, pihak) | `bongkar` (`jenis`, `muatan`, `pihak`, `jamMasuk`, `jamMulai`, `jamSelesai`); **tidak perlu input baru** |

Migration 14 (`produksi_log`) masih **draf** dan belum diterapkan ke Supabase mana pun.

## 7. Di luar cakupan sekarang

Break atau hold per operasi, reversal material, issue material per operasi (ada di Antlia, sengaja tidak dibawa), kunci perubahan rute per item, reject vendor otomatis kembali ke antrian.

## 8. Ukuran keberhasilan (usulan)

- Operator mencatat satu hasil dalam kurang dari 15 detik tanpa membuka lebih dari satu layar.
- Manajemen dapat menjawab "SPK X sampai mana" dalam satu klik dari SPK Berjalan.
- Laporan harian per mesin tidak lagi diisi manual di Excel.

## 9. Pertanyaan terbuka

- Aturan rute Jointing dan Clamp (hanya Cover yang dikonfirmasi), kapasitas per mesin, dan nama mesin pada seed perlu konfirmasi pemilik.
- Apakah loading dan unloading perlu dicatat per kendaraan atau per pengiriman.

## 10. Status pemenuhan (2026-11-04)

| Kebutuhan | Status | Bukti |
|---|---|---|
| 1. SPK mana yang sedang dikerjakan | Selesai lokal | SPK Berjalan, [[T-177-skema-produksi-tiga-pintu-spk-berjalan]] |
| 2. Progres item, output dan kapasitas per work center | Selesai lokal | SPK Berjalan dan tab Work Center, [[T-178-kinerja-dan-analisa-produksi-tahap-2]] |
| 3. Posisi SPK keseluruhan | Selesai lokal | SPK Berjalan (jalur tiap item, filter status) |
| Tracking vendor keluar, masuk, kecepatan | Selesai lokal | Tab Vendor |
| Analisa per produk dari awal sampai customer | Selesai lokal | Tab Produk |
| Loading dan unloading | Selesai lokal | Tab Pengiriman, dari antrian Bongkar Muat |

Semua `verified in browser` pada mock; belum diuji di Supabase. Migration 14 masih draf.

## 11. Kebutuhan tambahan dari tinjauan (2026-11-04)

1. Tampilan input tidak kaku dan rapi; operator cukup menekan tombol, tanggal dan jam terisi otomatis.
2. Catatan terakhir menyebut nama customer, bukan hanya nomor SPK.
3. Laporan Produksi bisa dianalisa by jumlah, by tonase, dan by kecepatan input dan output.
4. Setiap operator dan setiap mesin terlihat KPI-nya: akumulasi, per hari, per minggu, per bulan, per tahun.
5. Terlihat sudah memproduksi Cable Tray berapa, Cable Ladder berapa, Aksesoris berapa (kelompok), dan rinciannya per type (STU, STC, SLU, SLW, SLHD), Cable Duct, serta material tertentu.
6. Prinsip tetap: input paling mudah, hasil analisa paling lengkap.

| Kebutuhan | Pemenuhan | Bukti |
|---|---|---|
| 1 | Tata letak dua kolom; Selesai satu ketukan; Catat hanya jumlah | [[T-179-produksi-hari-ini-v2-dan-laporan-produksi]] |
| 2 | Kolom SPK dan customer pada catatan terakhir | M-123 |
| 3 | Laporan Produksi: Jumlah, Tonase, Kecepatan | M-114 sampai M-115 |
| 4 | Akumulasi hari ini, minggu ini, bulan ini, tahun ini, seluruhnya per operator dan mesin | M-119, M-121 |
| 5 | Pohon produk kelompok > type > material dan finishing, plus akumulasi per kelompok | M-112, M-120 |

Klasifikasi produk tidak diisi operator: dibaca dari judul section SPK (misalnya CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED) dan material SPK, lalu disimpan pada kejadian (kolom `kelompok`, `tipe`, `material`, `finishing` di draf migration 14). Kejadian lama diturunkan dari SPK saat dilaporkan.

## 12. Jadwal SPK (Gantt) (2026-11-04)

Permintaan pemilik: papan jadwal seperti timeline proyek untuk SPK yang berjalan, dari tanggal sampai tanggal, dengan bagan Gantt, tetap dengan input yang semudah mungkin.

| Kebutuhan | Pemenuhan | Bukti |
|---|---|---|
| Lihat SPK berjalan sebagai garis waktu | Tab Jadwal pada SPK Berjalan: batang rencana, produksi, vendor, pengiriman, due date, hari ini | M-129 |
| Mudah dibaca | Status warna (Telat, Berisiko telat), perkiraan selesai, skala minggu dan bulan | M-130, M-132 |
| Rincian per item | Ketuk nama SPK untuk jadwal tiap item | M-131 |
| Input tetap mudah | Tidak ada kolom isian di jadwal; batang mengikuti Mulai, Selesai, Catat, vendor, dan pengiriman | M-129, M-135 |
| Nyaman di HP | Garis waktu bergulir di kotaknya sendiri, kolom nama menempel | M-136 |

Mesin hitung: `src/lib/produksi/jadwal.js` (uji J-01 sampai J-17). Rancangan: [[RUTE_PRODUKSI]] bagian 21; tugas [[T-180-jadwal-spk-gantt]].

## 13. Papan jadwal v2 dan perapian layout (2026-11-05)

Masukan pemilik: jadwal masih kaku dan perlu mengikuti standar schedule board agar pergerakan tiap SPK dan material yang sedang diproduksi mudah dilihat; layout Berjalan, KPI & Analisa, dan Target waktu proses perlu disesuaikan.

| Kebutuhan | Pemenuhan | Bukti |
|---|---|---|
| Schedule board standar | Header bulan dan tanggal harian, akhir pekan dan hari ini disorot, batang berwarna per work center | M-137 |
| Lihat material yang sedang diproduksi | Item terbuka sejak awal dengan langkah mesin per item dan penanda sedang berjalan | M-135, M-137 |
| Lihat pergerakan per mesin | Tampilan Per mesin: balok pekerjaan per SPK di tiap mesin, mesin kosong tetap tampil | M-138 |
| Berjalan tidak kaku | Kartu bernada status, jalur item dua kolom | M-142 |
| KPI & Analisa lebih nyaman | Kartu tiga kolom dengan pengukur, bagian bernomor | M-139 |
| Target waktu proses jelas | Dua kelompok, keterangan per isian, satuan hari kerja | M-140, M-141 |

Mesin hitung: `langkahItem`, `susunMesin` (uji J-18 sampai J-21). Tugas [[T-182-papan-jadwal-v2-dan-rapikan-layout-spk]].

## 14. Produksi Hari Ini: papan mesin dan kapasitas aktual (2026-11-05)

Tujuan pemilik: mengetahui kapasitas aktual produksi tiap mesin secara realtime, tepat dan akurat, dengan input yang tetap mudah, agar KPI per work center atau mesin dapat disusun dan output aktual per hari dapat dipantau.

| Kebutuhan | Pemenuhan | Bukti |
|---|---|---|
| Lihat semua mesin sekilas | Kartu per mesin: Berjalan atau Kosong, pekerjaan, output terhadap kapasitas, laju, pemakaian | M-143, M-147 |
| Kapasitas aktual tepat | Laju pcs per jam dari catatan berdurasi saja; menit aktif termasuk sesi berjalan | M-144, K-02, K-07 |
| Dasar KPI | Target laju dari kapasitas per hari / 8 jam; capaian dan proyeksi akhir shift | M-145, K-04, K-06 |
| Pantau output per hari | Grafik per jam hari ini dan tren 7 hari | M-146, K-05, K-09 |
| Input tetap mudah | Tidak berubah: Mulai, isi jumlah, Selesai | M-12 |

Keputusan terbuka untuk pemilik: jam kerja standar per mesin dan target KPI (pcs per jam) per work center atau mesin; saat ini 8 jam dan kapasitas per hari dari Master Data. Tugas [[T-183-produksi-hari-ini-papan-mesin-dan-kapasitas-aktual]].


## 15. Papan jadwal v3 dan urutan tab SPK (2026-11-05)

Masukan pemilik: urutan tab SPK menjadi Daftar SPK, Jadwal, Berjalan, KPI & Analisa; Gantt masih kaku dipakai meski tampilannya sudah bagus. Referensi: pola papan jadwal Bryntum, DHTMLX, dan Precursive (kolom nama tetap terlihat, buka dan lipat semua, panel detail saat klik, warna status, isi progres di dalam batang), serta praktik Gantt manufaktur (warna menandai risiko, rentang waktu bisa diperbesar dan diperkecil).

| Kebutuhan | Penyelesaian | Uji |
|---|---|---|
| Urutan dan tampilan awal tab | Daftar SPK, Jadwal, Berjalan, KPI & Analisa; Daftar SPK dibuka lebih dulu | M-105, M-105b |
| Tahu isi batang tanpa membuka SPK | Hover menampilkan kartu: mesin, tanggal, hasil, reject, progres | M-148, M-149 |
| Lihat rincian progres | Klik batang membuka panel SPK: item, langkah mesin per tanggal dan jumlah, item terpilih disorot, tombol Buka SPK | M-150 |
| Baca tanggal dengan cepat | Penunjuk tanggal mengikuti kursor | M-149 |
| Atur kepadatan | Zoom Detail, Harian, Ringkas; Buka semua dan Lipat semua | M-151, M-152 |
| Navigasi garis waktu | Geser dengan drag; Ke hari ini tetap ada | M-153 |

Tidak ada input baru dan tidak ada perubahan skema. Belum dibuat: mengubah jadwal dengan menggeser batang (jadwal diturunkan dari catatan, bukan diatur tangan) dan panah ketergantungan antarlangkah. Tugas [[T-185-papan-jadwal-v3-interaktif-dan-urutan-tab-spk]].


## 16. Berjalan dan Jadwal dibedakan (2026-11-05)

Masukan pemilik berurutan: Gantt kurang bagus untuk memantau; Jadwal dan Berjalan masih sama; Jadwal seperti papan jadwal Antlia (Production Calendar) tetapi lebih baik; papan per work center terlalu membingungkan; Jadwal cukup timeline bersih dan modern dengan nama PT karena rincian per work center sudah ada di Berjalan. Keputusan: **Berjalan** menjawab sekarang di mana dan sudah berapa; **Jadwal** menjawab kapan selesai dan apakah akan telat.

| Kebutuhan | Penyelesaian | Uji |
|---|---|---|
| Tahu posisi tiap item sekarang (Berjalan) | Matriks per item: kolom langkah Shearing sampai Kirim, centang, cincin posisi, label posisi dan nomor langkah | M-154, M-155 |
| Sebaran pekerjaan dan item macet | Strip posisi item sekarang (klik menyaring), penanda Diam N hari, mode Ringkas dan Rinci | M-156, M-159, M-160 |
| Tahu kapan SPK selesai (Jadwal) | Timeline: satu batang per SPK dengan nama customer, dari terbit sampai perkiraan siap kirim; isi batang = progres | M-161, M-162 |
| Tahu SPK mana berisiko telat | Status prediksi per SPK (Aman, Mepet due, Berisiko telat), bendera due date, bagian yang melewati due date bergaris merah | M-162, R-07 |
| Navigasi | Panah minggu, Hari ini, zoom 2 minggu, 1 bulan, 3 bulan | M-163, M-164 |
| Ringkasan tanpa rincian work center | Klik batang atau nama membuka ringkasan SPK dan tombol Lihat posisi di Berjalan | M-165, M-166, M-166b |
| Dipakai di HP | Matriks dan timeline bergulir di dalam kotaknya sendiri | M-158, M-167 |
| Pilihan lama tetap ada | Rinci per item (Gantt) dan Per mesin | M-168 |

Perkiraan siap kirim (mesin murni `rencana.js`, uji R-01 sampai R-10): SPK dengan due date terdekat dikerjakan lebih dulu, tiap langkah mengisi kapasitas work center per hari kerja (Senin sampai Jumat), langkah berikutnya mulai hari kerja berikutnya, vendor 3 hari kerja; work center tanpa kapasitas dianggap selesai dalam satu hari. Hanya usulan untuk dipantau. Tidak ada input baru dan tidak ada perubahan skema. Tugas [[T-186-jadwal-tampilan-progres-matriks-posisi-item]].
