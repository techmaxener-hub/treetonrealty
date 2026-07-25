-- Tenant template: the website + CRM + automation schema deployed, verbatim,
-- into every broker's own Supabase project. There is no broker_id anywhere in
-- this file -- the project itself is the tenant boundary. This migration is
-- identical for broker #1 and broker #200; only the data differs.

create extension if not exists pgcrypto;
create extension if not exists ltree;

-- ═══════════════════════════════════════════════════════════════════════
-- Shared helpers
-- ═══════════════════════════════════════════════════════════════════════

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- Module 01 -- Identity
-- ═══════════════════════════════════════════════════════════════════════

create type profile_role as enum ('broker', 'employee', 'master_advisor', 'advisor');

-- broker_profile: this broker's own identity. Exactly one row, enforced with
-- a boolean-primary-key singleton trick -- a second row is structurally
-- impossible, not just discouraged by convention.
create table broker_profile (
  id boolean primary key default true,
  display_name text not null,
  legal_name text,
  branding jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  default_language text not null default 'en',
  supported_languages text[] not null default array['en'],
  seo jsonb not null default '{}'::jsonb,
  years_in_business int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint broker_profile_singleton check (id)
);

comment on table broker_profile is 'Singleton: this broker''s identity, branding, and contact info.';

create trigger trg_broker_profile_updated_at
  before update on broker_profile
  for each row execute function set_updated_at();

-- profiles: 1:1 extension of this project's own auth.users. reports_to_id
-- points to whoever this person's real, direct supervisor is -- which may
-- skip a tier when that tier is empty on this branch (see the rank-check
-- trigger below). hierarchy_path is a materialized ltree ancestor chain,
-- kept in sync by trigger, so "is this row in my downline" is a single
-- indexed lookup rather than a recursive query.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role profile_role not null,
  reports_to_id uuid references profiles(id),
  hierarchy_path ltree,
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'Auth identity + role hierarchy: broker -> employee -> master_advisor -> advisor (advisor chains under itself).';
comment on column profiles.reports_to_id is 'Direct upline. Null only for the broker; may skip a tier if that tier is empty on this branch.';

create index idx_profiles_reports_to on profiles (reports_to_id);
create index idx_profiles_hierarchy_path on profiles using gist (hierarchy_path);
create unique index uq_profiles_single_broker on profiles (role) where role = 'broker';

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Rank check: reports_to must be flat-or-up the tier order. Only 'advisor'
-- may report to its own tier (unlimited chained depth); every other tier
-- reports strictly upward.
create or replace function profiles_role_rank(p_role profile_role)
returns smallint
language sql
immutable
as $$
  select case p_role
    when 'broker' then 0
    when 'employee' then 1
    when 'master_advisor' then 2
    when 'advisor' then 3
  end;
$$;

create or replace function profiles_validate_reports_to()
returns trigger
language plpgsql
as $$
declare
  parent_role profile_role;
begin
  if new.role = 'broker' then
    if new.reports_to_id is not null then
      raise exception 'the broker role cannot have a reports_to_id';
    end if;
    return new;
  end if;

  if new.reports_to_id is null then
    raise exception '% must report to someone', new.role;
  end if;

  if new.reports_to_id = new.id then
    raise exception 'a profile cannot report to itself';
  end if;

  select role into parent_role from profiles where id = new.reports_to_id;
  if parent_role is null then
    raise exception 'reports_to_id % does not exist', new.reports_to_id;
  end if;

  if profiles_role_rank(parent_role) > profiles_role_rank(new.role) then
    raise exception '% cannot report to a lower-ranked %', new.role, parent_role;
  end if;

  if profiles_role_rank(parent_role) = profiles_role_rank(new.role) and new.role <> 'advisor' then
    raise exception 'only advisor may report to its own tier';
  end if;

  return new;
end;
$$;

create trigger trg_profiles_validate_reports_to
  before insert or update of role, reports_to_id on profiles
  for each row execute function profiles_validate_reports_to();

-- Materialize hierarchy_path from reports_to_id on insert/reparent, then
-- cascade the change to every existing descendant in one indexed update.
create or replace function profiles_set_hierarchy_path()
returns trigger
language plpgsql
as $$
declare
  parent_path ltree;
  own_label text := replace(new.id::text, '-', '_');
begin
  if new.reports_to_id is null then
    new.hierarchy_path := text2ltree(own_label);
  else
    select hierarchy_path into parent_path from profiles where id = new.reports_to_id;
    new.hierarchy_path := parent_path || text2ltree(own_label);
  end if;
  return new;
end;
$$;

