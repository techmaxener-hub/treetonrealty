import { createClient } from "@/lib/supabase/server";
import { getPlatformAdmins } from "@/lib/data/admin";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InviteAdminDialog } from "@/components/admin/invite-admin-dialog";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createClient();
  const admins = await getPlatformAdmins(supabase);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground">Platform admins -- your team, never a broker&apos;s.</p>
        </div>
        <InviteAdminDialog />
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.name ?? "—"}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
                    {admin.role === "super_admin" ? "Super Admin" : "Support"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDateTime(admin.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
