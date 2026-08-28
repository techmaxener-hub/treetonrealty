import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import { ContactForm } from "@/components/contact/contact-form";
import { getSiteSettings } from "@/lib/queries/site-settings";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Treeton Realty -- Bodakdev / Ambli-Bopal, Ahmedabad.",
};

// ISR: admin-editable site_settings, no build-time Supabase dependency.
export const revalidate = 3600;

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-alabaster px-6 pb-24 pt-28">
      <div className="container">
        <p className="font-serif text-lg italic text-gold-600">Get In Touch</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-deep">Contact Us</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Have a question about a listing, want a site visit, or just want to talk through your
          search? Reach out -- we typically respond within a business day.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <ContactForm />

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-elevate">
              <div className="space-y-4 text-sm">
                {settings.companyAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    <p className="text-slate-deep">{settings.companyAddress}</p>
                  </div>
                )}
                {settings.whatsappNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-gold-600" />
                    <a href={`tel:${settings.whatsappNumber}`} className="text-slate-deep hover:underline">
                      {settings.whatsappNumber}
                    </a>
                  </div>
                )}
                {settings.companyEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-gold-600" />
                    <a href={`mailto:${settings.companyEmail}`} className="text-slate-deep hover:underline">
                      {settings.companyEmail}
                    </a>
                  </div>
                )}
                {settings.whatsappNumber && (
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-medium text-[#1ebe5a] hover:underline"
                  >
                    <FaWhatsapp className="h-4 w-4 shrink-0" />
                    Chat on WhatsApp
                  </a>
                )}
                {!settings.companyAddress && !settings.whatsappNumber && !settings.companyEmail && (
                  <p className="text-muted-foreground">
                    Contact details have not been added yet -- please check back soon.
                  </p>
                )}
              </div>
            </div>

            {settings.googleMapsEmbedUrl ? (
              <div className="h-72 overflow-hidden rounded-2xl border border-border">
                <iframe
                  src={settings.googleMapsEmbedUrl}
                  title="Office location map"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                Map embed not configured yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
