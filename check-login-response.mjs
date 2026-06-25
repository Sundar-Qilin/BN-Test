// Check what the real login API returns
import { chromium } from '@playwright/test';

const ADMIN_URL = 'https://admin.dev.budgetnista-admin.qilinlab.com';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Capture the actual login response body
  await page.route(/\/api\/v1\/admin\/auth\/login\/?$/, async route => {
    const response = await route.fetch();
    const body = await response.text();
    console.log('[LOGIN RESPONSE] Status:', response.status());
    console.log('[LOGIN RESPONSE] Body:', body);
    // Always mock to success shape
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        error: null,
        data: {
          user: {
            id: 1,
            email: 'superadmin@yopmail.com',
            first_name: 'Test',
            last_name: 'Admin',
            role: 'super_admin',
            is_active: true,
          },
          tokens: {
            access: 'mock-access-token',
            refresh: 'mock-refresh-token',
          },
          redirect_to: null,
        },
      }),
    });
  });

  await page.goto(`${ADMIN_URL}/login`);
  await page.waitForTimeout(2000);

  await page.getByRole('textbox', { name: 'admin@gmail.com' }).fill('superadmin@yopmail.com');
  await page.getByRole('textbox', { name: 'Enter password' }).fill('Admin@123');

  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 8000 }
  ).catch(() => {});
  await page.waitForTimeout(500);

  // Listen for JS errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[JS ERROR]', msg.text());
  });
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(5000);

  const url = page.url();
  console.log('\nPost-login URL:', url);

  // Get all text on login page if still there
  if (url.includes('/login')) {
    const bodyText = await page.locator('body').textContent();
    console.log('Page text:', bodyText?.trim().slice(0, 500));
  }

  await ctx.close();
  await browser.close();
}

main().catch(e => console.error('FATAL:', e));
