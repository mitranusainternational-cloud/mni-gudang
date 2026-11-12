// Mesin rute produksi multi work center (prototipe lokal, belum tersambung ke UI dan database).
// Fungsi murni: rute standar -> progres kumulatif per langkah -> antrian (WIP) per work center -> beban, utilisasi, dan
// prediksi selesai. Lihat documentation/RUTE_PRODUKSI.md untuk skema, aturan, dan keputusan yang menunggu pemilik.

// Rute standar per produk (judul section SPK). Dapat diubah admin (disimpan sebagai master/rute_produksi).
export const RUTE_STANDAR = {
  'CABLE TRAY': ['Shearing', 'Punching', 'Bending'],
  'PERFORATED CABLE TRAY': ['Shearing', 'Punching', 'Bending'],
  'WIREMESH CABLE TRAY': ['Shearing', 'Bending', 'Welding'], // sementara (belum dikonfirmasi pemilik); ubah di Master Data › Rute produksi
  'CABLE LADDER': ['Shearing', 'Punching', 'Bending', 'Welding'],
  'CABLE DUCT': ['Shearing', 'Bending'], // tanpa lubang, jadi tanpa Punching (keputusan pemilik 2026-11-12: Cable Duct = Cable Tray tanpa lubang)
  'COVER TRAY': ['Shearing', 'Bending'],
  'COVER LADDER': ['Shearing', 'Bending'],
  'COVER DUCT': ['Shearing', 'Bending'],
  'ACCS TRAY': ['CNC Laser', 'Bending', 'Welding'],
  'ACCS LADDER': ['CNC Laser', 'Bending', 'Welding'],
  'ACCS DUCT': ['CNC Laser', 'Bending', 'Welding'],
  'OTHER SUPPORT': ['CNC Laser', 'Bending', 'Welding'], // sama dengan ACCS (sebelumnya aksesori ini berada di section ACCS); aturan khusus per kata (clamp, hanger, jointing, splice) tetap berlaku
};

