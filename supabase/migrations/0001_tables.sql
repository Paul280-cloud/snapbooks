-- Migration 0001: tables and indexes
create table public.users (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null unique check (email = lower(email)),
  display_name  text        check (char_length(display_name) between 1 and 60),
  is_18_or_older boolean   not null default false check (is_18_or_older = true),
  created_at    timestamptz not null default now()
);

create table public.receipts (
  id         uuid           primary key default gen_random_uuid(),
  owner_id   uuid           not null default auth.uid() references public.users(id) on delete cascade,
  photo_url  text           not null check (char_length(photo_url) <= 500),
  vendor     text           not null check (char_length(btrim(vendor)) between 1 and 100),
  amount     numeric(12,2)  not null check (amount > 0 and amount <= 999999.99),
  date       date           not null,
  category   text           not null check (category in ('Food','Stock','Fuel','Rent','Other')),
  created_at timestamptz    not null default now(),
  updated_at timestamptz    not null default now()
);

-- Section 8.4 indexes
create index receipts_owner_date_idx     on public.receipts (owner_id, date desc, created_at desc);
create index receipts_owner_category_idx on public.receipts (owner_id, category);
