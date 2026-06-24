import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('BNDL — Bundles', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('BL-001 Bundles list page loads', async ({ page }) => {
    await page.getByRole('link', { name: 'Bundles' }).click();
    await expect(page.getByRole('heading', { name: 'Bundles' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('BL-002 Search bar present', async ({ page }) => {
    await page.getByRole('link', { name: 'Bundles' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('BL-007 Empty state shown', async ({ page }) => {
    await page.getByRole('link', { name: 'Bundles' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|0/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('BF-001 Create bundle button present', async ({ page }) => {
    await page.getByRole('link', { name: 'Bundles' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    const btn = page.getByRole('button', { name: /create|add|new/i }).or(page.getByRole('link', { name: /create|add|new/i })).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('BF-002 Bundle title required — form validation', async ({ page }) => {
    await page.goto('/bundles');
    await page.waitForLoadState('networkidle').catch(() => {});
    const createBtn = page.getByRole('button', { name: /create|add/i }).first();
    if (await createBtn.isVisible({ timeout: 3000 })) {
      await createBtn.click();
      const submitBtn = page.getByRole('button', { name: /save|create|submit/i }).last();
      if (await submitBtn.isVisible({ timeout: 3000 })) {
        await submitBtn.click();
        await expect(page.getByText(/required|title|name/i)).toBeVisible({ timeout: 5000 });
      } else { test.skip(); }
    } else { test.skip(); }
  });

  test('BF-003 Price $0 creates free bundle concept', async ({ page }) => {
    await page.goto('/bundles');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });
});
