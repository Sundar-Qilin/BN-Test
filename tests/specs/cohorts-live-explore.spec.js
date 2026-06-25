/**
 * Live exploration of the Budgetnista Cohorts feature.
 * Uses mockAll() to handle auth/profile while letting real cohorts/flags/courses
 * endpoints through to the backend.
 *
 * Screenshots saved to C:\BN Test\screenshots\recheck\
 */
import { test, expect } from '@playwright/test';
import { mockAll, BACKEND } from '../helpers/mock.js';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = 'C:\\BN Test\\screenshots\\recheck';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function ss(name) {
  return path.join(SCREENSHOT_DIR, `${name}.png`);
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** mockAll handles auth/profile; we then UN-route cohort & course APIs
 *  so they hit the real backend with the stored cookies. */
async function setupLiveAdmin(page) {
  await mockAll(page);
  // Un-route cohorts, flags, courses so real data comes through
  // (mockAll routes the whole BACKEND pattern — unroute specific paths)
  await page.unroute(BACKEND);
  // Re-apply mockAll manually for the only calls we need to mock:
  //   auth/profile (so the app thinks we're super_admin)
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/auth\/profile\/?/,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Super', last_name: 'Admin', role: 'super_admin', is_active: true, is_platform_admin: true },
      }),
    })
  );
  await page.goto('/');
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ─── Admin: Sidebar ────────────────────────────────────────────────────────────

test('ADMIN-SIDEBAR: Full sidebar navigation', async ({ page }) => {
  await mockAll(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);

  // Screenshot full dashboard
  await page.screenshot({ path: ss('ADMIN-01-dashboard'), fullPage: true });

  // Get all nav links
  const navLinks = await page.locator('nav a, [class*="sidebar"] a, aside a').all();
  const links = [];
  for (const link of navLinks) {
    const text = await link.innerText().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    if (text.trim()) links.push({ text: text.trim(), href });
  }
  console.log('NAV LINKS:\n' + JSON.stringify(links, null, 2));

  // Get full nav text
  const navEl = page.locator('nav').first();
  const navText = await navEl.innerText().catch(() => 'nav not found');
  console.log('NAV TEXT:\n' + navText);

  // Try to expand collapsible groups
  const collapsibleBtns = await page.locator('nav button, [class*="sidebar"] button, aside button').all();
  for (const btn of collapsibleBtns) {
    const btnText = await btn.innerText().catch(() => '');
    if (btnText.trim()) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  }
  await page.screenshot({ path: ss('ADMIN-02-sidebar-expanded'), fullPage: true });

  const navText2 = await page.locator('nav').first().innerText().catch(() => '');
  console.log('NAV TEXT AFTER EXPANSION:\n' + navText2);
});

// ─── Admin: Cohorts list page ─────────────────────────────────────────────────

test('ADMIN-COHORTS-LIST: /cohorts page full inspection', async ({ page }) => {
  await mockAll(page);
  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  await page.screenshot({ path: ss('ADMIN-03-cohorts-list-full'), fullPage: true });

  // Page title/heading
  const h1 = await page.locator('h1').first().innerText().catch(() => '');
  const h2 = await page.locator('h2').first().innerText().catch(() => '');
  console.log('H1:', h1, '| H2:', h2);

  // Tabs
  const tabs = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
  console.log('TABS:', JSON.stringify(tabs));

  // Description / subtitle
  const subtitle = await page.locator('p, [class*="subtitle"], [class*="description"]').first().innerText().catch(() => '');
  console.log('SUBTITLE/DESCRIPTION:', subtitle);

  // Table headers
  const ths = await page.locator('th').allInnerTexts().catch(() => []);
  console.log('TABLE HEADERS:', JSON.stringify(ths));

  // Empty state text
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('FULL PAGE TEXT (first 2000 chars):\n' + bodyText.substring(0, 2000));

  // Buttons
  const btns = await page.locator('button').allInnerTexts().catch(() => []);
  console.log('ALL BUTTONS:', JSON.stringify(btns));

  // Any search/filter controls
  const inputPlaceholders = [];
  const inputs = await page.locator('input').all();
  for (const inp of inputs) {
    const ph = await inp.getAttribute('placeholder').catch(() => '');
    if (ph) inputPlaceholders.push(ph);
  }
  console.log('INPUT PLACEHOLDERS:', JSON.stringify(inputPlaceholders));
});

