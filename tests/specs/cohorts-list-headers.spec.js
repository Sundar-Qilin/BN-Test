/**
 * Quick targeted test: get the exact column headers of the cohorts list table
 * when data is populated.
 */
import { test } from '@playwright/test';
import { mockAll } from '../helpers/mock.js';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = 'C:\\BN Test\\screenshots\\recheck';
function ss(name) { return path.join(SCREENSHOT_DIR, `${name}.png`); }

const MOCK_COHORT = {
  id: 1, name: 'Week 24 — Course to Yap', status: 'active', origin: 'auto',
  course: { id: 10, title: 'Course to Yap', slug: 'course-to-yap' },
  organisation: { id: 5, name: 'Qilin Lab' },
  iso_week: 24, iso_year: 2026, start_date: '2026-06-08', end_date: '2026-06-14',
  member_count: 3, cohort_duration_weeks: 4,
};

test('HEADERS: Cohorts list column headers', async ({ page }) => {
  await mockAll(page);
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohorts\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [MOCK_COHORT], count: 1, next: null, previous: null } }),
    })
  );
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/cohort-flags\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0 } }),
    })
  );

  await page.goto('/cohorts');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: ss('FINAL-cohorts-list-with-data'), fullPage: true });

  // Get all text from the table area
  const tableText = await page.locator('table, [class*="table"], [role="table"]').first().innerText().catch(() => '');
  console.log('TABLE TEXT:\n' + tableText);

  // Get all heading-like elements inside the table
  const thText = await page.locator('th').allInnerTexts().catch(() => []);
  console.log('TH ELEMENTS:', JSON.stringify(thText));

  // Get column header divs (many modern tables use divs)
  const headerRow = await page.locator('[class*="header-row"], [class*="headerRow"], thead tr').first().innerText().catch(() => '');
  console.log('HEADER ROW:', headerRow);

  // Get ALL text in the main content area
  const mainText = await page.locator('main, [class*="content"], [role="main"]').first().innerText().catch(() => '');
  console.log('MAIN CONTENT TEXT:\n' + mainText);

  // Specific search for sort/column buttons in the table
  const sortBtns = await page.locator('[class*="sort"], [aria-sort], [data-testid*="column"]').allInnerTexts().catch(() => []);
  console.log('SORT BUTTONS:', JSON.stringify(sortBtns));

  // Get the full body text (just the main area)
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const startIdx = bodyText.indexOf('Cohorts\nWeekly peer');
  const relevantText = startIdx > -1 ? bodyText.substring(startIdx, startIdx + 2000) : bodyText.substring(0, 2000);
  console.log('RELEVANT PAGE TEXT:\n' + relevantText);
});

test('HEADERS: Course settings cohort section (via mockAll + course mock)', async ({ page }) => {
  await mockAll(page);
  // Mock course list with a real course that has cohort settings
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/courses\/(?!library)/,
    route => {
      const url = route.request().url();
      if (url.match(/\/courses\/10\//)) {
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 10, title: 'Course to Yap', slug: 'course-to-yap', status: 'published',
              cohorts_enabled: false, cohort_duration_weeks: 4, cohort_proximity_threshold_days: 7,
            },
          }),
        });
      }
      // Course list
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { results: [{ id: 10, title: 'Course to Yap', slug: 'course-to-yap', status: 'published' }], count: 1, next: null, previous: null },
        }),
      });
    }
  );
  // Mock module-library
  await page.route(
    /budgetnista-be-production\.up\.railway\.app\/api\/v1\/admin\/module-library\//,
    route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results: [], count: 0, archived_count: 0, lesson_types: [], module_types: [], categories: [], tags: [], filters: [] } }),
    })
  );

  // Navigate to course settings via the courses list
  await page.goto('/courses/10/settings');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: ss('FINAL-course-settings-full'), fullPage: true });

  const url = page.url();
  console.log('COURSE SETTINGS URL:', url);

  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('COURSE SETTINGS BODY (first 5000):\n' + bodyText.substring(0, 5000));

  // Scroll and screenshot different parts
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.screenshot({ path: ss('FINAL-course-settings-mid'), fullPage: false });
  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.screenshot({ path: ss('FINAL-course-settings-bottom'), fullPage: false });
});
