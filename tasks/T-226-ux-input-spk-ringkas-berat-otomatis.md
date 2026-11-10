---
type: task
id: T-226
title: "Input SPK ringkas: berat estimasi dan real langsung tampil, tempel daftar dari Excel"
phase: P9
epic: E-16
release: v1.2
status: doing
priority: P1
env: dev
effort_days: 2
depends: [T-222, T-225]
owner: "dev + pemilik"
updated: 2026-11-10
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-226 Input SPK ringkas dan berat otomatis

Rancangan: [[documentation/RANCANGAN_UX_INPUT_SPK|RANCANGAN_UX_INPUT_SPK]]. Keputusan pemilik 2026-11-10: A berat tidak diketik (hanya dihitung), B stok sebagai angka, C Kg est (permintaan plate ke Gudang Bahan Baku) dan Kg real (kirim ke vendor) tampil keduanya, D layar baru menggantikan yang lama.

## Kriteria selesai

- [x] Baris ringkas: bentuk, W, H, L, qty, satuan, dari stok, Kg/pcs, **Kg est**, **Kg real**; kolom Spesifikasi (chip dan dropdown vendor) dihapus dari baris; tabel tidak menggulir ke samping
- [x] Menu ⋯ per baris memuat catatan merah, keterangan, vendor, dan produk stok; terbuka otomatis bila ada isinya atau peringatan
- [x] Berat hasil kalkulator tidak bisa diketik bila katalog terpasang; teks bebas atau tanpa katalog tetap bisa diisi manual (ditandai, dipakai sama untuk est dan real)
- [x] Dari stok sebagai angka; tombol **Pakai stok** bila ada produk cocok; Kg est = berat/pcs x (qty - stok), Kg real penuh
- [x] Header section: vendor otomatis (→ vendor ELG) dan subtotal est dan real per section
- [x] Ringkasan di bawah layar: item, qty, Kg estimasi (plate), Kg real (barang jadi), dari stok, baris berat manual, baris belum terhitung
- [x] Pemberitahuan bila katalog berat belum terpasang
- [x] Deskripsi teks yang diketik pada baris Teks bebas dikenali jadi baris terstruktur; tombol **Tempel daftar** per section (kolom Excel dipisah tab: No, Description, Qty, Satuan)
- [ ] Diuji dengan katalog perusahaan dan Supabase (belum)

## Bukti

Tingkat bukti: `verified in browser` (mock). Suite `spkringkas` RK-01..RK-13 (14 PASS), `kenali.test.mjs` KN-01..KN-06 (6 PASS), `spkdimensi` 13 PASS; regresi penuh 32 suite 0 FAIL; lint 0 error.

Batas yang jujur: pengenal deskripsi memakai aturan kata yang ada (Tee dan Cross dengan W1..W4 terbaca bila ditulis W1300xW2200..., atau satu W untuk semua sisi); belum diuji dengan katalog perusahaan dan Supabase. Layout lama tetap ada di balik pengaturan `spkDimBaru` dan dipakai suite uji lama.
