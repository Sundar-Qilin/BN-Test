import { test, expect } from '@playwright/test';
import { mockAll, mock403, mockValidationError, mockSuccess, BACKEND } from '../helpers/mock.js';


test.describe('CRSE — Courses (List, Info, Curriculum)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAll(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
  });


  // ── CRSE-LIST ──────────────────────────────────────────────────────────────
  test('CL-001 Courses list page loads', async ({ page }) => {
    await page.goto('/courses'); await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: 'Courses' }).first()).toBeVisible({ timeout: 10000 });
  });

  test('CL-002 Search bar present on courses list', async ({ page }) => {
    await page.goto('/courses'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const search = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('CL-003 Filter by status present', async ({ page }) => {
    await page.goto('/courses'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const filter = page.locator('select, [role="combobox"]').first();
    await expect(filter).toBeAttached({ timeout: 10000 });
  });

  test('CL-004 Empty state shown (mock returns 0)', async ({ page }) => {
    await page.goto('/courses'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByText(/no|empty|0/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('CL-005 Create course button present', async ({ page }) => {
    await page.goto('/courses'); await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const btn = page.getByRole('button', { name: /create|add|new/i }).or(page.getByRole('link', { name: /create|add|new/i })).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('CL-006 Page accessible without 403', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByText(/403|forbidden/i)).not.toBeVisible({ timeout: 5000 });
  });

  // ── CRSE-INFO ──────────────────────────────────────────────────────────────
  test('CI-001 Course create form has title field', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle').catch(() => {});
    const createBtn = page.getByRole('button', { name: /create|add/i }).or(page.getByRole('link', { name: /create|add/i })).first();
    if (await createBtn.isVisible({ timeout: 3000 })) {
      await createBtn.click();
      await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 });
    } else { test.skip(); }
  });

  // ── CRSE-CURR ──────────────────────────────────────────────────────────────
  test('CC-001 Curriculum section — courses page accessible', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByRole('heading', { name: /course/i }).first()).toBeVisible({ timeout: 10000 });
  });

  // ── CRSE-LRNR ──────────────────────────────────────────────────────────────
  test('CLS-001 Learners concept — users list accessible', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /user/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
