// Kebutuhan material, ketersediaan, dan reservasi (fungsi murni, tanpa DOM dan tanpa akses data).
//
// Aturan (keputusan sementara, dapat diubah pemilik lewat Pengaturan bahan baku):
//   - kebutuhan netto = jumlah kg item (qty x berat per pcs); bruto = netto x faktor sisa potong (awal 1,1 mengikuti Waste EST workbook);
//   - bahan baku dipetakan per (bahan, tebal): bahan dari judul section (SPHC, SS304, SS316, Aluminium), tebal dari judul;
//   - reservasi = kebutuhan bruto SPK Terbit yang belum Selesai/Batal dikurangi material yang sudah dikeluarkan gudang untuk SPK itu;
//   - tersedia = stok fisik dikurangi reservasi SPK lain. Pratinjau (SPK Draft) tidak mengubah stok maupun reservasi;
//   - kekurangan diusulkan sebagai PR dalam lembar dari item bahan baku utama (stok kg terbesar) pada kelompok itu.
export const FAKTOR_SISA_DEFAULT = 1.1;

const angka = (v) => { const x = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(',', '.')); return Number.isFinite(x) ? x : 0; };
const r3 = (x) => Math.round(x * 1000) / 1000;

/** Faktor sisa potong sah: 1 sampai 2; selain itu memakai nilai awal. */
export function faktorSisa(v) { const x = angka(v); return x >= 1 && x <= 2 ? x : FAKTOR_SISA_DEFAULT; }

/** Bahan dan tebal dari judul section SPK. Tebal = angka tunggal 0-9 (boleh desimal) yang berdiri sendiri; cadangan dari tebalSpk. */
export function bahanTebal(judul, tebalSpk = 0) {
  const H = String(judul || '').toUpperCase();
  let bahan = 'SPHC';
  if (/STAINLESS|(^|[^A-Z])SS ?3\d\d/.test(H)) bahan = /316/.test(H) ? 'SS316' : 'SS304';
  else if (/ALU/.test(H)) bahan = 'Aluminium';
  const m = H.match(/(?:^|\s)([0-9](?:[.,][0-9]{1,2})?)(?=\s|$)/);
  const tebal = m ? angka(m[1]) : angka(tebalSpk);
  return { bahan, tebal };
}
/** Bahan penentu pencocokan dari jenis material item bahan baku. Jenis bawaan dan jenis kustom Master Data (mis. A5052)
 *  dipetakan ke empat bahan yang dikenal judul SPK: SPHC, SS304, SS316, Aluminium. Massa jenis di bawah 4 g/cm3 = Aluminium. */
export function bahanDariJenis(nama, massaJenis) {
  const n = String(nama || '').toUpperCase().trim();
  if (['', 'SPHC', 'SPCC', 'LAINNYA'].includes(n)) return 'SPHC';
  if (n === 'SS304' || n === 'SS316') return n;
  if (n === 'ALUMINIUM') return 'Aluminium';
  const d = angka(massaJenis);
  if (d > 0 && d < 4) return 'Aluminium';
  if (/316/.test(n)) return 'SS316';
  if (/304|SUS|STAINLESS|^SS/.test(n)) return 'SS304';
  if (/ALU|^AL ?\d|^A\d{4}/.test(n)) return 'Aluminium';
  return 'SPHC';
}
export const kunciMaterial = (bahan, tebal) => `${bahan}|${r3(angka(tebal))}`;

/** Kelompokkan item SPK/SO per (bahan, tebal). item = { d, g (judul section), q, w (kg per pcs) }.
 *  Item tanpa berat tidak ikut dihitung dan dilaporkan di tanpaBerat. */
export function kelompokKebutuhan(items, { faktor = FAKTOR_SISA_DEFAULT, tebalSpk = 0 } = {}) {
  const f = faktorSisa(faktor);
  const peta = new Map();
  (items || []).forEach((it) => {
    const { bahan, tebal } = bahanTebal(it.g, tebalSpk);
    const kunci = kunciMaterial(bahan, tebal);
    if (!peta.has(kunci)) peta.set(kunci, { kunci, bahan, tebal, netto: 0, bruto: 0, baris: 0, tanpaBerat: [] });
    const g = peta.get(kunci);
    const kg = angka(it.q) * angka(it.w);
    g.baris += 1;
    if (kg > 0) g.netto += kg; else g.tanpaBerat.push(it.d);
  });
  return [...peta.values()].map((g) => ({ ...g, netto: r3(g.netto), bruto: r3(g.netto * f) })).sort((a, b) => a.bahan.localeCompare(b.bahan) || a.tebal - b.tebal);
}

/** Reservasi aktif seluruh SPK. spkList = [{ id, aktif, kelompok:[{kunci,bruto}], keluar:{kunci:kg} }].
 *  Mengembalikan { total:{kunci:kg}, perSpk:{id:{kunci:kg}} } dengan sisa reservasi = bruto - sudah keluar (tidak negatif). */
export function reservasiAktif(spkList) {
  const total = {}; const perSpk = {};
  (spkList || []).forEach((s) => {
    if (!s.aktif) return;
    perSpk[s.id] = {};
    (s.kelompok || []).forEach((k) => {
      const sisa = Math.max(0, k.bruto - angka((s.keluar || {})[k.kunci]));
      if (sisa <= 0) return;
      perSpk[s.id][k.kunci] = r3(sisa);
      total[k.kunci] = r3((total[k.kunci] || 0) + sisa);
    });
  });
  return { total, perSpk };
}

