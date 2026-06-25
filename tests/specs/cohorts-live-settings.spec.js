import { test, expect } from '@playwright/test';

// This test suite uses live data (no mockAll) to get the course settings tab with cohorts section
// Uses the storageState (mock tokens) + profile mock + let courses API through

test.describe('Live Course Settings - Cohorts Section', () => {

  test.beforeEach(async ({ page }) => {
    // Mock profile endpoint so app doesn't redirect to login
    await page.route(/\/api\/v1\/admin\/auth\/profile\/?$/, route =>
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Test', last_name: 'Admin', role: 'super_admin', is_active: true },
        }),
      })
    );

    // All other API calls pass through, fall back to empty on error
    await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
      try {
        const resp = await route.fetch({ timeout: 20000 });
        if (resp.ok()) return route.fulfill({ response: resp });
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }),
        });
      } catch (e) {
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }),
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);
  });

  test('LIVE-01 Courses list - real data', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/live2-courses-list.png', fullPage: true });

    const url = page.url();
    console.log('URL:', url);

    const rows = await page.locator('table tbody tr').all();
    console.log('Course rows:', rows.length);

    const rowTexts = [];
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const text = await rows[i].textContent();
      rowTexts.push(text?.trim().slice(0, 100));
    }
    console.log('First 5 rows:', rowTexts);

    if (rows.length > 0) {
      // Click first course
      await rows[0].click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.screenshot({ path: 'screenshots/live2-course-detail.png', fullPage: true });
      console.log('Detail URL:', page.url());

      const tabs = await page.locator('[role="tab"]').allTextContents();
      console.log('Tabs:', tabs);

      const settingsTab = page.locator('[role="tab"]:has-text("Settings")');
      if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await settingsTab.click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.screenshot({ path: 'screenshots/live2-settings.png', fullPage: true });
        console.log('Settings URL:', page.url());

        // Get all visible labels
        const labels = await page.locator('label:visible').allTextContents();
        console.log('Labels:', labels);

        // Get section headings
        const headings = await page.locator('h2, h3, h4').allTextContents();
        console.log('Headings:', headings);

        // Get toggle/switch details
        const toggles = await page.locator('[role="switch"]').all();
        console.log('Toggle count:', toggles.length);
        for (let i = 0; i < toggles.length; i++) {
          const checked = await toggles[i].isChecked().catch(() => null);
          const ariaLabel = await toggles[i].getAttribute('aria-label') || '';
          const ctx = await toggles[i].evaluate(el => {
            let n = el.parentElement;
            for (let j = 0; j < 10; j++) {
              if (n?.textContent?.trim().length > 2) return n.textContent.trim().slice(0, 200);
              n = n?.parentElement;
            }
            return '';
          });
          console.log(`[role=switch] ${i}: checked=${checked} aria-label="${ariaLabel}" ctx="${ctx}"`);
        }

        // Scroll and get more
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'screenshots/live2-settings-mid.png', fullPage: true });

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'screenshots/live2-settings-bottom.png', fullPage: true });

        // Look for cohort section specifically
        const cohortSection = await page.locator('[class*="cohort"], [id*="cohort"]').all();
        console.log('Cohort-specific elements count:', cohortSection.length);
        for (const el of cohortSection) {
          const text = await el.textContent();
          console.log('Cohort element:', text?.trim().slice(0, 200));
        }

        // Look for section headers mentioning Cohort
        const allText = await page.locator('main').textContent().catch(() => '');
        const cohortIdx = allText?.toLowerCase().indexOf('cohort') || -1;
        if (cohortIdx > 0) {
          console.log('Cohort mention in page at idx', cohortIdx, ':', allText?.slice(Math.max(0, cohortIdx - 50), cohortIdx + 200));
        }
      }
    }
  });

  test('LIVE-02 Learner portal - login page check', async ({ page }) => {
    await page.goto('https://learner.dev.budgetnista.qilinlab.com/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/learner-login-fresh.png', fullPage: true });
    console.log('Learner login URL:', page.url());

    // Get form field labels
    const labels = await page.locator('label').allTextContents();
    console.log('Labels:', labels);

    // Get placeholder text from inputs
    const inputs = await page.locator('input').all();
    for (const inp of inputs) {
      const ph = await inp.getAttribute('placeholder') || '';
      const type = await inp.getAttribute('type') || '';
      console.log(`Input: type=${type} placeholder=${ph}`);
    }

    // Get page headings
    const headings = await page.locator('h1, h2').allTextContents();
    console.log('Headings:', headings);
  });
});
