// Pindahkan data cadangan MNI Gudang ke project Supabase TUJUAN lewat koneksi Postgres langsung, dalam SATU transaksi.
//
//   node scripts/pindah-data.mjs <cadangan.json> --bentuk-ulang                       -> SIMULASI: lakukan semuanya lalu batalkan (tidak ada yang berubah)
//   node scripts/pindah-data.mjs <cadangan.json> --bentuk-ulang --apply --yakin=<ref> -> sungguhan (COMMIT) bila semua pemeriksaan lolos
//   (tanpa DATABASE_URL: hanya menampilkan rencana dari berkas cadangan)
//
// Lingkungan (diisi sendiri saat menjalankan, JANGAN disimpan di berkas atau Git):
//   DATABASE_URL   string koneksi Postgres TUJUAN (Supabase > Connect > Session pooler). Mengandung password.
//
// Pilihan:
//   --bentuk-ulang     hapus objek skema public di tujuan lalu bangun ulang dari migration proyek (skema = production). Menolak bila tujuan
//                      sudah berisi data operasional, kecuali --paksa. Baris muser, master, role_modules, audit_log tujuan disimpan ke berkas dulu.
//   --paksa            izinkan --bentuk-ulang walau tujuan berisi data (mis. staging berisi data uji). Data tujuan itu hilang.
//   --apply            COMMIT. Tanpa ini transaksi selalu dibatalkan (simulasi).
//   --yakin=<ref>      wajib bersama --apply; harus sama dengan ref project di DATABASE_URL.
//
// Jaminan:
//   * Semua langkah dalam satu transaksi: gagal di mana pun = tidak ada perubahan.
//   * Production MNI Gudang ditolak sebagai tujuan (DILARANG). Production tidak pernah dibaca atau ditulis alat ini.
//   * Pemicu pengguna dimatikan hanya selama pemuatan (dalam transaksi) agar audit tidak menggandakan catatan dan pemicu stok tidak menolak
//     urutan baris; dinyalakan lagi sebelum COMMIT.
//   * Sebelum COMMIT: jumlah baris dan sidik isi tiap tabel dibandingkan dengan cadangan; beda = batal.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SB = path.join(DIR, '../supabase/');
export const DILARANG = ['lggqigmvtefkquqjrjsb']; // MNI Gudang - Production

// Migration yang membentuk skema production (urutan sama dengan daftar migration production)
export const MIGRASI = [
  ...fs.readdirSync(SB + 'migrations').filter((f) => /^\d{14}_.*\.sql$/.test(f)).sort().map((f) => 'migrations/' + f),
  'draft/20240101000014_produksi_log.sql', 'draft/20240101000018_sparepart.sql', 'draft/20240101000024_maintenance.sql',
  'draft/20240101000025_hak_modul_ketat.sql', 'draft/20240101000026_table_stamps_cepat.sql',
];

// [tabel, kunci konflik]; urutan aman terhadap kunci asing
export const ORDER = [
  ['muser', 'id'], ['role_modules', 'role,module'], ['master', 'key'], ['mwc', 'id'], ['mvendor', 'id'], ['mcustomer', 'id'],
  ['msupplier', 'id'], ['marmada', 'id'], ['rm', 'id'], ['fg', 'id'], ['sp', 'id'], ['spk', 'id'], ['mtc', 'id'], ['rmhist', 'id'],
  ['pr', 'id'], ['opname', 'id'], ['mutasi', 'id'], ['vendor', 'id'], ['kirim', 'id'], ['bongkar', 'id'], ['produksi_log', 'id'],
  ['uinv', 'id'], ['ureq', 'id'], ['log', 'id'], ['audit_log', 'id'],
];
// Data operasional: tujuan harus kosong pada tabel ini agar --bentuk-ulang tidak membuang data kerja.
const OPERASIONAL = ['spk', 'fg', 'rm', 'sp', 'mutasi', 'vendor', 'kirim', 'bongkar', 'pr', 'opname', 'log', 'mtc', 'mcustomer', 'mvendor', 'msupplier', 'marmada', 'mwc', 'rmhist', 'produksi_log'];
// Disimpan dari tujuan sebelum dibentuk ulang (akun admin tujuan tetap bisa masuk lewat muser)
const SISA = ['muser', 'master', 'role_modules', 'audit_log'];
const MASTER_LEWAT = (k) => String(k).startsWith('lock:') || k === 'backup'; // kunci sementara dan penanda cadangan tiap sistem
const BATAS_BYTE = 3 * 1024 * 1024;

