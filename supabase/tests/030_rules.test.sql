-- T-BR1-3, T-BR2-2, T-BR4-1, T-BR6-1, T-BR7-3
begin;
select plan(26);

-- set up two test users (A fills to limit; B used for T-BR7-3)
do $$
begin
  insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'rules@example.com',
          '{"is_18_or_older":true}'::jsonb, 'x', now());
  insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
  values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'rules2@example.com',
          '{"is_18_or_older":true}'::jsonb, 'x', now());
end;
$$;

-- helper: insert a receipt for user A
create or replace function pg_temp.ok_receipt(p_vendor text, p_amount numeric, p_date date, p_category text)
returns void language plpgsql as $$
begin
  insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/r.jpg',
          p_vendor, p_amount, p_date, p_category);
end;
$$;

-- T-BR1-3: vendor "" rejected
select throws_ok(
  $$select pg_temp.ok_receipt('', 10.00, current_date, 'Food')$$,
  NULL, NULL, 'T-BR1-3 vendor empty string rejected'
);

-- T-BR1-3: vendor "   " rejected
select throws_ok(
  $$select pg_temp.ok_receipt('   ', 10.00, current_date, 'Food')$$,
  NULL, NULL, 'T-BR1-3 vendor whitespace-only rejected'
);

-- T-BR1-3: vendor 101 chars rejected
select throws_ok(
  $$select pg_temp.ok_receipt(repeat('a',101), 10.00, current_date, 'Food')$$,
  NULL, NULL, 'T-BR1-3 vendor 101 chars rejected'
);

-- T-BR1-3: vendor 1 char accepted
select lives_ok(
  $$select pg_temp.ok_receipt('A', 10.00, current_date, 'Food')$$,
  'T-BR1-3 vendor 1 char accepted'
);

-- T-BR1-3: vendor 100 chars accepted
select lives_ok(
  $$select pg_temp.ok_receipt(repeat('a',100), 10.00, current_date, 'Food')$$,
  'T-BR1-3 vendor 100 chars accepted'
);

-- T-BR1-3: amount 0 rejected
select throws_ok(
  $$select pg_temp.ok_receipt('Shop', 0, current_date, 'Food')$$,
  NULL, NULL, 'T-BR1-3 amount 0 rejected'
);

-- T-BR1-3: amount -1 rejected
select throws_ok(
  $$select pg_temp.ok_receipt('Shop', -1, current_date, 'Food')$$,
  NULL, NULL, 'T-BR1-3 amount -1 rejected'
);

-- T-BR1-3: amount 1000000 rejected (> 999999.99)
select throws_ok(
  $$select pg_temp.ok_receipt('Shop', 1000000, current_date, 'Food')$$,
  NULL, NULL, 'T-BR1-3 amount 1000000 rejected'
);

-- T-BR1-3: amount 0.01 accepted
select lives_ok(
  $$select pg_temp.ok_receipt('Shop', 0.01, current_date, 'Food')$$,
  'T-BR1-3 amount 0.01 accepted'
);

-- T-BR1-3: amount 999999.99 accepted
select lives_ok(
  $$select pg_temp.ok_receipt('Shop', 999999.99, current_date, 'Food')$$,
  'T-BR1-3 amount 999999.99 accepted'
);

-- T-BR1-3: future date raises receipt_date_in_future (P0002)
select throws_ok(
  $$select pg_temp.ok_receipt('Shop', 10.00, current_date + 1, 'Food')$$,
  'P0002', 'receipt_date_in_future',
  'T-BR1-3 future date rejected with receipt_date_in_future'
);

-- T-BR1-3: today accepted
select lives_ok(
  $$select pg_temp.ok_receipt('Shop', 10.00, current_date, 'Food')$$,
  'T-BR1-3 today date accepted'
);

-- T-BR1-3: missing vendor (NOT NULL) rejected
select throws_ok(
  $$insert into public.receipts (owner_id, photo_url, amount, date, category)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/r.jpg', 10.00, current_date, 'Food')$$,
  NULL, NULL, 'T-BR1-3 missing vendor rejected'
);

-- T-BR2-2: invalid category rejected
select throws_ok(
  $$select pg_temp.ok_receipt('Shop', 10.00, current_date, 'Travel')$$,
  NULL, NULL, 'T-BR2-2 category Travel rejected'
);

-- T-BR2-2: all valid categories accepted
select lives_ok($$select pg_temp.ok_receipt('S', 1, current_date, 'Food')$$,  'T-BR2-2 Food accepted');
select lives_ok($$select pg_temp.ok_receipt('S', 1, current_date, 'Stock')$$, 'T-BR2-2 Stock accepted');
select lives_ok($$select pg_temp.ok_receipt('S', 1, current_date, 'Fuel')$$,  'T-BR2-2 Fuel accepted');
select lives_ok($$select pg_temp.ok_receipt('S', 1, current_date, 'Rent')$$,  'T-BR2-2 Rent accepted');
select lives_ok($$select pg_temp.ok_receipt('S', 1, current_date, 'Other')$$, 'T-BR2-2 Other accepted');

-- T-BR4-1: fill user A to exactly 500 receipts
do $$
declare
  uid uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  current_count int;
  i int;
begin
  select count(*) into current_count from public.receipts where owner_id = uid;
  for i in 1..(500 - current_count) loop
    insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
    values (uid, uid||'/b'||i||'.jpg', 'Bulk', 1.00, current_date, 'Other');
  end loop;
end;
$$;

select is(
  (select count(*)::int from public.receipts where owner_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  500,
  'T-BR4-1 exactly 500 receipts'
);

-- T-BR4-1: 501st raises receipt_limit_reached
select throws_ok(
  $$insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/over.jpg', 'Over', 1.00, current_date, 'Other')$$,
  'P0001', 'receipt_limit_reached',
  'T-BR4-1 501st receipt raises receipt_limit_reached'
);

-- T-BR4-1: a different user is unaffected
select lives_ok(
  $$insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/r1.jpg', 'Shop', 1.00, current_date, 'Food')$$,
  'T-BR4-1 different user unaffected by limit'
);

-- T-BR6-1: no after-delete trigger on receipts
select is(
  (select count(*)::int from information_schema.triggers
    where event_object_schema = 'public'
      and event_object_table = 'receipts'
      and event_manipulation = 'DELETE'
      and action_timing = 'AFTER'),
  0,
  'T-BR6-1 no after-delete trigger on receipts'
);

-- T-BR6-1: pg_cron not installed
select is(
  (select count(*)::int from information_schema.tables
    where table_schema = 'cron'),
  0,
  'T-BR6-1 pg_cron not installed'
);

-- T-BR7-3: negative amount rejected — use user B (user A is at the 500-receipt limit)
select throws_ok(
  $$insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/neg.jpg', 'Shop', -0.01, current_date, 'Food')$$,
  NULL, NULL, 'T-BR7-3 negative amount rejected'
);

-- T-BR7-3: 149 is stored as 149.00
do $$
declare rid uuid := gen_random_uuid();
begin
  insert into public.receipts (id, owner_id, photo_url, vendor, amount, date, category)
  values (rid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/check.jpg', 'Shop', 149, current_date, 'Food');
  perform set_config('test.br73rid', rid::text, true);
end;
$$;
select is(
  (select amount from public.receipts where id = current_setting('test.br73rid')::uuid),
  149.00::numeric(12,2),
  'T-BR7-3 amount 149 stored as 149.00'
);

select * from finish();
rollback;
