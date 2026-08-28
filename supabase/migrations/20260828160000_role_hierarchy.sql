-- Phase 3.1: a proper relational role hierarchy (Admin -> Team Lead -> Broker ->
-- Sub-Broker, with Staff as a parallel non-sales branch under Admin) replacing the
-- flat admin/consultant model from Phase 1. `reports_to` is what makes recursive
-- downline RLS scoping possible: a user sees their own + their downline's data,
-- never their upline's or siblings'.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'team_lead', 'broker', 'sub_broker', 'staff'));
alter table public.profiles alter column role set default 'broker';

alter table public.profiles
  add column reports_to uuid references public.profiles (id) on delete set null,
  add column status text not null default 'Active' check (status in ('Active', 'Inactive')),
  add column commission_percent numeric check (
    commission_percent is null or (commission_percent >= 0 and commission_percent <= 100)
  ),
  add column assigned_localities text[] not null default '{}';

alter table public.profiles
  add constraint profiles_no_self_report check (reports_to is distinct from id);

-- New staff default to the lowest-privilege sales role rather than the old
-- 'consultant' value, which no longer exists.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 'broker');
  return new;
end;
$$;

-- is_admin()/is_staff() widened to the 5-role model, and gated on status so a
-- deactivated account (Admin included) loses access immediately.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'Active'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'team_lead', 'broker', 'sub_broker', 'staff')
      and status = 'Active'
  );
$$;

-- Listings/inventory writes: admin, team lead, and broker -- NOT sub-broker or
-- staff. Sub-brokers get read-only inventory access per spec 3.2 ("read-only
-- access to Active inventory to share with their network").
create or replace function public.is_broker_or_above()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'team_lead', 'broker') and status = 'Active'
  );
$$;

-- Admin/Team Lead: can reassign leads, configure routing rules, see firm-wide
-- financials/reporting.
create or replace function public.is_admin_or_team_lead()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'team_lead') and status = 'Active'
  );
$$;

-- The core of the 3.1 RLS pattern: "own + downline, never upline/siblings".
-- Recursively walks reports_to FROM the current user DOWN, so it naturally
-- includes every role level beneath them (a Team Lead's downline includes their
-- Brokers' Sub-Brokers too, without special-casing each level).
create or replace function public.is_self_or_downline(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  with recursive downline as (
    select id from public.profiles where id = auth.uid()
    union all
    select p.id
    from public.profiles p
    inner join downline d on p.reports_to = d.id
  )
  select target_user_id in (select id from downline);
$$;
