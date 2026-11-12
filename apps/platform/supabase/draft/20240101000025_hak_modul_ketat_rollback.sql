-- PEMBATALAN migration 25 (hak modul ketat): kembali ke perilaku migration 11 (tanpa peta modul: ubah sesuai role_modules, lihat semua modul lain).
CREATE OR REPLACE FUNCTION public.mod_level(m TEXT)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT CASE
    WHEN u.role = 'admin' THEN 'ubah'
    WHEN jsonb_typeof(u.data -> 'modul') = 'object' THEN
      CASE u.data -> 'modul' ->> m WHEN 'ubah' THEN 'ubah' WHEN 'lihat' THEN 'lihat' ELSE NULL END
    WHEN EXISTS (SELECT 1 FROM public.role_modules r WHERE r.role = u.role AND r.module = m) THEN 'ubah'
    ELSE 'lihat'
  END
  FROM public.muser u
  WHERE u.email = (SELECT auth.email()) AND u.aktif;
$$;

CREATE OR REPLACE FUNCTION public.can_any()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.muser u
    WHERE u.email = (SELECT auth.email()) AND u.aktif
      AND (u.role = 'admin'
        OR (jsonb_typeof(u.data -> 'modul') = 'object'
            AND EXISTS (SELECT 1 FROM jsonb_each_text(u.data -> 'modul') j WHERE j.value = 'ubah'))
        OR (jsonb_typeof(u.data -> 'modul') IS DISTINCT FROM 'object'
            AND EXISTS (SELECT 1 FROM public.role_modules r WHERE r.role = u.role)))
  );
$$;

-- hapus baris hak 'lihat' lalu kolom level (baris 'ubah' tetap seperti sebelum migration 25)
DELETE FROM public.role_modules WHERE level = 'lihat';
ALTER TABLE public.role_modules DROP CONSTRAINT IF EXISTS role_modules_level_chk;
ALTER TABLE public.role_modules DROP COLUMN IF EXISTS level;
