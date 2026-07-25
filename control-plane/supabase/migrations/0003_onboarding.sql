-- Broker onboarding (Step 10): a public signup intake, a platform-admin
-- approval step that creates the broker_instances/provisioning_jobs rows
-- Step 1 already modeled, and a one-time bootstrap for the very first
-- platform admin account (there's no dashboard to click into before one
-- exists).

alter table broker_instances add column owner_name text;
alter table broker_instances add column owner_email text;
alter table broker_instances add column owner_phone text;

comment on column broker_instances.owner_name is 'The broker''s own contact -- not tenant data (that lives in the broker''s own broker_profile table once provisioned), just who to reach about this instance.';

-- ── broker_signup_requests ──────────────────────────────────────────────
-- A public "request access" form writes here, never directly into
-- broker_instances -- same reasoning as the tenant template's
-- submit_lead: a public writer proposes a handful of fields but must
-- never set status/reviewed_by/broker_instance_id itself.

create table broker_signup_requests (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  proposed_slug text not null,
  owner_name text not null,
  owner_email text not null,
  owner_phone text,
  plan_tier text not null default 'standard',
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references platform_admins(id),
  reviewed_at timestamptz,
  broker_instance_id uuid references broker_instances(id),
  created_at timestamptz not null default now()
);

create index idx_broker_signup_requests_status on broker_signup_requests (status, created_at desc);

alter table broker_signup_requests enable row level security;

-- No anon/authenticated INSERT policy -- written only via
-- request_broker_signup() below.
create policy broker_signup_requests_select on broker_signup_requests
  for select to authenticated using (public.is_platform_admin());
create policy broker_signup_requests_update on broker_signup_requests
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create or replace function public.request_broker_signup(
  p_business_name text,
  p_proposed_slug text,
  p_owner_name text,
  p_owner_email text,
  p_owner_phone text default null,
  p_plan_tier text default 'standard',
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_slug text;
begin
  v_slug := lower(regexp_replace(trim(p_proposed_slug), '[^a-zA-Z0-9-]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    raise exception 'proposed_slug must contain at least one letter or number';
  end if;
  if trim(p_business_name) = '' or trim(p_owner_name) = '' or trim(p_owner_email) = '' then
    raise exception 'business_name, owner_name, and owner_email are required';
  end if;

  insert into broker_signup_requests (business_name, proposed_slug, owner_name, owner_email, owner_phone, plan_tier, message)
  values (trim(p_business_name), v_slug, trim(p_owner_name), lower(trim(p_owner_email)), nullif(trim(coalesce(p_owner_phone, '')), ''), coalesce(nullif(p_plan_tier, ''), 'standard'), p_message)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.request_broker_signup(text, text, text, text, text, text, text) to anon, authenticated;

-- ── Approval -> provisioning kickoff ───────────────────────────────────
-- Turns a pending request into a real broker_instances row (status
-- 'provisioning') plus one provisioning_jobs row per step, all 'pending'.
-- Actually running those steps is the application layer's job (the
-- provisioning orchestrator) -- this function only creates the plan.

create or replace function public.approve_broker_signup(p_request_id uuid, p_slug text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  v_slug text;
  v_broker_id uuid;
  v_step provisioning_step;
begin
  if not public.is_platform_admin() then
    raise exception 'only a platform admin can approve a signup request';
  end if;

  select * into req from broker_signup_requests where id = p_request_id;
  if req is null then
    raise exception 'signup request % not found', p_request_id;
  end if;
  if req.status <> 'pending' then
    raise exception 'signup request % is not pending (status: %)', p_request_id, req.status;
  end if;

  v_slug := coalesce(nullif(trim(coalesce(p_slug, '')), ''), req.proposed_slug);

  insert into broker_instances (name, slug, status, plan_tier, owner_name, owner_email, owner_phone)
  values (req.business_name, v_slug, 'provisioning', req.plan_tier, req.owner_name, req.owner_email, req.owner_phone)
  returning id into v_broker_id;

  for v_step in select unnest(enum_range(null::provisioning_step)) loop
    insert into provisioning_jobs (broker_instance_id, step, status) values (v_broker_id, v_step, 'pending');
  end loop;

  update broker_signup_requests
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), broker_instance_id = v_broker_id
  where id = p_request_id;

  return v_broker_id;
end;
$$;

grant execute on function public.approve_broker_signup(uuid, text) to authenticated;

create or replace function public.reject_broker_signup(p_request_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'only a platform admin can reject a signup request';
  end if;

  update broker_signup_requests
  set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now(), message = coalesce(p_reason, message)
  where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'signup request % not found or not pending', p_request_id;
  end if;
end;
$$;

grant execute on function public.reject_broker_signup(uuid, text) to authenticated;

-- ── First-admin bootstrap ───────────────────────────────────────────────
-- There's deliberately no public self-signup path onto platform_admins
-- (see 0002) -- but something has to create the first one. Any signed-in
-- auth.users row may claim super_admin exactly once, only while the
-- table is empty; every admin after that is invited by an existing
-- super_admin instead.

create or replace function public.bootstrap_first_super_admin(p_full_name text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'must be signed in to bootstrap the first admin account';
  end if;
  if exists (select 1 from platform_admins) then
    raise exception 'a platform admin already exists -- ask an existing super_admin for an invite instead';
  end if;

  insert into platform_admins (id, email, name, role)
  select u.id, u.email, coalesce(p_full_name, u.email), 'super_admin'
  from auth.users u
  where u.id = auth.uid();
end;
$$;

grant execute on function public.bootstrap_first_super_admin(text) to authenticated;
