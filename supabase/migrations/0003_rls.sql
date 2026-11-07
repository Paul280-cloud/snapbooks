-- Migration 0003: RLS, policies and column grants (Section 9, SEC1–SEC7, SEC11)

-- Enable RLS
alter table public.users    enable row level security;
alter table public.receipts enable row level security;

-- Revoke all from anon (SEC11: anon gets nothing)
revoke all on public.users    from anon;
revoke all on public.receipts from anon;

-- Grant schema usage and table-level rights to authenticated
grant usage  on schema public to authenticated;
grant select on public.users to authenticated;

-- SEC1: users — select own row only
create policy users_select_own on public.users
  for select to authenticated
  using (id = auth.uid());

-- SEC2: users — update display_name only (column-level grant, own row only)
-- Revoke table-level UPDATE first; Supabase default grants give authenticated UPDATE on all tables,
-- which would override column-level grants if left in place.
revoke update on public.users from authenticated;
grant update (display_name) on public.users to authenticated;

create policy users_update_own on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- SEC3: no delete policy on users — deletion is handled by the Edge Function only

-- SEC4: receipts — select own rows
grant select on public.receipts to authenticated;

create policy receipts_select_own on public.receipts
  for select to authenticated
  using (owner_id = auth.uid());

-- SEC5: receipts — insert own rows (trigger enforces BR4 limit)
grant insert on public.receipts to authenticated;

create policy receipts_insert_own on public.receipts
  for insert to authenticated
  with check (owner_id = auth.uid());

-- SEC6: receipts — update vendor/amount/date/category on own rows only
-- Revoke table-level UPDATE first (same reason as users above).
revoke update on public.receipts from authenticated;
grant update (vendor, amount, date, category) on public.receipts to authenticated;

create policy receipts_update_own on public.receipts
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- SEC7: receipts — delete own rows
grant delete on public.receipts to authenticated;

create policy receipts_delete_own on public.receipts
  for delete to authenticated
  using (owner_id = auth.uid());
