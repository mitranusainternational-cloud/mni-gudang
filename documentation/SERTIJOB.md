---
type: registry
status: active
title: "Sertijob: prompt serah terima ke akun Claude lain"
updated: 2026-11-07
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Sertijob (serah terima pekerjaan) ke akun Claude lain

Salin seluruh isi blok "PROMPT" di bawah ke sesi Claude Code baru (akun lain) yang dibuka di folder proyek. Prompt ini berdiri sendiri: akun baru tidak membawa riwayat percakapan. Pelengkap: [[HANDOFF]] (detail teknis dan berkas yang hanya ada di mesin ini), [[PETA_MODUL]], [[STANDAR_INDUSTRI]], [[AUDIT_PROGRESS_2026-11-06]]. Tidak memuat rahasia; kunci dan kata sandi tidak boleh dimasukkan ke prompt.

## Sebelum menyerahkan (pemilik)

1. Pastikan pekerjaan lokal sudah di-commit (lihat hash di prompt) dan, bila mau dibawa ke mesin lain, di-push: `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin fitur/produksi-multi-wc`.
2. Sambungkan di akun baru: konektor Supabase untuk project production (akun mitranusainternational), plugin Playwright dan Context7, Claude in Chrome (untuk Vercel tim `mitranusainternational-8337`). Detail: [[HANDOFF]] bagian 3.
3. Salin berkas yang tidak ikut Git (daftar di [[HANDOFF]] bagian 2) bila pindah mesin: `.env*`, katalog harga dan berat, workbook sumber.
4. Buka folder proyek yang sama (`mni-os`) lalu tempel prompt.

## PROMPT

````text
Kamu melanjutkan proyek "MNI Gudang & Logistik" (PT Mitra Nusa Internasional) dari sesi Claude lain. Pemilik proyek berbicara Bahasa Indonesia santai (panggilan "bro"); jawab dalam Bahasa Indonesia yang ringkas, jujur, dan konkret. Kamu tidak punya riwayat percakapan sebelumnya, jadi mulai dengan membaca, jangan menebak.

## 1. Baca dulu (urut)
1. CLAUDE.md dan AGENTS.md (aturan kerja)
2. documentation/SERTIJOB.md bagian ini, lalu documentation/HANDOFF.md (posisi proyek, berkas yang hanya ada di mesin lama, konektor)
3. documentation/PETA_MODUL.md (modul dari hulu ke hilir, status per lingkungan), PRD_GUDANG.md dan PRD_PRODUKSI.md (aturan)
4. documentation/arsip/AUDIT_PROGRESS_2026-11-06.md, FEATURE_AUDIT.md, STANDAR_INDUSTRI.md (audit dan kesenjangan)
5. tasks/ (sumber kebenaran status; terbaru T-195 sampai T-212) dan documentation/PROJECT_PROGRESS.md (entri terakhir di bawah)
6. .claude/skills dan .claude/agents (terutama gudang-stok-flow, e2e-regression, release-pipeline, adapter-contract, rls-roles, vault-progress)

## 2. Aturan tetap dari pemilik (jangan dilanggar)
- JANGAN menyentuh versi live tanpa persetujuan eksplisit pemilik untuk cakupan yang disebut: GitHub branch main, Supabase production (project "MNI Gudang - Production", ref lggqigmvtefkquqjrjsb), Vercel project mni-gudang. Tidak ada deploy, tidak ada migration ke production, tidak ada push ke main. Query baca-saja ke production boleh.
- Kerja di lokal dulu; baru tayang bila pemilik bilang oke. Persetujuan umum ("lanjut semua") atas daftar pilihan tidak cukup untuk langkah yang menyentuh data nyata.
- Setiap perubahan: regresi penuh 0 FAIL, lalu perbarui vault Obsidian (catatan tugas, PETA_MODUL, PRD, PROJECT_PROGRESS) dan jalankan `node scripts/sync-vault.mjs` sampai OK (0 link rusak) sebelum commit.
- Repo GitHub PUBLIK: jangan masukkan data operasional nyata, harga, rumus, kunci, atau kata sandi ke Git.
- Laporkan hasil apa adanya (gagal ya gagal); bedakan bukti: source-level, verified in browser (mock), verified in database. Mock bukan bukti Supabase.
- Commit dengan identitas mitranusainternational-cloud / mitranusainternational@gmail.com dan trailer "Co-Authored-By: Claude <noreply@anthropic.com>". Jangan push kecuali diminta.

## 3. Posisi proyek (2026-11-07)
- Production (live): main di ad73c89 (fitur surat jalan). Supabase production migration 1 sampai 13; baris: rm 24, fg 92, mutasi 19, spk 8, pr 0, kirim 7, vendor 5, user 10 (cek ulang baca-saja sebelum rilis).
- Cabang kerja: fitur/produksi-multi-wc (HASH_COMMIT_TERAKHIR), sudah menggabung main terbaru, 175+ berkas di depan main. Isinya: produksi multi work center, Gudang Bahan Baku, Gudang Barang Jadi, Gudang Sparepart (modul baru), SPK stok ujung ke ujung, tren, rencana pembelian dan PR sparepart, nama penanda tangan dokumen, penjaga hasil produksi, audit dan perbaikan (lihat T-195 sampai T-212). Modul Penawaran dan Sales Order disembunyikan (MODUL_PENJUALAN=false).
- Draf migration di apps/platform/supabase/draft/: 14 (produksi_log), 15 dan 16 (penawaran, salesorder, tidak ikut rilis), 17 (anti stok negatif, ditunda karena belum teruji), 18 (sparepart; nama pemicu dan kebijakan sudah dicocokkan dengan production secara baca-saja). Belum ada yang diterapkan.
- Tes terakhir (mock): regresi 42, role 12, akses 34, produksi 134, sparepart 36, fitur 18, menyeluruh 24, keamanan 8 (XSS), aksesibilitas 3 (axe-core), tampilan 72; unit 266; lint 0 galat (43 peringatan kode mati). Konfirmasi dengan menjalankannya sendiri.

