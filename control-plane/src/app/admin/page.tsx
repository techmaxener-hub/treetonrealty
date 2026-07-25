import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSignupRequests, getBrokerInstances } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const [pendingRequests, brokers] = await Promise.all([getSignupRequests(supabase, "pending"), getBrokerInstances(supabase)]);

  const counts = {
    provisioning: brokers.filter((b) => b.status === "provisioning").length,
    active: brokers.filter((b) => b.status === "active").length,
    suspended: brokers.filter((b) => b.status === "suspended").length,
    cancelled: brokers.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Broker instance registry and provisioning status.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Link href="/admin/requests">
            <Card className="transition-colors hover:bg-secondary/50">
              <CardContent className="flex flex-col gap-1 pt-4">
                <p className="text-xs font-medium text-muted-foreground">Pending requests</p>
                <p className="text-2xl font-semibold tabular-nums">{pendingRequests.length}</p>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardContent className="flex flex-col gap-1 pt-4">
              <p className="text-xs font-medium text-muted-foreground">Provisioning</p>
              <p className="text-2xl font-semibold tabular-nums">{counts.provisioning}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-1 pt-4">
              <p className="text-xs font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold tabular-nums">{counts.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-1 pt-4">
              <p className="text-xs font-medium text-muted-foreground">Suspended</p>
              <p className="text-2xl font-semibold tabular-nums">{counts.suspended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-1 pt-4">
              <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-semibold tabular-nums">{counts.cancelled}</p>
            </CardContent>
          </Card>
        </div>

        {pendingRequests.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Awaiting review</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {pendingRequests.slice(0, 5).map((req) => (
                <Link key={req.id} href="/admin/requests" className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-secondary/50">
                  <span className="font-medium">{req.business_name}</span>
                  <span className="text-muted-foreground">{req.owner_email}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
