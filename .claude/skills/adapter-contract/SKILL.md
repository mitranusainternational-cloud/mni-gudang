---
name: adapter-contract
description: Aturan untuk mengubah jembatan data app (apps/platform/src/lib/claude-adapter.js, local-supabase.js, schema-columns.js) dan UI aktif apps/gudang-logistik. Gunakan sebelum mengedit file tersebut atau saat menambah tabel/kolom.
---

# Kontrak adapter dan sumber UI

## Sumber kebenaran

- UI aktif: `apps/gudang-logistik/` (`index.html`, `assets/css/app.css`, `assets/js/app.js`). `apps/gudang-logistik/reference/` hanya arsip.
- `apps/platform` memuat UI itu lewat `npm run extract` (menulis `public/app.*`, diabaikan Git). Mengubah `gudang-logistik` berarti mengubah mni-app: uji keduanya.
- Keputusan: `documentation/DECISIONS.md` (2026-11-02).

## Kontrak `window.claude` yang dipakai app (jangan ditebak)

- `use('db')`: `collection(c).add/onSnapshot`, `doc('c/id').get/set/update/delete/acquire`.
- `use('user')`: objek dengan `me()` (id, name, isOwner, canEdit), `can()`, dan **`profiles(ids)`** (warna/foto avatar).
- `use('downloads')`: **`save({ filename, data })`** (Blob atau Uint8Array).
- `window.__idAlias`: peta id buatan app (`spk-1003`) ke UUID; dipakai `byId`.

## Pemetaan ke Postgres

- Id non-UUID dipetakan ke UUID deterministik (`toDbId`); tabel `master` dan koleksi `counter` memakai kolom `key` (nilai JSON), bukan id.
- Bidang dokumen di luar kolom tabel disimpan di JSONB `data` (`packRow`/`unpackRow`); daftar kolom di `schema-columns.js` (dibuat dari migration). Update parsial `data` = baca-ubah-tulis.
- `spk.no` TEXT di DB tetapi angka bagi app (`numericNo`/`textNo`).
- Pengurutan: kolom pertama yang ada dari `created_at`, `updated_at`, `tgl`.
- Realtime hanya pada tabel dalam publication; sinkron antar pengguna memakai polling `table_stamps()` (daftar tabel di fungsi itu: tabel baru harus ditambahkan, contoh `produksi_log` di draf 14 dan `sp` di draf 18).

## Checklist perubahan

1. Ubah schema → migration baru + buat ulang `schema-columns.js` + terapkan ke Supabase dev (skill `supabase-dev-ops`).
2. Ubah adapter/mock/UI → `npm run extract` → skill `e2e-regression` (harus 0 FAIL).
3. Mock harus tetap **lebih ketat atau sama** dengan Postgres (menolak kolom/ id/ urutan yang ditolak Postgres). Jangan melonggarkannya agar tes lulus.
4. Catat bug (B-xxx) dan keputusan; skill `vault-progress`.
5. Jangan menambah dependensi atau mengganti arsitektur tanpa catatan keputusan.

## Perilaku adapter yang harus dijaga (2026-11-03)

- `notifyWrite(table)` memuat ulang koleksi setelah add/set/update/delete (B-014); `onSnapshot` juga polling 15 detik (`window.__ENV.POLL_MS`) dan memuat ulang saat tab kembali terlihat, melewati render bila data sama (B-017; push Realtime belum tiba, T-162).
- `counter.get()` harus mengembalikan `{ n }` karena app membaca `.n` (B-015); regresi memeriksa nomor RCV naik.
- `linkIds` mengisi `mutasi.item_id`, `kirim.spk_id`, `vendor.spk_id` dari bidang app tanpa menghapusnya dari JSONB (B-016). Referensi SPK harus SPK yang ada (kunci asing).
- UI memakai `me().role` bila ada: `guard()`, banner role, dan `.tools.locked` (tombol catat disembunyikan) aktif tanpa `ROLE_ON`.

## Koleksi baru dan field tambahan (2026-11-06)

- **Tabel opsional:** `OPSIONAL` di `claude-adapter.js` memuat `produksi_log`, `penawaran`, `salesorder`, `sp`; tabel yang belum ada di production dibaca kosong, sehingga kode boleh dirilis sebelum atau sesudah migration. Menulis ke tabel yang belum ada tetap gagal: pastikan migration terpasang sebelum fitur dipakai.
- **Tanpa migration bila memungkinkan:** field di luar kolom masuk jsonb `data` (`rm.data.aktif`, `fg.data.buffer`, `pr.data.gudang`, `spk.data.stokReq`). Tabel baru hanya bila wajar (contoh `sp`, draf 18).
- **Mock:** `local-supabase.js` menyimpan di `localStorage` kunci `mni-local-mock-db`; naikkan `VERSION` (sekarang 8) bila seed atau pemetaan modul berubah. Tambahan koleksi harus ikut di daftar tabel, `MOD_OF`, `ROLE_MODS`, `modFor`, dan `schema-columns.js`.
- **Hitungan turunan:** `calc()` di `app.js` di-cache; stok, kemajuan SPK, dan penjaga kirim (`sisaLine`, `fgSiapMap`) dihitung dari mutasi dan SPK, tidak disimpan. Jangan menambah kolom stok.
- **Nomor dokumen:** `nextDocNo(kind, tgl)` dengan `DOCFMT`; kunci baru wajib ditambahkan ke `DOCFMT` dan counter master.
- **Dokumen cetak:** `askSigners()` membungkus `printMvDoc`, `exportMvXlsx`, `downloadDoc`, PR Excel; dokumen baru yang memiliki baris tanda tangan harus memakainya.
