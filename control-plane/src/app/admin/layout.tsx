import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { CurrentAdminProvider } from "@/lib/hooks/use-current-admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: admin } = await supabase.from("platform_admins").select("id, email, name, role").eq("id", user.id).maybeSingle();

  if (!admin) {
    // A signed-in auth.users row that never claimed (or was granted)
    // platform admin access -- nothing in this app is reachable for them.
    redirect("/login");
  }

  return (
    <CurrentAdminProvider admin={admin}>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebarNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </CurrentAdminProvider>
  );
}
