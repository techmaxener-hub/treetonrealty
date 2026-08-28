-- In-app notifications for staff (lead assigned, stale-lead escalation, site-visit
-- reminder). Phase 2.2 also asks for WhatsApp/SMS/email dispatch on these events --
-- that requires a real WhatsApp Business API account (Meta-approved templates) or
-- SMS/email provider credentials, neither of which exist yet. This table is the
-- channel-independent record of "this needs to notify someone"; the in-app CRM
-- reads it directly, and lib/server/notify.ts is where a real WhatsApp/SMS/email
-- send would be layered in once credentials are configured (see its comments).
create type public.notification_type_enum as enum (
  'lead_assigned', 'stale_lead', 'site_visit_reminder', 'site_visit_confirmed'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type_enum not null,
  title text not null,
  body text not null,
  related_lead_id uuid references public.leads (id) on delete cascade,
  related_site_visit_id uuid references public.site_visits (id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, is_read, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own_or_admin" on public.notifications
  for select using (recipient_id = auth.uid() or public.is_admin());

create policy "notifications_update_own" on public.notifications
  for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- No public/staff insert policy: notifications are only ever created by the
-- security-definer trigger functions below (bypass RLS) or the service role.
