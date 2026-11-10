---
type: task
id: T-197
title: "Gudang Sparepart: modul baru dari tabel stok Excel (impor, opname, dokumen, buffer)"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 3
depends: [T-196]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-197 Gudang Sparepart: modul baru dari tabel stok Excel (impor, opname, dokumen, buffer)

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-196

## Kriteria selesai

- [x] Modul Gudang Sparepart (`#sparepart`) dengan koleksi `sp`; stok = stok awal + jumlah mutasi (gudang `sp`)
- [x] Impor dari tabel stok Excel: pratinjau, total cocok lembar Ringkasan, idempoten (impor ulang tidak menggandakan)
- [x] Terima, keluarkan (ditolak bila melebihi stok), opname, koreksi, item nonaktif; dokumen SP-M, SP-K, SP-OPN dengan PDF dan Excel
- [x] Stok minimum dan buffer per barang; status Habis, Stok minimum, Di bawah buffer, Aman; minimum tidak boleh melebihi buffer
- [x] Hak modul `sparepart` pada peran Gudang Bahan Baku (`gbb`) dan admin
- [ ] Migration 18 diterapkan di production dan dicek (tabel `sp`, kebijakan `pr` dan `mutasi`, `table_stamps`)

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd, f62c395). Draf `supabase/draft/20240101000018_sparepart.sql`, belum diterapkan di database mana pun.
- Verified in browser (mock): `tests/e2e/sparepart.mjs` SP-1 sampai SP-35 lulus; data sintetis, bukan data Excel nyata di repo.
- Verified in database (hanya baca, production 2026-11-06): nama kebijakan `pr` dan `mutasi`, pemicu `trigger_<tabel>_updated_at`, dan fungsi `can_view`, `can_mod`, `audit_row`, `update_updated_at` cocok dengan draf.

## Catatan

- Repo publik: data stok nyata tidak masuk Git; daftar diimpor dari Excel lewat tombol Impor Excel. Tabel `sp` bersifat opsional di adapter (tabel belum ada dibaca kosong).
