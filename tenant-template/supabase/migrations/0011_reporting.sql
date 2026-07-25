-- Reporting & analytics (Step 9).
--
-- Every function below is SECURITY INVOKER (the default -- no clause
-- needed, but stated in comments for clarity) and does nothing but
-- aggregate the same tables the CRM already reads directly. That's
-- deliberate: leads/deals/listings/profiles/page_events/automation_logs
-- already carry the exact role-based + hierarchy_path visibility rules
-- this report needs (Module 02/03/05/06 RLS), so a plain `select ...
-- group by ...` run as the calling user gets the correct scope for free
-- -- broker/employee sees everything, a master_advisor sees their
-- downline, a leaf advisor sees only themselves. No new visibility rule
-- is invented here; these functions only reshape rows the caller could
-- already see one at a time into aggregates.
--
-- Commission/revenue figures are attributed entirely to a deal's
-- primary_advisor_id, same as the existing deal pipeline UI -- a
-- commission_split-aware per-advisor breakdown would double-count a
-- shared deal across each split recipient and is out of scope here.

create or replace function public.report_lead_funnel()
returns table (stage lead_stage, total bigint)
language sql
stable
set search_path = public
as $$
  select stage, count(*) as total
  from leads
  group by stage;
$$;

create or replace function public.report_lead_sources()
returns table (source lead_source, total bigint, won bigint)
language sql
stable
set search_path = public
as $$
  select
    source,
    count(*) as total,
    count(*) filter (where stage = 'closed_won') as won
  from leads
  group by source
  order by total desc;
$$;

create or replace function public.report_leads_over_time(p_days int default 30)
returns table (day date, total bigint)
language sql
stable
set search_path = public
as $$
  select date_trunc('day', created_at)::date as day, count(*) as total
  from leads
  where created_at > now() - make_interval(days => p_days)
  group by 1
  order by 1;
$$;

create or replace function public.report_deal_summary()
returns table (stage deal_stage, total bigint, total_value numeric, total_commission numeric)
language sql
stable
set search_path = public
as $$
  select
    stage,
    count(*) as total,
    coalesce(sum(deal_value), 0) as total_value,
    coalesce(sum(commission_amount), 0) as total_commission
  from deals
  group by stage;
$$;

create or replace function public.report_deals_closed_over_time(p_months int default 6)
returns table (month date, total bigint, total_value numeric)
language sql
stable
set search_path = public
as $$
  select
    date_trunc('month', closed_at)::date as month,
    count(*) as total,
    coalesce(sum(deal_value), 0) as total_value
  from deals
  where stage = 'closed'
    and closed_at is not null
    and closed_at > (current_date - make_interval(months => p_months))
  group by 1
  order by 1;
$$;

create or replace function public.report_listing_status_breakdown()
returns table (status listing_status, total bigint)
language sql
stable
set search_path = public
as $$
  select status, count(*) as total
  from listings
  group by status;
$$;

create or replace function public.report_listing_segment_breakdown()
returns table (segment listing_segment, total bigint)
language sql
stable
set search_path = public
as $$
  select segment, count(*) as total
  from listings
  group by segment;
$$;

-- page_events is broker/employee-only (see 0002), so this naturally
-- returns nothing for anyone else -- the CRM dashboard hides the section
-- rather than treating an empty result as an error.
create or replace function public.report_top_viewed_listings(p_limit int default 5)
returns table (listing_id uuid, title jsonb, views bigint)
language sql
stable
set search_path = public
as $$
  select l.id, l.title, count(*) as views
  from page_events pe
  join listings l on l.id = pe.listing_id
  where pe.event_type = 'listing_view'
  group by l.id, l.title
  order by views desc
  limit p_limit;
$$;

-- Degrades gracefully by role: a leaf advisor's own downline is just
-- themselves, so this reads as "my performance"; a master_advisor or
-- above sees their downline's numbers roll up, same shape either way.
create or replace function public.report_team_performance()
returns table (
  profile_id uuid,
  full_name text,
  role profile_role,
  leads_assigned bigint,
  leads_won bigint,
  deals_closed bigint,
  revenue numeric,
  commission numeric
)
language sql
stable
set search_path = public
as $$
  with lead_stats as (
    select l.assigned_advisor_id as profile_id,
      count(*) as leads_assigned,
      count(*) filter (where l.stage = 'closed_won') as leads_won
    from leads l
    where l.assigned_advisor_id is not null
    group by l.assigned_advisor_id
  ),
  deal_stats as (
    select d.primary_advisor_id as profile_id,
      count(*) filter (where d.stage = 'closed') as deals_closed,
      coalesce(sum(d.deal_value) filter (where d.stage = 'closed'), 0) as revenue,
      coalesce(sum(d.commission_amount) filter (where d.stage = 'closed'), 0) as commission
    from deals d
    group by d.primary_advisor_id
  )
  select
    p.id as profile_id,
    p.full_name,
    p.role,
    coalesce(ls.leads_assigned, 0) as leads_assigned,
    coalesce(ls.leads_won, 0) as leads_won,
    coalesce(ds.deals_closed, 0) as deals_closed,
    coalesce(ds.revenue, 0) as revenue,
    coalesce(ds.commission, 0) as commission
  from profiles p
  left join lead_stats ls on ls.profile_id = p.id
  left join deal_stats ds on ds.profile_id = p.id
  where p.role in ('master_advisor', 'advisor')
  order by p.full_name;
$$;

-- automation_rules/automation_logs are broker/employee-only (see 0002),
-- so this naturally returns nothing for anyone else.
create or replace function public.report_automation_summary(p_days int default 30)
returns table (trigger_type automation_trigger_type, sent bigint, failed bigint, pending bigint)
language sql
stable
set search_path = public
as $$
  select
    r.trigger_type,
    count(*) filter (where al.status = 'sent') as sent,
    count(*) filter (where al.status = 'failed') as failed,
    count(*) filter (where al.status = 'pending') as pending
  from automation_logs al
  join automation_rules r on r.id = al.rule_id
  where al.executed_at > now() - make_interval(days => p_days)
  group by r.trigger_type
  order by r.trigger_type;
$$;

grant execute on function public.report_lead_funnel() to authenticated;
grant execute on function public.report_lead_sources() to authenticated;
grant execute on function public.report_leads_over_time(int) to authenticated;
grant execute on function public.report_deal_summary() to authenticated;
grant execute on function public.report_deals_closed_over_time(int) to authenticated;
grant execute on function public.report_listing_status_breakdown() to authenticated;
grant execute on function public.report_listing_segment_breakdown() to authenticated;
grant execute on function public.report_top_viewed_listings(int) to authenticated;
grant execute on function public.report_team_performance() to authenticated;
grant execute on function public.report_automation_summary(int) to authenticated;
