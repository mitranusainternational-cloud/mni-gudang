---
type: runbook
status: active
updated: 2026-11-19
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Migrasi tim ke domain baru (wms.mni-os.com)

Keputusan pemilik 2026-11-19 (lihat [[DECISIONS]]): tim pindah dari `mni-gudang.vercel.app` ke `https://wms.mni-os.com`, dengan **versi aplikasi yang sama**, **data yang sama**, dan **akun yang sama** (tinggal login dengan email dan password seperti di Vercel). Vercel dan project production lama **hanya dibaca**; tidak diubah selama migrasi. Latar alat: [[BACKUP_RESTORE]], [[SISTEM_MAP]].

## Susunan sekarang

| | Frontend | Backend (Supabase) | Akun/paket |
|---|---|---|---|
| **Live tim (sampai peralihan)** | Vercel `mni-gudang` (repo `mitranusainternational-cloud/mni-gudang`, cabang `main`) | project **MNI Gudang - Production** `lggqigmvtefkquqjrjsb` (Frankfurt) | org `mitranusainternational`, Free |
| **Tujuan** | Dokploy `admin.mni-os.com`, aplikasi **WMS - MNI**, domain `wms.mni-os.com` (repo `nurilhamjn/mni-wms`, cabang **`live`**) | project **`mni-wms`** `tqwiuyudqysftkqgdzli` (Singapura) | org `nurilhamj@gmail.com`, Free (Pro menyusul) |

- Backend = **Supabase** (Postgres 17, Auth, PostgREST, Realtime, Edge Function `kelola-pengguna`, Storage direncanakan). Tidak ada server backend buatan sendiri; aturan bisnis ada di SQL (RLS, pemicu), sehingga tidak terikat ke satu penyedia.
- Cabang `live` = kode `main` live + `Dockerfile`, `.dockerignore`, `apps/platform/nginx/nginx.vps.conf`, `apps/platform/public/sw.js` (pembersih cache sisa PWA lama). Cabang `main` repo VPS (garis ERP lama dengan Penawaran dan QC) **tidak dipakai dan tidak ditimpa**.
- Deploy ke VPS **manual**: Dokploy › WMS - MNI › General › Deploy (Autodeploy mati). Provider: Github Account `nurilhamjn`, Repository `mni-wms`, Branch `live`, Build Path `/`.
- Skema `mni-wms` dibentuk dari migration proyek dan **terbukti identik dengan production** (constraint, indeks, RLS, tabel, pemicu; fungsi identik selain komentar). Pemicu draf 17 dan 20 (stok, cadangan bahan) **tidak** terpasang, sama dengan production.

## Alat (semuanya di `apps/platform/scripts/`)

| Alat | Fungsi | Pengaman |
|---|---|---|
| `pindah-data.mjs` + `pindah-ke-tujuan.ps1` | Bentuk ulang skema tujuan dari migration lalu muat cadangan, **satu transaksi**, verifikasi jumlah dan isi sebelum COMMIT | Menolak production sebagai tujuan; mode bawaan simulasi (ROLLBACK); `--apply` wajib `--yakin=<ref>`; isi lama tujuan disimpan ke berkas dulu |
| `buat-login-tim.mjs` + `buat-login-tim.ps1` | Buat akun login untuk pengguna aktif `muser` yang belum punya login. Dengan `-SandiLama` memakai **password lama yang sama** (hash bcrypt dibaca dari production, hanya baca) | Menolak production sebagai tujuan; hash tidak pernah dicetak atau ditulis; password sementara hanya di CSV di `data/private-sources/` |
| `restore-backup.mjs` | Pemulihan lewat REST (jalur lama) | Menolak production |

Kunci dan string koneksi hanya diketik di terminal (prompt tersembunyi), tidak disimpan, tidak masuk Git atau chat.

Uji: `tests/sql/pindah-data.sql.test.mjs` (20 PASS, PGlite), `tests/unit/buat-login-tim.test.mjs` (22 PASS), `tests/unit/restore-backup.test.mjs` (21 PASS). Latihan dengan cadangan live nyata di PGlite dan di Supabase staging: 25 tabel cocok baris demi baris.

