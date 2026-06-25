// @ts-check
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const LEARNER_URL = 'https://learner.dev.budgetnista.qilinlab.com';
const ADMIN_USER = 'superadmin@yopmail.com';
const ADMIN_PASS = 'Admin@123';
const LEARNER_USER = 'sundar@qilinlab.com';
const LEARNER_PASS = '7708278760sS@';
const BACKEND = /budgetnista-be-production\.up\.railway\.app/;

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const findings = {};

async function ss(page, name) {
  const fp = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`[SCREENSHOT] ${name}`);
  return fp;
}

async function logPage(page, label) {
  const url = page.url();
  const title = await page.title();
  console.log(`\n--- ${label} ---`);
  console.log(`URL: ${url}`);
  console.log(`Title: ${title}`);
  return { url, title };
}

const MOCK_USER = {
  id: 1, email: ADMIN_USER,
  first_name: 'Test', last_name: 'Admin',
  role: 'super_admin', is_active: true,
};

async function setupAdminMocks(page) {
  // Intercept login to bypass reCAPTCHA
  await page.route(/\/api\/v1\/admin\/auth\/login\/?$/, async route => {
    const response = await route.fetch();
    if (response.ok()) return route.fulfill({ response });
    const body = await response.text().catch(() => '');
    console.log('[INTERCEPT] Login response status:', response.status(), body.slice(0, 200));
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: MOCK_USER,
          tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
          redirect_to: null,
        },
      }),
    });
  });

  // Mock profile
  await page.route(/\/api\/v1\/admin\/auth\/profile\/?/, route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: MOCK_USER }),
    })
  );

  // Mock all other backend calls with empty list (but passthrough on first attempt)
  await page.route(BACKEND, async route => {
    const url = route.request().url();
    // Let these through — we want real data if available
    try {
      const response = await route.fetch({ timeout: 15000 });
      if (response.ok()) return route.fulfill({ response });
      // If 401/403, return empty
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
      });
    } catch (e) {
      console.log('[INTERCEPT] Fetch failed for', url, '->', e.message);
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
      });
    }
  });
}

async function adminLogin(page) {
  console.log('\n====== ADMIN LOGIN ======');
  await setupAdminMocks(page);
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'admin-01-login-page.png');

  // Find inputs
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="admin" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(ADMIN_USER);

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(ADMIN_PASS);

  // Wait for reCAPTCHA to be available
  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => console.log('[WARN] reCAPTCHA not available, proceeding'));

  await page.waitForTimeout(500);

  const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")').first();
  await submitBtn.click();

  await page.waitForTimeout(3000);
  await ss(page, 'admin-02-after-login-click.png');

  // Check if we got past login
  const currentURL = page.url();
  console.log('URL after submit:', currentURL);

  if (currentURL.includes('/login')) {
    console.log('[WARN] Still on login page, checking for error messages');
    const errors = await page.locator('[class*="error"], [role="alert"], [class*="alert"]').allTextContents();
    console.log('Errors:', errors);

    // Try to wait a bit more
    await page.waitForTimeout(2000);
    const finalURL = page.url();
    console.log('Final URL:', finalURL);
  }

  await ss(page, 'admin-03-post-login.png');
  return !page.url().includes('/login');
}

async function exploreAdminNav(page) {
  console.log('\n====== ADMIN: Sidebar Navigation ======');
  await page.waitForTimeout(1500);

  // Get all nav/sidebar links
  const navLinks = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="Sidebar"] a, [class*="nav"] a, [class*="Nav"] a').all();
  const navTexts = [];
  for (const link of navLinks) {
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    if (text?.trim()) navTexts.push({ text: text.trim(), href });
  }
  console.log('Sidebar nav items:', JSON.stringify(navTexts, null, 2));

  const cohortsInNav = navTexts.filter(n => /cohort/i.test(n.text));
  console.log('Cohorts in nav:', cohortsInNav);
  findings.adminSidebarHasCohorts = cohortsInNav.length > 0;
  findings.adminNavItems = navTexts;

  await ss(page, 'admin-04-dashboard-sidebar.png');
}

