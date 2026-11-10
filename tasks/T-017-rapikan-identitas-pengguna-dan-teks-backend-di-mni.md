---
type: task
id: T-017
title: "Rapikan identitas pengguna dan teks backend di mni-app"
phase: P1
epic: E-02
release: v0.9
status: todo
priority: P2
env: development
effort_days: 0.5
depends: [T-016]
owner: "dev"
updated: 2026-11-06
---

# T-017 Rapikan identitas pengguna dan teks backend di mni-app

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]  
Fase: P1 Fondasi lokal  
Bergantung pada: T-016

## Kriteria selesai

- [ ] Sidebar menampilkan nama dan role user yang login
- [ ] Teks Backend belum terhubung hanya tampil bila memang tidak terhubung

## Bukti

- Belum ada.

## Catatan

Sumber teks ada di apps/gudang-logistik/index.html (prototipe). Perubahan memengaruhi kedua aplikasi; uji keduanya.

> [!note] Audit 2026-11-06
> Kemungkinan sudah tercapai: sidebar menampilkan nama dan peran pengguna ("Admin Lokal / Super Admin") dan kaki halaman menampilkan status koneksi pada tangkapan layar 2026-11-06 di mock. Perlu diverifikasi di production sebelum ditutup.
