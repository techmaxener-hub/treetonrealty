-- Gap found building Step 6: the public team/advisor pages need a name
-- to display, but profiles.full_name is intentionally never exposed to
-- anon (see ARCHITECTURE.md -- internal identity stays off the public
-- site). advisor_profiles is the table that WAS designed for public
-- marketing content; it was just missing the one field that content
-- obviously needs. Add it there instead of opening up profiles.

alter table advisor_profiles add column display_name text not null default '';
alter table advisor_profiles alter column display_name drop default;

-- Public headshots. Same public-bucket trade-off as listing-media (see
-- ARCHITECTURE.md Step 4) -- a headshot is about as low-sensitivity as
-- content gets, and this is explicitly the public marketing table.
insert into storage.buckets (id, name, public)
values ('advisor-photos', 'advisor-photos', true)
on conflict (id) do nothing;

create policy advisor_photos_storage_select on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'advisor-photos');

create policy advisor_photos_storage_write on storage.objects
  for all to authenticated
  using (
    bucket_id = 'advisor-photos'
    and (public.is_broker() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'advisor-photos'
    and (public.is_broker() or (storage.foldername(name))[1] = auth.uid()::text)
  );
