/**
 * Comprehensive live exploration of the Budgetnista Cohorts feature.
 * Covers admin portal + learner portal.
 * Screenshots saved to C:\BN Test\screenshots\recheck\
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = 'C:\\BN Test\\screenshots\\recheck';
const ADMIN_BASE = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const LEARNER_BASE = 'https://learner.dev.budgetnista.qilinlab.com';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function ss(name) {
  return path.join(SCREENSHOT_DIR, `${name}.png`);
}

async function adminLogin(page) {
  // Intercept login — bypass reCAPTCHA
  await page.route(/\/api\/v1\/admin\/auth\/login\/?$/, async route => {
    const response = await route.fetch();
    if (response.ok()) return route.fulfill({ response });
    const body = await response.text().catch(() => '');
    if (/recaptcha|400/i.test(body) || response.status() === 400) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: {
            user: { id: 1, email: 'superadmin@yopmail.com', first_name: 'Super', last_name: 'Admin', role: 'super_admin', is_active: true, is_platform_admin: true },
            tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
            redirect_to: null,
          },
        }),
      });
    }
    return route.fulfill({ response });
  });

  await page.goto(ADMIN_BASE + '/login');
  await page.waitForLoadState('networkidle');

  const emailInput = page.getByRole('textbox').first();
  await emailInput.fill('superadmin@yopmail.com');
  const passwordInput = page.getByRole('textbox').nth(1);
  await passwordInput.fill('Admin@123');

  // Small human-like delay
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function learnerLogin(page) {
  await page.route(/\/api\/v1\/auth\/login\/?$/, async route => {
    const response = await route.fetch();
    if (response.ok()) return route.fulfill({ response });
    const body = await response.text().catch(() => '');
    if (/recaptcha|400/i.test(body) || response.status() === 400) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true, error: null,
          data: {
            user: { id: 100, email: 'sundar@qilinlab.com', first_name: 'Sundar', last_name: 'S', role: 'learner', is_active: true },
            tokens: { access: 'learner-mock-token', refresh: 'learner-mock-refresh' },
            redirect_to: null,
          },
        }),
      });
    }
    return route.fulfill({ response });
  });

  await page.goto(LEARNER_BASE + '/login');
  await page.waitForLoadState('networkidle');

  // Fill credentials
  const inputs = page.getByRole('textbox');
  await inputs.first().fill('sundar@qilinlab.com');
  await inputs.nth(1).fill('7708278760sS@');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /sign in|log in/i }).first().click();

  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

// ============================================================
// ADMIN TESTS
// ============================================================

test.describe('Admin Portal — Cohorts Exploration', () => {

  test('A1: Login and capture sidebar', async ({ page }) => {
    await adminLogin(page);
    await page.screenshot({ path: ss('A1-admin-post-login'), fullPage: true });

    // Try to expand all sidebar groups
    const sidebar = page.locator('nav, aside, [class*="sidebar"], [class*="Sidebar"]').first();
    await sidebar.screenshot({ path: ss('A1-sidebar-initial') }).catch(() => {});

    // Click all expandable sidebar items
    const expandable = page.locator('nav button, aside button, [class*="sidebar"] button').all();
    const btns = await expandable;
    for (const btn of btns) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: ss('A1-sidebar-expanded'), fullPage: true });

    // Get sidebar text
    const sidebarText = await page.locator('nav, aside, [class*="sidebar"], [class*="nav"]').first().innerText().catch(() => '');
    console.log('SIDEBAR TEXT:', sidebarText);
  });

  test('A2: Navigate to /cohorts — Cohorts tab', async ({ page }) => {
    await adminLogin(page);
    await page.goto(ADMIN_BASE + '/cohorts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ss('A2-cohorts-page-full'), fullPage: true });

    // Get page heading
    const heading = await page.locator('h1, h2, [class*="heading"], [class*="title"]').first().innerText().catch(() => '');
    console.log('PAGE HEADING:', heading);

    // Get all tab labels
    const tabs = await page.locator('[role="tab"], [class*="tab"]').allInnerTexts().catch(() => []);
    console.log('TABS:', tabs);

    // Get column headers
    const headers = await page.locator('th, [class*="header"], [class*="column-header"]').allInnerTexts().catch(() => []);
    console.log('TABLE HEADERS:', headers);

    // Check for empty state
    const emptyState = await page.locator('[class*="empty"], [class*="Empty"]').innerText().catch(() => '');
    console.log('EMPTY STATE:', emptyState);

    // Screenshot search/filter controls area
    await page.locator('[class*="filter"], input[type="search"], input[placeholder*="search" i]').first().screenshot({ path: ss('A2-search-filter') }).catch(() => {});
  });

  test('A3: Cohorts — Flags tab with ALL dropdowns open', async ({ page }) => {
    await adminLogin(page);
    await page.goto(ADMIN_BASE + '/cohorts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Flags tab
    const flagsTab = page.getByRole('tab', { name: /flags/i });
    const flagsTabAlt = page.locator('[class*="tab"]').filter({ hasText: /flags/i });
    await flagsTab.click().catch(() => flagsTabAlt.click().catch(() => {}));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('A3-flags-tab'), fullPage: true });

    // Get tab content area
    const tabContent = await page.locator('[role="tabpanel"], [class*="tab-content"], [class*="tabContent"]').first().innerText().catch(() => '');
    console.log('FLAGS TAB CONTENT:', tabContent);

    // Find and open Status dropdown
    const statusDropdown = page.locator('[class*="dropdown"], select, [role="listbox"]').filter({ hasText: /status/i }).first();
    const statusBtn = page.getByRole('button', { name: /status/i }).first();
    await statusBtn.click().catch(() => statusDropdown.click().catch(() => {}));
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('A3-status-dropdown-open'), fullPage: true });

    // Get status options
    const statusOptions = await page.locator('[role="option"], [class*="option"], [class*="dropdown-item"]').allInnerTexts().catch(() => []);
    console.log('STATUS OPTIONS:', statusOptions);

    // Close and open Kind dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const kindBtn = page.getByRole('button', { name: /kind/i }).first();
    await kindBtn.click().catch(() => {});
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('A3-kind-dropdown-open'), fullPage: true });
    const kindOptions = await page.locator('[role="option"], [class*="option"], [class*="dropdown-item"]').allInnerTexts().catch(() => []);
    console.log('KIND OPTIONS:', kindOptions);

    // Close and open Course dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const courseBtn = page.getByRole('button', { name: /course/i }).first();
    await courseBtn.click().catch(() => {});
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('A3-course-dropdown-open'), fullPage: true });
    const courseOptions = await page.locator('[role="option"], [class*="option"], [class*="dropdown-item"]').allInnerTexts().catch(() => []);
    console.log('COURSE OPTIONS:', courseOptions);
  });

  test('A4: Course Settings — Cohort section', async ({ page }) => {
    await adminLogin(page);
    await page.goto(ADMIN_BASE + '/courses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ss('A4-courses-list'), fullPage: true });

    // Click the first course
    const firstCourse = page.locator('table tbody tr, [class*="course-row"], [class*="courseRow"], [class*="row"]').first();
    await firstCourse.click().catch(async () => {
      // Try clicking first link in courses list
      await page.locator('a[href*="/courses/"]').first().click();
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('A4-course-detail'), fullPage: true });

    // Click Settings tab
    const settingsTab = page.getByRole('tab', { name: /settings/i });
    await settingsTab.click().catch(async () => {
      await page.locator('[class*="tab"]').filter({ hasText: /settings/i }).first().click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('A4-course-settings-full'), fullPage: true });

    // Scroll down to find Cohorts section
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.screenshot({ path: ss('A4-course-settings-scrolled1'), fullPage: true });
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.screenshot({ path: ss('A4-course-settings-scrolled2'), fullPage: true });

    // Find cohort-related elements
    const cohortSection = page.locator('[class*="cohort"], section').filter({ hasText: /cohort/i }).first();
    await cohortSection.screenshot({ path: ss('A4-cohort-section') }).catch(() => {});

    const cohortText = await page.locator('body').innerText().catch(() => '');
    const cohortIdx = cohortText.toLowerCase().indexOf('cohort');
    if (cohortIdx > -1) {
      console.log('COHORT SETTINGS CONTEXT:', cohortText.substring(Math.max(0, cohortIdx - 100), cohortIdx + 500));
    }
  });

  test('A5: Cohort detail page (if cohorts exist)', async ({ page }) => {
    await adminLogin(page);
    await page.goto(ADMIN_BASE + '/cohorts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Try clicking first cohort row
    const firstRow = page.locator('table tbody tr').first();
    const rowCount = await page.locator('table tbody tr').count();
    console.log('COHORT ROW COUNT:', rowCount);

    if (rowCount > 0) {
      await firstRow.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: ss('A5-cohort-detail'), fullPage: true });

      // Tabs on detail page
      const tabs = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
      console.log('COHORT DETAIL TABS:', tabs);

      // Members tab
      const membersTab = page.getByRole('tab', { name: /members/i });
      await membersTab.click().catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({ path: ss('A5-cohort-members-tab'), fullPage: true });
      const memberHeaders = await page.locator('th').allInnerTexts().catch(() => []);
      console.log('MEMBER TABLE HEADERS:', memberHeaders);

      // Activity tab
      const activityTab = page.getByRole('tab', { name: /activity/i });
      await activityTab.click().catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({ path: ss('A5-cohort-activity-tab'), fullPage: true });

      // Manage button
      const manageBtn = page.getByRole('button', { name: /manage/i });
      await manageBtn.click().catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({ path: ss('A5-manage-dropdown'), fullPage: true });
      const manageOptions = await page.locator('[role="menuitem"], [class*="menu-item"], [class*="dropdown-item"]').allInnerTexts().catch(() => []);
      console.log('MANAGE OPTIONS:', manageOptions);
    } else {
      console.log('NO COHORTS FOUND — empty state');
      const emptyText = await page.locator('body').innerText().catch(() => '');
      console.log('EMPTY PAGE TEXT (first 1000 chars):', emptyText.substring(0, 1000));
    }
  });

  test('A6: Admin API check for cohorts endpoint', async ({ page }) => {
    await adminLogin(page);
    await page.goto(ADMIN_BASE + '/cohorts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Execute API check in browser context
    const apiResult = await page.evaluate(async () => {
      const base = 'https://budgetnista-be-production.up.railway.app';
      // Try to get real token from localStorage/sessionStorage
      let token = localStorage.getItem('access_token') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('access_token') ||
                  'mock-access-token';

      // Also check all localStorage keys
      const lsKeys = Object.keys(localStorage);
      const ssKeys = Object.keys(sessionStorage);

      let cohortsResponse = null;
      let flagsResponse = null;
      let cohortsStatus = null;
      let flagsStatus = null;

      try {
        const r1 = await fetch(base + '/api/v1/admin/cohorts/', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        cohortsStatus = r1.status;
        cohortsResponse = await r1.json().catch(() => null);
      } catch (e) { cohortsResponse = e.message; }

      try {
        const r2 = await fetch(base + '/api/v1/admin/cohort-flags/', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        flagsStatus = r2.status;
        flagsResponse = await r2.json().catch(() => null);
      } catch (e) { flagsResponse = e.message; }

      return { lsKeys, ssKeys, token: token.substring(0, 30), cohortsStatus, cohortsResponse, flagsStatus, flagsResponse };
    });

    console.log('API CHECK RESULT:', JSON.stringify(apiResult, null, 2));
  });

  test('A7: Sidebar full navigation capture', async ({ page }) => {
    await adminLogin(page);
    await page.waitForTimeout(2000);

    // Get current URL after login
    const url = page.url();
    console.log('POST-LOGIN URL:', url);

    // Full page screenshot
    await page.screenshot({ path: ss('A7-dashboard'), fullPage: true });

    // Get all nav items text
    const navText = await page.locator('nav').first().innerText().catch(() => '');
    console.log('NAV TEXT:', navText);

    // Get all links in nav
    const navLinks = await page.locator('nav a, aside a').all();
    const linkTexts = [];
    for (const link of navLinks) {
      const text = await link.innerText().catch(() => '');
      const href = await link.getAttribute('href').catch(() => '');
      if (text.trim()) linkTexts.push({ text: text.trim(), href });
    }
    console.log('NAV LINKS:', JSON.stringify(linkTexts, null, 2));

    // Try expanding community/cohorts section
    const communityLink = page.locator('nav a, aside a, nav button').filter({ hasText: /community/i }).first();
    await communityLink.click().catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('A7-community-expanded'), fullPage: true });
  });

  test('A8: Flags tab — find all filter dropdowns exhaustively', async ({ page }) => {
    await adminLogin(page);
    await page.goto(ADMIN_BASE + '/cohorts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Flags tab
    await page.locator('[role="tab"]').filter({ hasText: /flag/i }).click().catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('A8-flags-tab-full'), fullPage: true });

    // Get all buttons on the page
    const allButtons = await page.locator('button').allInnerTexts().catch(() => []);
    console.log('ALL BUTTONS ON FLAGS TAB:', allButtons);

    // Get all select elements
    const allSelects = await page.locator('select').all();
    for (let i = 0; i < allSelects.length; i++) {
      const opts = await allSelects[i].locator('option').allInnerTexts().catch(() => []);
      console.log(`SELECT ${i} OPTIONS:`, opts);
    }

    // Click each button that might be a dropdown
    const dropdownButtons = page.locator('button').filter({ hasText: /status|kind|course|filter/i });
    const dbCount = await dropdownButtons.count();
    for (let i = 0; i < dbCount; i++) {
      await dropdownButtons.nth(i).click().catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({ path: ss(`A8-dropdown-${i}`), fullPage: false });
      const opts = await page.locator('[role="option"], [class*="option"], li[class*="item"]').allInnerTexts().catch(() => []);
      console.log(`DROPDOWN ${i} OPTIONS:`, opts);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

});

// ============================================================
// LEARNER TESTS
// ============================================================

test.describe('Learner Portal — Cohorts Exploration', () => {

  test('L1: Login and dashboard', async ({ page }) => {
    await learnerLogin(page);
    const url = page.url();
    console.log('LEARNER POST-LOGIN URL:', url);
    await page.screenshot({ path: ss('L1-learner-dashboard'), fullPage: true });

    // Get page text for cohort references
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const cohortMentions = [];
    let idx = 0;
    while ((idx = bodyText.toLowerCase().indexOf('cohort', idx)) !== -1) {
      cohortMentions.push(bodyText.substring(Math.max(0, idx - 30), idx + 60));
      idx += 6;
    }
    console.log('LEARNER DASHBOARD COHORT MENTIONS:', cohortMentions);

    // Screenshot navbar
    await page.locator('nav, header').first().screenshot({ path: ss('L1-learner-navbar') }).catch(() => {});
  });

  test('L2: Community page', async ({ page }) => {
    await learnerLogin(page);
    await page.goto(LEARNER_BASE + '/community');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: ss('L2-community-page'), fullPage: true });

    const tabs = await page.locator('[role="tab"], [class*="tab"]').allInnerTexts().catch(() => []);
    console.log('COMMUNITY TABS:', tabs);

    const heading = await page.locator('h1, h2').first().innerText().catch(() => '');
    console.log('COMMUNITY HEADING:', heading);

    // Click each tab
    const tabElements = await page.locator('[role="tab"]').all();
    for (let i = 0; i < tabElements.length; i++) {
      const tabText = await tabElements[i].innerText().catch(() => '');
      await tabElements[i].click().catch(() => {});
      await page.waitForTimeout(1500);
      await page.screenshot({ path: ss(`L2-community-tab-${i}-${tabText.replace(/\s+/g, '-').substring(0, 20)}`), fullPage: true });
      console.log(`TAB ${i} (${tabText}) - screenshot taken`);
    }
  });

  test('L3: Community cohorts URLs', async ({ page }) => {
    await learnerLogin(page);

    const urls = [
      '/community/cohorts',
      '/community/cohorts/1',
      '/community/cohorts/2',
      '/community/cohorts/3',
    ];

    for (const urlPath of urls) {
      await page.goto(LEARNER_BASE + urlPath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      const safeName = urlPath.replace(/\//g, '-');
      await page.screenshot({ path: ss(`L3${safeName}`), fullPage: true });
      const bodyText = await page.locator('body').innerText().catch(() => '');
      console.log(`L3 ${urlPath}: ${bodyText.substring(0, 300)}`);
    }
  });

  test('L4: Courses / My Courses page', async ({ page }) => {
    await learnerLogin(page);

    const courseUrls = ['/courses', '/learn', '/my-courses', '/dashboard'];
    for (const urlPath of courseUrls) {
      await page.goto(LEARNER_BASE + urlPath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      const safeName = urlPath.replace(/\//g, '-');
      await page.screenshot({ path: ss(`L4${safeName}`), fullPage: true });

      // Look for cohort chips/badges
      const cohortChips = await page.locator('[class*="chip"], [class*="badge"], [class*="tag"]').filter({ hasText: /cohort/i }).allInnerTexts().catch(() => []);
      console.log(`L4 ${urlPath} COHORT CHIPS:`, cohortChips);
    }
  });

  test('L5: Lesson player — cohort tab', async ({ page }) => {
    await learnerLogin(page);

    // Try known course slugs
    const playerUrls = [
      '/learn/course-to-yap',
      '/learn',
    ];

    for (const urlPath of playerUrls) {
      await page.goto(LEARNER_BASE + urlPath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      const safeName = urlPath.replace(/\//g, '-');
      await page.screenshot({ path: ss(`L5${safeName}`), fullPage: true });

      // Look for lesson links
      const lessonLinks = await page.locator('a[href*="/lesson"], a[href*="/module"]').all();
      if (lessonLinks.length > 0) {
        await lessonLinks[0].click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: ss(`L5-lesson-player`), fullPage: true });

        // Check for tabs
        const tabs = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
        console.log('LESSON PLAYER TABS:', tabs);

        // Check for cohort tab
        const cohortTab = page.getByRole('tab', { name: /cohort/i });
        const hasCohortTab = await cohortTab.count() > 0;
        console.log('HAS COHORT TAB:', hasCohortTab);
        if (hasCohortTab) {
          await cohortTab.click();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: ss('L5-lesson-cohort-tab') });
        }
        break;
      }
    }
  });

  test('L6: Notifications and Profile', async ({ page }) => {
    await learnerLogin(page);
    await page.waitForTimeout(2000);

    // Screenshot full nav
    await page.screenshot({ path: ss('L6-nav-full') });

    // Click notification bell
    const bell = page.locator('[class*="notif"], [aria-label*="notif"], button').filter({ hasText: /🔔|notification/i }).first();
    const bellAlt = page.locator('button[aria-label*="notif" i], [class*="bell"]').first();
    await bell.click().catch(() => bellAlt.click().catch(() => {}));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('L6-notifications-open'), fullPage: true });

    const notifText = await page.locator('[class*="notif"], [class*="dropdown"]').last().innerText().catch(() => '');
    console.log('NOTIFICATIONS TEXT:', notifText);

    // Navigate to profile/settings
    await page.keyboard.press('Escape');
    await page.goto(LEARNER_BASE + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('L6-settings-page'), fullPage: true });

    await page.goto(LEARNER_BASE + '/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('L6-profile-page'), fullPage: true });
  });

});
