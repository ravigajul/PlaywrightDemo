import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Tier 1 — Navigation & Basic Assertions', () => {

  test.beforeAll(() => {
    fs.mkdirSync('test-results/screenshots', { recursive: true });
  });

  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('https://www.flooranddecor.com/');
    await expect(page).toHaveTitle(/Floor & Decor/i);
  });

  test('homepage URL is correct', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/flooranddecor\.com/);
  });

  test('main navigation links are visible', async ({ page }) => {
    await page.goto('/');
    // Wait for JS to render the navigation (SFCC nav is client-rendered)
    await page.waitForSelector('a[href="/tile"]', { timeout: 15_000 });
    await expect(page.locator('a[href="/tile"]').first()).toBeVisible();
    await expect(page.locator('a[href="/wood"]').first()).toBeVisible();
    await expect(page.locator('a[href="/vinyl"]').first()).toBeVisible();
    await expect(page.locator('a[href="/laminate"]').first()).toBeVisible();
  });

  test('navigate to Tile category page', async ({ page }) => {
    // Use direct navigation for reliability — nav click can trigger megamenu JS
    await page.goto('/tile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/tile/);
    await expect(page.locator('h1').first()).toContainText(/Tile/i);
  });

  test('navigate to Wood category page', async ({ page }) => {
    await page.goto('/wood');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1').first()).toContainText(/Wood/i);
  });

  test('full-page screenshot of homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'test-results/screenshots/homepage-full.png',
      fullPage: true,
    });
    console.log('Screenshot saved: test-results/screenshots/homepage-full.png');
  });

  test('viewport screenshot of tile category', async ({ page }) => {
    await page.goto('/tile');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({
      path: 'test-results/screenshots/tile-category.png',
      fullPage: false,
    });
    console.log('Screenshot saved: test-results/screenshots/tile-category.png');
  });

});
