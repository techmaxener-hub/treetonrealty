-- Phase 3.3's Kanban board specifies exact pipeline stages that don't match the
-- lead_status_enum values chosen back in Phase 1 ('Qualified', 'Negotiation').
-- The leads table has no rows yet in this environment, so this recreates the type
-- cleanly rather than value-by-value migrating (Postgres can't drop enum values,
-- only add them, so a straight ALTER TYPE ADD VALUE would leave the old stage
-- names permanently selectable).
alter table public.leads alter column status drop default;
alter table public.leads alter column status type text using status::text;
drop type public.lead_status_enum;

create type public.lead_status_enum as enum (
  'New', 'Contacted', 'Site Visit Scheduled', 'Site Visit Done', 'Token Paid', 'Closed Won', 'Closed Lost'
);

alter table public.leads
  alter column status type public.lead_status_enum using status::public.lead_status_enum,
  alter column status set default 'New';
