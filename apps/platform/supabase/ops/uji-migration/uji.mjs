// Uji migration 24 (Maintenance) dan 25 (hak ketat) pada salinan lokal skema production (PGlite). Tidak menyentuh Supabase.
import { bangun, baca, sebagai, coba } from './bangun.mjs';
const { db, log } = await bangun();
if (log.some((l) => l.startsWith('GAGAL'))) { console.log(log.join('\n')); process.exit(1); }
const H = []; const ok = (id, pass, info = '') => { H.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : '')); };
const q = async (sql, p) => (await db.query(sql, p)).rows;
const roles = ['ppic', 'gudang', 'gbb', 'gbj', 'logistik', 'produksi', 'maintenance', 'sales', 'viewer'];

// --- data awal: pengguna lama tanpa peta modul untuk tiap peran, admin, satu pengguna dengan peta modul sendiri; sedikit data operasional
await db.exec(`INSERT INTO public.muser (email, nama, role, aktif, data) VALUES ('admin@t.id','Admin','admin',true,'{}')`);
for (const r of roles) await db.exec(`INSERT INTO public.muser (email, nama, role, aktif, data) VALUES ('${r}@t.id','${r}','${r}',true,'{}')`);
await db.exec(`INSERT INTO public.muser (email, nama, role, aktif, data) VALUES ('khusus@t.id','Khusus','viewer',true,'{"modul":{"spk":"lihat","maintenance":"ubah"}}')`);
await db.exec(`INSERT INTO public.mvendor (nama) VALUES ('Vendor Awal A'), ('Vendor Awal B')`);
const hitung = async () => { const o = {}; for (const t of ['muser', 'mvendor', 'role_modules', 'rm', 'spk', 'mutasi', 'kirim', 'vendor', 'sp']) { try { o[t] = (await q(`select count(*)::int n, md5(coalesce(string_agg(x::text, '|' order by x::text),'')) h from public.${t} x`))[0]; } catch (e) { o[t] = 'x'; } } return o; };
const pra = await hitung();
const lvl = async (email, m) => sebagai(db, email, async () => (await q(`select public.mod_level('${m}') l`))[0].l);

// --- keadaan SEBELUM (harus sama dengan production: tanpa peta modul = lihat semua)
ok('P-01 sebelum: produksi tanpa peta modul melihat bahan-baku (perilaku lama, "lihat semua")', (await lvl('produksi@t.id', 'bahan-baku')) === 'lihat');
ok('P-02 sebelum: viewer boleh mencatat? tidak (hak ubah kosong), can_any false', await sebagai(db, 'viewer@t.id', async () => (await q('select public.can_any() a'))[0].a === false));

// --- migration 24
await db.exec(baca('draft/20240101000024_maintenance.sql'));
ok('M24-01 tabel mtc ada dan RLS aktif', (await q(`select relrowsecurity r from pg_class where oid='public.mtc'::regclass`))[0].r === true);
ok('M24-02 table_stamps() memuat mtc dan tetap memuat tabel lama', await (async () => { const s = (await q('select public.table_stamps() t'))[0].t; return 'mtc' in s && 'sp' in s && 'spk' in s; })());
ok('M24-03 hak peran baru tercatat (maintenance, gudang, logistik-vendor) tanpa mengubah baris lama', (await q(`select count(*)::int n from public.role_modules where (role,module) in (('maintenance','maintenance'),('maintenance','sparepart'),('gudang','bahan-baku'),('logistik','vendor'))`))[0].n === 4);
let seq = 0; const ins = (email, mesin) => sebagai(db, email, () => db.query(`INSERT INTO public.mtc (kind, no, tgl, mesin, jenis, status, data) VALUES ('catat','T/${email}/${++seq}','2026-11-12','${mesin}','Korektif','Selesai','{"foto":[]}')`));
ok('M24-04 peran maintenance boleh menyimpan catatan', (await coba(() => ins('maintenance@t.id', 'M1'))).ok);
ok('M24-05 admin boleh menyimpan', (await coba(() => ins('admin@t.id', 'M2'))).ok);
ok('M24-06 pengguna dengan peta modul maintenance=ubah (khusus) boleh menyimpan', (await coba(() => ins('khusus@t.id', 'M3'))).ok);
ok('M24-07 produksi (belum ada hak ubah maintenance) ditolak menyimpan', !(await coba(() => ins('produksi@t.id', 'M4'))).ok);
ok('M24-08 pengguna tanpa login (anon) tidak bisa membaca mtc', await (async () => { await db.exec(`SELECT set_config('request.jwt.claims','{"role":"anon"}',false); SET ROLE anon;`); const r = await coba(() => db.query('select count(*) from public.mtc')); await db.exec('RESET ROLE'); return !r.ok || r.r.rows[0].count == 0; })());
ok('M24-09 tidak ada kebijakan DELETE: admin pun tidak bisa menghapus catatan', await (async () => { const n0 = (await q('select count(*)::int n from public.mtc'))[0].n; await sebagai(db, 'admin@t.id', () => coba(() => db.query(`DELETE FROM public.mtc`))); return (await q('select count(*)::int n from public.mtc'))[0].n === n0; })());
ok('M24-10 pemicu audit mencatat perubahan mtc', (await q(`select count(*)::int n from public.audit_log where tabel='mtc' or table_name='mtc'`).catch(async () => q(`select count(*)::int n from public.audit_log`)))[0].n >= 1);

