// Uji aturan dan alur penawaran.  node tests/unit/penawaran.test.mjs   (memakai katalog sintetis, aman untuk CI)
import { aturan, ATURAN_DEFAULT, nomorPenawaran, labelNomor, batasDiskon, perluPersetujuan, kedaluwarsa, penawaranBaru, varianBaru, itemBaru, daftarKeluarga, bentukDiKeluarga, deskripsiItem, hitungVarian, periksaKirim, aksiTersedia, terapkan, buatRevisi, masalahMuatSpk, produkSpk, susunSpk, snapshotPO, perluPerbaruiSpk, gabungRevisiSpk } from '../../src/lib/erp/penawaran.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const keluaran = { harga: 'S', jumlah: 'U', estimasi: 'AF', estimasiQty: 'AG', real: 'AS', realQty: 'AT' };
const kat = { bentuk: [
  { id: 'SLU_LURUS', keluarga: 'SLU', judul: 'Straight Ladder', baris: 10, masukan: { D: 'w', F: 'h', H: 'l' }, qtyKolom: 'O', keluaran, param: ['AW2', 'AW6', 'AW7'],
    rumus: { AF: '(D10*F10*H10/1000000)*$AW$6', S: 'ROUND(AF10*$AW$2,-2)', U: 'S10*O10', AG: 'AF10*O10', AS: '(D10*F10*H10/1000000)*$AW$7', AT: 'AS10*O10' } },
  { id: 'SLU_ELBOW', keluarga: 'SLU', judul: 'Horizontal Elbow 90', baris: 12, masukan: { D: 'w' }, qtyKolom: 'O', keluaran, param: ['AW2', 'AW6', 'AW7'],
    rumus: { AF: 'D12*$AW$6/100', S: 'ROUND(AF12*$AW$2,-2)', U: 'S12*O12', AG: 'AF12*O12', AS: 'D12*$AW$7/100', AT: 'AS12*O12' } },
  { id: 'STU_LURUS', keluarga: 'STU', judul: 'Straight Tray', baris: 14, masukan: { D: 'w', F: 'l' }, qtyKolom: 'O', keluaran, param: ['AW2', 'AW6', 'AW7'],
    rumus: { AF: '(D14*F14/1000)*$AW$6', S: 'ROUND(AF14*$AW$2,-2)', U: 'S14*O14', AG: 'AF14*O14', AS: '(D14*F14/1000)*$AW$7', AT: 'AS14*O14' } },
] };
const sks = [{ nama: 'Skenario 1', param: { AW2: { v: 10000 }, AW6: { v: 1.1 }, AW7: { v: 1 } } }, { nama: 'Skenario 2', param: { AW2: { v: 8000 }, AW6: { v: 1.1 }, AW7: { v: 1 } } }];
const a = aturan(null);
const T = '2026-11-06';

