// Uji aturan CSS tampilan HP.  node tests/unit/tampilan-hp.test.mjs
// Audit 2026-11-19: di layar 390 px halaman Produksi Hari Ini dan Cek Data melebar ke samping karena .tablewrap tidak punya aturan gulir
// dan .tb-group tidak dibatasi lebar induknya. Uji ini menjaga aturannya tetap ada (tidak bergantung pada data).
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const css = fs.readFileSync(fileURLToPath(new URL('../../../gudang-logistik/assets/css/app.css', import.meta.url)), 'utf8');
const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
// kumpulkan isi semua aturan dengan penyeleksi tepat (mis. ".tablewrap{...}")
const aturan = (sel) => css.split('}').filter((b) => b.includes(sel + '{')).map((b) => b.slice(b.indexOf(sel + '{') + sel.length + 1)).join(';');
const tw = aturan('.tablewrap'); const tg = aturan('.tb-group');
ok('H-01 .tablewrap menggulir sendiri (overflow-x:auto) dan tidak melebihi induk', /overflow-x:\s*auto/.test(tw) && /max-width:\s*100%/.test(tw), tw);
ok('H-02 .tb-group boleh menyusut (min-width:0) dan dibatasi lebar induk', /min-width:\s*0/.test(tg) && /max-width:\s*100%/.test(tg), tg);
ok('H-03 .tb-group tetap membungkus baris (flex-wrap:wrap)', /flex-wrap:\s*wrap/.test(tg), tg);
console.log(R.join('\n'));
const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(`\n${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