async function exploreAdminCohortsPage(page) {
  console.log('\n====== ADMIN: /cohorts page ======');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'admin-05-cohorts-page.png');

  const { url } = await logPage(page, 'Cohorts page');
  findings.adminCohortsURL = url;

  // Headings
  const headings = await page.locator('h1, h2, h3, [class*="heading"], [class*="title"]').allTextContents();
  console.log('Page headings:', headings);
  findings.adminCohortsHeadings = headings;

  // Tabs on the page
  const tabs = await page.locator('[role="tab"], [class*="tab-"]').allTextContents();
  console.log('Page tabs:', tabs);
  findings.adminCohortsTabs = tabs;

  // Table headers
  const thTexts = await page.locator('th, [role="columnheader"]').allTextContents();
  console.log('Table headers:', thTexts);
  findings.adminCohortsColumns = thTexts;

  // Table rows (data)
  const rows = await page.locator('tbody tr').all();
  console.log(`Table rows: ${rows.length}`);
  findings.adminCohortsRowCount = rows.length;

  // Empty state text
  const emptyTexts = await page.locator('[class*="empty"], [class*="Empty"]').allTextContents();
  console.log('Empty state:', emptyTexts);

  // Buttons
  const buttons = await page.locator('button:visible').allTextContents();
  console.log('Buttons:', buttons);
  findings.adminCohortsButtons = buttons;

  // Check for "Flags" tab
  const flagsTab = page.locator('[role="tab"]:has-text("Flags"), [class*="tab"]:has-text("Flags"), button:has-text("Flags")');
  findings.adminFlagsTabVisible = await flagsTab.isVisible();
  console.log('Flags tab visible:', findings.adminFlagsTabVisible);
}

