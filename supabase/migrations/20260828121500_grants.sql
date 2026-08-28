-- The 20260828120000_reset.sql migration dropped and recreated the public schema,
-- which wiped the table-level GRANTs Supabase normally pre-configures for anon/
-- authenticated on a fresh project. Postgres requires BOTH a GRANT (can this role
-- attempt the operation at all) AND an RLS policy (which rows can it see/touch) --
-- RLS alone is not sufficient. This restores the standard Supabase grant model:
-- broad table-level access for anon/authenticated, with RLS policies (already
-- defined per-table above) doing the actual row-level restriction.
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;

grant execute on all functions in schema public to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
