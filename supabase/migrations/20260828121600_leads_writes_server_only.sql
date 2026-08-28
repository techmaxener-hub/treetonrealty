-- Drop the public INSERT policies added in 20260828121100. Reasoning: PostgREST's
-- default insert issues `INSERT ... RETURNING`, and Postgres RLS requires the
-- returned row to also satisfy a SELECT policy for the inserting role -- there is
-- no clean way to grant that to anonymous visitors without also making leads/
-- site_visits publicly readable, which contradicts "staff-only reads".
--
-- Instead, all public lead-capture (contact form, brochure download, site-visit
-- scheduler) goes through Next.js server route handlers using the service-role
-- client (lib/supabase/server.ts), which bypasses RLS entirely and lets the app
-- validate/rate-limit before writing. So: no anon/authenticated INSERT policy at
-- all here -- RLS default-denies it, and only the service role (which ignores RLS)
-- can create rows.
drop policy if exists "leads_insert_public" on public.leads;
drop policy if exists "site_visits_insert_public" on public.site_visits;
