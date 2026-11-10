---
name: erp-module-boundary
description: Aturan menambah modul ERP baru (Penawaran dan turunannya) sebagai modul terpisah yang tidak menyentuh sistem live: tata letak berkas, tabel baru dengan migration draf, hak akses modul, bendera fitur, dan tangga penayangan bertahap. Gunakan sebelum membuat modul, tabel, atau menu baru di luar Gudang dan Produksi.
---

# Modul ERP terpisah

## Aturan batas
1. **Tidak menyentuh yang live.** Production Supabase dan Vercel tidak diubah. Semua pengembangan lokal (mock `VITE_LOCAL_MOCK=1`). Migration hanya ditulis sebagai **draf** di `apps/platform/supabase/draft/` dan tidak diterapkan tanpa persetujuan eksplisit pemilik (bila perlu, ke Supabase dev dulu).
2. **Tabel baru, bukan mengubah yang lama.** Penawaran memakai tabel sendiri (mis. `penawaran`, `penawaran_item`, `harga_skenario`) dengan pola kolom yang sama seperti tabel lain (id UUID, kolom bertanda waktu, `data` JSONB, RLS aktif, `ALTER` tanpa `DROP`). Tautan ke tabel lama hanya lewat **kolom referensi opsional baru** (mis. `spk.penawaran_id`) dan baru ditayangkan pada tahap yang disetujui.
3. **Kode murni dipisah dari UI.** Mesin hitung di `apps/platform/src/lib/erp/` (fungsi murni, uji unit, tanpa DOM). UI modul tetap di `apps/gudang-logistik/` mengikuti `adapter-contract`; hanya satu menu baru dengan hak akses modul sendiri (skill `rls-roles`).
4. **Bendera fitur dan hak.** Modul disembunyikan kecuali pengguna punya hak modul `penawaran`; tanpa hak, tampilan lama tidak berubah sama sekali.
5. **Sumber data satu arah.** Penawaran adalah hulu: SPK dibuat dari penawaran (muat dari), bukan sebaliknya. SPK yang dibuat manual tetap bisa dibuat; tautan penawaran opsional.
6. **Jejak dan idempoten.** "Muat dari penawaran" tidak membuat SPK ganda; menyimpan snapshot harga dan berat saat PO; setiap perubahan bernomor revisi.

## Tangga penayangan (tiap tahap bisa berhenti)
| Tahap | Isi | Bukti minimal |
|---|---|---|
| E0 | Mesin harga + uji emas (lokal) | uji unit hijau, cocok dengan Excel |
| E1 | Modul Penawaran lokal (mock) | regresi penuh 0 FAIL |
| E2 | Muat dari penawaran ke SPK + snapshot PO (mock) | uji alur hulu ke hilir |
| E3 | Supabase dev: migration draf diterapkan, RLS diuji | `verified in database` |
| E4 | Vercel preview, uji pemilik dengan data sintetis | UAT singkat |
| E5 | Production, hanya setelah persetujuan eksplisit | backup, rollback, catatan keputusan |

Jangan melompati tahap. Tingkat bukti ditulis jelas (`source-level`, `verified in browser`, `verified in database`); mock bukan bukti Supabase.

## Cakupan
Tahap awal: Penawaran, estimasi, SPK dari penawaran, kebutuhan material, monitoring estimasi lawan aktual. Akuntansi, pajak faktur, dan penggajian di luar cakupan sampai ada keputusan tertulis (cek tumpang tindih dengan sistem lain yang sudah dipakai perusahaan).
