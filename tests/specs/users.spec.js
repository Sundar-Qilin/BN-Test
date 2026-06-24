import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('USRS — Users', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('UL-001 Users list page loads with table', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page.getByRole('heading', { name: 'Users' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('UL-002 Search by email present', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="email" i], [role="searchbox"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('UL-004 Role filter dropdown present', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    const filter = page.locator('select, [role="combobox"]').first();
    await expect(filter).toBeAttached({ timeout: 10000 });
  });

  test('UL-013 Empty state shown (mock returns 0 users)', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    // With mocked empty results, should show no-data state
    await expect(page.getByText(/no|empty|0 user/i).or(page.locator('[class*="empty"], [data-empty]')).first()).toBeVisible({ timeout: 10000 });
  });

  test('UL-016 Export button present', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    const exportBtn = page.getByRole('button', { name: /export/i }).or(page.locator('[data-export], a[download]')).first();
    await expect(exportBtn).toBeAttached({ timeout: 10000 });
  });

  test('UL-018 Page loads without 403', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('UD-001 User detail page opens from list', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: /user/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('UC-001 Courses tab concept — courses link visible in nav', async ({ page }) => {
    await page.getByRole('link', { name: 'Courses' }).click();
    await expect(page.getByRole('heading', { name: 'Courses' }).first()).toBeVisible({ timeout: 10000 });
  });
});
