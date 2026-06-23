export const AUTH_FILE = 'playwright/.auth/user.json';
export const EMAIL = process.env.ADMIN_EMAIL ?? 'superadmin@yopmail.com';
export const PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123';

// reCAPTCHA v3 loads lazily. If Sign In is clicked before the script is ready,
// grecaptcha.execute() never fires and the POST body has no recaptcha_token,
// causing the server to return 400 "This field is required."
// waitForRecaptcha() ensures execute() can run before the form submits.
export async function waitForRecaptcha(page) {
  await page.waitForFunction(
    () => typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function',
    { timeout: 15000 }
  ).catch(() => {
    // Proceed anyway — some environments block the script
  });
}

// BACKEND BYPASS (activate once backend is updated):
// When the backend is configured to accept a bypass token without Google
// verification (RECAPTCHA_BYPASS_TOKEN env var on Railway), set
// RECAPTCHA_BYPASS_TOKEN=playwright-test-token in the local .env file.
// This intercept injects that token into every login POST so the server
// skips the real verification and automated CI login works end-to-end.
async function injectBypassToken(page) {
  const bypassToken = process.env.RECAPTCHA_BYPASS_TOKEN;
  if (!bypassToken) return;

  await page.route('**/api/v1/admin/auth/login/**', async route => {
    const request = route.request();
    let body = {};
    try { body = JSON.parse(request.postData() || '{}'); } catch {}
    await route.continue({
      postData: JSON.stringify({ ...body, recaptcha_token: bypassToken }),
      headers: { ...request.headers(), 'content-type': 'application/json' },
    });
  });
}

export async function login(page) {
  await injectBypassToken(page);
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'admin@gmail.com' }).fill(EMAIL);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(PASSWORD);
  // Wait for reCAPTCHA to be ready so execute() runs before form submits
  await waitForRecaptcha(page);
  await page.getByRole('button', { name: 'Sign in' }).click();
  // waitForURL callback receives a URL object (not a string) in Playwright ≥1.36
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
}
