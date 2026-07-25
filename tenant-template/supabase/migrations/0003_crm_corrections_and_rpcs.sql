-- Step 3 corrections + CRM RPCs.
--
-- Correction: leads.assigned_advisor_id, listings.advisor_id, and
-- deals.primary_advisor_id pointed at advisor_profiles(id) -- the
-- *optional public bio page* table. That means anyone who never set up a
-- public profile (a broker, an ops-focused employee) was structurally
-- unassignable, contradicting "no restriction on assignment" from Step 1.
-- These are internal work-assignment columns, so they should reference
-- profiles(id) directly -- every team member has one, since it's created
-- at signup. testimonials.advisor_id is left alone: a testimonial is
-- public attribution, which genuinely belongs on the public bio table.

alter table listings drop constraint listings_advisor_id_fkey;
alter table listings add constraint listings_advisor_id_fkey foreign key (advisor_id) references profiles(id);

alter table leads drop constraint leads_assigned_advisor_id_fkey;
alter table leads add constraint leads_assigned_advisor_id_fkey foreign key (assigned_advisor_id) references profiles(id);

alter table deals drop constraint deals_primary_advisor_id_fkey;
alter table deals add constraint deals_primary_advisor_id_fkey foreign key (primary_advisor_id) references profiles(id);

comment on column listings.advisor_id is 'Internal point of contact -- references profiles(id) directly, any team member is assignable.';
comment on column leads.assigned_advisor_id is 'References profiles(id) directly, any team member is assignable.';
comment on column deals.primary_advisor_id is 'References profiles(id) directly, any team member is assignable.';

-- ── RLS policies that used the now-obsolete advisor_profiles indirection ──
-- Drop first so the helper function has no remaining dependents, then drop
-- the helper, then recreate each policy against in_own_downline() directly.

drop policy listings_update on listings;
drop policy listings_delete on listings;
drop policy listing_internal_all on listing_internal;
drop policy listing_owners_all on listing_owners;
drop policy listing_media_manage on listing_media;
drop policy leads_select on leads;
drop policy leads_update on leads;
drop policy activity_log_select on activity_log;
drop policy deals_select on deals;
drop policy deals_insert on deals;
drop policy deals_update on deals;
drop policy deal_documents_all on deal_documents;

-- contact_in_scope() also calls advisor_in_own_downline() internally
-- (defined in 0002) -- replace it first so the helper has no remaining
-- dependents before it's dropped.
create or replace function public.contact_in_scope(target_contact_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_broker_or_employee()
    or exists (
      select 1 from leads l
      where l.contact_id = target_contact_id
        and public.in_own_downline(l.assigned_advisor_id)
    )
    or exists (
      select 1 from deals d
      where (d.buyer_contact_id = target_contact_id or d.seller_contact_id = target_contact_id)
        and public.in_own_downline(d.primary_advisor_id)
    )
    or exists (
      select 1 from listing_owners lo
      join listings ls on ls.id = lo.listing_id
      where lo.contact_id = target_contact_id
        and public.in_own_downline(ls.advisor_id)
    );
$$;

drop function public.advisor_in_own_downline(uuid);

create policy listings_update on listings for update to authenticated
  using (public.is_broker() or public.in_own_downline(advisor_id))
  with check (public.is_broker() or public.in_own_downline(advisor_id));
create policy listings_delete on listings for delete to authenticated
  using (public.is_broker() or public.in_own_downline(advisor_id));

create policy listing_internal_all on listing_internal for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.in_own_downline(ls.advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.in_own_downline(ls.advisor_id))
  );

create policy listing_owners_all on listing_owners for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.in_own_downline(ls.advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.in_own_downline(ls.advisor_id))
  );

create policy listing_media_manage on listing_media for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.in_own_downline(ls.advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.in_own_downline(ls.advisor_id))
  );

create policy leads_select on leads for select to authenticated
  using (
    public.is_broker_or_employee()
    or public.in_own_downline(assigned_advisor_id)
    or assigned_advisor_id is null
  );
create policy leads_update on leads for update to authenticated
  using (public.is_broker_or_employee() or public.in_own_downline(assigned_advisor_id))
  with check (public.is_broker_or_employee() or public.in_own_downline(assigned_advisor_id));

