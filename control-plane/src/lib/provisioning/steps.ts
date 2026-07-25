import type { Tables } from "@/lib/types/database";

export type StepResult = { success: boolean; log: string; patch?: Partial<Tables<"broker_instances">> };

// Same dry-run-when-unconfigured shape as the tenant template's
// WhatsApp/email providers (Step 8): every step either calls a real
// external API when its credentials are set, or logs exactly what it
// would have done and reports success, so the whole provisioning
// pipeline -- job sequencing, status transitions, retry -- is
// exercisable end to end before a platform operator has real
// Supabase Management / Vercel API credentials to hand.
//
// run_migrations and seed_defaults are the two exceptions and stay
// dry-run *by design*, not just "until configured": actually running
// SQL against a brand-new, dynamically-created Postgres database needs
// a live connection with that project's own credentials, which this
// admin panel would have to mint and hold just long enough to use --
// exactly the kind of plaintext-secret handling broker_instances.secrets_ref
// exists to avoid. In a real deployment this step belongs to the same
// CI/deploy job that has legitimate, short-lived access to a freshly
// created database, not a serverless request handler here. Flagging
// this rather than faking it.

async function stepCreateProject(broker: Tables<"broker_instances">): Promise<StepResult> {
  const token = process.env.SUPABASE_MANAGEMENT_API_TOKEN;
  const orgId = process.env.SUPABASE_MANAGEMENT_ORG_ID;

  if (!token || !orgId) {
    const fakeRef = `dryrun-${broker.slug}`;
    return {
      success: true,
      log: `[dry-run] Would call the Supabase Management API to create a new project "${broker.name}" in org ${orgId ?? "<unset>"}. Set SUPABASE_MANAGEMENT_API_TOKEN and SUPABASE_MANAGEMENT_ORG_ID to provision for real.`,
      patch: { supabase_project_ref: fakeRef, supabase_url: `https://${fakeRef}.supabase.co` },
    };
  }

  const res = await fetch("https://api.supabase.com/v1/projects", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: broker.name,
      organization_id: orgId,
      db_pass: crypto.randomUUID(),
      region: process.env.SUPABASE_PROVISION_REGION ?? "ap-south-1",
      plan: "free",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { success: false, log: `Supabase Management API ${res.status}: ${body.slice(0, 500)}` };
  }

  const json = (await res.json()) as { id: string };
  return {
    success: true,
    log: `Created Supabase project ${json.id}.`,
    patch: { supabase_project_ref: json.id, supabase_url: `https://${json.id}.supabase.co` },
  };
}

async function stepRunMigrations(broker: Tables<"broker_instances">): Promise<StepResult> {
  return {
    success: true,
    log: `[dry-run, by design] Would run tenant-template/supabase/migrations against ${broker.supabase_project_ref ?? "<no project yet>"} from the deploy pipeline's own migration runner, which holds this project's credentials only as long as the migration run takes.`,
  };
}

async function stepSeedDefaults(broker: Tables<"broker_instances">): Promise<StepResult> {
  return {
    success: true,
    log: `[dry-run, by design] Would seed an initial broker_profile row (display_name: "${broker.name}") into ${broker.supabase_project_ref ?? "<no project yet>"} from the same deploy pipeline as run_migrations, right after migrations finish.`,
  };
}

async function stepDeployFrontend(broker: Tables<"broker_instances">): Promise<StepResult> {
  const token = process.env.VERCEL_API_TOKEN;
  const gitRepo = process.env.VERCEL_GIT_REPO;

  if (!token || !gitRepo) {
    const fakeUrl = `https://${broker.slug}.vercel.app`;
    return {
      success: true,
      log: `[dry-run] Would create a Vercel project from ${gitRepo ?? "<unset VERCEL_GIT_REPO>"} (tenant-template/ root) and deploy it. Set VERCEL_API_TOKEN and VERCEL_GIT_REPO to deploy for real.`,
      patch: { deployment_url: fakeUrl },
    };
  }

  const teamQuery = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
  const res = await fetch(`https://api.vercel.com/v10/projects${teamQuery}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: broker.slug,
      gitRepository: { type: "github", repo: gitRepo },
      rootDirectory: "tenant-template",
      environmentVariables: [
        { key: "NEXT_PUBLIC_SUPABASE_URL", value: broker.supabase_url ?? "", target: ["production"], type: "plain" },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { success: false, log: `Vercel API ${res.status}: ${body.slice(0, 500)}` };
  }

  const json = (await res.json()) as { name: string };
  return {
    success: true,
    log: `Created Vercel project "${json.name}" from ${gitRepo}. Trigger its first deployment from the Vercel dashboard or a git push.`,
    patch: { deployment_url: `https://${json.name}.vercel.app` },
  };
}

async function stepAssignDomain(broker: Tables<"broker_instances">): Promise<StepResult> {
  const token = process.env.VERCEL_API_TOKEN;
  const baseDomain = process.env.PLATFORM_BASE_DOMAIN;

  if (!token || !baseDomain) {
    const fakeSubdomain = `${broker.slug}.yourplatform.example`;
    return {
      success: true,
      log: `[dry-run] Would assign ${fakeSubdomain} to the deployment. Set VERCEL_API_TOKEN and PLATFORM_BASE_DOMAIN to assign a real subdomain.`,
      patch: { subdomain: fakeSubdomain },
    };
  }

  const subdomain = `${broker.slug}.${baseDomain}`;
  const teamQuery = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
  const res = await fetch(`https://api.vercel.com/v10/projects/${broker.slug}/domains${teamQuery}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: subdomain }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { success: false, log: `Vercel API ${res.status}: ${body.slice(0, 500)}` };
  }

  return { success: true, log: `Assigned ${subdomain}.`, patch: { subdomain } };
}

async function stepDone(): Promise<StepResult> {
  return { success: true, log: "Provisioning complete." };
}

export const STEP_ORDER = ["create_project", "run_migrations", "seed_defaults", "deploy_frontend", "assign_domain", "done"] as const;

export const STEP_RUNNERS: Record<(typeof STEP_ORDER)[number], (broker: Tables<"broker_instances">) => Promise<StepResult>> = {
  create_project: stepCreateProject,
  run_migrations: stepRunMigrations,
  seed_defaults: stepSeedDefaults,
  deploy_frontend: stepDeployFrontend,
  assign_domain: stepAssignDomain,
  done: stepDone,
};