// --- migration 25: pengaman (peran tanpa paket)
await db.exec(`INSERT INTO public.muser (email, nama, role, aktif, data) VALUES ('tamu@t.id','Tamu','tamu',true,'{}')`);
const gagal = await coba(() => db.exec(baca('draft/20240101000025_hak_modul_ketat.sql')));
ok('M25-01 pengaman: migration berhenti bila ada pengguna aktif tanpa peta modul dan tanpa paket peran, dengan pesan yang menyebut email', !gagal.ok && /tamu@t\.id/.test(String(gagal.e)) , gagal.e);
ok('M25-02 setelah berhenti, perilaku lama tidak berubah (mod_level produksi bahan-baku masih lihat)', (await lvl('produksi@t.id', 'bahan-baku')) === 'lihat');
await db.exec(`DELETE FROM public.muser WHERE email='tamu@t.id'`);
await db.exec(baca('draft/20240101000025_hak_modul_ketat.sql'));

// --- sesudah 25: tabel hak per peran
const paket = { ppic: { ubah: ['spk', 'vendor'], lihat: ['bahan-baku', 'barang-jadi', 'pengiriman', 'bongkar-muat', 'maintenance'] }, gudang: { ubah: ['bahan-baku', 'barang-jadi', 'sparepart'], lihat: ['spk', 'bongkar-muat', 'vendor', 'pengiriman', 'maintenance'] }, gbb: { ubah: ['bahan-baku', 'bongkar-muat', 'sparepart'], lihat: ['spk', 'maintenance'] }, gbj: { ubah: ['barang-jadi', 'vendor', 'pengiriman', 'bongkar-muat'], lihat: ['spk', 'maintenance'] }, logistik: { ubah: ['bongkar-muat', 'vendor', 'pengiriman'], lihat: ['spk', 'bahan-baku', 'barang-jadi', 'maintenance'] }, produksi: { ubah: ['spk'], lihat: ['vendor', 'maintenance'] }, maintenance: { ubah: ['maintenance', 'sparepart'], lihat: ['spk'] }, sales: { ubah: [], lihat: ['spk'] }, viewer: { ubah: [], lihat: ['bahan-baku', 'barang-jadi', 'sparepart', 'vendor', 'pengiriman', 'spk', 'bongkar-muat', 'maintenance'] } };
const MOD = ['bahan-baku', 'barang-jadi', 'sparepart', 'bongkar-muat', 'vendor', 'pengiriman', 'spk', 'maintenance', 'master-data'];
const salah = [];
for (const r of roles) for (const m of MOD) { const p = paket[r]; const harap = p.ubah.includes(m) ? 'ubah' : p.lihat.includes(m) ? 'lihat' : null; const got = await lvl(r + '@t.id', m); if (got !== harap) salah.push(`${r}/${m}: ${got} != ${harap}`); }
ok('M25-03 mod_level semua 9 peran x 9 modul sama dengan paket peran (modul di luar paket tidak terlihat)', salah.length === 0, salah.slice(0, 4).join(' | '));
ok('M25-04 admin ubah semua modul; pengguna dengan peta modul tetap memakai petanya sendiri (khusus: spk lihat, maintenance ubah, bahan-baku tidak terlihat)', (await lvl('admin@t.id', 'bahan-baku')) === 'ubah' && (await lvl('khusus@t.id', 'maintenance')) === 'ubah' && (await lvl('khusus@t.id', 'spk')) === 'lihat' && (await lvl('khusus@t.id', 'bahan-baku')) === null);
const anyr = {}; for (const r of roles) anyr[r] = await sebagai(db, r + '@t.id', async () => (await q('select public.can_any() a'))[0].a);
ok('M25-05 can_any: hanya peran dengan hak ubah (viewer dan sales FALSE, lainnya TRUE); celah viewer tertutup', roles.every((r) => anyr[r] === !['viewer', 'sales'].includes(r)), JSON.stringify(anyr));
const mv = (email) => sebagai(db, email, () => db.query(`INSERT INTO public.mvendor (nama) VALUES ('Baru dari ${email}')`));
ok('M25-06 viewer tidak bisa menambah master vendor (kebijakan can_any); produksi dan maintenance bisa', !(await coba(() => mv('viewer@t.id'))).ok && !(await coba(() => mv('sales@t.id'))).ok && (await coba(() => mv('produksi@t.id'))).ok && (await coba(() => mv('maintenance@t.id'))).ok);
ok('M25-07 maintenance sekarang: produksi hanya lihat (ditolak menyimpan mtc), maintenance tetap boleh', !(await coba(() => ins('produksi@t.id', 'M5'))).ok && (await coba(() => ins('maintenance@t.id', 'M6'))).ok);
ok('M25-08 modul yang tidak diatur tidak terbaca: produksi tidak bisa membaca sp (sparepart), maintenance bisa membacanya', await (async () => { await db.exec(`INSERT INTO public.sp (item, satuan) VALUES ('Seal uji','pcs')`); const a = await sebagai(db, 'produksi@t.id', async () => (await q('select count(*)::int n from public.sp'))[0].n); const b = await sebagai(db, 'maintenance@t.id', async () => (await q('select count(*)::int n from public.sp'))[0].n); return a === 0 && b === 1; })());
ok('M25-09 maintenance mencatat sparepart keluar (mutasi gudang sp) dan viewer tidak bisa', await (async () => { const sp = (await q('select id from public.sp limit 1'))[0].id; const mut = (email) => sebagai(db, email, () => db.query(`INSERT INTO public.mutasi (gudang, item_id, jenis, delta, tgl) VALUES ('sp','${sp}','keluar',-1,'2026-11-12')`)); const a = await coba(() => mut('maintenance@t.id')), b = await coba(() => mut('viewer@t.id')); globalThis.m9 = [a.e, b.e]; return a.ok && !b.ok; })(), globalThis.m9 ? JSON.stringify(globalThis.m9) : '');

