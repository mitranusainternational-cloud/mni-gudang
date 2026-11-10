// Sales Order (SO): penghubung Penawaran -> SPK (fungsi murni, tanpa DOM dan tanpa akses data).
//
// Alur: Penawaran Disetujui -> Sales Order (PO customer, item boleh disesuaikan, tebal dan finishing) -> Konfirmasi -> SPK Draft otomatis.
// SO memegang komitmen ke customer: nomor PO, due date, alamat, dan snapshot harga, berat, biaya saat PO.
// SPK hanya menerima jumlah, berat real per pcs, tebal, finishing, dan tautan. Harga TIDAK pernah masuk SPK.
//
// Dokumen SO (kolom aplikasi no, tgl, customer, po, status, rev, total, due; sisanya di kolom data):
//   { no, nomor, tgl, rev, status, customer, sales, proyek, po, tglPo, due, alamat, catatan,
//     penawaran: { id, nomor, rev, varian }, total,
//     items: [{ id, d, kel, produk, q, u, w, tebal, fin, ket }],
//     snapshot: { ... lihat snapshotPO ... },
//     spk: [{ id, no }], spkRev, amandemen: [{ rev, at, by, alasan }], riwayat: [] }
import { cariBentuk } from './harga.js';
import { hitungVarian, deskripsiItem, produkSpk, snapshotPO, masalahMuatSpk, refSpk } from './penawaran.js';

export const STATUS_SO = ['Draft', 'Dikonfirmasi', 'Batal'];

const salin = (x) => JSON.parse(JSON.stringify(x));
const bulat = (x, d) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : 0);

/** Nomor SO: 001/SO/2026 (urutan per tahun). */
export function nomorSO(urut, tgl) { return `${String(urut).padStart(3, '0')}/SO/${String(tgl).slice(0, 4)}`; }
export const labelSO = (s) => (s.nomor || '–') + (s.rev > 0 ? ' Rev.' + s.rev : '');

/** Judul section SPK dari satu item SO. Mesin rute membaca awalannya (CABLE TRAY, CABLE LADDER, ACCS ..., COVER TRAY);
 *  tebal dan finishing ikut di judul sehingga langkah vendor (ELG, HDG, PDC) terpasang otomatis. */
export function judulItem(it) {
  const tipe = /^S[LT]/i.test(it.kel || '') ? ' TYPE ' + String(it.kel).toUpperCase() : '';
  return `${it.produk || 'LAINNYA'}${tipe}${it.tebal ? ' ' + it.tebal : ''}${it.fin ? ' ' + it.fin : ''}`.replace(/\s+/g, ' ').trim();
}

/** Buat SO Draft dari penawaran Disetujui. Item = salinan varian terpilih (boleh disesuaikan dengan PO customer). */
export function soDariPenawaran(p, katalog, skenarioList, { tgl, oleh = '', po = '', tglPo = '', due = '', alamat = '', nomor = '', no = 0 } = {}) {
  const mm = masalahMuatSpk(p);
  if (mm.length) throw new Error(mm[0]);
  const v = p.varian.find((x) => x.k === p.pilih);
  const h = hitungVarian(katalog, skenarioList, v);
  if (h.galat) throw new Error(`${h.galat} baris penawaran belum dapat dihitung; perbaiki penawaran lebih dulu.`);
  const snapshot = snapshotPO(p, katalog, skenarioList, { tgl, oleh, po });
  const items = h.baris.map((b, i) => {
    const bt = cariBentuk(katalog, b.bentuk);
    return { id: 'o' + i, d: deskripsiItem(katalog, b), kel: bt ? bt.keluarga : '', produk: bt ? produkSpk(bt.keluarga, bt.judul) : 'LAINNYA', q: +b.q, u: 'Pcs', w: bulat(b.hasil.kgReal, 3), tebal: b.tebal || '', fin: b.fin || '', ket: b.ket || '' };
  });
  return {
    no, nomor, tgl, rev: 0, status: 'Draft', customer: p.customer || '', sales: p.sales || '', proyek: p.proyek || '', po: String(po || '').trim(), tglPo, due, alamat, catatan: '',
    penawaran: refSpk(p), total: snapshot.total.total, items, snapshot, spk: [], spkRev: null, amandemen: [],
  };
}

