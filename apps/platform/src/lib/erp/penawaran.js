// Aturan dan alur penawaran (fungsi murni, tanpa DOM, tanpa akses data).
// Dipakai modul Penawaran (UI) dan diuji tanpa katalog nyata. Harga dan berat dihitung oleh ./harga.js.
//
// Dokumen penawaran (kolom aplikasi; sisanya tersimpan di kolom JSONB data):
//   { no, nomor, rev, tgl, berlaku, customer, attn, proyek, sales, franco, kirim, bayar, catatan, status, pilih,
//     varian: [{ k:'A', nama, skenario, diskon, ppn, items:[{ id, kel, bentuk, u:{w,h,l,r..}, q, ket }] }],
//     riwayat: [{ rev, status, tgl, varian }] }
import { hitungBaris, masukanBentuk, cariBentuk, totalPenawaran, kebutuhanKg, biayaPO } from './harga.js';

export const STATUS = ['Draft', 'Menunggu persetujuan', 'Terkirim', 'Disetujui', 'Ditolak'];
/** Nilai awal aturan; pemilik dapat mengubahnya (tersimpan di master penawaran_aturan). batasSales: diskon tertinggi tanpa persetujuan. */
export const ATURAN_DEFAULT = { kode: 'MNI', berlakuHari: 7, diskonDefault: 0.3, batasSales: 0.3, ppn: 0.11 };

const salin = (x) => JSON.parse(JSON.stringify(x));
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d);
const ms = (d) => Date.parse(d + 'T00:00:00Z');
export const geserTanggal = (d, n) => new Date(ms(d) + n * 864e5).toISOString().slice(0, 10);

/** Gabungkan aturan tersimpan dengan nilai awal; nilai tidak sah diganti nilai awal. */
export function aturan(tersimpan) {
  const t = tersimpan || {};
  return {
    kode: String(t.kode || ATURAN_DEFAULT.kode).trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || ATURAN_DEFAULT.kode,
    berlakuHari: Math.max(1, Math.round(num(t.berlakuHari, ATURAN_DEFAULT.berlakuHari))),
    diskonDefault: Math.min(1, num(t.diskonDefault, ATURAN_DEFAULT.diskonDefault)),
    batasSales: Math.min(1, num(t.batasSales, ATURAN_DEFAULT.batasSales)),
    ppn: Math.min(1, num(t.ppn, ATURAN_DEFAULT.ppn)),
  };
}

/** Nomor: urutan.KODE/bulan/tahun, mis. 040.MNI/07/2026. */
export function nomorPenawaran(urut, kode, tgl) {
  const [y, m] = String(tgl).slice(0, 7).split('-');
  return `${String(urut).padStart(3, '0')}.${kode}/${m}/${y}`;
}
export const labelNomor = (p) => (p.nomor || '–') + (p.rev > 0 ? ' Rev.' + p.rev : '');

/** Diskon tertinggi tanpa persetujuan menurut peran: admin tanpa batas, Sales sesuai aturan, peran lain 0. */
export function batasDiskon(a, peran) { return peran === 'admin' ? 1 : peran === 'sales' ? a.batasSales : 0; }
export const diskonTertinggi = (p) => Math.max(0, ...(p.varian || []).map((v) => +v.diskon || 0));
export function perluPersetujuan(a, peran, p) { return peran !== 'admin' && diskonTertinggi(p) > batasDiskon(a, peran) + 1e-9; }
export const kedaluwarsa = (p, hariIni) => ['Draft', 'Terkirim'].includes(p.status) && !!p.berlaku && p.berlaku < hariIni;

export function varianBaru(kode, skenario, a) { return { k: kode, nama: 'Varian ' + kode, skenario: skenario || 0, diskon: a.diskonDefault, ppn: a.ppn, items: [] }; }
export function penawaranBaru({ tgl, sales = '', a, nomor = '', no = 0 }) {
  return { no, nomor, rev: 0, tgl, berlaku: geserTanggal(tgl, a.berlakuHari), customer: '', attn: '', proyek: '', sales, franco: '', kirim: '', bayar: '', catatan: '', status: 'Draft', pilih: null, varian: [varianBaru('A', 0, a)], riwayat: [] };
}
let _id = 0;
export function itemBaru(kel = '', bentuk = '', q = 1) { return { id: 'i' + Date.now().toString(36) + (_id++).toString(36), kel, bentuk, u: {}, q, ket: '', tebal: '', fin: '' }; }

