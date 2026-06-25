// @ts-check
// Comprehensive Cohorts Feature Exploration — FINAL VERSION
// Key: Register catch-all FIRST, specific mocks AFTER (Playwright LIFO route ordering)
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
const apiCallLog = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function ss(page, name) {
  const fp = path.join(SS, name.endsWith('.png') ? name : name + '.png');
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`[SS] ${name}`);
  return fp;
}

function log(section, ...args) {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  console.log(`▶ [${section}] ${msg}`);
}

async function pageInfo(page) {
  const url = page.url();
  const title = await page.title();
  console.log(`  URL: ${url}`);
  console.log(`  Title: ${title}`);
  return { url, title };
}

async function getText(page, selector) {
  return page.locator(selector).allTextContents().catch(() => []);
}

async function waitFor(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Mock data objects ─────────────────────────────────────────────────────────

const ADMIN_USER_OBJ = {
  id: 1, email: ADMIN_USER,
  first_name: 'Super', last_name: 'Admin',
  role: 'super_admin', is_active: true,
};

const LEARNER_USER_OBJ = {
  id: 100, email: LEARNER_USER,
  first_name: 'Sundar', last_name: 'S',
  role: 'learner', is_active: true,
};

// ── Admin Mock Setup (LIFO ORDER: catch-all FIRST, specifics LAST) ───────────

async function setupAdminMocks(page) {
  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('railway.app') && !url.includes('/ws/')) {
      const shortUrl = url.replace(BACKEND_URL, '').split('?')[0];
      apiCallLog.push({ portal: 'admin', status: resp.status(), url: shortUrl, method: resp.request().method() });
    }
  });

  // 1. CATCH-ALL (registered FIRST = lowest priority in LIFO)
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    const url = route.request().url();
    try {
      const resp = await route.fetch({ timeout: 20000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      const bodyText = await resp.text().catch(() => '');
      console.log(`  [BACKEND FALLBACK] ${resp.status()} ${url.replace(BACKEND_URL, '').slice(0, 60)}`);
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

  // 2. SPECIFIC MOCKS (registered LAST = highest priority)
  await page.route(/\/api\/v1\/notifications\//, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, error: null, data: { count: 0, results: [] } }),
  }));

  await page.route(/\/api\/v1\/auth\/tenant-redirect\/?(\?.*)?$/, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, error: null, data: { redirect_to: null } }),
  }));

  await page.route(/\/api\/v1\/auth\/token\/refresh\/?(\?.*)?$/, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, error: null, data: { access: 'mock-access-token', refresh: 'mock-refresh-token' } }),
  }));

  await page.route(/\/api\/v1\/admin\/auth\/profile\/?(\?.*)?$/, route => {
    console.log('  [MOCK] admin profile intercepted');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: ADMIN_USER_OBJ }),
    });
  });

  await page.route(/\/api\/v1\/admin\/auth\/login\/?(\?.*)?$/, route => {
    console.log('  [MOCK] admin login intercepted');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: ADMIN_USER_OBJ,
          tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
          redirect_to: null,
        },
      }),
    });
  });
}

// ── Learner Mock Setup ────────────────────────────────────────────────────────

async function setupLearnerMocks(page) {
  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('railway.app') && !url.includes('/ws/')) {
      const shortUrl = url.replace(BACKEND_URL, '').split('?')[0];
      apiCallLog.push({ portal: 'learner', status: resp.status(), url: shortUrl, method: resp.request().method() });
    }
  });

  // CATCH-ALL first (lowest priority)
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

  // Specifics last (higher priority)
  await page.route(/\/api\/v1\/notifications\//, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, error: null, data: { count: 0, results: [] } }),
  }));

  await page.route(/\/api\/v1\/auth\/tenant-redirect\/?(\?.*)?$/, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, error: null, data: { redirect_to: null } }),
  }));

  await page.route(/\/api\/v1\/auth\/token\/refresh\/?(\?.*)?$/, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, error: null, data: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' } }),
  }));

  await page.route(/\/api\/v1\/auth\/profile\/?(\?.*)?$|\/api\/v1\/learner\/auth\/profile\/?(\?.*)?$/, route => {
    console.log('  [MOCK] learner profile intercepted');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: LEARNER_USER_OBJ }),
    });
  });

  await page.route(/\/api\/v1\/auth\/login\/?(\?.*)?$/, route => {
    console.log('  [MOCK] learner login intercepted');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: LEARNER_USER_OBJ,
          tokens: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' },
          redirect_to: null,
        },
      }),
    });
  });
}

// ── Admin Login ───────────────────────────────────────────────────────────────

async function adminLogin(page) {
  log('ADMIN LOGIN', 'Starting...');
  await setupAdminMocks(page);

  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded' });
  await waitFor(2000);
  await ss(page, 'A01-login-page');

  await page.getByRole('textbox', { name: 'admin@gmail.com' }).fill(ADMIN_USER);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(ADMIN_PASS);

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => log('ADMIN LOGIN', 'reCAPTCHA not ready'));
  await waitFor(600);

  await page.getByRole('button', { name: 'Sign in' }).click();
  await waitFor(6000);

  const url = page.url();
  log('ADMIN LOGIN', 'Post-submit URL:', url);

  if (url.includes('/login')) {
    log('ADMIN LOGIN', 'FAILED — still on login page');
    await ss(page, 'A01b-login-fail');
    return false;
  }

  log('ADMIN LOGIN', 'SUCCESS →', url);
  await ss(page, 'A02-post-login');
  return true;
}

// ── Admin: Full Sidebar ───────────────────────────────────────────────────────

