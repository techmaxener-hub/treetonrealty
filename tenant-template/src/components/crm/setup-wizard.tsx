"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/use-current-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LANGUAGES, ROLE_LABELS } from "@/lib/constants";
import type { ProfileRole, Tables } from "@/lib/types/database";
import type { BrokerContact, BrokerBranding } from "@/lib/types/broker-content";

const STEPS = ["Business profile", "Branding", "Invite your team", "Finish"] as const;

// Only employee/master_advisor/advisor can be invited from here --
// reporting to the broker directly is the only option that makes sense
// at first-run, since nobody else exists yet to report to (skip-level
// reporting is exactly this: an org can have master_advisors or even
// advisors reporting straight to the broker with no employee/master_advisor
// in between -- see ARCHITECTURE.md's role hierarchy section).
const INVITABLE_ROLES: ProfileRole[] = ["employee", "master_advisor", "advisor"];

export function SetupWizard({ initialProfile }: { initialProfile: Tables<"broker_profile"> | null }) {
  const router = useRouter();
  const profile = useCurrentProfile();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const contact = (initialProfile?.contact ?? {}) as BrokerContact;
  const branding = (initialProfile?.branding ?? {}) as BrokerBranding;

  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? "");
  const [legalName, setLegalName] = useState(initialProfile?.legal_name ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(contact.whatsapp_number ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [defaultLanguage, setDefaultLanguage] = useState(initialProfile?.default_language ?? "en");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(initialProfile?.supported_languages ?? ["en"]);
  const [yearsInBusiness, setYearsInBusiness] = useState(String(initialProfile?.years_in_business ?? ""));

  const [logoUrl, setLogoUrl] = useState(branding.logo_url ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(branding.hero_image_url ?? "");
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color ?? "");
  const [secondaryColor, setSecondaryColor] = useState(branding.secondary_color ?? "");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState<ProfileRole>("employee");
  const [invitesSent, setInvitesSent] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);

  function toggleLanguage(lang: string) {
    setSupportedLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  }

  async function saveBusinessProfile() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("broker_profile").upsert({
      id: true,
      display_name: displayName,
      legal_name: legalName || null,
      contact: { phone: phone || undefined, whatsapp_number: whatsappNumber || undefined, email: email || undefined },
      default_language: defaultLanguage,
      supported_languages: supportedLanguages.length > 0 ? supportedLanguages : [defaultLanguage],
      years_in_business: yearsInBusiness ? Number(yearsInBusiness) : null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStep(1);
  }

  async function saveBranding() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("broker_profile").upsert({
      id: true,
      display_name: displayName,
      branding: {
        logo_url: logoUrl || undefined,
        hero_image_url: heroImageUrl || undefined,
        primary_color: primaryColor || undefined,
        secondary_color: secondaryColor || undefined,
      },
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStep(2);
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviting(true);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, full_name: inviteFullName, role: inviteRole, reports_to_id: profile.id }),
    });
    const json = await res.json();
    setInviting(false);
    if (!res.ok) {
      toast.error(json.error ?? "Couldn't send invite");
      return;
    }
    toast.success(`Invited ${inviteEmail}.`);
    setInvitesSent((prev) => [...prev, `${inviteFullName} <${inviteEmail}> (${ROLE_LABELS[inviteRole]})`]);
    setInviteEmail("");
    setInviteFullName("");
  }

  async function finish() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("broker_profile").upsert({ id: true, display_name: displayName, onboarding_completed: true });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push("/crm");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>
        <CardTitle>{STEPS[step]}</CardTitle>
        <CardDescription>
          {step === 0 && "Tell us about your brokerage -- this powers your public site and CRM."}
          {step === 1 && "Add your logo and brand colors. You can change these anytime."}
          {step === 2 && "Invite employees, master advisors, or advisors to join. You can always do this later from Team."}
          {step === 3 && "You're all set."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="display_name">Business name</Label>
              <Input id="display_name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="legal_name">Legal name (optional)</Label>
              <Input id="legal_name" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Default language</Label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="years">Years in business</Label>
                <Input id="years" type="number" min={0} value={yearsInBusiness} onChange={(e) => setYearsInBusiness(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Languages your site supports</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    type="button"
                    key={l.value}
                    onClick={() => toggleLanguage(l.value)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm",
                      supportedLanguages.includes(l.value) ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={saveBusinessProfile} disabled={saving || !displayName.trim()} className="self-end">
              {saving ? "Saving…" : "Next"}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input id="logo_url" placeholder="https://…" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hero_image_url">Homepage banner image URL (optional)</Label>
              <Input
                id="hero_image_url"
                placeholder="https://…"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">A wide photo for your homepage&apos;s top banner — a property, your office, or your team.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="primary_color">Primary color</Label>
                <Input id="primary_color" type="text" placeholder="#0f5132" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="secondary_color">Secondary color</Label>
                <Input
                  id="secondary_color"
                  type="text"
                  placeholder="#f5f5f5"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={saveBranding} disabled={saving}>
                {saving ? "Saving…" : "Next"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleInvite} className="flex flex-col gap-3 rounded-md border p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite_full_name">Name</Label>
                  <Input id="invite_full_name" required value={inviteFullName} onChange={(e) => setInviteFullName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite_email">Email</Label>
                  <Input id="invite_email" type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as ProfileRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVITABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={inviting || !inviteEmail.trim() || !inviteFullName.trim()}>
                  {inviting ? "Sending…" : "Send invite"}
                </Button>
              </div>
            </form>

            {invitesSent.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">Invited so far</p>
                {invitesSent.map((s) => (
                  <p key={s} className="text-sm">
                    {s}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>{invitesSent.length > 0 ? "Next" : "Skip for now"}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Your business profile is saved{invitesSent.length > 0 ? ` and ${invitesSent.length} teammate${invitesSent.length === 1 ? "" : "s"} invited` : ""}.
              You can revisit any of this from the CRM later.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={finish} disabled={saving}>
                {saving ? "Finishing…" : "Go to dashboard"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
