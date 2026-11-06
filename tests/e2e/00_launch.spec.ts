import { test, expect } from '@playwright/test';

test.describe('T-SETUP-4 App launches and shows Welcome screen', () => {
  test('desktop (1440px): shows "Create account"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
    await expect(page.getByText('SnapBooks')).toBeVisible();
  });

  test('mobile (360px): shows "Create account"', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
  });
});
