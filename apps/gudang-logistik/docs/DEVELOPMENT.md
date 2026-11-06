---
type: application-development-guide
area: gudang-logistik
status: active
updated: 2026-11-02
---

# Panduan pengembangan aplikasi

## Source aktif

- `apps/gudang-logistik/index.html`: shell dokumen dan pemanggilan asset.
- `apps/gudang-logistik/assets/css/app.css`: gaya tampilan.
- `apps/gudang-logistik/assets/js/app.js`: navigasi, render, state, dan adapter data.
- `apps/gudang-logistik/docs/`: panduan, inventaris, dan keputusan teknis.
- `apps/gudang-logistik/reference/`: HTML sumber yang dipertahankan untuk perbandingan; jangan edit sebagai source aktif.
- `apps/gudang-logistik/supabase/config.toml`: scaffold konfigurasi local Supabase; belum ada migration atau remote project link.
- `apps/gudang-logistik/scripts/preview-server.mjs`: server preview statis pada loopback.

Aplikasi saat ini berbasis HTML/CSS/JavaScript tanpa bundler yang tercatat di repository. Jangan menambah framework/build pipeline sebelum keputusan arsitektur dicatat dan langkah pengembangan dipetakan.

## Jalankan preview UI

Dari folder `apps/gudang-logistik/`:

```powershell
node scripts/preview-server.mjs
```

Buka <http://localhost:8002/>. Server menyajikan folder aplikasi secara langsung dan bind hanya ke loopback `127.0.0.1`. Jika port `8002` sedang digunakan, hentikan proses preview project yang lama atau jalankan dengan port lain:

```powershell
$env:MNI_PREVIEW_PORT = "8003"
node scripts/preview-server.mjs
```

Lalu buka <http://localhost:8003/>.

**Status akses 2026-11-02:** preview lokal berjalan pada `http://localhost:8002/` dari `scripts/preview-server.mjs`. HTTP 200 telah diverifikasi untuk HTML, CSS, dan JavaScript setelah memperbaiki pemetaan URL relatif. Render visual pascaperbaikan, console browser, responsive layout, dan alur UI belum diverifikasi oleh runner; ambil screenshot baru setelah pemeriksaan browser tersedia.

## Batas runtime

- `boot()` saat ini membaca adapter legacy `window.claude` dan memerlukan `db`, `user`, serta `downloads`. Preview lokal statis tidak menyediakan adapter ini dan tidak punya backend.
- `addDoc`, `updDoc`, dan `delDoc` memerlukan database dan izin. Server statis hanya menyajikan file, tidak menyediakan database/API.
- `ROLE_ON=false` di source; jangan klaim autentikasi/peran aktif.
- Preview disconnected harus menyebut mode lokal secara jelas; jangan mengklaim penyimpanan bersama/sinkronisasi atau meminta pengguna membuka Claude.ai.
- Jangan masukkan data operasional nyata di preview lokal disconnected.
- Daftar koleksi di kode hanya indikasi model konsumsi aplikasi. Lihat [[apps/gudang-logistik/docs/DATA_INVENTORY|inventaris data]], bukan schema database resmi.
- Supabase local stack belum berjalan karena Docker engine/service tidak dapat diakses dari sesi Windows ini. Config yang ada belum membuktikan database lokal siap.
- Hosted project `MNI - Operational` belum dipastikan sebagai target; jangan menjalankan `supabase link`, `db push`, atau migrasi ke hosted sebelum [[documentation/FOUNDATION_BASELINE|target dan migration lineage]] diverifikasi.

## Alur edit

1. Kerjakan di cabang `fitur/<nama>` yang dibuat dari `main` (sejak PR 14); `development` tertinggal. Setelah mengubah `app.js` atau `app.css`, jalankan `node scripts/extract-app.js` di `apps/platform` (membangun `public/app.*`) dan `node --check public/app.js`.
2. Cari route/menu di daftar `VIEWS`, dan titik registri render di `assets/js/app.js` sebelum mengubahnya.
3. Periksa apakah perubahan menyentuh data, status dokumen, perhitungan stok, atau write path sebelum mengedit.
4. Pisahkan perubahan markup, styling, dan handler jika masuk akal; jangan mengubah file reference.
5. Perbarui [[apps/gudang-logistik/docs/USER_GUIDE|panduan penggunaan]], [[apps/gudang-logistik/docs/INVENTORY|inventaris fitur]], dan [[apps/gudang-logistik/docs/DECISIONS|catatan keputusan]] bila relevan.
6. Catat cara verifikasi, hasil browser/console, commit, risiko, dan hambatan di [[documentation/PROJECT_PROGRESS|progress]].

## Checklist verifikasi untuk perubahan aplikasi

- [ ] Pastikan browser memuat file dari branch yang sedang dikerjakan.
- [ ] Periksa console/error dan kondisi runtime tanpa menyimpan data live.
- [ ] Cek tampilan desktop/mobile dan navigasi relevan.
- [ ] Untuk perubahan data, validasi hak akses, input, status, idempotensi, rekonsiliasi, dan audit di backend uji yang sah.
- [ ] Capture screenshot bersih sesuai [[documentation/screenshots/README|aturan bukti visual]].
- [ ] Regresi penuh 0 FAIL: `cd apps/platform && node tests/e2e/run.mjs http://127.0.0.1:5173/` (mock: `VITE_LOCAL_MOCK=1 npx.cmd vite --host 127.0.0.1 --port 5173 --strictPort`), uji unit `tests/unit/*.test.mjs`; tambahkan uji untuk fitur baru (`tests/e2e/sparepart.mjs` untuk gudang dan SPK stok, `tests/e2e/fitur.mjs` untuk aksi UI lain).
- [ ] Perbarui progress dan dokumentasi: catatan tugas, `documentation/PETA_MODUL.md`, PRD terkait, lalu `node scripts/sync-vault.mjs` hingga OK.

## Git/branch

Peta versi ada di [[documentation/VERSION_STRATEGY|strategi branch]]. Gunakan pull request dari cabang `fitur/<nama>` → `main` setelah pemeriksaan dan persetujuan pada [[documentation/RELEASE_CHECKLIST|checklist rilis]]. Branch `docs` tidak menggantikan deployment situs dokumentasi.
