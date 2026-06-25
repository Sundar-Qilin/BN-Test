import { test, expect } from '@playwright/test';
import { mockAll } from '../helpers/mock.js';

test('Flags status dropdown - force click approach', async ({ page }) => {
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

  // Get the button bounding box and click its center
  const statusBtn = page.locator('[role="combobox"]').first();
  const box = await statusBtn.boundingBox();
  console.log('Button bounding box:', box);

  if (box) {
    // Click center of the button using page.mouse
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1000);
  }

  // Check aria-expanded
  const expanded = await statusBtn.getAttribute('aria-expanded');
  console.log('aria-expanded after mouse click:', expanded);

  await page.screenshot({ path: 'screenshots/status-v3-after-click.png', fullPage: true });

  // Look for any newly visible dropdown content
  const allVisibleOptions = await page.locator('[role="option"]:visible').allTextContents();
  console.log('Visible options after click:', allVisibleOptions);

  // Look for any listbox
  const listboxCount = await page.locator('[role="listbox"]').count();
  console.log('Listbox count:', listboxCount);

  // Check for any opened Popover/dropdown
  const openState = await page.locator('[data-state="open"]').count();
  console.log('data-state=open count:', openState);

  // Get all visible popover/dropdown content
  const popoverContent = await page.evaluate(() => {
    return [...document.querySelectorAll('[data-state="open"], [data-radix-popper-content-wrapper]')]
      .map(el => el.textContent?.trim().slice(0, 200));
  });
  console.log('Open popovers:', popoverContent);

  // Also check if the button has an onClick and look for the handler
  const hasOnClick = await statusBtn.evaluate(el => typeof el.onclick === 'function' || el.getAttribute('onclick'));
  console.log('Has onclick:', hasOnClick);

  // Try clicking via JavaScript
  await statusBtn.evaluate(el => el.click());
  await page.waitForTimeout(600);
  const expanded2 = await statusBtn.getAttribute('aria-expanded');
  console.log('aria-expanded after JS click:', expanded2);
  await page.screenshot({ path: 'screenshots/status-v3-after-js-click.png', fullPage: true });

  const options2 = await page.locator('[role="option"]:visible').allTextContents();
  console.log('Visible options after JS click:', options2);
});
