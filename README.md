# SnapBooks

> Snap receipts. Survive tax season.

SnapBooks is a web app for small South African business owners — spaza shops, market traders, freelancers — who lose paper receipts and struggle at tax time. Users photograph a receipt, the app reads the vendor, amount, date and category automatically, and everything is stored in a searchable list they can export as a spreadsheet for SARS or their accountant.

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
| End-to-end tests | `npx playwright test` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| **Full check** | `npm run check` |
| Build for release | `npm run build` |

> `npm run check` requires `npx supabase start` running and the database seeded.

---

## Environment variables

| Name | Where used | Public or secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | App (`src/`) | Public |
| `VITE_SUPABASE_ANON_KEY` | App (`src/`) | Public (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed script only | **Secret — never in `src/`** |
| `SEED_TEST_PASSWORD` | Seed script only | **Secret — never in `src/`** |

> **Never commit `.env` or `.env.hosted`.** Both are in `.gitignore`.

---

## Test accounts

Passwords are set via `SEED_TEST_PASSWORD` in `.env` (never committed).

| Account | Use for |
|---|---|
| zanele.d@example.com | Demo and general testing (14 receipts) |
| mpho.s@example.com | Export testing (9 receipts) |
| thabo.m@example.com | Near-empty state testing (1 receipt) |
| ayesha.p@example.com | Empty state testing (0 receipts) |

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + Storage) |
| Export | SheetJS (client-side `.xlsx`) |
| Testing | Jest 30 + Testing Library + Playwright |
| Hosting | Vercel |

---

## Author

Bheki — SNPL Cohort 2026

---

## Licence

This project is for educational purposes as part of the SNPL Cohort 2026 programme.