// Membangun katalog rumus berat dari "kalkulator penghitung berat.xlsx" (6 sheet: SLU, SLW, SLHD, SLHDC, STC, STU).
//   node scripts/build-weight-catalog.mjs "<jalur ke xlsx>"
// Hasil: src/lib/berat/catalog.json (rumus Excel apa adanya per bentuk) dan, untuk uji, nilai tersimpan Excel
// (sampel masukan dan hasil) yang dipakai tests/unit/berat.test.mjs untuk membuktikan mesin menghasilkan angka yang sama.
// Berkas xlsx dibaca langsung (zip + XML) tanpa pustaka tambahan.
import fs from 'node:fs';
import zlib from 'node:zlib';

const file = process.argv[2];
if (!file) { console.error('Pemakaian: node scripts/build-weight-catalog.mjs "<xlsx>"'); process.exit(2); }

// --- pembaca zip minimal ---
function readZip(buf) {
  let e = buf.length - 22;
  while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  const n = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  const files = {};
  for (let i = 0; i < n; i++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nl).toString();
    const lh = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const raw = buf.slice(lh, lh + csize);
    files[name] = method === 0 ? raw : zlib.inflateRawSync(raw);
    p += 46 + nl + xl + cl;
  }
  return files;
}
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const z = readZip(fs.readFileSync(file));
const txt = (n) => z[n].toString('utf8');

