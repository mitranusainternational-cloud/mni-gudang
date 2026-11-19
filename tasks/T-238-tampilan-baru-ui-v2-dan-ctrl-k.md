---
type: task
id: T-238
title: "Tampilan baru (UI v2): bilah atas, breadcrumb, pencarian cepat Ctrl K, gaya modern"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P2
env: dev
effort_days: 1
depends: [T-237]
owner: "dev + pemilik"
updated: 2026-11-20
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-238 Tampilan baru (UI v2)

Memindahkan tampilan baru dari repo WMS-MNI (T-238 di sana): hanya gaya dan bilah atas; markup, field, dan aksi layar tidak berubah.

## Kriteria selesai

- [x] Bilah atas: tombol kecilkan menu, breadcrumb (kelompok › layar), pencarian cepat, tema, status realtime, akun
- [x] Pencarian cepat **Ctrl K** (hanya navigasi): layar, SPK, surat jalan
- [x] Gaya baru (token warna, kartu, tipografi Plus Jakarta Sans, layar mesin ringkas untuk HP) sebagai blok CSS tambahan
- [x] Perbaikan kecil Timeline: garis jatuh tempo tidak menghalangi klik
- [ ] Penilaian pemilik atas tampilan di perangkat nyata (terang, gelap, HP)

## Bukti

`verified in browser` (mock, tangkapan layar Dashboard). e2e `uiv2` 3 PASS; suite tampilan 72, regresi 42, role 12, akses 34, fitur 18, keamanan 8, aksesibilitas 4, menyeluruh 24, semuanya 0 FAIL.
