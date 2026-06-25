/**
 * Definitive Cohorts Exploration Script
 *
 * Strategy:
 * 1. Register ALL route intercepts ONCE before any navigation (persistent throughout session)
 * 2. After login, inject token directly into localStorage so app reads it on every page load
 * 3. Use page.goto() for all navigation — no SPA clicks
 * 4. Capture screenshots of every Cohorts-related page
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const LEARNER_URL = 'https://learner.dev.budgetnista.qilinlab.com';
const SS_DIR = 'C:\\BN Test\\screenshots\\recheck';

// Ensure screenshot directory exists
fs.mkdirSync(SS_DIR, { recursive: true });

const ADMIN_MOCK_TOKEN = 'mock-access-token-admin-v2';
const ADMIN_REFRESH_TOKEN = 'mock-refresh-token-admin-v2';
const LEARNER_MOCK_TOKEN = 'learner-mock-access-token-v2';
const LEARNER_REFRESH_TOKEN = 'learner-mock-refresh-token-v2';

const ADMIN_PROFILE = {
  success: true, error: null,
  data: {
    user: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Super', last_name: 'Admin',
      role: 'super_admin', is_active: true, is_email_verified: true,
      permissions: [], groups: [] },
    tokens: { access: ADMIN_MOCK_TOKEN, refresh: ADMIN_REFRESH_TOKEN }
  }
};

const LEARNER_PROFILE = {
  success: true, error: null,
  data: {
    user: { id: 100, email: 'sundar@qilinlab.com', first_name: 'Sundar', last_name: 'S',
      role: 'learner', is_active: true, is_email_verified: true,
      email_verified: true, verified: true }
  }
};

const TENANT_REDIRECT = { success: true, error: null, data: { redirect_url: null, tenant: null } };
const NOTIFS_EMPTY = { success: true, error: null, data: { count: 0, unread_count: 0, results: [] } };
const EMPTY_PAGINATED = { success: true, error: null, data: { results: [], count: 0, next: null, previous: null } };

function ss(page, name) {
  const p = path.join(SS_DIR, `${name}.png`);
  console.log(`[SS] ${name}`);
  return page.screenshot({ path: p, fullPage: false });
}

/**
 * Register all persistent intercepts for admin portal.
 * IMPORTANT: catch-all FIRST (lowest LIFO priority), specifics LAST (highest LIFO priority)
 */
async function setupAdminMocks(page) {
  // 1. Catch-all backend fallback (lowest priority - registered first)
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    const url = route.request().url();
    try {
      const resp = await route.fetch({ timeout: 15000 });
      if (resp.ok()) {
        console.log(`[ADMIN PASSTHROUGH OK] ${route.request().method()} ${url}`);
        return route.fulfill({ response: resp });
      }
      console.log(`[ADMIN FALLBACK] ${route.request().method()} ${url} → 200 empty`);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_PAGINATED) });
    } catch (e) {
      console.log(`[ADMIN FALLBACK ERR] ${url}: ${e.message}`);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_PAGINATED) });
    }
  });

  // 2. Specific mocks (higher priority due to LIFO - registered after catch-all)
  await page.route(/\/api\/v1\/notifications\//, route => {
    console.log(`[MOCK] notifications → empty`);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NOTIFS_EMPTY) });
  });

  await page.route(/\/api\/v1\/auth\/tenant-redirect\//, route => {
    console.log(`[MOCK] tenant-redirect → null`);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TENANT_REDIRECT) });
  });

  await page.route(/\/api\/v1\/auth\/token\/refresh\//, route => {
    console.log(`[MOCK] token/refresh → admin tokens`);
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null,
        data: { access: ADMIN_MOCK_TOKEN, refresh: ADMIN_REFRESH_TOKEN } }) });
  });

  await page.route(/\/api\/v1\/admin\/auth\/profile\//, route => {
    console.log(`[MOCK] admin/auth/profile → super_admin`);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ADMIN_PROFILE) });
  });

  await page.route(/\/api\/v1\/admin\/auth\/login\//, route => {
    console.log(`[MOCK] admin/auth/login → success`);
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Super', last_name: 'Admin',
            role: 'super_admin', is_active: true, is_email_verified: true },
          tokens: { access: ADMIN_MOCK_TOKEN, refresh: ADMIN_REFRESH_TOKEN },
          redirect_to: null
        }
      }) });
  });
}

