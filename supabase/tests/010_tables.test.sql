-- T-DB-1, T-DB-4, T-DB-5
begin;
select plan(28);

-- T-DB-1: users table structure
select has_table('public', 'users', 'T-DB-1 users table exists');
select has_column('public', 'users', 'id',            'T-DB-1 users.id exists');
select has_column('public', 'users', 'email',         'T-DB-1 users.email exists');
select has_column('public', 'users', 'display_name',  'T-DB-1 users.display_name exists');
select has_column('public', 'users', 'is_18_or_older','T-DB-1 users.is_18_or_older exists');
select has_column('public', 'users', 'created_at',    'T-DB-1 users.created_at exists');
select col_not_null('public', 'users', 'id',          'T-DB-1 users.id not null');
select col_not_null('public', 'users', 'email',       'T-DB-1 users.email not null');
select col_is_null( 'public', 'users', 'display_name','T-DB-1 users.display_name nullable');
select col_not_null('public', 'users', 'is_18_or_older','T-DB-1 users.is_18_or_older not null');
select col_not_null('public', 'users', 'created_at',    'T-DB-1 users.created_at not null');

-- T-DB-1: receipts table structure
select has_table('public', 'receipts', 'T-DB-1 receipts table exists');
select has_column('public', 'receipts', 'id',         'T-DB-1 receipts.id exists');
select has_column('public', 'receipts', 'owner_id',   'T-DB-1 receipts.owner_id exists');
select has_column('public', 'receipts', 'photo_url',  'T-DB-1 receipts.photo_url exists');
select has_column('public', 'receipts', 'vendor',     'T-DB-1 receipts.vendor exists');
select has_column('public', 'receipts', 'amount',     'T-DB-1 receipts.amount exists');
select has_column('public', 'receipts', 'date',       'T-DB-1 receipts.date exists');
select has_column('public', 'receipts', 'category',   'T-DB-1 receipts.category exists');
select has_column('public', 'receipts', 'created_at', 'T-DB-1 receipts.created_at exists');
select has_column('public', 'receipts', 'updated_at', 'T-DB-1 receipts.updated_at exists');
select col_type_is('public', 'receipts', 'amount', 'numeric(12,2)', 'T-DB-1 receipts.amount is numeric(12,2)');
select col_type_is('public', 'receipts', 'date',   'date',          'T-DB-1 receipts.date is date');

-- T-DB-1: handle_new_user creates users row with lower-case email
do $$
declare
  test_id uuid := '11111111-1111-1111-1111-111111111111';
begin
  insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
  values (test_id, 'TEST@example.com',
          '{"is_18_or_older":true,"display_name":"Test User"}'::jsonb,
          'x', now());
end;
$$;
select is(
  (select email from public.users where id = '11111111-1111-1111-1111-111111111111'),
  'test@example.com',
  'T-DB-1 handle_new_user lower-cases email'
);

-- T-DB-4: deleting auth.users cascades to users and receipts
do $$
declare
  uid uuid := '22222222-2222-2222-2222-222222222222';
begin
  insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
  values (uid, 'cascade@example.com', '{"is_18_or_older":true}'::jsonb, 'x', now());
  insert into public.receipts (id, owner_id, photo_url, vendor, amount, date, category)
  values (gen_random_uuid(), uid, uid||'/r1.jpg', 'Shoprite', 50.00, current_date, 'Food');
  delete from auth.users where id = uid;
end;
$$;
select is(
  (select count(*)::int from public.users   where id = '22222222-2222-2222-2222-222222222222'),
  0, 'T-DB-4 users row deleted on auth.users delete'
);
select is(
  (select count(*)::int from public.receipts where owner_id = '22222222-2222-2222-2222-222222222222'),
  0, 'T-DB-4 receipts deleted on auth.users delete'
);

-- T-DB-5: both indexes exist
select has_index('public', 'receipts', 'receipts_owner_date_idx',     'T-DB-5 owner+date index exists');
select has_index('public', 'receipts', 'receipts_owner_category_idx', 'T-DB-5 owner+category index exists');

select * from finish();
rollback;
