---
type: design
status: draft
updated: 2026-11-03
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Skema produksi multi work center: rute, antrian, dan kapasitas

Tujuan: satu batang tidak hanya berada di satu mesin. Cable Tray melewati Shearing, Punching, Bending; Accs melewati CNC Laser, Bending, Welding; Ladder melewati Shearing, Punching, Bending, Welding; sebagian item kondisional. Dari catatan itu sistem harus bisa menunjukkan **beban dan kapasitas tiap work center (WC)**, di mana **antrian menumpuk**, dan **perkiraan selesai tiap SPK**, tanpa membuat tim repot. Tugas: T-174. Status: **dibangun di lokal pada branch `fitur/produksi-multi-wc` (tidak di-push, tidak digabung ke `main`, migration 14 belum diterapkan, belum ditayangkan).**

## 1. Kondisi sekarang dan batasnya

| Hal | Sekarang | Akibatnya |
|---|---|---|
| Progres item | Satu angka "total diproduksi s/d sekarang" per item | Tidak tahu berapa batang yang sudah lewat Shearing tapi belum Punching |
| Work center | Satu WC "saat ini" per item | Tidak bisa melihat beberapa mesin bekerja pada item yang sama |
| Beban WC | Menjumlahkan angka progres per WC | Angka kumulatif ikut dijumlahkan, jadi beban tidak mencerminkan antrian sebenarnya |
| Kapasitas | Belum ada | Tidak bisa tahu WC mana yang penuh atau kapan antrian habis |

## 2. Prinsip: tim tidak diribetkan

Kondisi (rute berbeda per produk dan bentuk) ditangani **sistem**, bukan diminta dari tim. Tiga lapis, dari yang otomatis:

| Lapis | Siapa yang bekerja | Contoh |
|---|---|---|
| 1. **Rute standar per produk** | Sistem, dari judul section SPK | Cable Tray: Shearing → Punching → Bending |
| 2. **Aturan khusus per bentuk** (tabel yang bisa diubah PPIC) | Sistem, dari kata di deskripsi item | Cover: Shearing → Bending (tanpa Punching dan Welding) |
| 3. **Pengecualian per item** | Tim, satu ketukan "lewati langkah" | Satu item tidak perlu Punching |

Tambahan agar tidak perlu menyempurnakan aturan di muka:
- **Sistem belajar dari kejadian nyata.** Bila sebuah WC mencatat hasil untuk item yang rutenya belum memuat WC itu, sistem mengusulkan "Tambahkan Welding ke rute item ini?" dan cukup satu ketukan.
- **Tim tidak memilih rute saat input.** Operator hanya melihat antrian di mesinnya.
- **Kapasitas tidak perlu ditebak.** Sistem menghitung throughput aktual tiap WC dari catatan harian dan menyarankan angka kapasitas; pemilik tinggal menyetujui.
- **Mode lama tetap ada** untuk SPK yang rutenya belum diatur: input satu angka seperti sekarang.

## 3. Cara input (dua mode)

**Mode Mesin (utama untuk lantai produksi).** Operator membuka WC miliknya (diingat sistem). Ia melihat daftar item yang **siap dikerjakan di mesinnya**, diurutkan menurut due date SPK, lalu mengisi jumlah selesai. Item otomatis pindah ke antrian mesin berikutnya di rutenya.

```text
 CNC Laser · Antrian 3 item                              Hari ini selesai: 46
 ─────────────────────────────────────────────────────────────────────────
 SPK 633  Horizontal Elbow W300xH100xR600   Siap 12   [ selesai: 4 ] [Simpan]
 SPK 633  Inside Riser W300xH100xR600       Siap 6    [ selesai: _ ]
 SPK 640  Cover Tee W300xR600               Siap 20   [ selesai: _ ]  due 20 Nov
```

**Mode SPK (untuk PPIC).** Lembar SPK menampilkan tiap item dengan langkah-langkahnya sebagai batang bertahap, mis. `Shearing 16/16 → Punching 10/16 → Bending 4/16`, dengan input per langkah dan "Set semua selesai". Rute item dapat diubah di sini (lewati atau tambah langkah).

