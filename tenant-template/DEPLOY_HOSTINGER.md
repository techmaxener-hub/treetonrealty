# Deploying to Hostinger (Node.js app hosting)

This app was designed for Vercel (`vercel.json` configures its cron job),
but it runs fine as a plain Node.js server too — that's what
`output: "standalone"` in `next.config.ts` is for. `next build` produces
`.next/standalone/server.js`, a self-contained Node server with its own
pruned `node_modules`; a `postbuild` script copies `public/` and
`.next/static/` into it so it can serve its own static assets (Vercel
normally serves those from its CDN instead, so self-hosting needs its
own copies). This is the file Hostinger will run directly.

Two things this guide does NOT cover, because they need to happen before
any of this: **all 12 migrations must already be applied to your Supabase
project** (Supabase dashboard → SQL Editor → run each file in
`supabase/migrations/` in order, 0001 through 0012), and you need that
project's URL + anon key + service role key in hand.

## 1. Push this branch to your own GitHub remote (if not already there)

Hostinger's Git deploy pulls from a repo you point it at. If you're
deploying from a fork or a different remote than this session's, push
there first.

## 2. Create the Node.js app in hPanel

In hPanel: **Websites → [your domain] → Node.js** (or **Advanced → Node.js**,
wording varies by plan) → **Create Application**.

- **Node.js version**: 18 or newer (this app needs Node ≥18 for Next 15).
- **Application root**: a folder under your domain, e.g. `tenant-template`
  — this is where the repo's `tenant-template/` directory contents go.
  If Hostinger's Git deploy pulls the whole repo (both `tenant-template/`
  and `control-plane/`), set the application root to the `tenant-template`
  subfolder specifically, not the repo root.
- **Application startup file**: `.next/standalone/server.js`
- **Application URL**: your domain (or subdomain, if you're only pointing
  part of it here).

If hPanel offers a Git-based deploy source, point it at this repo/branch
and the `tenant-template` subfolder. Otherwise, upload the folder's
contents via File Manager or SFTP.

## 3. Set environment variables

In the same Node.js app screen there's an **Environment variables**
section. Set:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service role key (Project Settings → API — keep this secret) |
| `CRON_SECRET` | any long random string — you'll reuse it in step 5 |
| `NODE_ENV` | `production` |

Leave `WHATSAPP_*` / `SMTP_*` unset for now — the automation engine
dry-runs (logs instead of sending) until you have real provider
credentials. Add them here later the same way.

Don't set `PORT` — Hostinger's Node.js hosting assigns this itself and
the standalone server already reads `process.env.PORT`.

## 4. Install dependencies and build

Hostinger's Node.js app screen usually has an **NPM Install** button —
use it once first (installs from `package.json`). Then build. If there's
a **Run script** / terminal option, run:

```
npm install
npm run build
```

`npm run build` runs `next build` and then the `postbuild` script
automatically — you should NOT need a separate step for the standalone
copy. Restart the app from hPanel after this finishes so it picks up the
new build.

If your plan includes SSH (Business and above usually do), this is more
reliable than the file manager/UI buttons:

```bash
ssh <your-hostinger-ssh-user>@<your-server>
cd domains/<yourdomain>/tenant-template   # or wherever the app root is
npm install
npm run build
```

Then restart the app from hPanel (or `touch tmp/restart.txt` if your
plan uses Passenger's restart-file convention — check hPanel's Node.js
docs for the exact mechanism on your plan).

## 5. Set up the automation cron job

Vercel Cron (`vercel.json`) doesn't exist outside Vercel. Replace it with
Hostinger's own **Cron Jobs** feature (hPanel → Advanced → Cron Jobs):

- **Command**:
  ```
  curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/automation
  ```
  (use the same value you set for `CRON_SECRET` in step 3)
- **Frequency**: every 15 minutes if your plan allows it, otherwise the
  shortest interval available — this endpoint scans for and sends
  automation messages (new-lead acks, drip follow-ups, etc.), so less
  frequent just means more delay before they go out, not anything
  breaking.

## 6. Point the domain at this app

If the domain is already on Hostinger and you created the Node.js app
directly under it in step 2, this is already done. If you're pointing a
subdomain or the app lives elsewhere, set that up in hPanel → Domains.

## 7. Verify

- Visit your domain — you should see the public site (empty listings
  until you add some from the CRM).
- Visit `/login` and sign in as the broker account you created when you
  ran the migrations (or go to `/crm/setup` after first login to finish
  onboarding — see ARCHITECTURE.md, Step 10).
- Check hPanel's Node.js app logs if anything 500s — almost always a
  missing/wrong environment variable at that point.

## Redeploying after future changes

Repeat step 4 (`npm install && npm run build`, then restart the app).
There's no auto-deploy-on-push unless your Hostinger plan's Git
integration supports a build hook — check hPanel's Git section if you
want that instead of manual redeploys.
