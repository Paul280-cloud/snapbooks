-- Migration 0002: triggers and functions (Section 8.5)
-- Every function uses set search_path = ''.
-- Only handle_new_user is security definer.

-- 1. handle_new_user: creates public.users row on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name, is_18_or_older)
  values (
    new.id,
    lower(new.email),
    new.raw_user_meta_data ->> 'display_name',
    coalesce((new.raw_user_meta_data ->> 'is_18_or_older')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. set_updated_at: stamps receipts.updated_at on every edit
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- clock_timestamp() is wall-clock time, unlike now() which is constant per transaction
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

create trigger set_receipts_updated_at
  before update on public.receipts
  for each row execute function public.set_updated_at();

-- 3. limit_receipts: raises receipt_limit_reached when user already has 500
create or replace function public.limit_receipts()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  n int;
begin
  perform pg_advisory_xact_lock(hashtext('limit_receipts_' || new.owner_id::text));
  select count(*) into n
    from public.receipts
   where owner_id = new.owner_id;
  if n >= 500 then
    raise exception 'receipt_limit_reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger enforce_receipt_limit
  before insert on public.receipts
  for each row execute function public.limit_receipts();

-- 4. validate_receipt_date: rejects dates after today in SAST (UTC+2)
create or replace function public.validate_receipt_date()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.date > (now() at time zone 'Africa/Johannesburg')::date then
    raise exception 'receipt_date_in_future' using errcode = 'P0002';
  end if;
  return new;
end;
$$;

create trigger check_receipt_date
  before insert or update of date on public.receipts
  for each row execute function public.validate_receipt_date();
