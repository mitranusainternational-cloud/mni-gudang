---
type: audit
status: active
updated: 2026-11-07
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Audit silang ketiga (2026-11-07)

Lanjutan [[AUDIT_PROGRESS_2026-11-06]] dan [[FEATURE_AUDIT]]. Dikerjakan setelah pekerjaan dilanjutkan dengan akun Claude lain. Permintaan pemilik: audit fitur yang ada, temukan bug dari hulu ke hilir, pastikan tidak ada tugas ganda, pastikan status sesuai roadmap dan tidak ada yang bercentang selesai padahal belum optimal. Tugas: [[T-212-uji-menyeluruh-semua-modul-dan-perbaikan-bug]].

## 1. Yang diverifikasi ulang (bukan dipercaya)

| Klaim sebelumnya | Hasil pembacaan ulang |
|---|---|
| Regresi 42, role 12, akses 34, produksi 134, sparepart 36, fitur 18, keamanan 8, aksesibilitas 3, menyeluruh 24, tampilan 72 (0 FAIL) | **Cocok**, dijalankan penuh 2026-11-07 |
| Lint 0 galat | Cocok, tetapi hasil sementara 44 peringatan melewati batas CI (43); dikembalikan ke 42 |
| Penawaran, Sales Order, kebutuhan material berstatus `review` dengan uji lulus | **Tidak terbukti oleh regresi**: runner melewati suite Penawaran saat modul disembunyikan. Dihidupkan lagi lewat kunci uji khusus mock; **42 lulus** |
| CI sukses pada PR 13 sampai 15 dan proteksi `main` mewajibkan dua check | Cocok (API GitHub dibaca ulang) |
| T-175 dan T-176 selesai | Cocok, tetapi tanpa bagian Bukti; ditulis. T-176 hanya `source-level` di production |

## 2. Bug baru (7) dan perbaikannya

Rincian di [[TEST_MATRIX]] B-019 sampai B-025.

1. **Work Center terpakai bisa dihapus** (B-019): dialog menyatakan tidak dipakai SPK manapun karena memakai kode WC bawaan lama. Kini membaca rute item SPK aktif, catatan produksi, dan aturan rute; menawarkan Nonaktifkan.
2. **Ganti nama Work Center memutus rute dan catatan** (B-020): kini ditolak selama dipakai.
3. **Hapus yang ditolak database tampak berhasil** (B-021): adapter kini memeriksa jumlah baris; mock meniru migration 13. Laten (belum ada tombol hapus item).
4. **Dialog tanpa pengelolaan fokus** (B-022): Tab keluar dari modal, fokus tidak pindah ke laci, tidak kembali ke pemicu. Kini ada perangkap fokus.
5. **Suite Penawaran terlewati** (B-023): lihat bagian 1.
6. **Tugas `done` tanpa bukti dan kriteria ganda** (B-024): bagian 3.
7. **Kebutuhan material tidak mengenal jenis material kustom** (B-025): jenis dari Master Data seperti A5052 kini dipetakan ke bahan SPK lewat keluarga dasar dan massa jenis (`bahanDariJenis`, uji K-13).

Tambahan uji: `editor.mjs` 17 uji (editor SPK, Work Center, fokus dan keyboard), opname sparepart (SP-9b, SP-9c). Aksi UI yang belum diacu uji turun dari 76 ke 43.

## 3. Konsistensi tugas dan roadmap

| Temuan | Tindakan |
|---|---|
| `done` tanpa bukti: T-046, T-175, T-176; `review` tanpa bukti: T-178 | Bukti ditulis (T-046 dari API GitHub dan riwayat CI) |
| Tiga versi Jadwal berstatus `review` padahal digantikan T-186 yang disetujui pemilik (T-180, T-185; T-182 sebagian) | T-180 dan T-185 ditutup `done` (digantikan); T-182 dipersempit ke KPI & Analisa dan Target waktu proses |
| Kriteria sama dihitung dua kali: CDN dan CSP (T-133, T-143, T-208, T-211), modularisasi (T-141, T-211), pemantauan (T-073, T-211), uji editor (T-210, T-212) | Satu pemilik per kriteria; sisanya dirujuk |
| T-034 bergantung pada T-011 (Docker, terblokir dan tidak akan dikerjakan) sehingga jalur kritis memuat tugas yang mati | Dependensi dilepas dan dicatat |
| Roadmap: tabel Sekarang dan Berikutnya masih menyebut Docker dan E-01; angka uji usang | Diperbarui sesuai kenyataan |
| Judul mirip (T-075 dan T-188, T-176 dan T-199, T-194 dan T-202, T-063 dan T-170, T-175) | Diperiksa: bukan ganda (lingkup berbeda) |
| `done` bergantung tugas belum `done`: T-021 dan T-020, T-028 dan T-012, T-042 dan T-011 (rantai Docker), T-046 dan T-023, T-062 dan T-044, T-077 dan T-023, T-102 dan T-065, T-163 dan T-162, T-172 dan T-167, T-202 dan T-194 | Tidak diubah: dependensi historis atau sengaja longgar; keputusan pemilik di bawah |

## 4. Masih terbuka (tidak bisa saya putuskan)

- **Tutup sebagai digantikan:** T-010, T-011, T-012, T-013, T-020 (Docker lokal). Status tugas belum punya nilai "digantikan"; usul tambahkan, atau tetap `todo` dan dikecualikan dari jalur kritis.
- **Jalur proses dan data (T-030 sampai T-036, T-050 sampai T-053, T-063)** belum dimulai; itulah penentu go-live. Pemolesan lokal tidak menggerakkannya.
- **Tinjauan pemilik** untuk 30-an tugas `review` (modul demi modul), keputusan di [[AUDIT_PROGRESS_2026-11-06]] bagian "Keputusan yang ditunggu pemilik" dan di [[HANDOFF]] bagian 5.
- **Data contoh mock realistis** (nama material memuat jenis) dan 43 aksi UI yang belum diacu uji (lihat [[FEATURE_AUDIT]] bagian 3).
- **Bukti Supabase** untuk migration 14 sampai 18 dan tampilan production untuk T-176 belum ada.
