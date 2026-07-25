import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables } from "@/lib/types/database";

export type ContactListItem = Tables<"contacts"> & { leadCount: number };

export async function getContactsList(supabase: TypedSupabaseClient): Promise<ContactListItem[]> {
  const { data: contacts, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  if (!contacts?.length) return [];

  const { data: leads } = await supabase.from("leads").select("contact_id");
  const leadCountByContact = new Map<string, number>();
  for (const lead of leads ?? []) {
    leadCountByContact.set(lead.contact_id, (leadCountByContact.get(lead.contact_id) ?? 0) + 1);
  }

  return contacts.map((c) => ({ ...c, leadCount: leadCountByContact.get(c.id) ?? 0 }));
}

export async function getContactDetail(supabase: TypedSupabaseClient, contactId: string) {
  const { data: contact, error } = await supabase.from("contacts").select("*").eq("id", contactId).single();
  if (error) throw error;

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  let duplicateOf: Pick<Tables<"contacts">, "id" | "full_name" | "phone"> | null = null;
  if (contact.potential_duplicate_of) {
    const { data } = await supabase
      .from("contacts")
      .select("id, full_name, phone")
      .eq("id", contact.potential_duplicate_of)
      .maybeSingle();
    duplicateOf = data ?? null;
  }

  return { contact, leads: leads ?? [], duplicateOf };
}
