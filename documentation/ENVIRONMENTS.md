---
type: environment-guide
status: active
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Tiga versi: Development, Main, Docs

> [!summary] Keadaan terkini (2026-11-06)
> | Lingkungan | Isi |
> |---|---|
> | Production | Vercel `mni-gudang.vercel.app` dari `main` (ad73c89, surat jalan); Supabase `MNI Gudang - Production` (`lggqigmvtefkquqjrjsb`), migration 1 sampai 13, RLS di 22 tabel; baris: rm 24, fg 92, mutasi 19, spk 8, pr 0, kirim 7, vendor 5, user 10 |
> | Lokal | mock di `127.0.0.1:5173` (cabang `fitur/produksi-multi-wc`, 35bf7f7 dan di atasnya); belum di-push untuk commit terbaru |
> | Draf database | migration 14 sampai 18 di `apps/platform/supabase/draft/`, belum diterapkan |
> | Dev lama | `inldyqigewmziwazalun`, dipensiunkan |
> | Advisor production | keamanan: 8 WARN fungsi bantu RLS (disengaja) dan proteksi password bocor belum aktif; performa: 3 WARN kebijakan permisif ganda, 22 indeks belum terpakai; tidak ada temuan kritis ([[T-060-review-security-dan-performance-advisor]]) |
>
> Peta sumber daya: [[SISTEM_MAP]]; peta modul: [[PETA_MODUL]]. Bagian di bawah memuat riwayat penyiapan 2026-11-02 sampai 2026-11-03.

Jalur tahap lengkap: [[INTEGRATION_PATH]]. Pemetaan permintaan "3 environment" ke branch Git dan target deploy. Aturan branch lengkap ada di [[VERSION_STRATEGY]].

| Versi | Branch GitHub | Tujuan | Deploy | Status |
|---|---|---|---|---|
| Development | `development` | Pengembangan dan pengujian | Preview Vercel (PR) + Supabase project terpisah | Branch ada; deploy belum dibuat |
| Main | `main` | Versi untuk pengguna | Vercel Production + Supabase production | Branch ada; masih sama dengan `versi-awal` |
| Docs | `docs` | Dokumentasi pengembangan | Situs statis (kandidat: Quartz/MkDocs dari vault) | Branch ada; situs belum dibuat |
| Baseline | `versi-awal` | Acuan beku | Tidak ada | Beku |

## Aturan isolasi (belum terpenuhi)

