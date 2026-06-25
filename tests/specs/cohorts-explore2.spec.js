import { test, expect } from '@playwright/test';
import { mockAll, BACKEND } from '../helpers/mock.js';

test.describe('Cohorts feature exploration v2', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('COH2-01 Sidebar nav — expand all groups and find Cohorts', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/sidebar-collapsed.png', fullPage: false });

    // Try expanding Community group
    const communityItem = page.locator('button:has-text("Community"), [class*="nav"] button:has-text("Community")').first();
    if (await communityItem.isVisible()) {
      await communityItem.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'screenshots/sidebar-community-expanded.png', fullPage: false });

    // Get all nav text
    const allNavText = await page.locator('nav, aside, [class*="sidebar"]').first().textContent();
    console.log('Full sidebar text:', allNavText?.trim().slice(0, 1000));

    // Check all nav links
    const allLinks = await page.locator('a[href]').all();
    const navLinks = [];
    for (const link of allLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && text?.trim()) {
        navLinks.push({ text: text.trim(), href });
      }
    }
    console.log('All internal nav links:', JSON.stringify(navLinks, null, 2));

    // Find Cohorts in links
    const cohortLinks = navLinks.filter(l => /cohort/i.test(l.text) || /cohort/i.test(l.href));
    console.log('Cohort links:', cohortLinks);
  });

  test('COH2-02 Real courses list with live data', async ({ page }) => {
    // Override mockAll for courses - let it pass through real data
    // Undo the courses mock by using page.unroute (not possible, but we can add a more specific route first)
    // Instead navigate directly to courses but with no mock
    // Actually we can't undo routes, so let's just use the mock result

    // Check if nav has Cohorts under Community
    const communityBtn = page.locator('button:has-text("Community")').first();
    if (await communityBtn.isVisible()) {
      await communityBtn.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: 'screenshots/sidebar-nav-full.png' });

    // Get sidebar html to understand structure
    const sidebarHtml = await page.locator('nav, aside, [class*="sidebar"]').first().innerHTML();
    console.log('Sidebar HTML (first 2000):', sidebarHtml.slice(0, 2000));
  });

  test('COH2-03 Course settings with real data passthrough', async ({ page }) => {
    // Specifically pass through courses API
    // We need to undo the global mock for courses
    // We'll use a separate page that doesn't call mockAll
    // But test.beforeEach already called mockAll. Let's at least check what data is available.

    // Get available courses from mock
    await page.goto('/courses');
    await page.waitForLoadState('networkidle').catch(() => {});
    const rows = await page.locator('table tbody tr').all();
    console.log('Course rows (mocked, expect 0):', rows.length);

    // The mock returns 0 courses. Navigate to settings directly using known IDs from previous runs
    // From v2-step5-courses.png: "test course cohorts" is the first course ID
    // Let's try some IDs
    const testCourseIds = ['test-cohort-course-001', '1', '2', 'test-course-cohorts'];

    for (const id of testCourseIds) {
      await page.goto(`/courses/${id}/settings`);
      await page.waitForTimeout(1000);
      const url = page.url();
      const notFound = await page.locator('text=404, text=Not found, text=PAGE NOT FOUND').isVisible().catch(() => false);
      console.log(`Course /${id}/settings -> ${url} notFound=${notFound}`);

      if (!notFound && !url.includes('/courses?')) {
        const tabs = await page.locator('[role="tab"]').allTextContents();
        const labels = await page.locator('label').allTextContents();
        console.log('Tabs:', tabs);
        console.log('Labels:', labels);
        await page.screenshot({ path: `screenshots/course-settings-${id}.png`, fullPage: true });
        break;
      }
    }
  });
});

// Separate test group that doesn't use mockAll — uses real live data
test.describe('Real live data tests', () => {
  test('COH2-LIVE-01 Real courses list and settings', async ({ page }) => {
    // Only mock login, let everything else through
    await page.route(/\/api\/v1\/admin\/auth\/login\/?$/, async route => {
      const response = await route.fetch();
      if (response.ok()) return route.fulfill({ response });
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: {
            user: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Test', last_name: 'Admin', role: 'super_admin', is_active: true },
            tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
            redirect_to: null,
          },
        }),
      });
    });

    await page.route(/\/api\/v1\/admin\/auth\/profile\/?$/, route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Test', last_name: 'Admin', role: 'super_admin', is_active: true },
        }),
      })
    );

    // Use storageState (already set from beforeAll setup)
    await page.goto('/courses');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/live-courses-list.png', fullPage: true });
    console.log('Live courses URL:', page.url());

    const rows = await page.locator('table tbody tr').all();
    console.log('Live course rows:', rows.length);

    if (rows.length > 0) {
      const firstRowLink = page.locator('table tbody tr:first-child td a, table tbody tr:first-child').first();
      await firstRowLink.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.screenshot({ path: 'screenshots/live-course-detail.png', fullPage: true });
      console.log('Live course detail URL:', page.url());

      const tabs = await page.locator('[role="tab"]').allTextContents();
      console.log('Live course tabs:', tabs);

      const settingsTab = page.locator('[role="tab"]:has-text("Settings")');
      if (await settingsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsTab.click();
        await page.waitForTimeout(1500);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.screenshot({ path: 'screenshots/live-course-settings.png', fullPage: true });
        console.log('Live settings URL:', page.url());

        const labels = await page.locator('label').allTextContents();
        console.log('Live settings labels:', labels);

        const toggles = await page.locator('[role="switch"], input[type="checkbox"]').all();
        for (let i = 0; i < toggles.length; i++) {
          const checked = await toggles[i].isChecked().catch(() => null);
          const ctx = await toggles[i].evaluate(el => {
            let n = el.parentElement;
            for (let j = 0; j < 8; j++) {
              if (n?.textContent?.trim().length > 2) return n.textContent.trim().slice(0, 200);
              n = n?.parentElement;
            }
            return '';
          });
          console.log(`Toggle ${i}: checked=${checked} ctx="${ctx}"`);
        }

        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'screenshots/live-settings-mid.png', fullPage: true });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'screenshots/live-settings-bottom.png', fullPage: true });
      }
    }
  });
});
