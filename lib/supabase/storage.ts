import { supabase } from "@/lib/supabase/client";

/** Public URL for a file in the public-media bucket (listing photos, floor plans, logos, avatars). */
export function getPublicMediaUrl(storagePath: string): string {
  return supabase.storage.from("public-media").getPublicUrl(storagePath).data.publicUrl;
}
