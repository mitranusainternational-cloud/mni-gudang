---
type: task
id: T-206
title: "Anti stok negatif dan penimpaan bersamaan di database (draf migration 17)"
phase: P2
epic: E-10
release: v1.1
status: todo
priority: P2
env: dev
effort_days: 1.5
depends: [T-203]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-206 Anti stok negatif dan penimpaan bersamaan di database (draf migration 17)

Epic: [[roadmap/epics/E-10-kualitas-data-dan-kontrol-stok|E-10]]
Fase: P2
Bergantung pada: T-203

## Kriteria selesai

- [x] Draf `supabase/draft/20240101000017_stok_tidak_negatif.sql`: pemicu BEFORE pada `mutasi` memeriksa ulang stok di database, diserialkan per item dengan kunci advisory, galat "Stok tidak cukup"
- [x] Pra-cek production baca-saja (2026-11-06): tidak ada mutasi tanpa item_id, tidak ada gudang selain rm dan fg, tidak ada stok negatif saat ini
- [ ] Uji lima langkah di berkas draf pada branch database atau project uji, termasuk dua pengeluaran bersamaan
- [ ] Draf diperluas untuk gudang `sp` bila migration 18 terpasang lebih dulu
- [ ] Diterapkan di production setelah persetujuan pemilik dan rilis T-203

## Bukti

- Berkas draf di `fitur/produksi-multi-wc`; belum dijalankan di database mana pun.

## Catatan

- Ditunda dari rilis T-203 karena belum teruji; pemicu yang salah dapat menahan transaksi sah. UI sudah menolak pengeluaran melebihi stok; migration ini menutup celah pengeluaran bersamaan.
