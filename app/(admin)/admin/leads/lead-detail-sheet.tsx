"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addLeadNote, getLeadActivities } from "./actions";
import type { LeadActivityRow, LeadRow } from "./types";

function toWhatsAppLink(phone: string, leadName: string) {
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  const withCountryCode = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  const message = `Hi ${leadName}, this is Treeton Realty following up on your enquiry.`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

type ActionState = { error: string | null } | undefined;

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
}: {
  lead: LeadRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activities, setActivities] = useState<LeadActivityRow[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [note, setNote] = useState("");

  const [state, formAction, isSubmitting] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      if (!lead) return { error: "No lead selected." };
      const result = await addLeadNote(lead.id, String(formData.get("content") ?? ""));
      if (!result.error) {
        setNote("");
        startTransition(() => {
          getLeadActivities(lead.id).then((res) => setActivities(res.activities));
        });
      }
      return result;
    },
    undefined
  );

  useEffect(() => {
    if (open && lead) {
      startTransition(() => {
        getLeadActivities(lead.id).then((res) => setActivities(res.activities));
      });
    }
  }, [open, lead]);

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lead.name}</SheetTitle>
          <SheetDescription>{lead.property_interest ?? "General enquiry"}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{lead.source.replace(/_/g, " ")}</Badge>
          <Badge>{lead.status}</Badge>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={`tel:${lead.phone}`}>
              <Phone className="h-4 w-4" />
              {lead.phone}
            </a>
          </Button>
          <Button asChild size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <a href={toWhatsAppLink(lead.phone, lead.name)} target="_blank" rel="noreferrer">
              <FaWhatsapp className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>

        <div className="flex-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-deep">Activity</h3>
          {isLoading && activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} className="rounded-md border border-border-subtle p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium capitalize text-slate-deep">
                      {activity.activity_type.replace("_", " ")}
                    </span>
                    <span>{new Date(activity.created_at).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-deep">{activity.content}</p>
                  {activity.actor ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      by {activity.actor.full_name}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form action={formAction} className="space-y-2 border-t border-border-subtle pt-4">
          <textarea
            name="content"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            className="flex w-full rounded-sm border border-border bg-white/80 px-4 py-2 text-sm text-slate-deep placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add note"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
