// Mesin, sesi Mulai dan Selesai, laporan harian per mesin, dan rekap (fungsi murni).
// Pengganti form laporan harian produksi (Excel): kolom sama, tetapi diisi dari kejadian produksi.
//
// Kejadian produksi_log: { jenis: 'mulai' | 'hasil' | 'batal', mesin, operator, wc, spk_id, item_idx, item_desc,
//   qty, reject, mulai, selesai (ISO), menit, berat (kg per pcs), tonase (kg), tgl, at }

// Daftar mesin sebuah work center ditulis satu per baris: "Nama mesin | operator, operator | kapasitas per hari".
export function parseMesin(teks) {
  return String(teks || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [nama, operator = '', kap = ''] = l.split('|').map((x) => x.trim());
    const kapasitas = parseFloat(String(kap).replace(',', '.'));
    return { nama, operator: operator.split(',').map((x) => x.trim()).filter(Boolean), kapasitas: kapasitas > 0 ? kapasitas : 0 };
  }).filter((m) => m.nama);
}

export const tulisMesin = (mesin) => (mesin || []).map((m) => [m.nama, (m.operator || []).join(', '), m.kapasitas || ''].join(' | ').replace(/( \| )+$/, '')).join('\n');

const urut = (a, b) => String(a.at || '').localeCompare(String(b.at || '')) || (Number(a.id) || 0) - (Number(b.id) || 0);

// Kejadian yang dibatalkan: jenis 'void' menunjuk (ref) id kejadian lain. Keduanya dibuang dari hitungan, riwayat tetap tersimpan.
const idEv = (e) => String(e._id != null ? e._id : e.id);
export function tanpaVoid(kejadian) {
  const dibatalkan = new Set(kejadian.filter((e) => e.jenis === 'void').map((e) => String(e.ref)));
  return kejadian.filter((e) => e.jenis !== 'void' && !dibatalkan.has(idEv(e)));
}

// Sesi yang sedang terbuka: per mesin dan item (spk + urutan item), kejadian terakhirnya berjenis 'mulai'.
// Satu mesin boleh mengerjakan beberapa item sekaligus, dan satu item boleh dikerjakan beberapa mesin sekaligus.
export function sesiAktifSemua(kejadian) {
  const akhir = {};
  for (const e of kejadian.filter((x) => ['mulai', 'hasil', 'batal'].includes(x.jenis || 'hasil')).sort(urut)) akhir[(e.mesin || e.wc) + '|' + e.spk_id + '|' + e.item_idx] = e;
  return Object.values(akhir).filter((e) => e.jenis === 'mulai').sort((a, b) => String(a.mulai || a.at).localeCompare(String(b.mulai || b.at)));
}
export const sesiAktif = (kejadian, mesin) => sesiAktifSemua(kejadian).filter((e) => (e.mesin || e.wc) === mesin);
// Sesi pertama sebuah mesin (kompatibel dengan pemakaian lama), null bila tidak ada
export const sesiBerjalan = (kejadian, mesin) => sesiAktif(kejadian, mesin)[0] || null;

// Selisih menit antara dua waktu ISO (1 desimal)
export function menitAntara(mulai, selesai) {
  const a = new Date(mulai).getTime(), b = new Date(selesai).getTime();
  if (!isFinite(a) || !isFinite(b) || b < a) return null;
  return Math.round(((b - a) / 60000) * 10) / 10;
}

