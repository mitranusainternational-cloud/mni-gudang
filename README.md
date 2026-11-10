<img src="documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# MNI Gudang & Logistik (repo `mni-gudang`)

Repository ini sekaligus menjadi Obsidian vault untuk mengembangkan aplikasi MNI Gudang & Logistik dan menelusuri progress proyek. Aplikasi berjalan di https://mni-gudang.vercel.app (Vercel) dengan database Supabase; **peta semua sumber daya, nama baku, dan cara memantau ada di [`documentation/SISTEM_MAP.md`](documentation/SISTEM_MAP.md)**; riwayat perubahan di [`CHANGELOG.md`](CHANGELOG.md); kebijakan keamanan di [`SECURITY.md`](SECURITY.md). Dashboard proyek ada di [`Home.md`](Home.md); cara mengelola vault ada di [`documentation/WORKSPACE_GUIDE.md`](documentation/WORKSPACE_GUIDE.md).

## Versi dan branch

| Versi | Branch | Kegunaan |
|---|---|---|
| Versi Awal | `versi-awal` | Snapshot referensi kondisi awal. |
| Fitur | `fitur/<nama>` | Kerja fitur, dibuat dari `main`, digabung lewat PR (aktif: `fitur/produksi-multi-wc`). |
| Development | `development` | Tertinggal; tidak dipakai harian. |
| Main | `main` | Versi stabil untuk pengguna setelah tinjauan rilis. |
| Docs | `docs` | Dokumentasi pengembangan dan materi website dokumentasi. |

Peta modul dari hulu ke hilir: [`documentation/PETA_MODUL.md`](documentation/PETA_MODUL.md). Rincian alur dan batas tiap environment ada di [`documentation/VERSION_STRATEGY.md`](documentation/VERSION_STRATEGY.md). Peta tugas ada di [`documentation/PROJECT_PROGRESS.md`](documentation/PROJECT_PROGRESS.md). Branch saja belum memisahkan deployment atau database.

## Peta workspace

```text
.
├── Home.md                         # Halaman awal vault Obsidian
├── AGENTS.md                       # Cara Codex bekerja di workspace ini
├── tasks/                          # Satu catatan per tugas (sumber status progress)
├── documentation/                  # Progress, roadmap, panduan, screenshot, template
├── websites/                       # Website lain dan situs dokumentasi
├── research/                       # Riset bertanggal dan penerapan ke data MNI
├── data/                           # README saja; workbook privat di data/private-sources/ (diabaikan Git)
├── CLAUDE.md                       # Panduan untuk Claude Code
├── .claude/                        # Skill dan agen proyek (Claude Code)
├── .agents/skills/                 # Skill lokal (Codex)
├── scripts/                        # progress-report.mjs (snapshot progress)
├── .codex/agents/                  # Definisi agen (Codex)
└── apps/
    ├── gudang-logistik/            # Prototipe HTML/CSS/JS + reference + docs
    └── platform/                   # Platform: Vite + adapter Supabase + migration + tes E2E + Vercel/VPS
```

## Mulai bekerja

1. Buka `Home.md` atau buka folder ini sebagai vault Obsidian.
2. Baca `AGENTS.md` untuk aturan kerja dan pencatatan sumber.
3. Pilih folder sesuai hasil kerja: `documentation/`, `websites/`, `research/`, atau `apps/`.
4. Catat hasil di [`documentation/PROJECT_PROGRESS.md`](documentation/PROJECT_PROGRESS.md) dan urutan pekerjaan di [`documentation/ROADMAP.md`](documentation/ROADMAP.md).
5. Gunakan wikilink yang path-nya dimulai dari root vault dan jangan menjadikan plugin sebagai satu-satunya penyimpanan status.

## Aplikasi Gudang & Logistik

Mulai dari [`apps/gudang-logistik/README.md`](apps/gudang-logistik/README.md), [`USER_GUIDE.md`](apps/gudang-logistik/docs/USER_GUIDE.md), dan [`DEVELOPMENT.md`](apps/gudang-logistik/docs/DEVELOPMENT.md). Jalankan preview mengikuti panduan development dan gunakan `/apps/gudang-logistik/`. Aplikasi memerlukan `window.claude` untuk database/runtime; server statis hanya membantu meninjau UI. Screenshot dan batas akses dicatat di [`documentation/screenshots/README.md`](documentation/screenshots/README.md).

## GitHub

Remote: [mitranusainternational-cloud/mni-gudang](https://github.com/mitranusainternational-cloud/mni-gudang). Migrasi ke GitHub mengikuti [`documentation/GITHUB_MIGRATION.md`](documentation/GITHUB_MIGRATION.md). Branch: `versi-awal` (baseline beku), `development` (kerja), `main` (rilis), `docs` (dokumentasi). Lihat `documentation/VERSION_STRATEGY.md` dan `documentation/ENVIRONMENTS.md`.

Jangan menyimpan kredensial, data operasional personal, atau ekspor transaksi ke repository. Detail historis dan sumber riset harus diberi tanggal serta tautan sumber.
