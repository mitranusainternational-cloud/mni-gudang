// Analisa produksi untuk manajemen (fungsi murni): output per work center, lama proses per produk,
// kecepatan vendor, dan loading serta unloading. Semua dihitung dari kejadian yang sudah dicatat; tidak ada input baru.
import { tanpaVoid, tanggalLokal } from './laporan.js';
import { selisihHariKerja } from './kinerja.js';

const p2 = (x) => String(x).padStart(2, '0');
const tglStr = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const rata = (a) => (a.length ? r1(a.reduce((x, y) => x + y, 0) / a.length) : null);

// Daftar tanggal berurutan (lama ke baru) sepanjang `hari` hari berakhir pada `sampai`
export function rentangHari(sampai, hari) {
  const out = []; const d = new Date(String(sampai).slice(0, 10) + 'T00:00:00');
  d.setDate(d.getDate() - (hari - 1));
  for (let i = 0; i < hari; i++) { out.push(tglStr(d)); d.setDate(d.getDate() + 1); }
  return out;
}

// Output per work center selama rentang: rata-rata per hari kerja yang ada hasilnya, utilisasi terhadap kapasitas, puncak, reject, menit per pcs, tren harian.
// wcList: [{ nama, kapasitas }]; kejadian: seluruh produksi_log (kejadian yang dibatalkan dibuang di sini).
export function outputWC({ kejadian, wcList, sampai, hari = 14 }) {
  const hariList = rentangHari(sampai, hari); const set = new Set(hariList);
  const ev = tanpaVoid(kejadian).filter((e) => (e.jenis || 'hasil') === 'hasil' && set.has(e.tgl || tanggalLokal(e.at)));
  return wcList.map((w) => {
    const per = {}; let qty = 0, reject = 0, tonase = 0, menit = 0, qtyBerwaktu = 0; const mesin = {};
    ev.filter((e) => e.wc === w.nama).forEach((e) => {
      const t = e.tgl || tanggalLokal(e.at); const q = Number(e.qty) || 0;
      per[t] = (per[t] || 0) + q; qty += q; reject += Number(e.reject) || 0; tonase += Number(e.tonase) || 0;
      if (e.menit != null && e.menit !== '' && q > 0) { menit += Number(e.menit); qtyBerwaktu += q; }
      const m = e.mesin || w.nama; mesin[m] = (mesin[m] || 0) + q;
    });
    const aktif = Object.keys(per).length; const kap = Number(w.kapasitas) || 0;
    const rataHari = aktif ? r1(qty / aktif) : 0; const puncak = Math.max(0, ...Object.values(per));
    return { wc: w.nama, kapasitas: kap, qty, reject, tonase: r1(tonase), hariAktif: aktif, rataHari, puncak,
      utilisasi: kap > 0 && aktif ? r2(rataHari / kap) : null, utilisasiPuncak: kap > 0 && puncak ? r2(puncak / kap) : null,
      rejectPct: qty + reject > 0 ? r2(reject / (qty + reject)) : null, menitPerPcs: qtyBerwaktu > 0 ? r2(menit / qtyBerwaktu) : null,
      tren: hariList.map((t) => ({ tgl: t, qty: per[t] || 0 })), mesin: Object.entries(mesin).map(([nama, q]) => ({ nama, qty: q })).sort((a, b) => b.qty - a.qty) };
  });
}

const hariAntara = (a, b) => {
  if (!a || !b) return null; const x = new Date(a), y = new Date(b);
  if (!isFinite(x) || !isFinite(y)) return null; const d = (y - x) / 86400000;
  return d < 0 ? null : r1(d);
};

// Lama proses tiap produk dari SPK terbit sampai terkirim, dipecah per tahap.
// records: [{ produk, qty, spkTgl, mulai, selesaiProduksi, vendorKirim, vendorKembali, terkirim }] (tanggal atau ISO; boleh kosong bila belum terjadi)
export const produkDari = (deskripsi) => String(deskripsi || '').trim().split(/\s+/).slice(0, 2).join(' ').toUpperCase() || '-';
export function lamaPerProduk(records) {
  const per = {};
  records.forEach((r) => {
    const k = r.produk || '-'; const o = per[k] || (per[k] = { produk: k, item: 0, qty: 0, selesaiProduksi: 0, terkirim: 0, tunggu: [], produksi: [], kirimVendor: [], vendor: [], kirimCustomer: [], total: [] });
    o.item++; o.qty += Number(r.qty) || 0; if (r.selesaiProduksi) o.selesaiProduksi++; if (r.terkirim) o.terkirim++;
    const push = (arr, v) => { if (v != null) arr.push(v); };
    push(o.tunggu, hariAntara(r.spkTgl, r.mulai));
    push(o.produksi, hariAntara(r.mulai, r.selesaiProduksi));
    push(o.kirimVendor, hariAntara(r.selesaiProduksi, r.vendorKirim));
    push(o.vendor, hariAntara(r.vendorKirim, r.vendorKembali));
    push(o.kirimCustomer, hariAntara(r.vendorKembali || r.selesaiProduksi, r.terkirim));
    push(o.total, hariAntara(r.spkTgl, r.terkirim));
  });
  return Object.values(per).map((o) => ({ produk: o.produk, item: o.item, qty: o.qty, selesaiProduksi: o.selesaiProduksi, terkirim: o.terkirim,
    tunggu: rata(o.tunggu), produksi: rata(o.produksi), tungguVendor: rata(o.kirimVendor), vendor: rata(o.vendor), kirim: rata(o.kirimCustomer), total: rata(o.total) }))
    .sort((a, b) => b.item - a.item || a.produk.localeCompare(b.produk));
}

