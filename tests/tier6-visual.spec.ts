import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// IMPORTANT: Run `npm run tier6:update` FIRST to create baseline snapshots.
// Subsequent runs with `npm run tier6` compare pixel-by-pixel against the baseline.
// Baselines are stored in: tests/tier6-visual.spec.ts-snapshots/

test.describe('Tier 6 — Visual Regression Testing', () => {

  test.beforeAll(() => {
    fs.mkdirSync('test-results/screenshots', { recursive: true });
  });

  test('homepage — full page visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    // Disable animations so snapshots are deterministic
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      // Mask dynamic areas: live chat, promo banners
      mask: [
        page.locator('[class*="chat"], [id*="chat"]').first(),
        page.locator('[class*="promo-banner"], [class*="announcement"]').first(),
      ],
      maxDiffPixelRatio: 0.03,
    });
  });

  test('tile category — viewport snapshot with masking', async ({ page }) => {
    await page.goto('/tile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    await expect(page).toHaveScreenshot('tile-category-viewport.png', {
      fullPage: false,
      animations: 'disabled',
      mask: [
        page.locator('[class*="store-name"], [class*="store-selector"]').first(),
      ],
      maxDiffPixelRatio: 0.03,
    });
  });

  test('header component — element-level snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; }' });
    // Element-level screenshot — isolate just the header component
    const header = page.locator('header, [class*="header"]').first();
    await expect(header).toHaveScreenshot('header-component.png', {
      animations: 'disabled',
    });
  });

  test('before/after — visual diff when filter is applied', async ({ page }) => {
    // BEFORE: no filter applied
    await page.goto('/tile');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/screenshots/visual-before-filter.png' });
    console.log('BEFORE screenshot: test-results/screenshots/visual-before-filter.png');

    // AFTER: White color filter applied via URL
    await page.goto('/tile?prefn1=color&prefv1=White');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/screenshots/visual-after-filter.png' });
    console.log('AFTER  screenshot: test-results/screenshots/visual-after-filter.png');

    // Logical verification: URL confirms the filter is active
    await expect(page).toHaveURL(/prefv1=White/);
    console.log('\nOpen both screenshots side-by-side to see the visual difference!');
  });

  test('wood category — snapshot with pixel threshold', async ({ page }) => {
    await page.goto('/wood');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; }' });
    await expect(page).toHaveScreenshot('wood-category.png', {
      fullPage: false,
      animations: 'disabled',
      // threshold: per-pixel color diff tolerance (0-1)
      threshold: 0.2,
      maxDiffPixelRatio: 0.05,
    });
  });

});
