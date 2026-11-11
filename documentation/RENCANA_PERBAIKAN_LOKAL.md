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

## Keputusan pemilik 2026-11-11: menuju aplikasi siap pakai penuh

Jawaban pemilik: (1) **tutup celah alur dulu**; (2) semua modul harus lancar harian: SPK dan Produksi (laporan admin), Gudang (Bahan Baku, Barang Jadi, Sparepart), Logistik (Kirim Vendor, Kirim Customer, Bongkar Muat), Master Data, Pengguna & Akses; (3) syarat tambahan: **laporan harus valid dan dapat dipertanggungjawabkan**; (4) pengujian: saya menyiapkan skenario, pemilik mencoba di lokal; (5) rilis: **rencana saja, tunggu persetujuan**, tidak ada yang dirilis sendiri.

Urutan kerja (satu paket per sesi, satu commit, regresi penuh hanya di akhir tiap tahap):

| Tahap | Isi | Selesai bila |
|---|---|---|
| 0 | Tutup antrean: regresi penuh, tebal di surat jalan dan dokumen terkait, subjudul Produksi Hari Ini, rincian partial surat jalan | regresi 0 FAIL, commit lokal |
| 1 (D, F-11) | Antrian Siap dikirim ke vendor dan serah terima WIP dari laporan admin | jumlah kirim vendor tidak bisa melebihi yang selesai; uji lulus |
| 2 (E, F-12) | Aturan SPK Terkirim (customer: semua item sampai customer; SPK stok: masuk gudang) | status otomatis benar pada satu armada banyak SPK |
| 3 (J) | Galat 404 `penawaran` dan `salesorder` di konsol: aplikasi tidak memanggil tabel yang belum ada selama modul penjualan disembunyikan | konsol bersih saat membuka semua menu |
| 4 | **Validitas laporan:** cek silang angka antar tempat (SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa, Gudang Barang Jadi, surat jalan) dan aturan Cek Data bila tidak cocok | angka sama di semua layar untuk data uji; selisih terdeteksi |
| 5 | Skenario uji untuk pemilik (SPK sampai kirim customer; SPK stok; vendor; stok; Master Data dan akses) dengan hasil yang diharapkan | dokumen skenario + tiap skenario lolos di lokal |
| 6 | Rencana rilis (backup baru, database dulu, lalu kode, verifikasi tiap tahap, rollback) | dokumen rencana; **tidak dijalankan sebelum disetujui** |

**Tahap 0 selesai (2026-11-11, lokal):** regresi penuh 33 suite, 744 PASS, 0 FAIL (kode sampai subjudul Produksi Hari Ini). Setelahnya: nama barang di Surat Jalan Vendor, Surat Jalan Customer, Bukti Terima Barang, dan rincian partial = deskripsi SPK + tebal ("· t 1.2 mm", tidak dobel bila tebal sudah tertulis) lewat `sjNama`; uji PH-26; suite kopdokumen, gabungan, ambilstok, regresi, produksihh lulus 0 FAIL; pratinjau SJ vendor dicek di browser. Regresi penuh belum diulang setelah perubahan surat jalan.

**Tahap 1 selesai (F-11, 2026-11-11, lokal):**
- **Temuan:** batas kirim ke vendor memakai `vSiap`, yang kosong untuk item tanpa catatan mesin. Di mode admin vendor bisa dikirimi **melebihi** hasil produksi tanpa peringatan.
- **Perbaikan:** di mode admin `vSiap` = jumlah selesai item, jadi jumlah kirim vendor tidak bisa melebihi yang dilaporkan selesai (centang kirim ulang/rework tetap ada untuk disengaja).
- **Antrian baru:** panel "Siap dikirim ke vendor" di atas halaman Kirim ke Vendor (per SPK: item dengan tebal, proses vendor, selesai, sudah di vendor, siap kirim, due, tombol Kirim ke vendor). Hanya item yang rutenya punya langkah vendor dan kesiapannya diketahui.
- **Bukti:** PH-27 lulus (produksihh 27 PASS); suite regresi, produksi, kopdokumen, gabungan, ambilstok 0 FAIL; di pratinjau SPK 1006 tampil 50 siap kirim, form terisi 50, kirim 60 ditolak tanpa menyimpan. Regresi penuh belum diulang.
- **Belum:** serah terima WIP berupa dokumen terpisah tidak dibuat; surat jalan vendor sudah berfungsi sebagai serah terima.

