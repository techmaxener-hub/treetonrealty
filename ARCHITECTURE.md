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

## Step 7 — lead-capture-to-CRM pipeline

**WhatsApp clicks now create real leads, not just page_events.** A raw
click carries no identity — nothing about it says who's asking — so
"log it as a lead source" only means something if the click captures a
name and phone first. `WhatsAppButton` now opens a two-field prompt
before handing off to WhatsApp: submitting calls `submit_lead` with
`source: 'whatsapp_click'` and opens the chat; a "Skip, just open
WhatsApp" link stays one tap away and still logs the `page_event` for
retargeting, for anyone who'd rather not. This is a lead-capture prompt,
not a gate on reaching the business — deliberately not a dark pattern.

**First-touch UTM attribution**, not last-touch: a campaign link's
`utm_source`/`utm_campaign` only lives on the URL of whichever page it
landed on, and client-side navigation drops query params the moment the
visitor clicks anywhere else. `captureAttributionOnce()` grabs it into
`sessionStorage` on first load and never overwrites it, so "how they
found us" survives all the way to wherever they actually submit — the
contact form or a WhatsApp click, possibly pages later. `resolveLeadSource()`
maps a handful of known `utm_source` values (instagram, google, 99acres,
etc.) onto the existing `lead_source` enum where there's an honest match,
so a bio-link campaign shows up as an Instagram lead in the pipeline
instead of a generic "website form" one — falling back to the
channel-appropriate default otherwise. Surfaced `campaign`/`source_detail`
on the CRM lead detail page too; tracking nobody in the CRM can see isn't
tracking.

**Returning-visitor prefill** (name/phone in `localStorage`) on both the
contact form and the WhatsApp prompt — someone who already left their
number once shouldn't have to retype it for a second enquiry in the same
browser.

**Explicitly not this step:** auto-assignment, instant WhatsApp/email
acknowledgment to the lead, and agent notification — the brief scopes
those under the automation engine (Step 8), which is also where the real
WhatsApp Business API / email provider credentials get wired in as
placeholders. This step only had to make sure a lead reliably lands in
the CRM, correctly attributed; what happens automatically after that is
Step 8's job.

## Step 8 — automation engine

**Why Postgres can only enqueue, never send.** Making an outbound HTTP
call from inside Postgres needs `pg_net` — a Supabase-specific extension,
hard to exercise in a plain local Postgres test harness, and a step
further from "just SQL" than anything used so far. So the split is:
triggers and scheduled scan functions only ever `insert into
automation_logs (..., status => 'pending')` via a shared
`enqueue_automation()` helper; a Next.js Route Handler
(`/api/cron/automation`), invoked on a schedule, is what actually reads
pending rows and sends. This keeps 100% of the "when does this fire"
logic in the database (where the rest of the domain logic already lives)
while keeping "how does a message actually go out" in application code
where a provider SDK belongs.

**Event-driven vs. time-scanned triggers.** Five triggers are true
database triggers — `new_lead` (AFTER INSERT on `leads`), `post_site_visit`
(AFTER INSERT on `activity_log` where `activity_type = 'site_visit'`),
`price_drop_status_change` and `new_listing_match` (AFTER UPDATE on
`listings`), and `post_closing` (folded into the existing
`update_deal_stage` RPC when `stage = 'closed'`) — because each has a row
change to hang off of. The other four — `no_response_sla`,
`drip_sequence`, `birthday_anniversary`, `abandoned_browse` — depend on
*how much time has passed*, which no trigger can express, so they're scan
functions (`scan_no_response_sla()` etc.) that the same cron endpoint
calls before dispatching. `run_automation_scans()` wraps all four and
returns a per-scan count. Every scan is idempotent by construction: each
checks `automation_logs` for an existing row (or a recent-window check
where there's no natural dedup key, e.g. abandoned_browse) before
inserting, so re-running the scan — which the cron does every 15 minutes
— never double-enqueues.

**Provider abstraction with a dry-run fallback.** `sendWhatsAppMessage()`
and `sendEmail()` (`src/lib/automation/providers/`) both check for
provider env vars first and, if unset, log to the console and report
success instead of failing. This is what makes the whole pipeline —
queueing, templating, per-channel routing, retries via re-scan, CRM-visible
status — fully exercisable before a broker hands over real WhatsApp
Business API or SMTP credentials, which per the brief are exactly the
values that should stay placeholders. `WHATSAPP_PROVIDER` selects between
`meta_cloud` (official Graph API) and `generic_webhook` (a configurable
POST endpoint, for providers like Interakt/Gupshup whose send-message call
is a simple POST); SMTP is the only email path, since it works with any
provider without picking a vendor SDK.

**`{{variable}}` templates, not a templating engine.** `notification_templates.body`
is multi-language `jsonb` (`{en, hi, gu}`), rendered per broker's
`default_language` via a deliberately dumb `renderTemplate()` — plain
`{{key}}` substitution, no conditionals or loops. Template copy is
broker-editable free text (via the new `/crm/automation` settings page),
and a more powerful templating language would be a bigger footgun for
non-technical editing than a real feature.

**Abandoned-browse retargeting is two different things wearing one name.**
The brief's "abandoned-browse retargeting (WhatsApp widget + email if
captured)" is genuinely two mechanisms with different data sources:
- *Client-side widget* (`AbandonedBrowsePrompt` + `use-abandoned-browse`
  hook): reads this browser's own `localStorage` view history in real
  time and can prompt a WhatsApp chat for someone who has **never**
  submitted any form — there's no contact_id to look up yet.