/** Daftar keluarga produk dan bentuk di katalog (untuk pilihan di lembar). */
export const daftarKeluarga = (katalog) => [...new Set((katalog.bentuk || []).map((b) => b.keluarga))];
export const bentukDiKeluarga = (katalog, kel) => (katalog.bentuk || []).filter((b) => b.keluarga === kel).map((b) => ({ id: b.id, judul: b.judul, masukan: masukanBentuk(katalog, b.id) }));

/** Teks deskripsi item untuk cetak: "SLU Straight Ladder W200xH50xL3000". */
export function deskripsiItem(katalog, it) {
  const b = cariBentuk(katalog, it.bentuk);
  if (!b) return '(bentuk tidak dikenal)';
  const ukuran = (masukanBentuk(katalog, it.bentuk) || []).map((n) => n.toUpperCase() + (it.u && Number.isFinite(+it.u[n]) ? +it.u[n] : '?')).join('x');
  return `${b.keluarga} ${b.judul}${ukuran ? ' ' + ukuran : ''}`.replace(/\s+/g, ' ').trim();
}

/** Hitung satu varian: baris (harga, jumlah, kg), total (dibulatkan ke Rupiah), kg total, dan jumlah baris bergalat. */
export function hitungVarian(katalog, skenarioList, varian) {
  const sk = (skenarioList || [])[varian.skenario || 0];
  const baris = (varian.items || []).map((it) => ({ ...it, hasil: sk ? hitungBaris(katalog, sk, it.bentuk, it.u || {}, +it.q || 0) : { galat: 'Skenario tidak tersedia' } }));
  const total = totalPenawaran({ jumlah: baris.map((b) => b.hasil.jumlah), diskon: +varian.diskon || 0, ppn: +varian.ppn || 0, bulatkan: true });
  return { baris, total, kg: kebutuhanKg(baris.map((b) => b.hasil)), galat: baris.filter((b) => b.hasil.galat).length };
}

/** Daftar masalah yang menghalangi pengiriman penawaran; kosong berarti siap. */
export function periksaKirim(p, katalog, skenarioList) {
  const m = [];
  if (!String(p.customer || '').trim()) m.push('Customer belum diisi.');
  if (!(p.varian || []).length) m.push('Belum ada varian.');
  (p.varian || []).forEach((v) => {
    const h = hitungVarian(katalog, skenarioList, v);
    if (!h.baris.length) m.push(`${v.nama || 'Varian ' + v.k}: belum ada item.`);
    h.baris.forEach((b, i) => {
      if (!(+b.q > 0)) m.push(`${v.nama || 'Varian ' + v.k} baris ${i + 1}: jumlah harus lebih dari 0.`);
      if (b.hasil.galat) m.push(`${v.nama || 'Varian ' + v.k} baris ${i + 1}: ${b.hasil.galat}.`);
    });
  });
  return m;
}

/** Aksi yang tersedia menurut status dan peran. */
export function aksiTersedia(p, peran) {
  const admin = peran === 'admin';
  const s = p.status;
  const a = [];
  if (s === 'Draft') a.push('simpan', 'kirim');
  if (s === 'Menunggu persetujuan' && admin) a.push('setujuDiskon', 'kembalikan');
  if (s === 'Terkirim') a.push('setujuCustomer', 'tolak');
  if (['Terkirim', 'Disetujui', 'Ditolak'].includes(s)) a.push('revisi');
  a.push('cetak');
  return a;
}

