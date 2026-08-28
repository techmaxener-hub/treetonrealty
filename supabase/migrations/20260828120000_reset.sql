-- Reset the public schema to a clean slate before laying down the Treeton Realty schema.
-- Supabase's own schemas (auth, storage, realtime, extensions) and built-in roles
-- (anon, authenticated, service_role) are intentionally left untouched -- RLS and the
-- rest of the platform depend on them.
drop schema if exists public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;
alter default privileges in schema public grant all on functions to postgres, service_role;

-- pgcrypto ships enabled on Supabase projects already; kept idempotent in case this
-- runs against a fresh/self-hosted instance.
create extension if not exists pgcrypto;
