---
type: test-matrix
status: active
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Matriks uji modul dan fitur (pratinjau lokal mode mock)

> [!summary] Status uji terkini (2026-11-06, cabang `fitur/produksi-multi-wc` di 35bf7f7, mock)
> Semua suite 0 FAIL. Suite `penawaran` dilewati karena modul disembunyikan ([[T-202-sembunyikan-modul-penjualan-fokus-operasional]]). Jalankan: `cd apps/platform && node tests/e2e/run.mjs http://127.0.0.1:5173/` (`ONLY=<suite>` untuk satu suite).
>
> | Suite | Berkas | Lulus | Cakupan |
> |---|---|---|---|
> | regresi | `regression.mjs` | 42 | alur inti dan regresi bug lama |
> | role | `roles.mjs` | 12 | penegakan peran |
> | akses | `access.mjs` | 34 | hak per pengguna dan modul (A-06 memuat sparepart) |
> | produksi | `produksi.mjs` | 134 | multi work center, jadwal, laporan |
> | sparepart | `sparepart.mjs` | 36 | sparepart SP-1 sampai SP-21, barang jadi dan SPK stok SP-17 sampai SP-35, nama penanda tangan SP-27 dan SP-28 |
> | fitur | `fitur.mjs` | 18 | audit fitur: koreksi, nonaktif, baris form, SPK Draft terbit, ceklis SPK stok, opname, unduhan Excel, jenis material ([[FEATURE_AUDIT]]) |
> | menyeluruh | `menyeluruh.mjs` | 24 | Master Data (ganti nama berantai, gabung, hapus), bahan baku, unduhan, bongkar muat, kendala SPK, work center, invarian, pemindai kejanggalan ([[T-212-uji-menyeluruh-semua-modul-dan-perbaikan-bug]]) |
> | keamanan | `keamanan.mjs` | 8 | uji XSS: payload di 53 bidang teks, semua menu, laci, lembar, kartu, dokumen ([[STANDAR_INDUSTRI]]) |
> | aksesibilitas | `aksesibilitas.mjs` | 3 | axe-core WCAG 2 A dan AA: 16 menu x 2 tema, 11 form, laci, kartu x 2 tema |
> | tampilan | `sweep.mjs` | 72 | sapu tampilan semua modul |
>
> Pemindai kejanggalan (`kejanggalan.mjs`: teks undefined, NaN, null, gambar rusak, meluap di HP, tabel tanpa keterangan, galat konsol di 16 menu desktop dan HP) dijalankan di suite fitur (F-19) dan menyeluruh (M-24). Invarian data (`invarian.mjs`, 10 invarian: stok tidak minus, nomor unik, tautan sah, koreksi, SPK stok) dijalankan di akhir suite sparepart (SP-36) dan fitur (F-15). Lint: `npm run lint` (0 galat, 43 peringatan); unit di CI: `npm run test:unit` (11 berkas, 214 uji tanpa katalog privat; total unit 266 termasuk berat dan harga yang butuh katalog lokal).
> | unit | `tests/unit/*.test.mjs` | 266 | berat, harga, produksi, kinerja, laporan, rencana, material, penawaran, Sales Order |
>
> Bukti database: tidak ada untuk migration 14 sampai 18 (belum diterapkan). Pra-cek production baca-saja 2026-11-06: nama kebijakan dan pemicu cocok dengan draf 18.

Catatan di bawah adalah hasil uji 2026-11-02 yang dipertahankan sebagai riwayat.

Hasil uji `apps/platform` di browser (Playwright) pada mode mock lokal: data sintetis di `localStorage`, tanpa Supabase. **Yang dibuktikan:** UI dan alur bisnis di sisi klien berjalan dan datanya tersimpan di penyimpanan lokal. **Yang tidak dibuktikan:** Supabase, Auth nyata, RLS, realtime antar pengguna, dan kinerja. Itu tetap tugas [[tasks/T-020-verifikasi-login-otp-end-to-end-lokal|T-020]], T-021, dan T-022 setelah Docker hidup ([[DOCKER_SETUP]]).

Tanggal uji: 2026-11-02 · Cabang: `development` · Panduan menjalankan: [[LOCAL_PREVIEW]] · Skrip: `apps/platform/tests/e2e/`.

## Ringkasan

| Hasil | Jumlah |
|---|---|
| Modul dibuka tanpa galat JavaScript | 10 / 10 |
| Fitur diuji dan lulus | 30 (F-01 sampai F-30) |
| Ekspor CSV / Excel / PDF berfungsi | 9 / 9 CSV, Excel dan PDF SPK |
| Bug ditemukan dan diperbaiki | 9 (B-001 sampai B-009) |
| Fitur belum diuji | lihat bagian terakhir |

## Uji per modul (smoke)

| Modul | Rute | Hasil | Catatan |
|---|---|---|---|
| Dashboard | `#dashboard` | PASS | KPI dihitung dari data seed; konsisten setelah transaksi |
| Gudang Bahan Baku | `#bahan-baku` | PASS | |
| Gudang Barang Jadi | `#barang-jadi` | PASS | |
| Bongkar Muat | `#bongkar-muat` | PASS | |
| Kirim ke Vendor | `#vendor` | PASS | |
| Kirim ke Customer | `#pengiriman` | PASS | |
| Monitoring SPK | `#spk` | PASS | |
| Dashboard Produksi | `#produksi` | PASS | |
| Cek Data | `#cek-data` | PASS | |
| Master Data | `#master-data` | PASS | |

Kriteria PASS: judul benar, isi tampil, tidak ada `pageerror`. Skrip: `tests/e2e/modules.mjs`.

## Uji fitur inti