async function adminSidebar(page) {
  log('ADMIN SIDEBAR');
  await waitFor(1000);

  // Expand all collapsible groups by clicking group buttons
  const sidebarBtns = await page.locator('nav button, aside button, [class*="sidebar" i] button').all();
  log('ADMIN SIDEBAR', `Sidebar buttons: ${sidebarBtns.length}`);
  for (const btn of sidebarBtns) {
    const isVisible = await btn.isVisible().catch(() => false);
    const text = (await btn.textContent().catch(() => '')).trim();
    if (isVisible && text) {
      await btn.click({ force: true }).catch(() => {});
      await waitFor(250);
    }
  }
  await waitFor(500);
  await ss(page, 'A04-sidebar-expanded');

  // Collect all nav links
  const links = await page.locator('nav a, aside a, [class*="sidebar" i] a, [class*="Sidebar" i] a').all();
  const navData = [];
  for (const link of links) {
    const text = (await link.textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
    const href = await link.getAttribute('href').catch(() => '');
    if (text) navData.push({ text, href });
  }
  log('ADMIN SIDEBAR', `Total nav items: ${navData.length}`);
  navData.forEach(n => console.log(`  "${n.text}" → ${n.href}`));
  report.adminSidebar = navData;

  const cohortLinks = navData.filter(n => /cohort/i.test(n.text));
  log('ADMIN SIDEBAR', 'Cohort items:', JSON.stringify(cohortLinks));
  report.adminCohortNavItems = cohortLinks;

  // Look for group labels
  const groupLabels = await getText(page, '[class*="group-label" i], [class*="GroupLabel" i], [class*="section-label" i], [class*="SectionLabel" i]');
  log('ADMIN SIDEBAR', 'Group labels:', groupLabels);
  report.adminSidebarGroupLabels = groupLabels;
}

// ── Admin: Cohorts Main Page ──────────────────────────────────────────────────

async function adminCohortsPage(page) {
  log('ADMIN COHORTS PAGE');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await waitFor(3000);
  await ss(page, 'A05-cohorts-page');
  const info = await pageInfo(page);
  report.adminCohortsURL = info.url;

  if (info.url.includes('/login')) {
    log('ADMIN COHORTS PAGE', 'Redirected to login — auth not working');
    return;
  }

  // Headings
  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  const h3 = await getText(page, 'h3');
  log('ADMIN COHORTS PAGE', 'H1:', h1);
  log('ADMIN COHORTS PAGE', 'H2:', h2);
  log('ADMIN COHORTS PAGE', 'H3:', h3);
  report.adminCohortsH1 = h1;
  report.adminCohortsH2 = h2;

  // Subtitle / description
  const subtitleEl = page.locator('p:visible, [class*="subtitle" i]:visible, [class*="description" i]:visible').first();
  const subtitle = await subtitleEl.textContent().catch(() => '');
  log('ADMIN COHORTS PAGE', 'Subtitle:', subtitle?.trim()?.slice(0, 250));
  report.adminCohortsSubtitle = subtitle?.trim();

  // Tabs
  const tabs = await getText(page, '[role="tab"]');
  log('ADMIN COHORTS PAGE', 'Tabs:', tabs);
  report.adminCohortsTabs = tabs;

  // Table headers
  const colHeaders = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN COHORTS PAGE', 'Table headers:', colHeaders);
  report.adminCohortsColumns = colHeaders;

  const rowCount = await page.locator('tbody tr').count();
  log('ADMIN COHORTS PAGE', `Row count: ${rowCount}`);
  report.adminCohortsRowCount = rowCount;

  if (rowCount > 0) {
    const firstRowCells = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN COHORTS PAGE', 'First row:', firstRowCells);
    report.adminCohortsFirstRow = firstRowCells;

    // All rows data
    const allRows = [];
    const rows = await page.locator('tbody tr').all();
    for (const row of rows.slice(0, 5)) {
      const cells = await row.locator('td').allTextContents();
      allRows.push(cells);
    }
    report.adminCohortsSampleRows = allRows;
  } else {
    // Empty state
    const emptyText = await page.locator('[class*="empty" i], [class*="no-data" i], [class*="EmptyState" i]').allTextContents();
    log('ADMIN COHORTS PAGE', 'Empty state:', emptyText);
    report.adminCohortsEmptyState = emptyText;

    // Look for any visible text that explains empty state
    const bodyText = await page.locator('main').textContent().catch(() => '');
    const emptyLines = (bodyText || '').split('\n').map(l => l.trim()).filter(l => l.length > 10 && l.length < 200);
    log('ADMIN COHORTS PAGE', 'Main content lines:', emptyLines.slice(0, 10));
    report.adminCohortsMainText = emptyLines.slice(0, 15);
  }

  // Buttons
  const buttons = await page.locator('button:visible').allTextContents();
  log('ADMIN COHORTS PAGE', 'Buttons:', buttons);
  report.adminCohortsButtons = buttons;

  // Search input
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
  if (await searchInput.isVisible()) {
    const ph = await searchInput.getAttribute('placeholder');
    log('ADMIN COHORTS PAGE', 'Search placeholder:', ph);
    report.adminCohortsSearchPlaceholder = ph;
  }

  // Filter dropdowns — open each
  const comboboxes = await page.locator('[role="combobox"]').all();
  log('ADMIN COHORTS PAGE', `Filter comboboxes: ${comboboxes.length}`);
  const filterData = [];

  for (let i = 0; i < comboboxes.length; i++) {
    const el = comboboxes[i];
    if (!await el.isVisible().catch(() => false)) continue;
    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt = (await el.textContent().catch(() => '')).trim().slice(0, 80);
    console.log(`  [FILTER ${i}] ph="${ph}" al="${al}" txt="${txt}"`);

    try {
      await el.click({ timeout: 3000 });
      await waitFor(700);
      const opts = await page.locator('[role="option"]').allTextContents();
      log('ADMIN COHORTS PAGE', `  Filter ${i} options:`, opts);
      filterData.push({ index: i, placeholder: ph, ariaLabel: al, text: txt, options: opts });
      await ss(page, `A05f-filter-${i}`);
      await page.keyboard.press('Escape');
      await waitFor(400);
    } catch (e) {
      log('ADMIN COHORTS PAGE', `  Filter ${i} error:`, e.message.slice(0, 60));
    }
  }
  report.adminCohortsFilterData = filterData;

  // Bottom scroll
  await page.evaluate(() => window.scrollTo(0, 500));
  await waitFor(400);
  await ss(page, 'A05b-cohorts-scrolled');
  await page.evaluate(() => window.scrollTo(0, 0));
}

// ── Admin: Cohort Detail ──────────────────────────────────────────────────────

async function adminCohortDetail(page) {
  log('ADMIN COHORT DETAIL');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await waitFor(2000);

  const rowCount = await page.locator('tbody tr').count();
  log('ADMIN COHORT DETAIL', `Rows: ${rowCount}`);

  let navigated = false;

  if (rowCount > 0) {
    try {
      await page.locator('tbody tr:first-child').click({ timeout: 5000 });
      await waitFor(2000);
      if (page.url().match(/\/cohorts\/\w/)) navigated = true;
    } catch (e) {
      log('ADMIN COHORT DETAIL', 'Row click failed:', e.message);
    }
  }

  if (!navigated) {
    log('ADMIN COHORT DETAIL', 'Trying direct IDs 1-10');
    for (const id of [1, 2, 3, 4, 5, 10]) {
      await page.goto(`${ADMIN_URL}/cohorts/${id}`, { waitUntil: 'domcontentloaded' });
      await waitFor(1500);
      const url = page.url();
      if (!url.includes('/login') && url.match(/\/cohorts\/\d+/)) {
        navigated = true;
        log('ADMIN COHORT DETAIL', `Found at /cohorts/${id}`);
        break;
      }
    }
  }

  await ss(page, 'A10-cohort-detail');
  const info = await pageInfo(page);
  report.adminCohortDetailURL = info.url;

  if (info.url.includes('/login')) {
    log('ADMIN COHORT DETAIL', 'Redirected to login');
    return;
  }

  if (info.url.endsWith('/cohorts') || !navigated) {
    log('ADMIN COHORT DETAIL', 'Could not find any cohort detail page — no cohorts exist');
    report.adminCohortDetailNoData = true;
    return;
  }

  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  log('ADMIN COHORT DETAIL', 'Headings:', h1, h2);
  report.adminCohortDetailH1 = h1;

  const badges = await getText(page, '[class*="badge" i], [class*="chip" i], [class*="status" i]');
  log('ADMIN COHORT DETAIL', 'Badges/chips:', badges);
  report.adminCohortDetailBadges = badges;

  const tabs = await getText(page, '[role="tab"]');
  log('ADMIN COHORT DETAIL', 'Tabs:', tabs);
  report.adminCohortDetailTabs = tabs;

  const headerArea = await getText(page, 'header, [class*="masthead" i], [class*="header" i], [class*="PageHeader" i]');
  log('ADMIN COHORT DETAIL', 'Header area:', headerArea);

  // Members tab
  const membersTab = page.locator('[role="tab"]:has-text("Member")').first();
  if (await membersTab.isVisible()) {
    await membersTab.click();
    await waitFor(1500);
    await ss(page, 'A11-members-tab');
    const cols = await getText(page, 'th, [role="columnheader"]');
    log('ADMIN COHORT DETAIL', 'Members columns:', cols);
    report.adminMembersColumns = cols;
    const btns = await page.locator('button:visible').allTextContents();
    log('ADMIN COHORT DETAIL', 'Members buttons:', btns);
    report.adminMembersButtons = btns;
    const emptyState = await getText(page, '[class*="empty" i], [class*="no-data" i]');
    log('ADMIN COHORT DETAIL', 'Members empty state:', emptyState);
    report.adminMembersEmptyState = emptyState;
    const mainText = await page.locator('[role="tabpanel"], main').textContent().catch(() => '');
    const lines = (mainText || '').split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 200).slice(0, 15);
    log('ADMIN COHORT DETAIL', 'Members tab text lines:', lines);
    report.adminMembersTabContent = lines;
  }

  // Activity tab
  const activityTab = page.locator('[role="tab"]:has-text("Activity")').first();
  if (await activityTab.isVisible()) {
    await activityTab.click();
    await waitFor(1500);
    await ss(page, 'A12-activity-tab');
    const activityText = await page.locator('[role="tabpanel"], main').textContent().catch(() => '');
    const activityLines = (activityText || '').split('\n').map(l => l.trim()).filter(l => l.length > 5).slice(0, 10);
    log('ADMIN COHORT DETAIL', 'Activity tab content:', activityLines);
    report.adminActivityTabContent = activityLines;
  }

  // Manage dropdown
  const manageBtn = page.locator('button:has-text("Manage")').first();
  if (await manageBtn.isVisible()) {
    await manageBtn.click();
    await waitFor(800);
    await ss(page, 'A13-manage-dropdown');
    const items = await page.locator('[role="menuitem"], [class*="menu-item" i], [class*="MenuItem" i]').allTextContents();
    log('ADMIN COHORT DETAIL', 'Manage dropdown items:', items);
    report.adminManageDropdownItems = items;
    await page.keyboard.press('Escape');
    await waitFor(300);
  } else {
    log('ADMIN COHORT DETAIL', 'No Manage button — looking for more/actions button');
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="action" i], [aria-haspopup="menu"]').first();
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      await waitFor(800);
      await ss(page, 'A13-more-menu');
      const items = await page.locator('[role="menuitem"]').allTextContents();
      log('ADMIN COHORT DETAIL', 'More menu items:', items);
      report.adminMoreMenuItems = items;
      await page.keyboard.press('Escape');
    }
  }

  // Overall page structure
  const allVisible = await page.locator('body').textContent().catch(() => '');
  const textLines = (allVisible || '').split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 200).slice(0, 30);
  report.adminCohortDetailPageText = textLines;
}

