"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useCurrentProfile, canManage } from "@/lib/hooks/use-current-profile";
import { ROLE_LABELS } from "@/lib/constants";
import type { ProfileRole } from "@/lib/types/database";
import type { TeamMemberWithPublicProfile } from "@/lib/data/advisor-profiles";

// A broker never needs this dialog (there's only ever one) -- excluded
// from the role options entirely, same as the setup wizard's invite step.
const INVITABLE_ROLES: ProfileRole[] = ["employee", "master_advisor", "advisor"];

export function InviteTeamMemberDialog({ candidates }: { candidates: TeamMemberWithPublicProfile[] }) {
  const router = useRouter();
  const profile = useCurrentProfile();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<ProfileRole>("advisor");
  const [reportsTo, setReportsTo] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!canManage(profile.role)) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: fullName, role, reports_to_id: reportsTo || null }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      toast.error(json.error ?? "Couldn't send invite");
      return;
    }
    toast.success(`Invited ${email}.`);
    setOpen(false);
    setEmail("");
    setFullName("");
    setReportsTo("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Invite team member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>They&apos;ll get an email invite to set their password and join.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="team_invite_name">Name</Label>
              <Input id="team_invite_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="team_invite_email">Email</Label>
              <Input id="team_invite_email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as ProfileRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVITABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Reports to</Label>
            <Select value={reportsTo} onValueChange={setReportsTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select who they report to" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.profileId} value={c.profileId}>
                    {c.fullName} · {ROLE_LABELS[c.role as ProfileRole]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !email.trim() || !fullName.trim() || !reportsTo}>
              {submitting ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
