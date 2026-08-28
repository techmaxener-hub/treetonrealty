import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-alabaster px-6 pt-20 text-center">
      <p className="font-serif text-lg italic text-gold-600">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-slate-deep">
        This Listing Is No Longer Available
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The property you&rsquo;re looking for may have been sold, delisted, or the link is
        incorrect.
      </p>
      <Button variant="primary" size="lg" className="mt-8" asChild>
        <Link href="/properties">Browse Live Listings</Link>
      </Button>
    </div>
  );
}
