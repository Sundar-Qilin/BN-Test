import { test, expect } from '@playwright/test';
import { mockAll, BACKEND } from '../helpers/mock.js';

const MOCK_COHORT = {
  id: 1,
  name: 'Week 24 — Course to Yap',
  status: 'active',
  origin: 'auto',
  course: { id: 10, title: 'Course to Yap', slug: 'course-to-yap' },
  organisation: { id: 5, name: 'Qilin Lab' },
  iso_week: 24,
  iso_year: 2026,
  start_date: '2026-06-08',
  end_date: '2026-06-14',
  member_count: 3,
  cohort_duration_weeks: 4,
};

const MOCK_MEMBER = {
  id: 1,
  user: { id: 100, email: 'learner@example.com', first_name: 'Learner', last_name: 'One' },
  state: 'active',
  source: 'auto',
  is_override: false,
  progress_pct: 65,
};

const MOCK_FLAG = {
  id: 1,
  kind: 'solo',
  cohort: MOCK_COHORT,
  learner: { id: 100, email: 'learner@example.com' },
  status: 'open',
  raised_at: '2026-06-24T08:00:00Z',
};

test.describe('Screenshot all cohort pages', () => {
  test('SS-01 Cohorts list empty + flags tab + dropdowns', async ({ page }) => {
    await mockAll(page);
    await page.route(/\/api\/v1\/admin\/cohorts\//, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }) })
    );
    await page.route(/\/api\/v1\/admin\/cohort-flags\//, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }) })
    );
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    await page.goto('/cohorts');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/SS-cohorts-empty.png', fullPage: true });

    const headings = await page.locator('h1, h2').allTextContents();
    const subtitle = await page.locator('p').first().textContent().catch(() => '');
    const tabs = await page.locator('[role="tab"]').allTextContents();
    const emptyText = await page.locator('body').evaluate(el => el.innerText.match(/no cohorts.*/gi)?.[0] || '');
    console.log('H1/H2:', headings, 'Subtitle:', subtitle, 'Tabs:', tabs, 'Empty:', emptyText);

    // Flags tab
    await page.locator('[role="tab"]:has-text("Flags")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/SS-flags-empty.png', fullPage: true });

    const flagThs = await page.locator('th').allTextContents();
    const comboboxes = await page.locator('[role="combobox"]').all();
    console.log('Flags TH:', flagThs);

    // Status dropdown
    const statusCbo = page.locator('[role="combobox"]').filter({ hasText: 'Open' }).or(page.locator('[aria-label="Filter by status"]')).first();
    await statusCbo.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'screenshots/SS-flags-status-open.png', fullPage: true });
    const statusOpts = await page.locator('[role="option"]').allTextContents();
    console.log('Status options:', statusOpts);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // Kind dropdown
    const kindCbo = page.locator('[aria-label="Filter by kind"]').or(page.locator('[role="combobox"]').nth(1)).first();
    await kindCbo.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'screenshots/SS-flags-kind-open.png', fullPage: true });
    const kindOpts = await page.locator('[role="option"]').allTextContents();
    console.log('Kind options:', kindOpts);
    await page.keyboard.press('Escape');
  });

  test('SS-02 Cohorts list with data', async ({ page }) => {
    await mockAll(page);
    await page.route(/\/api\/v1\/admin\/cohorts\//, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [MOCK_COHORT], count: 1, next: null, previous: null } }) })
    );
    await page.route(/\/api\/v1\/admin\/cohort-flags\//, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }) })
    );
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    await page.goto('/cohorts');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/SS-cohorts-with-data.png', fullPage: true });

    const rows = await page.locator('table tbody tr').all();
    console.log('Cohort rows with data:', rows.length);
    const thTexts = await page.locator('th').allTextContents();
    console.log('Column headers:', thTexts);

    if (rows.length > 0) {
      const rowText = await rows[0].textContent();
      console.log('First cohort row text:', rowText?.trim());
    }
  });

  test('SS-03 Cohort detail page', async ({ page }) => {
    await mockAll(page);
    await page.route(/\/api\/v1\/admin\/cohorts\//, route => {
      const url = route.request().url();
      if (url.includes('/1/members')) {
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { results: [MOCK_MEMBER], count: 1 } }) });
      }
      if (url.includes('/1/activity')) {
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { results: [], count: 0 } }) });
      }
      if (url.match(/cohorts\/1\/?$/)) {
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_COHORT }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [MOCK_COHORT], count: 1 } }) });
    });
    await page.route(/\/api\/v1\/admin\/cohort-flags\//, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [MOCK_FLAG], count: 1 } }) })
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    await page.goto('/cohorts/1');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/SS-cohort-detail.png', fullPage: true });
    console.log('Detail URL:', page.url());

    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Detail headings:', headings);

    const tabs = await page.locator('[role="tab"]').allTextContents();
    console.log('Detail tabs:', tabs);

    // Check members tab
    const membersTab = page.locator('[role="tab"]:has-text("Members")');
    if (await membersTab.isVisible()) {
      await membersTab.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/SS-cohort-members-tab.png', fullPage: true });
      const membersThs = await page.locator('th').allTextContents();
      console.log('Members table headers:', membersThs);
    }

    // Check activity tab
    const activityTab = page.locator('[role="tab"]:has-text("Activity")');
    if (await activityTab.isVisible()) {
      await activityTab.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/SS-cohort-activity-tab.png', fullPage: true });
    }
  });

  test('SS-04 Course settings cohort section', async ({ page }) => {
    await mockAll(page);
    // Mock course list
    await page.route(/\/api\/v1\/admin\/courses\/$|\/api\/v1\/admin\/courses\/\?/, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [{
          id: 10, title: 'Course to Yap', slug: 'course-to-yap', status: 'published',
          modules_count: 1, lessons_count: 8, duration: null, updated_at: '2026-06-24T00:00:00Z',
        }], count: 1, next: null, previous: null } }) })
    );
    // Mock course detail
    await page.route(/\/api\/v1\/admin\/courses\/10\/?$/, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {
          id: 10, title: 'Course to Yap', slug: 'course-to-yap', status: 'published',
          cohorts_enabled: false, cohort_duration_weeks: 4, cohort_proximity_threshold_days: 7,
          certificate_enabled: true, completion_percentage: 80, is_public: true,
        } }) })
    );
    // Mock course settings sub-routes
    await page.route(/\/api\/v1\/admin\/courses\/10\/settings/, route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }) })
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Navigate directly to the course
    await page.goto('/courses/10');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/SS-course-detail-10.png', fullPage: true });
    console.log('Course detail URL:', page.url());

    const tabs = await page.locator('[role="tab"]').allTextContents();
    console.log('Course tabs:', tabs);

    const settingsTab = page.locator('[role="tab"]:has-text("Settings")');
    if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/SS-course-settings.png', fullPage: true });
      console.log('Settings URL:', page.url());

      const labels = await page.locator('label').allTextContents();
      const headings = await page.locator('h1, h2, h3, h4').allTextContents();
      console.log('Settings labels:', labels);
      console.log('Settings headings:', headings);

      const switches = await page.locator('[role="switch"]').all();
      console.log('Switches count:', switches.length);
      for (let i = 0; i < switches.length; i++) {
        const checked = await switches[i].isChecked().catch(() => null);
        const ctx = await switches[i].evaluate(el => {
          let n = el.parentElement;
          for (let j = 0; j < 10; j++) {
            const t = n?.textContent?.trim();
            if (t && t.length > 2) return t.slice(0, 200);
            n = n?.parentElement;
          }
          return '';
        });
        console.log(`Switch ${i}: checked=${checked} context="${ctx}"`);
      }

      // Scroll
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(200);
      await page.screenshot({ path: 'screenshots/SS-course-settings-mid.png', fullPage: false });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(200);
      await page.screenshot({ path: 'screenshots/SS-course-settings-bottom.png', fullPage: false });
    } else {
      console.log('[WARN] No Settings tab found. Tabs:', tabs);
      // Try /courses/10/settings directly
      await page.goto('/courses/10/settings');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/SS-course-settings-direct.png', fullPage: true });
      console.log('Direct settings URL:', page.url());
      const bodyText = await page.locator('body').textContent();
      console.log('Page body (first 500):', bodyText?.trim().slice(0, 500));
    }
  });

  test('SS-05 Sidebar expanded', async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Expand all collapsible nav groups
    const expandBtns = await page.locator('[class*="sidebar"] button, nav button').all();
    for (const btn of expandBtns) {
      const text = await btn.textContent();
      if (text && /community|content|people|organizations|commerce|system/i.test(text)) {
        const isExpanded = await btn.getAttribute('aria-expanded') || '';
        if (isExpanded !== 'true') {
          await btn.click().catch(() => {});
          await page.waitForTimeout(200);
        }
      }
    }

    await page.screenshot({ path: 'screenshots/SS-sidebar-all-expanded.png' });

    const allNavText = await page.locator('nav, aside, [class*="sidebar"]').first().innerText();
    console.log('All nav text:', allNavText);
  });
});
