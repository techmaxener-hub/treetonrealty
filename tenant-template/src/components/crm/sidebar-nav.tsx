"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KanbanSquare, Users, ListTodo, LogOut, Building2, HandCoins, Contact } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import { useCurrentProfile } from "@/lib/hooks/use-current-profile";

const NAV_ITEMS = [
  { href: "/crm/leads", label: "Leads", icon: KanbanSquare },
  { href: "/crm/listings", label: "Listings", icon: Building2 },
  { href: "/crm/deals", label: "Deals", icon: HandCoins },
  { href: "/crm/contacts", label: "Contacts", icon: Users },
  { href: "/crm/tasks", label: "Tasks", icon: ListTodo },
  { href: "/crm/team", label: "Team", icon: Contact },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useCurrentProfile();

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
        <span className="text-sm font-semibold">CRM</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
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
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{profile.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[profile.role]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
