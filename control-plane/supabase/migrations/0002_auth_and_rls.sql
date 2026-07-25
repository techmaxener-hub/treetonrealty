-- Auth & RLS for the control plane. Platform admins are provisioned
-- manually (or by an existing super_admin via an invite RPC written in a
-- later step) -- there is no public self-signup here, so no handle_new_user
-- trigger on auth.users in this project.

-- ── Helpers ─────────────────────────────────────────────────────────────

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from platform_admins where id = auth.uid());
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from platform_admins where id = auth.uid() and role = 'super_admin');
$$;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- ── platform_admins ─────────────────────────────────────────────────────
-- Any platform admin can see the roster; only a super_admin can grant,
-- change, or revoke admin access (including their own row, so a lone
-- super_admin can't accidentally lock themself out via a self-demote --
-- that still succeeds since it's still a super_admin acting).

create policy platform_admins_select on platform_admins
  for select to authenticated
  using (public.is_platform_admin());

create policy platform_admins_manage on platform_admins
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ── broker_instances / provisioning_jobs ───────────────────────────────
-- Small internal team; any platform admin (super_admin or support) can
-- read and act on both. The provisioning pipeline itself runs as the
-- service role, which bypasses RLS entirely.

create policy broker_instances_all on broker_instances
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy provisioning_jobs_all on provisioning_jobs
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
