-- Storage bucket + RLS for deal documents (agreement, token receipt,
-- buyer/seller KYC). Objects are stored as {deal_id}/{random}-{filename},
-- mirroring the listing-media convention -- but unlike listing-media,
-- this bucket stays private. Agreements and KYC scans are the kind of
-- thing "reachable if you guess the UUID" is not an acceptable trade-off
-- for, the way it was for photos. Every read goes through a signed URL
-- (createSignedUrl), and every access -- read, write, or signed-URL
-- issuance -- is gated by the same broker/downline rule deal_documents
-- and deals already enforce at the table level.

insert into storage.buckets (id, name, public)
values ('deal-documents', 'deal-documents', false)
on conflict (id) do nothing;

create policy deal_documents_storage_all on storage.objects
  for all to authenticated
  using (
    bucket_id = 'deal-documents'
    and exists (
      select 1 from deals d
      where d.id::text = (storage.foldername(name))[1]
        and (public.is_broker() or public.in_own_downline(d.primary_advisor_id))
    )
  )
  with check (
    bucket_id = 'deal-documents'
    and exists (
      select 1 from deals d
      where d.id::text = (storage.foldername(name))[1]
        and (public.is_broker() or public.in_own_downline(d.primary_advisor_id))
    )
  );