// Pengecualian berdasarkan kata di deskripsi (dicek berurutan, yang pertama cocok menang): bentuk tertentu tidak melewati semua mesin.
// alt: mesin alternatif per langkah, { Shearing: ['CNC Laser'] } = langkah Shearing boleh dikerjakan di CNC Laser (operator memilih; sistem mencatat mesin sebenarnya).
// Aturan proses dapat diatur di Master Data (Aturan proses). Bawaan di bawah dipakai bila Master Data belum diatur; bila sudah, konfigurasi Master Data menggantikannya.
// Kata kunci: pendek (3 huruf atau kurang) dicocokkan sebagai kata utuh, lebih panjang sebagai bagian teks; tanpa membedakan huruf besar kecil.
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function kataCocok(teks, daftar) {
  const H = String(teks || '').toUpperCase();
  return (daftar || []).some((k) => { const w = String(k || '').trim().toUpperCase(); if (!w) return false; return w.length <= 3 ? new RegExp('(^|[^A-Z0-9])' + esc(w) + '([^A-Z0-9]|$)').test(H) : H.includes(w); });
}
// Pengecualian berdasarkan kata di deskripsi (dicek berurutan, yang pertama cocok menang): bentuk tertentu tidak melewati semua mesin.
// alt: mesin alternatif per langkah, { Shearing: ['CNC Laser'] } = langkah Shearing boleh dikerjakan di CNC Laser (operator memilih; sistem mencatat mesin sebenarnya).
export const ATURAN_KHUSUS_BAWAAN = [
  { kata: ['clamp', 'hanger'], rute: ['CNC Laser', 'Bending'], alt: { 'CNC Laser': ['Shearing'] }, alasan: 'Clamp dan hanger: potong di Laser atau Shearing, lalu Bending' },
  { kata: ['jointing', 'splice'], rute: ['Shearing', 'Punching'], alt: { Shearing: ['CNC Laser'] }, alasan: 'Jointing: potong di Shearing atau Laser, lalu Punching' },
  { kata: ['cover'], produk: ['LADDER', 'TRAY', 'DUCT'], rute: ['Shearing', 'Bending'], alt: { Shearing: ['CNC Laser'] }, alasan: 'Cover: tanpa punching dan welding; potong di Shearing atau Laser' },
];
export function bangunAturanKhusus(daftar) {
  return (daftar || []).filter((a) => a && Array.isArray(a.kata) && a.kata.length && Array.isArray(a.rute) && a.rute.length).map((a) => ({
    cocok: { test: (s) => kataCocok(s, a.kata) },
    ...(Array.isArray(a.produk) && a.produk.length ? { produk: { test: (s) => kataCocok(s, a.produk) } } : {}),
    rute: a.rute.slice(), alt: a.alt || {}, alasan: a.alasan || '',
  }));
}
export const ATURAN_KHUSUS = bangunAturanKhusus(ATURAN_KHUSUS_BAWAAN);
// Finishing ke kode vendor (Vendor ELG, HDG, PDC) dan material yang tidak dikirim ke vendor finishing; bawaan dalam bentuk data agar tampil dan bisa diubah di Master Data.
export const FINISHING_BAWAAN = [{ kata: ['ELECTRO'], kode: 'ELG' }, { kata: ['HOTDIP', 'HOT DIP'], kode: 'HDG' }, { kata: ['POWDER', 'PDC'], kode: 'PDC' }];
export const MATERIAL_TANPA_VENDOR_BAWAAN = [{ kata: ['STAINLESS', 'SS304', 'SS316', 'SS 304', 'SS 316', 'SUS'], nama: 'stainless' }, { kata: ['ALUMIN', 'AL'], nama: 'aluminium' }];
// Konfigurasi dari Master Data: { khusus: [...], finishing: [...], material: [...] } atau null (pakai bawaan). Tiap bagian yang kosong memakai bawaan di kode.
let _AP = null, _khususAktif = null;
export function setAturanProses(ap) {
  _AP = ap && typeof ap === 'object' ? ap : null;
  _khususAktif = _AP && Array.isArray(_AP.khusus) && _AP.khusus.length ? bangunAturanKhusus(_AP.khusus) : null;
}
export const aturanProsesAktif = () => _AP;
export const aturanKhususAktif = () => _khususAktif || ATURAN_KHUSUS;

// Langkah rute yang dipenuhi oleh sebuah mesin: langkahnya sendiri, atau langkah yang menjadikannya mesin alternatif. Tidak ada: -1.
export function indeksLangkah(rute, alt, wc) {
  const i = rute.indexOf(wc);
  if (i >= 0) return i;
  return rute.findIndex((w) => ((alt || {})[w] || []).includes(wc));
}

export const produkDari = (judul, peta = RUTE_STANDAR) => {
  const H = String(judul || '').toUpperCase();
  return Object.keys(peta).filter((k) => !k.includes('|')).sort((a, b) => b.length - a.length).find((p) => H.startsWith(p)) || '';
};

// Material dari judul section: stainless dan aluminium tanpa vendor finishing; selain itu baja (SPHC) yang finishingnya dikerjakan vendor.
export function materialDari(judul) {
  const H = String(judul || '').toUpperCase();
  if (_AP && Array.isArray(_AP.material) && _AP.material.length) {
    for (const m of _AP.material) if (kataCocok(H, m.kata)) return String(m.nama || 'khusus').toLowerCase();
    return 'baja';
  }
  if (/STAINLESS|(^|[^A-Z])SS ?\d|(^|[^A-Z])SUS([^A-Z]|$)/.test(H)) return 'stainless';
  if (/ALUMIN|(^|[^A-Z])AL([^A-Z]|$)/.test(H)) return 'aluminium';
  return 'baja';
}

// Finishing vendor yang berlaku: stainless dan aluminium tidak ke vendor kecuali dipaksa (vv='ya'); vv='tidak' mematikan vendor untuk item itu.
// Baja (SPHC) wajib punya finishing di judul section agar vendornya jelas (perluFinishing).
export function vendorUntuk(judul, vv = '') {
  if (vv === 'tidak') return '';
  if (materialDari(judul) !== 'baja' && vv !== 'ya') return '';
  return finishingDari(judul);
}
export function perluFinishing(judul) {
  const H = String(judul || '').toUpperCase();
  return materialDari(judul) === 'baja' && !finishingDari(judul) && !/(^|[^A-Z])NON([^A-Z]|$)/.test(H);
}

