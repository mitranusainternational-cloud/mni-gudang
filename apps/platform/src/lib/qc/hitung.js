/* Pustaka murni QC (Daily Check Sheet, DCS). Tanpa akses DOM atau database; dipakai layar QC, dokumen, dan uji.
 * Format mengikuti DCS MNI: standar (Thickness, W, H, L/R), ukuran aktual sebelum finishing (QC Proses), ukuran aktual finishing dan
 * visual (QC Akhir), jumlah cacat visual, jointing fit to tray, repaired, dan judgment. */

export const KUNCI_UKUR = ['t', 'w', 'h', 'l'];
export const LABEL_UKUR = { t: 'Thickness', w: 'W', h: 'H', l: 'L / R' };
export const CACAT = [
  ['crack', 'Crack'], ['burr', 'Burry'], ['porosity', 'Porosity'], ['rusty', 'Rusty'], ['peel', 'Peel off'], ['scratch', 'Scratch'],
];
/* Toleransi awal (mm). Admin dapat mengganti di setting `qcToleransi`; angka ini perlu dikonfirmasi tim QC sesuai standar customer. */
export const TOLERANSI_AWAL = { t: 0.15, w: 2, h: 2, l: 3 };

/* Profil toleransi dan sumbernya. Hanya angka yang punya dasar tercatat yang berupa aturan; sisanya nilai awal MNI yang perlu dikonfirmasi tim QC. */
/* Tebal pelat baja canai panas (SPHC, JIS G 3131): batas JIS G 3193 (2019) sebagaimana dikutip katalog Kobelco, untuk tebal 1,60 mm ke atas. Di bawah 1,60 mm belum ada acuan terverifikasi. */
const BAND_TEBAL_JIS = [[1.6, 2.0, 0.19], [2.0, 2.5, 0.2], [2.5, 3.15, 0.22], [3.15, 4.0, 0.24]];
export const tolTebalJis = (t) => { const x = Number(t); if (!Number.isFinite(x)) return null; const b = BAND_TEBAL_JIS.find(([a, z]) => x >= a && x < z); return b ? b[2] : null; };
/* NEMA VE 1-2017 / CSA C22.2 No. 126.1-17: panjang lurus (tidak termasuk konektor) 3 m dan 3,66 m ±15 mm, 6 m dan 7,32 m ±19 mm; lebar dalam ±6 mm; kedalaman ±10 mm. Berlaku untuk tray lurus. */
const lurusNama = (d) => /^(perforated\s+)?(cable\s+(tray|ladder|duct)|cover\s+(tray|ladder|duct))\s+w\d/i.test(String(d || '')) && !/elbow|tee|cross|riser|reducer|bend|fitting/i.test(String(d || ''));
const RUMUS = {
  mni: { t: (std) => tolTebalJis(std) },
  nema: { t: (std) => tolTebalJis(std), w: () => 6, h: () => 10, l: (std) => (std != null && std > 3660 ? 19 : 15) },
};
export const PROFIL_TOLERANSI = {
  mni: { label: 'Gambar kerja MNI', t: 0.15, w: 2, h: 2, l: 3, sumber: 'Gambar kerja MNI: "Dimension Tolerance : 1mm - 3mm" (W dan H diambil 2 mm, L dan R 3 mm). Tebal 1,6 mm ke atas: JIS G 3193 (2019) via katalog Kobelco (1,60 sampai di bawah 2,00 = ±0,19; 2,00 sampai di bawah 2,50 = ±0,20; 2,50 sampai di bawah 3,15 = ±0,22); di bawah 1,6 mm: ±0,15 nilai awal, perlu konfirmasi.' },
  nema: { label: 'NEMA VE 1-2017', t: 0.15, w: 6, h: 10, l: 15, sumber: 'NEMA VE 1-2017 / CSA C22.2 No. 126.1-17 untuk tray lurus: lebar dalam ±6 mm (pasal 4.3.3), kedalaman ±10 mm (4.3.4), panjang 3 m dan 3,66 m ±15 mm, 6 m dan 7,32 m ±19 mm (4.3.2). Fitting dan aksesoris tidak diatur: memakai nilai MNI. Tebal: JIS G 3193 seperti profil MNI.' },
  kustom: { label: 'Kustom', sumber: 'Toleransi diatur sendiri oleh admin.' },
};
/** Toleransi (mm) untuk satu kolom ukur pada satu baris: aturan profil bila ada dasarnya, selain itu angka pada pengaturan. */
export function tolUntuk(b, k, setting) {
  const base = toleransiAktif(setting);
  const pr = (setting && setting.profil) || 'mni';
  const r = RUMUS[pr];
  if (!r || !r[k]) return base[k];
  if (pr === 'nema' && ['w', 'h', 'l'].includes(k) && !lurusNama(b && b.d)) return base[k];
  const v = r[k](b && b.std ? b.std[k] : null);
  return v == null ? base[k] : v;
}
/** Teks acuan toleransi untuk dokumen: profil, angka, dan sumbernya. */
export function acuanToleransi(setting) {
  const p = PROFIL_TOLERANSI[(setting && setting.profil) || 'mni'] || PROFIL_TOLERANSI.mni;
  const tol = toleransiAktif(setting);
  const f = (x) => String(x).replace('.', ',');
  const pr = (setting && setting.profil) || 'mni';
  const angka = pr === 'nema' ? `W ±6 · H ±10 · L ±15 (3 m, 3,66 m) / ±19 (6 m, 7,32 m) mm untuk tray lurus; T per JIS G 3193 (≥1,6 mm), lainnya T ±${f(tol.t)} · W/H ±${f(tol.w)} · L/R ±${f(tol.l)} mm` : pr === 'mni' ? `W/H ±${f(tol.w)} · L/R ±${f(tol.l)} mm; T per JIS G 3193 (≥1,6 mm), lainnya ±${f(tol.t)} mm` : `T ±${f(tol.t)} · W/H ±${f(tol.w)} · L/R ±${f(tol.l)} mm`;
  return { label: p.label, sumber: p.sumber, angka };
}
/** Standar material dari teks material SPK (hanya yang tercatat di gambar kerja MNI). */
export const standarMaterial = (m) => (/SPHC/i.test(String(m || '')) ? 'SPHC (JIS G3131)' : String(m || ''));