| ID | Fitur | Skenario | Hasil | Bukti |
|---|---|---|---|---|
| F-01 | Login | Email terdaftar + kode lokal, lalu nama pengguna tampil | PASS | Sidebar "Admin Lokal" setelah perbaikan B-002 |
| F-02 | Bahan baku: item baru | Isi form, simpan | PASS | Baris bertambah, tersimpan, bertahan setelah muat ulang |
| F-03 | Bahan baku: terima material | Tambah 7 lbr | PASS | Stok 10 → 17, mutasi `masuk` dicatat, nomor dok RCV/… |
| F-04 | Bahan baku: pakai produksi | 3 lbr dengan SPK | PASS | Stok 24 → 21, mutasi dicatat |
| F-05 | Validasi: pakai melebihi stok | 999 lbr | PASS | Ditolak, dialog tetap terbuka, mutasi tidak bertambah |
| F-06 | Validasi: pakai tanpa SPK/keterangan | Kosong | PASS | Ditolak |
| F-07 | Barang jadi masuk | +5 btg | PASS | Total stok 380 → 385 |
| F-08 | Barang jadi keluar melebihi stok | 999 | PASS | Ditolak, tidak ada mutasi |
| F-09 | Master: tambah vendor | Isi nama, simpan | PASS | Baris `mvendor` bertambah |
| F-10 | SPK baru dan terbitkan | Isi pelanggan, PO, due, 1 baris | PASS | No otomatis 1003, status Terbit |
| F-11 | Kirim ke vendor | Vendor + SPK 1003 | PASS | Dokumen `vendor` dibuat; antrean bongkar muat otomatis |
| F-12 | Kirim ke customer | SPK 1001 | PASS | Surat jalan SJ/2026/11/001; antrean bongkar muat otomatis |
| F-13 | Bongkar muat: kendaraan masuk | Pihak + armada manual | PASS | Entri unloading tampil; validasi armada wajib |
| F-14 | Ekspor CSV | 9 modul | PASS | `MNI-rm-…csv`, `MNI-fg-…`, `MNI-spk-…`, dan seterusnya |
| F-15 | Kartu stok bahan baku | Buka dari baris | PASS | Panel menampilkan stok, status, titik pesan ulang, grafik pergerakan |
| F-16 | Pengaturan bahan baku (rmset) | Buka dialog | PASS | Dialog lead time dan target stok terbuka |
| F-17 | Stock opname barang jadi | Fisik 118 dari 120 | PASS | Mutasi `opname` delta -2, total stok 380 → 378 |
| F-18 | Ubah data item bahan baku | Buffer 10 → 77 | PASS | Tersimpan |
| F-19 | Master: ubah dan hapus vendor | Ubah PIC; hapus permanen | PASS | Dialog menawarkan hapus permanen atau nonaktifkan; baris terhapus |
| F-20 | Update produksi SPK | 2 dari 3 + work center | PASS | Progres 67%, `prod_log` bertambah |
| F-21 | Set semua item selesai | Tombol prodall | PASS (setelah B-006) | Progres 100%, posisi "Siap kirim" |
| F-22 | Revisi SPK terbit | Ubah PO + alasan | PASS (setelah B-007/B-008) | Rev.1, alasan tercatat, tanpa baris ganda; tanpa alasan ditolak ("Isi alasan revisi.") |
| F-23 | Duplikat SPK | Dari SPK 1001 | PASS | Draft nomor 1004, customer dikosongkan |
| F-24 | Kirim ke vendor, terima kembali | 4 btg: 2 OK + 1 reject, lalu sisa | PASS | Status Di Vendor → Kembali Sebagian → Selesai; reject wajib catatan |
| F-25 | Surat jalan: alur status | Disiapkan → Dalam Perjalanan → Diterima | PASS | Tombol langkah berurutan |
| F-26 | Bongkar muat: siklus | Antri → proses → selesai | PASS | Jam masuk, mulai, selesai tercatat |
| F-27 | Ekspor Excel SPK | Dari panel SPK | PASS | Berkas .xlsx valid (ZIP, 22 KB) |
| F-28 | Ekspor PDF SPK | Dari panel SPK | PASS | Berkas .pdf valid (%PDF-1.3, 284 KB) |
| F-29 | Pencarian dan filter SPK | Cari "Duplikat"; filter Terlambat | PASS | 3 → 1 baris; filter 1 baris |
| F-30 | Tema gelap, tombol Back, tampilan mobile | Ganti tema; Back; lebar 390 px | PASS | Latar berubah; Back kembali ke #spk; tanpa gulir horizontal. Menu mobile menampilkan sebagian item, sisanya perlu digulir |

## Bug dan perbaikan

