# Seed data

## How to run

```bash
# 1. Make sure local Supabase is running
npx supabase start

# 2. Reset the database (runs migrations + seed.sql)
npx supabase db reset

# 3. Set passwords and upload photos
npm run seed
```

`npm run seed` reads credentials from `.env` — never from this file.

## What it creates

| Email | Receipts | Use for |
|---|---|---|
| zanele.d@example.com | 14 | Demo and general testing |
| mpho.s@example.com | 9 | Export testing |
| thabo.m@example.com | 1 | Near-empty state testing |
| ayesha.p@example.com | 0 | Empty state testing |

## Photos

Put five sample receipt photos (JPG, PNG or WebP, your own or free-to-use) in
`supabase/seed/photos/`. The seed script uploads them in round-robin for each
user. If the folder is empty it prints a warning and skips the upload; the app
still works but photo previews will be broken.

## Passwords

Passwords come from `SEED_TEST_PASSWORD` in your `.env` file. They are never
written in this file or any other file in Git.
