-- The PDP brochure-download flow (spec 1.5) needs a per-listing PDF to serve via a
-- signed URL after lead capture -- this column was missed when listings was first
-- created. Nullable: not every listing has a brochure uploaded yet.
alter table public.listings
  add column brochure_storage_path text;