// Langkah vendor (subcon) bernama "Vendor ELG", "Vendor HDG", "Vendor PDC": bukan work center, tidak punya kapasitas atau antrian mesin.
export const langkahVendor = (w) => /^vendor/i.test(String(w || ''));

// Finishing yang dikerjakan vendor, dibaca dari judul section (ELECTRO = ELG, HOTDIP = HDG, POWDER atau PDC = PDC). Non finishing: tanpa vendor.
export function finishingDari(judul) {
  const H = String(judul || '').toUpperCase();
  if (/(^|[^A-Z])NON([^A-Z]|$)/.test(H)) return '';
  if (_AP && Array.isArray(_AP.finishing) && _AP.finishing.length) {
    for (const f of _AP.finishing) if (kataCocok(H, f.kata)) return String(f.kode || '').toUpperCase();
    return '';
  }
  if (H.includes('ELECTRO')) return 'ELG';
  if (H.includes('HOTDIP') || H.includes('HOT DIP')) return 'HDG';
  if (H.includes('POWDER') || /(^|[^A-Z])PDC([^A-Z]|$)/.test(H)) return 'PDC';
  return '';
}

// Rute untuk sebuah item: dari kolom rute item bila sudah diatur (snapshot), selain itu dari aturan khusus, selain itu rute produk.
// opsi.vendor: bila true dan finishing dikenali dari judul section, ditambahkan langkah akhir "Vendor <finishing>" (rute item yang diatur tidak diubah).
export function tentukanRute({ judulSection, deskripsi, ruteItem, altItem }, rute = RUTE_STANDAR, aturan = aturanKhususAktif(), opsi = {}) {
  // snapshot di item (disalin saat SPK terbit): rute dan mesin alternatifnya (alt) ikut tersimpan
  if (Array.isArray(ruteItem) && ruteItem.length) return { rute: ruteItem.slice(), sumber: 'item', alt: altItem && typeof altItem === 'object' ? altItem : {} };
  const p = produkDari(judulSection, rute);
  const k = aturan.find((a) => a.cocok.test(String(deskripsi || '')) && (!a.produk || a.produk.test(String(judulSection || '').toUpperCase())));
  let hasil = { rute: [], sumber: 'belum' };
  // rute khusus bentuk (Master Data, kunci 'PRODUK|BENTUK') mengalahkan aturan kata di deskripsi dan rute produk
  if (opsi.bentuk && p && Array.isArray(rute[p + '|' + opsi.bentuk]) && rute[p + '|' + opsi.bentuk].length) hasil = { rute: rute[p + '|' + opsi.bentuk].slice(), sumber: 'bentuk' };
  else if (k) hasil = { rute: k.rute.slice(), sumber: 'aturan', alasan: k.alasan, alt: k.alt || {} };
  else if (p && rute[p]) hasil = { rute: rute[p].slice(), sumber: 'produk' };
  const fin = vendorUntuk(judulSection, opsi.vv);
  if (opsi.vendor && fin && hasil.rute.length) hasil.rute.push('Vendor ' + fin);
  return hasil;
}

// Hasil langkah internal terakhir (batas maksimal yang boleh dikirim ke vendor). Tanpa langkah vendor di rute: null.
export function siapKirimVendor(rute, kum) {
  const iv = rute.findIndex(langkahVendor);
  if (iv < 1) return null;
  return kum[rute[iv - 1]];
}

