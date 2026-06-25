import { test, expect } from '@playwright/test';
import { mockAll } from '../helpers/mock.js';

test('Flags status dropdown options', async ({ page }) => {
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
  await page.screenshot({ path: 'screenshots/flags-tab-loaded.png', fullPage: true });

  // Find the status dropdown (first combobox - should show "Open" by default)
  const allCombos = await page.locator('[role="combobox"]').all();
  console.log('Number of comboboxes:', allCombos.length);
  for (let i = 0; i < allCombos.length; i++) {
    const text = await allCombos[i].textContent();
    console.log(`Combobox ${i}: "${text?.trim()}"`);
  }

  // Click the first combobox (status = "Open")
  if (allCombos.length > 0) {
    await allCombos[0].click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/flags-status-dropdown-open.png', fullPage: true });

    const options = await page.locator('[role="option"]').allTextContents();
    console.log('Status dropdown options:', options);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // Click the second combobox (kind = "All kinds")
  if (allCombos.length > 1) {
    await allCombos[1].click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/flags-kind-dropdown-open.png', fullPage: true });

    const kindOptions = await page.locator('[role="option"]').allTextContents();
    console.log('Kind dropdown options:', kindOptions);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
});