// ─── Admin: Flags tab ─────────────────────────────────────────────────────────

test('ADMIN-FLAGS-TAB: Flags tab + all dropdowns', async ({ page }) => {
  await mockAll(page);
  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);

  // Click Flags tab
  const flagsTab = page.getByRole('tab', { name: /flags/i }).first();
  if (await flagsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await flagsTab.click();
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: ss('ADMIN-04-flags-tab'), fullPage: true });

  // Full flags tab text
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('FLAGS TAB BODY TEXT (first 2000):\n' + bodyText.substring(0, 2000));

  // All buttons
  const btns = await page.locator('button').allInnerTexts().catch(() => []);
  console.log('FLAGS TAB BUTTONS:', JSON.stringify(btns));

  // Table headers on flags tab
  const ths = await page.locator('th').allInnerTexts().catch(() => []);
  console.log('FLAGS TABLE HEADERS:', JSON.stringify(ths));

  // Try each dropdown/combobox
  const comboboxes = await page.locator('[role="combobox"], select').all();
  console.log('COMBOBOX COUNT:', comboboxes.length);
  for (let i = 0; i < comboboxes.length; i++) {
    const tag = await comboboxes[i].evaluate(el => el.tagName).catch(() => '');
    if (tag === 'SELECT') {
      const opts = await comboboxes[i].locator('option').allInnerTexts().catch(() => []);
      console.log(`SELECT ${i} OPTIONS:`, JSON.stringify(opts));
    } else {
      await comboboxes[i].click().catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({ path: ss(`ADMIN-04-flags-combobox-${i}`), fullPage: false });
      const opts = await page.locator('[role="option"], [role="listbox"] li').allInnerTexts().catch(() => []);
      console.log(`COMBOBOX ${i} OPTIONS:`, JSON.stringify(opts));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
  }

  // Also try clicking buttons that look like filter dropdowns
  const filterBtns = await page.locator('button').filter({ hasText: /all |status|kind|course/i }).all();
  for (let i = 0; i < filterBtns.length; i++) {
    const btnText = await filterBtns[i].innerText().catch(() => '');
    await filterBtns[i].click().catch(() => {});
    await page.waitForTimeout(400);
    await page.screenshot({ path: ss(`ADMIN-04-filter-btn-${i}-${btnText.replace(/\s+/g, '_').substring(0, 15)}`), fullPage: false });
    const opts = await page.locator('[role="option"], [role="menuitem"], ul[class*="dropdown"] li, [class*="dropdown-content"] *').allInnerTexts().catch(() => []);
    console.log(`FILTER BTN "${btnText}" OPTIONS:`, JSON.stringify(opts));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
});

// ─── Admin: Course settings cohort section ────────────────────────────────────

test('ADMIN-COURSE-SETTINGS: Cohort section in course settings', async ({ page }) => {
  await mockAll(page);
  await page.goto('/courses');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: ss('ADMIN-05-courses-list'), fullPage: true });

  const courseLinks = await page.locator('a[href*="/courses/"]').all();
  console.log('COURSE LINKS COUNT:', courseLinks.length);
  const courseHrefs = [];
  for (const link of courseLinks) {
    const href = await link.getAttribute('href').catch(() => '');
    const text = await link.innerText().catch(() => '');
    if (href && href !== '/courses') courseHrefs.push({ text: text.trim().substring(0, 50), href });
  }
  console.log('COURSE HREFS (first 5):', JSON.stringify(courseHrefs.slice(0, 5), null, 2));

  if (courseHrefs.length > 0) {
    // Navigate to first course
    await page.goto('https://admin.dev.budgetnista-admin.qilinlab.com' + courseHrefs[0].href);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('ADMIN-06-course-detail'), fullPage: true });

    // Click Settings tab
    const settingsTab = page.getByRole('tab', { name: /settings/i });
    if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsTab.click();
      await page.waitForTimeout(2000);
    } else {
      // Try links
      await page.locator('a, button').filter({ hasText: /settings/i }).first().click().catch(() => {});
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: ss('ADMIN-07-course-settings'), fullPage: true });

    // Scroll through settings page
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.screenshot({ path: ss('ADMIN-07b-course-settings-mid'), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.screenshot({ path: ss('ADMIN-07c-course-settings-bottom'), fullPage: false });

    // Full page text
    const bodyText = await page.locator('[role="tabpanel"], main, [class*="content"]').first().innerText().catch(() => '');
    console.log('COURSE SETTINGS FULL TEXT:\n' + bodyText.substring(0, 3000));
  } else {
    console.log('NO COURSE LINKS FOUND — courses list may be empty');
  }
});

