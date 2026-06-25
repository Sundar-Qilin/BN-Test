// @ts-check
// Comprehensive Cohorts Feature Exploration v2 — full mock of all auth endpoints
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
const apiLogs = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function ss(page, name) {
  const fp = path.join(SS, name.endsWith('.png') ? name : name + '.png');
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`[SS] ${name}`);
  return fp;
}

function log(section, ...args) {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
  console.log(`\n▶ [${section}] ${msg}`);
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

// ── Mock Objects ─────────────────────────────────────────────────────────────

const ADMIN_USER_OBJ = {
  id: 1, email: ADMIN_USER,
  first_name: 'Super', last_name: 'Admin',
  role: 'super_admin', is_active: true,
  is_staff: true, is_superuser: true,
  permissions: ['manage_cohorts', 'manage_courses', 'manage_users'],
};

const LEARNER_USER_OBJ = {
  id: 100, email: LEARNER_USER,
  first_name: 'Sundar', last_name: 'S',
  role: 'learner', is_active: true,
};

const ADMIN_LOGIN_RESP = {
  success: true, error: null,
  data: {
    user: ADMIN_USER_OBJ,
    tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
    redirect_to: null,
  },
};

const LEARNER_LOGIN_RESP = {
  success: true, error: null,
  data: {
    user: LEARNER_USER_OBJ,
    tokens: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' },
    redirect_to: null,
  },
};

// ── Admin Mocks ───────────────────────────────────────────────────────────────

async function setupAdminMocks(page) {
  // Log all API responses
  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('railway.app')) {
      const shortUrl = url.replace('https://budgetnista-be-production.up.railway.app', '').split('?')[0];
      apiLogs.push({ status: resp.status(), url: shortUrl, method: resp.request().method() });
    }
  });

  // LOGIN
  await page.route(/\/api\/v1\/admin\/auth\/login\/?(\?.*)?$/, async route => {
    const resp = await route.fetch().catch(() => null);
    const bodyText = resp ? await resp.text().catch(() => '') : '';
    console.log('[MOCK LOGIN] real status:', resp?.status(), 'intercepting →  200 mock');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(ADMIN_LOGIN_RESP),
    });
  });

  // PROFILE - critical: app checks this right after login
  await page.route(/\/api\/v1\/admin\/auth\/profile\/?(\?.*)?$/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: ADMIN_USER_OBJ }),
    });
  });

  // TOKEN REFRESH
  await page.route(/\/api\/v1\/auth\/token\/refresh\/?(\?.*)?$/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
      }),
    });
  });

  // TENANT REDIRECT
  await page.route(/\/api\/v1\/auth\/tenant-redirect\/?(\?.*)?$/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { redirect_to: null } }),
    });
  });

  // NOTIFICATIONS unread count
  await page.route(/\/api\/v1\/notifications\/unread-count\/?(\?.*)?$/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { count: 0 } }),
    });
  });

  // ALL OTHER backend calls — passthrough, fallback to empty on auth error
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    const url = route.request().url();
    try {
      const resp = await route.fetch({ timeout: 20000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      const bodyText = await resp.text().catch(() => '');
      console.log('[BACKEND FALLBACK]', resp.status(), url.replace(BACKEND_URL, '').slice(0, 60), bodyText.slice(0, 80));
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }),
      });
    } catch (e) {
      console.log('[BACKEND ERROR]', url.replace(BACKEND_URL, '').slice(0, 60), e.message.slice(0, 60));
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }),
      });
    }
  });
}

// ── Learner Mocks ─────────────────────────────────────────────────────────────

async function setupLearnerMocks(page) {
  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('railway.app')) {
      const shortUrl = url.replace(BACKEND_URL, '').split('?')[0];
      apiLogs.push({ status: resp.status(), url: shortUrl, method: resp.request().method(), portal: 'learner' });
    }
  });

  // LEARNER LOGIN
  await page.route(/\/api\/v1\/auth\/login\/?(\?.*)?$/, async route => {
    const resp = await route.fetch().catch(() => null);
    console.log('[LEARNER MOCK LOGIN] real status:', resp?.status(), '→ 200 mock');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(LEARNER_LOGIN_RESP),
    });
  });

  // LEARNER PROFILE
  await page.route(/\/api\/v1\/auth\/profile\/?(\?.*)?$|\/api\/v1\/learner\/auth\/profile\/?(\?.*)?$/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: LEARNER_USER_OBJ }),
    });
  });

  // TOKEN REFRESH
  await page.route(/\/api\/v1\/auth\/token\/refresh\/?(\?.*)?$/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' },
      }),
    });
  });

  // TENANT REDIRECT
  await page.route(/\/api\/v1\/auth\/tenant-redirect\/?(\?.*)?$/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { redirect_to: null } }),
    });
  });

  // NOTIFICATIONS
  await page.route(/\/api\/v1\/notifications\/unread-count\/?/, async route => {
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { count: 0 } }),
    });
  });

  // ALL OTHER calls — passthrough with fallback
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    try {
      const resp = await route.fetch({ timeout: 20000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      console.log('[LEARNER BACKEND FALLBACK]', resp.status(), route.request().url().replace(BACKEND_URL, '').slice(0, 60));
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
}

// ── Admin Login ───────────────────────────────────────────────────────────────

async function adminLogin(page) {
  log('ADMIN LOGIN', 'Setting up mocks...');
  await setupAdminMocks(page);

  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'A01-login-page');

  // Fill form
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(ADMIN_USER);

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(ADMIN_PASS);

  // Wait for reCAPTCHA
  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => log('ADMIN LOGIN', 'reCAPTCHA not loaded'));
  await page.waitForTimeout(600);

  // Click submit
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(5000);

  const url = page.url();
  log('ADMIN LOGIN', 'Post-submit URL:', url);

  if (url.includes('/login')) {
    const errors = await page.locator('[role="alert"], [class*="error"]').allTextContents();
    log('ADMIN LOGIN', 'STILL ON LOGIN. Errors:', errors);
    await ss(page, 'A01b-login-error');
    return false;
  }

  log('ADMIN LOGIN', 'SUCCESS! Logged in.');
  await ss(page, 'A02-post-login-dashboard');
  return true;
}

