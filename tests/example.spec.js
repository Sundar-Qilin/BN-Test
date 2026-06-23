import { test, expect } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { EMAIL } from './helpers/auth.js';

loadEnv();

// Session is pre-authenticated via auth.setup.js — no login step needed here.

// When auth.setup.js uses the reCAPTCHA mock (fake tokens), the backend returns
// 401 on all API calls. These interceptors prevent that 401 from triggering a
// login redirect so the dashboard navigation tests can verify page headings.
const BACKEND = /budgetnista-be-production\.up\.railway\.app/;

test.describe('Dashboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Playwright routes use LIFO order. Register from lowest to highest specificity:
    // general backend → module-library generic → facets → profile.

    // 1. Blanket mock — paginated shape for list endpoints.
    await page.route(BACKEND, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { results: [], count: 0, next: null, previous: null },
        }),
      })
    );

    // 2. Module Library — the component does `U?.lesson_types.length` which throws when
    // lesson_types is absent. Include it and other facet fields to prevent crashes.
    await page.route(
      /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/module-library\//,
      route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              results: [],
              count: 0,
              next: null,
              previous: null,
              archived_count: 0,
              lesson_types: [],
              module_types: [],
              categories: [],
              tags: [],
              filters: [],
            },
          }),
        })
    );

    // 3. Profile endpoint needs a shaped user object (LIFO wins over blanket mock).
    await page.route(
      /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/auth\/profile\/?/,
      route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 1,
              email: EMAIL,
              first_name: 'Test',
              last_name: 'Admin',
              role: 'super_admin',
              is_active: true,
            },
          }),
        })
    );
  });

  test.beforeEach(async ({ page }) => {
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
