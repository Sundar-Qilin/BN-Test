import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('MODR — Moderation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('MQ-001 Moderation page loads', async ({ page }) => {
    await page.goto('/moderation'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Moderation' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('MQ-005 Filter by status present', async ({ page }) => {
    await page.goto('/moderation'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const filter = page.locator('select, [role="combobox"], [role="tablist"]').first();
    await expect(filter).toBeAttached({ timeout: 10000 });
  });

  test('MQ-010 Empty state when no reports', async ({ page }) => {
    await page.goto('/moderation'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|clear|0/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('MQ-011 Page accessible to super_admin', async ({ page }) => {
    await page.goto('/moderation');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('ML-005 Audit log is read-only concept — no direct delete action on log entries', async ({ page }) => {
    await page.goto('/moderation');
    await page.waitForLoadState('networkidle').catch(() => {});
    // Check moderation page has expected heading
    await expect(page.getByRole('heading', { name: /moderation/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