// ── Admin: Flags Tab ──────────────────────────────────────────────────────────

async function adminFlagsTab(page) {
  log('ADMIN FLAGS TAB');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await waitFor(2000);

  const flagsTabEl = page.locator('[role="tab"]:has-text("Flag")').first();
  if (await flagsTabEl.isVisible()) {
    log('ADMIN FLAGS TAB', 'Found Flags tab — clicking');
    await flagsTabEl.click();
    await waitFor(1500);
  } else {
    log('ADMIN FLAGS TAB', 'No Flags tab — trying ?tab=flags');
    await page.goto(`${ADMIN_URL}/cohorts?tab=flags`, { waitUntil: 'domcontentloaded' });
    await waitFor(1500);
  }

  await ss(page, 'A06-flags-tab');
  const info = await pageInfo(page);
  report.adminFlagsURL = info.url;

  const colHeaders = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN FLAGS TAB', 'Column headers:', colHeaders);
  report.adminFlagsColumns = colHeaders;

  const rowCount = await page.locator('tbody tr').count();
  log('ADMIN FLAGS TAB', `Row count: ${rowCount}`);
  report.adminFlagsRowCount = rowCount;

  if (rowCount > 0) {
    const firstRow = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN FLAGS TAB', 'First row:', firstRow);
    report.adminFlagsFirstRow = firstRow;
  }

  // Empty state
  const emptyState = await getText(page, '[class*="empty" i], [class*="no-data" i], [class*="EmptyState" i]');
  log('ADMIN FLAGS TAB', 'Empty state:', emptyState);
  report.adminFlagsEmptyState = emptyState;

  // Page text for count badge etc
  const mainText = await page.locator('main').textContent().catch(() => '');
  const textLines = (mainText || '').split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 300).slice(0, 20);
  log('ADMIN FLAGS TAB', 'Main content:', textLines);
  report.adminFlagsPageText = textLines;

  const buttons = await page.locator('button:visible').allTextContents();
  log('ADMIN FLAGS TAB', 'Buttons:', buttons);
  report.adminFlagsButtons = buttons;

  // Open ALL dropdowns
  const comboboxes = await page.locator('[role="combobox"]').all();
  log('ADMIN FLAGS TAB', `Comboboxes: ${comboboxes.length}`);
  const dropdownData = [];

  for (let i = 0; i < comboboxes.length; i++) {
    const el = comboboxes[i];
    if (!await el.isVisible().catch(() => false)) continue;
    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt = (await el.textContent().catch(() => '')).trim().slice(0, 80);
    console.log(`  [FLAGS DD ${i}] ph="${ph}" al="${al}" txt="${txt}"`);

    try {
      await el.click({ timeout: 3000 });
      await waitFor(700);
      const opts = await page.locator('[role="option"]').allTextContents();
      log('ADMIN FLAGS TAB', `  Dropdown ${i} options:`, opts);
      dropdownData.push({ index: i, placeholder: ph, ariaLabel: al, text: txt, options: opts });
      await ss(page, `A06d-flags-dd-${i}`);
      await page.keyboard.press('Escape');
      await waitFor(400);
    } catch (e) {
      log('ADMIN FLAGS TAB', `  Dropdown ${i} error:`, e.message.slice(0, 60));
    }
  }
  report.adminFlagsDropdowns = dropdownData;
}

