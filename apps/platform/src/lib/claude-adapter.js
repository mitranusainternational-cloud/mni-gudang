/**
 * MNI Gudang - Claude Platform Adapter for Supabase
 *
 * The original app uses window.claude.use('db') which returns a
 * Firestore-compatible DB object. This adapter intercepts that call
 * and returns a Supabase-backed object with the same interface,
 * so the main app HTML doesn't need its business logic changed.
 *
 * INJECT THIS BEFORE THE MAIN APP SCRIPT:
 *   <script type="module" src="/src/lib/claude-adapter.js"></script>
 *
 * The adapter emulates:
 *   DB.collection(col).add(data)
 *   DB.collection(col).onSnapshot(cb, errCb)
 *   DB.doc(path).get()
 *   DB.doc(path).set(data)
 *   DB.doc(path).update(data)
 *   DB.doc(path).delete()
 *   DB.doc(path).acquire(opts)        → optimistic lock (simplified)
 */


import { TABLE_COLS, STRICT_COLS } from './schema-columns.js';

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = window.__ENV?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.__ENV?.SUPABASE_ANON_KEY || '';

// VITE_LOCAL_MOCK=1: pratinjau lokal tanpa backend (data sintetis di localStorage).
// Selain itu memakai Supabase sungguhan. Modul dimuat dinamis agar mode mock tidak butuh internet.
const LOCAL_MOCK = window.__ENV?.LOCAL_MOCK === '1';
let supabase;
if (LOCAL_MOCK) {
  const { createLocalClient } = await import('./local-supabase.js');
  supabase = createLocalClient();
} else {
  // Dibundel oleh Vite dari paket npm (versi terkunci di package-lock.json), bukan dimuat dari CDN saat runtime.
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
}