ok('P-01 aturan awal dan nilai tidak sah diganti nilai awal', JSON.stringify(a) === JSON.stringify(ATURAN_DEFAULT) && aturan({ kode: ' btj-1 ', berlakuHari: -3, diskonDefault: 'x', batasSales: 5, ppn: 0.1 }).kode === 'BTJ1' && aturan({ berlakuHari: -3 }).berlakuHari === ATURAN_DEFAULT.berlakuHari && aturan({ batasSales: 5 }).batasSales === 1 && aturan({ diskonDefault: 'x' }).diskonDefault === ATURAN_DEFAULT.diskonDefault, JSON.stringify(a));
ok('P-02 nomor urutan.KODE/bulan/tahun dan label revisi', nomorPenawaran(40, 'BTJ', '2024-07-15') === '040.BTJ/07/2024' && labelNomor({ nomor: '040.BTJ/07/2024', rev: 0 }) === '040.BTJ/07/2024' && labelNomor({ nomor: '040.BTJ/07/2024', rev: 2 }) === '040.BTJ/07/2024 Rev.2');
const p0 = penawaranBaru({ tgl: T, sales: 's@x', a, nomor: nomorPenawaran(1, a.kode, T), no: 1 });
ok('P-03 penawaran baru: Draft, satu varian A, berlaku tujuh hari, diskon awal dari aturan', p0.status === 'Draft' && p0.varian.length === 1 && p0.varian[0].k === 'A' && p0.berlaku === '2026-11-13' && p0.varian[0].diskon === a.diskonDefault && p0.nomor === '001.MNI/11/2026', JSON.stringify(p0).slice(0, 160));
ok('P-04 batas diskon per peran dan perlu persetujuan', batasDiskon(a, 'admin') === 1 && batasDiskon(a, 'sales') === a.batasSales && batasDiskon(a, 'ppic') === 0 && !perluPersetujuan(a, 'sales', { varian: [{ diskon: 0.3 }, { diskon: 0.1 }] }) && perluPersetujuan(a, 'sales', { varian: [{ diskon: 0.1 }, { diskon: 0.31 }] }) && !perluPersetujuan(a, 'admin', { varian: [{ diskon: 0.9 }] }));
ok('P-05 kedaluwarsa hanya untuk Draft dan Terkirim yang lewat masa berlaku', kedaluwarsa({ status: 'Draft', berlaku: '2026-11-05' }, T) && !kedaluwarsa({ status: 'Draft', berlaku: T }, T) && !kedaluwarsa({ status: 'Disetujui', berlaku: '2026-01-01' }, T) && kedaluwarsa({ status: 'Terkirim', berlaku: '2026-11-01' }, T));
ok('P-06 daftar keluarga dan bentuk dari katalog', JSON.stringify(daftarKeluarga(kat)) === '["SLU","STU"]' && bentukDiKeluarga(kat, 'SLU').length === 2 && JSON.stringify(bentukDiKeluarga(kat, 'SLU')[0].masukan) === '["w","h","l"]');
const it1 = { ...itemBaru('SLU', 'SLU_LURUS', 10), u: { w: 200, h: 50, l: 3000 } };
ok('P-07 deskripsi item untuk cetak mencantumkan keluarga, bentuk, dan ukuran', deskripsiItem(kat, it1) === 'SLU Straight Ladder W200xH50xL3000' && deskripsiItem(kat, { bentuk: 'XX', u: {} }) === '(bentuk tidak dikenal)' && deskripsiItem(kat, { bentuk: 'SLU_LURUS', u: { w: 200 } }) === 'SLU Straight Ladder W200xH?xL?');
const v = { ...varianBaru('A', 0, a), diskon: 0.1, ppn: 0.11, items: [it1, { ...itemBaru('STU', 'STU_LURUS', 2), u: { w: 100, l: 3000 } }, { ...itemBaru('SLU', 'SLU_ELBOW', 1), u: {} }] };
let h = hitungVarian(kat, sks, v);
const hargaLurus = Math.round((200 * 50 * 3000 / 1e6) * 1.1 * 10000 / 100) * 100;
ok('P-08 hitung varian: harga, jumlah, total dibulatkan Rupiah, kg, dan baris bergalat terhitung', h.baris[0].hasil.hargaSatuan === hargaLurus && h.baris[0].hasil.jumlah === hargaLurus * 10 && h.galat === 1 && /Ukuran kurang/.test(h.baris[2].hasil.galat) && Number.isInteger(h.total.total) && h.total.subtotal === h.baris[0].hasil.jumlah + h.baris[1].hasil.jumlah && h.kg.estimasi > 0, JSON.stringify(h.total));
const h2 = hitungVarian(kat, sks, { ...v, skenario: 1 });
ok('P-09 skenario lain memakai parameternya sendiri; skenario tidak ada menghasilkan galat', h2.baris[0].hasil.hargaSatuan < h.baris[0].hasil.hargaSatuan && hitungVarian(kat, sks, { ...v, skenario: 9 }).galat === 3);
const pLengkap = { ...p0, customer: 'PT Contoh', varian: [{ ...v, items: v.items.slice(0, 2) }] };
ok('P-10 periksa kirim: kosong bila lengkap; menyebut customer, item, jumlah, dan galat bila tidak', periksaKirim(pLengkap, kat, sks).length === 0 && periksaKirim({ ...p0 }, kat, sks).some((x) => /Customer/.test(x)) && periksaKirim({ ...pLengkap, customer: '' }, kat, sks).length === 1 && periksaKirim({ ...pLengkap, varian: [{ ...v }] }, kat, sks).some((x) => /baris 3/.test(x)) && periksaKirim({ ...pLengkap, varian: [{ ...v, items: [{ ...it1, q: 0 }] }] }, kat, sks).some((x) => /lebih dari 0/.test(x)));
ok('P-11 aksi tersedia menurut status dan peran', JSON.stringify(aksiTersedia({ status: 'Draft' }, 'sales')) === '["simpan","kirim","cetak"]' && aksiTersedia({ status: 'Menunggu persetujuan' }, 'admin').includes('setujuDiskon') && !aksiTersedia({ status: 'Menunggu persetujuan' }, 'sales').includes('setujuDiskon') && aksiTersedia({ status: 'Terkirim' }, 'sales').includes('setujuCustomer') && aksiTersedia({ status: 'Disetujui' }, 'sales').includes('revisi') && !aksiTersedia({ status: 'Disetujui' }, 'sales').includes('kirim'));
const ctx = { peran: 'sales', a, tgl: T, oleh: 's@x' };
let p1 = terapkan(pLengkap, 'kirim', ctx);
ok('P-12 kirim dengan diskon dalam batas langsung Terkirim dan mencatat tanggal', p1.status === 'Terkirim' && p1.tglKirim === T && pLengkap.status === 'Draft');
const pBesar = { ...pLengkap, varian: [{ ...pLengkap.varian[0], diskon: 0.5 }] };
let p2 = terapkan(pBesar, 'kirim', ctx);
ok('P-13 diskon di atas batas Sales menunggu persetujuan; admin langsung Terkirim', p2.status === 'Menunggu persetujuan' && p2.diajukanOleh === 's@x' && terapkan(pBesar, 'kirim', { ...ctx, peran: 'admin' }).status === 'Terkirim');
let p3 = terapkan(p2, 'setujuDiskon', { ...ctx, peran: 'admin', oleh: 'o@x' });
let p4 = terapkan(p2, 'kembalikan', { ...ctx, peran: 'admin', alasan: 'terlalu besar' });
ok('P-14 penyetuju menyetujui (Terkirim, tercatat) atau mengembalikan ke Draft dengan alasan; Sales tidak bisa menyetujui', p3.status === 'Terkirim' && p3.diskonDisetujuiOleh === 'o@x' && p4.status === 'Draft' && p4.catatanPenyetuju === 'terlalu besar' && (() => { try { terapkan(p2, 'setujuDiskon', ctx); return false; } catch (e) { return /tidak tersedia/.test(e.message); } })());
let p5 = terapkan(p1, 'setujuCustomer', { ...ctx, varian: 'A' });
ok('P-15 customer menyetujui varian terpilih; varian tak dikenal ditolak', p5.status === 'Disetujui' && p5.pilih === 'A' && p5.tglSetuju === T && (() => { try { terapkan(p1, 'setujuCustomer', { ...ctx, varian: 'Z' }); return false; } catch (e) { return /Pilih varian/.test(e.message); } })());
ok('P-16 ditolak customer menyimpan alasan', terapkan(p1, 'tolak', { ...ctx, alasan: 'harga' }).alasan === 'harga' && terapkan(p1, 'tolak', ctx).status === 'Ditolak');
let r1 = terapkan(p5, 'revisi', { ...ctx, tgl: '2026-11-20' });
ok('P-17 revisi: nomor dasar tetap, Rev bertambah, kembali Draft, riwayat menyimpan versi lama, masa berlaku baru', r1.rev === 1 && r1.nomor === p5.nomor && r1.status === 'Draft' && r1.pilih === null && r1.riwayat.length === 1 && r1.riwayat[0].rev === 0 && r1.riwayat[0].status === 'Disetujui' && r1.berlaku === '2026-11-27' && p5.rev === 0);
const r2 = buatRevisi(r1, { tgl: '2026-12-01', a });
ok('P-18 revisi berulang menumpuk riwayat tanpa menyalin riwayat ke dalam riwayat', r2.rev === 2 && r2.riwayat.length === 2 && r2.riwayat.every((x) => !x.riwayat));