const strings = [...txt('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => unesc([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join('')));
const wb = txt('xl/workbook.xml');
const rels = Object.fromEntries([...txt('xl/_rels/workbook.xml.rels').matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const sheets = [...wb.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].map((m) => ({ name: m[1], path: 'xl/' + rels[m[2]] }));

// --- util sel ---
const colNum = (c) => c.split('').reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0);
const colStr = (n) => { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const splitAddr = (a) => { const m = a.match(/^([A-Z]+)(\d+)$/); return [m[1], +m[2]]; };
// geser referensi relatif pada rumus bersama
const shiftFormula = (f, dc, dr) => f.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (m, d1, c, d2, r) => (d1 ? c : colStr(colNum(c) + dc)) + d2 + (d2 ? r : +r + dr));

function readSheet(path) {
  const xml = txt(path);
  const cells = {}; const shared = {};
  for (const row of xml.matchAll(/<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    for (const c of row[2].matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const [, addr, attrs, inner = ''] = c;
      const t = (attrs.match(/t="(\w+)"/) || [])[1];
      const f = inner.match(/<f([^>]*)>([\s\S]*?)<\/f>/);
      const fsh = inner.match(/<f([^>]*)\/>/);
      const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      let val;
      if (v !== undefined) val = t === 's' ? strings[+v] : t === 'e' ? { galat: v } : t === 'str' ? unesc(v) : parseFloat(v);
      let formula = null;
      if (f) {
        formula = unesc(f[2]);
        const si = (f[1].match(/si="(\d+)"/) || [])[1];
        if (si !== undefined && /t="shared"/.test(f[1])) shared[si] = { addr, formula };
      } else if (fsh) {
        const si = (fsh[1].match(/si="(\d+)"/) || [])[1];
        const m = shared[si];
        if (m) { const [mc, mr] = splitAddr(m.addr); const [cc, cr] = splitAddr(addr); formula = shiftFormula(m.formula, colNum(cc) - colNum(mc), cr - mr); }
      }
      if (val !== undefined || formula) cells[addr] = { v: val, f: formula };
    }
  }
  return cells;
}

const slug = (s) => String(s).toUpperCase().replace(/\s+/g, ' ').trim();

const catalog = { versi: 1, sumber: 'kalkulator penghitung berat.xlsx', keluarga: {} };
const expected = {};
let total = 0;
for (const sh of sheets) {
  const cells = readSheet(sh.path);
  const fam = [];
  const exp = [];
  for (let r = 7; r <= 140; r++) {
    const label = cells['B' + r] && cells['B' + r].v;
    if (typeof label !== 'string' || !label.trim() || label.trim() === '`') continue;
    const hdr = (c) => { const h = cells[c + (r - 1)]; return h && typeof h.v === 'string' ? h.v.trim() : ''; };
    // Kolom masukan = sel angka tetap yang punya judul parameter. Sisi kiri (estimasi) dan kanan (real) dipisah di titik
    // nama parameter berulang (tata letak kolom berbeda antar sheet: STU memakai S..W, ladder memakai W..AA).
    const inputs = { L: {}, R: {} }; const sample = {};
    const inCols = Object.keys(cells).map((a2) => splitAddr(a2)).filter(([c, rr]) => rr === r && hdr(c) && typeof cells[c + r].v === 'number' && !cells[c + r].f && !/^(total|kg)/i.test(hdr(c))).map(([c]) => c).sort((x, y) => colNum(x) - colNum(y));
    const seen = new Set(); let side = 'L';
    for (const c of inCols) {
      const nm = hdr(c).toLowerCase();
      if (seen.has(nm)) side = 'R';
      seen.add(nm);
      inputs[side][c] = nm; sample[c] = cells[c + r].v;
    }
    // Sel angka tetap di antara kolom masukan yang judulnya kosong (kekhasan workbook, mis. T pada COVER CLAMP STU)
    // ikut menjadi masukan; namanya diambil dari urutan parameter sisi kiri.
    const fill = (sd, ref) => {
      const cols = Object.keys(inputs[sd]).sort((x, y) => colNum(x) - colNum(y));
      if (!cols.length) return [];
      const names = [];
      for (let n = colNum(cols[0]); n <= colNum(cols[cols.length - 1]); n++) {
        const c = colStr(n); const cell = cells[c + r];
        if (cell && typeof cell.v === 'number' && !cell.f) {
          const nm = inputs[sd][c] || (ref ? ref[names.length] : undefined);
          if (nm) { inputs[sd][c] = nm; sample[c] = cell.v; names.push(nm); }
        }
      }
      return names;
    };
    const leftNames = fill('L');
    fill('R', leftNames);
    const formulas = {}; const heads = {}; const cached = {};
    for (const addr of Object.keys(cells)) {
      const [c, rr] = splitAddr(addr);
      if (rr !== r || !cells[addr].f) continue;
      formulas[c] = cells[addr].f;
      heads[c] = hdr(c);
      cached[c] = cells[addr].v;
    }
    // kolom keluaran menurut judul: Total (estimasi dan real), Total Dikurangi Lubang
    const outs = { estimasi: null, estimasiLubang: null, real: null, realLubang: null, estimasiFullHole: null, realFullHole: null };
    const totals = Object.keys(formulas).filter((c) => /^total$/i.test(heads[c])).sort((a, b) => colNum(a) - colNum(b));
    const holes = Object.keys(formulas).filter((c) => /dikurangi lubang/i.test(heads[c])).sort((a, b) => colNum(a) - colNum(b));
    if (totals[0]) outs.estimasi = totals[0];
    if (totals[1]) outs.real = totals[1];
    if (holes[0]) outs.estimasiLubang = holes[0];
    if (holes[1]) outs.realLubang = holes[1];
    // kalkulator "include full hole": Total Full Hole (Bawah+Samping), estimasi di kiri dan real di kanan
    const full = Object.keys(formulas).filter((c) => /full hole/i.test(heads[c])).sort((a, b) => colNum(a) - colNum(b));
    if (full[0]) outs.estimasiFullHole = full[0];
    if (full[1]) outs.realFullHole = full[1];
    const id = slug(label).replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    fam.push({ id, label: slug(label), baris: r, masukan: inputs, rumus: formulas, judul: heads, keluaran: outs });
    exp.push({ id, sample, cached });
    total++;
  }
  catalog.keluarga[sh.name] = { sheet: sh.name, bentuk: fam };
  expected[sh.name] = exp;
}

fs.mkdirSync('src/lib/berat', { recursive: true });
fs.writeFileSync('src/lib/berat/catalog.json', JSON.stringify(catalog));
fs.mkdirSync('tests/unit', { recursive: true });
fs.writeFileSync('tests/unit/berat-excel-expected.json', JSON.stringify(expected));
console.log(`Katalog: ${Object.keys(catalog.keluarga).length} keluarga, ${total} bentuk. catalog.json ${Math.round(fs.statSync('src/lib/berat/catalog.json').size / 1024)} KB.`);