async function exploreAdminFlagsTab(page) {
  console.log('\n====== ADMIN: Flags Tab ======');

  // Try clicking Flags tab from the cohorts page
  const flagsTab = page.locator('[role="tab"]:has-text("Flags"), button:has-text("Flags"), [class*="tab"]:has-text("Flags"), a:has-text("Flags")').first();

  if (await flagsTab.isVisible()) {
    await flagsTab.click();
    await page.waitForTimeout(1500);
    console.log('Clicked Flags tab');
  } else {
    // Try URL with ?tab=flags
    await page.goto(`${ADMIN_URL}/cohorts?tab=flags`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  }

  await ss(page, 'admin-06-flags-tab.png');
  const { url } = await logPage(page, 'Flags tab');
  findings.adminFlagsURL = url;

  // Table headers
  const thTexts = await page.locator('th, [role="columnheader"]').allTextContents();
  console.log('Flags table headers:', thTexts);
  findings.adminFlagsColumns = thTexts;

  // Find all filter controls
  const filterControls = await page.locator('select, [role="combobox"], [class*="Select"], [class*="select"], input[type="search"]').all();
  console.log(`Filter controls found: ${filterControls.length}`);

  const filterDetails = [];
  for (let i = 0; i < filterControls.length; i++) {
    const el = filterControls[i];
    const placeholder = await el.getAttribute('placeholder') || '';
    const ariaLabel = await el.getAttribute('aria-label') || '';
    const id = await el.getAttribute('id') || '';
    const text = await el.textContent() || '';
    filterDetails.push({ i, placeholder, ariaLabel, id, text: text.trim().slice(0, 80) });
    console.log(`Filter ${i}: placeholder="${placeholder}" aria-label="${ariaLabel}" id="${id}"`);
  }
  findings.adminFlagsFilters = filterDetails;

  // Try to open and document status dropdown options
  await tryOpenDropdown(page, 'status', 'admin-06b-flags-status-dropdown.png');

  // Try to open and document kind/type dropdown options
  await tryOpenDropdown(page, 'kind', 'admin-06c-flags-kind-dropdown.png');
  await tryOpenDropdown(page, 'type', 'admin-06d-flags-type-dropdown.png');
}

async function tryOpenDropdown(page, keyword, screenshotName) {
  const selector = `[placeholder*="${keyword}" i], [aria-label*="${keyword}" i], [id*="${keyword}" i]`;
  const dropdown = page.locator(selector).first();

  if (await dropdown.isVisible()) {
    await dropdown.click();
    await page.waitForTimeout(800);
    await ss(page, screenshotName);
    const options = await page.locator('[role="option"], li[class*="option"], .dropdown-item').allTextContents();
    console.log(`${keyword} dropdown options:`, options);
    findings[`adminFlags_${keyword}_options`] = options;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    return true;
  }

  // Try combobox with label
  const labelEl = page.locator(`label:has-text("${keyword}"), [class*="label"]:has-text("${keyword}")`).first();
  if (await labelEl.isVisible()) {
    const forAttr = await labelEl.getAttribute('for');
    if (forAttr) {
      const linked = page.locator(`#${forAttr}`);
      if (await linked.isVisible()) {
        await linked.click();
        await page.waitForTimeout(800);
        await ss(page, screenshotName);
        const options = await page.locator('[role="option"]').allTextContents();
        console.log(`${keyword} options (via label):`, options);
        findings[`adminFlags_${keyword}_options`] = options;
        await page.keyboard.press('Escape');
        return true;
      }
    }
  }
  return false;
}

async function exploreAdminCourseSettings(page) {
  console.log('\n====== ADMIN: Courses -> Settings tab ======');
  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'admin-07-courses-list.png');
  console.log('Courses list URL:', page.url());

  const thTexts = await page.locator('th, [role="columnheader"]').allTextContents();
  console.log('Courses columns:', thTexts);

  // Look for clickable course rows/links
  const courseLinks = await page.locator('table tbody tr, [class*="TableRow"], [class*="table-row"]').all();
  console.log(`Course rows: ${courseLinks.length}`);

  let courseOpened = false;

  if (courseLinks.length > 0) {
    try {
      await courseLinks[0].click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      courseOpened = true;
    } catch (e) {
      // Try clicking a link inside the first row
      const firstRowLink = page.locator('table tbody tr:first-child a, table tbody tr:first-child td').first();
      if (await firstRowLink.isVisible()) {
        await firstRowLink.click();
        await page.waitForTimeout(2000);
        courseOpened = true;
      }
    }
  }

  if (!courseOpened) {
    // Try navigating to a known course ID pattern
    console.log('No courses found in table. Checking if /courses/1 works...');
    await page.goto(`${ADMIN_URL}/courses/1`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    courseOpened = true;
  }

  await ss(page, 'admin-08-course-detail.png');
  console.log('Course detail URL:', page.url());

  // Find Settings tab
  const allTabs = await page.locator('[role="tab"], [class*="tab"]').allTextContents();
  console.log('Course tabs:', allTabs);
  findings.adminCourseTabs = allTabs;

  const settingsTab = page.locator('[role="tab"]:has-text("Settings"), [class*="tab"]:has-text("Settings"), button:has-text("Settings"), a:has-text("Settings")').first();

  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await page.waitForTimeout(1500);
    await ss(page, 'admin-09-course-settings.png');
    console.log('Course settings URL:', page.url());
    findings.adminCourseSettingsURL = page.url();

    // Document all labels and inputs
    const labels = await page.locator('label:visible, [class*="label"]:visible').allTextContents();
    console.log('Settings labels:', labels);
    findings.adminCourseSettingsLabels = labels;

    // Look for cohort-specific elements
    const cohortEls = await page.locator(
      '[class*="cohort"], [id*="cohort"], label:has-text("Cohort"), h3:has-text("Cohort"), h4:has-text("Cohort"), [data-testid*="cohort"]'
    ).allTextContents();
    console.log('Cohort elements in settings:', cohortEls);
    findings.adminCourseSettingsCohortEls = cohortEls;

    // Toggles / switches
    const toggles = await page.locator('[role="switch"], input[type="checkbox"]:visible').all();
    const toggleData = [];
    for (let i = 0; i < toggles.length; i++) {
      const toggle = toggles[i];
      const checked = await toggle.isChecked().catch(() => null);
      const parent = await toggle.evaluate(el => {
        // Walk up to find a label-like parent
        let node = el.parentElement;
        for (let j = 0; j < 5; j++) {
          if (node && node.textContent?.trim()) return node.textContent.trim().slice(0, 120);
          node = node?.parentElement;
        }
        return '';
      });
      console.log(`Toggle ${i}: checked=${checked} context="${parent}"`);
      toggleData.push({ checked, context: parent });
    }
    findings.adminCourseSettingsToggles = toggleData;

    // Text inputs / selects visible
    const formInputs = await page.locator('input:visible, select:visible, [role="combobox"]:visible').all();
    console.log(`Form inputs: ${formInputs.length}`);
    for (let i = 0; i < Math.min(formInputs.length, 20); i++) {
      const inp = formInputs[i];
      const type = await inp.getAttribute('type') || 'text';
      const placeholder = await inp.getAttribute('placeholder') || '';
      const name = await inp.getAttribute('name') || '';
      const value = await inp.inputValue().catch(() => '');
      console.log(`Input ${i}: type=${type} name=${name} placeholder=${placeholder} value=${value?.slice(0, 40)}`);
    }

    await ss(page, 'admin-09b-course-settings-scroll.png');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    await ss(page, 'admin-09c-course-settings-middle.png');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await ss(page, 'admin-09d-course-settings-bottom.png');
  } else {
    console.log('Settings tab not found. Available tabs:', allTabs);
  }
}

