"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnumSelect } from "./enum-select";
import { upsertLegalStatus } from "./actions";
import {
  CERTIFICATE_STATUSES,
  type CertificateStatus,
  type LegalTitleTypeRow,
  type ListingLegalStatusRow,
} from "./types";

export function ListingLegalStatusForm({
  listingId,
  titleTypes,
  initial,
}: {
  listingId: string;
  titleTypes: LegalTitleTypeRow[];
  initial: ListingLegalStatusRow | null;
}) {
  const [titleTypeCode, setTitleTypeCode] = useState(initial?.title_type_code ?? "");
  const titleTypeLabels = Object.fromEntries(titleTypes.map((t) => [t.code, t.label]));
  const [ocStatus, setOcStatus] = useState<CertificateStatus>(initial?.oc_status ?? "Not Applied");
  const [ccStatus, setCcStatus] = useState<CertificateStatus>(initial?.cc_status ?? "Not Applied");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      upsertLegalStatus(listingId, formData).then((res) => {
        if (res.error) setError(res.error);
        else setSaved(true);
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="max-w-2xl text-xs text-muted-foreground">
        RERA number and certificate details are admin-entered facts about this specific
        property -- never invent or guess a value here. Leave blank until confirmed with the
        developer/seller.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Title Type</Label>
          <EnumSelect
            name="title_type_code"
            value={titleTypeCode}
            onChange={setTitleTypeCode}
            options={titleTypes.map((t) => t.code)}
            labels={titleTypeLabels}
            placeholder="Select title type"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="project_rera_number">Project RERA Number</Label>
          <Input
            id="project_rera_number"
            name="project_rera_number"
            defaultValue={initial?.project_rera_number ?? ""}
            placeholder="Not yet confirmed"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="project_rera_verification_url">RERA Verification URL</Label>
          <Input
            id="project_rera_verification_url"
            name="project_rera_verification_url"
            defaultValue={initial?.project_rera_verification_url ?? ""}
            placeholder="https://gujrera.gujarat.gov.in/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Occupancy Certificate (OC)</Label>
          <EnumSelect
            name="oc_status"
            value={ocStatus}
            onChange={(v) => setOcStatus(v as CertificateStatus)}
            options={CERTIFICATE_STATUSES}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oc_date">OC Date</Label>
          <Input id="oc_date" name="oc_date" type="date" defaultValue={initial?.oc_date ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label>Completion Certificate (CC)</Label>
          <EnumSelect
            name="cc_status"
            value={ccStatus}
            onChange={(v) => setCcStatus(v as CertificateStatus)}
            options={CERTIFICATE_STATUSES}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cc_date">CC Date</Label>
          <Input id="cc_date" name="cc_date" type="date" defaultValue={initial?.cc_date ?? ""} />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-700">Saved.</p> : null}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving..." : "Save legal status"}
      </Button>
    </form>
  );
}