Validasi sederhana: jumlah di sebuah langkah tidak boleh melebihi yang sudah selesai di langkah sebelumnya (pesan jelas, mis. "Hanya 6 yang siap di Bending").

## 4. Model data

Prinsip: **kejadian produksi dicatat sebagai baris yang hanya ditambah** (tidak mengubah angka lama). Dua operator di dua mesin yang mengisi pada saat yang sama tidak saling menimpa (berbeda dengan angka kumulatif yang dibaca-ubah-tulis).

| Data | Tempat | Isi |
|---|---|---|
| Kejadian produksi | Tabel baru `produksi_log` (draf migration 14, belum diterapkan) | spk, indeks item, deskripsi, WC, qty tambahan, tanggal, oleh, waktu |
| Rute item | Pada item SPK (`rute: [...]`, snapshot saat dibuat atau diubah) | Urutan WC; kosong = ikuti aturan |
| Rute standar dan aturan khusus | `master/rute_produksi` (satu dokumen kecil) | Dapat diubah super admin atau PPIC |
| Kapasitas WC | Data work center (`mwc.data.kapasitas`) per hari kerja, per kelompok produk bila perlu | Mulai dari angka satu per WC |
| Progres item lama (`item.prod`) | Tetap, diisi dari langkah terakhir | Modul lain (KPI, pengiriman, SPK) tetap berjalan |

Draf SQL: `apps/platform/supabase/draft/20240101000014_produksi_log.sql` (draf migration 14). Disimpan di folder `draft`, bukan `migrations`, supaya tidak ikut terpasang tanpa persetujuan. RLS: pengguna dengan hak ubah SPK atau produksi menambah baris; semua yang boleh melihat SPK membaca; tidak ada ubah dan hapus (data tak dapat dimanipulasi, sejalan dengan riwayat perubahan).

## 5. Perhitungan keluaran

| Keluaran | Cara hitung |
|---|---|
| **Antrian WC** | Untuk tiap item aktif dan tiap langkah: yang sudah lolos langkah sebelumnya dikurangi yang sudah selesai di langkah ini; dijumlahkan per WC |
| **Hari habis antrian** | Antrian ÷ kapasitas per hari |
| **Status WC** | Kosong, Normal (≤ 1 hari), Padat (≤ 3 hari), Overload (> 3 hari), atau "Kapasitas belum diatur" (tidak pernah dianggap tak terbatas) |
| **Selesai hari ini** | Jumlah kejadian bertanggal hari ini |
| **Prediksi selesai SPK** | Tiap WC mengerjakan antriannya menurut due date terdekat; item selesai saat langkah terakhirnya selesai; tanggal = hari ini + hari kerja (akhir pekan dilewati). Sederhana dan transparan: penentunya (WC penahan) ditampilkan |
| **Berisiko telat** | Prediksi selesai melewati due date; muncul di "Perlu tindakan" |
| **Saran kapasitas** | Rata-rata hasil per hari aktif tiap WC dalam 14 hari terakhir |

Keluaran di Dashboard Produksi: tabel Beban per Work Center (antrian, kapasitas, hari habis, status, selesai hari ini), penanda WC penahan (bottleneck), SPK berisiko telat beserta WC penyebabnya, dan throughput aktual per WC.

## 6. Yang sudah dibangun di lokal

