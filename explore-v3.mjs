// @ts-check
// v3: Use the exact same approach as auth.js helper (which worked previously)
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const LEARNER_URL = 'https://learner.dev.budgetnista.qilinlab.com';
const EMAIL = 'superadmin@yopmail.com';
const PASSWORD = 'Admin@123';

async function ss(page, name) {
  const fp = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`[SS] ${name}`);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    baseURL: ADMIN_URL,
  });
  const page = await ctx.newPage();

  // Log all API calls
  page.on('response', resp => {
    const u = resp.url();
    if (u.includes('railway.app')) console.log(`[API] ${resp.status()} ${u.split('?')[0]}`);
  });

  // EXACTLY from auth.js — only intercept login, let everything else through
  await page.route(/\/api\/v1\/admin\/auth\/login\/?$/, async route => {
    const response = await route.fetch();
    if (response.ok()) return route.fulfill({ response });
    const body = await response.text().catch(() => '');
    console.log('[LOGIN INTERCEPT] status:', response.status(), 'body:', body.slice(0, 100));
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        error: null,
        data: {
          user: {
            id: 1,
            email: EMAIL,
            first_name: 'Test',
            last_name: 'Admin',
            role: 'super_admin',
            is_active: true,
          },
          tokens: {
            access: 'mock-access-token',
            refresh: 'mock-refresh-token',
          },
          redirect_to: null,
        },
      }),
    });
  });

  // Mock profile (needed for app to not redirect back to login)
  await page.route(/\/api\/v1\/admin\/auth\/profile\/?$/, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        error: null,
        data: {
          id: 1,
          email: EMAIL,
          first_name: 'Test',
          last_name: 'Admin',
          role: 'super_admin',
          is_active: true,
        },
      }),
    })
  );

  // Let all other backend calls go through, fallback to empty on error
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    try {
      const resp = await route.fetch({ timeout: 15000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }),
      });
    } catch (e) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }),
      });
    }
  });

  // Go to login
  await page.goto('/login');
  await page.waitForTimeout(2000);
  await ss(page, 'v3-01-login.png');

  await page.getByRole('textbox', { name: 'admin@gmail.com' }).fill(EMAIL);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(PASSWORD);

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => {});

  const button = page.getByRole('button', { name: 'Sign in' });
  const box = await button.boundingBox();
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(100, 200);
    await page.waitForTimeout(400);
    await page.mouse.move(300, 150, { steps: 8 });
    await page.waitForTimeout(300);
    await page.mouse.move(cx, cy, { steps: 10 });
    await page.waitForTimeout(500);
  }

  await button.click();
  await page.waitForTimeout(4000);

  const url = page.url();
  console.log('Post-login URL:', url);

  if (url.includes('/login')) {
    const errors = await page.locator('[role="alert"]').allTextContents();
    console.log('Errors:', errors);
    await ss(page, 'v3-error.png');
    await browser.close();
    return;
  }

  console.log('[SUCCESS] Logged in!');
  await ss(page, 'v3-02-dashboard.png');

  // Sidebar nav
  const navItems = await page.locator('[class*="sidebar"] a, nav a, aside a').allTextContents();
  console.log('\nSidebar items:', navItems);

  // === COHORTS PAGE ===
  console.log('\n=== /cohorts ===');
  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await ss(page, 'v3-03-cohorts.png');
  console.log('URL:', page.url());

  const cohortsHeading = await page.locator('h1, h2').allTextContents();
  console.log('Headings:', cohortsHeading);

  const tabs = await page.locator('[role="tab"]').allTextContents();
  console.log('Tabs:', tabs);

  const thTexts = await page.locator('th').allTextContents();
  console.log('Table headers:', thTexts);

  const emptyText = await page.locator('[class*="empty"], [class*="Empty"]').allTextContents();
  console.log('Empty state:', emptyText);

  // === FLAGS TAB ===
  const flagsTab = page.locator('[role="tab"]:has-text("Flags")');
  if (await flagsTab.isVisible()) {
    await flagsTab.click();
    await page.waitForTimeout(1000);
    await ss(page, 'v3-04-flags-tab.png');
    console.log('\n=== Flags tab ===');

    const flagThs = await page.locator('th').allTextContents();
    console.log('Flags table headers:', flagThs);

    // Open status dropdown
    const statusDrop = page.locator('[role="combobox"]').first();
    if (await statusDrop.isVisible()) {
      await statusDrop.click();
      await page.waitForTimeout(500);
      await ss(page, 'v3-05-status-dropdown.png');
      const opts = await page.locator('[role="option"]').allTextContents();
      console.log('Status options:', opts);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    // Open kind dropdown
    const comboboxes = await page.locator('[role="combobox"]').all();
    if (comboboxes.length > 1) {
      await comboboxes[1].click();
      await page.waitForTimeout(500);
      await ss(page, 'v3-06-kind-dropdown.png');
      const opts = await page.locator('[role="option"]').allTextContents();
      console.log('Kind options:', opts);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    if (comboboxes.length > 2) {
      await comboboxes[2].click();
      await page.waitForTimeout(500);
      await ss(page, 'v3-07-course-filter.png');
      const opts = await page.locator('[role="option"]').allTextContents();
      console.log('Course filter options:', opts);
      await page.keyboard.press('Escape');
    }
  }

  // === COURSE SETTINGS ===
  console.log('\n=== /courses ===');
  await page.goto('/courses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await ss(page, 'v3-08-courses.png');

  const courseRows = await page.locator('table tbody tr').all();
  console.log('Course rows:', courseRows.length);

  if (courseRows.length > 0) {
    // Try clicking first course
    await courseRows[0].click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await ss(page, 'v3-09-course-detail.png');
    console.log('Course detail URL:', page.url());

    const courseTabs = await page.locator('[role="tab"]').allTextContents();
    console.log('Course tabs:', courseTabs);

    const settingsTab = page.locator('[role="tab"]:has-text("Settings")');
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      await ss(page, 'v3-10-course-settings.png');
      console.log('Settings URL:', page.url());

      const labels = await page.locator('label').allTextContents();
      console.log('Settings labels:', labels);

      const toggles = await page.locator('[role="switch"], input[type="checkbox"]').all();
      for (let i = 0; i < toggles.length; i++) {
        const checked = await toggles[i].isChecked().catch(() => null);
        const id = await toggles[i].getAttribute('id') || '';
        const name = await toggles[i].getAttribute('name') || '';
        const ctx2 = await toggles[i].evaluate(el => {
          let n = el.parentElement;
          for (let j = 0; j < 6; j++) {
            if (n?.textContent?.trim().length > 2) return n.textContent.trim().slice(0, 150);
            n = n?.parentElement;
          }
          return '';
        });
        console.log(`Toggle ${i}: id="${id}" name="${name}" checked=${checked} ctx="${ctx2}"`);
      }

      // Scroll to see all settings
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);
      await ss(page, 'v3-10b-settings-mid.png');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await ss(page, 'v3-10c-settings-bottom.png');
    } else {
      console.log('No Settings tab found. Tabs:', courseTabs);
    }
  }

  // === COHORT DETAIL ===
  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const cohortRows = await page.locator('table tbody tr').all();
  console.log('\nCohort rows (for detail nav):', cohortRows.length);
  if (cohortRows.length > 0) {
    await cohortRows[0].click();
    await page.waitForTimeout(2000);
    await ss(page, 'v3-11-cohort-detail.png');
    console.log('Cohort detail URL:', page.url());
  }

  await ctx.close();
  await browser.close();
  console.log('\nDone. Screenshots:', SCREENSHOTS_DIR);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
