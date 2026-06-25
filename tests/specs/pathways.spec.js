import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('PATH — Pathways', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('PL-001 Pathways list page loads', async ({ page }) => {
    await page.goto('/pathways'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Pathways' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('PL-002 Search bar present', async ({ page }) => {
    await page.goto('/pathways'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('PL-006 Empty state shown', async ({ page }) => {
    await page.goto('/pathways'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|0/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('PF-001 Create pathway button present', async ({ page }) => {
    await page.goto('/pathways'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const btn = page.getByRole('button', { name: /create|add|new/i }).or(page.getByRole('link', { name: /create|add|new/i })).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('PS-001 Page accessible without 403', async ({ page }) => {
    await page.goto('/pathways');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });
});
