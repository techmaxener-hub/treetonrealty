"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/use-current-profile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActivityType } from "@/lib/types/database";

const LOGGABLE_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "whatsapp_message", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "site_visit", label: "Site visit" },
  { value: "note", label: "Note" },
];

export function ActivityComposer({ leadId }: { leadId: string }) {
  const router = useRouter();
  const profile = useCurrentProfile();
  const [type, setType] = useState<ActivityType>("call");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("activity_log").insert({
      lead_id: leadId,
      actor_profile_id: profile.id,
      activity_type: type,
      content,
    });
    // Logging any activity counts as contact -- keep last_activity_at
    // fresh so the SLA-nudge automation (Step 8) doesn't chase a lead
    // that was, in fact, just worked.
    await supabase.from("leads").update({ last_activity_at: new Date().toISOString() }).eq("id", leadId);

    if (error) {
      toast.error(`Couldn't log activity: ${error.message}`);
    } else {
      setContent("");
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOGGABLE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">Logged as {profile.full_name}</span>
      </div>
      <Textarea
        placeholder="What happened?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
          {submitting ? "Logging…" : "Log activity"}
        </Button>
      </div>
    </form>
  );
}
