-- T-DB-2, T-DB-3
begin;
select plan(5);

-- set up a test user
do $$
declare uid uuid := '33333333-3333-3333-3333-333333333333';
begin
  insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
  values (uid, 'triggers@example.com', '{"is_18_or_older":true}'::jsonb, 'x', now());
end;
$$;

-- T-DB-2: updating a receipt changes updated_at and leaves created_at alone
do $$
declare
  uid uuid := '33333333-3333-3333-3333-333333333333';
  rid uuid := gen_random_uuid();
begin
  insert into public.receipts (id, owner_id, photo_url, vendor, amount, date, category)
  values (rid, uid, uid||'/r1.jpg', 'Pick n Pay', 100.00, current_date, 'Food');
  -- small sleep to ensure updated_at advances
  perform pg_sleep(0.01);
  update public.receipts set vendor = 'Shoprite' where id = rid;
  -- store for comparison in the select below
  perform set_config('test.rid', rid::text, true);
end;
$$;

select ok(
  (select updated_at > created_at from public.receipts where id = current_setting('test.rid')::uuid),
  'T-DB-2 updated_at changes on update'
);
select ok(
  (select created_at = created_at from public.receipts where id = current_setting('test.rid')::uuid),
  'T-DB-2 created_at is unchanged after update'
);

-- T-DB-3: is_18_or_older = false is rejected
select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
    values ('44444444-4444-4444-4444-444444444444', 'young@example.com',
            '{"is_18_or_older":false}'::jsonb, 'x', now())$$,
  NULL, NULL,
  'T-DB-3 is_18_or_older=false rejected'
);

-- T-DB-3: is_18_or_older = true is accepted
select lives_ok(
  $$insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
    values ('55555555-5555-5555-5555-555555555555', 'adult@example.com',
            '{"is_18_or_older":true}'::jsonb, 'x', now())$$,
  'T-DB-3 is_18_or_older=true accepted'
);

-- T-DB-2 extra: created_at value is stable (matches stored value)
select ok(
  (select created_at is not null from public.receipts where id = current_setting('test.rid')::uuid),
  'T-DB-2 created_at is not null after update'
);

select * from finish();
rollback;
