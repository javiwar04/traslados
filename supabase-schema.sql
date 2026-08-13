-- Ejecutar en Supabase > SQL Editor.
-- Esta app es publica en GitHub Pages, por eso solo uses publishable key/anon key en config.js.
-- Estas politicas permiten que la app lea, agregue, edite y borre traslados sin login.

drop table if exists public.traslados;

create table public.traslados (
  uid uuid primary key default gen_random_uuid(),
  id text,
  fecha date not null,
  huesped text not null,
  hotel text not null,
  tipo text not null check (tipo in ('Llegada', 'Salida')),
  hora time not null,
  pax integer not null default 1 check (pax > 0),
  estado text not null default 'Pendiente',
  notas text default '',
  created_at timestamptz not null default now()
);

create index if not exists traslados_fecha_hora_idx on public.traslados (fecha, hora);
create index if not exists traslados_legacy_id_idx on public.traslados (id);

alter table public.traslados enable row level security;

drop policy if exists "traslados anon select" on public.traslados;
drop policy if exists "traslados anon insert" on public.traslados;
drop policy if exists "traslados anon update" on public.traslados;
drop policy if exists "traslados anon delete" on public.traslados;

create policy "traslados anon select"
on public.traslados for select
to anon
using (true);

create policy "traslados anon insert"
on public.traslados for insert
to anon
with check (true);

create policy "traslados anon update"
on public.traslados for update
to anon
using (true)
with check (true);

create policy "traslados anon delete"
on public.traslados for delete
to anon
using (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.traslados to anon;
