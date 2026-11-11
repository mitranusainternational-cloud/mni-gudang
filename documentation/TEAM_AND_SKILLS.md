---
type: team-operating-model
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Tim kerja Codex dan skill lokal

Model ini membagi pekerjaan berdasarkan hasil yang dibutuhkan. Definisi agent adalah panduan spesialis lokal; ia tidak menjalankan tim paralel secara otomatis. Koordinator memilih peran yang relevan untuk setiap pekerjaan.

## Tim inti

| Peran | File agent | Keluaran |
|---|---|---|
| Koordinator produk/proyek | Codex utama + halaman ini | Brief, prioritas, acceptance criteria, pembagian tugas, keputusan, progress |
| Analis proses Operasional | `.codex/agents/erp-process-analyst.toml` (agent existing, cakupan diarahkan ke proses MNI) | Peta current-state, kebutuhan, aturan, pengecualian, kontrol, inventaris data, dan bukti; read-only saat discovery |
| Analis kebutuhan website | `.codex/agents/web-product-analyst.toml` | Brief fitur, aktor, journey, aturan bisnis, skenario normal/pengecualian, acceptance criteria |
| Engineer frontend | `.codex/agents/frontend-engineer.toml` | Perubahan UI yang kecil dan sesuai stack aktif, catatan file dan dampak |
| QA E2E Playwright | `.codex/agents/playwright-e2e-runner.toml` | Rencana/skenario E2E, hasil uji yang diminta, artifact dan batas cakupan |
| Peneliti/dokumentator | `.codex/agents/project-documentarian.toml` | Catatan riset dengan sumber, panduan pengguna/pengembang, indeks screenshot, update vault |

## Skill yang tersedia

- [ERP process discovery](../.agents/skills/erp-process-discovery/SKILL.md) — pakai teknik discovery secara read-only untuk proses dan data Operasional MNI; bukan untuk menyalin blueprint vendor.
- [Website product discovery](../.agents/skills/website-product-discovery/SKILL.md) — memahami kebutuhan dan mengubahnya menjadi spesifikasi terukur.
- [Vanilla frontend maintenance](../.agents/skills/vanilla-frontend-maintenance/SKILL.md) — menjaga aplikasi HTML/CSS/JS saat ini dengan perubahan bertahap.
- [Playwright E2E](../.agents/skills/playwright-e2e/SKILL.md) — menulis dan menjalankan skenario melalui browser yang didukung, dengan data uji aman.
- [Project documentation](../.agents/skills/project-documentation/SKILL.md) — dokumentasi source/evidence dan navigasi vault Obsidian.

## Alur satu pekerjaan

1. **Pahami:** koordinator menulis tujuan, pengguna, proses, ruang lingkup, serta apa yang tidak boleh berubah.
2. **Spesifikasikan:** gunakan analis kebutuhan/proses Operasional bila alur atau data belum jelas. Gali proses MNI terlebih dahulu dan catat fakta, asumsi, opsi, serta keputusan terpisah.
3. **Implementasikan:** engineer mengerjakan setelah acceptance criteria dapat diperiksa.
4. **Verifikasi:** QA membuat/menjalankan pemeriksaan yang diminta setelah code tersedia dan environment aman/terakses. Catat cakupan dan hasil aktual.
5. **Dokumentasikan:** dokumentator memperbarui halaman aplikasi dan progress, lalu menghubungkan screenshot tanpa data sensitif.
6. **Tinjau:** koordinator memeriksa diff, kriteria, hambatan, dan gate rilis. Keputusan proses/fitur dan rilis tetap pada pemiliknya.

## Pembagian cepat

- Boleh paralel: riset sumber read-only, analisis proses independen, audit dokumentasi, atau penyusunan skenario uji.
- Hindari paralel: perubahan bersamaan pada file/fungsi yang sama, perubahan schema/data sambil UI belum disepakati, atau QA pada environment yang belum diketahui.
- Gunakan satu brief kerja dan satu acceptance checklist sebagai titik temu seluruh peran.
- Untuk perubahan rutin, gunakan branch `development`; jangan stage `.obsidian/` dan jangan promosi ke `main` tanpa gate pada [[RELEASE_CHECKLIST|checklist rilis]].

## Batas dan status saat ini

