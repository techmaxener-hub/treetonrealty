-- Gallery images (categorized by room) and floor plans for a listing.
-- alt_text is NOT NULL on both -- accessibility is not optional per project spec.
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  room_category public.room_category_enum not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_images_listing_idx on public.listing_images (listing_id);

alter table public.listing_images enable row level security;

create policy "listing_images_select_public" on public.listing_images
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.is_published = true
    )
  );

create policy "listing_images_insert_staff" on public.listing_images
  for insert with check (public.is_staff());

create policy "listing_images_update_staff" on public.listing_images
  for update using (public.is_staff()) with check (public.is_staff());

create policy "listing_images_delete_staff" on public.listing_images
  for delete using (public.is_staff());

create table public.listing_floor_plans (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  title text not null,
  alt_text text not null,
  plan_type public.floor_plan_type_enum not null default '2D',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_floor_plans_listing_idx on public.listing_floor_plans (listing_id);

alter table public.listing_floor_plans enable row level security;

create policy "listing_floor_plans_select_public" on public.listing_floor_plans
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.is_published = true
    )
  );

create policy "listing_floor_plans_insert_staff" on public.listing_floor_plans
  for insert with check (public.is_staff());

create policy "listing_floor_plans_update_staff" on public.listing_floor_plans
  for update using (public.is_staff()) with check (public.is_staff());

create policy "listing_floor_plans_delete_staff" on public.listing_floor_plans
  for delete using (public.is_staff());
