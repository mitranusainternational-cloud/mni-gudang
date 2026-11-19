// Uji draf migration 26 (table_stamps() cepat) pada Postgres lokal (PGlite). Pasang sekali: npm i --no-save @electric-sql/pglite
// Jalankan: node tests/sql/table-stamps.sql.test.mjs   (bukti `verified in database` hanya untuk Postgres lokal, bukan Supabase)
// Skema disederhanakan: tabel dengan kombinasi kolom tanggal berbeda, satu tabel hilang, RLS, dan hak akses.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const DRAFT = process.env.DRAFT_DIR || fileURLToPath(new URL('../../supabase/draft/', import.meta.url));
const baru = fs.readFileSync(DRAFT + '20240101000026_table_stamps_cepat.sql', 'utf8');
const lama = fs.readFileSync(DRAFT + '20240101000026_table_stamps_cepat_rollback.sql', 'utf8');
const db = new PGlite();
const R = [];
process.on('exit', () => console.log(R.join('\n')));
const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const q = async (sql) => (await db.query(sql)).rows;
const stamps = async () => (await q('select public.table_stamps() s'))[0].s;
const cnt = (s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v.split('|')[0]]));

await db.exec(`
  CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN;
  GRANT USAGE ON SCHEMA public TO authenticated, anon;
  -- updated_at + created_at + kolom besar (seperti rm, spk, bongkar)
  CREATE TABLE rm (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), data jsonb DEFAULT '{}');
  CREATE TABLE bongkar (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), data jsonb DEFAULT '{}');
  -- hanya updated_at (seperti master)
  CREATE TABLE master (id serial PRIMARY KEY, key text, updated_at timestamptz DEFAULT now());
  -- hanya created_at
  CREATE TABLE mutasi (id serial PRIMARY KEY, created_at timestamptz DEFAULT now());
  -- hanya 'at'
  CREATE TABLE log (id serial PRIMARY KEY, at timestamptz DEFAULT now());
  -- tanpa kolom tanggal
  CREATE TABLE mwc (id serial PRIMARY KEY, kode text);
  -- tabel lain dalam daftar dibuat kosong agar fungsi lama juga bisa jalan; mtc, sp, produksi_log SENGAJA tidak dibuat
  CREATE TABLE fg (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE spk (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE vendor (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE kirim (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE mvendor (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE mcustomer (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE msupplier (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE marmada (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE rmhist (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE pr (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE opname (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  CREATE TABLE muser (id serial PRIMARY KEY, email text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  INSERT INTO rm (updated_at, data) VALUES ('2026-01-01 10:00:00+00', '{"x":1}'), (NULL, '{}');
  INSERT INTO bongkar (data) VALUES (jsonb_build_object('foto', repeat('A', 200000)));
  INSERT INTO master (key, updated_at) VALUES ('a', '2026-02-01 00:00:00+00'), ('b', '2026-03-01 00:00:00+00');
  INSERT INTO mutasi (created_at) VALUES ('2026-04-01 00:00:00+00');
  INSERT INTO log (at) VALUES ('2026-05-01 00:00:00+00'), ('2026-05-02 00:00:00+00');
  INSERT INTO mwc (kode) VALUES ('A'), ('B'), ('C');
`);

// fungsi lama tidak tahan tabel hilang (mtc, sp, produksi_log): pasang versi lama di tabel lengkap lebih dulu untuk pembanding
await db.exec(`CREATE TABLE mtc (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
               CREATE TABLE sp (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
               CREATE TABLE produksi_log (id serial PRIMARY KEY, created_at timestamptz DEFAULT now());`);
await db.exec(lama);
await db.exec('GRANT EXECUTE ON FUNCTION public.table_stamps() TO authenticated; REVOKE EXECUTE ON FUNCTION public.table_stamps() FROM PUBLIC, anon;');
const sLama = await stamps();
const kunciLama = Object.keys(sLama);

await db.exec(baru);
const sBaru = await stamps();
ok('T-01 daftar tabel sama dengan fungsi lama (21)', JSON.stringify(Object.keys(sBaru)) === JSON.stringify(kunciLama) && kunciLama.length === 21, `${Object.keys(sBaru).length} tabel`);
ok('T-02 jumlah baris tiap tabel sama dengan fungsi lama', JSON.stringify(cnt(sBaru)) === JSON.stringify(cnt(sLama)));
ok('T-03 jumlah baris sama dengan count(*) langsung', cnt(sBaru).log === '2' && cnt(sBaru).mwc === '3' && cnt(sBaru).rm === '2' && cnt(sBaru).bongkar === '1');
ok('T-04 tabel tanpa kolom tanggal: sidik hanya jumlah', sBaru.mwc === '3|');
ok('T-05 tabel hanya kolom at memakai at', sBaru.log.startsWith('2|2026-05-02'), sBaru.log);
ok('T-06 tabel hanya created_at memakai created_at', sBaru.mutasi.startsWith('1|2026-04-01'), sBaru.mutasi);
ok('T-07 tabel hanya updated_at memakai updated_at (maks)', sBaru.master.startsWith('2|2026-03-01'), sBaru.master);

