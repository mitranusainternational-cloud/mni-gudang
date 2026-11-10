// Pemetaan teks item SPK -> (keluarga produk, bentuk, parameter) -> berat per pcs lewat mesin rumus Excel.
//   hitungItem(catalog, { judulSection: 'CABLE LADDER TYPE SLW 2.0 HOTDIP GALVANIZED', deskripsi: 'Cable Ladder W300xH100xL3000 mm', material: 'SPHC' })
//   -> { ok, keluarga, bentuk, params, berat: {estimasi, estimasiLubang, real, realLubang}, beratSPK, catatan[] }
// Aturan sengaja eksplisit dan bisa ditinjau (lihat documentation/KALKULATOR_BERAT.md); yang meragukan ditandai di catatan,
// yang tidak dikenali dikembalikan ok:false agar pengguna mengisi manual (tidak pernah menebak angka).
import { hitung, parameterBentuk } from './engine.js';

export const KELUARGA = ['STU', 'STC', 'SLU', 'SLW', 'SLHDC', 'SLHD'];

// Massa jenis (g/cm3) menurut material SPK. USULAN, perlu dikonfirmasi pemilik; workbook memakai 7.85 untuk baja.
export const MASSA_JENIS = [
  { cocok: /(alum|alu\b|\bal\b|alloy)/i, bj: 2.70, nama: 'Aluminium' },
  { cocok: /316/, bj: 7.98, nama: 'Stainless 316' },
  { cocok: /(ss\s*304|304|stainless|\bss\b|\bsus\b)/i, bj: 7.93, nama: 'Stainless 304' },
  { cocok: /(sphc|spcc|secc|spha|\bgi\b|galv|mild|\bms\b|besi|baja|steel)/i, bj: 7.85, nama: 'Baja karbon / galvanis' },
];
// Pengait ke Master Data: bila terpasang dan mengenali bahan, massa jenis diambil dari Master Data (satu sumber); daftar di atas hanya cadangan.
let _bjMaster = null;
export function setMassaJenisMaster(fn) { _bjMaster = typeof fn === 'function' ? fn : null; }
export function massaJenis(material) {
  if (_bjMaster) { const bj = +_bjMaster(String(material || '')); if (bj > 0) return { bj, nama: String(material || 'Master Data'), sumber: 'master' }; }
  const m = MASSA_JENIS.find((x) => x.cocok.test(String(material || '')));
  return m ? m : null;
}

// Aturan bentuk: urutan penting (yang lebih spesifik lebih dulu). id mengikuti catalog (tanpa akhiran keluarga).
const ATURAN = [
  { id: 'COVER_CLAMP_HEAVY_DUTY', re: /cover\s*clamp.*heavy|heavy\s*duty.*clamp/i },
  { id: 'COVER_CLAMP', re: /cover\s*clamp/i },
  { id: 'COVER_REDUCER', re: /cover.*reducer/i },
  { id: 'COVER_CROSS', re: /cover.*cross/i },
  { id: 'COVER_TEE', re: /cover.*tee/i },
  { id: 'COVER_INSIDE', re: /cover.*inside/i },
  { id: 'COVER_OUTSIDE', re: /cover.*outside/i },
  { id: 'COVER_ELBOW', re: /cover.*elbow/i },
  { id: 'COVER_STRAIGHT', re: /^cover\b/i },
  { id: 'REDUCER', re: /reducer/i },
  { id: 'CROSS', re: /\bcross\b/i },
  { id: 'TEE', re: /\btee\b/i },
  { id: 'INSIDE', re: /inside/i },
  { id: 'OUTSIDE', re: /outside/i },
  { id: 'ELBOW', re: /elbow/i },
  { id: 'JOINTING', re: /jointing/i },
  { id: 'HORIZONTAL_FISH_PLATE', re: /horizontal\s*(adjustable|fish\s*plate)/i, asumsi: 'Horizontal Adjustable dianggap Horizontal Fish Plate' },
  { id: 'VERTICAL_FISH_PLATE', re: /vertical\s*(adjustable|fish\s*plate)/i, asumsi: 'Vertical Adjustable dianggap Vertical Fish Plate' },
  { id: 'END_STOP', re: /end\s*(plate|stop)/i, asumsi: 'End Plate dianggap End Stop' },
  { id: 'SPLICE_PLATE_SET_FOR_STAND', re: /splice\s*plate/i },
  { id: 'BRACKET_SUPPORT', re: /bracket\s*support/i },
  { id: 'DOUBLE_CHANEEL_BRACKET', re: /double\s*chan+e?l\s*bracket/i },
  { id: 'SINGLE_CHANEEL_BRACKET', re: /single\s*chan+e?l\s*bracket/i },
  { id: 'HANGER_BEAM', re: /hanger\s*beam/i },
  { id: 'U_CHANNEL_20X20', re: /u\s*channel/i },
  { id: 'HANGER_CLEVIS', re: /hanger\s*clevis/i },
  { id: 'SUPPORT_SEPARATOR', re: /support\s*separator/i },
  { id: 'SEPARATOR', re: /separator/i },
  { id: 'HOLD_DOWN_CLIP', re: /hold\s*down\s*clip/i },
  { id: 'HOLD_DOWN_CLAMP', re: /hold\s*down\s*clamp/i },
  { id: 'DROP_OUT', re: /drop\s*out/i },
  { id: 'STRAIGHT', re: /(ladder|tray|trunking|duct)/i },
];

const num = (s) => parseFloat(String(s).replace(',', '.'));