// ─── Admin: Cohort detail (with mock data so we can see the UI) ───────────────

test('ADMIN-COHORT-DETAIL: Cohort detail page UI inspection', async ({ page }) => {
  // Mock a cohort so we can navigate to it
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
    expected_modified_date: '2026-06-24T10:00:00Z',
  };
  const MOCK_MEMBER = {
    id: 1,
    user: { id: 100, email: 'learner@example.com', first_name: 'Learner', last_name: 'One' },
    state: 'active',
    source: 'auto',
    is_override: false,
    progress_pct: 65,
  };

  await mockAll(page);

  // Mock cohorts list
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\/(?!\d)/,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [MOCK_COHORT], count: 1, next: null, previous: null } }),
    })
  );
  // Mock cohort detail
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\/1\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: MOCK_COHORT }),
    })
  );
  // Mock members
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\/1\/members\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [MOCK_MEMBER], count: 1, next: null, previous: null } }),
    })
  );
  // Mock activity
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\/1\/activity\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0 } }),
    })
  );
  // Mock flags
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohort-flags\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
    })
  );

  await page.goto('/cohorts/1');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: ss('ADMIN-08-cohort-detail'), fullPage: true });

  // Page text
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('COHORT DETAIL TEXT (first 3000):\n' + bodyText.substring(0, 3000));

  // Tabs
  const tabs = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
  console.log('COHORT DETAIL TABS:', JSON.stringify(tabs));

  // Headings
  const headings = await page.locator('h1, h2, h3').allInnerTexts().catch(() => []);
  console.log('HEADINGS:', JSON.stringify(headings));

  // Buttons
  const btns = await page.locator('button').allInnerTexts().catch(() => []);
  console.log('COHORT DETAIL BUTTONS:', JSON.stringify(btns));

  // Click Members tab
  const membersTab = page.getByRole('tab', { name: /members/i }).first();
  if (await membersTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await membersTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('ADMIN-09-cohort-members'), fullPage: true });
    const memberHeaders = await page.locator('th').allInnerTexts().catch(() => []);
    console.log('MEMBER TABLE HEADERS:', JSON.stringify(memberHeaders));
    const memberBtns = await page.locator('button').allInnerTexts().catch(() => []);
    console.log('MEMBER TAB BUTTONS:', JSON.stringify(memberBtns));
  }

  // Click Activity tab
  const activityTab = page.getByRole('tab', { name: /activity/i }).first();
  if (await activityTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await activityTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ss('ADMIN-10-cohort-activity'), fullPage: true });
    const activityText = await page.locator('[role="tabpanel"]').first().innerText().catch(() => '');
    console.log('ACTIVITY TAB TEXT:', activityText.substring(0, 500));
  }

  // Click Manage button
  const manageBtn = page.getByRole('button', { name: /manage/i }).first();
  if (await manageBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await manageBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('ADMIN-11-manage-dropdown'), fullPage: false });
    const menuItems = await page.locator('[role="menuitem"], [role="menu"] *').allInnerTexts().catch(() => []);
    console.log('MANAGE MENU ITEMS:', JSON.stringify(menuItems));
    await page.keyboard.press('Escape');
  } else {
    console.log('NO MANAGE BUTTON FOUND');
  }
});

// ─── Admin: Cohorts list with real data ──────────────────────────────────────

test('ADMIN-COHORTS-REAL: /cohorts with real backend data', async ({ page }) => {
  // Only mock profile; let cohorts, flags, courses hit real backend
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/auth\/profile\/?/,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Super', last_name: 'Admin', role: 'super_admin', is_active: true, is_platform_admin: true },
      }),
    })
  );

  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: ss('ADMIN-12-cohorts-real-data'), fullPage: true });

  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('REAL DATA PAGE TEXT (first 3000):\n' + bodyText.substring(0, 3000));
});
