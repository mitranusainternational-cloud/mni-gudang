// Uji kg per pcs (KG estimasi dan KG real) dan total kg untuk skema item SPK (T-222 tahap 1).  node tests/unit/kg-item.test.mjs
// Memakai katalog sintetis di tests/e2e/fixtures (bukan rumus perusahaan), sehingga aman dijalankan di CI.
import fs from 'node:fs';
import { kgPerPcs, totalKg, hitungBentuk } from '../../src/lib/berat/bentuk.js';
import { setMassaJenisMaster } from '../../src/lib/berat/parser.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const kat = JSON.parse(fs.readFileSync(new URL('../e2e/fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));
const dekat = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
const straight = { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 100, h: 50, l: 3000 }, tebal: '1.2', material: 'SPHC' };

// K-01 straight standar: estimasi = estimasiLubang dan real = realLubang dari katalog (tidak ada angka baru)
const a = kgPerPcs(kat, { ...straight, lubang: 'standar' });
const ref = hitungBentuk(kat, { ...straight, lubang: 'standar' });
ok('K-01 straight standar: kgPcsEst dan kgPcsReal sama dengan kolom lubang katalog', a.ok && dekat(a.kgPcsEst, ref.berat.estimasiLubang) && dekat(a.kgPcsReal, ref.berat.realLubang) && a.lubang === 'standar', JSON.stringify(a));

// K-02 full hole: memakai kolom full hole katalog
const f = kgPerPcs(kat, { ...straight, lubang: 'full' });
ok('K-02 straight full hole: kgPcsEst dan kgPcsReal sama dengan kolom full hole katalog', f.ok && f.lubang === 'full' && dekat(f.kgPcsEst, ref.berat.estimasiFullHole) && dekat(f.kgPcsReal, ref.berat.realFullHole), JSON.stringify(f));

// K-03 full hole diminta untuk bentuk yang tidak punya full hole: kembali ke standar dan diberi catatan
const e = kgPerPcs(kat, { keluarga: 'STU', bentuk: 'ELBOW_STU_R_D', dim: { w: 100, h: 100, r: 300 }, tebal: '2', material: 'SPHC', lubang: 'full' });
ok('K-03 full hole tidak tersedia: memakai standar dan diberi catatan', e.ok && e.lubang === 'standar' && /tidak tersedia/.test(e.catatan || ''), JSON.stringify(e));

// K-04 kg real dan estimasi keduanya positif untuk straight dan elbow (tidak ada yang kosong)
ok('K-04 straight dan elbow menghasilkan kedua angka positif', a.kgPcsEst > 0 && a.kgPcsReal > 0 && e.kgPcsEst > 0 && e.kgPcsReal > 0, JSON.stringify({ a: [a.kgPcsEst, a.kgPcsReal], e: [e.kgPcsEst, e.kgPcsReal] }));

// K-05 dimensi kurang: tidak ada angka, alasan menyebut ukuran yang kurang
const k5 = kgPerPcs(kat, { ...straight, dim: { w: 100, h: 50 } });
ok('K-05 dimensi L kosong: ok=false dan alasan menyebut ukuran', !k5.ok && /Isi ukuran/.test(k5.alasan), k5.alasan);

// K-06 material tidak dikenali: ok=false
const k6 = kgPerPcs(kat, { ...straight, material: 'BAHAN-TIDAK-ADA' });
ok('K-06 material tidak dikenali: ok=false dengan alasan massa jenis', !k6.ok && /massa jenis/.test(k6.alasan), k6.alasan);

// K-07 total: est memakai qty - ambil, real memakai qty penuh
const t1 = totalKg({ kgPcsEst: 10, kgPcsReal: 8 }, 10, 4);
ok('K-07 qty 10, ambil 4: kg estimasi total = 10 x 6 (plate), kg real total = 8 x 10 (barang jadi)', dekat(t1.kgEstTotal, 60) && dekat(t1.kgRealTotal, 80) && t1.qtyProduksi === 6, JSON.stringify(t1));

// K-08 ambil lebih besar dari qty dipotong ke qty; qty kosong tidak menghasilkan kg
const t2 = totalKg({ kgPcsEst: 10, kgPcsReal: 8 }, 5, 9);
const t3 = totalKg({ kgPcsEst: 10, kgPcsReal: 8 }, '', 0);
ok('K-08 ambil melebihi qty dipotong; qty kosong menghasilkan nol', t2.qtyProduksi === 0 && t2.kgEstTotal === 0 && dekat(t2.kgRealTotal, 40) && t3.kgEstTotal === 0 && t3.kgRealTotal === 0, JSON.stringify([t2, t3]));

// K-09 konsistensi: total estimasi per pcs sama dengan kgPerPcs x qty produksi
const tot = totalKg(a, 7, 2);
ok('K-09 total estimasi = kgPcsEst x (qty - ambil) dengan kgPcsEst dari katalog', dekat(tot.kgEstTotal, a.kgPcsEst * 5), JSON.stringify(tot));

// K-10 pengait massa jenis Master Data: massa jenis dari Master Data menggantikan tabel di kode (kg ikut berubah sebanding)
setMassaJenisMaster((m) => (/sphc/i.test(m) ? 8.0 : 0));
const mst = kgPerPcs(kat, { ...straight, lubang: 'standar' });
ok('K-10 massa jenis SPHC dari Master Data 8,0 (bukan 7,85): estimasi dan real naik sebanding 8,0/7,85', mst.ok && dekat(mst.kgPcsEst / a.kgPcsEst, 8.0 / 7.85) && dekat(mst.kgPcsReal / a.kgPcsReal, 8.0 / 7.85), JSON.stringify({ r: mst.kgPcsEst / a.kgPcsEst }));
// K-11 bahan yang tidak dikenali Master Data kembali ke tabel di kode; pengait dilepas = angka awal
setMassaJenisMaster((m) => 0);
const cad = kgPerPcs(kat, { ...straight, lubang: 'standar' });
setMassaJenisMaster(null);
const awal = kgPerPcs(kat, { ...straight, lubang: 'standar' });
ok('K-11 Master Data tidak mengenali bahan: memakai cadangan di kode; pengait dilepas kembali ke angka awal', dekat(cad.kgPcsEst, a.kgPcsEst) && dekat(awal.kgPcsEst, a.kgPcsEst), JSON.stringify({ cad: cad.kgPcsEst, awal: awal.kgPcsEst, a: a.kgPcsEst }));

const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n') + `\n${R.length - fail} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
