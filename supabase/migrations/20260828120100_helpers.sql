-- Shared helper functions used by RLS policies and updated_at triggers across the schema.
-- is_admin()/is_staff() live in 20260828120200_profiles.sql instead of here: a `language
-- sql` function body is validated against the catalog at CREATE time, so they can only
-- be defined once the profiles table they query already exists.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