- *Server-side scan* (`scan_abandoned_browse()` +
  `abandoned_browse_retarget_email` template): reads `page_events` grouped
  by `contact_id` and sends email — it can only fire once a visitor has
  identified themselves at least once (`submit_lead`/`create_saved_search`),
  because that's the only point `page_events.contact_id` gets backfilled
  (via the new `p_visitor_id` parameter on both RPCs).

Both read the same underlying signal (`listing_view` page_events) but
can't be merged into one code path — one has no `contact_id` yet by
definition, the other has no synchronous access to `localStorage`.

**`getVisitorId()` now threads all the way through.** `submit_lead` and
`create_saved_search` gained an optional `p_visitor_id` parameter that
backfills any of that visitor's anonymous `page_events` rows with the
newly-created/matched `contact_id`. `ContactForm`, `WhatsAppButton`, and
`SavedSearchForm` all now pass it. A new `ListingViewTracker` (mounted on
the listing detail page) is what actually produces the `listing_view`
events being backfilled — Step 7 only ever logged `whatsapp_click`.

**Bug caught by the local test harness:** `make_interval(hours => numeric)`
doesn't exist — the `hours` parameter is typed `int`, and the SLA/window
config values come out of `jsonb` as `numeric` via `::numeric`. Needed an
explicit `::int` cast in both `scan_no_response_sla` and
`scan_abandoned_browse`. Caught by the same local-Postgres trigger/scan
test suite used every step so far; re-verified end to end afterward,
including re-running `run_automation_scans()` twice back to back to
confirm zero duplicate enqueues.

**Automation config lives in the database, not code** — the CRM's new
`/crm/automation` page (broker/employee only, gated by the same
`automation_rules_all`/`notification_templates_all` RLS policies as
everywhere else) lets a broker toggle any trigger on/off, retune SLA
hours / drip day offsets / abandoned-browse thresholds, and rewrite
message copy per language — all without a migration. Nine rules and
twelve templates ship as real, active defaults (migration `0010`),
not stubs; "wire every workflow" only means something if there's live
copy to send on day one.

## Step 9 — reporting & analytics dashboards

**Report functions do no access-control work of their own — they just
reshape rows RLS already scoped.** All ten `report_*` functions
(migration `0011`) are plain `language sql` functions with no `security
definer`, i.e. `SECURITY INVOKER` (Postgres's default): each runs as the
calling user, so a `select ... from leads group by stage` inside one of
them is filtered by exactly the same RLS policies that already govern the
lead pipeline, deal board, and listings pages. No new visibility rule
exists anywhere in this migration. That's what makes `report_team_performance`
degrade correctly by role without an if/else anywhere: a broker/employee's
`profiles` + `leads` + `deals` reads are unrestricted, so the table shows
the whole org; a master_advisor's reads are downline-scoped, so the same
query rolls up just their downline; a leaf advisor's downline is only
themselves, so the same query reads as "my performance." Three functions
naturally return empty for anyone who isn't broker/employee —
`report_top_viewed_listings` (`page_events` is broker/employee-only, see
0002) and `report_automation_summary` (`automation_rules`/`automation_logs`
likewise) — and the dashboard just hides those cards when empty rather
than treating that as an error, same pattern as the automation settings
page from Step 8.

**Revenue/commission is attributed to `deals.primary_advisor_id` only.**
`commission_split` can divide a deal's payout across multiple advisors
(e.g. a referring sub-broker up the chain), but summing split shares
per-advisor across every deal they appear in — as either primary or
split recipient — is a materially different, heavier report. This one
matches what the existing deal pipeline UI already shows per deal, not a
new decision.

**Correction while testing:** `report_team_performance`'s first draft
joined `leads`/`deals` through `advisor_profiles` (`ap.id = l.assigned_advisor_id`)
by copying the join shape from the Step 2 RLS helpers — but migration
`0003` (Step 3) already repointed `listings.advisor_id` /
`leads.assigned_advisor_id` / `deals.primary_advisor_id` straight at
`profiles(id)`, specifically so any team member is assignable, not just
ones with a public advisor bio. The stale join wasn't just redundant, it
was wrong (silently dropped every advisor without an `advisor_profiles`
row). Caught immediately by the local test harness — seeding a listing
with that FK failed outright — fixed by joining `leads`/`deals` on
`profiles(id)` directly.

**Local test harness gained a role-hierarchy fixture.** Earlier steps'
harnesses seeded just enough rows to exercise one feature; this step
needed a real org (broker → employee → master_advisor → advisor, plus a
second, disjoint master_advisor/advisor branch) to prove downline
scoping actually isolates siblings, not just parent/child. Also needed
two additions to the harness itself, now worth keeping for future steps:
`auth.users.raw_user_meta_data` (the real `handle_new_user()` trigger
reads it to create each seeded profile — inserting into `profiles`
directly and bypassing the trigger had been masking the FK issue above),
and explicit `grant select/insert/update/delete ... to anon, authenticated`
on the public schema (a real Supabase project pre-grants this at the
platform level; a from-scratch local Postgres cluster doesn't, so RLS
alone isn't testable without also replicating the grant).

**Charts are hand-rolled divs, not a charting library.** `ReportBarList`
(horizontal, width-proportional) and `ReportTimeSeries` (vertical bars,
height-proportional) are the entire charting surface — no new dependency,
consistent with how the rest of the CRM avoids pulling in UI libraries
beyond Radix primitives + Tailwind. Sufficient for funnels, breakdowns,
and short time series; a broker who wants richer visualization has
outgrown what a from-scratch template should opinionatedly ship anyway.

**`/crm` is now the dashboard**, not a redirect to `/crm/leads` — Leads
keeps its own sidebar entry. The sidebar's active-link check needed an
`exact` flag for this one item specifically, since every other CRM route
also starts with `/crm` and would otherwise highlight alongside it.
