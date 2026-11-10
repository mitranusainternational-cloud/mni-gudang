---
type: audit
status: active
updated: 2026-11-03
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Audit kesiapan sebelum dipakai tim (2026-11-03)

> [!note] Pembaruan 2026-11-06
> Audit progres terbaru: [[AUDIT_PROGRESS_2026-11-06]]. Advisor production hari ini: tidak ada temuan kritis (8 WARN fungsi bantu RLS yang disengaja, proteksi password bocor belum aktif, 3 WARN kebijakan permisif ganda, 22 indeks belum terpakai). Yang masih terbuka dari audit ini: backup terjadwal dan uji pulih (T-061), Dependabot dan keputusan repo publik (T-166), SMTP dan Redirect URL (T-047), skema cadangan `arsip_20261105`.

Pemeriksaan silang lokal, GitHub, Supabase dev, dan Vercel. Bukti: [[TEST_MATRIX]], [[ENVIRONMENTS]], [[PROJECT_PROGRESS]].

## Hasil pemeriksaan

| Area | Hasil | Catatan |
|---|---|---|
| Lokal | Lulus | regresi 38 dan role 12 PASS; build produksi OK; dependensi runtime 0 kerentanan; tidak ada rahasia di berkas terlacak |
| GitHub | Lulus dengan catatan | main terproteksi (PR, 1 approval, CI wajib); secret scanning dan push protection aktif; CI hijau; repo **publik**; Dependabot alerts nonaktif |
| Supabase dev | Lulus dengan catatan | 21 tabel RLS aktif; migration 1–10 sesuai; advisor keamanan hanya 2 jenis WARN yang disengaja/aksi pemilik; hak per role diuji |
| Vercel | Lulus dengan catatan | production dan preview Ready; host hanya Vercel, Supabase dev, Google Fonts; CSP aktif; 0 error konsol; uji login oleh pemilik belum |

## Diperbaiki saat audit

- **Nomor dokumen ganda saat dua pengguna menyimpan bersamaan:** penguncian cek-lalu-tulis tidak atomik. Kini fungsi SQL `try_lock` (migration 10) atomik; mock dan adapter disesuaikan; diuji di Supabase (RCV 005 dan 006 beruntun) dan di SQL (kunci diambil, ditolak saat dipegang, diambil setelah kedaluwarsa).
- Alamat email pribadi pemilik dihapus dari dokumen publik.

## Risiko sebelum dipakai tim (urut kepentingan)

| # | Risiko | Dampak | Tindakan |
|---|---|---|---|
| 1 | Hanya ada **satu** database (dev) dan berisi **data uji** (SPK 1–6, item/supplier/customer UJI); production Vercel memakainya | data nyata bercampur data uji; tidak ada pemisahan; perubahan skema dev memengaruhi tim | buat project Supabase **production** terpisah (S5), jalankan migration 1–10 berurutan di project kosong, uji penuh, baru arahkan Vercel production |
| 2 | **Tidak ada backup** terjadwal yang terverifikasi (paket gratis) | kehilangan data tidak dapat dipulihkan | naik ke paket yang punya backup harian/PITR, atau jadwalkan ekspor `pg_dump`; uji pemulihan sekali sebelum data nyata |
| 3 | Site URL Supabase Auth masih `http://localhost:3000` dan Redirect URL kosong | tautan email masuk melempar ke localhost | isi Site URL dan Redirect URL (aksi pemilik) |
| 4 | **Pendaftaran bebas** aktif (`Allow new users to sign up`) | siapa pun dapat membuat akun auth (tidak melihat data tanpa baris `muser` aktif, tetapi memakai kuota email dan menambah sampah) | matikan sign up; buat pengguna lewat dashboard (Add user + password) dan baris `muser` |
| 5 | Email bawaan Supabase dibatasi (beberapa email per jam) | tim kesulitan login lewat kode email | beri tiap anggota password lewat dashboard, atau pasang SMTP sendiri |
| 6 | Hanya **1 pengguna** (admin) terdaftar; peta role masih sementara (T-036) | tim belum punya akun; hak mungkin tidak cocok dengan proses | buat akun per orang dan role; sahkan peta role bersama Operasional |
| 7 | Repo GitHub **publik** memuat dokumentasi proses internal | informasi perusahaan terbuka | jadikan repo privat (Vercel tetap dapat membaca) setelah keputusan pemilik |
| 8 | Pembaruan data antar sesi lewat polling 15 detik (Realtime tidak tiba, T-162) | tampilan bisa tertinggal sampai 15 detik | cukup untuk tim kecil; selidiki Realtime bila perlu |
| 9 | Stok negatif dicegah hanya di sisi aplikasi; pembaruan baca-ubah-tulis per dokumen | dua pengguna mengubah dokumen yang sama bersamaan bisa saling menimpa; dua pengguna mengeluarkan stok yang sama bisa melampaui stok | batasi pengeditan bersamaan lewat proses; pertimbangkan aturan di database pada tahap berikut |
| 10 | Dependabot alerts nonaktif; dependensi dev punya 4 kerentanan (tooling saja: vite 5, supabase CLI) | tidak memengaruhi situs yang dilayani | aktifkan Dependabot; naikkan vite saat ada jendela uji |
| 11 | Leaked password protection nonaktif | password bocor dapat dipakai | aktifkan di Auth (aksi pemilik) |
| 12 | Proyek Supabase gratis dijeda otomatis bila tidak aktif seminggu | situs tidak bisa dipakai setelah libur panjang | pakai rutin atau paket berbayar |

## Syarat "siap dipakai tim" (checklist)

- [ ] Project production terpisah dibuat dan diuji penuh (risiko 1)
- [ ] Backup dan uji pemulihan (risiko 2)
- [ ] Site URL, Redirect URL, sign up dimatikan, leaked password (risiko 3, 4, 11)
- [ ] Akun tim dan role disahkan (risiko 5, 6)
- [ ] Uji login pemilik di Vercel production (CSP, 10 modul, ekspor PDF/Excel)
- [ ] Keputusan repo publik atau privat (risiko 7)
