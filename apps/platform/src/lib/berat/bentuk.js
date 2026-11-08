// Input item SPK terstruktur: bentuk produk per section, dimensi yang diminta, nama item otomatis, dan berat dari kalkulator.
// Fungsi murni di atas katalog berat (catalog.json dari workbook kalkulator). Pengguna memilih bentuk lalu mengisi W, H, L (atau R, W1 sampai W4);
// teks deskripsi dihasilkan otomatis dengan format yang sama dengan SPK lama sehingga dokumen dan pelacakan item tidak berubah.
import { hitung, parameterBentuk } from './engine.js';
import { massaJenis } from './parser.js';

/** Kelompok bentuk yang sah untuk tiap produk (judul section). Produk tanpa kalkulator (Duct, Support, Wiremesh) kembali kosong: teks bebas. */
export const KELOMPOK_PRODUK = {
  'CABLE TRAY': 'UTAMA',
  'PERFORATED CABLE TRAY': 'UTAMA',
  'CABLE LADDER': 'UTAMA',
  'COVER TRAY': 'COVER',
  'ACCS TRAY': 'AKSESORI',
  'ACCS LADDER': 'AKSESORI',
  'ACCS DUCT': 'AKSESORI',
};
const UTAMA = new Set(['STRAIGHT', 'ELBOW', 'TEE', 'CROSS', 'INSIDE', 'OUTSIDE', 'REDUCER']);
const NAMA = {
  STRAIGHT: 'Straight', ELBOW: 'Elbow 90', TEE: 'Tee', CROSS: 'Cross', INSIDE: 'Inside Riser', OUTSIDE: 'Outside Riser', REDUCER: 'Reducer',
  COVER_STRAIGHT: 'Cover Straight', COVER_ELBOW: 'Cover Elbow', COVER_TEE: 'Cover Tee', COVER_CROSS: 'Cover Cross', COVER_INSIDE: 'Cover Inside', COVER_OUTSIDE: 'Cover Outside', COVER_REDUCER: 'Cover Reducer',
  JOINTING: 'Jointing', HORIZONTAL_FISH_PLATE: 'Horizontal Fish Plate', VERTICAL_FISH_PLATE: 'Vertical Fish Plate', SPLICE_PLATE_SET_FOR_STAND: 'Splice Plate Set',
  BRACKET_SUPPORT: 'Bracket Support', DOUBLE_CHANEEL_BRACKET: 'Double Channel Bracket', DOUBLE_CHANNEL_BRACKET: 'Double Channel Bracket', SINGLE_CHANEEL_BRACKET: 'Single Channel Bracket',
  HANGER_BEAM: 'Hanger Beam', U_CHANNEL_20X20: 'U Channel 20x20', HANGER_CLEVIS: 'Hanger Clevis', COVER_CLAMP: 'Cover Clamp', COVER_CLAMP_HEAVY_DUTY: 'Cover Clamp Heavy Duty',
  SEPARATOR: 'Separator', SUPPORT_SEPARATOR: 'Support Separator', HOLD_DOWN_CLIP: 'Hold Down Clip', HOLD_DOWN_CLAMP: 'Hold Down Clamp', END_STOP: 'End Stop', DROP_OUT: 'Drop Out',
};
const judulKata = (s) => String(s).toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const URUT_DIM = ['w', 'w1', 'w2', 'w3', 'w4', 'h', 'l', 'r'];
const NAMA_DIM = { w: 'W', w1: 'W1', w2: 'W2', w3: 'W3', w4: 'W4', h: 'H', l: 'L', r: 'R' };

