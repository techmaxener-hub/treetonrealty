-- Bug found while testing Step 4: on an UPDATE policy, USING is checked
-- against the row's CURRENT (pre-update) values, not the new ones.
-- listings_update and leads_update both gated on
-- in_own_downline(<current> advisor_id) with no carve-out for an unset
-- assignee -- since in_own_downline(null) is false for everyone but the
-- broker, an unassigned lead or listing could never be self-claimed by
-- anyone else, even though both are deliberately visible to the whole
-- team as a shared pool (see leads_select's "assigned_advisor_id is
-- null" clause, already correct). WITH CHECK already correctly restricts
-- *what* you can set it to (yourself or your own downline); only the
-- USING side needed the same "or currently unassigned" carve-out.

drop policy listings_update on listings;
create policy listings_update on listings for update to authenticated
  using (public.is_broker() or public.in_own_downline(advisor_id) or advisor_id is null)
  with check (public.is_broker() or public.in_own_downline(advisor_id));

drop policy leads_update on leads;
create policy leads_update on leads for update to authenticated
  using (public.is_broker_or_employee() or public.in_own_downline(assigned_advisor_id) or assigned_advisor_id is null)
  with check (public.is_broker_or_employee() or public.in_own_downline(assigned_advisor_id));
