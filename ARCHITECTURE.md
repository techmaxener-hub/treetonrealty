# Architecture decisions — Step 1 (schema)

Confirmed decisions this build proceeds from. Update this file when a
decision changes; don't re-derive it from chat history each session.

## Tenancy: physical isolation, two codebases

Every broker gets their own Supabase project + own deployed app instance.
- `control-plane/` (shared, one project): `broker_instances`,
  `provisioning_jobs`, `platform_admins`. Only place that references more
  than one broker.
- `tenant-template/` (one schema + one codebase, deployed per broker): the
  21-table CRM/website/automation schema. No `broker_id` anywhere in it —
  the project itself is the tenant boundary.

**This only stays maintainable if the tenant app is never hand-forked per
broker.** One migration set, one codebase, parameterized by env vars
(that broker's Supabase URL/keys, WhatsApp/email provider credentials,
branding). Schema/feature changes fan out to existing brokers through the
`provisioning_jobs` pipeline, not manual per-project edits.

Noted, not yet designed: a future "many codebases, one database" hybrid
for per-broker UI/theming. Different tenancy model — needs its own
proposal when that becomes a real requirement.

"Broker" names two different things on purpose: `broker_profile` /
`broker_instances` mean the brokerage (the tenant). `profiles.role =
'broker'` means the person — the principal at the top of that tenant's
reporting tree. Unrelated tables, no actual collision, but call it out in
review since it reads ambiguously otherwise.

## Role hierarchy (`profiles` table)

Four ranked tiers, `profiles.role`: `broker → employee → master_advisor →
advisor`. `advisor` is the only tier allowed to report to its own tier
(unlimited chained depth — sub-broker referral chains).

`reports_to_id` (self-FK) always points to the nearest *actual* upline,
which may skip a tier when that tier is empty on a branch:
- No employees at all → every master_advisor reports directly to the
  broker.
- One employee, several master_advisors → each master_advisor reports to
  that employee.

Enforced by `profiles_validate_reports_to()` (rank must be flat-or-up,
same-tier only for `advisor`) and a partial unique index limiting the
brokerage to exactly one `role = 'broker'` row.

`hierarchy_path` (generated `ltree`, GiST-indexed) materializes the
ancestor chain so "is this row in my downline" is one indexed `<@` lookup
instead of a recursive query. Maintained by trigger on insert and on
re-parent (`reports_to_id` change cascades to every existing descendant
in one `UPDATE`). Chosen over a closure table — no second table to keep
consistent, `ltree` ships as a core Postgres extension.

Lead/listing/deal assignment has **no role restriction** — broker,
employee, master_advisor, and advisor can all be assigned work.

**Correction made in Step 3:** `listings.advisor_id`, `leads.assigned_advisor_id`,
and `deals.primary_advisor_id` originally referenced `advisor_profiles(id)`
— the *optional public bio page* table. That made anyone without a public
profile (a broker, an ops-focused employee) structurally unassignable,
contradicting the "no restriction" rule above. Migration `0003` re-points
all three at `profiles(id)` directly, since every team member has one.
`testimonials.advisor_id` was left pointing at `advisor_profiles` — a
testimonial is public attribution, which genuinely belongs there.