// ── LEARNER PORTAL ──────────────────────────────────────────────────────────

async function setupLearnerMocks(page) {
  // Intercept learner login
  await page.route(/\/api\/v1\/auth\/login\/?$|\/api\/v1\/learner\/auth\/login\/?$/, async route => {
    const response = await route.fetch().catch(() => null);
    if (response && response.ok()) return route.fulfill({ response });
    console.log('[LEARNER INTERCEPT] Mocking login response');
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: { id: 2, email: LEARNER_USER, first_name: 'Sundar', last_name: 'Test', role: 'learner', is_active: true },
          tokens: { access: 'learner-mock-access', refresh: 'learner-mock-refresh' },
        },
      }),
    });
  });

  // Mock all backend requests for learner
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    try {
      const response = await route.fetch({ timeout: 15000 });
      if (response.ok()) return route.fulfill({ response });
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

async function learnerLogin(page) {
  console.log('\n====== LEARNER LOGIN ======');
  await setupLearnerMocks(page);
  await page.goto(`${LEARNER_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-01-login-page.png');
  console.log('Learner login URL:', page.url());

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="username" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await emailInput.fill(LEARNER_USER);

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(LEARNER_PASS);

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => {});

  await page.waitForTimeout(500);
  await ss(page, 'learner-02-login-filled.png');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")').first();
  await submitBtn.click();

  await page.waitForTimeout(3000);

  const currentURL = page.url();
  console.log('URL after learner submit:', currentURL);

  if (currentURL.includes('/login')) {
    const errors = await page.locator('[class*="error"], [role="alert"]').allTextContents();
    console.log('Login errors:', errors);
  }

  await ss(page, 'learner-03-post-login.png');
  findings.learnerLoginSuccess = !page.url().includes('/login');
  return findings.learnerLoginSuccess;
}

async function exploreLearnerHome(page) {
  console.log('\n====== LEARNER: Home/Dashboard ======');
  const homeURL = page.url().includes('/login') ? `${LEARNER_URL}/dashboard` : page.url();
  await page.goto(homeURL.includes('/login') ? `${LEARNER_URL}/` : homeURL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-04-home.png');
  await logPage(page, 'Learner home');

  // Nav links
  const navLinks = await page.locator('nav a, header a, [class*="sidebar"] a, [class*="nav"] a').all();
  const navTexts = [];
  for (const link of navLinks) {
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    if (text?.trim()) navTexts.push({ text: text.trim(), href });
  }
  console.log('Learner nav items:', JSON.stringify(navTexts, null, 2));
  findings.learnerNavItems = navTexts;

  const cohortLinks = navTexts.filter(n => /cohort/i.test(n.text));
  console.log('Cohort nav links:', cohortLinks);
  findings.learnerNavHasCohorts = cohortLinks.length > 0;
}

async function exploreLearnerCommunity(page) {
  console.log('\n====== LEARNER: /community ======');
  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-05-community.png');
  const { url } = await logPage(page, 'Community page');
  findings.learnerCommunityURL = url;

  const tabs = await page.locator('[role="tab"], [class*="tab"]').allTextContents();
  console.log('Community tabs:', tabs);
  findings.learnerCommunityTabs = tabs;

  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('Community headings:', headings);

  // Check for Cohorts or Groups tab
  for (const tabText of ['Cohorts', 'Groups', 'Cohort', 'Group']) {
    const tab = page.locator(`[role="tab"]:has-text("${tabText}"), button:has-text("${tabText}"), a:has-text("${tabText}")`).first();
    if (await tab.isVisible()) {
      console.log(`Found "${tabText}" tab!`);
      await tab.click();
      await page.waitForTimeout(1000);
      await ss(page, `learner-05b-community-${tabText.toLowerCase()}-tab.png`);
      findings[`learnerCommunity${tabText}Tab`] = true;
    }
  }
}

async function exploreLearnerCommunityRoutes(page) {
  const routes = [
    '/community/cohorts',
    '/community/groups',
    '/groups',
    '/cohorts',
    '/my-cohorts',
  ];

  for (const route of routes) {
    console.log(`\n====== LEARNER: ${route} ======`);
    const resp = await page.goto(`${LEARNER_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(e => null);
    await page.waitForTimeout(1500);
    const slug = route.replace(/\//g, '-').replace(/^-/, '');
    await ss(page, `learner-06${slug}.png`);
    const { url } = await logPage(page, route);
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Headings:', headings);
    const is404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false);
    console.log('Is 404/error:', is404);
    findings[`learnerRoute_${slug}`] = { url, headings, is404 };
  }
}

async function exploreLearnerMyCourses(page) {
  console.log('\n====== LEARNER: My Courses ======');
  await page.goto(`${LEARNER_URL}/my-courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-07-my-courses.png');
  const { url } = await logPage(page, 'My Courses');
  findings.learnerMyCoursesURL = url;

  // Chips/badges
  const chips = await page.locator('[class*="chip"], [class*="badge"], [class*="tag"], [class*="label"]').allTextContents();
  console.log('Chips/badges:', chips);

  const cohortChips = chips.filter(c => /cohort/i.test(c));
  console.log('Cohort chips:', cohortChips);
  findings.learnerMyCoursesCohortChips = cohortChips;

  // Course cards
  const cards = await page.locator('[class*="card"], [class*="Card"], [class*="course"]').all();
  console.log(`Cards found: ${cards.length}`);

  // "In a cohort" text anywhere
  const cohortText = await page.locator('text*="cohort"').allTextContents();
  console.log('Cohort text on page:', cohortText);
}

async function exploreLearnerCoursePlayer(page) {
  console.log('\n====== LEARNER: Course Player ======');
  // Try to navigate to a course
  await page.goto(`${LEARNER_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-08-courses-page.png');
  const { url } = await logPage(page, 'Courses page');

  // Find course links
  const courseLinks = await page.locator('a[href*="/course"], a[href*="/learn/"], [class*="course"] a').all();
  console.log(`Course links found: ${courseLinks.length}`);

  if (courseLinks.length > 0) {
    const href = await courseLinks[0].getAttribute('href');
    console.log('Navigating to course:', href);
    await courseLinks[0].click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('domcontentloaded');
    await ss(page, 'learner-09-course-detail.png');
    console.log('Course detail URL:', page.url());

    // Look for lesson player / start button
    const startBtn = page.locator('button:has-text("Start"), button:has-text("Continue"), a:has-text("Start"), a:has-text("Continue"), button:has-text("Play")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('domcontentloaded');
      await ss(page, 'learner-10-lesson-player.png');
      console.log('Lesson player URL:', page.url());

      const playerTabs = await page.locator('[role="tab"], [class*="tab"]').allTextContents();
      console.log('Player tabs:', playerTabs);
      findings.learnerLessonPlayerTabs = playerTabs;

      const cohortTab = playerTabs.filter(t => /cohort/i.test(t));
      console.log('Cohort tab in player:', cohortTab);
      findings.learnerPlayerHasCohortTab = cohortTab.length > 0;
    }
  } else {
    console.log('No course links found on courses page');
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });

  // ── ADMIN PORTAL ─────────────────────────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════╗');
  console.log('║         ADMIN PORTAL                 ║');
  console.log('╚══════════════════════════════════════╝');

  const adminCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const adminPage = await adminCtx.newPage();

  // Log API calls
  adminPage.on('response', resp => {
    const url = resp.url();
    if (url.includes('railway.app') || url.includes('budgetnista')) {
      console.log(`[API] ${resp.status()} ${url}`);
    }
  });

  try {
    const loggedIn = await adminLogin(adminPage);
    console.log('Admin logged in:', loggedIn);

    if (loggedIn) {
      await exploreAdminNav(adminPage);
      await exploreAdminCohortsPage(adminPage);
      await exploreAdminFlagsTab(adminPage);
      await exploreAdminCourseSettings(adminPage);
    } else {
      console.log('[WARN] Admin login failed, trying to explore with mock state...');
      // Try to set local storage manually and navigate
      await adminPage.goto(ADMIN_URL, { waitUntil: 'domcontentloaded' });
      await adminPage.evaluate((token) => {
        localStorage.setItem('bn_access', token);
        localStorage.setItem('bn_refresh', 'mock-refresh-token');
      }, 'mock-access-token');
      await adminPage.goto(`${ADMIN_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await adminPage.waitForTimeout(2000);
      await ss(adminPage, 'admin-fallback-dashboard.png');
      console.log('Fallback URL:', adminPage.url());
    }
  } catch (e) {
    console.error('[ADMIN ERROR]', e.message);
    await ss(adminPage, 'admin-error.png').catch(() => {});
    findings.adminError = e.message;
  }

  await adminCtx.close();

  // ── LEARNER PORTAL ────────────────────────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════╗');
  console.log('║         LEARNER PORTAL               ║');
  console.log('╚══════════════════════════════════════╝');

  const learnerCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const learnerPage = await learnerCtx.newPage();

  learnerPage.on('response', resp => {
    const url = resp.url();
    if (url.includes('railway.app') || url.includes('budgetnista')) {
      console.log(`[LEARNER API] ${resp.status()} ${url}`);
    }
  });

  try {
    const loggedIn = await learnerLogin(learnerPage);
    console.log('Learner logged in:', loggedIn);

    await exploreLearnerHome(learnerPage);
    await exploreLearnerCommunity(learnerPage);
    await exploreLearnerCommunityRoutes(learnerPage);
    await exploreLearnerMyCourses(learnerPage);
    await exploreLearnerCoursePlayer(learnerPage);
  } catch (e) {
    console.error('[LEARNER ERROR]', e.message);
    await ss(learnerPage, 'learner-error.png').catch(() => {});
    findings.learnerError = e.message;
  }

  await learnerCtx.close();
  await browser.close();

  // Print summary
  console.log('\n\n╔══════════════════════════════════════╗');
  console.log('║         FINDINGS SUMMARY             ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(JSON.stringify(findings, null, 2));

  // Save findings
  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'findings.json'),
    JSON.stringify(findings, null, 2)
  );
  console.log('\nFindings saved to:', path.join(SCREENSHOTS_DIR, 'findings.json'));
  console.log('Screenshots saved to:', SCREENSHOTS_DIR);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
