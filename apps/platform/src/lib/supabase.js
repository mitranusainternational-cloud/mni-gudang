/**
 * MNI Gudang - Supabase Client & Data Layer
 * Replaces Firestore SDK with Supabase equivalents
 *
 * API mirrors the original Firestore usage:
 *   addDoc(col, data)  → INSERT
 *   updDoc(col, id, data) → UPDATE
 *   delDoc(col, id)    → DELETE (soft: sets status='Batal' when applicable)
 *   subscribeAll(cb)   → Supabase Realtime subscription for all tables
 *
 * Collection name mapping (Firestore → Supabase table):
 *   spk, rm, fg, mutasi, vendor, kirim, bongkar,
 *   master, mvendor, mcustomer, msupplier, marmada,
 *   rmhist, pr, opname, muser, ureq, log, uinv, mwc
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── Config (from env or window injected by build) ─────────────────────────────
const SUPABASE_URL = window.__ENV?.SUPABASE_URL || import.meta?.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.__ENV?.SUPABASE_ANON_KEY || import.meta?.env?.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[DB] Supabase env vars missing! Set SUPABASE_URL and SUPABASE_ANON_KEY.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});

// ── All collection / table names ──────────────────────────────────────────────
export const COLS = [
  'rm','fg','mutasi','spk','vendor','kirim','bongkar',
  'master','mvendor','mcustomer','msupplier','marmada',
  'rmhist','pr','opname','muser','ureq','log','uinv','mwc'
];

// Firestore field → Supabase column name mapping
// (Supabase uses snake_case; original Firestore used camelCase in some fields)
const FIELD_MAP = {
  // SPK
  prodLog:      'prod_log',
  terbitAt:     'terbit_at',
  terbitBy:     'terbit_by',
  updAt:        'upd_at',
  updBy:        'upd_by',
  // RM/FG
  stokAwal:     'stok_awal',
  tglStokAwal:  'tgl_stok_awal',
  // mutasi
  noDok:        'no_dok',
  // kirim
  noSJ:         'no_sj',
  // bongkar
  noDO:         'no_do',
  // vendor memakai kolom no_sj yang sama dengan kirim (pemetaan noSJ di atas)
  // common audit
  at:           'created_at',
  by:           'created_by',
};

// ── Field name normalizer ─────────────────────────────────────────────────────
function toDb(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const dbKey = FIELD_MAP[k] || k;
    out[dbKey] = v;
  }
  return out;
}

function fromDb(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  // Reverse map + add _id alias for compatibility with existing code
  const reverseMap = Object.fromEntries(
    Object.entries(FIELD_MAP).map(([js, db]) => [db, js])
  );
  const out = { ...obj, _id: obj.id };
  for (const [dbKey, jsKey] of Object.entries(reverseMap)) {
    if (dbKey in obj) {
      out[jsKey] = obj[dbKey];
    }
  }
  return out;
}

// ── CRUD operations ───────────────────────────────────────────────────────────

/**
 * Add a new document (INSERT)
 * @param {string} col - table name
 * @param {object} data - fields
 * @param {string} [byEmail] - current user email for audit
 * @returns {Promise<{id: string, ...}>}
 */
export async function addDoc(col, data, byEmail) {
  const row = toDb({ ...data });
  if (byEmail) {
    row.created_by = byEmail;
    row.updated_by = byEmail;
  }
  // Remove _id if present (let DB generate UUID)
  delete row._id;
  delete row.id;

  const { data: result, error } = await supabase
    .from(col)
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`[addDoc:${col}] ${error.message}`);
  return fromDb(result);
}

/**
 * Update a document (UPDATE by id)
 * @param {string} col
 * @param {string} id
 * @param {object} data - partial fields to update
 * @param {string} [byEmail]
 */
export async function updDoc(col, id, data, byEmail) {
  const row = toDb({ ...data });
  delete row._id;
  delete row.id;
  if (byEmail) row.updated_by = byEmail;

  const { error } = await supabase
    .from(col)
    .update(row)
    .eq('id', id);

  if (error) throw new Error(`[updDoc:${col}:${id}] ${error.message}`);
}

/**
 * Delete a document
 * NOTE: For business records (spk, kirim, vendor, pr, bongkar)
 * we prefer soft-delete (status='Batal'). Hard delete for master data.
 * @param {string} col
 * @param {string} id
 * @param {boolean} [hard=false] - if true, DELETE; if false, set status='Batal'
 */
const SOFT_DELETE_COLS = new Set(['spk','kirim','vendor','pr','bongkar','mutasi']);

export async function delDoc(col, id, hard = false) {
  if (!hard && SOFT_DELETE_COLS.has(col)) {
    const { error } = await supabase
      .from(col)
      .update({ status: 'Batal' })
      .eq('id', id);
    if (error) throw new Error(`[delDoc(soft):${col}:${id}] ${error.message}`);
    return;
  }
  const { error } = await supabase.from(col).delete().eq('id', id);
  if (error) throw new Error(`[delDoc:${col}:${id}] ${error.message}`);
}

/**
 * Fetch all rows from a table
 * @param {string} col
 * @returns {Promise<Array>}
 */
export async function fetchAll(col) {
  const { data, error } = await supabase
    .from(col)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`[fetchAll:${col}] ${error.message}`);
  return (data || []).map(fromDb);
}

// ── Realtime subscriptions ────────────────────────────────────────────────────

/**
 * Subscribe to all tables — mirrors Firestore onSnapshot behaviour.
 * Calls cb(col, rows) whenever any table changes.
 * Returns unsubscribe function.
 *
 * @param {Function} cb - (col: string, rows: Array) => void
 * @returns {Function} unsubscribe
 */
export function subscribeAll(cb) {
  // Initial data load
  const initialLoad = async () => {
    await Promise.all(
      COLS.map(async (col) => {
        try {
          const rows = await fetchAll(col);
          cb(col, rows);
        } catch (e) {
          console.warn(`[subscribeAll] initial load failed for ${col}:`, e.message);
        }
      })
    );
  };

  initialLoad();

  // Realtime channel
  const channels = [];

  COLS.forEach((col) => {
    const channel = supabase
      .channel(`realtime:${col}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: col },
        async () => {
          // Re-fetch all rows for this table on any change
          try {
            const rows = await fetchAll(col);
            cb(col, rows);
          } catch (e) {
            console.warn(`[realtime:${col}] refetch failed:`, e.message);
          }
        }
      )
      .subscribe();
    channels.push(channel);
  });

  // Return unsubscribe function
  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Get current session user
 */
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

/**
 * Sign in with email OTP (magic link or OTP)
 */
export async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false }
  });
  if (error) throw error;
}

/**
 * Sign in with email + password
 */
export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(cb) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(cb);
  return () => subscription.unsubscribe();
}

// ── Utility: write activity log ───────────────────────────────────────────────
export async function writeLog(aksi, koleksi, docId, detail, byEmail) {
  try {
    await supabase.from('log').insert({
      aksi,
      koleksi,
      doc_id: docId,
      detail: detail || null,
      by: byEmail
    });
  } catch (_) {
    // log errors are non-fatal
  }
}
