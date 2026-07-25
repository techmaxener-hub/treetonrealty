"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_STAGES } from "@/lib/constants";
import type { LeadStage } from "@/lib/types/database";

export function StageSelect({ leadId, stage }: { leadId: string; stage: LeadStage }) {
  const router = useRouter();
  const [value, setValue] = useState(stage);
  const [, startTransition] = useTransition();

  async function handleChange(next: string) {
    const previous = value;
    setValue(next as LeadStage);
    const supabase = createClient();
    const { error } = await supabase.rpc("update_lead_stage", { p_lead_id: leadId, p_new_stage: next as LeadStage });
    if (error) {
      setValue(previous);
      toast.error(`Couldn't update stage: ${error.message}`);
      return;
    }
    toast.success("Stage updated");
    startTransition(() => router.refresh());
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STAGES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
