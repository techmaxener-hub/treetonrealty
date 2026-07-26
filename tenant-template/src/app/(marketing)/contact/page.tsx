import { Phone, Mail, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBrokerProfile } from "@/lib/data/public/broker-profile";
import { ContactForm } from "@/components/site/contact-form";
import { SavedSearchForm } from "@/components/site/saved-search-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import type { BrokerContact } from "@/lib/types/broker-content";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const supabase = await createClient();
  const broker = await getBrokerProfile(supabase);
  const contact = (broker?.contact ?? {}) as BrokerContact;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="mb-6 text-2xl font-semibold">Get in touch</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2 text-sm">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-primary">
                <Phone className="h-4 w-4" /> {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-primary">
                <Mail className="h-4 w-4" /> {contact.email}
              </a>
            )}
            {contact.address && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {contact.address}
              </p>
            )}
          </div>

          {contact.office_lat && contact.office_lng && (
            <div className="aspect-video overflow-hidden rounded-lg border">
              <iframe
                className="h-full w-full"
                loading="lazy"
                src={`https://www.google.com/maps?q=${contact.office_lat},${contact.office_lng}&output=embed`}
                title="Office location"
              />
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get notified of new matches</CardTitle>
            <p className="text-sm text-muted-foreground">Tell us your budget and BHK — we&apos;ll reach out when something fits.</p>
          </CardHeader>
          <CardContent>
            <SavedSearchForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
