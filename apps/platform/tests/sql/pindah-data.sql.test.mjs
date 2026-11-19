// Uji alat pindah-data (scripts/pindah-data.mjs) pada Postgres lokal (PGlite). Pasang sekali: npm i --no-save @electric-sql/pglite
// Jalankan: node tests/sql/pindah-data.sql.test.mjs   (bukti `verified in database` hanya untuk Postgres lokal, bukan Supabase)
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { jalankan, MIGRASI } from '../../scripts/pindah-data.mjs';

const R = [];
process.on('exit', () => console.log(R.join('\n')));
const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));

// Lingkungan mirip Supabase: peran, fungsi auth, publikasi realtime, hak bawaan di skema public
const PRELUDE = `
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
  CREATE SCHEMA IF NOT EXISTS auth; CREATE SCHEMA IF NOT EXISTS extensions;
  GRANT USAGE ON SCHEMA public, auth, extensions TO anon, authenticated, service_role;
  CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  CREATE OR REPLACE FUNCTION auth.email() RETURNS text LANGUAGE sql STABLE AS $$ SELECT auth.jwt() ->> 'email' $$;
  CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT coalesce(auth.jwt() ->> 'role', 'anon') $$;
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
  CREATE PUBLICATION supabase_realtime;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;`;
const baru = async () => { const db = new PGlite({ extensions: { uuid_ossp, pg_trgm } }); await db.exec(PRELUDE); return db; };
const q = async (db, s, p) => (await db.query(s, p)).rows;
const hitung = async (db, t) => (await q(db, `select count(*)::int n from public.${t}`))[0].n;
const ada = async (db, t) => (await q(db, 'select to_regclass($1) r', ['public.' + t]))[0].r !== null;

// 1. Sumber: skema production + data, diekspor sebagai cadangan (bentuk sama dengan tombol Unduh cadangan)
const sumber = await baru();
await jalankan(sumber, { data: {} }, { bentukUlang: true, apply: true });
await sumber.exec(`
  INSERT INTO muser (id, email, nama, role, aktif) VALUES (uuid_generate_v4(), 'admin@contoh.id', 'Admin', 'admin', true), (uuid_generate_v4(), 'gudang@contoh.id', 'Gudang', 'gudang', true);
  INSERT INTO master (key, value) VALUES ('setting', '{"a":1}'), ('lock:lock:new-1', '{"holder":"x"}'), ('backup', '{"ts":"x"}'), ('SJ-202611', '{"n":3}');
  INSERT INTO mwc (kode, nama) VALUES ('SHR', 'Shearing'), ('PCH', 'Punching');
  INSERT INTO mcustomer (nama) VALUES ('PT Contoh');
  INSERT INTO rm (item, ukuran, stok_awal) VALUES ('Plat SPHC', '1.2x1200x2400', 10);
  INSERT INTO spk (no, status, items) VALUES ('SPK-001', 'Terbit', '[{"q":2}]'), ('SPK-002', 'Draft', '[]');
  INSERT INTO bongkar (supplier, no_do, data) VALUES ('Supplier Contoh', 'DO-1', jsonb_build_object('foto', jsonb_build_array(repeat('A', 5000))));
  INSERT INTO mutasi (gudang, item_id, jenis, delta) SELECT 'rm', id, 'keluar', -3 FROM rm;
`);
const dump = {};
for (const t of ['muser', 'role_modules', 'master', 'mwc', 'mcustomer', 'rm', 'spk', 'bongkar', 'mutasi', 'log', 'audit_log']) dump[t] = await q(sumber, `select to_jsonb(x) j from public.${t} x`).then((r) => r.map((y) => y.j));
const backup = { format: 'mni-gudang-backup', dibuat: 'uji', oleh: 'uji', data: dump };
ok('P-01 skema production terbentuk dari migration (' + MIGRASI.length + ' berkas)', (await ada(sumber, 'spk')) && (await ada(sumber, 'mtc')) && !(await ada(sumber, 'penawaran')));
ok('P-02 pemicu audit di sumber mencatat tulisan (bahan uji)', dump.audit_log.length > 0, dump.audit_log.length + ' baris audit');

