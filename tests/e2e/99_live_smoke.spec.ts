// T-REL-2: Smoke test against the live Vercel URL.
// Run with:  BASE_URL=https://snapbooks-alpha.vercel.app \
//            SEED_TEST_PASSWORD=<password> \
//            npx playwright test tests/e2e/99_live_smoke.spec.ts
//
// The test accounts must be seeded in the hosted Supabase project before running.
// This test is intentionally excluded from the local full check (npm run check).

import { test, expect } from '@playwright/test';

const ZANELE_EMAIL = 'zanele.d@example.com';
const SEED_PASS = process.env.SEED_TEST_PASSWORD ?? '';

test.describe('T-REL-2 live smoke test', () => {
  test('log in as Zanele, see receipts on S5 and charts on S9', async ({ page }) => {
    // ── Log in ──────────────────────────────────────────────────────────────
    await page.goto('/log-in');
    await page.getByLabel('Email').fill(ZANELE_EMAIL);
    await page.getByLabel('Password').fill(SEED_PASS);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('/receipts', { timeout: 15_000 });

    // ── S5 Receipt List: at least one receipt card visible ───────────────────
    await expect(
      page.getByText(/Pick n Pay|BP Fuels|Shoprite/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // ── S9 Dashboard: bar charts visible ─────────────────────────────────────
    await page.goto('/dashboard');
    await expect(page.getByText(/Spend by category/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/Spend by month/i)).toBeVisible();
    await expect(page.getByText(/Total expenses/i)).toBeVisible();
  });
});
