-- Automation engine, part 1: schema + triggers.
--
-- Shape: Postgres can enqueue instantly (a trigger writing to
-- automation_logs costs nothing and can't fail to fire), but it can't
-- make outbound HTTP calls to a WhatsApp/email provider without an
-- extension like pg_net -- deliberately not used here, since it's
-- Supabase-specific and hard to test the way everything else in this
-- project has been. So: triggers + scheduled scans below only ENQUEUE
-- (insert automation_logs rows with status='pending'); a cron-driven
-- Next.js route handler (0010 seeds the config this reads) does the
-- actual sending. See src/lib/automation/ and
-- src/app/api/cron/automation/route.ts.

-- ── Relationship-nurturing fields + visitor identity linking ───────────

alter table contacts add column date_of_birth date;
alter table contacts add column anniversary_date date;

alter table page_events add column contact_id uuid references contacts(id);
create index idx_page_events_contact on page_events (contact_id) where contact_id is not null;

comment on column page_events.contact_id is 'Backfilled once a visitor identifies themselves (submit_lead/create_saved_search) -- lets abandoned-browse retargeting reach someone by email even if they went quiet after their first enquiry.';

-- submit_lead / create_saved_search gain p_visitor_id so the events
-- already logged anonymously under that visitor_id can be linked to the
-- contact the moment they're identified. Signature changed (parameter
-- added), so drop the old overload first rather than risk an ambiguous
-- duplicate -- CREATE OR REPLACE only replaces a function whose
-- argument list matches exactly.

drop function if exists public.submit_lead(text, text, text, text, uuid, lead_source, text, text, text);