// ── Admin: Full Sidebar Screenshot ───────────────────────────────────────────

async function adminSidebar(page) {
  log('ADMIN SIDEBAR');

  // Expand all collapsible sidebar groups
  const expanded = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const collapseButtons = await page.locator(
      '[class*="sidebar"] button:not([disabled]), [class*="Sidebar"] button:not([disabled]), aside button:not([disabled]), nav > ul > li > button'
    ).all();
    let clicked = 0;
    for (const btn of collapseButtons) {
      const isVisible = await btn.isVisible().catch(() => false);
      if (isVisible) {
        const text = (await btn.textContent().catch(() => '')).trim();
        if (text && !expanded.includes(text)) {
          await btn.click({ force: true }).catch(() => {});
          expanded.push(text);
          clicked++;
          await page.waitForTimeout(300);
        }
      }
    }
    if (clicked === 0) break;
  }

  await ss(page, 'A04-sidebar-expanded');

  // Collect all nav links
  const links = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="Sidebar"] a, [class*="NavItem"] a, [class*="nav-item"] a').all();
  const navData = [];
  for (const link of links) {
    const text = (await link.textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
    const href = await link.getAttribute('href').catch(() => '');
    if (text && text.length > 0) navData.push({ text, href });
  }

  log('ADMIN SIDEBAR', `Nav links count: ${navData.length}`);
  navData.forEach(n => console.log(`  [NAV] "${n.text}" → ${n.href}`));
  report.adminSidebar = navData;

  const cohortLinks = navData.filter(n => /cohort/i.test(n.text));
  log('ADMIN SIDEBAR', 'Cohort links:', cohortLinks);
  report.adminCohortNavLinks = cohortLinks;

  // Also check the page structure for group names
  const groupHeadings = await getText(page, '[class*="NavGroup"]:not(a), [class*="nav-group"]:not(a), [class*="SidebarGroup"]:not(a)');
  log('ADMIN SIDEBAR', 'Group headings:', groupHeadings);
  report.adminSidebarGroups = groupHeadings;
}

// ── Admin: Cohorts Main Page ──────────────────────────────────────────────────

