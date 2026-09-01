# Treeton Realty

**Your Trusted Real Estate Partner** — a real estate brokerage based in Bodakdev /
Ambli-Bopal, Ahmedabad, focused on residential and commercial properties (sales,
leasing, investments) across Western Ahmedabad's SG Highway, Bodakdev, Bopal, Ambli,
Thaltej, Satellite, South Bopal, Prahladnagar, and Vastrapur corridor.

Stack: Next.js 15 (App Router, RSC, TypeScript strict) · Tailwind CSS · shadcn/ui ·
Supabase (Postgres + RLS + Storage) · TanStack Query · Zustand.

## Why this approach, not a listings-portal clone

- **vs. ANAROCK / Knight Frank**: same institutional trust signals this site relies
  on — RERA badges with plain-English tooltips, structured legal documentation
  (title type, OC/CC status), transacted-value counters — but built on a lean
  Next.js/Supabase stack instead of a heavy enterprise CMS, so the page weight and
  load time stay far below what those sites ship.
- **vs. Housing.com / NoBroker / Square Yards**: no banner ads, no fake-listing
  clutter kept alive for SEO, no lead-gen form walls blocking content. Every CTA is
  a single deliberate action (WhatsApp deep link, phone call, or a short
  lead-capture dialog tied to a specific request like a site visit or brochure) —
  never a generic "sign up to see more" gate.
- **vs. India Sotheby's / The Agency**: matches the editorial typography and
  whitespace discipline of pure-luxury sites, but adds the India-specific
  functional depth those sites skip entirely — an area-unit converter across 8
  units (Sq.Ft/Sq.Yard/Guntha/Bigha/Acre/Cent/Marla/Sq.Meter), a stamp duty
  calculator with women-buyer concessions, and an EMI calculator with a full
  amortization schedule.
- **vs. Compass**: matches fast, map-driven search (locality/budget/type/BHK
  filters synced to the URL, so results are shareable and indexable, not hidden
  behind client-only state), but keeps the visual language warm and specific to
  Western Ahmedabad rather than generic and corporate.
- **Map choice**: Leaflet + OpenStreetMap tiles, not Mapbox or Google Maps. This
  needs no API key and no billing account to run the map view at all — a
  deliberate cost/complexity trade for a small brokerage's first site. Swapping in
  Mapbox/Google later only touches `components/property/properties-map.tsx`.

## Compliance placeholders — do not treat as real

The following are intentionally **not** filled in with real values, and the UI
shows honest "add this in admin settings" / "coming soon" states instead of
fabricating them:

- ~~**RERA broker registration number**~~ — set (`A031202602650`), live in the
  header/footer/About page.
- **Stamp duty rates** (`stamp_duty_rates` table) — every seeded row is marked
  `is_verified = false`. A 2026-08-29 research pass (see migration
  `20260829090000_stamp_duty_rate_research_pass.sql`) cross-checked each state's
  figures against multiple named secondary sources and corrected several real
  gaps (Maharashtra and UP were missing their women's-discount modeling
  entirely; Karnataka's registration fee had genuinely changed 1%→2% as of
  31 Aug 2025) — but this is still **not** a primary government-notification
  confirmation, and known simplifications remain: Karnataka's real value-tiered
  slabs, Maharashtra's area-tiered rates, and Gujarat's women's concession
  (a registration-fee waiver, which this schema can't represent as a
  stamp-duty-percent discount) are all called out in each row's `source_notes`.
  A local legal advisor must confirm against the live state notification before
  launch.
- **Area conversion factors** — Guntha/Acre/Cent/Sq.Meter are fixed, universal
  conversions. **Bigha and Marla vary by state/region.** The Marla figure
  (272.25 sq.ft, Punjab/Haryana/HP revenue standard) was confirmed against an
  Indian-specific reference distinct from Pakistan's differing Marla variants.
  The Bigha figure was corrected to 17,424 sq.ft, scoped specifically to
  North/Central Gujarat (Ahmedabad & Gandhinagar districts, this business's
  actual markets) — Gujarat has no single statewide Bigha, and South Gujarat
  uses a materially different ~23,958 sq.ft figure. Both are still
  research-grade (secondary sources), not a primary revenue-department
  confirmation — see `lib/area.ts` for citations.
- **Team bios** (`team_members` table) — seeded empty, and no fictional names,
  roles, or photos were invented. A full `/admin/team` management page exists
  (list, create, edit, publish/unpublish, delete, photo upload) so the client
  can add real staff themselves; the About page keeps its "profiles coming
  soon" state until someone does.
- **Logo** — no logo file exists yet beyond the current text wordmark
  ("Treeton Realty" in header/footer). Needs a real logo asset from the
  client before launch; wire-in point is `components/layout/header.tsx` and
  `components/layout/footer.tsx`.
- **WhatsApp Business number** (`site_settings.whatsapp_number`) — not yet
  set. Every WhatsApp CTA on the PDP (`components/property/broker-contact.tsx`)
  is disabled/hidden until this is filled in.
- ~~**No admin UI for `site_settings`**~~ — built: `/admin/settings`
  (admin-only, gated both in the nav and by the existing
  `site_settings_update_admin` RLS policy) covers WhatsApp number, RERA
  number, company contact/address, Google Maps embed, social links, and the
  homepage trust-counter stats.
