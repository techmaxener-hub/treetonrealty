"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalizedField } from "@/components/crm/localized-field";
import { NOTIFICATION_CHANNEL_LABELS } from "@/lib/constants";
import type { LocalizedText, Tables } from "@/lib/types/database";

type Template = Tables<"notification_templates">;

export function NotificationTemplateEditor({ template }: { template: Template }) {
  const [subject, setSubject] = useState(template.subject ?? "");
  const [body, setBody] = useState<LocalizedText>((template.body ?? {}) as LocalizedText);
  const [saving, setSaving] = useState(false);

  const dirty = subject !== (template.subject ?? "") || JSON.stringify(body) !== JSON.stringify(template.body ?? {});

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("notification_templates")
      .update({ subject: template.channel === "email" ? subject || null : null, body })
      .eq("id", template.id);
    setSaving(false);
    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
      return;
    }
    toast.success("Saved.");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="font-mono text-sm">{template.key}</CardTitle>
        <Badge variant="outline">{NOTIFICATION_CHANNEL_LABELS[template.channel]}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {template.channel === "email" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`subject-${template.id}`}>Subject</Label>
            <Input id={`subject-${template.id}`} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label>Message body</Label>
          <p className="text-xs text-muted-foreground">
            Use <code>{"{{variable}}"}</code> placeholders like <code>{"{{full_name}}"}</code> or <code>{"{{broker_name}}"}</code> --
            they&apos;re filled in when a message sends.
          </p>
          <LocalizedField value={body} onChange={setBody} multiline />
        </div>
        <div>
          <Button type="button" size="sm" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
