// Statistik Laporan Produksi (fungsi murni): periode, kelompok, tren, dan akumulasi hari ini sampai tahun ini (operator dan mesin).
import { tanpaVoid, tanggalLokal } from './laporan.js';
import { produkDari } from './analisa.js';
import { finishingDari } from './rute.js';

const p2 = (x) => String(x).padStart(2, '0');
const tglStr = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const mdl = (tgl) => new Date(String(tgl).slice(0, 10) + 'T00:00:00');
const geser = (tgl, k) => { const d = mdl(tgl); d.setDate(d.getDate() + k); return tglStr(d); };
const awalMinggu = (tgl) => { const d = mdl(tgl); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return tglStr(d); };

// Rentang tanggal dari kode periode: hari, minggu (Senin sampai hari ini), 7, bulan, 30, tahun, semua
export function periodeRentang(kode, hariIni) {
  const t = String(hariIni).slice(0, 10);
  switch (String(kode)) {
    case 'hari': return { dari: t, sampai: t, label: 'Hari ini' };
    case 'minggu': return { dari: awalMinggu(t), sampai: t, label: 'Minggu ini' };
    case '7': return { dari: geser(t, -6), sampai: t, label: '7 hari terakhir' };
    case '30': return { dari: geser(t, -29), sampai: t, label: '30 hari terakhir' };
    case 'tahun': return { dari: t.slice(0, 4) + '-01-01', sampai: t, label: 'Tahun ini' };
    case 'semua': return { dari: '0000-00-00', sampai: t, label: 'Semua data' };
    default: return { dari: t.slice(0, 8) + '01', sampai: t, label: 'Bulan ini' };
  }
}

const KUNCI = {
  wc: (e) => e.wc || '(tanpa work center)',
  mesin: (e) => e.mesin || e.wc || '(tanpa mesin)',
  operator: (e) => e.operator || '(tanpa operator)',
  produk: (e, produk) => produk(e.item_desc),
  customer: (e) => e.customer || '(tanpa customer)',
  kelompok: (e) => e.kelompok || 'Lainnya',
  tipe: (e) => e.tipe || '(tanpa type)',
  material: (e) => [e.material, e.finishing].filter(Boolean).join(' · ') || '(tanpa material)',
};
const hasilDalam = (kejadian, dari, sampai) => tanpaVoid(kejadian).filter((e) => {
  if ((e.jenis || 'hasil') !== 'hasil') return false; const t = e.tgl || tanggalLokal(e.at); return t >= dari && t <= sampai;
});

// Ringkasan per kelompok (by: wc, mesin, operator, produk, customer)
export function kelompokkan(kejadian, { dari, sampai, by = 'wc', produk = produkDari }) {
  const kunci = KUNCI[by] || KUNCI.wc; const per = {};
  hasilDalam(kejadian, dari, sampai).forEach((e) => {
    const k = kunci(e, produk);
    const o = per[k] || (per[k] = { nama: k, qty: 0, reject: 0, tonase: 0, menit: 0, qtyB: 0, tonB: 0, hari: new Set(), catatan: 0, jeda: [] });
    const q = Number(e.qty) || 0; const tn = Number(e.tonase) || 0;
    o.qty += q; o.reject += Number(e.reject) || 0; o.tonase += tn; o.catatan++; o.hari.add(e.tgl || tanggalLokal(e.at));
    if (e.menit != null && e.menit !== '' && q > 0 && Number(e.menit) > 0) { o.menit += Number(e.menit); o.qtyB += q; o.tonB += tn; }
    if (e.selesai && e.at) { const j = (new Date(e.at) - new Date(e.selesai)) / 60000; if (isFinite(j) && j >= 0) o.jeda.push(j); }
  });
  const rows = Object.values(per);
  const totQ = rows.reduce((a, o) => a + o.qty, 0), totT = rows.reduce((a, o) => a + o.tonase, 0);
  return rows.map((o) => ({
    nama: o.nama, qty: o.qty, reject: o.reject, tonase: r1(o.tonase), catatan: o.catatan, hariAktif: o.hari.size,
    rataHari: o.hari.size ? r1(o.qty / o.hari.size) : 0, rataHariTonase: o.hari.size ? r1(o.tonase / o.hari.size) : 0, jam: r1(o.menit / 60),
    pcsPerJam: o.menit > 0 ? r1(o.qtyB / (o.menit / 60)) : null, kgPerJam: o.menit > 0 && o.tonB > 0 ? r1(o.tonB / (o.menit / 60)) : null,
    menitPerPcs: o.qtyB > 0 ? r2(o.menit / o.qtyB) : null, rejectPct: o.qty + o.reject > 0 ? r2(o.reject / (o.qty + o.reject)) : null,
    pangsaQty: totQ > 0 ? r2(o.qty / totQ) : 0, pangsaTonase: totT > 0 ? r2(o.tonase / totT) : 0,
    jedaCatat: o.jeda.length ? Math.round(o.jeda.reduce((a, b) => a + b, 0) / o.jeda.length) : null,
  })).sort((a, b) => b.qty - a.qty || a.nama.localeCompare(b.nama));
}

