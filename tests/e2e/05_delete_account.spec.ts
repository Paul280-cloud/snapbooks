// T-E2E-5: As Thabo, delete account; login again fails.
import { test, expect } from '@playwright/test';

const THABO_EMAIL = 'thabo.m@example.com';
const SEED_PASS = process.env.SEED_TEST_PASSWORD ?? '';

test.describe('T-E2E-5 delete account (as Thabo)', () => {
  test('delete account then login fails with "Incorrect email or password."', async ({ page }) => {
    // Log in as Thabo
    await page.goto('/log-in');
    await page.getByLabel('Email').fill(THABO_EMAIL);
    await page.getByLabel('Password').fill(SEED_PASS);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/receipts');

    // Navigate to Profile
    await page.goto('/profile');

    // Click Delete account
    await page.getByRole('button', { name: /delete account/i }).click();

    // Confirm in modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /delete/i }).last().click();

    // Lands on welcome / log-in
    await page.waitForURL('/');

    // Try to log in again
    await page.goto('/log-in');
    await page.getByLabel('Email').fill(THABO_EMAIL);
    await page.getByLabel('Password').fill(SEED_PASS);
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.getByText(/incorrect email or password/i)).toBeVisible({
      timeout: 8_000,
    });
  });
});