## Keadaan data di tujuan (2026-11-19)
- `mni-wms` berisi salinan live **19 Nov 2026 jam 17.26 WIB** (SPK 39, mutasi 134, bongkar 77, dan seterusnya; terbukti cocok lewat jumlah dan sidik id). Itu **bukan** data terbaru: yang diinput tim di Vercel sesudah jam itu belum ikut.
- Baru **2 dari 14** pengguna yang punya akun login (2 admin lama `mni-wms`). Yang lain belum.

## Rencana hari peralihan (urut)

0. **Prasyarat:** cabang `live` sudah berisi `main` terbaru dan sudah di-Deploy di Dokploy; `https://wms.mni-os.com/sw.js` menjawab 200; (opsional tetapi disarankan) Supabase Pro untuk org `nurilhamj`.
1. **Umumkan** jam berhenti input di Vercel.
2. **Cadangan segar** dari Vercel (hanya baca): super admin klik "Unduh cadangan", atau diambil lewat `USER.exportAll()` di console. Simpan di `data/private-sources/backup-prod-<tanggal>/`.
3. **Pindah data** (simulasi dulu, lalu sungguhan; `-Paksa` karena tujuan sudah berisi data):
   ```powershell
   cd apps\platform
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\pindah-ke-tujuan.ps1 -Berkas <cadangan.json> -Paksa
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\pindah-ke-tujuan.ps1 -Berkas <cadangan.json> -Paksa -Sungguhan
   ```
   Prompt 1 (tersembunyi): string koneksi **Session pooler `mni-wms`**. Prompt 2 (terlihat, hanya saat `-Sungguhan`): ketik ref `tqwiuyudqysftkqgdzli`.
4. **Buat akun login tim dengan password lama** (simulasi dulu):
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\buat-login-tim.ps1 -Ref tqwiuyudqysftkqgdzli -SandiLama
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\buat-login-tim.ps1 -Ref tqwiuyudqysftkqgdzli -SandiLama -Sungguhan
   ```
   Prompt: kunci **service-role `mni-wms`**, dan string koneksi **Session pooler production (hanya dibaca)**. Hasil: akun dengan password lama yang sama; yang tidak punya akun di production atau yang hash-nya ditolak mendapat password sementara di CSV `data/private-sources/akun-tim-*.csv`.
5. **Uji:** satu orang tiap peran login di `wms.mni-os.com`; periksa Dashboard, SPK, menu sesuai hak peran.
6. **Umumkan** alamat baru ke tim (pesan di bawah). Vercel dibiarkan hidup tetapi tidak dipakai (cadangan).
7. **Setelah stabil beberapa minggu:** pensiunkan Vercel dan project production lama (jangan dihapus dulu).

**Rollback:** kembali memakai Vercel; data production tidak pernah diubah selama migrasi.

## Pesan untuk tim (WhatsApp)
> Mulai [tanggal, jam] sistem WMS pindah ke alamat baru: **https://wms.mni-os.com**. Login pakai **email dan password yang sama** seperti di alamat lama. Jangan input di alamat lama lagi setelah jam [..] karena data di sana tidak ikut. Kalau ada kendala login, kabari [nama admin].
> Setelah masuk, sebaiknya ganti password di menu Akun saya.

Untuk akun dengan password sementara (CSV): kirim password lewat jalur pribadi per orang, bukan di grup.

## Risiko dan batas yang diketahui
- **Paket Free:** tanpa cadangan harian otomatis, kuota transfer terbatas, proyek dijeda bila lama tidak dipakai. Sampai Pro diambil: **Unduh cadangan** manual tiap hari kerja (super admin) dan simpan di luar server.
- **Kode login lewat email** tidak bisa diandalkan di paket Free (email bawaan Supabase hanya ke anggota organisasi); tim memakai **password**. Untuk kode email perlu SMTP sendiri.
- **Foto bongkar muat** masih di dalam database (sekitar 6 MB per muat penuh); perubahan di Bongkar Muat tampil 3 sampai 7 detik. Pemindahan ke Storage dikerjakan sebagai rilis terpisah.
- Fungsi `kelola-pengguna` (Tambah anggota tim) menolak email yang sudah ada di `muser`; untuk pengguna yang sudah ada gunakan `buat-login-tim`. Fungsi itu belum diuji dengan sesi segar di `mni-wms`.
- Kode VPS dan live harus tetap sama: setiap perubahan `main` live digabung ke cabang `live` VPS lalu di-Deploy.
