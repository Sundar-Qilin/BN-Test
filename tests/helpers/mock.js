// Shared API mock helper — all spec files import from here.
export const BACKEND = /budgetnista-be-production\.up\.railway\.app/;

export const MOCK_USER = {
  id: 1, email: 'superadmin@yopmail.com',
  first_name: 'Test', last_name: 'Admin',
  role: 'super_admin', is_active: true,
};

/** Mock all backend requests with an empty paginated list response. */
export async function mockAll(page) {
  await page.route(BACKEND, route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0, next: null, previous: null } }),
    })
  );
  // Module Library needs extra facet fields to avoid crashes
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/module-library\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { results: [], count: 0, next: null, previous: null,
          archived_count: 0, lesson_types: [], module_types: [], categories: [], tags: [], filters: [] },
      }),
    })
  );
  // Profile endpoint
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/auth\/profile\/?/,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: MOCK_USER }),
    })
  );
}

/** Mock a 403 response for a specific URL pattern — used in RBAC / IDOR tests. */
export async function mock403(page, pattern) {
  await page.route(pattern, route =>
    route.fulfill({
      status: 403, contentType: 'application/json',
      body: JSON.stringify({ success: false, error: 'Forbidden' }),
    })
  );
}

/** Mock a 400/422 validation error for a specific URL pattern. */
export async function mockValidationError(page, pattern, field = 'detail', msg = 'This field is required.') {
  await page.route(pattern, route =>
    route.fulfill({
      status: 400, contentType: 'application/json',
      body: JSON.stringify({ success: false, error: { [field]: [msg] } }),
    })
  );
}

/** Mock a successful POST/PATCH response. */
export async function mockSuccess(page, pattern, data = {}) {
  await page.route(pattern, route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    })
  );
}
