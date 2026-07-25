import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrokerInstance, getProvisioningJobs } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProvisioningTimeline } from "@/components/admin/provisioning-timeline";
import { BROKER_STATUS_LABELS, BROKER_STATUS_CLASSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BrokerInstanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [broker, jobs] = await Promise.all([getBrokerInstance(supabase, id), getProvisioningJobs(supabase, id)]);

  if (!broker) notFound();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{broker.name}</h1>
          <Badge variant="outline" className={BROKER_STATUS_CLASSES[broker.status]}>
            {BROKER_STATUS_LABELS[broker.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{broker.slug}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instance details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p>{broker.owner_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p>{broker.owner_email ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Plan</p>
                <p className="capitalize">{broker.plan_tier}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{formatDateTime(broker.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Supabase project</p>
                <p className="font-mono text-xs">{broker.supabase_project_ref ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Deployment</p>
                <p className="font-mono text-xs">{broker.deployment_url ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Subdomain</p>
                <p className="font-mono text-xs">{broker.subdomain ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Provisioned</p>
                <p>{formatDateTime(broker.provisioned_at)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Provisioning</CardTitle>
            </CardHeader>
            <CardContent>
              <ProvisioningTimeline brokerInstanceId={broker.id} jobs={jobs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
