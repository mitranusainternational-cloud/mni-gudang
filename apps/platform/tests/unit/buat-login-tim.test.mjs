// Uji alat buat-login-tim.  node tests/unit/buat-login-tim.test.mjs
// Server Supabase tiruan di localhost dan data rekaan: tidak menyentuh jaringan luar atau data nyata.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKRIP = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../scripts/buat-login-tim.mjs');
const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mni-login-'));

const muser = [
  { email: 'ada@contoh.id', nama: 'Sudah Ada', role: 'admin', aktif: true },
  { email: 'Baru1@contoh.id', nama: 'Baru Satu', role: 'ppic', aktif: true },
  { email: 'baru2@contoh.id', nama: 'Baru Dua', role: 'gbb', aktif: true },
  { email: 'gagal@contoh.id', nama: 'Akan Gagal', role: 'viewer', aktif: true },
  { email: 'balapan@contoh.id', nama: 'Sudah Dibuat Orang Lain', role: 'logistik', aktif: true },
];
let permintaan = [];
const server = http.createServer((req, res) => {
  const chunks = []; req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : null;
    permintaan.push({ m: req.method, u: req.url, body, auth: req.headers.authorization });
    const j = (s, o) => { res.writeHead(s, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    if (req.method === 'GET' && req.url.startsWith('/rest/v1/muser')) return j(200, muser);
    if (req.method === 'GET' && req.url.startsWith('/auth/v1/admin/users')) return j(200, { users: [{ email: 'ADA@contoh.id' }] }); // beda huruf besar
    if (req.method === 'POST' && req.url === '/auth/v1/admin/users') {
      if (body.email === 'gagal@contoh.id') return j(500, { msg: 'galat uji' });
      if (body.email === 'balapan@contoh.id') return j(422, { msg: 'A user with this email address has already been registered' });
      return j(200, { id: 'x', email: body.email });
    }
    j(404, {});
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL_UJI = `http://localhost:${server.address().port}`;
const jalan = (argv, env = {}) => new Promise((resolve) => {
  const p = spawn(process.execPath, [SKRIP, ...argv], { env: { ...process.env, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ...env } });
  let out = ''; let err = ''; p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { err += d; });
  p.on('close', (code) => resolve({ code, out, err }));
});
const KUNCI = { SUPABASE_URL: URL_UJI, SUPABASE_SERVICE_ROLE_KEY: 'kunci-uji-rahasia' };
const posts = () => permintaan.filter((x) => x.m === 'POST');

let r = await jalan([], KUNCI);
ok('L-01 simulasi: tidak ada akun dibuat dan hanya yang belum punya login dilaporkan', r.code === 0 && posts().length === 0 && /belum punya login: 4/.test(r.out) && !/ada@contoh/i.test(r.out.split('belum punya login')[1] || ''), r.out.split('\n')[1]);
r = await jalan(['--apply', '--yakin=lggqigmvtefkquqjrjsb'], { SUPABASE_URL: 'https://lggqigmvtefkquqjrjsb.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'x' });
ok('L-02 production ditolak', r.code === 2 && /DITOLAK/.test(r.err));
permintaan = [];
r = await jalan(['--apply'], KUNCI);
ok('L-03 --apply tanpa --yakin ditolak dan tidak membuat apa pun', r.code === 2 && posts().length === 0);
r = await jalan([], {});
ok('L-04 tanpa lingkungan ditolak', r.code === 2);

permintaan = [];
const csvPath = path.join(dir, 'akun.csv');
r = await jalan(['--apply', '--yakin=localhost', '--keluar=' + csvPath], KUNCI);
const dibuat = posts().map((x) => x.body.email);
ok('L-05 hanya pengguna tanpa login yang dibuat (akun lama beda huruf besar tidak disentuh)', JSON.stringify(dibuat.sort()) === JSON.stringify(['baru1@contoh.id', 'baru2@contoh.id', 'balapan@contoh.id', 'gagal@contoh.id'].sort()), dibuat.join(','));
ok('L-06 galat satu pengguna tidak menghentikan yang lain; kode keluar 1', r.code === 1 && /GAGAL\s+gagal@contoh.id/.test(r.err) && dibuat.includes('baru2@contoh.id'));
ok('L-07 akun yang ternyata sudah ada (balapan) dilewati, bukan dianggap gagal', /dilewati \(sudah ada\) balapan@contoh.id/.test(r.out));
const sandiDipakai = posts().filter((x) => /baru/.test(x.body.email)).map((x) => x.body.password);
ok('L-08 password acak: 14 karakter berformat xxxx-xxxx-xxxx, huruf besar+kecil+angka, berbeda tiap akun', sandiDipakai.length === 2 && sandiDipakai.every((p) => /^[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}$/.test(p) && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[2-9]/.test(p)) && new Set(sandiDipakai).size === 2, sandiDipakai.length + ' sandi');
ok('L-09 email_confirm aktif (tidak butuh SMTP) dan memakai kunci service-role', posts().every((x) => x.body.email_confirm === true && x.auth === 'Bearer kunci-uji-rahasia'));
ok('L-10 password TIDAK tercetak di layar (stdout dan stderr)', sandiDipakai.every((p) => !r.out.includes(p) && !r.err.includes(p)) && !r.out.includes('kunci-uji-rahasia') && !r.err.includes('kunci-uji-rahasia'));
const isi = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, 'utf8') : '';
ok('L-11 berkas CSV memuat password sementara tiap akun yang dibuat dan status yang gagal', sandiDipakai.every((p) => isi.includes(p)) && /GAGAL/.test(isi) && isi.toLowerCase().includes('baru1@contoh.id'));
ok('L-12 berkas CSV default berada di data/private-sources (diabaikan Git)', /private-sources/.test(fs.readFileSync(SKRIP, 'utf8')));

server.close();

// ── Jalur password lama dari sumber (hash bcrypt rekaan) ─────────────────────────────────────────────────────────────
const hashRekaan = (s) => '$2a$10$' + s.padEnd(53, 'x').slice(0, 53);
const H1 = hashRekaan('HASHRAHASIA1'); const H2 = hashRekaan('HASHRAHASIA2'); const H3 = hashRekaan('HASHDITOLAKAPI');
const muser2 = [
  { email: 'lama1@contoh.id', nama: 'Lama Satu', role: 'ppic', aktif: true },
  { email: 'lama2@contoh.id', nama: 'Lama Dua', role: 'gbb', aktif: true },
  { email: 'tolak@contoh.id', nama: 'Hash Ditolak', role: 'viewer', aktif: true },
  { email: 'tanpa@contoh.id', nama: 'Tanpa Sumber', role: 'logistik', aktif: true },
  { email: 'rusak@contoh.id', nama: 'Hash Rusak', role: 'maintenance', aktif: true },
];
const sumberJson = path.join(dir, 'sumber.json');
fs.writeFileSync(sumberJson, JSON.stringify([
  { email: 'LAMA1@contoh.id', encrypted_password: H1 }, { email: 'lama2@contoh.id', encrypted_password: H2 }, { email: 'tolak@contoh.id', encrypted_password: H3 },
  { email: 'rusak@contoh.id', encrypted_password: 'bukan-bcrypt' }, { email: 'bukanmuser@contoh.id', encrypted_password: hashRekaan('ORANGLAIN') },
]));
let permintaan2 = [];
const server2 = http.createServer((req, res) => {
  const chunks = []; req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : null;
    permintaan2.push({ m: req.method, u: req.url, body });
    const j = (s, o) => { res.writeHead(s, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    if (req.method === 'GET' && req.url.startsWith('/rest/v1/muser')) return j(200, muser2);
    if (req.method === 'GET' && req.url.startsWith('/auth/v1/admin/users')) return j(200, { users: [] });
    if (req.method === 'POST' && req.url === '/auth/v1/admin/users') {
      if (body.password_hash && body.email === 'tolak@contoh.id') return j(400, { msg: 'password_hash tidak didukung' });
      return j(200, { id: 'x', email: body.email });
    }
    j(404, {});
  });
});
await new Promise((r) => server2.listen(0, '127.0.0.1', r));
const K2 = { SUPABASE_URL: `http://localhost:${server2.address().port}`, SUPABASE_SERVICE_ROLE_KEY: 'kunci-uji-2' };
const posts2 = () => permintaan2.filter((x) => x.m === 'POST');

r = await jalan(['--sumber-json=' + sumberJson], K2);
ok('M-01 simulasi dengan sumber: melaporkan berapa yang memakai password lama dan tidak membuat apa pun', r.code === 0 && posts2().length === 0 && /3 akan memakai PASSWORD LAMA yang sama, 2 tidak punya akun/.test(r.out.replace(/\s+/g, ' ')), r.out.split('\n').find((l) => /Dari sumber/.test(l)));
permintaan2 = [];
const csv2 = path.join(dir, 'akun2.csv');
r = await jalan(['--apply', '--yakin=localhost', '--sumber-json=' + sumberJson, '--keluar=' + csv2], K2);
const p = (e) => posts2().filter((x) => x.body.email === e);
ok('M-02 pengguna dengan hash dibuat memakai password_hash PERSIS dari sumber (huruf besar email diabaikan) dan tanpa field password', p('lama1@contoh.id').length === 1 && p('lama1@contoh.id')[0].body.password_hash === H1 && !('password' in p('lama1@contoh.id')[0].body) && p('lama2@contoh.id')[0].body.password_hash === H2);
ok('M-03 hash yang ditolak API jatuh ke password sementara (dua permintaan: hash lalu password)', p('tolak@contoh.id').length === 2 && 'password_hash' in p('tolak@contoh.id')[0].body && typeof p('tolak@contoh.id')[1].body.password === 'string' && !('password_hash' in p('tolak@contoh.id')[1].body));
ok('M-04 pengguna tanpa hash valid di sumber (tidak ada, atau bukan bcrypt) langsung memakai password sementara', p('tanpa@contoh.id').length === 1 && typeof p('tanpa@contoh.id')[0].body.password === 'string' && p('rusak@contoh.id').length === 1 && typeof p('rusak@contoh.id')[0].body.password === 'string');
ok('M-05 orang di sumber yang bukan pengguna muser tidak dibuat', posts2().every((x) => x.body.email !== 'bukanmuser@contoh.id'));
const semuaHash = [H1, H2, H3, hashRekaan('ORANGLAIN')];
const isi2 = fs.existsSync(csv2) ? fs.readFileSync(csv2, 'utf8') : '';
ok('M-06 HASH tidak tercetak di layar dan tidak ditulis ke CSV', semuaHash.every((h) => !r.out.includes(h) && !r.err.includes(h) && !isi2.includes(h)));
ok('M-07 CSV: akun password lama tanpa isi password dan berstatus LAMA; akun sementara memuat passwordnya', /lama1@contoh.id","Lama Satu","ppic","","dibuat · password LAMA/.test(isi2) && /tolak@contoh.id/.test(isi2) && /password sementara/.test(isi2));
ok('M-08 ringkasan: 2 akun password lama, 3 password sementara, kode keluar 0', r.code === 0 && /2 akun dengan password lama, 3 dengan password sementara, 0 gagal/.test(r.out), r.out.split('\n').find((l) => /Selesai/.test(l)));
permintaan2 = [];
r = await jalan(['--apply', '--yakin=localhost'], { ...K2, SUMBER_DATABASE_URL: 'postgresql://bukan-supabase:x@localhost:5432/postgres' });
ok('M-09 SUMBER_DATABASE_URL yang tidak dikenali ditolak sebelum membuat akun apa pun', r.code === 1 && posts2().length === 0 && /SUMBER_DATABASE_URL tidak bisa dibaca/.test(r.err));
r = await jalan(['--apply', '--yakin=localhost'], { ...K2, SUMBER_DATABASE_URL: 'postgresql://postgres.abcdefghijklmnopqrst:x@h:5432/postgres' });
ok('M-10 tanpa paket pg atau koneksi gagal: berhenti dengan pesan jelas, tidak membuat akun', r.code === 1 && posts2().length === 0);
server2.close();

console.log(R.join('\n'));
const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(`\n${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
