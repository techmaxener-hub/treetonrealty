-- Phase 3.2: inventory writes are Admin/Team Lead/Broker only. Sub-Brokers and
-- non-sales Staff keep read access (via is_staff(), unchanged) but cannot create
-- or edit listings -- sub-brokers get "read-only access to Active inventory to
-- share with their network" per spec 3.2.
drop policy if exists "listings_insert_staff" on public.listings;
create policy "listings_insert_broker_or_above" on public.listings
  for insert with check (public.is_broker_or_above());

drop policy if exists "listings_update_staff" on public.listings;
create policy "listings_update_broker_or_above" on public.listings
  for update using (public.is_broker_or_above()) with check (public.is_broker_or_above());

drop policy if exists "listings_delete_staff" on public.listings;
create policy "listings_delete_broker_or_above" on public.listings
  for delete using (public.is_broker_or_above());

drop policy if exists "listing_images_insert_staff" on public.listing_images;
create policy "listing_images_insert_broker_or_above" on public.listing_images
  for insert with check (public.is_broker_or_above());

drop policy if exists "listing_images_update_staff" on public.listing_images;
create policy "listing_images_update_broker_or_above" on public.listing_images
  for update using (public.is_broker_or_above()) with check (public.is_broker_or_above());

drop policy if exists "listing_images_delete_staff" on public.listing_images;
create policy "listing_images_delete_broker_or_above" on public.listing_images
  for delete using (public.is_broker_or_above());

drop policy if exists "listing_floor_plans_insert_staff" on public.listing_floor_plans;
create policy "listing_floor_plans_insert_broker_or_above" on public.listing_floor_plans
  for insert with check (public.is_broker_or_above());

drop policy if exists "listing_floor_plans_update_staff" on public.listing_floor_plans;
create policy "listing_floor_plans_update_broker_or_above" on public.listing_floor_plans
  for update using (public.is_broker_or_above()) with check (public.is_broker_or_above());

drop policy if exists "listing_floor_plans_delete_staff" on public.listing_floor_plans;
create policy "listing_floor_plans_delete_broker_or_above" on public.listing_floor_plans
  for delete using (public.is_broker_or_above());

drop policy if exists "listing_amenities_insert_staff" on public.listing_amenities;
create policy "listing_amenities_insert_broker_or_above" on public.listing_amenities
  for insert with check (public.is_broker_or_above());

drop policy if exists "listing_amenities_delete_staff" on public.listing_amenities;
create policy "listing_amenities_delete_broker_or_above" on public.listing_amenities
  for delete using (public.is_broker_or_above());

drop policy if exists "listing_legal_status_insert_staff" on public.listing_legal_status;
create policy "listing_legal_status_insert_broker_or_above" on public.listing_legal_status
  for insert with check (public.is_broker_or_above());

drop policy if exists "listing_legal_status_update_staff" on public.listing_legal_status;
create policy "listing_legal_status_update_broker_or_above" on public.listing_legal_status
  for update using (public.is_broker_or_above()) with check (public.is_broker_or_above());

drop policy if exists "listing_legal_status_delete_staff" on public.listing_legal_status;
create policy "listing_legal_status_delete_broker_or_above" on public.listing_legal_status
  for delete using (public.is_broker_or_above());