/** Kunci bentuk tanpa akhiran keluarga: ELBOW_SLU_R_D (SLU) -> ELBOW. */
export function kunciBentuk(id, keluarga) {
  const i = String(id).indexOf('_' + keluarga);
  return i > 0 ? String(id).slice(0, i) : String(id);
}
export const namaBentuk = (kunci) => NAMA[kunci] || judulKata(kunci);
const produkJudul = (p) => String(p || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Dimensi yang harus diisi pengguna (tanpa tebal, massa jenis, dan "jika w yg kecil" yang dihitung otomatis), berurutan W, H, L, R. */
export function dimensiBentuk(katalog, keluarga, id) {
  return parameterBentuk(katalog, keluarga, id).filter((n) => URUT_DIM.includes(n)).sort((a, b) => URUT_DIM.indexOf(a) - URUT_DIM.indexOf(b)).map((n) => ({ k: n, label: NAMA_DIM[n] }));
}

/** Pengelompokan bentuk: STRAIGHT (batang lurus), FITTING (elbow, tee, cross, riser, reducer), COVER (tutup), AKSESORI (sisanya). */
const FITTING = new Set(['ELBOW', 'TEE', 'CROSS', 'INSIDE', 'OUTSIDE', 'REDUCER']);
export function kelompokBentuk(kunci) {
  if (kunci === 'STRAIGHT') return 'STRAIGHT';
  if (FITTING.has(kunci)) return 'FITTING';
  if (String(kunci).startsWith('COVER_') && kunci !== 'COVER_CLAMP' && kunci !== 'COVER_CLAMP_HEAVY_DUTY') return 'COVER';
  return 'AKSESORI';
}
/** Aturan bawaan section (standar lembar SPK MNI): CABLE TRAY / PERFORATED / LADDER hanya batang lurus; ACCS (Tray, Ladder, Duct) memuat
 *  fitting (elbow, tee, cross, riser, reducer) dan aksesori; COVER TRAY memuat semua tutup. Diganti lewat Master Data (aturanSection). */
export const ATURAN_DEFAULT = {
  'CABLE TRAY': ['STRAIGHT'],
  'PERFORATED CABLE TRAY': ['STRAIGHT'],
  'CABLE LADDER': ['STRAIGHT'],
  'COVER TRAY': ['@COVER'],
  'ACCS TRAY': ['@FITTING', '@AKSESORI'],
  'ACCS LADDER': ['@FITTING', '@AKSESORI'],
  'ACCS DUCT': ['@FITTING', '@AKSESORI'],
};
export const PRODUK_BENTUK = Object.keys(ATURAN_DEFAULT);
/** Apakah bentuk (kunci) boleh dipilih di section produk ini. aturan = { PRODUK: [kunci,...] } dari Master Data; produk yang tidak ada di aturan memakai bawaan. */
export function bentukDiizinkan(produk, kunci, aturan) {
  const p = String(produk || '').toUpperCase();
  const khusus = aturan && Array.isArray(aturan[p]) ? aturan[p] : null;
  if (khusus) return khusus.includes(kunci);
  const d = ATURAN_DEFAULT[p];
  if (!d) return false;
  return d.includes(kunci) || d.includes('@' + kelompokBentuk(kunci));
}
const susun = (katalog, keluarga, b) => { const kunci = kunciBentuk(b.id, keluarga); return { id: b.id, kunci, nama: namaBentuk(kunci), kelompok: kelompokBentuk(kunci), dim: dimensiBentuk(katalog, keluarga, b.id), fullHole: !!(b.keluaran && b.keluaran.realFullHole) }; };
/** Semua bentuk dalam satu keluarga tanpa saringan produk (untuk membaca baris lama dan tabel aturan). */
export function bentukSemua(katalog, keluarga) {
  const fam = katalog && katalog.keluarga && katalog.keluarga[keluarga];
  return fam ? fam.bentuk.map((b) => susun(katalog, keluarga, b)) : [];
}
/** Daftar bentuk untuk satu produk dalam satu keluarga: [{ id, kunci, nama, kelompok, dim:[{k,label}], fullHole }]. */
export function bentukUntukProduk(katalog, keluarga, produk, aturan) {
  if (!PRODUK_BENTUK.includes(String(produk || '').toUpperCase())) return [];
  return bentukSemua(katalog, keluarga).filter((x) => bentukDiizinkan(produk, x.kunci, aturan));
}

/** Teks deskripsi item dari pilihan: "Cable Tray W100xH50xL3000", "Cable Tray Elbow 90 W100xH50xR300", "Hanger Beam W100". */
export function namaItem(produk, kunci, dim, daftarDim) {
  const ukuran = (daftarDim || []).map((d) => (Number.isFinite(+dim[d.k]) && dim[d.k] !== '' && dim[d.k] != null ? d.label + (+dim[d.k]) : d.label + '?')).join('x');
  const utama = UTAMA.has(kunci);
  const bagian = [];
  const dasarAccs = { 'ACCS TRAY': 'Cable Tray', 'ACCS LADDER': 'Cable Ladder', 'ACCS DUCT': 'Cable Duct' }[String(produk || '').toUpperCase()];
  if (!/^ACCS/i.test(produk)) bagian.push(produkJudul(produk));
  else if (FITTING.has(kunci) && dasarAccs) bagian.push(dasarAccs); // fitting di section ACCS: nama tetap memuat jenis tray/ladder/duct (unik dan sama dengan penamaan lama)
  if (!(utama && kunci === 'STRAIGHT') && !(String(kunci).startsWith('COVER_') && kunci === 'COVER_STRAIGHT' && /^COVER/i.test(produk))) bagian.push(namaBentuk(kunci));
  if (ukuran) bagian.push(ukuran);
  return bagian.join(' ').replace(/\s+/g, ' ').trim();
}

/** Berat per pcs dari pilihan terstruktur.
 *  masukan: { keluarga, bentuk (id), dim:{w,h,l,r,w1..w4}, tebal, material, lubang:'standar'|'full' }
 *  hasil: { ok, beratSPK, berat:{...}, params, alasan }  (beratSPK = real tanpa lubang bila ada, selain itu real; full hole bila dipilih dan tersedia) */
export function hitungBentuk(katalog, { keluarga, bentuk, dim = {}, tebal, material, lubang = 'standar' }) {
  const fam = katalog && katalog.keluarga && katalog.keluarga[keluarga];
  const blok = fam && fam.bentuk.find((b) => b.id === bentuk);
  if (!blok) return { ok: false, alasan: 'Bentuk tidak ada di kalkulator.' };
  const mj = massaJenis(material);
  if (!mj) return { ok: false, alasan: 'Material SPK belum dikenali untuk massa jenis (SPHC, SPCC, SS304, SS316, Aluminium).' };
  const t = parseFloat(String(tebal).replace(',', '.'));
  if (!(t > 0)) return { ok: false, alasan: 'Tebal belum dipilih pada section.' };
  const p = { t, bj: mj.bj };
  const hilang = [];
  for (const nm of parameterBentuk(katalog, keluarga, bentuk)) {
    if (nm === 't' || nm === 'bj') continue;
    if (/yg kecil/.test(nm)) { p[nm] = Math.min(+p.w1 || 0, +p.w2 || 0); continue; }
    const v = parseFloat(String(dim[nm]).replace(',', '.'));
    if (Number.isFinite(v) && v > 0) p[nm] = v; else hilang.push(NAMA_DIM[nm] || nm);
  }
  if (hilang.length) return { ok: false, alasan: 'Isi ukuran: ' + hilang.join(', '), params: p };
  const berat = hitung(katalog, keluarga, bentuk, p);
  if (!berat || (berat.real == null && berat.estimasi == null)) return { ok: false, alasan: 'Rumus tidak menghasilkan angka untuk ukuran ini.', params: p };
  const fh = lubang === 'full' && berat.realFullHole != null;
  const beratSPK = fh ? berat.realFullHole : (berat.realLubang ?? berat.real ?? berat.estimasi);
  return { ok: true, beratSPK, berat, params: p, fullHole: fh, material: mj.nama };
}
