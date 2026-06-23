import { test as setup } from '@playwright/test';
import { login, AUTH_FILE } from './helpers/auth.js';

setup('authenticate as admin', async ({ page }) => {
  await login(page);
  await page.context().storageState({ path: AUTH_FILE });
});
