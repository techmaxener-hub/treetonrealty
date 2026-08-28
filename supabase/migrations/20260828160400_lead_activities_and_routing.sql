-- Phase 3.3: each lead card's "activity timeline (calls logged, WhatsApp messages,
-- notes, site-visit history)". status_change entries are written automatically by
-- the Kanban drag-and-drop handler; the rest are logged by staff or by the
-- automation triggers in Phase 2.2.
create type public.lead_activity_type_enum as enum (
  'call', 'whatsapp', 'note', 'status_change', 'site_visit', 'email'
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  activity_type public.lead_activity_type_enum not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index lead_activities_lead_idx on public.lead_activities (lead_id, created_at desc);

alter table public.lead_activities enable row level security;

-- Visible/writable by whoever can see/update the parent lead (own + downline, or
-- Admin/Team Lead for unassigned leads) -- re-derives the same rule via a lookup
-- rather than duplicating assigned_to on this table too.
create policy "lead_activities_select_via_lead" on public.lead_activities
  for select using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.is_admin()
          or (l.assigned_to is not null and public.is_self_or_downline(l.assigned_to))
          or (l.assigned_to is null and public.is_admin_or_team_lead())
        )
    )
  );

create policy "lead_activities_insert_via_lead" on public.lead_activities
  for insert with check (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.is_admin()
          or (l.assigned_to is not null and public.is_self_or_downline(l.assigned_to))
          or (l.assigned_to is null and public.is_admin_or_team_lead())
        )
    )
  );

create policy "lead_activities_delete_admin" on public.lead_activities
  for delete using (public.is_admin());

-- Phase 2.2/3.3: the routing rule an Admin/Team Lead configures, applied by the
-- on-insert assignment trigger. Singleton row, same pattern as site_settings.
create table public.lead_routing_settings (
  id boolean primary key default true,
  constraint lead_routing_settings_singleton check (id),
  mode text not null default 'manual' check (mode in ('round_robin', 'locality_based', 'manual')),
  last_assigned_broker_id uuid references public.profiles (id) on delete set null,
  stale_lead_hours integer not null default 4,
  updated_at timestamptz not null default now()
);

insert into public.lead_routing_settings (id) values (true);

alter table public.lead_routing_settings enable row level security;

create policy "lead_routing_settings_select_staff" on public.lead_routing_settings
  for select using (public.is_staff());

create policy "lead_routing_settings_update_admin_or_team_lead" on public.lead_routing_settings
  for update using (public.is_admin_or_team_lead()) with check (public.is_admin_or_team_lead());

create trigger set_lead_routing_settings_updated_at
  before update on public.lead_routing_settings
  for each row execute function public.set_updated_at();