Branch hanya memisahkan riwayat kode. Sebelum data nyata dipakai, setiap versi perlu:
1. Supabase project sendiri (dev dan prod). Jangan memakai satu database untuk keduanya.
2. Secret per environment di Vercel/GitHub (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Service-role key tidak boleh masuk client.
3. Promosi `development` -> `main` lewat PR dan [[RELEASE_CHECKLIST]].

## Aplikasi `apps/platform` (scaffold Vite + Supabase)

Disalin dari `mni-app/` pada 2026-11-02. Isinya: Vite, `vercel.json`, workflow deploy, docker-compose VPS, dan 2 migration (20 tabel). Status verifikasi:

- `npm ci` dan `vite build`: berhasil (source-level, env dummy).
- `npm run extract` memakai sumber aktif `apps/gudang-logistik/` (keputusan T-014 di [[documentation/DECISIONS]]); tidak butuh file di luar repo. Terverifikasi: ekstrak, build, dan muat di browser tanpa error JS.
- Dev server: error `addEventListener` pada null sudah **diperbaiki** (2026-11-02). Penyebab: `index.html` tidak memuat `public/app.css` dan tidak menyisipkan `public/app-body.html` ke `#app-root`, sehingga `app.js` mencari elemen (`#editor`, `#toast`, dst.) yang belum ada. Kini `index.html` memuat CSS, menyisipkan body, lalu memuat `app.js`. Terverifikasi di browser: login tampil, tidak ada error JS; sisa error console hanya koneksi ke Supabase dummy (`example.invalid`).
- Login OTP, RLS, dan persistence belum diuji; Supabase belum tersambung.
- Migration scaffold tidak otomatis menjadi schema MNI OS; ikuti aturan di [[FOUNDATION_BASELINE]].
- Workflow `deploy.yml` men-deploy dari `main` dan PR ke Vercel. Belum ada secret terpasang, jadi belum berjalan.

Bukti: [[screenshots/README]].

## Inventaris akun cloud (dibaca 2026-11-02, hanya metadata)

| Layanan | Temuan | Arti untuk mni-app |
|---|---|---|
| GitHub | Repo organisasi `mitranusainternational-cloud/mni-gudang`, `main` terproteksi | Siap menerima kode |
| Supabase (org pribadi pemilik) | 3 project: "MNI OS" (aktif, 1 tenant, tabel ERP multi-tenant: tenants, items, BOM, routings), "MNI OS - Operational" (aktif, 80 tabel ERP, 0 baris), "Marketing OS - NIJ" (nonaktif) | Dua project aktif berskema ERP **berbeda** dari schema mni-app (20 tabel `rm`, `fg`, `spk`, …). Jangan dipakai tanpa keputusan |
| Vercel (team NIJ) | 0 project | Belum ada deployment |

Biaya project Supabase baru tidak bisa saya baca (izin konektor ditolak); periksa di dashboard sebelum membuat. Batas paket gratis biasanya dua project aktif.

### Opsi koneksi berikutnya

| Opsi | Langkah | Kelebihan | Kekurangan |
|---|---|---|---|
| A. Project Supabase baru khusus mni-app (dev) | Buat project, terapkan 2 migration, isi `.env.local`, uji T-020/T-028, lalu Vercel preview | Tercepat menuju sistem yang dipakai; tidak butuh Docker; terpisah dari project ERP | Mungkin berbiaya; data dev di cloud |
| B. Docker lokal | Aktifkan virtualisasi BIOS lalu `supabase start` | Gratis, terkendali | Menunggu tindakan di BIOS; hanya di satu mesin |
| C. Pakai project yang ada | Terapkan migration ke project ERP | Tanpa project baru | Skema berbeda, risiko merusak; tidak direkomendasikan |

Urutan setelah database ada: terapkan migration, uji login OTP dan adapter di Postgres (T-020, T-021, T-028), sambungkan Vercel ke GitHub (butuh izin aplikasi Vercel pada organisasi GitHub), preview dari `development`, lalu UAT.

## Supabase Development (dibuat 2026-11-02)

| Item | Nilai |
|---|---|
| Project | `MNI Gudang - Dev`, ref `inldyqigewmziwazalun`, region ap-southeast-1 |
| URL | `https://inldyqigewmziwazalun.supabase.co` (bukan rahasia) |
| Migration terpasang | init_schema, rls_policies, app_shape_compat, role_model_app_aligned (tabel `role_modules`, fungsi `can_mod`/`can_any`/`is_admin`, policy `_v2`). role_model_supersede, revoke_anon_helpers, backfill_relation_ids, advisor_fixes (7 migration terpasang; role_model_cleanup (DROP) sengaja tidak dipasang di dev) |
| Kunci di aplikasi | hanya kunci anon/publishable (publik); kunci service-role tidak dipakai di mana pun |
| Menjalankan app ke project ini | file lokal `apps/platform/.env.supabase-dev.local` (diabaikan Git), lalu `npx vite --mode supabase-dev` |
| Perubahan akun | project `MNI OS - Operational` (kosong) dijeda agar muat di batas gratis; dapat dipulihkan dari dashboard |
| User admin awal | `mitranusainternational@gmail.com` (login password berhasil 2026-11-02; ganti password sementara) |
| Belum ada | data, Vercel, CI |

Temuan advisor keamanan (peringatan, bukan kritis): fungsi `get_user_role`, `is_authenticated`, `is_admin_or_manager` (SECURITY DEFINER) dapat dipanggil lewat RPC oleh anon dan authenticated; ekstensi `pg_trgm` di schema public. Dijadwalkan di T-060.

### Konfigurasi Auth Supabase dev yang perlu disesuaikan (temuan 2026-11-02)

Diamati dari log Auth saat percobaan login pertama:

1. **Email berisi tautan, bukan kode 6 digit.** Akun admin dibuat lewat endpoint OTP sehingga memakai templat "Confirm signup" (tautan `type=signup` dengan `redirect_to=http://localhost:3000`). Aplikasi meminta kode 6 digit. Templat "Magic Link" dan "Confirm signup" perlu menyertakan `{{ .Token }}`.
2. **URL situs salah.** `site_url` masih bawaan `http://localhost:3000`. Atur Authentication → URL Configuration: Site URL `http://127.0.0.1:5174` dan tambahkan `http://127.0.0.1:5174/**` ke Redirect URLs.
3. **Batas pengiriman email.** SMTP bawaan Supabase sangat terbatas per jam; permintaan kode kedua dan ketiga mendapat HTTP 429. Untuk pemakaian nyata pasang SMTP sendiri (T-047).
4. **Cadangan tanpa email.** Aplikasi kini menyediakan "Masuk dengan password" (hanya Supabase nyata). Password diatur sendiri oleh pemilik akun (lihat T-029); password tidak pernah dikirim ke saya atau disimpan di repo.

### Advisor keamanan Supabase dev (2026-11-02, setelah migration 6 dan 7)

Migration 7 (`revoke_anon_helpers`) mencabut hak `anon` atas `get_user_role`, `is_admin_or_manager`, `is_authenticated`. Sisa peringatan (WARN, bukan ERROR): `pg_trgm` di schema public; fungsi `can_any/can_mod/is_admin` dapat dipanggil `authenticated` (hanya menjawab hak pemanggil sendiri; disengaja); proteksi kata sandi bocor (leaked password) nonaktif, aktifkan di dashboard Auth bila memakai login password (tindakan pemilik).


### Cross-check Supabase dev setelah merge ke main (2026-11-03)

| Pemeriksaan | Hasil |
|---|---|
| Migration terpasang vs berkas repo | 7 terpasang (init_schema, rls_policies, app_shape_compat, role_model_app_aligned, role_model_supersede, revoke_anon_helpers, backfill_relation_ids) + advisor_fixes = 8; berkas repo 1–9 (5 = DROP, hanya untuk lingkungan baru) |
| Tabel dan RLS | 21 tabel `public`, semuanya RLS aktif; 19 punya kolom JSONB `data` (`master` dan `role_modules` tidak) |
| Hak per role | diuji ulang setelah migration 9 (rollback): viewer menulis log ditolak, ppic menulis, admin membaca semua `muser`, lainnya hanya barisnya sendiri |
| Advisor keamanan | tersisa 2 jenis WARN: 6 fungsi pembantu (`can_any`, `can_mod`, `is_admin`, `get_user_role`, `is_admin_or_manager`, `is_authenticated`) dapat dipanggil `authenticated` karena dipakai policy (disengaja); leaked password protection nonaktif (aksi pemilik di dashboard Auth). `pg_trgm` sudah dipindah ke schema `extensions` |
| Advisor performa | initplan `auth.email()` diperbaiki (migration 9). Tersisa: 79 "multiple permissive policies" karena policy lama berdampingan dengan `_v2` (isi identik; hilang setelah migration 5 dijalankan owner di SQL Editor atau di lingkungan baru) dan 23 indeks belum terpakai (INFO) |
| Replikasi Realtime | publikasi memuat 17 tabel, slot aktif; push event tidak tiba, diganti polling (T-162 opsional) |
| Data | data uji `UJI-FINAL` dan `UJI-9999` masih ada di dev (penghapusan lewat konektor ditolak) |

Aturan lingkungan baru (mis. Supabase production, S5): jalankan migration 1–9 berurutan di project kosong, lalu uji matriks role dan advisor sebelum dipakai. Migration 5 menghapus policy lama sehingga 6 dan 9 melewatinya (dijaga pemeriksaan keberadaan). Urutan ini diuji di dev hanya untuk bagian ALTER yang idempoten; jalankan penuh di branch/project baru sebelum production.

## Koneksi akun yang benar (diverifikasi 2026-11-03)

Beberapa konektor di mesin ini terhubung ke akun lain. Selalu cocokkan sebelum bertindak:

| Layanan | Yang dipakai proyek ini | Jangan disentuh |
|---|---|---|
| GitHub | akun `mitranusainternational-cloud`, repo `mni-gudang` (login `gh` keyring) | — |
| Supabase | org `wjebogebnwlxghsjbbdg`, project **`MNI Gudang - Dev`** (`inldyqigewmziwazalun`, ap-southeast-1) | `MNI OS` (srjtotk…, aktif), `MNI OS - Operational` (eonzept…, nonaktif), `Marketing OS - NIJ` (ovrvwj…) |
| Vercel | tim **`mitranusainternational-8337`** (Hobby) di Chrome pemilik, lewat halaman import GitHub | Konektor Vercel di alat Claude terhubung ke tim lain (`NIJ`, `nij3`): jangan dipakai untuk project ini |

Aturan: tindakan Vercel dilakukan lewat Chrome pemilik (tim di atas), bukan lewat konektor Vercel Claude, sampai konektor itu diarahkan ke tim yang benar. Setiap perintah Supabase memakai `project_id` `inldyqigewmziwazalun` secara eksplisit.


### Vercel (dibuat 2026-11-03)

| Item | Nilai |
|---|---|
| Tim / project | `mitranusainternational-8337` (Hobby) / `mni-gudang` |
| Sumber | GitHub `mni-gudang`, root `apps/platform`, preset Vite (`vercel.json`: install `npm ci --ignore-scripts`, build `node scripts/extract-app.js && vite build`) |
| Production | https://mni-gudang.vercel.app (branch `main`) |
| Preview | per branch/PR, mis. `...-git-development-mitranusainternational-8337.vercel.app` (dilindungi login Vercel) |
| Env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable, Production dan Preview) mengarah ke Supabase **dev**: production Vercel saat ini = staging |
| Keamanan | X-Frame-Options DENY, nosniff, Referrer-Policy, CSP (hanya self, cdnjs, Google Fonts, `*.supabase.co`), HSTS, Permissions-Policy |