| Bagian | Isi |
|---|---|
| Mesin hitung | `apps/platform/src/lib/produksi/rute.js` (rute, antrian, validasi, beban, prediksi, throughput, usulan langkah) dan `kinerja.js` (posisi, lama proses, kualifikasi vendor); uji `tests/unit` (23 + 11 skenario) |
| Data | Tabel kejadian `produksi_log` (draf di `supabase/draft`; di mock sudah berjalan). Bila tabel belum ada di database, aplikasi memperlakukannya kosong (aman bila kode digabung lebih dulu) |
| **Antrian Mesin** (menu baru) | Operator memilih mesinnya, melihat item yang siap menurut due date, mengisi jumlah selesai (atau tombol Semua); item pindah otomatis ke mesin berikutnya; melebihi yang siap ditolak |
| **Dashboard Produksi** | Tabel Beban per work center: antrian, kapasitas, hari habis, selesai hari ini, aktual per hari 14 hari terakhir (saran kapasitas), lama proses, status; penahan (bottleneck); SPK berisiko telat; kolom Posisi SPK memuat sebaran batang per mesin dan di vendor |
| **Vendor** | Tabel kecepatan dan kualifikasi: rata-rata TAT, tepat waktu, reject, masih di vendor (umur tertua), nilai A, B, atau C, dan perkiraan tanggal kembali tiap kiriman yang masih di vendor |
| Master Data > Work Centre | Kolom kapasitas per hari kerja |
| Kompatibilitas | Item tanpa kejadian memakai angka progres lama; item dengan kejadian memakai langkah terakhir sebagai progres, sehingga KPI, pengiriman, dan SPK lain tetap berjalan |
| Uji | e2e produksi 15 skenario (rute, antrian, validasi, beban, vendor), sapu tampilan 67 (termasuk menu baru), total e2e 166 lulus |

Temuan saat menguji: penambahan hari kerja memberi tanggal mundur sehari karena konversi zona waktu (UTC+7); diperbaiki sebelum dipakai.

**Cara melihatnya di komputer ini (data contoh, tanpa menyentuh data nyata):** buka `http://127.0.0.1:5173/?demo=produksi` sekali (server mock lokal), masuk dengan `admin@mni.local` dan kode `123456`, lalu buka **Dashboard Produksi** dan **Antrian Mesin**. Data contoh hanya ada di browser itu.

## 7. Keputusan yang dibutuhkan dari pemilik

| # | Pertanyaan | Usulan |
|---|---|---|
| 1 | Nama WC yang dipakai sebagai langkah: Shearing, Punching, Bending, Welding, CNC Laser (sesuai master WC sekarang). Ada WC lain di rute (Rolling, BJP, Jointing, QC, Packing)? | Mulai dari lima WC di atas; sisanya bisa ditambah |
| 2 | Daftar pengecualian bentuk (selain Cover): bentuk apa yang melewati mesin berbeda? Mis. Jointing, Fish Plate, Bracket, Clamp | Isi tabel aturan di bagian 8; kosong berarti ikut rute produk |
| 3 | Satuan kapasitas: **batang per hari** per WC, atau **jam mesin** dengan waktu standar per bentuk? | Mulai batang per hari (mudah); saran angka dari throughput aktual; waktu standar ditambah kemudian bila dibutuhkan |
| 4 | Kapasitas per kelompok produk (mis. Shearing tray vs ladder berbeda)? | Satu angka per WC dulu |
| 5 | Siapa yang mengisi: operator di mesin atau PPIC dari rekap? | Mode Mesin untuk operator, Mode SPK untuk PPIC; dua-duanya jalan |
| 6 | Jam kerja dan hari libur untuk hitung hari kerja | Senin sampai Jumat; hari libur nasional diatur kemudian |
| 7 | Persetujuan menerapkan migration 14 (tabel `produksi_log`) setelah prototipe disetujui | Setelah uji lokal dan tinjauan |

## 8. Tabel aturan khusus yang perlu diisi tim

Isi sekali (dapat berubah); yang tidak diisi mengikuti rute produk.

| Bentuk atau kata di deskripsi | Produk | Rute | Status |
|---|---|---|---|
| Cover | Ladder, Tray, Duct | Shearing → Bending | contoh awal |
| Jointing, Fish Plate, End Plate | (semua) | ? | menunggu tim |
| Bracket, Hanger, Clamp, Separator | (semua) | ? | menunggu tim |
| Elbow, Tee, Cross, Riser, Reducer (Accs) | Accs | CNC Laser → Bending → Welding | sesuai uraian; sejak T-220 fitting hanya ada di section ACCS Tray/Ladder/Duct dan mengikuti rute produk ACCS (diuji R-97..R-98). Rute berbeda per fitting: tambah rute khusus bentuk `ACCS TRAY\|ELBOW` di Master Data (R-99) |
| Lainnya | | ? | menunggu tim |