create trigger trg_profiles_set_hierarchy_path
  before insert or update of reports_to_id on profiles
  for each row execute function profiles_set_hierarchy_path();

create or replace function profiles_cascade_hierarchy_path()
returns trigger
language plpgsql
as $$
begin
  if old.hierarchy_path is distinct from new.hierarchy_path then
    update profiles
    set hierarchy_path = new.hierarchy_path || subpath(hierarchy_path, nlevel(old.hierarchy_path))
    where hierarchy_path <@ old.hierarchy_path
      and id <> new.id;
  end if;
  return null;
end;
$$;

create trigger trg_profiles_cascade_hierarchy_path
  after update of reports_to_id on profiles
  for each row execute function profiles_cascade_hierarchy_path();

-- advisor_profiles: the marketing-facing profile page. Open to any tier --
-- broker, employee, master_advisor, advisor -- that wants a public bio.
create table advisor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  slug text not null unique,
  bio jsonb not null default '{}'::jsonb,
  specialization text[] not null default '{}',
  years_experience int,
  languages_spoken text[] not null default '{}',
  photo_url text,
  linkedin_url text,
  instagram_url text,
  is_public boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_advisor_profiles_profile on advisor_profiles (profile_id);

create trigger trg_advisor_profiles_updated_at
  before update on advisor_profiles
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════
-- Module 02 -- Website Content
-- ═══════════════════════════════════════════════════════════════════════

create table localities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text,
  state text,
  content jsonb not null default '{}'::jsonb,
  hero_image_url text,
  seo jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column localities.content is 'Multi-language: {en:{connectivity,price_trends,amenities_nearby,description}, hi:{...}, gu:{...}}';

create trigger trg_localities_updated_at
  before update on localities
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════
-- Module 04 -- Listings & Inventory (created before leads/deals, which
-- reference it)
-- ═══════════════════════════════════════════════════════════════════════

create type property_type_enum as enum ('apartment', 'villa', 'plot', 'commercial', 'farmhouse', 'penthouse');
create type listing_segment as enum ('luxury', 'premium', 'affordable', 'commercial', 'weekend_home');
create type listing_offer_type as enum ('sale', 'rent');
create type listing_status as enum ('available', 'under_offer', 'sold', 'rented', 'off_market');
create type possession_status as enum ('ready_to_move', 'under_construction');
create type listing_media_type as enum ('photo', 'floor_plan', 'video_youtube', 'document');

