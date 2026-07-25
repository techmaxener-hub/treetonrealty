-- Storage bucket + RLS for listing photos, floor plans, and any uploaded
-- documents. Objects are stored as {listing_id}/{random}-{filename}, so
-- every policy below derives the listing from the object's path and
-- reuses the exact same broker/downline rule listing_media already
-- enforces at the table level -- this is the storage-layer half of that
-- same boundary, not a separate one.
--
-- bucket is public=true so the site can use plain getPublicUrl() (no
-- signed-URL refresh logic, no server-side proxy) -- Supabase serves
-- public-bucket objects through an unauthenticated CDN path that does
-- NOT re-check these RLS policies. That means a draft (unpublished)
-- listing's photos are reachable by anyone who has or guesses the exact
-- {listing_id}-prefixed path -- not published anywhere, not enumerable,
-- but not cryptographically private either. Fine for photos; this is
-- exactly why the actually sensitive stuff (listing_internal, contacts,
-- deals) was never routed through Storage in the first place. The RLS
-- below still governs every WRITE regardless of the public flag, and
-- still governs reads through Storage's authenticated/signed-URL paths
-- if those are used instead of the public one.

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true)
on conflict (id) do nothing;

create policy listing_media_storage_select_anon on storage.objects
  for select to anon
  using (
    bucket_id = 'listing-media'
    and exists (
      select 1 from listings ls
      where ls.id::text = (storage.foldername(name))[1]
        and ls.is_published
    )
  );

create policy listing_media_storage_select_internal on storage.objects
  for select to authenticated
  using (bucket_id = 'listing-media');

create policy listing_media_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-media'
    and exists (
      select 1 from listings ls
      where ls.id::text = (storage.foldername(name))[1]
        and (public.is_broker() or public.in_own_downline(ls.advisor_id))
    )
  );

create policy listing_media_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listing-media'
    and exists (
      select 1 from listings ls
      where ls.id::text = (storage.foldername(name))[1]
        and (public.is_broker() or public.in_own_downline(ls.advisor_id))
    )
  );

create policy listing_media_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-media'
    and exists (
      select 1 from listings ls
      where ls.id::text = (storage.foldername(name))[1]
        and (public.is_broker() or public.in_own_downline(ls.advisor_id))
    )
  );

-- Every listing gets a matching listing_internal row the moment it's
-- created, even if every field in it stays null. Without this, "no row"
-- and "not authorized to see the row" are indistinguishable from the
-- client, and the CRM can't correctly decide whether to show the
-- Internal tab at all versus show it empty. security definer because the
-- creating user may not yet pass listing_internal's own insert policy
-- (e.g. creating an unassigned listing) at the moment this fires.
create or replace function public.listings_create_internal_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into listing_internal (listing_id) values (new.id);
  return new;
end;
$$;

create trigger trg_listings_create_internal_row
  after insert on listings
  for each row execute function public.listings_create_internal_row();
