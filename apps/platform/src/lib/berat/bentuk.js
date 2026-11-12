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
  'CABLE DUCT': 'UTAMA',
  'ACCS TRAY': 'FITTING',
  'ACCS LADDER': 'FITTING',
  'ACCS DUCT': 'FITTING',
  'COVER TRAY': 'COVER',
  'COVER LADDER': 'COVER',
  'COVER DUCT': 'COVER',
  'OTHER SUPPORT': 'AKSESORI',
};
const UTAMA = new Set(['STRAIGHT', 'ELBOW', 'TEE', 'CROSS', 'INSIDE', 'OUTSIDE', 'REDUCER']);
const NAMA = {
  STRAIGHT: 'Straight', ELBOW: 'Elbow 90', TEE: 'Tee', CROSS: 'Cross', INSIDE: 'Inside Riser', OUTSIDE: 'Outside Riser', REDUCER: 'Reducer',
  COVER_STRAIGHT: 'Cover Straight', COVER_ELBOW: 'Cover Elbow', COVER_TEE: 'Cover Tee', COVER_CROSS: 'Cover Cross', COVER_INSIDE: 'Cover Inside Riser', COVER_OUTSIDE: 'Cover Outside Riser', COVER_REDUCER: 'Cover Reducer',
  JOINTING: 'Jointing', HORIZONTAL_FISH_PLATE: 'Horizontal Fish Plate', VERTICAL_FISH_PLATE: 'Vertical Fish Plate', SPLICE_PLATE_SET_FOR_STAND: 'Splice Plate Set',
  BRACKET_SUPPORT: 'Bracket Support', DOUBLE_CHANEEL_BRACKET: 'Double Channel Bracket', DOUBLE_CHANNEL_BRACKET: 'Double Channel Bracket', SINGLE_CHANEEL_BRACKET: 'Single Channel Bracket',
  HANGER_BEAM: 'Hanger Beam', U_CHANNEL_20X20: 'U Channel 20x20', HANGER_CLEVIS: 'Hanger Clevis', COVER_CLAMP: 'Cover Clamp', COVER_CLAMP_HEAVY_DUTY: 'Cover Clamp Heavy Duty',
  SEPARATOR: 'Separator', SUPPORT_SEPARATOR: 'Support Separator', HOLD_DOWN_CLIP: 'Hold Down Clip', HOLD_DOWN_CLAMP: 'Hold Down Clamp', END_STOP: 'End Stop', DROP_OUT: 'Drop Out',
};
const judulKata = (s) => String(s).toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const URUT_DIM = ['w', 'w1', 'w2', 'w3', 'w4', 'h', 'l', 'r'];
const NAMA_DIM = { w: 'W', w1: 'W1', w2: 'W2', w3: 'W3', w4: 'W4', h: 'H', l: 'L', r: 'R' };