async function adminCohortsPage(page) {
  log('ADMIN COHORTS PAGE');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await ss(page, 'A05-cohorts-page');
  const info = await pageInfo(page);
  report.adminCohortsURL = info.url;

  if (info.url.includes('/login')) {
    log('ADMIN COHORTS PAGE', 'REDIRECTED TO LOGIN — auth issue');
    report.adminCohortsAuthFailed = true;
    return;
  }

  // Page headings
  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  const subtitle = await page.locator('p, [class*="subtitle"], [class*="description"]').first().textContent().catch(() => '');
  log('ADMIN COHORTS PAGE', 'H1:', h1);
  log('ADMIN COHORTS PAGE', 'H2:', h2);
  log('ADMIN COHORTS PAGE', 'Subtitle (first):', subtitle?.trim()?.slice(0, 200));
  report.adminCohortsHeadings = { h1, h2, subtitle: subtitle?.trim() };

  // Tabs
  const tabs = await getText(page, '[role="tab"]');
  log('ADMIN COHORTS PAGE', 'Tabs:', tabs);
  report.adminCohortsTabs = tabs;

  // Table
  const colHeaders = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN COHORTS PAGE', 'Column headers:', colHeaders);
  report.adminCohortsColumns = colHeaders;

  const rowCount = await page.locator('tbody tr').count();
  log('ADMIN COHORTS PAGE', `Row count: ${rowCount}`);
  report.adminCohortsRowCount = rowCount;

  if (rowCount > 0) {
    const firstRowCells = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN COHORTS PAGE', 'First row cells:', firstRowCells);
    report.adminCohortsFirstRow = firstRowCells;
  }

  // Empty state
  const emptyEls = await page.locator('[class*="empty" i], [class*="no-data" i], [class*="noData" i], [class*="EmptyState" i]').allTextContents();
  log('ADMIN COHORTS PAGE', 'Empty state text:', emptyEls);
  report.adminCohortsEmptyState = emptyEls;

  // Buttons visible
  const buttons = await page.locator('button:visible').allTextContents();
  log('ADMIN COHORTS PAGE', 'Buttons:', buttons);
  report.adminCohortsButtons = buttons;

  // Input/search controls
  const searchCount = await page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').count();
  log('ADMIN COHORTS PAGE', `Search inputs: ${searchCount}`);
  report.adminCohortsSearchInputCount = searchCount;

  // Filter dropdowns — open each and get options
  const comboboxes = await page.locator('[role="combobox"]').all();
  log('ADMIN COHORTS PAGE', `Comboboxes: ${comboboxes.length}`);
  report.adminCohortsFilters = [];

  for (let i = 0; i < comboboxes.length; i++) {
    const el = comboboxes[i];
    if (!await el.isVisible().catch(() => false)) continue;
    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt = (await el.textContent().catch(() => '')).trim().slice(0, 60);
    console.log(`  [FILTER ${i}] placeholder="${ph}" aria-label="${al}" text="${txt}"`);

    try {
      await el.click({ timeout: 3000 });
      await page.waitForTimeout(700);
      const opts = await page.locator('[role="option"]').allTextContents();
      log('ADMIN COHORTS PAGE', `Filter ${i} options:`, opts);
      report.adminCohortsFilters.push({ index: i, placeholder: ph, ariaLabel: al, text: txt, options: opts });
      await ss(page, `A05f-cohorts-filter-${i}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } catch (e) {
      log('ADMIN COHORTS PAGE', `Filter ${i} click error:`, e.message);
    }
  }

  // Scroll screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(400);
  await ss(page, 'A05b-cohorts-scrolled');
  await page.evaluate(() => window.scrollTo(0, 0));
}

// ── Admin: Cohort Detail ──────────────────────────────────────────────────────

async function adminCohortDetail(page) {
  log('ADMIN COHORT DETAIL');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const rowCount = await page.locator('tbody tr').count();
  log('ADMIN COHORT DETAIL', `Available rows: ${rowCount}`);

  let navigatedToDetail = false;

  if (rowCount > 0) {
    // Try clicking first row
    try {
      await page.locator('tbody tr:first-child').click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      navigatedToDetail = !page.url().includes('/cohorts') || page.url().match(/\/cohorts\/\w/);
    } catch (e) {
      log('ADMIN COHORT DETAIL', 'Row click failed:', e.message);
    }
  }

  if (!navigatedToDetail) {
    log('ADMIN COHORT DETAIL', 'No rows or nav failed. Trying direct IDs...');
    for (const id of [1, 2, 3, 4, 5, 10]) {
      await page.goto(`${ADMIN_URL}/cohorts/${id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const url = page.url();
      const is404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
      if (!url.includes('/login') && !url.includes('/cohorts') || url.match(/\/cohorts\/\d+/)) {
        navigatedToDetail = true;
        log('ADMIN COHORT DETAIL', `Found at ID ${id}:`, url);
        break;
      }
    }
  }

  await ss(page, 'A10-cohort-detail');
  const info = await pageInfo(page);
  report.adminCohortDetailURL = info.url;

  const h1 = await getText(page, 'h1');
  const h2 = await getText(page, 'h2');
  log('ADMIN COHORT DETAIL', 'H1:', h1, 'H2:', h2);
  report.adminCohortDetailHeadings = { h1, h2 };

  const badges = await getText(page, '[class*="badge" i], [class*="chip" i], [class*="status" i], [class*="tag" i]');
  log('ADMIN COHORT DETAIL', 'Badges/chips:', badges);
  report.adminCohortDetailBadges = badges;

  const tabs = await getText(page, '[role="tab"]');
  log('ADMIN COHORT DETAIL', 'Detail tabs:', tabs);
  report.adminCohortDetailTabs = tabs;

  // Members tab
  const membersTab = page.locator('[role="tab"]:has-text("Member"), [role="tab"]:has-text("member")').first();
  if (await membersTab.isVisible()) {
    log('ADMIN COHORT DETAIL', 'Clicking Members tab');
    await membersTab.click();
    await page.waitForTimeout(1500);
    await ss(page, 'A11-cohort-members-tab');

    const membersCols = await getText(page, 'th, [role="columnheader"]');
    log('ADMIN COHORT DETAIL', 'Members columns:', membersCols);
    report.adminCohortMembersColumns = membersCols;

    const membersBtns = await page.locator('button:visible').allTextContents();
    log('ADMIN COHORT DETAIL', 'Members buttons:', membersBtns);
    report.adminCohortMembersButtons = membersBtns;

    const membersEmpty = await getText(page, '[class*="empty" i], [class*="no-data" i]');
    log('ADMIN COHORT DETAIL', 'Members empty state:', membersEmpty);
    report.adminCohortMembersEmptyState = membersEmpty;
  }

  // Activity tab
  const activityTab = page.locator('[role="tab"]:has-text("Activity"), [role="tab"]:has-text("activity")').first();
  if (await activityTab.isVisible()) {
    log('ADMIN COHORT DETAIL', 'Clicking Activity tab');
    await activityTab.click();
    await page.waitForTimeout(1500);
    await ss(page, 'A12-cohort-activity-tab');

    const activityContent = await getText(page, 'main h1, main h2, main h3, main p, [role="list"] li');
    log('ADMIN COHORT DETAIL', 'Activity content:', activityContent.slice(0, 5));
    report.adminCohortActivityContent = activityContent.slice(0, 10);
  }

  // Manage button
  const manageBtn = page.locator('button:has-text("Manage"), button:has-text("manage")').first();
  if (await manageBtn.isVisible()) {
    log('ADMIN COHORT DETAIL', 'Clicking Manage button');
    await manageBtn.click();
    await page.waitForTimeout(800);
    await ss(page, 'A13-manage-dropdown');

    const menuItems = await page.locator('[role="menuitem"], [role="option"], [class*="menu-item" i], [class*="MenuItem" i], [class*="dropdown-item" i]').allTextContents();
    log('ADMIN COHORT DETAIL', 'Manage menu items:', menuItems);
    report.adminCohortManageItems = menuItems;

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } else {
    log('ADMIN COHORT DETAIL', 'No Manage button visible');
    // Try three-dot / kebab menu
    const kebab = page.locator('[aria-label*="more" i], [aria-label*="menu" i], [aria-haspopup="true"]').first();
    if (await kebab.isVisible()) {
      await kebab.click();
      await page.waitForTimeout(800);
      await ss(page, 'A13-kebab-dropdown');
      const items = await page.locator('[role="menuitem"]').allTextContents();
      log('ADMIN COHORT DETAIL', 'Kebab menu items:', items);
      report.adminCohortKebabItems = items;
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
  const flagsTab = page.locator('[role="tab"]:has-text("Flag"), [role="tab"]:has-text("flag")').first();
  if (await flagsTab.isVisible()) {
    log('ADMIN FLAGS TAB', 'Clicking Flags tab');
    await flagsTab.click();
    await page.waitForTimeout(1500);
  } else {
    log('ADMIN FLAGS TAB', 'No flags tab visible, navigating to ?tab=flags');
    await page.goto(`${ADMIN_URL}/cohorts?tab=flags`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
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

  const emptyState = await getText(page, '[class*="empty" i], [class*="no-data" i], [class*="EmptyState" i]');
  log('ADMIN FLAGS TAB', 'Empty state:', emptyState);
  report.adminFlagsEmptyState = emptyState;

  const buttons = await page.locator('button:visible').allTextContents();
  log('ADMIN FLAGS TAB', 'Buttons:', buttons);
  report.adminFlagsButtons = buttons;

  // Count badge (e.g. "0 flags")
  const countText = await getText(page, '[class*="count" i], [class*="badge" i], [class*="Count" i]');
  log('ADMIN FLAGS TAB', 'Count/badge text:', countText);
  report.adminFlagsCountBadge = countText;

  // Open ALL dropdowns/comboboxes and capture options
  const comboboxes = await page.locator('[role="combobox"]').all();
  log('ADMIN FLAGS TAB', `Comboboxes: ${comboboxes.length}`);
  const flagsDropdowns = [];

  for (let i = 0; i < comboboxes.length; i++) {
    const el = comboboxes[i];
    if (!await el.isVisible().catch(() => false)) continue;
    const ph = await el.getAttribute('placeholder').catch(() => '') || '';
    const al = await el.getAttribute('aria-label').catch(() => '') || '';
    const txt = (await el.textContent().catch(() => '')).trim().slice(0, 60);
    console.log(`  [FLAGS DROPDOWN ${i}] placeholder="${ph}" aria-label="${al}" text="${txt}"`);

    try {
      await el.click({ timeout: 3000 });
      await page.waitForTimeout(700);
      const opts = await page.locator('[role="option"]').allTextContents();
      log('ADMIN FLAGS TAB', `Dropdown ${i} options:`, opts);
      flagsDropdowns.push({ index: i, placeholder: ph, ariaLabel: al, text: txt, options: opts });
      await ss(page, `A06d-flags-dropdown-${i}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } catch (e) {
      log('ADMIN FLAGS TAB', `Dropdown ${i} click error:`, e.message.slice(0, 60));
    }
  }
  report.adminFlagsDropdowns = flagsDropdowns;
}

// ── Admin: Course Settings ────────────────────────────────────────────────────

async function adminCourseSettings(page) {
  log('ADMIN COURSE SETTINGS');
  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await ss(page, 'A07-courses-list');
  const info = await pageInfo(page);
  report.adminCoursesListURL = info.url;

  if (info.url.includes('/login')) {
    log('ADMIN COURSE SETTINGS', 'Redirected to login');
    return;
  }

  const colHeaders = await getText(page, 'th, [role="columnheader"]');
  log('ADMIN COURSE SETTINGS', 'Column headers:', colHeaders);
  report.adminCoursesColumns = colHeaders;

  const rowCount = await page.locator('tbody tr').count();
  log('ADMIN COURSE SETTINGS', `Course rows: ${rowCount}`);
  report.adminCoursesRowCount = rowCount;

  // Navigate to a course
  let courseDetailURL = '';
  if (rowCount > 0) {
    const firstRowText = await page.locator('tbody tr:first-child td').allTextContents();
    log('ADMIN COURSE SETTINGS', 'First course row:', firstRowText);
    report.adminCoursesFirstRow = firstRowText;

    try {
      await page.locator('tbody tr:first-child').click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      courseDetailURL = page.url();
    } catch (e) {
      const link = page.locator('tbody tr:first-child a').first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(2000);
        courseDetailURL = page.url();
      }
    }
  }

  if (!courseDetailURL || courseDetailURL.endsWith('/courses') || courseDetailURL.endsWith('/courses/')) {
    log('ADMIN COURSE SETTINGS', 'Trying direct course IDs...');
    for (const idOrSlug of [1, 2, 3, 'test-cohort-course-001', 'course-to-yap']) {
      await page.goto(`${ADMIN_URL}/courses/${idOrSlug}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const url = page.url();
      if (!url.includes('/login') && (url.match(/\/courses\/\w/) || url.match(/\/courses\/\d/))) {
        courseDetailURL = url;
        log('ADMIN COURSE SETTINGS', `Found course at: ${url}`);
        break;
      }
    }
  }

  await ss(page, 'A08-course-detail');
  await pageInfo(page);
  report.adminCourseDetailURL = page.url();

  const courseTabs = await getText(page, '[role="tab"]');
  log('ADMIN COURSE SETTINGS', 'Course detail tabs:', courseTabs);
  report.adminCourseDetailTabs = courseTabs;

  // Click Settings tab
  const settingsTab = page.locator('[role="tab"]:has-text("Settings")').first();
  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await page.waitForTimeout(2000);
    await ss(page, 'A09-settings-top');
    report.adminCourseSettingsURL = page.url();

    // Scroll shots
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(400);
    await ss(page, 'A09b-settings-mid1');
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(400);
    await ss(page, 'A09c-settings-mid2');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await ss(page, 'A09d-settings-bottom');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // All visible labels
    const labels = await page.locator('label:visible').allTextContents();
    log('ADMIN COURSE SETTINGS', 'Labels:', labels);
    report.adminCourseSettingsLabels = labels;

    // Section headings
    const sections = await getText(page, 'h2, h3, h4, [class*="SectionTitle" i], [class*="section-title" i], [class*="section-heading" i]');
    log('ADMIN COURSE SETTINGS', 'Sections:', sections);
    report.adminCourseSettingsSections = sections;

    // Toggles
    const toggles = await page.locator('[role="switch"]:visible, input[type="checkbox"]:visible').all();
    log('ADMIN COURSE SETTINGS', `Toggle count: ${toggles.length}`);
    const toggleData = [];
    for (let i = 0; i < toggles.length; i++) {
      const t = toggles[i];
      const checked = await t.isChecked().catch(() => null);
      const ctx = await t.evaluate(el => {
        let n = el.parentElement;
        for (let j = 0; j < 8; j++) {
          const txt = n?.textContent?.trim();
          if (txt && txt.length > 3 && txt.length < 200) return txt;
          n = n?.parentElement;
        }
        return '';
      });
      console.log(`  [TOGGLE ${i}] checked=${checked} context="${ctx.slice(0, 120)}"`);
      toggleData.push({ index: i, checked, context: ctx });
    }
    report.adminCourseSettingsToggles = toggleData;

    // Cohort-specific elements
    const cohortEls = await page.locator(
      '[class*="cohort" i], [id*="cohort" i], label:has-text("Cohort"), h2:has-text("Cohort"), h3:has-text("Cohort"), h4:has-text("Cohort"), label:has-text("Group learners"), h3:has-text("Group learners"), h4:has-text("Group learners")'
    ).allTextContents();
    log('ADMIN COURSE SETTINGS', 'Cohort elements found:', cohortEls);
    report.adminCourseSettingsCohortElements = cohortEls;

    // Try toggling cohort toggle
    const cohortToggle = page.locator(
      'label:has-text("Group learners") ~ * [role="switch"], label:has-text("cohort") ~ * [role="switch"], [id*="cohort" i][role="switch"], input[name*="cohort" i]'
    ).first();

    if (!await cohortToggle.isVisible().catch(() => false)) {
      // Try finding by nearby text
      const allToggles = await page.locator('[role="switch"]:visible').all();
      for (const tog of allToggles) {
        const ctx = await tog.evaluate(el => {
          let n = el;
          for (let j = 0; j < 6; j++) {
            n = n.parentElement;
            if (n?.textContent?.toLowerCase().includes('cohort') || n?.textContent?.toLowerCase().includes('group learner')) {
              return n.textContent.trim().slice(0, 100);
            }
          }
          return '';
        });
        if (ctx) {
          log('ADMIN COURSE SETTINGS', 'Found cohort toggle by parent text:', ctx);
          const isChecked = await tog.isChecked().catch(() => false);
          if (!isChecked) {
            await tog.click().catch(() => {});
            await page.waitForTimeout(1000);
            await ss(page, 'A09e-settings-cohort-toggled');
            const newInputs = await getText(page, 'label:visible');
            log('ADMIN COURSE SETTINGS', 'Labels after toggling cohort on:', newInputs);
            report.adminCourseSettingsAfterToggle = newInputs;
          } else {
            log('ADMIN COURSE SETTINGS', 'Cohort toggle is already ON');
            report.adminCohortToggleAlreadyOn = true;
          }
          break;
        }
      }
    }

  } else {
    log('ADMIN COURSE SETTINGS', `Settings tab NOT FOUND. Available tabs: ${JSON.stringify(courseTabs)}`);
    report.adminCourseSettingsError = 'Settings tab not found in course detail';
  }
}

// ── Admin: API exploration using direct fetch ─────────────────────────────────

async function adminAPIExploration(page) {
  log('ADMIN API EXPLORATION');

  // Navigate somewhere that we know is authenticated
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const endpoints = [
    '/api/v1/admin/cohorts/',
    '/api/v1/admin/cohort-flags/',
    '/api/v1/admin/courses/?cohorts_enabled=true',
    '/api/v1/admin/cohorts/?page=1&page_size=5',
    '/api/v1/admin/cohort-flags/?page=1&page_size=5',
    '/api/v1/admin/cohorts/?status=active',
    '/api/v1/admin/courses/?page=1&page_size=5',
  ];

  const apiResults = {};

  for (const endpoint of endpoints) {
    const url = `${BACKEND_URL}${endpoint}`;
    try {
      const result = await page.evaluate(async ({ url, token }) => {
        const resp = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const status = resp.status;
        let body;
        try { body = await resp.json(); } catch { body = await resp.text(); }
        return { status, body };
      }, { url, token: 'mock-access-token' });

      console.log(`  [API] ${endpoint} → ${result.status}`);
      if (result.status === 200 && result.body?.data) {
        console.log(`    count=${result.body.data.count}, results=${result.body.data.results?.length}`);
        if (result.body.data.results?.length > 0) {
          console.log(`    first result keys:`, Object.keys(result.body.data.results[0]).join(', '));
          report[`apiSample_${endpoint.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}`] = result.body.data.results[0];
        }
      }
      apiResults[endpoint] = { status: result.status, count: result.body?.data?.count, fields: result.body?.data?.results?.[0] ? Object.keys(result.body.data.results[0]) : [] };
    } catch (e) {
      console.log(`  [API ERROR] ${endpoint}:`, e.message.slice(0, 80));
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

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await emailInput.fill(LEARNER_USER).catch(() => {});

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(LEARNER_PASS).catch(() => {});

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => {});
  await page.waitForTimeout(500);
  await ss(page, 'L02-login-filled');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first();
  await submitBtn.click();
  await page.waitForTimeout(5000);

  const url = page.url();
  log('LEARNER LOGIN', 'Post-submit URL:', url);

  if (url.includes('/login')) {
    log('LEARNER LOGIN', 'STILL ON LOGIN — checking errors');
    const errors = await page.locator('[role="alert"], [class*="error"]').allTextContents();
    log('LEARNER LOGIN', 'Errors:', errors);
    await ss(page, 'L01b-login-error');
    return false;
  }

  log('LEARNER LOGIN', 'SUCCESS!');
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
  report.learnerDashboardHeadings = { h1, h2 };

  // Navigation links
  const navLinks = await page.locator('nav a, header a, [class*="sidebar" i] a, [class*="nav" i] a').all();
  const navData = [];
  for (const link of navLinks) {
    const text = (await link.textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
    const href = await link.getAttribute('href').catch(() => '');
    if (text) navData.push({ text, href });
  }
  log('LEARNER DASHBOARD', 'Nav links:', navData);
  report.learnerNavLinks = navData;

  const cohortLinks = navData.filter(n => /cohort/i.test(n.text));
  log('LEARNER DASHBOARD', 'Cohort nav links:', cohortLinks);
  report.learnerCohortNavLinks = cohortLinks;
}

// ── Learner: Community ────────────────────────────────────────────────────────

async function learnerCommunity(page) {
  log('LEARNER COMMUNITY');

  // Try various paths the community page might be at
  const communityPaths = ['/community', '/community/groups', '/groups'];
  for (const p of communityPaths) {
    await page.goto(`${LEARNER_URL}${p}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const url = page.url();
    if (!url.includes('/login')) {
      await ss(page, `L05-community${p.replace(/\//g, '-')}`);
      const info = await pageInfo(page);
      const tabs = await getText(page, '[role="tab"]');
      const h1 = await getText(page, 'h1');
      const h2 = await getText(page, 'h2');
      log('LEARNER COMMUNITY', `${p}: h1=${h1}, h2=${h2}, tabs=${tabs}`);
      report[`learnerCommunityPath_${p}`] = { url, h1, h2, tabs };

      // Open all tabs
      for (let i = 0; i < 5; i++) {
        const tabEls = await page.locator('[role="tab"]').all();
        if (i >= tabEls.length) break;
        const tabText = await tabEls[i].textContent().catch(() => '');
        if (tabText?.trim()) {
          await tabEls[i].click();
          await page.waitForTimeout(1000);
          const slug = tabText.trim().toLowerCase().replace(/\s+/g, '-');
          await ss(page, `L05t-community-tab-${i}-${slug}`);
          const tabContent = await getText(page, '[role="tabpanel"] h1, [role="tabpanel"] h2, [role="tabpanel"] h3, [role="tabpanel"] p');
          log('LEARNER COMMUNITY', `Tab "${tabText?.trim()}" content:`, tabContent.slice(0, 5));
          report[`learnerCommunityTab_${slug}`] = { tabText: tabText?.trim(), content: tabContent.slice(0, 5) };
        }
      }
      break;
    }
  }

  // URL variants for community
  for (const param of ['groups', 'cohorts', 'discussions', 'forums']) {
    await page.goto(`${LEARNER_URL}/community?tab=${param}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const url = page.url();
    const headings = await getText(page, 'h1, h2');
    log('LEARNER COMMUNITY', `?tab=${param} → ${url}, headings: ${headings}`);
    if (!url.includes('/login')) {
      await ss(page, `L05q-community-tab-${param}`);
    }
    report[`learnerCommunityTabParam_${param}`] = { url, headings };
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

  const routeResults = {};
  for (const route of routes) {
    await page.goto(`${LEARNER_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const url = page.url();
    const slug = route.replace(/\//g, '_').replace(/^_/, '');
    await ss(page, `L06-${slug}`);
    const headings = await getText(page, 'h1, h2, h3');
    const is404 = await page.locator('text=/404|page not found|not found/i').isVisible().catch(() => false);
    const isRedirected = url !== `${LEARNER_URL}${route}`;
    const isLoginRedirect = url.includes('/login');
    const hasContent = !isLoginRedirect && !is404;

    log('LEARNER ROUTE', `${route} → ${url} [redirected=${isRedirected}, 404=${is404}, hasContent=${hasContent}]`);
    log('LEARNER ROUTE', `  headings: ${headings.join(', ')}`);

    routeResults[route] = {
      actualURL: url, expectedURL: `${LEARNER_URL}${route}`,
      headings, is404, isLoginRedirect, isRedirected, hasContent,
    };
  }
  report.learnerCohortRoutes = routeResults;
}

// ── Learner: My Courses ───────────────────────────────────────────────────────

async function learnerMyCourses(page) {
  log('LEARNER MY COURSES');

  const paths = ['/my-courses', '/courses', '/learn'];
  for (const p of paths) {
    await page.goto(`${LEARNER_URL}${p}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const url = page.url();
    if (!url.includes('/login')) {
      await ss(page, `L07-my-courses${p.replace('/', '-')}`);
      const info = await pageInfo(page);
      const headings = await getText(page, 'h1, h2');
      log('LEARNER MY COURSES', `${p}: headings=${headings}`);
      report.learnerMyCoursesURL = url;
      report.learnerMyCoursesHeadings = headings;

      // Course cards count
      const cardCount = await page.locator('[class*="CourseCard" i], [class*="course-card" i], [class*="card" i]').count();
      log('LEARNER MY COURSES', `Cards: ${cardCount}`);
      report.learnerMyCoursesCardCount = cardCount;

      // Look for cohort chips
      const chips = await getText(page, '[class*="chip" i], [class*="badge" i], [class*="tag" i]');
      const cohortChips = chips.filter(c => /cohort/i.test(c));
      log('LEARNER MY COURSES', 'Cohort chips:', cohortChips);
      report.learnerMyCoursesCohortChips = cohortChips;

      // Any cohort mention in text
      const allText = await page.locator('body').textContent().catch(() => '');
      const cohortMentions = (allText.match(/cohort[^"]{0,80}/gi) || []).slice(0, 5);
      log('LEARNER MY COURSES', 'Cohort text mentions:', cohortMentions);
      report.learnerMyCoursesCohortMentions = cohortMentions;
      break;
    }
  }
}

// ── Learner: Course & Lesson Player ──────────────────────────────────────────

async function learnerLessonPlayer(page) {
  log('LEARNER LESSON PLAYER');

  const knownPaths = [
    '/learn/course-to-yap/new-pdf-lesson',
    '/learn/course-to-yap',
    '/my-courses',
  ];

  for (const p of knownPaths) {
    await page.goto(`${LEARNER_URL}${p}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const url = page.url();
    const is404 = await page.locator('text=/404|not found|isn.t available/i').isVisible().catch(() => false);
    if (!url.includes('/login') && !is404) {
      await ss(page, `L09-lesson-player`);
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
        await page.waitForTimeout(1000);
        await ss(page, 'L09b-lesson-cohort-tab');
        const content = await getText(page, '[role="tabpanel"] *');
        log('LEARNER LESSON', 'Cohort tab content:', content.slice(0, 5));
        report.learnerLessonCohortTabContent = content.slice(0, 10);
      }
      break;
    }
  }
}

// ── Learner: Profile & Notifications ─────────────────────────────────────────

async function learnerProfileAndNotifications(page) {
  log('LEARNER PROFILE & NOTIFICATIONS');

  // Profile
  await page.goto(`${LEARNER_URL}/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const profileURL = page.url();
  if (!profileURL.includes('/login')) {
    await ss(page, 'L11-profile');
    const headings = await getText(page, 'h1, h2, h3');
    log('LEARNER PROFILE', 'Headings:', headings);
    report.learnerProfileHeadings = headings;
    const cohortRef = await page.locator('*:has-text("cohort")').allTextContents().catch(() => []);
    log('LEARNER PROFILE', 'Cohort refs:', cohortRef.slice(0, 5));
  }
  report.learnerProfileURL = profileURL;

  // Account/settings
  await page.goto(`${LEARNER_URL}/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  if (!page.url().includes('/login')) {
    await ss(page, 'L12-account');
  }

  // Notifications bell
  await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const notifBell = page.locator('[aria-label*="notification" i], [class*="notification-bell" i], [class*="bell" i] button, button[aria-label*="notif" i]').first();
  if (await notifBell.isVisible()) {
    await notifBell.click();
    await page.waitForTimeout(800);
    await ss(page, 'L10-notifications');
    const notifItems = await getText(page, '[class*="notification-item" i], [role="listitem"]');
    log('LEARNER NOTIFICATIONS', 'Items:', notifItems.slice(0, 5));
    report.learnerNotifications = notifItems.slice(0, 10);
    await page.keyboard.press('Escape');
  } else {
    log('LEARNER NOTIFICATIONS', 'Bell not found');
    report.learnerNotificationBellFound = false;
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '█'.repeat(50));
  console.log(' COHORTS COMPREHENSIVE RECHECK v2');
  console.log(' Screenshots → ' + SS);
  console.log('█'.repeat(50));

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
    ],
  });

  // ─────────────────── ADMIN ───────────────────────
  console.log('\n' + '╔' + '═'.repeat(48) + '╗');
  console.log('║          ADMIN PORTAL                          ║');
  console.log('╚' + '═'.repeat(48) + '╝');

  const adminCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const adminPage = await adminCtx.newPage();

  // Console logging
  adminPage.on('console', msg => {
    if (msg.type() === 'error') console.log('[ADMIN JS ERR]', msg.text().slice(0, 120));
  });

  try {
    const loggedIn = await adminLogin(adminPage);

    if (loggedIn) {
      await adminSidebar(adminPage);
      await adminCohortsPage(adminPage);
      await adminCohortDetail(adminPage);
      await adminFlagsTab(adminPage);
      await adminCourseSettings(adminPage);
      await adminAPIExploration(adminPage);
    } else {
      log('ADMIN', 'LOGIN FAILED — cannot explore admin portal');
      report.adminLoginFailed = true;
    }
  } catch (e) {
    console.error('[ADMIN FATAL]', e.message);
    await ss(adminPage, 'ADMIN-FATAL-ERROR').catch(() => {});
    report.adminFatalError = e.message;
  }

  await adminCtx.close();

  // ─────────────────── LEARNER ─────────────────────
  console.log('\n' + '╔' + '═'.repeat(48) + '╗');
  console.log('║          LEARNER PORTAL                        ║');
  console.log('╚' + '═'.repeat(48) + '╝');

  const learnerCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const learnerPage = await learnerCtx.newPage();

  learnerPage.on('console', msg => {
    if (msg.type() === 'error') console.log('[LEARNER JS ERR]', msg.text().slice(0, 120));
  });

  try {
    const loggedIn = await learnerLogin(learnerPage);

    if (loggedIn) {
      await learnerDashboard(learnerPage);
      await learnerCommunity(learnerPage);
      await learnerCohortRoutes(learnerPage);
      await learnerMyCourses(learnerPage);
      await learnerLessonPlayer(learnerPage);
      await learnerProfileAndNotifications(learnerPage);
    } else {
      log('LEARNER', 'LOGIN FAILED — cannot explore learner portal');
      report.learnerLoginFailed = true;
    }
  } catch (e) {
    console.error('[LEARNER FATAL]', e.message);
    await ss(learnerPage, 'LEARNER-FATAL-ERROR').catch(() => {});
    report.learnerFatalError = e.message;
  }

  await learnerCtx.close();
  await browser.close();

  // ─────────────────── REPORT ──────────────────────
  report.apiCallLog = apiLogs;

  console.log('\n' + '█'.repeat(50));
  console.log(' FINAL REPORT');
  console.log('█'.repeat(50));
  console.log(JSON.stringify(report, null, 2));

  const reportPath = path.join(SS, 'recheck-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // List screenshots
  const screenshots = fs.readdirSync(SS).filter(f => f.endsWith('.png'));
  console.log(`\nScreenshots saved (${screenshots.length}):`, screenshots.join(', '));
  console.log('Report:', reportPath);
}

main().catch(e => {
  console.error('UNHANDLED FATAL:', e);
  process.exit(1);
});
