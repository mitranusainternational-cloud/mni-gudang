// Hitungan Maintenance (fungsi murni): akumulasi per periode, ranking mesin, MTBF, dan jadwal rutin.
// Dua jenis dokumen di koleksi `mtc`: kind 'catat' (catatan maintenance) dan kind 'rutin' (jadwal rutin per mesin).
// Lihat documentation/SKEMA_MAINTENANCE.md.

export const JENIS = ['Preventif', 'Korektif', 'Inspeksi', 'Kalibrasi'];
export const STATUS = ['Selesai', 'Dikerjakan', 'Menunggu sparepart'];

const r1 = (x) => Math.round((Number(x) || 0) * 10) / 10;
const tgl10 = (d) => String(d || '').slice(0, 10);
const mdl = (t) => new Date(tgl10(t) + 'T00:00:00');
const selisihHari = (a, b) => Math.round((mdl(b) - mdl(a)) / 86400000);
const tambahHari = (t, k) => { const d = mdl(t); d.setDate(d.getDate() + k); const p2 = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };

export const catatanSaja = (daftar) => (daftar || []).filter((d) => (d.kind || 'catat') === 'catat' && d.status !== 'Batal');
export const rutinSaja = (daftar) => (daftar || []).filter((d) => d.kind === 'rutin' && d.aktif !== false);
const dalam = (d, dari, sampai) => { const t = tgl10(d.tgl); return t >= dari && t <= sampai; };

/** Lama henti mesin (menit): isian langsung, atau dari jam mulai dan selesai bila ada. */
export function downtimeMenit(c) {
  const d = Number(c.downtime);
  if (d > 0) return d;
  if (c.mulai && c.selesai) { const m = (new Date(c.selesai) - new Date(c.mulai)) / 60000; if (isFinite(m) && m > 0) return Math.round(m); }
  return 0;
}
const jumlahPart = (c) => (c.parts || []).reduce((a, p) => a + (Number(p.q) || 0), 0);

/** Ringkasan satu periode: jumlah, jenis, downtime, biaya, sparepart, jumlah mesin. */
export function ringkas(daftar, { dari, sampai }) {
  const L = catatanSaja(daftar).filter((c) => dalam(c, dari, sampai));
  const per = {}; JENIS.forEach((j) => { per[j] = 0; });
  L.forEach((c) => { per[c.jenis] = (per[c.jenis] || 0) + 1; });
  const mesin = new Set(L.map((c) => c.mesin).filter(Boolean));
  const down = L.reduce((a, c) => a + downtimeMenit(c), 0);
  return {
    jumlah: L.length, jenis: per, mesin: mesin.size, downtimeMenit: down, downtimeJam: r1(down / 60),
    biaya: L.reduce((a, c) => a + (Number(c.biaya) || 0), 0), sparepartQty: L.reduce((a, c) => a + jumlahPart(c), 0),
    sparepartJenis: new Set(L.flatMap((c) => (c.parts || []).map((p) => p.sp || p.nama))).size,
    terbuka: L.filter((c) => c.status !== 'Selesai').length,
    denganFoto: L.filter((c) => (c.foto || []).length > 0).length, jumlahFoto: L.reduce((a, c) => a + (c.foto || []).length, 0),
  };
}

/** Rata-rata hari antar kerusakan (korektif) per mesin pada seluruh riwayat; null bila kurang dari dua korektif. */
export function mtbfHari(daftar, mesin) {
  const t = catatanSaja(daftar).filter((c) => c.mesin === mesin && c.jenis === 'Korektif').map((c) => tgl10(c.tgl)).sort();
  if (t.length < 2) return null;
  return r1(selisihHari(t[0], t[t.length - 1]) / (t.length - 1));
}

/** Satu baris per mesin pada periode: frekuensi, korektif, preventif, downtime, sparepart diganti, terakhir. */
export function perMesin(daftar, { dari, sampai }, semuaMesin = []) {
  const L = catatanSaja(daftar); const dalamP = L.filter((c) => dalam(c, dari, sampai)); const peta = {};
  const ambil = (m) => peta[m] || (peta[m] = { mesin: m, wc: '', jumlah: 0, korektif: 0, preventif: 0, inspeksi: 0, kalibrasi: 0, downtimeMenit: 0, biaya: 0, sparepartQty: 0, parts: {}, terakhir: '' });
  dalamP.forEach((c) => {
    const o = ambil(c.mesin || '(tanpa mesin)'); o.wc = o.wc || c.wc || ''; o.jumlah++;
    if (c.jenis === 'Korektif') o.korektif++; else if (c.jenis === 'Preventif') o.preventif++; else if (c.jenis === 'Inspeksi') o.inspeksi++; else if (c.jenis === 'Kalibrasi') o.kalibrasi++;
    o.downtimeMenit += downtimeMenit(c); o.biaya += Number(c.biaya) || 0;
    (c.parts || []).forEach((p) => { const k = p.nama || p.sp; o.parts[k] = (o.parts[k] || 0) + (Number(p.q) || 0); o.sparepartQty += Number(p.q) || 0; });
  });
  L.forEach((c) => { if (peta[c.mesin] && tgl10(c.tgl) > peta[c.mesin].terakhir) peta[c.mesin].terakhir = tgl10(c.tgl); });
  semuaMesin.forEach((m) => { if (m && !peta[m]) ambil(m); });
  const lastAll = {}; L.forEach((c) => { if (!lastAll[c.mesin] || tgl10(c.tgl) > lastAll[c.mesin]) lastAll[c.mesin] = tgl10(c.tgl); });
  return Object.values(peta).map((o) => ({
    ...o, terakhir: lastAll[o.mesin] || '', downtimeJam: r1(o.downtimeMenit / 60), mtbfHari: mtbfHari(daftar, o.mesin),
    partsDaftar: Object.entries(o.parts).sort((a, b) => b[1] - a[1]).map(([nama, q]) => ({ nama, q })),
  })).sort((a, b) => b.jumlah - a.jumlah || b.korektif - a.korektif || a.mesin.localeCompare(b.mesin));
}

