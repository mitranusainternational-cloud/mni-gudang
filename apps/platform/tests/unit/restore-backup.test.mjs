// Uji skrip pulih cadangan.  node tests/unit/restore-backup.test.mjs
// Memakai server PostgREST tiruan di localhost dan data rekaan: tidak menyentuh jaringan luar atau data nyata.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKRIP = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../scripts/restore-backup.mjs');
const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));

// Data rekaan. Mutasi sengaja tidak berurutan: keluar (-5) ditulis lebih dulu daripada masuk (+10).
const fixture = {
  format: 'mni-gudang-backup', dibuat: '2026-01-01T00:00:00Z', oleh: 'uji',
  data: {
    muser: [{ id: 'u1', email: 'ada@contoh.id' }, { id: 'u2', email: 'baru@contoh.id' }],
    role_modules: [{ role: 'gudang', module: 'rm' }],
    // lock:* (kunci sementara) dan backup (penanda tiap sistem) tidak ikut; penghitung nomor dan pengaturan ikut
    master: [{ key: 'setting' }, { key: 'lock:lock:new-1' }, { key: 'backup' }, { key: 'SJ-202611' }],
    // tujuan sudah punya K1 (id x0, beda) dan K3 (id w3, sama): K1 dilewati, K3 dan K2 ditulis
    mwc: [{ id: 'w1', kode: 'K1' }, { id: 'w2', kode: 'K2' }, { id: 'w3', kode: 'K3' }],
    rm: [{ id: 'r1' }],
    sp: [{ id: 's1' }],
    spk: [{ id: 'k1' }],
    mtc: [{ id: 'm1' }],
    mutasi: [
      { id: 'b', created_at: '2026-01-03T00:00:00Z', delta: -5 },
      { id: 'a', created_at: '2026-01-01T00:00:00Z', delta: 10 },
      { id: 'c', created_at: '2026-01-02T00:00:00Z', delta: -1 },
    ],
    penawaran: [{ id: 'p1' }],
  },
};
const berkas = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mni-restore-')), 'cadangan.json');
fs.writeFileSync(berkas, JSON.stringify(fixture));

let permintaan = [];
let gagalDi = null;
const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : null;
    permintaan.push({ method: req.method, url: req.url, body });
    if (req.method === 'GET') {
      const ada = req.url.startsWith('/rest/v1/muser') ? [{ email: 'ADA@contoh.id' }]
        : req.url.startsWith('/rest/v1/mwc') ? [{ id: 'x0', kode: 'K1' }, { id: 'w3', kode: 'K3' }] : [];
      res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(ada));
    }
    if (gagalDi && req.url.startsWith(`/rest/v1/${gagalDi}?`)) { res.writeHead(500); return res.end('galat uji'); }
    res.writeHead(201); res.end();
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const URL_UJI = `http://localhost:${port}`;

const jalan = (argv, env = {}) => new Promise((resolve) => {
  const p = spawn(process.execPath, [SKRIP, ...argv], { env: { ...process.env, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ...env } });
  let out = ''; let err = '';
  p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { err += d; });
  p.on('close', (code) => resolve({ code, out, err }));
});
const tabelDitulis = () => permintaan.filter((x) => x.method === 'POST').map((x) => x.url.split('?')[0].replace('/rest/v1/', ''));
const KUNCI = { SUPABASE_URL: URL_UJI, SUPABASE_SERVICE_ROLE_KEY: 'kunci-uji' };

