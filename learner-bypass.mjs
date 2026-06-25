/**
 * Learner portal exploration - bypass verify-email using storageState injection
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const LEARNER_URL = 'https://learner.dev.budgetnista.qilinlab.com';
const SS_DIR = 'C:\\BN Test\\screenshots\\recheck';
fs.mkdirSync(SS_DIR, { recursive: true });

const LEARNER_TOKEN = 'learner-bypass-token-v1';

const LEARNER_PROFILE = {
  success: true, error: null,
  data: {
    user: {
      id: 100,
      email: 'sundar@qilinlab.com',
      first_name: 'Sundar',
      last_name: 'S',
      role: 'learner',
      is_active: true,
      is_email_verified: true,
      email_verified: true,
      verified: true,
      organisation: {
        id: 1,
        name: 'Budgetnista',
        slug: 'budgetnista',
        subdomain: 'budgetnista'
      }
    }
  }
};

const EMPTY = { success: true, error: null, data: { results: [], count: 0, next: null, previous: null } };
const NOTIFS = { success: true, error: null, data: { count: 0, unread_count: 0, results: [] } };

async function ss(page, name) {
  const p = path.join(SS_DIR, `${name}.png`);
  console.log(`[SS] ${name}`);
  return page.screenshot({ path: p, fullPage: false });
}

async function setupMocks(page) {
  // Catch-all first
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    try {
      const resp = await route.fetch({ timeout: 15000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY) });
    } catch {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY) });
    }
  });

  // Notifications
  await page.route(/\/api\/v1\/notifications\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NOTIFS) }));

  // Tenant redirect
  await page.route(/\/api\/v1\/auth\/tenant-redirect\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { redirect_url: null, tenant: null } }) }));

  // Token refresh
  await page.route(/\/api\/v1\/auth\/token\/refresh\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { access: LEARNER_TOKEN, refresh: 'learner-refresh-v1' } }) }));

  // Verify email check - mock to say already verified
  await page.route(/\/api\/v1\/auth\/verify-email\//, r => {
    console.log('[MOCK] verify-email');
    return r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { verified: true, is_email_verified: true, email_verified: true } }) });
  });

  // Auth profile - mock with verified user
  await page.route(/\/api\/v1\/auth\/profile\//, r => {
    console.log('[MOCK] learner profile');
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(LEARNER_PROFILE) });
  });

  // Auth login
  await page.route(/\/api\/v1\/auth\/login\//, r => {
    console.log('[MOCK] learner login');
    return r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: LEARNER_PROFILE.data.user,
          tokens: { access: LEARNER_TOKEN, refresh: 'learner-refresh-v1' },
          redirect_to: null
        }
      }) });
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  // Try approach 1: Set cookies/storage before navigation
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: {
      cookies: [
        { name: 'access_token', value: LEARNER_TOKEN, domain: 'learner.dev.budgetnista.qilinlab.com', path: '/' },
        { name: 'auth_token', value: LEARNER_TOKEN, domain: 'learner.dev.budgetnista.qilinlab.com', path: '/' },
        { name: 'token', value: LEARNER_TOKEN, domain: 'learner.dev.budgetnista.qilinlab.com', path: '/' },
      ],
      origins: [
        {
          origin: 'https://learner.dev.budgetnista.qilinlab.com',
          localStorage: [
            { name: 'access_token', value: LEARNER_TOKEN },
            { name: 'token', value: LEARNER_TOKEN },
            { name: 'accessToken', value: LEARNER_TOKEN },
            { name: 'auth', value: JSON.stringify({
              access: LEARNER_TOKEN,
              refresh: 'learner-refresh-v1',
              user: LEARNER_PROFILE.data.user
            }) },
            { name: 'user', value: JSON.stringify(LEARNER_PROFILE.data.user) },
          ]
        }
      ]
    }
  });

  const page = await ctx.newPage();
  await setupMocks(page);

  page.on('request', req => {
    if (req.url().includes('budgetnista-be')) {
      const path_ = req.url().split('railway.app')[1];
      console.log(`[REQ] ${req.method()} ${path_}`);
    }
  });

  // Step 1: Try navigating directly to community
  console.log('[1] Navigating to community...');
  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('Community URL:', page.url());
  await ss(page, 'LB01-community-direct');

  // If still on login, try the login flow
  if (page.url().includes('/login') || page.url().includes('/verify-email')) {
    console.log('Still on auth page, trying login flow...');

    await page.goto(`${LEARNER_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await ss(page, 'LB02-login');

    // Check for input selectors
    const inputs = await page.evaluate(() =>
      [...document.querySelectorAll('input')].map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder }))
    );
    console.log('Login inputs:', JSON.stringify(inputs));

    // Fill login
    try {
      await page.locator('input[type="email"], input[name="email"]').first().fill('sundar@qilinlab.com');
      await page.locator('input[type="password"]').first().fill('7708278760sS@');
      const continueBtn = page.locator('button').filter({ hasText: /continue|sign in|log in/i });
      if (await continueBtn.count() > 0) {
        await continueBtn.first().click();
      } else {
        await page.keyboard.press('Enter');
      }
      try { await page.waitForURL(/\/(dashboard|community|home)/, { timeout: 15000 }); } catch {}
      console.log('Post-login URL:', page.url());
    } catch (e) {
      console.log('Login form error:', e.message);
    }

    await page.waitForTimeout(2000);
    await ss(page, 'LB03-post-login');
    console.log('After login URL:', page.url());

    // If on verify-email, try to navigate past it
    if (page.url().includes('/verify-email')) {
      console.log('On verify-email page - trying to navigate to home directly...');

      // Intercept verify-email form submission
      await page.goto(`${LEARNER_URL}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      console.log('Home URL:', page.url());
      await ss(page, 'LB04-home-attempt');
    }
  }

  // Navigate to community and capture tabs
  console.log('\n[2] Community page...');
  await page.goto(`${LEARNER_URL}/community`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  console.log('Community URL:', page.url());
  await ss(page, 'LB05-community');

  const communityData = await page.evaluate(() => ({
    url: window.location.href,
    h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
    tabs: [...document.querySelectorAll('[role="tab"]')].map(e => e.textContent.trim()),
    nav: [...document.querySelectorAll('nav a, [class*="nav"] a')].map(a => ({
      text: a.textContent.trim(), href: a.getAttribute('href')
    })).filter(l => l.text)
  }));
  console.log('Community data:', JSON.stringify(communityData, null, 2));

  // Capture tab content
  const tabs = ['Cohorts', 'Groups', 'Discussions', 'Members'];
  for (const tabName of tabs) {
    try {
      const tab = page.locator('[role="tab"]').filter({ hasText: tabName });
      if (await tab.count() > 0) {
        await tab.first().click();
        await page.waitForTimeout(1000);
        await ss(page, `LB05-community-${tabName.toLowerCase()}`);
        console.log(`[OK] ${tabName} tab`);
      }
    } catch (e) { console.log(`Tab ${tabName} err:`, e.message); }
  }

  // Step 3: My Courses
  console.log('\n[3] My Courses...');
  await page.goto(`${LEARNER_URL}/my-courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  console.log('My Courses URL:', page.url());
  await ss(page, 'LB06-my-courses');

  // Step 4: Community cohorts
  for (const route of ['/community/cohorts', '/community/groups']) {
    await page.goto(`${LEARNER_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);
    console.log(`${route} →`, page.url());
    const safe = route.replace(/\//g, '-').replace(/^-/, '');
    await ss(page, `LB07-${safe}`);
  }

  await browser.close();
  console.log('\nDone');
}

main().catch(console.error);