## 9. Rencana pembangunan (tidak ditayangkan sebelum disetujui)

1. Setujui skema dan jawab keputusan di bagian 7 dan 8.
2. Bangun di lokal (mock): rute pada item, Mode Mesin, Mode SPK, tabel beban WC, prediksi; uji e2e.
3. Uji bersama PPIC memakai data contoh.
4. Terapkan migration 14 dan tayangkan hanya setelah persetujuan eksplisit.

## 10. Kebutuhan tambahan dari pemilik (2026-11-03) dan jawabannya

| Kebutuhan | Cara dipenuhi |
|---|---|
| Tahu **posisi** material dan SPK: sedang di work center mana | Kolom Posisi di Dashboard Produksi dan antrian per mesin (batang per tempat: tiap mesin, di vendor, selesai produksi) |
| **Lama proses** per work center dan kecepatan produksi | Aktual per hari (throughput 14 hari), lama proses rata-rata (dari item tersedia di mesin itu sampai seluruh qty selesai, hari kerja) |
| Operator mengisi di tiap WC, manajemen melihat progres aktual dan kapasitas | Menu Antrian Mesin untuk operator; Dashboard Produksi untuk manajemen; saran kapasitas dari hasil nyata |
| Vendor dan subcon: tanggal kirim, tanggal kembali, kecepatan rata-rata, kualifikasi | Tabel kecepatan dan kualifikasi vendor; perkiraan kembali dari median riwayat vendor (target proses bila data belum cukup); nilai A, B, C minimal 3 kiriman selesai |
| Banyak kondisi, tim tidak boleh repot | Rute otomatis dari produk dan aturan bentuk; tim hanya mengisi hasil di mesinnya; usulan langkah dari kejadian nyata bagian 2 |

Yang belum dibangun (menunggu keputusan bagian 7 dan 8): tampilan pengecualian rute per item di editor SPK, tabel aturan khusus yang bisa diubah dari aplikasi (sementara aturan Cover dan rute standar tertanam di kode dan dapat ditimpa lewat `master/rute_produksi`), usulan "Tambahkan ke rute", tombol Mulai untuk waktu proses riil, dan impor ke produksi (migration 14 serta tayang).

## 11. Keputusan konsep pelacakan (2026-11-04)

Contoh kasus Cable Tray: Shearing → Punching → Bending → vendor finishing → Gudang barang jadi → surat jalan customer.

| Keputusan | Isi |
|---|---|
| Siapa mencatat | Operator hanya di mesin internal (Shearing, Punching, Bending, dan sejenisnya). Tahap vendor, Gudang BJ, dan surat jalan otomatis dari dokumen yang sudah ada, tanpa input ganda |
| Cara input | **Selesai hari ini** (jumlah baru, bukan total). Total, sisa, dan posisi dihitung otomatis; tombol Semua mengisi seluruh yang siap |
| Urutan mesin | Hasil mesin berikutnya tidak boleh melebihi yang sudah selesai di mesin sebelumnya (ditolak) |
| Reject di mesin | Dicatat di kolom Reject pada langkah itu. Reject tidak lanjut, batangnya dicabut dari hitungan langkah sebelumnya sehingga muncul lagi di antrian awal untuk dibuat ulang. Progres item hanya menghitung yang baik |
| Reject vendor | Dari dokumen Terima dari Vendor (sudah ada) |

Teknis: tabel `produksi_log` mendapat kolom `reject` (draf migration 14 diperbarui, `qty` boleh 0 selama `qty` atau `reject` lebih dari 0). Uji unit R-70 sampai R-74 dan e2e M-15, M-16.

## 12. Vendor sebagai langkah rute (2026-11-04)

