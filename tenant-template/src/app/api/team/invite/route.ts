import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ProfileRole } from "@/lib/types/database";

const VALID_ROLES: ProfileRole[] = ["broker", "employee", "master_advisor", "advisor"];

// Inviting a team member needs two privileged operations in sequence:
// creating the auth.users row (auth.admin.inviteUserByEmail, service
// role only) and handing it role/reports_to_id/full_name as
// user_metadata, which handle_new_user() (0002) reads to create the
// matching profiles row on insert. The caller-identity check runs
// against the caller's own session first -- only after confirming
// broker/employee does this drop to the service client for the invite.
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "broker" && profile.role !== "employee")) {
    return NextResponse.json({ error: "only a broker or employee can invite team members" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; full_name?: string; role?: ProfileRole; reports_to_id?: string | null }
    | null;

  if (!body?.email || !body.full_name || !body.role) {
    return NextResponse.json({ error: "email, full_name, and role are required" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: `invalid role "${body.role}"` }, { status: 400 });
  }
  if (body.role !== "broker" && !body.reports_to_id) {
    return NextResponse.json({ error: `${body.role} must report to someone -- pick a reports_to_id` }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: invited, error } = await service.auth.admin.inviteUserByEmail(body.email, {
    data: { role: body.role, reports_to_id: body.reports_to_id ?? null, full_name: body.full_name },
    redirectTo: `${new URL(request.url).origin}/invite/accept`,
  });

  if (error) {
    // profiles_validate_reports_to (0001) raises here too, e.g. rank
    // violations -- surfaced as-is rather than re-explained.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: invited.user.id });
}
