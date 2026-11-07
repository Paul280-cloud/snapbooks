# SnapBooks

> Snap receipts. Survive tax season.

SnapBooks is a web app for small South African business owners — spaza shops, market traders, freelancers — who lose paper receipts and struggle at tax time. Users photograph a receipt, the app reads the vendor, amount, date and category automatically, and everything is stored in a searchable list they can export as a spreadsheet for SARS or their accountant.

**Live site:** https://snapbooks-alpha.vercel.app

---

## Prerequisites

- Node.js 24 LTS and npm
- Git
- Docker Desktop (running) — required for the local Supabase backend
- Playwright Chromium: `npx playwright install chromium`

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env example and fill in your values after running supabase start
cp .env.example .env

# 3. Start the local Supabase backend (requires Docker Desktop running)
npx supabase start
# Copy the shown URL and anon key into .env

# 4. Reset and seed the database
npx supabase db reset
npm run seed

# 5. Start the app
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Commands

| Purpose | Command |
|---|---|
| Start the app | `npm run dev` |
| Unit and component tests | `npm test` |
| Database and permission tests | `npx supabase test db` |
| Integration tests | `npm run test:integration` |
| End-to-end tests (local) | `npx playwright test` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| **Full check** | `npm run check` |
| Build for release | `npm run build` |
| Seed the database | `npm run seed` |

> **Full check requires:** `npx supabase start` running, the database reset and seeded, and `npx supabase functions serve` running.

### Smoke test against the live site

```bash
BASE_URL=https://snapbooks-alpha.vercel.app \
  SEED_TEST_PASSWORD=<password> \
  npx playwright test tests/e2e/99_live_smoke.spec.ts
```

---

## Environment variables

| Name | Where used | Public or secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | App (`src/`) | Public |
| `VITE_SUPABASE_ANON_KEY` | App (`src/`) | Public (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed script and integration tests only | **Secret — never in `src/`** |
| `SEED_TEST_PASSWORD` | Seed script, integration tests and Playwright | **Secret — never in `src/`** |

> **Never commit `.env` or `.env.hosted`.** Both are listed in `.gitignore`.

For the hosted project, copy `.env.example` to `.env.hosted` and fill in the hosted Supabase values. This file is also ignored by Git.

---

## Test accounts

Passwords are set by `SEED_TEST_PASSWORD` in `.env` (never committed). Run `npm run seed` to apply them.

| Account | Use for |
|---|---|
| zanele.d@example.com | Demo and general testing (14 receipts) |
| mpho.s@example.com | Export testing (9 receipts) |
| thabo.m@example.com | Near-empty state testing (1 receipt) |
| ayesha.p@example.com | Empty state testing (0 receipts) |

---

## Running the tests

### Unit and component tests

```bash
npm test
```

No backend needed. Runs all tests in `tests/unit/` and `tests/components/`.

### Database and permission tests

```bash
npx supabase start   # start local backend first
npx supabase test db
```

Runs pgTAP tests in `supabase/tests/` against the local database.

### Integration tests

```bash
npx supabase start
npx supabase functions serve   # Edge Function must be running
npm run test:integration
```

Runs tests in `tests/integration/` against the real local backend.

### End-to-end tests

```bash
npx supabase start
npx supabase functions serve
npx supabase db reset && npm run seed   # fresh seed data
npx playwright test
```

Runs Playwright flows in `tests/e2e/` at 1440px and 360px widths.

---

## Demo script

This is the 6-step demo from PRD §11.7. Use the live site at https://snapbooks-alpha.vercel.app.

**Step 1 — Receipt list**
Log in as `zanele.d@example.com`. The receipt list (S5) shows Zanele's receipts newest first, with vendor, date, amount and category on each card.

**Step 2 — Upload a receipt**
Tap **+ Upload receipt** and pick a photo of a till slip (JPG, PNG or WebP, under 10 MB). The app reads the photo and pre-fills the vendor, amount, date and category where it can. Correct anything the reader missed. Tap **Save**. The receipt appears at the top of the list with a "Receipt saved." toast.

**Step 3 — Filter the list**
In the Category dropdown, choose **Fuel**. The list updates immediately to show only Fuel receipts.

**Step 4 — Edit a receipt**
Tap any receipt to open it. Change the amount. Tap **Save**. The list shows the updated value and the toast "Receipt updated."

**Step 5 — Export to spreadsheet**
Tap the **Export** tab. The start and end dates default to the current tax year (1 March – 28/29 February). Tap **Export to spreadsheet**. An `.xlsx` file downloads with columns Date, Vendor, Category, Amount (ZAR), sorted oldest first. Open it in Excel, Google Sheets or Numbers to confirm.

**Step 6 — Dashboard**
Tap the **Dashboard** tab. Two bar charts appear: spend by category and spend by month for the current tax year. The total at the bottom matches the sum of all Zanele's receipts.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + Storage) |
| OCR | Tesseract.js (runs in the browser; no photo leaves the device) |
| Export | SheetJS (client-side `.xlsx`) |
| Testing | Jest 30 + Testing Library + pgTAP + Playwright |
| Hosting | Vercel |

---

## Project structure

```
src/
  pages/          One file per screen (S1–S10)
  components/     Shared UI components
  lib/
    api/          Backend operations (Supabase calls)
    rules/        Pure business-rule functions (no network)
    messages.ts   Every user-facing message, in one place
  hooks/          useSession, useOnlineStatus
supabase/
  migrations/     SQL migrations (applied with npx supabase db push)
  functions/      Edge Function: delete-account
  tests/          pgTAP database and permission tests
  seed/           Seed script and sample photos
tests/
  unit/           Business-rule and helper-function tests
  components/     Component and screen-state tests
  integration/    Backend operation tests (needs local Supabase)
  e2e/            Playwright flows (needs dev server)
docs/
  PRD.md          Product Requirements Document
  designs/        Exported screen designs (S1–S10, M1–M3)
```

---

## Author

Bheki — SNPL Cohort 2026

---

## Licence

This project is for educational purposes as part of the SNPL Cohort 2026 programme.
