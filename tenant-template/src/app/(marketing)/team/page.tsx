import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublicAdvisors } from "@/lib/data/public/advisors";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createClient();
  const advisors = await getPublicAdvisors(supabase);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Our team</h1>
      <p className="mb-6 text-muted-foreground">Personalized guidance from people who know the market.</p>

      {advisors.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Team profiles coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advisors.map((advisor) => (
            <Link
              key={advisor.id}
              href={`/advisors/${advisor.slug}`}
              className="flex flex-col items-center gap-3 rounded-lg border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-secondary">
                {advisor.photo_url ? (
                  <Image src={advisor.photo_url} alt="" fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{advisor.display_name}</p>
                {advisor.specialization.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">{advisor.specialization.join(", ")}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
