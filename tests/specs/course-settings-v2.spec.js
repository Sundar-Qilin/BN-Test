import { test, expect } from '@playwright/test';
import { mockAll, BACKEND } from '../helpers/mock.js';

// Strategy: navigate directly to /courses/{slug} using a real slug from the live site
// All backend calls are mocked so we don't get 401 redirects
// The course detail and settings APIs are also mocked with cohort data

const COURSE_SLUG = 'course-to-yap';
const COURSE_ID = 10;

const MOCK_COURSE_DETAIL = {
  id: COURSE_ID,
  title: 'Course to Yap',
  slug: COURSE_SLUG,
  status: 'published',
  description: 'A test course',
  cohorts_enabled: false,
  cohort_duration_weeks: 4,
  cohort_proximity_threshold_days: 7,
  certificate_enabled: true,
  completion_percentage: 80,
  is_public: true,
  enrollment_limit: null,
  modules_count: 2,
  lessons_count: 8,
  duration: null,
  updated_at: '2026-06-24T00:00:00Z',
};

test('Course Settings - Cohort section screenshot', async ({ page }) => {
  // First mock everything via mockAll
  await mockAll(page);

  // Override: course detail by ID
  await page.route(new RegExp(`/api/v1/admin/courses/${COURSE_ID}/?$`), route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: MOCK_COURSE_DETAIL }),
    })
  );

  // Override: course detail by slug (some apps use slug in URL)
  await page.route(new RegExp(`/api/v1/admin/courses/${COURSE_SLUG}/?$`), route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: MOCK_COURSE_DETAIL }),
    })
  );

  // Override: any course detail (catch-all)
  await page.route(/\/api\/v1\/admin\/courses\/[^/?]+\/?$/, route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: MOCK_COURSE_DETAIL }),
    })
  );

  // Mock curriculum/modules under course
  await page.route(/\/api\/v1\/admin\/courses\/[^/?]+\/modules/, route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0 } }),
    })
  );

  // Mock courses list
  await page.route(/\/api\/v1\/admin\/courses\/\?/, route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, data: {
          results: [MOCK_COURSE_DETAIL], count: 1, next: null, previous: null,
        },
      }),
    })
  );

  // Go to homepage first to set session
  await page.goto('/');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/cs2-homepage.png', fullPage: false });
  console.log('Homepage URL:', page.url());

  // Navigate directly to course settings URL
  await page.goto(`/courses/${COURSE_SLUG}/settings`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/cs2-settings-slug.png', fullPage: true });
  console.log('Settings (slug) URL:', page.url());

  const body1 = await page.locator('body').textContent();
  console.log('Body (slug route) first 300:', body1?.trim().slice(0, 300));

  // Try by ID
  await page.goto(`/courses/${COURSE_ID}/settings`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/cs2-settings-id.png', fullPage: true });
  console.log('Settings (id) URL:', page.url());

  const body2 = await page.locator('body').textContent();
  console.log('Body (id route) first 300:', body2?.trim().slice(0, 300));

  // Try navigating to course detail first, then click Settings tab
  await page.goto(`/courses/${COURSE_SLUG}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/cs2-course-detail.png', fullPage: true });
  console.log('Course detail URL:', page.url());

  const tabs = await page.locator('[role="tab"]').allTextContents();
  console.log('Tabs from course detail:', tabs);

  const settingsTab = page.locator('[role="tab"]').filter({ hasText: /^Settings$/i });
  const settingsTabVisible = await settingsTab.isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Settings tab visible:', settingsTabVisible);

  if (settingsTabVisible) {
    await settingsTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/cs2-settings-via-tab.png', fullPage: true });
    console.log('Settings tab URL:', page.url());
    await captureSettingsDetails(page);
  }

  // Also try ID-based course detail
  await page.goto(`/courses/${COURSE_ID}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/cs2-course-detail-id.png', fullPage: true });
  console.log('Course (by id) URL:', page.url());

  const tabs2 = await page.locator('[role="tab"]').allTextContents();
  console.log('Tabs from course (id):', tabs2);

  const settingsTab2 = page.locator('[role="tab"]').filter({ hasText: /^Settings$/i });
  if (await settingsTab2.isVisible({ timeout: 3000 }).catch(() => false)) {
    await settingsTab2.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/cs2-settings-via-tab-id.png', fullPage: true });
    console.log('Settings tab (id) URL:', page.url());
    await captureSettingsDetails(page);
  }
});

async function captureSettingsDetails(page) {
  const labels = await page.locator('label').allTextContents();
  console.log('Settings labels:', labels);

  const headings = await page.locator('h2, h3, h4').allTextContents();
  console.log('Settings headings:', headings);

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

  const mainText = await page.locator('main').textContent().catch(() => '');
  const cohortIdx = mainText?.toLowerCase().indexOf('cohort') ?? -1;
  if (cohortIdx >= 0) {
    console.log('Cohort text found:', mainText?.slice(Math.max(0, cohortIdx - 20), cohortIdx + 300));
  } else {
    console.log('No "cohort" text found in main content');
  }

  // Scroll through page capturing
  const pageH = await page.evaluate(() => document.body.scrollHeight);
  console.log('Page height:', pageH);

  for (let scrollY = 0; scrollY <= pageH; scrollY += 500) {
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `screenshots/cs2-scroll-${scrollY}.png`, fullPage: false });
  }
}