// perubahan terdeteksi: tambah, ubah, hapus
const awal = sBaru.master;
await db.exec(`UPDATE master SET updated_at = '2026-06-01 00:00:00+00' WHERE key = 'a'`);
const s1 = await stamps();
ok('T-08 ubah baris mengubah sidik', s1.master !== awal && s1.master.startsWith('2|2026-06-01'), s1.master);
await db.exec(`INSERT INTO log (at) VALUES ('2026-05-03 00:00:00+00')`);
const s2 = await stamps();
ok('T-09 tambah baris mengubah sidik', s2.log !== s1.log && s2.log.startsWith('3|'));
await db.exec(`DELETE FROM log WHERE at = '2026-05-03 00:00:00+00'`);
await db.exec(`INSERT INTO log (at) VALUES ('2026-05-02 00:00:00+00')`);
const s3 = await stamps();
ok('T-10 hapus lalu tambah baris dengan waktu lama tetap terbaca lewat jumlah', s3.log.startsWith('3|2026-05-02'), s3.log);
await db.exec(`DELETE FROM mwc WHERE kode = 'A'`);
ok('T-11 hapus baris pada tabel tanpa tanggal mengubah sidik', (await stamps()).mwc === '2|');
await db.exec(`UPDATE rm SET updated_at = NULL, created_at = '2026-07-07 00:00:00+00' WHERE id = 1; UPDATE rm SET created_at = '2026-01-01 00:00:00+00' WHERE id = 2`);
const sr = (await stamps()).rm;
ok('T-12 updated_at kosong jatuh ke created_at (COALESCE)', sr.startsWith('2|2026-07-07'), sr);

// ketahanan: tabel hilang dilewati, fungsi lama gagal
await db.exec('DROP TABLE mtc; DROP TABLE sp');
const tanpa = await stamps();
ok('T-13 tabel yang belum ada dilewati tanpa galat', !('mtc' in tanpa) && !('sp' in tanpa) && Object.keys(tanpa).length === 19, `${Object.keys(tanpa).length} tabel`);

// bentuk fungsi
const def = (await q(`select pg_get_functiondef('public.table_stamps'::regproc) d`))[0].d;
ok('T-14 isi fungsi tidak lagi memanggil to_jsonb', !/to_jsonb\(x\)/.test(def));
const meta = (await q(`select provolatile v, prosecdef d from pg_proc where proname='table_stamps'`))[0];
ok('T-15 tetap STABLE dan SECURITY INVOKER', meta.v === 's' && meta.d === false);
const priv = (await q(`select has_function_privilege('authenticated','public.table_stamps()','execute') a, has_function_privilege('anon','public.table_stamps()','execute') n`))[0];
ok('T-16 hak akses tetap: authenticated boleh, anon tidak', priv.a === true && priv.n === false);

// RLS: pemanggil hanya menghitung baris yang boleh dilihatnya
await db.exec(`ALTER TABLE master ENABLE ROW LEVEL SECURITY; CREATE POLICY p ON master FOR SELECT TO authenticated USING (key = 'a'); GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;`);
await db.exec('SET ROLE authenticated');
const sRls = await stamps();
await db.exec('RESET ROLE');
ok('T-17 RLS berlaku (invoker): authenticated hanya menghitung baris yang boleh dilihat', sRls.master.startsWith('1|'), sRls.master);

// idempoten dan pembatalan
await db.exec(baru); await db.exec(baru);
ok('T-18 dipasang ulang tidak menimbulkan galat', Object.keys(await stamps()).length === 19);
await db.exec('CREATE TABLE mtc (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()); CREATE TABLE sp (id serial PRIMARY KEY, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now())');
await db.exec(lama);
const kembali = await stamps();
ok('T-19 pembatalan mengembalikan definisi lama (to_jsonb) dan hasilnya jumlah sama', /to_jsonb\(x\)/.test((await q(`select pg_get_functiondef('public.table_stamps'::regproc) d`))[0].d) && cnt(kembali).log === '3');
const priv2 = (await q(`select has_function_privilege('authenticated','public.table_stamps()','execute') a, has_function_privilege('anon','public.table_stamps()','execute') n`))[0];
ok('T-20 hak akses tetap sama sesudah pembatalan', priv2.a === true && priv2.n === false);
