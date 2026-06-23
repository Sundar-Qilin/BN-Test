import { test, expect } from '@playwright/test';
import { login, waitForRecaptcha, EMAIL, PASSWORD } from './helpers/auth.js';

// Clear stored auth — these tests exercise the unauthenticated flow
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders all key elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'admin@gmail.com' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
  });

  test('shows required field alert on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('password show/hide toggle works', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Enter password' });
    await input.fill('secret123');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(input).toHaveValue('secret123');
  });

  test('forgot password link navigates to /forgot-password', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });
});

test.describe('Login & logout flow', () => {
  test('valid credentials redirect away from login', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/login/);
  });

  test('sign out returns to login page', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
