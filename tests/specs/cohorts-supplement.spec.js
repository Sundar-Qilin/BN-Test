/**
 * Supplementary exploration: sidebar, course settings cohort section, manage dropdown.
 */
import { test, expect } from '@playwright/test';
import { mockAll } from '../helpers/mock.js';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = 'C:\\BN Test\\screenshots\\recheck';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function ss(name) { return path.join(SCREENSHOT_DIR, `${name}.png`); }

test('SUPP-SIDEBAR: Expand Community group and find Cohorts', async ({ page }) => {
  await mockAll(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  // Screenshot initial dashboard with sidebar
  await page.screenshot({ path: ss('SUPP-01-initial-sidebar'), fullPage: false });

  // Get all sidebar group items (non-link buttons)
  const sidebarBtns = await page.locator('nav button, [class*="sidebar"] button, aside button').all();
  console.log('SIDEBAR BUTTON COUNT:', sidebarBtns.length);

  for (const btn of sidebarBtns) {
    const text = await btn.innerText().catch(() => '');
    console.log('  SIDEBAR BTN:', text.trim().substring(0, 40));
  }

  // Click "Community" group to expand it
  const communityBtn = page.locator('nav button, aside button, [class*="nav"] button').filter({ hasText: /^community$/i });
  const communityCount = await communityBtn.count();
  console.log('COMMUNITY BUTTON COUNT:', communityCount);

  if (communityCount > 0) {
    await communityBtn.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('SUPP-02-community-expanded'), fullPage: false });

    // Get items under community
    const communitySection = await page.locator('nav').first().innerText().catch(() => '');
    console.log('NAV AFTER COMMUNITY EXPAND:\n' + communitySection);
  }

  // Try clicking all group buttons to expand them all
  const allGroupBtns = await page.locator('nav li button, nav > div > button, aside li button').all();
  for (const btn of allGroupBtns) {
    await btn.click().catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: ss('SUPP-03-all-groups-expanded'), fullPage: true });
  const fullNavText = await page.locator('nav').first().innerText().catch(() => '');
  console.log('FULL NAV AFTER ALL EXPANSIONS:\n' + fullNavText);

  // Look for cohorts link
  const cohortLink = page.locator('nav a, aside a').filter({ hasText: /cohorts/i });
  const cohortLinkCount = await cohortLink.count();
  console.log('COHORTS LINK COUNT:', cohortLinkCount);

  if (cohortLinkCount > 0) {
    const cohortHref = await cohortLink.first().getAttribute('href').catch(() => '');
    console.log('COHORTS LINK HREF:', cohortHref);
  }
});

test('SUPP-COURSE-SETTINGS: Real course settings with cohort section', async ({ page }) => {
  // Only mock profile + some basic data; let courses hit backend
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

  // Navigate directly to a known course settings page
  // Try the known course slug "course-to-yap"
  await page.goto('https://admin.dev.budgetnista-admin.qilinlab.com/courses/course-to-yap/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: ss('SUPP-04-course-to-yap-settings'), fullPage: true });

  const url = page.url();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('COURSE SETTINGS URL:', url);
  console.log('COURSE SETTINGS TEXT (first 3000):\n' + bodyText.substring(0, 3000));

  // Find cohort section specifically
  const idx = bodyText.toLowerCase().indexOf('cohort');
  if (idx > -1) {
    console.log('COHORT SECTION CONTEXT:\n' + bodyText.substring(Math.max(0, idx - 200), idx + 1000));
  }

  // Also try by course ID
  await page.goto('https://admin.dev.budgetnista-admin.qilinlab.com/courses/1/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: ss('SUPP-05-course-1-settings'), fullPage: true });
  const url2 = page.url();
  console.log('COURSE 1 SETTINGS URL:', url2);
});

test('SUPP-MANAGE-DROPDOWN: Cohort detail Manage dropdown options', async ({ page }) => {
  const MOCK_COHORT = {
    id: 1, name: 'Week 24 — Course to Yap', status: 'active', origin: 'auto',
    course: { id: 10, title: 'Course to Yap', slug: 'course-to-yap' },
    organisation: { id: 5, name: 'Qilin Lab' },
    iso_week: 24, iso_year: 2026, start_date: '2026-06-08', end_date: '2026-06-14',
    member_count: 3, cohort_duration_weeks: 4,
  };

  await mockAll(page);
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\/1\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: MOCK_COHORT }),
    })
  );
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\/1\/members\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0 } }),
    })
  );
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\/1\/activity\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0 } }),
    })
  );

  await page.goto('/cohorts/1');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  // Find Manage button
  const manageBtn = page.getByRole('button', { name: /manage/i }).first();
  const manageBtnVisible = await manageBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('MANAGE BUTTON VISIBLE:', manageBtnVisible);

  if (manageBtnVisible) {
    await manageBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: ss('SUPP-06-manage-dropdown-open') });

    // Get all menu items
    const menuItems = await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button, [class*="dropdown"] [class*="item"], [class*="menu-item"]').allInnerTexts().catch(() => []);
    console.log('MANAGE MENU ITEMS:', JSON.stringify(menuItems));

    // Also try getting all visible text in any dropdown that appeared
    const dropdownText = await page.locator('[role="menu"], [class*="dropdown-menu"], [class*="popover"]').first().innerText().catch(() => '');
    console.log('MANAGE DROPDOWN TEXT:', dropdownText);

    await page.screenshot({ path: ss('SUPP-06b-manage-dropdown-zoom') });
  } else {
    // Check what buttons exist
    const allBtns = await page.locator('button').allInnerTexts().catch(() => []);
    console.log('ALL BUTTONS ON PAGE:', JSON.stringify(allBtns));
  }
});

test('SUPP-COHORTS-LIST-HEADERS: Cohort list with real data for column headers', async ({ page }) => {
  const MOCK_COHORT = {
    id: 1, name: 'Week 24 — Course to Yap', status: 'active', origin: 'auto',
    course: { id: 10, title: 'Course to Yap', slug: 'course-to-yap' },
    organisation: { id: 5, name: 'Qilin Lab' },
    iso_week: 24, iso_year: 2026, start_date: '2026-06-08', end_date: '2026-06-14',
    member_count: 3, cohort_duration_weeks: 4,
  };

  await mockAll(page);
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [MOCK_COHORT], count: 1, next: null, previous: null } }),
    })
  );
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohort-flags\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
    })
  );

  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: ss('SUPP-07-cohorts-with-data'), fullPage: true });

  // Page heading
  const h1 = await page.locator('h1').first().innerText().catch(() => '');
  const subtitle = await page.locator('p').first().innerText().catch(() => '');
  console.log('H1:', h1);
  console.log('SUBTITLE:', subtitle);

  // Tabs
  const tabs = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
  console.log('TABS:', JSON.stringify(tabs));

  // Table headers
  const ths = await page.locator('th').allInnerTexts().catch(() => []);
  console.log('TABLE HEADERS:', JSON.stringify(ths));

  // Row data
  const rows = await page.locator('tbody tr').allInnerTexts().catch(() => []);
  console.log('TABLE ROWS:', JSON.stringify(rows));

  // Buttons on the list
  const btns = await page.locator('button').allInnerTexts().catch(() => []);
  console.log('BUTTONS:', JSON.stringify(btns));

  // Any search/filter input
  const inputs = await page.locator('input').all();
  for (const inp of inputs) {
    const ph = await inp.getAttribute('placeholder').catch(() => '');
    const type = await inp.getAttribute('type').catch(() => '');
    console.log('INPUT:', { type, placeholder: ph });
  }
});
