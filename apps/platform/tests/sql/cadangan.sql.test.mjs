// Menjalankan draf migration 17, 19, 20 pada Postgres lokal (PGlite, tanpa Docker dan tanpa Supabase). Pasang sekali: npm i --no-save @electric-sql/pglite
// Jalankan: node tests/sql/cadangan.sql.test.mjs   (bukti `verified in database` hanya untuk Postgres lokal, bukan Supabase)
// Uji draf migration 17, 19, 20 pada Postgres lokal (PGlite). Skema dasar disederhanakan dari init_schema; fungsi hak akses dan audit di-stub.
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import fs from 'node:fs';

import { fileURLToPath } from 'node:url';
const DRAFT = fileURLToPath(new URL('../../supabase/draft/', import.meta.url));
const db = new PGlite({ extensions: { uuid_ossp } });
const R = [];
process.on('exit', () => console.log(R.join(String.fromCharCode(10))));
const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const q = async (sql, params) => (await db.query(sql, params)).rows;
const gagal = async (sql, params) => { try { await db.query(sql, params); return null; } catch (e) { return String(e.message); } };

await db.exec(`
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE TABLE mcustomer (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nama TEXT NOT NULL, aktif BOOLEAN NOT NULL DEFAULT true);
  CREATE TABLE rm (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), item TEXT NOT NULL, ukuran TEXT NOT NULL, satuan TEXT NOT NULL DEFAULT 'pcs', stok_awal NUMERIC NOT NULL DEFAULT 0, buffer NUMERIC DEFAULT 0);
  CREATE TABLE fg (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), stok_awal NUMERIC NOT NULL DEFAULT 0);
  CREATE TABLE mutasi (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), gudang TEXT NOT NULL, item_id UUID NOT NULL, tgl DATE NOT NULL DEFAULT CURRENT_DATE, jenis TEXT NOT NULL, delta NUMERIC NOT NULL, no_dok TEXT, ref TEXT, pihak TEXT, ket TEXT, data JSONB NOT NULL DEFAULT '{}');
  CREATE TABLE spk (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), no TEXT NOT NULL UNIQUE, tgl DATE, customer TEXT, po TEXT, status TEXT NOT NULL DEFAULT 'Terbit', items JSONB NOT NULL DEFAULT '[]', data JSONB NOT NULL DEFAULT '{}');
  CREATE FUNCTION can_view(m text) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
  CREATE FUNCTION can_mod(m text) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
  CREATE FUNCTION audit_row() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NULL; END $$;
  CREATE FUNCTION update_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
`);

// data lama sebelum migration: SPK customer dan SPK stok
const cust = (await q(`INSERT INTO mcustomer (nama) VALUES ('PT Contoh Satu'), ('PT Ganda'), ('PT Ganda') RETURNING id, nama`));
await db.exec(`
  INSERT INTO spk (no, tgl, customer, po, status, data) VALUES
   ('1001', CURRENT_DATE, 'pt contoh satu ', 'PO-1', 'Terbit', '{}'),
   ('1002', CURRENT_DATE, 'STOK 2026', 'STOK-1', 'Terbit', '{"stokReq": true}'),
   ('1003', CURRENT_DATE, 'PT Tidak Ada', '', 'Terbit', '{}'),
   ('1004', CURRENT_DATE, 'PT Ganda', 'PO-4', 'Terbit', '{}');
`);

for (const f of ['20240101000017_stok_tidak_negatif.sql', '20240101000019_spk_peruntukan_materials.sql', '20240101000020_spk_cadangan_bahan.sql']) {
  try { await db.exec(fs.readFileSync(DRAFT + f, 'utf8')); ok('SQL-pasang ' + f, true); } catch (e) { ok('SQL-pasang ' + f, false, String(e.message).slice(0, 400)); console.log(R.join('\n')); process.exit(1); }
}
// pemasangan ulang harus aman (idempoten)
for (const f of ['20240101000019_spk_peruntukan_materials.sql', '20240101000020_spk_cadangan_bahan.sql']) {
  try { await db.exec(fs.readFileSync(DRAFT + f, 'utf8')); ok('SQL-ulang ' + f + ' idempoten', true); } catch (e) { ok('SQL-ulang ' + f + ' idempoten', false, String(e.message).slice(0, 300)); }
}

