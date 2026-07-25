"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Star, Trash2, Upload, Youtube } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function extractYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function ListingMediaManager({ listingId, media }: { listingId: string; media: Tables<"listing_media">[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const photos = media.filter((m) => m.media_type === "photo" || m.media_type === "floor_plan");
  const videos = media.filter((m) => m.media_type === "video_youtube");

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>, mediaType: "photo" | "floor_plan") {
    const files = event.target.files;
    if (!files?.length) return;
    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const path = `${listingId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("listing-media").upload(path, file);
      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        continue;
      }
      const { data: publicUrl } = supabase.storage.from("listing-media").getPublicUrl(path);
      const { error: insertError } = await supabase.from("listing_media").insert({
        listing_id: listingId,
        media_type: mediaType,
        url: publicUrl.publicUrl,
        display_order: media.length,
        is_cover: mediaType === "photo" && photos.length === 0,
      });
      if (insertError) toast.error(`Couldn't save ${file.name}: ${insertError.message}`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleAddVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const youtubeId = extractYoutubeId(videoUrl);
    if (!youtubeId) {
      toast.error("That doesn't look like a YouTube URL");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("listing_media").insert({
      listing_id: listingId,
      media_type: "video_youtube",
      url: videoUrl,
      display_order: media.length,
    });
    if (error) {
      toast.error(`Couldn't add video: ${error.message}`);
    } else {
      setVideoUrl("");
      router.refresh();
    }
  }

  async function handleDelete(item: Tables<"listing_media">) {
    const supabase = createClient();
    if (item.media_type !== "video_youtube") {
      const path = item.url.split("/listing-media/")[1];
      if (path) await supabase.storage.from("listing-media").remove([path]);
    }
    const { error } = await supabase.from("listing_media").delete().eq("id", item.id);
    if (error) toast.error(`Couldn't remove: ${error.message}`);
    else router.refresh();
  }

  async function handleSetCover(item: Tables<"listing_media">) {
    const supabase = createClient();
    await supabase.from("listing_media").update({ is_cover: false }).eq("listing_id", listingId).eq("is_cover", true);
    const { error } = await supabase.from("listing_media").update({ is_cover: true }).eq("id", item.id);
    if (error) toast.error(`Couldn't set cover: ${error.message}`);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Photos &amp; floor plans</h3>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload photo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, "photo")}
            />
          </div>
        </div>
        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-md border bg-secondary">
                <Image src={item.url} alt="" fill className="object-cover" sizes="200px" />
                {item.is_cover && (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Cover</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleSetCover(item)}
                    className={cn("rounded bg-white/90 p-1", item.is_cover && "text-amber-500")}
                    title="Set as cover"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDelete(item)} className="rounded bg-white/90 p-1 text-destructive" title="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Video walkthrough (YouTube)</h3>
        <form onSubmit={handleAddVideo} className="mb-3 flex gap-2">
          <Input placeholder="https://youtube.com/watch?v=…" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          <Button type="submit" size="sm">
            <Youtube className="h-3.5 w-3.5" /> Add
          </Button>
        </form>
        {videos.length > 0 && (
          <ul className="flex flex-col gap-2">
            {videos.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <a href={item.url} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">
                  {item.url}
                </a>
                <button type="button" onClick={() => handleDelete(item)} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
