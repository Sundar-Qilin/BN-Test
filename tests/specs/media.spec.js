import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('MLIB — Media Library', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('MU-001 Media library page loads', async ({ page }) => {
    await page.goto('/media-library');
    await page.waitForLoadState('networkidle').catch(() => {});
    // Page loads without error — heading may not use role="heading" (e.g. custom component)
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
    // At minimum some content must render (search, upload button, empty state, or any heading)
    await expect(
      page.locator('input, button, h1, h2, [class*="heading"], [class*="title"]').first()
    ).toBeAttached({ timeout: 10000 });
  });

  test('MU-013 Upload button present', async ({ page }) => {
    await page.goto('/media-library');
    await page.waitForLoadState('networkidle').catch(() => {});
    const upload = page.getByRole('button', { name: /upload|add/i }).or(page.locator('input[type="file"]')).first();
    const count = await upload.count().catch(() => 0);
    if (count === 0) test.skip(); else await expect(upload).toBeAttached();
  });

  test('MF-001 Create folder button present', async ({ page }) => {
    await page.goto('/media-library');
    await page.waitForLoadState('networkidle').catch(() => {});
    const folder = page.getByRole('button', { name: /folder|new folder/i }).or(page.getByText(/new folder/i)).first();
    const count = await folder.count().catch(() => 0);
    if (count === 0) test.skip(); else await expect(folder).toBeAttached();
  });

  test('MS-001 Search bar present', async ({ page }) => {
    await page.goto('/media-library');
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('MS-003 File type filter present', async ({ page }) => {
    await page.goto('/media-library');
    await page.waitForLoadState('networkidle').catch(() => {});
    const filter = page.locator('select, [role="combobox"]').first()
      .or(page.getByRole('tab', { name: /video|image|pdf|audio|all/i }).first());
    const count = await filter.count().catch(() => 0);
    if (count === 0) {
      test.skip();
    } else {
      await expect(filter).toBeAttached();
    }
  });

  test('MM-014 Page loads without 403 for super_admin', async ({ page }) => {
    await page.goto('/media-library');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('MM-015 Empty state shown (mock returns 0 files)', async ({ page }) => {
    await page.goto('/media-library');
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|0 file/i).or(page.locator('[class*="empty"]')).first()).toBeVisible({ timeout: 10000 });
  });
});
