-- ============================================================================
-- DEMO / SEED DATA -- for local development and staging previews ONLY.
-- None of this should ever reach the production database as real inventory.
-- Run with: npx supabase db reset (local) or psql against a non-prod project.
--
-- NOTE on media: storage_path values below are placeholders under the
-- 'public-media' bucket (e.g. 'demo/skyline-heights/living-room-1.jpg'). They
-- will 404 until matching files are actually uploaded to Supabase Storage --
-- this seed only populates the database rows, it does not upload binaries.
-- ============================================================================

insert into public.developers (name, logo_storage_path, logo_alt_text, website_url, display_order, is_active) values
  ('Godrej Properties', 'demo/developers/godrej-properties-logo.png', 'Godrej Properties logo', 'https://www.godrejproperties.com', 1, true),
  ('Prestige Group', 'demo/developers/prestige-group-logo.png', 'Prestige Group logo', 'https://www.prestigeconstructions.com', 2, true),
  ('Sobha Limited', 'demo/developers/sobha-logo.png', 'Sobha Limited logo', 'https://www.sobha.com', 3, true);

insert into public.listings
  (slug, ref_code, title, description, property_type, status, locality, city, state, address, latitude, longitude,
   bhk, bathrooms, carpet_area_sqft, built_up_area_sqft, price_inr, parking_charges_inr,
   furnishing_status, possession_status, possession_date, facing_direction, vastu_score,
   is_rera_verified, virtual_tour_url, is_published)
values
  ('skyline-heights-bodakdev-4bhk', 'TR-1001',
   'Skyline Heights -- 4 BHK Sky Villa in Bodakdev',
   'A full-floor sky villa in the heart of Bodakdev with private terrace access, double-height living room, and views across the SG Highway skyline. Finished to a premium specification with imported marble flooring and a modular kitchen.',
   'Apartment', 'Active', 'Bodakdev', 'Ahmedabad', 'Gujarat', 'Nr. Bodakdev Cross Road, Bodakdev', 23.0339, 72.5083,
   4, 5, 3450, 4200, 42500000, 850000,
   'Semi-Furnished', 'Ready', null, 'NE', 'Excellent',
   true, null, true),

  ('the-ambli-court-3bhk', 'TR-1002',
   'The Ambli Court -- 3 BHK in Ambli-Bopal',
   'A gated low-rise development in Ambli-Bopal offering a 3 BHK residence with a clubhouse, landscaped gardens, and dedicated covered parking. Under-construction with possession expected within 18 months.',
   'Apartment', 'Active', 'Ambli', 'Ahmedabad', 'Gujarat', 'Ambli-Bopal Road, Ambli', 23.0136, 72.4869,
   3, 3, 1850, 2250, 13500000, 350000,
   'Unfurnished', 'Under Construction', '2027-12-01', 'E', 'Good',
   true, null, true),

  ('south-bopal-independent-villa', 'TR-1003',
   'Independent Villa -- South Bopal',
   'A standalone 5 BHK villa on a corner plot in South Bopal with a private garden, servant quarters, and a dedicated home office. Freehold title, ready to move.',
   'Villa', 'Under Offer', 'South Bopal', 'Ahmedabad', 'Gujarat', 'Near South Bopal Circle', 22.9958, 72.4586,
   5, 6, 4800, 6000, 65000000, null,
   'Fully-Furnished', 'Ready', null, 'N', 'Excellent',
   true, null, true),

  ('prahladnagar-pre-leased-commercial', 'TR-1004',
   'Pre-Leased Commercial Office -- Prahladnagar',
   'A pre-leased, high-yield commercial office unit on the Prahladnagar corridor, tenanted by an IT services firm on a long-term lease. GST-applicable commercial asset suited to investors seeking rental yield.',
   'Office', 'Active', 'Prahladnagar', 'Ahmedabad', 'Gujarat', 'Prahladnagar Garden Road', 23.0088, 72.5039,
   null, 2, 2200, 2600, 28000000, null,
   null, 'Ready', null, 'W', 'Average',
   true, null, true);

