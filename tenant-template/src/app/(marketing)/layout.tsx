import { createClient } from "@/lib/supabase/server";
import { getBrokerProfile } from "@/lib/data/public/broker-profile";
import { LanguageProvider } from "@/lib/hooks/use-language";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { CompareBar } from "@/components/site/compare-bar";
import { AttributionCapture } from "@/components/site/attribution-capture";
import { AbandonedBrowsePrompt } from "@/components/site/abandoned-browse-prompt";
import type { BrokerContact } from "@/lib/types/broker-content";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const broker = await getBrokerProfile(supabase);
  const contact = (broker?.contact ?? {}) as BrokerContact;
  const defaultLanguage = (broker?.default_language as "en" | "hi" | "gu") ?? "en";

  return (
    <LanguageProvider defaultLanguage={defaultLanguage}>
      <div className="flex min-h-screen flex-col">
        <AttributionCapture />
        <SiteHeader broker={broker} />
        <main className="flex-1">{children}</main>
        <SiteFooter broker={broker} />
        {contact.whatsapp_number && (
          <WhatsAppButton number={contact.whatsapp_number} message={`Hi ${broker?.display_name ?? ""}, I'd like to know more.`} />
        )}
        <CompareBar />
        <AbandonedBrowsePrompt whatsappNumber={contact.whatsapp_number} brokerName={broker?.display_name} />
      </div>
    </LanguageProvider>
  );
}
