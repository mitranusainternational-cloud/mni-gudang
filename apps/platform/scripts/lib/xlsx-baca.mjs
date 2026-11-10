// Pembaca xlsx minimal (zip + XML) tanpa pustaka tambahan. Dipakai skrip pembangun katalog.
//   const { sheets } = bacaXlsx('file.xlsx')  ->  sheets: [{ name, cells: { A1: { v, f } } }]
// v = nilai tersimpan (angka, teks, atau { galat }), f = rumus (rumus bersama sudah dibuka per sel).
import fs from 'node:fs';
import zlib from 'node:zlib';

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
export const colNum = (c) => c.split('').reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0);
export const colStr = (n) => { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
export const splitAddr = (a) => { const m = a.match(/^([A-Z]+)(\d+)$/); return [m[1], +m[2]]; };
const shiftFormula = (f, dc, dr) => f.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (m, d1, c, d2, r) => (d1 ? c : colStr(colNum(c) + dc)) + d2 + (d2 ? r : +r + dr));

export function bacaXlsx(file) {
  const z = readZip(fs.readFileSync(file));
  const txt = (n) => z[n].toString('utf8');
  const strings = z['xl/sharedStrings.xml'] ? [...txt('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => unesc([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(''))) : [];
  const rels = Object.fromEntries([...txt('xl/_rels/workbook.xml.rels').matchAll(/<Relationship [^>]*>/g)].map((m) => [(m[0].match(/Id="([^"]+)"/) || [])[1], (m[0].match(/Target="([^"]+)"/) || [])[1]]));
  const sheets = [...txt('xl/workbook.xml').matchAll(/<sheet [^>]*>/g)].map((m) => ({ name: unesc((m[0].match(/name="([^"]+)"/) || [])[1]), path: 'xl/' + rels[(m[0].match(/r:id="([^"]+)"/) || [])[1]].replace(/^\/?(xl\/)?/, '') }));
  for (const sh of sheets) {
    const cells = {}; const shared = {};
    for (const row of txt(sh.path).matchAll(/<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
      for (const c of row[2].matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const [, addr, attrs, inner = ''] = c;
        const t = (attrs.match(/t="(\w+)"/) || [])[1];
        const f = inner.match(/<f([^>]*)>([\s\S]*?)<\/f>/);
        const fsh = inner.match(/<f([^>]*)\/>/);
        const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        let val;
        if (v !== undefined) val = t === 's' ? strings[+v] : t === 'e' ? { galat: v } : t === 'str' ? unesc(v) : t === 'b' ? v === '1' : parseFloat(v);
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
    sh.cells = cells;
  }
  return { sheets };
}
