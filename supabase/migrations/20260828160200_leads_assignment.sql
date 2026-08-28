-- Phase 3.1/3.3: leads and site_visits need an owning broker for the "own +
-- downline, never upline/siblings" RLS pattern, and for the Kanban board's
-- "assigned broker" field / lead-routing automation (Phase 2.2).
alter table public.leads
  add column assigned_to uuid references public.profiles (id) on delete set null;

alter table public.site_visits
  add column assigned_to uuid references public.profiles (id) on delete set null;

create index leads_assigned_to_idx on public.leads (assigned_to);
create index site_visits_assigned_to_idx on public.site_visits (assigned_to);

-- Replace the Phase 1 "any staff sees all leads" policies with downline scoping.
-- Unassigned leads (new, pre-routing) are visible to Admin/Team Lead only, since
-- they're the ones who do manual assignment when routing is "manual-only".
drop policy if exists "leads_select_staff" on public.leads;
create policy "leads_select_own_or_downline" on public.leads
  for select using (
    public.is_admin()
    or (assigned_to is not null and public.is_self_or_downline(assigned_to))
    or (assigned_to is null and public.is_admin_or_team_lead())
  );

drop policy if exists "leads_update_staff" on public.leads;
create policy "leads_update_own_or_downline" on public.leads
  for update using (
    public.is_admin()
    or (assigned_to is not null and public.is_self_or_downline(assigned_to))
    or (assigned_to is null and public.is_admin_or_team_lead())
  )
  with check (
    public.is_admin()
    or (assigned_to is not null and public.is_self_or_downline(assigned_to))
    or (assigned_to is null and public.is_admin_or_team_lead())
  );

drop policy if exists "site_visits_select_staff" on public.site_visits;
create policy "site_visits_select_own_or_downline" on public.site_visits
  for select using (
    public.is_admin()
    or (assigned_to is not null and public.is_self_or_downline(assigned_to))
    or (assigned_to is null and public.is_admin_or_team_lead())
  );

drop policy if exists "site_visits_update_staff" on public.site_visits;
create policy "site_visits_update_own_or_downline" on public.site_visits
  for update using (
    public.is_admin()
    or (assigned_to is not null and public.is_self_or_downline(assigned_to))
    or (assigned_to is null and public.is_admin_or_team_lead())
  )
  with check (
    public.is_admin()
    or (assigned_to is not null and public.is_self_or_downline(assigned_to))
    or (assigned_to is null and public.is_admin_or_team_lead())
  );