| ID | Temuan | Penyebab | Perbaikan | Status |
|---|---|---|---|---|
| B-026 | SPK galvanis yang produksinya selesai tetapi belum pernah dikirim ke vendor boleh dikirim ke customer (dan SPK stok boleh diterima gudang) tanpa finishing | Batas siap kirim memakai produksi dikurangi yang di vendor ditambah kembali, sehingga barang yang tidak pernah dikirim ke vendor dihitung siap | Rute dengan langkah vendor memakai jumlah yang sudah kembali dari vendor (`siapKirim` dari `itemState`); rute tanpa vendor dan SPK lama tetap rumus lama | Selesai; uji A-05, B-04 (`alur-lengkap.mjs`) |
| B-027 | Tahap SPK langsung "Siap kirim" setelah mesin terakhir walau rutenya masih harus ke vendor | Tahap tidak membaca rute | Tahap baru "Siap ke vendor" (juga dihitung sebagai kelompok vendor pada filter dan funnel) | Selesai; uji A-04, B-04 |
| B-028 | SPK stok selalu berberat 0 kg walau katalog berat terpasang, sehingga tonase dan kebutuhan material tidak terhitung | `spkStokBuat` menulis `w:0` | Berat per pcs dari kalkulator bila ada (bertanda otomatis) | Selesai; uji D-01b (kalkulator ditiru) |
| B-029 | Drawer SPK (Update produksi) dan riwayat/ekspor tidak membaca hasil yang dicatat di Produksi Hari Ini: "Terakhir update" kosong, riwayat dan CSV kosong, tanggal produksi selesai tidak terisi | `prodLog` lama saja yang dibaca; hasil mesin ada di `produksi_log` | Riwayat gabungan `logProduksi(s)` dipakai drawer, lembar SPK, ekspor, dan alur lead time | E2E K-02, K-07, K-08 |
| B-030 | Drawer hanya menawarkan Catat di satu langkah (yang pertama berantrian) padahal batch bisa menunggu di beberapa langkah; hitungan "item selesai" memakai kolom lama sehingga 0/2 walau mesin sudah menyelesaikan | Tombol tunggal dan `item.prod` lama | Tombol Catat per langkah berantrian lengkap dengan jumlah siap; item selesai dari progres efektif | E2E K-03, K-04, K-06 |
| B-031 | Total manual lama (`item.prod`) hilang dari progres begitu operator mencatat hasil mesin pertama | `itemState` dan `prodFromEvents` hanya memakai kejadian bila ada | Total manual dihitung sebagai dasar yang sudah melewati semua langkah | E2E K-09 |
| B-032 | Revisi SPK terbit bisa menghapus, memindah, atau mengganti nama item yang sudah punya catatan produksi/vendor/kirim, atau menurunkan qty di bawah yang sudah diproduksi; catatan menempel pada nomor urut item sehingga berpindah ke item lain | Tidak ada penjaga saat simpan revisi | `revisiGuard`: item aktif tidak boleh dihapus, dipindah, diganti nama/section, qty tidak di bawah yang sudah berjalan | E2E AF-01..AF-05 |
| B-033 | SPK tidak bisa dibatalkan dari UI dan `calc` tidak pernah menghasilkan status Batal, sehingga SPK batal tetap muncul sebagai aktif di KPI, antrian, dan pilihan dokumen | Alur batal SPK belum dibangun | Batalkan SPK (alasan wajib, ditolak bila ada surat jalan aktif), Aktifkan kembali, status Batal dikecualikan dari hitungan aktif | E2E AF-06..AF-10 |
| B-034 | Mengubah rute produk di Master Data menggeser progres SPK yang sedang berjalan karena rute belum disalin ke item | Rute dihitung ulang dari master | Perubahan rute yang mengubah rute item bercatatan produksi ditolak dengan daftar SPK | E2E AF-11, AF-12 |
| B-035 | Surat jalan vendor yang sudah menerima barang kembali (OK atau reject) masih bisa dibatalkan sehingga progres dan stok bergeser | Tanpa penjaga di form batal | Pembatalan ditolak bila kembali + reject lebih dari 0 | E2E AF-13 |
| B-036 | SPK stok yang sudah selesai diproduksi dan kembali dari vendor tidak bisa diterima di Gudang Barang Jadi ("Belum ada hasil produksi yang siap diterima"), progres masuk gudang 0% | Editor SPK membangun ulang item dan menghilangkan tautan `fg` ke produk gudang | Editor membawa `fg`; tautan yang sudah hilang dipulihkan dari kecocokan nama item (tepat satu produk); pesan alasan kosong dibedakan (belum terhubung, sudah diterima semua, belum siap) | E2E SF-02, SF-03, SF-06 |
| B-037 | Form Barang masuk gudang jadi tidak mengisi produk dan jumlah dari SPK stok yang dipilih | Hanya tombol Terima di SPK yang mengisi baris; pilihan SPK di form tidak | Memilih SPK stok di form mengisi baris dan jumlah dari hasil produksi yang siap (bisa diubah) | E2E SF-04, SF-05 |
| B-038 | SPK stok menampilkan "Terkirim ke customer" dan "surat jalan customer" di jejak produksi dan matriks Berjalan | Label akhir alur sama untuk semua SPK | Label SPK stok: Masuk gudang barang jadi, diterima di gudang barang jadi, Siap masuk gudang | E2E SF-07, SF-08 |
| B-019 | Work Center yang dilewati rute SPK aktif atau sudah punya catatan produksi bisa dihapus permanen; dialog menyatakan "tidak dipakai SPK aktif manapun" | Pengecekan memakai kode WC bawaan lama (`WC-CT-01` dan sebagainya) dan kecocokan teks tahap, bukan rute item; data nyata memakai kode lain sehingga selalu lolos | `wcPakai()` membaca rute tiap item SPK aktif, catatan `produksi_log`, dan aturan rute standar; bila terpakai tawarkan Nonaktifkan; hapus hanya bila belum dipakai | Selesai; uji E-10, E-11, E-13 (`editor.mjs`) |
| B-020 | Mengganti nama Work Center yang dipakai memutus rute dan catatan produksi (rute dan log mengacu nama) | Form ubah WC menulis nama baru tanpa memeriksa pemakaian | Nama tidak bisa diubah selama WC terpakai; pesan menyarankan WC baru atau nonaktif | Selesai; uji E-12 |
| B-021 | Hapus permanen yang ditolak kebijakan database tampak berhasil di UI | Supabase tidak mengembalikan galat untuk DELETE yang diblokir RLS (hanya nol baris); adapter tidak memeriksa; mock tidak meniru migration 13 | Adapter memeriksa baris yang terhapus dan melempar galat jelas; mock meniru penolakan pada tabel yang kebijakan DELETE-nya dicabut; hapus item bahan baku jatuh ke Nonaktifkan | Selesai (laten: tombol hapus item belum ada di UI, `rmdel` kode yatim); tanpa uji klik |
| B-022 | Modal dan laci tanpa pengelolaan fokus: Tab keluar ke halaman di belakang, fokus tidak pindah ke laci, fokus tidak kembali ke tombol pemicu (WCAG 2.4.3) | Dialog hanya memfokuskan isian pertama modal; tidak ada perangkap fokus; axe tidak mendeteksi ini | Perangkap fokus untuk modal, laci, lembar, dan editor; fokus kembali ke pemicu saat ditutup | Selesai; uji E-14, E-15 |
| B-023 | Rangkaian uji Penawaran dilewati otomatis saat modul disembunyikan, sehingga Penawaran, Sales Order, dan kebutuhan material berstatus `review` tanpa regresi | Runner melewati suite bila `MODUL_PENJUALAN=false` | Mock menyalakan modul lewat kunci uji `mni-uji-penjualan` (production tetap tersembunyi); suite berjalan lagi (42 lulus) | Selesai |
| B-025 | Panel Kebutuhan material memberi status "Tanpa item RM" untuk jenis material kustom Master Data (mis. A5052) sehingga kebutuhan aluminium tidak dicocokkan ke stoknya | Pemetaan bahan hanya mengenal nama bawaan; jenis kustom dipakai apa adanya | `bahanDariJenis()` (murni, diuji K-13) memetakan jenis kustom lewat keluarga dasar, massa jenis, dan nama | Selesai; uji unit K-13 |
| B-024 | Tugas `done` tanpa bagian Bukti (T-046, T-175, T-176) dan kriteria sama dihitung di dua tugas (T-133, T-143, T-208, T-211) | Catatan ditulis di bagian lain atau dirujuk silang tanpa pemilik tunggal | Bukti dibaca ulang (API GitHub, tahap CI) dan ditulis; satu pemilik per kriteria; T-180 dan T-185 ditutup sebagai digantikan T-186 | Selesai |
| B-001 | `USER.profiles is not a function` pada setiap render | Adapter user tidak menyediakan `profiles()` yang dipanggil app | `profiles(ids)` ditambahkan di `claude-adapter.js` | Selesai |
| B-002 | Sidebar tetap "Tamu" setelah login | app.js membaca user sekali saat boot (sebelum login) | `index.html` memuat ulang halaman saat `SIGNED_IN`/`SIGNED_OUT` | Selesai |
| B-003 | SPK baru bernomor `1` dan seed tidak terbaca | `no` harus numerik (`nextNo` memakai `+s.no`); seed memakai `SPK-1001` | Seed mock memakai `1001`, `1002` | Selesai (seed). Catatan: schema `spk.no` bertipe TEXT, jadi jangan diisi non-numerik |
| B-004 | Label barang jadi tidak lengkap | Bentuk seed FG tidak sesuai field yang dipakai app | Seed FG memakai kategori/type/ukuran/panjang/finishing/tebal | Selesai (seed) |
| B-005 | Ekspor CSV/XLSX/PDF gagal di semua modul kecuali Cek Data dan Master | App memanggil `DLS.save({filename, data})`; adapter hanya punya `download(blob, name)` | Layanan `downloads` menyediakan `save()` untuk Blob dan Uint8Array | Selesai. **Berlaku juga untuk Supabase sungguhan** |
| B-006 | "Set semua item selesai" tidak berfungsi | `prodall` memakai `closest('tr')`, padahal form berupa kartu | Memakai atribut `max` input | Selesai (kode prototipe `gudang-logistik`) |
| B-007 | Id dokumen app (mis. `spk-1003`) bukan UUID | Kolom `id` di schema UUID; app membuat id string | `toDbId()` memetakan id string ke UUID deterministik; mock kini menolak id non-UUID seperti Postgres | Selesai di adapter. **Perlu diverifikasi pada Postgres nyata (T-028)** |
| B-008 | Edit SPK dianggap ganti nomor dan membuat baris ganda | `spk.no` TEXT di DB, app membandingkan angka dengan `!==` | Adapter mengubah `no` ke angka saat dibaca dan ke teks saat ditulis | Selesai di adapter; verifikasi nyata di T-028 |
| B-009 | Dokumen `master/*` (pengaturan) tidak terbaca atau tertulis | Tabel master memakai kolom `key` + `value`, bukan `id` | Adapter memetakan dokumen master ke objek datar berbasis key | Selesai di adapter; verifikasi nyata di T-028 |
| B-013 | Penulisan `log` ke Supabase gagal 16 dari sekitar 24 kali (HTTP 400, `invalid input syntax for type timestamp with time zone: ""`) | Dokumen app memakai `""` untuk "kosong"; Postgres menolak `""` di kolom DATE/TIMESTAMPTZ/NUMERIC/INTEGER/UUID (mis. `log.tgl`, `spk.due`). Mock tidak menolaknya | `STRICT_COLS` di `schema-columns.js`; adapter menghilangkan nilai kosong saat insert (DEFAULT berlaku) dan mengubahnya ke NULL saat update/set; mock kini menolak `""` seperti Postgres | Selesai; **terverifikasi di Supabase** (2026-11-02 16:05–16:13 UTC): semua `POST log` 201, 34 baris log, 0 `tgl` NULL, tanpa galat Postgres |
| B-014 | Di mode Supabase, item baru tidak muncul di UI/pilihan setelah disimpan | Event Realtime tidak tiba; UI hanya memuat saat awal | `notifyWrite`: adapter memuat ulang koleksi setelah add/set/update/delete | Selesai; terverifikasi di aplikasi Supabase (2026-11-03) |
| B-018 | Setelah login cepat, app tetap berjalan sebagai "Tamu" (tanpa role) | Pendengar `onAuthStateChange` baru terpasang setelah inisialisasi; SIGNED_IN yang terjadi lebih dulu tidak memuat ulang halaman (ditemukan CI di runner lambat) | `reloadOnce()` dipanggil langsung oleh pengendali login OTP dan password | Selesai; CI hijau |
| B-016 | `mutasi.item_id`, `kirim.spk_id`, `vendor.spk_id` kosong | Referensi hanya di JSONB | `linkIds` di adapter + migration 8 | Selesai; regresi B-016, terverifikasi di Supabase |
| B-017 | UI tidak menerima perubahan dari sesi lain | Event Realtime tidak tiba (SUBSCRIBED, slot aktif, tanpa event) | Polling cadangan 15 detik | Diputuskan memakai polling (keputusan pemilik 2026-11-03); T-162 opsional |
| B-015 | Nomor dokumen berulang (RCV/2026/11/001 untuk tiga penerimaan) | `counter.get()` mengembalikan `{value:{n}}`, app membaca `.n` | `get()` mengembalikan `{n}`; regresi B-015 (gagal pada adapter lama) | Selesai; regresi 37 PASS |
| B-012 | Setelah permintaan kode OTP ditolak (HTTP 429), layar tetap menulis "Cek email Anda" | `signInWithOtp` mengembalikan `{ error }` (tidak melempar) dan tidak diperiksa | Pesan galat ditampilkan (batas email dijelaskan) dan layar kode tidak dibuka; ditambah opsi "Masuk dengan password" sebagai cadangan di Supabase | Selesai; terverifikasi di browser (mode mock menyembunyikan opsi password) |
| B-011 | Di Supabase nyata, `master` dan `log` gagal dibaca (HTTP 400) | Adapter selalu mengurutkan menurut `created_at`; tabel `master` hanya punya `updated_at` dan `log` hanya `tgl`. Mock tidak menolak pengurutan kolom yang tidak ada | Adapter memilih kolom urut dari `TABLE_COLS`; mock kini menolak pengurutan kolom tak dikenal | Selesai; terverifikasi: muat halaman di Supabase dev tanpa respons 4xx |
| B-010 | Setelah menerbitkan SPK muncul lembar kosong layar penuh yang memblokir seluruh UI | App membuka lembar memakai id buatannya ("spk-1003"), yang kini dipetakan ke UUID, jadi `byId` tidak menemukannya; `openSheet` tetap menampilkan overlay | `window.__idAlias` (diisi adapter) dipakai `byId`; `openSheet` menunggu snapshot dan tidak menampilkan lembar kosong | Selesai. Ditemukan lewat uji regresi; regresi dari perbaikan B-007 |

