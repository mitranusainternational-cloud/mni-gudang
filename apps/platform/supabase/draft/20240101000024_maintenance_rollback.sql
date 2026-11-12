-- PEMBATALAN migration 24 (Maintenance). Jalankan hanya bila perlu; menghapus tabel mtc BESERTA isinya (cadangkan dulu bila sudah dipakai).
DROP TABLE IF EXISTS public.mtc;

CREATE OR REPLACE FUNCTION public.table_stamps()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  t TEXT;
  v TEXT;
  res JSONB := '{}'::jsonb;
BEGIN
  FOREACH t IN ARRAY ARRAY['rm','fg','mutasi','spk','vendor','kirim','bongkar','master','mvendor','mcustomer',
                           'msupplier','marmada','rmhist','pr','opname','muser','log','mwc','produksi_log','sp'] LOOP
    EXECUTE format(
      'SELECT count(*)::text || ''|'' || COALESCE(max(COALESCE(to_jsonb(x) ->> ''updated_at'', to_jsonb(x) ->> ''created_at'', to_jsonb(x) ->> ''at'')), '''') FROM public.%I x', t)
      INTO v;
    res := res || jsonb_build_object(t, v);
  END LOOP;
  RETURN res;
END;
$function$;

DELETE FROM public.role_modules WHERE (role, module) IN (
  ('maintenance', 'maintenance'), ('maintenance', 'sparepart'),
  ('gudang', 'bahan-baku'), ('gudang', 'barang-jadi'), ('gudang', 'sparepart'),
  ('logistik', 'vendor'));
