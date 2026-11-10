// Mesin harga dan estimasi penawaran (fungsi murni, tanpa DOM, tanpa akses data).
// Katalog rumus (katalog-harga.json) dan skenario (skenario-harga.json) dibangun dari workbook penawaran oleh
// scripts/build-quote-catalog.mjs; keduanya memuat rumus dan harga perusahaan sehingga tidak dikemas di Git dan dimuat
// dari database setelah login (lihat skill erp-quotation-engine). Mesin hanya menerima keduanya sebagai argumen.
//
//   hitungBaris(katalog, skenario, 'SLU_STRAIGHT_LADDER', { w: 200, h: 50, l: 3000 }, qty)
//     -> { hargaSatuan, jumlah, kgEstimasi, kgReal, kgEstimasiTotal, kgRealTotal } (angka, atau null dengan 'galat')
//   totalPenawaran({ jumlah: [..], diskon: 0.3, ppn: 0.11 })
//   biayaPO({ kgReal, biaya, baut, trading, dpp, subtotal })
//
// Rumus Excel dievaluasi apa adanya oleh src/lib/berat/formula.js. Masukan kurang atau di luar tabel rumus
// menghasilkan null beserta alasan; tidak pernah angka tebakan.
import { parse, evaluate } from '../berat/formula.js';

const cache = new Map();
const tree = (f) => { let t = cache.get(f); if (!t) { t = parse(f); cache.set(f, t); } return t; };
const norm = (k) => String(k).toLowerCase().replace(/\s+/g, '');
const angka = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Nilai parameter skenario di sebuah alamat sel (mis. 'AW2'). Skenario lama tanpa kolom AY memakai kolom AW pada baris yang sama. */
export function nilaiParam(skenario, alamat) {
  const ambil = (a) => { const raw = skenario && (skenario.param ? skenario.param[a] : skenario[a]); return angka(raw && typeof raw === 'object' ? raw.v : raw); };
  const v = ambil(alamat);
  if (v === null && /^AY\d+$/.test(alamat)) return ambil('AW' + alamat.slice(2));
  return v;
}

export function cariBentuk(katalog, id) { return (katalog.bentuk || []).find((b) => b.id === id) || null; }

/** Nama masukan yang dibutuhkan sebuah bentuk, mis. ['w', 'h', 'l']. Bentuk tetap (tanpa ukuran) mengembalikan []. */
export function masukanBentuk(katalog, id) { const b = cariBentuk(katalog, id); return b ? [...new Set(Object.values(b.masukan))] : null; }

/** Hitung satu baris penawaran. Mengembalikan { galat } bila bentuk tidak dikenal, ukuran kurang, parameter kosong, atau ukuran di luar tabel. */
export function hitungBaris(katalog, skenario, bentukId, masukan = {}, qty = 0, opsi = {}) {
  const b = cariBentuk(katalog, bentukId);
  if (!b) return { galat: 'Bentuk tidak dikenal: ' + bentukId };
  const p = {}; for (const [k, v] of Object.entries(masukan)) p[norm(k)] = Number(v);
  const kurang = [...new Set(Object.values(b.masukan))].filter((n) => !Number.isFinite(p[n]));
  if (kurang.length) return { galat: 'Ukuran kurang: ' + kurang.join(', ') };
  const par = {};
  for (const a of b.param || []) { const v = nilaiParam(skenario, a); if (v === null) return { galat: 'Parameter skenario kosong: ' + a }; par[a] = v; }
  const sel = { ...(b.konstanta || {}) }; // angka tetap tersembunyi di baris (mis. lebar ujung Reducer), nilai dari workbook
  for (const [kol, n] of Object.entries(b.masukan)) sel[kol] = p[n];
  sel[b.qtyKolom || 'O'] = Number(qty) || 0;
  const memo = {}, tumpuk = new Set();
  const cell = (addr) => {
    const m = addr.match(/^([A-Z]+)(\d+)$/);
    if (+m[2] === b.baris) { if (m[1] in sel) return sel[m[1]]; return b.rumus[m[1]] ? val(m[1]) : undefined; }
    return addr in par ? par[addr] : undefined;
  };
  const val = (kol) => {
    if (kol in memo) return memo[kol];
    if (tumpuk.has(kol)) return NaN; // melingkar
    tumpuk.add(kol);
    let v; try { v = evaluate(tree(b.rumus[kol]), cell); } catch { v = NaN; }
    tumpuk.delete(kol); memo[kol] = v; return v;
  };
  const o = b.keluaran;
  const res = { hargaSatuan: angka(val(o.harga)), jumlah: angka(val(o.jumlah)), kgEstimasi: angka(val(o.estimasi)), kgReal: angka(val(o.real)), kgEstimasiTotal: angka(val(o.estimasiQty)), kgRealTotal: angka(val(o.realQty)) };
  if (res.hargaSatuan === null || res.kgEstimasi === null) {
    const teks = Object.keys(b.rumus).some((k) => val(k) === 'Tidak Diketahui');
    res.galat = teks ? 'Ukuran di luar jangkauan tabel rumus (Tidak Diketahui)' : 'Rumus tidak menghasilkan angka';
    res.hargaSatuan = null; res.jumlah = null;
  }
  if (opsi.semua) res.nilai = Object.fromEntries(Object.keys(b.rumus).map((k) => [k, val(k)]));
  return res;
}