B-001, B-002, dan B-005 berada di kode adapter produksi, bukan hanya mock, sehingga manfaatnya juga berlaku saat memakai Supabase. Pelajaran: kontrak `window.claude` harus dicocokkan dengan pemakaian app (`USER.profiles`, `DLS.save`, bentuk `me()`), bukan dengan dugaan.

## Regresi penuh (2026-11-02, setelah semua perbaikan adapter)

Satu skrip Playwright menjalankan login, 10 modul, dan 22 alur inti pada data bersih: **33 PASS, 0 FAIL**, 0 pageerror, data bertahan setelah muat ulang. Regresi ini menangkap B-010, yaitu efek samping perbaikan B-007 yang tidak terlihat di uji sebelumnya. Aturan: setiap perubahan adapter atau `gudang-logistik` wajib diikuti regresi penuh.

## Pembuktian di Postgres nyata (Supabase dev, 2026-11-02)

- Postgres menolak id non-UUID: `select 'spk-1003'::uuid` → error `22P02` (menguatkan B-007; pemetaan UUID di adapter diperlukan).
- Schema terpasang dengan kolom JSONB `data`, 39 policy RLS, dan realtime di 17 tabel.
- Sisipan SPK dengan `data` JSONB berhasil dibaca balik. Baris uji bernomor `9999` sempat tertinggal karena perintah hapus ditolak; harus dibersihkan sebelum penomoran SPK dipakai (lihat T-029).
- Regresi mock diperketat: mock kini menolak kolom yang tidak ada (seperti PostgREST) dan id non-UUID; **33 PASS, 0 FAIL** setelah adapter memecah bidang tambahan ke `data`.
- Belum: uji aplikasi terhadap Supabase dev dengan login OTP nyata (T-029, lalu T-021, T-022, T-028).

### Uji tingkat database pada Supabase dev (meniru JWT, semua di-rollback)

1. **Penulisan bentuk dokumen app** sebagai admin terautentikasi: SPK, mutasi, kirim, vendor, bongkar, master (termasuk kunci `lock:*`), log, rm, fg, mcustomer, marmada, dan opname **12 dari 12 berhasil**; pengguna tidak terdaftar ditolak RLS.
2. **Matriks hak tulis per role** (role = baris `muser`):

| Role | spk | mutasi | kirim | vendor | bongkar | master (lock/pengaturan) | log | rm | mcustomer |
|---|---|---|---|---|---|---|---|---|---|
| admin/manager | ya | ya | ya | ya | ya | ya | ya | ya | ya |
| gudang | tidak | ya | ya | tidak | ya | **tidak** | ya | ya | tidak |
| produksi | ya | **tidak** | **tidak** | ya | **tidak** | **tidak** | ya | tidak | tidak |
| viewer | tidak | tidak | tidak | tidak | tidak | tidak | **ya** | tidak | tidak |

