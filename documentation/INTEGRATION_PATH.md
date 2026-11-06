---
type: integration-plan
status: proposed
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Jalur integrasi bertahap: lokal → Supabase → GitHub → Vercel → (VPS)

Tujuan: sistem bisa dipakai secepat mungkin dengan integrasi data yang kuat dan setiap tahap punya gerbang yang dapat dibuktikan. Urutan yang Anda usulkan (lokal, Supabase, GitHub, Vercel, lalu VPS) dipakai, dengan dua penyesuaian di bagian 3. Status hidup ada di [[PROGRESS_SNAPSHOT]]; rencana go-live di [[GO_LIVE_PLAN]]; arah produk di [[roadmap/PRODUCT_ROADMAP]]; skill pendamping: `release-pipeline`.

## 1. Peta tahap dan status (diperbarui 2026-11-06)

| Tahap | Isi | Status | Gerbang untuk lanjut |
|---|---|---|---|
| **S0 Lokal** | Pratinjau mock + regresi; Supabase lokal (Docker) bila tersedia | Mock berjalan: regresi 42, role 12, akses 34, produksi 134, sparepart 35, fitur 13, tampilan 72 dan unit 266 (0 FAIL, 2026-11-06). Docker menunggu BIOS (T-010) | Regresi 0 FAIL (tercapai) |
| **S1 Supabase dev** | Project dev, migration, login nyata, uji adapter dan RLS | Dev lama dipensiunkan; pengujian kini lewat production secara baca-saja dan transaksi rollback | selesai dengan bukti ([[T-079-uji-role-lewat-aplikasi-dengan-akun-uji-per-role|T-079]], [[T-172-riwayat-perubahan-database-dan-rapikan-tata-letak|T-172]]) |
| **S2 GitHub** | Repo, `main` terproteksi, CI build + regresi pada PR | Selesai: PR 7 sampai 15 digabung, CI dua pemeriksaan wajib | CI hijau wajib untuk merge ke `main` (tercapai) |
| **S3 Vercel preview** | cabang fitur → Preview | Belum untuk cabang fitur (T-044) | Smoke test di URL preview |
| **S4 UAT** | Data terimpor dan terekonsiliasi; process owner menguji | Belum (T-050 sampai T-053); data awal bahan baku dan barang jadi sudah dimuat | Sign-off tertulis |
| **S5 Production** | Supabase prod terpisah + Vercel production dari `main` | **Sudah tayang** (mni-gudang.vercel.app, migration 1 sampai 13, `main` ad73c89); rilis berikut dijeda ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]]) | [[RELEASE_CHECKLIST]] + persetujuan pemilik |
| **S6 VPS** | Opsional: self-host atau layanan pendamping | Belum; penilaian T-160 | Kriteria bagian 4 |

> [!note] Pembaruan 2026-11-06
> Alur sebenarnya berbeda dari urutan awal: production dipakai lebih cepat (S5 sebelum UAT) karena pemilik memakai data nyata sebagian; kerja fitur di cabang `fitur/<nama>` dan masuk ke `main` lewat PR. Peta modul dan status per lingkungan: [[PETA_MODUL]]. Audit: [[AUDIT_PROGRESS_2026-11-06]].

## 2. Aliran data (integrasi data yang kuat)

```text
Workbook sumber (privat, data/private-sources, diabaikan Git)
   │  T-032 owner & cut-off   T-033 pemetaan kolom
   ▼
Skrip impor terkontrol (dry-run → validasi → laporan galat)   T-034
   ▼
Supabase DEV  ──UAT, rekonsiliasi saldo (T-035, T-050..T-053)──►  sign-off
   ▼  (tidak ada data nyata ke prod sebelum sign-off)
Supabase PROD  ◄── impor awal dengan skrip yang sama (T-063)
   ▼
Aplikasi (Vercel) ── operasi harian ──► jejak audit (E-09) ── impor terjadwal (E-11, hipotesis)
```