| Bagian | Isi |
|---|---|
| Rute | Finishing dibaca dari judul section: ELECTRO = Vendor ELG, HOTDIP = Vendor HDG, POWDER atau PDC = Vendor PDC; NON FINISHING tanpa vendor. Contoh Cable Tray ELECTRO: Shearing, Punching, Bending, Vendor ELG. Rute yang diatur pada item tidak ditambah vendor |
| Batas kirim | Form Kirim ke vendor hanya menawarkan sebatas hasil langkah mesin terakhir (sudah dikurangi yang pernah dikirim) untuk item yang sudah punya catatan produksi per mesin. Melebihi ditolak dengan pesan jelas; kirim ulang atau rework tetap bisa dengan centang dan keterangan. Item tanpa catatan produksi per mesin tidak dibatasi (kompatibel) |
| Posisi | Langkah vendor mengambil angka dari dokumen Kirim ke Vendor (dikirim) dan Terima dari Vendor (kembali OK); posisi SPK menyebut di vendor mana dan hari ke berapa |
| Dashboard | Catatan Siap dikirim ke Vendor X: batang yang sudah selesai produksi tetapi belum ada surat jalan vendor |
| Beban mesin | Langkah vendor tidak dihitung sebagai antrian mesin dan tidak butuh kapasitas |

Uji unit R-80 sampai R-85 dan e2e M-17 sampai M-19c.

Belum dibangun: pengecualian rute per item (centang langkah yang dilewati), reject vendor yang otomatis kembali ke antrian produksi, serta QC atau packing setelah vendor bila diperlukan.

## 13. Pengganti form laporan harian produksi (2026-11-04)

Sumber: `form laporan harian produksi September 2026.xlsx` (15 lembar: Shearing 3 lembar, Punching 5 mesin, Bending 3, Laser 2, Welding 2). Kolom form: tanggal, jam mulai dan selesai, durasi, No SPK, customer, deskripsi, tebal, qty, berat per pcs, tonase, menit per pcs, keterangan (lembar bahan), supplier; kepala lembar: work center, nomor mesin, operator, shift.

Keputusan pemilik:

| Hal | Keputusan |
|---|---|
| Pengisi | Operator di mesinnya |
| Cover, Jointing, Clamp kecil | Mesin alternatif Shearing atau Laser, dipilih operator; sistem mencatat mesin yang dipakai |
| Cable Ladder | Selalu Shearing, Punching, Bending, Welding |
| Jam mulai dan selesai | Wajib, lewat tombol Mulai dan Selesai |

Rancangan, berurutan (tahap 1 sampai 4 sudah dibangun di lokal 2026-11-04; tahap 5 sebagian):
1. **Mesin di bawah work center**: master Mesin (induk WC, operator bawaan, kapasitas per mesin); kejadian produksi mencatat mesin.
2. **Mulai dan Selesai**: item diambil dari antrian, customer, deskripsi, tebal, berat per pcs, dan tonase otomatis dari SPK dan kalkulator berat; durasi dan menit per pcs dihitung.
3. **Mesin alternatif di rute** (langkah berisi pilihan, mis. Shearing atau Laser).
4. **Laporan harian per mesin** berkolom sama dengan form, cetak dan ekspor; rekap tonase, jam mesin, dan waktu per pcs per jenis item (dasar kapasitas dan prediksi).
5. **Keterangan bahan** dari mutasi bahan baku SPK, dan **SPK Stok** bulanan untuk pekerjaan tanpa SPK (mis. Jointing 150 pcs, SPK STOCK).

Temuan kasar dari data (klasifikasi nama deskripsi, perlu konfirmasi): baris Laser sekitar 864, termasuk Cover sekitar 277 dan Jointing sekitar 44; Ladder hampir tidak tercatat di Bending (kemungkinan penamaan, belum dipastikan).

## 14. Yang dibangun dari form laporan (lokal, 2026-11-04)