Catatan: ini hasil kebijakan RLS bawaan, belum diselaraskan dengan proses nyata. Kunci dokumen (`master`) tidak dapat ditulis gudang maupun produksi, sehingga penguncian pengeditan diam-diam tidak efektif bagi mereka; viewer masih dapat menulis `log`. Produksi tidak dapat mencatat mutasi, surat jalan, atau bongkar muat. Pencocokan role dengan alur kerja adalah bagian T-022 dan T-036.

### Uji tulis nyata di Supabase dev oleh pemilik (2026-11-02, 15:42–15:56 UTC)

Pemilik menjalankan alur di aplikasi; agen memverifikasi lewat log API dan isi tabel.

| Area | Hasil | Bukti |
|---|---|---|
| Item bahan baku baru | PASS | `POST rm` 201; baris `rm` terisi (bidang `at`, `by` di `data`) |
| Barang jadi baru dan opname FG | PASS | `POST fg`, `POST mutasi` 201; `mutasi.item_id` NULL karena app memakai `item` (di `data`) |
| SPK baru | PASS | `POST spk?on_conflict=id` 201; `no = "1"` (B-008), id UUID hasil pemetaan (B-007), bidang `nomor`, `revisi`, `dist`, tanda tangan di `data` |
| Update produksi SPK | PASS | `PATCH spk` 204 (progres tersimpan) |
| Customer baru otomatis dari SPK | PASS | `POST mcustomer` 201 |
| Master: work center, armada, vendor | PASS | `POST mwc`, `marmada`, `mvendor` 201 |
| Kirim ke vendor dan terima kembali sampai Selesai | PASS | `POST vendor` 201, `PATCH vendor` 204; `riwayat`, `rework`, `target` di `data` |
| Surat jalan sampai Diterima | PASS | `POST kirim` 201, `PATCH kirim` 204 |
| Bongkar muat (termasuk otomatis dari SJ) | PASS | 3 baris `bongkar` berstatus Selesai; jenis/muatan/pihak/jam di `data` (B-009 skema) |
| Pengaturan dan penghitung | PASS | `master`: `katalog`, `SJ-202611`, `SJV-202611` (counter) tersimpan (B-009) |
| Kunci dokumen (`lock:*`) | PASS dengan catatan | Tertulis di `master` (kunci bertumpuk `lock:lock:…`, nilai JSON ganda, tidak pernah dilepas) |
| Log aktivitas | GAGAL sebagian → B-013 | 8 tersimpan, 16 ditolak (HTTP 400) |
| Lookup tanpa hasil | Noise | `GET … .single()` memberi 406; diganti `maybeSingle()` (tanpa galat) |

Belum tercakup oleh sesi ini: terima material dan pakai produksi (hanya opname FG yang tercatat di `mutasi`), revisi dan duplikat SPK, ubah dan hapus master, dan opname bahan baku. Dijadwalkan pada skenario U-02, U-03, U-06 di [[UJI_SUPABASE_DEV]].

Catatan data: di tabel dev ada baris dengan nama realistis (mis. nama vendor dan produk); semua tetap data uji dev. Baris SPK `UJI-9999` (batal) ikut dipakai sebagai SPK pada uji vendor; hapus permanen disarankan.

### Ulangan di Supabase dev setelah perbaikan (2026-11-02 16:03–16:13 UTC)

| Skenario | Hasil | Bukti |
|---|---|---|
| U-02 terima material | PASS | `mutasi` masuk +7, nomor `RCV/2026/11/001`; supplier baru otomatis di `msupplier`; counter `RCV-202611` |
| U-03 pakai produksi | PASS | `mutasi` keluar -3 dan -1 (`PK/2026/11/001`) terkait SPK; counter `PK-202611`; pemakaian melebihi stok tidak tercatat di database |
| U-06 revisi SPK | PASS | Satu baris SPK `1` dengan `rev = 1`, `revisi` berisi alasan "Tambah QTY" (B-008 terbukti di Postgres) |
| Log aktivitas | PASS (B-013) | Semua `POST log` 201; tidak ada respons 400/406 dan tidak ada galat di log Postgres |
| Alur lain (produksi, bongkar muat, vendor, surat jalan) | PASS | `PATCH`/`POST` 2xx |

Masih belum dicoba di Supabase: duplikat SPK, SPK tanpa due, ubah/hapus master, opname bahan baku, dan semua alur sebagai role selain admin (hak tulis per role baru terbukti di tingkat SQL).

### Matriks alur × role pada RLS nyata (Supabase dev, 2026-11-02, di-rollback)

Model role yang diuji = model aplikasi (`ROLES`/`modOf` di `apps/gudang-logistik`): admin, ppic (SPK, vendor), gbb (bahan baku, bongkar muat), gbj (barang jadi, vendor, pengiriman, bongkar muat), logistik (pengiriman, bongkar muat), viewer. Diuji setelah migration 4 (policy baru ditambahkan; policy lama belum dihapus). Hak baru ditulis sebagai fungsi `can_mod()`/`can_any()` dan tabel `role_modules`.

| Alur (urutan tulis seperti di aplikasi) | admin | ppic | gbb | gbj | logistik | viewer |
|---|---|---|---|---|---|---|
| Buat SPK (kunci, SPK, counter, customer, log) | ya | ya | tidak | tidak | tidak | tidak |
| Update produksi SPK | ya | ya | tidak | tidak | tidak | tidak |
| Terima material | ya | tidak | ya | tidak | tidak | tidak |
| Pakai produksi | ya | tidak | ya | tidak | tidak | tidak |
| Item bahan baku baru | ya | tidak | ya | tidak | tidak | tidak |
| Opname / item barang jadi | ya | tidak | tidak | ya | tidak | tidak |
| Kirim ke vendor (+ antrean bongkar otomatis) | ya | ya | tidak | ya | tidak | tidak |
| Terima kembali dari vendor | ya | ya | tidak | ya | tidak | tidak |
| Surat jalan (+ antrean bongkar otomatis) | ya | tidak | tidak | ya | ya | tidak |
| Ubah status surat jalan | ya | tidak | tidak | ya | ya | tidak |
| Bongkar muat manual dan proses | ya | tidak | ya | ya | ya | tidak |
| Master: tambah / ubah | ya | ya | ya | ya | ya | tidak |
| Master: hapus | ya | tidak | tidak | tidak | tidak | tidak |
| Baca SPK | ya | ya | ya | ya | ya | ya |
| Baca seluruh `muser` | ya | tidak | tidak | tidak | tidak | tidak |
| Tulis log saja | ya | ya | ya | ya | ya | tidak (setelah migration 6) |

