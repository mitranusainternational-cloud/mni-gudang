// Edge Function kelola-pengguna: admin membuat akun tim dan mengatur ulang password.
// Kunci service-role hanya ada di lingkungan fungsi ini (disuntik Supabase), tidak pernah dikirim ke browser.
// Pemanggil harus login dan berstatus super admin aktif (public.is_admin()); selain itu ditolak.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const ROLES = ['admin', 'ppic', 'produksi', 'gudang', 'gbb', 'gbj', 'logistik', 'maintenance', 'qc', 'viewer'];
const MODULES = ['bahan-baku', 'barang-jadi', 'sparepart', 'bongkar-muat', 'vendor', 'pengiriman', 'spk', 'qc', 'maintenance', 'master-data'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

function cleanModul(input: unknown): Record<string, string> | null {
  if (input == null) return null;
  if (typeof input !== 'object' || Array.isArray(input)) throw new Error('Format hak modul tidak valid.');
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!MODULES.includes(k)) throw new Error(`Modul tidak dikenal: ${k}`);
    if (v !== 'lihat' && v !== 'ubah') throw new Error(`Hak untuk ${k} harus "lihat" atau "ubah".`);
    out[k] = v;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return reply({ error: 'Metode tidak didukung.' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY') || req.headers.get('apikey') || '';
  const auth = req.headers.get('Authorization') || '';
  if (!auth) return reply({ error: 'Belum login.' }, 401);

  // 1) Pemanggil harus super admin aktif (diperiksa dengan token pemanggil, jadi tunduk pada RLS)
  const asCaller = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: who } = await asCaller.auth.getUser();
  if (!who?.user?.email) return reply({ error: 'Sesi tidak valid.' }, 401);
  const { data: isAdmin, error: adminErr } = await asCaller.rpc('is_admin');
  if (adminErr || isAdmin !== true) return reply({ error: 'Hanya super admin yang boleh mengelola pengguna.' }, 403);
  const caller = who.user.email.toLowerCase();

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  let body: Record<string, any>;
  try { body = await req.json(); } catch { return reply({ error: 'Isi permintaan tidak valid.' }, 400); }

  try {
    if (body.action === 'create') {
      const email = String(body.email || '').trim().toLowerCase();
      const nama = String(body.nama || '').trim();
      const role = String(body.role || '');
      const password = body.password ? String(body.password) : '';
      if (!EMAIL_RE.test(email)) return reply({ error: 'Email tidak valid.' }, 400);
      if (!nama) return reply({ error: 'Isi nama.' }, 400);
      if (!ROLES.includes(role)) return reply({ error: 'Peran tidak dikenal.' }, 400);
      if (password && password.length < 8) return reply({ error: 'Password minimal 8 karakter.' }, 400);
      const modul = role === 'admin' ? null : cleanModul(body.modul);

      const { data: ada } = await admin.from('muser').select('id').eq('email', email).maybeSingle();
      if (ada) return reply({ error: 'Email ini sudah terdaftar sebagai pengguna.' }, 409);

      // Akun login (Auth): dengan password sementara, atau undangan lewat email
      let authId: string | undefined;
      if (password) {
        const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        if (error && !/already|registered|exists/i.test(error.message)) return reply({ error: 'Gagal membuat akun: ' + error.message }, 400);
        authId = data?.user?.id;
      } else {
        const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
        if (error && !/already|registered|exists/i.test(error.message)) return reply({ error: 'Gagal mengirim undangan: ' + error.message }, 400);
        authId = data?.user?.id;
      }

      const row = {
        email, nama, role, aktif: true, created_by: caller, updated_by: caller,
        data: { jabatan: String(body.jabatan || '').trim(), ...(modul ? { modul } : {}) },
      };
      const { data: baru, error: insErr } = await admin.from('muser').insert(row).select('id').single();
      if (insErr) return reply({ error: 'Gagal menyimpan pengguna: ' + insErr.message }, 400);
      return reply({ ok: true, id: baru.id, authId, dengan_password: !!password });
    }

    if (body.action === 'reset_password') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!EMAIL_RE.test(email)) return reply({ error: 'Email tidak valid.' }, 400);
      if (password.length < 8) return reply({ error: 'Password minimal 8 karakter.' }, 400);
      const { data: m } = await admin.from('muser').select('id').eq('email', email).maybeSingle();
      if (!m) return reply({ error: 'Pengguna tidak terdaftar.' }, 404);
      let id: string | undefined;
      for (let page = 1; page <= 10 && !id; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) return reply({ error: error.message }, 400);
        id = data.users.find((u) => (u.email || '').toLowerCase() === email)?.id;
        if (data.users.length < 200) break;
      }
      if (!id) return reply({ error: 'Akun login untuk email ini belum dibuat.' }, 404);
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return reply({ error: 'Gagal mengatur password: ' + error.message }, 400);
      return reply({ ok: true });
    }

    return reply({ error: 'Aksi tidak dikenal.' }, 400);
  } catch (e) {
    return reply({ error: (e as Error).message || 'Galat tidak terduga.' }, 500);
  }
});
