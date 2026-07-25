# Deploying to Hostinger

Hostinger has two different products this could mean, and they deploy
completely differently. Check which one you're on before following
either section below.

- **"Websites" app hosting (git-connected)** — hPanel shows a dashboard
  per site with "Connected with GitHub", a Framework field that
  auto-detects Next.js, and a Redeploy button. This builds and runs the
  app itself on every push/redeploy — you never touch a startup file or
  run `npm install` yourself. **This is what treetonrealty is deployed
  on.** See below.
- **Classic Node.js app hosting (Passenger-based)** — hPanel's
  Website → Advanced → Node.js screen, where you set an "Application
  startup file" and there's an NPM Install button. See
  "Classic Node.js hosting" further down if this is what you have
  instead.

Either way, two things need to happen before any of this: **all 12
migrations must already be applied to your Supabase project** (Supabase
dashboard → SQL Editor → run each file in `supabase/migrations/` in
order, 0001 through 0012), and you need that project's URL + anon key +
service role key in hand.

## Websites app hosting (git-connected) — what treetonrealty uses

### 1. Environment variables

In the site's dashboard, left sidebar → **Environment variables**. Set:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service role key (Project Settings → API — keep this secret) |
| `CRON_SECRET` | any long random string — reuse it in step 3 |
| `NODE_ENV` | `production` |

Leave `WHATSAPP_*` / `SMTP_*` unset for now — the automation engine
dry-runs (logs instead of sending) until you have real provider
credentials.

Env vars don't apply retroactively — after saving, click **Redeploy**
(top right of the dashboard) so the next build picks them up.

### 2. Build and deploy

Nothing to do here — this happens automatically. The dashboard already
shows "Framework: Next.js", "Root directory: tenant-template", and
builds on every push to the connected branch (or on demand via
Redeploy). `next.config.ts`'s `output: "standalone"` doesn't interfere
with this — it's inert unless something specifically runs
`.next/standalone/server.js`, which this product doesn't; it's there for
the classic Node.js hosting path below, and for reference if you ever
move to a VPS.

### 3. Automation engine cron

This product has no built-in scheduled-job feature (unlike classic
hPanel's Cron Jobs, or Vercel's `vercel.json` cron this app was
originally built for). Since the repo's already on GitHub, use
`.github/workflows/tenant-automation-cron.yml` (in the repo root) —
a scheduled GitHub Action that pings `/api/cron/automation` every 15
minutes, free, no third-party service.

It needs two things set on the GitHub repo (**Settings → Secrets and
variables → Actions**):
- A **secret** named `CRON_SECRET` — same value as the environment
  variable from step 1.
- A **variable** named `TENANT_SITE_URL` — your deployed site's origin,
  e.g. `https://treetonrealty.b2bseomation.com` (no trailing slash).

Once both are set, the workflow runs on its own schedule. You can also
trigger it manually from the repo's Actions tab (`workflow_dispatch`) to
test it immediately rather than waiting up to 15 minutes.

### 4. Verify

- Visit your domain — you should see the public site (empty listings
  until you add some from the CRM).
- Visit `/login` and sign in as the broker account tied to your Supabase
  project (see "Creating your first login" below if you haven't done
  this yet) — you'll land on `/crm/setup` automatically if onboarding
  isn't finished (ARCHITECTURE.md, Step 10).
- Check the dashboard's deployment logs if anything 500s — almost always
  a missing/wrong environment variable.

---

## Creating your first login

The CRM's `/login` page only signs in — team members are invited, not
self-registered, so *someone* has to be the first invite. Do this once,
from any machine with `curl` (or PowerShell's `Invoke-RestMethod` on
Windows — plain `curl`/`Invoke-WebRequest` don't take the same flags):

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "choose-a-strong-password",
    "email_confirm": true,
    "user_metadata": { "role": "broker", "full_name": "Your Name" }
  }'
```

This creates a Supabase auth user *and* (via the `handle_new_user`
database trigger reading that `user_metadata`) the matching broker
`profiles` row, in one shot. Verify it worked: Supabase dashboard →
Table Editor → `profiles` should show a row with `role = broker`.

After rotating through this once, treat your `service_role` key as
compromised if you ever paste it somewhere it could leak (chat, a
screenshot, a public repo) — **Supabase Dashboard → Project Settings →
API → Reset `service_role` secret**, then update it everywhere you use
it (this call, and the Hostinger env vars).

---

## Classic Node.js hosting (Passenger-based)

If your hPanel shows **Website → Advanced → Node.js** with an
"Application startup file" field instead of a git-connected dashboard,
use this path.

`output: "standalone"` in `next.config.ts` is what makes this work:
`next build` produces `.next/standalone/server.js`, a self-contained
Node server with its own pruned `node_modules`; a `postbuild` script
copies `public/` and `.next/static/` into it so it can serve its own
static assets (Vercel normally serves those from its CDN instead, so
self-hosting needs its own copies). This is the file you'll point
Hostinger at.

1. **Push this branch to your own GitHub remote** if not already there.
2. **hPanel → Website → Advanced → Node.js → Create Application**:
   - **Node.js version**: 18 or newer.
   - **Application root**: the folder holding `tenant-template`'s
     contents (set this to the `tenant-template` subfolder specifically
     if you're deploying the whole monorepo, not the repo root).
   - **Application startup file**: `.next/standalone/server.js`
   - **Application URL**: your domain.
   - Get the code onto the server via hPanel's Git deploy (if offered)
     or File Manager/SFTP.
3. **Environment variables**: same table as the git-connected section
   above, minus needing `TENANT_SITE_URL`/GitHub Actions setup — this
   product usually does have its own **Cron Jobs** feature
   (hPanel → Advanced → Cron Jobs), so use that directly instead:
   ```
   curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/automation
   ```
   every 15 minutes (or your plan's shortest interval).

   Don't set `PORT` — Hostinger assigns this itself and the standalone
   server already reads `process.env.PORT`.
4. **Install and build** — hPanel's NPM Install button, then a build
   step/terminal running `npm install && npm run build` (the `postbuild`
   script runs automatically as part of `npm run build`). If your plan
   has SSH:
   ```bash
   ssh <your-hostinger-ssh-user>@<your-server>
   cd domains/<yourdomain>/tenant-template
   npm install
   npm run build
   ```
   Restart the app from hPanel afterward so it picks up the build.
5. **Redeploying after future changes**: repeat step 4, then restart.
   No auto-deploy-on-push unless your plan's Git integration supports a
   build hook.