Hasilnya sama dengan hak per modul di aplikasi. Penyimpangan awal (viewer dapat menulis log; role lama manager/gudang/produksi masih punya hak lewat policy lama) **sudah ditutup** oleh migration 6 (`role_model_supersede`): isi policy lama diganti dengan `ALTER POLICY` tanpa `DROP`. Uji ulang di rollback (2026-11-02): viewer, gudang, manager, produksi (role lama) tidak dapat menulis log, bahan baku, barang jadi, maupun SPK; ppic menulis log dan SPK; gbb menulis log dan bahan baku (tidak barang jadi); gbj menulis log dan barang jadi (tidak bahan baku); logistik menulis log saja dari tiga tabel itu. Pemeriksaan UPDATE/DELETE memakai jumlah baris terdampak karena RLS menyaring baris tanpa galat.

Status migration: 4 (`role_model_app_aligned`, tambahan) dan 6 (`role_model_supersede`, ALTER POLICY) **terpasang**. Migration 5 (`role_model_cleanup`, DROP) tidak dipasang: ditolak persetujuan SQL dan tidak lagi perlu; hanya pembersihan kosmetik opsional (policy ganda dengan isi sama).

### Penegakan role di UI (mock, 2026-11-02)

Skrip `apps/platform/tests/e2e/roles.mjs` (12 pemeriksaan): viewer tidak mencatat; gbb hanya bahan baku; gbj hanya barang jadi; logistik dan ppic tidak mencatat di gudang; admin mencatat di keduanya. Hasil: 12 PASS. Di mode Supabase peran berasal dari tabel `muser` lewat `me().role`; di platform asli (tanpa `role` dari adapter) perilaku lama tidak berubah.

### Uji aplikasi di Supabase dev dari lokal (2026-11-03, Playwright, akun admin pemilik)

Aplikasi lokal (`vite --mode supabase-dev`, port 5174) memakai Supabase dev nyata; hasil diperiksa lewat REST dengan token sesi dan SQL. Data uji berawalan `UJI-FINAL`.

| Skenario | Hasil | Bukti |
|---|---|---|
| Item bahan baku baru | PASS | baris `rm` baru |
| Terima material (+ supplier baru otomatis, daftar ulang saat simpan kedua) | PASS | `mutasi` masuk +6, `msupplier` bertambah |
| Pakai melebihi stok ditolak; pakai non-SPK | PASS | tidak ada baris untuk 999; -2 tercatat |
| Master vendor tambah | PASS | `mvendor` |
| SPK baru (terbit), SPK tanpa due (due NULL), duplikat SPK | PASS | SPK 2, 3 (due NULL), 4 |
| Log aktivitas | PASS | 46+ baris, tgl NULL = 0 |
| Opname bahan baku (tab "Stock opname", nomor OPN) | PASS | mutasi opname +1 dan baris `opname` baru, OPN/2026/11/001 (opname RM ada di tab, bukan tombol) |
| Ubah master | PASS | nama vendor berubah di `mvendor` |
| Hapus master permanen / master terpakai hanya nonaktif | PASS | baris terhapus; supplier terpakai `aktif=false` tanpa opsi hapus permanen |
| Nomor dokumen berikutnya (B-015) | PASS | RCV 002 sampai 004, SJ-V 002 |
| Kolom relasi terisi (B-016) | PASS | `mutasi.item_id` dan `vendor.spk_id` terisi pada tulisan baru; baris lama di-backfill (migration 8) |
| Data luar muncul di UI tanpa reload (B-017) | PASS lewat polling | perubahan SQL tampil ±14 detik; push Realtime tidak tiba |

**Per role lewat aplikasi** (role akun pemilik diganti sementara di `muser`, lalu dipulihkan ke admin):

| Role | Terima material (RM) | Barang masuk (FG) | SPK baru |
|---|---|---|---|
| gbb | tercatat | ditolak | ditolak |
| gbj | ditolak | tercatat | ditolak (pesan: "Peran Gudang Barang Jadi tidak bisa mencatat di SPK & produksi") |
| ppic | ditolak | ditolak | tercatat (draft SPK 5) |
| viewer | UI "Lihat saja"; REST langsung: tulis `log` 403, tulis `spk` 403 | | |

Logistik tidak diulang di aplikasi (terbukti di SQL dan mock).

**Temuan baru**
- **B-014 (diperbaiki):** setelah tulis lokal, UI Supabase tidak menampilkan data baru (item baru tidak muncul di pilihan) karena event Realtime tidak tiba. Adapter kini memuat ulang koleksi setelah add/set/update/delete (`notifyWrite`). Realtime antar sesi belum terbukti (T-021).
- **B-015 (diperbaiki):** `counter.get()` mengembalikan `{ value: { n } }` padahal app membaca `.n`, sehingga semua dokumen bernomor sama (RCV/2026/11/001 berulang di Supabase dan mock). Adapter mengembalikan `{ n }`. Pemeriksaan B-015 ditambahkan ke regresi (gagal pada adapter lama, lulus setelah perbaikan).
- **B-016 (diperbaiki):** `mutasi.item_id`, `kirim.spk_id`, `vendor.spk_id` selalu NULL karena referensi disimpan hanya di JSONB. Adapter `linkIds` mengisi kolom relasi (bidang app tetap di JSONB), migration 8 mengisi baris lama (9 mutasi, 2 kirim, 2 vendor terisi semua).
- **B-017 (mitigasi, akar masalah belum ketemu):** channel Realtime berstatus SUBSCRIBED dan slot replikasi aktif, tetapi tidak ada event INSERT/UPDATE yang tiba. Adapter memuat ulang berkala (15 detik saat tab terlihat dan saat kembali fokus) dan melewati render bila data sama. Tugas T-162 untuk menyelidiki (Realtime Inspector di dashboard atau diagnostik yang butuh persetujuan pemilik).
- **UI role (diperbaiki):** untuk viewer dan modul di luar hak, tombol catat disembunyikan dan banner menyebut peran ("Peran Viewer hanya bisa melihat. Minta admin..."); teks kaki "Backend belum terhubung" kini berubah menjadi "Terhubung ke database" saat tersambung; label pengguna menampilkan nama role.

## Belum diuji (jadwal di tracking)

Tercatat di [[tasks/T-027-uji-sisa-ui-mock-void-koreksi-pr-dan-role|T-027]]: batalkan dan koreksi bongkar muat, modul PR/usulan pembelian, tab KPI & Analisa, ekspor XLSX modul gudang, opname bahan baku, tampilan per role, dan menu mobile penuh.

**Catatan penting:** B-007, B-008, dan B-009 diperbaiki di adapter dan divalidasi pada mock yang meniru batasan Postgres (id UUID). Perilaku pada Postgres/Supabase sungguhan belum terbukti dan dijadwalkan di [[tasks/T-028-verifikasi-adapter-id-no-spk-dan-master-di-supabas|T-028]]. Ekspor Excel/PDF memuat pustaka dari CDN sehingga butuh internet (lihat T-143).

Di luar mock: login OTP nyata, RLS per role, realtime antar pengguna, dan konflik penulisan tetap menunggu Docker (T-011, T-020 sampai T-022).