create or replace function public.submit_lead(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_whatsapp_number text default null,
  p_listing_id uuid default null,
  p_source lead_source default 'website_form',
  p_source_detail text default null,
  p_campaign text default null,
  p_message text default null,
  p_visitor_id text default null
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

  if p_visitor_id is not null then
    update page_events set contact_id = v_contact_id where visitor_id = p_visitor_id and contact_id is null;
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

grant execute on function public.submit_lead(text, text, text, text, uuid, lead_source, text, text, text, text) to anon, authenticated;

drop function if exists public.create_saved_search(text, text, text, jsonb, alert_channel);

create or replace function public.create_saved_search(
  p_full_name text,
  p_phone text default null,
  p_email text default null,
  p_criteria jsonb default '{}'::jsonb,
  p_alert_channel alert_channel default 'whatsapp',
  p_visitor_id text default null
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

    if p_visitor_id is not null then
      update page_events set contact_id = v_contact_id where visitor_id = p_visitor_id and contact_id is null;
    end if;
  end if;

  insert into saved_searches (contact_id, criteria, alert_channel)
  values (v_contact_id, p_criteria, p_alert_channel)
  returning id into v_search_id;

  return v_search_id;
end;
$$;

grant execute on function public.create_saved_search(text, text, text, jsonb, alert_channel, text) to anon, authenticated;

-- ── enqueue_automation: the one place that turns "a rule matched" into
-- a row in the queue the dispatcher will pick up. ────────────────────

create or replace function public.enqueue_automation(
  p_trigger_type automation_trigger_type,
  p_lead_id uuid default null,
  p_deal_id uuid default null,
  p_listing_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rule record;
begin
  for rule in select id from automation_rules where trigger_type = p_trigger_type and is_active loop
    insert into automation_logs (rule_id, lead_id, deal_id, listing_id, status, payload)
    values (rule.id, p_lead_id, p_deal_id, p_listing_id, 'pending', p_payload);
  end loop;
end;
$$;

-- ── Event-driven triggers (instant, same transaction as the event) ────

-- new_lead: any insertion path (submit_lead, the CRM's own New Lead
-- dialog, a direct insert) goes through this one trigger, so "instant
-- ack + agent alert" behaves identically regardless of where the lead
-- came from.
create or replace function public.trg_new_lead_automation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.enqueue_automation('new_lead', p_lead_id => new.id, p_listing_id => new.listing_id);
  return new;
end;
$$;

create trigger trg_leads_new_lead_automation
  after insert on leads
  for each row execute function public.trg_new_lead_automation();

-- post_site_visit: fires the moment a site_visit activity is logged.
create or replace function public.trg_post_site_visit_automation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.activity_type = 'site_visit' and new.lead_id is not null then
    perform public.enqueue_automation('post_site_visit', p_lead_id => new.lead_id);
  end if;
  return new;
end;
$$;

create trigger trg_activity_log_site_visit_automation
  after insert on activity_log
  for each row execute function public.trg_post_site_visit_automation();

-- price_drop_status_change: a price decrease or any status change on a
-- listing notifies every lead still open on that listing (not
-- closed_won/closed_lost -- those buyers already have their answer).
create or replace function public.trg_price_status_automation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  interested_lead record;
begin
  if (new.price is distinct from old.price and (old.price is null or new.price < old.price))
     or new.status is distinct from old.status then
    for interested_lead in
      select id from leads where listing_id = new.id and stage not in ('closed_won', 'closed_lost')
    loop
      perform public.enqueue_automation(
        'price_drop_status_change',
        p_lead_id => interested_lead.id,
        p_listing_id => new.id,
        p_payload => jsonb_build_object('old_price', old.price, 'new_price', new.price, 'old_status', old.status, 'new_status', new.status)
      );
    end loop;
  end if;
  return new;
end;
$$;

create trigger trg_listings_price_status_automation
  after update on listings
  for each row execute function public.trg_price_status_automation();

-- new_listing_match: fires the moment a listing is published, matching
-- against saved_searches.criteria. Deliberately tolerant of missing
-- criteria keys (a saved search with no locality set matches every
-- locality) rather than requiring every dimension to be specified.
create or replace function public.trg_new_listing_match_automation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  search record;
begin
  if new.is_published and (old.is_published is distinct from new.is_published) then
    for search in
      select id, contact_id from saved_searches
      where is_active
        and (not (criteria ? 'budget_max') or (new.price is not null and new.price <= (criteria->>'budget_max')::numeric))
        and (not (criteria ? 'budget_min') or (new.price is not null and new.price >= (criteria->>'budget_min')::numeric))
        and (not (criteria ? 'bhk') or (new.bhk is not null and (criteria->'bhk') @> to_jsonb(new.bhk)))
        and (not (criteria ? 'localities') or (new.locality_id is not null and (criteria->'localities') @> to_jsonb(new.locality_id::text)))
    loop
      perform public.enqueue_automation(
        'new_listing_match',
        p_listing_id => new.id,
        p_payload => jsonb_build_object('saved_search_id', search.id, 'contact_id', search.contact_id)
      );
    end loop;
  end if;
  return new;
end;
$$;

create trigger trg_listings_new_listing_match_automation
  after update on listings
  for each row execute function public.trg_new_listing_match_automation();

-- post_closing: same signature as before, so this is a plain replace --
-- hooks the existing stage-change RPC rather than adding a second path
-- that could fall out of sync with it.
create or replace function public.update_deal_stage(p_deal_id uuid, p_new_stage deal_stage)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update deals
  set stage = p_new_stage,
      closed_at = case when p_new_stage = 'closed' then coalesce(closed_at, current_date) else closed_at end
  where id = p_deal_id;

  if not found then
    raise exception 'deal not found or not permitted';
  end if;

  insert into activity_log (deal_id, actor_profile_id, activity_type, content)
  values (p_deal_id, auth.uid(), 'status_change', 'Deal stage changed to ' || p_new_stage::text);

  if p_new_stage = 'closed' then
    perform public.enqueue_automation('post_closing', p_deal_id => p_deal_id);
  end if;
end;
$$;

-- ── Time-based scans (called by the cron route, not triggers) ─────────
-- Each is idempotent: re-running a scan mid-window must not re-enqueue
-- an already-queued notification, so every one checks automation_logs
-- (or, where automation_logs has nowhere to record the identity, a
-- recent-window check) before inserting.

create or replace function public.scan_no_response_sla()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rule record;
  lead_row record;
  enqueued integer := 0;
begin
  for rule in select id, config from automation_rules where trigger_type = 'no_response_sla' and is_active loop
    for lead_row in
      select l.id from leads l
      where l.stage = 'new'
        and l.created_at < now() - make_interval(hours => coalesce((rule.config->>'sla_hours')::numeric, 4)::int)
        and not exists (select 1 from automation_logs al where al.rule_id = rule.id and al.lead_id = l.id)
    loop
      insert into automation_logs (rule_id, lead_id, status) values (rule.id, lead_row.id, 'pending');
      enqueued := enqueued + 1;
    end loop;
  end loop;
  return enqueued;
end;
$$;

create or replace function public.scan_drip_sequence()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rule record;
  day_offset integer;
  lead_row record;
  enqueued integer := 0;
begin
  for rule in select id, config from automation_rules where trigger_type = 'drip_sequence' and is_active loop
    for day_offset in select jsonb_array_elements_text(coalesce(rule.config->'interval_days', '[1,3,7]'::jsonb))::integer loop
      for lead_row in
        select l.id from leads l
        where l.stage in ('new', 'contacted')
          and l.created_at::date = (current_date - day_offset)
          and not exists (
            select 1 from automation_logs al
            where al.rule_id = rule.id and al.lead_id = l.id and (al.payload->>'day_offset')::int = day_offset
          )
      loop
        insert into automation_logs (rule_id, lead_id, status, payload)
        values (rule.id, lead_row.id, 'pending', jsonb_build_object('day_offset', day_offset));
        enqueued := enqueued + 1;
      end loop;
    end loop;
  end loop;
  return enqueued;
end;
$$;

create or replace function public.scan_birthday_anniversary()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rule record;
  contact_row record;
  enqueued integer := 0;
  today_key text := to_char(current_date, 'YYYY-MM-DD');
begin
  for rule in select id from automation_rules where trigger_type = 'birthday_anniversary' and is_active loop
    for contact_row in
      select id, 'birthday' as occasion from contacts
      where 'past_client' = any(contact_type)
        and date_of_birth is not null
        and extract(month from date_of_birth) = extract(month from current_date)
        and extract(day from date_of_birth) = extract(day from current_date)
      union all
      select id, 'anniversary' as occasion from contacts
      where 'past_client' = any(contact_type)
        and anniversary_date is not null
        and extract(month from anniversary_date) = extract(month from current_date)
        and extract(day from anniversary_date) = extract(day from current_date)
    loop
      if not exists (
        select 1 from automation_logs al
        where al.rule_id = rule.id
          and al.payload->>'contact_id' = contact_row.id::text
          and al.payload->>'sent_on' = today_key
      ) then
        insert into automation_logs (rule_id, status, payload)
        values (rule.id, 'pending', jsonb_build_object('contact_id', contact_row.id, 'occasion', contact_row.occasion, 'sent_on', today_key));
        enqueued := enqueued + 1;
      end if;
    end loop;
  end loop;
  return enqueued;
end;
$$;

create or replace function public.scan_abandoned_browse()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rule record;
  visitor_row record;
  enqueued integer := 0;
begin
  for rule in select id, config from automation_rules where trigger_type = 'abandoned_browse' and is_active loop
    for visitor_row in
      select pe.contact_id, count(distinct pe.listing_id) as views
      from page_events pe
      where pe.event_type = 'listing_view'
        and pe.contact_id is not null
        and pe.created_at > now() - make_interval(hours => coalesce((rule.config->>'window_hours')::numeric, 48)::int)
      group by pe.contact_id
      having count(distinct pe.listing_id) >= coalesce((rule.config->>'min_views')::int, 3)
    loop
      if not exists (
        select 1 from automation_logs al
        where al.rule_id = rule.id
          and al.payload->>'contact_id' = visitor_row.contact_id::text
          and al.executed_at > now() - interval '48 hours'
      ) then
        insert into automation_logs (rule_id, status, payload)
        values (rule.id, 'pending', jsonb_build_object('contact_id', visitor_row.contact_id, 'view_count', visitor_row.views));
        enqueued := enqueued + 1;
      end if;
    end loop;
  end loop;
  return enqueued;
end;
$$;

create or replace function public.run_automation_scans()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return jsonb_build_object(
    'no_response_sla', public.scan_no_response_sla(),
    'drip_sequence', public.scan_drip_sequence(),
    'birthday_anniversary', public.scan_birthday_anniversary(),
    'abandoned_browse', public.scan_abandoned_browse()
  );
end;
$$;

-- No grants on the scan_*/run_automation_scans functions: they're
-- system-internal, called only by the cron route's service-role client,
-- which bypasses grants entirely. Nothing for anon/authenticated to do
-- with them.
