import { test, expect } from '@playwright/test';
import { mockAll, BACKEND } from '../helpers/mock.js';

test('Final course settings screenshot', async ({ page }) => {
  await mockAll(page);

  // Override courses list
  await page.unroute(BACKEND);
  await page.route(BACKEND, route => {
    const url = route.request().url();

    // Profile
    if (url.includes('/auth/profile')) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Test', last_name: 'Admin', role: 'super_admin', is_active: true },
        }),
      });
    }

    // Courses list
    if (url.match(/\/admin\/courses\/?\?/) || url.match(/\/admin\/courses\/$/)) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: {
            count: 1, next: null, previous: null,
            results: [{
              id: 10, title: 'Course to Yap', slug: 'course-to-yap', status: 'published',
              modules_count: 1, lessons_count: 8,
            }],
          },
        }),
      });
    }

    // Course detail /courses/10/
    if (url.match(/\/admin\/courses\/10\//) && !url.includes('/settings') && !url.includes('/modules') && !url.includes('/curriculum')) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: {
            id: 10, title: 'Course to Yap', slug: 'course-to-yap', status: 'published',
            cohorts_enabled: false,
            cohort_duration_weeks: 4,
            cohort_proximity_threshold_days: 7,
            certificate_enabled: true,
            completion_percentage: 80,
            is_public: true,
            enrollment_limit: null,
            modules_count: 1,
            lessons_count: 8,
          },
        }),
      });
    }

    // Default empty
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }),
    });
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle').catch(() => {});

  // Navigate to courses
  await page.goto('/courses');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/final-courses-list.png', fullPage: true });
  console.log('Courses URL:', page.url());

  const rows = await page.locator('table tbody tr').all();
  console.log('Rows:', rows.length);

  if (rows.length > 0) {
    // Try clicking the first row's link/cell
    const link = page.locator('table tbody tr:first-child a, table tbody tr:first-child td').first();
    await link.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.screenshot({ path: 'screenshots/final-course-detail.png', fullPage: true });
    console.log('Detail URL:', page.url());

    const allTabs = await page.locator('[role="tab"]').allTextContents();
    console.log('All tabs:', allTabs);

    const settingsTab = page.locator('[role="tab"]:has-text("Settings")');
    if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsTab.click();
      await page.waitForTimeout(1500);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.screenshot({ path: 'screenshots/final-course-settings.png', fullPage: true });
      console.log('Settings URL:', page.url());

      const labels = await page.locator('label').allTextContents();
      const headings = await page.locator('h1, h2, h3, h4').allTextContents();
      console.log('Labels:', labels);
      console.log('Headings:', headings);

      const switches = await page.locator('[role="switch"]').all();
      console.log('Switch count:', switches.length);
      for (let i = 0; i < switches.length; i++) {
        const checked = await switches[i].isChecked().catch(() => null);
        const ariaLabel = await switches[i].getAttribute('aria-label') || '';
        const ctx = await switches[i].evaluate(el => {
          let n = el.parentElement;
          for (let j = 0; j < 12; j++) {
            const t = n?.textContent?.trim();
            if (t && t.length > 2 && t.length < 300) return t;
            n = n?.parentElement;
          }
          return '';
        });
        console.log(`Switch ${i}: checked=${checked} aria-label="${ariaLabel}" ctx="${ctx}"`);
      }

      const ph = await page.evaluate(() => document.body.scrollHeight);
      console.log('Page height:', ph);

      for (const [name, scroll] of [['mid', 500], ['2', 1000], ['bottom', 99999]]) {
        await page.evaluate(s => window.scrollTo(0, s === 99999 ? document.body.scrollHeight : s), scroll);
        await page.waitForTimeout(200);
        await page.screenshot({ path: `screenshots/final-settings-${name}.png`, fullPage: false });
      }
    } else {
      console.log('[WARN] No Settings tab. Tabs:', allTabs);
    }
  } else {
    console.log('[WARN] No course rows');
  }
});
