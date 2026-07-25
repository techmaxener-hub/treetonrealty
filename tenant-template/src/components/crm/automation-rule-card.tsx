"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTOMATION_TRIGGER_LABELS, AUTOMATION_TRIGGER_DESCRIPTIONS } from "@/lib/constants";
import type { Tables } from "@/lib/types/database";

type Rule = Tables<"automation_rules">;

// Config shape varies by trigger_type -- only the three time/threshold
// -based triggers have anything worth exposing here. Everything else
// (new_lead, new_listing_match, post_site_visit, post_closing,
// birthday_anniversary, price_drop_status_change) just has the
// is_active toggle, since their behavior isn't parameterized.
export function AutomationRuleCard({ rule }: { rule: Rule }) {
  const [isActive, setIsActive] = useState(rule.is_active);
  const [config, setConfig] = useState<Record<string, unknown>>(rule.config);
  const [saving, setSaving] = useState(false);

  const dirty = isActive !== rule.is_active || JSON.stringify(config) !== JSON.stringify(rule.config);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("automation_rules").update({ is_active: isActive, config }).eq("id", rule.id);
    setSaving(false);
    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
      return;
    }
    toast.success("Saved.");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{AUTOMATION_TRIGGER_LABELS[rule.trigger_type]}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{AUTOMATION_TRIGGER_DESCRIPTIONS[rule.trigger_type]}</p>
        </div>
        <Badge variant={isActive ? "default" : "secondary"} className="shrink-0">
          {isActive ? "Active" : "Paused"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rule.trigger_type === "no_response_sla" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`sla-${rule.id}`}>Nudge agent after (hours with no activity)</Label>
            <Input
              id={`sla-${rule.id}`}
              type="number"
              min={1}
              className="w-32"
              value={String(config.sla_hours ?? "")}
              onChange={(e) => setConfig({ ...config, sla_hours: Number(e.target.value) })}
            />
          </div>
        )}

        {rule.trigger_type === "drip_sequence" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`drip-${rule.id}`}>Follow-up days (comma-separated, e.g. 1, 3, 7)</Label>
            <Input
              id={`drip-${rule.id}`}
              className="w-48"
              value={(Array.isArray(config.interval_days) ? (config.interval_days as number[]) : []).join(", ")}
              onChange={(e) =>
                setConfig({
                  ...config,
                  interval_days: e.target.value
                    .split(",")
                    .map((s) => Number(s.trim()))
                    .filter((n) => Number.isFinite(n) && n > 0),
                })
              }
            />
          </div>
        )}

        {rule.trigger_type === "abandoned_browse" && (
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`views-${rule.id}`}>Minimum listings viewed</Label>
              <Input
                id={`views-${rule.id}`}
                type="number"
                min={1}
                className="w-28"
                value={String(config.min_views ?? "")}
                onChange={(e) => setConfig({ ...config, min_views: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`window-${rule.id}`}>Within (hours)</Label>
              <Input
                id={`window-${rule.id}`}
                type="number"
                min={1}
                className="w-28"
                value={String(config.window_hours ?? "")}
                onChange={(e) => setConfig({ ...config, window_hours: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsActive((v) => !v)}>
            {isActive ? "Pause" : "Activate"}
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
