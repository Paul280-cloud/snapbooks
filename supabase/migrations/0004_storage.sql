-- Migration 0004: private receipts bucket and storage policies (SEC8–SEC10)
-- File size limit: 10 485 759 bytes (one byte under 10 MB; a 10 MB file is rejected)
-- Allowed types: JPEG, PNG, WebP

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485759,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- SEC8: upload — owner's folder only
create policy receipts_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- SEC9: read — owner's folder only
create policy receipts_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- SEC10: delete — owner's folder only
create policy receipts_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
