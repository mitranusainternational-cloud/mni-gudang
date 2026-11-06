---
type: guide
status: active
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Pratinjau lokal mni-app (mode mock)

Cara menjalankan dan mencoba aplikasi di mesin sendiri **tanpa Docker dan tanpa Supabase**. Data bersifat sintetis dan disimpan di `localStorage` browser. Mode ini untuk meninjau UI dan alur; **bukan** bukti bahwa Supabase, Auth, RLS, atau realtime sungguhan bekerja (lihat [[GO_LIVE_PLAN]] T-011, T-020 sampai T-022).

## Menjalankan

```bash
cd apps/platform
npm ci
npm run extract
npx vite --host 127.0.0.1 --port 5173 --no-open
```

Di PowerShell yang memblokir skrip (`npx.ps1 cannot be loaded`), pakai `npx.cmd` sebagai ganti `npx`. Buka `http://127.0.0.1:5173/`. File `apps/platform/.env.local` (diabaikan Git) berisi `VITE_LOCAL_MOCK=1`; salin dari `.env.example` bila belum ada.

## Login lokal

Masukkan salah satu email di bawah, klik **Kirim Kode Masuk**, lalu isi kode **123456**. Kode dan akun ini hanya berlaku di mode mock lokal dan tidak dikenali Supabase mana pun.

| Email | Role |
|---|---|
| `admin@mni.local` | admin |
| `ppic@mni.local` | ppic (SPK, vendor) |
| `gbb@mni.local` | gbb (bahan baku, bongkar muat) |
| `gbj@mni.local` | gbj (barang jadi, vendor, pengiriman, bongkar muat) |
| `logistik@mni.local` | logistik (pengiriman, bongkar muat) |
| `viewer@mni.local` | viewer |

## Data contoh

Enam bahan baku, tiga barang jadi, dua SPK (satu sengaja lewat jatuh tempo), master customer/supplier/vendor/work center, dan counter. Semuanya fiktif. Perubahan yang Anda buat tersimpan di browser; hapus dengan `localStorage.removeItem('mni-local-mock-db')` lalu muat ulang, atau gunakan jendela privat.

## Batasan yang diketahui

- Mock meniru batasan UUID Postgres untuk kolom id agar ketidakcocokan id terdeteksi lebih awal.
- Hak akses per role belum ditegakkan (di aplikasi `ROLE_ON=false`; mock tidak meniru RLS).
- Realtime hanya dalam satu tab, bukan antar pengguna.
- Nama pengguna kini tampil setelah login (B-002). Teks "Backend belum terhubung" bawaan prototipe masih ada di sidebar; lihat [[tasks/T-017-rapikan-identitas-pengguna-dan-teks-backend-di-mni|T-017]].
- Seed memakai nomor SPK numerik (1001, 1002) dan bentuk barang jadi sesuai label app; jika browser menyimpan seed lama, versi seed (`VERSION` di `local-supabase.js`) menimpanya otomatis.
- Gunakan **satu tab** saja: tiap tab menyimpan salinan datanya sendiri dan tab lama dapat menimpa perubahan tab baru.
- Mock kini menolak kolom yang tidak ada di schema (seperti PostgREST), sehingga bentuk data diuji sama seperti di database.
- Mock hanya aktif di `localhost` / `127.0.0.1` dan menolak dijalankan di host lain.
- Pengujian nyata tetap butuh Supabase lokal. Di mesin ini Docker Desktop tidak dapat start karena virtualisasi CPU nonaktif di BIOS (lihat [[tasks/T-010-aktifkan-docker-engine-di-windows|T-010]]).

Hasil uji modul dan fitur: [[TEST_MATRIX]]. Bukti: [[screenshots/README]].

## Pembaruan 2026-11-06 (pratinjau mock saat ini)

- Mulai: `cd apps/platform && VITE_LOCAL_MOCK=1 npx.cmd vite --host 127.0.0.1 --port 5173 --strictPort`; setelah mengubah `apps/gudang-logistik`, jalankan `node scripts/extract-app.js`.
- Login mock: `admin@mni.local`, OTP `123456` (juga ppic, gbb, gbj, logistik, produksi, viewer, sales @mni.local). Data tersimpan di `localStorage` (`mni-local-mock-db`); versi data `VERSION` di `local-supabase.js` (8) menimpa data lama bila dinaikkan. Hapus `localStorage` untuk data contoh baru.
- Uji: `node tests/e2e/run.mjs http://127.0.0.1:5173/` (`ONLY=nama` untuk satu suite) dan `tests/unit/*.test.mjs`. Pratinjau mock bukan bukti Supabase.