| Bagian | Isi |
|---|---|
| Mesin di work center | Master Data, Work Centre: kolom Mesin (satu per baris: nama | operator | kapasitas). Tombol **Isi mesin sesuai form laporan** mengisi nama mesin (tanpa nama operator) dari 15 lembar form. Kapasitas work center otomatis jumlah kapasitas mesinnya bila kolom kapasitas WC kosong |
| Antrian Mesin | Pilih work center, mesin, dan operator (diingat di perangkat). **Mulai** menyalakan timer di mesin itu (satu item per mesin); **Selesai dan simpan** mengisi jumlah selesai dan reject; durasi, menit per pcs, dan tonase dihitung. **Catat** untuk hasil yang lupa di-Mulai (jam mulai dan selesai wajib). Kejadian menyimpan mesin, operator, jam, durasi, berat per pcs, tonase, serta salinan nomor SPK, customer, tebal |
| Mesin alternatif | Cover: Shearing atau Laser; Jointing: Shearing atau Laser lalu Punching; Clamp dan Hanger: Laser atau Shearing lalu Bending. Item tampil di antrian kedua mesin; hasil di mesin mana pun dihitung ke langkahnya, mesin sebenarnya tercatat |
| Laporan Produksi | Menu baru: laporan harian per mesin atau work center dengan kolom form Excel dan total, cetak dan unduh CSV, rekap bulanan per mesin (hasil, reject, tonase, jam mesin, menit per pcs), dan waktu per pcs menurut jenis item |
| Jejak produksi | Tab baru di lembar SPK: per item, tiap langkah mesin (dengan mesin yang dipakai dan reject), Vendor, dan Terkirim ke customer |

Asumsi yang perlu dikonfirmasi: aturan Jointing dan Clamp (hanya Cover yang dikonfirmasi pemilik), serta dasar waktu standar dari data nyata. Draf migration 14 mendapat kolom jenis, mesin, operator, mulai, selesai, menit, berat, tonase, spk_no, customer, dan tebal. Uji: unit laporan 19 skenario, e2e produksi 39, total e2e 195.

Belum dibangun: keterangan bahan dari mutasi bahan baku SPK (belum ada tautan data mutasi ke SPK), pengecualian rute per item, dan reject vendor otomatis kembali ke antrian.

## 15. Lembar Update produksi disederhanakan (2026-11-04)

Masukan tinjauan: isian "Total diproduksi s/d sekarang" dan pilihan "Work Center saat ini" membingungkan karena bertabrakan dengan pencatatan per mesin. Perubahan:

| Sebelum | Sesudah |
|---|---|
| Per item: isian total manual dan pilihan work center | Per item: rantai langkah dengan angka tiap langkah (mis. Shearing 100/100, Punching 70/100), posisi batang, dan tombol **Catat hasil di <mesin berikutnya>** |
| Satu cara input di dua tempat (lembar SPK dan mesin) | Hasil produksi hanya dicatat per mesin (Mulai dan Selesai di Antrian Mesin, atau Catat dengan jam manual); lembar SPK hanya membuka dialog Catat yang sama, lengkap dengan pilihan mesin dan operator |
| Total manual selalu tampil | Total manual hanya untuk item tanpa rute dikenali atau SPK lama yang belum punya catatan mesin (di dalam "SPK lama: isi total manual") |

Perbaikan terkait: progres produksi item tidak lagi menghitung langkah vendor (produksi = hasil mesin terakhir), supaya persentase produksi tidak nol selama barang menunggu finishing. Uji unit R-86, e2e M-70 sampai M-72; total e2e 198.

## 16. Input fleksibel: berjalan bersamaan (2026-11-04)

Kasus: Cable Tray berjalan Shearing, Punching, Bending, lalu subcon finishing; operator dan antrian mesin kadang bekerja bersamaan pada item yang sama.