### Akar masalah salah koneksi: dua akun Supabase (2026-11-03)

- Project **MNI Gudang - Dev** (`inldyqigewmziwazalun`) berada di organisasi Supabase pribadi pemilik (id `wjebogebnwlxghsjbbdg`), yaitu akun yang dipakai konektor Supabase Claude.
- Chrome pemilik untuk Supabase masuk sebagai akun lain (organisasi "Software Development", 2 project, termasuk `lggqigmvtefkquqjrjsb` "MNI-OS - Operational"). Di akun itu project dev tidak terlihat: membuka dashboard `inldyqigewmziwazalun` mengarah ke daftar organisasi. Inilah sebab kunci project yang salah tertempel ke Vercel dua kali (terdeteksi sebelum deploy).
- Akibat: pengaturan Auth (Site URL, Redirect URL, template email, leaked password) dan SQL Editor project dev hanya bisa dibuka dengan login Supabase akun pemilik project itu, atau setelah akun lain diundang sebagai anggota organisasinya. Sampai Site URL diubah, tautan masuk email mengarah ke `http://localhost:3000` dan sesi harus dipindahkan manual ke domain Vercel.
- Aturan: jangan menulis alamat email akun pribadi di repositori publik; sebut "akun pemilik".

## Project Supabase production di akun mitranusainternational (2026-11-03)

