// Test-only helpers for creating/tearing down throwaway fixtures directly
// against the real Supabase project (service-role key), and for signing in as
// a specific test user to exercise RLS from their point of view. Every
// resource created here MUST be cleaned up by the test that creates it --
// these hit a live database, not a mock.
import { SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env";

const ADMIN_HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase request failed (${res.status}): ${body}`);
  }
  return (await res.json()) as T;
}

/** Creates a confirmed auth user via the Admin API. Returns the user id. */
export async function adminCreateUser(email: string, password: string, fullName: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: ADMIN_HEADERS,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  const data = await json<{ id: string }>(res);
  return data.id;
}

/** Permanently deletes an auth user (cascades to their profiles row). */
export async function adminDeleteUser(id: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: ADMIN_HEADERS,
  });
}

/**
 * Promotes/configures a just-created profile row. The `profiles_guard_role`
 * trigger blocks role changes via plain UPDATE from a non-admin session (by
 * design, to prevent self-escalation) -- service-role UPDATE hits the same
 * trigger since it checks auth.uid()-based is_admin(), which is null/false
 * for a service-role request. Delete + re-insert sidesteps the UPDATE-only
 * trigger, matching the bootstrap pattern used manually earlier in this
 * project for the first real admin account.
 */
export async function adminSetProfile(
  id: string,
  fields: Record<string, unknown>
) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
    method: "DELETE",
    headers: ADMIN_HEADERS,
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...ADMIN_HEADERS, Prefer: "return=representation" },
    body: JSON.stringify({ id, ...fields }),
  });
  return json(res);
}

/** Signs in as a test user via password grant. Returns their access token. */
export async function signInAs(email: string, password: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await json<{ access_token: string }>(res);
  return data.access_token;
}

/** SELECT via PostgREST as a specific signed-in user -- exercises real RLS. */
export async function selectAs(accessToken: string, table: string, query: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  return json<Record<string, unknown>[]>(res);
}

/** Admin (service-role) SELECT -- bypasses RLS, for fixture setup/assertions. */
export async function selectAdmin(table: string, query: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: ADMIN_HEADERS,
  });
  return json<Record<string, unknown>[]>(res);
}

/** Admin (service-role) INSERT -- bypasses RLS, for fixture setup. */
export async function insertAdmin<T = Record<string, unknown>>(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...ADMIN_HEADERS, Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  const rows = await json<T[]>(res);
  return rows[0];
}

/** Admin (service-role) DELETE by id -- for fixture teardown. */
export async function deleteAdmin(table: string, id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "DELETE",
    headers: ADMIN_HEADERS,
  });
}

/** Generates a unique-enough email for a throwaway test fixture user. */
export function testEmail(label: string) {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@treetonrealty.local`;
}
