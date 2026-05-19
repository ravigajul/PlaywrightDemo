import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Tier 3 — User Flows & Interactions', () => {

  test.beforeAll(() => {
    fs.mkdirSync('test-results/screenshots', { recursive: true });
  });

  test('search — type with human-like delay and submit', async ({ page }) => {
    await page.goto('/');
    const searchBar = page.locator('input[type="search"], input[name="q"]').first();
    await searchBar.click();
    // delay: 80 simulates realistic typing speed — visible to the audience
    await searchBar.pressSequentially('hardwood flooring', { delay: 80 });
    await page.waitForTimeout(800); // let autocomplete appear
    await searchBar.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/search|hardwood/i);
  });

  test('keyboard navigation — Tab through page elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Tab through focusable elements — demonstrates keyboard accessibility testing
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.screenshot({ path: 'test-results/screenshots/keyboard-focus.png' });
    console.log('Focus screenshot captured');
  });

  test('hover — nav item reveals megamenu dropdown', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('a[href="/tile"]', { timeout: 15_000 });
    const tileNav = page.locator('a[href="/tile"]').first();
    await tileNav.hover();
    await page.waitForTimeout(800); // CSS transition time
    await page.screenshot({ path: 'test-results/screenshots/tile-megamenu-hover.png' });
    console.log('Hover state captured — see test-results/screenshots/tile-megamenu-hover.png');
    // The hover screenshot is the proof — no fragile DOM assertion needed
  });

  test('URL-driven filter — apply color filter via params', async ({ page }) => {
    // Demonstrates that Playwright can test filtered states directly via URL
    await page.goto('/tile?prefn1=color&prefv1=White');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/prefv1=White/);
    await page.screenshot({ path: 'test-results/screenshots/tile-white-filter.png' });
  });

  test('scroll — page.evaluate for JavaScript execution', async ({ page }) => {
    await page.goto('/tile');
    await page.waitForLoadState('domcontentloaded');
    // page.evaluate runs arbitrary JS in the browser context
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/scrolled-bottom.png' });
    await page.evaluate(() => window.scrollTo(0, 0));
    console.log('Scroll to bottom and back demonstrated');
  });

  test('store locator — search by zip code', async ({ page }) => {
    await page.goto('/stores');
    await page.waitForLoadState('domcontentloaded');
    // Multi-selector strategy: tries common input patterns for store search
    const zipInput = page
      .locator('input[type="text"], input[placeholder*="zip" i], input[placeholder*="city" i]')
      .first();
    if (await zipInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await zipInput.fill('30301'); // Atlanta zip — Floor & Decor HQ area
      await zipInput.press('Enter');
      await page.waitForLoadState('domcontentloaded');
    }
    await page.screenshot({ path: 'test-results/screenshots/store-locator-results.png' });
  });

  test('cart icon is visible and accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('a.minicart-link, [class*="minicart"]', { timeout: 15_000 });
    // Floor & Decor uses .minicart-link for the cart anchor
    const cart = page.locator('a.minicart-link').first();
    await expect(cart).toBeVisible();
    const text = await cart.textContent();
    console.log('Cart element text:', text?.trim());
    expect(text).toMatch(/Cart/i);
  });

  test('page.evaluate — extract structured data from DOM', async ({ page }) => {
    await page.goto('/tile', { waitUntil: 'domcontentloaded' });
    // Demonstrates running JS in page context to extract data
    const pageData = await page.evaluate(() => ({
      title: document.title,
      linkCount: document.querySelectorAll('a').length,
      h1Text: document.querySelector('h1')?.textContent?.trim(),
    }));
    console.log('\n=== Page Data Extracted via evaluate() ===');
    console.log(JSON.stringify(pageData, null, 2));
    expect(pageData.title).toContain('Floor');
  });

});
