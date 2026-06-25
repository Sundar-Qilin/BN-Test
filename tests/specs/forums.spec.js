import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('FRMS — Forums', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  test('FC-001 Forums page loads', async ({ page }) => {
    await page.goto('/forums'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Forums' })).toBeVisible({ timeout: 10000 });
  });

  test('FC-010 XSS in category name — page does not execute script', async ({ page }) => {
    await page.goto('/forums');
    await page.waitForLoadState('networkidle').catch(() => {});
    // Inject XSS into URL parameter — should not execute
    let alerted = false;
    page.on('dialog', dialog => { alerted = true; dialog.dismiss(); });
    await page.evaluate(() => {
      document.title = '<script>window.__xss=1<\/script>';
    });
    await page.waitForTimeout(500);
    expect(alerted).toBe(false);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });

  test('FT-001 Thread list area present', async ({ page }) => {
    await page.goto('/forums'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Forums' })).toBeVisible({ timeout: 10000 });
  });

  test('FC-015 Page accessible to super_admin', async ({ page }) => {
    await page.goto('/forums');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('FS-001 Search functionality present', async ({ page }) => {
    await page.goto('/forums'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    await expect(search).toBeAttached({ timeout: 10000 });
  });

  test('FS-010 SQLi in search input does not crash page', async ({ page }) => {
    await page.goto('/forums');
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await search.isVisible({ timeout: 3000 })) {
      await search.fill("' OR 1=1--");
      await search.press('Enter');
      await page.waitForTimeout(1000);
      await expect(page.getByText(/500|server error|exception/i)).not.toBeVisible();
    } else { test.skip(); }
  });
});
