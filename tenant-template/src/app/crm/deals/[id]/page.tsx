import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDealDetail } from "@/lib/data/deals";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DealOverviewForm } from "@/components/crm/deal-overview-form";
import { DealCommissionSplit } from "@/components/crm/deal-commission-split";
import { DealDocumentsChecklist } from "@/components/crm/deal-documents-checklist";
import { localizedText } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  let detail: Awaited<ReturnType<typeof getDealDetail>>;
  try {
    detail = await getDealDetail(supabase, id);
  } catch {
    notFound();
  }

  const { deal, listing, buyer, seller, documents, team } = detail;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link href="/crm/deals" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to deals
      </Link>

      <h1 className="mb-4 text-xl font-semibold">
        {listing ? (
          <Link href={`/crm/listings/${listing.id}`} className="hover:underline">
            {localizedText(listing.title) || listing.slug}
          </Link>
        ) : (
          "Deal"
        )}
      </h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <DealOverviewForm deal={deal} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission split</CardTitle>
            </CardHeader>
            <CardContent>
              <DealCommissionSplit
                dealId={deal.id}
                primaryAdvisorId={deal.primary_advisor_id}
                split={deal.commission_split as Record<string, number>}
                team={team}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DealDocumentsChecklist dealId={deal.id} documents={documents} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Buyer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <Link href={`/crm/contacts/${buyer?.id}`} className="font-medium hover:underline">
                {buyer?.full_name ?? "Unknown"}
              </Link>
              {buyer?.phone && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" /> {buyer.phone}
                </span>
              )}
              {buyer?.email && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" /> {buyer.email}
                </span>
              )}
            </CardContent>
          </Card>

          {seller && (
            <Card>
              <CardHeader>
                <CardTitle>Seller</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <Link href={`/crm/contacts/${seller.id}`} className="font-medium hover:underline">
                  {seller.full_name}
                </Link>
                {seller.phone && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" /> {seller.phone}
                  </span>
                )}
              </CardContent>
            </Card>
          )}

          {listing && (
            <Card>
              <CardHeader>
                <CardTitle>Listing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <Link href={`/crm/listings/${listing.id}`} className="text-primary hover:underline">
                  View listing
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