// Total seluruh kelompok dalam rentang (untuk ringkasan di atas laporan)
export function totalPeriode(kejadian, { dari, sampai }) {
  const ev = hasilDalam(kejadian, dari, sampai); let qty = 0, reject = 0, tonase = 0, menit = 0, qtyB = 0, tonB = 0; const hari = new Set();
  ev.forEach((e) => {
    const q = Number(e.qty) || 0; const tn = Number(e.tonase) || 0; qty += q; reject += Number(e.reject) || 0; tonase += tn; hari.add(e.tgl || tanggalLokal(e.at));
    if (e.menit != null && e.menit !== '' && q > 0 && Number(e.menit) > 0) { menit += Number(e.menit); qtyB += q; tonB += tn; }
  });
  return { qty, reject, tonase: r1(tonase), hariAktif: hari.size, rataHari: hari.size ? r1(qty / hari.size) : 0, rataHariTonase: hari.size ? r1(tonase / hari.size) : 0,
    jam: r1(menit / 60), pcsPerJam: menit > 0 ? r1(qtyB / (menit / 60)) : null, kgPerJam: menit > 0 && tonB > 0 ? r1(tonB / (menit / 60)) : null,
    rejectPct: qty + reject > 0 ? r2(reject / (qty + reject)) : null, catatan: ev.length };
}

// Butir waktu yang cocok: hari sampai 31 hari, minggu sampai ±6 bulan, selebihnya bulan
export function butirOtomatis(dari, sampai) {
  const d0 = dari === '0000-00-00' ? sampai : dari; const n = Math.round((mdl(sampai) - mdl(d0)) / 86400000) + 1;
  return n <= 31 ? 'hari' : n <= 190 ? 'minggu' : 'bulan';
}

// Deret waktu qty dan tonase per butir (hari, minggu, bulan, tahun); filter opsional wc, mesin, atau operator
export function tren(kejadian, { dari, sampai, butir, wc, mesin, operator }) {
  let ev = hasilDalam(kejadian, dari, sampai);
  if (wc) ev = ev.filter((e) => e.wc === wc);
  if (mesin) ev = ev.filter((e) => (e.mesin || e.wc) === mesin);
  if (operator) ev = ev.filter((e) => e.operator === operator);
  const awal = dari === '0000-00-00' ? (ev.map((e) => e.tgl || tanggalLokal(e.at)).sort()[0] || sampai) : dari;
  const b = butir || butirOtomatis(awal, sampai);
  const kunciDari = (t) => (b === 'hari' ? t : b === 'minggu' ? awalMinggu(t) : b === 'bulan' ? t.slice(0, 7) : t.slice(0, 4));
  const urutan = []; const lihat = new Set();
  for (let t = awal; t <= sampai; t = geser(t, 1)) { const k = kunciDari(t); if (!lihat.has(k)) { lihat.add(k); urutan.push(k); } }
  const isi = {}; urutan.forEach((k) => { isi[k] = { qty: 0, tonase: 0 }; });
  ev.forEach((e) => { const o = isi[kunciDari(e.tgl || tanggalLokal(e.at))]; if (o) { o.qty += Number(e.qty) || 0; o.tonase += Number(e.tonase) || 0; } });
  return { butir: b, titik: urutan.map((k) => ({ kunci: k, qty: isi[k].qty, tonase: r1(isi[k].tonase) })) };
}

