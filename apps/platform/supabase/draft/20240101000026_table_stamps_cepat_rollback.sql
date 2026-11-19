-- PEMBATALAN migration 26: kembalikan table_stamps() ke definisi yang berlaku di production sebelum 2026-11-19 (setelah migration 24).
-- Hanya mengganti isi fungsi; data tidak terpengaruh. Klien memuat ulang tabelnya satu kali karena format sidik kembali berubah.
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
                           'msupplier','marmada','rmhist','pr','opname','muser','log','mwc','produksi_log','sp','mtc'] LOOP
    EXECUTE format(
      'SELECT count(*)::text || ''|'' || COALESCE(max(COALESCE(to_jsonb(x) ->> ''updated_at'', to_jsonb(x) ->> ''created_at'', to_jsonb(x) ->> ''at'')), '''') FROM public.%I x', t)
      INTO v;
    res := res || jsonb_build_object(t, v);
  END LOOP;
  RETURN res;
END;
$function$;
