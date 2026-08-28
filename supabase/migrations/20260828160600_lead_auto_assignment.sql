-- Phase 2.2: on new lead insert, auto-assign per the configured routing rule and
-- notify the assigned broker. Built as a Postgres trigger rather than a Supabase
-- Edge Function -- this project's CLI is authenticated to a different Supabase
-- account than this project belongs to, so Edge Function deployment
-- (`supabase functions deploy`) is not available (confirmed: same 403 privilege
-- error as `supabase link`). A BEFORE INSERT trigger achieves the same "on insert"
-- semantics using only SQL, no deployment step required.
--
-- Round-robin note: broker "next in line" is determined by profile id ordering,
-- which gives a stable cyclical order but is not chronological -- a pragmatic
-- simplification, not a guarantee of strict fairness over time.
create or replace function public.auto_assign_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  routing record;
  next_broker uuid;
begin
  select * into routing from public.lead_routing_settings where id = true;

  if routing.mode = 'manual' then
    return new;
  end if;

  if routing.mode = 'locality_based' and new.listing_id is not null then
    select p.id into next_broker
    from public.profiles p
    join public.listings l on l.id = new.listing_id
    where p.status = 'Active'
      and p.role in ('broker', 'team_lead')
      and l.locality = any (p.assigned_localities)
    order by random()
    limit 1;
  end if;

  if next_broker is null and routing.mode in ('round_robin', 'locality_based') then
    select p.id into next_broker
    from public.profiles p
    where p.status = 'Active'
      and p.role in ('broker', 'team_lead')
      and (routing.last_assigned_broker_id is null or p.id > routing.last_assigned_broker_id)
    order by p.id
    limit 1;

    if next_broker is null then
      select p.id into next_broker
      from public.profiles p
      where p.status = 'Active' and p.role in ('broker', 'team_lead')
      order by p.id
      limit 1;
    end if;
  end if;

  if next_broker is not null then
    new.assigned_to = next_broker;

    update public.lead_routing_settings
    set last_assigned_broker_id = next_broker, updated_at = now()
    where id = true;

    insert into public.notifications (recipient_id, type, title, body, related_lead_id)
    values (
      next_broker,
      'lead_assigned',
      'New lead assigned',
      'A new lead (' || new.name || ', via ' || new.source || ') has been assigned to you.',
      new.id
    );
  end if;

  return new;
end;
$$;

create trigger on_lead_insert_auto_assign
  before insert on public.leads
  for each row execute function public.auto_assign_lead();

-- Log every status change (including the initial insert) to the activity timeline
-- automatically, so the Kanban board's drag-and-drop doesn't need a separate
-- "write an activity row" round-trip.
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.lead_activities (lead_id, actor_id, activity_type, content)
    values (
      new.id,
      auth.uid(),
      'status_change',
      case
        when tg_op = 'INSERT' then 'Lead created with status ' || new.status
        else 'Status changed from ' || old.status || ' to ' || new.status
      end
    );
  end if;
  return new;
end;
$$;

create trigger on_lead_status_change_log
  after insert or update on public.leads
  for each row execute function public.log_lead_status_change();
