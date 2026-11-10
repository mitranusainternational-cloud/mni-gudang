/* Papan Jadwal (Gantt) SPK: mesin hitung murni. Tidak ada input baru: semua batang dibaca dari SPK
 * (tanggal terbit, due date), kejadian produksi, dokumen vendor, dan pengiriman yang sudah tercatat. */
const MS = 86400000;
const ms = (d) => Date.parse(d + 'T00:00:00Z');
export const selisihHari = (a, b) => Math.round((ms(b) - ms(a)) / MS);
export const geserHari = (d, n) => new Date(ms(d) + n * MS).toISOString().slice(0, 10);
const tglEv = (e) => e.tgl || String(e.at || '').slice(0, 10);
const urut = (a) => a.filter(Boolean).sort();
const awalAkhir = (a) => { const x = urut(a); return x.length ? [x[0], x[x.length - 1]] : null; };

/* Kejadian hasil yang masih berlaku (yang dibatalkan lewat void dibuang) */
export function hasilBerlaku(kejadian) {
  const batal = new Set(kejadian.filter((e) => e.jenis === 'void' && e.ref != null).map((e) => e.ref));
  return kejadian.filter((e) => e.jenis === 'hasil' && !(e.id != null && batal.has(e.id)));
}

/* Perkiraan selesai dari laju sejauh ini: progres p dalam n hari kerja -> sisa hari = n*(1-p)/p */
export function perkiraanSelesai(mulaiProduksi, hariIni, progres) {
  if (!mulaiProduksi || !(progres > 0) || progres >= 1) return null;
  const sudah = Math.max(1, selisihHari(mulaiProduksi, hariIni) + 1);
  return geserHari(hariIni, Math.ceil(sudah * (1 - progres) / progres));
}

/* spk: [{id,no,customer,tgl,due,pP,pK,items:[{idx,d,q,u,pct}]}]; aktif: Set id SPK yang sedang dikerjakan */
export function susunJadwal({ spk = [], kejadian = [], vendor = [], kirim = [], hariIni, aktif = new Set(), sesi = [] }) {
  const hasil = hasilBerlaku(kejadian);
  const mulaiEv = kejadian.filter((e) => e.jenis === 'mulai');
  const baris = spk.map((s) => {
    const eh = hasil.filter((e) => e.spk_id === s.id);
    const em = mulaiEv.filter((e) => e.spk_id === s.id);
    const tglProd = [...eh, ...em].map(tglEv);
    const ar = awalAkhir(tglProd);
    const selesai = (s.pK || 0) >= 1;
    const produksiSelesai = (s.pP || 0) >= 1;
    const prod = ar ? { dari: ar[0], sampai: produksiSelesai || selesai ? (awalAkhir(eh.map(tglEv)) || ar)[1] : (ar[1] < hariIni ? hariIni : ar[1]), jalan: !produksiSelesai } : null;

    const vs = vendor.filter((v) => v.spk === s.id && v.status !== 'Batal' && v.tgl);
    const vr = awalAkhir(vs.flatMap((v) => [v.tgl, v.tglKembali]));
    const vTerbuka = vs.some((v) => !v.tglKembali);
    const vend = vr ? { dari: vr[0], sampai: vTerbuka && vr[1] < hariIni ? hariIni : vr[1], terbuka: vTerbuka, nama: [...new Set(vs.map((v) => v.vendor).filter(Boolean))].join(', ') } : null;

    const ks = kirim.filter((k) => k.spk === s.id && k.status !== 'Batal' && k.tgl);
    const kr = awalAkhir(ks.flatMap((k) => [k.tgl, k.tglTerima]));
    const kir = kr ? { dari: kr[0], sampai: kr[1] } : null;

    const perkiraan = selesai ? null : perkiraanSelesai(prod && prod.dari, hariIni, s.pP || 0);
    const telat = !selesai && !!s.due && s.due < hariIni;
    const risiko = !selesai && !telat && !!perkiraan && !!s.due && perkiraan > s.due;
    const status = selesai ? 'selesai' : telat ? 'telat' : risiko ? 'risiko' : prod || vend ? 'jalan' : 'belum';

    const items = (s.items || []).map((it) => {
      const ie = eh.filter((e) => e.item_idx === it.idx);
      const im = em.filter((e) => e.item_idx === it.idx);
      const r2 = awalAkhir([...ie, ...im].map(tglEv));
      const langkah = langkahItem(ie, sesi.filter((e) => e.spk_id === s.id && +e.item_idx === it.idx), hariIni);
      return { idx: it.idx, d: it.d, q: it.q, u: it.u, sedang: !!it.sedang, langkah, wcAktif: langkah.filter((l) => l.live).map((l) => l.wc), pct: Math.max(0, Math.min(1, it.pct || 0)), dari: r2 ? r2[0] : null, sampai: r2 ? ((it.pct || 0) >= 1 && ie.length ? awalAkhir(ie.map(tglEv))[1] : (r2[1] < hariIni ? hariIni : r2[1])) : null };
    });

    return { id: s.id, no: s.no, customer: s.customer, terbit: s.tgl || (ar ? ar[0] : hariIni), due: s.due || null, pP: s.pP || 0, pK: s.pK || 0,
      prod, vendor: vend, kirim: kir, perkiraan, status, telat, risiko, sedang: aktif.has(s.id), items,
      sisaHari: s.due ? selesai ? null : selisihHari(hariIni, s.due) : null };
  });

  const titik = [hariIni, geserHari(hariIni, 7)];
  baris.forEach((b) => { titik.push(b.terbit, b.due, b.perkiraan, b.prod && b.prod.dari, b.prod && b.prod.sampai, b.vendor && b.vendor.sampai, b.kirim && b.kirim.sampai); });
  const ar = awalAkhir(titik);
  const awal = geserHari(ar[0], -1), akhir = geserHari(ar[1], 1);
  return { awal, akhir, hari: selisihHari(awal, akhir) + 1, hariIni, baris };
}

