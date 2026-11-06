-- T-SEC-4a/b, T-SEC-5a/b, T-SEC-6a/b, T-SEC-7a/b
begin;
select plan(14);

-- seed two users
do $$
begin
  insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
  values
    ('00000000-0000-0000-0000-000000000001', 'zanele.d@example.com',
     '{"is_18_or_older":true}'::jsonb, 'x', now()),
    ('00000000-0000-0000-0000-000000000002', 'mpho.s@example.com',
     '{"is_18_or_older":true}'::jsonb, 'x', now());
end;
$$;

-- insert a receipt for Zanele as superuser (bypasses RLS)
do $$
declare rid uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
begin
  insert into public.receipts (id, owner_id, photo_url, vendor, amount, date, category)
  values (rid, '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000001/r1.jpg',
          'Pick n Pay', 100.00, current_date, 'Food');
  insert into public.receipts (id, owner_id, photo_url, vendor, amount, date, category)
  values (gen_random_uuid(), '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000002/r1.jpg',
          'Shoprite', 50.00, current_date, 'Food');
end;
$$;

-- act as Zanele
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

-- T-SEC-4a: Zanele can read her own receipts
select is(
  (select count(*)::int from public.receipts where owner_id = '00000000-0000-0000-0000-000000000001'),
  1,
  'T-SEC-4a owner can read own receipts'
);

-- T-SEC-4b: Zanele cannot read Mpho's receipts
select is(
  (select count(*)::int from public.receipts where owner_id = '00000000-0000-0000-0000-000000000002'),
  0,
  'T-SEC-4b owner cannot read another user''s receipts'
);

-- T-SEC-5a: Zanele can insert a receipt with owner_id = her own id
select lives_ok(
  $$insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
    values ('00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001/r2.jpg',
            'BP', 200.00, current_date, 'Fuel')$$,
  'T-SEC-5a owner can insert own receipt'
);

-- T-SEC-5b: Zanele cannot insert a receipt with Mpho's owner_id
select throws_ok(
  $$insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
    values ('00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000002/r2.jpg',
            'BP', 200.00, current_date, 'Fuel')$$,
  'T-SEC-5b cannot insert receipt with another user''s owner_id'
);

-- T-SEC-6a: Zanele can update vendor/amount/date/category on her own receipt
select lives_ok(
  $$update public.receipts set vendor = 'PnP', amount = 110.00
    where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'$$,
  'T-SEC-6a owner can update own receipt fields'
);

-- T-SEC-6b: Zanele cannot update Mpho's receipt
select is(
  (select count(*)::int from public.receipts
    where owner_id = '00000000-0000-0000-0000-000000000002'
      and vendor = 'Hacked'),
  0,
  'T-SEC-6b update of another user''s receipt affects 0 rows'
);

-- (attempt the update — it should silently affect 0 rows because RLS filters it)
update public.receipts set vendor = 'Hacked'
  where owner_id = '00000000-0000-0000-0000-000000000002';

select is(
  (select count(*)::int from public.receipts
    where owner_id = '00000000-0000-0000-0000-000000000002'
      and vendor = 'Hacked'),
  0,
  'T-SEC-6b Mpho''s vendor unchanged after Zanele''s update attempt'
);

-- T-SEC-6b: Zanele cannot update owner_id (no column grant)
select throws_ok(
  $$update public.receipts set owner_id = '00000000-0000-0000-0000-000000000002'
    where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'$$,
  'T-SEC-6b cannot update owner_id (no column grant)'
);

-- T-SEC-7a: Zanele can delete her own receipt
select lives_ok(
  $$delete from public.receipts where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'$$,
  'T-SEC-7a owner can delete own receipt'
);

-- T-SEC-7b: Zanele cannot delete Mpho's receipt (delete affects 0 rows)
do $$
begin
  delete from public.receipts where owner_id = '00000000-0000-0000-0000-000000000002';
end;
$$;
select is(
  (select count(*)::int from public.receipts where owner_id = '00000000-0000-0000-0000-000000000002'),
  1,
  'T-SEC-7b Mpho''s receipt survives Zanele''s delete attempt'
);

-- T-SEC-11b: anon gets no receipts
reset role;
set local role anon;
select is(
  (select count(*)::int from public.receipts),
  0,
  'T-SEC-11b anon gets no rows from receipts'
);

-- T-SEC-11b: anon cannot insert
reset role;
set local role anon;
select throws_ok(
  $$insert into public.receipts (owner_id, photo_url, vendor, amount, date, category)
    values ('00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001/anon.jpg',
            'Shop', 1.00, current_date, 'Food')$$,
  'T-SEC-11b anon cannot insert receipts'
);

-- T-SEC-11b: anon cannot read users
select is(
  (select count(*)::int from public.users),
  0,
  'T-SEC-11b anon gets no rows from users'
);

select * from finish();
rollback;
