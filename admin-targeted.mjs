/**
 * Targeted Admin Exploration - focusing on what we still need:
 * 1. Cohorts tab with all filter dropdowns open
 * 2. Flags tab with Status dropdown open (to see all options)
 * 3. Course settings with Cohorts toggle
 * 4. Cohort detail Manage dropdown
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const SS_DIR = 'C:\\BN Test\\screenshots\\recheck';
fs.mkdirSync(SS_DIR, { recursive: true });

// Full profile with organisation that has cohorts feature
const ADMIN_LOGIN_RESP = {
  success: true, error: null,
  data: {
    user: {
      id: 1,
      email: 'superadmin@yopmail.com',
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      is_active: true,
      is_email_verified: true,
      organisation: {
        id: 1,
        name: 'Budgetnista',
        slug: 'budgetnista',
        features: ['cohorts', 'forums', 'pathways', 'commerce'],
        is_active: true
      }
    },
    tokens: { access: 'mock-access-v3', refresh: 'mock-refresh-v3' },
    redirect_to: null
  }
};

const ADMIN_PROFILE_RESP = {
  success: true, error: null,
  data: {
    id: 1,
    email: 'superadmin@yopmail.com',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'super_admin',
    is_active: true,
    is_email_verified: true,
    organisation: {
      id: 1,
      name: 'Budgetnista',
      slug: 'budgetnista',
      features: ['cohorts', 'forums', 'pathways', 'commerce'],
      is_active: true
    },
    permissions: ['cohorts.view', 'cohorts.manage', 'courses.view', 'courses.manage'],
    is_super_admin: true
  }
};

const EMPTY = { success: true, error: null, data: { results: [], count: 0, next: null, previous: null } };
const NOTIFS = { success: true, error: null, data: { count: 0, unread_count: 0, results: [] } };

async function ss(page, name) {
  const p = path.join(SS_DIR, `${name}.png`);
  console.log(`[SS] ${name}`);
  return page.screenshot({ path: p, fullPage: false });
}

async function setup(page) {
  // Catch-all FIRST (lowest LIFO priority)
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    const url = route.request().url();
    try {
      const resp = await route.fetch({ timeout: 15000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      console.log(`[FALLBACK] ${url.split('/').slice(-3).join('/')}`);
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
      body: JSON.stringify({ success: true, error: null,
        data: { access: 'mock-access-v3', refresh: 'mock-refresh-v3' } }) }));

  // Profile
  await page.route(/\/api\/v1\/admin\/auth\/profile\//, r => {
    console.log('[MOCK] profile');
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ADMIN_PROFILE_RESP) });
  });

  // Login
  await page.route(/\/api\/v1\/admin\/auth\/login\//, r => {
    console.log('[MOCK] login');
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ADMIN_LOGIN_RESP) });
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await setup(page);

  // Log all network requests for debugging
  page.on('request', req => {
    if (req.url().includes('budgetnista-be')) {
      console.log(`[REQ] ${req.method()} ${req.url().replace('https://budgetnista-be-production.up.railway.app', '')}`);
    }
  });

  // Step 1: Login
  console.log('\n[1] Login...');
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check selectors
  const emailSel = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')];
    return inputs.map(i => ({ type: i.type, name: i.name, id: i.id, placeholder: i.placeholder }));
  });
  console.log('Form inputs:', JSON.stringify(emailSel));

  const btns = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    return buttons.map(b => ({ type: b.type, text: b.textContent.trim() }));
  });
  console.log('Buttons:', JSON.stringify(btns));

  // Fill the form
  const emailInput = page.locator('input').first();
  await emailInput.fill('superadmin@yopmail.com');
  await page.waitForTimeout(300);

  const passInput = page.locator('input[type="password"]');
  await passInput.fill('Admin@123');
  await page.waitForTimeout(300);

  // Click Sign in button
  const signInBtn = page.locator('button').filter({ hasText: /sign in/i });
  const btnCount = await signInBtn.count();
  console.log('Sign in button count:', btnCount);

  if (btnCount > 0) {
    await signInBtn.first().click();
  } else {
    await passInput.press('Enter');
  }

  // Wait for navigation
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  } catch {
    await page.waitForTimeout(3000);
  }

  console.log('Post-login URL:', page.url());
  await ss(page, 'Z01-post-login');

  if (page.url().includes('/login')) {
    console.log('Still on login - checking for errors...');
    const errors = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="error"], [role="alert"]')].map(e => e.textContent.trim())
    );
    console.log('Errors:', errors);
    await browser.close();
    return;
  }

  // Step 2: Cohorts page
  console.log('\n[2] /cohorts page...');
  await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  console.log('Cohorts URL:', page.url());

  const pageText = await page.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
    body: document.body.textContent.slice(0, 500)
  }));
  console.log('Cohorts page content:', JSON.stringify(pageText));

  await ss(page, 'Z02-cohorts-page');

  if (page.url().includes('/login') || pageText.body.includes("don't have access")) {
    console.log('Access denied or redirected. Trying to intercept cohort-flags check...');

    // Remove existing routes and add a more aggressive mock
    await page.unrouteAll();
    await setup(page);

    // Also mock the cohort-flags permission check endpoint directly
    await page.route(/\/api\/v1\/admin\/cohort-flags\/.*limit=1/, r => {
      console.log('[MOCK] cohort-flags permission check');
      return r.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, error: null, data: { results: [], count: 0, next: null, previous: null } }) });
    });

    await page.goto(`${ADMIN_URL}/cohorts`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    console.log('After re-mock, Cohorts URL:', page.url());
    await ss(page, 'Z02b-cohorts-retry');
  }

  // Step 3: Open cohorts tab filter dropdowns one by one
  console.log('\n[3] Cohorts tab filters...');
  const cohortFilters = [
    { text: 'All statuses', filename: 'Z03-filter-statuses' },
    { text: 'All courses', filename: 'Z04-filter-courses' },
    { text: 'All organisations', filename: 'Z05-filter-orgs' },
    { text: 'All origins', filename: 'Z06-filter-origins' },
  ];

  for (const filter of cohortFilters) {
    try {
      // Find the button with this text
      const btn = page.locator(`button, [role="button"], [role="combobox"]`).filter({ hasText: filter.text });
      if (await btn.count() > 0) {
        await btn.first().click();
        await page.waitForTimeout(800);
        await ss(page, filter.filename);
        console.log(`[OK] ${filter.text} dropdown captured`);
        // Get the options
        const options = await page.evaluate(() => {
          const items = [...document.querySelectorAll('[role="option"], [role="menuitem"], [data-value], li')];
          return items.map(e => e.textContent.trim()).filter(t => t);
        });
        console.log(`  Options:`, options.slice(0, 20));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      } else {
        console.log(`[SKIP] '${filter.text}' not found`);
      }
    } catch (e) {
      console.log(`[ERR] ${filter.text}:`, e.message);
    }
  }

  // Step 4: Flags tab
  console.log('\n[4] Flags tab...');
  try {
    const flagsTab = page.locator('[role="tab"]').filter({ hasText: 'Flags' });
    if (await flagsTab.count() > 0) {
      await flagsTab.click();
      await page.waitForTimeout(1500);
      await ss(page, 'Z07-flags-tab');

      // Status dropdown on flags
      const statusBtn = page.locator('button, [role="button"], [role="combobox"]').filter({ hasText: 'Open' });
      if (await statusBtn.count() > 0) {
        await statusBtn.first().click();
        await page.waitForTimeout(600);
        await ss(page, 'Z08-flags-status-dropdown');
        const options = await page.evaluate(() =>
          [...document.querySelectorAll('[role="option"], [role="menuitem"], li[data-value]')].map(e => e.textContent.trim())
        );
        console.log('[Flags Status options]:', options);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      }

      // Kind dropdown on flags
      const kindBtn = page.locator('button, [role="button"], [role="combobox"]').filter({ hasText: 'All kinds' });
      if (await kindBtn.count() > 0) {
        await kindBtn.first().click();
        await page.waitForTimeout(600);
        await ss(page, 'Z09-flags-kind-dropdown');
        const options = await page.evaluate(() =>
          [...document.querySelectorAll('[role="option"], [role="menuitem"], li[data-value]')].map(e => e.textContent.trim())
        );
        console.log('[Flags Kind options]:', options);
        await page.keyboard.press('Escape');
      }
    }
  } catch (e) {
    console.log('[ERR] Flags tab:', e.message);
  }

  // Step 5: Cohort detail page
  console.log('\n[5] Cohort detail /cohorts/10...');
  await page.goto(`${ADMIN_URL}/cohorts/10`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  console.log('Cohort detail URL:', page.url());
  await ss(page, 'Z10-cohort-detail');

  if (!page.url().includes('/login')) {
    // Manage dropdown
    try {
      const manageBtn = page.locator('button').filter({ hasText: 'Manage' });
      if (await manageBtn.count() > 0) {
        await manageBtn.first().click();
        await page.waitForTimeout(600);
        await ss(page, 'Z11-manage-dropdown');
        const options = await page.evaluate(() =>
          [...document.querySelectorAll('[role="menuitem"], [role="option"]')].map(e => e.textContent.trim())
        );
        console.log('[Manage options]:', options);
        await page.keyboard.press('Escape');
      }
    } catch (e) { console.log('[ERR] Manage:', e.message); }

    // Activity tab
    try {
      const activityTab = page.locator('[role="tab"]').filter({ hasText: 'Activity' });
      if (await activityTab.count() > 0) {
        await activityTab.click();
        await page.waitForTimeout(1500);
        await ss(page, 'Z12-cohort-activity');
      }
    } catch (e) { console.log('[ERR] Activity:', e.message); }
  }

  // Step 6: Course settings with cohorts
  console.log('\n[6] Course settings...');
  await page.goto(`${ADMIN_URL}/courses`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  console.log('Courses URL:', page.url());
  await ss(page, 'Z13-courses-list');

  // Get course links
  const courseLinks = await page.evaluate(() => {
    return [...document.querySelectorAll('a[href*="/courses/"]')]
      .map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }))
      .filter(l => l.href && !l.href.endsWith('/courses/'))
      .slice(0, 5);
  });
  console.log('Course links:', courseLinks);

  // Try to navigate to course settings
  for (const link of courseLinks) {
    const match = link.href.match(/\/courses\/([^/]+)/);
    if (!match) continue;
    const courseId = match[1];
    if (courseId === 'new' || courseId === 'create') continue;

    const settingsUrl = `${ADMIN_URL}/courses/${courseId}/settings`;
    console.log('Trying course settings:', settingsUrl);
    await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log('Settings URL:', url);

    if (!url.includes('/login') && !url.includes('/courses?')) {
      await ss(page, 'Z14-course-settings');

      // Scroll down to find Cohorts section
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(200);
        const cohortSection = await page.$('text="Group learners into cohorts", text="Cohorts", [class*="cohort"]');
        if (cohortSection) {
          await cohortSection.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await ss(page, 'Z15-course-settings-cohorts');
          console.log('[OK] Found cohorts section in course settings');
          break;
        }
      }
      await ss(page, 'Z16-course-settings-bottom');
      break;
    }
  }

  // Try with known cohort course
  await page.goto(`${ADMIN_URL}/courses/course-to-yap/settings`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  console.log('Known course settings URL:', page.url());
  if (!page.url().includes('/login') && !page.url().includes('workspace')) {
    await ss(page, 'Z17-course-to-yap-settings');
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    await ss(page, 'Z17b-course-to-yap-settings-scrolled');
  }

  await browser.close();
  console.log('\n=== DONE ===');
}

main().catch(console.error);