/* Sumbu tanggal: label tiap senin (atau tiap tanggal 1 pada skala bulan) */
export function sumbuTanggal(awal, akhir, skala = 'minggu') {
  const out = []; const n = selisihHari(awal, akhir) + 1;
  for (let i = 0; i < n; i++) {
    const d = geserHari(awal, i); const w = new Date(ms(d)).getUTCDay();
    const tgl = Number(d.slice(8, 10));
    if (skala === 'bulan' ? tgl === 1 : w === 1) out.push({ tgl: d, i });
  }
  /* tanggal awal diberi label hanya bila cukup jauh dari label berikutnya (agar tidak bertumpuk) */
  const jarak = skala === 'bulan' ? 14 : 3;
  if (!out.length || out[0].i >= jarak) out.unshift({ tgl: awal, i: 0 });
  return out;
}

export const hariKerjaAkhirPekan = (d) => { const w = new Date(ms(d)).getUTCDay(); return w === 0 || w === 6; };

/* Langkah per work center untuk satu item: tanggal pertama sampai terakhir, jumlah selesai, dan penanda sedang berjalan */
export function langkahItem(hasilItem, sesiItem = [], hariIni) {
  const per = new Map();
  const ambil = (wc) => { if (!per.has(wc)) per.set(wc, { wc, tgl: [], qty: 0, reject: 0, mesin: new Set(), live: false }); return per.get(wc); };
  hasilItem.slice().sort((a, b) => tglEv(a).localeCompare(tglEv(b))).forEach((e) => { const p = ambil(e.wc); p.tgl.push(tglEv(e)); p.qty += +e.qty || 0; p.reject += +e.reject || 0; if (e.mesin) p.mesin.add(e.mesin); });
  sesiItem.forEach((e) => { const p = ambil(e.wc); p.tgl.push(tglEv(e) || hariIni); p.live = true; if (e.mesin) p.mesin.add(e.mesin); });
  return [...per.values()].map((p) => { const ar = awalAkhir(p.tgl); return { wc: p.wc, dari: ar[0], sampai: p.live && ar[1] < hariIni ? hariIni : ar[1], qty: p.qty, reject: p.reject, mesin: [...p.mesin], live: p.live }; })
    .sort((a, b) => a.dari.localeCompare(b.dari));
}

/* Papan per mesin: tiap mesin punya balok pekerjaan (SPK, item) dari tanggal pertama sampai terakhir dikerjakan di mesin itu.
 * Balok yang bertumpuk pada hari yang sama diberi lajur berbeda. mesinMaster: [{wc, mesin:[nama]}] menurut urutan work center. */
export function susunMesin({ kejadian = [], sesi = [], mesinMaster = [], info = {}, hariIni }) {
  const hasil = hasilBerlaku(kejadian);
  const kunci = new Map();
  const taruh = (e, live) => {
    const m = e.mesin || e.wc; const k = e.wc + '|' + m + '|' + e.spk_id + '|' + e.item_idx;
    if (!kunci.has(k)) kunci.set(k, { wc: e.wc, mesin: m, spk_id: e.spk_id, item_idx: +e.item_idx, tgl: [], qty: 0, live: false, operator: '' });
    const b = kunci.get(k); b.tgl.push(tglEv(e) || hariIni); if (!live) b.qty += +e.qty || 0; else { b.live = true; b.operator = e.operator || ''; }
  };
  hasil.forEach((e) => taruh(e, false)); sesi.forEach((e) => taruh(e, true));
  const blok = [...kunci.values()].map((b) => { const ar = awalAkhir(b.tgl); const it = (info[b.spk_id] || {}).items || {}; return { ...b, dari: ar[0], sampai: b.live && ar[1] < hariIni ? hariIni : ar[1], no: (info[b.spk_id] || {}).no, customer: (info[b.spk_id] || {}).customer, d: it[b.item_idx] || '' }; });
  const wcUrut = mesinMaster.map((m) => m.wc); blok.forEach((b) => { if (!wcUrut.includes(b.wc)) wcUrut.push(b.wc); });
  const kelompok = wcUrut.map((wc) => {
    const nama = new Set((mesinMaster.find((m) => m.wc === wc) || { mesin: [] }).mesin); blok.filter((b) => b.wc === wc).forEach((b) => nama.add(b.mesin)); if (!nama.size) nama.add(wc);
    const baris = [...nama].map((m) => { const bs = blok.filter((b) => b.wc === wc && b.mesin === m).sort((a, b) => a.dari.localeCompare(b.dari)); const lajurAkhir = []; bs.forEach((b) => { let l = lajurAkhir.findIndex((a) => a < b.dari); if (l < 0) { l = lajurAkhir.length; lajurAkhir.push(b.sampai); } else lajurAkhir[l] = b.sampai; b.lajur = l; }); return { mesin: m, blok: bs, lajur: Math.max(1, lajurAkhir.length), sedang: bs.some((b) => b.live) }; });
    return { wc, baris };
  });
  const titik = [hariIni, geserHari(hariIni, 7), ...blok.flatMap((b) => [b.dari, b.sampai])];
  return { kelompok, blok, titik };
}
