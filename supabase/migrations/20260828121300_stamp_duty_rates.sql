-- Stamp duty & registration rates by state. Deliberately data-driven (never hardcoded
-- in component code) because these change by government notification. Every seeded
-- row is marked is_verified = false -- see supabase/STAMP_DUTY_VERIFICATION.md and the
-- project README: these figures must be checked against current state notifications
-- by the client / a local legal advisor before this calculator goes live.
create table public.stamp_duty_rates (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  stamp_duty_percent numeric not null check (stamp_duty_percent >= 0),
  registration_percent numeric not null check (registration_percent >= 0),
  women_discount_percent numeric check (women_discount_percent is null or women_discount_percent >= 0),
  women_discount_notes text,
  effective_from date not null,
  source_notes text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stamp_duty_rates_state_idx on public.stamp_duty_rates (state) where is_active = true;

alter table public.stamp_duty_rates enable row level security;

create trigger set_stamp_duty_rates_updated_at
  before update on public.stamp_duty_rates
  for each row execute function public.set_updated_at();

-- Public read (the calculator is a public-site feature); only admins can edit rates.
create policy "stamp_duty_rates_select_public" on public.stamp_duty_rates
  for select using (is_active = true or public.is_staff());

create policy "stamp_duty_rates_insert_admin" on public.stamp_duty_rates
  for insert with check (public.is_admin());

create policy "stamp_duty_rates_update_admin" on public.stamp_duty_rates
  for update using (public.is_admin()) with check (public.is_admin());

create policy "stamp_duty_rates_delete_admin" on public.stamp_duty_rates
  for delete using (public.is_admin());

insert into public.stamp_duty_rates
  (state, stamp_duty_percent, registration_percent, women_discount_percent, women_discount_notes, effective_from, source_notes, is_verified)
values
  ('Gujarat', 4.9, 1.0, null, null, '2026-08-28',
   'UNVERIFIED placeholder. Gujarat commonly cited as ~4.9% stamp duty + 1% registration, no state-wide women''s discount as of last known notification. Confirm against the Gujarat Stamps Act / Sub-Registrar notification before launch.',
   false),
  ('Maharashtra', 5.0, 1.0, null, 'Historically a temporary 1% concession has been offered to women buyers in Maharashtra; not confirmed as currently active.', '2026-08-28',
   'UNVERIFIED placeholder. Maharashtra rates vary by municipal corporation / area (e.g. Mumbai vs. gram panchayat) and by a periodically-revised "Ready Reckoner" surcharge. A single flat rate is a simplification -- confirm per-city rates before launch.',
   false),
  ('Karnataka', 5.0, 1.0, null, null, '2026-08-28',
   'UNVERIFIED placeholder. Karnataka stamp duty is value-tiered (lower % below ~Rs 21L and ~Rs 45L slabs) -- this single row is a simplification for the >Rs 45L slab only. Add slab-specific rows and confirm against Karnataka Stamps Act before launch.',
   false),
  ('Delhi', 6.0, 1.0, 2.0, 'Female sole/co-owner: stamp duty commonly cited as 4% (i.e. a 2-point discount off the 6% male rate); joint male+female ownership often cited at 5%. Confirm exact joint-ownership treatment.', '2026-08-28',
   'UNVERIFIED placeholder. Confirm against Delhi government (Revenue Department) current notification before launch.',
   false),
  ('Uttar Pradesh', 7.0, 1.0, null, 'UP has historically offered a flat rupee-value rebate (not a percentage) for women buyers up to a property value cap, rather than a discounted percentage rate. Modeling this as women_discount_percent is a simplification -- revisit if UP is a priority market.', '2026-08-28',
   'UNVERIFIED placeholder minimum-rate figure. Confirm against UP Stamp & Registration Department notification before launch.',
   false);
