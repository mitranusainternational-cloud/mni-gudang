# MNI Gudang & Logistik — panduan untuk Claude Code

Vault Obsidian sekaligus repository aplikasi MNI Gudang & Logistik. **Mulai dari [documentation/INDEKS_CEPAT.md](documentation/INDEKS_CEPAT.md)** (baca, jalankan, catat, batas; ringkas untuk menghemat token). Aturan kerja lengkap ada di [AGENTS.md](AGENTS.md); dashboard di [Home.md](Home.md).

## Rangkuman cepat

- **Aplikasi:** UI aktif `apps/gudang-logistik/`; scaffold produksi `apps/platform/` (Vite + Supabase). Pratinjau mock: `apps/platform` dengan `VITE_LOCAL_MOCK=1`. Supabase dev: `npx.cmd vite --mode supabase-dev --port 5174` (PowerShell memblokir `npx.ps1`).
- **Koneksi:** nama baku `mni-gudang` (repo GitHub, project Vercel). Supabase production = project **MNI Gudang - Production** (`lggqigmvtefkquqjrjsb`, akun mitranusainternational) lewat konektor Supabase kedua (id `72053749-…`); dev lama `inldyqigewmziwazalun` (konektor `plugin_supabase`) dipensiunkan setelah production terbukti. Vercel hanya tim `mitranusainternational-8337` lewat Chrome (konektor Vercel Claude = tim lain, jangan dipakai). Peta lengkap: [documentation/SISTEM_MAP.md](documentation/SISTEM_MAP.md).
- **Peta modul dan aturan:** [documentation/PETA_MODUL.md](documentation/PETA_MODUL.md) (hulu ke hilir, status per lingkungan), [documentation/PRD_GUDANG.md](documentation/PRD_GUDANG.md), [documentation/PRD_PRODUKSI.md](documentation/PRD_PRODUKSI.md), [documentation/HANDOFF.md](documentation/HANDOFF.md).
- **Status:** `tasks/` (satu catatan per tugas) adalah sumber kebenaran; `node scripts/sync-vault.mjs` menyegarkan snapshot dan memeriksa vault dan harus berakhir `OK` sebelum commit.
- **Jalur rilis:** lokal → Supabase dev → GitHub CI → Vercel preview → UAT → production → VPS opsional ([documentation/INTEGRATION_PATH.md](documentation/INTEGRATION_PATH.md)).
- **Branch:** kerja fitur di `fitur/<nama>` yang dibuat dari `main` (sejak PR 14); `main` hanya lewat PR (1 approval, 2 CI; pemilik admin boleh `--admin`); `versi-awal` beku; `development` dan `docs` tertinggal. Cabang aktif 2026-11-06: `fitur/produksi-multi-wc` (lokal, rilis dijeda). Push dari mesin ini: `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin development docs`.

## Skill proyek (`.claude/skills/`)

`vault-progress`, `e2e-regression`, `supabase-dev-ops`, `adapter-contract`, `rls-roles`, `release-pipeline`, `vps-readiness`, `discovery-session`, **`gudang-stok-flow`** (aturan stok, mutasi, dokumen, SPK stok), dan keluarga ERP: `erp-flow-hulu-hilir`, `erp-module-boundary`, `erp-quotation-engine`, `excel-model-extraction`.

## Agen proyek (`.claude/agents/`)

`progress-keeper`, `qa-regression`, `supabase-engineer`, `app-engineer`, `release-manager`, `ops-analyst`, dan ERP: `erp-architect`, `erp-integrator`, `pricing-engineer`, `ops-monitor-analyst`. Peta peran per tahap: [documentation/TEAM_AND_SKILLS.md](documentation/TEAM_AND_SKILLS.md).

## Aturan penting

- Jangan menyimpan atau mencetak kunci service-role, password, token, atau data operasional nyata. Workbook privat tetap di `data/private-sources/` (diabaikan Git).
- Bedakan bukti: `source-level`, `verified in browser`, `verified in database`. Mock bukan bukti Supabase.
- Setiap perubahan adapter atau UI diikuti regresi penuh (0 FAIL).
- Tindakan akun (membuat project cloud, menghubungkan Vercel, DNS, merge ke `main`, menerapkan migration ke production) hanya setelah persetujuan eksplisit pemilik, dan hanya untuk cakupan yang disebut. Rilis bertahap: database dahulu (hanya menambah), lalu kode, verifikasi tiap tahap, rollback siap.
- Setelah mengubah `apps/gudang-logistik`, jalankan `node scripts/extract-app.js` (di `apps/platform`) dan regresi penuh; tambahkan uji ke `tests/e2e/sparepart.mjs` atau suite terkait.
- Skill dan agen Codex lama tetap ada di `.agents/` dan `.codex/`; pekerjaan baru memakai `.claude/`.
