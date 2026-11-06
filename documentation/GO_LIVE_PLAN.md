---
type: plan
status: proposed
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Rencana go-live MNI Gudang & Logistik

Rencana ini menjawab: apa yang harus terjadi agar sistem dipakai tim Operasional dengan baik. Setiap langkah adalah catatan di `tasks/` (ID `T-xxx`); status hidup ada di [[PROGRESS_SNAPSHOT]] dan [[PROGRESS_DASHBOARD]]. Rencana ini usulan sampai pemilik proyek menyetujuinya.

> [!info] Jalur tahap
> Urutan tahap dan gerbang (S0 sampai S6) ada di [[INTEGRATION_PATH]]; plan ini merinci tugas menuju go-live (S0 sampai S5).

> [!note] Keadaan 2026-11-06
> Production sudah tayang dan dipakai pemilik dengan data nyata sebagian; go-live resmi (hypercare lima hari) menunggu jalur proses dan data (T-030 sampai T-036, UAT). Jalur kritis tetap 26,5 hari kerja. Audit lengkap: [[AUDIT_PROGRESS_2026-11-06]]; peta modul: [[PETA_MODUL]].

## 1. Definisi "siap dipakai"

Go-live (T-065) hanya boleh terjadi bila semua ini benar dan ada buktinya:

1. Satu alur pilot, dipilih dan disetujui process owner, berjalan penuh di production (T-031, T-053).
2. Data awal berasal dari sumber resmi yang dikonfirmasi owner, dan saldo sudah direkonsiliasi (T-032, T-035, T-063).
3. Login OTP hanya untuk user terdaftar; hak akses per role terbukti lewat uji negatif RLS (T-020, T-022, T-047).
4. Development dan production memakai Supabase, secret, dan URL yang terpisah (T-042 sampai T-045).
5. Backup bisa dipulihkan dan rollback tertulis dan pernah dicoba (T-061).
6. Checklist rilis terisi dengan bukti dan pemilik proyek menyetujui (T-064, lihat [[RELEASE_CHECKLIST]]).

## 2. Keputusan arsitektur yang diusulkan

| Topik | Usulan | Alasan | Risiko |
|---|---|---|---|
| Basis aplikasi | Pakai `apps/platform` (Vite + Supabase) sebagai jalur menuju produksi; `apps/gudang-logistik` tetap prototipe dan reference | mni-app sudah punya 20 tabel, RLS per role, Auth OTP, adapter, dan alur deploy | Schema berasal dari kode prototipe, bukan dari discovery. Tetap perlu validasi pilot (T-030, T-031) sebelum data nyata |
| Hosting | Vercel (preview dari `development`, production dari `main`) | Sudah ada `vercel.json` dan workflow | Alternatif VPS Docker tersedia di mni-app bila Vercel tidak cocok |
| Database | Dua project Supabase terpisah (dev dan prod) | Branch Git tidak memisahkan data | Biaya dan manajemen secret |
| Rilis | PR `development` → `main`, review wajib | Mencegah perubahan langsung ke versi pengguna | Perlu disiplin proses |
| Docs | Branch `docs`, situs statis dari vault, hanya materi non-sensitif | Dokumentasi terpisah dari aplikasi | Perlu klasifikasi internal/publik (T-070) |

Keputusan yang masih terbuka dan perlu dicatat di [[documentation/DECISIONS]]: repo GitHub target (T-040), sumber kebenaran extract UI (T-014), pilot pertama (T-031).

## 3. Tiga jalur kerja paralel

Jalur teknis tidak perlu menunggu jalur proses, kecuali di titik temu yang ditandai.

```text
Jalur A Teknis      T-010 → T-011 → T-012 → T-020 → T-021 → T-022/T-023/T-024
Jalur B Proses/Data T-030 → T-031 ─┐   T-032 → T-033 → T-034 → T-035
Jalur C Cloud       T-040 → T-041 → T-042 → T-044 → T-045 → T-046/T-047
Titik temu          T-050 (data UAT) → T-051 UAT → T-052 → T-053 → T-064 → T-065 go-live
```

Jalur kritis sisa menurut skrip snapshot: T-030 → T-033 → T-034 → T-035 → T-050 → T-051 → T-052 → T-053 → T-063 → T-065, sekitar 26,5 hari kerja. Karena itu **jalur proses/data (B) menentukan kecepatan**, bukan kode. Mulai T-030 dan T-032 sekarang; agenda sesi siap di [[DISCOVERY_AGENDA]].

## 4. Fase, hasil, dan kriteria keluar

### P0 Workspace dan tracking (selesai)
Struktur vault, 4 branch, repo lokal `mni-os`, scaffold `mni-app` build lolos, bootstrap diperbaiki, sistem tracking tugas. Bukti di [[PROJECT_PROGRESS]].

### P1 Fondasi lokal (T-010 sampai T-014, sekitar 3 hari)
Docker aktif, Supabase lokal hidup dengan 2 migration, mni-app tersambung ke database lokal, seed sintetis per role, dan keputusan sumber UI.
**Keluar bila:** `npm run db:start` sukses, 20 tabel ada, app memuat tanpa error jaringan, login dengan user seed bisa dicoba.
**Hambatan diketahui:** Docker engine tidak start karena virtualisasi CPU nonaktif di BIOS; perlu tindakan pemilik mesin, langkah di [[DOCKER_SETUP]] (T-010). Sementara itu [[LOCAL_PREVIEW|pratinjau mock]] dipakai untuk meninjau UI. Tanpa Docker, alternatif adalah langsung memakai project Supabase dev di cloud (T-042 dimajukan), dengan risiko data dev di cloud.

