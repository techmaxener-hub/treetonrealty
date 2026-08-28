-- Home page collection cards (spec 1.3) need an editorial cover image distinct from
-- any single listing's photos -- this was missed when collections was first created.
alter table public.collections
  add column cover_image_storage_path text,
  add column cover_image_alt_text text,
  add constraint cover_image_alt_text_required_if_image check (
    cover_image_storage_path is null or cover_image_alt_text is not null
  );