export function buatRevisi(p, { tgl, a }) {
  const snap = { rev: p.rev, status: p.status, tgl: p.tglKirim || p.tgl, varian: salin(p.varian) };
  const n = salin(p);
  n.riwayat = [...(p.riwayat || []), snap];
  n.rev = p.rev + 1; n.status = 'Draft'; n.pilih = null; n.tglKirim = null; n.tglSetuju = null; n.alasan = ''; n.berlaku = geserTanggal(tgl, a.berlakuHari);
  return n;
}

/** Terapkan aksi dan kembalikan salinan baru. Melempar Error untuk aksi yang tidak diizinkan. */
export function terapkan(p, aksi, { peran, a, tgl, oleh = '', varian = null, alasan = '' } = {}) {
  if (!aksiTersedia(p, peran).includes(aksi)) throw new Error(`Aksi ${aksi} tidak tersedia untuk status ${p.status}.`);
  const n = salin(p);
  switch (aksi) {
    case 'kirim':
      if (perluPersetujuan(a, peran, p)) { n.status = 'Menunggu persetujuan'; n.diajukanOleh = oleh; break; }
      n.status = 'Terkirim'; n.tglKirim = tgl; break;
    case 'setujuDiskon': n.status = 'Terkirim'; n.tglKirim = tgl; n.diskonDisetujuiOleh = oleh; break;
    case 'kembalikan': n.status = 'Draft'; n.catatanPenyetuju = alasan; break;
    case 'setujuCustomer':
      if (!varian || !(p.varian || []).some((v) => v.k === varian)) throw new Error('Pilih varian yang disetujui customer.');
      n.status = 'Disetujui'; n.pilih = varian; n.tglSetuju = tgl; break;
    case 'tolak': n.status = 'Ditolak'; n.alasan = alasan; break;
    case 'revisi': return buatRevisi(p, { tgl, a });
    default: break;
  }
  return n;
}

// ---------------------------------------------------------------------------------------------------------------
// T-191: muat dari penawaran ke SPK, snapshot saat PO, pembaruan SPK dari revisi (fungsi murni)
// Harga dan biaya HANYA masuk snapshot di dokumen penawaran (modul rahasia). SPK menyimpan berat dan tautan saja.
// ---------------------------------------------------------------------------------------------------------------


const bulat = (x, d) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : 0);

/** Alasan penawaran belum bisa dimuat ke SPK; kosong berarti siap. */
export function masalahMuatSpk(p) {
  const m = [];
  if (!p || p.status !== 'Disetujui') m.push('Penawaran harus berstatus Disetujui.');
  else if (!(p.varian || []).some((v) => v.k === p.pilih)) m.push('Varian yang disetujui tidak ditemukan.');
  return m;
}

/** Kunci tautan satu arah: penawaran menyimpan spkId; SPK menyimpan penawaran = { id, nomor, rev, varian }. */
export const refSpk = (p) => ({ id: p.id || p._id || null, nomor: p.nomor || '', rev: p.rev || 0, varian: p.pilih });

/** Judul produk SPK dari keluarga katalog dan nama bentuk. Mesin rute produksi membaca judul ini (CABLE TRAY, CABLE LADDER, ACCS ..., COVER TRAY).
 *  Kode keluarga ST* = tray, SL* = ladder; bentuk selain lurus dianggap aksesoris. Keluarga tak dikenal dikembalikan apa adanya
 *  (rute lalu ditentukan manual di editor SPK). Tebal dan finishing tidak ada di penawaran: dilengkapi pengguna di editor. */
export function produkSpk(keluarga, judul) {
  const k = String(keluarga || '').toUpperCase().trim();
  const ladder = /^SL/.test(k), tray = /^ST/.test(k);
  if (!ladder && !tray) return k || 'LAINNYA';
  if (/cover/i.test(String(judul || ''))) return 'COVER TRAY';
  if (/straight|lurus/i.test(String(judul || ''))) return ladder ? 'CABLE LADDER' : 'CABLE TRAY';
  return ladder ? 'ACCS LADDER' : 'ACCS TRAY';
}