create table listings (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references advisor_profiles(id),
  locality_id uuid references localities(id),
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  slug text not null unique,
  property_type property_type_enum not null,
  segment listing_segment not null,
  offer_type listing_offer_type not null,
  status listing_status not null default 'available',
  price numeric,
  maintenance_charges numeric,
  bhk numeric,
  carpet_area_sqft numeric,
  builtup_area_sqft numeric,
  floor_number int,
  total_floors int,
  developer_name text,
  possession_status possession_status,
  possession_date date,
  amenities text[] not null default '{}',
  address text,
  lat numeric,
  lng numeric,
  is_exclusive boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_listings_locality on listings (locality_id);
create index idx_listings_advisor on listings (advisor_id);
create index idx_listings_status on listings (status);
create index idx_listings_segment on listings (segment);
create index idx_listings_published on listings (is_published) where is_published;

create trigger trg_listings_updated_at
  before update on listings
  for each row execute function set_updated_at();

-- listing_internal: commission and negotiation notes. Own table so RLS can
-- deny the public anon role at the table level, not just the row level.
create table listing_internal (
  listing_id uuid primary key references listings(id) on delete cascade,
  commission_percent numeric,
  seller_flexibility_notes text,
  internal_notes text,
  exclusive_agreement_expiry date,
  updated_at timestamptz not null default now()
);

create trigger trg_listing_internal_updated_at
  before update on listing_internal
  for each row execute function set_updated_at();

-- listing_owners: seller/landlord contact for a listing -- separate from
-- buyer-side leads on the same property.
create table listing_owners (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  contact_id uuid not null,
  confidential boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_listing_owners_listing on listing_owners (listing_id);
create index idx_listing_owners_contact on listing_owners (contact_id);

create table listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  media_type listing_media_type not null,
  url text not null,
  caption jsonb,
  display_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_listing_media_listing on listing_media (listing_id, display_order);

-- ═══════════════════════════════════════════════════════════════════════
-- Module 03 -- Leads & Contacts
-- ═══════════════════════════════════════════════════════════════════════

create type contact_type_enum as enum ('buyer', 'seller', 'tenant', 'landlord', 'past_client');
create type lead_source as enum ('website_form', 'whatsapp_click', 'instagram', 'referral', 'walk_in', 'magicbricks', 'acres_99', 'google', 'other');
create type lead_stage as enum ('new', 'contacted', 'qualified', 'site_visit_scheduled', 'site_visit_done', 'negotiation', 'documentation', 'closed_won', 'closed_lost');
create type lead_score as enum ('hot', 'warm', 'cold');
create type activity_type as enum ('call', 'whatsapp_message', 'email', 'note', 'site_visit', 'status_change', 'task');
create type task_status as enum ('pending', 'done');

-- contacts: one record per human -- buyer, seller, tenant, landlord, past
-- client -- not one table per role.
create table contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  normalized_phone text generated always as (
    right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10)
  ) stored,
  email text,
  whatsapp_number text,
  potential_duplicate_of uuid references contacts(id),
  contact_type contact_type_enum[] not null default '{}',
  preferences jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column contacts.normalized_phone is 'Last 10 digits after stripping non-digits -- absorbs +91 / leading-0 / spacing variance for dedup.';
comment on column contacts.potential_duplicate_of is 'Soft-flag set by trigger, not a hard unique constraint -- see normalized_phone comment.';

create index idx_contacts_normalized_phone on contacts (normalized_phone) where normalized_phone <> '';

create trigger trg_contacts_updated_at
  before update on contacts
  for each row execute function set_updated_at();

create or replace function contacts_flag_duplicate()
returns trigger
language plpgsql
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

create trigger trg_contacts_flag_duplicate
  after insert on contacts
  for each row execute function contacts_flag_duplicate();

alter table listing_owners
  add constraint fk_listing_owners_contact foreign key (contact_id) references contacts(id) on delete restrict;

-- leads: the Kanban row. A contact can have more than one lead over time.
create table leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  listing_id uuid references listings(id),
  assigned_advisor_id uuid references advisor_profiles(id),
  source lead_source not null,
  source_detail text,
  campaign text,
  stage lead_stage not null default 'new',
  score lead_score,
  budget_min numeric,
  budget_max numeric,
  lost_reason text,
  last_activity_at timestamptz,
  next_followup_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_contact on leads (contact_id);
create index idx_leads_listing on leads (listing_id);
create index idx_leads_assigned_advisor on leads (assigned_advisor_id);
create index idx_leads_stage on leads (stage);
create index idx_leads_next_followup on leads (next_followup_at) where stage not in ('closed_won', 'closed_lost');

create trigger trg_leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- activity_log: shared timeline for both the lead pipeline and the deal
-- pipeline -- calls, WhatsApp messages, notes, site visits, stage changes.
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  deal_id uuid,
  actor_profile_id uuid references profiles(id),
  activity_type activity_type not null,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint chk_activity_log_one_parent check (
    (lead_id is not null and deal_id is null) or (lead_id is null and deal_id is not null)
  )
);

create index idx_activity_log_lead on activity_log (lead_id, created_at desc);
create index idx_activity_log_deal on activity_log (deal_id, created_at desc);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  assigned_to uuid not null references profiles(id),
  title text not null,
  description text,
  due_at timestamptz not null,
  status task_status not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on column tasks.status is 'Only pending/done are stored; "overdue" is derived at query time from due_at < now().';

create index idx_tasks_assigned_to on tasks (assigned_to, due_at);
create index idx_tasks_lead on tasks (lead_id);

-- ═══════════════════════════════════════════════════════════════════════
-- Module 05 -- Deals & Commission
-- ═══════════════════════════════════════════════════════════════════════

create type deal_stage as enum ('negotiation', 'documentation', 'closed');
create type deal_doc_type as enum ('agreement', 'token_receipt', 'kyc_buyer', 'kyc_seller', 'other');
create type deal_doc_status as enum ('pending', 'uploaded', 'verified');

create table deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  buyer_contact_id uuid not null references contacts(id),
  seller_contact_id uuid references contacts(id),
  primary_advisor_id uuid not null references advisor_profiles(id),
  stage deal_stage not null default 'negotiation',
  deal_value numeric,
  commission_percent numeric,
  commission_amount numeric,
  commission_split jsonb not null default '{}'::jsonb,
  closed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column deals.commission_split is 'Per-advisor share, e.g. {"<advisor_profile_id>": 60, "<advisor_profile_id>": 40} -- general enough to pay a referring sub-broker up the chain, not just the closer.';

create index idx_deals_listing on deals (listing_id);
create index idx_deals_primary_advisor on deals (primary_advisor_id);
create index idx_deals_stage on deals (stage);