// ── ID dokumen ───────────────────────────────────────────────────────────────
// App membuat id dokumen berbentuk string (mis. "spk-1003"), sedangkan kolom id di
// schema bertipe UUID. Id non-UUID dipetakan ke UUID deterministik (mirip UUID v5), jadi
// id yang sama selalu menghasilkan UUID yang sama dan pengecekan "sudah dipakai" tetap benar.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Alias id app -> UUID dibagikan ke app lewat window.__idAlias (dipakai byId), karena app memakai
// id buatannya sendiri sesaat setelah menyimpan (mis. membuka lembar SPK "spk-1003").
const ID_ALIAS = (window.__idAlias = window.__idAlias || {});
async function toDbId(id) {
  if (UUID_RE.test(String(id))) return id;
  if (ID_ALIAS[id]) return ID_ALIAS[id];
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode('mni:' + id))).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return (ID_ALIAS[id] = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`);
}

// Kolom spk.no bertipe TEXT di database, tetapi app memperlakukannya sebagai angka
// (parseInt, perbandingan !==). Tanpa konversi, mengedit SPK dianggap "ganti nomor".
// Tabel yang boleh belum ada di database (migration draf belum diterapkan): dibaca sebagai kosong, bukan galat.
const OPSIONAL = new Set(['produksi_log', 'penawaran', 'salesorder', 'sp']);
const numericNo = (table, row) => {
  if (table === 'spk' && row && row.no !== undefined && row.no !== null && /^\d+$/.test(String(row.no))) row.no = Number(row.no);
  return row;
};
const textNo = (table, row) => {
  if (table === 'spk' && row && row.no !== undefined && row.no !== null) row.no = String(row.no);
  return row;
};

// ── Bidang tambahan ke JSONB "data" ───────────────────────────────────────────
// Dokumen app memuat bidang di luar kolom tabel. Bidang itu disimpan di kolom JSONB "data"
// dan digabung kembali saat dibaca (lihat rowToDoc). Kolom nyata ditentukan TABLE_COLS.
function packRow(table, row, omitEmpty = false) {
  const cols = TABLE_COLS[table];
  if (!cols) return { row, extra: {} };
  const out = {};
  const extra = {};
  const strict = STRICT_COLS[table] || {};
  for (const [k, v] of Object.entries(row)) {
    if (k === 'data') continue;
    // Dokumen app memakai "" untuk "kosong"; Postgres menolak "" pada kolom DATE/TIMESTAMPTZ/NUMERIC/INTEGER/UUID
    // (mis. log.tgl, spk.due). Ubah ke NULL (B-013).
    if (cols.includes(k)) { if (v === '' && strict[k]) { if (!omitEmpty) out[k] = null; } else out[k] = v; } // insert: hilangkan agar DEFAULT kolom (mis. log.tgl) berlaku; update/set: NULL
    else if (v !== undefined) extra[k] = v;
  }
  return { row: out, extra };
}
function unpackRow(row) {
  if (!row) return row;
  const { data, ...cols } = row;
  return { ...(data && typeof data === 'object' ? data : {}), ...cols };
}

// ── Field name helpers ────────────────────────────────────────────────────────
// The original app stores _id as the Firestore document ID.
// Supabase uses `id` (UUID). We expose _id = id for compatibility.

function docToRow(docPath, data) {
  // docPath format: "collection/docId" or just collection when insert
  const parts = docPath ? docPath.split('/') : [];
  const id = parts[1] || undefined;
  const row = { ...data };
  delete row._id;
  if (id) row.id = id;
  // Normalize some Firestore-specific fields
  if (row.at && !row.created_at) { row.created_at = row.at; }
  if (row.by && !row.created_by) { row.created_by = row.by; }
  if (row.updAt && !row.updated_at) { row.updated_at = row.updAt; }
  if (row.updBy && !row.updated_by) { row.updated_by = row.updBy; }
  // prodLog → prod_log
  if (row.prodLog !== undefined && row.prod_log === undefined) { row.prod_log = row.prodLog; delete row.prodLog; }
  if (row.stokAwal !== undefined) { row.stok_awal = row.stokAwal; delete row.stokAwal; }
  if (row.tglStokAwal !== undefined) { row.tgl_stok_awal = row.tglStokAwal; delete row.tglStokAwal; }
  if (row.noSJ !== undefined) { row.no_sj = row.noSJ; delete row.noSJ; }
  if (row.noDok !== undefined) { row.no_dok = row.noDok; delete row.noDok; }
  if (row.terbitAt !== undefined) { row.terbit_at = row.terbitAt; delete row.terbitAt; }
  if (row.terbitBy !== undefined) { row.terbit_by = row.terbitBy; delete row.terbitBy; }
  if (row.noSJ !== undefined) { row.no_sj = row.noSJ; delete row.noSJ; }
  // Foreign key: spk string ID → spk_id UUID (for vendor, kirim tables)
  // We keep both for compat; the DB will use spk_id
  return row;
}

// Isi kolom relasi (item_id, spk_id) dari bidang app (item, spk) tanpa mengubah bidang app; bidang app tetap
// disimpan di JSONB sehingga pembacaan tidak berubah (B-016). Hanya bila nilainya ada.
async function linkIds(table, row) {
  const link = async (field, col) => { if (row[field] && !row[col]) row[col] = await toDbId(row[field]); };
  if (table === 'mutasi') await link('item', 'item_id');
  if (table === 'kirim' || table === 'vendor') await link('spk', 'spk_id');
  return row;
}

function rowToDoc(input) {
  if (!input) return null;
  const row = unpackRow(input);
  return {
    ...row,
    _id: row.id,
    // Reverse snake_case to camelCase for app compat
    at: row.at || row.created_at,
    by: row.by || row.created_by,
    updAt: row.updAt || row.updated_at,
    updBy: row.updBy || row.updated_by,
    prodLog: row.prodLog || row.prod_log,
    stokAwal: row.stokAwal !== undefined ? row.stokAwal : row.stok_awal,
    tglStokAwal: row.tglStokAwal || row.tgl_stok_awal,
    noSJ: row.noSJ || row.no_sj,
    noDok: row.noDok || row.no_dok,
    terbitAt: row.terbitAt || row.terbit_at,
    terbitBy: row.terbitBy || row.terbit_by,
  };
}

// ── Table name from "col/id" path ─────────────────────────────────────────────
function tableName(col) {
  // All collections are 1:1 table names in our schema
  return col;
}

// ── DB Collection Proxy ───────────────────────────────────────────────────────
function makeCollection(col) {
  const table = tableName(col);

  return {
    // Firestore: collection(col).add(data) → INSERT
    async add(data) {
      const packed = packRow(table, textNo(table, await linkIds(table, docToRow(null, data))), true);
      const row = { ...packed.row, data: packed.extra };
      delete row.id; // let DB generate UUID
      const { data: result, error } = await supabase
        .from(table)
        .insert(row)
        .select()
        .single();
      if (error) throw new Error(`[add:${table}] ${error.message}`);
      notifyWrite(table);
      return { id: result.id, ...numericNo(table, result) };
    },

    // Impor massal: satu permintaan per 200 baris (hemat waktu dibanding add() satu per satu).
    async addMany(list) {
      const rows = [];
      for (const data of list) {
        const packed = packRow(table, textNo(table, await linkIds(table, docToRow(null, data))), true);
        const row = { ...packed.row, data: packed.extra };
        delete row.id;
        rows.push(row);
      }
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await supabase.from(table).insert(rows.slice(i, i + 200));
        if (error) throw new Error(`[addMany:${table}] ${error.message}`);
      }
      notifyWrite(table);
    },

    // Firestore: collection(col).onSnapshot(cb) → Realtime subscription
    onSnapshot(cb, errCb) {
      // Initial load
      const load = async () => {
        // Sebelum login tidak ada sesi: jangan minta data (menghindari 401 di konsol); halaman dimuat ulang setelah login.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { if (lastSig === '') { lastSig = '[]'; cb({ docs: [] }); } return; }
        // Kolom pengurut berbeda per tabel: master hanya punya updated_at, log hanya punya tgl.
        const orderCol = ['created_at', 'updated_at', 'tgl'].find((c) => (TABLE_COLS[table] || ['created_at']).includes(c));
        let q = supabase.from(table).select('*');
        if (orderCol) q = q.order(orderCol, { ascending: false });
        const { data, error } = await q;
        if (error && OPSIONAL.has(table) && new RegExp(table + '|schema cache|does not exist', 'i').test(error.message || '')) { if (lastSig !== '[]') { lastSig = '[]'; cb({ docs: [] }); } return; }
        if (error) { errCb && errCb(error); return; }
        const docs = (data || []).map((r) => (table === 'master' ? masterToDoc(r) : rowToDoc(numericNo(table, r))));
        // Lewati bila isi sama dengan pemuatan sebelumnya agar polling tidak merender ulang UI tanpa perubahan.
        const sig = JSON.stringify(docs);
        if (sig === lastSig) return;
        lastSig = sig;
        // Emulate Firestore snapshot shape
        cb({ docs: docs.map(d => ({ data: () => d, id: d._id })) });
      };
      let lastSig = '';

      load();
      // Muat ulang segera setelah tulis dari tab ini, tanpa menunggu event Realtime (B-014).
      if (!REFRESH.has(table)) REFRESH.set(table, new Set());
      REFRESH.get(table).add(load);
      // Cadangan bila event Realtime tidak tiba (B-017): muat ulang berkala saat tab terlihat dan saat tab kembali fokus.
      // Cek sidik perubahan (satu panggilan kecil bersama) tiap beberapa detik; bila fungsinya belum ada, kembali ke muat ulang berkala per tabel.
      startStampPoll();
      const pollMs = Number(window.__ENV?.POLL_MS) || 15000;
      const timer = setInterval(() => { if (!document.hidden && (!STAMP.ok || !(STAMP.last && table in STAMP.last))) load(); }, pollMs);
      const onVis = () => { if (!document.hidden) { load(); checkStamps(); } };
      document.addEventListener('visibilitychange', onVis);

      // Realtime
      const channel = supabase
        .channel(`rt:${table}:${Math.random()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table },
          async () => { await load(); }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            errCb && errCb({ code: 'channel-error', message: 'Realtime channel error' });
          }
        });

      // Return unsubscribe (Firestore returns the unsubscribe fn directly)
      return () => { REFRESH.get(table)?.delete(load); clearInterval(timer); document.removeEventListener('visibilitychange', onVis); return supabase.removeChannel(channel); };
    }
  };
}

