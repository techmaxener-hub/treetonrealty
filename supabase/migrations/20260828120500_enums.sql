-- Enums for stable, small value sets used across listings. States (for stamp duty /
-- listing address) and legal title types are deliberately NOT enums here -- they're
-- lookup tables / plain text so they can grow without a schema migration.

create type public.property_type_enum as enum (
  'Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop'
);

create type public.listing_status_enum as enum (
  'Active', 'Under Offer', 'Sold', 'Draft'
);

create type public.furnishing_status_enum as enum (
  'Unfurnished', 'Semi-Furnished', 'Fully-Furnished'
);

create type public.possession_status_enum as enum (
  'Ready', 'Under Construction'
);

create type public.facing_direction_enum as enum (
  'N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'
);

create type public.vastu_score_enum as enum (
  'Excellent', 'Good', 'Average', 'Not Vastu Compliant'
);

create type public.room_category_enum as enum (
  'Living Room', 'Bedroom', 'Kitchen', 'Exterior', 'Amenities', 'Floor Plan'
);

create type public.floor_plan_type_enum as enum ('2D', '3D');

create type public.certificate_status_enum as enum (
  'Not Applied', 'Applied', 'Received'
);

create type public.lead_source_enum as enum (
  'contact_page', 'brochure_download', 'site_visit_request', 'other'
);

create type public.lead_status_enum as enum (
  'New', 'Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Closed Won', 'Closed Lost'
);

create type public.site_visit_status_enum as enum (
  'Requested', 'Confirmed', 'Completed', 'Cancelled'
);
