---
name: vault-progress
description: Perbarui progress proyek di vault Obsidian (tugas, epic, roadmap, snapshot, catatan progress) setiap kali sebuah langkah selesai, berhenti di blocker, atau berubah rencana. Gunakan setelah mengerjakan, menguji, men-deploy, atau memutuskan sesuatu di proyek MNI OS.
---

# Memperbarui progress di Obsidian

Sumber kebenaran status = catatan di `tasks/`. Epic, snapshot, dan dashboard dihitung dari sana. Jangan menulis status di tempat lain.

## Alur (lakukan pada setiap langkah selesai, bukan di akhir)

1. **Cari tugas** terkait di `tasks/` (nama `T-xxx-*.md`). Belum ada → salin `documentation/templates/TASK_TEMPLATE.md`, beri ID berikutnya, isi `epic` dan `release` yang sama dengan catatan epic di `roadmap/epics/`, dan `depends`.
2. **Ubah properti**: `status` (`todo`, `doing`, `blocked`, `review`, `done`), `updated`. `blocked` wajib menyebut penyebab dan pemilik tindakan di bagian Catatan.
3. **Centang kriteria** dan tulis **bukti** di bagian Bukti: commit/branch, cara verifikasi, hasil, dan tingkat bukti (`source-level`, `verified in browser`, `verified in database`). Tanpa bukti jangan ubah ke `done`.
4. **Catat entri bertanggal** di `documentation/PROJECT_PROGRESS.md` (hasil, bukti, hambatan, langkah berikut) untuk perubahan yang berdampak. Keputusan baru → `documentation/DECISIONS.md`. Bug → `documentation/TEST_MATRIX.md` (ID B-xxx).
5. **Jalankan** `node scripts/sync-vault.mjs`. Harus berakhir `OK` (0 link rusak, 0 properti hilang, 0 masalah data tugas).
6. **Commit** di cabang kerja (`fitur/<nama>` atau `development`) dengan pesan jelas; jangan menambah `.obsidian/` atau data privat.
7. **Modul berubah?** Perbarui baris modul di `documentation/PETA_MODUL.md` (hulu, hilir, koleksi, migration, dokumen, status lokal atau production, tugas, uji) dan aturan di `documentation/PRD_GUDANG.md` atau `PRD_PRODUKSI.md`.

## Aturan

- Satu tugas = satu hasil yang dapat diverifikasi (di bawah sekitar 5 hari). Pecah bila lebih besar.
- Prioritas: P0 menahan go-live, P1 penting, P2 boleh ditunda.
- Jangan mengklaim koneksi Supabase, login nyata, atau RLS terbukti bila hanya diuji di mock. Tulis cakupan sebenarnya.
- Wikilink memakai nama unik atau path dari root vault; jangan `../`.
- Berkas turunan (`PROGRESS_SNAPSHOT.md`, `VAULT_HEALTH.md`, properti dan daftar tugas di catatan epic) dibuat skrip; jangan diedit manual.

## Rujukan

[[documentation/PROGRESS_DASHBOARD]], [[roadmap/PRODUCT_ROADMAP]], [[documentation/INTEGRATION_PATH]], `scripts/sync-vault.mjs`.

## Audit berkala (dipelajari 2026-11-06)

Setiap beberapa rangkaian fitur, cocokkan: (1) setiap fitur yang dikerjakan punya catatan tugas dengan bukti dan tingkat bukti; (2) status tugas sesuai kenyataan (jangan membiarkan `doing` bila hanya menunggu pemilik: pakai `review`); (3) `documentation/PETA_MODUL.md`, `SISTEM_MAP.md`, `ROADMAP.md`, `roadmap/PRODUCT_ROADMAP.md`, `HANDOFF.md`, `CLAUDE.md`, dan `Home.md` tidak bertanggal lama atau menulis kondisi yang sudah berubah; (4) skill dan agen sesuai kode; (5) jumlah uji di `TEST_MATRIX` sesuai hasil terakhir. Jalankan `node scripts/sync-vault.mjs` hingga OK.
