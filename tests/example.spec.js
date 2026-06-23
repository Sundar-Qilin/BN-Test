import { test, expect } from '@playwright/test';
import { waitForRecaptcha } from './helpers/auth.js';

// Session is pre-authenticated via auth.setup.js — no login step needed here.

test.describe('Dashboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    // If the saved session expired, the app may redirect back to /login.
    // waitForRecaptcha() ensures the sign-in form is ready before any re-auth attempt.
    await waitForRecaptcha(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible({ timeout: 15000 });
  });

  test('Analytics dashboard loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  });

  // Each entry: nav link text, expected heading, whether it lives inside the <banner>
  const pages = [
    { link: 'Organizations',      heading: 'Organizations',      inBanner: true  },
    { link: 'Divisions & Access', heading: 'Divisions & Access', inBanner: true  },
    { link: 'Users',              heading: 'Users',              inBanner: true  },
    { link: 'Invitees',           heading: 'Invitees',           inBanner: true  },
    { link: 'Courses',            heading: 'Courses',            inBanner: true  },
    { link: 'Media library',      heading: 'Media library',      inBanner: true  },
    { link: 'Instructors',        heading: 'Instructors',        inBanner: true  },
    { link: 'Bundles',            heading: 'Bundles',            inBanner: true  },
    { link: 'Module Library',     heading: 'Module Library',     inBanner: true  },
    { link: 'Pathways',           heading: 'Pathways',           inBanner: true  },
    { link: 'Forums',             heading: 'Forums',             inBanner: false },
    { link: 'Moderation',         heading: 'Moderation',         inBanner: false, exact: true },
    { link: 'Rewards',            heading: 'Rewards',            inBanner: true  },
    { link: 'Products',           heading: 'Products',           inBanner: true  },
    { link: 'Transactions',       heading: 'Transactions',       inBanner: true  },
    { link: 'Billing',            heading: 'Billing',            inBanner: true  },
    { link: 'Settings',           heading: 'Settings',           inBanner: false },
  ];

  for (const { link, heading, inBanner, exact } of pages) {
    test(`${heading} page loads`, async ({ page }) => {
      await page.getByRole('link', { name: link }).click();
      const locator = inBanner
        ? page.getByRole('banner').getByRole('heading', { name: heading, exact })
        : page.getByRole('heading', { name: heading, exact });
      await expect(locator).toBeVisible({ timeout: 10000 });
    });
  }

  test('Notifications page loads via Settings', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 });
    await page.getByLabel('Primary').getByRole('link', { name: 'Notifications' }).click();
    await expect(
      page.getByRole('banner').getByRole('heading', { name: 'Notifications' })
    ).toBeVisible({ timeout: 10000 });
  });
});