| Situasi | Perilaku |
|---|---|
| Dua mesin satu item (mis. Punching 1 dan Punching 2) | Mulai memesan **target** = batang yang siap dan belum dipesan sesi lain. Mesin lain melihat "Sedang dikerjakan di mesin lain" dan sisa **bebas**; Mulai terkunci bila bebas nol. Catat manual tetap bisa |
| Satu mesin beberapa item | Boleh; tiap sesi punya kartu sendiri |
| Baru sebagian yang jadi | **Simpan sebagian, lanjut**: hasil tersimpan dengan jam sesuai, sesi baru terbuka untuk sisa target |
| Salah input | **Batalkan** pada Catatan terakhir (Antrian Mesin) atau baris Laporan Produksi. Dibuat peristiwa void; catatan asli tetap sebagai riwayat. Ditolak bila hasilnya sudah dipakai langkah berikutnya atau sudah dikirim ke vendor |
| Operator dan PPIC mencatat hal yang sama | Pelindung dobel: catatan identik (SPK, item, mesin, jumlah) dalam 15 menit meminta konfirmasi |
| Posisi terkini | Lembar Update produksi dan tab Jejak produksi menyebut mesin dan operator yang sedang mengerjakan |

Skema: kolom `target` dan `ref`, jenis kejadian `void` (draf migration 14, belum diterapkan). Uji unit L-60 sampai L-64; e2e M-80 sampai M-90.

## 17. Layar operator berbasis kartu dan Papan Produksi

Dasar: pengamatan papan Operations Kanban (Antlia) pada 2026-11-04. Antlia memakai satu kartu per operasi dengan tujuh tombol; kita menyederhanakannya.

| Bagian | Cara kerja |
|---|---|
| Antrian Mesin | Satu kartu per item: SPK, customer, lencana Telat atau Due, rantai rute, angka **siap dikerjakan** yang besar, bilah progres, tombol **Mulai** besar dan **Catat** |
| Kartu berjalan | Waktu berjalan, jumlah selesai dengan tombol **−** dan **+**, pintasan +5, +10, **Semua**, reject opsional, satu tombol **Selesai**; Simpan sebagian dan Batalkan mulai di bawahnya |
| Urutan layar | Kartu berjalan, antrian, ringkasan, cara pakai (dilipat), catatan terakhir; tombol minimal 44 px dan satu kolom di HP |
| Papan Produksi | Untuk supervisor, hanya lihat: kolom per work center dan langkah vendor, berjalan di atas lalu antri, ringkasan sedang berjalan, antri, lewat due, selesai hari ini; ketuk judul kolom membuka Antrian Mesin work center itu |

Aturan angka, mesin alternatif, vendor, banyak sesi, dan pembatalan tidak berubah (bagian 11 sampai 16). Uji e2e M-91 sampai M-98 (kartu, tombol +/−, batas jumlah siap, Papan, tampilan HP 390 px).

## 18. Skema menu tiga pintu (menggantikan bagian 17 sebagai tampilan utama)

Pemilik menilai papan dan layar sebelumnya masih membingungkan. Skema akhir (kebutuhan di [[PRD_PRODUKSI]]):

| Menu | Isi | Catatan |
|---|---|---|
| SPK Berjalan | Kartu SPK dengan status, progres, sedang dikerjakan di mesin mana, dan jalur tiap item (Shearing, Punching, Bending, vendor, terkirim); filter Berjalan, Telat, Di vendor, Siap kirim, Selesai | Tampilan awal menu SPK; tab Daftar SPK dan KPI & Analisa tetap ada untuk membuat dan menelusuri SPK |
| Produksi Hari Ini | Kartu per mesin; Mulai lalu Selesai (bagian 17) | Satu-satunya tempat input produksi |
| Kinerja & Analisa | Tab Work Center (beban, kapasitas, hari habis), Vendor (kualifikasi), Laporan harian | Tahap 2: tab Produk dan Pengiriman |

Rute `papan` dan `laporan-produksi` tetap bisa dibuka lewat alamat tetapi tidak muncul di menu. Uji e2e M-99 sampai M-105.

## 19. Analisa untuk manajemen (Kinerja & Analisa)

Mesin hitung murni `src/lib/produksi/analisa.js` (uji unit A-01 sampai A-21). Tidak ada input baru; semua dari kejadian yang sudah dicatat.