// ── DB Doc Proxy ──────────────────────────────────────────────────────────────
// Tabel master dan koleksi counter memakai kolom key (teks) dengan nilai JSON, bukan id UUID.
// Dokumen master dipetakan ke objek datar { ...value, _id: key } seperti yang dibaca app.
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function masterToDoc(row) {
  if (!row) return null;
  let v = row.value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { /* biarkan string */ } }
  return { ...(isObj(v) ? v : { value: v }), _id: row.key, key: row.key, updAt: row.updated_at, at: row.created_at };
}
const stripMeta = (d) => { const o = { ...d }; delete o._id; delete o.key; return o; };

function makeDoc(path) {
  // path = "collection/docId" (struktur bertingkat diratakan)
  const parts = path.split('/');
  const col = parts[0];
  const rawId = parts[1];
  const table = tableName(col);
  const isCounter = col === 'counter';
  const keyed = isCounter || table === 'master';
  const keyOf = () => rawId;
  const idOf = () => toDbId(rawId);

  return {
    // .get()
    async get() {
      if (keyed) {
        const { data } = await supabase.from('master').select('*').eq('key', keyOf()).maybeSingle();
        // Counter: app membaca ref.get().data().n, jadi kembalikan isi value ({ n }) apa adanya (B-015).
        const counterVal = (v) => { if (typeof v === 'string') { try { v = JSON.parse(v); } catch { /* biarkan */ } } return isObj(v) ? v : { value: v }; };
        return { exists: !!data, data: () => (data ? (isCounter ? counterVal(data.value) : masterToDoc(data)) : null) };
      }
      const { data, error } = await supabase.from(table).select('*').eq('id', await idOf()).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return { exists: !!data, data: () => (data ? rowToDoc(numericNo(table, data)) : null) };
    },

    // .set(data) — upsert
    async set(data) {
      if (keyed) {
        const value = isCounter ? (data.value ?? data) : stripMeta(data);
        const { error } = await supabase.from('master').upsert({ key: keyOf(), value }, { onConflict: 'key' });
        if (error) throw new Error(`[set:master:${keyOf()}] ${error.message}`);
        notifyWrite('master');
        return;
      }
      const id = await idOf();
      const packed = packRow(table, textNo(table, await linkIds(table, docToRow(path, data))));
      const row = { ...packed.row, data: packed.extra };
      row.id = id;
      const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
      if (error) throw new Error(`[set:${table}:${id}] ${error.message}`);
      notifyWrite(table);
    },

    // .update(data) — pembaruan parsial
    async update(data) {
      if (keyed) {
        const { data: cur } = await supabase.from('master').select('*').eq('key', keyOf()).maybeSingle();
        const old = cur ? (isCounter ? { value: cur.value } : stripMeta(masterToDoc(cur))) : {};
        const value = isCounter ? (data.value ?? data) : { ...old, ...stripMeta(data) };
        const { error } = await supabase.from('master').upsert({ key: keyOf(), value }, { onConflict: 'key' });
        if (error) throw new Error(`[update:master:${keyOf()}] ${error.message}`);
        notifyWrite('master');
        return;
      }
      const id = await idOf();
      const packed = packRow(table, textNo(table, await linkIds(table, docToRow(path, data))));
      const row = packed.row;
      delete row.id;
      if (Object.keys(packed.extra).length) {
        // Gabung dengan data lama (baca-ubah-tulis). Cukup untuk fase awal; ganti dengan RPC atomik bila ada penulisan serentak.
        const { data: cur } = await supabase.from(table).select('data').eq('id', id).maybeSingle();
        row.data = { ...((cur && cur.data) || {}), ...packed.extra };
      }
      const { error } = await supabase.from(table).update(row).eq('id', id);
      if (error) throw new Error(`[update:${table}:${id}] ${error.message}`);
      notifyWrite(table);
    },

    // .delete()
    async delete() {
      if (keyed) {
        await supabase.from('master').delete().eq('key', keyOf());
        notifyWrite('master');
        return;
      }
      const id = await idOf();
      // Hapus lunak untuk catatan bisnis
      const SOFT = new Set(['spk', 'kirim', 'vendor', 'pr', 'bongkar']);
      if (SOFT.has(table)) {
        const { error } = await supabase.from(table).update({ status: 'Batal' }).eq('id', id);
        if (error) throw new Error(`[softDel:${table}:${id}] ${error.message}`);
      } else {
        // Kebijakan RLS yang menolak DELETE tidak mengembalikan galat, hanya nol baris: tanpa pemeriksaan ini UI melaporkan sukses palsu.
        const { data, error } = await supabase.from(table).delete().eq('id', id).select('id');
        if (error) throw new Error(`[delete:${table}:${id}] ${error.message}`);
        if (!data || !data.length) throw new Error('Penghapusan permanen ditolak database (larangan hapus permanen, migration 13). Gunakan Nonaktifkan atau koreksi dengan transaksi pembalik.');
      }
      notifyWrite(table);
    },

    // .acquire(opts) — kunci optimistis sederhana, disimpan di tabel master dengan key "lock:col:id"
    async acquire({ holder, ttlMs } = {}) {
      const lockKey = `lock:${col}:${rawId}`;
      // Kunci atomik di database (try_lock): cek-lalu-tulis di sisi klien dapat memberi kunci yang sama ke dua pengguna.
      const rpc = await supabase.rpc('try_lock', { p_key: lockKey, p_holder: String(holder || ''), p_ttl_ms: ttlMs || 30000 });
      if (!rpc.error && rpc.data) {
        return rpc.data.acquired
          ? { acquired: true }
          : { acquired: false, holder: rpc.data.holder, expiresAt: new Date(rpc.data.expires || Date.now()).toISOString() };
      }
      // Cadangan bila fungsi belum ada (migration 10 belum dijalankan): perilaku lama.
      const now = Date.now();
      const expires = now + (ttlMs || 30000);

      const { data: existing } = await supabase.from('master').select('*').eq('key', lockKey).maybeSingle();

      if (existing?.value) {
        const lock = typeof existing.value === 'object' ? existing.value :
          (typeof existing.value === 'string' ? JSON.parse(existing.value) : {});
        if (lock.expires > now && lock.holder !== holder) {
          return { acquired: false, holder: lock.holder, expiresAt: new Date(lock.expires).toISOString() };
        }
      }

      await supabase.from('master').upsert({
        key: lockKey,
        value: JSON.stringify({ holder, expires }),
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

      return { acquired: true };
    }
  };
}

// ── Sinkron antar pengguna: penanda perubahan tabel (migration 12) ───────────
// Satu panggilan rpc('table_stamps') tiap STAMP_MS; hanya tabel yang sidiknya berubah yang dimuat ulang.
const STAMP = { ok: false, last: null, timer: null, busy: false };
async function checkStamps() {
  if (STAMP.busy) return;
  STAMP.busy = true;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase.rpc('table_stamps');
    if (error || !data) { STAMP.ok = false; return; }
    STAMP.ok = true;
    const prev = STAMP.last;
    STAMP.last = data;
    if (!prev) return;
    for (const [tbl, sig] of Object.entries(data)) {
      if (prev[tbl] !== sig) REFRESH.get(tbl)?.forEach((fn) => { try { fn(); } catch { /* abaikan */ } });
    }
  } catch { STAMP.ok = false; } finally { STAMP.busy = false; }
}
function startStampPoll() {
  if (STAMP.timer) return;
  const ms = Number(window.__ENV?.STAMP_MS) || 4000;
  STAMP.timer = setInterval(() => { if (!document.hidden) checkStamps(); }, ms);
  checkStamps();
}

// ── Muat ulang setelah tulis lokal ────────────────────────────────────────────
// Pendengar (onSnapshot) per tabel; dipanggil setelah add/set/update/delete berhasil agar UI langsung
// memuat ulang meski event Realtime lambat atau tidak tiba. Realtime tetap dipakai untuk tulisan dari sesi lain.
const REFRESH = new Map();
function notifyWrite(table) {
  const fns = REFRESH.get(table);
  if (fns) fns.forEach((fn) => { try { fn(); } catch { /* abaikan */ } });
}

// ── Main DB Object (replaces Firestore) ───────────────────────────────────────
const DB_ADAPTER = {
  collection: (col) => makeCollection(col),
  doc: (path) => makeDoc(path),
};

// ── User adapter (replaces window.claude.use('user')) ────────────────────────
// Role model aplikasi (ROLES di app.js); sama dengan role_modules di database. viewer tidak menulis.
const WRITE_ROLES = ['admin', 'ppic', 'gbb', 'gbj', 'logistik', 'produksi', 'sales'];

// Hak ubah efektif: admin selalu; hak khusus (muser.data.modul) bila ada, selain itu mengikuti peran bawaan.
const bisaMengubah = (muser) => {
  if (!muser || muser.aktif === false) return false;
  if (muser.role === 'admin') return true;
  const modul = muser.data && muser.data.modul;
  if (modul && typeof modul === 'object') return Object.values(modul).includes('ubah');
  return WRITE_ROLES.includes(muser.role);
};

async function makeUserAdapter() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return null;

  // Fetch user role from muser table
  const { data: muser } = await supabase
    .from('muser')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  return {
    me: async () => ({
      id: user.email,
      email: user.email,
      name: muser?.nama || user.email, // dipakai app untuk nama tampilan
      nama: muser?.nama || user.email,
      role: muser?.role || 'viewer',
      modul: muser?.data?.modul || null, // hak per modul {"spk":"ubah","bahan-baku":"lihat"}; null = ikuti peran
      jabatan: muser?.data?.jabatan || '',
      terdaftar: !!muser,
      isOwner: muser?.role === 'admin' && muser?.aktif !== false,
      canEdit: bisaMengubah(muser),
    }),
    can: async (permission) => {
      if (permission === 'data.write') return bisaMengubah(muser);
      return !!muser && muser.aktif !== false;
    },
    // Kelola pengguna (hanya admin): Edge Function kelola-pengguna memakai kunci server yang tidak pernah sampai ke browser.
    manage: async (action, payload = {}) => {
      const { data, error } = await supabase.functions.invoke('kelola-pengguna', { body: { action, ...payload } });
      if (error) {
        let msg = error.message;
        try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch { /* pakai pesan bawaan */ }
        throw new Error(msg);
      }
      if (data && data.error) throw new Error(data.error);
      notifyWrite('muser'); // muat ulang daftar pengguna segera
      return data;
    },
    // App memanggil USER.profiles(ids) untuk warna dan foto avatar (API platform asli).
    // Warna dibuat deterministik dari id; foto belum didukung.
    profiles: async (ids = []) => Object.fromEntries(ids.map((id) => {
      let h = 0;
      for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) % 360;
      return [id, { color: `hsl(${h} 55% 34%)`, avatarUrl: null }];
    })),
    // Cadangan: semua tabel mentah (urutan aman untuk pemulihan). Hanya super admin yang membaca semuanya (RLS).
    exportAll: async () => {
      const tables = ['muser', 'role_modules', 'master', 'mwc', 'mvendor', 'mcustomer', 'msupplier', 'marmada', 'rm', 'fg', 'spk', 'rmhist', 'pr', 'opname', 'mutasi', 'vendor', 'kirim', 'bongkar', 'log', 'audit_log', 'penawaran', 'salesorder', 'sp'];
      const out = {};
      for (const t of tables) {
        const rows = [];
        for (let from = 0; ; from += 1000) {
          const { data, error } = await supabase.from(t).select('*').range(from, from + 999);
          if (error && (t === 'audit_log' || OPSIONAL.has(t))) break; // migration 13 belum terpasang: lewati
          if (error) throw new Error('Gagal membaca ' + t + ': ' + error.message);
          rows.push(...data);
          if (data.length < 1000) break;
        }
        out[t] = rows;
      }
      return out;
    },
    // Riwayat perubahan (migration 13), hanya super admin. null = belum tersedia di database ini.
    auditList: async (limit = 200) => {
      const { data, error } = await supabase.from('audit_log').select('*').order('at', { ascending: false }).limit(limit);
      if (error) { if (/audit_log|does not exist|schema cache/i.test(error.message)) return null; throw new Error(error.message); }
      return data;
    },
    // Ganti password sendiri (pengguna yang sedang login).
    changePassword: async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(/same|different/i.test(error.message) ? 'Password baru harus berbeda dari password lama.' : error.message);
    },
    signIn: async (email) => {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
    },
    signOut: async () => await supabase.auth.signOut(),
    onAuthChange: (cb) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(cb);
      return () => subscription.unsubscribe();
    }
  };
}

