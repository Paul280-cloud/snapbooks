-- T-SEC-1a/b, T-SEC-2a/b (users table RLS)
begin;
select plan(8);

-- seed two users directly
do $$
begin
  insert into auth.users (id, email, raw_user_meta_data, encrypted_password, email_confirmed_at)
  values
    ('00000000-0000-0000-0000-000000000001', 'zanele.d@example.com',
     '{"is_18_or_older":true,"display_name":"Zanele Dlamini"}'::jsonb, 'x', now()),
    ('00000000-0000-0000-0000-000000000002', 'mpho.s@example.com',
     '{"is_18_or_older":true,"display_name":"Mpho Sithole"}'::jsonb, 'x', now());
end;
$$;

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
select throws_ok(
  $$update public.users set display_name = 'Hacked' where id = '00000000-0000-0000-0000-000000000002'$$,
  'T-SEC-2b owner cannot update another user''s display_name'
);

-- T-SEC-2b: Zanele cannot update her own email (only display_name column grant)
select throws_ok(
  $$update public.users set email = 'z@example.com' where id = '00000000-0000-0000-0000-000000000001'$$,
  'T-SEC-2b cannot update email (no column grant)'
);

-- T-SEC-2b: Zanele cannot update is_18_or_older
select throws_ok(
  $$update public.users set is_18_or_older = false where id = '00000000-0000-0000-0000-000000000001'$$,
  'T-SEC-2b cannot update is_18_or_older (no column grant)'
);

-- T-SEC-3 (via SEC3 no delete policy): Zanele cannot delete her own row via table delete
select throws_ok(
  $$delete from public.users where id = '00000000-0000-0000-0000-000000000001'$$,
  'T-SEC-3 authenticated role has no delete policy on users'
);

-- T-SEC-11b: anon role gets nothing from users
reset role;
set local role anon;
select is(
  (select count(*)::int from public.users),
  0,
  'T-SEC-11b anon gets no rows from users'
);

select * from finish();
rollback;