const num = (v) => { if (v === '' || v == null) return null; const x = Number(String(v).replace(',', '.')); return Number.isFinite(x) ? x : null; };
const r3 = (x) => Math.round(x * 1000) / 1000;

export const toleransiAktif = (t) => ({ ...TOLERANSI_AWAL, ...Object.fromEntries(Object.entries(t || {}).map(([k, v]) => [k, num(v)]).filter(([, v]) => v != null && v >= 0)) });

/** Tebal (mm) dari judul section, mis. "CABLE TRAY TYPE STU 1.8 HOT DIP GALVANIZED" -> 1.8. Kosong bila tidak ada. */
export function tebalDariJudul(h) {
  const s = String(h || '').toUpperCase();
  const m = s.match(/(?:^|[\s(])(\d{1,2}[.,]\d{1,2})(?=\s|$|\))/) || s.match(/(\d{1,2}(?:[.,]\d+)?)\s*MM\b/);
  return m ? num(m[1]) : null;
}

/** Ukuran W, H, L, R dari nama item, mis. "Cable Tray W400xH100xL3000 mm" atau "Elbow Tray W50xH50xR150 mm". L dan R dipakai sebagai kolom "L / R". */
export function ukuranDariNama(d) {
  /* nama bentuk bercabang (Tee: W1.100xW2.100) tidak dibaca dari nama agar tidak menebak; dimensi tersimpan di item dipakai lebih dulu */
  const s = String(d || '').replace(/([WHLR])\d\.(?=\d)/gi, '$1#');
  const ambil = (k) => { const m = s.match(new RegExp('(?:^|[^A-Za-z]|(?<=\\d)[xX])' + k + '\\s?(\\d+(?:[.,]\\d+)?)', 'i')); return m ? num(m[1]) : null; };
  const w = ambil('W'), h = ambil('H'), l = ambil('L'), r = ambil('R');
  return { w, h, l: l != null ? l : r };
}

/** Standar satu item: tebal dari judul section, W/H/L dari dimensi tersimpan di item (bila ada) atau dari nama. */
export function standarItem(it) {
  const dim = it && it.dim ? it.dim : null;
  const n = ukuranDariNama(it && it.d);
  const pilih = (a, b) => (a != null && a !== '' ? num(a) : b);
  return {
    t: tebalDariJudul(it && it.g),
    w: pilih(dim && dim.w, n.w),
    h: pilih(dim && dim.h, n.h),
    l: pilih(dim && (dim.l != null ? dim.l : dim.r), n.l),
  };
}

/** Tebal lapisan galvanis minimum (rata-rata, µm) untuk finishing hot-dip galvanized.
 *  ASTM A123 Tabel 1 kategori strip/bar/plate (nilai dari AGA Inspection Guide): baja <1,6 mm = 45; 1,6 sampai <3,2 mm = 65; 3,2 mm ke atas = 75.
 *  EN ISO 1461:2022 (pilihan, nilai dari ringkasan galvanizer): <1,5 mm = 35 lokal / 45 rata-rata; 1,5 sampai 3 mm = 45 / 55; >3 sampai 6 mm = 55 / 70; >6 mm = 70 / 85.
 *  Dipilih lewat setting.stdLapisan ('astm' bawaan atau 'iso'). Finishing lain: tidak ada acuan terverifikasi (null). */