// ── Admin: Course Settings ────────────────────────────────────────────────────

async function adminCourseSettings(page) {
  log('ADMIN COURSE SETTINGS');

  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await waitFor(3000);
  await ss(page, 'A07-courses-list');
  const listInfo = await pageInfo(page);
  report.adminCoursesListURL = listInfo.url;

  if (listInfo.url.includes('/login')) return;

  const colHeaders = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN COURSE SETTINGS', 'Course list columns:', colHeaders);
  report.adminCoursesColumns = colHeaders;

  const rowCount = await page.locator('tbody tr').count();
  log('ADMIN COURSE SETTINGS', `Course rows: ${rowCount}`);
  report.adminCoursesRowCount = rowCount;

  if (rowCount > 0) {
    const firstRowData = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN COURSE SETTINGS', 'First course row:', firstRowData);
    report.adminCoursesFirstRow = firstRowData;

    // Get all visible course names for reference
    const allNames = await page.locator('tbody tr td:first-child').allTextContents();
    log('ADMIN COURSE SETTINGS', 'Course names:', allNames);
    report.adminCourseNames = allNames;

    // Click first course
    try {
      await page.locator('tbody tr:first-child').click({ timeout: 5000 });
      await waitFor(2000);
      log('ADMIN COURSE SETTINGS', 'Navigated to:', page.url());
    } catch (e) {
      const link = page.locator('tbody tr:first-child a').first();
      if (await link.isVisible()) {
        await link.click();
        await waitFor(2000);
      }
    }
  } else {
    log('ADMIN COURSE SETTINGS', 'No courses in table — trying direct IDs');
    for (const idOrSlug of [1, 2, 3, 'test-cohort-course-001', 'course-to-yap', 'test-course']) {
      await page.goto(`${ADMIN_URL}/courses/${idOrSlug}`, { waitUntil: 'domcontentloaded' });
      await waitFor(1500);
      const url = page.url();
      if (!url.includes('/login') && url.match(/\/courses\/\w/)) {
        log('ADMIN COURSE SETTINGS', `Found course at: ${url}`);
        break;
      }
    }
  }

  await ss(page, 'A08-course-detail');
  const detailInfo = await pageInfo(page);
  report.adminCourseDetailURL = detailInfo.url;

  const courseTabs = await getText(page, '[role="tab"]');
  log('ADMIN COURSE SETTINGS', 'Course tabs:', courseTabs);
  report.adminCourseDetailTabs = courseTabs;

  // Click Settings tab
  const settingsTab = page.locator('[role="tab"]:has-text("Settings")').first();
  if (!await settingsTab.isVisible()) {
    log('ADMIN COURSE SETTINGS', 'No Settings tab. Available:', courseTabs);
    report.adminCourseSettingsError = `No Settings tab. Tabs: ${JSON.stringify(courseTabs)}`;
    return;
  }

  await settingsTab.click();
  await waitFor(2000);
  await ss(page, 'A09-settings-top');
  report.adminCourseSettingsURL = page.url();

  // Scroll through
  await page.evaluate(() => window.scrollTo(0, 400));
  await waitFor(300);
  await ss(page, 'A09b-settings-mid1');
  await page.evaluate(() => window.scrollTo(0, 800));
  await waitFor(300);
  await ss(page, 'A09c-settings-mid2');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await waitFor(300);
  await ss(page, 'A09d-settings-bottom');
  await page.evaluate(() => window.scrollTo(0, 0));
  await waitFor(300);

  // All visible labels
  const labels = await page.locator('label:visible').allTextContents();
  log('ADMIN COURSE SETTINGS', 'Labels:', labels);
  report.adminCourseSettingsLabels = labels;

  // Section headings
  const sections = await getText(page, 'h2:visible, h3:visible, h4:visible, [class*="SectionTitle" i]:visible, [class*="section-heading" i]:visible');
  log('ADMIN COURSE SETTINGS', 'Sections:', sections);
  report.adminCourseSettingsSections = sections;

  // All toggles
  const toggleEls = await page.locator('[role="switch"]:visible, input[type="checkbox"]:visible').all();
  log('ADMIN COURSE SETTINGS', `Toggles: ${toggleEls.length}`);
  const toggleData = [];
  for (let i = 0; i < toggleEls.length; i++) {
    const t = toggleEls[i];
    const checked = await t.isChecked().catch(() => null);
    const id = await t.getAttribute('id').catch(() => '') || '';
    const name = await t.getAttribute('name').catch(() => '') || '';
    const ctx = await t.evaluate(el => {
      let n = el;
      for (let j = 0; j < 8; j++) {
        n = n.parentElement;
        const txt = n?.textContent?.trim();
        if (txt && txt.length > 3 && txt.length < 200) return txt;
      }
      return '';
    });
    console.log(`  [TOGGLE ${i}] id="${id}" name="${name}" checked=${checked}`);
    console.log(`    context: "${ctx.slice(0, 120)}"`);
    toggleData.push({ index: i, id, name, checked, context: ctx });
  }
  report.adminCourseSettingsToggles = toggleData;

  // Cohort-specific search
  const cohortEls = await page.locator(
    '[class*="cohort" i]:visible, [id*="cohort" i]:visible, label:has-text("Cohort"):visible, h2:has-text("Cohort"):visible, h3:has-text("Cohort"):visible, h4:has-text("Cohort"):visible, label:has-text("Group learners"):visible, h3:has-text("Group learners"):visible, span:has-text("Group learners"):visible'
  ).allTextContents();
  log('ADMIN COURSE SETTINGS', 'Cohort elements:', cohortEls);
  report.adminCourseSettingsCohortElements = cohortEls;

  // Full page text for searching cohort content
  const pageText = await page.locator('main, [class*="settings" i]').textContent().catch(() => '');
  const cohortLines = (pageText || '').split('\n').map(l => l.trim()).filter(l => l.toLowerCase().includes('cohort') && l.length > 3 && l.length < 300);
  log('ADMIN COURSE SETTINGS', 'Cohort-related text lines:', cohortLines);
  report.adminCourseSettingsCohortTextLines = cohortLines;

  // Try clicking cohort toggle if found
  const allToggles = await page.locator('[role="switch"]:visible').all();
  for (const tog of allToggles) {
    const ctx = await tog.evaluate(el => {
      let n = el;
      for (let j = 0; j < 8; j++) {
        n = n.parentElement;
        const txt = n?.textContent?.toLowerCase() || '';
        if (txt.includes('cohort') || txt.includes('group learner')) {
          return n.textContent.trim().slice(0, 200);
        }
      }
      return null;
    });
    if (ctx) {
      log('ADMIN COURSE SETTINGS', 'Found cohort toggle. Context:', ctx);
      const isChecked = await tog.isChecked().catch(() => false);
      report.adminCohortToggleContext = ctx;
      report.adminCohortToggleChecked = isChecked;

      if (!isChecked) {
        log('ADMIN COURSE SETTINGS', 'Enabling cohort toggle...');
        await tog.click();
        await waitFor(1500);
        await ss(page, 'A09e-settings-cohort-enabled');
        const newLabels = await page.locator('label:visible').allTextContents();
        log('ADMIN COURSE SETTINGS', 'Labels after enabling cohorts:', newLabels);
        report.adminCourseSettingsLabelsAfterCohortEnable = newLabels;

        // Check for new input fields
        const newInputs = await page.locator('input[type="number"]:visible, input[placeholder*="week" i]:visible, input[placeholder*="day" i]:visible').all();
        log('ADMIN COURSE SETTINGS', `New inputs after enable: ${newInputs.length}`);
        const inputData = [];
        for (const inp of newInputs) {
          const ph = await inp.getAttribute('placeholder').catch(() => '') || '';
          const name = await inp.getAttribute('name').catch(() => '') || '';
          const val = await inp.inputValue().catch(() => '');
          inputData.push({ placeholder: ph, name, value: val });
          console.log(`  [NEW INPUT] ph="${ph}" name="${name}" val="${val}"`);
        }
        report.adminCohortSettingsNewInputs = inputData;
      } else {
        log('ADMIN COURSE SETTINGS', 'Cohort toggle already ON');
        report.adminCohortToggleAlreadyOn = true;
        await ss(page, 'A09e-settings-cohort-already-on');
        const inputs = await page.locator('input:visible').all();
        const inputData = [];
        for (const inp of inputs) {
          const ph = await inp.getAttribute('placeholder').catch(() => '') || '';
          const name = await inp.getAttribute('name').catch(() => '') || '';
          const type = await inp.getAttribute('type').catch(() => '') || '';
          const val = await inp.inputValue().catch(() => '');
          if (type !== 'hidden') inputData.push({ type, placeholder: ph, name, value: val });
        }
        report.adminCohortSettingsInputsWhenOn = inputData;
      }
      break;
    }
  }
}