// ── Inject into window.claude ─────────────────────────────────────────────────
const CLAUDE_SHIM = {
  use: async (service) => {
    if (service === 'db') return DB_ADAPTER;
    if (service === 'user') return makeUserAdapter();
    if (service === 'downloads') {
      const saveBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      return {
        // API yang dipanggil app: DLS.save({ filename, data }) dengan data Blob atau Uint8Array.
        save: async ({ filename, data }) => saveBlob(data instanceof Blob ? data : new Blob([data]), filename),
        download: saveBlob, // bentuk lama (blob, filename)
      };
    }
    throw new Error(`Unknown service: ${service}`);
  }
};

// Inject before main app loads
// Mesin hitung berat (kalkulator Excel). Katalog rumus dimuat aplikasi dari database setelah login (bukan dikemas di JS publik).
import { hitungItem as _hitungItem } from './berat/parser.js';
let _katalogBerat = null;
window.MNIBerat = {
  siap: () => !!_katalogBerat,
  setKatalog: (c) => { _katalogBerat = c; },
  info: () => (_katalogBerat ? { versi: _katalogBerat.versi, keluarga: Object.keys(_katalogBerat.keluarga).length, bentuk: Object.values(_katalogBerat.keluarga).reduce((a, f) => a + f.bentuk.length, 0) } : null),
  hitungItem: (o) => (_katalogBerat ? _hitungItem(_katalogBerat, o) : { ok: false, alasan: 'Katalog berat belum dipasang.' }),
};