const sql = (db, text) => (typeof db.exec === 'function' ? db.exec(text) : db.query(text));
const q = async (db, text, params) => (await db.query(text, params)).rows;
const adaTabel = async (db, t) => (await q(db, 'select to_regclass($1) r', ['public.' + t]))[0].r !== null;

export function barisDari(backup, t) {
  const rows = backup.data[t] || [];
  return t === 'master' ? rows.filter((x) => !MASTER_LEWAT(x.key)) : rows;
}

// Potong menjadi bagian-bagian maks BATAS_BYTE agar satu parameter tidak terlalu besar (baris bongkar memuat foto).
function bagi(rows) {
  const out = []; let cur = []; let ukuran = 0;
  for (const r of rows) {
    const s = JSON.stringify(r).length;
    if (cur.length && ukuran + s > BATAS_BYTE) { out.push(cur); cur = []; ukuran = 0; }
    cur.push(r); ukuran += s;
  }
  if (cur.length) out.push(cur);
  return out;
}

export async function bersihkanPublic(db) {
  await sql(db, `DO $$ DECLARE r record; BEGIN
    FOR r IN SELECT c.relname n FROM pg_class c WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('v','m') LOOP EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', r.n); END LOOP;
    FOR r IN SELECT c.relname n FROM pg_class c WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r','p') LOOP EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.n); END LOOP;
    FOR r IN SELECT p.oid::regprocedure::text n FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.prokind IN ('f','p')
             AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e') LOOP EXECUTE format('DROP ROUTINE IF EXISTS %s CASCADE', r.n); END LOOP;
    FOR r IN SELECT t.typname n FROM pg_type t WHERE t.typnamespace = 'public'::regnamespace AND t.typtype IN ('e','d')
             AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = t.oid AND d.deptype = 'e') LOOP EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.n); END LOOP;
  END $$;`);
}

