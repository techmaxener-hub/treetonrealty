import { createClient } from "@/lib/supabase/server";
import { getContactsList } from "@/lib/data/contacts";
import { ContactsTable } from "@/components/crm/contacts-table";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const supabase = await createClient();
  const contacts = await getContactsList(supabase);

  return <ContactsTable contacts={contacts} />;
}