export function lapisanMin(g, tebal, setting) {
  const H = String(g || '').toUpperCase();
  if (!/HOT\s?DIP|HDG/.test(H)) return null;
  const t = Number(tebal);
  if (!Number.isFinite(t) || t <= 0) return null;
  if (setting && setting.stdLapisan === 'iso') {
    const [lokal, rata] = t < 1.5 ? [35, 45] : t <= 3 ? [45, 55] : t <= 6 ? [55, 70] : [70, 85];
    return { jenis: 'HDG', min: rata, lokal, standar: 'iso', sumber: 'EN ISO 1461:2022 (rata-rata minimum; lokal minimum ' + lokal + ' µm)' };
  }
  return { jenis: 'HDG', min: t < 1.6 ? 45 : t < 3.2 ? 65 : 75, standar: 'astm', sumber: 'ASTM A123 Tabel 1 (strip/bar/plate)' };
}

/** Penandaan produk menurut NEMA VE 1-2017 pasal 6.1.2 yang dapat ditentukan dari judul section: tipe finishing dan Ventilated/Nonventilated. */
export function penandaanItem(g, d) {
  const H = String(g || '').toUpperCase(), N = String(d || '').toUpperCase();
  let finishing = '';
  if (/HOT\s?DIP|HDG/.test(H)) finishing = 'Tipe 1 · hot-dip galvanized (ASTM A123)';
  else if (/ELECTRO|\bELG\b/.test(H)) finishing = 'Tipe 3 · elektro-zinc (ASTM B633, SC 2 min.)';
  else if (/POWDER|PDC/.test(H)) finishing = 'Powder coating';
  else if (/STAINLESS|SS ?3\d\d/.test(H)) finishing = 'Stainless steel';
  else if (/ALU/.test(H)) finishing = 'Aluminium';
  else if (/NON FINISH|NATURAL/.test(H)) finishing = 'Natural (tanpa finishing)';
  const ventilasi = /PERFORATED|LADDER/.test(H) || /LADDER/.test(N) ? 'Ventilated' : /DUCT/.test(H) ? 'Nonventilated' : '';
  return { finishing, ventilasi };
}

/** Baris kosong QC untuk semua item SPK (standar terisi otomatis). */
export function barisDariSpk(spk) {
  return ((spk && spk.items) || []).map((it, ix) => ({
    ix, d: it.d, g: it.g || '', q: +it.q || 0, u: it.u || '', w: +it.w || 0,
    std: standarItem(it), stdLap: lapisanMin(it.g, standarItem(it).t), lapisan: '', proses: {}, akhir: {}, visual: {}, jointing: '', repaired: 0, sesuaiStandar: false, ket: '',
  }));
}

/** Satu angka aktual terhadap standar: { ada, ok, sel }. Standar kosong = tidak dinilai. */
export function nilaiUkur(akt, std, tol) {
  const a = num(akt), s = num(std);
  if (a == null) return { ada: false, ok: null, sel: null };
  if (s == null) return { ada: true, ok: null, sel: null };
  const sel = r3(a - s);
  return { ada: true, ok: Math.abs(sel) <= tol + 1e-9, sel };
}

export const jumlahCacat = (v) => CACAT.reduce((a, [k]) => a + Math.max(0, num(v && v[k]) || 0), 0);

