-- Leads: written by anonymous public forms (contact page, brochure-download capture,
-- site-visit scheduler) but only ever readable/manageable by staff. RLS enforces the
-- write-only-from-outside / read-only-from-inside shape; per-submission abuse limits
-- (rate limiting, captcha) are an application-layer concern RLS cannot express.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  phone text not null check (char_length(phone) between 6 and 20),
  email text,
  message text,
  listing_id uuid references public.listings (id) on delete set null,
  source public.lead_source_enum not null,
  status public.lead_status_enum not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_idx on public.leads (status);
create index leads_listing_idx on public.leads (listing_id);

alter table public.leads enable row level security;

create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create policy "leads_insert_public" on public.leads
  for insert with check (true);

create policy "leads_select_staff" on public.leads
  for select using (public.is_staff());

create policy "leads_update_staff" on public.leads
  for update using (public.is_staff()) with check (public.is_staff());

create policy "leads_delete_admin" on public.leads
  for delete using (public.is_admin());

-- Free site-visit requests from the PDP scheduler. Also public-insert / staff-read,
-- same shape as leads.
create table public.site_visits (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  name text not null check (char_length(name) between 1 and 200),
  phone text not null check (char_length(phone) between 6 and 20),
  email text,
  preferred_date date not null,
  preferred_time time not null,
  cab_pickup_requested boolean not null default false,
  pickup_address text,
  status public.site_visit_status_enum not null default 'Requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pickup_address_required_if_cab check (
    cab_pickup_requested = false or pickup_address is not null
  )
);

create index site_visits_listing_idx on public.site_visits (listing_id);
create index site_visits_status_idx on public.site_visits (status);

alter table public.site_visits enable row level security;

create trigger set_site_visits_updated_at
  before update on public.site_visits
  for each row execute function public.set_updated_at();

create policy "site_visits_insert_public" on public.site_visits
  for insert with check (true);

create policy "site_visits_select_staff" on public.site_visits
  for select using (public.is_staff());

create policy "site_visits_update_staff" on public.site_visits
  for update using (public.is_staff()) with check (public.is_staff());

create policy "site_visits_delete_admin" on public.site_visits
  for delete using (public.is_admin());