// Barang keluar dan masuk per vendor dan proses, kecepatan, dan daftar yang masih di vendor.
// pengiriman: [{ vendor, proses, tglKirim, tglKembali, qty, reject, noSJ, sisa }]
export function ringkasVendor(pengiriman, hariIni) {
  const per = {};
  pengiriman.forEach((p) => {
    const k = p.vendor + '|' + (p.proses || ''); const o = per[k] || (per[k] = { vendor: p.vendor, proses: p.proses || '', kiriman: 0, selesai: 0, keluar: 0, masuk: 0, reject: 0, sisa: 0, tat: [] });
    o.kiriman++; o.keluar += Number(p.qty) || 0; o.sisa += Number(p.sisa) || 0; o.masuk += Math.max(0, (Number(p.qty) || 0) - (Number(p.sisa) || 0)); o.reject += Number(p.reject) || 0;
    if (p.tglKembali) { o.selesai++; o.tat.push(selisihHariKerja(p.tglKirim, p.tglKembali)); }
  });
  const baris = Object.values(per).map((o) => ({ vendor: o.vendor, proses: o.proses, kiriman: o.kiriman, selesai: o.selesai, keluar: o.keluar, masuk: o.masuk, sisa: o.sisa, reject: o.reject,
    rejectPct: o.keluar > 0 ? r2(o.reject / o.keluar) : null, rataTAT: rata(o.tat), tercepat: o.tat.length ? Math.min(...o.tat) : null, terlama: o.tat.length ? Math.max(...o.tat) : null }))
    .sort((a, b) => a.vendor.localeCompare(b.vendor) || a.proses.localeCompare(b.proses));
  const terbuka = pengiriman.filter((p) => !p.tglKembali && (Number(p.sisa) || 0) > 0).map((p) => ({ noSJ: p.noSJ || '', vendor: p.vendor, proses: p.proses || '', tglKirim: p.tglKirim, sisa: Number(p.sisa) || 0, umur: hariIni ? selisihHariKerja(p.tglKirim, hariIni) : null }))
    .sort((a, b) => (b.umur || 0) - (a.umur || 0));
  return { baris, terbuka };
}

// Menit antara dua jam "HH:MM" pada hari yang sama (null bila salah satu kosong atau urutannya terbalik)
export function menitJam(a, b) {
  const f = (s) => { const m = String(s || '').match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
  const x = f(a), y = f(b); if (x == null || y == null || y < x) return null; return y - x;
}

// Loading dan unloading dari antrian Bongkar Muat: lama tunggu (masuk sampai mulai) dan lama proses (mulai sampai selesai).
// docs: [{ jenis, muatan, pihak, tgl, jamMasuk, jamMulai, jamSelesai, status }]
export function analisaDock(docs, dari, sampai) {
  const dalam = docs.filter((b) => !b.tgl || (b.tgl >= dari && b.tgl <= sampai));
  const grup = (kunci) => {
    const per = {};
    dalam.forEach((b) => {
      const k = kunci(b); const o = per[k.id] || (per[k.id] = { ...k, n: 0, selesai: 0, tunggu: [], proses: [] });
      o.n++; if (b.status === 'Selesai') o.selesai++;
      const t = menitJam(b.jamMasuk, b.jamMulai); if (t != null) o.tunggu.push(t);
      const p = menitJam(b.jamMulai, b.jamSelesai || '') ; if (p != null) o.proses.push(p);
    });
    return Object.values(per).map((o) => ({ ...o, rataTunggu: o.tunggu.length ? Math.round(o.tunggu.reduce((a, b) => a + b, 0) / o.tunggu.length) : null,
      rataProses: o.proses.length ? Math.round(o.proses.reduce((a, b) => a + b, 0) / o.proses.length) : null, terlama: o.proses.length ? Math.max(...o.proses) : null, tunggu: undefined, proses: undefined }))
      .sort((a, b) => b.n - a.n);
  };
  return {
    perJenis: grup((b) => ({ id: b.jenis + '|' + b.muatan, jenis: b.jenis || '', muatan: b.muatan || '' })),
    perPihak: grup((b) => ({ id: b.jenis + '|' + b.pihak, jenis: b.jenis || '', pihak: b.pihak || '' })).slice(0, 10),
    antri: dalam.filter((b) => b.status === 'Antri').length, proses: dalam.filter((b) => b.status === 'Proses').length, selesai: dalam.filter((b) => b.status === 'Selesai').length,
  };
}
