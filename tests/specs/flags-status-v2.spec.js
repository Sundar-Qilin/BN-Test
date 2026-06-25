import { test, expect } from '@playwright/test';
import { mockAll } from '../helpers/mock.js';

test('Flags status dropdown - try various interactions', async ({ page }) => {
  await mockAll(page);
  await page.route(/\/api\/v1\/admin\/cohort-flags\//, route =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }) })
  );

  await page.goto('/');
  await page.waitForLoadState('networkidle').catch(() => {});

  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(500);

  // Click Flags tab
  await page.locator('[role="tab"]:has-text("Flags")').click();
  await page.waitForTimeout(800);

  // Inspect what the status dropdown element actually is
  const statusEl = page.locator('[role="combobox"]').first();
  const tagName = await statusEl.evaluate(el => el.tagName);
  const ariaExpanded = await statusEl.getAttribute('aria-expanded');
  const ariaHaspopup = await statusEl.getAttribute('aria-haspopup');
  const type = await statusEl.getAttribute('type');
  const classList = await statusEl.evaluate(el => [...el.classList].join(' '));
  console.log('Status el tagName:', tagName);
  console.log('aria-expanded:', ariaExpanded);
  console.log('aria-haspopup:', ariaHaspopup);
  console.log('type:', type);
  console.log('classList:', classList);

  // Try clicking it
  await statusEl.click();
  await page.waitForTimeout(800);
  const ariaExpanded2 = await statusEl.getAttribute('aria-expanded');
  console.log('aria-expanded after click:', ariaExpanded2);

  // Check what's in the listbox/dropdown
  const listbox = page.locator('[role="listbox"]');
  const listboxVisible = await listbox.isVisible({ timeout: 1000 }).catch(() => false);
  console.log('Listbox visible:', listboxVisible);

  const popup = page.locator('[data-radix-popper-content-wrapper], [data-state="open"]');
  const popupCount = await popup.count();
  console.log('Popup count:', popupCount);

  await page.screenshot({ path: 'screenshots/flags-status-v2-after-click.png', fullPage: true });

  // Try looking for all dropdown/select related elements in the DOM
  const selectInfo = await page.evaluate(() => {
    const results = [];
    // Check native selects
    document.querySelectorAll('select').forEach(el => {
      results.push({ type: 'select', text: el.value, options: [...el.options].map(o => o.text) });
    });
    // Check comboboxes
    document.querySelectorAll('[role="combobox"]').forEach(el => {
      results.push({
        type: 'combobox',
        text: el.textContent?.trim().slice(0, 50),
        'aria-expanded': el.getAttribute('aria-expanded'),
        tagName: el.tagName,
      });
    });
    return results;
  });
  console.log('Select/combobox info:', JSON.stringify(selectInfo, null, 2));

  // Check if it might be a Radix Select
  const radixTrigger = page.locator('[data-radix-select-trigger]');
  console.log('Radix trigger count:', await radixTrigger.count());

  // Try finding the select by looking for buttons near the status filter
  const filterArea = page.locator('form, [class*="filter"], [class*="toolbar"]').first();
  const filterButtons = await filterArea.locator('button').allTextContents().catch(async () => {
    return await page.locator('button').allTextContents();
  });
  console.log('Filter area buttons:', filterButtons.slice(0, 10));
});
