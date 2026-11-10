/* Kapasitas aktual mesin: output, laju (pcs per jam kerja mesin), utilisasi, output per jam, proyeksi, dan tren harian.
 * Semua dihitung dari kejadian produksi yang sudah dicatat operator (Mulai, Selesai, Catat); tidak ada input baru.
 * Laju memakai hanya catatan yang punya durasi (jam mulai dan selesai), supaya tidak menebak. */
const MS = 60000;
const p2 = (x) => String(x).padStart(2, '0');
const tglDari = (iso) => { const d = new Date(iso); return isFinite(d) ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` : ''; };
const tglEv = (e) => e.tgl || tglDari(e.at);
const mesinEv = (e) => e.mesin || e.wc;
const bulat = (x, d = 1) => (x == null || !isFinite(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
const geser = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

/* Kinerja satu mesin pada satu tanggal.
 *   kejadian: seluruh kejadian (void sudah dibuang); sesi: sesi berjalan (jenis mulai) di semua mesin;
 *   shiftMenit: menit kerja standar sehari (480 = 8 jam); kapasitasHari: target pcs per hari (0 = belum diatur);
 *   sekarang: ISO waktu saat ini (untuk sesi yang masih berjalan). */
export function kinerjaMesinHari({ kejadian = [], sesi = [], mesin, tgl, sekarang, shiftMenit = 480, kapasitasHari = 0, jamDari = (iso) => new Date(iso).getHours() }) {
  const hasil = kejadian.filter((e) => (e.jenis || 'hasil') === 'hasil' && mesinEv(e) === mesin && tglEv(e) === tgl);
  let qty = 0, reject = 0, menitBerwaktu = 0, qtyBerwaktu = 0, menitCatat = 0;
  const jam = {};
  for (const e of hasil) {
    const q = Number(e.qty) || 0; qty += q; reject += Number(e.reject) || 0;
    const m = e.menit == null || e.menit === '' ? null : Number(e.menit);
    if (m != null && isFinite(m)) { menitCatat += m; if (q > 0) { menitBerwaktu += m; qtyBerwaktu += q; } }
    const j = jamDari(e.selesai || e.at); if (isFinite(j)) jam[j] = (jam[j] || 0) + q;
  }
  const berjalan = sesi.filter((e) => mesinEv(e) === mesin && (e.tgl || tglDari(e.mulai)) === tgl);
  const menitJalan = berjalan.reduce((a, e) => { const d = (new Date(sekarang).getTime() - new Date(e.mulai).getTime()) / MS; return a + (isFinite(d) && d > 0 ? d : 0); }, 0);
  const aktifMenit = menitCatat + menitJalan;
  const lajuPerJam = menitBerwaktu > 0 ? qtyBerwaktu / (menitBerwaktu / 60) : null;
  const targetLaju = kapasitasHari > 0 && shiftMenit > 0 ? kapasitasHari / (shiftMenit / 60) : null;
  const sisaMenit = Math.max(0, shiftMenit - aktifMenit);
  const proyeksi = lajuPerJam == null ? null : qty + (lajuPerJam * sisaMenit) / 60;
  return {
    qty, reject, rejectPct: qty + reject > 0 ? reject / (qty + reject) : null,
    aktifMenit: bulat(aktifMenit), utilisasi: shiftMenit > 0 ? Math.min(1, aktifMenit / shiftMenit) : null,
    lajuPerJam: bulat(lajuPerJam), targetLaju: bulat(targetLaju), lajuVsTarget: lajuPerJam != null && targetLaju ? lajuPerJam / targetLaju : null,
    capaian: kapasitasHari > 0 ? qty / kapasitasHari : null, kapasitasHari,
    proyeksi: proyeksi == null ? null : Math.round(proyeksi), proyeksiVsTarget: proyeksi != null && kapasitasHari > 0 ? proyeksi / kapasitasHari : null,
    catatan: hasil.length, berjalan: berjalan.length, perJam: jam,
  };
}

/* Tren harian satu mesin: n hari berakhir pada `sampai` (urut lama ke baru), hari tanpa catatan tetap tampil nol. */
export function trenMesin({ kejadian = [], mesin, sampai, hari = 7 }) {
  const out = [];
  for (let i = hari - 1; i >= 0; i--) {
    const tgl = geser(sampai, -i); let qty = 0, menit = 0, qb = 0;
    for (const e of kejadian) {
      if ((e.jenis || 'hasil') !== 'hasil' || mesinEv(e) !== mesin || tglEv(e) !== tgl) continue;
      const q = Number(e.qty) || 0; qty += q;
      if (e.menit != null && e.menit !== '' && q > 0) { menit += Number(e.menit); qb += q; }
    }
    out.push({ tgl, qty, menit: bulat(menit), laju: menit > 0 ? bulat(qb / (menit / 60)) : null });
  }
  return out;
}

/* Ringkasan satu work center: gabungan semua mesinnya pada satu tanggal. */
export function ringkasWorkCenter(daftarMesin, hitungMesin) {
  const per = daftarMesin.map((m) => ({ mesin: m, ...hitungMesin(m) }));
  const qty = per.reduce((a, r) => a + r.qty, 0), kap = per.reduce((a, r) => a + (r.kapasitasHari || 0), 0);
  return { per, qty, kapasitas: kap, capaian: kap > 0 ? qty / kap : null, berjalan: per.reduce((a, r) => a + r.berjalan, 0) };
}
