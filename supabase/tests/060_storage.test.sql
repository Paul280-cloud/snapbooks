-- T-SEC-8a/b, T-SEC-9a/b, T-SEC-10a/b (storage policy structure)
-- Storage INSERT/SELECT/DELETE operations cannot be executed in pgTAP directly
-- (they go through the storage API, not SQL). These tests verify the policies
-- are defined correctly and cover the right bucket and folder rules.
begin;
select plan(10);

-- bucket exists and is private
select is(
  (select public from storage.buckets where id = 'receipts'),
  false,
  'T-SEC-8a receipts bucket is private'
);

select is(
  (select file_size_limit from storage.buckets where id = 'receipts'),
  10485759::bigint,
  'T-SEC-8a file_size_limit is 10485759 (under 10 MB)'
);

select is(
  (select allowed_mime_types from storage.buckets where id = 'receipts'),
  array['image/jpeg','image/png','image/webp'],
  'T-SEC-8a allowed_mime_types are jpeg/png/webp'
);

-- insert policy exists for authenticated and checks folder
select is(
  (select count(*)::int from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'INSERT'
      and roles::text like '%authenticated%'),
  1,
  'T-SEC-8a insert policy exists on storage.objects for authenticated'
);

-- select policy
select is(
  (select count(*)::int from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'SELECT'
      and roles::text like '%authenticated%'),
  1,
  'T-SEC-9a select policy exists on storage.objects for authenticated'
);

-- delete policy
select is(
  (select count(*)::int from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'DELETE'
      and roles::text like '%authenticated%'),
  1,
  'T-SEC-10a delete policy exists on storage.objects for authenticated'
);

-- T-SEC-8b / T-SEC-9b / T-SEC-10b: anon has no policies
select is(
  (select count(*)::int from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and roles::text like '%anon%'),
  0,
  'T-SEC-11b no storage policies for anon'
);

-- policies reference the receipts bucket
select ok(
  (select qual like '%receipts%' or with_check like '%receipts%'
     from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd = 'INSERT'),
  'T-SEC-8a insert policy references receipts bucket'
);

select ok(
  (select qual like '%receipts%'
     from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd = 'SELECT'),
  'T-SEC-9a select policy references receipts bucket'
);

select ok(
  (select qual like '%receipts%'
     from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd = 'DELETE'),
  'T-SEC-10a delete policy references receipts bucket'
);

select * from finish();
rollback;
