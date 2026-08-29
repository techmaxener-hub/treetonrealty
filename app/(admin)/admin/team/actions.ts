"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import type { Database } from "@/lib/supabase/database.types";

type TeamMemberInsert = Database["public"]["Tables"]["team_members"]["Insert"];

function str(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (raw === null) return null;
  const trimmed = String(raw).trim();
  return trimmed === "" ? null : trimmed;
}

function parseTeamMemberFields(formData: FormData) {
  const full_name = str(formData, "full_name");
  const role = str(formData, "role");
  const bio = str(formData, "bio");

  if (!full_name || !role || !bio) {
    return { error: "Name, role, and bio are required." };
  }

  const displayOrderRaw = formData.get("display_order");
  const display_order = displayOrderRaw ? Number(displayOrderRaw) : 0;

  const fields: Partial<TeamMemberInsert> = {
    full_name,
    role,
    bio,
    display_order: Number.isFinite(display_order) ? display_order : 0,
    is_published: formData.get("is_published") === "on",
  };

  return { fields };
}

export async function createTeamMember(formData: FormData) {
  const parsed = parseTeamMemberFields(formData);
  if (parsed.error || !parsed.fields) {
    return { error: parsed.error ?? "Invalid form data." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("team_members")
    .insert(parsed.fields as TeamMemberInsert)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/team");
  redirect(`/admin/team/${data.id}/edit`);
}

export async function updateTeamMember(id: string, formData: FormData) {
  const parsed = parseTeamMemberFields(formData);
  if (parsed.error || !parsed.fields) {
    return { error: parsed.error ?? "Invalid form data." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("team_members").update(parsed.fields).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${id}/edit`);
  revalidatePath("/about");
  return { error: null };
}

export async function setTeamMemberPublished(id: string, isPublished: boolean) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("team_members")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { error: null };
}

export async function deleteTeamMember(id: string, photoStoragePath: string | null) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);

  if (error) return { error: error.message };

  if (photoStoragePath) {
    await supabase.storage.from("public-media").remove([photoStoragePath]);
  }

  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { error: null };
}

export async function updateTeamMemberPhoto(
  id: string,
  storagePath: string | null,
  altText: string | null
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("team_members")
    .update({ photo_storage_path: storagePath, photo_alt_text: altText })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/team/${id}/edit`);
  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { error: null };
}
