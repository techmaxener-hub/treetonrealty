import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Inviting a platform admin needs two privileged operations in sequence:
// creating the auth.users row (auth.admin.inviteUserByEmail, service
// role only) and then the platform_admins row that grants access. The
// caller-identity check runs against the caller's own session first --
// only after confirming they're a super_admin does this drop to the
// service client for the invite itself.
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: isSuperAdmin } = await supabase.rpc("is_super_admin");
  if (!isSuperAdmin) {
    return NextResponse.json({ error: "only a super_admin can invite platform admins" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; name?: string; role?: "super_admin" | "support" } | null;
  if (!body?.email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: invited, error: inviteError } = await service.auth.admin.inviteUserByEmail(body.email, {
    redirectTo: `${new URL(request.url).origin}/login`,
  });
  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("platform_admins").insert({
    id: invited.user.id,
    email: body.email,
    name: body.name || null,
    role: body.role ?? "support",
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ id: invited.user.id });
}