**Tahap 2 selesai (F-12, 2026-11-11, lokal):**
- **Aturan Terkirim sudah benar dan tidak diubah:** SPK customer Selesai bila semua item sampai customer (jumlah terkirim per item >= order); SPK stok Selesai bila semua item masuk Gudang Barang Jadi; satu armada banyak SPK dihitung per SPK lewat surat jalan masing-masing.
- **Celah diperbaiki:** pengiriman dan vendor dicocokkan lewat deskripsi item. Dua baris dengan deskripsi sama dalam satu SPK sebelumnya menghitung satu pengiriman untuk kedua baris (SPK bisa Selesai terlalu cepat). Kini jumlah dibagi berurutan antar baris, baris terakhir menampung kelebihan (kirim lebih tetap terlihat). Cek Data memberi info untuk SPK dengan deskripsi kembar.
- **Bukti:** PH-28 lulus; **regresi penuh 33 suite, 747 PASS, 0 FAIL** (kode sampai Tahap 2). Belum dibuktikan bahwa PH-28 gagal tanpa perbaikan.
- **Batas yang diketahui:** pemisahan sejati per baris butuh nomor baris (`item_idx`) di dokumen kirim dan vendor; itu perubahan struktur data dan belum dilakukan. Pembagian berurutan adalah pendekatan sementara.

**Pembersihan Penawaran dan Sales Order selesai (2026-11-11, lokal):** dihapus dari aplikasi, adapter, mock, skema, mesin harga, uji, draf migration 15 dan 16, serta skill dan agen khusus penawaran (lihat [[documentation/DECISIONS]]). Peran `sales` disembunyikan. Bukti: lint 0 error; uji unit 186 PASS; regresi penuh 32 suite, 704 PASS, 1 FAIL (KO-15, ambang jumlah jenis dokumen 13 turun jadi 12 karena jenis Quotation dihapus) lalu kopdokumen 16 PASS setelah penyesuaian. Skema lanjutan ada di [[SKEMA_LANJUTAN_WMS_MINIM_INPUT]].

**T4 selesai (validitas laporan, 2026-11-11, lokal):** Cek Data memuat aturan baru kategori Stok dan Barang jadi: stok negatif (bahan baku, barang jadi, sparepart), plat keluar melebihi kebutuhan SPK (+5%), dan barang jadi SPK stok masuk gudang melebihi hasil produksi. Temuan: data uji ternyata sudah punya satu stok barang jadi negatif bawaan (kini terdeteksi). PH-29 lulus (produksihh 29 PASS), termasuk silang angka: total selesai di laporan Produksi Hari Ini = jumlah selesai per item di perhitungan SPK. Aturan plat belum teruji otomatis (butuh katalog berat); terlihat bila katalog terpasang.

**T5 selesai (permintaan bahan baku otomatis, 2026-11-11, lokal):** setelah SPK terbit (editor atau terbit dari draft), kekurangan plat langsung diminta sebagai satu PR berstatus Diajukan, bertanda otomatis dan memuat nomor SPK (`prOtomatisSpk`). Aman diulang: kekurangan dihitung setelah dikurangi PR yang terbuka, jadi tidak dobel. Dilewati bila penerbit tak berhak bahan baku atau setting `prOtomatis=false`; bahan tanpa item RM memberi peringatan. PH-30 lulus; suite regresi, editor, alurlengkap, spkstruktur, keseimbangan, auditflow, stokflow, spkaturan, kebutuhanplat 0 FAIL. Catatan: PR otomatis berstatus Diajukan (bukan draf) mengikuti arahan pemilik "langsung otomatis minta bahan baku"; "Serahkan semua" belum dibuat.

**T6 selesai (sisa dan susut bahan baku, 2026-11-11, lokal):** fungsi murni `susutMaterial` di `erp/material.js` (plat keluar kg vs hasil jadi kg per SPK, bahan, tebal; batas wajar = faktor sisa potong + 5%; status Belum keluar, Berjalan, Wajar, Berlebih, Plat kurang catat), tab **Susut** di Gudang Bahan Baku (KPI plat keluar, hasil, susut, perlu dicek, plus tabel per SPK), dan aturan Cek Data untuk susut berlebih atau plat kurang catat. Bukti: unit material 17 PASS (K-S1..S4), PH-31 lulus (produksihh 31 PASS). Hasil jadi memakai berat estimasi per item; item tanpa berat tidak dihitung. Pengembalian sisa utuh memakai alur Terima material (alasan Sisa SPK); form khusus belum dibuat.

