// Pemeriksa invarian data hulu ke hilir (mock): dijalankan di akhir suite yang sudah membuat banyak transaksi.
// Setiap invarian adalah hal yang tidak boleh pernah salah, apa pun alur UI yang dipakai untuk membuat datanya.
export async function periksaInvarian(page) {
  return page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('mni-local-mock-db')).tables;
    const flat = (t) => (db[t] || []).map((r) => ({ ...(r.data || {}), ...r }));
    const g = (r, ...ks) => { for (const k of ks) if (r[k] !== undefined && r[k] !== null) return r[k]; return undefined; };
    const V = []; // pelanggaran
    const items = { rm: flat('rm'), fg: flat('fg'), sp: flat('sp') };
    const mut = flat('mutasi');
    const spk = flat('spk');
    const byId = (arr) => Object.fromEntries(arr.map((r) => [r.id, r]));
    const idx = { rm: byId(items.rm), fg: byId(items.fg), sp: byId(items.sp), spk: byId(spk) };

    // I1 stok tidak pernah negatif
    const stok = { rm: {}, fg: {}, sp: {} };
    for (const k of ['rm', 'fg', 'sp']) items[k].forEach((r) => { stok[k][r.id] = +g(r, 'stok_awal', 'stokAwal') || 0; });
    mut.forEach((m) => { if (stok[m.gudang] && m.item in stok[m.gudang]) stok[m.gudang][m.item] += +m.delta || 0; });
    for (const k of Object.keys(stok)) for (const [id, v] of Object.entries(stok[k])) if (v < 0) V.push(`I1 stok negatif ${k}:${(idx[k][id] || {}).item || (idx[k][id] || {}).kategori || id} = ${v}`);

    // I2 setiap mutasi menunjuk item yang ada di gudangnya, dan SPK yang ada bila bertanda SPK
    mut.forEach((m) => {
      if (!['rm', 'fg', 'sp'].includes(m.gudang)) V.push(`I2 gudang tidak dikenal "${m.gudang}"`);
      else if (!idx[m.gudang][m.item]) V.push(`I2 mutasi menunjuk item tidak ada (${m.gudang}:${m.item})`);
      if (m.spk && !idx.spk[m.spk]) V.push(`I2 mutasi menunjuk SPK tidak ada (${m.spk})`);
      if (typeof m.delta !== 'number' || !isFinite(m.delta) || m.delta === 0) V.push(`I2 delta tidak valid pada mutasi ${m.id}`);
    });

    // I3 mutasi masuk dan keluar selalu bernomor dokumen; satu nomor tidak dipakai dua jenis yang berbeda
    const noDok = (m) => g(m, 'noDok', 'no_dok');
    const pakai = {};
    mut.forEach((m) => {
      if (['masuk', 'keluar'].includes(m.jenis) && !noDok(m)) V.push(`I3 mutasi ${m.jenis} tanpa nomor dokumen (${m.gudang})`);
      if (noDok(m) && m.jenis !== 'koreksi') { const k = noDok(m); (pakai[k] = pakai[k] || new Set()).add(m.gudang + ':' + m.jenis); }
    });
    for (const [k, s] of Object.entries(pakai)) if (s.size > 1) V.push(`I3 nomor dokumen ${k} dipakai oleh jenis berbeda: ${[...s].join(', ')}`);

    // I4 koreksi: pembalik menolakkan transaksi asli dan asli ditandai
    const byIdMut = byId(mut);
    mut.filter((m) => m.jenis === 'koreksi').forEach((k) => {
      const o = byIdMut[g(k, 'koreksiDari', 'koreksi_dari')];
      if (!o) V.push('I4 koreksi tanpa transaksi asli');
      else { if (o.delta + k.delta !== 0) V.push(`I4 koreksi tidak menolakkan asli (${o.delta} dan ${k.delta})`); if (!g(o, 'dikoreksi')) V.push('I4 transaksi asli tidak ditandai dikoreksi'); }
    });

    // I5 nomor unik: SPK, surat jalan customer, surat jalan vendor, PR
    const dup = (arr, f, lbl) => { const s = {}; arr.forEach((r) => { const k = f(r); if (k === undefined || k === '' || k === null) return; s[k] = (s[k] || 0) + 1; }); Object.entries(s).filter(([, c]) => c > 1).forEach(([k]) => V.push(`I5 ${lbl} ganda: ${k}`)); };
    dup(spk, (r) => String(r.no), 'nomor SPK');
    dup(flat('kirim'), (r) => g(r, 'noSJ', 'no_sj'), 'nomor SJ customer');
    dup(flat('vendor'), (r) => g(r, 'noSJ', 'no_sj'), 'nomor SJ vendor');
    dup(flat('pr'), (r) => g(r, 'noPR', 'no_pr'), 'nomor PR');

    // I6 surat jalan customer dan vendor menunjuk SPK yang ada; jumlah kembali dari vendor tidak melebihi yang dikirim
    flat('kirim').forEach((k) => { if (k.status !== 'Batal' && k.spk && !idx.spk[k.spk]) V.push(`I6 SJ customer menunjuk SPK tidak ada (${g(k, 'noSJ', 'no_sj')})`); });
    flat('vendor').forEach((v) => {
      if (v.spk && !idx.spk[v.spk]) V.push(`I6 SJ vendor menunjuk SPK tidak ada (${g(v, 'noSJ', 'no_sj')})`);
      (v.items || []).forEach((i) => { if ((+i.kembali || 0) + (+i.reject || 0) > (+i.q || 0) + 1e-9 && !v.over) V.push(`I6 vendor ${g(v, 'noSJ', 'no_sj')}: kembali+reject ${(+i.kembali || 0) + (+i.reject || 0)} melebihi kirim ${i.q}`); });
    });

    // I7 PR: jumlah diterima tidak melebihi yang dipesan
    flat('pr').forEach((p) => (p.items || []).forEach((i) => { if ((+i.qTerima || 0) > (+i.q || 0) + 1e-9) V.push(`I7 PR ${g(p, 'noPR', 'no_pr')}: diterima ${i.qTerima} melebihi pesan ${i.q}`); }));

    // I8 SPK stok: barang masuk gudang jadi tidak melebihi yang diminta, dan hanya SPK Terbit yang menerima
    spk.filter((s) => s.stokReq).forEach((s) => {
      (s.items || []).forEach((it) => {
        const got = mut.filter((m) => m.gudang === 'fg' && m.spk === s.id && m.item === it.fg && (m.jenis === 'masuk' || (m.jenis === 'koreksi' && (byIdMut[g(m, 'koreksiDari', 'koreksi_dari')] || {}).jenis === 'masuk'))).reduce((a, m) => a + (+m.delta || 0), 0);
        if (got > (+it.q || 0) + 1e-9) V.push(`I8 SPK stok ${s.no}: masuk ${got} melebihi diminta ${it.q}`);
        if (got > 0 && s.status === 'Draft') V.push(`I8 SPK stok ${s.no} berstatus Draft tetapi sudah menerima barang`);
      });
    });

    // I9 SPK: customer terisi, item punya qty positif, status dikenal
    spk.forEach((s) => {
      if (!s.customer) V.push(`I9 SPK ${s.no} tanpa customer`);
      if (!['Draft', 'Terbit', 'Batal', undefined].includes(s.status)) V.push(`I9 SPK ${s.no} status tak dikenal ${s.status}`);
      (s.items || []).forEach((it) => { if (!(+it.q > 0)) V.push(`I9 SPK ${s.no}: item dengan qty tidak positif`); });
    });

    // I10 master: tidak ada nama customer, supplier, vendor yang sama persis dua kali
    ['mcustomer', 'msupplier', 'mvendor'].forEach((t) => dup(flat(t), (r) => String(r.nama || '').trim().toLowerCase(), `master ${t}`));

    return { pelanggaran: V, jumlah: { mutasi: mut.length, spk: spk.length, item: items.rm.length + items.fg.length + items.sp.length } };
  });
}
