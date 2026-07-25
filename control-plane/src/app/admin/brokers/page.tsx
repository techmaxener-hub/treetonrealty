import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBrokerInstances } from "@/lib/data/admin";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BROKER_STATUS_LABELS, BROKER_STATUS_CLASSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BrokerInstancesPage() {
  const supabase = await createClient();
  const brokers = await getBrokerInstances(supabase);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Broker instances</h1>
        <p className="text-sm text-muted-foreground">Every physically separate broker deployment this platform manages.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {brokers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No broker instances yet -- approve a signup request to create one.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Deployment</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brokers.map((broker) => (
                <TableRow key={broker.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link href={`/admin/brokers/${broker.id}`} className="hover:underline">
                      {broker.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{broker.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={BROKER_STATUS_CLASSES[broker.status]}>
                      {BROKER_STATUS_LABELS[broker.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{broker.plan_tier}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{broker.subdomain ?? broker.deployment_url ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(broker.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
