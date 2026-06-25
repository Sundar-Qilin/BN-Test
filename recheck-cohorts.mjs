// @ts-check
// Comprehensive Cohorts Feature Exploration — saves to screenshots/recheck/
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

const report = {};
let adminToken = '';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function ss(page, name) {
  const fp = path.join(SS, name.endsWith('.png') ? name : name + '.png');
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`[SS] ${name}`);
  return fp;
}

function log(section, ...args) {
  console.log(`\n▶ [${section}]`, ...args);
}

async function pageInfo(page) {
  const url = page.url();
  const title = await page.title();
  console.log(`   URL   : ${url}`);
  console.log(`   Title : ${title}`);
  return { url, title };
}

async function getText(page, selector) {
  return page.locator(selector).allTextContents().catch(() => []);
}

// ── Admin Mock Setup ──────────────────────────────────────────────────────────

const ADMIN_MOCK_RESPONSE = {
  success: true, error: null,
  data: {
    user: { id: 1, email: ADMIN_USER, first_name: 'Super', last_name: 'Admin', role: 'super_admin', is_active: true },
    tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
    redirect_to: null,
  },
};

const LEARNER_MOCK_RESPONSE = {
  success: true, error: null,
  data: {
    user: { id: 100, email: LEARNER_USER, first_name: 'Sundar', last_name: 'S', role: 'learner', is_active: true },
    tokens: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' },
    redirect_to: null,
  },
};

async function setupAdminMocks(page) {
  // Intercept login
  await page.route(/\/api\/v1\/admin\/auth\/login\/?(\?.*)?$/, async route => {
    const resp = await route.fetch().catch(() => null);
    if (resp && resp.ok()) {
      const body = await resp.json().catch(() => null);
      if (body?.data?.tokens?.access) {
        adminToken = body.data.tokens.access;
        console.log('[AUTH] Got real admin token');
        return route.fulfill({ response: resp });
      }
    }
    if (resp) {
      const bodyText = await resp.text().catch(() => '');
      console.log('[AUTH] Login resp status:', resp.status(), bodyText.slice(0, 200));
    }
    console.log('[AUTH] Using mock admin login response');
    adminToken = 'mock-access-token';
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(ADMIN_MOCK_RESPONSE),
    });
  });

  // Profile mock
  await page.route(/\/api\/v1\/admin\/auth\/profile\/?/, async route => {
    const resp = await route.fetch().catch(() => null);
    if (resp && resp.ok()) return route.fulfill({ response: resp });
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: ADMIN_MOCK_RESPONSE.data.user }),
    });
  });

  // Passthrough all other backend calls — fallback on error
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    const url = route.request().url();
    try {
      const resp = await route.fetch({ timeout: 20000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      console.log('[BACKEND FALLBACK]', resp.status(), url.slice(50));
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
      });
    } catch (e) {
      console.log('[BACKEND ERROR]', url.slice(50), e.message);
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
      });
    }
  });
}

async function setupLearnerMocks(page) {
  await page.route(/\/api\/v1\/auth\/login\/?(\?.*)?$|\/api\/v1\/learner\/auth\/login\/?(\?.*)?$/, async route => {
    const resp = await route.fetch().catch(() => null);
    if (resp && resp.ok()) return route.fulfill({ response: resp });
    const bodyText = resp ? await resp.text().catch(() => '') : '';
    console.log('[LEARNER AUTH] Login resp:', resp?.status(), bodyText.slice(0, 200));
    console.log('[LEARNER AUTH] Using mock learner login response');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(LEARNER_MOCK_RESPONSE),
    });
  });

  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    try {
      const resp = await route.fetch({ timeout: 20000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
      });
    } catch (e) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
      });
    }
  });
}

// ── Admin Login ───────────────────────────────────────────────────────────────