/** Riwayat satu mesin, terbaru dulu. */
export function riwayatMesin(daftar, mesin) {
  return catatanSaja(daftar).filter((c) => c.mesin === mesin).sort((a, b) => (tgl10(b.tgl) + (b.at || '')).localeCompare(tgl10(a.tgl) + (a.at || '')));
}

/** Jadwal rutin: terakhir dikerjakan (catatan Selesai dengan rutin yang sama), jatuh tempo, dan status. */
export function statusRutin(daftar, hariIni, { segeraHari = 7 } = {}) {
  const C = catatanSaja(daftar).filter((c) => c.status === 'Selesai');
  return rutinSaja(daftar).map((r) => {
    const sel = C.filter((c) => c.rutin === r._id || (!c.rutin && c.mesin === r.mesin && c.jenis === 'Preventif' && String(c.masalah || c.tindakan || '').toLowerCase().includes(String(r.tugas || '').toLowerCase().slice(0, 12)))).map((c) => tgl10(c.tgl)).sort();
    const terakhir = sel.length ? sel[sel.length - 1] : '';
    const interval = Math.max(1, Number(r.interval) || 30);
    const dasar = terakhir || tgl10(r.mulai || r.tgl || hariIni);
    const jatuhTempo = terakhir ? tambahHari(terakhir, interval) : (r.mulai ? tgl10(r.mulai) : tambahHari(dasar, interval));
    const sisa = selisihHari(hariIni, jatuhTempo);
    return { rutin: r, mesin: r.mesin, tugas: r.tugas, interval, terakhir, jatuhTempo, sisaHari: sisa, status: sisa < 0 ? 'Terlambat' : sisa <= segeraHari ? 'Segera' : 'Aman', kaliSelesai: sel.length };
  }).sort((a, b) => a.sisaHari - b.sisaHari);
}

/** Mesin yang sering rusak: korektif minimal `min` kali dalam `hari` hari terakhir. */
export function seringRusak(daftar, hariIni, { hari = 30, min = 3 } = {}) {
  const dari = tambahHari(hariIni, -(hari - 1)); const peta = {};
  catatanSaja(daftar).filter((c) => c.jenis === 'Korektif' && dalam(c, dari, hariIni)).forEach((c) => { peta[c.mesin] = (peta[c.mesin] || 0) + 1; });
  return Object.entries(peta).filter(([, n]) => n >= min).map(([mesin, n]) => ({ mesin, korektif: n, hari })).sort((a, b) => b.korektif - a.korektif);
}

/** Tren jumlah maintenance per butir waktu (hari, minggu, bulan) untuk grafik batang. */
export function tren(daftar, { dari, sampai }, butir = 'hari') {
  const L = catatanSaja(daftar).filter((c) => dalam(c, dari, sampai)); const peta = {};
  const kunci = (t) => (butir === 'bulan' ? t.slice(0, 7) : butir === 'minggu' ? (() => { const d = mdl(t); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); const p2 = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; })() : t);
  L.forEach((c) => { const k = kunci(tgl10(c.tgl)); const o = peta[k] || (peta[k] = { kunci: k, jumlah: 0, korektif: 0, preventif: 0, downtimeMenit: 0 }); o.jumlah++; if (c.jenis === 'Korektif') o.korektif++; if (c.jenis === 'Preventif') o.preventif++; o.downtimeMenit += downtimeMenit(c); });
  return Object.values(peta).sort((a, b) => a.kunci.localeCompare(b.kunci));
}

/** Butir tren yang sesuai panjang periode. */
export function butirOtomatis(dari, sampai) {
  if (dari === '0000-00-00') return 'bulan';
  const n = selisihHari(dari, sampai) + 1; return n <= 31 ? 'hari' : n <= 120 ? 'minggu' : 'bulan';
}
