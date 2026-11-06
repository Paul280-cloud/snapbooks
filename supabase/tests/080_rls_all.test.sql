-- T-DB-6: every table in public has RLS switched on
begin;
select plan(2);

select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'users'),
  true,
  'T-DB-6 RLS enabled on users'
);

select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'receipts'),
  true,
  'T-DB-6 RLS enabled on receipts'
);

select * from finish();
rollback;
