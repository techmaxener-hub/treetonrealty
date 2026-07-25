import { createClient } from "@/lib/supabase/server";
import { getBrokerProfile } from "@/lib/data/public/broker-profile";
import { SetupWizard } from "@/components/crm/setup-wizard";

export const dynamic = "force-dynamic";

// Broker-only by construction: middleware only ever routes a broker here
// (see lib/supabase/middleware.ts), and re-visiting after onboarding is
// complete just re-opens the wizard pre-filled -- useful for touching up
// the business profile later, not just a one-time gate.
export default async function SetupPage() {
  const supabase = await createClient();
  const brokerProfile = await getBrokerProfile(supabase);

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-6 py-8">
      <SetupWizard initialProfile={brokerProfile} />
    </div>
  );
}
