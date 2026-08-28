-- Phase 3.2: "Withdrawn" is a fourth real status alongside Active/Under Offer/Sold
-- (Draft is kept too -- it predates this and is still useful for staff prepping a
-- listing before is_published is flipped). Changing status must never delete a
-- listing (needed for historical/inventory-aging reporting); Sold/Withdrawn stay
-- in the table but the public site's is_published flag is what actually hides them.
-- In its own migration file/transaction: ALTER TYPE ... ADD VALUE cannot be used
-- in the same transaction it's added in on all supported Postgres versions.
alter type public.listing_status_enum add value if not exists 'Withdrawn';
