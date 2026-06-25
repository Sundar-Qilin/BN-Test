// @ts-check
// ULTIMATE Cohorts Feature Exploration — single-page-session approach
// Admin and Learner explored comprehensively
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SS = path.join(__dirname, 'screenshots', 'recheck');
const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const LEARNER_URL = 'https://learner.dev.budgetnista.qilinlab.com';
const BACKEND_URL = 'https://budgetnista-be-production.up.railway.app';
const ADMIN_USER = 'superadmin@yopmail.com';
const ADMIN_PASS = 'Admin@123';
const LEARNER_USER = 'sundar@qilinlab.com';
const LEARNER_PASS = '7708278760sS@';

if (!fs.existsSync(SS)) fs.mkdirSync(SS, { recursive: true });

const R = {}; // report
let apiLog = [];

// ── Utils ──────────────────────────────────────────────────────────────────────

async function ss(page, name) {
  const fp = path.join(SS, name.endsWith('.png') ? name : `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`[SS] ${name}`);
}

function l(tag, ...m) {
  console.log(`\n[${tag}]`, ...m.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)));
}

async function txt(page, sel) {
  return page.locator(sel).allTextContents().catch(() => []);
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Common admin mock setup (call ONCE, before any navigation) ─────────────────

async function setupAdminMocks(page) {
  page.on('response', async resp => {
    const u = resp.url();
    if (u.includes('railway.app') && !u.includes('/ws/')) {
      apiLog.push({ portal: 'admin', status: resp.status(), url: u.replace(BACKEND_URL, '').split('?')[0], method: resp.request().method() });
    }
  });

  // LIFO: catch-all FIRST (lowest priority)
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    try {
      const r = await route.fetch({ timeout: 20000 });
      if (r.ok()) return route.fulfill({ response: r });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }) });
    } catch {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }) });
    }
  });

  // Specifics AFTER (higher priority)
  await page.route(/\/api\/v1\/notifications\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { count: 0, results: [] } }) }));
  await page.route(/\/api\/v1\/auth\/tenant-redirect\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { redirect_to: null } }) }));
  await page.route(/\/api\/v1\/auth\/token\/refresh\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { access: 'mock-access-token', refresh: 'mock-refresh-token' } }) }));
  await page.route(/\/api\/v1\/admin\/auth\/profile\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { id: 1, email: ADMIN_USER, first_name: 'Super', last_name: 'Admin', role: 'super_admin', is_active: true } }) }));
  await page.route(/\/api\/v1\/admin\/auth\/login\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { user: { id: 1, email: ADMIN_USER, first_name: 'Super', last_name: 'Admin', role: 'super_admin', is_active: true }, tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' }, redirect_to: null } }) }));
}

async function setupLearnerMocks(page) {
  page.on('response', async resp => {
    const u = resp.url();
    if (u.includes('railway.app') && !u.includes('/ws/')) {
      apiLog.push({ portal: 'learner', status: resp.status(), url: u.replace(BACKEND_URL, '').split('?')[0], method: resp.request().method() });
    }
  });

  // LIFO: catch-all FIRST
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    try {
      const r = await route.fetch({ timeout: 20000 });
      if (r.ok()) return route.fulfill({ response: r });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }) });
    } catch {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }) });
    }
  });

  // Specifics AFTER
  await page.route(/\/api\/v1\/notifications\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { count: 0, results: [] } }) }));
  await page.route(/\/api\/v1\/auth\/tenant-redirect\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { redirect_to: null } }) }));
  await page.route(/\/api\/v1\/auth\/token\/refresh\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' } }) }));
  await page.route(/\/api\/v1\/auth\/verify-email\/|\/api\/v1\/auth\/email-verification\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: {} }) }));
  await page.route(/\/api\/v1\/auth\/profile\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { id: 100, email: LEARNER_USER, first_name: 'Sundar', last_name: 'S', role: 'learner', is_active: true, is_email_verified: true } }) }));
  await page.route(/\/api\/v1\/auth\/login\//, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, error: null, data: { user: { id: 100, email: LEARNER_USER, first_name: 'Sundar', last_name: 'S', role: 'learner', is_active: true, is_email_verified: true }, tokens: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' }, redirect_to: null } }) }));
}

// ── ADMIN PORTAL ───────────────────────────────────────────────────────────────

async function runAdminExploration(browser) {
  l('ADMIN', 'Starting admin portal exploration');

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  // Setup ALL mocks before any navigation
  await setupAdminMocks(page);

  // ── LOGIN ────────────────────────────────────────────────────────────────

  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded' });
  await wait(2000);
  await ss(page, 'A01-login-page');
  R.adminLoginPage = { h1: await txt(page, 'h1'), h2: await txt(page, 'h2'), subtitle: await txt(page, 'p') };

  await page.getByRole('textbox', { name: 'admin@gmail.com' }).fill(ADMIN_USER);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(ADMIN_PASS);
  await page.waitForFunction(() => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function', { timeout: 8000 }).catch(() => {});
  await wait(600);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await wait(6000);

  if (page.url().includes('/login')) {
    l('ADMIN', 'LOGIN FAILED — still on login:', page.url());
    await ss(page, 'A01b-login-fail');
    R.adminLoginFailed = true;
    await ctx.close();
    return;
  }

  l('ADMIN', 'Logged in → dashboard:', page.url());
  await ss(page, 'A02-dashboard');
  R.adminDashboardURL = page.url();

  // ── SIDEBAR ─────────────────────────────────────────────────────────────

  l('ADMIN', 'Exploring sidebar');
  // Expand all groups (7 expand buttons visible)
  const sidebarBtns = await page.locator('nav button, aside button').all();
  for (const btn of sidebarBtns) {
    if (await btn.isVisible().catch(() => false)) {
      const t = (await btn.textContent().catch(() => '')).trim();
      if (t) { await btn.click({ force: true }).catch(() => {}); await wait(200); }
    }
  }
  await wait(500);
  await ss(page, 'A03-sidebar-expanded');

  const navLinks = await page.locator('nav a, aside a, [class*="Sidebar"] a').all();
  const sidebar = [];
  for (const link of navLinks) {
    const t = (await link.textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
    const h = await link.getAttribute('href').catch(() => '');
    if (t) sidebar.push({ text: t, href: h });
  }
  l('ADMIN SIDEBAR', `${sidebar.length} items`);
  sidebar.forEach(n => console.log(`  "${n.text}" → ${n.href}`));
  R.adminSidebar = sidebar;
  R.adminSidebarCohortItems = sidebar.filter(n => /cohort/i.test(n.text));

  // Community group specifically
  const communityGroup = await page.locator('nav, aside').textContent().catch(() => '');
  const communityIdx = communityGroup?.indexOf('Community') || -1;
  l('ADMIN SIDEBAR', 'Community group found:', communityIdx >= 0);

  // ── COHORTS PAGE ─────────────────────────────────────────────────────────

  l('ADMIN', 'Navigating to /cohorts');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await wait(3000);
  await ss(page, 'A05-cohorts-page');

  l('ADMIN COHORTS', 'URL:', page.url());
  R.adminCohortsURL = page.url();

  if (page.url().includes('/login')) {
    l('ADMIN COHORTS', 'REDIRECTED TO LOGIN');
    R.adminCohortsAuthFailed = true;
    await ctx.close();
    return;
  }

  const h1 = await txt(page, 'h1');
  const h2 = await txt(page, 'h2');
  const subEl = page.locator('p:visible').first();
  const subtitle = await subEl.textContent().catch(() => '');
  l('ADMIN COHORTS', 'H1:', h1, 'H2:', h2);
  l('ADMIN COHORTS', 'Subtitle:', subtitle?.trim()?.slice(0, 300));
  R.adminCohortsH1 = h1;
  R.adminCohortsSubtitle = subtitle?.trim();

  const tabs = await txt(page, '[role="tab"]');
  l('ADMIN COHORTS', 'Tabs:', tabs);
  R.adminCohortsTabs = tabs;

  // Wait for table to finish loading
  await wait(2000);
  const colHeaders = await txt(page, 'th, [role="columnheader"]');
  l('ADMIN COHORTS', 'Table headers:', colHeaders);
  R.adminCohortsColumns = colHeaders;

  const rowCount = await page.locator('tbody tr').count();
  l('ADMIN COHORTS', `Rows: ${rowCount}`);
  R.adminCohortsRowCount = rowCount;

  // Look for skeleton / loading state
  const skeletonCount = await page.locator('[class*="skeleton" i], [class*="Skeleton" i], [class*="loading" i]').count();
  l('ADMIN COHORTS', `Skeleton/loading elements: ${skeletonCount}`);

  if (rowCount > 0) {
    const firstRow = await page.locator('tbody tr:first-child td').allTextContents();
    l('ADMIN COHORTS', 'First row:', firstRow);
    R.adminCohortsFirstRow = firstRow;
  } else {
    const mainText = await page.locator('main').textContent().catch(() => '');
    const lines = (mainText || '').split('\n').map(s => s.trim()).filter(s => s.length > 5 && s.length < 300).slice(0, 20);
    l('ADMIN COHORTS', 'Main text (empty state):', lines);
    R.adminCohortsMainText = lines;

    // Look for specific empty state text
    const emptyEls = await txt(page, '[class*="empty" i], [class*="EmptyState" i], [class*="no-data" i]');
    l('ADMIN COHORTS', 'Empty state elements:', emptyEls);
    R.adminCohortsEmptyState = emptyEls;
  }

  // Buttons
  const buttons = await page.locator('button:visible').allTextContents();
  l('ADMIN COHORTS', 'Buttons:', buttons);
  R.adminCohortsButtons = buttons;

  // Search box placeholder
  const searchEl = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="cohort" i]').first();
  if (await searchEl.isVisible()) {
    const ph = await searchEl.getAttribute('placeholder');
    l('ADMIN COHORTS', 'Search placeholder:', ph);
    R.adminCohortsSearchPlaceholder = ph;
  }

  // Count badge
  const countBadge = await page.locator('text=/\\d+ cohort/i').allTextContents().catch(() => []);
  l('ADMIN COHORTS', 'Count badge:', countBadge);
  R.adminCohortsCountBadge = countBadge;

  // Open all filter dropdowns
  await wait(500);
  const comboboxes = await page.locator('[role="combobox"]:visible').all();
  l('ADMIN COHORTS', `Filter comboboxes: ${comboboxes.length}`);
  R.adminCohortsFilters = [];

  for (let i = 0; i < comboboxes.length; i++) {
    const el = comboboxes[i];
    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt2 = (await el.textContent().catch(() => '')).trim().slice(0, 80);
    console.log(`  [Filter ${i}] ph="${ph}" al="${al}" txt="${txt2}"`);

    try {
      await el.click({ timeout: 3000 });
      await wait(700);
      const opts = await page.locator('[role="option"]').allTextContents();
      l('ADMIN COHORTS', `  Filter ${i} options:`, opts);
      R.adminCohortsFilters.push({ index: i, placeholder: ph, ariaLabel: al, text: txt2, options: opts });
      await ss(page, `A05f-filter-${i}`);
      await page.keyboard.press('Escape');
      await wait(400);
    } catch (e) {
      l('ADMIN COHORTS', `  Filter ${i} error:`, e.message.slice(0, 60));
    }
  }

  await page.evaluate(() => window.scrollTo(0, 500));
  await wait(300);
  await ss(page, 'A05b-cohorts-scrolled');
  await page.evaluate(() => window.scrollTo(0, 0));

  // ── FLAGS TAB ────────────────────────────────────────────────────────────

  l('ADMIN', 'Exploring Flags tab');
  const flagsTabEl = page.locator('[role="tab"]:has-text("Flag")').first();
  if (await flagsTabEl.isVisible()) {
    await flagsTabEl.click();
    await wait(2000);
  } else {
    await page.goto(`${ADMIN_URL}/cohorts?tab=flags`, { waitUntil: 'domcontentloaded' });
    await wait(2000);
  }

  await ss(page, 'A06-flags-tab');
  R.adminFlagsURL = page.url();

  const flagCols = await txt(page, 'th, [role="columnheader"]');
  l('ADMIN FLAGS', 'Column headers:', flagCols);
  R.adminFlagsColumns = flagCols;

  const flagRows = await page.locator('tbody tr').count();
  l('ADMIN FLAGS', `Rows: ${flagRows}`);
  R.adminFlagsRowCount = flagRows;

  if (flagRows > 0) {
    R.adminFlagsFirstRow = await page.locator('tbody tr:first-child td').allTextContents();
  }

  const flagsMain = await page.locator('main').textContent().catch(() => '');
  const flagsLines = (flagsMain || '').split('\n').map(s => s.trim()).filter(s => s.length > 5 && s.length < 300).slice(0, 20);
  l('ADMIN FLAGS', 'Main text:', flagsLines);
  R.adminFlagsMainText = flagsLines;

  const flagBtns = await page.locator('button:visible').allTextContents();
  l('ADMIN FLAGS', 'Buttons:', flagBtns);
  R.adminFlagsButtons = flagBtns;

  // Count badge
  const flagCount = await page.locator('text=/\\d+ flag/i').allTextContents().catch(() => []);
  l('ADMIN FLAGS', 'Count badge:', flagCount);
  R.adminFlagsCountBadge = flagCount;

  // Open all dropdowns
  await wait(500);
  const flagComboboxes = await page.locator('[role="combobox"]:visible').all();
  l('ADMIN FLAGS', `Comboboxes: ${flagComboboxes.length}`);
  R.adminFlagsDropdowns = [];

  for (let i = 0; i < flagComboboxes.length; i++) {
    const el = flagComboboxes[i];
    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt2 = (await el.textContent().catch(() => '')).trim().slice(0, 80);
    console.log(`  [Flags DD ${i}] ph="${ph}" al="${al}" txt="${txt2}"`);

    try {
      await el.click({ timeout: 3000 });
      await wait(700);
      const opts = await page.locator('[role="option"]').allTextContents();
      l('ADMIN FLAGS', `  DD ${i} options:`, opts);
      R.adminFlagsDropdowns.push({ index: i, placeholder: ph, ariaLabel: al, text: txt2, options: opts });
      await ss(page, `A06d-flags-dd-${i}`);
      await page.keyboard.press('Escape');
      await wait(400);
    } catch (e) {
      l('ADMIN FLAGS', `  DD ${i} error:`, e.message.slice(0, 60));
    }
  }

  // Empty state
  const flagEmpty = await txt(page, '[class*="empty" i], [class*="EmptyState" i]');
  l('ADMIN FLAGS', 'Empty state:', flagEmpty);
  R.adminFlagsEmptyState = flagEmpty;

  // ── COHORT DETAIL ────────────────────────────────────────────────────────

  l('ADMIN', 'Exploring cohort detail');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await wait(2500);

  const cohortRows = await page.locator('tbody tr').count();
  l('ADMIN COHORT DETAIL', `Available rows: ${cohortRows}`);

  let detailNavigated = false;
  if (cohortRows > 0) {
    try {
      await page.locator('tbody tr:first-child').click({ timeout: 5000 });
      await wait(2000);
      if (page.url().match(/\/cohorts\/\w/)) detailNavigated = true;
    } catch (e) {
      l('ADMIN COHORT DETAIL', 'Row click failed:', e.message);
    }
  }

  if (!detailNavigated) {
    for (const id of [1, 2, 3, 4, 5]) {
      await page.goto(`${ADMIN_URL}/cohorts/${id}`, { waitUntil: 'domcontentloaded' });
      await wait(1500);
      if (!page.url().includes('/login') && page.url().match(/\/cohorts\/\d+/)) {
        detailNavigated = true;
        break;
      }
    }
  }

  await ss(page, 'A10-cohort-detail');
  R.adminCohortDetailURL = page.url();
  R.adminCohortDetailHasData = detailNavigated;

  if (detailNavigated) {
    R.adminCohortDetailH1 = await txt(page, 'h1');
    R.adminCohortDetailBadges = await txt(page, '[class*="badge" i], [class*="chip" i], [class*="status" i]');
    R.adminCohortDetailTabs = await txt(page, '[role="tab"]');
    l('ADMIN COHORT DETAIL', 'H1:', R.adminCohortDetailH1);
    l('ADMIN COHORT DETAIL', 'Badges:', R.adminCohortDetailBadges);
    l('ADMIN COHORT DETAIL', 'Tabs:', R.adminCohortDetailTabs);

    // Members tab
    const membTab = page.locator('[role="tab"]:has-text("Member")').first();
    if (await membTab.isVisible()) {
      await membTab.click();
      await wait(1500);
      await ss(page, 'A11-members-tab');
      R.adminMembersColumns = await txt(page, 'th, [role="columnheader"]');
      R.adminMembersButtons = await page.locator('button:visible').allTextContents();
      const mpText = await page.locator('[role="tabpanel"], main').textContent().catch(() => '');
      R.adminMembersTabContent = (mpText || '').split('\n').map(s => s.trim()).filter(s => s.length > 5).slice(0, 15);
      l('ADMIN COHORT DETAIL', 'Members columns:', R.adminMembersColumns);
      l('ADMIN COHORT DETAIL', 'Members buttons:', R.adminMembersButtons);
    }

    // Activity tab
    const actTab = page.locator('[role="tab"]:has-text("Activity")').first();
    if (await actTab.isVisible()) {
      await actTab.click();
      await wait(1500);
      await ss(page, 'A12-activity-tab');
      const aText = await page.locator('[role="tabpanel"], main').textContent().catch(() => '');
      R.adminActivityTabContent = (aText || '').split('\n').map(s => s.trim()).filter(s => s.length > 5).slice(0, 10);
      l('ADMIN COHORT DETAIL', 'Activity content:', R.adminActivityTabContent);
    }

    // Manage button
    const manBtn = page.locator('button:has-text("Manage")').first();
    if (await manBtn.isVisible()) {
      await manBtn.click();
      await wait(800);
      await ss(page, 'A13-manage-dropdown');
      R.adminManageItems = await page.locator('[role="menuitem"]').allTextContents();
      l('ADMIN COHORT DETAIL', 'Manage items:', R.adminManageItems);
      await page.keyboard.press('Escape');
    }
  } else {
    l('ADMIN COHORT DETAIL', 'No cohorts found in database');
    // Screenshot the empty cohorts list to capture empty state
    await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
    await wait(2500);
    await ss(page, 'A10-cohorts-empty-state');
    const emptyText = await page.locator('main').textContent().catch(() => '');
    R.adminCohortsEmptyPageText = (emptyText || '').split('\n').map(s => s.trim()).filter(s => s.length > 5).slice(0, 20);
    l('ADMIN COHORT DETAIL', 'Empty page text:', R.adminCohortsEmptyPageText);
  }

  // ── COURSES & SETTINGS ────────────────────────────────────────────────────

  l('ADMIN', 'Exploring courses list');
  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await wait(3000);
  await ss(page, 'A07-courses-list');
  R.adminCoursesListURL = page.url();

  const coursesCols = await txt(page, 'th, [role="columnheader"]');
  l('ADMIN COURSES', 'Columns:', coursesCols);
  R.adminCoursesColumns = coursesCols;

  const coursesRows = await page.locator('tbody tr').count();
  l('ADMIN COURSES', `Rows: ${coursesRows}`);
  R.adminCoursesRowCount = coursesRows;

  if (coursesRows > 0) {
    const firstCourse = await page.locator('tbody tr:first-child td').allTextContents();
    l('ADMIN COURSES', 'First course:', firstCourse);
    R.adminCoursesFirstRow = firstCourse;
    const allNames = await page.locator('tbody tr td:first-child').allTextContents();
    l('ADMIN COURSES', 'All course names:', allNames);
    R.adminCourseNames = allNames;

    try {
      await page.locator('tbody tr:first-child').click({ timeout: 5000 });
      await wait(2000);
    } catch (e) {
      await page.locator('tbody tr:first-child a').first().click().catch(() => {});
      await wait(2000);
    }
  } else {
    for (const s of [1, 2, 3, 'test-cohort-course-001', 'course-to-yap']) {
      await page.goto(`${ADMIN_URL}/courses/${s}`, { waitUntil: 'domcontentloaded' });
      await wait(1500);
      if (!page.url().includes('/login') && page.url().match(/\/courses\/\w/)) break;
    }
  }

  await ss(page, 'A08-course-detail');
  R.adminCourseDetailURL = page.url();

  const courseTabs = await txt(page, '[role="tab"]');
  l('ADMIN COURSES', 'Course detail tabs:', courseTabs);
  R.adminCourseDetailTabs = courseTabs;

  const settingsTab = page.locator('[role="tab"]:has-text("Settings")').first();
  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await wait(2000);
    await ss(page, 'A09-settings-top');
    R.adminCourseSettingsURL = page.url();

    // Scroll screenshots
    for (const [name, yPct] of [['mid1', 0.33], ['mid2', 0.66], ['bottom', 1.0]]) {
      await page.evaluate(y => window.scrollTo(0, document.body.scrollHeight * y), yPct);
      await wait(300);
      await ss(page, `A09-settings-${name}`);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(300);

    const labels = await page.locator('label:visible').allTextContents();
    l('ADMIN SETTINGS', 'Labels:', labels);
    R.adminCourseSettingsLabels = labels;

    const sections = await txt(page, 'h2:visible, h3:visible, h4:visible');
    l('ADMIN SETTINGS', 'Sections:', sections);
    R.adminCourseSettingsSections = sections;

    const toggles = await page.locator('[role="switch"]:visible, input[type="checkbox"]:visible').all();
    l('ADMIN SETTINGS', `Toggles: ${toggles.length}`);
    R.adminCourseSettingsToggles = [];

    for (let i = 0; i < toggles.length; i++) {
      const t = toggles[i];
      const checked = await t.isChecked().catch(() => null);
      const id = await t.getAttribute('id').catch(() => '') || '';
      const ctx = await t.evaluate(el => {
        let n = el;
        for (let j = 0; j < 8; j++) {
          n = n.parentElement;
          const txt = n?.textContent?.trim();
          if (txt && txt.length > 3 && txt.length < 200) return txt;
        }
        return '';
      });
      console.log(`  [Toggle ${i}] id="${id}" checked=${checked}`);
      console.log(`    ctx: "${ctx.slice(0, 150)}"`);
      R.adminCourseSettingsToggles.push({ index: i, id, checked, context: ctx });
    }

    // Find cohort toggle
    for (const t of toggles) {
      const ctx = await t.evaluate(el => {
        let n = el;
        for (let j = 0; j < 8; j++) {
          n = n.parentElement;
          const txt = n?.textContent?.toLowerCase() || '';
          if (txt.includes('cohort') || txt.includes('group learner')) return n.textContent.trim().slice(0, 200);
        }
        return null;
      });
      if (ctx) {
        const isOn = await t.isChecked().catch(() => false);
        l('ADMIN SETTINGS', `COHORT TOGGLE found! isOn=${isOn}, ctx="${ctx}"`);
        R.adminCohortToggleContext = ctx;
        R.adminCohortToggleOn = isOn;

        if (!isOn) {
          await t.click();
          await wait(1500);
          await ss(page, 'A09-settings-cohort-toggled-on');
          const newLabels = await page.locator('label:visible').allTextContents();
          l('ADMIN SETTINGS', 'Labels after cohort toggle ON:', newLabels);
          R.adminCohortSettingsLabelsAfterEnable = newLabels;

          const numInputs = await page.locator('input[type="number"]:visible').all();
          const inputData = [];
          for (const inp of numInputs) {
            const ph = await inp.getAttribute('placeholder').catch(() => '') || '';
            const name = await inp.getAttribute('name').catch(() => '') || '';
            const val = await inp.inputValue().catch(() => '');
            inputData.push({ placeholder: ph, name, value: val });
            console.log(`  [NumInput] ph="${ph}" name="${name}" val="${val}"`);
          }
          R.adminCohortSettingsNewInputs = inputData;
          await ss(page, 'A09-settings-cohort-inputs-visible');
        } else {
          l('ADMIN SETTINGS', 'Cohort toggle already ON');
          await ss(page, 'A09-settings-cohort-already-on');
        }
        break;
      }
    }

    // Full page text
    const pageText = await page.locator('main, form').textContent().catch(() => '');
    R.adminCourseSettingsFullText = (pageText || '').split('\n').map(s => s.trim()).filter(s => s.length > 3).slice(0, 30);
  } else {
    l('ADMIN SETTINGS', 'No Settings tab available. Course tabs:', courseTabs);
    R.adminCourseSettingsError = `No Settings tab. Tabs: ${JSON.stringify(courseTabs)}`;
  }

  // ── API EXPLORATION ───────────────────────────────────────────────────────

  l('ADMIN', 'API exploration');
  await page.goto(`${ADMIN_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await wait(1000);

  const apiEndpoints = [
    '/api/v1/admin/cohorts/',
    '/api/v1/admin/cohort-flags/',
    '/api/v1/admin/courses/?cohorts_enabled=true',
    '/api/v1/admin/cohorts/?status=active',
    '/api/v1/admin/cohort-flags/?status=open',
    '/api/v1/admin/courses/',
  ];

  R.adminAPIResults = {};
  for (const ep of apiEndpoints) {
    try {
      const res = await page.evaluate(async ({ url }) => {
        const r = await fetch(url, { headers: { 'Authorization': 'Bearer mock-access-token' } });
        const status = r.status;
        let body; try { body = await r.json(); } catch { body = await r.text(); }
        return { status, body };
      }, { url: `${BACKEND_URL}${ep}` });
      const count = res.body?.data?.count;
      const fields = res.body?.data?.results?.[0] ? Object.keys(res.body.data.results[0]) : [];
      console.log(`  [API] ${ep} → ${res.status} count=${count} fields=${fields.join(', ')}`);
      R.adminAPIResults[ep] = { status: res.status, count, fields, sample: res.body?.data?.results?.[0] || null };
    } catch (e) {
      R.adminAPIResults[ep] = { error: e.message };
    }
  }

  await ctx.close();
  l('ADMIN', 'Done!');
}

// ── LEARNER PORTAL ─────────────────────────────────────────────────────────────

async function runLearnerExploration(browser) {
  l('LEARNER', 'Starting learner portal exploration');

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  await setupLearnerMocks(page);

  // ── LOGIN ────────────────────────────────────────────────────────────────

  await page.goto(`${LEARNER_URL}/login`, { waitUntil: 'domcontentloaded' });
  await wait(2000);
  await ss(page, 'L01-login-page');
  R.learnerLoginPageH1 = await txt(page, 'h1');

  const emailIn = page.locator('input[type="email"], input[name="email"]').first();
  await emailIn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await emailIn.fill(LEARNER_USER);
  const passIn = page.locator('input[type="password"]').first();
  await passIn.fill(LEARNER_PASS);
  await page.waitForFunction(() => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function', { timeout: 8000 }).catch(() => {});
  await wait(600);
  await ss(page, 'L02-login-filled');
  await page.locator('button[type="submit"], button:has-text("Sign in")').first().click();
  await wait(6000);

  l('LEARNER LOGIN', 'Post-login URL:', page.url());

  if (page.url().includes('/login')) {
    l('LEARNER LOGIN', 'FAILED on login page');
    await ss(page, 'L01b-login-fail');
    R.learnerLoginFailed = true;
    await ctx.close();
    return;
  }

  if (page.url().includes('/verify-email')) {
    l('LEARNER LOGIN', 'On verify-email — trying to bypass');
    // Navigate directly to home
    await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded' });
    await wait(2000);
    l('LEARNER LOGIN', 'After bypass:', page.url());
  }

  if (page.url().includes('/verify-email') || page.url().includes('/login')) {
    l('LEARNER LOGIN', 'Still blocked at verify-email or login — cannot explore');
    R.learnerLoginBlocked = page.url();
    await ss(page, 'L01c-blocked');
    await ctx.close();
    return;
  }

  l('LEARNER LOGIN', 'SUCCESS on:', page.url());
  await ss(page, 'L03-post-login');
  R.learnerPostLoginURL = page.url();

  // ── DASHBOARD ────────────────────────────────────────────────────────────

  l('LEARNER', 'Dashboard');
  await ss(page, 'L04-dashboard');
  R.learnerDashboardURL = page.url();
  R.learnerDashboardH1 = await txt(page, 'h1');
  R.learnerDashboardH2 = await txt(page, 'h2');

  const navLinks = await page.locator('nav a, header a, [class*="sidebar" i] a, [class*="Sidebar" i] a').all();
  const navData = [];
  for (const link of navLinks) {
    const t = (await link.textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
    const h = await link.getAttribute('href').catch(() => '');
    if (t) navData.push({ text: t, href: h });
  }
  l('LEARNER DASHBOARD', 'Nav links:', navData);
  R.learnerNavLinks = navData;
  R.learnerCohortNavLinks = navData.filter(n => /cohort/i.test(n.text));

  // ── COMMUNITY PAGE ────────────────────────────────────────────────────────

  l('LEARNER', 'Community page');
  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'domcontentloaded' });
  await wait(2000);
  R.learnerCommunityURL = page.url();

  if (!page.url().includes('/login') && !page.url().includes('/verify-email')) {
    await ss(page, 'L05-community');
    R.learnerCommunityH1 = await txt(page, 'h1');
    R.learnerCommunityH2 = await txt(page, 'h2');
    const tabs = await txt(page, '[role="tab"]');
    R.learnerCommunityTabs = tabs;
    l('LEARNER COMMUNITY', 'Tabs:', tabs);

    const mainText = await page.locator('main').textContent().catch(() => '');
    R.learnerCommunityContent = (mainText || '').split('\n').map(s => s.trim()).filter(s => s.length > 5 && s.length < 300).slice(0, 20);
    l('LEARNER COMMUNITY', 'Content:', R.learnerCommunityContent);

    // Click each tab
    const tabEls = await page.locator('[role="tab"]').all();
    for (let i = 0; i < tabEls.length; i++) {
      const tt = (await tabEls[i].textContent().catch(() => '')).trim();
      if (!tt) continue;
      await tabEls[i].click();
      await wait(1000);
      const slug = tt.toLowerCase().replace(/\s+/g, '-');
      await ss(page, `L05t-community-tab-${i}-${slug}`);
      const content = await page.locator('[role="tabpanel"]').textContent().catch(() => '');
      const lines = (content || '').split('\n').map(s => s.trim()).filter(s => s.length > 5).slice(0, 10);
      l('LEARNER COMMUNITY', `Tab "${tt}" content:`, lines);
      R[`learnerCommunityTab_${slug}`] = { tabText: tt, content: lines };
    }
  } else {
    l('LEARNER COMMUNITY', 'Blocked:', page.url());
    R.learnerCommunityBlocked = page.url();
  }

  // ── COHORT ROUTES ─────────────────────────────────────────────────────────

  l('LEARNER', 'Cohort routes');
  const routes = [
    '/community/cohorts',
    '/community/cohorts/1',
    '/community/cohorts/2',
    '/community/groups',
    '/community/groups/1',
    '/cohorts',
    '/cohorts/1',
    '/groups',
    '/my-cohorts',
    '/my-groups',
  ];

  R.learnerCohortRoutes = {};
  for (const route of routes) {
    await page.goto(`${LEARNER_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await wait(1500);
    const url = page.url();
    const slug = route.replace(/\//g, '_').replace(/^_/, '');
    await ss(page, `L06-${slug}`);
    const headings = await txt(page, 'h1, h2, h3');
    const is404 = await page.locator('text=/404|page not found/i').isVisible().catch(() => false);
    const isVerify = url.includes('/verify-email');
    const isLogin = url.includes('/login');
    const isRedirected = url !== `${LEARNER_URL}${route}`;
    const mainText = await page.locator('main').textContent().catch(() => '');
    const lines = (mainText || '').split('\n').map(s => s.trim()).filter(s => s.length > 5).slice(0, 8);

    l('LEARNER ROUTE', `${route} → ${url}`);
    l('LEARNER ROUTE', `  headings: ${headings}`);
    l('LEARNER ROUTE', `  redirected=${isRedirected} login=${isLogin} verify=${isVerify} 404=${is404}`);

    R.learnerCohortRoutes[route] = { url, headings, is404, isLogin, isVerify, isRedirected, content: lines };
  }

  // ── MY COURSES ────────────────────────────────────────────────────────────

  l('LEARNER', 'My Courses');
  for (const p of ['/my-courses', '/courses', '/learn']) {
    await page.goto(`${LEARNER_URL}${p}`, { waitUntil: 'domcontentloaded' });
    await wait(2000);
    if (!page.url().includes('/login') && !page.url().includes('/verify-email')) {
      await ss(page, 'L07-my-courses');
      R.learnerMyCoursesURL = page.url();
      R.learnerMyCoursesH1 = await txt(page, 'h1');
      const chips = await txt(page, '[class*="chip" i], [class*="badge" i]');
      R.learnerMyCoursesCohortChips = chips.filter(c => /cohort/i.test(c));
      const bodyText = await page.locator('body').textContent().catch(() => '');
      R.learnerMyCoursesCohortMentions = (bodyText || '').match(/cohort[^"]{0,80}/gi)?.slice(0, 5) || [];
      l('LEARNER MY COURSES', 'URL:', R.learnerMyCoursesURL);
      l('LEARNER MY COURSES', 'Cohort chips:', R.learnerMyCoursesCohortChips);
      break;
    }
  }

  // ── LESSON PLAYER ─────────────────────────────────────────────────────────

  l('LEARNER', 'Lesson player');
  for (const p of ['/learn/course-to-yap/new-pdf-lesson', '/learn/course-to-yap']) {
    await page.goto(`${LEARNER_URL}${p}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await wait(2000);
    const url = page.url();
    const is404 = await page.locator('text=/404|not found|isn.t available/i').isVisible().catch(() => false);
    if (!url.includes('/login') && !url.includes('/verify-email') && !is404) {
      await ss(page, 'L09-lesson-player');
      R.learnerLessonURL = url;
      const tabs = await txt(page, '[role="tab"]');
      R.learnerLessonTabs = tabs;
      R.learnerLessonHasCohortTab = tabs.some(t => /cohort/i.test(t));
      l('LEARNER LESSON', 'Tabs:', tabs);
      l('LEARNER LESSON', 'Has cohort tab:', R.learnerLessonHasCohortTab);

      if (R.learnerLessonHasCohortTab) {
        await page.locator('[role="tab"]:has-text("Cohort")').first().click();
        await wait(1000);
        await ss(page, 'L09b-lesson-cohort-tab');
        const content = await page.locator('[role="tabpanel"]').textContent().catch(() => '');
        R.learnerLessonCohortTabContent = (content || '').split('\n').map(s => s.trim()).filter(s => s.length > 5).slice(0, 10);
      }
      break;
    }
  }

  // ── NOTIFICATIONS & PROFILE ───────────────────────────────────────────────

  l('LEARNER', 'Notifications & profile');
  await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded' });
  await wait(1500);
  if (!page.url().includes('/login') && !page.url().includes('/verify-email')) {
    const bell = page.locator('[aria-label*="notification" i]').first();
    if (await bell.isVisible()) {
      await bell.click();
      await wait(800);
      await ss(page, 'L10-notifications-panel');
      R.learnerNotificationItems = await txt(page, '[role="listitem"]');
      await page.keyboard.press('Escape');
    } else {
      R.learnerNotificationBellFound = false;
    }
  }

  await page.goto(`${LEARNER_URL}/profile`, { waitUntil: 'domcontentloaded' });
  await wait(1500);
  if (!page.url().includes('/login') && !page.url().includes('/verify-email')) {
    await ss(page, 'L11-profile');
    R.learnerProfileURL = page.url();
    R.learnerProfileH1 = await txt(page, 'h1');
  }

  await ctx.close();
  l('LEARNER', 'Done!');
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '▓'.repeat(60));
  console.log('  BUDGETNISTA COHORTS — ULTIMATE EXPLORATION');
  console.log('  Screenshots → ' + SS);
  console.log('▓'.repeat(60));

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    await runAdminExploration(browser);
  } catch (e) {
    console.error('[ADMIN ERROR]', e.message);
    R.adminError = e.message;
  }

  try {
    await runLearnerExploration(browser);
  } catch (e) {
    console.error('[LEARNER ERROR]', e.message);
    R.learnerError = e.message;
  }

  await browser.close();

  R.apiCallLog = apiLog;

  console.log('\n' + '▓'.repeat(60));
  console.log('  FINAL REPORT');
  console.log('▓'.repeat(60));
  console.log(JSON.stringify(R, null, 2));

  const reportPath = path.join(SS, 'ultimate-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(R, null, 2));

  const files = fs.readdirSync(SS).filter(f => f.endsWith('.png')).sort();
  console.log(`\nScreenshots (${files.length}):\n`, files.join('\n '));
  console.log('\nReport:', reportPath);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
