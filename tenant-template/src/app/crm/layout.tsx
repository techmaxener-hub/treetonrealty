import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CurrentProfileProvider } from "@/lib/hooks/use-current-profile";
import { SidebarNav } from "@/components/crm/sidebar-nav";

export const dynamic = "force-dynamic";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // auth.users row exists but profiles doesn't -- an invite that never
    // completed correctly. Nothing useful to render.
    redirect("/login");
  }

  const { data: advisorProfile } = await supabase
    .from("advisor_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <CurrentProfileProvider profile={{ ...profile, advisorProfileId: advisorProfile?.id ?? null }}>
      <div className="flex h-screen overflow-hidden">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </CurrentProfileProvider>
  );
}
