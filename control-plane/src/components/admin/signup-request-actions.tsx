"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { Tables } from "@/lib/types/database";

export function SignupRequestActions({ request }: { request: Tables<"broker_signup_requests"> }) {
  const router = useRouter();
  const [slug, setSlug] = useState(request.proposed_slug);
  const [reason, setReason] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (request.status !== "pending") {
    return <span className="text-xs capitalize text-muted-foreground">{request.status}</span>;
  }

  async function handleApprove() {
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("approve_broker_signup", { p_request_id: request.id, p_slug: slug });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Approved -- provisioning started.");
    setApproveOpen(false);
    router.push(`/admin/brokers/${data}`);
  }

  async function handleReject() {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("reject_broker_signup", { p_request_id: request.id, p_reason: reason || null });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Rejected.");
    setRejectOpen(false);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {request.business_name}?</DialogTitle>
            <DialogDescription>Creates the broker instance and starts provisioning.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={submitting || !slug.trim()}>
              {submitting ? "Approving…" : "Approve & provision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {request.business_name}?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting}>
              {submitting ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={() => setRejectOpen(true)}>
        Reject
      </Button>
      <Button size="sm" onClick={() => setApproveOpen(true)}>
        Approve
      </Button>
    </div>
  );
}
