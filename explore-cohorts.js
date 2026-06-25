// @ts-check
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join('C:/BN Test/screenshots');
const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const LEARNER_URL = 'https://learner.dev.budgetnista.qilinlab.com';
const ADMIN_USER = 'superadmin@yopmail.com';
const ADMIN_PASS = 'Admin@123';
const LEARNER_USER = 'sundar@qilinlab.com';
const LEARNER_PASS = '7708278760sS@';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function ss(page, name) {
  const fp = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`SCREENSHOT: ${fp}`);
}

async function adminLogin(page) {
  console.log('\n=== ADMIN LOGIN ===');
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'networkidle' });
  await ss(page, 'admin-01-login-page.png');

  // Fill email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]').first();
  await emailInput.fill(ADMIN_USER);

  // Fill password
  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(ADMIN_PASS);

  await ss(page, 'admin-02-login-filled.png');

  // Click submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")').first();
  await submitBtn.click();

  // Wait for navigation
  await page.waitForURL(/dashboard|home/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await ss(page, 'admin-03-dashboard.png');
  console.log('Admin URL after login:', page.url());
}

async function exploreAdminCohorts(page) {
  console.log('\n=== ADMIN: /cohorts page ===');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'admin-04-cohorts-list.png');
  console.log('URL:', page.url());

  // Log visible text on page
  const heading = await page.locator('h1, h2, [data-testid="page-title"]').allTextContents();
  console.log('Page headings:', heading);

  // Check table columns
  const thTexts = await page.locator('th').allTextContents();
  console.log('Table headers:', thTexts);

  // Check for empty state
  const emptyState = await page.locator('[class*="empty"], [class*="Empty"], text*="No cohorts", text*="no cohorts"').allTextContents();
  console.log('Empty state text:', emptyState);

  // Check tabs on the page
  const tabs = await page.locator('[role="tab"], .tab, [class*="tab"]').allTextContents();
  console.log('Tabs visible:', tabs);

  // Check buttons
  const buttons = await page.locator('button').allTextContents();
  console.log('Buttons:', buttons);

  // Check nav sidebar
  const navItems = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="nav"] a').allTextContents();
  console.log('Nav items:', navItems.slice(0, 30));
}

