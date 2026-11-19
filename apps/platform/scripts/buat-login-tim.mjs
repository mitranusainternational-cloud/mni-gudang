// Buat akun login (Auth) untuk pengguna aktif di tabel muser yang belum punya login, di project Supabase TUJUAN.
// Dipakai setelah data dipindah (muser ikut tersalin, tetapi akun login tidak).
//
//   node scripts/buat-login-tim.mjs                         -> SIMULASI: hanya menampilkan siapa yang akan dibuatkan
//   node scripts/buat-login-tim.mjs --apply --yakin=<ref>   -> membuat akun
//
// Lingkungan (isi sendiri saat menjalankan, JANGAN disimpan di berkas atau Git):
//   SUPABASE_URL                 mis. https://xxxx.supabase.co   (project TUJUAN)
//   SUPABASE_SERVICE_ROLE_KEY    kunci service-role project TUJUAN
//   SUMBER_DATABASE_URL          (opsional) string koneksi Postgres project SUMBER (production) HANYA UNTUK DIBACA.
//                                Bila diisi, pengguna yang punya akun di sumber dibuatkan dengan PASSWORD LAMA YANG SAMA
//                                (hash bcrypt disalin langsung ke tujuan, tidak pernah dicetak). Tanpa ini, semua dapat password sementara acak.
//   --sumber-json=<berkas>       (opsional, untuk uji) daftar [{email, encrypted_password}] sebagai pengganti SUMBER_DATABASE_URL.
//
// Jaminan:
//   * Menolak production MNI Gudang sebagai tujuan. Hanya MEMBUAT akun yang belum ada; akun yang sudah ada tidak diubah, passwordnya tidak diganti.
//   * Sumber hanya dibaca (SELECT email, encrypted_password FROM auth.users WHERE email = ANY(...)); tidak pernah ditulis.
//   * Hash password lama TIDAK pernah dicetak ke layar dan TIDAK ditulis ke berkas. Hanya dikirim ke tujuan lewat API Auth (password_hash).
//   * Password sementara (untuk yang tidak punya akun di sumber, atau bila impor hash ditolak) dibuat acak di komputer ini dan HANYA ditulis ke
//     berkas CSV (data/private-sources, diabaikan Git), tidak pernah dicetak ke layar.
//   * Email dianggap sudah terverifikasi (email_confirm) sehingga tidak butuh SMTP.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DILARANG = ['lggqigmvtefkquqjrjsb']; // MNI Gudang - Production
const args = process.argv.slice(2);
const flag = (n) => args.find((a) => a === `--${n}` || a.startsWith(`--${n}=`));
const nilai = (n) => { const f = flag(n); return f && f.includes('=') ? f.slice(n.length + 3) : undefined; };
const apply = !!flag('apply');

const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di lingkungan terlebih dulu.'); process.exit(2); }
let ref;
try { ref = new URL(url).hostname.split('.')[0]; } catch { console.error('SUPABASE_URL tidak valid.'); process.exit(2); }
if (DILARANG.includes(ref)) { console.error(`DITOLAK: ${ref} adalah project production. Alat ini tidak boleh menulis ke production.`); process.exit(2); }
if (apply && nilai('yakin') !== ref) { console.error(`Tambahkan --yakin=${ref} untuk memastikan project tujuan yang dimaksud.`); process.exit(2); }

const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const ABJAD = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa karakter yang mudah tertukar (l, I, 1, O, 0)
function sandi() {
  const pilih = (s) => s[crypto.randomInt(s.length)];
  for (;;) {
    const p = Array.from({ length: 12 }, () => pilih(ABJAD)).join('');
    if (/[a-z]/.test(p) && /[A-Z]/.test(p) && /[2-9]/.test(p)) return p.slice(0, 4) + '-' + p.slice(4, 8) + '-' + p.slice(8);
  }
}
const csv = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
const HASH_OK = /^\$2[aby]\$\d{2}\$.{53}$/; // bcrypt

