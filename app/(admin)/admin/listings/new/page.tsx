import { ListingCoreForm } from "../listing-core-form";

export default function NewListingPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-deep">New Listing</h1>
        <p className="text-sm text-muted-foreground">
          Save the basics first -- photos, amenities, and legal details can be added right after.
        </p>
      </div>
      <ListingCoreForm />
    </div>
  );
}
