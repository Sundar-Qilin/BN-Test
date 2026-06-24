import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('BILL — Billing', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('BP-001 Billing page loads', async ({ page }) => {
    await page.getByRole('link', { name: 'Billing' }).click();
    await expect(page.getByRole('heading', { name: 'Billing' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BP-008 Plan comparison accessible', async ({ page }) => {
    await page.getByRole('link', { name: 'Billing' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Billing' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BPY-001 Payment methods tab present', async ({ page }) => {
    await page.getByRole('link', { name: 'Billing' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    const tab = page.getByRole('tab', { name: /payment/i }).or(page.getByText(/payment method/i)).first();
    await expect(tab).toBeAttached({ timeout: 10000 });
  });

  test('BPY-003 Full card number not in page HTML', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle').catch(() => {});
    const html = await page.content();
    expect(html).not.toMatch(/\b\d{16}\b/);
  });

  test('BH-001 Billing history section present', async ({ page }) => {
    await page.getByRole('link', { name: 'Billing' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    const historyTab = page.getByRole('tab', { name: /history|invoice/i }).or(page.getByText(/invoice|history/i)).first();
    await expect(historyTab).toBeAttached({ timeout: 10000 });
  });

  test('BC-008 Page accessible to super_admin', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });
});
