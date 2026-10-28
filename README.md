# SnapBooks

> Snap receipts. Survive tax season.

SnapBooks is a web app for small South African business owners — spaza shops, market traders, freelancers — who lose paper receipts and struggle at tax time. Users photograph a receipt, the app reads the vendor, amount, date and category automatically, and everything is stored in a searchable list they can export as a spreadsheet for SARS or their accountant.

---

## What it does

- **Upload a receipt** — take a photo or pick one from your device; the app pre-fills the details
- **Review and confirm** — check the vendor, amount, date and category before saving
- **Search and filter** — find any receipt by vendor name, category or month
- **Edit or delete** — correct mistakes on any saved receipt
- **Export** — download all receipts for a chosen date range as a `.xlsx` spreadsheet
- **Dashboard** — see your total spend by category and by month as bar charts

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + Storage) |
| Export | SheetJS (client-side `.xlsx` generation) |
| Hosting | Vercel |

---

## Getting started

### Prerequisites

- Node.js 20 LTS
- npm
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

### 1. Clone the repo

```bash
git clone https://github.com/Paul280-cloud/snapbooks.git
cd snapbooks
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your Supabase project details:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values:

Find both values in your Supabase dashboard under **Project Settings → API**.

> **Never commit your real `.env` file.** It is already listed in `.gitignore`.

### 4. Run the database migrations

```bash
npx supabase db push
```

Or paste the contents of `supabase/migrations/` into the Supabase SQL editor and run them in order.

### 5. Load seed data (optional, for testing)

```bash
node supabase/seed/seed.js
```

This creates four test accounts and sample receipts. Test passwords are in `supabase/seed/README.md` — never commit real passwords.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project structure

---

## Environment variables

| Name | What it is | Public or secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Public |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Public (safe because RLS is on) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for the seed script only | **Secret — never in the app** |

---

## Running tests

```bash
npm test
```

Jest unit tests cover business rules BR1, BR4, BR5 and BR7. All other acceptance criteria are tested manually using the checklist in `MASTER.md`.

---

## Deploying to Vercel

1. Push your code to GitHub.
2. Import the repo in the [Vercel dashboard](https://vercel.com/new).
3. Add your environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) under **Settings → Environment Variables**.
4. Deploy — Vercel builds and hosts automatically on every push to `main`.

---

## Documentation

| Document | Location | What it is |
|---|---|---|
| PRD | `docs/PRD.md` | Full product requirements: features, screens, business rules, data model |
| MASTER.md | `MASTER.md` | Phase-by-phase build plan for AI coding assistants |
| Seed README | `supabase/seed/README.md` | Test account credentials (never commit real passwords) |

---

## Author

Bheki — SNPL Cohort 2026

---

## Licence

This project is for educational purposes as part of the SNPL Cohort 2026 programme.