- **GST treatment** in the PDP cost-breakdown sheet (`lib/gst.ts`) is a simplified
  flat-rate model (5% under-construction residential, 12% commercial, 0% ready
  resale). A 2026-08-29 research pass confirmed these specific rates are current
  and were unaffected by the September 2025 "GST 2.0" reform (which touched
  construction materials/works contracts, not buyer-facing property rates) — but
  the model still doesn't implement the 1% affordable-housing carve-out (carpet
  area ≤ 90 sqm here, since Ahmedabad/Gandhinagar aren't GST-defined metros, and
  price ≤ ₹45L), which structurally can't occur in this business's current
  inventory but would matter if a lower-priced listing is ever added. Real
  GST/ITC/abatement rules are more nuanced still, and this needs a tax advisor's
  sign-off before being presented as final to a buyer.

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run test    # vitest, currently 55 unit tests over lib/*
npm run lint
```

Requires `.env.local` (see `.env.local.example`) with a Supabase project's URL,
anon key, and service-role key. Schema + RLS policies live in
`supabase/migrations/`; demo/seed data (clearly not real inventory) lives in
`supabase/seed.sql`.

**Windows-specific**: if `next build`/`next dev` hangs or times out on a Supabase
call, this network's Node/undici prefers IPv6 and stalls against Supabase's
Cloudflare-fronted hosts — already worked around via
`NODE_OPTIONS=--dns-result-order=ipv4first` in the npm scripts, but worth knowing
if you ever run these commands directly instead of through `npm run`.

## End-to-end tests (Playwright)

```bash
npx playwright install chromium   # one-time browser install
npm run dev                       # separate terminal, real dev server
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

Six specs in `e2e/`, run against the **real** Supabase project in `.env.local`
(never mocked) — each creates and tears down its own throwaway fixtures via
the service-role key, tagged `E2E TEST FIXTURE` in descriptions where
applicable:

- `public-search-to-whatsapp.spec.ts` — locality filter → PDP → WhatsApp link
- `brochure-download-lead.spec.ts` — form submit → signed URL → lead created
- `site-visit-booking.spec.ts` — form submit → confirmation → lead + site_visit rows
- `admin-create-publish-listing.spec.ts` — login → create → publish → public visibility
- `admin-lead-kanban-drag.spec.ts` — drag-and-drop → status persisted
- `rls-boundary.spec.ts` — API-only: a Broker cannot read another Broker's
  lead; an unrelated Broker cannot read a Sub-Broker's `commission_percent`

⚠️ Never point `PLAYWRIGHT_BASE_URL`/`.env.local` at a production Supabase
project — these tests write real rows (even though they clean up after
themselves) and log in as newly-created throwaway admin/broker accounts.

## RLS re-verification status

Writing the RLS boundary tests above surfaced one real gap: `profiles` only
had a self-or-admin select policy (no "self or downline" policy like
`leads`/`site_visits` have), which meant a Team Lead/Broker viewing a lead
assigned to their downline would see the lead but the joined
`assigned_profile:profiles(full_name)` came back `null` — the Kanban card
showed "Unassigned" for a lead that WAS assigned. Fixed in
`supabase/migrations/20260829100000_profiles_select_self_or_downline.sql`.

**This migration has NOT been applied to the live Supabase project** — the
Supabase CLI in the environment that wrote it is authenticated to a
different account than `leeksduuapufssuhykoq`, so `supabase db push` wasn't
possible from there. Apply it manually (Dashboard → SQL Editor, paste the
migration's contents) or from an environment with proper CLI access before
relying on downline visibility in the Kanban board.

Every other RLS policy in `supabase/migrations/` was read through as part of
this pass (role hierarchy, listings/leads/site_visits downline scoping,
storage bucket policies) with no other gaps found — see each migration file
for the reasoning behind its specific policy.

## Deployment (Vercel + Supabase)

Not yet deployed — this section is prep only, so the actual go-live is a
deliberate separate step, not something to run blind from these notes.

**Environment variables** (see `.env.local.example` for the full list with
descriptions): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. Set all three in Vercel's Project Settings →
Environment Variables — the service role key must **never** be prefixed
`NEXT_PUBLIC_` or it ships to the browser bundle (see the comment in
`.env.local.example`).

**Before going live**:
1. Decide whether production uses a *new* Supabase project or promotes the
   current one (`leeksduuapufssuhykoq`) — if new, re-run every migration in
   `supabase/migrations/` in order (`supabase db push` from a properly
   linked CLI session) and re-seed only what's real (not `seed.sql`'s demo
   listings).
2. Apply the pending `20260829100000_profiles_select_self_or_downline.sql`
   migration (see above) if it hasn't been already.
3. Fill in the remaining compliance placeholders this README tracks (RERA ✅
   done, team bios, WhatsApp number, logo, GST tax-advisor sign-off,
   stamp-duty legal-advisor confirmation).
4. Run `npm run build` and `npm run test:e2e` against whatever Supabase
   project production will actually use, not just local.
5. Connect the Vercel project to this GitHub repo (`v2-luxury-frontend` is
   the default branch), set the environment variables above, deploy.
