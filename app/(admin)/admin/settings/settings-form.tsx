"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSiteSettings } from "./actions";
import type { SiteSettingsRow } from "./types";

export function SettingsForm({ settings }: { settings: SiteSettingsRow }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    startTransition(() => {
      updateSiteSettings(formData).then((res) => {
        if (res?.error) setError(res.error);
        else setSaved(true);
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp_number">WhatsApp Business Number</Label>
            <Input
              id="whatsapp_number"
              name="whatsapp_number"
              defaultValue={settings.whatsapp_number ?? ""}
              placeholder="+91 98765 43210"
            />
            <p className="text-xs text-muted-foreground">
              E.164 format (with country code). Every WhatsApp button on the public site is
              hidden until this is set.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company_email">Company Email</Label>
            <Input id="company_email" name="company_email" type="email" defaultValue={settings.company_email ?? ""} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="company_address">Company Address</Label>
            <Input id="company_address" name="company_address" defaultValue={settings.company_address ?? ""} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="google_maps_embed_url">Google Maps Embed URL</Label>
            <Input
              id="google_maps_embed_url"
              name="google_maps_embed_url"
              defaultValue={settings.google_maps_embed_url ?? ""}
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Compliance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rera_broker_reg_no">RERA Broker Registration Number</Label>
            <Input
              id="rera_broker_reg_no"
              name="rera_broker_reg_no"
              defaultValue={settings.rera_broker_reg_no ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Social Links
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input id="instagram_url" name="instagram_url" defaultValue={settings.instagram_url ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input id="facebook_url" name="facebook_url" defaultValue={settings.facebook_url ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" name="linkedin_url" defaultValue={settings.linkedin_url ?? ""} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Homepage Trust Counters
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="stat_transacted_value_inr">Transacted Value (INR)</Label>
            <Input
              id="stat_transacted_value_inr"
              name="stat_transacted_value_inr"
              type="number"
              defaultValue={settings.stat_transacted_value_inr ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stat_years_experience">Years of Experience</Label>
            <Input
              id="stat_years_experience"
              name="stat_years_experience"
              type="number"
              defaultValue={settings.stat_years_experience ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stat_verified_inventory_count">Verified Inventory Count</Label>
            <Input
              id="stat_verified_inventory_count"
              name="stat_verified_inventory_count"
              type="number"
              defaultValue={settings.stat_verified_inventory_count ?? ""}
            />
          </div>
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-700">Saved.</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
