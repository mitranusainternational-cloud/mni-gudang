---
name: rls-roles
description: Model role dan RLS MNI OS (role_modules, can_mod/can_any/is_admin, ROLES di app.js) beserta cara mengubah dan mengujinya. Gunakan saat menambah role, mengubah hak modul, menulis policy, atau menguji hak per role.
---

# Role dan RLS

## Model (satu sumber hak, dua tempat penegakan)

- UI: `ROLES`, `MODS`, `modOf()`, `canMod()`, `guard()` di `apps/gudang-logistik/assets/js/app.js`. Role: admin (semua), ppic (spk, vendor), gbb (bahan-baku, bongkar-muat, sparepart), gbj (barang-jadi, vendor, pengiriman, bongkar-muat), logistik (pengiriman, bongkar-muat), viewer (tidak ada).
- Database: tabel `role_modules(role, module)`, fungsi `is_admin()`, `can_mod(modul)`, `can_any()` (SECURITY DEFINER, EXECUTE hanya untuk authenticated). Policy `*_write` (hasil ALTER di migration 6) dan `*_v2` memakai fungsi itu.
- Peta role ke modul bersifat **sementara** sampai disahkan tim Operasional (T-036). Mengubah hak = mengubah isi `role_modules` (dan `ROLES` di UI), bukan policy.
- Penegakan UI tanpa `ROLE_ON`: bila adapter memberi `me().role`, `myAcc()` memakainya dan `guard()` aktif. `ROLE_ON` mengatur fitur menu Pengguna, undangan, klaim (T-101). Platform asli tidak memberi `role`, perilaku lama tetap.
- Adapter menganggap hanya `admin, ppic, gbb, gbj, logistik` sebagai penulis (`WRITE_ROLES`); role lain (termasuk manager/gudang/produksi lama) = viewer.

## Aturan perubahan

1. Jangan memakai `DROP POLICY`/`DELETE` lewat konektor Supabase: perintah itu ditolak persetujuan SQL. Ganti isi dengan `ALTER POLICY`, tambah dengan `CREATE POLICY`, dan tulis file migration di `apps/platform/supabase/migrations/`.
2. Setiap fungsi baru: `REVOKE ... FROM PUBLIC, anon; GRANT ... TO authenticated`.
3. Ubah `ROLES`/`modOf` dan `role_modules` bersamaan; jalankan `npm run extract` (public/app.js dibuat, jangan diedit).
4. Akun mock memakai role aplikasi (`admin|ppic|gbb|gbj|logistik|viewer@mni.local`); naikkan `VERSION` seed bila mengubahnya.

## Menguji

- Database: blok `DO $$ ... RAISE EXCEPTION $$` (otomatis rollback). Sisipkan baris `muser` uji, `set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'email', ..., 'role','authenticated')::text, true)`, `SET LOCAL ROLE authenticated`, lalu coba INSERT per tabel; kembalikan hasil lewat pesan `RAISE EXCEPTION`. Kolom wajib tiap tabel: `rm(id,item)`, `fg(id,kategori)`, `spk(id,no)`, `log(aksi)`. UPDATE/DELETE di bawah RLS tidak galat saat 0 baris: periksa `ROW_COUNT`.
- UI mock: `apps/platform/tests/e2e/roles.mjs` (`runRoles(page, base)`, 12 pemeriksaan) di satu tab. Setelah `extract`.
- Jalankan advisor keamanan setelah setiap migration (`get_advisors`) dan catat di `documentation/ENVIRONMENTS.md`.
- Catat hasil di `documentation/TEST_MATRIX.md` (matriks alur × role) dan tugas T-022, T-079.

## Urutan migration untuk lingkungan baru (2026-11-03)

- 1–4 buat schema, policy awal, kompatibilitas, dan model role; **5 menghapus policy lama** (DROP); 6 dan 9 meng-ALTER hanya bila policy-nya ada; 7 mencabut hak anon; 8 backfill kolom relasi.
- Di dev, 5 tidak dijalankan (DROP ditolak konektor): policy lama dan `_v2` berdampingan dengan isi identik.
- Lingkungan baru wajib diuji penuh (matriks role dengan rollback, advisor) sebelum dipakai; urutan 1–9 belum dijalankan penuh di project kosong.

## Modul sparepart dan PR bersama (2026-11-06)

- Modul baru `sparepart` (tabel `sp`, mutasi gudang `sp`); `role_modules` memberi peran `gbb` modul itu, admin otomatis. Peran lain belum dibahas dengan pemilik.
- Draf migration 18 mengubah `mutasi_read`, `mutasi_ins_v2`, `mutasi_upd_v2` agar gudang `sp` mengikuti modul `sparepart` (sebelumnya semua selain `rm` dianggap `barang-jadi`), dan `pr_read`, `pr_ins_v2`, `pr_upd_v2` agar pemegang `bahan-baku` atau `sparepart` dapat memakai PR. Semua lewat `ALTER POLICY` (bukan DROP) dan hanya memperluas hak.
- Membuat SPK stok butuh hak ubah `spk`; peran `gbj` hanya melihat SPK.
- Tidak ada kebijakan DELETE pada tabel transaksi (migration 13): jangan menambahkannya; item diganti nonaktif lewat kolom `aktif` atau `data.aktif`.
- Sebelum menerapkan draf: bandingkan nama kebijakan dan pemicu dengan `pg_policies` dan `pg_trigger` production (baca-saja), dan catat angka baris sebelum dan sesudah.
