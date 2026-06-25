import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('INST — Instructors', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('IL-001 Instructors list page loads', async ({ page }) => {
    await page.goto('/instructors'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Instructors' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('IL-002 Search bar present', async ({ page }) => {
    await page.goto('/instructors'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('IL-007 Empty state shown', async ({ page }) => {
    await page.goto('/instructors'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|0/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('IL-008 Page accessible to super_admin', async ({ page }) => {
    await page.goto('/instructors');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('IP-001 Create instructor button present', async ({ page }) => {
    await page.goto('/instructors'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const btn = page.getByRole('button', { name: /create|add|invite|new/i }).or(page.getByRole('link', { name: /create|add|new/i })).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });
});
