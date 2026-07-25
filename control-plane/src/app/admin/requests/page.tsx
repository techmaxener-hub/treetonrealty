import { createClient } from "@/lib/supabase/server";
import { getSignupRequests } from "@/lib/data/admin";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SignupRequestActions } from "@/components/admin/signup-request-actions";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = { pending: "secondary", approved: "default", rejected: "destructive" } as const;

export default async function SignupRequestsPage() {
  const supabase = await createClient();
  const requests = await getSignupRequests(supabase);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Signup requests</h1>
        <p className="text-sm text-muted-foreground">Requests from the public /signup form, newest first.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No signup requests yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.business_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{req.owner_name}</span>
                      <span className="text-xs text-muted-foreground">{req.owner_email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{req.proposed_slug}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[req.status]} className="capitalize">
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(req.created_at)}</TableCell>
                  <TableCell>
                    <SignupRequestActions request={req} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
