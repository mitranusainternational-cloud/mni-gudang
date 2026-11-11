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
