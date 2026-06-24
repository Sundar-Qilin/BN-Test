// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://admin.dev.budgetnista-admin.qilinlab.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'playwright-report/results.json' }], ['list']],
  // 60 s per test — remote navigation to a cold server can exceed the 30 s default.
  timeout: 60000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Explicit navigation timeout so page.goto / waitForURL have headroom on slow networks.
    navigationTimeout: 45000,
  },

  projects: [
    // ── Automated setup ────────────────────────────────────────────────────────
    // Runs auth.setup.js. Works once the backend sets RECAPTCHA_BYPASS_TOKEN.
    // Uses --disable-blink-features=AutomationControlled to reduce bot detection.
    {
      name: 'setup',
      testMatch: /auth\.setup\.js$/,
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },

    // ── Manual session seed ────────────────────────────────────────────────────
    // Run once via:  npm run auth:save
    // Opens a headed browser — log in normally, reCAPTCHA passes for humans.
    // Saves playwright/.auth/user.json for all navigation tests to reuse.
    {
      name: 'setup-manual',
      testMatch: /auth\.setup\.manual\.js/,
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
      },
    },

    // ── Auth flow tests ────────────────────────────────────────────────────────
    // Tests the login page itself — run without any stored session.
    // Login & logout flow tests require RECAPTCHA_BYPASS_TOKEN accepted by the backend.
    {
      name: 'auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /auth\.spec\.js$/,
    },

    // ── Authenticated tests ────────────────────────────────────────────────────
    // All navigation/dashboard tests reuse the saved session — no re-login per test.
    // Depends on either 'setup' (automated) or a previously saved manual session.
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.(setup|spec)\.js/,
    },
  ],
});
