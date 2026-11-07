// Mesin hitung berat: menjalankan rumus Excel dari catalog.json (apa adanya) untuk satu bentuk produk.
// hitung(catalog, 'STU', 'STRAIGHT_STU', { w: 100, h: 100, l: 3000, t: 1.2, bj: 7.85 })
//   -> { estimasi, estimasiLubang, real, realLubang, estimasiFullHole, realFullHole }  (kg per pcs; null bila rumus galat, masukan kurang, atau kolom tidak ada)
import { parse, evaluate } from './formula.js';

const cache = new Map(); // teks rumus -> pohon
const tree = (f) => { let t = cache.get(f); if (!t) { t = parse(f); cache.set(f, t); } return t; };

// Nilai semua kolom rumus pada satu baris bentuk, diberi nilai sel masukan mentah { C: 100, D: 100, ... }.
export function evalRow(block, inputCells, wanted) {
  const memo = {};
  const stack = new Set();
  const cell = (addr) => {
    const m = addr.match(/^([A-Z]+)(\d+)$/);
    const col = m[1];
    if (+m[2] !== block.baris) return undefined; // rumus kalkulator hanya merujuk baris sendiri
    if (col in inputCells) return inputCells[col];
    if (block.rumus[col]) return val(col);
    return undefined;
  };
  const val = (col) => {
    if (col in memo) return memo[col];
    if (stack.has(col)) return NaN; // referensi melingkar
    stack.add(col);
    let v;
    try { v = evaluate(tree(block.rumus[col]), cell); } catch { v = NaN; }
    stack.delete(col);
    memo[col] = v;
    return v;
  };
  const out = {};
  for (const c of wanted || Object.keys(block.rumus)) out[c] = val(c);
  return out;
}

const ALIAS = { thk: 't', t: 't', tebal: 't' };
const norm = (k) => { const x = String(k).toLowerCase(); return ALIAS[x] || x; };

export function cariBentuk(catalog, keluarga, bentukId) {
  const f = catalog.keluarga[keluarga];
  return f ? f.bentuk.find((b) => b.id === bentukId) : null;
}

// Masukan pengguna (nama parameter) -> sel masukan di sisi kiri (estimasi) dan kanan (real)
function cellsFor(block, params) {
  const p = {}; for (const [k, v] of Object.entries(params)) p[norm(k)] = Number(v);
  const side = (map) => { const cells = {}; for (const [col, name] of Object.entries(map)) { const v = p[norm(name)]; if (v === undefined || Number.isNaN(v)) return null; cells[col] = v; } return cells; };
  return { L: side(block.masukan.L), R: side(block.masukan.R) };
}

export function hitung(catalog, keluarga, bentukId, params) {
  const b = cariBentuk(catalog, keluarga, bentukId);
  if (!b) return null;
  const { L, R } = cellsFor(b, params);
  const o = b.keluaran;
  const res = { estimasi: null, estimasiLubang: null, real: null, realLubang: null, estimasiFullHole: null, realFullHole: null };
  const run = (cells, key) => {
    if (!cells || !o[key]) return null;
    const v = evalRow(b, cells, [o[key]])[o[key]];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };
  // Sisi kiri memuat sel masukan kiri; rumus sisi kiri hanya merujuk sel kiri (dan sebaliknya)
  res.estimasi = run(L, 'estimasi'); res.estimasiLubang = run(L, 'estimasiLubang');
  res.real = run(R, 'real'); res.realLubang = run(R, 'realLubang');
  res.estimasiFullHole = run(L, 'estimasiFullHole'); res.realFullHole = run(R, 'realFullHole'); // kalkulator include full hole (lubang bawah dan samping), hanya Straight tray
  return res;
}

// Parameter yang dibutuhkan sebuah bentuk (nama unik), mis. ['w','h','l','t','bj']
export function parameterBentuk(catalog, keluarga, bentukId) {
  const b = cariBentuk(catalog, keluarga, bentukId);
  return b ? [...new Set(Object.values(b.masukan.L).map(norm))] : [];
}
