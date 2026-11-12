# Uji migration di database lokal (gratis)

Memasang salinan skema production (migration 1 sampai 13, lalu 14 produksi_log dan 18 sparepart) ke Postgres tertanam **PGlite** (WASM, tanpa Docker dan tanpa Supabase), menerapkan migration draf 24 dan 25, lalu menguji hak per peran, RLS, `can_any()`, pengaman, aman diputar ulang, data lama utuh, dan pembatalan. Tidak menyentuh Supabase mana pun.

Jalankan (PGlite tidak menjadi dependensi proyek; pasang di folder sementara):

```bash
mkdir -p /tmp/pgtest && cd /tmp/pgtest && npm init -y && npm i @electric-sql/pglite@0.3.14
cp <repo>/apps/platform/supabase/ops/uji-migration/*.mjs . && sed -i "s#new URL('../../', import.meta.url)#new URL('file:///<path-ke-repo>/apps/platform/supabase/')#" bangun.mjs
node uji.mjs
```

Batasan: ini bukan Supabase sungguhan (tanpa Realtime, Storage, Auth penuh); peran `authenticated` dan `auth.email()` ditiru. Hasil membuktikan logika SQL, RLS, dan fungsi; verifikasi akhir tetap dengan login nyata setelah diterapkan.