// Kejadian produksi (append-only): { spk, item, wc, qty (tambahan hari itu, bukan kumulatif), reject (tambahan reject), tgl, by }
// Kumulatif per langkah untuk satu item. Reject di sebuah langkah tidak lolos ke langkah berikutnya dan harus dibuat ulang:
// batang itu dicabut dari hitungan langkah-langkah sebelumnya, sehingga antrian langkah pertama bertambah sebanyak reject.
export function kumulatif(rute, kejadian, alt = {}) {
  const kum = Object.fromEntries(rute.map((w) => [w, 0]));
  for (const e of kejadian) {
    const i = indeksLangkah(rute, alt, e.wc);
    if (i < 0) continue;
    kum[rute[i]] += Number(e.qty) || 0;
    const rej = Number(e.reject) || 0;
    if (rej > 0) for (let j = 0; j < i; j++) kum[rute[j]] = Math.max(0, kum[rute[j]] - rej);
  }
  return kum;
}

// Antrian per langkah: masuk = yang sudah lolos langkah sebelumnya (langkah pertama: seluruh qty SPK).
export function antrianPerLangkah(rute, kum, qtyTotal) {
  return rute.map((w, i) => {
    const masuk = i === 0 ? qtyTotal : kum[rute[i - 1]];
    const selesai = kum[w];
    return { wc: w, masuk, selesai, antri: Math.max(0, masuk - selesai), sisaKeLangkahBerikut: Math.max(0, selesai - (i + 1 < rute.length ? kum[rute[i + 1]] : selesai)) };
  });
}

// Validasi masukan: qty tambahan di sebuah langkah tidak boleh melebihi yang tersedia (lolos langkah sebelumnya dikurangi yang sudah selesai).
// Reject ikut dihitung: yang selesai ditambah yang reject tidak boleh melebihi yang tersedia.
export function periksaMasukan(rute, kum, qtyTotal, wc, tambah, reject = 0, alt = {}) {
  const i = indeksLangkah(rute, alt, wc);
  if (i < 0) return { ok: false, alasan: `${wc} tidak ada di rute item ini (${rute.join(' → ')})` };
  if (!(tambah >= 0) || !(reject >= 0)) return { ok: false, alasan: 'Jumlah tidak boleh negatif' };
  if (!(tambah + reject > 0)) return { ok: false, alasan: 'Jumlah harus lebih dari 0' };
  const tersedia = (i === 0 ? qtyTotal : kum[rute[i - 1]]) - kum[rute[i]];
  if (tambah + reject > tersedia) return { ok: false, alasan: `Hanya ${tersedia} yang siap di ${wc}${i ? ' (selesai di ' + rute[i - 1] + ': ' + kum[rute[i - 1]] + ')' : ''}` };
  return { ok: true, tersedia };
}

// Progres item = yang lolos langkah terakhir (kompatibel dengan kolom lama item.prod).
// Langkah vendor tidak dihitung: produksi selesai di langkah mesin terakhir (finishing vendor dilacak terpisah lewat dokumen vendor).
export const progresItem = (rute, kum) => { const r = rute.filter((w) => !langkahVendor(w)); return r.length ? kum[r[r.length - 1]] : 0; };

// Beban per work center dari semua item aktif.
// itemAktif: [{ spk, item, kategori, qty, rute, kum, due }]; kapasitas: { 'Shearing': 200, ... } (pcs per hari kerja)
// kejadianHariIni: kejadian pada tanggal hari ini (untuk "selesai hari ini")
export function bebanWC(itemAktif, kapasitas, kejadianHariIni = []) {
  const out = {};
  const wcs = new Set([...Object.keys(kapasitas || {}), ...itemAktif.flatMap((it) => it.rute)].filter((w) => !langkahVendor(w)));
  for (const w of wcs) out[w] = { wc: w, antri: 0, spk: new Set(), selesaiHariIni: 0, kapasitas: (kapasitas || {})[w] || 0 };
  for (const it of itemAktif) {
    for (const s of antrianPerLangkah(it.rute, it.kum, it.qty)) {
      if (s.antri > 0 && !langkahVendor(s.wc)) { out[s.wc].antri += s.antri; out[s.wc].spk.add(it.spk); }
    }
  }
  for (const e of kejadianHariIni) if (out[e.wc]) out[e.wc].selesaiHariIni += Number(e.qty) || 0;
  for (const o of Object.values(out)) {
    o.jumlahSpk = o.spk.size; delete o.spk;
    o.hariHabis = o.kapasitas > 0 ? o.antri / o.kapasitas : null;
    o.status = o.kapasitas <= 0 ? 'Kapasitas belum diatur' : o.antri === 0 ? 'Kosong' : o.hariHabis <= 1 ? 'Normal' : o.hariHabis <= 3 ? 'Padat' : 'Overload';
  }
  return out;
}