### P2 Aplikasi siap uji (T-020 sampai T-025, sekitar 12 hari)
Login OTP end-to-end, CRUD dan realtime untuk 20 koleksi, matriks RLS per role, smoke test Playwright, perbaikan bug, screenshot dan panduan pengguna.
**Keluar bila:** tidak ada bug P0/P1 terbuka, uji negatif RLS lulus untuk 5 role, smoke test hijau dengan satu perintah.
**Catatan:** T-021 paling berisiko menambah waktu; adapter meniru API Firestore di atas Postgres, jadi optimistic lock dan realtime perlu diuji teliti.

### P3 Data dan proses (T-030 sampai T-036, sekitar 13,5 hari)
Wawancara process owner, pilih pilot dan kriteria terima, konfirmasi owner dan cut-off enam workbook, pemetaan kolom, skrip impor dry-run, rekonsiliasi saldo, daftar user awal.
**Keluar bila:** pilot dan kriteria terima disetujui tertulis; selisih saldo dijelaskan (termasuk 11 key RM yang berbeda antar workbook); daftar user dan role disetujui.
**Ketergantungan manusia:** semua tugas di sini membutuhkan waktu tim Operasional. Jadwalkan sesi di minggu pertama.
**Aturan data:** workbook mentah tetap di `data/private-sources/` (diabaikan Git); skrip impor hanya menyentuh Supabase dev sampai UAT disetujui.

### P4 Environment cloud (T-040 sampai T-047, sekitar 5,5 hari)
Repo GitHub target dan push 4 branch, proteksi `main`, Supabase dev dan prod, Vercel, secrets, CI, konfigurasi Auth produksi.
**Keluar bila:** preview dari `development` mengarah ke Supabase dev, production ke Supabase prod, tidak ada service-role key di client, PR ke `main` menjalankan build dan smoke test.
**Blocker saat ini:** akun `nurilhamjn` hanya punya akses baca ke repo organisasi (T-040).

### P5 UAT pilot (T-050 sampai T-053, sekitar 9,5 hari)
Data UAT dan akun penguji, jalankan skenario pilot bersama process owner, perbaiki issue, sign-off.
**Keluar bila:** semua skenario kriteria terima lulus atau risikonya diterima tertulis oleh process owner.

### P6 Hardening dan rilis (T-060 sampai T-066, sekitar 9,5 hari)
Review advisor Supabase, drill backup dan restore, header keamanan, impor data awal ke production dan rekonsiliasi, checklist rilis, merge ke `main`, go-live dengan hypercare 5 hari, domain kustom.
**Keluar bila:** kriteria di bagian 1 terpenuhi dan lima hari hypercare berjalan tanpa isu kritis.

### P7 Operasi dan dokumentasi (T-070 sampai T-074, sekitar 5,5 hari)
Situs Docs dari branch `docs`, SOP dan pelatihan, monitoring dan dukungan, retrospektif dan roadmap v1.1.

## 5. Estimasi waktu

- Total effort tercatat: 62 hari kerja; jalur kritis ke go-live: sekitar 26,5 hari kerja.
- Satu pengembang dengan akses tim yang lancar: kira-kira 6 sampai 8 minggu kalender. Angka ini indikatif; sumber ketidakpastian terbesar adalah ketersediaan process owner (T-030, T-032, T-051) dan hasil rekonsiliasi data (T-035).
- Estimasi diperbarui setiap minggu dari snapshot, bukan dijanjikan sebagai tanggal.

## 6. Risiko utama

| Risiko | Dampak | Mitigasi | Tugas |
|---|---|---|---|
| Process owner sulit dijadwalkan | Jalur kritis mundur | Jadwalkan sesi minggu 1; mulai dengan satu alur pilot kecil | T-030, T-031 |
| Saldo workbook tidak konsisten antar file | Data awal salah | Rekonsiliasi tertulis, owner menetapkan sumber resmi | T-032, T-035 |
| Schema prototipe tidak cocok dengan proses nyata | Pengerjaan ulang | Validasi pilot sebelum impor; migration bertahap | T-031, T-033 |
| Docker tidak bisa dijalankan di mesin ini | P1 tertunda | Pakai Supabase dev cloud sebagai cadangan | T-010, T-042 |
| Data dev dan prod tercampur | Insiden data | Project, secret, dan URL terpisah; tidak ada impor ke prod sebelum sign-off | T-042 sampai T-045 |
| Kebocoran secret atau data pribadi | Insiden keamanan | `.gitignore`, pemeriksaan `git ls-files`, secret hanya di Vercel/Actions | T-045 |
| Bug adapter realtime atau lock | Data tidak konsisten | Uji CRUD, realtime, dan konflik di T-021 | T-021 |

## 7. Ritme kerja

- **Harian:** ubah status tugas yang disentuh dan tulis bukti.
- **Mingguan:** jalankan `node scripts/progress-report.mjs`, tinjau "Siap dikerjakan", blocker, dan estimasi; catat di [[PROJECT_PROGRESS]].
- **Per rilis:** [[RELEASE_CHECKLIST]] dan persetujuan pemilik proyek.
- **Pembagian peran agent/skill:** lihat [[TEAM_AND_SKILLS]].

## 8. Yang tidak diklaim

Per 2026-11-02 belum ada: koneksi Supabase nyata, login OTP teruji, data operasional dalam sistem, deployment, atau UAT. Verifikasi yang ada hanyalah build dan tampilan login di browser dengan environment dummy.
