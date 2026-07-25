import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLeadDetail } from "@/lib/data/leads";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StageSelect } from "@/components/crm/stage-select";
import { ScoreSelect } from "@/components/crm/score-select";
import { AssignSelect } from "@/components/crm/assign-select";
import { ActivityComposer } from "@/components/crm/activity-composer";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { TaskList } from "@/components/crm/task-list";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatCurrencyINR, localizedText } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  let detail: Awaited<ReturnType<typeof getLeadDetail>>;
  try {
    detail = await getLeadDetail(supabase, id);
  } catch {
    notFound();
  }

  const { lead, contact, listing, activity, tasks, team } = detail;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link href="/crm/leads" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to pipeline
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{contact?.full_name ?? "Unknown contact"}</CardTitle>
              {contact?.potential_duplicate_of ? (
                <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Flagged as a possible duplicate contact —{" "}
                  <Link href="/crm/contacts" className="underline">
                    review in Contacts
                  </Link>
                </p>
              ) : null}
              <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
                {contact?.phone ? (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {contact.phone}
                  </span>
                ) : null}
                {contact?.whatsapp_number ? (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" /> {contact.whatsapp_number}
                  </span>
                ) : null}
                {contact?.email ? (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {contact.email}
                  </span>
                ) : null}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ActivityComposer leadId={lead.id} />
              <Separator />
              <ActivityTimeline activity={activity} profileNameById={new Map(team.map((m) => [m.profileId, m.fullName]))} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Stage</Label>
                <StageSelect leadId={lead.id} stage={lead.stage} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Score</Label>
                <ScoreSelect leadId={lead.id} score={lead.score} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Assigned to</Label>
                <AssignSelect leadId={lead.id} assignedTo={lead.assigned_advisor_id} team={team} />
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Source</span>
                <span>{LEAD_SOURCE_LABELS[lead.source]}</span>
              </div>
              {(lead.budget_min || lead.budget_max) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span>
                    {formatCurrencyINR(lead.budget_min)} – {formatCurrencyINR(lead.budget_max)}
                  </span>
                </div>
              )}
              {listing ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Listing</span>
                  <span>{localizedText(listing.title) || listing.slug}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList leadId={lead.id} tasks={tasks} team={team} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