/** Rencana material satu dokumen terhadap stok.
 *  rmSiap = [{ id, label, bahan, tebal, kgPerLbr, stok }]; reservasiLain = { kunci: kg } (SPK lain, tanpa dokumen ini); keluar = { kunci: kg } sudah dikeluarkan untuk dokumen ini;
 *  dipesan = { kunci: kg } sisa PR terbuka (belum diterima) yang menutup kekurangan dan mencegah PR ganda. */
export function rencanaMaterial(kelompok, rmSiap, { reservasiLain = {}, keluar = {}, dipesan = {} } = {}) {
  return (kelompok || []).map((k) => {
    const kandidat = (rmSiap || []).filter((r) => r.bahan === k.bahan && Math.abs(angka(r.tebal) - k.tebal) < 0.01 && angka(r.kgPerLbr) > 0);
    const sudahKg = angka(keluar[k.kunci]);
    const butuhKg = r3(Math.max(0, k.bruto - sudahKg));
    if (!kandidat.length) return { ...k, kandidat: [], sudahKg, butuhKg, fisikKg: 0, reservasiKg: angka(reservasiLain[k.kunci]), tersediaKg: 0, dipesanKg: 0, kurangKg: butuhKg, status: 'Tanpa item RM', utama: null, butuhLbr: null, kurangLbr: null };
    const kg = (r) => Math.max(0, angka(r.stok)) * angka(r.kgPerLbr);
    const utama = kandidat.slice().sort((a, b) => kg(b) - kg(a))[0];
    const fisikKg = r3(kandidat.reduce((a, r) => a + kg(r), 0));
    const reservasiKg = r3(angka(reservasiLain[k.kunci]));
    const tersediaKg = r3(fisikKg - reservasiKg);
    const dipesanKg = r3(angka(dipesan[k.kunci]));
    const kurangKg = r3(Math.max(0, butuhKg - tersediaKg - dipesanKg));
    return {
      ...k, kandidat: kandidat.map((r) => r.id), sudahKg, butuhKg, fisikKg, reservasiKg, tersediaKg, dipesanKg, kurangKg,
      status: butuhKg <= 0 ? 'Sudah dikeluarkan' : kurangKg > 0 ? 'Kurang' : butuhKg > tersediaKg ? 'Sudah dipesan' : 'Cukup',
      utama: { id: utama.id, label: utama.label, kgPerLbr: utama.kgPerLbr },
      butuhLbr: Math.ceil(butuhKg / utama.kgPerLbr - 1e-9), kurangLbr: Math.ceil(kurangKg / utama.kgPerLbr - 1e-9),
    };
  });
}

/** Usulan PR dari kekurangan: satu baris per kelompok yang Kurang (lembar dari item RM utama). */
export function usulanPr(rencana) {
  return (rencana || []).filter((r) => r.status === 'Kurang' && r.utama && r.kurangLbr > 0).map((r) => ({ item: r.utama.id, label: r.utama.label, q: r.kurangLbr, kg: r3(r.kurangLbr * r.utama.kgPerLbr), kunci: r.kunci }));
}

/** Susut bahan baku per SPK: membandingkan plat yang KELUAR (kg) dengan hasil jadi (kg) per (bahan, tebal).
 *  kelompokRencana = kelompokKebutuhan(seluruh item), kelompokHasil = kelompokKebutuhan(item dengan qty = yang sudah selesai),
 *  keluar = { kunci: kg }. Batas wajar = (faktor-1)/faktor + toleransi (faktor sisa potong 1,1 => 9,1% + 5%).
 *  Status: 'Belum keluar', 'Berjalan' (produksi belum selesai, susut sementara tidak dinilai), 'Wajar', 'Berlebih', 'Plat kurang catat' (hasil melebihi plat yang tercatat keluar). */
export function susutMaterial(kelompokRencana, kelompokHasil, keluar = {}, { faktor = FAKTOR_SISA_DEFAULT, toleransi = 0.05 } = {}) {
  const f = faktorSisa(faktor); const batas = (f - 1) / f + toleransi;
  const hasil = new Map((kelompokHasil || []).map((k) => [k.kunci, k.netto]));
  return (kelompokRencana || []).map((k) => {
    const keluarKg = r3(angka(keluar[k.kunci])); const hasilKg = r3(hasil.get(k.kunci) || 0);
    const selesai = k.netto > 0 && hasilKg >= k.netto - 0.0005;
    const susutKg = r3(keluarKg - hasilKg); const pct = keluarKg > 0 ? susutKg / keluarKg : null;
    let status;
    if (keluarKg <= 0) status = hasilKg > 0 ? 'Plat kurang catat' : 'Belum keluar';
    else if (keluarKg + 0.5 < hasilKg) status = 'Plat kurang catat';
    else if (!selesai) status = 'Berjalan';
    else status = pct <= batas ? 'Wajar' : 'Berlebih';
    return { kunci: k.kunci, bahan: k.bahan, tebal: k.tebal, rencanaKg: k.netto, keluarKg, hasilKg, susutKg, pct, batas, status };
  });
}
