// Bangun database uji lokal (PGlite, gratis) dari migration yang terpasang di production: 1..13, 14 (produksi_log), 18 (sparepart).
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const SB = fileURLToPath(new URL('../../', import.meta.url)); // apps/platform/supabase/
export const baca = (rel) => fs.readFileSync(SB + rel, 'utf8');

export async function bangun() {
  const db = new PGlite({ extensions: { uuid_ossp, pg_trgm } });
  // pengganti lingkungan Supabase: peran, skema auth, fungsi auth.*, publikasi realtime
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA IF NOT EXISTS auth; CREATE SCHEMA IF NOT EXISTS extensions;
    GRANT USAGE ON SCHEMA public, auth, extensions TO anon, authenticated, service_role;
    CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    CREATE OR REPLACE FUNCTION auth.email() RETURNS text LANGUAGE sql STABLE AS $$ SELECT auth.jwt() ->> 'email' $$;
    CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT coalesce(auth.jwt() ->> 'role', 'anon') $$;
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(auth.jwt() ->> 'sub', '')::uuid $$;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
    CREATE PUBLICATION supabase_realtime;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
  `);
  const urut = fs.readdirSync(SB + 'migrations').filter((f) => /^\d{14}_.*\.sql$/.test(f)).sort();
  const log = [];
  for (const f of urut) { try { await db.exec(baca('migrations/' + f)); log.push('OK   migrations/' + f); } catch (e) { log.push('GAGAL migrations/' + f + ' :: ' + e.message.slice(0, 200)); } }
  for (const f of ['draft/20240101000014_produksi_log.sql', 'draft/20240101000018_sparepart.sql']) { try { await db.exec(baca(f)); log.push('OK   ' + f); } catch (e) { log.push('GAGAL ' + f + ' :: ' + e.message.slice(0, 200)); } }
  return { db, log };
}

// jalankan sebagai pengguna (RLS berlaku) lalu kembali ke superuser
export async function sebagai(db, email, fn) {
  await db.exec(`SELECT set_config('request.jwt.claims', '${JSON.stringify({ role: 'authenticated', email, sub: '00000000-0000-0000-0000-000000000001' })}', false); SET ROLE authenticated;`);
  try { return await fn(); } finally { await db.exec('RESET ROLE'); }
}
export const coba = async (fn) => { try { const r = await fn(); return { ok: true, r }; } catch (e) { return { ok: false, e: String(e.message).slice(0, 120) }; } };

if (process.argv[1] && process.argv[1].endsWith('bangun.mjs')) {
  const { db, log } = await bangun();
  console.log(log.join('\n'));
  const t = await db.query(`select count(*)::int n from information_schema.tables where table_schema='public'`); console.log('tabel public:', t.rows[0].n);
}
