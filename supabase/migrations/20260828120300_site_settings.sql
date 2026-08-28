-- Single-row, admin-editable site settings: contact/trust info shown in header/footer,
-- and the homepage trust-counter stats. Nothing here is ever hardcoded in components.
create table public.site_settings (
  id boolean primary key default true,
  constraint site_settings_singleton check (id),

  whatsapp_number text,              -- E.164, e.g. +919737441333 -- CONFIRM WITH CLIENT
  rera_broker_reg_no text,           -- Gujarat RERA agent registration number -- CONFIRM WITH CLIENT
  company_email text,
  company_address text,
  google_maps_embed_url text,
  instagram_url text,
  facebook_url text,
  linkedin_url text,

  stat_transacted_value_inr numeric,
  stat_years_experience integer,
  stat_verified_inventory_count integer,

  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true);

alter table public.site_settings enable row level security;

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Readable by anyone (header/footer/home page render from it); only admins can edit.
-- No insert/delete policy is defined on purpose: the single row above is the only
-- one that should ever exist, and RLS default-denies any command with no policy.
create policy "site_settings_select_public" on public.site_settings
  for select using (true);

create policy "site_settings_update_admin" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());
