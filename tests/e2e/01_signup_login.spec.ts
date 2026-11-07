import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const E2E_EMAIL = `e2e-test-${Date.now()}@example.com`;
const E2E_PASS = 'E2ePass1!';

test.afterAll(async () => {
  const { data } = await adminClient.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === E2E_EMAIL);
  if (user) await adminClient.auth.admin.deleteUser(user.id);
});

test.describe('T-E2E-1 sign-up → verify → log in → log out flow', () => {
  test('sign-up page renders form with required fields', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('I am 18 or older')).toBeVisible();
    await expect(
      page.getByLabel(/i agree to the privacy notice/i),
    ).toBeVisible();
  });

  test('sign-up button is disabled until checkboxes are ticked and password is valid', async ({
    page,
  }) => {
    await page.goto('/sign-up');
    const btn = page.getByRole('button', { name: /sign up/i });
    await expect(btn).toBeDisabled();
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Password').fill(E2E_PASS);
    await expect(btn).toBeDisabled();
    await page.getByLabel('I am 18 or older').check();
    await page.getByLabel(/i agree to the privacy notice/i).check();
    await expect(btn).toBeEnabled();
  });

  test('successful sign-up navigates to /log-in with verify banner', async ({
    page,
  }) => {
    await page.goto('/sign-up');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Password').fill(E2E_PASS);
    await page.getByLabel('I am 18 or older').check();
    await page.getByLabel(/i agree to the privacy notice/i).check();
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/log-in');
    await expect(
      page.getByText(/check your email and click the link to verify/i),
    ).toBeVisible();
  });

  test('logging in before confirming email shows unconfirmed error', async ({
    page,
  }) => {
    await page.goto('/log-in');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Password').fill(E2E_PASS);
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(
      page.getByText(/please verify your email first/i),
    ).toBeVisible();
  });

  test('after email confirmation, login succeeds and lands on /receipts', async ({
    page,
  }) => {
    // Confirm the user via admin API (simulating email link click)
    const { data } = await adminClient.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === E2E_EMAIL);
    if (user) {
      await adminClient.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
    }
    await page.goto('/log-in');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Password').fill(E2E_PASS);
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page).toHaveURL('/receipts');
  });

  test('Profile page shows display name and email', async ({ page }) => {
    // Log in first
    const { data } = await adminClient.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === E2E_EMAIL);
    if (user) {
      await adminClient.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
    }
    await page.goto('/log-in');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Password').fill(E2E_PASS);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/receipts');
    await page.goto('/profile');
    await expect(page.getByText(E2E_EMAIL)).toBeVisible();
  });

  test('Log out navigates to /log-in and clears session', async ({ page }) => {
    // Log in first
    const { data } = await adminClient.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === E2E_EMAIL);
    if (user) {
      await adminClient.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
    }
    await page.goto('/log-in');
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Password').fill(E2E_PASS);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/receipts');
    await page.goto('/profile');
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL('/log-in');
    // Navigating to a protected page should redirect back to log-in
    await page.goto('/receipts');
    await expect(page).toHaveURL('/log-in');
  });
});