// Mesin rute produksi multi work center: rute, antrian, beban, kapasitas, posisi, vendor (fungsi murni)
import * as _rute from './produksi/rute.js';
import * as _kinerja from './produksi/kinerja.js';
import * as _laporan from './produksi/laporan.js';
import * as _analisa from './produksi/analisa.js';
import * as _statistik from './produksi/statistik.js';
import * as _jadwal from './produksi/jadwal.js';
import * as _kapasitas from './produksi/kapasitas.js';
import * as _rencana from './produksi/rencana.js';
import * as _harga from './erp/harga.js';
import * as _penawaran from './erp/penawaran.js';
import * as _salesorder from './erp/salesorder.js';
import * as _material from './erp/material.js';
window.MNIProduksi = { ..._rute, ..._kinerja, ..._laporan, ..._analisa, ..._statistik, ..._jadwal, ..._kapasitas, ..._rencana };
// Mesin penawaran (harga, aturan, alur). Katalog dan skenario harga dimuat dari tabel master setelah login (setKatalog).
window.MNIMaterial = { ..._material };
window.MNIHarga = {
  ..._harga, ..._penawaran, ..._salesorder, katalog: null, skenario: null,
  setKatalog(k, s) { this.katalog = k; this.skenario = s; },
  ada() { return !!(this.katalog && this.skenario && this.skenario.length); },
  info() { return this.katalog ? { bentuk: this.katalog.bentuk.length, keluarga: _penawaran.daftarKeluarga(this.katalog).length, skenario: (this.skenario || []).length } : null; },
};

window.claude = CLAUDE_SHIM;
window.__supabase = supabase;

console.log('[MNI Gudang] Adapter siap.', LOCAL_MOCK ? 'MODE MOCK LOKAL (bukan Supabase)' : 'Supabase URL: ' + (SUPABASE_URL || '(NOT SET)'));