// Jalankan seluruh proses di dalam transaksi. opts: { bentukUlang, paksa, apply, lapor(teks), simpanSisa(objek) }
export async function jalankan(db, backup, opts = {}) {
  const lapor = opts.lapor || (() => {});
  const hasil = { tabel: {}, dikomit: false };
  await db.query('BEGIN');
  try {
    // 1. pemeriksaan tujuan
    const berisi = {};
    for (const t of OPERASIONAL) if (await adaTabel(db, t)) { const n = (await q(db, `select count(*)::int n from public.${t}`))[0].n; if (n) berisi[t] = n; }
    if (opts.bentukUlang && Object.keys(berisi).length && !opts.paksa) {
      throw new Error('Tujuan sudah berisi data operasional (' + Object.entries(berisi).map(([t, n]) => `${t}=${n}`).join(', ') + '). Pakai --paksa hanya bila itu data uji yang boleh hilang.');
    }
    if (!opts.bentukUlang && !(await adaTabel(db, 'spk'))) throw new Error('Skema tujuan belum ada. Jalankan dengan --bentuk-ulang.');
    if (!opts.bentukUlang && Object.keys(berisi).length) lapor('PERHATIAN: tujuan sudah berisi data: ' + JSON.stringify(berisi) + ' (baris dengan id sama dilewati, tidak ditimpa)');

    // 2. simpan sisa tujuan lalu bentuk ulang skema
    const sisa = {};
    if (opts.bentukUlang) {
      for (const t of SISA) if (await adaTabel(db, t)) sisa[t] = await q(db, `select * from public.${t}`);
      if (opts.simpanSisa) opts.simpanSisa(sisa);
      lapor('Membentuk ulang skema public dari ' + MIGRASI.length + ' migration…');
      await bersihkanPublic(db);
      for (const f of MIGRASI) { try { await sql(db, fs.readFileSync(SB + f, 'utf8')); } catch (e) { throw new Error(`Migration ${f} gagal: ${e.message}`); } }
    }

    // 3. muat data
    const diharap = {};
    for (const [t, konflik] of ORDER) {
      let rows = barisDari(backup, t);
      if (!(await adaTabel(db, t))) { if (rows.length) throw new Error(`Tabel ${t} tidak ada di tujuan padahal cadangan memuat ${rows.length} baris.`); continue; }
      await db.query(`ALTER TABLE public.${t} DISABLE TRIGGER USER`);
      const pembaruan = t === 'role_modules' ? 'DO UPDATE SET level = EXCLUDED.level' : 'DO NOTHING';
      for (const bag of bagi(rows)) {
        await db.query(`INSERT INTO public.${t} SELECT * FROM jsonb_populate_recordset(NULL::public.${t}, $1::jsonb) ON CONFLICT ${t === 'role_modules' ? `(${konflik}) ` : ''}${pembaruan}`, [JSON.stringify(bag)]);
      }
      // akun admin tujuan yang belum ada di cadangan tetap dipertahankan (agar masih bisa masuk)
      if (t === 'muser' && sisa.muser) {
        const emailBackup = new Set(rows.map((x) => String(x.email).toLowerCase()));
        const tambah = sisa.muser.filter((x) => !emailBackup.has(String(x.email).toLowerCase()));
        if (tambah.length) { await db.query(`INSERT INTO public.muser SELECT * FROM jsonb_populate_recordset(NULL::public.muser, $1::jsonb) ON CONFLICT DO NOTHING`, [JSON.stringify(tambah)]); lapor(`  muser: ${tambah.length} akun tujuan dipertahankan (tidak ada di cadangan)`); }
      }
      diharap[t] = rows.length;
      await db.query(`ALTER TABLE public.${t} ENABLE TRIGGER USER`);
      // urutan identitas/serial
      const punyaId = (await q(db, `select 1 x from information_schema.columns where table_schema = 'public' and table_name = $1 and column_name = 'id'`, [t])).length > 0;
      const seq = punyaId ? (await q(db, `select pg_get_serial_sequence('public.${t}', 'id') s`))[0].s : null;
      if (seq) await db.query(`select setval($1, greatest(coalesce((select max(id) from public.${t}), 1), 1))`, [seq]);
    }

    // 4. verifikasi jumlah dan sidik isi sebelum COMMIT
    const gagal = [];
    for (const [t] of ORDER) {
      if (!(await adaTabel(db, t))) continue;
      const rows = barisDari(backup, t);
      const n = (await q(db, `select count(*)::int n from public.${t}`))[0].n;
      let cocok = true; let ket = '';
      if (t === 'muser') { cocok = n >= rows.length; ket = n > rows.length ? `+${n - rows.length} akun tujuan` : ''; }
      else if (t === 'role_modules') { cocok = n >= rows.length; }
      else cocok = n === rows.length;
      // sidik isi: baris cadangan harus identik di tujuan (dibandingkan per bagian lewat id)
      let sidikOk = true;
      if (rows.length && t !== 'role_modules') {
        const kunci = t === 'master' ? 'key' : 'id';
        for (const bag of bagi(rows)) {
          const r = (await q(db, `select count(*)::int bedaan from (select to_jsonb(r) j, r.${kunci} k from jsonb_populate_recordset(NULL::public.${t}, $1::jsonb) r) a left join public.${t} b on b.${kunci} = a.k where b.${kunci} is null or to_jsonb(b) <> a.j`, [JSON.stringify(bag)]))[0].bedaan;
          if (r) { sidikOk = false; ket += ` ${r} baris berbeda`; break; }
        }
      }
      hasil.tabel[t] = { dari: rows.length, di_tujuan: n, ok: cocok && sidikOk };
      lapor(`  ${t.padEnd(14)} cadangan ${String(rows.length).padStart(5)}  tujuan ${String(n).padStart(5)}  ${cocok && sidikOk ? 'OK' : 'BEDA'}${ket ? '  ' + ket : ''}`);
      if (!(cocok && sidikOk)) gagal.push(t);
    }
    if (gagal.length) throw new Error('Verifikasi gagal pada: ' + gagal.join(', '));

    if (opts.apply) { await db.query('COMMIT'); hasil.dikomit = true; lapor('COMMIT: perubahan tersimpan.'); }
    else { await db.query('ROLLBACK'); lapor('SIMULASI selesai dan semua dibatalkan (ROLLBACK): tidak ada yang berubah di tujuan. Tambahkan --apply --yakin=<ref> untuk menyimpan.'); }
    return hasil;
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch { /* sudah dibatalkan */ }
    e.dibatalkan = true;
    throw e;
  }
}

