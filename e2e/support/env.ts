// Loads .env.local into process.env for the Playwright test process (Next.js
// loads it automatically for the app; Playwright doesn't, so we do it here --
// no new dependency, just a tiny parser for KEY=VALUE lines).
import { readFileSync } from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../../.env.local");
  let contents: string;
  try {
    contents = readFileSync(envPath, "utf-8");
  } catch {
    throw new Error(
      `e2e tests need .env.local at ${envPath} (see .env.local.example) -- Supabase URL/keys are required to run against a real project.`
    );
  }

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

export const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var ${key} for e2e tests.`);
  return value;
}