// ── Admin: API Exploration ────────────────────────────────────────────────────

async function adminAPIExploration(page) {
  log('ADMIN API EXPLORATION');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await waitFor(1000);

  const endpoints = [
    { path: '/api/v1/admin/cohorts/', desc: 'List cohorts' },
    { path: '/api/v1/admin/cohort-flags/', desc: 'List flags' },
    { path: '/api/v1/admin/courses/?cohorts_enabled=true', desc: 'Cohort-enabled courses' },
    { path: '/api/v1/admin/cohorts/?status=active', desc: 'Active cohorts' },
    { path: '/api/v1/admin/cohorts/?status=upcoming', desc: 'Upcoming cohorts' },
    { path: '/api/v1/admin/cohort-flags/?status=open', desc: 'Open flags' },
    { path: '/api/v1/admin/courses/', desc: 'All courses' },
  ];

  const apiResults = {};
  for (const { path, desc } of endpoints) {
    try {
      const result = await page.evaluate(async ({ url, token }) => {
        const resp = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const status = resp.status;
        let body;
        try { body = await resp.json(); } catch { body = await resp.text(); }
        return { status, body };
      }, { url: `${BACKEND_URL}${path}`, token: 'mock-access-token' });

      const count = result.body?.data?.count;
      const firstItem = result.body?.data?.results?.[0];
      const fields = firstItem ? Object.keys(firstItem) : [];
      console.log(`  [API] ${path}`);
      console.log(`    status=${result.status} count=${count} fields=${fields.join(', ')}`);
      if (firstItem) console.log(`    sample:`, JSON.stringify(firstItem).slice(0, 300));
      apiResults[path] = { status: result.status, count, fields, sampleItem: firstItem || null };
    } catch (e) {
      console.log(`  [API ERROR] ${path}:`, e.message.slice(0, 80));
      apiResults[path] = { error: e.message };
    }
  }
  report.adminAPIResults = apiResults;
}