// 2. Tujuan: skema ERP "lain" berisi sampah, mirip mni-wms (tabel Penawaran, tipe, fungsi, pemicu, 1 admin)
async function tujuanKotor() {
  const db = await baru();
  await jalankan(db, { data: {} }, { bentukUlang: true, apply: true });
  await db.exec(`
    CREATE TYPE public.tipe_lama AS ENUM ('a','b');
    CREATE TABLE public.penawaran (id serial PRIMARY KEY, no text, tipe tipe_lama);
    CREATE VIEW public.v_lama AS SELECT * FROM public.penawaran;
    CREATE FUNCTION public.fungsi_lama() RETURNS int LANGUAGE sql AS $$ SELECT 1 $$;
    ALTER TABLE public.spk ADD COLUMN kolom_lama text;
    INSERT INTO public.muser (id, email, nama, role, aktif) VALUES (uuid_generate_v4(), 'tujuan-admin@contoh.id', 'Admin Tujuan', 'admin', true);`);
  return db;
}
const lapor = [];
let t = await tujuanKotor();
const sebelum = { tabel: (await q(t, `select count(*)::int n from pg_class where relnamespace='public'::regnamespace and relkind='r'`))[0].n, muser: await hitung(t, 'muser') };

// P-03 simulasi tidak mengubah apa pun
const sim = await jalankan(t, backup, { bentukUlang: true, apply: false, lapor: (s) => lapor.push(s) });
ok('P-03 simulasi: lolos verifikasi tetapi dibatalkan, skema lama utuh', !sim.dikomit && (await ada(t, 'penawaran')) && (await ada(t, 'v_lama')) && (await hitung(t, 'muser')) === sebelum.muser && !(await hitung(t, 'spk')));
ok('P-04 simulasi melaporkan OK untuk semua tabel', lapor.some((l) => /COMMIT|SIMULASI/.test(l)) && !lapor.some((l) => /BEDA/.test(l)));

// P-05 penjaga: tujuan berisi data operasional ditolak tanpa --paksa
await t.exec(`INSERT INTO public.spk (no, status) VALUES ('SPK-LAMA', 'Draft')`);
let galat = null; try { await jalankan(t, backup, { bentukUlang: true, apply: true }); } catch (e) { galat = e.message; }
ok('P-05 tujuan berisi data operasional ditolak (tanpa --paksa) dan tidak berubah', /berisi data operasional/.test(galat || '') && (await hitung(t, 'spk')) === 1 && (await ada(t, 'penawaran')));
await t.exec(`DELETE FROM public.spk`);

