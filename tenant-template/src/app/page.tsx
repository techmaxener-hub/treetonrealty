import { redirect } from "next/navigation";

// The public marketing site lands here in Step 6. For now the root just
// hands off to the CRM, which the middleware will bounce to /login if
// there's no session.
export default function RootPage() {
  redirect("/crm/leads");
}
