"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/lib/data/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Row = { profileId: string; percent: string };

export function DealCommissionSplit({
  dealId,
  primaryAdvisorId,
  split,
  team,
}: {
  dealId: string;
  primaryAdvisorId: string;
  split: Record<string, number>;
  team: TeamMember[];
}) {
  const router = useRouter();
  const initialRows: Row[] =
    Object.keys(split).length > 0
      ? Object.entries(split).map(([profileId, percent]) => ({ profileId, percent: String(percent) }))
      : [{ profileId: primaryAdvisorId, percent: "100" }];
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [saving, setSaving] = useState(false);

  const total = rows.reduce((sum, r) => sum + (Number(r.percent) || 0), 0);
  const memberByProfileId = new Map(team.map((m) => [m.profileId, m]));

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    const unused = team.find((m) => !rows.some((r) => r.profileId === m.profileId));
    if (!unused) return;
    setRows((prev) => [...prev, { profileId: unused.profileId, percent: "0" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    const nextSplit: Record<string, number> = {};
    for (const row of rows) {
      if (row.profileId && Number(row.percent) > 0) nextSplit[row.profileId] = Number(row.percent);
    }
    const supabase = createClient();
    const { error } = await supabase.from("deals").update({ commission_split: nextSplit }).eq("id", dealId);
    if (error) {
      toast.error(`Couldn't save split: ${error.message}`);
    } else {
      toast.success("Commission split saved");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Per-advisor share of the commission — general enough to pay a referring sub-broker up the chain, not just the closer.
      </p>
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select value={row.profileId} onValueChange={(v) => updateRow(index, { profileId: v })}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {team.map((m) => (
                <SelectItem key={m.profileId} value={m.profileId}>
                  {m.fullName}
                  {m.profileId === primaryAdvisorId ? " (primary)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            className="w-24"
            value={row.percent}
            onChange={(e) => updateRow(index, { percent: e.target.value })}
          />
          <span className="text-xs text-muted-foreground">%</span>
          <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)} disabled={rows.length === 1}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={rows.length >= team.length}>
          <Plus className="h-3.5 w-3.5" /> Add advisor
        </Button>
        <span className={cn("text-xs font-medium", total !== 100 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
          Total: {total}%{total !== 100 ? " (doesn't add up to 100%)" : ""}
        </span>
      </div>

      {rows.some((r) => !memberByProfileId.has(r.profileId)) && (
        <p className="text-xs text-destructive">One or more advisors on this split are no longer on the team.</p>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save split"}
        </Button>
      </div>
    </div>
  );
}
