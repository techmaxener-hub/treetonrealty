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

## Deferred, not forgotten

- `page_events` partitioning (monthly range on `created_at`) once volume
  justifies it — additive migration, not needed at zero brokers.
- Localities are broker-scoped, not a shared master list — duplicates SEO
  effort across brokers in the same micro-market; a shared
  `locality_master` table with per-broker overrides is a clean future
  addition.
