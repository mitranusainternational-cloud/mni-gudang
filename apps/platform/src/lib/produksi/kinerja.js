// Posisi, lama proses per work center, dan kecepatan serta kualifikasi vendor (prototipe lokal, fungsi murni).
import { tambahHariKerja } from './rute.js';

// Selisih hari kerja (Senin sampai Jumat) antara dua tanggal ISO (a lebih awal dari b)
export function selisihHariKerja(a, b) {
  const x = new Date(String(a).slice(0, 10) + 'T00:00:00'), y = new Date(String(b).slice(0, 10) + 'T00:00:00');
  if (y <= x) return 0;
  let n = 0;
  for (const d = new Date(x); d < y; d.setDate(d.getDate() + 1)) { const w = d.getDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}

// Posisi satu item: di mana setiap batang berada sekarang.
// Langkah WC biasa: yang sudah lolos langkah sebelumnya tetapi belum selesai di langkah ini berada "di" WC itu (menunggu atau dikerjakan).
// Langkah vendor (nama diawali "Vendor"): kum[langkah] = yang sudah kembali; vendorKirim[langkah] = yang sudah dikirim.
export function posisiItem(rute, kum, qty, vendorKirim = {}) {
  const tempat = [];
  rute.forEach((w, i) => {
    const masuk = i === 0 ? qty : kum[rute[i - 1]];
    const selesai = kum[w];
    if (/^vendor/i.test(w)) {
      const kirim = Math.max(selesai, Math.min(masuk, vendorKirim[w] || 0));
      tempat.push({ tempat: w, jenis: 'vendor-siap-kirim', qty: Math.max(0, masuk - kirim) });
      tempat.push({ tempat: w, jenis: 'di-vendor', qty: Math.max(0, kirim - selesai) });
    } else {
      tempat.push({ tempat: w, jenis: 'wc', qty: Math.max(0, masuk - selesai) });
    }
  });
  tempat.push({ tempat: 'Selesai produksi', jenis: 'selesai', qty: rute.length ? kum[rute[rute.length - 1]] : 0 });
  return tempat.filter((t) => t.qty > 0);
}

// Ringkasan posisi dari beberapa item (satu SPK): tempat dengan batang terbanyak lebih dulu
export function posisiSPK(items) {
  const acc = {};
  for (const it of items) {
    for (const t of posisiItem(it.rute, it.kum, it.qty, it.vendorKirim)) {
      const k = t.jenis === 'selesai' ? 'Selesai produksi' : t.jenis === 'di-vendor' ? t.tempat + ' (di vendor)' : t.tempat;
      acc[k] = (acc[k] || 0) + t.qty;
    }
  }
  return Object.entries(acc).map(([tempat, qty]) => ({ tempat, qty })).sort((a, b) => b.qty - a.qty);
}

// Lama proses per WC: tiap item dan WC, dari saat item tersedia di WC itu (hasil pertama langkah sebelumnya, atau tanggal SPK
// untuk langkah pertama) sampai seluruh qty selesai di WC itu. Keluaran: rata-rata dan median hari kerja per WC.
// items: [{ qty, rute, tglSpk, kejadian: [{ wc, qty, at }] }]
export function lamaProsesWC(items) {
  const per = {};
  for (const it of items) {
    const ev = it.kejadian.slice().sort((a, b) => String(a.at).localeCompare(String(b.at)));
    it.rute.forEach((w, i) => {
      let cum = 0, selesaiAt = null;
      for (const e of ev) if (e.wc === w) { cum += Number(e.qty) || 0; if (cum >= it.qty) { selesaiAt = e.at; break; } }
      if (!selesaiAt) return;
      const tersedia = i === 0 ? it.tglSpk : (ev.find((e) => e.wc === it.rute[i - 1]) || {}).at;
      if (!tersedia) return;
      (per[w] = per[w] || []).push(selisihHariKerja(tersedia, selesaiAt));
    });
  }
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  return Object.fromEntries(Object.entries(per).map(([w, a]) => [w, { n: a.length, rataHari: a.reduce((x, y) => x + y, 0) / a.length, medianHari: med(a) }]));
}

// Vendor dan subcon. pengiriman: [{ vendor, proses, tglKirim, tglKembali|null, qty, reject }]; target: { HDG: 5, ELG: 3 } hari kerja
export function kualifikasiVendor(pengiriman, target = {}, hariIni) {
  const per = {};
  for (const p of pengiriman) (per[p.vendor] = per[p.vendor] || []).push(p);
  const med = (a) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  return Object.entries(per).map(([vendor, list]) => {
    const tutup = list.filter((p) => p.tglKembali);
    const tat = tutup.map((p) => selisihHariKerja(p.tglKirim, p.tglKembali));
    const tepat = tutup.filter((p, i) => tat[i] <= (target[p.proses] ?? Infinity)).length;
    const qtyKirim = tutup.reduce((a, p) => a + (Number(p.qty) || 0), 0);
    const reject = tutup.reduce((a, p) => a + (Number(p.reject) || 0), 0);
    const buka = list.filter((p) => !p.tglKembali);
    const umurTertua = hariIni && buka.length ? Math.max(...buka.map((p) => selisihHariKerja(p.tglKirim, hariIni))) : null;
    const onTime = tutup.length ? tepat / tutup.length : null;
    const rejectRate = qtyKirim ? reject / qtyKirim : null;
    let nilai = 'Data belum cukup';
    if (tutup.length >= 3) nilai = onTime >= 0.9 && rejectRate <= 0.01 ? 'A' : onTime >= 0.75 && rejectRate <= 0.03 ? 'B' : 'C';
    return { vendor, pengiriman: list.length, selesai: tutup.length, rataTAT: tat.length ? tat.reduce((a, b) => a + b, 0) / tat.length : null, medianTAT: med(tat), tepatWaktu: onTime, rejectRate, masihDiVendor: buka.length, umurTertua, nilai };
  }).sort((a, b) => (b.selesai - a.selesai) || a.vendor.localeCompare(b.vendor));
}

// Perkiraan tanggal kembali kiriman baru dari kecepatan vendor itu (median; bila data belum cukup, target proses)
export function perkiraanKembali(vendor, proses, tglKirim, kualifikasi, target = {}) {
  const k = kualifikasi.find((x) => x.vendor === vendor);
  const cukup = k && k.selesai >= 3 && k.medianTAT != null;
  const hari = cukup ? k.medianTAT : target[proses];
  if (hari == null) return null;
  return { hari, tanggal: tambahHariKerja(tglKirim, hari), dasar: cukup ? 'median riwayat vendor' : 'target proses' };
}
