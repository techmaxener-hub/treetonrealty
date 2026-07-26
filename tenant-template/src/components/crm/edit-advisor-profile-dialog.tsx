"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Tables, LocalizedText } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { LocalizedField } from "@/components/crm/localized-field";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function EditAdvisorProfileDialog({
  profileId,
  fullName,
  existing,
}: {
  profileId: string;
  fullName: string;
  existing: Tables<"advisor_profiles"> | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState(existing?.display_name ?? fullName);
  const [slug, setSlug] = useState(existing?.slug ?? slugify(fullName));
  const [bio, setBio] = useState<LocalizedText>((existing?.bio as LocalizedText) ?? {});
  const [specialization, setSpecialization] = useState(existing?.specialization.join(", ") ?? "");
  const [yearsExperience, setYearsExperience] = useState(existing?.years_experience?.toString() ?? "");
  const [languagesSpoken, setLanguagesSpoken] = useState(existing?.languages_spoken.join(", ") ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(existing?.linkedin_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(existing?.instagram_url ?? "");
  const [publicPhone, setPublicPhone] = useState(existing?.public_phone ?? "");
  const [publicWhatsapp, setPublicWhatsapp] = useState(existing?.public_whatsapp ?? "");
  const [isPublic, setIsPublic] = useState(existing?.is_public ?? true);
  const [photoUrl, setPhotoUrl] = useState(existing?.photo_url ?? "");

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${profileId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("advisor-photos").upload(path, file);
    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
    } else {
      const { data } = supabase.storage.from("advisor-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      profile_id: profileId,
      display_name: displayName,
      slug,
      bio,
      specialization: specialization.split(",").map((s) => s.trim()).filter(Boolean),
      years_experience: yearsExperience ? Number(yearsExperience) : null,
      languages_spoken: languagesSpoken.split(",").map((s) => s.trim()).filter(Boolean),
      linkedin_url: linkedinUrl || null,
      instagram_url: instagramUrl || null,
      public_phone: publicPhone || null,
      public_whatsapp: publicWhatsapp || null,
      is_public: isPublic,
      photo_url: photoUrl || null,
    };

    const { error } = existing
      ? await supabase.from("advisor_profiles").update(payload).eq("id", existing.id)
      : await supabase.from("advisor_profiles").insert(payload);

    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
    } else {
      toast.success("Public profile saved");
      setOpen(false);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {existing ? "Edit public profile" : "Create public profile"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Public profile — {fullName}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- preview of a just-uploaded Storage URL
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? "Uploading…" : "Upload photo"}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Display name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>URL slug</Label>
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Bio</Label>
            <LocalizedField value={bio} onChange={setBio} multiline placeholder="A few lines about their experience…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Specialization (comma separated)</Label>
              <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Bopal, Luxury homes" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Years of experience</Label>
              <Input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Languages spoken (comma separated)</Label>
            <Input value={languagesSpoken} onChange={(e) => setLanguagesSpoken(e.target.value)} placeholder="English, Hindi, Gujarati" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>LinkedIn URL</Label>
              <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Instagram URL</Label>
              <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Direct phone (optional)</Label>
              <Input value={publicPhone} onChange={(e) => setPublicPhone(e.target.value)} placeholder="Shown on their listings" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Direct WhatsApp (optional)</Label>
              <Input value={publicWhatsapp} onChange={(e) => setPublicWhatsapp(e.target.value)} placeholder="Falls back to the office number" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4" />
            Visible on the public site
          </label>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
