import { test, expect } from '@playwright/test';
import { mockAll, BACKEND } from '../helpers/mock.js';

// Quick exploration test — screenshot everything for cohorts feature
test.describe('Cohorts feature exploration', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('COH-EXPLORE-01 Cohorts list page', async ({ page }) => {
    await page.goto('/cohorts');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/cohorts-list.png', fullPage: true });

    const h1 = await page.locator('h1').textContent();
    console.log('H1:', h1);

    const subtext = await page.locator('p, [class*="subtitle"], [class*="description"]').first().textContent().catch(() => '');
    console.log('Subtitle:', subtext);

    const tabs = await page.locator('[role="tab"]').allTextContents();
    console.log('Tabs:', tabs);

    const emptyState = await page.locator('[class*="empty"], [class*="Empty"]').allTextContents().catch(() => []);
    console.log('Empty state:', emptyState);

    // Check sidebar for Cohorts position
    const navItems = await page.locator('[class*="sidebar"] a, nav a').allTextContents();
    console.log('Sidebar:', navItems);
  });

  test('COH-EXPLORE-02 Flags tab', async ({ page }) => {
    await page.goto('/cohorts');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);

    const flagsTab = page.locator('[role="tab"]:has-text("Flags")');
    await flagsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/flags-tab.png', fullPage: true });

    const ths = await page.locator('th').allTextContents();
    console.log('Flags columns:', ths);

    const comboboxes = await page.locator('[role="combobox"]').all();
    console.log('Filter comboboxes count:', comboboxes.length);
    for (let i = 0; i < comboboxes.length; i++) {
      const label = await comboboxes[i].getAttribute('aria-label') || '';
      const text = await comboboxes[i].textContent() || '';
      console.log(`Combobox ${i}: label="${label}" text="${text.trim()}"`);
    }

    // Open first dropdown (status)
    if (comboboxes.length > 0) {
      await comboboxes[0].click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: 'screenshots/flags-status-dropdown.png', fullPage: true });
      const opts = await page.locator('[role="option"]').allTextContents();
      console.log('Dropdown 0 options:', opts);
      await page.keyboard.press('Escape');
    }

    // Open second dropdown (kind)
    if (comboboxes.length > 1) {
      await comboboxes[1].click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: 'screenshots/flags-kind-dropdown.png', fullPage: true });
      const opts = await page.locator('[role="option"]').allTextContents();
      console.log('Dropdown 1 options:', opts);
      await page.keyboard.press('Escape');
    }

    // Open third dropdown (course)
    if (comboboxes.length > 2) {
      await comboboxes[2].click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: 'screenshots/flags-course-dropdown.png', fullPage: true });
      const opts = await page.locator('[role="option"]').allTextContents();
      console.log('Dropdown 2 options:', opts);
      await page.keyboard.press('Escape');
    }
  });

  test('COH-EXPLORE-03 Course settings cohorts section', async ({ page }) => {
    // Mock course detail specifically to return a course
    await page.route(
      /\/api\/v1\/admin\/courses\/[^/]+\/?$/,
      route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'test-cohort-course-001',
            title: 'test course cohorts',
            slug: 'test-course-cohorts',
            status: 'published',
            cohort_enabled: false,
            cohort_size: 10,
            cohort_duration_weeks: 4,
          },
        }),
      })
    );

    await page.goto('/courses');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.screenshot({ path: 'screenshots/courses-list.png', fullPage: true });

    const ths = await page.locator('th').allTextContents();
    console.log('Courses columns:', ths);

    // Try clicking first row
    const rows = await page.locator('table tbody tr').all();
    console.log('Course rows:', rows.length);

    if (rows.length > 0) {
      await rows[0].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/course-detail.png', fullPage: true });
      console.log('Course detail URL:', page.url());

      const tabs = await page.locator('[role="tab"]').allTextContents();
      console.log('Course detail tabs:', tabs);

      const settingsTab = page.locator('[role="tab"]:has-text("Settings")');
      if (await settingsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/course-settings.png', fullPage: true });
        console.log('Settings URL:', page.url());

        const labels = await page.locator('label').allTextContents();
        console.log('Settings labels:', labels);

        const sectionHeadings = await page.locator('h2, h3, h4, [class*="section-header"]').allTextContents();
        console.log('Section headings:', sectionHeadings);

        const toggles = await page.locator('[role="switch"], input[type="checkbox"]').all();
        for (let i = 0; i < toggles.length; i++) {
          const checked = await toggles[i].isChecked().catch(() => null);
          const parent = await toggles[i].evaluate(el => {
            let n = el.parentElement;
            for (let j = 0; j < 8; j++) {
              if (n?.textContent?.trim().length > 3) return n.textContent.trim().slice(0, 200);
              n = n?.parentElement;
            }
            return '';
          });
          console.log(`Toggle ${i}: checked=${checked} context="${parent}"`);
        }

        // Scroll to find cohorts section
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'screenshots/course-settings-mid.png', fullPage: true });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'screenshots/course-settings-bottom.png', fullPage: true });

        const cohortEls = await page.locator('[class*="cohort"], [id*="cohort"]').allTextContents();
        console.log('Cohort elements:', cohortEls);
      }
    }
  });

  test('COH-EXPLORE-04 Dashboard sidebar nav', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/dashboard-full.png', fullPage: true });

    const navItems = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="nav-item"] a').all();
    const navData = [];
    for (const item of navItems) {
      const text = await item.textContent();
      const href = await item.getAttribute('href');
      navData.push({ text: text?.trim(), href });
    }
    console.log('Nav items:', JSON.stringify(navData, null, 2));

    // Find Cohorts specifically
    const cohortLink = page.locator('nav a:has-text("Cohorts"), aside a:has-text("Cohorts")').first();
    if (await cohortLink.isVisible()) {
      const href = await cohortLink.getAttribute('href');
      console.log('Cohorts nav link href:', href);
    }
  });

  test('COH-EXPLORE-05 Try specific course cohort settings URL', async ({ page }) => {
    // Try navigating to a real-looking course settings page
    await page.goto('/courses/test-cohort-course-001/settings');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/course-settings-direct.png', fullPage: true });
    console.log('Direct URL:', page.url());

    const bodyContent = await page.locator('main, [class*="main"], [class*="content"]').first().textContent().catch(() => '');
    console.log('Page content preview:', bodyContent?.trim().slice(0, 500));
  });
});