// ── Learner Login ─────────────────────────────────────────────────────────────

async function learnerLogin(page) {
  log('LEARNER LOGIN');
  await setupLearnerMocks(page);

  await page.goto(`${LEARNER_URL}/login`, { waitUntil: 'domcontentloaded' });
  await waitFor(2000);
  await ss(page, 'L01-login-page');

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await emailInput.fill(LEARNER_USER).catch(() => {});

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(LEARNER_PASS).catch(() => {});

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => {});
  await waitFor(600);
  await ss(page, 'L02-login-filled');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in")').first();
  await submitBtn.click();
  await waitFor(6000);

  const url = page.url();
  log('LEARNER LOGIN', 'Post-submit URL:', url);

  if (url.includes('/login')) {
    log('LEARNER LOGIN', 'FAILED — still on login');
    const errors = await getText(page, '[role="alert"], [class*="error"]');
    log('LEARNER LOGIN', 'Errors:', errors);
    await ss(page, 'L01b-login-fail');
    return false;
  }

  log('LEARNER LOGIN', 'SUCCESS →', url);
  await ss(page, 'L03-post-login');
  return true;
}

// ── Learner: Dashboard ────────────────────────────────────────────────────────

async function learnerDashboard(page) {
  log('LEARNER DASHBOARD');
  const info = await pageInfo(page);
  report.learnerDashboardURL = info.url;

  await ss(page, 'L04-dashboard');

  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  log('LEARNER DASHBOARD', 'H1:', h1, 'H2:', h2);
  report.learnerDashboardH1 = h1;

  // Nav links
  const navLinks = await page.locator('nav a, header a, [class*="sidebar" i] a').all();
  const navData = [];
  for (const link of navLinks) {
    const text = (await link.textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
    const href = await link.getAttribute('href').catch(() => '');
    if (text) navData.push({ text, href });
  }
  log('LEARNER DASHBOARD', 'Nav links:', navData);
  report.learnerNavLinks = navData;

  const cohortLinks = navData.filter(n => /cohort/i.test(n.text));
  log('LEARNER DASHBOARD', 'Cohort nav:', cohortLinks);
  report.learnerCohortNavLinks = cohortLinks;
}

// ── Learner: Community ────────────────────────────────────────────────────────

async function learnerCommunity(page) {
  log('LEARNER COMMUNITY');

  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'domcontentloaded' });
  await waitFor(2000);
  const communityURL = page.url();
  report.learnerCommunityURL = communityURL;

  if (communityURL.includes('/login')) {
    log('LEARNER COMMUNITY', 'Redirected to login');
    return;
  }

  await ss(page, 'L05-community');
  const info = await pageInfo(page);

  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  const tabs = await getText(page, '[role="tab"]');
  log('LEARNER COMMUNITY', 'H1:', h1, 'H2:', h2);
  log('LEARNER COMMUNITY', 'Tabs:', tabs);
  report.learnerCommunityH1 = h1;
  report.learnerCommunityH2 = h2;
  report.learnerCommunityTabs = tabs;

  const mainText = await page.locator('main').textContent().catch(() => '');
  const textLines = (mainText || '').split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 300).slice(0, 20);
  log('LEARNER COMMUNITY', 'Main content:', textLines);
  report.learnerCommunityMainText = textLines;

  // Open each tab and screenshot
  const tabEls = await page.locator('[role="tab"]').all();
  log('LEARNER COMMUNITY', `Tabs to click: ${tabEls.length}`);
  for (let i = 0; i < tabEls.length; i++) {
    const tabText = (await tabEls[i].textContent().catch(() => '')).trim();
    if (!tabText) continue;
    await tabEls[i].click();
    await waitFor(1000);
    const slug = tabText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await ss(page, `L05t-community-tab-${i}-${slug}`);
    const tabContent = await page.locator('[role="tabpanel"]').textContent().catch(() => '');
    const tabLines = (tabContent || '').split('\n').map(l => l.trim()).filter(l => l.length > 5).slice(0, 10);
    log('LEARNER COMMUNITY', `Tab "${tabText}":`, tabLines);
    report[`learnerCommunityTab_${slug}`] = { tabText, lines: tabLines };
  }
}

