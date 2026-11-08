---
project: MNI Gudang & Logistik
type: project-dashboard
status: active
active-version: fitur/produksi-multi-wc
updated: 2026-11-06
---

<img src="documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# MNI Gudang & Logistik

> [!summary] Satu vault untuk kode, rencana, progress, riset, dan bukti
> Sistem custom untuk tim Operasional MNI. Arah, kebutuhan, dan prioritas berasal dari proses nyata tim; referensi eksternal hanya pembanding. Status di bawah dihitung dari catatan tugas, bukan ditulis tangan.

## 1. Status sekarang

![[PROGRESS_SNAPSHOT#Ringkasan]]

Dashboard interaktif: [[PROGRESS_DASHBOARD]] · Kesehatan vault: [[VAULT_HEALTH]]

| Area | Kondisi | Detail |
|---|---|---|
| Aplikasi (live) | Tayang di https://mni-gudang.vercel.app dengan Supabase Production; versi stabil = `main` (PR 14) | [[documentation/SISTEM_MAP]] |
| Aplikasi (lokal) | Belum tayang, branch `fitur/produksi-multi-wc` (35bf7f7, sudah menggabung `main` terbaru): produksi multi work center, Gudang Bahan Baku, Barang Jadi, Sparepart, SPK stok, tren, dokumen bernama penanda tangan; Penawaran dan Sales Order disembunyikan. Regresi penuh 0 FAIL di mock. Rilis dijeda ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]]). Menunggu penilaian pemilik sebelum deploy | [[documentation/HANDOFF]] · [[documentation/PROJECT_PROGRESS]] · [[documentation/LOCAL_PREVIEW]] |
| Database | Production `MNI Gudang - Production`: migration 1–13 terpasang, 22 tabel ber-RLS (dicek 2026-11-06). Migration 14 sampai 18 masih draf lokal (17 ditunda). Dev lama dipensiunkan | [[documentation/ENVIRONMENTS]] · [[documentation/SISTEM_MAP]] |
| Data | Enam workbook terprofil read-only; sumber resmi dan saldo belum direkonsiliasi | [[documentation/DATA_SOURCE_CATALOG]] |
| Kebutuhan | Discovery bersama tim Operasional belum dimulai; pilot belum dipilih | [[documentation/OPERATIONAL_DISCOVERY]] |
| GitHub | `main` terproteksi (PR + 1 approval, CI wajib); `fitur/produksi-multi-wc` sudah di-push, belum di-PR | [[documentation/GITHUB_MIGRATION]] |
| Deploy | Vercel Production aktif; variabel lingkungan baru berlabel Production (Preview belum). **Tidak ada deploy atau perubahan production tanpa persetujuan pemilik** | [[documentation/INTEGRATION_PATH]] · [[GO_LIVE_PLAN]] |

> [!tip] Mulai di sini
> Untuk kerja harian pakai [[documentation/INDEKS_CEPAT]] (satu halaman: baca, jalankan, catat, batas). Halaman ini cukup sebagai peta.

## 2. Saya ingin…

