---
name: release-pipeline
description: Jalur rilis bertahap MNI OS dari lokal ke Supabase dev, GitHub, Vercel preview, UAT, production, dan opsi VPS, lengkap dengan gerbang tiap tahap. Gunakan saat menyiapkan CI, deploy, PR ke main, atau menjawab "tahap berikutnya apa".
---

# Pipeline rilis bertahap

Rujukan utama: `documentation/INTEGRATION_PATH.md` (tahap, gerbang, matriks environment, kriteria VPS). Checklist rilis: `documentation/RELEASE_CHECKLIST.md`.

## Urutan dan gerbang

| Tahap | Isi | Gerbang untuk lanjut |
|---|---|---|
| S0 Lokal | Mock + regresi, lalu Supabase lokal (Docker) bila tersedia | Regresi 0 FAIL |
| S1 Supabase dev | Migration, login nyata, uji adapter dan RLS | T-029, T-021, T-022, T-028 selesai |
| S2 GitHub | PR ke `main` dengan CI (build + regresi) wajib hijau | T-046, `main` terproteksi |
| S3 Vercel preview | `development` → Supabase dev, URL preview | Smoke test di URL preview |
| S4 UAT | Data terimpor dan terekonsiliasi, process owner menguji | Sign-off T-053 |
| S5 Production | Supabase prod terpisah + Vercel production dari `main` | [[documentation/RELEASE_CHECKLIST]] + persetujuan pemilik |
| S6 VPS (opsional) | Self-host atau layanan pendamping | Kriteria di INTEGRATION_PATH |

## Aturan

- Kerja fitur di cabang `fitur/<nama>` yang dibuat dari `main` (sejak PR 14); `development` dan `docs` tertinggal. `main` berubah lewat PR (1 approval dan 2 pemeriksaan CI; pemilik sebagai admin boleh `gh pr merge --admin`, preseden PR 14); `versi-awal` beku.
- Secret hanya di Vercel dan GitHub Actions per environment; kunci service-role tidak masuk klien atau repo.
- Dev dan prod memakai Supabase, URL, dan secret terpisah. Tidak ada impor data nyata ke prod sebelum sign-off UAT.
- Push dari mesin ini: `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin development docs` (Git Credential Manager menyimpan akun lama).
- Pengaturan akun (membuat project, menghubungkan Vercel ke organisasi GitHub, DNS) dikerjakan pemilik atau setelah persetujuan eksplisit; agen menyiapkan langkah dan memverifikasi hasilnya.

## Setiap tahap selesai

Perbarui tugas terkait, `documentation/ENVIRONMENTS.md`, dan jalankan skill `vault-progress`.

## Rilis ke production secara bertahap (pelajaran 2026-11-06)

1. **Ukur dulu:** `git diff --stat origin/main...HEAD` dan `git log origin/main..HEAD`. Cabang fitur yang lama membawa banyak pekerjaan lain (cabang produksi multi WC membawa 175 berkas); rilis "kecil" tidak dapat dipotong bersih. Laporkan cakupan sebenarnya kepada pemilik sebelum meminta persetujuan.
2. **Pra-cek baca-saja di production:** jumlah baris tabel inti (baseline), `pg_policies`, `pg_trigger`, daftar migration terpasang (`list_migrations`), advisor.
3. **Gabung `main` ke cabang** (`git merge origin/main`), selesaikan konflik dengan menjaga kedua sisi, regresi penuh dan unit 0 FAIL.
4. **Database dahulu, hanya menambah:** terapkan migration draf satu per satu (14 lalu 18); sesudah tiap migration bandingkan jumlah baris dengan baseline dan jalankan advisor. Migration yang belum teruji di database (17) tidak ikut. Adapter memperlakukan tabel baru sebagai opsional sehingga urutan database lalu kode aman.
5. **Kode:** PR dari cabang fitur ke `main`, CI dua pemeriksaan hijau (jangan menyatakan hijau sebelum regresi selesai), merge, tunggu deploy Vercel Ready.
6. **Verifikasi:** halaman produksi termuat, tiap modul terbuka tanpa galat, jumlah baris tidak berubah, versi `main` sama dengan deploy.
7. **Rollback:** kode lewat Vercel (promosikan deploy sebelumnya); database lewat `DROP TABLE` tabel baru yang masih kosong dan `ALTER POLICY` kembali ke ekspresi lama (tercatat di berkas draf).
8. **Dampak perilaku bagi tim** (contoh penjaga kirim ke customer) dicatat di CHANGELOG dan diberitahukan sebelum rilis.

Setiap tindakan di langkah 4 sampai 6 butuh persetujuan eksplisit pemilik untuk cakupan itu; persetujuan umum ("lanjut semua") atas daftar pilihan tidak cukup bila langkah itu menyentuh data nyata dan dampaknya belum dijelaskan.
