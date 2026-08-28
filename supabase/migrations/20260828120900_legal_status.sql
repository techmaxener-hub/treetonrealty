-- Title types as a lookup table (not an enum) so the admin can extend the list --
-- e.g. adding a new state's land-record term -- without a schema migration.
create table public.legal_title_types (
  code text primary key,
  label text not null,
  display_order integer not null default 0
);

alter table public.legal_title_types enable row level security;

create policy "legal_title_types_select_public" on public.legal_title_types
  for select using (true);

create policy "legal_title_types_insert_admin" on public.legal_title_types
  for insert with check (public.is_admin());

create policy "legal_title_types_update_admin" on public.legal_title_types
  for update using (public.is_admin()) with check (public.is_admin());

create policy "legal_title_types_delete_admin" on public.legal_title_types
  for delete using (public.is_admin());

insert into public.legal_title_types (code, label, display_order) values
  ('freehold', 'Freehold', 1),
  ('leasehold', 'Leasehold', 2),
  ('a_khata', 'A-Khata', 3),
  ('b_khata', 'B-Khata', 4),
  ('satbara_712', '7/12 Satbara (Maharashtra)', 5),
  ('other', 'Other', 6);

-- One row per listing: structured legal/trust info rendered as PDP badges.
-- Firm-wide RERA broker registration lives in site_settings, not here -- this is
-- the per-project RERA registration + verification link only.
create table public.listing_legal_status (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  title_type_code text not null references public.legal_title_types (code),

  oc_status public.certificate_status_enum not null default 'Not Applied',
  oc_date date,
  cc_status public.certificate_status_enum not null default 'Not Applied',
  cc_date date,

  project_rera_number text,
  project_rera_verification_url text,

  updated_at timestamptz not null default now(),

  constraint oc_date_required_if_received check (oc_status <> 'Received' or oc_date is not null),
  constraint cc_date_required_if_received check (cc_status <> 'Received' or cc_date is not null)
);

alter table public.listing_legal_status enable row level security;

create trigger set_listing_legal_status_updated_at
  before update on public.listing_legal_status
  for each row execute function public.set_updated_at();

create policy "listing_legal_status_select_public" on public.listing_legal_status
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.is_published = true
    )
  );

create policy "listing_legal_status_insert_staff" on public.listing_legal_status
  for insert with check (public.is_staff());

create policy "listing_legal_status_update_staff" on public.listing_legal_status
  for update using (public.is_staff()) with check (public.is_staff());

create policy "listing_legal_status_delete_staff" on public.listing_legal_status
  for delete using (public.is_staff());
