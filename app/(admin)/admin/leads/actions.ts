"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import type { LeadActivityRow, LeadStatus } from "./types";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/leads");
  return { error: null };
}

export async function getLeadActivities(leadId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_activities")
    .select("id, activity_type, content, created_at, actor:profiles(full_name)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .returns<LeadActivityRow[]>();

  if (error) {
    return { error: error.message, activities: [] };
  }

  return { error: null, activities: data };
}

export async function addLeadNote(leadId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "Note can't be empty." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in." };
  }

  const { error } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    actor_id: user.id,
    activity_type: "note",
    content: trimmed,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/leads");
  return { error: null };
}
