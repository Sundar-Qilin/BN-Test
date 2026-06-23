/**
 * One-time headed login to save auth state.
 * Run via:  npm run auth:save
 *
 * A real browser window opens. Log in normally — reCAPTCHA passes
 * because a human interaction produces a high trust score.
 * The session is saved to playwright/.auth/user.json and reused
 * by all navigation tests until it expires.
 */
import { test as setup } from '@playwright/test';
import { AUTH_FILE } from './helpers/auth.js';

// Guard: skip when not explicitly invoked via `npm run auth:save`.
// Without this, `npx playwright test` runs this project headlessly, waits 2 min
// for human input, and times out.
setup.skip(!process.env.MANUAL_AUTH, 'Run via npm run auth:save (sets MANUAL_AUTH=1)');

setup('save auth state via manual login', async ({ page }) => {
  setup.setTimeout(150000); // 2.5 min — time for a human to log in
  await page.goto('/login');
  console.log('\n----------------------------------------');
  console.log('  Browser is open. Please log in now.');
  console.log('  You have 2 minutes.');
  console.log('----------------------------------------\n');
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 120000 });
  await page.context().storageState({ path: AUTH_FILE });
  console.log('\n✓ Session saved to', AUTH_FILE);
});
