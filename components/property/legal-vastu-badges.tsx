import { BadgeCheck, Clock, Compass, ExternalLink, ShieldCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  CERTIFICATE_EXPLANATIONS,
  FACING_DIRECTION_LABELS,
  RERA_EXPLANATION,
  TITLE_TYPE_EXPLANATIONS,
  VASTU_SCORE_EXPLANATIONS,
} from "@/lib/legal-glossary";
import type {
  FacingDirection,
  ListingLegalStatus,
  VastuScore,
} from "@/lib/queries/listings";
import type { Database } from "@/lib/supabase/database.types";

type CertificateStatus = Database["public"]["Enums"]["certificate_status_enum"];

function CertificateBadge({
  label,
  status,
  date,
  explanation,
}: {
  label: string;
  status: CertificateStatus;
  date: string | null;
  explanation: string;
}) {
  const variant = status === "Received" ? "verified" : status === "Applied" ? "muted" : "outline";
  const Icon = status === "Received" ? BadgeCheck : status === "Applied" ? Clock : XCircle;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5">
      <Badge variant={variant} className="px-2.5 py-1">
        <Icon className="h-3.5 w-3.5" />
        {label}: {status}
      </Badge>
      {date && <span className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString("en-IN")}</span>}
      <InfoTooltip label={explanation} />
    </div>
  );
}

export function LegalVastuBadges({
  legalStatus,
  isReraVerified,
  vastuScore,
  facingDirection,
}: {
  legalStatus: ListingLegalStatus | null;
  isReraVerified: boolean;
  vastuScore: VastuScore | null;
  facingDirection: FacingDirection | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-display text-xl font-semibold text-slate-deep">Legal &amp; Vastu</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5">
          <Badge variant="outline" className="px-2.5 py-1">
            {legalStatus?.titleTypeLabel ?? "Title Type Not Set"}
          </Badge>
          {legalStatus && (
            <InfoTooltip label={TITLE_TYPE_EXPLANATIONS[legalStatus.titleTypeCode] ?? ""} />
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5">
          <Badge variant={isReraVerified ? "verified" : "muted"} className="px-2.5 py-1">
            {isReraVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {isReraVerified ? "RERA Registered" : "RERA Pending"}
          </Badge>
          <InfoTooltip label={RERA_EXPLANATION} />
        </div>

        {legalStatus && (
          <>
            <CertificateBadge
              label="OC"
              status={legalStatus.ocStatus}
              date={legalStatus.ocDate}
              explanation={CERTIFICATE_EXPLANATIONS.oc}
            />
            <CertificateBadge
              label="CC"
              status={legalStatus.ccStatus}
              date={legalStatus.ccDate}
              explanation={CERTIFICATE_EXPLANATIONS.cc}
            />
          </>
        )}

        {facingDirection && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5">
            <Badge variant="outline" className="px-2.5 py-1">
              <Compass className="h-3.5 w-3.5" />
              {FACING_DIRECTION_LABELS[facingDirection]}
            </Badge>
          </div>
        )}

        {vastuScore && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5">
            <Badge variant={vastuScore === "Not Vastu Compliant" ? "muted" : "verified"} className="px-2.5 py-1">
              Vastu: {vastuScore}
            </Badge>
            <InfoTooltip label={VASTU_SCORE_EXPLANATIONS[vastuScore]} />
          </div>
        )}
      </div>

      {legalStatus?.projectReraNumber && (
        <div className="mt-4 rounded-lg bg-muted px-3 py-2.5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Project RERA Number</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <code className="text-xs text-slate-deep">{legalStatus.projectReraNumber}</code>
            {legalStatus.projectReraVerificationUrl && (
              <a
                href={legalStatus.projectReraVerificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-gold-600 hover:underline"
              >
                Verify on RERA portal <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
