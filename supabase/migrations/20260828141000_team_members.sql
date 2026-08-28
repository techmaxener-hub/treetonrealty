-- /about (spec 1.8) needs team bios. No real names/roles/photos were provided by
-- the client -- inventing fictional people would be dishonest content on a real
-- business site, the same concern as fabricating a RERA number. This table starts
-- empty; the About page renders a "coming soon" state until the client adds real
-- team members via the admin panel (Phase 2).
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,
  bio text not null,
  photo_storage_path text,
  photo_alt_text text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),

  constraint photo_alt_text_required_if_photo check (
    photo_storage_path is null or photo_alt_text is not null
  )
);

alter table public.team_members enable row level security;

create policy "team_members_select_public" on public.team_members
  for select using (is_published = true or public.is_staff());

create policy "team_members_insert_staff" on public.team_members
  for insert with check (public.is_staff());

create policy "team_members_update_staff" on public.team_members
  for update using (public.is_staff()) with check (public.is_staff());

create policy "team_members_delete_staff" on public.team_members
  for delete using (public.is_staff());
