/**
 * Focused script to capture course settings with Cohorts section.
 * We need to mock the course detail endpoint to return a proper course object.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';
const SS_DIR = 'C:\\BN Test\\screenshots\\recheck';
fs.mkdirSync(SS_DIR, { recursive: true });

// Mock course data - a course with cohorts enabled
const MOCK_COURSE = {
  success: true, error: null,
  data: {
    id: 1,
    title: 'Course to Yap',
    slug: 'course-to-yap',
    description: 'A test course',
    status: 'published',
    is_published: true,
    cohorts_enabled: false,
    cohort_settings: {
      enabled: false,
      proximity_radius_km: 50,
      min_cohort_size: 5,
      max_cohort_size: 15,
      proximity_assignment: true
    },
    organisation: { id: 1, name: 'Budgetnista', slug: 'budgetnista' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
};

const MOCK_COURSE_SETTINGS = {
  success: true, error: null,
  data: {
    id: 1,
    title: 'Course to Yap',
    slug: 'course-to-yap',
    cohorts_enabled: false,
    cohort_proximity_radius_km: 50,
    cohort_min_size: 5,
    cohort_max_size: 15,
    cohort_proximity_assignment: true,
    allow_late_enrollment: true,
    enrollment_deadline_days: 3
  }
};

const ADMIN_PROFILE_RESP = {
  success: true, error: null,
  data: {
    id: 1, email: 'superadmin@yopmail.com', first_name: 'Super', last_name: 'Admin',
    role: 'super_admin', is_active: true, is_email_verified: true,
    organisation: {
      id: 1, name: 'Budgetnista', slug: 'budgetnista',
      features: ['cohorts', 'forums', 'pathways', 'commerce'], is_active: true
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

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Set up mocks
  // Catch-all first
  await page.route(/budgetnista-be-production\.up\.railway\.app/, async route => {
    const url = route.request().url();
    try {
      const resp = await route.fetch({ timeout: 15000 });
      if (resp.ok()) return route.fulfill({ response: resp });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY) });
    } catch {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY) });
    }
  });

  // Specific mocks (higher priority, registered after catch-all)
  await page.route(/\/api\/v1\/notifications\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NOTIFS) }));

  await page.route(/\/api\/v1\/auth\/tenant-redirect\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, error: null, data: { redirect_url: null } }) }));

  await page.route(/\/api\/v1\/auth\/token\/refresh\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { access: 'mock-v4', refresh: 'mock-r-v4' } }) }));

  await page.route(/\/api\/v1\/admin\/auth\/profile\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ADMIN_PROFILE_RESP) }));

  // Course settings endpoint
  await page.route(/\/api\/v1\/admin\/courses\/course-to-yap\/settings\//, r => {
    console.log('[MOCK] course settings');
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_COURSE_SETTINGS) });
  });

  // Course detail endpoint
  await page.route(/\/api\/v1\/admin\/courses\/course-to-yap\//, r => {
    console.log('[MOCK] course detail');
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_COURSE) });
  });

  await page.route(/\/api\/v1\/admin\/auth\/login\//, r =>
    r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true, error: null,
        data: {
          user: ADMIN_PROFILE_RESP.data,
          tokens: { access: 'mock-v4', refresh: 'mock-r-v4' },
          redirect_to: null
        }
      }) }));

  // Log requests
  page.on('request', req => {
    if (req.url().includes('budgetnista-be')) {
      console.log(`[REQ] ${req.method()} ${req.url().split('.com')[1]}`);
    }
  });

  // Login
  console.log('[1] Logging in...');
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  const emailInput = page.locator('input').first();
  await emailInput.fill('superadmin@yopmail.com');
  await page.locator('input[type="password"]').fill('Admin@123');
  const signInBtn = page.locator('button').filter({ hasText: /sign in/i });
  await signInBtn.first().click();
  try { await page.waitForURL('**/dashboard**', { timeout: 15000 }); } catch {}
  console.log('Post-login URL:', page.url());

  if (page.url().includes('/login')) {
    console.log('Login failed');
    await browser.close();
    return;
  }

  // Navigate to course settings
  console.log('\n[2] Navigating to course settings...');
  await page.goto(`${ADMIN_URL}/courses/course-to-yap/settings`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  console.log('Settings URL:', page.url());
  await ss(page, 'CS01-course-settings-top');

  // Get all text on the page
  const pageText = await page.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
    h2: [...document.querySelectorAll('h2')].map(e => e.textContent.trim()),
    h3: [...document.querySelectorAll('h3')].map(e => e.textContent.trim()),
    labels: [...document.querySelectorAll('label')].map(e => e.textContent.trim()),
    body: document.body.textContent.slice(0, 1000)
  }));
  console.log('Page text:', JSON.stringify(pageText, null, 2));

  // Scroll down to find cohorts section
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);
    const cohortSection = await page.$('*:has-text("Group learners into cohorts")');
    const cohortLabel = await page.$('label:has-text("cohort"), [class*="cohort"]');
    if (cohortSection || cohortLabel) {
      console.log('Found cohorts section!');
      if (cohortSection) await cohortSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await ss(page, `CS0${i+2}-cohorts-section`);
      break;
    }
    await ss(page, `CS0${i+2}-scroll-${i}`);
  }

  // Also try: look for any toggle/switch components
  const toggles = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input[type="checkbox"], input[type="radio"], [role="switch"]')];
    return inputs.map(el => ({
      type: el.type || el.getAttribute('role'),
      checked: el.checked,
      id: el.id,
      name: el.name,
      label: el.closest('label')?.textContent?.trim() || el.parentElement?.textContent?.trim()?.slice(0, 100)
    }));
  });
  console.log('Toggles found:', JSON.stringify(toggles, null, 2));

  // Look for sections/cards with "Cohort" heading
  const sections = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, [class*="section-title"], [class*="heading"]')];
    return headings.map(h => ({
      tag: h.tagName,
      text: h.textContent.trim(),
      parent: h.parentElement?.className?.slice(0, 100)
    }));
  });
  console.log('All headings:', JSON.stringify(sections, null, 2));

  await ss(page, 'CS-final');

  await browser.close();
  console.log('Done');
}

main().catch(console.error);