/** Masalah yang menghalangi konfirmasi; kosong berarti siap. */
export function periksaSo(s) {
  const m = [];
  if (!String(s.customer || '').trim()) m.push('Customer belum diisi.');
  if (!String(s.po || '').trim()) m.push('Nomor PO customer belum diisi.');
  if (!(s.items || []).length) m.push('Belum ada item.');
  (s.items || []).forEach((it, i) => {
    if (!String(it.d || '').trim()) m.push(`Item ${i + 1}: deskripsi kosong.`);
    if (!(+it.q > 0)) m.push(`Item ${i + 1}: jumlah harus lebih dari 0.`);
    if (!String(it.tebal || '').trim()) m.push(`Item ${i + 1}: tebal belum dipilih (menentukan rute produksi).`);
    if (!String(it.fin || '').trim()) m.push(`Item ${i + 1}: finishing belum dipilih (pilih Non Finishing bila tanpa finishing).`);
  });
  return m;
}

export function aksiSo(s) {
  if (s.status === 'Draft') return ['simpan', 'konfirmasi', 'batal'];
  if (s.status === 'Dikonfirmasi') return ['amandemen'];
  return [];
}

/** Terapkan aksi dan kembalikan salinan baru. Melempar Error bila tidak diizinkan. */
export function terapkanSo(s, aksi, { oleh = '', tgl = '', alasan = '' } = {}) {
  if (!aksiSo(s).includes(aksi)) throw new Error(`Aksi ${aksi} tidak tersedia untuk status ${s.status}.`);
  const n = salin(s);
  switch (aksi) {
    case 'konfirmasi': {
      const m = periksaSo(s);
      if (m.length) throw new Error(m[0]);
      n.status = 'Dikonfirmasi'; n.tglKonfirmasi = tgl; n.konfirmasiOleh = oleh; break;
    }
    case 'batal': n.status = 'Batal'; n.alasan = alasan; break;
    case 'amandemen':
      if (!String(alasan).trim()) throw new Error('Isi alasan amandemen.');
      n.rev = (s.rev || 0) + 1; n.status = 'Draft';
      n.amandemen = [...(s.amandemen || []), { rev: n.rev, at: tgl, by: oleh, alasan: String(alasan).trim() }];
      break;
    default: break;
  }
  return n;
}

/** Isi SPK dari SO: bagian per judul (produk, tipe, tebal, finishing), jumlah, dan berat real per pcs. Tanpa harga. */
export function spkDariSo(s) {
  const grup = new Map();
  (s.items || []).forEach((it) => {
    const h = judulItem(it);
    if (!grup.has(h)) grup.set(h, []);
    grup.get(h).push({ d: it.d, q: +it.q, u: it.u || 'Pcs', w: +it.w || 0, wsrc: 'manual', ket: it.ket || '', catatan: '', prod: 0 });
  });
  return {
    customer: s.customer || '', sales: s.sales || '', po: s.po || '', due: s.due || '',
    sections: [...grup].map(([h, lines]) => ({ h, lines })),
    penawaran: s.penawaran || null, so: { id: s.id || s._id || null, nomor: s.nomor || '', rev: s.rev || 0 },
  };
}

/** SPK tertaut ketinggalan dari SO (SO sudah diamandemen dan dikonfirmasi lagi). */
export const perluPerbaruiSpkSo = (s) => s.status === 'Dikonfirmasi' && (s.spk || []).length > 0 && (s.rev || 0) > (s.spkRev == null ? 0 : s.spkRev);
/** SO terkonfirmasi yang belum punya SPK. */
export const belumPunyaSpk = (s) => s.status === 'Dikonfirmasi' && !(s.spk || []).length;
