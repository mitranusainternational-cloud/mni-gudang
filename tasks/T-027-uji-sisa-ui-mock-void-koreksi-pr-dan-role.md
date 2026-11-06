---
type: task
id: T-027
title: "Uji sisa UI mock: void, koreksi, PR, dan role"
phase: P2
epic: E-03
release: v1.0
status: todo
priority: P2
env: development
effort_days: 1.5
depends: [T-026]
owner: "dev"
updated: 2026-11-06
---

# T-027 Uji sisa UI mock: void, koreksi, PR, dan role

Epic: [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data|E-03]]
Fase: P2 Aplikasi siap uji  
Bergantung pada: T-026

## Kriteria selesai

- [ ] Batalkan dan koreksi bongkar muat diuji
- [ ] Modul PR/usulan pembelian diuji
- [ ] Tab KPI & Analisa diperiksa
- [ ] Opname bahan baku dan ekspor XLSX modul gudang diuji
- [ ] Menu mobile penuh dan tampilan per role dicek

## Bukti

- Belum ada. Daftar di [[TEST_MATRIX]].

## Catatan

Dikerjakan di mock; role sungguhan menunggu T-022.

> [!note] Audit 2026-11-06
> Sebagian tercakup: Batal dan koreksi gudang diuji di regresi dan sparepart (SP-6, opname, koreksi), PR di SP-19 sampai SP-21 (sparepart), role di roles.mjs dan access.mjs, mobile di sweep.mjs. Belum ada uji bongkar muat void dan koreksi serta tab KPI & Analisa dan ekspor XLSX semua modul. Keluarkan daftar sisa dari [[TEST_MATRIX]] sebelum dikerjakan.