/** Susun isi SPK (bagian per judul produk) dari varian terpilih. Berat per pcs memakai berat real. */
export function susunSpk(p, katalog, skenarioList) {
  const mm = masalahMuatSpk(p);
  if (mm.length) throw new Error(mm[0]);
  const v = p.varian.find((x) => x.k === p.pilih);
  const h = hitungVarian(katalog, skenarioList, v);
  if (h.galat) throw new Error(`${h.galat} baris penawaran belum dapat dihitung; perbaiki penawaran lebih dulu.`);
  const grup = new Map();
  h.baris.forEach((b) => {
    const bt = cariBentuk(katalog, b.bentuk);
    const kel = bt ? `${produkSpk(bt.keluarga, bt.judul)}${/^S[LT]/i.test(bt.keluarga) ? ' TYPE ' + bt.keluarga.toUpperCase() : ''}` : 'LAINNYA';
    if (!grup.has(kel)) grup.set(kel, []);
    grup.get(kel).push({ d: deskripsiItem(katalog, b), q: +b.q, u: 'Pcs', w: bulat(b.hasil.kgReal, 3), wsrc: 'manual', ket: b.ket || '', catatan: '', prod: 0 });
  });
  return {
    customer: p.customer || '', sales: p.sales || '', proyek: p.proyek || '', po: p.po || '',
    sections: [...grup].map(([kel, lines]) => ({ h: kel, lines })),
    penawaran: refSpk(p),
  };
}

/** Salinan beku harga, berat, dan biaya saat PO. Tidak bergantung pada katalog atau skenario sesudahnya. */
export function snapshotPO(p, katalog, skenarioList, { tgl, oleh = '', po = '' } = {}) {
  const mm = masalahMuatSpk(p);
  if (mm.length) throw new Error(mm[0]);
  const v = p.varian.find((x) => x.k === p.pilih);
  const sk = (skenarioList || [])[v.skenario || 0] || {};
  const h = hitungVarian(katalog, skenarioList, v);
  if (h.galat) throw new Error(`${h.galat} baris penawaran belum dapat dihitung.`);
  const biaya = sk.biaya && Object.keys(sk.biaya).length ? biayaPO({ kgReal: h.kg.real, biaya: sk.biaya, dpp: h.total.dpp, subtotal: h.total.subtotal }) : null;
  return salin({
    tgl, oleh, po, rev: p.rev || 0, nomor: p.nomor || '', varian: v.k, skenario: { nama: sk.nama || '', param: sk.param || {}, biaya: sk.biaya || {} },
    diskon: +v.diskon || 0, ppn: +v.ppn || 0, total: h.total, kg: h.kg, biaya,
    baris: h.baris.map((b) => ({ d: deskripsiItem(katalog, b), q: +b.q, hargaSatuan: b.hasil.hargaSatuan, jumlah: b.hasil.jumlah, kgEstimasi: b.hasil.kgEstimasi, kgReal: b.hasil.kgReal, kgEstimasiTotal: b.hasil.kgEstimasiTotal, kgRealTotal: b.hasil.kgRealTotal })),
  });
}

/** Apakah SPK tertaut sudah ketinggalan dari revisi penawaran. */
export const perluPerbaruiSpk = (p, refTersimpan) => !!refTersimpan && (p.rev || 0) > (refTersimpan.rev || 0);

/** Terapkan item baru dari revisi ke SPK lama: jumlah produksi (prod) yang sudah ada dipertahankan menurut deskripsi.
 *  Mengembalikan { sections, hilang } — hilang = deskripsi item lama yang sudah tidak ada pada revisi (pengguna memutuskan). */
export function gabungRevisiSpk(sectionsBaru, itemsLama = []) {
  const prod = new Map(itemsLama.map((i) => [String(i.d).trim(), +i.prod || 0]));
  const dipakai = new Set();
  const sections = sectionsBaru.map((s) => ({ ...s, lines: s.lines.map((l) => { const k = String(l.d).trim(); dipakai.add(k); return { ...l, prod: Math.min(+l.q || 0, prod.get(k) || 0) }; }) }));
  const hilang = itemsLama.filter((i) => !dipakai.has(String(i.d).trim())).map((i) => i.d);
  return { sections, hilang };
}