/** Subtotal, diskon, dasar pengenaan pajak, PPN, dan total. diskon dan ppn berupa pecahan (0.3 untuk 30%). Tanpa pembulatan kecuali bulatkan=true (Rupiah utuh). */
export function totalPenawaran({ jumlah = [], diskon = 0, ppn = 0, bulatkan = false } = {}) {
  const r = (x) => (bulatkan ? Math.round(x) : x);
  const subtotal = jumlah.reduce((a, x) => a + (angka(x) || 0), 0);
  const diskonRp = r(subtotal * diskon);
  const dpp = subtotal - diskonRp;
  const ppnRp = r(dpp * ppn);
  return { subtotal, diskon: diskonRp, dpp, ppn: ppnRp, total: dpp + ppnRp };
}

/** Jumlah kg estimasi dan real dari daftar hasil hitungBaris. */
export function kebutuhanKg(hasil = []) {
  return hasil.reduce((a, h) => ({ estimasi: a.estimasi + (angka(h && h.kgEstimasiTotal) || 0), real: a.real + (angka(h && h.kgRealTotal) || 0) }), { estimasi: 0, real: 0 });
}

/** Biaya saat PO dari berat real: plat, hot dip, labour per kg; baut (jumlah set × faktor × harga); trading. Rumus mengikuti blok biaya workbook.
 *  rasioModal = modal / dpp - 1 (nama dan tanda sama dengan workbook, negatif bila modal di bawah dpp); margin = 1 - modal / dpp (umum). */
export function biayaPO({ kgReal = 0, biaya = {}, baut = {}, trading = 0, dpp = 0, subtotal = 0, poin = 0.85 } = {}) {
  const perKg = (biaya.platPerKg || 0) + (biaya.hdgPerKg || 0) + (biaya.labourPerKg || 0);
  const plat = kgReal * (biaya.platPerKg || 0), hdg = kgReal * (biaya.hdgPerKg || 0), labour = kgReal * (biaya.labourPerKg || 0);
  const bautM10 = ((baut.m10 || 0) * 4) * (biaya.bautM10 || 0), bautM6 = ((baut.m6 || 0) * 2) * (biaya.bautM6 || 0);
  const modalBerat = kgReal * perKg;
  const modal = modalBerat + bautM10 + bautM6 + trading;
  const rasioModal = dpp > 0 ? modal / dpp - 1 : null;
  const hargaPoin = poin > 0 ? modal / poin : null;
  return { perKg, plat, hdg, labour, baut: bautM10 + bautM6, trading, modalBerat, modal, rasioModal, selisih: rasioModal === null ? null : rasioModal * dpp, hargaPoin, rasioPoin: hargaPoin !== null && subtotal > 0 ? hargaPoin / subtotal - 1 : null, margin: dpp > 0 ? 1 - modal / dpp : null };
}