// Akumulasi per operator, mesin, dan lainnya: hari ini, minggu ini, bulan ini, tahun ini, dan seluruhnya (qty dan tonase)
export function akumulasi(kejadian, { by = 'operator', sampai, produk = produkDari }) {
  const kunci = KUNCI[by] || KUNCI.operator; const t = String(sampai).slice(0, 10);
  const jendela = { hari: [t, t], minggu: [awalMinggu(t), t], bulan: [t.slice(0, 8) + '01', t], tahun: [t.slice(0, 4) + '-01-01', t], total: ['0000-00-00', t] };
  const per = {};
  hasilDalam(kejadian, '0000-00-00', t).forEach((e) => {
    const k = kunci(e, produk);
    const o = per[k] || (per[k] = { nama: k, hariQty: {}, w: Object.fromEntries(Object.keys(jendela).map((j) => [j, { qty: 0, tonase: 0 }])) });
    const tg = e.tgl || tanggalLokal(e.at); const q = Number(e.qty) || 0; const tn = Number(e.tonase) || 0;
    o.hariQty[tg] = (o.hariQty[tg] || 0) + q;
    Object.entries(jendela).forEach(([j, [a, z]]) => { if (tg >= a && tg <= z) { o.w[j].qty += q; o.w[j].tonase += tn; } });
  });
  const baris = Object.values(per).map((o) => {
    const hari = Object.keys(o.hariQty).length; const w = Object.fromEntries(Object.entries(o.w).map(([j, v]) => [j, { qty: v.qty, tonase: r1(v.tonase) }]));
    return { nama: o.nama, ...w, hariAktif: hari, rataHari: hari ? r1(o.w.total.qty / hari) : 0, terbaik: Math.max(0, ...Object.values(o.hariQty)) };
  }).sort((a, b) => b.total.qty - a.total.qty || a.nama.localeCompare(b.nama));
  const jumlah = Object.fromEntries(Object.keys(jendela).map((j) => [j, { qty: baris.reduce((a, r) => a + r[j].qty, 0), tonase: r1(baris.reduce((a, r) => a + r[j].tonase, 0)) }]));
  return { baris, jumlah };
}

// ---------------------------------------------------------------------------------------------
// Klasifikasi produk: kelompok (Cable Tray, Cable Ladder, Cable Duct, Cover, Aksesoris), type (STU, STC, SLU, SLW, SLHD), finishing, material
// Dibaca dari judul section SPK dan deskripsi item; material dari SPK. Tidak ada input tambahan dari operator.
// ---------------------------------------------------------------------------------------------
const AKSESORIS = /(ELBOW|TEE|CROSS|REDUCER|BRACKET|CLAMP|HANGER|JOINTING|SUPPORT|COUPLER|SPLICE|FLANGE|ACCS)/;
export function klasifikasi(judul, deskripsi, material) {
  const H = String(judul || '').toUpperCase(), D = String(deskripsi || '').toUpperCase();
  let kelompok = 'Lainnya', induk = '';
  if (/ACCS|ACCESS|OTHER\s+SUPPORT/.test(H)) { kelompok = 'Aksesoris'; induk = /LADDER/.test(H) ? 'Ladder' : /DUCT/.test(H) ? 'Duct' : /TRAY/.test(H) ? 'Tray' : ''; }
  else if (/COVER/.test(H)) kelompok = 'Cover';
  else if (/CABLE\s+LADDER/.test(H)) kelompok = 'Cable Ladder';
  else if (/CABLE\s+TRAY|PERFORATED/.test(H)) kelompok = 'Cable Tray';
  else if (/CABLE\s+DUCT/.test(H)) kelompok = 'Cable Duct';
  else if (AKSESORIS.test(D)) kelompok = 'Aksesoris';
  else if (/CABLE\s+LADDER/.test(D)) kelompok = 'Cable Ladder';
  else if (/CABLE\s+TRAY/.test(D)) kelompok = 'Cable Tray';
  else if (/CABLE\s+DUCT/.test(D)) kelompok = 'Cable Duct';
  else if (/COVER/.test(D)) kelompok = 'Cover';
  const tm = H.match(/TYPE\s+([A-Z0-9-]+)/);
  const tm2 = tm ? null : H.match(/(?:^|[^A-Z])(STU|STC|SLU|SLW|SLHD|SLC)(?:[^A-Z]|$)/);
  const tipe = tm ? tm[1] : tm2 ? tm2[1] : '';
  const fin = finishingDari(H) || (/NON\s+FINISHING/.test(H) ? 'Non finishing' : '');
  return { kelompok, induk, tipe: tipe || '', finishing: fin, material: String(material || '').toUpperCase() };
}