// ── Learner: Cohort Routes ────────────────────────────────────────────────────

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

  const results = {};
  for (const route of routes) {
    await page.goto(`${LEARNER_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await waitFor(1500);
    const url = page.url();
    const slug = route.replace(/\//g, '_').replace(/^_/, '');
    await ss(page, `L06-${slug}`);

    const headings = await getText(page, 'h1, h2, h3');
    const is404 = await page.locator('text=/404|page not found|not found/i').isVisible().catch(() => false);
    const isLoginRedirect = url.includes('/login');
    const isRedirected = url !== `${LEARNER_URL}${route}`;
    const mainText = await page.locator('main').textContent().catch(() => '');
    const relevantLines = (mainText || '').split('\n').map(l => l.trim()).filter(l => l.length > 5).slice(0, 10);

    log('LEARNER ROUTE', `${route} → ${url}`);
    log('LEARNER ROUTE', `  headings: ${headings.join(', ')}`);
    log('LEARNER ROUTE', `  redirected=${isRedirected} loginRedirect=${isLoginRedirect} 404=${is404}`);

    results[route] = {
      actualURL: url,
      headings,
      is404,
      isLoginRedirect,
      isRedirected,
      hasOwnPage: !isLoginRedirect && !is404,
      contentLines: relevantLines,
    };
  }
  report.learnerCohortRoutes = results;
}

// ── Learner: My Courses ───────────────────────────────────────────────────────

async function learnerMyCourses(page) {
  log('LEARNER MY COURSES');

  for (const p of ['/my-courses', '/courses', '/learn', '/home']) {
    await page.goto(`${LEARNER_URL}${p}`, { waitUntil: 'domcontentloaded' });
    await waitFor(2000);
    const url = page.url();
    if (url.includes('/login')) continue;

    await ss(page, `L07-my-courses`);
    const h1 = await getText(page, 'h1');
    log('LEARNER MY COURSES', `${p}: h1=${h1}, url=${url}`);
    report.learnerMyCoursesURL = url;
    report.learnerMyCoursesH1 = h1;

    // Course cards
    const cardCount = await page.locator('[class*="CourseCard" i], [class*="course-card" i], [class*="course-tile" i]').count();
    log('LEARNER MY COURSES', `Cards: ${cardCount}`);
    report.learnerMyCoursesCardCount = cardCount;

    // Look for cohort chips
    const chips = await getText(page, '[class*="chip" i], [class*="badge" i]');
    const cohortChips = chips.filter(c => /cohort/i.test(c));
    log('LEARNER MY COURSES', 'Cohort chips:', cohortChips);
    report.learnerMyCoursesCohortChips = cohortChips;

    // Any cohort-related text
    const bodyText = await page.locator('body').textContent().catch(() => '');
    const cohortLines = (bodyText || '').split('\n').map(l => l.trim()).filter(l => l.toLowerCase().includes('cohort') && l.length > 5 && l.length < 200);
    log('LEARNER MY COURSES', 'Cohort text:', cohortLines.slice(0, 5));
    report.learnerMyCoursesCohortText = cohortLines.slice(0, 5);
    break;
  }
}

// ── Learner: Lesson Player ────────────────────────────────────────────────────

async function learnerLessonPlayer(page) {
  log('LEARNER LESSON PLAYER');

  const paths = [
    '/learn/course-to-yap/new-pdf-lesson',
    '/learn/course-to-yap',
  ];

  for (const p of paths) {
    await page.goto(`${LEARNER_URL}${p}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await waitFor(2000);
    const url = page.url();
    const is404 = await page.locator('text=/404|not found|isn.t available/i').isVisible().catch(() => false);

    if (!url.includes('/login') && !is404) {
      await ss(page, 'L09-lesson-player');
      await pageInfo(page);

      const tabs = await getText(page, '[role="tab"]');
      log('LEARNER LESSON', 'Player tabs:', tabs);
      report.learnerLessonPlayerTabs = tabs;

      const hasCohortTab = tabs.some(t => /cohort/i.test(t));
      log('LEARNER LESSON', 'Has Cohort tab:', hasCohortTab);
      report.learnerLessonHasCohortTab = hasCohortTab;

      if (hasCohortTab) {
        const cohortTab = page.locator('[role="tab"]:has-text("Cohort")').first();
        await cohortTab.click();
        await waitFor(1000);
        await ss(page, 'L09b-lesson-cohort-tab');
        const content = await page.locator('[role="tabpanel"]').textContent().catch(() => '');
        const lines = (content || '').split('\n').map(l => l.trim()).filter(l => l.length > 5).slice(0, 10);
        log('LEARNER LESSON', 'Cohort tab content:', lines);
        report.learnerLessonCohortTabContent = lines;
      }
      break;
    }
  }
}

