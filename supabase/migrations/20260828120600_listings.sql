-- Core listing table. carpet_area_sqft is NOT NULL by design: RERA makes carpet area
-- mandatory disclosure, so a listing cannot exist in the database without it -- this
-- is the strongest possible enforcement of "block publishing without it".
-- Only sq.ft is stored; every other unit is derived at render time via convertArea().
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  ref_code text not null unique,

  title text not null,
  description text not null,

  property_type public.property_type_enum not null,
  status public.listing_status_enum not null default 'Draft',

  locality text not null,
  city text not null default 'Ahmedabad',
  state text not null default 'Gujarat',
  address text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),

  bhk numeric(3, 1) check (bhk is null or bhk > 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),

  carpet_area_sqft numeric not null check (carpet_area_sqft > 0),
  built_up_area_sqft numeric check (built_up_area_sqft is null or built_up_area_sqft > 0),

  price_inr bigint not null check (price_inr > 0),
  parking_charges_inr bigint check (parking_charges_inr is null or parking_charges_inr >= 0),

  furnishing_status public.furnishing_status_enum,
  possession_status public.possession_status_enum not null,
  possession_date date,

  facing_direction public.facing_direction_enum,
  vastu_score public.vastu_score_enum,

  is_rera_verified boolean not null default false,
  virtual_tour_url text,

  is_published boolean not null default false,
  created_by uuid references public.profiles (id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_locality_idx on public.listings (locality);
create index listings_property_type_idx on public.listings (property_type);
create index listings_status_idx on public.listings (status);
create index listings_price_idx on public.listings (price_inr);
create index listings_published_idx on public.listings (is_published) where is_published = true;

alter table public.listings enable row level security;

create trigger set_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Published listings are public; unpublished/draft rows are staff-only (so the CMS
-- can preview before going live). "Under Offer"/"Sold" listings stay is_published =
-- true (per spec, dead-looking listings still show for social proof) -- status, not
-- is_published, controls that visual demotion in the UI.
create policy "listings_select_public" on public.listings
  for select using (is_published = true or public.is_staff());

create policy "listings_insert_staff" on public.listings
  for insert with check (public.is_staff());

create policy "listings_update_staff" on public.listings
  for update using (public.is_staff()) with check (public.is_staff());

create policy "listings_delete_staff" on public.listings
  for delete using (public.is_staff());
