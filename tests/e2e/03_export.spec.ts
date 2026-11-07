// T-E2E-3: As Mpho, choose 1 Mar 2025 to 28 Feb 2026 and export.
// The file must be named SnapBooks_export_<today>.xlsx and hold 9 rows sorted oldest first.
import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const MPHO_EMAIL = 'mpho.s@example.com';
const SEED_PASS = process.env.SEED_TEST_PASSWORD ?? '';

async function loginAsMpho(page: Parameters<typeof test>[1]['page']) {
  await page.goto('/log-in');
  await page.getByLabel('Email').fill(MPHO_EMAIL);
  await page.getByLabel('Password').fill(SEED_PASS);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('/receipts');
}

test.describe('T-E2E-3 export (as Mpho)', () => {
  test('exports 9 rows sorted oldest first for 1 Mar 2025 – 28 Feb 2026', async ({ page }) => {
    await loginAsMpho(page);
    await page.goto('/export');

    // Set date range covering all of Mpho's 9 receipts
    await page.getByLabel(/start/i).fill('2025-03-01');
    await page.getByLabel(/end/i).fill('2026-02-28');

    // Wait for the summary line to show 9 receipts
    await expect(page.getByText(/9 receipts found in this range/i)).toBeVisible({
      timeout: 10_000,
    });

    // Trigger export and capture the download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /export to spreadsheet/i }).click(),
    ]);

    // Filename must match SnapBooks_export_YYYY-MM-DD.xlsx
    expect(download.suggestedFilename()).toMatch(/^SnapBooks_export_\d{4}-\d{2}-\d{2}\.xlsx$/);

    // Save file and read it back with SheetJS
    const tmpPath = path.join(os.tmpdir(), download.suggestedFilename());
    await download.saveAs(tmpPath);

    const wb = XLSX.readFile(tmpPath);
    expect(wb.SheetNames).toHaveLength(1);

    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    // 9 data rows (header excluded by sheet_to_json default)
    expect(rows).toHaveLength(9);

    // Header columns
    const rawWithHeader = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
    expect(rawWithHeader[0]).toEqual(['Date', 'Vendor', 'Category', 'Amount (ZAR)']);

    // Sorted oldest first: dates should be non-decreasing
    const dateValues = rows.map(r => r['Date'] as number); // Excel serial numbers
    for (let i = 1; i < dateValues.length; i++) {
      expect(dateValues[i]).toBeGreaterThanOrEqual(dateValues[i - 1]);
    }

    // Toast shows
    await expect(page.getByText(/export ready\./i)).toBeVisible();

    // Clean up temp file
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  });
});
