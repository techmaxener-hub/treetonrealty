-- Channel-partner developer logos shown in the homepage ticker. Admin-editable list;
-- logos live in Supabase Storage (public-media bucket), never bundled as imports.
create table public.developers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_storage_path text not null,
  logo_alt_text text not null,
  website_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index developers_active_order_idx on public.developers (display_order) where is_active = true;

alter table public.developers enable row level security;

create policy "developers_select_public" on public.developers
  for select using (is_active or public.is_staff());

create policy "developers_insert_staff" on public.developers
  for insert with check (public.is_staff());

create policy "developers_update_staff" on public.developers
  for update using (public.is_staff()) with check (public.is_staff());

create policy "developers_delete_staff" on public.developers
  for delete using (public.is_staff());