// ---------- langkah 1: backfill dan batasan ----------
const sp = Object.fromEntries((await q(`SELECT no, peruntukan, customer_id FROM spk`)).map((r) => [r.no, r]));
ok('S1-01 backfill: stokReq -> stok_buffer, lainnya customer', sp['1002'].peruntukan === 'stok_buffer' && sp['1001'].peruntukan === 'customer');
ok('S1-02 backfill customer: cocok persis (abaikan huruf besar dan spasi) tertaut; tidak ada atau ambigu dibiarkan kosong', sp['1001'].customer_id === cust.find((c) => c.nama === 'PT Contoh Satu').id && sp['1003'].customer_id === null && sp['1004'].customer_id === null);
const g1 = await gagal(`INSERT INTO spk (no, customer, po, status) VALUES ('2001', '  ', 'PO', 'Terbit')`);
ok('S1-03 SPK customer terbit tanpa nama customer ditolak; dengan nama (aplikasi lama, tanpa customer_id) diterima dan tertaut otomatis bila namanya cocok', /spk_customer_wajib/.test(g1 || '') && (await gagal(`INSERT INTO spk (no, customer, po, status) VALUES ('2001', 'pt contoh satu', 'PO', 'Terbit')`)) === null && (await q(`SELECT customer_id FROM spk WHERE no='2001'`))[0].customer_id !== null, g1);
const cid = sp['1001'].customer_id;
const g2 = await gagal(`INSERT INTO spk (no, customer, po, status, customer_id) VALUES ('2002', 'X', '', 'Terbit', $1)`, [cid]);
ok('S1-04 tahap sekarang: PO kosong belum ditolak database (wajib PO ditegakkan UI dulu, lalu tahap ketat)', g2 === null, g2);
ok('S1-05 SPK customer Draft tanpa customer dan PO diterima', (await gagal(`INSERT INTO spk (no, customer, status) VALUES ('2003', 'X', 'Draft')`)) === null);
const g3 = await gagal(`INSERT INTO spk (no, customer, status, customer_id, data) VALUES ('2004', 'X', 'Draft', $1, '{"stokReq": true}')`, [cid]);
ok('S1-06 SPK stok dengan customer_id ditolak (pemicu menyelaraskan peruntukan dari stokReq)', /spk_stok_tanpa_customer/.test(g3 || ''), g3);
ok('S1-07 nomor SPK dobel ditolak, nomor bukan angka ditolak', /unique|duplicate/i.test((await gagal(`INSERT INTO spk (no, status) VALUES ('1001', 'Draft')`)) || '') && /spk_no_angka/.test((await gagal(`INSERT INTO spk (no, status) VALUES ('ABC', 'Draft')`)) || ''));
ok('S1-08 status di luar daftar ditolak', /spk_status_valid/.test((await gagal(`INSERT INTO spk (no, status, customer_id, po) VALUES ('2005', 'Proses', '${cid}', 'PO-5')`)) || ''));
const g4 = await gagal(`UPDATE spk SET data = '{"stokReq": true}' WHERE no = '1001'`);
ok('S1-09 peruntukan tidak boleh berubah setelah terbit (SPK 1001 mencoba jadi stok)', /tidak boleh diubah setelah diterbitkan/.test(g4 || ''), g4);
ok('S1-10 nomor tidak boleh berubah setelah terbit; pada Draft boleh', /Nomor SPK/.test((await gagal(`UPDATE spk SET no = '9999' WHERE no = '1001'`)) || '') && (await gagal(`UPDATE spk SET no = '2999' WHERE no = '2003'`)) === null);
ok('S1-11 SPK lama terbit yang customernya tidak ada di master (1003) tetap bisa diubah (aplikasi tidak terkunci)', (await gagal(`UPDATE spk SET po = 'PO-3' WHERE no = '1003'`)) === null);