// S-01 uji kering: tidak menulis, melaporkan tabel di luar cakupan
let r = await jalan([berkas]);
ok('S-01 uji kering sukses dan tanpa permintaan jaringan', r.code === 0 && permintaan.length === 0 && /jumlah baris/.test(r.out));
ok('S-02 tabel di luar cakupan dilaporkan, bukan diam-diam dilewati', /PERHATIAN: tabel "penawaran"/.test(r.out) && /di luar lingkup WMS/.test(r.out));
ok('S-03 role_modules ditandai dilewati bawaan', /role_modules\s+1\s+\(dilewati/.test(r.out));

// S-04..S-06 penjagaan tujuan
r = await jalan([berkas, '--apply']);
ok('S-04 --apply tanpa SUPABASE_URL ditolak', r.code === 2);
r = await jalan([berkas, '--apply', '--yakin=lggqigmvtefkquqjrjsb'], { SUPABASE_URL: 'https://lggqigmvtefkquqjrjsb.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'x' });
ok('S-05 production ditolak walau --yakin cocok', r.code === 2 && /DITOLAK/.test(r.err));
permintaan = [];
r = await jalan([berkas, '--apply'], KUNCI);
ok('S-06 tanpa --yakin ditolak dan tidak menulis', r.code === 2 && /--yakin=localhost/.test(r.err) && permintaan.length === 0);
r = await jalan([berkas, '--apply', '--yakin=salah'], KUNCI);
ok('S-07 --yakin yang salah ditolak', r.code === 2 && permintaan.length === 0);

// S-08..S-13 tulis ke tujuan tiruan
permintaan = [];
r = await jalan([berkas, '--apply', '--yakin=localhost'], KUNCI);
const tulis = tabelDitulis();
ok('S-08 pulih sukses', r.code === 0, r.err.slice(0, 120));
ok('S-09 urutan tabel mengikuti kunci asing; sp dan mtc ikut dipulihkan', JSON.stringify(tulis) === JSON.stringify(['muser', 'master', 'mwc', 'rm', 'sp', 'spk', 'mtc', 'mutasi']), tulis.join(','));
ok('S-10 role_modules tidak ditulis bawaan', !tulis.includes('role_modules'));
const mu = permintaan.find((x) => x.method === 'POST' && x.url.startsWith('/rest/v1/muser'));
ok('S-11 pengguna yang emailnya sudah ada dilewati (tanpa beda huruf besar)', mu && mu.body.length === 1 && mu.body[0].email === 'baru@contoh.id');
const mt = permintaan.find((x) => x.method === 'POST' && x.url.startsWith('/rest/v1/mutasi'));
ok('S-12 mutasi ditulis urut waktu (masuk sebelum keluar)', mt && mt.body.map((x) => x.id).join('') === 'acb', mt && mt.body.map((x) => x.id).join(''));
ok('S-13 tidak ada permintaan yang menghapus data', permintaan.every((x) => x.method !== 'DELETE' && x.method !== 'PATCH'));
ok('S-14 kunci konflik per tabel benar', permintaan.some((x) => x.url === '/rest/v1/master?on_conflict=key') && permintaan.some((x) => x.url === '/rest/v1/sp?on_conflict=id'));

// S-19 bentrok kunci unik (mis. kode Work Centre bawaan tujuan): dilewati dan dilaporkan, id sama tetap diperbarui
const wc = permintaan.find((x) => x.method === 'POST' && x.url.startsWith('/rest/v1/mwc'));
ok('S-19 mwc: kode sudah dipakai id lain dilewati, id sama dan kode baru ditulis', wc && wc.body.map((x) => x.id).join(',') === 'w2,w3', wc && wc.body.map((x) => x.id).join(','));
ok('S-20 bentrok dilaporkan dengan nilainya', /mwc\s+1 baris DILEWATI \(kode sudah ada di tujuan dengan id berbeda\): K1/.test(r.out), r.out.split('\n').find((l) => /DILEWATI/.test(l)) || 'tidak ada baris laporan');

const ms = permintaan.find((x) => x.method === 'POST' && x.url.startsWith('/rest/v1/master'));
ok('S-21 master: kunci sementara dan penanda backup dilewati, penghitung nomor dan pengaturan ikut', ms && ms.body.map((x) => x.key).join(',') === 'setting,SJ-202611', ms && ms.body.map((x) => x.key).join(','));

// S-15 opsi
permintaan = [];
r = await jalan([berkas, '--apply', '--yakin=localhost', '--sertakan-role-modules'], KUNCI);
ok('S-15 --sertakan-role-modules menulis role_modules dengan kunci role,module', tabelDitulis().includes('role_modules') && permintaan.some((x) => x.url === '/rest/v1/role_modules?on_conflict=role,module'));
permintaan = [];
r = await jalan([berkas, '--apply', '--yakin=localhost', '--tabel=sp'], KUNCI);
ok('S-16 --tabel membatasi hanya ke tabel itu', r.code === 0 && JSON.stringify(tabelDitulis()) === JSON.stringify(['sp']));
r = await jalan([berkas, '--tabel=tidak_ada']);
ok('S-17 --tabel tak dikenal ditolak', r.code === 2);

// S-18 gagal di tengah: berhenti, tidak lanjut ke tabel berikutnya
permintaan = []; gagalDi = 'rm';
r = await jalan([berkas, '--apply', '--yakin=localhost'], KUNCI);
ok('S-18 galat tujuan menghentikan proses dengan kode 1 dan tidak lanjut', r.code === 1 && !tabelDitulis().includes('spk') && /GAGAL rm/.test(r.err));
gagalDi = null;

server.close();
console.log(R.join('\n'));
const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(`\n${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