async function adminLogin(page) {
  log('ADMIN LOGIN');
  await setupAdminMocks(page);
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'A01-login-page');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(ADMIN_USER);
  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(ADMIN_PASS);

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined',
    { timeout: 8000 }
  ).catch(() => log('ADMIN LOGIN', 'reCAPTCHA not loaded (ok)'));
  await page.waitForTimeout(500);

  const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  const url = page.url();
  log('ADMIN LOGIN', 'Post-submit URL:', url);
  await ss(page, 'A02-post-login');

  if (url.includes('/login')) {
    log('ADMIN LOGIN', 'Still on login page - checking errors');
    const errors = await getText(page, '[class*="error"], [role="alert"]');
    console.log('Errors:', errors);

    // Try injecting token + navigating manually
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
    });
    await page.goto(`${ADMIN_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    log('ADMIN LOGIN', 'After manual nav:', page.url());
  }

  await ss(page, 'A03-dashboard');
  return !page.url().includes('/login');
}

// ── Admin: Full Sidebar ───────────────────────────────────────────────────────

async function adminSidebar(page) {
  log('ADMIN SIDEBAR');
  await page.waitForTimeout(1500);

  // Try to expand all collapsible sidebar groups
  const collapseToggles = await page.locator(
    '[class*="sidebar"] button, [class*="Sidebar"] button, nav button, aside button'
  ).all();
  log('ADMIN SIDEBAR', `Found ${collapseToggles.length} sidebar buttons`);
  for (const btn of collapseToggles) {
    const txt = await btn.textContent().catch(() => '');
    if (txt?.trim()) {
      await btn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(200);
    }
  }

  await ss(page, 'A04-sidebar-all-expanded');

  const navLinks = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="Sidebar"] a').all();
  const navData = [];
  for (const link of navLinks) {
    const text = (await link.textContent().catch(() => '')).trim();
    const href = await link.getAttribute('href').catch(() => '');
    if (text) navData.push({ text, href });
  }
  log('ADMIN SIDEBAR', `Total nav links: ${navData.length}`);
  navData.forEach(n => console.log(`  [NAV] "${n.text}" → ${n.href}`));
  report.adminSidebar = navData;

  const cohortLinks = navData.filter(n => /cohort/i.test(n.text));
  log('ADMIN SIDEBAR', 'Cohort nav items:', cohortLinks);
  report.adminSidebarCohortLinks = cohortLinks;
}

// ── Admin: Cohorts Main Page ──────────────────────────────────────────────────

async function adminCohortsPage(page) {
  log('ADMIN /cohorts page');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await ss(page, 'A05-cohorts-list');
  const info = await pageInfo(page);
  report.adminCohortsPage = info;

  // Headings
  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  const subtitle = await getText(page, '[class*="subtitle"], [class*="description"], p');
  log('ADMIN COHORTS', 'H1:', h1);
  log('ADMIN COHORTS', 'H2:', h2);
  log('ADMIN COHORTS', 'Subtitles:', subtitle.slice(0, 5));
  report.adminCohortsH1 = h1;
  report.adminCohortsH2 = h2;

  // Tabs
  const tabs = await getText(page, '[role="tab"], [class*="Tab"]:not([class*="Table"])');
  log('ADMIN COHORTS', 'Tabs:', tabs);
  report.adminCohortsTabs = tabs;

  // Table headers
  const th = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN COHORTS', 'Column headers:', th);
  report.adminCohortsColumns = th;

  // Row count
  const rows = await page.locator('tbody tr').count();
  log('ADMIN COHORTS', `Table rows: ${rows}`);
  report.adminCohortsRowCount = rows;

  // If rows exist, get data from first row
  if (rows > 0) {
    const firstRowCells = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN COHORTS', 'First row data:', firstRowCells);
    report.adminCohortsFirstRow = firstRowCells;
  }

  // Empty state
  const empty = await getText(page, '[class*="empty"], [class*="Empty"], [class*="no-data"], [class*="noData"]');
  log('ADMIN COHORTS', 'Empty state:', empty);
  report.adminCohortsEmptyState = empty;

  // Buttons
  const btns = await page.locator('button:visible').allTextContents();
  log('ADMIN COHORTS', 'Buttons:', btns);
  report.adminCohortsButtons = btns;

  // Search / filter controls
  const searchInputs = await page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').allTextContents();
  log('ADMIN COHORTS', 'Search inputs count:', (await page.locator('input[type="search"], input[placeholder*="search" i]').count()));

  // Filter dropdowns
  const dropdowns = await page.locator('select, [role="combobox"]').all();
  log('ADMIN COHORTS', `Filter dropdowns: ${dropdowns.length}`);
  const filterDetails = [];
  for (const dd of dropdowns) {
    const ph = await dd.getAttribute('placeholder').catch(() => '') || '';
    const al = await dd.getAttribute('aria-label').catch(() => '') || '';
    const txt = (await dd.textContent().catch(() => '')).trim().slice(0, 60);
    filterDetails.push({ placeholder: ph, ariaLabel: al, text: txt });
    console.log(`  [FILTER] placeholder="${ph}" aria-label="${al}" text="${txt}"`);
  }
  report.adminCohortsFilters = filterDetails;

  // Look for specific filter labels
  const filterLabels = await getText(page, 'label, [class*="FilterLabel"], [class*="filter-label"]');
  log('ADMIN COHORTS', 'Filter labels:', filterLabels);

  // Screenshot after scrolling to see all
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await ss(page, 'A05b-cohorts-list-scrolled');
}

// ── Admin: Cohort Detail ──────────────────────────────────────────────────────

async function adminCohortDetail(page) {
  log('ADMIN COHORT DETAIL');

  // First check if any rows exist in the table
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const rowCount = await page.locator('tbody tr').count();

  if (rowCount > 0) {
    log('ADMIN COHORT DETAIL', `Clicking first of ${rowCount} rows`);
    await page.locator('tbody tr:first-child').click({ timeout: 5000 }).catch(async () => {
      log('ADMIN COHORT DETAIL', 'Row click failed, trying first cell');
      await page.locator('tbody tr:first-child td:first-child').click({ timeout: 5000 }).catch(() => {});
    });
    await page.waitForTimeout(2000);
  } else {
    log('ADMIN COHORT DETAIL', 'No rows found, trying cohort IDs 1-5');
    for (const id of [1, 2, 3, 4, 5]) {
      await page.goto(`${ADMIN_URL}/cohorts/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const url = page.url();
      const is404 = await page.locator('text=/404|not found|doesn.t exist/i').isVisible().catch(() => false);
      if (!url.includes('/login') && !is404) {
        log('ADMIN COHORT DETAIL', `Found cohort at ID ${id}`);
        break;
      }
    }
  }

  await ss(page, 'A10-cohort-detail');
  const info = await pageInfo(page);
  log('ADMIN COHORT DETAIL', info);
  report.adminCohortDetailURL = info.url;

  // Masthead / header fields
  const headings = await getText(page, 'h1, h2, h3');
  log('ADMIN COHORT DETAIL', 'Headings:', headings);
  report.adminCohortDetailHeadings = headings;

  // Status badge / chips
  const badges = await getText(page, '[class*="badge"], [class*="Badge"], [class*="chip"], [class*="Chip"], [class*="status"], [class*="Status"]');
  log('ADMIN COHORT DETAIL', 'Status badges:', badges);
  report.adminCohortDetailBadges = badges;

  // All visible text in the masthead/header area
  const headerText = await getText(page, 'header, [class*="masthead"], [class*="Masthead"], [class*="header"]');
  log('ADMIN COHORT DETAIL', 'Header area text:', headerText);

  // Tabs
  const tabs = await getText(page, '[role="tab"]');
  log('ADMIN COHORT DETAIL', 'Detail tabs:', tabs);
  report.adminCohortDetailTabs = tabs;

  // Members tab
  const membersTab = page.locator('[role="tab"]:has-text("Member"), button:has-text("Member"), a:has-text("Member")').first();
  if (await membersTab.isVisible()) {
    await membersTab.click();
    await page.waitForTimeout(1500);
    await ss(page, 'A11-cohort-members-tab');
    const membersCols = await getText(page, 'th, [role="columnheader"]');
    log('ADMIN COHORT DETAIL', 'Members tab columns:', membersCols);
    report.adminCohortMembersColumns = membersCols;

    const membersBtns = await page.locator('button:visible').allTextContents();
    log('ADMIN COHORT DETAIL', 'Members tab buttons:', membersBtns);
    report.adminCohortMembersButtons = membersBtns;
  } else {
    log('ADMIN COHORT DETAIL', 'No Members tab visible');
  }

  // Activity tab
  const activityTab = page.locator('[role="tab"]:has-text("Activity"), button:has-text("Activity"), a:has-text("Activity")').first();
  if (await activityTab.isVisible()) {
    await activityTab.click();
    await page.waitForTimeout(1500);
    await ss(page, 'A12-cohort-activity-tab');
    const activityHeadings = await getText(page, 'h1, h2, h3, h4');
    log('ADMIN COHORT DETAIL', 'Activity tab headings:', activityHeadings);
    report.adminCohortActivityHeadings = activityHeadings;
  } else {
    log('ADMIN COHORT DETAIL', 'No Activity tab visible');
  }

  // Manage dropdown
  const manageBtn = page.locator('button:has-text("Manage"), [aria-label*="manage" i], [class*="manage"]').first();
  if (await manageBtn.isVisible()) {
    await manageBtn.click();
    await page.waitForTimeout(800);
    await ss(page, 'A13-cohort-manage-dropdown');
    const dropdownItems = await getText(page, '[role="menuitem"], [class*="dropdown-item"], [class*="DropdownItem"], [class*="menu-item"]');
    log('ADMIN COHORT DETAIL', 'Manage dropdown items:', dropdownItems);
    report.adminCohortManageOptions = dropdownItems;
    await page.keyboard.press('Escape');
  } else {
    log('ADMIN COHORT DETAIL', 'No Manage button visible');
    // Try three-dot menu
    const dotsBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i], button[class*="more"], button[class*="action"]').first();
    if (await dotsBtn.isVisible()) {
      await dotsBtn.click();
      await page.waitForTimeout(800);
      await ss(page, 'A13-cohort-more-dropdown');
      const items = await getText(page, '[role="menuitem"], [class*="menu-item"]');
      log('ADMIN COHORT DETAIL', 'More dropdown items:', items);
      report.adminCohortMoreOptions = items;
      await page.keyboard.press('Escape');
    }
  }
}

