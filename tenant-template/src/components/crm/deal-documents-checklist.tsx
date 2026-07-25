"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, DealDocType } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DEAL_DOC_TYPE_LABELS, DEAL_DOC_STATUS_LABELS, DEAL_DOC_STATUS_CLASSES } from "@/lib/constants";

export function DealDocumentsChecklist({ dealId, documents }: { dealId: string; documents: Tables<"deal_documents">[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DealDocType>("agreement");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();

    const path = `${dealId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("deal-documents").upload(path, file);
    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("deal_documents").insert({
      deal_id: dealId,
      doc_type: docType,
      file_url: path,
      status: "uploaded",
      uploaded_at: new Date().toISOString(),
    });
    if (insertError) toast.error(`Couldn't record document: ${insertError.message}`);

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleView(doc: Tables<"deal_documents">) {
    if (!doc.file_url) return;
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("deal-documents").createSignedUrl(doc.file_url, 60);
    if (error || !data) {
      toast.error(`Couldn't open document: ${error?.message ?? "unknown error"}`);
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function handleVerify(doc: Tables<"deal_documents">) {
    const supabase = createClient();
    const { error } = await supabase.from("deal_documents").update({ status: "verified" }).eq("id", doc.id);
    if (error) toast.error(`Couldn't verify: ${error.message}`);
    else router.refresh();
  }

  async function handleDelete(doc: Tables<"deal_documents">) {
    const supabase = createClient();
    if (doc.file_url) await supabase.storage.from("deal-documents").remove([doc.file_url]);
    const { error } = await supabase.from("deal_documents").delete().eq("id", doc.id);
    if (error) toast.error(`Couldn't remove: ${error.message}`);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div>
                <p className="font-medium">{DEAL_DOC_TYPE_LABELS[doc.doc_type]}</p>
                <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", DEAL_DOC_STATUS_CLASSES[doc.status])}>
                  {DEAL_DOC_STATUS_LABELS[doc.status]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {doc.file_url && (
                  <button type="button" onClick={() => handleView(doc)} className="text-primary" title="View">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
                {doc.status !== "verified" && (
                  <button type="button" onClick={() => handleVerify(doc)} className="text-emerald-600" title="Mark verified">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(doc)} className="text-destructive" title="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 border-t pt-3">
        <Select value={docType} onValueChange={(v) => setDocType(v as DealDocType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(DEAL_DOC_TYPE_LABELS) as [DealDocType, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  );
}
