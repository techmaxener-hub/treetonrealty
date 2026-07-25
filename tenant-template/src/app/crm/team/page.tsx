import { createClient } from "@/lib/supabase/server";
import { getTeamWithPublicProfiles } from "@/lib/data/advisor-profiles";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TeamRowActions } from "@/components/crm/team-row-actions";
import { ROLE_LABELS } from "@/lib/constants";
import type { ProfileRole } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createClient();
  const team = await getTeamWithPublicProfiles(supabase);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">Public profiles shown on the website&apos;s Team page.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Public page</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.profileId}>
                <TableCell className="font-medium">{member.fullName}</TableCell>
                <TableCell>{ROLE_LABELS[member.role as ProfileRole]}</TableCell>
                <TableCell>
                  {member.advisorProfile ? (
                    <Badge variant={member.advisorProfile.is_public ? "default" : "secondary"}>
                      {member.advisorProfile.is_public ? "Published" : "Hidden"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not set up</span>
                  )}
                </TableCell>
                <TableCell>
                  <TeamRowActions profileId={member.profileId} fullName={member.fullName} existing={member.advisorProfile} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
