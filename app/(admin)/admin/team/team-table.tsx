"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTeamMember, setTeamMemberPublished } from "./actions";
import type { TeamMemberRow } from "./types";

export function TeamTable({ members }: { members: TeamMemberRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function togglePublished(member: TeamMemberRow) {
    startTransition(() => {
      setTeamMemberPublished(member.id, !member.is_published).then(() => router.refresh());
    });
  }

  function handleDelete(member: TeamMemberRow) {
    if (!confirm(`Remove ${member.full_name} from the team list? This can't be undone.`)) return;
    startTransition(() => {
      deleteTeamMember(member.id, member.photo_storage_path).then(() => router.refresh());
    });
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-subtle bg-white p-8 text-center text-sm text-muted-foreground">
        No team members yet. Add one to start replacing the About page&apos;s &quot;coming soon&quot; state.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border-subtle bg-alabaster text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Published</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-border-subtle last:border-0 hover:bg-alabaster/60">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/team/${member.id}/edit`}
                  className="font-medium text-slate-deep hover:underline"
                >
                  {member.full_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-deep">{member.role}</td>
              <td className="px-4 py-3 text-slate-deep">{member.display_order}</td>
              <td className="px-4 py-3">
                <button type="button" disabled={isPending} onClick={() => togglePublished(member)}>
                  <Badge variant={member.is_published ? "verified" : "muted"}>
                    {member.is_published ? "Published" : "Draft"}
                  </Badge>
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleDelete(member)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