create trigger trg_deals_updated_at
  before update on deals
  for each row execute function set_updated_at();

alter table activity_log
  add constraint fk_activity_log_deal foreign key (deal_id) references deals(id) on delete cascade;

create table deal_documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  doc_type deal_doc_type not null,
  file_url text,
  status deal_doc_status not null default 'pending',
  uploaded_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_deal_documents_deal on deal_documents (deal_id);

-- ═══════════════════════════════════════════════════════════════════════
-- Module 06 -- Automation & Notifications
-- ═══════════════════════════════════════════════════════════════════════

create type automation_trigger_type as enum (
  'new_lead', 'no_response_sla', 'drip_sequence', 'new_listing_match',
  'post_site_visit', 'post_closing', 'abandoned_browse',
  'birthday_anniversary', 'price_drop_status_change'
);
create type automation_log_status as enum ('pending', 'sent', 'failed');
create type notification_channel as enum ('whatsapp', 'email', 'sms');
create type alert_channel as enum ('email', 'whatsapp', 'both');

create table automation_rules (
  id uuid primary key default gen_random_uuid(),
  trigger_type automation_trigger_type not null,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_automation_rules_trigger on automation_rules (trigger_type) where is_active;

create trigger trg_automation_rules_updated_at
  before update on automation_rules
  for each row execute function set_updated_at();

create table automation_logs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references automation_rules(id) on delete cascade,
  lead_id uuid references leads(id),
  deal_id uuid references deals(id),
  listing_id uuid references listings(id),
  status automation_log_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  executed_at timestamptz not null default now()
);

create index idx_automation_logs_rule on automation_logs (rule_id, executed_at desc);

create table notification_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  channel notification_channel not null,
  subject text,
  body jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column notification_templates.body is 'Multi-language {{variable}} template text, e.g. {en:"...", hi:"...", gu:"..."}';

create trigger trg_notification_templates_updated_at
  before update on notification_templates
  for each row execute function set_updated_at();

create table saved_searches (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id),
  criteria jsonb not null default '{}'::jsonb,
  alert_channel alert_channel not null default 'whatsapp',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_saved_searches_active on saved_searches (is_active) where is_active;

-- ═══════════════════════════════════════════════════════════════════════
-- Module 07 -- Social Proof & Analytics
-- ═══════════════════════════════════════════════════════════════════════

create type testimonial_source as enum ('manual', 'google', 'magicpin');
create type page_event_type as enum ('listing_view', 'whatsapp_click', 'form_submit', 'search');

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references advisor_profiles(id),
  client_name text not null,
  rating int not null check (rating between 1 and 5),
  content jsonb,
  source testimonial_source not null default 'manual',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_testimonials_published on testimonials (is_published) where is_published;

-- review_summary: cached aggregate rating, singleton like broker_profile.
create table review_summary (
  id boolean primary key default true,
  google_rating numeric,
  google_review_count int,
  magicpin_rating numeric,
  magicpin_review_count int,
  updated_at timestamptz not null default now(),
  constraint review_summary_singleton check (id)
);

create trigger trg_review_summary_updated_at
  before update on review_summary
  for each row execute function set_updated_at();

-- page_events: anonymous browse events. Append-only and write-heavy --
-- monthly range partitioning on created_at is a straightforward additive
-- change once volume justifies it (see Step 1 decision notes); not needed
-- at zero brokers.
create table page_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  event_type page_event_type not null,
  listing_id uuid references listings(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_page_events_visitor on page_events (visitor_id, created_at desc);
create index idx_page_events_listing on page_events (listing_id) where listing_id is not null;

-- ═══════════════════════════════════════════════════════════════════════
-- RLS: enabled now, policies added in Step 2 (Auth & Roles)
-- ═══════════════════════════════════════════════════════════════════════
-- Enabling here means every table is deny-by-default the moment it exists.
-- Step 2 adds the role-rank + downline (hierarchy_path) policies described
-- in the schema proposal, plus the narrow anon policies for the public site.

alter table broker_profile enable row level security;
alter table profiles enable row level security;
alter table advisor_profiles enable row level security;
alter table localities enable row level security;
alter table listings enable row level security;
alter table listing_internal enable row level security;
alter table listing_owners enable row level security;
alter table listing_media enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table activity_log enable row level security;
alter table tasks enable row level security;
alter table deals enable row level security;
alter table deal_documents enable row level security;
alter table automation_rules enable row level security;
alter table automation_logs enable row level security;
alter table notification_templates enable row level security;
alter table saved_searches enable row level security;
alter table testimonials enable row level security;
alter table review_summary enable row level security;
alter table page_events enable row level security;
