// Uji pengenal bentuk dan ukuran dari deskripsi teks (T-226).  node tests/unit/kenali.test.mjs
import { kenaliDeskripsi } from '../../src/lib/berat/parser.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));

const a = kenaliDeskripsi('Cable Tray W300xH100xL3000 mm');
ok('KN-01 batang lurus: bentuk STRAIGHT, W 300, H 100, L 3000', !!a && a.kunci === 'STRAIGHT' && a.dim.w === 300 && a.dim.h === 100 && a.dim.l === 3000, JSON.stringify(a));

const b = kenaliDeskripsi('Cable Tray Elbow 90 W300xH100xR300');
ok('KN-02 elbow: bentuk ELBOW, W 300, H 100, R 300', !!b && b.kunci === 'ELBOW' && b.dim.w === 300 && b.dim.h === 100 && b.dim.r === 300, JSON.stringify(b));

const c = kenaliDeskripsi('Cover Tray W300xL3000');
ok('KN-03 cover lurus: bentuk COVER_STRAIGHT, W 300, L 3000', !!c && c.kunci === 'COVER_STRAIGHT' && c.dim.w === 300 && c.dim.l === 3000, JSON.stringify(c));

const d = kenaliDeskripsi('Cover Clamp W200xH100, c/w Bolt Hex');
ok('KN-04 cover clamp: bagian setelah c/w (baut) diabaikan', !!d && d.kunci === 'COVER_CLAMP' && d.dim.w === 200 && d.dim.h === 100, JSON.stringify(d));

ok('KN-05 teks yang tidak dikenal dan teks kosong menghasilkan null', kenaliDeskripsi('Barang Aneh Sekali') === null && kenaliDeskripsi('') === null && kenaliDeskripsi(null) === null);

const e = kenaliDeskripsi('Cable Ladder W300xH100xL3000 1.5');
ok('KN-06 tebal polos di akhir teks terbaca (1.5)', !!e && e.kunci === 'STRAIGHT' && e.tebal === 1.5, JSON.stringify(e));

for (const l of R) console.log(l);
const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(`${R.length - fail} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
