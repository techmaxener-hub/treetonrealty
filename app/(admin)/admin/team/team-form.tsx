"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeamMember, updateTeamMember } from "./actions";
import type { TeamMemberRow } from "./types";

export function TeamMemberForm({ member }: { member?: TeamMemberRow }) {
  const mode = member ? "edit" : "create";
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    startTransition(() => {
      const action = mode === "edit" && member ? updateTeamMember(member.id, formData) : createTeamMember(formData);
      action.then((res) => {
        if (res?.error) setError(res.error);
        else setSaved(true);
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" name="full_name" defaultValue={member?.full_name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            name="role"
            defaultValue={member?.role}
            placeholder="e.g. Founder & Principal Broker"
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={member?.bio}
            required
            rows={4}
            className="flex w-full rounded-sm border border-border bg-white/80 px-4 py-2 text-sm text-slate-deep placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            defaultValue={member?.display_order ?? 0}
          />
          <p className="text-xs text-muted-foreground">Lower numbers show first on the About page.</p>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-deep">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={member?.is_published}
              className="h-4 w-4 accent-emerald-600"
            />
            Published (visible on public site)
          </label>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-600">Saved.</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Add team member" : "Save changes"}
      </Button>
    </form>
  );
}