// Perkiraan hari kerja sampai setiap item selesai. Tiap WC mengerjakan antriannya berurutan menurut due date (paling dekat dulu)
// dengan kapasitas per hari; item selesai ketika langkah terakhirnya selesai. Sengaja sederhana dan transparan (batch bertumpuk).
export function prediksiSelesai(itemAktif, kapasitas) {
  const hariWC = {}; // wc -> { itemKey -> hari selesai antrian item itu di wc }
  const antri = {};
  itemAktif.forEach((it, idx) => antrianPerLangkah(it.rute, it.kum, it.qty).forEach((s) => { if (s.antri > 0 && !langkahVendor(s.wc)) (antri[s.wc] = antri[s.wc] || []).push({ idx, qty: s.antri, due: it.due || '9999-12-31' }); }));
  for (const [w, list] of Object.entries(antri)) {
    const kap = (kapasitas || {})[w] || 0;
    list.sort((a, b) => a.due.localeCompare(b.due));
    let cum = 0; hariWC[w] = {};
    for (const x of list) { cum += x.qty; hariWC[w][x.idx] = kap > 0 ? cum / kap : null; }
  }
  return itemAktif.map((it, idx) => {
    const hari = it.rute.filter((w) => !langkahVendor(w)).map((w) => (hariWC[w] && idx in hariWC[w] ? hariWC[w][idx] : 0));
    if (hari.some((h) => h === null)) return { spk: it.spk, item: it.item, hari: null, alasan: 'Kapasitas belum diatur untuk WC di rutenya' };
    return { spk: it.spk, item: it.item, hari: Math.max(0, ...hari), penentu: it.rute.filter((w) => !langkahVendor(w))[hari.indexOf(Math.max(...hari))] };
  });
}

// Tambah hari kerja (Senin sampai Jumat) ke tanggal ISO
export function tambahHariKerja(tglIso, n) {
  const d = new Date(tglIso + 'T00:00:00'); let k = Math.ceil(n);
  while (k > 0) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) k--; }
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; // tanggal lokal (toISOString menggeser sehari di zona UTC+7)
}

// Throughput aktual per WC (pcs per hari kerja) dari kejadian N hari terakhir: dasar saran kapasitas
export function throughputAktual(kejadian, dariTgl, sampaiTgl) {
  const per = {};
  const hari = new Set();
  for (const e of kejadian) {
    if (e.tgl < dariTgl || e.tgl > sampaiTgl) continue;
    per[e.wc] = per[e.wc] || { qty: 0, hari: new Set() };
    per[e.wc].qty += Number(e.qty) || 0; per[e.wc].hari.add(e.tgl); hari.add(e.tgl);
  }
  return Object.fromEntries(Object.entries(per).map(([w, v]) => [w, { total: v.qty, hariAktif: v.hari.size, rataPerHari: v.hari.size ? v.qty / v.hari.size : 0 }]));
}

// Belajar dari kejadian nyata: bila sebuah WC mencatat hasil untuk item yang tidak ada di rutenya, usulkan menambahkannya
// (sisip menurut urutan mesin global). Tim cukup menekan "Tambahkan" sekali; tidak perlu mengatur rute di muka.
export function usulanLangkah(rute, kejadian, urutanWC = []) {
  const asing = [...new Set(kejadian.map((e) => e.wc).filter((w) => w && !rute.includes(w)))];
  const pos = (w) => { const i = urutanWC.indexOf(w); return i < 0 ? 1e6 : i; };
  return asing.map((w) => {
    const baru = [...rute, w].sort((a, b) => pos(a) - pos(b) || rute.indexOf(a) - rute.indexOf(b));
    return { wc: w, ruteBaru: baru };
  });
}
