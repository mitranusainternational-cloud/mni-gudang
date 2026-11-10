---
type: task
id: T-203
title: "Rilis paket Gudang, SPK stok, dan produksi multi WC ke production (bertahap)"
phase: P2
epic: E-05
release: v1.0
status: todo
priority: P1
env: production
effort_days: 1.5
depends: [T-174, T-196, T-197, T-198, T-199]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-203 Rilis paket Gudang, SPK stok, dan produksi multi WC ke production (bertahap)

Epic: [[roadmap/epics/E-05-environment-cloud-dan-ci-cd|E-05]]
Fase: P2
Bergantung pada: T-174, T-196, T-197, T-198, T-199

## Kriteria selesai

- [x] Branch `fitur/produksi-multi-wc` digabung dengan `main` terbaru (surat jalan) dan regresi penuh 0 FAIL (2026-11-06, 35bf7f7)
- [x] Pra-cek production hanya baca: baseline jumlah baris (rm 24, fg 92, mutasi 19, spk 8, pr 0, kirim 7, vendor 5, user 10) dan kebijakan serta pemicu cocok dengan draf
- [ ] Persetujuan eksplisit pemilik untuk jadwal rilis (dijeda 2026-11-06: fokus pemolesan lokal dahulu)
- [ ] Migration 14 (`produksi_log`) lalu 18 (`sp`) diterapkan berurutan; jumlah baris sama dengan baseline; advisor Supabase dicek
- [ ] Migration 17 (anti stok negatif) TIDAK ikut rilis ini: belum pernah diuji di database dan dapat menahan transaksi sah bila data lama memuat stok negatif
- [ ] PR ke `main` (CI dua pemeriksaan hijau), merge, deploy Vercel Ready
- [ ] Verifikasi production: login, tiap modul terbuka, jumlah baris tidak berubah, rollback Vercel disiapkan

## Bukti

- Commit/branch: merge main ke `fitur/produksi-multi-wc` 35bf7f7 (lokal, belum di-push).
- Verified in database (hanya baca, 2026-11-06): lihat catatan T-197.

## Catatan

- Rencana rilis bertahap terbaru (2026-11-10): [[documentation/RENCANA_RILIS_BERTAHAP_2026-11-10|RENCANA_RILIS_BERTAHAP_2026-11-10]].

- Urutan aman: database dahulu (tambahan saja, adapter memperlakukan `produksi_log` dan `sp` sebagai opsional), lalu kode. Rollback kode: Vercel promote deploy sebelumnya; rollback database: `DROP TABLE` kosong plus kembalikan kebijakan (lihat bagian rollback di berkas draf). Dampak perilaku bagi tim: penjaga kirim ke customer dan terima SPK stok (T-199).

> [!note] Audit 2026-11-06
> Koreksi 2026-11-06: pra-cek production menunjukkan tidak ada stok negatif saat ini; migration 17 tetap ditunda karena belum diuji (T-206). Cakupan rilis: cabang membawa 175 berkas dari `main`, tidak hanya gudang.