-- Legal status per listing
insert into public.listing_legal_status (listing_id, title_type_code, oc_status, oc_date, cc_status, cc_date, project_rera_number, project_rera_verification_url)
select id, 'freehold', 'Received', '2024-03-15', 'Received', '2022-01-10', 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA12345/280124', 'https://gujrera.gujarat.gov.in/'
from public.listings where slug = 'skyline-heights-bodakdev-4bhk';

insert into public.listing_legal_status (listing_id, title_type_code, oc_status, cc_status, cc_date, project_rera_number, project_rera_verification_url)
select id, 'freehold', 'Applied', 'Received', '2023-06-01', 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA23456/150623', 'https://gujrera.gujarat.gov.in/'
from public.listings where slug = 'the-ambli-court-3bhk';

insert into public.listing_legal_status (listing_id, title_type_code, oc_status, oc_date, cc_status, cc_date)
select id, 'freehold', 'Received', '2021-11-20', 'Received', '2019-05-12'
from public.listings where slug = 'south-bopal-independent-villa';

insert into public.listing_legal_status (listing_id, title_type_code, oc_status, oc_date, cc_status, cc_date, project_rera_number, project_rera_verification_url)
select id, 'freehold', 'Received', '2020-08-01', 'Received', '2018-02-14', 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA34567/010820', 'https://gujrera.gujarat.gov.in/'
from public.listings where slug = 'prahladnagar-pre-leased-commercial';

-- Sample images (see media note at top of file -- these paths need real uploads)
insert into public.listing_images (listing_id, storage_path, alt_text, room_category, display_order)
select id, 'demo/skyline-heights/living-room-1.jpg', 'Double-height living room with skyline view at Skyline Heights, Bodakdev', 'Living Room', 1
from public.listings where slug = 'skyline-heights-bodakdev-4bhk';
insert into public.listing_images (listing_id, storage_path, alt_text, room_category, display_order)
select id, 'demo/skyline-heights/exterior-1.jpg', 'Exterior facade of Skyline Heights tower, Bodakdev', 'Exterior', 2
from public.listings where slug = 'skyline-heights-bodakdev-4bhk';

insert into public.listing_images (listing_id, storage_path, alt_text, room_category, display_order)
select id, 'demo/ambli-court/exterior-1.jpg', 'Clubhouse and landscaped garden at The Ambli Court, Ambli-Bopal', 'Amenities', 1
from public.listings where slug = 'the-ambli-court-3bhk';

insert into public.listing_images (listing_id, storage_path, alt_text, room_category, display_order)
select id, 'demo/south-bopal-villa/exterior-1.jpg', 'Front facade and private garden of the South Bopal independent villa', 'Exterior', 1
from public.listings where slug = 'south-bopal-independent-villa';

insert into public.listing_images (listing_id, storage_path, alt_text, room_category, display_order)
select id, 'demo/prahladnagar-office/exterior-1.jpg', 'Commercial office building exterior on the Prahladnagar corridor', 'Exterior', 1
from public.listings where slug = 'prahladnagar-pre-leased-commercial';

-- Amenities
insert into public.listing_amenities (listing_id, amenity_id)
select l.id, a.id from public.listings l, public.amenities a
where l.slug = 'skyline-heights-bodakdev-4bhk'
  and a.name in ('Gated Security', 'Covered Parking', 'Power Backup', 'Lift/Elevator', 'Vastu Compliant', 'EV Charging Point');

insert into public.listing_amenities (listing_id, amenity_id)
select l.id, a.id from public.listings l, public.amenities a
where l.slug = 'the-ambli-court-3bhk'
  and a.name in ('Clubhouse', 'Gymnasium', 'Swimming Pool', 'Children''s Play Area', 'Gated Security', 'Rainwater Harvesting');

insert into public.listing_amenities (listing_id, amenity_id)
select l.id, a.id from public.listings l, public.amenities a
where l.slug = 'south-bopal-independent-villa'
  and a.name in ('Corner Plot', 'Covered Parking', 'Visitor Parking', 'Power Backup', 'Vastu Compliant');