- Stack source saat ini: HTML/CSS/JavaScript. Jangan migrasi framework sampai keputusan arsitektur dibuat.
- Kebutuhan tim Operasional MNI menjadi sumber requirement; tidak ada ERP vendor yang menjadi blueprint fitur atau model data.
- Persistence/backend dan E2E browser belum diverifikasi; jangan menyatakan transaksi tersimpan atau alur browser berhasil tanpa bukti.
- Skill QA tidak mengizinkan akses melalui cookies, token, browser profile, CDP, atau API tersembunyi.
- Agent ERP tetap read-only. Penggunaan Composio Sheets menunggu koneksi aktif dan ruang lingkup yang ditentukan.
- Untuk referensi dan alasan pemilihan peran, lihat [[research/2026-11-02-agent-team-and-skills-best-practice|riset tim dan skill]].

## Agen dan skill Claude Code (2026-11-02)

Dibuat untuk alur kerja yang sudah terbukti di proyek ini; berada di `.claude/` (skill Codex lama di `.agents/` dan `.codex/` tetap ada). Pemetaan tahap ke agen/skill ada di [[INTEGRATION_PATH]] bagian 6.

| Skill (`.claude/skills/`) | Dipakai untuk |
|---|---|
| `vault-progress` | Memperbarui tugas, epic, snapshot, dan progress di Obsidian setiap langkah selesai |
| `e2e-regression` | Regresi UI penuh pratinjau mock; wajib setelah mengubah adapter/UI |
| `supabase-dev-ops` | Migration, uji RLS/rollback, log, advisor, dan konfigurasi Auth Supabase dev |
| `adapter-contract` | Aturan kontrak `window.claude`, pemetaan Postgres (UUID, JSONB `data`), sumber UI |
| `rls-roles` | Model role (role_modules, can_mod, ROLES), aturan ALTER tanpa DROP, cara uji hak per role |
| `release-pipeline` | Tahap dan gerbang S0 sampai S6, CI, Vercel, PR ke `main` |
| `vps-readiness` | Penilaian dan keputusan VPS sebelum menyentuh server |
| `discovery-session` | Menyiapkan, menjalankan, dan mencatat sesi dengan tim Operasional |
| `excel-model-extraction` | Membaca model hitung di workbook Excel dengan aman (salinan, hanya baca) dan menyiapkan fixture uji |
| `erp-module-boundary` | Modul ERP terpisah: batas, tabel draf, hak modul, tangga penayangan E0 sampai E5 |
| `erp-flow-hulu-hilir` | Kontrak alur penawaran ke SPK, material, produksi, vendor, kirim, dan estimasi lawan aktual |

| Agen (`.claude/agents/`) | Peran | Skill utama |
|---|---|---|
| `progress-keeper` | Menjaga catatan Obsidian benar dan terkini | `vault-progress` |
| `qa-regression` | Menjalankan dan menganalisis regresi | `e2e-regression` |
| `supabase-engineer` | Database dan Auth Supabase dev | `supabase-dev-ops` |
| `app-engineer` | Perubahan UI dan adapter yang kecil dan teruji | `adapter-contract` |
| `release-manager` | CI, preview, PR, rilis, dan rollback | `release-pipeline` |
| `ops-analyst` | Discovery, katalog data, pemetaan workbook (read-only terhadap sumber) | `discovery-session` |
| `erp-architect` | Rancangan modul ERP hulu ke hilir, batas, tahap, risiko, tugas | `erp-module-boundary` |
| `ops-monitor-analyst` | Definisi dan keakuratan monitoring operasional, estimasi lawan aktual (read-only) | `erp-flow-hulu-hilir` |

Aturan bersama: bukti sebelum klaim, mock bukan bukti Supabase, tanpa secret atau data nyata, tindakan akun hanya setelah persetujuan pemilik. Tugas: [[tasks/T-075-bangun-agen-dan-skill-proyek-di-claude|T-075]].

## Matriks agen dan skill Claude (2026-11-06)

| Modul atau tugas | Skill | Agen |
|---|---|---|
| Status, tugas, roadmap, Obsidian | `vault-progress` | `progress-keeper` |
| Mengubah UI atau adapter | `adapter-contract`, `gudang-stok-flow` (gudang dan SPK stok) | `app-engineer` |
| Regresi penuh dan suite | `e2e-regression` | `qa-regression` |
| Skema, migration, RLS, peran dan modul | `supabase-dev-ops`, `rls-roles` | `supabase-engineer` |
| Rilis bertahap ke production | `release-pipeline` | `release-manager` |
| Discovery proses | `discovery-session` | `ops-analyst` |
| Monitoring estimasi lawan aktual | `erp-flow-hulu-hilir` | `ops-monitor-analyst` |
| Persiapan VPS | `vps-readiness` | `release-manager` |

Peta modul yang dipakai agen sebagai konteks: [[PETA_MODUL]]. Aturan gudang: [[PRD_GUDANG]]. Setiap perubahan modul diakhiri skill `vault-progress` dan regresi penuh.