create policy activity_log_select on activity_log for select to authenticated
  using (
    public.is_broker()
    or (lead_id is not null and exists (
      select 1 from leads l where l.id = lead_id
        and (public.is_broker_or_employee() or public.in_own_downline(l.assigned_advisor_id) or l.assigned_advisor_id is null)
    ))
    or (deal_id is not null and exists (
      select 1 from deals d where d.id = deal_id and public.in_own_downline(d.primary_advisor_id)
    ))
  );

create policy deals_select on deals for select to authenticated
  using (public.is_broker() or public.in_own_downline(primary_advisor_id));
create policy deals_insert on deals for insert to authenticated
  with check (public.is_broker() or public.in_own_downline(primary_advisor_id));
create policy deals_update on deals for update to authenticated
  using (public.is_broker() or public.in_own_downline(primary_advisor_id))
  with check (public.is_broker() or public.in_own_downline(primary_advisor_id));

create policy deal_documents_all on deal_documents for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from deals d where d.id = deal_id and public.in_own_downline(d.primary_advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from deals d where d.id = deal_id and public.in_own_downline(d.primary_advisor_id))
  );

-- ── Dedup trigger fix ───────────────────────────────────────────────────
-- contacts_flag_duplicate() ran with the inserting user's own privileges,
-- so its lookup for an existing normalized_phone match was silently
-- scoped by that user's own contacts_select RLS (contact_in_scope) --
-- meaning an advisor could fail to detect a duplicate created by someone
-- outside their downline. Duplicate detection is a tenant-wide integrity
-- concern, not something that should degrade by who happens to be typing;
-- make it security definer like the public submit_lead RPC already is.

create or replace function public.contacts_flag_duplicate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_id uuid;
begin
  if new.normalized_phone is not null and new.normalized_phone <> '' then
    select id into existing_id
    from contacts
    where normalized_phone = new.normalized_phone
      and id <> new.id
    order by created_at
    limit 1;

    if existing_id is not null then
      update contacts set potential_duplicate_of = existing_id where id = new.id;
    end if;
  end if;
  return null;
end;
$$;

-- ── update_lead_stage: atomic stage change + timeline entry ───────────
-- security invoker (not definer) -- it must still respect the caller's
-- own leads_update policy; it only saves the client a round trip and
-- guarantees the activity_log entry is never forgotten.

create or replace function public.update_lead_stage(p_lead_id uuid, p_new_stage lead_stage)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update leads set stage = p_new_stage, last_activity_at = now() where id = p_lead_id;
  if not found then
    raise exception 'lead not found or not permitted';
  end if;

  insert into activity_log (lead_id, actor_profile_id, activity_type, content)
  values (p_lead_id, auth.uid(), 'status_change', 'Stage changed to ' || p_new_stage::text);
end;
$$;

grant execute on function public.update_lead_stage(uuid, lead_stage) to authenticated;

-- ── merge_contacts: fold a flagged duplicate into the contact you keep ──
-- Reassigns every reference (leads, deals as buyer/seller, listing_owners,
-- saved_searches, activity via leads) from the duplicate to the keeper,
-- then deletes the duplicate row. security definer and explicitly
-- role-gated -- not security invoker -- because a correct merge has to
-- see and rewrite every reference tenant-wide, not just the rows the
-- caller's own downline-scoped RLS happens to expose; a broker or
-- employee calling this while a stale row sits outside their visibility
-- would otherwise hit a silent no-op update followed by a confusing FK
-- violation on the final delete.

create or replace function public.merge_contacts(p_keep_id uuid, p_duplicate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_broker_or_employee() then
    raise exception 'only broker or employee can merge contacts';
  end if;

  if p_keep_id = p_duplicate_id then
    raise exception 'cannot merge a contact into itself';
  end if;

  update leads set contact_id = p_keep_id where contact_id = p_duplicate_id;
  update deals set buyer_contact_id = p_keep_id where buyer_contact_id = p_duplicate_id;
  update deals set seller_contact_id = p_keep_id where seller_contact_id = p_duplicate_id;
  update listing_owners set contact_id = p_keep_id where contact_id = p_duplicate_id;
  update saved_searches set contact_id = p_keep_id where contact_id = p_duplicate_id;
  update contacts set potential_duplicate_of = p_keep_id where potential_duplicate_of = p_duplicate_id;

  delete from contacts where id = p_duplicate_id;
end;
$$;

grant execute on function public.merge_contacts(uuid, uuid) to authenticated;
