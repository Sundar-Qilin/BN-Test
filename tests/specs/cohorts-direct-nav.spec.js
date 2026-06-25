import { test, expect } from '@playwright/test';
import { mockAll, BACKEND } from '../helpers/mock.js';

// Use mock data with a pre-seeded course that has cohort settings
test.describe('Course settings - cohorts toggle (mocked course data)', () => {

  test('CS-01 Course settings with full mock data', async ({ page }) => {
    // Mock profile
    await page.route(/\/api\/v1\/admin\/auth\/profile\/?$/, route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Test', last_name: 'Admin', role: 'super_admin', is_active: true },
        }),
      })
    );

    // Mock courses list with one real-looking course
    await page.route(/\/api\/v1\/admin\/courses\/$/, route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: {
            count: 1, next: null, previous: null,
            results: [{
              id: 'test-cohort-course-001',
              title: 'test course cohorts',
              slug: 'test-course-cohorts',
              status: 'published',
              modules_count: 1,
              lessons_count: 8,
              duration: null,
              updated_at: '2026-06-24T00:00:00Z',
            }],
          },
        }),
      })
    );

    // Mock course detail
    await page.route(/\/api\/v1\/admin\/courses\/[^/]+\/?$/, route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: {
            id: 'test-cohort-course-001',
            title: 'test course cohorts',
            slug: 'test-course-cohorts',
            status: 'published',
            description: 'A test course for cohort functionality',
            cohort_enabled: false,
            cohort_size: 10,
            cohort_duration_weeks: 4,
            is_public: true,
            enrollment_limit: null,
            certificate_enabled: true,
            completion_percentage: 80,
          },
        }),
      })
    );

    // Mock all other APIs
    await page.route(BACKEND, route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0 } }),
      })
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);

    // Navigate to courses
    await page.goto('/courses');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/mocked-courses-list.png', fullPage: true });

    const rows = await page.locator('table tbody tr').all();
    console.log('Course rows:', rows.length);

    if (rows.length > 0) {
      await rows[0].click();
      await page.waitForTimeout(1500);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.screenshot({ path: 'screenshots/mocked-course-detail.png', fullPage: true });
      console.log('Course detail URL:', page.url());

      const tabs = await page.locator('[role="tab"]').allTextContents();
      console.log('Tabs:', tabs);

      // Click Settings
      const settingsTab = page.locator('[role="tab"]:has-text("Settings")');
      if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await settingsTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/mocked-course-settings.png', fullPage: true });
        console.log('Settings URL:', page.url());

        const labels = await page.locator('label').allTextContents();
        console.log('Labels:', labels);

        const sectionTitles = await page.locator('h2, h3, h4, [class*="section"], [class*="card-title"]').allTextContents();
        console.log('Section titles:', sectionTitles);

        // Toggles
        const switches = await page.locator('[role="switch"]').all();
        console.log('Switches count:', switches.length);
        for (let i = 0; i < switches.length; i++) {
          const checked = await switches[i].isChecked().catch(() => null);
          const ariaLabel = await switches[i].getAttribute('aria-label') || '';
          const ctx = await switches[i].evaluate(el => {
            let n = el.parentElement;
            for (let j = 0; j < 10; j++) {
              const t = n?.textContent?.trim();
              if (t && t.length > 2 && t.length < 300) return t;
              n = n?.parentElement;
            }
            return '';
          });
          console.log(`Switch ${i}: checked=${checked} aria-label="${ariaLabel}" ctx="${ctx}"`);
        }

        // Scroll through page
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        console.log('Page height:', pageHeight);

        if (pageHeight > 900) {
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(200);
          await page.screenshot({ path: 'screenshots/mocked-settings-mid.png', fullPage: false });
          await page.evaluate(() => window.scrollTo(0, 1000));
          await page.waitForTimeout(200);
          await page.screenshot({ path: 'screenshots/mocked-settings-2.png', fullPage: false });
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(200);
          await page.screenshot({ path: 'screenshots/mocked-settings-bottom.png', fullPage: false });
        }
      }
    }
  });
});
