---
type: release-strategy
status: active
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Strategi versi dan branch

## Tujuan

Memisahkan pengembangan aplikasi, layanan yang dipakai pengguna, dan dokumentasi website. Struktur ini memudahkan pemeliharaan dan membuat perubahan dapat ditinjau sebelum menjadi rilis stabil.

> [!note] Pembaruan 2026-11-06
> Sejak PR 14 kerja fitur dilakukan di cabang `fitur/<nama>` yang dibuat dari `main` dan digabung lewat PR (1 approval dan 2 CI; pemilik admin boleh `--admin`). `development` dan `docs` tertinggal dan tidak dipakai harian. Cabang aktif: `fitur/produksi-multi-wc`. Cakupan cabang panjang harus diukur sebelum rilis ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]]).

## Peta versi

| Nama | Branch | Fungsi | Aturan |
|---|---|---|---|
| Versi Awal | `versi-awal` | Snapshot kondisi sistem yang menjadi acuan | Bekukan sebagai baseline. Perubahan harian tidak dilakukan di sini. |
| Development | `development` | Pengembangan dan pengujian lokal | Branch kerja aktif. Perubahan harus dapat ditinjau dan dicatat. |
| Main | `main` | Versi stabil yang ditujukan kepada pengguna | Hanya menerima perubahan yang telah melewati checklist rilis dan disetujui pemilik proyek. |
| Docs | `docs` | Dokumentasi pengembangan dan materi untuk website dokumentasi | Perubahan dokumentasi dikerjakan terpisah; konten operasional rahasia tidak dipublikasikan. |

## Alur perubahan

```text
versi-awal (acuan tetap)
       └── development (implementasi dan verifikasi)
                  ├── main (rilis stabil setelah tinjauan)
                  └── docs (dokumentasi yang disiapkan untuk publikasi)
```

Branch dibuat dari snapshot `versi-awal` sebagai titik awal. Setelah inisialisasi, `development`, `main`, dan `docs` berkembang sesuai fungsinya. Jangan menganggap branch tersebut sebagai instalasi server terpisah: isolasi database, URL, kredensial, dan deployment tiap environment masih perlu dirancang dan diverifikasi sebelum digunakan untuk data nyata.

## Konvensi kerja

- Kerjakan fitur aplikasi dari `development`.
- Pisahkan file sumber dan data lokal sensitif; gunakan `.env.example` untuk nama konfigurasi dengan nilai dummy.
- Catat perubahan fitur, risiko, bukti verifikasi, dan keputusan rilis di [[PROJECT_PROGRESS|progress proyek]].
- Promosi ke `main` harus menyertakan ringkasan perubahan, pemeriksaan yang dilakukan, risiko yang diketahui, serta persetujuan rilis.
- `docs` menjadi sumber dokumentasi; publikasi sebagai website adalah langkah terpisah yang memerlukan hosting dan alur publikasi.
- Jangan menulis ulang atau memindahkan `versi-awal` saat mengerjakan versi lain.

## Batas lingkungan saat ini

Keberadaan empat branch Git hanya memisahkan riwayat source code. Hal itu belum membuktikan deployment, database, akun, atau URL terpisah. Koneksi aktif aplikasi Gudang & Logistik ke `window.claude`/database masih perlu disediakan dan diuji sebelum disebut environment operasional.
