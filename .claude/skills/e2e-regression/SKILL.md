---
name: e2e-regression
description: Jalankan dan catat regresi UI penuh untuk pratinjau lokal mni-app (suite regresi, role, akses, produksi, sparepart/gudang/SPK stok, tampilan, plus uji unit). Wajib setelah mengubah adapter Supabase, local-supabase.js, schema-columns.js, apps/gudang-logistik, atau index.html mni-app.
---

# Regresi E2E (mode mock)

Tujuan: memastikan perubahan tidak merusak alur yang sudah lulus. Keadaan 2026-11-06 (semua 0 FAIL): regresi 42, role 12, akses 34, produksi 134, sparepart 36 (gudang, SPK stok, nama penanda tangan, invarian), fitur 18 (aksi UI, pembaca angka, koreksi SPK stok, Dashboard), penawaran 42 (mock menyalakan modul lewat kunci uji), editor 17 (editor SPK, Work Center, fokus dan keyboard), menyeluruh 24 (Master Data, bongkar muat, unduhan, kendala, pemindai kejanggalan), keamanan 8 (XSS), aksesibilitas 3 (axe-core), tampilan 72; unit 266; lint `npm run lint` 0 galat (`tests/unit/*.test.mjs`). Suite penawaran dilewati karena modul disembunyikan.

## Menjalankan

1. Pastikan dependensi dan UI siap: `cd apps/platform && npm ci && npm run extract`.
2. Jalankan dev server mock di terminal terpisah: `npx.cmd vite --host 127.0.0.1 --port 5173 --no-open` (di PowerShell yang memblokir skrip pakai `npx.cmd`). `.env.local` berisi `VITE_LOCAL_MOCK=1`.
3. Pakai **satu tab** browser. Setelah itu jalankan `runRoles(page, base)` dari `tests/e2e/roles.mjs` (penegakan role, 12 pemeriksaan). Jalankan `runRegression(page, 'http://127.0.0.1:5173/')` dari `apps/platform/tests/e2e/regression.mjs` lewat Playwright MCP (`browser_run_code_unsafe`) atau `node tests/e2e/run.mjs` bila paket `playwright` terpasang (T-077).
4. Hasil harus `fail: 0`. Satu kegagalan = berhenti, cari penyebab, perbaiki, ulangi dari awal.

## Menjalankan penuh (cara terbaru)

- Server mock: `cd apps/platform && VITE_LOCAL_MOCK=1 npx.cmd vite --host 127.0.0.1 --port 5173 --strictPort` (nyalakan dengan `nohup` bila lewat Bash).
- `node scripts/extract-app.js` setelah mengubah `apps/gudang-logistik`, lalu `node tests/e2e/run.mjs http://127.0.0.1:5173/` (semua suite, beberapa menit: jalankan di latar belakang). Satu suite: `ONLY=sparepart node tests/e2e/run.mjs http://127.0.0.1:5173/` (nama: regresi, role, akses, produksi, penawaran, sparepart, fitur, menyeluruh, keamanan, aksesibilitas, tampilan).
- Unit: `for f in tests/unit/*.test.mjs; do node "$f"; done`.

## Menulis uji baru

- Suite gudang ada di `tests/e2e/sparepart.mjs` (data sintetis; nomor SP-n berurutan). Pakai pembantu yang ada: `submit()`, `tabClick()`, `docOf(pola, nama)` (cetak dokumen lewat dialog nama penanda tangan), `releaseSpk(id)` (menerbitkan SPK dan menandai produksi selesai lewat `localStorage`, lalu memuat ulang).
- Teks yang dicetak huruf besar oleh CSS (judul kolom) terbaca huruf besar lewat `innerText`: cocokkan dengan `/i`.
- Mengubah data mock lewat `localStorage` (`mni-local-mock-db`) hanya terbaca setelah `page.reload()`.
- Alur dokumen: dialog nama (`#mform [name^=sg]`) muncul sebelum PDF atau Excel; uji harus mengisi lalu submit.
- Setiap fitur gudang baru: satu uji untuk jalan normal dan satu untuk penolakan (stok tidak cukup, SPK Draft, melebihi hasil produksi siap).

## Setelah selesai

- Catat hasil dan bug baru (ID B-xxx) di `documentation/TEST_MATRIX.md`, perbarui tugas terkait, lalu jalankan skill `vault-progress`.
- Jika regresi menemukan bug dari perbaikan sebelumnya, tulis sebagai regresi (contoh B-010) dan tambahkan pemeriksaannya ke `regression.mjs`.

## Batas

- Mock meniru batasan Postgres (id UUID, kolom tak dikenal, pengurutan kolom) tetapi bukan Supabase. Bug yang hanya muncul di Postgres nyata (mis. B-007 sampai B-011) ditemukan lewat uji di Supabase dev: lihat skill `supabase-dev-ops`.
- Jangan menyimpan unduhan (`*.csv`, `*.xlsx`, `*.pdf`) atau tangkapan layar di repo kecuali sebagai bukti yang diindeks di `documentation/screenshots/README.md`.
- Data hanya sintetis.

## Lapisan uji tambahan (2026-11-06)

- `keamanan.mjs`: menyuntik markup ke semua bidang teks bebas lalu membuka semua menu, laci, lembar, kartu, dan dokumen; tidak boleh ada eksekusi atau elemen suntikan. Ada kontrol positif (payload tampil sebagai teks).
- `aksesibilitas.mjs`: axe-core (dev dependency) pada semua menu dan form di tema gelap dan terang; target 0 pelanggaran WCAG 2 A dan AA. Perbaikan otomatis nama dan label ada di `a11yFix()` di `app.js`.
- `kejanggalan.mjs` (`pindaiKejanggalan(page)`): memindai semua menu desktop dan HP untuk teks undefined, NaN, null, gambar rusak, meluap, tabel tanpa keterangan, galat konsol; panggil di akhir suite yang kaya data.
- `invarian.mjs` (`periksaInvarian(page)`): dipanggil di akhir suite yang membuat banyak transaksi; tambahkan invarian baru di sini bila ada aturan data baru.
- Alur SPK ujung ke ujung: `node tests/e2e/alur-spk.mjs http://127.0.0.1:5173/ "$TEMP/alur-shots"` (folder tangkapan di luar repo agar dokumentasi tidak berubah).
- Jangan menulis kode berisi regex lewat heredoc atau `node -e` di Bash: garis miring terbalik hilang; pakai alat Edit atau Write, atau `String.fromCharCode`. Uji fungsi yang diubah dengan mengevaluasinya di halaman.
