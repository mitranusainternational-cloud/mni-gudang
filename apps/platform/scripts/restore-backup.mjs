// Pulihkan cadangan MNI Gudang (berkas JSON dari tombol "Unduh cadangan") ke sebuah project Supabase TUJUAN.
//
//   node scripts/restore-backup.mjs <berkas.json>                              -> uji kering: hanya menampilkan isi dan rencana
//   node scripts/restore-backup.mjs <berkas.json> --apply --yakin=<ref>        -> menulis ke database tujuan
//
// Variabel lingkungan (isi sendiri saat menjalankan, JANGAN disimpan di berkas atau Git):
//   SUPABASE_URL                 mis. https://xxxx.supabase.co  (project TUJUAN)
//   SUPABASE_SERVICE_ROLE_KEY    kunci service-role project TUJUAN (Settings > API)
//
// Pilihan:
//   --yakin=<ref>        wajib bersama --apply; harus sama dengan ref project di SUPABASE_URL (cegah salah sasaran).
//   --tabel=a,b          pulihkan hanya tabel tertentu (latihan atau lanjut setelah gagal).
//   --sertakan-role-modules   ikut menulis role_modules dari cadangan. Bawaan: dilewati, karena paket hak peran milik tujuan
//                        (muser.data.modul per pengguna tetap ikut lewat tabel muser).
//
// Aturan aman:
//   * Menolak berjalan bila tujuan adalah project production MNI Gudang (lihat DILARANG).
//   * Memakai upsert (menimpa baris dengan id yang sama), tidak pernah menghapus data.
//   * Pengguna (muser) yang emailnya sudah ada di tujuan dilewati, tidak ditimpa. Begitu pula baris mwc (kode), spk (no), dan uinv
//     (token) yang nilai uniknya sudah dipakai baris tujuan dengan id berbeda: dilewati dan DILAPORKAN, tidak menghapus atau menimpa.
//   * Baris mutasi ditulis urut waktu (created_at, lalu id) agar pemicu "stok tidak negatif" di tujuan tidak menolak keluaran
//     yang ditulis sebelum penerimaannya.
//   * Tabel yang ada di cadangan tetapi tidak dipulihkan skrip ini dilaporkan, tidak diam-diam diabaikan.
//   * Akun login (Auth) tidak ikut cadangan; buat ulang lewat menu Pengguna & Akses atau dashboard, email harus sama dengan muser.
import fs from 'node:fs';

// Project yang tidak boleh menjadi tujuan pemulihan.
const DILARANG = ['lggqigmvtefkquqjrjsb']; // MNI Gudang - Production

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const flag = (n) => args.find((a) => a === `--${n}` || a.startsWith(`--${n}=`));
const nilai = (n) => { const f = flag(n); return f && f.includes('=') ? f.slice(n.length + 3) : undefined; };
const apply = !!flag('apply');
if (!file) { console.error('Pemakaian: node scripts/restore-backup.mjs <berkas.json> [--apply --yakin=<ref>] [--tabel=a,b] [--sertakan-role-modules]'); process.exit(2); }

const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
if (backup.format !== 'mni-gudang-backup' || !backup.data) { console.error('Berkas bukan cadangan MNI Gudang.'); process.exit(2); }

// Urutan aman terhadap kunci asing; kunci konflik tiap tabel
const ORDER = [
  ['muser', 'id'], ['role_modules', 'role,module'], ['master', 'key'], ['mwc', 'id'], ['mvendor', 'id'], ['mcustomer', 'id'],
  ['msupplier', 'id'], ['marmada', 'id'], ['rm', 'id'], ['fg', 'id'], ['sp', 'id'], ['spk', 'id'], ['mtc', 'id'], ['rmhist', 'id'],
  ['pr', 'id'], ['opname', 'id'], ['mutasi', 'id'], ['vendor', 'id'], ['kirim', 'id'], ['bongkar', 'id'], ['produksi_log', 'id'],
  ['uinv', 'id'], ['ureq', 'id'], ['log', 'id'], ['audit_log', 'id'],
];
const DIKENAL = new Set(ORDER.map(([t]) => t));
// Di luar lingkup WMS (keputusan pemilik 2026-11-11); hanya dilaporkan bila ternyata berisi.
const LUAR_LINGKUP = new Set(['penawaran', 'salesorder']);

const sertakanRole = !!flag('sertakan-role-modules');
const hanya = nilai('tabel') ? new Set(nilai('tabel').split(',').map((s) => s.trim()).filter(Boolean)) : null;
if (hanya) for (const t of hanya) if (!DIKENAL.has(t)) { console.error(`Tabel "${t}" tidak dikenal. Pilihan: ${[...DIKENAL].join(', ')}`); process.exit(2); }

const dipakai = (t) => (hanya ? hanya.has(t) : true) && (t !== 'role_modules' || sertakanRole || (hanya && hanya.has(t)));
// master: dokumen kunci sementara (lock:*, penanda "sedang diedit" yang sudah kedaluwarsa) dan penanda cadangan (backup, milik tiap
// sistem) tidak ikut dipindah. Penghitung nomor dokumen (mis. SJ-202611), pengaturan, dan katalog tetap ikut.
const MASTER_LEWAT = (k) => String(k).startsWith('lock:') || k === 'backup';
const barisDari = (t) => {
  const rows = backup.data[t] || [];
  if (t === 'master') return rows.filter((x) => !MASTER_LEWAT(x.key));
  if (t !== 'mutasi') return rows;
  return [...rows].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')) || String(a.id).localeCompare(String(b.id)));
};

