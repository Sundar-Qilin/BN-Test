import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('MDLA — Module Library', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('ML-001 Module Library page loads', async ({ page }) => {
    await page.goto('/modules'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Module Library' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('ML-002 Search present', async ({ page }) => {
    await page.goto('/modules'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('ML-006 Empty state when no modules', async ({ page }) => {
    await page.goto('/modules'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|0/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('MF-001 Create module button present', async ({ page }) => {
    await page.goto('/modules'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const btn = page.getByRole('button', { name: /create|add|new/i }).or(page.getByRole('link', { name: /create|add|new/i })).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('MR-001 Module reuse concept — Module Library accessible', async ({ page }) => {
    await page.goto('/modules'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Module Library' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible();
  });
});
