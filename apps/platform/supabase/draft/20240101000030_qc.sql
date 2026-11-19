-- Modul QC (Daily Check Sheet): tabel `qc` satu dokumen per SPK, modul hak `qc` dan `lapor`.
-- Disimpan di `draft`, bukan `migrations`, agar tidak ikut terpasang tanpa persetujuan pemilik (aturan rilis bertahap: hanya menambah).
-- Pola sama dengan tabel mtc (migration 24): kolom ringkas untuk filter, sisanya di `data` (jsonb).

create table if not exists public.qc (
  id uuid primary key default gen_random_uuid(),
  no text,
  spk text,
  status text,
  hasil text,
  tgl date,
  inspector text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text,
  data jsonb not null default '{}'::jsonb
);
create unique index if not exists qc_spk_uniq on public.qc (spk);
create index if not exists qc_status_idx on public.qc (status);

alter table public.qc enable row level security;

-- Lihat: peran dengan hak modul qc (lihat atau ubah). Ubah: hak modul qc = ubah. Fungsi can_view / can_mod mengikuti migration 25.
create policy qc_select on public.qc for select using (public.can_view('qc'));
create policy qc_insert on public.qc for insert with check (public.can_mod('qc'));
create policy qc_update on public.qc for update using (public.can_mod('qc')) with check (public.can_mod('qc'));
create policy qc_delete on public.qc for delete using (public.is_admin());

-- Operator produksi: hak `lapor` (hanya mencatat produksi_log) tanpa hak ubah SPK. Penyaringan work centre dilakukan di aplikasi; peran operator hanya melihat SPK.
-- (Penyesuaian policy produksi_log agar menerima can_mod('lapor') atau can_mod('spk') dilakukan pada migration terpisah setelah persetujuan.)
