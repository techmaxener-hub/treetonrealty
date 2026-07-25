import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getContactDetail } from "@/lib/data/contacts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MergeDuplicateAction } from "@/components/crm/merge-duplicate-action";
import { LEAD_STAGES } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  let detail: Awaited<ReturnType<typeof getContactDetail>>;
  try {
    detail = await getContactDetail(supabase, id);
  } catch {
    notFound();
  }

  const { contact, leads, duplicateOf } = detail;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href="/crm/contacts" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to contacts
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">{contact.full_name}</CardTitle>
            <div className="flex flex-wrap gap-1">
              {contact.contact_type.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] capitalize">
                  {t.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
          {duplicateOf ? (
            <MergeDuplicateAction
              duplicateId={contact.id}
              duplicateName={contact.full_name}
              originalId={duplicateOf.id}
              originalName={duplicateOf.full_name}
            />
          ) : null}
          <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
            {contact.phone ? (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {contact.phone}
              </span>
            ) : null}
            {contact.whatsapp_number ? (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> {contact.whatsapp_number}
              </span>
            ) : null}
            {contact.email ? (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {contact.email}
              </span>
            ) : null}
          </div>
        </CardHeader>
        {contact.notes ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">{contact.notes}</p>
          </CardContent>
        ) : null}
      </Card>

      {(contact.preferences.budget_min || contact.preferences.budget_max || contact.preferences.localities?.length) ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {(contact.preferences.budget_min || contact.preferences.budget_max) && (
              <p>
                <span className="text-muted-foreground">Budget:</span> {formatCurrencyINR(contact.preferences.budget_min)} –{" "}
                {formatCurrencyINR(contact.preferences.budget_max)}
              </p>
            )}
            {contact.preferences.localities?.length ? (
              <p>
                <span className="text-muted-foreground">Localities:</span> {contact.preferences.localities.join(", ")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads yet for this contact.</p>
          ) : (
            leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/crm/leads/${lead.id}`}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-secondary/50"
              >
                <span>{LEAD_STAGES.find((s) => s.value === lead.stage)?.label}</span>
                <span className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("en-IN")}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
