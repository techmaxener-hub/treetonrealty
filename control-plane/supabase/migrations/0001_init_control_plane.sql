-- Control plane: registry of broker instances and platform admins.
-- This is the ONLY database in the platform that ever references more than
-- one broker. It never stores a broker's leads, listings, contacts, or deals
-- -- only pointers to each broker's own, physically separate Supabase project
-- and deployment.

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────

create type broker_instance_status as enum ('provisioning', 'active', 'suspended', 'cancelled');
create type provisioning_step as enum ('create_project', 'run_migrations', 'seed_defaults', 'deploy_frontend', 'assign_domain', 'done');
create type provisioning_job_status as enum ('pending', 'running', 'done', 'failed');
create type platform_admin_role as enum ('super_admin', 'support');

-- ── broker_instances ────────────────────────────────────────────────────
-- One row per brokerage. Holds only infrastructure pointers, never tenant data.

create table broker_instances (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status broker_instance_status not null default 'provisioning',
  supabase_project_ref text unique,
  supabase_url text,
  secrets_ref text,
  deployment_url text,
  subdomain text unique,
  custom_domain text unique,
  plan_tier text not null default 'standard',
  created_at timestamptz not null default now(),
  provisioned_at timestamptz
);

comment on table broker_instances is 'Registry of physically isolated broker deployments. Never stores tenant data.';
comment on column broker_instances.secrets_ref is 'Pointer into a secrets manager; anon/service keys are never stored here in plaintext.';

-- ── provisioning_jobs ───────────────────────────────────────────────────
-- Audit trail of spinning up a broker instance end to end.

create table provisioning_jobs (
  id uuid primary key default gen_random_uuid(),
  broker_instance_id uuid not null references broker_instances(id) on delete cascade,
  step provisioning_step not null,
  status provisioning_job_status not null default 'pending',
  log text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_provisioning_jobs_broker_instance on provisioning_jobs (broker_instance_id);
create index idx_provisioning_jobs_status on provisioning_jobs (status);

-- ── platform_admins ─────────────────────────────────────────────────────
-- Your team. Auth lives only here -- never as a role inside a broker's own
-- database. Support access into a specific broker's project goes through a
-- service-role key used from an admin panel, not a standing login.

create table platform_admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role platform_admin_role not null default 'support',
  created_at timestamptz not null default now()
);

-- ── RLS: enabled now, policies added in Step 2 (Auth & Roles) ─────────────
-- Enabling here means every table is deny-by-default the moment it exists;
-- the provisioning pipeline runs as the service role, which bypasses RLS.

alter table broker_instances enable row level security;
alter table provisioning_jobs enable row level security;
alter table platform_admins enable row level security;