// ── Learner: Notifications & Profile ─────────────────────────────────────────

async function learnerExtras(page) {
  log('LEARNER EXTRAS');

  // Notifications
  await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded' });
  await waitFor(1500);
  const bell = page.locator('[aria-label*="notification" i], button[aria-label*="notif" i]').first();
  if (await bell.isVisible()) {
    await bell.click();
    await waitFor(800);
    await ss(page, 'L10-notifications');
    const items = await getText(page, '[class*="notification" i] li, [role="listitem"]');
    log('LEARNER EXTRAS', 'Notifications:', items.slice(0, 5));
    report.learnerNotifications = items.slice(0, 10);
    await page.keyboard.press('Escape');
  } else {
    log('LEARNER EXTRAS', 'Bell not found');
    report.learnerNotificationBell = false;
  }

  // Profile
  await page.goto(`${LEARNER_URL}/profile`, { waitUntil: 'domcontentloaded' });
  await waitFor(1500);
  if (!page.url().includes('/login')) {
    await ss(page, 'L11-profile');
    const h1 = await getText(page, 'h1');
    log('LEARNER EXTRAS', 'Profile h1:', h1);
    report.learnerProfileURL = page.url();
  }

  // Account settings
  await page.goto(`${LEARNER_URL}/account`, { waitUntil: 'domcontentloaded' });
  await waitFor(1500);
  if (!page.url().includes('/login')) {
    await ss(page, 'L12-account');
  }

  // Try notifications page
  await page.goto(`${LEARNER_URL}/notifications`, { waitUntil: 'domcontentloaded' });
  await waitFor(1500);
  if (!page.url().includes('/login')) {
    await ss(page, 'L13-notifications-page');
    const h1 = await getText(page, 'h1');
    log('LEARNER EXTRAS', 'Notifications page h1:', h1);
    report.learnerNotificationsPageURL = page.url();
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '▓'.repeat(55));
  console.log('  COHORTS COMPREHENSIVE RECHECK — FINAL');
  console.log('  Screenshots → ' + SS);
  console.log('▓'.repeat(55));

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  // ═══════════════════ ADMIN ═══════════════════
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║              ADMIN PORTAL                    ║');
  console.log('╚══════════════════════════════════════════════╝');

  const adminCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const adminPage = await adminCtx.newPage();

  try {
    const loggedIn = await adminLogin(adminPage);
    report.adminLoggedIn = loggedIn;

    if (loggedIn) {
      await adminSidebar(adminPage);
      await adminCohortsPage(adminPage);
      await adminCohortDetail(adminPage);
      await adminFlagsTab(adminPage);
      await adminCourseSettings(adminPage);
      await adminAPIExploration(adminPage);
    } else {
      log('ADMIN', 'LOGIN FAILED — skipping all admin exploration');
    }
  } catch (e) {
    console.error('[ADMIN FATAL]', e.message.slice(0, 200));
    console.error(e.stack?.slice(0, 500));
    await ss(adminPage, 'FATAL-admin').catch(() => {});
    report.adminFatalError = e.message;
  }

  await adminCtx.close();

  // ═══════════════════ LEARNER ═══════════════════
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║             LEARNER PORTAL                   ║');
  console.log('╚══════════════════════════════════════════════╝');

  const learnerCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const learnerPage = await learnerCtx.newPage();

  try {
    const loggedIn = await learnerLogin(learnerPage);
    report.learnerLoggedIn = loggedIn;

    if (loggedIn) {
      await learnerDashboard(learnerPage);
      await learnerCommunity(learnerPage);
      await learnerCohortRoutes(learnerPage);
      await learnerMyCourses(learnerPage);
      await learnerLessonPlayer(learnerPage);
      await learnerExtras(learnerPage);
    } else {
      log('LEARNER', 'LOGIN FAILED — skipping all learner exploration');
    }
  } catch (e) {
    console.error('[LEARNER FATAL]', e.message.slice(0, 200));
    await ss(learnerPage, 'FATAL-learner').catch(() => {});
    report.learnerFatalError = e.message;
  }

  await learnerCtx.close();
  await browser.close();

  // ═══════════════════ REPORT ═══════════════════
  report.apiCallLog = apiCallLog;

  console.log('\n' + '▓'.repeat(55));
  console.log('  FINAL REPORT');
  console.log('▓'.repeat(55));
  console.log(JSON.stringify(report, null, 2));

  const reportPath = path.join(SS, 'recheck-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  const screenshots = fs.readdirSync(SS).filter(f => f.endsWith('.png')).sort();
  console.log(`\nScreenshots (${screenshots.length}):`, screenshots.join(', '));
  console.log('Report saved to:', reportPath);
}

main().catch(e => {
  console.error('UNHANDLED:', e);
  process.exit(1);
});
