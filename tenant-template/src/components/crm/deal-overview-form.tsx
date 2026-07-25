"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Tables, DealStage } from "@/lib/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEAL_STAGES } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";

export function DealOverviewForm({ deal }: { deal: Tables<"deals"> }) {
  const router = useRouter();
  const [dealValue, setDealValue] = useState(deal.deal_value?.toString() ?? "");
  const [commissionPercent, setCommissionPercent] = useState(deal.commission_percent?.toString() ?? "");
  const [commissionAmount, setCommissionAmount] = useState(deal.commission_amount?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const calculatedCommission =
    dealValue && commissionPercent ? (Number(dealValue) * Number(commissionPercent)) / 100 : null;

  async function handleStageChange(next: string) {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_deal_stage", { p_deal_id: deal.id, p_new_stage: next as DealStage });
    if (error) {
      toast.error(`Couldn't update stage: ${error.message}`);
    } else {
      toast.success("Stage updated");
      router.refresh();
    }
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("deals")
      .update({
        deal_value: dealValue ? Number(dealValue) : null,
        commission_percent: commissionPercent ? Number(commissionPercent) : null,
        commission_amount: commissionAmount ? Number(commissionAmount) : calculatedCommission,
      })
      .eq("id", deal.id);
    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
    } else {
      toast.success("Saved");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Stage</Label>
        <Select value={deal.stage} onValueChange={handleStageChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEAL_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {deal.closed_at && <p className="text-xs text-muted-foreground">Closed on {new Date(deal.closed_at).toLocaleDateString("en-IN")}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Deal value (₹)</Label>
          <Input type="number" value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Commission %</Label>
          <Input type="number" step="0.1" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Commission amount (₹)</Label>
        <Input
          type="number"
          value={commissionAmount}
          onChange={(e) => setCommissionAmount(e.target.value)}
          placeholder={calculatedCommission ? calculatedCommission.toFixed(0) : "Auto from % × value"}
        />
        {calculatedCommission !== null && !commissionAmount && (
          <p className="text-xs text-muted-foreground">Calculated: {formatCurrencyINR(calculatedCommission)} — override above if different.</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