insert into public.listing_amenities (listing_id, amenity_id)
select l.id, a.id from public.listings l, public.amenities a
where l.slug = 'prahladnagar-pre-leased-commercial'
  and a.name in ('Fire Safety (NOC)', 'Lift/Elevator', 'Covered Parking', 'Power Backup');

-- A curated collection
insert into public.collections (slug, title, intro_richtext, cover_image_storage_path, cover_image_alt_text, display_order, is_published)
values (
  'luxury-penthouses',
  'Luxury Penthouses',
  '<p>A hand-picked selection of Western Ahmedabad''s finest full-floor and sky residences -- chosen by our team for design quality, view corridors, and long-term value, not just square footage.</p>',
  'demo/collections/luxury-penthouses-cover.jpg',
  'Skyline view of a luxury penthouse tower in Western Ahmedabad',
  1, true
)
on conflict (slug) do nothing;

insert into public.collection_listings (collection_id, listing_id, display_order)
select c.id, l.id, 1 from public.collections c, public.listings l
where c.slug = 'luxury-penthouses' and l.slug = 'skyline-heights-bodakdev-4bhk'
on conflict (collection_id, listing_id) do nothing;
insert into public.collection_listings (collection_id, listing_id, display_order)
select c.id, l.id, 2 from public.collections c, public.listings l
where c.slug = 'luxury-penthouses' and l.slug = 'south-bopal-independent-villa'
on conflict (collection_id, listing_id) do nothing;

-- Two more home-page collections (idempotent via ON CONFLICT so re-running this
-- file after the first seed already landed is safe).
insert into public.collections (slug, title, intro_richtext, cover_image_storage_path, cover_image_alt_text, display_order, is_published)
values (
  'ready-to-move',
  'Ready-to-Move',
  '<p>No possession-date guesswork -- these listings are complete, OC-in-hand (or in final stages), and available to move into now.</p>',
  'demo/collections/ready-to-move-cover.jpg',
  'Move-in ready residential building exterior',
  2, true
)
on conflict (slug) do nothing;

insert into public.collection_listings (collection_id, listing_id, display_order)
select c.id, l.id, 1 from public.collections c, public.listings l
where c.slug = 'ready-to-move' and l.slug = 'skyline-heights-bodakdev-4bhk'
on conflict (collection_id, listing_id) do nothing;
insert into public.collection_listings (collection_id, listing_id, display_order)
select c.id, l.id, 2 from public.collections c, public.listings l
where c.slug = 'ready-to-move' and l.slug = 'south-bopal-independent-villa'
on conflict (collection_id, listing_id) do nothing;

insert into public.collections (slug, title, intro_richtext, cover_image_storage_path, cover_image_alt_text, display_order, is_published)
values (
  'high-yield-pre-leased-commercial',
  'High-Yield Pre-Leased Commercial',
  '<p>Tenanted commercial assets with an existing lease in place from day one -- built for investors who want rental income immediately, not after a search for a tenant.</p>',
  'demo/collections/commercial-cover.jpg',
  'Modern commercial office building facade',
  3, true
)
on conflict (slug) do nothing;

insert into public.collection_listings (collection_id, listing_id, display_order)
select c.id, l.id, 1 from public.collections c, public.listings l
where c.slug = 'high-yield-pre-leased-commercial' and l.slug = 'prahladnagar-pre-leased-commercial'
on conflict (collection_id, listing_id) do nothing;

-- Testimonials
insert into public.testimonials (author_name, author_location, content, rating, is_published, display_order) values
  ('Rakesh Mehta', 'Bodakdev, Ahmedabad', 'Treeton Realty found us a home that matched exactly what we described -- no time wasted on irrelevant options. The RERA paperwork walkthrough gave us real confidence.', 5, true, 1),
  ('Priya Shah', 'NRI buyer, based in the UK', 'Buying property in Ahmedabad from overseas felt risky until we worked with Treeton. They explained the legal status of every property in plain English and arranged video site visits.', 5, true, 2);