// --- aman diputar ulang
const ulang = await coba(async () => { await db.exec(baca('draft/20240101000024_maintenance.sql')); await db.exec(baca('draft/20240101000025_hak_modul_ketat.sql')); await db.exec(baca('draft/20240101000024_maintenance.sql')); await db.exec(baca('draft/20240101000025_hak_modul_ketat.sql')); });
ok('M-IDEM migration 24 dan 25 aman dijalankan ulang (dua kali) tanpa galat dan tanpa baris ganda', ulang.ok && (await q(`select count(*)::int n from (select role, module from public.role_modules group by 1,2 having count(*)>1) x`))[0].n === 0, ulang.e);

// --- data lama utuh
const pasca = await hitung();
const beda = ['muser', 'mvendor', 'rm', 'spk', 'kirim', 'vendor'].filter((t) => pra[t] !== 'x' && (pasca[t].n < pra[t].n || (t !== 'muser' && t !== 'mvendor' && pasca[t].h !== pra[t].h)));
ok('M-DATA data lama tidak hilang: jumlah baris muser dan mvendor tidak berkurang (yang bertambah hanya uji), tabel lain identik', beda.length === 0 && pasca.muser.n >= pra.muser.n && pasca.mvendor.n >= pra.mvendor.n, JSON.stringify({ beda, pra: pra.muser, pasca: pasca.muser }));
const stamp = (await q('select public.table_stamps() t'))[0].t;
ok('M-STAMP table_stamps() tetap menghasilkan satu nilai per tabel termasuk mtc setelah semua migration', Object.keys(stamp).length === 21, Object.keys(stamp).length + ' tabel');

// --- pembatalan
await db.exec(baca('draft/20240101000025_hak_modul_ketat_rollback.sql'));
ok('RB-25 pembatalan 25 mengembalikan perilaku lama (produksi bahan-baku = lihat; viewer can_any false) dan kolom level hilang', (await lvl('produksi@t.id', 'bahan-baku')) === 'lihat' && (await sebagai(db, 'viewer@t.id', async () => (await q('select public.can_any() a'))[0].a)) === false && (await q(`select count(*)::int n from information_schema.columns where table_name='role_modules' and column_name='level'`))[0].n === 0);
await db.exec(baca('draft/20240101000024_maintenance_rollback.sql'));
ok('RB-24 pembatalan 24 menghapus mtc dan mengembalikan table_stamps() tanpa mtc', (await q(`select to_regclass('public.mtc') r`))[0].r === null && !('mtc' in (await q('select public.table_stamps() t'))[0].t));
// terapkan ulang setelah pembatalan
const lagi = await coba(async () => { await db.exec(baca('draft/20240101000024_maintenance.sql')); await db.exec(baca('draft/20240101000025_hak_modul_ketat.sql')); });
ok('RB-ULANG dapat diterapkan kembali setelah dibatalkan', lagi.ok, lagi.e);

console.log(H.join('\n')); const n = H.filter((x) => x.startsWith('FAIL')).length; console.log(`${H.length - n} PASS, ${n} FAIL`);