| Item | Nilai |
|---|---|
| Project | **MNI Gudang - Production** (nama awal "MNI-OS - Operational"), ref `lggqigmvtefkquqjrjsb`, URL `https://lggqigmvtefkquqjrjsb.supabase.co` |
| Akun / organisasi | akun mitranusainternational, organisasi "Software Devellopment" (paket gratis), pemilik = akun itu |
| Region | eu-central-1 (Frankfurt); tidak bisa dipindah. Jarak ke Indonesia menambah latensi tiap permintaan; dicatat sebagai risiko |
| Konektor Claude | konektor Supabase kedua (id `72053749-…`) terhubung ke akun ini; konektor `plugin_supabase` terhubung ke akun pribadi pemilik (project dev lama `inldyqigewmziwazalun`) |
| Migration | 1–10 dijalankan berurutan pada project **kosong** (uji lingkungan baru): hasilnya 21 tabel, RLS aktif semua, satu set policy bersih (tanpa duplikat), `role_modules`, `try_lock`; migration 5 (DROP policy lama) diterima konektor di project baru |
| Matriks role (rollback) | admin semua; viewer, gudang, manager ditolak semua; ppic: log, SPK, master; gbb: log, bahan baku, master; gbj: log, barang jadi, master; logistik: log, master; kunci `try_lock` hanya untuk role yang boleh mencatat |
| Advisor | keamanan: hanya 6 fungsi pembantu yang dapat dipanggil authenticated (disengaja); performa: 3 `multiple_permissive_policies` (policy ALL berdampingan dengan SELECT) dan indeks belum terpakai; tidak ada temuan anon, extension, atau initplan |
| Data | **tidak ada data uji dipindahkan.** Isi dev lama hanya data uji (SPK 1–6, item/supplier/customer UJI, counter, katalog berisi customer uji). Production dimulai bersih; satu baris `muser` admin dibuat |
| Env lokal | `apps/platform/.env.supabase-prod.local` (tidak di Git), server `vite --mode supabase-prod --port 5175` |