// ---- T-191: muat dari penawaran ke SPK
const pSetuju = { ...terapkan(p1, 'setujuCustomer', { ...ctx, varian: 'A' }), id: 'pnw-1' };
ok('P-19 hanya penawaran Disetujui dengan varian terpilih yang boleh dimuat', masalahMuatSpk(p1).length === 1 && masalahMuatSpk(pSetuju).length === 0 && masalahMuatSpk({ ...pSetuju, pilih: 'Z' }).length === 1 && (() => { try { susunSpk(p1, kat, sks); return false; } catch (e) { return /Disetujui/.test(e.message); } })());
const spk = susunSpk(pSetuju, kat, sks);
ok('P-20 SPK tersusun per keluarga, jumlah dan berat real per pcs, tautan penawaran, tanpa harga', spk.customer === 'PT Contoh' && spk.sections.map((s) => s.h).join() === 'CABLE LADDER TYPE SLU,CABLE TRAY TYPE STU' && spk.sections[0].lines[0].q === 10 && spk.sections[0].lines[0].d === 'SLU Straight Ladder W200xH50xL3000' && Math.abs(spk.sections[0].lines[0].w - 200 * 50 * 3000 / 1e6) < 1e-9 && spk.penawaran.nomor === pSetuju.nomor && spk.penawaran.rev === 0 && spk.penawaran.varian === 'A' && !/harga|jumlah|total/i.test(JSON.stringify(spk.sections)));
ok('P-21 baris bergalat menghalangi muat dan tidak membuat SPK sebagian', (() => { try { susunSpk({ ...pSetuju, varian: [{ ...pSetuju.varian[0], items: [...pSetuju.varian[0].items, { ...itemBaru('SLU', 'SLU_ELBOW', 1), u: {} }] }] }, kat, sks); return false; } catch (e) { return /belum dapat dihitung/.test(e.message); } })());
ok('P-20b judul produk SPK mengikuti konvensi rute: lurus = CABLE, bentuk lain = ACCS, cover, dan keluarga tak dikenal apa adanya', produkSpk('SLU', 'Straight Ladder') === 'CABLE LADDER' && produkSpk('STU', 'Straight Tray') === 'CABLE TRAY' && produkSpk('SLW', 'Horizontal Elbow 90') === 'ACCS LADDER' && produkSpk('STC', 'Tee') === 'ACCS TRAY' && produkSpk('STU', 'Cover Straight') === 'COVER TRAY' && produkSpk('XYZ', 'Apa') === 'XYZ' && produkSpk('', '') === 'LAINNYA');
const sn = snapshotPO(pSetuju, kat, sks, { tgl: T, oleh: 'o@x', po: 'PO-77' });
const snKunci = JSON.stringify(sn);
const sksUbah = [{ nama: 'Skenario 1', param: { AW2: { v: 99999 }, AW6: { v: 2 }, AW7: { v: 2 } } }];
const sn2 = snapshotPO(pSetuju, kat, sks, { tgl: T, oleh: 'o@x', po: 'PO-77' });
ok('P-22 snapshot PO membekukan harga, berat, total, dan skenario; tidak berubah bila skenario berubah sesudahnya', sn.po === 'PO-77' && sn.baris.length === 2 && sn.baris[0].hargaSatuan === hargaLurus && sn.total.total === hitungVarian(kat, sks, pSetuju.varian[0]).total.total && sn.skenario.param.AW2.v === 10000 && snKunci === JSON.stringify(sn2) && (sks[0].param.AW2.v = 99999, sks[0].param.AW2.v = 10000, JSON.stringify(sn) === snKunci) && sksUbah[0].param.AW2.v === 99999);
ok('P-23 penawaran direvisi membuat SPK tertaut perlu diperbarui', !perluPerbaruiSpk(pSetuju, spk.penawaran) && perluPerbaruiSpk({ ...pSetuju, rev: 1 }, spk.penawaran) && !perluPerbaruiSpk(pSetuju, null));
const lama = [{ d: 'SLU Straight Ladder W200xH50xL3000', q: 10, prod: 6 }, { d: 'ITEM LAMA', q: 3, prod: 1 }];
const gb = gabungRevisiSpk([{ h: 'SLU', lines: [{ d: 'SLU Straight Ladder W200xH50xL3000', q: 4 }, { d: 'ITEM BARU', q: 2 }] }], lama);
ok('P-24 revisi mempertahankan jumlah produksi (dibatasi qty baru), item baru nol, item lama yang hilang dilaporkan', gb.sections[0].lines[0].prod === 4 && gb.sections[0].lines[1].prod === 0 && JSON.stringify(gb.hilang) === '["ITEM LAMA"]');

const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
