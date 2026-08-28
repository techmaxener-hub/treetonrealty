-- Manually curated collections (e.g. "Luxury Penthouses"). Membership is an explicit
-- admin-managed join, never an auto-filter -- the agency controls what "curated" means.
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  intro_richtext text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collections enable row level security;

create trigger set_collections_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

create policy "collections_select_public" on public.collections
  for select using (is_published = true or public.is_staff());

create policy "collections_insert_staff" on public.collections
  for insert with check (public.is_staff());

create policy "collections_update_staff" on public.collections
  for update using (public.is_staff()) with check (public.is_staff());

create policy "collections_delete_staff" on public.collections
  for delete using (public.is_staff());

create table public.collection_listings (
  collection_id uuid not null references public.collections (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  display_order integer not null default 0,
  primary key (collection_id, listing_id)
);

alter table public.collection_listings enable row level security;

create policy "collection_listings_select_public" on public.collection_listings
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.collections c
      where c.id = collection_id and c.is_published = true
    )
  );

create policy "collection_listings_insert_staff" on public.collection_listings
  for insert with check (public.is_staff());

create policy "collection_listings_delete_staff" on public.collection_listings
  for delete using (public.is_staff());