const NAMA_SUMBU = { kelompok: (e) => e.kelompok || 'Lainnya', tipe: (e) => e.tipe || '(tanpa type)', material: (e) => [e.material, e.finishing].filter(Boolean).join(' · ') || '(tanpa material)' };

function agregat(ev) {
  let qty = 0, reject = 0, tonase = 0, menit = 0, qtyB = 0, tonB = 0; const hari = new Set();
  ev.forEach((e) => {
    const q = Number(e.qty) || 0, tn = Number(e.tonase) || 0; qty += q; reject += Number(e.reject) || 0; tonase += tn; hari.add(e.tgl || tanggalLokal(e.at));
    if (e.menit != null && e.menit !== '' && q > 0 && Number(e.menit) > 0) { menit += Number(e.menit); qtyB += q; tonB += tn; }
  });
  return { qty, reject, tonase: r1(tonase), hariAktif: hari.size, rataHari: hari.size ? r1(qty / hari.size) : 0, jam: r1(menit / 60),
    pcsPerJam: menit > 0 ? r1(qtyB / (menit / 60)) : null, kgPerJam: menit > 0 && tonB > 0 ? r1(tonB / (menit / 60)) : null, menitPerPcs: qtyB > 0 ? r2(menit / qtyB) : null,
    rejectPct: qty + reject > 0 ? r2(reject / (qty + reject)) : null };
}

// Pohon produk: kelompok, lalu type, lalu material dan finishing. Hasil dibentangkan (depth 0, 1, 2) siap ditampilkan berindentasi.
// Setiap simpul punya qty, tonase, kecepatan, dan pangsa terhadap seluruhnya; saudara diurutkan dari qty terbesar.
export function pohonProduk(kejadian, { dari, sampai, sumbu = ['kelompok', 'tipe', 'material'], urut = 'qty' }) {
  const ev = hasilDalam(kejadian, dari, sampai); const out = [];
  const total = ev.reduce((a, e) => a + (Number(e.qty) || 0), 0), totalTon = ev.reduce((a, e) => a + (Number(e.tonase) || 0), 0);
  const turun = (daftar, level, jalur) => {
    const nama = NAMA_SUMBU[sumbu[level]]; const grup = {};
    daftar.forEach((e) => { const k = nama(e); (grup[k] = grup[k] || []).push(e); });
    Object.entries(grup).map(([k, xs]) => ({ k, xs, a: agregat(xs) })).sort((x, y) => y.a[urut] - x.a[urut] || y.a.qty - x.a.qty || x.k.localeCompare(y.k)).forEach(({ k, xs, a }) => {
      out.push({ depth: level, nama: k, jalur: [...jalur, k].join(' > '), ...a, pangsaQty: total > 0 ? r2(a.qty / total) : 0, pangsaTonase: totalTon > 0 ? r2(a.tonase / totalTon) : 0, punyaAnak: level < sumbu.length - 1 });
      if (level < sumbu.length - 1) turun(xs, level + 1, [...jalur, k]);
    });
  };
  turun(ev, 0, []);
  return out;
}