async function exploreAdminFlags(page) {
  console.log('\n=== ADMIN: Flags tab ===');
  // Try clicking the Flags tab if on cohorts page
  const flagsTab = page.locator('[role="tab"]:has-text("Flags"), button:has-text("Flags"), a:has-text("Flags")').first();

  if (await flagsTab.isVisible()) {
    await flagsTab.click();
    await page.waitForTimeout(1500);
    await ss(page, 'admin-05-flags-tab.png');
    console.log('URL after Flags tab click:', page.url());
  } else {
    // Try navigating directly
    await page.goto(`${ADMIN_URL}/cohorts?tab=flags`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await ss(page, 'admin-05-flags-tab.png');
    console.log('URL:', page.url());
  }

  // Check filter dropdowns
  const selects = await page.locator('select, [role="combobox"], [class*="select"], [class*="dropdown"]').all();
  for (let i = 0; i < selects.length; i++) {
    const text = await selects[i].textContent();
    const label = await selects[i].getAttribute('aria-label') || await selects[i].getAttribute('placeholder') || '';
    console.log(`Dropdown ${i}: label="${label}" text="${text?.trim()}"`);
  }

  // Try opening status dropdown
  const statusDropdown = page.locator('[placeholder*="status" i], [aria-label*="status" i], select:has-text("status"), [class*="status"]').first();
  if (await statusDropdown.isVisible()) {
    await statusDropdown.click();
    await page.waitForTimeout(500);
    await ss(page, 'admin-05b-flags-status-dropdown.png');
    const options = await page.locator('[role="option"], option').allTextContents();
    console.log('Status dropdown options:', options);
    await page.keyboard.press('Escape');
  }

  // Try kind/type dropdown
  const kindDropdown = page.locator('[placeholder*="kind" i], [aria-label*="kind" i], [placeholder*="type" i], [aria-label*="type" i]').first();
  if (await kindDropdown.isVisible()) {
    await kindDropdown.click();
    await page.waitForTimeout(500);
    await ss(page, 'admin-05c-flags-kind-dropdown.png');
    const options = await page.locator('[role="option"], option').allTextContents();
    console.log('Kind dropdown options:', options);
    await page.keyboard.press('Escape');
  }

  const thTexts = await page.locator('th').allTextContents();
  console.log('Flags table headers:', thTexts);
}

async function exploreAdminCourseSettings(page) {
  console.log('\n=== ADMIN: Courses list ===');
  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'admin-06-courses-list.png');
  console.log('URL:', page.url());

  const thTexts = await page.locator('th').allTextContents();
  console.log('Courses table headers:', thTexts);

  // Find first course link
  const courseLinks = await page.locator('table tbody tr td a, table tbody tr a, [class*="course-row"] a').all();
  console.log(`Found ${courseLinks.length} course links`);

  if (courseLinks.length > 0) {
    const href = await courseLinks[0].getAttribute('href');
    const text = await courseLinks[0].textContent();
    console.log(`First course: "${text?.trim()}" -> ${href}`);
    await courseLinks[0].click();
  } else {
    // Try clicking on any row
    const rows = page.locator('table tbody tr, [class*="table-row"], [class*="TableRow"]').first();
    if (await rows.isVisible()) {
      await rows.click();
    }
  }

  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await ss(page, 'admin-07-course-detail.png');
  console.log('Course detail URL:', page.url());

  // Look for Settings tab
  const settingsTab = page.locator('[role="tab"]:has-text("Settings"), button:has-text("Settings"), a:has-text("Settings")').first();
  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await page.waitForTimeout(1500);
    await ss(page, 'admin-08-course-settings.png');
    console.log('Course settings URL:', page.url());

    // Look for cohorts section
    const cohortSection = await page.locator('[class*="cohort"], [id*="cohort"], label:has-text("cohort"), h3:has-text("cohort"), h4:has-text("cohort")').allTextContents();
    console.log('Cohort section text:', cohortSection);

    // Get all form labels
    const labels = await page.locator('label, [class*="label"]').allTextContents();
    console.log('Form labels:', labels);

    // Get all toggles/switches
    const toggles = await page.locator('[role="switch"], [class*="toggle"], [class*="switch"], input[type="checkbox"]').all();
    for (let i = 0; i < toggles.length; i++) {
      const parent = toggles[i].locator('..');
      const text = await parent.textContent();
      const checked = await toggles[i].isChecked().catch(() => false);
      console.log(`Toggle ${i}: checked=${checked} text="${text?.trim().slice(0, 80)}"`);
    }
  } else {
    console.log('No Settings tab found');
    const allTabs = await page.locator('[role="tab"], .tab').allTextContents();
    console.log('Available tabs:', allTabs);
  }
}

