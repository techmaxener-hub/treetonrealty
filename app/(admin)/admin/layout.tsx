import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, KanbanSquare, Building2, LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { Button } from "@/components/ui/button";
import { signOut } from "../login/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { href: "/admin/leads", label: "Leads", icon: KanbanSquare, roles: null },
  { href: "/admin/listings", label: "Listings", icon: Building2, roles: null },
] as const;

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (profile && (item.roles as readonly string[]).includes(profile.role))
  );

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border-subtle bg-white">
        <div className="border-b border-border-subtle px-6 py-5">
          <span className="font-display text-lg font-semibold text-slate-deep">
            Treeton Realty
          </span>
          <p className="text-xs text-muted-foreground">CRM</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-deep transition-colors hover:bg-alabaster"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border-subtle px-3 py-4">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-medium text-slate-deep">
              {profile?.full_name ?? user.email}
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              {profile?.role?.replace("_", " ") ?? "Staff"}
            </p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-2.5 px-3 text-sm text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto bg-alabaster p-6">{children}</main>
    </div>
  );
}