/** Judgment satu baris. luar = daftar angka di luar toleransi. qtyLulus = jumlah pcs yang lulus (cacat belum diperbaiki dikurangkan). */
export function judgmentBaris(b, tolIn) {
  const luar = [];
  let diukur = 0;
  for (const tahap of ['proses', 'akhir']) {
    for (const k of KUNCI_UKUR) {
      const x = nilaiUkur(b[tahap] && b[tahap][k], b.std && b.std[k], tolUntuk(b, k, tolIn));
      if (x.ada) diukur++;
      if (x.ok === false) luar.push({ tahap, k, std: b.std[k], aktual: num(b[tahap][k]), sel: x.sel });
    }
  }
  const lap = num(b.lapisan);
  const sl = lapisanMin(b.g, b.std && b.std.t, tolIn);
  if (sl && lap != null) { diukur++; if (lap < sl.min) luar.push({ tahap: 'akhir', k: 'lap', std: sl.min, aktual: lap, sel: r3(lap - sl.min) }); }
  const cacat = jumlahCacat(b.visual), repaired = Math.max(0, num(b.repaired) || 0);
  const sisaCacat = Math.max(0, cacat - repaired);
  const adaAkhir = KUNCI_UKUR.some((k) => num(b.akhir && b.akhir[k]) != null) || cacat > 0 || !!b.jointing || !!b.sesuaiStandar || lap != null;
  const adaProses = KUNCI_UKUR.some((k) => num(b.proses && b.proses[k]) != null) || !!b.sesuaiStandar;
  let judgment;
  if (!adaAkhir && !adaProses) judgment = 'Belum';
  else if (luar.length || sisaCacat > 0 || b.jointing === 'Tidak') judgment = 'NG';
  else if (cacat > 0) judgment = 'OK setelah repair';
  else judgment = 'OK';
  const q = +b.q || 0;
  const qtyLulus = judgment === 'Belum' || luar.length || b.jointing === 'Tidak' ? 0 : Math.max(0, q - sisaCacat);
  return { judgment, luar, cacat, repaired, sisaCacat, diukur, qtyLulus, sesuaiStandar: !!b.sesuaiStandar && diukur === 0 };
}

/** Ringkasan dokumen: hasil keseluruhan, persentase lulus (First Pass Yield per qty), pareto cacat, tonase lulus. */
export function ringkasQC(doc, tolIn) {
  const baris = (doc && doc.baris) || [];
  const hasil = baris.map((b) => judgmentBaris(b, tolIn));
  const qty = baris.reduce((a, b) => a + (+b.q || 0), 0);
  const qtyLulus = hasil.reduce((a, h) => a + h.qtyLulus, 0);
  const periksa = hasil.filter((h) => h.judgment !== 'Belum').length;
  const ng = hasil.filter((h) => h.judgment === 'NG').length;
  const perCacat = Object.fromEntries(CACAT.map(([k]) => [k, baris.reduce((a, b) => a + Math.max(0, num(b.visual && b.visual[k]) || 0), 0)]));
  const tonaseLulus = r3(baris.reduce((a, b, i) => a + hasil[i].qtyLulus * (+b.w || 0), 0));
  const tonase = r3(baris.reduce((a, b) => a + (+b.q || 0) * (+b.w || 0), 0));
  let hasilDok;
  if (!baris.length || periksa === 0) hasilDok = 'Belum diperiksa';
  else if (periksa < baris.length) hasilDok = 'Sebagian diperiksa';
  else if (ng === 0) hasilDok = 'Lulus';
  else hasilDok = 'Belum lulus';
  return {
    n: baris.length, periksa, ng, ok: hasil.filter((h) => h.judgment === 'OK').length, repair: hasil.filter((h) => h.judgment === 'OK setelah repair').length,
    qty, qtyLulus, pctLulus: qty ? Math.round((qtyLulus / qty) * 1000) / 10 : null, perCacat, cacatTotal: Object.values(perCacat).reduce((a, x) => a + x, 0),
    tonase, tonaseLulus, hasil: hasilDok, sertifikat: hasilDok === 'Lulus', perBaris: hasil,
  };
}

/** Status alur dokumen QC dari isi baris: Menunggu QC Proses, Proses OK (menunggu finishing atau QC Akhir), Selesai. */
export function statusQC(doc) {
  const baris = (doc && doc.baris) || [];
  if (!baris.length) return 'Menunggu QC Proses';
  const adaProses = (b) => KUNCI_UKUR.some((k) => num(b.proses && b.proses[k]) != null) || !!b.sesuaiStandar;
  const adaAkhir = (b) => KUNCI_UKUR.some((k) => num(b.akhir && b.akhir[k]) != null) || jumlahCacat(b.visual) > 0 || !!b.jointing || !!b.sesuaiStandar || num(b.lapisan) != null;
  if (baris.every(adaAkhir)) return 'Selesai';
  if (baris.every(adaProses)) return 'Menunggu QC Akhir';
  if (baris.some(adaProses) || baris.some(adaAkhir)) return 'QC Proses berjalan';
  return 'Menunggu QC Proses';
}

/** Nomor dokumen QC berikutnya: QC/2026/11/001 (seri per bulan). */
export function nomorQC(daftarNo, tgl) {
  const d = String(tgl || '').slice(0, 7).split('-');
  const pre = `QC/${d[0]}/${d[1]}/`;
  const maks = (daftarNo || []).filter((x) => String(x).startsWith(pre)).reduce((a, x) => Math.max(a, parseInt(String(x).slice(pre.length), 10) || 0), 0);
  return pre + String(maks + 1).padStart(3, '0');
}
