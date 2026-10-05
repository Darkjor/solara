-- Esquema del CRM de leads de SOLARA Lotes de Inversión.
-- El sitio público solo puede INSERTAR leads; solo los usuarios registrados en
-- `admins` pueden leerlos. Nadie puede editarlos ni borrarlos desde la app.
create type public.lead_tipo as enum ('cotizacion','contacto','broker');

create table public.admins (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  tipo public.lead_tipo not null default 'contacto',
  nombre text not null check (char_length(nombre) between 2 and 120),
  telefono text not null check (char_length(telefono) between 7 and 30),
  email text check (email is null or char_length(email) <= 160),
  mensaje text check (mensaje is null or char_length(mensaje) <= 2000),
  interes text check (interes is null or char_length(interes) <= 60),
  locale text check (locale is null or locale in ('es','en')),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 120),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  created_at timestamptz not null default now()
);
create index leads_created_at_idx on public.leads (created_at desc);

alter table public.admins enable row level security;
alter table public.leads enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where usuario_id = (select auth.uid()));
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "admin lee su fila" on public.admins
  for select to authenticated using (usuario_id = (select auth.uid()));

create policy "publico inserta leads" on public.leads
  for insert to anon, authenticated with check (true);
create policy "admin lee leads" on public.leads
  for select to authenticated using ((select public.is_admin()));

revoke all on public.leads from anon;
grant insert on public.leads to anon;
revoke update, delete, truncate on public.leads from anon, authenticated;
revoke all on public.admins from anon;
revoke insert, update, delete, truncate on public.admins from authenticated;