// Muat hash password lama dari sumber (hanya baca). Mengembalikan Map email(huruf kecil) -> hash.
async function muatSandiLama(emails) {
  const peta = new Map();
  const json = nilai('sumber-json');
  if (json) {
    for (const x of JSON.parse(fs.readFileSync(json, 'utf8'))) if (x.email && HASH_OK.test(String(x.encrypted_password || ''))) peta.set(String(x.email).toLowerCase(), x.encrypted_password);
    return peta;
  }
  const dsn = process.env.SUMBER_DATABASE_URL;
  if (!dsn) return peta;
  let refSumber = null;
  try { const u = new URL(dsn); const m = /^postgres\.([a-z0-9]{20})$/.exec(decodeURIComponent(u.username)) || /^db\.([a-z0-9]{20})\.supabase\.co$/.exec(u.hostname); refSumber = m ? m[1] : null; } catch { /* ditangani di bawah */ }
  if (!refSumber) throw new Error('SUMBER_DATABASE_URL tidak bisa dibaca (pakai string Session pooler: postgres.<ref>@...pooler.supabase.com).');
  if (refSumber === ref) throw new Error('Sumber dan tujuan adalah project yang sama.');
  let pg;
  try { pg = (await import('pg')).default; } catch { throw new Error('Paket "pg" belum terpasang. Jalankan sekali: npm i --no-save pg'); }
  const c = new pg.Client({ connectionString: dsn, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    await c.query('SET default_transaction_read_only = on'); // sumber hanya dibaca
    const r = await c.query('select lower(email) as e, encrypted_password as h from auth.users where lower(email) = any($1)', [emails.map((x) => x.toLowerCase())]);
    for (const row of r.rows) if (HASH_OK.test(String(row.h || ''))) peta.set(row.e, row.h);
  } finally { await c.end(); }
  return peta;
}

async function main() {
  const r = await fetch(`${url}/rest/v1/muser?select=email,nama,role,aktif&aktif=eq.true&order=email`, { headers: H });
  if (!r.ok) { console.error(`GAGAL membaca muser: ${r.status} ${(await r.text()).slice(0, 200)}`); return 1; }
  const muser = await r.json();

  const ada = new Set();
  for (let page = 1; page <= 50; page++) {
    const a = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, { headers: H });
    if (!a.ok) { console.error(`GAGAL membaca akun login: ${a.status} ${(await a.text()).slice(0, 200)}`); return 1; }
    const j = await a.json();
    const daftar = Array.isArray(j) ? j : (j.users || []);
    daftar.forEach((u) => ada.add(String(u.email || '').toLowerCase()));
    if (daftar.length < 200) break;
  }

  const perlu = muser.filter((m) => !ada.has(String(m.email).toLowerCase()));
  let sandiLama = new Map();
  if (perlu.length) { try { sandiLama = await muatSandiLama(perlu.map((m) => m.email)); } catch (e) { console.error('GAGAL membaca sumber password lama: ' + e.message); return 1; } }
  const adaSumber = !!(nilai('sumber-json') || process.env.SUMBER_DATABASE_URL);
  const punyaLama = perlu.filter((m) => sandiLama.has(String(m.email).toLowerCase()));

  console.log(`Project tujuan: ${ref} · ${apply ? 'SUNGGUHAN' : 'SIMULASI'}`);
  console.log(`Pengguna aktif: ${muser.length} · sudah punya login: ${muser.length - perlu.length} · belum punya login: ${perlu.length}`);
  if (adaSumber) console.log(`Dari sumber: ${punyaLama.length} akan memakai PASSWORD LAMA yang sama, ${perlu.length - punyaLama.length} tidak punya akun di sumber (password sementara acak).`);
  else console.log('Tanpa sumber password lama: semua yang dibuat mendapat password sementara acak.');
  for (const m of perlu) console.log(`  ${m.role.padEnd(12)} ${m.email}  ${sandiLama.has(String(m.email).toLowerCase()) ? '[password lama]' : '[password sementara]'}`);
  if (!perlu.length) { console.log('Semua pengguna aktif sudah punya login.'); return 0; }
  if (!apply) { console.log('\nSimulasi selesai: tidak ada akun yang dibuat. Tambahkan --apply --yakin=<ref> untuk membuatnya.'); return 0; }

  const tgl = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const rootData = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../data/private-sources');
  fs.mkdirSync(rootData, { recursive: true });
  const berkas = nilai('keluar') || path.join(rootData, `akun-tim-${ref}-${tgl}.csv`);
  const baris = [['email', 'nama', 'peran', 'password_sementara', 'status'].map(csv).join(',')];
  let lama = 0; let sementara = 0; let gagal = 0;
  const buat = (body) => fetch(`${url}/auth/v1/admin/users`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  for (const m of perlu) {
    const email = String(m.email).toLowerCase();
    const dasar = { email, email_confirm: true, user_metadata: { nama: m.nama } };
    const hash = sandiLama.get(email);
    let res; let pakaiLama = false;
    if (hash) { res = await buat({ ...dasar, password_hash: hash }); pakaiLama = res.ok; }
    let pw = '';
    if (!res || (!res.ok && !/already|registered|exists/i.test((await res.clone().text()).slice(0, 200)))) { // tanpa hash, atau impor hash ditolak: password sementara
      pw = sandi(); res = await buat({ ...dasar, password: pw });
    }
    if (res.ok) {
      if (pakaiLama) { lama++; baris.push([m.email, m.nama, m.role, '', 'dibuat · password LAMA sama dengan sumber'].map(csv).join(',')); console.log(`  dibuat  ${m.email}  [password lama]`); }
      else { sementara++; baris.push([m.email, m.nama, m.role, pw, 'dibuat · password sementara'].map(csv).join(',')); console.log(`  dibuat  ${m.email}  [password sementara]`); }
    } else {
      const t = (await res.text()).slice(0, 160);
      if (/already|registered|exists/i.test(t)) { baris.push([m.email, m.nama, m.role, '', 'sudah ada'].map(csv).join(',')); console.log(`  dilewati (sudah ada) ${m.email}`); }
      else { gagal++; baris.push([m.email, m.nama, m.role, '', 'GAGAL: ' + t].map(csv).join(',')); console.error(`  GAGAL   ${m.email}: ${res.status} ${t}`); }
    }
  }
  fs.writeFileSync(berkas, '﻿' + baris.join('\r\n') + '\r\n', { mode: 0o600 });
  console.log(`\nSelesai: ${lama} akun dengan password lama, ${sementara} dengan password sementara, ${gagal} gagal.`);
  if (sementara || gagal) console.log(`Daftar dan password sementara ada di:\n  ${berkas}\n(berkas ini rahasia; bagikan lewat jalur pribadi, lalu hapus. Tiap orang mengganti passwordnya setelah masuk.)`);
  else console.log(`Catatan hasil (tanpa password) ada di:\n  ${berkas}`);
  return gagal ? 1 : 0;
}
process.exitCode = await main();
