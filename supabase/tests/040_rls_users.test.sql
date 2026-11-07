-- T-SEC-1a/b, T-SEC-2a/b (users table RLS)
begin;
select plan(8);

-- seed users already exist from seed.sql — no DO block needed

-- T-SEC-1a: Zanele can read her own row
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from public.users where id = '00000000-0000-0000-0000-000000000001'),
  1,
  'T-SEC-1a owner can read own users row'
);

-- T-SEC-1b: Zanele cannot read Mpho's row
select is(
  (select count(*)::int from public.users where id = '00000000-0000-0000-0000-000000000002'),
  0,
  'T-SEC-1b owner cannot read another user''s row'
);

-- T-SEC-2a: Zanele can update her own display_name
select lives_ok(
  $$update public.users set display_name = 'Z Dlamini' where id = '00000000-0000-0000-0000-000000000001'$$,
  'T-SEC-2a owner can update own display_name'
);

-- T-SEC-2b: Zanele cannot update Mpho's display_name
-- RLS USING failure silently affects 0 rows — verify as superuser
update public.users set display_name = 'Hacked' where id = '00000000-0000-0000-0000-000000000002';
reset role;
select isnt(
  (select display_name from public.users where id = '00000000-0000-0000-0000-000000000002'),
  'Hacked',
  'T-SEC-2b owner cannot update another user''s display_name'
);

-- resume as Zanele
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

-- T-SEC-2b: Zanele cannot update her own email (only display_name column grant)
select throws_ok(
  $$update public.users set email = 'z@example.com' where id = '00000000-0000-0000-0000-000000000001'$$,
  NULL, NULL,
  'T-SEC-2b cannot update email (no column grant)'
);

-- T-SEC-2b: Zanele cannot update is_18_or_older (no column grant)
select throws_ok(
  $$update public.users set is_18_or_older = false where id = '00000000-0000-0000-0000-000000000001'$$,
  NULL, NULL,
  'T-SEC-2b cannot update is_18_or_older (no column grant)'
);

-- T-SEC-3: Zanele cannot delete her own row (no DELETE policy → silently 0 rows)
-- verify row still exists as superuser
delete from public.users where id = '00000000-0000-0000-0000-000000000001';
reset role;
select is(
  (select count(*)::int from public.users where id = '00000000-0000-0000-0000-000000000001'),
  1,
  'T-SEC-3 authenticated role has no delete policy on users — row survives'
);

-- T-SEC-11b: anon role cannot access users table (permission denied — all revoked)
set local role anon;
select throws_ok(
  $$select count(*)::int from public.users$$,
  NULL, NULL,
  'T-SEC-11b anon cannot select from users'
);

select * from finish();
rollback;
