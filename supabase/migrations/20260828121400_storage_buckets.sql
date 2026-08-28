-- Two buckets: public-media for anything rendered directly on the public site
-- (listing photos, floor plan images, developer logos, testimonial avatars, OG
-- images), and brochures for PDFs that must only ever be served via short-lived
-- signed URLs after a lead-capture form (never publicly listable/readable).
insert into storage.buckets (id, name, public)
values
  ('public-media', 'public-media', true),
  ('brochures', 'brochures', false)
on conflict (id) do nothing;

create policy "public_media_read" on storage.objects
  for select using (bucket_id = 'public-media');

create policy "public_media_staff_insert" on storage.objects
  for insert with check (bucket_id = 'public-media' and public.is_staff());

create policy "public_media_staff_update" on storage.objects
  for update using (bucket_id = 'public-media' and public.is_staff())
  with check (bucket_id = 'public-media' and public.is_staff());

create policy "public_media_staff_delete" on storage.objects
  for delete using (bucket_id = 'public-media' and public.is_staff());

-- No public select policy on 'brochures': signed URLs are minted server-side with
-- the service role (which bypasses RLS), only after a lead record is captured.
create policy "brochures_staff_all" on storage.objects
  for all using (bucket_id = 'brochures' and public.is_staff())
  with check (bucket_id = 'brochures' and public.is_staff());
