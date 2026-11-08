---
type: registry
status: active
updated: 2026-11-08
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Indeks cepat: mulai kerja dalam 2 menit

Halaman ini sengaja pendek. Tujuannya menghemat token: baca halaman ini dulu, lalu hanya buka yang dibutuhkan tugas. Jangan membaca semua dokumen di awal sesi.

## 1. Baca (urut, hanya ini di awal sesi)
1. Status terkini: tugas terbaru di `tasks/` (urutkan berdasarkan nomor, ambil 3 terakhir yang `doing` atau `review`) dan entri terakhir di [[PROJECT_PROGRESS]].
2. Aturan kerja: [[CLAUDE]] dan [[AGENTS]] (ringkas).
3. Modul yang disentuh tugas: [[PETA_MODUL]] (satu baris per modul), lalu PRD yang relevan: [[PRD_GUDANG]] atau [[PRD_PRODUKSI]].
4. Serah terima antar akun: [[SERTIJOB]] (prompt) dan [[HANDOFF]] (berkas lokal, konektor).

Lainnya dibuka hanya bila dibutuhkan: audit ([[AUDIT_PROGRESS_2026-11-07]], [[FEATURE_AUDIT]], [[STANDAR_INDUSTRI]]), rencana go-live ([[GO_LIVE_PLAN]]), dan peta sumber daya ([[SISTEM_MAP]]).

## 2. Jalankan (dari `apps/platform`)
| Tujuan | Perintah |
|---|---|
| Nyalakan mock | `VITE_LOCAL_MOCK=1 npx.cmd vite --host 127.0.0.1 --port 5173 --strictPort` (latar belakang) |
| Bangun UI setelah ubah `app.js` atau `app.css` | `node scripts/extract-app.js` lalu `node --check public/app.js` |
| Satu suite | `ONLY=nama node tests/e2e/run.mjs http://127.0.0.1:5173/` |
| Semua suite (lama) | `node tests/e2e/run.mjs http://127.0.0.1:5173/` (latar belakang) |
| Unit (tanpa katalog privat) | `npm run test:unit` |
| Lint | `npm run lint` (0 galat wajib) |
| Vault | `node scripts/sync-vault.mjs` (harus OK sebelum commit) |

Login mock: `admin@mni.local`, OTP `123456`.

## 3. Catat (wajib setiap perubahan berdampak)
1. Tugas: ubah `status` dan `updated` di `tasks/T-xxx`, isi bukti (tingkat bukti: source-level, verified in browser, verified in database).
2. Log: satu entri bertanggal di [[PROJECT_PROGRESS]] (hasil, bukti, hambatan, langkah berikut).
3. Uji: angka di [[TEST_MATRIX]] bila suite berubah.
4. Vault: `node scripts/sync-vault.mjs`, lalu commit.

## 4. Aturan hemat token (untuk pekerja manusia dan Claude)
- Satu tugas = satu hasil yang bisa diuji. Jangan melebar: temuan di luar tugas dicatat sebagai tugas baru, tidak dikerjakan di tempat.
- Ubah berkas dengan Edit berjangkar eksak; jangan menulis ulang berkas besar (`app.js` lebih dari 5.000 baris).
- Jangan menulis kode berisi regex lewat heredoc atau `node -e` di Bash (garis miring hilang); pakai Edit atau Write.
- Jalankan suite sesuai cakupan: satu suite saat mengubah modulnya, regresi penuh hanya sebelum commit dan rilis.
- Output panjang: simpan ke berkas sementara (`$TEMP`) dan baca bagian yang perlu, bukan seluruh keluaran.
- Dokumen turunan (PROGRESS_SNAPSHOT, VAULT_HEALTH) dibuat skrip; jangan diedit manual.

## 5. Batas yang tidak boleh dilanggar
- Tidak ada deploy, migration ke production, atau push ke `main` tanpa persetujuan eksplisit pemilik untuk cakupan yang disebut.
- Repo publik: tidak ada data operasional nyata, harga, rumus, atau kunci di Git.
- Migration 13 mencabut DELETE pada transaksi: tidak ada hapus permanen; pakai Koreksi atau Nonaktifkan.
- Bedakan bukti: mock bukan bukti Supabase.