### Status go-live production (diverifikasi ulang 2026-11-03, setelah pemilik mengatur Auth dan Vercel)

| Langkah | Status | Bukti |
|---|---|---|
| Skema production (migration 1–10 pada project kosong) | Selesai | matriks role, advisor, uji tulis lulus |
| Pengguna admin production | Selesai | Auth + `muser` admin; login berhasil |
| Auth: Site URL dan Redirect URL | Selesai (sebagian) | Site URL `https://mni-gudang.vercel.app`; tiga Redirect URL tersimpan, tetapi entri preview tampil tanpa tanda `*` (`https://-mitranusainternational-8337.vercel.app/`), perlu diperiksa pemilik |
| Auth: pendaftaran bebas dimatikan | Selesai | `GET /auth/v1/settings` → `disable_signup: true` |
| Auth: leaked password protection | Belum diperiksa | opsi di Sign In / Providers, tergantung paket |
| Env Vercel mengarah ke production | Selesai untuk Production | bundel `mni-gudang.vercel.app` memuat `lggqigmvtefkquqjrjsb` dan kunci `sb_publishable_odc9Y44…`; dashboard menampilkan variabel hanya untuk Production (Preview belum). Alias lama `mni-os-operational.vercel.app` kini 404 |
| Pembersihan data uji production | Selesai (2026-11-03) | guard lolos (semua baris bertanda UJI-PROD); sesudahnya muser 1, role_modules 10, tabel lain 0; penomoran mulai lagi dari 001 |

Sisa sebelum dibagikan ke tim: login admin di situs Vercel (uji CSP, 10 modul, ekspor), pembersihan data uji, Redirect URL preview, dan variabel Preview bila preview dipakai.

### Hak akses per modul (2026-11-03)

Production memakai migration 1–12 dan Edge Function `kelola-pengguna` (verify_jwt aktif; kunci server hanya di lingkungan fungsi). Pengguna tanpa hak khusus tetap mengikuti perilaku lama. Menu Pengguna & Akses baru tampil di aplikasi setelah `development` digabung ke `main`.