async function exploreAdminSidebar(page) {
  console.log('\n=== ADMIN: Sidebar navigation ===');
  await page.goto(`${ADMIN_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await ss(page, 'admin-09-sidebar.png');

  const navLinks = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="nav-item"], [class*="menu-item"]').allTextContents();
  console.log('Sidebar nav links:', navLinks);

  // Check specifically for "Cohorts" in nav
  const cohortNavItem = page.locator('nav a:has-text("Cohorts"), aside a:has-text("Cohorts"), a:has-text("Cohorts")');
  if (await cohortNavItem.count() > 0) {
    console.log('Found Cohorts in sidebar!');
    const cohortHref = await cohortNavItem.first().getAttribute('href');
    console.log('Cohorts nav href:', cohortHref);
  } else {
    console.log('Cohorts NOT found in sidebar nav');
  }
}

async function exploreAdminCohortDetail(page) {
  console.log('\n=== ADMIN: Cohort detail (if any exist) ===');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Check if there are any rows
  const rows = await page.locator('table tbody tr').all();
  console.log(`Cohort rows found: ${rows.length}`);

  if (rows.length > 0) {
    const firstRow = rows[0];
    const rowText = await firstRow.textContent();
    console.log('First row text:', rowText?.trim());

    // Try clicking first row or first link
    const rowLink = firstRow.locator('a').first();
    if (await rowLink.isVisible()) {
      const href = await rowLink.getAttribute('href');
      console.log('Cohort detail URL:', href);
      await rowLink.click();
    } else {
      await firstRow.click();
    }

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await ss(page, 'admin-10-cohort-detail.png');
    console.log('Cohort detail URL:', page.url());

    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Detail page headings:', headings);

    const tabs = await page.locator('[role="tab"]').allTextContents();
    console.log('Detail page tabs:', tabs);
  } else {
    console.log('No cohorts to click into');
    await ss(page, 'admin-10-cohorts-empty.png');
  }
}

async function learnerLogin(page) {
  console.log('\n=== LEARNER LOGIN ===');
  await page.goto(`${LEARNER_URL}/login`, { waitUntil: 'networkidle' });
  await ss(page, 'learner-01-login-page.png');
  console.log('Learner login URL:', page.url());

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await emailInput.fill(LEARNER_USER);

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(LEARNER_PASS);

  await ss(page, 'learner-02-login-filled.png');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")').first();
  await submitBtn.click();

  // Wait for post-login
  try {
    await page.waitForURL(url => !url.includes('/login'), { timeout: 30000 });
  } catch (e) {
    console.log('Login may have timed out or stayed on login page');
  }
  await page.waitForLoadState('networkidle');
  await ss(page, 'learner-03-after-login.png');
  console.log('Learner URL after login:', page.url());
}

async function exploreLearnerCommunity(page) {
  console.log('\n=== LEARNER: /community ===');
  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-04-community.png');
  console.log('URL:', page.url());

  const tabs = await page.locator('[role="tab"], .tab, [class*="tab"]').allTextContents();
  console.log('Community tabs:', tabs);

  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('Headings:', headings);

  // Check for Cohorts or Groups tab
  const cohortTab = page.locator('[role="tab"]:has-text("Cohort"), button:has-text("Cohort"), a:has-text("Cohort")');
  if (await cohortTab.count() > 0) {
    console.log('Found Cohorts tab in community!');
    await cohortTab.first().click();
    await page.waitForTimeout(1000);
    await ss(page, 'learner-04b-community-cohorts.png');
  }

  const groupTab = page.locator('[role="tab"]:has-text("Group"), button:has-text("Group"), a:has-text("Group")');
  if (await groupTab.count() > 0) {
    console.log('Found Groups tab in community!');
    await groupTab.first().click();
    await page.waitForTimeout(1000);
    await ss(page, 'learner-04c-community-groups.png');
  }
}

async function exploreLearnerCohorts(page) {
  console.log('\n=== LEARNER: /community/cohorts ===');
  await page.goto(`${LEARNER_URL}/community/cohorts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-05-community-cohorts.png');
  console.log('URL:', page.url());

  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('Headings:', headings);

  console.log('\n=== LEARNER: /groups ===');
  await page.goto(`${LEARNER_URL}/groups`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-06-groups.png');
  console.log('URL:', page.url());
}

async function exploreLearnerMyCohorts(page) {
  console.log('\n=== LEARNER: Looking for My Cohorts ===');

  // Check nav
  const navLinks = await page.locator('nav a, header a, [class*="sidebar"] a').allTextContents();
  console.log('Nav links:', navLinks);

  // Check for "My Cohorts" anywhere
  const myCohorts = page.locator('text="My Cohorts", text="my cohorts"');
  if (await myCohorts.count() > 0) {
    console.log('Found "My Cohorts" section!');
  }

  // Go to home / dashboard
  await page.goto(`${LEARNER_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-07-home.png');
  console.log('Home URL:', page.url());

  const allLinks = await page.locator('a').allTextContents();
  const cohortLinks = allLinks.filter(t => /cohort/i.test(t));
  console.log('Links mentioning cohort:', cohortLinks);
}

async function exploreLearnerCoursePlayer(page) {
  console.log('\n=== LEARNER: My Courses page ===');
  await page.goto(`${LEARNER_URL}/my-courses`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'learner-08-my-courses.png');
  console.log('URL:', page.url());

  // Check for "In a cohort" chip
  const chips = await page.locator('[class*="chip"], [class*="badge"], [class*="tag"]').allTextContents();
  console.log('Chips/badges:', chips);

  const cohortChip = page.locator('text="In a cohort"');
  console.log('Found "In a cohort" chip:', await cohortChip.count() > 0);

  // Try opening a course
  const courseCards = await page.locator('[class*="course-card"], [class*="CourseCard"], [class*="course-item"]').all();
  console.log(`Found ${courseCards.length} course cards`);

  if (courseCards.length > 0) {
    await courseCards[0].click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await ss(page, 'learner-09-course-open.png');
    console.log('Course open URL:', page.url());

    // Check for lesson/module player
    const playBtn = page.locator('button:has-text("Start"), button:has-text("Continue"), button:has-text("Play"), a:has-text("Start"), a:has-text("Continue")').first();
    if (await playBtn.isVisible()) {
      await playBtn.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      await ss(page, 'learner-10-lesson-player.png');
      console.log('Lesson player URL:', page.url());

      // Check for Cohort tab in player
      const playerTabs = await page.locator('[role="tab"], [class*="tab"]').allTextContents();
      console.log('Player tabs:', playerTabs);

      const cohortTab = page.locator('[role="tab"]:has-text("Cohort"), [class*="tab"]:has-text("Cohort")');
      console.log('Cohort tab in player:', await cohortTab.count() > 0);
    }
  } else {
    // Try any course link
    const courseLinks = await page.locator('a[href*="/course"], a[href*="/learn"]').all();
    if (courseLinks.length > 0) {
      await courseLinks[0].click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
      await ss(page, 'learner-09-course-open.png');
      console.log('Course URL:', page.url());
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = { admin: {}, learner: {} };

  // ── ADMIN PORTAL ──────────────────────────────────────────────────────────
  console.log('\n\n========== ADMIN PORTAL ==========');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();

  // Capture console & network errors
  adminPage.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  adminPage.on('response', resp => {
    if (resp.url().includes('/api/') && resp.status() >= 400) {
      console.log(`API ERROR: ${resp.status()} ${resp.url()}`);
    }
  });

  try {
    await adminLogin(adminPage);
    await exploreAdminCohorts(adminPage);
    await exploreAdminFlags(adminPage);
    await exploreAdminCourseSettings(adminPage);
    await exploreAdminSidebar(adminPage);
    await exploreAdminCohortDetail(adminPage);
  } catch (e) {
    console.error('ADMIN ERROR:', e.message);
    await ss(adminPage, 'admin-error.png');
  }

  await adminContext.close();

  // ── LEARNER PORTAL ─────────────────────────────────────────────────────────
  console.log('\n\n========== LEARNER PORTAL ==========');
  const learnerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const learnerPage = await learnerContext.newPage();

  learnerPage.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  learnerPage.on('response', resp => {
    if (resp.url().includes('/api/') && resp.status() >= 400) {
      console.log(`API ERROR: ${resp.status()} ${resp.url()}`);
    }
  });

  try {
    await learnerLogin(learnerPage);
    await exploreLearnerCommunity(learnerPage);
    await exploreLearnerCohorts(learnerPage);
    await exploreLearnerMyCohorts(learnerPage);
    await exploreLearnerCoursePlayer(learnerPage);
  } catch (e) {
    console.error('LEARNER ERROR:', e.message);
    await ss(learnerPage, 'learner-error.png');
  }

  await learnerContext.close();
  await browser.close();

  console.log('\n\n========== DONE ==========');
  console.log('Screenshots saved to:', SCREENSHOTS_DIR);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