| Tab | Hitungan |
|---|---|
| Work Center | Output per work center dalam periode; rata-rata per hari yang ada hasilnya; utilisasi = rata-rata per hari dibagi kapasitas per hari (90% ke atas padat, 50% sampai 90% sehat, di bawahnya longgar); puncak, reject persen, menit per pcs, tonase, dan tren harian |
| Produk | Per jenis produk (dua kata pertama deskripsi): tunggu mulai (SPK terbit ke Mulai pertama), produksi (Mulai pertama ke langkah internal terakhir selesai), tunggu kirim vendor, di vendor (kirim ke kembali), ke customer, dan total SPK terbit sampai terkirim; tiap tahap dirata-rata hanya dari item yang tahapnya sudah terjadi |
| Vendor | Per vendor dan proses: kiriman, keluar, masuk (keluar dikurangi sisa), sisa, rata-rata, tercepat, terlama (hari kerja), reject persen; daftar surat jalan yang masih di vendor dengan umurnya |
| Pengiriman | Dari antrian Bongkar Muat: per jenis (Loading atau Unloading) dan muatan, serta per pihak: jumlah, rata-rata tunggu (jam masuk ke mulai), rata-rata proses (mulai ke selesai), dan terlama |

Uji e2e M-106 sampai M-111. Data contoh `?demo=produksi` ditambah satu SPK yang sudah sampai customer, satu vendor ELG, dan sepuluh aktivitas dock.

## 20. Produksi Hari Ini v2 dan Laporan Produksi

**Input.** Mulai mencatat tanggal dan jam mulai otomatis. Selesai menyimpan jumlah yang diisi; bila dikosongkan yang disimpan adalah semua yang siap (maksimal target sesi); label tombol menyebut jumlahnya. Catat (tanpa Mulai) hanya meminta jumlah; tanggal hari ini dan jam selesai sekarang terisi otomatis, jam mulai boleh kosong sehingga lama pengerjaan tidak dihitung (kosong, bukan nol). Simpan sebagian wajib mengisi jumlah.

**Laporan Produksi** (`src/lib/produksi/statistik.js`, uji unit S-01 sampai S-34):

| Bagian | Isi |
|---|---|
| Periode | Hari ini, minggu ini (Senin sampai hari ini), 30 hari, bulan ini, tahun ini, semua |
| Analisa | Jumlah (pcs), Tonase (kg), Kecepatan: pcs per jam, kg per jam, menit per pcs (hanya dari catatan berwaktu) |
| Kelompok | Produk bertingkat (kelompok > type > material dan finishing), work center, mesin, operator, customer |
| Tren | Per hari (sampai 31 hari), per minggu (sampai sekitar 6 bulan), per bulan |
| Akumulasi | Hari ini, minggu ini, bulan ini, tahun ini, seluruhnya, rata-rata per hari aktif, hari terbaik; per operator, mesin, work center, atau kelompok produk; jumlah semua baris |
| Jeda catat | Selisih saat dicatat dan jam selesai, rata-rata per operator atau mesin (disiplin pencatatan) |

Uji e2e M-112 sampai M-128 (termasuk lebar HP 390 px tanpa gulir mendatar).

## 21. Jadwal SPK (Gantt)

Semua batang diturunkan dari data yang sudah tercatat; tidak ada tabel atau kolom baru.

| Batang | Sumber |
|---|---|
| Rencana | Tanggal terbit SPK sampai due date |
| Produksi | Kejadian hasil dan mulai SPK (tanggal pertama sampai terakhir; bila belum selesai sampai hari ini); isi = persen produksi SPK |
| Vendor | Dokumen Kirim ke Vendor: tanggal kirim sampai tanggal kembali (arsir bila masih di vendor, sampai hari ini) |
| Pengiriman | Dokumen Kirim ke Customer: tanggal kirim sampai terima |
| Perkiraan selesai | Laju sejauh ini: hari berjalan dikali sisa dibagi progres; ditandai merah bila melewati due date |

Status: Selesai, Telat (due date lewat), Berisiko telat (perkiraan selesai melewati due date), Berjalan, Belum mulai. Hasil yang dibatalkan (void) tidak dihitung. Uji unit J-01 sampai J-17; uji e2e M-129 sampai M-136.