// ── Admin: Flags Tab ──────────────────────────────────────────────────────────

async function adminFlagsTab(page) {
  log('ADMIN FLAGS TAB');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click flags tab
  const flagsTab = page.locator('[role="tab"]:has-text("Flag"), button:has-text("Flag"), a:has-text("Flag")').first();
  if (await flagsTab.isVisible()) {
    await flagsTab.click();
    await page.waitForTimeout(1500);
    log('ADMIN FLAGS', 'Clicked Flags tab');
  } else {
    log('ADMIN FLAGS', 'Flags tab not visible, trying URL');
    await page.goto(`${ADMIN_URL}/cohorts?tab=flags`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  }

  await ss(page, 'A06-flags-tab');
  const info = await pageInfo(page);
  report.adminFlagsURL = info.url;

  // Table headers
  const th = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN FLAGS', 'Column headers:', th);
  report.adminFlagsColumns = th;

  // Row count
  const rows = await page.locator('tbody tr').count();
  log('ADMIN FLAGS', `Rows: ${rows}`);
  report.adminFlagsRowCount = rows;

  if (rows > 0) {
    const firstRow = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN FLAGS', 'First row:', firstRow);
    report.adminFlagsFirstRow = firstRow;
  }

  // Empty state
  const emptyState = await getText(page, '[class*="empty"], [class*="Empty"], [class*="no-data"]');
  log('ADMIN FLAGS', 'Empty state:', emptyState);
  report.adminFlagsEmptyState = emptyState;

  // Buttons
  const btns = await page.locator('button:visible').allTextContents();
  log('ADMIN FLAGS', 'Buttons:', btns);
  report.adminFlagsButtons = btns;

  // Find all filter controls
  const allComboboxes = await page.locator('[role="combobox"], select, [class*="Select__control"], [class*="select__control"]').all();
  log('ADMIN FLAGS', `Comboboxes/selects: ${allComboboxes.length}`);

  // Try clicking each dropdown and capturing options
  const dropdownData = [];
  for (let i = 0; i < allComboboxes.length; i++) {
    const el = allComboboxes[i];
    const isVisible = await el.isVisible().catch(() => false);
    if (!isVisible) continue;
    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt = (await el.textContent().catch(() => '')).trim().slice(0, 60);

    try {
      await el.click({ timeout: 3000 });
      await page.waitForTimeout(600);

      const opts = await page.locator('[role="option"], [class*="option"], .dropdown-item').allTextContents();
      log('ADMIN FLAGS', `Dropdown ${i} (ph="${ph}" al="${al}"): options =`, opts);
      dropdownData.push({ index: i, placeholder: ph, ariaLabel: al, text: txt, options: opts });

      await ss(page, `A06b-flags-dropdown-${i}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } catch (e) {
      log('ADMIN FLAGS', `Dropdown ${i} click failed:`, e.message);
    }
  }
  report.adminFlagsDropdowns = dropdownData;

  // Specifically try status/kind/course dropdowns by keyword
  for (const kw of ['status', 'kind', 'type', 'course']) {
    const el = page.locator(`[placeholder*="${kw}" i], [aria-label*="${kw}" i], [id*="${kw}" i], [class*="${kw}" i] input`).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click().catch(() => {});
      await page.waitForTimeout(600);
      const opts = await page.locator('[role="option"]').allTextContents();
      if (opts.length > 0) {
        log('ADMIN FLAGS', `${kw} options:`, opts);
        report[`adminFlags_${kw}_options`] = opts;
        await ss(page, `A06c-flags-${kw}-dropdown`);
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  }

  // Check for any "Create Flag" or "New Flag" buttons
  const createBtn = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
  if (await createBtn.isVisible()) {
    const btnText = await createBtn.textContent();
    log('ADMIN FLAGS', `Create button found: "${btnText?.trim()}"`);
    report.adminFlagsCreateButton = btnText?.trim();
  }
}

// ── Admin: Cohorts Filters ────────────────────────────────────────────────────

async function adminCohortsFilters(page) {
  log('ADMIN COHORTS FILTERS');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Try all filter dropdowns on the main cohorts list
  const comboboxes = await page.locator('[role="combobox"], select').all();
  log('ADMIN COHORTS FILTERS', `Found ${comboboxes.length} comboboxes`);

  const allFilterData = [];
  for (let i = 0; i < comboboxes.length; i++) {
    const el = comboboxes[i];
    if (!await el.isVisible().catch(() => false)) continue;

    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt = (await el.textContent().catch(() => '')).trim().slice(0, 80);

    try {
      await el.click({ timeout: 3000 });
      await page.waitForTimeout(600);
      const opts = await page.locator('[role="option"]').allTextContents();
      log('ADMIN COHORTS FILTERS', `Filter ${i}: "${ph || al || txt}" → options:`, opts);
      allFilterData.push({ index: i, placeholder: ph, ariaLabel: al, text: txt, options: opts });
      await ss(page, `A05c-cohorts-filter-${i}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } catch (e) {
      log('ADMIN COHORTS FILTERS', `Filter ${i} failed:`, e.message);
    }
  }
  report.adminCohortsFilterDropdowns = allFilterData;
}

// ── Admin: Course Settings with Cohorts ───────────────────────────────────────

async function adminCourseSettings(page) {
  log('ADMIN COURSE SETTINGS');
  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await ss(page, 'A07-courses-list');

  const info = await pageInfo(page);
  report.adminCoursesListURL = info.url;

  const th = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN COURSES', 'Column headers:', th);
  report.adminCoursesColumns = th;

  const rows = await page.locator('tbody tr').count();
  log('ADMIN COURSES', `Rows: ${rows}`);

  let courseDetailURL = '';

  if (rows > 0) {
    // Get first course info
    const firstRowText = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN COURSES', 'First row:', firstRowText);

    // Try clicking the first row
    try {
      await page.locator('tbody tr:first-child').click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      courseDetailURL = page.url();
      log('ADMIN COURSES', 'Opened course:', courseDetailURL);
    } catch (e) {
      // Try first link
      const link = page.locator('tbody tr:first-child a, tbody tr:first-child td a').first();
      if (await link.isVisible()) {
        const href = await link.getAttribute('href');
        log('ADMIN COURSES', 'Following link:', href);
        await link.click();
        await page.waitForTimeout(2000);
        courseDetailURL = page.url();
      }
    }
  }

  if (!courseDetailURL || courseDetailURL.includes('/courses') && !courseDetailURL.match(/\/courses\/\w/)) {
    // Try known IDs
    for (const id of [1, 2, 3, 10, 100]) {
      await page.goto(`${ADMIN_URL}/courses/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const url = page.url();
      const is404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
      if (!url.includes('/login') && !is404) {
        courseDetailURL = url;
        break;
      }
    }
    // Try slug-based
    for (const slug of ['test-cohort-course-001', 'course-to-yap', 'test-course-1']) {
      await page.goto(`${ADMIN_URL}/courses/${slug}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const url = page.url();
      const is404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
      if (!url.includes('/login') && !is404) {
        courseDetailURL = url;
        break;
      }
    }
  }

  await ss(page, 'A08-course-detail');
  await pageInfo(page);

  // Find and click Settings tab
  const allTabs = await getText(page, '[role="tab"]');
  log('ADMIN COURSE SETTINGS', 'Course tabs:', allTabs);
  report.adminCourseDetailTabs = allTabs;

  const settingsTab = page.locator('[role="tab"]:has-text("Settings"), button:has-text("Settings"), a:has-text("Settings")').first();
  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await page.waitForTimeout(2000);
    await ss(page, 'A09-course-settings-top');
    log('ADMIN COURSE SETTINGS', 'Settings URL:', page.url());
    report.adminCourseSettingsURL = page.url();

    // Scroll through settings
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    await ss(page, 'A09b-course-settings-mid1');
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForTimeout(500);
    await ss(page, 'A09c-course-settings-mid2');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await ss(page, 'A09d-course-settings-bottom');

    // Back to top to extract all labels
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // All labels
    const labels = await getText(page, 'label:visible, [class*="FormLabel"]:visible, [class*="form-label"]:visible');
    log('ADMIN COURSE SETTINGS', 'Labels:', labels);
    report.adminCourseSettingsLabels = labels;

    // Headings in settings (sections)
    const sections = await getText(page, 'h2, h3, h4, [class*="SectionTitle"], [class*="section-title"]');
    log('ADMIN COURSE SETTINGS', 'Sections:', sections);
    report.adminCourseSettingsSections = sections;

    // Toggles
    const toggles = await page.locator('[role="switch"], input[type="checkbox"]:visible').all();
    log('ADMIN COURSE SETTINGS', `Toggles: ${toggles.length}`);
    const toggleData = [];
    for (let i = 0; i < toggles.length; i++) {
      const t = toggles[i];
      const checked = await t.isChecked().catch(() => null);
      const ctx = await t.evaluate(el => {
        let n = el.parentElement;
        for (let j = 0; j < 6; j++) {
          if (n && n.textContent?.trim().length > 3) return n.textContent.trim().slice(0, 150);
          n = n?.parentElement;
        }
        return '';
      });
      log('ADMIN COURSE SETTINGS', `Toggle ${i}: checked=${checked}, context="${ctx.slice(0, 100)}"`);
      toggleData.push({ index: i, checked, context: ctx });
    }
    report.adminCourseSettingsToggles = toggleData;

    // Look specifically for cohort-related content
    const cohortEls = await page.locator(
      '[class*="cohort" i], [id*="cohort" i], label:has-text("Cohort"), h2:has-text("Cohort"), h3:has-text("Cohort"), h4:has-text("Cohort"), p:has-text("cohort"), span:has-text("cohort")'
    ).allTextContents();
    log('ADMIN COURSE SETTINGS', 'Cohort-related elements:', cohortEls);
    report.adminCourseSettingsCohortElements = cohortEls;

    // Try to find and interact with cohort toggle
    const cohortToggle = page.locator(
      '[role="switch"]:near(:text("cohort")), input[type="checkbox"]:near(:text("cohort")), label:has-text("cohort") [role="switch"]'
    ).first();

    if (await cohortToggle.isVisible().catch(() => false)) {
      const isChecked = await cohortToggle.isChecked().catch(() => false);
      log('ADMIN COURSE SETTINGS', `Cohort toggle found, isChecked=${isChecked}`);
      if (!isChecked) {
        await cohortToggle.click().catch(() => {});
        await page.waitForTimeout(1000);
        await ss(page, 'A09e-course-settings-cohort-toggled');
        const newState = await cohortToggle.isChecked().catch(() => null);
        log('ADMIN COURSE SETTINGS', `After toggle click, isChecked=${newState}`);

        // What appeared?
        const newEls = await getText(page, '[class*="cohort" i]');
        log('ADMIN COURSE SETTINGS', 'After toggle, cohort els:', newEls);
        report.adminCourseSettingsAfterCohortToggle = newEls;
      }
    } else {
      log('ADMIN COURSE SETTINGS', 'No cohort toggle found directly, searching for "Group learners" text');
      const groupLearners = await page.locator('text=/group learners/i, text=/cohort/i').allTextContents();
      log('ADMIN COURSE SETTINGS', 'Group learners text:', groupLearners);
      report.adminCourseSettingsGroupLearners = groupLearners;
    }

  } else {
    log('ADMIN COURSE SETTINGS', 'Settings tab NOT FOUND. Tabs:', allTabs);
    report.adminCourseSettingsError = 'Settings tab not found';
  }
}

// ── Admin: API Exploration ────────────────────────────────────────────────────

async function adminAPIExploration(page) {
  log('ADMIN API EXPLORATION');

  const apiResults = {};
  const endpoints = [
    '/api/v1/admin/cohorts/',
    '/api/v1/admin/cohort-flags/',
    '/api/v1/admin/courses/?cohorts_enabled=true',
    '/api/v1/admin/cohorts/?page=1&page_size=10',
    '/api/v1/admin/cohort-flags/?page=1&page_size=10',
  ];

  for (const endpoint of endpoints) {
    const url = `${BACKEND_URL}${endpoint}`;
    log('ADMIN API', `Fetching ${endpoint}`);
    try {
      const result = await page.evaluate(async ({ url, token }) => {
        try {
          const resp = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const statusCode = resp.status;
          let body;
          try { body = await resp.json(); } catch { body = await resp.text(); }
          return { status: statusCode, body };
        } catch (e) {
          return { error: e.message };
        }
      }, { url, token: adminToken || 'mock-access-token' });

      log('ADMIN API', `${endpoint} →`, result.status, typeof result.body === 'object' ? JSON.stringify(result.body).slice(0, 300) : result.body?.slice(0, 300));
      apiResults[endpoint] = result;
    } catch (e) {
      log('ADMIN API', `${endpoint} failed:`, e.message);
      apiResults[endpoint] = { error: e.message };
    }
  }
  report.adminAPIResults = apiResults;
}

// ── Learner Login ─────────────────────────────────────────────────────────────

async function learnerLogin(page) {
  log('LEARNER LOGIN');
  await setupLearnerMocks(page);
  await page.goto(`${LEARNER_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'L01-login-page');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await emailInput.fill(LEARNER_USER).catch(() => {});

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(LEARNER_PASS).catch(() => {});

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined',
    { timeout: 8000 }
  ).catch(() => {});
  await page.waitForTimeout(500);

  await ss(page, 'L02-login-filled');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  const url = page.url();
  log('LEARNER LOGIN', 'Post-submit URL:', url);

  if (url.includes('/login')) {
    log('LEARNER LOGIN', 'Still on login — injecting token');
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'learner-mock-token');
      localStorage.setItem('refresh_token', 'learner-mock-refresh');
    });
    await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }

  await ss(page, 'L03-post-login');
  return !page.url().includes('/login');
}

// ── Learner: Dashboard ────────────────────────────────────────────────────────

async function learnerDashboard(page) {
  log('LEARNER DASHBOARD');
  const info = await pageInfo(page);
  report.learnerDashboardURL = info.url;

  // Nav links
  const navLinks = await page.locator('nav a, header a, [class*="sidebar"] a, [class*="nav"] a, [class*="Sidebar"] a').all();
  const navData = [];
  for (const link of navLinks) {
    const text = (await link.textContent().catch(() => '')).trim();
    const href = await link.getAttribute('href').catch(() => '');
    if (text) navData.push({ text, href });
  }
  log('LEARNER DASHBOARD', 'Nav links:', navData);
  report.learnerNavLinks = navData;

  const cohortLinks = navData.filter(n => /cohort/i.test(n.text));
  log('LEARNER DASHBOARD', 'Cohort nav links:', cohortLinks);
  report.learnerNavCohortLinks = cohortLinks;

  await ss(page, 'L04-dashboard');

  // Headings
  const headings = await getText(page, 'h1, h2, h3');
  log('LEARNER DASHBOARD', 'Headings:', headings);
  report.learnerDashboardHeadings = headings;
}

// ── Learner: Community ────────────────────────────────────────────────────────

async function learnerCommunity(page) {
  log('LEARNER COMMUNITY');
  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'L05-community');
  const info = await pageInfo(page);
  report.learnerCommunityURL = info.url;

  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  const tabs = await getText(page, '[role="tab"], [class*="Tab"]:not([class*="Table"])');
  log('LEARNER COMMUNITY', 'H1:', h1, 'H2:', h2);
  log('LEARNER COMMUNITY', 'Tabs:', tabs);
  report.learnerCommunityH1 = h1;
  report.learnerCommunityH2 = h2;
  report.learnerCommunityTabs = tabs;

  // Look for any cohort/group related tabs
  for (const keyword of ['Cohort', 'Group', 'cohort', 'group', 'Members', 'Community']) {
    const el = page.locator(`[role="tab"]:has-text("${keyword}"), button:has-text("${keyword}"), a:has-text("${keyword}")`).first();
    if (await el.isVisible().catch(() => false)) {
      log('LEARNER COMMUNITY', `Found "${keyword}" element`);
      await el.click();
      await page.waitForTimeout(1000);
      await ss(page, `L05b-community-${keyword.toLowerCase()}`);
      const content = await getText(page, 'main h1, main h2, main h3, main p');
      log('LEARNER COMMUNITY', `${keyword} tab content:`, content.slice(0, 5));
      report[`learnerCommunity${keyword}`] = content;
      break;
    }
  }

  // URL variations
  for (const tabParam of ['groups', 'cohorts', 'discussions', 'members']) {
    await page.goto(`${LEARNER_URL}/community?tab=${tabParam}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await ss(page, `L05c-community-tab-${tabParam}`);
    const url = page.url();
    const headings = await getText(page, 'h1, h2, h3');
    log('LEARNER COMMUNITY', `?tab=${tabParam} →`, url, 'Headings:', headings);
    report[`learnerCommunityTab_${tabParam}`] = { url, headings };
  }
}

// ── Learner: Cohort-related Routes ────────────────────────────────────────────

async function learnerCohortRoutes(page) {
  log('LEARNER COHORT ROUTES');
  const routes = [
    '/community/cohorts',
    '/community/cohorts/1',
    '/community/cohorts/2',
    '/community/cohorts/3',
    '/community/groups',
    '/community/groups/1',
    '/cohorts',
    '/cohorts/1',
    '/groups',
    '/my-cohorts',
    '/my-groups',
  ];

  for (const route of routes) {
    await page.goto(`${LEARNER_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const url = page.url();
    const slug = route.replace(/\//g, '_').replace(/^_/, '');
    await ss(page, `L06-${slug}`);
    const headings = await getText(page, 'h1, h2, h3');
    const is404 = await page.locator('text=/404|Page not found|not found/i').isVisible().catch(() => false);
    const is401 = await page.locator('text=/unauthorized|401/i').isVisible().catch(() => false);
    const redirected = url !== `${LEARNER_URL}${route}`;
    log('LEARNER ROUTE', `${route} → ${url}`);
    log('LEARNER ROUTE', `  headings: ${headings.join(', ')}`);
    log('LEARNER ROUTE', `  404=${is404} 401=${is401} redirected=${redirected}`);
    report[`learnerRoute_${slug}`] = { actualURL: url, expectedURL: `${LEARNER_URL}${route}`, headings, is404, is401, redirected };
  }
}

// ── Learner: My Courses + Cohort chips ───────────────────────────────────────

async function learnerMyCourses(page) {
  log('LEARNER MY COURSES');
  await page.goto(`${LEARNER_URL}/my-courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'L07-my-courses');
  const info = await pageInfo(page);
  report.learnerMyCoursesURL = info.url;

  const headings = await getText(page, 'h1, h2, h3');
  log('LEARNER MY COURSES', 'Headings:', headings);

  // Course cards
  const cardCount = await page.locator('[class*="card"], [class*="Card"], [class*="CourseCard"], [class*="course-card"]').count();
  log('LEARNER MY COURSES', `Cards: ${cardCount}`);

  // All text on page for cohort mentions
  const cohortMentions = await page.locator('*:has-text("cohort"):not(script):not(style)').allTextContents();
  const uniqueCohortMentions = [...new Set(cohortMentions.map(t => t.trim().slice(0, 100)))].slice(0, 10);
  log('LEARNER MY COURSES', 'Cohort mentions:', uniqueCohortMentions);
  report.learnerMyCoursesCohortMentions = uniqueCohortMentions;

  // Chips/badges
  const chips = await getText(page, '[class*="chip" i], [class*="badge" i], [class*="tag" i]');
  log('LEARNER MY COURSES', 'Chips/badges:', chips);
  report.learnerMyCoursesChips = chips;
}

// ── Learner: Courses listing ──────────────────────────────────────────────────

async function learnerCourses(page) {
  log('LEARNER COURSES');

  for (const path of ['/courses', '/learn', '/explore', '/library']) {
    await page.goto(`${LEARNER_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const url = page.url();
    const is404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
    if (!url.includes('/login') && !is404) {
      await ss(page, `L08-courses-${path.replace('/', '')}`);
      const info = await pageInfo(page);
      const headings = await getText(page, 'h1, h2');
      log('LEARNER COURSES', `${path} → ${url}, headings: ${headings}`);

      // Check for cohort chips
      const chips = await getText(page, '[class*="chip" i], [class*="badge" i]');
      const cohortChips = chips.filter(c => /cohort/i.test(c));
      if (cohortChips.length > 0) {
        log('LEARNER COURSES', 'Cohort chips found:', cohortChips);
        report.learnerCoursesPageCohortChips = cohortChips;
      }
      report[`learnerCoursesPath_${path}`] = { url, headings, cohortChips };
      break;
    }
  }
}

// ── Learner: Lesson Player ────────────────────────────────────────────────────

async function learnerLessonPlayer(page) {
  log('LEARNER LESSON PLAYER');

  // Try to find a course and open a lesson
  const coursePaths = [
    '/learn/course-to-yap/new-pdf-lesson',
    '/learn/course-to-yap',
    '/courses/test-cohort-course-001',
    '/courses',
    '/my-courses',
  ];

  let foundLesson = false;
  for (const cp of coursePaths) {
    await page.goto(`${LEARNER_URL}${cp}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const url = page.url();
    const is404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
    if (!url.includes('/login') && !is404) {
      await ss(page, `L09-lesson-${cp.replace(/\//g, '_').slice(1)}`);
      const info = await pageInfo(page);
      log('LEARNER LESSON', `${cp} → ${url}`);

      // Check for lesson player tabs
      const tabs = await getText(page, '[role="tab"], [class*="tab-list"] [class*="tab"], [class*="TabList"] [class*="Tab"]');
      log('LEARNER LESSON', 'Player tabs:', tabs);
      const hasCohortTab = tabs.some(t => /cohort/i.test(t));
      if (hasCohortTab) {
        log('LEARNER LESSON', 'COHORT TAB FOUND in lesson player!');
        report.learnerLessonCohortTab = true;
        report.learnerLessonCohortTabURL = url;

        const cohortTabEl = page.locator('[role="tab"]:has-text("Cohort")').first();
        await cohortTabEl.click();
        await page.waitForTimeout(1000);
        await ss(page, 'L09b-lesson-cohort-tab');
        const cohortContent = await getText(page, '[role="tabpanel"] h1, [role="tabpanel"] h2, [role="tabpanel"] h3, [role="tabpanel"] p');
        log('LEARNER LESSON', 'Cohort tab content:', cohortContent);
        report.learnerLessonCohortContent = cohortContent;
      }
      report[`learnerLessonPath_${cp}`] = { url, tabs, hasCohortTab };
      foundLesson = true;
      break;
    }
  }

  if (!foundLesson) {
    log('LEARNER LESSON', 'No lesson path worked, trying to navigate from courses list');
    await page.goto(`${LEARNER_URL}/my-courses`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const courseLinks = await page.locator('a[href*="/learn/"], a[href*="/course"]').all();
    if (courseLinks.length > 0) {
      const href = await courseLinks[0].getAttribute('href');
      log('LEARNER LESSON', 'Navigating to:', href);
      await courseLinks[0].click();
      await page.waitForTimeout(2000);
      await ss(page, 'L09c-lesson-from-courses');
    }
  }
}

// ── Learner: Notifications ────────────────────────────────────────────────────

async function learnerNotifications(page) {
  log('LEARNER NOTIFICATIONS');
  await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const notifBell = page.locator('[aria-label*="notification" i], [class*="notification"] button, button[class*="bell"], [class*="bell"] button').first();
  if (await notifBell.isVisible()) {
    await notifBell.click();
    await page.waitForTimeout(800);
    await ss(page, 'L10-notifications');
    const notifItems = await getText(page, '[class*="notification-item"], [class*="NotificationItem"], [role="listitem"]');
    const cohortNotifs = notifItems.filter(t => /cohort/i.test(t));
    log('LEARNER NOTIFICATIONS', 'Cohort notifications:', cohortNotifs);
    report.learnerNotifications = notifItems.slice(0, 10);
    report.learnerCohortNotifications = cohortNotifs;
    await page.keyboard.press('Escape');
  } else {
    log('LEARNER NOTIFICATIONS', 'Notification bell not found');
    report.learnerNotificationBell = false;
  }
}

// ── Learner: Profile / My Account ────────────────────────────────────────────

async function learnerProfile(page) {
  log('LEARNER PROFILE');
  await page.goto(`${LEARNER_URL}/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ss(page, 'L11-profile');
  const info = await pageInfo(page);
  report.learnerProfileURL = info.url;

  const headings = await getText(page, 'h1, h2, h3');
  log('LEARNER PROFILE', 'Headings:', headings);

  const cohortEl = await getText(page, '[class*="cohort" i], *:has-text("cohort")');
  log('LEARNER PROFILE', 'Cohort elements:', cohortEl.slice(0, 5));
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n████████████████████████████████████████████');
  console.log(' COHORTS COMPREHENSIVE RECHECK SCRIPT');
  console.log(' Target:', SS);
  console.log('████████████████████████████████████████████\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  // ─────────────────────────────────────────────────────
  // ADMIN PORTAL
  // ─────────────────────────────────────────────────────
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║           ADMIN PORTAL                    ║');
  console.log('╚═══════════════════════════════════════════╝');

  const adminCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const adminPage = await adminCtx.newPage();

  // Log API calls
  adminPage.on('response', resp => {
    const url = resp.url();
    if (url.includes('railway.app')) {
      console.log(`[ADMIN API RESP] ${resp.status()} ${url.replace('https://budgetnista-be-production.up.railway.app', '')}`);
    }
  });

  try {
    const loggedIn = await adminLogin(adminPage);
    log('ADMIN', 'Logged in:', loggedIn);

    await adminSidebar(adminPage);
    await adminCohortsPage(adminPage);
    await adminCohortsFilters(adminPage);
    await adminCohortDetail(adminPage);
    await adminFlagsTab(adminPage);
    await adminCourseSettings(adminPage);
    await adminAPIExploration(adminPage);
  } catch (e) {
    console.error('[ADMIN FATAL ERROR]', e.message, e.stack);
    await ss(adminPage, 'ADMIN-error').catch(() => {});
    report.adminFatalError = e.message;
  }

  await adminCtx.close();

  // ─────────────────────────────────────────────────────
  // LEARNER PORTAL
  // ─────────────────────────────────────────────────────
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║           LEARNER PORTAL                  ║');
  console.log('╚═══════════════════════════════════════════╝');

  const learnerCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const learnerPage = await learnerCtx.newPage();

  learnerPage.on('response', resp => {
    const url = resp.url();
    if (url.includes('railway.app')) {
      console.log(`[LEARNER API RESP] ${resp.status()} ${url.replace('https://budgetnista-be-production.up.railway.app', '')}`);
    }
  });

  try {
    const loggedIn = await learnerLogin(learnerPage);
    log('LEARNER', 'Logged in:', loggedIn);

    await learnerDashboard(learnerPage);
    await learnerCommunity(learnerPage);
    await learnerCohortRoutes(learnerPage);
    await learnerMyCourses(learnerPage);
    await learnerCourses(learnerPage);
    await learnerLessonPlayer(learnerPage);
    await learnerNotifications(learnerPage);
    await learnerProfile(learnerPage);
  } catch (e) {
    console.error('[LEARNER FATAL ERROR]', e.message, e.stack);
    await ss(learnerPage, 'LEARNER-error').catch(() => {});
    report.learnerFatalError = e.message;
  }

  await learnerCtx.close();
  await browser.close();

  // ─────────────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────────────
  console.log('\n\n╔═══════════════════════════════════════════╗');
  console.log('║            FINAL REPORT                   ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(JSON.stringify(report, null, 2));

  const reportPath = path.join(SS, 'recheck-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('\n[REPORT] Saved to:', reportPath);
  console.log('[SCREENSHOTS] Saved to:', SS);
}

main().catch(e => {
  console.error('FATAL UNHANDLED:', e);
  process.exit(1);
});