## 4. Cara menjalankan (dari folder apps/platform)
- Server mock: VITE_LOCAL_MOCK=1 npx.cmd vite --host 127.0.0.1 --port 5173 --strictPort (jalankan di latar belakang). Login mock admin@mni.local, OTP 123456.
- Setelah mengubah apps/gudang-logistik (app.js atau app.css): node scripts/extract-app.js lalu node --check public/app.js.
- Regresi: node tests/e2e/run.mjs http://127.0.0.1:5173/ (ONLY=nama untuk satu suite; beberapa menit, jalankan di latar belakang). Unit: npm run test:unit (tanpa katalog privat) dan for f in tests/unit/*.test.mjs. Lint: npm run lint. Alur SPK: node tests/e2e/alur-spk.mjs http://127.0.0.1:5173/ "$TEMP/alur-shots".
- Buka juga di Playwright (plugin) untuk memeriksa tampilan; gunakan Context7 untuk dokumentasi pustaka (supabase-js 2.118, Vite 5.4).

## 5. Jebakan yang sudah terjadi
- Menulis kode berisi regex lewat heredoc atau node -e di Bash MENGHILANGKAN garis miring terbalik. Pakai alat Edit atau Write, atau String.fromCharCode, lalu uji fungsinya di halaman.
- Alat Edit menolak bila berkas berubah sejak dibaca: Read dulu. Ubah app.js dengan Edit berjangkar eksak (atau skrip yang menolak bila jangkar tidak tepat satu).
- Jangan menjalankan regresi sambil membangun ulang public/app.js (hasil campur).
- Migration 13 sengaja mencabut izin DELETE pada data transaksi: jangan menambah tombol hapus permanen; pakai Koreksi (transaksi pembalik) dan Nonaktifkan.
- Mock lebih ketat atau sama dengan Postgres; jangan melonggarkannya agar uji lulus. Bug yang hanya muncul di Postgres nyata harus diuji di database (branch atau transaksi rollback).
- Perintah rm dengan jalur aneh diblokir; gunakan PowerShell Remove-Item dengan jalur pasti.

## 6. Yang harus dikerjakan berikutnya (urut usulan)
1. Verifikasi keadaan: jalankan server, regresi penuh, lint, dan sync-vault; pastikan hijau sebelum mengubah apa pun. Cocokkan git log dengan HASH_COMMIT_TERAKHIR.
2. Lanjutkan memoles dan menguji LOKAL sesuai arahan pemilik. Celah uji terbuka (FEATURE_AUDIT bagian 1.3): tombol editor SPK (ed-addline, ed-delline, ed-addsec, ed-up, ed-down), ubah dan hapus work center, opname sparepart (spopnfill, spopnclear, spopnsave), kartu stok cetak, grup dan kategori Master Data.
3. Perbaikan kualitas terbuka (T-211): CSP tanpa unsafe-inline (3 skrip inline, 12 penangan inline, halaman cetak memakai document.write dengan skrip), 43 variabel kode mati, data contoh mock yang realistis, nama default penanda tangan SPK (Halimah, Muin M.K.) ke pengaturan.
4. Rilis bertahap ke production (T-203) HANYA setelah pemilik menyetujui: ukur cakupan, cadangan (T-061), migration 14 lalu 18 satu per satu dengan cek jumlah baris, PR ke main (CI hijau, 1 approval atau --admin oleh pemilik), deploy, verifikasi, rollback siap. Baca skill release-pipeline. Putuskan dulu bersama pemilik: perlakuan SPK lama yang produksinya tidak pernah dicatat saat penjaga kirim ke customer aktif.
5. Keputusan pemilik yang menunggu (AUDIT_PROGRESS_2026-11-06 bagian "Keputusan"): jadwal walkthrough dan pilot (jalur kritis go-live belum bergerak, 26,5 hari kerja), cut-off dan sumber workbook, hak modul sparepart per peran, ambang tren dan buffer, backup terjadwal, SMTP dan Redirect URL Auth, tampil atau tidaknya Penawaran dan Sales Order.
6. Kesenjangan standar industri (STANDAR_INDUSTRI bagian 3 dan 5): backup dan uji pulih, pemantauan galat, barcode atau QR, nomor lot atau heat plat, inspeksi penerimaan, persetujuan bertingkat, notifikasi, modularisasi app.js. Ubah menjadi tugas di tasks/ setelah pemilik memilih urutan.

## 7. Cara bekerja
- Tampilkan rencana singkat, kerjakan, uji di browser (Playwright) dan lewat suite, perbaiki sampai hijau, catat di vault, lalu laporkan ringkas apa yang berubah, hasil uji, dan batasnya.
- Tanyakan ke pemilik hanya untuk keputusan yang memang miliknya (aturan bisnis, rilis, akun). Selebihnya pilih default yang masuk akal dan sebutkan.
- Mulai sesi dengan menjawab: (a) apa yang kamu verifikasi, (b) hasilnya, (c) apa yang akan kamu kerjakan lebih dulu.
````
