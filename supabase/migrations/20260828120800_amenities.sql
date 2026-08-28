-- Centrally-managed, filterable amenity tags (many-to-many, not a text array).
create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null default 0
);

alter table public.amenities enable row level security;

create policy "amenities_select_public" on public.amenities
  for select using (true);

create policy "amenities_insert_staff" on public.amenities
  for insert with check (public.is_staff());

create policy "amenities_update_staff" on public.amenities
  for update using (public.is_staff()) with check (public.is_staff());

create policy "amenities_delete_staff" on public.amenities
  for delete using (public.is_staff());

insert into public.amenities (name, display_order) values
  ('24x7 Corporation Water', 1),
  ('Borewell/Tanker Backup', 2),
  ('EV Charging Point', 3),
  ('Gated Security', 4),
  ('Covered Parking', 5),
  ('Visitor Parking', 6),
  ('Power Backup', 7),
  ('Clubhouse', 8),
  ('Gymnasium', 9),
  ('Swimming Pool', 10),
  ('Children''s Play Area', 11),
  ('Rainwater Harvesting', 12),
  ('Fire Safety (NOC)', 13),
  ('Vastu Compliant', 14),
  ('Lift/Elevator', 15),
  ('Corner Plot', 16);

create table public.listing_amenities (
  listing_id uuid not null references public.listings (id) on delete cascade,
  amenity_id uuid not null references public.amenities (id) on delete cascade,
  primary key (listing_id, amenity_id)
);

alter table public.listing_amenities enable row level security;

create policy "listing_amenities_select_public" on public.listing_amenities
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.is_published = true
    )
  );

create policy "listing_amenities_insert_staff" on public.listing_amenities
  for insert with check (public.is_staff());

create policy "listing_amenities_delete_staff" on public.listing_amenities
  for delete using (public.is_staff());
