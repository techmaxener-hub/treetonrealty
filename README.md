# Realty Platform

Multi-tenant Website + CRM + Marketing Automation for real estate brokerages,
sold to brokers, not built for one client. Every broker-specific detail
(name, branding, contact info, listings, WhatsApp number, team) lives in
config/data — never hardcoded.

## Architecture: physical isolation per broker

Each broker gets their own Supabase project (own Postgres database) and
their own deployed frontend instance — a real separate website, CRM, and
automation engine, not row-level sharing in one database. Two codebases
make that maintainable at scale:

- **`control-plane/`** — the one shared project. Tracks which broker owns
  which Supabase project and deployment (`broker_instances`,
  `provisioning_jobs`), plus platform-team auth (`platform_admins`). Never
  stores a broker's leads, listings, or clients.
- **`tenant-template/`** — the website + CRM + automation codebase and
  schema, deployed identically into every broker's own project. This is
  the one piece of code shipped 200 times, so every fix and feature lands
  here once and fans out via the provisioning pipeline.

Full schema rationale, the role hierarchy, and the trade-offs behind each
structural decision are in `ARCHITECTURE.md`.

## Migrations

Additive only — never edit an already-applied migration. Both migration
sets under `*/supabase/migrations/` have been run end-to-end against a
local Postgres 16 instance (with `pgcrypto` + `ltree`) to confirm they
apply cleanly and the hierarchy/dedup triggers behave as designed.