// Waktu lokal "HH:MM" dari ISO (dan sebaliknya: gabungan tanggal ISO + jam lokal menjadi ISO)
const p2 = (x) => String(x).padStart(2, '0');
export const jamLokal = (iso) => { const d = new Date(iso); return isFinite(d) ? `${p2(d.getHours())}:${p2(d.getMinutes())}` : ''; };
export const tanggalLokal = (iso) => { const d = new Date(iso); return isFinite(d) ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` : ''; };
export function gabungWaktu(tgl, jam) {
  const m = String(jam || '').match(/^(\d{1,2}):(\d{2})/); if (!m || !tgl) return null;
  const d = new Date(`${tgl}T${p2(m[1])}:${m[2]}:00`); return isFinite(d) ? d.toISOString() : null;
}

// Baris laporan harian untuk satu mesin (atau semua mesin sebuah work center) pada satu tanggal, urut jam mulai.
export function barisLaporan(kejadian, { tgl, mesin, wc }) {
  return kejadian.filter((e) => (e.jenis || 'hasil') === 'hasil' && (e.tgl || tanggalLokal(e.at)) === tgl && (!mesin || e.mesin === mesin) && (!wc || e.wc === wc))
    .sort((a, b) => String(a.mulai || a.at || '').localeCompare(String(b.mulai || b.at || '')))
    .map((e, i) => {
      const qty = Number(e.qty) || 0, menit = e.menit == null || e.menit === '' ? null : Number(e.menit);
      return { id: idEv(e), no: i + 1, tgl: e.tgl, mulai: e.mulai ? jamLokal(e.mulai) : '', selesai: e.selesai ? jamLokal(e.selesai) : '', menit, jam: menit == null ? null : Math.round((menit / 60) * 100) / 100,
        spk: e.spk_no || '', customer: e.customer || '', deskripsi: e.item_desc || '', tebal: e.tebal || '', qty, reject: Number(e.reject) || 0,
        beratPcs: e.berat == null || e.berat === '' ? null : Number(e.berat), tonase: e.tonase == null || e.tonase === '' ? null : Number(e.tonase),
        menitPerPcs: menit != null && qty > 0 ? Math.round((menit / qty) * 100) / 100 : null, mesin: e.mesin || '', operator: e.operator || '', wc: e.wc, ket: e.ket || '' };
    });
}

export function totalLaporan(baris) {
  const jumlah = (k) => baris.reduce((a, b) => a + (Number(b[k]) || 0), 0);
  return { qty: jumlah('qty'), reject: jumlah('reject'), menit: jumlah('menit'), tonase: Math.round(jumlah('tonase') * 100) / 100 };
}

// Rekap per work center dan mesin untuk rentang tanggal: hasil, reject, tonase, jam mesin berjalan, menit per pcs.
export function rekapMesin(kejadian, dari, sampai) {
  const out = {};
  for (const e of kejadian) {
    if ((e.jenis || 'hasil') !== 'hasil') continue;
    const t = e.tgl || tanggalLokal(e.at); if (t < dari || t > sampai) continue;
    const k = (e.mesin || e.wc) + '|' + e.wc;
    const o = out[k] || (out[k] = { mesin: e.mesin || e.wc, wc: e.wc, qty: 0, reject: 0, tonase: 0, menit: 0, qtyBerwaktu: 0, hari: new Set() });
    const q = Number(e.qty) || 0; o.qty += q; o.reject += Number(e.reject) || 0; o.tonase += Number(e.tonase) || 0; o.hari.add(t);
    if (e.menit != null && e.menit !== '' && q > 0) { o.menit += Number(e.menit); o.qtyBerwaktu += q; }
  }
  return Object.values(out).map((o) => ({ mesin: o.mesin, wc: o.wc, qty: o.qty, reject: o.reject, tonase: Math.round(o.tonase * 100) / 100, jam: Math.round((o.menit / 60) * 10) / 10,
    menitPerPcs: o.qtyBerwaktu > 0 ? Math.round((o.menit / o.qtyBerwaktu) * 100) / 100 : null, hariAktif: o.hari.size,
    reject_pct: o.qty + o.reject > 0 ? o.reject / (o.qty + o.reject) : null })).sort((a, b) => a.wc.localeCompare(b.wc) || a.mesin.localeCompare(b.mesin));
}

// Waktu proses per pcs menurut jenis item (kata kunci pada deskripsi) di sebuah work center: dasar standar waktu.
export function waktuPerJenis(kejadian, jenisDari = (d) => String(d || '').trim().split(/\s+/).slice(0, 2).join(' ').toUpperCase()) {
  const per = {};
  for (const e of kejadian) {
    if ((e.jenis || 'hasil') !== 'hasil' || e.menit == null || e.menit === '' || !(Number(e.qty) > 0)) continue;
    const k = e.wc + '|' + jenisDari(e.item_desc);
    const o = per[k] || (per[k] = { wc: e.wc, jenis: jenisDari(e.item_desc), menit: 0, qty: 0, n: 0 });
    o.menit += Number(e.menit); o.qty += Number(e.qty); o.n++;
  }
  return Object.values(per).map((o) => ({ ...o, menitPerPcs: Math.round((o.menit / o.qty) * 100) / 100 })).sort((a, b) => a.wc.localeCompare(b.wc) || b.n - a.n);
}

// Lembar CSV laporan harian (kolom seperti form Excel)
export function csvLaporan(baris, kepala = {}) {
  const q = (v) => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = [['Work Center', kepala.wc || '', 'Mesin', kepala.mesin || '', 'Tanggal', kepala.tgl || ''],
    ['No', 'Mulai', 'Selesai', 'Durasi (menit)', 'No SPK', 'Customer', 'Deskripsi', 'Tebal', 'Qty (Pcs)', 'Reject', 'Berat/pcs (kg)', 'Tonase (kg)', 'Menit/pcs', 'Operator', 'Keterangan'],
    ...baris.map((b) => [b.no, b.mulai, b.selesai, b.menit ?? '', b.spk, b.customer, b.deskripsi, b.tebal, b.qty, b.reject, b.beratPcs ?? '', b.tonase ?? '', b.menitPerPcs ?? '', b.operator, b.ket])];
  const tot = totalLaporan(baris);
  rows.push(['', '', 'Total', tot.menit, '', '', '', '', tot.qty, tot.reject, '', tot.tonase, '', '', '']);
  return '﻿' + rows.map((r) => r.map(q).join(',')).join('\r\n');
}