// Ukuran dari teks: W300xH100xL3000, W300xR600, H100, ... Bagian setelah "c/w" (baut dan sejenisnya) diabaikan.
export function bacaUkuran(deskripsi) {
  const utama = String(deskripsi || '').split(/\bc\s*\/\s*w\b/i)[0];
  const dim = {};
  const sisa = [];
  for (const tk of utama.split(/[\sx×*,;]+/i).filter(Boolean)) {
    const m = tk.match(/^([whlr])([0-9]+(?:[.,][0-9]+)?)(?:mm)?$/i);
    if (m) dim[m[1].toLowerCase()] = num(m[2]); else sisa.push(tk);
  }
  // tebal tertulis polos di akhir deskripsi (mis. "... L3000 1.2")
  let t = null;
  const tail = sisa[sisa.length - 1];
  if (tail && /^[0-9]+([.,][0-9]+)?$/.test(tail) && num(tail) > 0 && num(tail) <= 6) t = num(tail);
  return { dim, tebal: t };
}

// Bentuk dan ukuran dari deskripsi teks bebas ("Elbow 90 W300xH100xR300"): untuk mengubah teks menjadi baris terstruktur.
export function kenaliDeskripsi(deskripsi) {
  const teks = String(deskripsi || '').trim();
  if (!teks) return null;
  const a = ATURAN.find((x) => x.re.test(teks));
  if (!a) return null;
  const { dim, tebal } = bacaUkuran(teks);
  return { kunci: a.id, dim, tebal };
}

// Keluarga dan tebal dari judul section SPK: "CABLE LADDER TYPE SLW 2.0 HOTDIP GALVANIZED"
export function bacaSection(judul) {
  const s = String(judul || '').toUpperCase();
  const k = KELUARGA.find((f) => new RegExp('\\b' + f + '\\b').test(s));
  const m = k && s.match(new RegExp('\\b' + k + '\\s+([0-9]+(?:[.,][0-9]+)?)'));
  return { keluarga: k || null, tebal: m ? num(m[1]) : null };
}

const sudut = (v) => (v == null ? 0 : v);

export function hitungItem(catalog, { judulSection, deskripsi, material, tebal, keluarga }) {
  const catatan = [];
  const sec = bacaSection(judulSection);
  const fam = keluarga || sec.keluarga;
  if (!fam || !catalog.keluarga[fam]) return { ok: false, alasan: 'Tipe produk (STU, STC, SLU, SLW, SLHD, SLHDC) tidak terbaca dari judul section.', catatan };

  const teks = String(deskripsi || '').trim();
  const aturan = ATURAN.find((a) => a.re.test(teks));
  if (!aturan) return { ok: false, keluarga: fam, alasan: 'Bentuk produk tidak dikenali dari deskripsi.', catatan };
  if (aturan.asumsi) catatan.push(aturan.asumsi);
  const bentukId = `${aturan.id}_${fam}`;
  const blok = catalog.keluarga[fam].bentuk.find((b) => b.id === bentukId || b.id.replace(/_R_D$|_L_R_C$/, '') === bentukId);
  if (!blok) return { ok: false, keluarga: fam, alasan: `Bentuk ${aturan.id} tidak ada di kalkulator ${fam}.`, catatan };

  const { dim, tebal: tTeks } = bacaUkuran(teks);
  const t = tTeks ?? tebal ?? sec.tebal;
  const mj = massaJenis(material);
  if (!mj) return { ok: false, keluarga: fam, bentuk: blok.id, alasan: 'Material SPK belum dikenali untuk massa jenis (isi SPHC, SPCC, SS304, SS316, atau Aluminium).', catatan };
  if (!t) return { ok: false, keluarga: fam, bentuk: blok.id, alasan: 'Tebal tidak terbaca (tulis di akhir deskripsi, judul section, atau tebal SPK).', catatan };

  // Isi parameter yang dibutuhkan bentuk itu
  const perlu = parameterBentuk(catalog, fam, blok.id);
  const p = { t, bj: mj.bj };
  const hilang = [];
  for (const nm of perlu) {
    if (nm === 't' || nm === 'bj') continue;
    if (dim[nm] != null) { p[nm] = dim[nm]; continue; }
    const mw = nm.match(/^w([1-4])$/);
    if (mw && dim.w != null) { p[nm] = dim.w; if (!catatan.includes('Lebar sama pada semua sisi (equal)')) catatan.push('Lebar sama pada semua sisi (equal)'); continue; }
    if (/yg kecil/.test(nm) && (p.w1 != null || p.w2 != null)) { p[nm] = Math.min(sudut(p.w1), sudut(p.w2)); continue; }
    hilang.push(nm);
  }
  if (hilang.length) return { ok: false, keluarga: fam, bentuk: blok.id, params: p, alasan: `Ukuran kurang: ${hilang.join(', ')}`, catatan };

  const berat = hitung(catalog, fam, blok.id, p);
  if (!berat || (berat.real == null && berat.estimasi == null)) return { ok: false, keluarga: fam, bentuk: blok.id, params: p, alasan: 'Rumus tidak menghasilkan angka untuk ukuran ini.', catatan };
  // Berat yang dipakai SPK: real tanpa lubang bila ada, selain itu real, selain itu estimasi (KEPUTUSAN PEMILIK: lihat dokumen)
  const beratSPK = berat.realLubang ?? berat.real ?? berat.estimasi;
  return { ok: true, keluarga: fam, bentuk: blok.id, params: p, material: mj.nama, berat, beratSPK, catatan };
}