console.log(`Cadangan dibuat ${backup.dibuat} oleh ${backup.oleh || '-'}`);
let total = 0;
for (const [t] of ORDER) {
  const n = barisDari(t).length;
  const lewatMaster = t === 'master' ? (backup.data.master || []).length - n : 0;
  const ket = !dipakai(t) ? (t === 'role_modules' && !sertakanRole ? '  (dilewati: paket hak milik tujuan)' : '  (dilewati: bukan --tabel)')
    : lewatMaster ? `  (${lewatMaster} dokumen kunci sementara lock:* dan penanda backup dilewati)` : '';
  if (dipakai(t)) total += n;
  console.log(`  ${t.padEnd(14)} ${String(n).padStart(5)}${ket}`);
}
console.log(`  jumlah baris   ${total}`);
const tidakTercakup = Object.keys(backup.data).filter((t) => !DIKENAL.has(t) && (backup.data[t] || []).length > 0);
for (const t of tidakTercakup) console.log(`  PERHATIAN: tabel "${t}" berisi ${backup.data[t].length} baris dan TIDAK dipulihkan skrip ini${LUAR_LINGKUP.has(t) ? ' (di luar lingkup WMS)' : ''}.`);
if (!backup.data.mtc) console.log('  CATATAN: cadangan tidak memuat tabel mtc (Maintenance); isi bila perlu dengan menambah data.mtc ke berkas ini.');

if (!apply) { console.log('\nUji kering selesai. Tambahkan --apply --yakin=<ref> untuk menulis ke database tujuan.'); process.exit(0); }

const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di lingkungan terlebih dulu.'); process.exit(2); }
let ref;
try { ref = new URL(url).hostname.split('.')[0]; } catch { console.error('SUPABASE_URL tidak valid.'); process.exit(2); }
if (DILARANG.includes(ref)) { console.error(`DITOLAK: ${ref} adalah project production. Pemulihan ke production tidak boleh lewat skrip ini.`); process.exit(2); }
if (nilai('yakin') !== ref) { console.error(`Tambahkan --yakin=${ref} untuk memastikan project tujuan yang dimaksud.`); process.exit(2); }

const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

// Kolom unik selain id yang bisa bentrok dengan isi tujuan (batasan UNIQUE di skema).
const UNIK = { muser: 'email', mwc: 'kode', spk: 'no', uinv: 'token' };

// Baca semua baris (per 1000, batas PostgREST). null = galat sudah dilaporkan.
async function bacaSemua(tabel, kolom) {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${url}/rest/v1/${tabel}?select=${kolom}&order=id&limit=1000&offset=${off}`, { headers: H });
    if (!r.ok) { console.error(`GAGAL membaca ${tabel} tujuan: ${r.status} ${(await r.text()).slice(0, 300)}`); return null; }
    const hal = await r.json();
    out.push(...hal);
    if (hal.length < 1000) return out;
  }
}

// Mengembalikan kode keluar (bukan process.exit di tengah jalan: di Windows itu membuat Node crash saat koneksi masih terbuka).
async function tulis() {
  let done = 0;
  for (const [t, conflict] of ORDER) {
    if (!dipakai(t)) continue;
    let rows = barisDari(t);

    if (UNIK[t] && rows.length) {
      const kol = UNIK[t];
      const norm = (v) => (kol === 'email' ? String(v).toLowerCase() : String(v));
      const ada = await bacaSemua(t, `id,${kol}`);
      if (ada === null) return 1;
      const idDi = new Map(ada.filter((x) => x[kol] != null).map((x) => [norm(x[kol]), x.id]));
      // muser: pengguna tujuan tidak pernah ditimpa. Tabel lain: dilewati hanya bila nilai uniknya dipakai baris tujuan dengan id berbeda
      // (id sama = pembaruan biasa lewat upsert).
      const bentrok = (x) => idDi.has(norm(x[kol])) && (t === 'muser' || idDi.get(norm(x[kol])) !== x.id);
      const lewat = rows.filter(bentrok);
      rows = rows.filter((x) => !bentrok(x));
      if (lewat.length) console.log(`  ${t.padEnd(14)} ${lewat.length} baris DILEWATI (${kol} sudah ada di tujuan${t === 'muser' ? '' : ' dengan id berbeda'}): ${lewat.slice(0, 8).map((x) => x[kol]).join(', ')}${lewat.length > 8 ? ', ...' : ''}`);
    }

    for (let i = 0; i < rows.length; i += 100) {
      const res = await fetch(`${url}/rest/v1/${t}?on_conflict=${conflict}`, {
        method: 'POST',
        headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows.slice(i, i + 100)),
      });
      if (!res.ok) { console.error(`GAGAL ${t} (baris ${i}): ${res.status} ${(await res.text()).slice(0, 300)}\nTabel sebelumnya sudah tertulis; perbaiki lalu jalankan ulang (aman, upsert) dengan --tabel=${t},... bila perlu.`); return 1; }
      done += Math.min(100, rows.length - i);
    }
    console.log(`  ${t.padEnd(14)} ${rows.length} baris dipulihkan`);
  }
  console.log(`\nSelesai: ${done} baris. Cocokkan jumlah di tujuan dengan angka uji kering, lalu buat ulang akun login anggota tim.`);
  return 0;
}
process.exitCode = await tulis();
