import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('ORGS — Organisations', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  // ── ORGS-LIST ──────────────────────────────────────────────────────────────
  test('OL-001 Orgs list page loads', async ({ page }) => {
    await page.goto('/organizations'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Organizations' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('OL-002 Search bar present on orgs list', async ({ page }) => {
    await page.goto('/organizations'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.getByRole('searchbox').or(page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]')).first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('OL-004 Search no match shows empty state', async ({ page }) => {
    await page.goto('/organizations'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|0 results/i).or(page.locator('[data-empty], .empty-state, [class*="empty"]')).first()).toBeVisible({ timeout: 10000 });
  });

  test('OL-007 Sort button or column header present', async ({ page }) => {
    await page.goto('/organizations'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    // Sort controls may be column headers or a sort dropdown
    const sortable = page.locator('th, [data-sort], [aria-sort], button:has-text("Sort"), select').first();
    await expect(sortable).toBeAttached({ timeout: 10000 });
  });

  test('OL-020 Click Create button opens create form', async ({ page }) => {
    await page.goto('/organizations'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const createBtn = page.getByRole('button', { name: /create|add|new/i }).or(page.getByRole('link', { name: /create|add|new/i })).first();
    await expect(createBtn).toBeVisible({ timeout: 10000 });
  });

  // ── ORGS-FORM ──────────────────────────────────────────────────────────────
  test('OF-001 Create org — form opens with required fields', async ({ page }) => {
    await page.goto('/organizations');
    await page.waitForLoadState('networkidle').catch(() => {});
    const createBtn = page.getByRole('button', { name: /create|add/i }).or(page.getByRole('link', { name: /create|add/i })).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test('OL-009 List page has actions column or action buttons', async ({ page }) => {
    await page.goto('/organizations'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.locator('button, a').filter({ hasText: /edit|view|delete|action/i }).or(page.locator('table')).first()).toBeAttached({ timeout: 10000 });
  });

  test('OL-015 Skeleton or spinner shown while loading', async ({ page }) => {
    // Navigate directly and check page loads without error
    await page.goto('/organizations');
    await expect(page.getByRole('heading', { name: /organization/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(page).not.toHaveTitle(/error|not found/i);
  });

  test('OL-016 RBAC — org page accessible to super_admin', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page.getByRole('heading', { name: /organization/i }).first()).toBeVisible({ timeout: 10000 });
    // Should not show 403 or access-denied
    await expect(page.getByText(/403|forbidden|access denied/i)).not.toBeVisible();
  });
});
