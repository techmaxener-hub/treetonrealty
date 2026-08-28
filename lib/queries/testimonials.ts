import { supabase } from "@/lib/supabase/client";
import { getPublicMediaUrl } from "@/lib/supabase/storage";

export interface Testimonial {
  id: string;
  authorName: string;
  authorLocation: string | null;
  content: string;
  rating: number | null;
  avatarUrl: string | null;
  avatarAlt: string | null;
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`getPublishedTestimonials: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    authorLocation: row.author_location,
    content: row.content,
    rating: row.rating,
    avatarUrl: row.avatar_storage_path ? getPublicMediaUrl(row.avatar_storage_path) : null,
    avatarAlt: row.avatar_alt_text,
  }));
}
