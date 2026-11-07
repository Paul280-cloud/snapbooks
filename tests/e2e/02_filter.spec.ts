import { test, expect } from '@playwright/test';

const ZANELE_EMAIL = 'zanele.d@example.com';
const SEED_PASS = process.env.SEED_TEST_PASSWORD ?? '';

async function loginAsZanele(page: Parameters<typeof test>[1]['page']) {
  await page.goto('/log-in');
  await page.getByLabel('Email').fill(ZANELE_EMAIL);
  await page.getByLabel('Password').fill(SEED_PASS);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('/receipts');
}

test.describe('T-E2E-2 receipt list filters (as Zanele)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsZanele(page);
  });

  test('receipts page loads and shows receipt cards', async ({ page }) => {
    await expect(page.getByRole('link').first()).toBeVisible();
  });

  test('filtering by Fuel shows only Fuel receipts', async ({ page }) => {
    const categorySelect = page.getByRole('combobox', { name: /category/i });
    await categorySelect.selectOption('Fuel');

    // All visible receipt cards should show the Fuel category
    await expect(page.getByText('Fuel').first()).toBeVisible();

    // Known Fuel receipts from the seed data
    await expect(page.getByText('BP Fuels')).toBeVisible();
    await expect(page.getByText('Total Garage')).toBeVisible();

    // No Food/Stock/Rent/Other cards should appear
    await expect(page.getByText('Pick n Pay')).not.toBeVisible();
  });

  test('a filter with no match shows the empty filter message and Clear filters', async ({
    page,
  }) => {
    const categorySelect = page.getByRole('combobox', { name: /category/i });
    // Zanele has no Rent receipts in the seed data
    await categorySelect.selectOption('Rent');

    await expect(
      page.getByText(/no receipts match that filter/i),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /clear filters/i }),
    ).toBeVisible();
  });

  test('Clear filters removes the filter and shows all receipts again', async ({
    page,
  }) => {
    const categorySelect = page.getByRole('combobox', { name: /category/i });
    await categorySelect.selectOption('Rent');
    await expect(page.getByText(/no receipts match that filter/i)).toBeVisible();

    await page.getByRole('button', { name: /clear filters/i }).click();

    // After clearing, Zanele's receipts are back
    await expect(page.getByText('Pick n Pay')).toBeVisible();
    await expect(categorySelect).toHaveValue('');
  });

  test('filtering by search text narrows the list', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('BP');
    await expect(page.getByText('BP Fuels')).toBeVisible();
    await expect(page.getByText('Pick n Pay')).not.toBeVisible();
  });

  test('header shows the receipt count', async ({ page }) => {
    // Zanele has 14 receipts in seed data
    await expect(page.getByText(/14/)).toBeVisible();
  });
});