**RLS + `RETURNING` gotcha, found while testing Step 3:** Postgres
enforces a table's `SELECT` policies on the row returned by `INSERT ...
RETURNING` (and `UPDATE ... RETURNING`), not just the `WITH CHECK`
expression. A master_advisor/advisor inserting a brand-new `contacts` row
with no lead/deal linking it to them yet fails on `RETURNING` — the row
passes `WITH CHECK (true)` but isn't yet visible under `contact_in_scope()`.
Confirmed this empirically against a real Postgres instance: the same
`INSERT` succeeds without `RETURNING`, and succeeds with it once the row
is broker/employee-created (`contact_in_scope()` short-circuits for
`is_broker_or_employee()`) or already linked to a lead in the inserter's
downline. Two consequences, both already reflected in the schema/UI:
- The public lead-capture path (`submit_lead`) was already
  `security definer` and returns a scalar id, not a selected row — never
  affected.
- In the CRM, standalone "Add Contact" (not attached to a lead) is a
  broker/employee action only. Advisors and master_advisors create
  contacts implicitly by creating a lead (also via `submit_lead`, called
  from the authenticated app, not just the public site) — which links
  the contact to them in the same transaction, so it's visible
  immediately after.

## Auth & RLS (implemented Step 2)

`profiles` rows are never created by the client — `handle_new_user()`
(trigger on `auth.users`, `security definer`) reads `role` /
`reports_to_id` / `full_name` out of the invite's `user_metadata` and
inserts the row. Whoever calls `supabase.auth.admin.inviteUserByEmail`
sets that metadata; there is no public self-signup path in the tenant
project. Self-service profile edits are allowed (`id = auth.uid()`) but
a trigger (`profiles_restrict_self_edit`) blocks anyone but the broker
from changing their own `role` or `reports_to_id` — RLS alone can't
express a column-level restriction, so this is enforced separately.

Policy shape: `role = 'broker'` sees/writes everything. Everyone else
sees themself + downline (`hierarchy_path <@`, via the
`in_own_downline()` / `advisor_in_own_downline()` helpers), read-only on
the downline — writes stay scoped to what they directly own.
`listing_internal`, `listing_owners`, and `deals`/`deal_documents` have
no `anon` policy at all, so they're unreachable from the public site
regardless of row content. **Unassigned leads are visible to the whole
internal team, not gated to broker/employee** — a deliberate call so any
available advisor can pick up a fresh inbound lead rather than it sitting
until someone triages it; revisit if that turns out to encourage
lead-sniping over fair distribution.

The public site never gets direct `INSERT` policies on `contacts`,
`leads`, `page_events`, or `saved_searches` — a public form stuffing
arbitrary columns or bypassing dedup is worse than the extra hop. Instead
three `security definer` RPCs (`submit_lead`, `log_page_event`,
`create_saved_search`) are the entire public write surface, each with a
narrow, typed parameter list, granted to `anon`.

All of the above — the hierarchy triggers, the RLS boundaries, the
self-edit guard, the dedup-reusing RPC — were exercised against a local
Postgres instance with simulated `anon`/`authenticated` roles before
being committed, not just reviewed by eye.

## Multi-language content

Inline `jsonb` per field (`{"en": "...", "hi": "...", "gu": "..."}`), not
a separate translations table. Simplest at three languages with no
translator-review workflow; mechanically reversible later if that
workflow shows up.

## Contact dedup

Soft-flag only. `normalized_phone` (generated: last 10 digits after
stripping non-digits) plus an `AFTER INSERT` trigger that sets
`potential_duplicate_of` on match. No hard unique constraint — Indian
phone entry varies too much (+91, leading 0, spacing) for that to be
safe without false rejections.

## Tenant app stack (Step 3)

`tenant-template/` is a single Next.js (App Router) app serving both the
CRM (`/crm/*`, behind auth middleware) and, from Step 6 on, the public
site — one deployment per broker, matching the physical-isolation model
above, rather than two separate frontends per broker. UI primitives are
hand-written shadcn/ui source (Radix + Tailwind), not an installed
component package — normal for shadcn, keeps every component editable
in-repo.

**Version pin worth knowing:** `@supabase/ssr` versions before `~0.10`
declare `createBrowserClient`/`createServerClient` against an older
`SupabaseClient` generic signature than current `@supabase/supabase-js`
(2.100+) uses — pinning an old `@supabase/ssr` produces a client whose
type collapses every row to `never` app-wide, which looks exactly like a
broken `Database` type and is not. Fixed by bumping `@supabase/ssr` to
`^0.12.3`. Data-layer functions take a `TypedSupabaseClient` (derived
from `ReturnType<typeof createBrowserClient<Database>>` in
`lib/supabase/types.ts`) rather than a hand-written `SupabaseClient<Database>`
annotation, which sidesteps this class of mismatch even if the versions
drift again later.

The hand-written `Database` type (`lib/types/database.ts`) has no live
Supabase project to generate from yet — regenerate via the CLI once one
exists, and diff against this file rather than trusting it blindly.

## Deferred, not forgotten

- `page_events` partitioning (monthly range on `created_at`) once volume
  justifies it — additive migration, not needed at zero brokers.
- Localities are broker-scoped, not a shared master list — duplicates SEO
  effort across brokers in the same micro-market; a shared
  `locality_master` table with per-broker overrides is a clean future
  addition.

## Step 4 findings

**RLS `UPDATE` bug: unassigned rows were unclaimable.** `USING` on an
`UPDATE` policy checks the row's *current* (pre-update) values, not the
new ones. `listings_update` and `leads_update` both gated on
`in_own_downline(<current> advisor_id)` with no carve-out for a null
assignee — since `in_own_downline(null)` is false for everyone but the
broker, nobody except the broker could ever self-claim an unassigned
lead or listing, even though both are deliberately shown to the whole
team as a shared pool (`leads_select` already has the `is null` carve-out
— `leads_update`/`listings_update` didn't). Fixed in migration `0005`,
re-verified: an advisor can now claim an unassigned row, and still can't
reassign one someone else already owns.

**Storage: `listing-media` bucket is public.** Supabase serves
public-bucket objects through an unauthenticated CDN path that does not
re-check RLS, so a draft (unpublished) listing's photos are reachable by
anyone with the exact `{listing_id}/...` path — not linked anywhere,
not enumerable, but not cryptographically private either. Chosen over
signed URLs to avoid refresh-token complexity in the public site (Step
6), on the judgment that photos are low-sensitivity. The RLS on
`storage.objects` still governs every write regardless of the bucket's
public flag, and still governs reads through Storage's
authenticated/signed-URL paths if those are used instead of the public
one. Verified against a faithful stub of Supabase's real `storage`
schema (not just reviewed by eye) since the genuine `storage` schema
only exists inside an actual Supabase project.

**Every `listings` row gets a matching `listing_internal` row at
creation** (trigger, `security definer`), even with every field null.
Without this, "no row" and "not authorized to see the row" were
indistinguishable from the client, which the CRM needs to decide
whether to show the Internal tab at all vs. show it empty.

## Step 5 findings

**`deal-documents` bucket is private**, unlike `listing-media`. Every
read goes through `createSignedUrl` (60s expiry), not `getPublicUrl` —
agreements and KYC scans don't get the same "reachable if you guess the
path" trade-off photos got in Step 4. Verified against the same storage
schema stub used in Step 4: anon gets zero access to this bucket at all,
internal reads/writes follow the same broker/downline rule
`deal_documents` already enforces at the table level.

`deals` didn't inherit the Step 4 "unassigned row" bug — `primary_advisor_id`
is `not null` at insert, so there's no null state for `in_own_downline()`
to mishandle the way `advisor_id`/`assigned_advisor_id` could.

Deal creation is reachable two ways: standalone from `/crm/deals` (search
listing + buyer, pick primary advisor), or as "Create Deal" from a lead
that already has a linked listing and contact — prefills listing, buyer,
and advisor from the lead so a lead reaching negotiation doesn't mean
re-entering data that already exists.

## Step 6 findings

**Public pages needed advisor names; `profiles.full_name` isn't public,
on purpose.** Building the Team page surfaced a real gap: `advisor_profiles`
(the table designed for public content back in Step 1) never actually
carried a name field, so every join for public display would have had
to reach into `profiles` — which correctly has no `anon` policy at all.
Fixed in `0008` by adding `advisor_profiles.display_name` directly,
rather than opening `profiles` up. Verified against the storage/RLS stub:
anon gets zero rows from `profiles.full_name`, and reads
`advisor_profiles.display_name` fine. This also meant there was no CRM
screen to populate `advisor_profiles` at all — added a minimal
`/crm/team` page (self-service for your own public profile, broker can
edit anyone's) so the public site has somewhere its content actually
comes from, not just a schema with nothing to read.

**`advisor-photos` bucket is public**, same call as `listing-media` in
Step 4 and for the same reason — a headshot on the table explicitly
built for public marketing content isn't worth signed-URL complexity.
Write access is scoped to `{profile_id}/...` matching `auth.uid()`, or
the broker.

**Multi-language is client-side-reactive, not locale-routed.** All three
language variants come back in the same `jsonb` fetch (one request,
whichever page), and a `LanguageProvider` context picks which key to
render — toggling is instant, no refetch. This is a deliberate scope cut
from "true" i18n routing (`/hi/...` paths with per-locale SSR, which
would give each language its own indexable URL and meta tags): the
toggle works and content is correct per language, but a search engine
crawling once only sees whichever language rendered for that request.
Worth revisiting if a broker's Hindi/Gujarati SEO becomes a priority
rather than the toggle being a usability nice-to-have.

**`force-dynamic` pages are never executed by `next build`** — it only
type-checks and bundles them; the actual Server Component data-fetching
code doesn't run until a real request hits the route. Confirmed via
`next dev` against a placeholder Supabase URL: `/login` and `/compare`
(empty-state path, no DB call) return 200, `/crm` redirects correctly
through middleware with no session, and `/` fails with a clean
`ENOTFOUND` from the fetch layer — the expected failure mode with no
real backend, not a code defect, but the kind of thing `tsc`/`eslint`/
`next build` alone would never have caught either way.

**Deferred, matching the brief's own "optional":** the Blog/Insights
page. Also deferred: an actual Instagram feed embed (Instagram's embed
SDK is a separate integration surface) — the footer links out to the
broker's Instagram instead of embedding a live feed.