// P-06 apply sungguhan
const sisaDisimpan = {};
const nyata = await jalankan(t, backup, { bentukUlang: true, apply: true, simpanSisa: (s) => Object.assign(sisaDisimpan, s), lapor: () => {} });
ok('P-06 apply: dikomit', nyata.dikomit === true);
ok('P-07 objek lama hilang (tabel, view, fungsi, tipe, kolom tambahan)', !(await ada(t, 'penawaran')) && !(await ada(t, 'v_lama')) && (await q(t, `select count(*)::int n from pg_proc where proname='fungsi_lama'`))[0].n === 0 && (await q(t, `select count(*)::int n from pg_type where typname='tipe_lama'`))[0].n === 0 && (await q(t, `select count(*)::int n from information_schema.columns where table_name='spk' and column_name='kolom_lama'`))[0].n === 0);
ok('P-08 jumlah baris sama dengan cadangan', (await hitung(t, 'spk')) === 2 && (await hitung(t, 'rm')) === 1 && (await hitung(t, 'mwc')) === 2 && (await hitung(t, 'mutasi')) === 1 && (await hitung(t, 'bongkar')) === 1 && (await hitung(t, 'mcustomer')) === 1);
ok('P-09 master: lock:* dan backup tidak ikut, penghitung dan pengaturan ikut', JSON.stringify((await q(t, `select key from public.master order by key`)).map((x) => x.key)) === JSON.stringify(['SJ-202611', 'setting']));
ok('P-10 akun admin tujuan dipertahankan di samping pengguna cadangan', (await q(t, `select email from public.muser order by email`)).map((x) => x.email).join(',') === 'admin@contoh.id,gudang@contoh.id,tujuan-admin@contoh.id');
ok('P-11 isi lama tujuan disimpan sebelum dibentuk ulang', (sisaDisimpan.muser || []).some((x) => x.email === 'tujuan-admin@contoh.id'));
ok('P-12 isi baris identik (sidik): spk dan bongkar termasuk foto', (await q(t, `select md5(string_agg(to_jsonb(x)::text, ',' order by id)) h from public.spk x`))[0].h === (await q(sumber, `select md5(string_agg(to_jsonb(x)::text, ',' order by id)) h from public.spk x`))[0].h && (await q(t, `select length(data::text) l from public.bongkar`))[0].l > 5000);
ok('P-13 audit tidak digandakan: hanya baris audit dari cadangan', (await hitung(t, 'audit_log')) === dump.audit_log.length, `${await hitung(t, 'audit_log')} vs ${dump.audit_log.length}`);
ok('P-14 semua pemicu pengguna menyala lagi', (await q(t, `select count(*)::int n from pg_trigger tr join pg_class c on c.oid=tr.tgrelid where not tr.tgisinternal and c.relnamespace='public'::regnamespace and tr.tgenabled <> 'O'`))[0].n === 0);
ok('P-15 pemicu aktif setelah pindah: tulisan baru tercatat di audit', await (async () => { const a = await hitung(t, 'audit_log'); await t.exec(`INSERT INTO public.mwc (kode, nama) VALUES ('X1','X')`); return (await hitung(t, 'audit_log')) === a + 1; })());
ok('P-16 sama dengan production: pemicu draf 17 dan 20 (stok, cadangan bahan) TIDAK terpasang', (await q(t, `select count(*)::int n from pg_trigger where tgname in ('trg_mutasi_jaga_stok','trg_mutasi_sinkron_spk','trg_spk_status_cadangan')`))[0].n === 0 && !(await ada(t, 'spk_materials')));
ok('P-17 tabel masuk publikasi realtime lagi', (await q(t, `select count(*)::int n from pg_publication_tables where pubname='supabase_realtime' and tablename in ('spk','bongkar','muser')`))[0].n === 3);

// P-18 gagal di tengah: data tidak valid membatalkan SEMUANYA (skema lama utuh)
t = await tujuanKotor();
const rusak = JSON.parse(JSON.stringify(backup)); rusak.data.spk[1].tgl = 'bukan-tanggal';
galat = null; try { await jalankan(t, rusak, { bentukUlang: true, apply: true }); } catch (e) { galat = e; }
ok('P-18 data rusak: dibatalkan, skema lama dan akun tujuan utuh', !!galat && galat.dibatalkan && (await ada(t, 'penawaran')) && (await hitung(t, 'muser')) === 1 && (await q(t, `select count(*)::int n from information_schema.columns where table_name='spk' and column_name='kolom_lama'`))[0].n === 1, galat && galat.message.slice(0, 80));

// P-19 verifikasi menangkap baris ganda (id sama) alih-alih diam-diam melewatinya
t = await tujuanKotor();
const ganda = JSON.parse(JSON.stringify(backup)); ganda.data.spk.push({ ...ganda.data.spk[0] });
galat = null; try { await jalankan(t, ganda, { bentukUlang: true, apply: true }); } catch (e) { galat = e; }
ok('P-19 baris ganda terdeteksi oleh verifikasi dan dibatalkan', !!galat && /Verifikasi gagal/.test(galat.message) && (await ada(t, 'penawaran')));

// P-20 tanpa --bentuk-ulang pada skema yang sudah sama: memuat ke tujuan kosong dan aman diulang
t = await baru(); await jalankan(t, { data: {} }, { bentukUlang: true, apply: true });
await jalankan(t, backup, { apply: true, lapor: () => {} });
const ulang = await jalankan(t, backup, { apply: true, lapor: () => {} }).then(() => true, () => false);
ok('P-20 muat tanpa bentuk ulang, lalu diulang: aman (tidak menggandakan)', ulang && (await hitung(t, 'spk')) === 2 && (await hitung(t, 'rm')) === 1);
