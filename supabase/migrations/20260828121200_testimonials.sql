-- Admin-managed testimonial carousel. Avatar is optional, but if present must carry
-- alt text -- same accessibility rule as every other image field in the schema.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_location text,
  content text not null,
  rating integer check (rating is null or rating between 1 and 5),
  avatar_storage_path text,
  avatar_alt_text text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),

  constraint avatar_alt_text_required_if_avatar check (
    avatar_storage_path is null or avatar_alt_text is not null
  )
);

alter table public.testimonials enable row level security;

create policy "testimonials_select_public" on public.testimonials
  for select using (is_published = true or public.is_staff());

create policy "testimonials_insert_staff" on public.testimonials
  for insert with check (public.is_staff());

create policy "testimonials_update_staff" on public.testimonials
  for update using (public.is_staff()) with check (public.is_staff());

create policy "testimonials_delete_staff" on public.testimonials
  for delete using (public.is_staff());