/**
 * Register all persistent intercepts for learner portal.
 */
async function setupLearnerMocks(page) {
  // 1. Catch-all backend fallback (lowest priority)
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    const url = route.request().url();
    try {
      const resp = await route.fetch({ timeout: 15000 });
      if (resp.ok()) {
        console.log(`[LEARNER PASSTHROUGH OK] ${route.request().method()} ${url}`);
        return route.fulfill({ response: resp });
      }
      console.log(`[LEARNER FALLBACK] ${url} → 200 empty`);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_PAGINATED) });
    } catch (e) {
      console.log(`[LEARNER FALLBACK ERR] ${url}: ${e.message}`);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_PAGINATED) });
    }
  });

  // 2. Specific mocks
  await page.route(/\/api\/v1\/notifications\//, route => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NOTIFS_EMPTY) });
  });

  await page.route(/\/api\/v1\/auth\/tenant-redirect\//, route => {
    console.log(`[MOCK] learner tenant-redirect`);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TENANT_REDIRECT) });
  });

  await page.route(/\/api\/v1\/auth\/token\/refresh\//, route => {
    console.log(`[MOCK] learner token/refresh`);
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null,
        data: { access: LEARNER_MOCK_TOKEN, refresh: LEARNER_REFRESH_TOKEN } }) });
  });

  // Verification check endpoints - mock to say verified
  await page.route(/\/api\/v1\/auth\/verify-email\//, route => {
    console.log(`[MOCK] verify-email check → verified`);
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { verified: true, is_email_verified: true } }) });
  });

  await page.route(/\/api\/v1\/auth\/profile\//, route => {
    console.log(`[MOCK] learner profile → verified learner`);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(LEARNER_PROFILE) });
  });

  await page.route(/\/api\/v1\/auth\/login\//, route => {
    console.log(`[MOCK] learner login → success`);
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: { id: 100, email: 'sundar@qilinlab.com', first_name: 'Sundar', last_name: 'S',
            role: 'learner', is_active: true, is_email_verified: true, email_verified: true },
          tokens: { access: LEARNER_MOCK_TOKEN, refresh: LEARNER_REFRESH_TOKEN },
          redirect_to: null
        }
      }) });
  });
}

/**
 * Inject admin auth tokens directly into localStorage so Next.js reads them on every page load
 */
async function injectAdminAuth(page) {
  await page.evaluate((token) => {
    // Common Next.js auth storage keys
    const authData = JSON.stringify({
      access: token,
      refresh: 'mock-refresh-token-admin-v2',
      user: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Super', last_name: 'Admin',
        role: 'super_admin', is_active: true, is_email_verified: true }
    });
    localStorage.setItem('auth', authData);
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('authToken', token);
    // Also try to set as a cookie-style key
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'super_admin' }));
    document.cookie = `access_token=${token}; path=/`;
    document.cookie = `auth_token=${token}; path=/`;
  }, ADMIN_MOCK_TOKEN);
}

async function injectLearnerAuth(page) {
  await page.evaluate((token) => {
    const authData = JSON.stringify({
      access: token,
      refresh: 'learner-mock-refresh-token-v2',
      user: { id: 100, email: 'sundar@qilinlab.com', first_name: 'Sundar', last_name: 'S',
        role: 'learner', is_active: true, is_email_verified: true, email_verified: true }
    });
    localStorage.setItem('auth', authData);
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({ id: 100, role: 'learner', is_email_verified: true }));
    document.cookie = `access_token=${token}; path=/`;
    document.cookie = `auth_token=${token}; path=/`;
  }, LEARNER_MOCK_TOKEN);
}

