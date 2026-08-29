"use client";

import { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getPublicMediaUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { updateTeamMemberPhoto } from "./actions";

export function TeamPhotoUploader({
  memberId,
  photoStoragePath,
  photoAltText,
  fullName,
}: {
  memberId: string;
  photoStoragePath: string | null;
  photoAltText: string | null;
  fullName: string;
}) {
  const [storagePath, setStoragePath] = useState(photoStoragePath);
  const [altText, setAltText] = useState(photoAltText);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `team/${memberId}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from("public-media")
      .upload(path, file, { upsert: false });

    if (uploadErr) {
      setError(uploadErr.message);
      setIsUploading(false);
      return;
    }

    const newAltText = `${fullName} headshot`;
    const result = await updateTeamMemberPhoto(memberId, path, newAltText);

    if (result.error) {
      setError(result.error);
      await supabase.storage.from("public-media").remove([path]);
      setIsUploading(false);
      return;
    }

    if (storagePath) {
      await supabase.storage.from("public-media").remove([storagePath]);
    }

    setStoragePath(path);
    setAltText(newAltText);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemove() {
    if (!storagePath) return;
    const supabase = createSupabaseBrowserClient();
    const result = await updateTeamMemberPhoto(memberId, null, null);
    if (result.error) {
      setError(result.error);
      return;
    }
    await supabase.storage.from("public-media").remove([storagePath]);
    setStoragePath(null);
    setAltText(null);
  }

  return (
    <div className="flex items-center gap-4">
      {storagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getPublicMediaUrl(storagePath)}
          alt={altText ?? fullName}
          className="h-20 w-20 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-alabaster text-xs text-muted-foreground">
          No photo
        </div>
      )}

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
          id="team-photo-upload"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : storagePath ? "Replace photo" : "Upload photo"}
          </Button>
          {storagePath ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
