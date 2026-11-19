---
type: task
id: T-236
title: "Sub-komponen mesin (mis. dies pada mesin Punching) untuk pelacakan Maintenance"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-234]
owner: "dev + pemilik"
updated: 2026-11-19
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-236 Sub-komponen mesin

Permintaan pemilik 2026-11-19: satu mesin bisa punya bagian yang dirawat sendiri (contoh dies pada mesin Punching), dan Maintenance harus bisa melacak sampai sub-komponen itu.

## Kriteria selesai

- [x] Master Data > Mesin: kolom **Sub-komponen** (satu per baris, kode opsional setelah `|`) untuk mesin apa pun; disimpan di `master/setting` (mesinInfo atau mesinLain), **tanpa tabel atau migration baru**
- [x] Catat maintenance dan Jadwal rutin: kolom **Sub-komponen (opsional)**, pilihan mengikuti mesin yang diketik; sub baru yang diketik otomatis masuk Master Data mesin itu
- [x] Catatan dan jadwal rutin menampilkan sub (`↳ nama`); tombol Kerjakan membawa sub ke catatan
- [x] Tab **Per mesin**: panel **Per sub-komponen** (maintenance, korektif, preventif, berhenti, MTBF, sparepart diganti, terakhir); klik baris menyaring riwayat
- [x] Laporan PDF dan Excel: tabel **Per sub-komponen**, kolom mesin memuat `mesin > sub`
- [x] Data lama tidak berubah: catatan tanpa sub dihitung sebagai `(umum)`
- [ ] Pemilik memindahkan "Dies 8 Cavity no 1/2" (kini berdiri sebagai mesin di grup Punching) menjadi sub mesin Punching lewat Ubah; riwayat sparepart lama tetap atas nama mesin lama

## Bukti

`verified in browser` (mock). Unit `maintenance.test` 12 PASS (M-11, M-12 baru), e2e `maintenance` 18 PASS (MT-12..MT-14 baru), suite terkait (masterdata, mesinsparepart, sparepart, fitur, menyeluruh, role, akses, aturanproses) 0 FAIL, lint 0 error. Mock bukan bukti Supabase; data sub ada di JSON setting yang sudah ada, jadi tidak ada perubahan skema.
