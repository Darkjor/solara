-- Leads de SOLARA en el proyecto Supabase compartido (el proyecto lo usa tambien Zama con `leads`).
create table public.solara_leads (
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
  contacto_preferido text check (contacto_preferido is null or contacto_preferido in ('whatsapp','llamada','correo')),
  created_at timestamptz not null default now()
);
create index solara_leads_created_at_idx on public.solara_leads (created_at desc);
alter table public.solara_leads enable row level security;
create policy "publico inserta solara_leads" on public.solara_leads
  for insert to anon, authenticated with check (true);
create policy "admin lee solara_leads" on public.solara_leads
  for select to authenticated using ((select public.is_admin()));
revoke all on public.solara_leads from anon;
grant insert on public.solara_leads to anon;
revoke update, delete, truncate on public.solara_leads from anon, authenticated;