// ---------- langkah 2: cadangan ----------
const rmA = (await q(`INSERT INTO rm (item, ukuran, stok_awal) VALUES ('Besi', '1.2x1219x2438', 100) RETURNING id`))[0].id;
const rmB = (await q(`INSERT INTO rm (item, ukuran, stok_awal) VALUES ('Besi', '2.0x1219x2438', 10) RETURNING id`))[0].id;
const spkId = async (no) => (await q(`SELECT id FROM spk WHERE no = $1`, [no]))[0].id;
const tersedia = async (rm) => Number((await q(`SELECT tersedia FROM v_rm_ketersediaan WHERE rm_id = $1`, [rm]))[0].tersedia);
const stok = async (rm) => Number((await q(`SELECT public.rm_stok($1) s`, [rm]))[0].s);
const mat = async (spk) => (await q(`SELECT rm_id, status, qty_butuh::float b, qty_dicadangkan::float c, qty_keluar::float k FROM spk_materials WHERE spk_id = $1 ORDER BY rm_id, item_idx NULLS LAST`, [spk]));

await db.exec(`INSERT INTO spk (no, customer, po, status, customer_id) VALUES ('3001', 'PT Contoh Satu', 'PO-31', 'Draft', '${cid}'), ('3002', 'PT Contoh Satu', 'PO-32', 'Draft', '${cid}')`);
const d1 = await spkId('3001'), d2 = await spkId('3002');
await db.query(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx, status, qty_dicadangkan) VALUES ($1,$2,60,0,'dicadangkan',60), ($1,$3,5,1,'rencana',0)`, [d1, rmA, rmB]);
const m1 = await mat(d1);
ok('S2-01 pada SPK Draft baris dipaksa rencana tanpa cadangan; stok dan tersedia tidak berubah', m1.every((m) => m.status === 'rencana' && m.c === 0) && (await tersedia(rmA)) === 100 && (await tersedia(rmB)) === 10, JSON.stringify(m1));

await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [d1]);
const m2 = await mat(d1);
ok('S2-02 Draft -> Terbit mencadangkan semua baris; tersedia turun, stok fisik tetap', m2.every((m) => m.status === 'dicadangkan' && m.c === m.b) && (await tersedia(rmA)) === 40 && (await tersedia(rmB)) === 5 && (await stok(rmA)) === 100, JSON.stringify(m2));

await db.query(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,50,0), ($1,$3,3,1)`, [d2, rmA, rmB]);
const e1 = await gagal(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [d2]);
ok('S2-03 penerbitan ditolak bila satu bahan kurang (A perlu 50, tersedia 40); pesan menyebut bahan; SPK tetap Draft; tidak ada cadangan sebagian', /Stok bahan tidak cukup untuk SPK 3002/.test(e1 || '') && /Besi 1\.2x1219x2438 perlu 50, tersedia 40/.test(e1 || '') && (await q(`SELECT status FROM spk WHERE id=$1`, [d2]))[0].status === 'Draft' && (await mat(d2)).every((m) => m.status === 'rencana') && (await tersedia(rmB)) === 5, e1);

await db.query(`UPDATE spk_materials SET qty_butuh = 40 WHERE spk_id = $1 AND rm_id = $2`, [d2, rmA]);
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [d2]);
ok('S2-04 setelah kebutuhan diturunkan menjadi 40, penerbitan berhasil dan tersedia A = 0', (await tersedia(rmA)) === 0 && (await tersedia(rmB)) === 2, String(await tersedia(rmA)));

ok('S2-05 baris baru pada SPK terbit dengan stok tidak cukup ditolak; cukup diterima langsung dicadangkan', /Stok bahan tidak cukup/.test((await gagal(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,3,2)`, [d2, rmB])) || '') && (await gagal(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,2,2)`, [d2, rmB])) === null && (await tersedia(rmB)) === 0);

