"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_SCORE_LABELS } from "@/lib/constants";
import type { LeadScore } from "@/lib/types/database";

export function ScoreSelect({ leadId, score }: { leadId: string; score: LeadScore | null }) {
  const [value, setValue] = useState<string>(score ?? "");

  async function handleChange(next: string) {
    const previous = value;
    setValue(next);
    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ score: (next || null) as LeadScore | null })
      .eq("id", leadId);
    if (error) {
      setValue(previous);
      toast.error(`Couldn't update score: ${error.message}`);
    }
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="No score" />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(LEAD_SCORE_LABELS) as [LeadScore, string][]).map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
