// Uji Sales Order.  node tests/unit/salesorder.test.mjs   (katalog sintetis, aman untuk CI)
import { aturan, penawaranBaru, varianBaru, itemBaru, terapkan } from '../../src/lib/erp/penawaran.js';
import { nomorSO, labelSO, judulItem, soDariPenawaran, periksaSo, aksiSo, terapkanSo, spkDariSo, perluPerbaruiSpkSo, belumPunyaSpk } from '../../src/lib/erp/salesorder.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const keluaran = { harga: 'S', jumlah: 'U', estimasi: 'AF', estimasiQty: 'AG', real: 'AS', realQty: 'AT' };
const kat = { bentuk: [
  { id: 'SLU_LURUS', keluarga: 'SLU', judul: 'Straight Ladder', baris: 10, masukan: { D: 'w', F: 'h', H: 'l' }, qtyKolom: 'O', keluaran, param: ['AW2', 'AW6', 'AW7'],
    rumus: { AF: '(D10*F10*H10/1000000)*$AW$6', S: 'ROUND(AF10*$AW$2,-2)', U: 'S10*O10', AG: 'AF10*O10', AS: '(D10*F10*H10/1000000)*$AW$7', AT: 'AS10*O10' } },
  { id: 'STU_LURUS', keluarga: 'STU', judul: 'Straight Tray', baris: 14, masukan: { D: 'w', F: 'l' }, qtyKolom: 'O', keluaran, param: ['AW2', 'AW6', 'AW7'],
    rumus: { AF: '(D14*F14/1000)*$AW$6', S: 'ROUND(AF14*$AW$2,-2)', U: 'S14*O14', AG: 'AF14*O14', AS: '(D14*F14/1000)*$AW$7', AT: 'AS14*O14' } },
  { id: 'STU_ELBOW', keluarga: 'STU', judul: 'Horizontal Elbow 90', baris: 16, masukan: { D: 'w' }, qtyKolom: 'O', keluaran, param: ['AW2', 'AW6', 'AW7'],
    rumus: { AF: 'D16*$AW$6/100', S: 'ROUND(AF16*$AW$2,-2)', U: 'S16*O16', AG: 'AF16*O16', AS: 'D16*$AW$7/100', AT: 'AS16*O16' } },
] };
const sks = [{ nama: 'Skenario 1', param: { AW2: { v: 10000 }, AW6: { v: 1.1 }, AW7: { v: 1 } } }];
const a = aturan(null); const T = '2026-11-06';
const p0 = penawaranBaru({ tgl: T, sales: 's@x', a, nomor: '001.MNI/11/2026', no: 1 });
const v = { ...varianBaru('A', 0, a), diskon: 0.1, ppn: 0.11, items: [
  { ...itemBaru('SLU', 'SLU_LURUS', 10), u: { w: 200, h: 50, l: 3000 }, tebal: '1.5', fin: 'ELECTRO GALVANIZED' },
  { ...itemBaru('STU', 'STU_LURUS', 4), u: { w: 100, l: 3000 }, tebal: '1.2', fin: 'ELECTRO GALVANIZED' },
  { ...itemBaru('STU', 'STU_ELBOW', 2), u: { w: 300 }, tebal: '1.2', fin: 'ELECTRO GALVANIZED' }] };
let p = { ...p0, id: 'pnw-1', customer: 'PT Contoh', proyek: 'Gedung', varian: [v] };
p = terapkan(terapkan(p, 'kirim', { peran: 'sales', a, tgl: T, oleh: 's@x' }), 'setujuCustomer', { peran: 'sales', a, tgl: T, varian: 'A' });
const opsi = { tgl: T, oleh: 'o@x', po: ' PO-9 ', tglPo: '2026-11-05', due: '2026-11-20', alamat: 'Gudang X', nomor: nomorSO(1, T), no: 1 };

