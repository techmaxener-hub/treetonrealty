"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Inbox, Users, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCurrentAdmin } from "@/lib/hooks/use-current-admin";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/requests", label: "Signup requests", icon: Inbox },
  { href: "/admin/brokers", label: "Broker instances", icon: Building2 },
  { href: "/admin/team", label: "Team", icon: Users },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useCurrentAdmin();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-secondary/30">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <div className="h-7 w-7 rounded-md bg-primary" aria-hidden />
        <span className="text-sm font-semibold">Platform Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-secondary",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 border-t p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials(admin.name ?? admin.email)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{admin.name ?? admin.email}</p>
          <p className="truncate text-xs text-muted-foreground">{admin.role === "super_admin" ? "Super Admin" : "Support"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