Prinsip: satu skrip impor yang sama untuk dev dan prod, selalu dry-run dulu, laporan galat disimpan, sumber resmi dan cut-off ditetapkan pemilik data (D-02), dan tidak ada penulisan manual ke prod di luar aplikasi dan migration.

## 3. Penyesuaian dari urutan awal dan alasannya

1. **CI sebelum Vercel.** GitHub bukan sekadar tempat kode: pasang CI (build + regresi) dan jadikan syarat merge sebelum Vercel menayangkan apa pun. Dengan begitu preview dan production hanya berasal dari kode yang lulus uji.
2. **VPS bukan langkah otomatis setelah Vercel.** Untuk 5 sampai 20 pengguna awal, Supabase cloud + Vercel lebih cepat dan lebih murah dirawat. VPS dipertimbangkan setelah stabil dan hanya bila ada alasan terukur (bagian 4). Docker-compose self-host yang ada di `apps/platform` belum lengkap (tanpa backup, monitoring, SMTP, Studio) sehingga akan menambah beban perawatan bila dimajukan.
3. **Supabase prod terpisah sejak awal** dan migration lewat berkas di repo, bukan perubahan manual, agar dev dan prod dapat direproduksi.

## 4. Kapan VPS (S6) dipakai

Pilih VPS bila minimal satu terpenuhi: (a) biaya cloud melewati anggaran, (b) data harus berada di server sendiri, (c) perlu layanan pendamping (backup ke penyimpanan sendiri, monitoring, otomasi impor, situs Docs), dan ada orang yang merawat server. Mulai dengan **layanan pendamping** (backup, monitoring, cron) sebelum memindahkan database. Penilaian dan keputusan: skill `vps-readiness`, tugas [[tasks/T-160-penilaian-kesiapan-vps-dan-keputusan|T-160]] dan T-161.

## 5. Matriks environment

| Elemen | Lokal | Dev (cloud) | Production |
|---|---|---|---|
| Aplikasi | Vite `127.0.0.1:5173` (mock) / `5174` (Supabase dev) | Vercel preview dari `development` | Vercel production dari `main` |
| Database | Mock `localStorage` atau Supabase lokal | Supabase `MNI Gudang - Dev` | Supabase prod (terpisah, belum ada) |
| Auth | Kode lokal (mock) | OTP email + password cadangan | OTP email dengan SMTP sendiri |
| Secret | `.env.local` (diabaikan Git) | Vercel/GitHub environment `development` | Vercel/GitHub environment `production` |
| Data | Sintetis | Sintetis lalu impor terkontrol | Impor awal setelah sign-off |
| Branch | `development` | `development` | `main` (PR + approval) |

## 6. Peran agen dan skill pada tiap tahap

| Tahap | Agen | Skill |
|---|---|---|
| S0 | `app-engineer`, `qa-regression` | `adapter-contract`, `e2e-regression` |
| S1 | `supabase-engineer` | `supabase-dev-ops` |
| S2, S3, S5 | `release-manager` | `release-pipeline` |
| Discovery dan data | `ops-analyst` | `discovery-session` |
| S6 | `release-manager` | `vps-readiness` |
| Semua | `progress-keeper` | `vault-progress` |

Katalog lengkap: [[TEAM_AND_SKILLS]].

## 7. Ritme dan kontrol

- Setiap langkah selesai: perbarui tugas, jalankan `node scripts/sync-vault.mjs`, commit (skill `vault-progress`).
- Setiap perubahan adapter atau UI: regresi penuh 0 FAIL sebelum commit.
- Setiap akhir tahap: perbarui matriks di atas dan [[ENVIRONMENTS]], lalu tinjau gerbang tahap berikutnya.
- Tindakan akun (membuat project, menghubungkan Vercel ke organisasi, DNS, merge `main`) dilakukan pemilik atau setelah persetujuan eksplisit.


> Pembaruan 2026-11-03: S2 CI GitHub berjalan (`.github/workflows/ci.yml`, run hijau 41558796125); sisa: required status check pada `main` (persetujuan pemilik).