// pengeluaran fisik
await db.query(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -30, $2)`, [rmA, JSON.stringify({ spk: d1 })]);
const m3 = (await mat(d1)).find((m) => m.rm_id === rmA);
ok('S2-06 mutasi keluar bertanda SPK menaikkan qty_keluar; tersedia tetap (stok turun, cadangan sisa turun sama besar)', m3.k === 30 && (await stok(rmA)) === 70 && (await tersedia(rmA)) === 0, JSON.stringify(m3) + ' ' + (await tersedia(rmA)));
const kor = (await q(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'koreksi', 10, $2) RETURNING id`, [rmA, JSON.stringify({ spk: d1 })]))[0].id;
const m4 = (await mat(d1)).find((m) => m.rm_id === rmA);
ok('S2-07 koreksi pembalik mengurangi qty_keluar kembali (30 -> 20)', m4.k === 20 && (await tersedia(rmA)) === 0, JSON.stringify(m4));
await db.query(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -50, $2)`, [rmA, JSON.stringify({ spk: d1 })]);
const m5 = (await mat(d1)).find((m) => m.rm_id === rmA);
ok('S2-08 keluar melebihi kebutuhan (total 70 dari 60) tercatat tanpa galat; qty_keluar 70, status dikeluarkan, cadangan sisa 0', m5.k === 70 && m5.status === 'dikeluarkan' && (await stok(rmA)) === 30, JSON.stringify(m5));
ok('S2-09 mutasi keluar tanpa tanda SPK tidak menyentuh spk_materials', (await gagal(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -1, '{}')`, [rmA])) === null && (await mat(d1)).find((m) => m.rm_id === rmA).k === 70);
ok('S2-10 mutasi keluar melebihi stok tetap ditolak oleh draf 17 (tidak diubah oleh sinkron)', /Stok tidak cukup/.test((await gagal(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -9999, '{}')`, [rmA])) || ''));

// batal dan buka lagi
await db.query(`UPDATE spk SET status = 'Batal' WHERE id = $1`, [d2]);
const m6 = await mat(d2);
ok('S2-11 SPK Batal melepas cadangan (status batal) dan tersedia kembali', m6.every((m) => m.status === 'batal') && (await tersedia(rmB)) === 5 - 3 + 0 + 3 - 3 + 3 - 2 + 2 - 0 + 0 || (await tersedia(rmB)) === 5 - 0, JSON.stringify(m6) + ' tersediaB=' + (await tersedia(rmB)));
const eb = await gagal(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [d2]);
ok('S2-12a Batal -> Terbit ditolak bila stok kini kurang (A tinggal 29, perlu 40); status tetap Batal', /Stok bahan tidak cukup/.test(eb || '') && (await q(`SELECT status FROM spk WHERE id=$1`, [d2]))[0].status === 'Batal', eb);
await db.query(`UPDATE spk_materials SET qty_butuh = 29 WHERE spk_id = $1 AND rm_id = $2`, [d2, rmA]);
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [d2]);
ok('S2-12b setelah kebutuhan disesuaikan, Batal -> Terbit mencadangkan ulang semua baris', (await mat(d2)).every((m) => m.status === 'dicadangkan'), JSON.stringify(await mat(d2)));
await db.query(`UPDATE spk SET status = 'Selesai' WHERE id = $1`, [d1]);
const m7 = await mat(d1);
ok('S2-13 SPK Selesai: baris yang sudah keluar jadi dikeluarkan, sisa dilepas', m7.find((m) => m.rm_id === rmA).status === 'dikeluarkan' && m7.find((m) => m.rm_id === rmB).status === 'lepas', JSON.stringify(m7));
ok('S2-14 SPK terbit tidak boleh kembali ke Draft', /tidak boleh dikembalikan ke Draft/.test((await gagal(`UPDATE spk SET status = 'Draft' WHERE id = $1`, [d2])) || ''));
await db.exec(`INSERT INTO spk (no, customer, po, status, customer_id) VALUES ('3003', 'PT Contoh Satu', 'PO-33', 'Draft', '${cid}')`);const d3 = await spkId('3003');await db.query(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,1,0)`, [d3, rmA]);ok('S2-15 baris unik per (SPK, bahan, item): duplikat ditolak; item lain untuk bahan yang sama boleh', /uq_spk_materials_spk_rm_item|duplicate/.test((await gagal(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,1,0)`, [d3, rmA])) || '') && (await gagal(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,1,1)`, [d3, rmA])) === null);
ok('S2-16 qty_butuh nol atau negatif ditolak; cadangan di atas kebutuhan ditolak', /check/i.test((await gagal(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh) VALUES ($1,$2,0)`, [d1, rmA])) || ''));
ok('S2-17 hapus baris spk_materials lewat API tidak ada kebijakan DELETE (RLS aktif)', (await q(`SELECT relrowsecurity FROM pg_class WHERE relname = 'spk_materials'`))[0].relrowsecurity === true && (await q(`SELECT count(*)::int n FROM pg_policies WHERE tablename='spk_materials' AND cmd='DELETE'`))[0].n === 0);


// ---------- regresi temuan tinjauan adversarial (workflow tinjau-draf-sql-cadangan) ----------
await db.exec(`INSERT INTO spk (no, customer, po, status, customer_id) VALUES ('4001', 'PT Contoh Satu', 'PO-41', 'Draft', '${cid}'), ('4002', 'PT Contoh Satu', 'PO-42', 'Draft', '${cid}')`);
const rmC = (await q(`INSERT INTO rm (item, ukuran, stok_awal) VALUES ('Besi', '3.0x1219x2438', 100) RETURNING id`))[0].id;
const x41 = await spkId('4001'), x42 = await spkId('4002');
const tag = (s) => JSON.stringify({ spk: s });
const cadSisa = async (rm) => Number((await q(`SELECT public.rm_cadangan($1) c`, [rm]))[0].c);
// T-01 mutasi bertanda SPK Draft tidak boleh gagal (sebelumnya melanggar CHECK status rencana)
await db.query(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,20,0)`, [x41, rmC]);
ok('T-01 mutasi keluar bertanda SPK Draft berhasil; qty_keluar 5 tercatat, baris tetap rencana', (await gagal(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -5, $2)`, [rmC, tag(x41)])) === null && (await mat(x41))[0].k === 5 && (await mat(x41))[0].status === 'rencana');
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [x41]);
ok('T-02 Draft -> Terbit sesudah sebagian keluar: cadangan hanya sisa (20 - 5 = 15)', (await cadSisa(rmC)) === 15 && (await tersedia(rmC)) === 95 - 15, String(await tersedia(rmC)));
// T-03 SPK Selesai: koreksi mutasi tidak menghidupkan cadangan hantu
await db.query(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -15, $2)`, [rmC, tag(x41)]);
await db.query(`UPDATE spk SET status = 'Selesai' WHERE id = $1`, [x41]);
await db.query(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'koreksi', 4, $2)`, [rmC, tag(x41)]);
const sel = (await mat(x41))[0];
ok('T-03 koreksi sesudah SPK Selesai tidak menghidupkan cadangan hantu (status tetap dikeluarkan, qty_keluar 16, cadangan 0)', sel.status === 'dikeluarkan' && sel.k === 16 && (await cadSisa(rmC)) === 0, JSON.stringify(sel));
// T-04 Selesai -> Terbit mencadangkan ulang yang belum penuh
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [x41]);
const sel2 = (await mat(x41))[0];
ok('T-04 Selesai -> Terbit mencadangkan ulang baris yang belum penuh (butuh 20, keluar 16 -> cadangan sisa 4)', sel2.status === 'dicadangkan' && (await cadSisa(rmC)) === 4, JSON.stringify(sel2));
// T-05, T-06 baris dibatalkan sengaja tidak dihidupkan; baris lepas dihidupkan
await db.query(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,7,0), ($1,$3,2,1)`, [x42, rmC, rmB]);
await db.query(`UPDATE spk_materials SET status = 'batal' WHERE spk_id = $1 AND item_idx = 1`, [x42]);
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [x42]);
await db.query(`UPDATE spk SET status = 'Batal' WHERE id = $1`, [x42]);
const m8 = await mat(x42);
ok('T-05 SPK Batal: baris aktif jadi lepas, baris yang dibatalkan sengaja tetap batal', m8.find((m) => m.b === 7).status === 'lepas' && m8.find((m) => m.b === 2).status === 'batal', JSON.stringify(m8));
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [x42]);
const m9 = await mat(x42);
ok('T-06 Batal -> Terbit: baris lepas dicadangkan ulang, baris batal sengaja tetap batal', m9.find((m) => m.b === 7).status === 'dicadangkan' && m9.find((m) => m.b === 2).status === 'batal', JSON.stringify(m9));
// T-07 menaikkan qty_butuh pada baris dikeluarkan memeriksa stok
await db.query(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -7, $2)`, [rmC, tag(x42)]);
const dk = (await mat(x42)).find((m) => m.b === 7);
const g7 = await gagal(`UPDATE spk_materials SET qty_butuh = 9999 WHERE spk_id = $1 AND item_idx = 0 AND rm_id = $2`, [x42, rmC]);
ok('T-07 baris dikeluarkan penuh (7/7); menaikkan kebutuhan melewati stok ditolak, naik dalam batas dicadangkan lagi', dk.status === 'dikeluarkan' && /Stok bahan tidak cukup/.test(g7 || '') && (await gagal(`UPDATE spk_materials SET qty_butuh = 9 WHERE spk_id = $1 AND item_idx = 0 AND rm_id = $2`, [x42, rmC])) === null && (await mat(x42)).find((m) => m.b === 9).status === 'dicadangkan', g7);
// T-08 klien tidak bisa memalsukan kolom sistem
const gk = [
  await gagal(`UPDATE spk_materials SET qty_keluar = 1 WHERE spk_id = $1`, [x42]),
  await gagal(`UPDATE spk_materials SET qty_dicadangkan = 0 WHERE spk_id = $1`, [x42]),
  await gagal(`UPDATE spk_materials SET rm_id = $2 WHERE spk_id = $1 AND item_idx = 0`, [x42, rmA]),
  await gagal(`UPDATE spk_materials SET spk_id = $2 WHERE spk_id = $1 AND item_idx = 0`, [x42, x41]),
  await gagal(`UPDATE spk_materials SET status = 'dikeluarkan' WHERE spk_id = $1 AND item_idx = 0`, [x42]),
];
ok('T-08 klien tidak bisa mengubah qty_keluar, qty_dicadangkan, rm_id, spk_id, atau menetapkan status dikeluarkan', gk.every((x) => x !== null), JSON.stringify(gk).slice(0, 300));
await db.query(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx, status, qty_keluar, qty_dicadangkan) VALUES ($1,$2,1,5,'dikeluarkan',9,9)`, [x42, rmC]);
const palsu = (await mat(x42)).find((m) => m.rm_id === rmC && m.b === 1);
ok('T-09 INSERT dengan status dikeluarkan dan qty_keluar palsu dinormalkan (qty_keluar 0, status dicadangkan lewat pemeriksaan stok)', palsu && palsu.k === 0 && palsu.status === 'dicadangkan', JSON.stringify(palsu));
ok('T-10 baris yang sudah mengeluarkan bahan tidak bisa dibatalkan pengguna', /tidak bisa dibatalkan/.test((await gagal(`UPDATE spk_materials SET status = 'batal' WHERE spk_id = $1 AND item_idx = 0 AND rm_id = $2`, [x42, rmC])) || ''));
// T-11 mutasi setelah SPK Batal tetap menyinkronkan baris (angka segar saat dibuka lagi)
await db.exec(`INSERT INTO spk (no, customer, po, status, customer_id) VALUES ('4003', 'PT Contoh Satu', 'PO-43', 'Draft', '${cid}')`);
const x43 = await spkId('4003');
await db.query(`INSERT INTO spk_materials (spk_id, rm_id, qty_butuh, item_idx) VALUES ($1,$2,10,0)`, [x43, rmC]);
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [x43]);
await db.query(`UPDATE spk SET status = 'Batal' WHERE id = $1`, [x43]);
await db.query(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'keluar', -6, $2)`, [rmC, tag(x43)]);
await db.query(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('rm', $1, 'koreksi', 6, $2)`, [rmC, tag(x43)]);
await db.query(`UPDATE spk SET status = 'Terbit' WHERE id = $1`, [x43]);
const m10 = (await mat(x43))[0];
ok('T-11 keluar lalu koreksi saat SPK Batal: angka segar saat dibuka lagi (qty_keluar 0, dicadangkan 10)', m10.status === 'dicadangkan' && m10.k === 0 && m10.c === 10, JSON.stringify(m10));
// T-12 pemicu mutasi menyala saat gudang berubah
const mm = (await q(`INSERT INTO mutasi (gudang, item_id, jenis, delta, data) VALUES ('fg', $1, 'keluar', -3, $2) RETURNING id`, [rmC, tag(x43)]))[0].id;
await db.query(`UPDATE mutasi SET gudang = 'rm' WHERE id = $1`, [mm]);
ok('T-12 mutasi yang dipindah ke gudang rm menaikkan qty_keluar (3)', (await mat(x43))[0].k === 3, JSON.stringify((await mat(x43))[0]));
// T-13 fungsi hitung SECURITY INVOKER; fungsi internal tertutup dari klien
const fn = await q(`SELECT proname, prosecdef FROM pg_proc WHERE proname IN ('rm_stok','rm_cadangan')`);
ok('T-13 rm_stok dan rm_cadangan SECURITY INVOKER; fungsi internal dan hitung ulang tertutup dari klien', fn.length === 2 && fn.every((x) => x.prosecdef === false) && (await q(`SELECT has_function_privilege('authenticated', 'public.spk_materials_hitung_ulang(uuid)', 'EXECUTE') a, has_function_privilege('authenticated', 'public._rm_stok_internal(uuid)', 'EXECUTE') b`))[0].a === false);
ok('T-14 hitung ulang massal mengembalikan angka yang sama dengan sinkron berjalan', (await q(`SELECT public.spk_materials_hitung_ulang() n`))[0].n > 0 && (await mat(x43))[0].k === 3);


