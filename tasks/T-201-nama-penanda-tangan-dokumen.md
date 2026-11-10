---
type: task
id: T-201
title: "Nama penanda tangan pada semua dokumen: ketik manual, saran dari nama yang pernah diketik"
phase: P2
epic: E-12
release: v1.2
status: review
priority: P2
env: dev
effort_days: 1
depends: [T-196]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-201 Nama penanda tangan pada semua dokumen: ketik manual, saran dari nama yang pernah diketik

Epic: [[roadmap/epics/E-12-pelaporan-notifikasi-dan-dokumen|E-12]]
Fase: P2
Bergantung pada: T-196

## Kriteria selesai

- [x] Dialog nama muncul sebelum cetak atau unduh dokumen berbaris tanda tangan (mutasi tiga gudang, opname, PR, dokumen pusat seperti surat jalan dan laporan)
- [x] Nama yang pernah diketik muncul sebagai saran dan terisi otomatis per jabatan; kosong berarti garis kosong untuk tulis tangan
- [ ] Daftar nama dibagi antar pengguna lewat database (saat ini tersimpan per perangkat di browser)
- [ ] Pratinjau surat jalan di layar memakai dialog yang sama

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd).
- Verified in browser (mock): SP-27 dan SP-28 lulus.

## Catatan

- Penyimpanan `localStorage` (`mni-signers`) bersifat kenyamanan per perangkat, bukan data bersama.
