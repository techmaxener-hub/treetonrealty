import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getListingDetail } from "@/lib/data/listings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ListingOverviewForm } from "@/components/crm/listing-overview-form";
import { ListingMediaManager } from "@/components/crm/listing-media-manager";
import { ListingInternalForm } from "@/components/crm/listing-internal-form";
import { ListingOwnerSection } from "@/components/crm/listing-owner-section";
import { localizedText } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  let detail: Awaited<ReturnType<typeof getListingDetail>>;
  try {
    detail = await getListingDetail(supabase, id);
  } catch {
    notFound();
  }

  const { listing, internal, media, owners, team, localities } = detail;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href="/crm/listings" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <h1 className="mb-4 text-xl font-semibold">{localizedText(listing.title) || listing.slug}</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
          {internal !== null && <TabsTrigger value="internal">Internal</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-4">
              <ListingOverviewForm listing={listing} localities={localities} team={team} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardContent className="pt-4">
              <ListingMediaManager listingId={listing.id} media={media} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owner">
          <Card>
            <CardContent className="pt-4">
              <ListingOwnerSection listingId={listing.id} owners={owners} />
            </CardContent>
          </Card>
        </TabsContent>

        {internal !== null && (
          <TabsContent value="internal">
            <Card>
              <CardContent className="pt-4">
                <ListingInternalForm listingId={listing.id} internal={internal} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
