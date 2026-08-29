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

- **RERA broker registration number** (`site_settings.rera_broker_reg_no`) — shown
  in the header and footer once set; displays a placeholder prompt until then.
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
- **Team bios** (`team_members` table) — seeded empty. No fictional names, roles,
  or photos were invented; the About page shows a "profiles coming soon" state
  until real team members are added.
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