// ── CLI ───────────────────────────────────────────────────────────────────────
async function cli() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const flag = (n) => args.find((a) => a === `--${n}` || a.startsWith(`--${n}=`));
  const nilai = (n) => { const f = flag(n); return f && f.includes('=') ? f.slice(n.length + 3) : undefined; };
  if (!file) { console.error('Pemakaian: node scripts/pindah-data.mjs <cadangan.json> [--bentuk-ulang] [--paksa] [--apply --yakin=<ref>]'); return 2; }
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (backup.format !== 'mni-gudang-backup' || !backup.data) { console.error('Berkas bukan cadangan MNI Gudang.'); return 2; }
  console.log(`Cadangan dibuat ${backup.dibuat} oleh ${backup.oleh || '-'}`);
  let total = 0;
  for (const [t] of ORDER) { const n = barisDari(backup, t).length; total += n; console.log(`  ${t.padEnd(14)} ${String(n).padStart(5)}${t === 'master' && (backup.data.master || []).length !== n ? `  (${backup.data.master.length - n} dokumen lock:* dan backup dilewati)` : ''}`); }
  console.log(`  jumlah baris   ${total}`);
  for (const t of Object.keys(backup.data)) if (!ORDER.some(([x]) => x === t) && (backup.data[t] || []).length) console.log(`  PERHATIAN: tabel "${t}" (${backup.data[t].length} baris) tidak dipindahkan.`);
  const url = process.env.DATABASE_URL;
  if (!url) { console.log('\nTanpa DATABASE_URL: hanya rencana. Isi DATABASE_URL (string koneksi Session pooler tujuan) untuk simulasi.'); return 0; }
  const ref = ((u) => { try { const x = new URL(u); const m = /^postgres\.([a-z0-9]{20})$/.exec(decodeURIComponent(x.username)) || /^db\.([a-z0-9]{20})\.supabase\.co$/.exec(x.hostname); return m ? m[1] : null; } catch { return null; } })(url);
  if (!ref) { console.error('Tidak bisa membaca ref project dari DATABASE_URL (pakai string Session pooler: postgres.<ref>@...pooler.supabase.com).'); return 2; }
  if (DILARANG.includes(ref) || DILARANG.some((d) => url.includes(d))) { console.error(`DITOLAK: ${ref} adalah project production. Alat ini tidak boleh menyentuh production.`); return 2; }
  const apply = !!flag('apply');
  if (apply && nilai('yakin') !== ref) { console.error(`Tambahkan --yakin=${ref} untuk memastikan project tujuan yang dimaksud.`); return 2; }
  let pg;
  try { pg = (await import('pg')).default; } catch { console.error('Paket "pg" belum terpasang. Jalankan sekali: npm i --no-save pg'); return 2; }
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, statement_timeout: 0 });
  await client.connect();
  console.log(`\nTujuan: project ${ref} · ${apply ? 'SUNGGUHAN (COMMIT)' : 'SIMULASI (dibatalkan di akhir)'}`);
  const tgl = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  try {
    await jalankan(client, backup, {
      bentukUlang: !!flag('bentuk-ulang'), paksa: !!flag('paksa'), apply, lapor: (s) => console.log(s),
      simpanSisa: (sisa) => { if (Object.values(sisa).some((r) => r.length)) { const p = path.join(path.dirname(path.resolve(file)), `sisa-tujuan-${ref}-${tgl}.json`); fs.writeFileSync(p, JSON.stringify(sisa)); console.log('  isi lama tujuan (muser, master, role_modules, audit_log) disimpan: ' + p); } },
    });
    return 0;
  } catch (e) { console.error('\nDIBATALKAN (tidak ada yang berubah di tujuan): ' + e.message); return 1; }
  finally { await client.end(); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await cli();
