/**
 * Learner portal exploration of Cohorts feature.
 * Uses a separate browser context with learner credentials intercepted.
 * Screenshots saved to C:\BN Test\screenshots\recheck\
 */
import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = 'C:\\BN Test\\screenshots\\recheck';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function ss(name) {
  return path.join(SCREENSHOT_DIR, `${name}.png`);
}

const LEARNER_BASE = 'https://learner.dev.budgetnista.qilinlab.com';

/**
 * This test uses its own browser context (not the admin storageState)
 * so the learner login is independent.
 */
test('LEARNER-FULL-EXPLORE', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Intercept learner login
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

  // L1: Login
  await page.goto(LEARNER_BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: ss('LRN-01-login-page'), fullPage: true });
  console.log('LOGIN PAGE URL:', page.url());

  // Fill login form
  const textboxes = await page.locator('input[type="text"], input[type="email"], input[placeholder*="email" i]').all();
  const pwBoxes = await page.locator('input[type="password"]').all();
  if (textboxes.length > 0) await textboxes[0].fill('sundar@qilinlab.com');
  if (pwBoxes.length > 0) await pwBoxes[0].fill('7708278760sS@');

  await page.waitForTimeout(800);
  const signInBtn = page.locator('button').filter({ hasText: /sign in|log in|login/i }).first();
  await signInBtn.click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 45000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const postLoginUrl = page.url();
  console.log('LEARNER POST-LOGIN URL:', postLoginUrl);
  await page.screenshot({ path: ss('LRN-02-dashboard'), fullPage: true });

  // Get dashboard text
  const dashText = await page.locator('body').innerText().catch(() => '');
  console.log('DASHBOARD TEXT (first 1500):\n' + dashText.substring(0, 1500));

  // Check for cohort mentions
  const cohortIdx = dashText.toLowerCase().indexOf('cohort');
  if (cohortIdx > -1) {
    console.log('COHORT MENTION CONTEXT:', dashText.substring(Math.max(0, cohortIdx - 50), cohortIdx + 200));
  }

  // L1b: Nav bar
  await page.locator('header, nav').first().screenshot({ path: ss('LRN-02b-navbar') }).catch(() => {});

  // L2: Community page
  await page.goto(LEARNER_BASE + '/community');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: ss('LRN-03-community'), fullPage: true });
  const communityUrl = page.url();
  console.log('COMMUNITY URL:', communityUrl);
  const communityText = await page.locator('body').innerText().catch(() => '');
  console.log('COMMUNITY TEXT (first 2000):\n' + communityText.substring(0, 2000));

  // Tabs on community
  const communityTabs = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
  console.log('COMMUNITY TABS:', JSON.stringify(communityTabs));

  // Click each tab
  const tabEls = await page.locator('[role="tab"]').all();
  for (let i = 0; i < tabEls.length; i++) {
    const tabText = await tabEls[i].innerText().catch(() => `tab${i}`);
    await tabEls[i].click().catch(() => {});
    await page.waitForTimeout(1500);
    const safeName = tabText.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 20);
    await page.screenshot({ path: ss(`LRN-03-community-tab-${i}-${safeName}`), fullPage: true });
    const tabContent = await page.locator('[role="tabpanel"]').first().innerText().catch(() => '');
    console.log(`COMMUNITY TAB ${i} "${tabText}" CONTENT:\n` + tabContent.substring(0, 1000));
  }

  // L3: Community cohort URLs
  const cohortUrls = [
    '/community/cohorts',
    '/community/cohorts/1',
    '/community/cohorts/2',
    '/community/cohorts/3',
    '/cohort',
    '/cohorts',
  ];
  for (const urlPath of cohortUrls) {
    await page.goto(LEARNER_BASE + urlPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const safeName = urlPath.replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    await page.screenshot({ path: ss(`LRN-04${safeName}`), fullPage: true });
    const pageUrl = page.url();
    const pageText = await page.locator('body').innerText().catch(() => '');
    console.log(`URL ${urlPath} -> FINAL: ${pageUrl}\nTEXT: ${pageText.substring(0, 300)}\n`);
  }

  // L4: Courses
  const courseUrls = ['/courses', '/learn', '/my-courses', '/dashboard', '/home'];
  for (const urlPath of courseUrls) {
    await page.goto(LEARNER_BASE + urlPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const safeName = urlPath.replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    await page.screenshot({ path: ss(`LRN-05${safeName}`), fullPage: true });
    const finalUrl = page.url();
    const bodyText2 = await page.locator('body').innerText().catch(() => '');
    console.log(`COURSES ${urlPath} -> ${finalUrl}: ${bodyText2.substring(0, 400)}`);

    // Check for cohort chips/badges
    const cohortChips = await page.locator('[class*="chip"], [class*="badge"], [class*="tag"], [class*="label"]').filter({ hasText: /cohort/i }).allInnerTexts().catch(() => []);
    if (cohortChips.length > 0) console.log(`COHORT CHIPS ON ${urlPath}:`, cohortChips);
  }

  // L5: Lesson player — try known course slug
  await page.goto(LEARNER_BASE + '/learn/course-to-yap');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: ss('LRN-06-course-to-yap'), fullPage: true });
  const courseUrl = page.url();
  console.log('COURSE TO YAP URL:', courseUrl);
  const courseText = await page.locator('body').innerText().catch(() => '');
  console.log('COURSE PAGE TEXT (first 1000):\n' + courseText.substring(0, 1000));

  // Try to find and click a lesson
  const lessonLinks = await page.locator('a[href*="/lesson"], a[href*="lesson"], button').filter({ hasText: /lesson|module|start|continue/i }).all();
  console.log('LESSON LINKS COUNT:', lessonLinks.length);
  if (lessonLinks.length > 0) {
    await lessonLinks[0].click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ss('LRN-07-lesson-player'), fullPage: true });
    const playerTabs = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
    console.log('LESSON PLAYER TABS:', JSON.stringify(playerTabs));

    // Check for cohort tab
    const cohortTab = page.getByRole('tab', { name: /cohort/i }).first();
    if (await cohortTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cohortTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: ss('LRN-07-cohort-tab'), fullPage: true });
      const cohortTabText = await page.locator('[role="tabpanel"]').first().innerText().catch(() => '');
      console.log('LESSON COHORT TAB TEXT:', cohortTabText);
    } else {
      console.log('NO COHORT TAB IN LESSON PLAYER');
    }
  }

  // L6: Notifications
  await page.goto(LEARNER_BASE + (postLoginUrl.replace(LEARNER_BASE, '') || '/'));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Look for notification bell
  const notifBell = page.locator('button[aria-label*="notif" i], [class*="bell"], [class*="notif"] button').first();
  if (await notifBell.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notifBell.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('LRN-08-notifications'), fullPage: false });
    const notifText = await page.locator('[class*="notif"], [class*="dropdown"], [role="menu"]').last().innerText().catch(() => '');
    console.log('NOTIFICATIONS:', notifText.substring(0, 500));
    await page.keyboard.press('Escape');
  } else {
    console.log('NO NOTIFICATION BELL FOUND');
    // Screenshot current state to see what nav looks like
    await page.screenshot({ path: ss('LRN-08-no-bell-state'), fullPage: false });
  }

  // L7: Profile/settings
  const profileUrls = ['/profile', '/settings', '/account'];
  for (const urlPath of profileUrls) {
    await page.goto(LEARNER_BASE + urlPath);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const safeName = urlPath.replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    await page.screenshot({ path: ss(`LRN-09${safeName}`), fullPage: true });
    const finalUrl = page.url();
    const bodyText3 = await page.locator('body').innerText().catch(() => '');
    console.log(`PROFILE ${urlPath} -> ${finalUrl}: ${bodyText3.substring(0, 300)}`);
  }

  await browser.close();
});