| Tujuan | Buka |
|---|---|
| Tahu apa yang dikerjakan berikutnya | [[PROGRESS_SNAPSHOT#Siap dikerjakan sekarang (dependensi terpenuhi)]] |
| Melihat peta modul dari hulu ke hilir | [[documentation/PETA_MODUL]] |
| Melihat audit kerangka, keamanan, aksesibilitas, dan standar industri | [[documentation/STANDAR_INDUSTRI]] |
| Melihat audit selesai vs belum dan keputusan pemilik | [[documentation/AUDIT_PROGRESS_2026-11-06]] |
| Memahami aturan stok, buffer, SPK stok, dan dokumen gudang | [[documentation/PRD_GUDANG]] |
| Melihat arah produk dan rilis | [[roadmap/PRODUCT_ROADMAP]] |
| Melihat langkah menuju go-live | [[GO_LIVE_PLAN]] |
| Melihat jalur integrasi lokal → Supabase → GitHub → Vercel → VPS | [[documentation/INTEGRATION_PATH]] |
| Memilih agen atau skill kerja | [[documentation/TEAM_AND_SKILLS]] (`.claude/`) |
| Memahami role dan hak akses | `.claude/skills/rls-roles/SKILL.md` dan [[documentation/DECISIONS]] |
| Memperbarui status pekerjaan | [[PROGRESS_DASHBOARD#Cara memperbarui (rutin, 2 menit)]] |
| Membaca keputusan dan alasannya | [[documentation/DECISIONS]] |
| Menyiapkan sesi dengan tim Operasional | [[documentation/DISCOVERY_AGENDA]] |
| Memahami tiga versi (Development, Main, Docs) | [[documentation/ENVIRONMENTS]] dan [[documentation/VERSION_STRATEGY]] |
| Menjalankan dan mengembangkan aplikasi | [[apps/gudang-logistik/docs/DEVELOPMENT]] dan `apps/platform/README.md` |
| Mempelajari cara memakai aplikasi | [[apps/gudang-logistik/docs/USER_GUIDE]] |
| Melihat bukti (screenshot) | [[documentation/screenshots/README]] |
| Mengetahui nama dan lokasi semua sumber daya (GitHub, Vercel, Supabase, lokal) | [[documentation/SISTEM_MAP]] |
| Melanjutkan proyek dengan sesi atau akun Claude baru | [[documentation/SERTIJOB]] (prompt siap tempel) dan [[documentation/HANDOFF]] |
| Memeriksa kesiapan dipakai tim | [[documentation/AUDIT_KESIAPAN]] |
| Melihat riwayat perubahan per versi | [[CHANGELOG]] |
| Merilis ke pengguna | [[documentation/RELEASE_CHECKLIST]] |
| Membaca riset | [[research/README]] |
| Memahami data operasional | [[documentation/DATA_SOURCE_CATALOG]], [[documentation/DATA_DICTIONARY]] |

## 3. Peta vault

| Folder | Isi | Dikelola oleh |
|---|---|---|
| `roadmap/` | Roadmap produk dan catatan epic (E-01 sampai E-16) | Tangan (isi), skrip (status) |
| `tasks/` | Satu catatan per tugas, sumber status progress | Tangan |
| `documentation/` | Rencana, progress, keputusan, panduan, template, screenshot, dashboard | Tangan; `PROGRESS_SNAPSHOT` dan `VAULT_HEALTH` oleh skrip |
| `research/` | Riset bertanggal dengan sumber | Tangan |
| `apps/gudang-logistik/` | Sumber UI aktif (HTML/CSS/JS) dan dokumen aplikasi | Tangan |
| `apps/platform/` | Scaffold Vite + Supabase + deploy | Tangan |
| `websites/` | Situs lain dan situs Docs (rencana) | Tangan |
| `data/` | Hanya README; workbook privat `data/private-sources/` diabaikan Git | Lokal |
| `scripts/` | `sync-vault.mjs` (jalankan ini), `progress-report.mjs`, `check-vault.mjs` | Tangan |
| `.claude/`, `CLAUDE.md` | Skill dan agen proyek untuk Claude Code | Tangan |
| `.agents/`, `.codex/` | Skill dan agen Codex (lama) | Tangan |

Aturan kerja ada di `AGENTS.md`; cara memakai vault: [[documentation/WORKSPACE_GUIDE]].

## 4. Ritme kerja

- **Harian:** ubah status tugas yang disentuh, tulis bukti, jalankan `node scripts/sync-vault.mjs`.
- **Mingguan:** tinjau [[PROGRESS_SNAPSHOT]], blocker, dan estimasi; catat di [[documentation/PROJECT_PROGRESS]]; tinjau [[VAULT_HEALTH]].
- **Per rilis:** [[documentation/RELEASE_CHECKLIST]] dan tinjau ulang [[roadmap/PRODUCT_ROADMAP]].