async function exploreAdmin(browser) {
  console.log('\n=== ADMIN PORTAL EXPLORATION ===');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Set up ALL mocks BEFORE any navigation
  await setupAdminMocks(page);

  // Step 1: Navigate to login page
  console.log('[ADMIN] Navigating to login page...');
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await ss(page, 'A01-admin-login');
  console.log('[ADMIN] Login URL:', page.url());

  // Step 2: Fill and submit login
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', 'superadmin@yopmail.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await ss(page, 'A02-admin-login-filled');

  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  console.log('[ADMIN] Post-login URL:', page.url());

  // Inject auth tokens into localStorage
  await injectAdminAuth(page);
  await ss(page, 'A03-admin-post-login');

  // Verify we're on dashboard
  if (!page.url().includes('/dashboard')) {
    console.log('[ADMIN] Not on dashboard, navigating there...');
    await page.goto(`${ADMIN_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await injectAdminAuth(page);
    console.log('[ADMIN] Dashboard URL:', page.url());
  }
  await page.waitForTimeout(2000);
  await ss(page, 'A04-admin-dashboard');

  // Step 3: Sidebar - expand all groups
  console.log('[ADMIN] Expanding sidebar groups...');
  // Click each collapsed group
  const groups = ['Community', 'Organizations', 'People', 'Content', 'Commerce', 'System'];
  for (const group of groups) {
    try {
      const el = await page.$(`text="${group}"`);
      if (el) {
        await el.click();
        await page.waitForTimeout(300);
      }
    } catch (e) {}
  }
  await page.waitForTimeout(1000);
  await ss(page, 'A05-admin-sidebar-expanded');

  // Step 4: Navigate to Cohorts page
  console.log('[ADMIN] Navigating to /cohorts...');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectAdminAuth(page);
  console.log('[ADMIN] Cohorts URL:', page.url());
  await page.waitForTimeout(2000);
  await ss(page, 'A06-cohorts-main');

  if (page.url().includes('/login')) {
    console.log('[ADMIN] STILL ON LOGIN — attempting force navigation with waitForURL...');
    // Try a different approach: navigate with full URL reload
    await page.evaluate(() => { window.location.href = '/cohorts'; });
    await page.waitForURL('**/cohorts**', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await ss(page, 'A06b-cohorts-forced');
    console.log('[ADMIN] After force:', page.url());
  }

  // Grab cohorts page text
  const cohortsPageText = await page.evaluate(() => {
    const h1 = [...document.querySelectorAll('h1')].map(e => e.textContent.trim());
    const h2 = [...document.querySelectorAll('h2')].map(e => e.textContent.trim());
    const subtitle = [...document.querySelectorAll('p')].slice(0, 3).map(e => e.textContent.trim());
    const tabs = [...document.querySelectorAll('[role="tab"]')].map(e => e.textContent.trim());
    const emptyState = [...document.querySelectorAll('[class*="empty"], [class*="Empty"]')].map(e => e.textContent.trim());
    return { h1, h2, subtitle, tabs, emptyState, url: window.location.href };
  });
  console.log('[ADMIN COHORTS PAGE]', JSON.stringify(cohortsPageText, null, 2));

  // Step 5: Cohorts list tab — get filter dropdowns
  console.log('[ADMIN] Opening cohorts list filter dropdowns...');
  await ss(page, 'A07-cohorts-list-default');

  // Try to open each filter dropdown on cohorts tab
  const dropdowns = await page.$$('select, [class*="select"], [role="combobox"], button[class*="dropdown"]');
  console.log(`[ADMIN] Found ${dropdowns.length} dropdown elements`);

  // Take screenshot scrolled to show filters
  await page.waitForTimeout(500);
  await ss(page, 'A08-cohorts-list-filters');

  // Step 6: Click Flags tab
  console.log('[ADMIN] Clicking Flags tab...');
  try {
    const flagsTab = await page.$('text="Flags"');
    if (flagsTab) {
      await flagsTab.click();
      await page.waitForTimeout(1000);
      await ss(page, 'A09-flags-tab');
      console.log('[ADMIN] Flags tab loaded');

      // Open Status dropdown
      try {
        const statusBtn = await page.$('button:has-text("Open"), [class*="select"]:has-text("Open")');
        if (statusBtn) {
          await statusBtn.click();
          await page.waitForTimeout(500);
          await ss(page, 'A10-flags-status-dropdown');
          await page.keyboard.press('Escape');
        }
      } catch (e) { console.log('[ADMIN] Status dropdown err:', e.message); }

      // Open Kind dropdown
      try {
        const kindBtn = await page.$('button:has-text("All kinds"), [class*="select"]:has-text("All kinds")');
        if (kindBtn) {
          await kindBtn.click();
          await page.waitForTimeout(500);
          await ss(page, 'A11-flags-kind-dropdown');
          await page.keyboard.press('Escape');
        }
      } catch (e) { console.log('[ADMIN] Kind dropdown err:', e.message); }
    }
  } catch (e) { console.log('[ADMIN] Flags tab err:', e.message); }

  // Step 7: Navigate to cohorts list with Cohorts tab active
  console.log('[ADMIN] Re-navigating to /cohorts to open Cohorts tab dropdowns...');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectAdminAuth(page);
  await page.waitForTimeout(2000);

  // Try opening Status dropdown on cohorts tab
  const allDropdownTexts = ['All statuses', 'All courses', 'All organisations', 'All origins'];
  for (const dropText of allDropdownTexts) {
    try {
      const btn = await page.$(`button:has-text("${dropText}"), [role="combobox"]:has-text("${dropText}")`);
      if (btn) {
        await btn.click();
        await page.waitForTimeout(500);
        const safeName = dropText.replace(/\s+/g, '-').toLowerCase();
        await ss(page, `A12-cohorts-${safeName}`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        console.log(`[ADMIN] Captured ${dropText} dropdown`);
      }
    } catch (e) { console.log(`[ADMIN] Dropdown '${dropText}' err:`, e.message); }
  }

  // Step 8: Course settings - Cohorts section
  console.log('[ADMIN] Navigating to courses...');
  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectAdminAuth(page);
  await page.waitForTimeout(2000);
  console.log('[ADMIN] Courses URL:', page.url());
  await ss(page, 'A13-courses-list');

  // Try to find a course and go to its settings
  const courseLinks = await page.$$('a[href*="/courses/"]');
  console.log(`[ADMIN] Found ${courseLinks.length} course links`);
  if (courseLinks.length > 0) {
    const href = await courseLinks[0].getAttribute('href');
    console.log('[ADMIN] First course href:', href);
    if (href) {
      // Extract course slug/id
      const match = href.match(/\/courses\/([^/]+)/);
      if (match) {
        const courseId = match[1];
        const settingsUrl = `${ADMIN_URL}/courses/${courseId}/settings`;
        console.log('[ADMIN] Navigating to course settings:', settingsUrl);
        await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await injectAdminAuth(page);
        await page.waitForTimeout(2000);
        await ss(page, 'A14-course-settings');
        console.log('[ADMIN] Course settings URL:', page.url());

        // Scroll down to find Cohorts section
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(500);
        await ss(page, 'A14b-course-settings-scrolled');

        // Look for Cohorts section or toggle
        const cohortToggle = await page.$('[class*="cohort"], [data-testid*="cohort"], text="Group learners into cohorts"');
        if (cohortToggle) {
          console.log('[ADMIN] Found cohorts toggle!');
          await cohortToggle.scrollIntoViewIfNeeded();
          await ss(page, 'A15-course-settings-cohorts-section');
        }
      }
    }
  }

  // Also try direct URL for known course
  const knownCourseUrls = [
    '/courses/course-to-yap/settings',
    '/courses/1/settings',
    '/courses/test-cohort-course-001/settings'
  ];
  for (const url of knownCourseUrls) {
    try {
      await page.goto(`${ADMIN_URL}${url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await injectAdminAuth(page);
      await page.waitForTimeout(1500);
      if (!page.url().includes('/login') && !page.url().includes('/courses?')) {
        console.log('[ADMIN] Found course settings at:', page.url());
        await ss(page, 'A16-course-settings-known');
        await page.evaluate(() => window.scrollBy(0, 400));
        await page.waitForTimeout(500);
        await ss(page, 'A16b-course-settings-cohorts');
        break;
      }
    } catch (e) {}
  }

  // Step 9: Navigate to a cohort detail page
  console.log('[ADMIN] Navigating to cohort detail /cohorts/10...');
  await page.goto(`${ADMIN_URL}/cohorts/10`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectAdminAuth(page);
  await page.waitForTimeout(2000);
  console.log('[ADMIN] Cohort detail URL:', page.url());
  await ss(page, 'A17-cohort-detail');

  if (!page.url().includes('/login')) {
    // Click Manage dropdown
    try {
      const manageBtn = await page.$('button:has-text("Manage")');
      if (manageBtn) {
        await manageBtn.click();
        await page.waitForTimeout(500);
        await ss(page, 'A18-cohort-manage-dropdown');
        await page.keyboard.press('Escape');
      }
    } catch (e) { console.log('[ADMIN] Manage dropdown err:', e.message); }

    // Click Activity tab
    try {
      const activityTab = await page.$('text="Activity"');
      if (activityTab) {
        await activityTab.click();
        await page.waitForTimeout(1000);
        await ss(page, 'A19-cohort-activity-tab');
      }
    } catch (e) { console.log('[ADMIN] Activity tab err:', e.message); }
  }

  // Extract all text from cohorts-related pages for the report
  const reportData = { adminPageUrl: page.url(), cohortsText: cohortsPageText };
  console.log('\n[ADMIN] Done. Report data:', JSON.stringify(reportData, null, 2));

  await context.close();
  return reportData;
}

async function exploreLearner(browser) {
  console.log('\n=== LEARNER PORTAL EXPLORATION ===');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Set up ALL mocks BEFORE any navigation
  await setupLearnerMocks(page);

  // Step 1: Login page
  console.log('[LEARNER] Navigating to login...');
  await page.goto(`${LEARNER_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await ss(page, 'L01-learner-login');
  console.log('[LEARNER] Login URL:', page.url());

  // Step 2: Fill login form
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'sundar@qilinlab.com');
    await page.fill('input[type="password"]', '7708278760sS@');
    await ss(page, 'L02-learner-login-filled');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    console.log('[LEARNER] Post-login URL:', page.url());
  } catch (e) {
    // Try alternate selectors
    console.log('[LEARNER] Standard login failed, trying alternate:', e.message);
    try {
      await page.fill('input[name="email"]', 'sundar@qilinlab.com');
      await page.fill('input[name="password"]', '7708278760sS@');
      await page.click('button:has-text("Continue"), button:has-text("Sign in")');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    } catch (e2) { console.log('[LEARNER] Alt login also failed:', e2.message); }
  }

  // Inject auth tokens
  await injectLearnerAuth(page);
  await ss(page, 'L03-learner-post-login');
  console.log('[LEARNER] URL after auth inject:', page.url());

  // If redirected to verify-email, navigate to home directly
  if (page.url().includes('/verify-email') || page.url().includes('/login')) {
    console.log('[LEARNER] On verify/login page, forcing navigation to home...');
    await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await injectLearnerAuth(page);
    await page.waitForTimeout(2000);
    console.log('[LEARNER] Home URL:', page.url());
  }
  await ss(page, 'L04-learner-home');

  // Step 3: Navigate to dashboard/home
  const homeUrl = page.url();
  console.log('[LEARNER] Home URL:', homeUrl);

  // Extract nav links
  const navLinks = await page.evaluate(() => {
    return [...document.querySelectorAll('nav a, [class*="nav"] a, header a')].map(a => ({
      text: a.textContent.trim(), href: a.getAttribute('href')
    })).filter(l => l.text && l.href);
  });
  console.log('[LEARNER] Nav links:', JSON.stringify(navLinks));

  // Step 4: Community page
  console.log('[LEARNER] Navigating to /community...');
  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectLearnerAuth(page);
  await page.waitForTimeout(2000);
  console.log('[LEARNER] Community URL:', page.url());
  await ss(page, 'L05-learner-community');

  if (!page.url().includes('/verify-email') && !page.url().includes('/login')) {
    // Get community tabs
    const communityTabs = await page.evaluate(() => {
      return [...document.querySelectorAll('[role="tab"], [class*="tab"]')].map(e => e.textContent.trim());
    });
    console.log('[LEARNER] Community tabs:', communityTabs);

    // Try clicking different tabs
    const tabNames = ['Cohorts', 'Groups', 'Discussions', 'Members'];
    for (const tabName of tabNames) {
      try {
        const tab = await page.$(`[role="tab"]:has-text("${tabName}"), button:has-text("${tabName}")`);
        if (tab) {
          await tab.click();
          await page.waitForTimeout(1000);
          await ss(page, `L05-community-tab-${tabName.toLowerCase()}`);
          console.log(`[LEARNER] ${tabName} tab captured`);
        }
      } catch (e) { console.log(`[LEARNER] Tab ${tabName} err:`, e.message); }
    }
  }

  // Step 5: Community cohorts routes
  const cohortRoutes = ['/community/cohorts', '/community/groups', '/my-courses'];
  for (const route of cohortRoutes) {
    console.log(`[LEARNER] Navigating to ${route}...`);
    await page.goto(`${LEARNER_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await injectLearnerAuth(page);
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`[LEARNER] ${route} → ${currentUrl}`);
    const safeName = route.replace(/\//g, '-').replace(/^-/, '');
    await ss(page, `L06-${safeName}`);
  }

  // Step 6: My Courses
  console.log('[LEARNER] Navigating to my-courses...');
  await page.goto(`${LEARNER_URL}/my-courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectLearnerAuth(page);
  await page.waitForTimeout(2000);
  console.log('[LEARNER] My Courses URL:', page.url());
  await ss(page, 'L07-my-courses');

  const myCourseData = await page.evaluate(() => {
    const h1 = [...document.querySelectorAll('h1')].map(e => e.textContent.trim());
    const cards = document.querySelectorAll('[class*="course-card"], [class*="CourseCard"], article');
    const cohortChips = [...document.querySelectorAll('[class*="chip"], [class*="badge"], [class*="tag"]')]
      .filter(e => e.textContent.toLowerCase().includes('cohort'))
      .map(e => e.textContent.trim());
    return { h1, cardCount: cards.length, cohortChips, url: window.location.href };
  });
  console.log('[LEARNER] My Courses:', JSON.stringify(myCourseData));

  // Step 7: Explore/Courses page
  await page.goto(`${LEARNER_URL}/courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectLearnerAuth(page);
  await page.waitForTimeout(2000);
  await ss(page, 'L08-courses');

  // Step 8: Try to find a lesson/course to play
  console.log('[LEARNER] Trying to access a lesson player...');
  // Try common lesson player routes
  const lessonRoutes = ['/learn/1/1', '/learn/course-to-yap/1', '/courses/1/learn'];
  for (const lr of lessonRoutes) {
    try {
      await page.goto(`${LEARNER_URL}${lr}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await injectLearnerAuth(page);
      await page.waitForTimeout(1500);
      if (!page.url().includes('/login') && !page.url().includes('/verify-email')) {
        console.log('[LEARNER] Lesson player found at:', page.url());
        await ss(page, 'L09-lesson-player');
        break;
      }
    } catch (e) {}
  }

  // Step 9: Profile/notifications page
  await page.goto(`${LEARNER_URL}/notifications`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await injectLearnerAuth(page);
  await page.waitForTimeout(2000);
  await ss(page, 'L10-notifications');

  console.log('\n[LEARNER] Done.');
  await context.close();
}

async function main() {
  console.log('=== BUDGETNISTA COHORTS DEFINITIVE EXPLORATION ===');
  console.log(`Screenshots → ${SS_DIR}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-web-security']
  });

  try {
    await exploreAdmin(browser);
    await exploreLearner(browser);
    console.log('\n=== ALL DONE ===');
    console.log('Screenshots saved to:', SS_DIR);
  } catch (e) {
    console.error('Fatal error:', e);
  } finally {
    await browser.close();
  }
}

main();
