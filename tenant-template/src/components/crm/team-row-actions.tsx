"use client";

import { useCurrentProfile, canManage } from "@/lib/hooks/use-current-profile";
import { EditAdvisorProfileDialog } from "@/components/crm/edit-advisor-profile-dialog";
import type { Tables } from "@/lib/types/database";

export function TeamRowActions({
  profileId,
  fullName,
  existing,
}: {
  profileId: string;
  fullName: string;
  existing: Tables<"advisor_profiles"> | null;
}) {
  const current = useCurrentProfile();
  const canEdit = canManage(current.role) || current.id === profileId;

  if (!canEdit) return null;
  return <EditAdvisorProfileDialog profileId={profileId} fullName={fullName} existing={existing} />;
}
