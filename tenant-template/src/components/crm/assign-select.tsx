"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeamMember } from "@/lib/data/team";

const UNASSIGNED = "__unassigned__";

export function AssignSelect({
  leadId,
  assignedTo,
  team,
}: {
  leadId: string;
  assignedTo: string | null;
  team: TeamMember[];
}) {
  const [value, setValue] = useState(assignedTo ?? UNASSIGNED);

  async function handleChange(next: string) {
    const previous = value;
    setValue(next);
    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ assigned_advisor_id: next === UNASSIGNED ? null : next })
      .eq("id", leadId);
    if (error) {
      setValue(previous);
      toast.error(`Couldn't reassign: ${error.message}`);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {team.map((member) => (
          <SelectItem key={member.profileId} value={member.profileId}>
            {member.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