## Uji menyeluruh sebelum Vercel (2026-11-03)

| Area | Hasil |
|---|---|
| main di GitHub | = development (PR #1, merge 11a2d40; 233 berkas; pemindaian rahasia bersih) |
| CI | hijau di development dan PR (vault, build, regresi 38, role 12) |
| Mock lokal | regresi 38 PASS, role 12 PASS |
| Supabase dev lewat aplikasi | login admin, 10 modul terbuka, label "Terhubung ke database"; alur CRUD dan 4 role lulus (lihat bagian sebelumnya) |
| Supabase dev lewat SQL | RLS 21 tabel aktif; hak per role setelah migration 9 benar; advisor keamanan tinggal 2 WARN yang disengaja/aksi pemilik |

## Audit kesiapan (2026-11-03)

| Pemeriksaan | Hasil |
|---|---|
| Kunci penomoran atomik (`try_lock`, migration 10) | PASS: SQL (ambil, ditolak saat dipegang, diambil setelah kedaluwarsa, baris kunci lama berbentuk teks ditimpa); aplikasi Supabase: RCV 005 dan 006 beruntun berbeda, kunci tersimpan sebagai objek; mock dan regresi 38 PASS |
| CSP dan pustaka ekspor | PASS dengan kebijakan yang sama: jsPDF, autotable, html2canvas, ExcelJS dari cdnjs dimuat; PDF (3155 B) dan Excel (6084 B) dibuat; fallback jsdelivr terblokir sesuai desain (hanya cadangan) |
| Pemindaian rahasia dan email | tidak ada kunci rahasia; alamat email pribadi pemilik dihapus dari dokumen |
| Hasil lengkap dan risiko | [[AUDIT_KESIAPAN]] |

## Production: putaran baca lewat aplikasi (2026-11-03, project MNI Gudang - Production)

Login admin lewat browser pane pada server lokal mode production (`vite --mode supabase-prod`, port 5175), terhubung ke `lggqigmvtefkquqjrjsb`. Bukti: verified in browser dan lewat REST dengan token sesi.

| Pemeriksaan | Hasil |
|---|---|
| Login admin (Auth + baris `muser`) | PASS: "Admin MNI", label "Terhubung ke database", versi 1.0.0-prod, kunci `sb_publishable_odc9Y44…` |
| Sepuluh modul | PASS: semua terbuka dengan judul benar, tanpa galat halaman |
| 21 tabel dibaca admin lewat RLS | PASS: semua HTTP 200; `muser` 1 baris, `role_modules` 10 baris, tabel lain kosong (production bersih) |
| Latensi ke Frankfurt dari komputer ini | median 233 ms per permintaan (226 sampai 311 ms); memuat 21 tabel paralel 632 ms |
| Sebelum login | tidak ada permintaan data ke Supabase |

Putaran tulis (alur catat dengan data berawalan `UJI-PROD`) belum dijalankan: menunggu keputusan pemilik karena data uji harus dibersihkan sebelum dipakai tim. Skrip uji ulang: `apps/platform/tests/e2e/prod-check.mjs` (tanpa `--tulis` hanya membaca).

## Production: putaran tulis lewat aplikasi (2026-11-03, project MNI Gudang - Production)

Admin login, server lokal mode production (port 5175), UI dijalankan lewat browser pane; hasil diverifikasi lewat REST dengan token sesi dan SQL. Data uji bertanda `UJI-PROD`.

| Skenario | Hasil | Bukti |
|---|---|---|
| Item bahan baku baru | PASS | baris `rm`; simpan terasa instan |
| Terima material, dua kali beruntun (supplier baru terdaftar otomatis) | PASS | RCV/2026/11/001 dan 002 (berbeda, naik) |
| Pakai melebihi stok ditolak; pakai wajar (non-SPK) tercatat | PASS | tanpa baris untuk 999; PK/2026/11/001 |
| `mutasi.item_id` terisi | PASS | semua baris mutasi |
| Opname bahan baku (tab) | PASS | OPN/2026/11/001; tersimpan setelah 1215 ms |
| Master vendor tambah, ubah, hapus permanen | PASS | 1240 ms, 1240 ms, 589 ms |
| SPK terbit, draft tanpa due (due NULL), duplikat | PASS | 949, 851, 938 ms; nomor SPK 1, 2, 3 unik |
| Kirim ke vendor | PASS | SJ-V/2026/11/001, `vendor.spk_id` terisi (kunci asing lolos) |
| Surat jalan customer ×2 | PASS | SJ/2026/11/001 dan 002, `kirim.spk_id` terisi |
| Antrean bongkar muat otomatis dari surat jalan | PASS | 1 baris, auto, status Antri |
| Kunci penomoran atomik | PASS | semua baris `lock:*` bertipe objek; penghitung RCV 2, SJ 2, SJV 1, PK 1, OPN 1 |

**Kecepatan** (komputer ini ke Frankfurt, median 233 ms per permintaan): menyimpan satu dokumen 0,6 sampai 1,5 detik (master 0,6 sampai 1,2; SPK 0,85 sampai 0,95; kirim vendor 1,5; opname 1,2). Dapat diterima untuk tim kecil; project baru di Singapura hanya perlu bila terasa lambat.

**Hak per role:** diuji dengan transaksi yang di-rollback pada database production (lihat [[ENVIRONMENTS]]); mengganti role akun admin sungguhan di production untuk uji UI ditolak sebagai perubahan atas sumber daya bersama, jadi penegakan UI per role di production mengandalkan kode yang sama dengan dev (regresi role 12 PASS di mock, 4 role diuji di dev).

**Data uji di production:** 4 SPK, 1 item bahan baku, 4 mutasi, 1 vendor kirim, 2 surat jalan, 1 bongkar, 1 opname, master vendor/supplier/customer uji, 23 log, 15 baris `master` (katalog, penghitung, kunci). Pembersihan: `apps/platform/supabase/ops/bersihkan_data_uji.sql` (dijalankan pemilik di SQL Editor; berhenti sendiri bila ada data tidak bertanda uji).

## Production di Vercel: uji baca dengan sesi admin (2026-11-03, https://mni-gudang.vercel.app)

Bukti: verified in browser (browser pane, admin login oleh pemilik), tanpa menulis data.

| Pemeriksaan | Hasil |
|---|---|
| Halaman login sebelum sesi | PASS: tanpa galat konsol, tanpa permintaan data |
| Bundel memakai project production | PASS: `lggqigmvtefkquqjrjsb`, kunci `sb_publishable_odc9Y44…` |
| 10 modul dibuka berurutan | PASS: tanpa galat JS dan tanpa pelanggaran CSP; tabel terisi dengan data uji `UJI-PROD` |
| Ekspor CSV (Monitoring SPK) | PASS: berkas `MNI-spk-2026-11-03.csv` terunduh |
| Pustaka ExcelJS dan jsPDF + autotable dari cdnjs di bawah CSP production | PASS: termuat, PDF dan xlsx dapat dibuat |
| Baca REST dengan token admin (5 kali) | 233 sampai 307 ms |
| Baca REST tanpa login (anon) | PASS: ditolak `42501` |

Belum diuji di Vercel: tombol ekspor PDF/Excel per modul (hanya pustakanya), tulis, dan penegakan UI per role.

## Hak akses per pengguna dan per modul (T-167, 2026-11-03)

**Mock (verified in browser, bukan bukti Supabase):** regresi 38 PASS, role 12 PASS, akses 15 PASS (`tests/e2e/access.mjs`): admin menambah anggota dengan hak modul khusus, menu hanya modul yang diizinkan, modul tanpa hak dialihkan ke dashboard dan datanya tidak terbaca, hak lihat saja mengunci tombol catat, bukan admin ditolak mengelola pengguna, perubahan hak berlaku setelah muat ulang.

**Database production (verified in database, transaksi di-rollback, data produksi tidak tersentuh):** migration 11 dan 12 terpasang.

| Skenario | Hasil |
|---|---|
| Hak khusus (bahan-baku ubah, bongkar-muat lihat): lihat SPK 0, lihat bahan baku, lihat barang jadi 0 | PASS |
| Tulis bahan baku diizinkan; tulis bongkar muat (lihat saja) dan barang jadi ditolak | PASS |
| Pengguna menaikkan perannya sendiri menjadi admin: 0 baris berubah | PASS |
| Pengguna tanpa hak khusus (perilaku lama): lihat semua, tulis sesuai peran | PASS |
| Hak "lihat" SPK: baca SPK, tidak membaca bahan baku, tulis SPK ditolak | PASS |
| Akun nonaktif tidak membaca apa pun | PASS |
| Admin melihat semua tabel dan semua pengguna | PASS |
| `table_stamps` dan fungsi kelola: anon ditolak (42501 / 401) | PASS |
| Penjaga admin terakhir: nonaktifkan dan hapus admin terakhir ditolak | PASS |
| Edge Function `kelola-pengguna` tanpa token 401, dengan kunci publik 401 | PASS |

Advisor: hanya peringatan yang sudah dikenal (fungsi pembantu RLS dapat dipanggil pengguna login, sengaja; leaked password protection menunggu paket berbayar).

**Belum:** buat akun dan reset password sungguhan lewat menu (dikerjakan pemilik membuat anggota pertama), uji dua sesi untuk sinkron antar pengguna.

**Menu Pengguna & Akses di situs live (2026-11-03, verified in browser dan database):** admin membuka menu, membuat anggota pertama lewat Edge Function; akun Auth terkonfirmasi dan baris `muser` dengan hak modul tersimpan benar. Dengan identitas anggota itu (transaksi rollback): membaca SPK (hak lihat), tidak membaca log dan pengguna lain, tulis SPK dan bahan baku (lihat) ditolak, tulis bongkar muat (ubah) diterima. Perbaikan bug tautan langsung `#pengguna` ada di `development` (c8717dc).

**Belum:** reset password sungguhan dan uji dua sesi dengan dua orang yang login bersamaan.

## Sinkron dua sesi di production (2026-11-03, verified in browser dan database)

Sesi A: admin (pemantau waktu pada koleksi data). Sesi B: anggota berperan Logistik login dengan password sementara dan mencatat satu kendaraan di Bongkar Muat, lalu mengubah statusnya dua kali.

| Peristiwa di sesi B | Terlihat di sesi A setelah |
|---|---|
| Catat kendaraan | 0,9 detik |
| Mulai bongkar muat | sekitar 1 detik |
| Selesai bongkar muat | 1,4 detik |

Hasil: perubahan satu pengguna tampil di pengguna lain dalam sekitar 1 detik, lebih cepat dari batas 4 detik cek sidik. Baris tercatat atas nama anggota itu (created_by dan updBy benar). Login anggota dengan password sementara dari menu berfungsi.

**Data uji tertinggal:** 1 baris bongkar muat dan 1 SPK yang tidak berpenanda UJI-PROD; skrip pembersih menolak berjalan sampai dicek (pengaman sengaja).

## Cadangan, impor, dan logo di production (2026-11-03, verified in browser, hanya baca)

Setelah PR #11 digabung (b290f9e) dan deploy Vercel berhasil, dengan sesi super admin:

| Pemeriksaan | Hasil |
|---|---|
| Ekspor cadangan membaca 19 tabel (jumlah baris cocok dengan database: pengguna 2, SPK 1, hak peran 11, dst.) | PASS (tanpa mengunduh berkas; penanda cadangan belum ditulis) |
| Tombol Impor CSV tampil untuk super admin | PASS |
| Lambang logo di sidebar dan favicon baru termuat | PASS |

**Belum:** unduh cadangan sungguhan (pemilik menekan tombolnya agar penanda tersimpan), impor CSV dengan data nyata, ekspor PDF dan Excel dengan logo baru (dicek pemilik).

## Riwayat perubahan dan larangan hapus permanen (migration 13, 2026-11-03, verified in database)

Transaksi di-rollback, data produksi tidak tersentuh.

| Skenario | Hasil |
|---|---|
| Menambah pengguna: baris audit INSERT tercatat | PASS |
| Pengguna dengan hak ubah menambah dan mengubah item bahan baku: audit INSERT dan UPDATE tercatat atas nama pengguna itu | PASS |
| Hapus permanen item lewat API: 0 baris terhapus | PASS |
| Non-admin membaca audit_log: 0 baris | PASS |
| Non-admin menulis atau mengubah audit_log: ditolak | PASS |

**Tampilan (mock):** sapu otomatis 12 halaman pada desktop, tablet, dan ponsel; uji kontras tema gelap dan terang; total tampilan 62 lulus. Penyebab teks gelap di tema gelap: aturan CSS cetak checklist bocor ke stylesheet global.

**Verifikasi di situs live setelah PR #12 (verified in browser):** stylesheet live tidak lagi memuat aturan cetak yang bocor; di tema gelap warna judul, tabel, dan tombol terang (230,236,247) dan terbaca. Catatan: tab yang sudah terbuka sebelum deploy masih memakai CSS lama sampai dimuat ulang (header cache `must-revalidate`, jadi muat ulang biasa cukup).

## Berat otomatis pada SPK di production (2026-11-03, verified in browser, hanya baca)

Setelah PR #13 digabung (b7f661f) dan deploy berhasil, dengan sesi super admin setelah muat ulang:

| Pemeriksaan | Hasil |
|---|---|
| Mesin berat termuat (`window.MNIBerat`) dan tombol Katalog berat tampil di Master Data | PASS |
| Berkas situs publik (JavaScript, CSS) tidak memuat rumus atau katalog; `/catalog.json` hanya mengembalikan halaman aplikasi | PASS |
| Katalog asli belum dipasang (`siap` = false), berat tetap diisi manual sampai dipasang | sesuai rencana |

**Belum:** pasang katalog asli lewat Master Data lalu bandingkan beberapa SPK nyata dengan hitungan Excel.
