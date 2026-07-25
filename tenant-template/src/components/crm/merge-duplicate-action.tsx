"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentProfile, canManage } from "@/lib/hooks/use-current-profile";

export function MergeDuplicateAction({
  duplicateId,
  duplicateName,
  originalId,
  originalName,
}: {
  duplicateId: string;
  duplicateName: string;
  originalId: string;
  originalName: string;
}) {
  const router = useRouter();
  const profile = useCurrentProfile();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!canManage(profile.role)) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5" /> Possible duplicate of {originalName}
      </span>
    );
  }

  async function handleMerge() {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("merge_contacts", { p_keep_id: originalId, p_duplicate_id: duplicateId });
    if (error) {
      toast.error(`Couldn't merge: ${error.message}`);
    } else {
      toast.success(`Merged into ${originalName}`);
      setOpen(false);
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" /> Possible duplicate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge duplicate contact?</DialogTitle>
          <DialogDescription>
            Every lead, deal, and saved search on <strong>{duplicateName}</strong> moves to{" "}
            <strong>{originalName}</strong>, and the <strong>{duplicateName}</strong> record is deleted. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleMerge} disabled={submitting}>
            {submitting ? "Merging…" : `Merge into ${originalName}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
