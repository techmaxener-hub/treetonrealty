-- Phase 4 RLS re-verification: profiles never got the "self or downline" select
-- policy that leads/site_visits already have (see 20260828160200_leads_assignment.sql).
-- Concretely this meant: leads_page.tsx joins assigned_profile:profiles(full_name)
-- using the VIEWER'S session client (not the service-role client), so even though
-- leads_select_own_or_downline correctly lets a Team Lead see a lead assigned to
-- their downline Broker, the embedded profiles(full_name) join was silently
-- returning null -- profiles_select_own_or_admin only allowed self or admin, so
-- the Kanban card showed "Unassigned" for a lead that actually WAS assigned.
--
-- Uses the same is_self_or_downline() recursive walk as leads/site_visits, so the
-- Phase 4 boundary requirement ("a Sub-Broker cannot see firm-wide commission
-- data") still holds: a Sub-Broker has no downline, so this policy only ever
-- grants them their own row, same as before. A Broker/Team Lead gains visibility
-- into their downline's profiles (including commission_percent) -- which is the
-- correct scope for a manager seeing their own reports, not a firm-wide leak.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_self_or_downline_or_admin" on public.profiles
  for select using (
    public.is_admin()
    or public.is_self_or_downline(id)
  );
