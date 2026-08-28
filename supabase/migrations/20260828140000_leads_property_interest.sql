-- The contact page form (spec 1.8) includes a "property interest" dropdown that
-- isn't necessarily a specific listing (e.g. "3 BHK Apartment", "Commercial") --
-- distinct from listing_id, which links to one specific published listing.
alter table public.leads
  add column property_interest text;