/** Kunci bentuk tanpa akhiran keluarga: ELBOW_SLU_R_D (SLU) -> ELBOW. */
/** Salah ketik di katalog asli: bentuk jenis SLHDC kadang berakhiran _SLHC (mis. VERTICAL_FISH_PLATE_SLHC); dianggap jenis yang sama. */
const SUFIKS_ALIAS = { SLHDC: ['SLHC'] };
export function kunciBentuk(id, keluarga) {
  for (const sfx of [keluarga, ...(SUFIKS_ALIAS[keluarga] || [])]) {
    const i = String(id).indexOf('_' + sfx);
    if (i > 0) return String(id).slice(0, i);
  }
  return String(id);
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
/** Aturan bawaan section (keputusan pemilik 2026-11-12):
 *  - CABLE TRAY, PERFORATED CABLE TRAY, CABLE LADDER, CABLE DUCT: hanya Straight (Cable Duct seperti Cable Tray tanpa lubang, masukan berat sama);
 *  - ACCS TRAY, ACCS LADDER, ACCS DUCT: Elbow, Inside Riser, Outside Riser, Tee, Cross, Reducer;
 *  - COVER TRAY, COVER LADDER, COVER DUCT: Cover (Tray, Ladder, atau Duct), Cover Elbow, Cover Inside Riser, Cover Outside Riser, Cover Tee, Cover Cross, Cover Reducer;
 *  - OTHER SUPPORT: Jointing, Fish Plate, Splice Plate Set, Bracket, Hanger Beam, U Channel, Hanger Clevis, Cover Clamp, Separator, Hold Down, End Stop, Drop Out;
 *    struktur (keluarga) mengikuti type section. Diganti lewat Master Data (aturanSection). */
export const ATURAN_DEFAULT = {
  'CABLE TRAY': ['STRAIGHT'],
  'PERFORATED CABLE TRAY': ['STRAIGHT'],
  'CABLE LADDER': ['STRAIGHT'],
  'CABLE DUCT': ['STRAIGHT'],
  'ACCS TRAY': ['@FITTING'],
  'ACCS LADDER': ['@FITTING'],
  'ACCS DUCT': ['@FITTING'],
  'COVER TRAY': ['@COVER'],
  'COVER LADDER': ['@COVER'],
  'COVER DUCT': ['@COVER'],
  'OTHER SUPPORT': ['@AKSESORI'],
};
/** Produk yang tidak memakai lubang sama sekali (Cable Duct): memakai kolom berat tanpa lubang di kalkulator. */
export const PRODUK_TANPA_LUBANG = new Set(['CABLE DUCT']);
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
/** Urutan tampil bentuk di pilihan (sama dengan urutan yang diminta pemilik); bentuk lain mengikuti di belakang sesuai katalog. */
const URUTAN_BENTUK = [
  'STRAIGHT',
  'ELBOW', 'INSIDE', 'OUTSIDE', 'TEE', 'CROSS', 'REDUCER',
  'COVER_STRAIGHT', 'COVER_ELBOW', 'COVER_INSIDE', 'COVER_OUTSIDE', 'COVER_TEE', 'COVER_CROSS', 'COVER_REDUCER',
  'JOINTING', 'HORIZONTAL_FISH_PLATE', 'VERTICAL_FISH_PLATE', 'SPLICE_PLATE_SET_FOR_STAND', 'BRACKET_SUPPORT', 'DOUBLE_CHANEEL_BRACKET', 'DOUBLE_CHANNEL_BRACKET',
  'SINGLE_CHANEEL_BRACKET', 'SINGLE_CHANNEL_BRACKET', 'HANGER_BEAM', 'U_CHANNEL_20X20', 'HANGER_CLEVIS', 'COVER_CLAMP', 'COVER_CLAMP_HEAVY_DUTY', 'SEPARATOR',
  'SUPPORT_SEPARATOR', 'HOLD_DOWN_CLAMP', 'HOLD_DOWN_CLIP', 'END_STOP', 'DROP_OUT',
];
const urut = (x) => { const i = URUTAN_BENTUK.indexOf(x.kunci); return i < 0 ? 999 : i; };
export function bentukUntukProduk(katalog, keluarga, produk, aturan) {
  if (!PRODUK_BENTUK.includes(String(produk || '').toUpperCase())) return [];
  return bentukSemua(katalog, keluarga).filter((x) => bentukDiizinkan(produk, x.kunci, aturan))
    .map((x) => (x.kunci === 'COVER_STRAIGHT' && /^COVER /i.test(produk) ? { ...x, nama: produkJudul(produk) } : x))
    .sort((a, b) => urut(a) - urut(b));
}

/** Teks deskripsi item dari pilihan: "Cable Tray W100xH50xL3000", "Cable Tray Elbow 90 W100xH50xR300", "Hanger Beam W100". */
export function namaItem(produk, kunci, dim, daftarDim) {
  const ukuran = (daftarDim || []).map((d) => (Number.isFinite(+dim[d.k]) && dim[d.k] !== '' && dim[d.k] != null ? d.label + (+dim[d.k]) : d.label + '?')).join('x');
  const P = String(produk || '').toUpperCase();
  const accs = /^ACCS/.test(P), cover = /^COVER/.test(P), other = /^OTHER/.test(P);
  const dasarAccs = { 'ACCS TRAY': 'Cable Tray', 'ACCS LADDER': 'Cable Ladder', 'ACCS DUCT': 'Cable Duct' }[P];
  const bagian = [];
  if (kunci === 'STRAIGHT') { if (!accs && !cover && !other) bagian.push(produkJudul(produk)); } // Cable Tray, Perforated, Ladder, Duct: "Cable Duct W100xH50xL3000"
  else if (kunci === 'COVER_STRAIGHT') bagian.push(cover ? produkJudul(produk) : 'Cover Straight'); // "Cover Tray W200xL3000", "Cover Ladder ...", "Cover Duct ..."
  else if (accs && FITTING.has(kunci) && dasarAccs) bagian.push(dasarAccs, namaBentuk(kunci)); // "Cable Tray Elbow 90 W100xH50xR300": nama memuat jenis tray, ladder, atau duct
  else if (accs || cover || other) bagian.push(namaBentuk(kunci)); // "Cover Elbow W50xR150", "Hanger Beam W100", "Jointing H100"
  else bagian.push(produkJudul(produk), namaBentuk(kunci)); // produk lain dengan aturan khusus dari Master Data
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
  const beratSPK = fh ? berat.realFullHole : lubang === 'tanpa' ? (berat.real ?? berat.estimasi) : (berat.realLubang ?? berat.real ?? berat.estimasi);
  return { ok: true, beratSPK, berat, params: p, fullHole: fh, material: mj.nama };
}

/** Kg per pcs untuk skema item SPK (rancangan documentation/RANCANGAN_INPUT_SPK_DIMENSI.md, tahap 1).
 *  kgPcsEst = tonase plate yang diambil untuk produksi; kgPcsReal = tonase barang jadi (WIP) siap kirim.
 *  lubang 'standar': est = estimasiLubang, real = realLubang (bentuk tanpa kolom lubang memakai estimasi dan real).
 *  lubang 'full'   : est = estimasiFullHole, real = realFullHole; bila tidak tersedia, kembali ke standar dan diberi catatan.
 *  Masukan sama dengan hitungBentuk: { keluarga, bentuk, dim, tebal, material, lubang }. */
export function kgPerPcs(katalog, masukan = {}) {
  const h = hitungBentuk(katalog, masukan);
  if (!h.ok) return { ok: false, alasan: h.alasan, params: h.params };
  const b = h.berat;
  let lubang = 'standar', est = b.estimasiLubang ?? b.estimasi, real = b.realLubang ?? b.real, catatan = null;
  if (masukan.lubang === 'tanpa') { lubang = 'tanpa'; est = b.estimasi; real = b.real; }
  if (masukan.lubang === 'full') {
    if (b.estimasiFullHole != null && b.realFullHole != null) { lubang = 'full'; est = b.estimasiFullHole; real = b.realFullHole; }
    else catatan = 'Full hole tidak tersedia untuk bentuk ini; memakai lubang standar.';
  }
  if (!(est > 0) || !(real > 0)) return { ok: false, alasan: 'Rumus tidak menghasilkan angka untuk ukuran ini.', params: h.params };
  return { ok: true, kgPcsEst: est, kgPcsReal: real, lubang, catatan, material: h.material, params: h.params };
}

/** Total kg dari kg per pcs. Qty yang diambil dari stok barang jadi (ambil) tidak butuh plate baru, jadi kg estimasi memakai qty - ambil;
 *  kg real selalu memakai qty penuh karena barang jadi tetap dihitung sebagai tonase SPK. */
export function totalKg({ kgPcsEst, kgPcsReal }, qty, ambil = 0) {
  const q = Math.max(0, +qty || 0), a = Math.min(q, Math.max(0, +ambil || 0));
  return { kgEstTotal: (+kgPcsEst || 0) * (q - a), kgRealTotal: (+kgPcsReal || 0) * q, qtyProduksi: q - a };
}