// ---------- tahap ketat (K-3: PO kosong sah hanya dengan alasan), dipasang di akhir uji ----------
await db.exec(`
  ALTER TABLE public.spk DROP CONSTRAINT IF EXISTS spk_customer_wajib;
  ALTER TABLE public.spk ADD CONSTRAINT spk_customer_wajib
    CHECK (status IN ('Draft', 'Batal', 'Selesai') OR peruntukan <> 'customer'
           OR (customer_id IS NOT NULL AND (btrim(coalesce(po, '')) <> '' OR tanpa_po_alasan IS NOT NULL))) NOT VALID;
`);
const kt1 = await gagal(`INSERT INTO spk (no, customer, po, status, customer_id) VALUES ('5001', 'PT Contoh Satu', '', 'Terbit', $1)`, [cid]);
ok('K-01 tahap ketat: SPK customer terbit tanpa PO dan tanpa alasan ditolak', /spk_customer_wajib/.test(kt1 || ''), kt1);
ok('K-02 tahap ketat: tanpa PO dengan alasan (sampel) diterima; alasan di luar daftar ditolak', (await gagal(`INSERT INTO spk (no, customer, po, status, customer_id, tanpa_po_alasan) VALUES ('5002', 'PT Contoh Satu', '', 'Terbit', $1, 'sampel')`, [cid])) === null && /spk_tanpa_po_alasan_valid/.test((await gagal(`INSERT INTO spk (no, customer, po, status, customer_id, tanpa_po_alasan) VALUES ('5003', 'PT Contoh Satu', '', 'Terbit', $1, 'iseng')`, [cid])) || ''));
ok('K-03 tahap ketat: SPK customer terbit tanpa customer_id (nama tidak cocok master) ditolak; dengan PO dan customer_id diterima; Selesai dan Batal lama tidak terkunci', /spk_customer_wajib/.test((await gagal(`INSERT INTO spk (no, customer, po, status) VALUES ('5004', 'PT Tidak Terdaftar', 'PO-9', 'Terbit')`)) || '') && (await gagal(`INSERT INTO spk (no, customer, po, status, customer_id) VALUES ('5005', 'PT Contoh Satu', 'PO-9', 'Terbit', $1)`, [cid])) === null && (await gagal(`INSERT INTO spk (no, customer, po, status) VALUES ('5006', 'PT Tidak Terdaftar', '', 'Selesai')`)) === null);
ok('K-04 SPK stok buffer tidak terpengaruh tahap ketat (tanpa customer dan PO)', (await gagal(`INSERT INTO spk (no, customer, po, status, data) VALUES ('5007', 'STOK', '', 'Terbit', '{"stokReq": true}')`)) === null);

console.log(R.join('\n'));
const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(`${R.length - fail} PASS, ${fail} FAIL`);
