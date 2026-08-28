-- Phase 2.2: stale-lead escalation (New for > threshold hours -> notify admin/team
-- lead) and site-visit reminders (2 hours before) via pg_cron rather than a
-- Supabase Edge Function cron (unavailable in this project, see previous
-- migration's note). pg_cron is a Postgres extension, not part of the
-- Management-API-gated Edge Functions surface, so it's installable via plain SQL.
create extension if not exists pg_cron with schema extensions;

alter table public.leads add column escalated_at timestamptz;
alter table public.site_visits add column reminder_sent_at timestamptz;

create or replace function public.escalate_stale_leads()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  threshold_hours integer;
  stale_lead record;
  admin_id uuid;
begin
  select stale_lead_hours into threshold_hours from public.lead_routing_settings where id = true;

  for stale_lead in
    select * from public.leads
    where status = 'New'
      and escalated_at is null
      and created_at < now() - make_interval(hours => coalesce(threshold_hours, 4))
  loop
    for admin_id in select id from public.profiles where role in ('admin', 'team_lead') and status = 'Active'
    loop
      insert into public.notifications (recipient_id, type, title, body, related_lead_id)
      values (
        admin_id,
        'stale_lead',
        'Stale lead needs attention',
        'Lead "' || stale_lead.name || '" has been in New status for over '
          || coalesce(threshold_hours, 4) || ' hours.',
        stale_lead.id
      );
    end loop;

    update public.leads set escalated_at = now() where id = stale_lead.id;
  end loop;
end;
$$;

create or replace function public.send_site_visit_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  visit record;
begin
  -- preferred_date/preferred_time carry no timezone (site visits are always
  -- scheduled in the business's own local time, IST) -- this comparison assumes
  -- the database session timezone is also IST. Confirm/set the project's Postgres
  -- timezone setting to Asia/Kolkata if it isn't already, or this will drift.
  for visit in
    select * from public.site_visits
    where status in ('Requested', 'Confirmed')
      and reminder_sent_at is null
      and (preferred_date + preferred_time) between now() and now() + interval '2 hours'
  loop
    if visit.assigned_to is not null then
      insert into public.notifications (recipient_id, type, title, body, related_site_visit_id)
      values (
        visit.assigned_to,
        'site_visit_reminder',
        'Site visit in the next 2 hours',
        visit.name || ' has a site visit at ' || to_char(visit.preferred_date, 'DD Mon YYYY')
          || ' ' || to_char(visit.preferred_time, 'HH12:MI AM'),
        visit.id
      );
    end if;

    update public.site_visits set reminder_sent_at = now() where id = visit.id;
  end loop;
end;
$$;

select cron.schedule('escalate-stale-leads', '*/30 * * * *', 'select public.escalate_stale_leads();');
select cron.schedule('send-site-visit-reminders', '*/15 * * * *', 'select public.send_site_visit_reminders();');
