-- Auth & RLS for the tenant template. Same migration, deployed verbatim
-- into every broker's project -- nothing here is broker-specific.
--
-- Shape (documented in ARCHITECTURE.md, implemented here):
--   * role = 'broker' sees and writes everything.
--   * everyone else sees themself + their downline (hierarchy_path <@),
--     read-only on the downline -- writes stay scoped to what they
--     directly own.
--   * the public site never authenticates. It reads through `anon`
--     against `is_published = true` rows, and writes only through the
--     narrow RPCs at the bottom of this file -- never direct table
--     INSERT -- so a public form can't stuff arbitrary columns or bypass
--     dedup/validation.

-- ═══════════════════════════════════════════════════════════════════════
-- Helpers
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.current_profile_role()
returns profile_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.current_hierarchy_path()
returns ltree
language sql
stable
security definer
set search_path = public
as $$
  select hierarchy_path from profiles where id = auth.uid();
$$;

create or replace function public.is_broker()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() = 'broker';
$$;

create or replace function public.is_broker_or_employee()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() in ('broker', 'employee');
$$;

-- True for the target profile itself, or anyone in the current user's
-- downline (their reports, their reports' reports, ...). This is the one
-- check nearly every internal policy below is built from.
create or replace function public.in_own_downline(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_profile_id = auth.uid()
    or exists (
      select 1 from profiles p
      where p.id = target_profile_id
        and p.hierarchy_path <@ public.current_hierarchy_path()
    );
$$;

-- Same idea, but for the many tables that reference advisor_profiles(id)
-- rather than profiles(id) directly (listings.advisor_id,
-- leads.assigned_advisor_id, deals.primary_advisor_id, ...).
create or replace function public.advisor_in_own_downline(target_advisor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_advisor_id is not null and exists (
    select 1 from advisor_profiles ap
    where ap.id = target_advisor_id
      and public.in_own_downline(ap.profile_id)
  );
$$;

-- Contacts have no direct advisor column -- visibility is derived from
-- whichever lead, deal, or listing_owners row currently ties them to a
-- person in scope.
create or replace function public.contact_in_scope(target_contact_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_broker()
    or exists (
      select 1 from leads l
      where l.contact_id = target_contact_id
        and public.advisor_in_own_downline(l.assigned_advisor_id)
    )
    or exists (
      select 1 from deals d
      where (d.buyer_contact_id = target_contact_id or d.seller_contact_id = target_contact_id)
        and public.advisor_in_own_downline(d.primary_advisor_id)
    )
    or exists (
      select 1 from listing_owners lo
      join listings ls on ls.id = lo.listing_id
      where lo.contact_id = target_contact_id
        and public.advisor_in_own_downline(ls.advisor_id)
    );
$$;

grant execute on function public.is_broker() to authenticated;
grant execute on function public.is_broker_or_employee() to authenticated;
grant execute on function public.in_own_downline(uuid) to authenticated;
grant execute on function public.advisor_in_own_downline(uuid) to authenticated;
grant execute on function public.contact_in_scope(uuid) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- Signup: auth.users -> profiles
-- ═══════════════════════════════════════════════════════════════════════
-- Team members are invited, not self-signed-up: whoever invites them
-- (via supabase.auth.admin.inviteUserByEmail) sets role/reports_to_id/
-- full_name in that invite's user_metadata. This trigger is the one path
-- that turns an auth.users row into a profiles row, for the first broker
-- account created during provisioning and for every invite after it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role profile_role;
  v_reports_to uuid;
  v_full_name text;
begin
  v_role := (new.raw_user_meta_data->>'role')::profile_role;
  v_reports_to := nullif(new.raw_user_meta_data->>'reports_to_id', '')::uuid;
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);

  if v_role is null then
    raise exception 'signup metadata missing "role" -- invite users with role (and reports_to_id, unless broker) set in user_metadata';
  end if;

  insert into profiles (id, role, reports_to_id, full_name, email)
  values (new.id, v_role, v_reports_to, v_full_name, new.email);

  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Self-service profile edits may only touch contact details. Changing
-- role or reporting line is a broker-only action even on your own row --
-- enforced here rather than relying on RLS alone, since RLS can't limit
-- which columns an otherwise-permitted UPDATE touches.
create or replace function public.profiles_restrict_self_edit()
returns trigger
language plpgsql
as $$
begin
  if not public.is_broker() and (new.role <> old.role or new.reports_to_id is distinct from old.reports_to_id) then
    raise exception 'only the broker can change role or reporting line';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_restrict_self_edit
  before update on profiles
  for each row execute function public.profiles_restrict_self_edit();

-- ═══════════════════════════════════════════════════════════════════════
-- Policies -- Module 01: Identity
-- ═══════════════════════════════════════════════════════════════════════

create policy broker_profile_select_anon on broker_profile for select to anon using (true);
create policy broker_profile_select_internal on broker_profile for select to authenticated using (true);
create policy broker_profile_manage on broker_profile for all to authenticated
  using (public.is_broker()) with check (public.is_broker());

create policy profiles_select on profiles for select to authenticated
  using (public.is_broker() or public.in_own_downline(id));
create policy profiles_update on profiles for update to authenticated
  using (public.is_broker() or id = auth.uid())
  with check (public.is_broker() or id = auth.uid());
create policy profiles_delete on profiles for delete to authenticated
  using (public.is_broker());
-- No INSERT policy: rows are created only by handle_new_user (security
-- definer, bypasses RLS), never directly by an authenticated client.

create policy advisor_profiles_select_anon on advisor_profiles for select to anon using (is_public);
create policy advisor_profiles_select_internal on advisor_profiles for select to authenticated using (true);
create policy advisor_profiles_manage on advisor_profiles for all to authenticated
  using (public.is_broker() or profile_id = auth.uid())
  with check (public.is_broker() or profile_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════
-- Policies -- Module 02: Website Content
-- ═══════════════════════════════════════════════════════════════════════

create policy localities_select_anon on localities for select to anon using (is_published);
create policy localities_select_internal on localities for select to authenticated using (true);
create policy localities_manage on localities for all to authenticated
  using (public.is_broker_or_employee()) with check (public.is_broker_or_employee());

-- ═══════════════════════════════════════════════════════════════════════
-- Policies -- Module 04: Listings & Inventory
-- ═══════════════════════════════════════════════════════════════════════

create policy listings_select_anon on listings for select to anon using (is_published);
create policy listings_select_internal on listings for select to authenticated using (true);
create policy listings_insert on listings for insert to authenticated with check (true);
create policy listings_update on listings for update to authenticated
  using (public.is_broker() or public.advisor_in_own_downline(advisor_id))
  with check (public.is_broker() or public.advisor_in_own_downline(advisor_id));
create policy listings_delete on listings for delete to authenticated
  using (public.is_broker() or public.advisor_in_own_downline(advisor_id));

create policy listing_internal_all on listing_internal for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.advisor_in_own_downline(ls.advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.advisor_in_own_downline(ls.advisor_id))
  );

create policy listing_owners_all on listing_owners for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.advisor_in_own_downline(ls.advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.advisor_in_own_downline(ls.advisor_id))
  );

create policy listing_media_select_anon on listing_media for select to anon
  using (exists (select 1 from listings ls where ls.id = listing_id and ls.is_published));
create policy listing_media_select_internal on listing_media for select to authenticated using (true);
create policy listing_media_manage on listing_media for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.advisor_in_own_downline(ls.advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from listings ls where ls.id = listing_id and public.advisor_in_own_downline(ls.advisor_id))
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Policies -- Module 03: Leads & Contacts
-- ═══════════════════════════════════════════════════════════════════════
-- No anon policies on contacts/leads/activity_log/tasks at all -- the
-- public site never reads or writes these tables directly, only through
-- the RPCs at the bottom of this file.

create policy contacts_select on contacts for select to authenticated
  using (public.contact_in_scope(id));
create policy contacts_insert on contacts for insert to authenticated with check (true);
create policy contacts_update on contacts for update to authenticated
  using (public.contact_in_scope(id)) with check (public.contact_in_scope(id));

create policy leads_select on leads for select to authenticated
  using (
    public.is_broker_or_employee()
    or public.advisor_in_own_downline(assigned_advisor_id)
    or assigned_advisor_id is null
  );
create policy leads_insert on leads for insert to authenticated with check (true);
create policy leads_update on leads for update to authenticated
  using (public.is_broker_or_employee() or public.advisor_in_own_downline(assigned_advisor_id))
  with check (public.is_broker_or_employee() or public.advisor_in_own_downline(assigned_advisor_id));

create policy activity_log_select on activity_log for select to authenticated
  using (
    public.is_broker()
    or (lead_id is not null and exists (
      select 1 from leads l where l.id = lead_id
        and (public.is_broker_or_employee() or public.advisor_in_own_downline(l.assigned_advisor_id) or l.assigned_advisor_id is null)
    ))
    or (deal_id is not null and exists (
      select 1 from deals d where d.id = deal_id and public.advisor_in_own_downline(d.primary_advisor_id)
    ))
  );
create policy activity_log_insert on activity_log for insert to authenticated with check (true);

create policy tasks_select on tasks for select to authenticated
  using (public.is_broker() or public.in_own_downline(assigned_to));
create policy tasks_insert on tasks for insert to authenticated with check (true);
create policy tasks_update on tasks for update to authenticated
  using (public.is_broker() or public.in_own_downline(assigned_to))
  with check (public.is_broker() or public.in_own_downline(assigned_to));
create policy tasks_delete on tasks for delete to authenticated
  using (public.is_broker() or public.in_own_downline(assigned_to));

-- ═══════════════════════════════════════════════════════════════════════
-- Policies -- Module 05: Deals & Commission
-- ═══════════════════════════════════════════════════════════════════════
-- No anon policies at all -- deal and commission data never reaches the
-- public site regardless of row content.

create policy deals_select on deals for select to authenticated
  using (public.is_broker() or public.advisor_in_own_downline(primary_advisor_id));
create policy deals_insert on deals for insert to authenticated
  with check (public.is_broker() or public.advisor_in_own_downline(primary_advisor_id));
create policy deals_update on deals for update to authenticated
  using (public.is_broker() or public.advisor_in_own_downline(primary_advisor_id))
  with check (public.is_broker() or public.advisor_in_own_downline(primary_advisor_id));

create policy deal_documents_all on deal_documents for all to authenticated
  using (
    public.is_broker()
    or exists (select 1 from deals d where d.id = deal_id and public.advisor_in_own_downline(d.primary_advisor_id))
  )
  with check (
    public.is_broker()
    or exists (select 1 from deals d where d.id = deal_id and public.advisor_in_own_downline(d.primary_advisor_id))
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Policies -- Module 06: Automation & Notifications
-- ═══════════════════════════════════════════════════════════════════════
-- Operational config, not sales data -- scoped to broker/employee. No
-- anon access; automation_logs is written only by the engine (service
-- role), never by an authenticated client.

create policy automation_rules_all on automation_rules for all to authenticated
  using (public.is_broker_or_employee()) with check (public.is_broker_or_employee());
create policy automation_logs_select on automation_logs for select to authenticated
  using (public.is_broker_or_employee());
create policy notification_templates_all on notification_templates for all to authenticated
  using (public.is_broker_or_employee()) with check (public.is_broker_or_employee());

create policy saved_searches_select on saved_searches for select to authenticated using (true);
create policy saved_searches_manage on saved_searches for update to authenticated
  using (public.is_broker_or_employee()) with check (public.is_broker_or_employee());
create policy saved_searches_delete on saved_searches for delete to authenticated
  using (public.is_broker_or_employee());

-- ═══════════════════════════════════════════════════════════════════════
-- Policies -- Module 07: Social Proof & Analytics
-- ═══════════════════════════════════════════════════════════════════════

create policy testimonials_select_anon on testimonials for select to anon using (is_published);
create policy testimonials_select_internal on testimonials for select to authenticated using (true);
create policy testimonials_manage on testimonials for all to authenticated
  using (public.is_broker_or_employee()) with check (public.is_broker_or_employee());

create policy review_summary_select_anon on review_summary for select to anon using (true);
create policy review_summary_select_internal on review_summary for select to authenticated using (true);
create policy review_summary_manage on review_summary for all to authenticated
  using (public.is_broker_or_employee()) with check (public.is_broker_or_employee());

create policy page_events_select on page_events for select to authenticated
  using (public.is_broker_or_employee());
-- No anon and no direct authenticated INSERT: written only via
-- public.log_page_event() below and by the automation engine.

-- ═══════════════════════════════════════════════════════════════════════
-- Public write API -- the only way anon traffic reaches this database
-- ═══════════════════════════════════════════════════════════════════════
-- Direct anon INSERT policies on contacts/leads/page_events/saved_searches
-- would let public form traffic stuff arbitrary columns and skip dedup.
-- These SECURITY DEFINER RPCs are the entire public write surface instead:
-- narrow parameters, server-side validation, and they reuse the same
-- dedup trigger contacts already has.

create or replace function public.submit_lead(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_whatsapp_number text default null,
  p_listing_id uuid default null,
  p_source lead_source default 'website_form',
  p_source_detail text default null,
  p_campaign text default null,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact_id uuid;
  v_lead_id uuid;
begin
  select id into v_contact_id
  from contacts
  where normalized_phone = right(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), 10)
    and normalized_phone <> ''
  order by created_at
  limit 1;

  if v_contact_id is null then
    insert into contacts (full_name, phone, email, whatsapp_number, contact_type)
    values (p_full_name, p_phone, p_email, p_whatsapp_number, array['buyer']::contact_type_enum[])
    returning id into v_contact_id;
  end if;

  insert into leads (contact_id, listing_id, source, source_detail, campaign, last_activity_at)
  values (v_contact_id, p_listing_id, p_source, p_source_detail, p_campaign, now())
  returning id into v_lead_id;

  if p_message is not null then
    insert into activity_log (lead_id, activity_type, content)
    values (v_lead_id, 'note', p_message);
  end if;

  return v_lead_id;
end;
$$;

create or replace function public.log_page_event(
  p_visitor_id text,
  p_event_type page_event_type,
  p_listing_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into page_events (visitor_id, event_type, listing_id, metadata)
  values (p_visitor_id, p_event_type, p_listing_id, p_metadata);
$$;

create or replace function public.create_saved_search(
  p_full_name text,
  p_phone text default null,
  p_email text default null,
  p_criteria jsonb default '{}'::jsonb,
  p_alert_channel alert_channel default 'whatsapp'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact_id uuid;
  v_search_id uuid;
begin
  if p_phone is not null or p_email is not null then
    select id into v_contact_id
    from contacts
    where normalized_phone = right(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), 10)
      and normalized_phone <> ''
    order by created_at
    limit 1;

    if v_contact_id is null then
      insert into contacts (full_name, phone, email, contact_type)
      values (coalesce(p_full_name, 'Website visitor'), p_phone, p_email, array['buyer']::contact_type_enum[])
      returning id into v_contact_id;
    end if;
  end if;

  insert into saved_searches (contact_id, criteria, alert_channel)
  values (v_contact_id, p_criteria, p_alert_channel)
  returning id into v_search_id;

  return v_search_id;
end;
$$;

grant execute on function public.submit_lead(text, text, text, text, uuid, lead_source, text, text, text) to anon, authenticated;
grant execute on function public.log_page_event(text, page_event_type, uuid, jsonb) to anon, authenticated;
grant execute on function public.create_saved_search(text, text, text, jsonb, alert_channel) to anon, authenticated;