**T7 selesai (barang jadi, 2026-11-11, lokal):** tab Siap masuk stok di Gudang Barang Jadi punya tombol **Terima semua (n SPK)**: satu dokumen BJM per SPK stok, sebesar yang siap diterima (selesai produksi dikurangi yang sudah masuk), dengan tanggal bisa diubah. Hak `barang-jadi` tetap dijaga. PH-32 lulus (produksihh 32 PASS); stokflow, ambilstok, gabungan 0 FAIL.

**T8 selesai (sparepart, 2026-11-11, lokal):** setiap pengeluaran sparepart yang membuat stok habis, sama atau di bawah minimum, atau di bawah buffer meminta **PR sparepart otomatis** (status Diajukan, bertanda otomatis, usulan mengisi sampai buffer; aman diulang lewat `spOnOrder`; dilewati bila tak berhak atau setting `prOtomatis=false`), dan Cek Data memberi info **lonjakan pemakaian** (30 hari >= 2x dasar dua bulan sebelumnya dan selisih >= 3). Tab pemakaian mesin dan usulan pembelian yang sudah ada tidak diubah. PH-33 lulus (produksihh 33 PASS); sparepart 38, mesinsparepart 20, regresi 42 PASS.

**T10a dan T10b selesai (2026-11-11, lokal):**
- **T10a Pengguna & Akses realtime:** temuan: hak akses pengguna yang sedang masuk hanya dimuat sekali saat aplikasi dibuka (adapter menyimpan data pengguna sekali, aplikasi menyimpan profil sekali), jadi perubahan peran atau hak modul baru berlaku setelah muat ulang. Perbaikan: adapter mengambil ulang data pengguna pada setiap `me()` dan `can()`, dan aplikasi memanggil `refreshMe()` setiap data `muser` berubah (toast "Hak akses Anda diperbarui"). PH-34: mengganti peran admin ke logistik mengubah menu 14 menjadi 11 seketika lalu pulih ke 14.
- **T10b Kinerja Tim:** laporan hasil produksi admin dan catatan mesin dihitung per orang (qty dan tonase) dan tampil sebagai KPI dan kolom "Hasil produksi" di Kinerja per pengguna; laporan admin kini tercatat atas nama pelapor (`by`). PH-35: 4 pcs, 20 kg atas nama ppic. Aktivitas SPK lain sudah dihitung per orang dari log sebelumnya. Bukti lain: role 12, akses 34, regresi 42 PASS.
- **Catatan:** perbaikan adapter berlaku untuk mode Supabase juga, tetapi baru terbukti di mock; perlu diverifikasi di lingkungan Supabase dev sebelum rilis.

**Hasil regresi beku T4+T5:** 32 suite, 707 PASS, 0 FAIL (salinan beku pada commit a9dec78).

**T9 selesai (laporan satu pintu, 2026-11-11, lokal):** menu **Laporan** (terbuka untuk semua pengguna terdaftar seperti Dashboard) berisi tujuh bagian dalam satu halaman: Produksi (hasil pcs dan kg, SPK terbit, aktif, terlambat), Pengiriman, Bahan baku (plat masuk, keluar, susut, PR terbuka), Barang jadi, Vendor (termasuk siap dikirim), Sparepart, dan Kesehatan data; periode Hari ini sampai 90 hari; tiap baris bisa diklik ke layar sumbernya; **Unduh CSV** satu klik (`ringkasLaporan`). PH-36: angka Hasil produksi cocok dengan sumbernya; uji akses A-06 disesuaikan (menu Laporan terlihat peran terbatas).

**T10 selesai (2026-11-11, lokal):** Dashboard menampilkan **Tindakan hari ini**: tombol per pekerjaan dengan jumlah yang menunggu (serah plate, isi hasil produksi, kirim ke vendor, kirim ke customer, terima barang jadi SPK stok, susut berlebih, sparepart di bawah minimum), hanya yang boleh dilihat perannya, langsung membuka layar dan tab yang tepat. PH-37 lulus (produksihh 37 PASS).

**T11 selesai (2026-11-11):** [[SKENARIO_UJI_PEMILIK]] (12 skenario dengan hasil yang diharapkan, untuk dicoba pemilik di lokal) dan [[RENCANA_RILIS_WMS_2026-11-11]] (draf rencana rilis, **tidak dijalankan**, menunggu persetujuan pemilik). Tidak ada migration baru; rilis hanya kode.