ok('S-01 nomor dan label SO', nomorSO(7, '2026-03-01') === '007/SO/2026' && labelSO({ nomor: '007/SO/2026', rev: 0 }) === '007/SO/2026' && labelSO({ nomor: '007/SO/2026', rev: 2 }) === '007/SO/2026 Rev.2');
ok('S-02 SO hanya dari penawaran Disetujui', (() => { try { soDariPenawaran({ ...p, status: 'Terkirim' }, kat, sks, opsi); return false; } catch (e) { return /Disetujui/.test(e.message); } })());
const so = soDariPenawaran(p, kat, sks, opsi);
ok('S-03 SO Draft membawa customer, PO (dirapikan), tgl PO, due, alamat, tautan penawaran, total snapshot', so.status === 'Draft' && so.rev === 0 && so.customer === 'PT Contoh' && so.po === 'PO-9' && so.due === '2026-11-20' && so.alamat === 'Gudang X' && so.penawaran.nomor === '001.MNI/11/2026' && so.penawaran.id === 'pnw-1' && so.total === so.snapshot.total.total && so.spk.length === 0);
ok('S-04 item SO: deskripsi, produk, jumlah, berat real per pcs, tebal, finishing dari penawaran', so.items.length === 3 && so.items[0].d === 'SLU Straight Ladder W200xH50xL3000' && so.items[0].produk === 'CABLE LADDER' && so.items[0].q === 10 && so.items[0].w === 30 && so.items[0].tebal === '1.5' && so.items[2].produk === 'ACCS TRAY' && so.items[1].fin === 'ELECTRO GALVANIZED');
ok('S-05 judul SPK memuat produk, tipe, tebal, finishing sesuai konvensi rute', judulItem(so.items[0]) === 'CABLE LADDER TYPE SLU 1.5 ELECTRO GALVANIZED' && judulItem(so.items[1]) === 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED' && judulItem({ produk: 'XYZ', kel: 'XYZ', tebal: '', fin: '' }) === 'XYZ');
ok('S-06 konfirmasi ditolak tanpa PO atau item bermasalah', periksaSo({ ...so, po: '' }).some((x) => /PO/.test(x)) && periksaSo({ ...so, customer: ' ' }).length === 1 && periksaSo({ ...so, items: [] }).some((x) => /item/i.test(x)) && periksaSo({ ...so, items: [{ ...so.items[0], q: 0 }] }).some((x) => /lebih dari 0/.test(x)) && periksaSo({ ...so, items: [{ ...so.items[0], tebal: '' }] }).some((x) => /tebal/.test(x)) && periksaSo({ ...so, items: [{ ...so.items[0], fin: '' }] }).some((x) => /finishing/.test(x)) && periksaSo(so).length === 0 && (() => { try { terapkanSo({ ...so, po: '' }, 'konfirmasi', {}); return false; } catch (e) { return /PO/.test(e.message); } })());
const ko = terapkanSo(so, 'konfirmasi', { oleh: 'o@x', tgl: T });
ok('S-07 konfirmasi: Dikonfirmasi, tercatat, asli tidak berubah; aksi sesuai status', ko.status === 'Dikonfirmasi' && ko.konfirmasiOleh === 'o@x' && so.status === 'Draft' && aksiSo(so).includes('konfirmasi') && JSON.stringify(aksiSo(ko)) === '["amandemen"]' && aksiSo({ status: 'Batal' }).length === 0 && belumPunyaSpk(ko));
const sp = spkDariSo(ko);
ok('S-08 SPK dari SO: bagian per judul, jumlah dan berat, PO, due, tautan penawaran dan SO, tanpa harga', sp.sections.map((s) => s.h).join('|') === 'CABLE LADDER TYPE SLU 1.5 ELECTRO GALVANIZED|CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED|ACCS TRAY TYPE STU 1.2 ELECTRO GALVANIZED' && sp.po === 'PO-9' && sp.due === '2026-11-20' && sp.penawaran.rev === 0 && sp.so.nomor === '001/SO/2026' && !/harga|jumlah"|total/i.test(JSON.stringify(sp.sections)));
const koSpk = { ...ko, spk: [{ id: 'spk-1', no: 1 }], spkRev: 0 };
const amandemenOk = (() => { const am = terapkanSo(koSpk, 'amandemen', { oleh: 'o@x', tgl: T, alasan: 'qty PO turun' }); const lagi = terapkanSo(am, 'konfirmasi', { oleh: 'o@x', tgl: T }); return am.rev === 1 && am.status === 'Draft' && am.amandemen.length === 1 && am.spk.length === 1 && labelSO(am).endsWith('Rev.1') && !perluPerbaruiSpkSo(am) && perluPerbaruiSpkSo(lagi) && !perluPerbaruiSpkSo(koSpk) && !belumPunyaSpk(lagi); })();
ok('S-09 amandemen butuh alasan, menaikkan Rev, kembali Draft, riwayat tercatat; SPK perlu diperbarui setelah dikonfirmasi lagi', (() => { try { terapkanSo(koSpk, 'amandemen', {}); return false; } catch (e) { return /alasan/.test(e.message); } })() && amandemenOk);
ok('S-10 batal hanya dari Draft dan mencatat alasan', terapkanSo(so, 'batal', { alasan: 'customer mundur' }).alasan === 'customer mundur' && (() => { try { terapkanSo(ko, 'batal', {}); return false; } catch (e) { return /tidak tersedia/.test(e.message); } })());

const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
