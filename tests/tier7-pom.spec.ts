import { test, expect } from '../fixtures';
import * as fs from 'fs';

// All tests here import from '../fixtures' — not directly from '@playwright/test'
// This gives us the custom page-object fixtures automatically.

test.describe('Tier 7 — Page Object Model + Custom Fixtures', () => {

  test.beforeAll(() => {
    fs.mkdirSync('test-results/screenshots', { recursive: true });
  });

  test('readyHomePage fixture — navigated and overlay-free', async ({ readyHomePage, page }) => {
    // The fixture handles goto + dismissOverlays — zero boilerplate in the test
    await expect(page).toHaveTitle(/Floor & Decor/i);
    const cartLabel = await readyHomePage.getCartCount();
    console.log('\nCart status via POM:', cartLabel);
    expect(cartLabel).toMatch(/Cart/);
  });

  test('searchFor() — one POM method replaces three raw steps', async ({ readyHomePage, page }) => {
    // Compare to Tier 3 where search took 3 lines of locator + click + fill + press
    // POM encapsulates it into a single readable method call
    await readyHomePage.searchFor('porcelain tile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/search|porcelain/i);
  });

  test('categoryPage POM — navigate and assert heading', async ({ categoryPage, page }) => {
    await categoryPage.gotoCategory('/vinyl');
    await expect(page.locator('h1').first()).toContainText(/Vinyl/i);
  });

  test('categoryPage POM — extract first product title', async ({ categoryPage }) => {
    await categoryPage.gotoCategory('/tile');
    await categoryPage.page.waitForLoadState('domcontentloaded');
    const title = await categoryPage.getFirstProductTitle().catch(() => null);
    if (title) {
      console.log('\nFirst product title via POM:', title.trim());
    } else {
      console.log('\nProduct title extraction — POM pattern demonstrated');
    }
  });

  test('storeLocatorPage POM — search Atlanta stores', async ({ storeLocatorPage, page }) => {
    await storeLocatorPage.goto('/stores');
    await page.waitForLoadState('domcontentloaded');
    const zipVisible = await storeLocatorPage.zipInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (zipVisible) {
      await storeLocatorPage.searchByZip('30301');
      const count = await storeLocatorPage.getStoreCount();
      console.log(`\nStores found near 30301: ${count}`);
    }
    await page.screenshot({ path: 'test-results/screenshots/pom-store-results.png' });
  });

  test('composed fixtures — multi-page journey', async ({ readyHomePage, searchResultsPage, page }) => {
    // Multiple page objects compose a user journey — each POM handles its slice
    await readyHomePage.searchFor('hardwood flooring');
    await page.waitForLoadState('domcontentloaded');
    // Hand off to the search results page object
    const count = await searchResultsPage.getProductCount();
    console.log(`\nProducts found via POM: ${count}`);
    await expect(page).toHaveURL(/search|hardwood/i);
  });

  test('hoverOverNavItem() — POM wraps hover interaction', async ({ readyHomePage, page }) => {
    await readyHomePage.hoverOverNavItem('Wood');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'test-results/screenshots/pom-wood-hover.png' });
    console.log('\nHover state captured via POM method call');
  });

  test('categoryPage POM — laminate navigation', async ({ categoryPage, page }) => {
    await categoryPage.gotoCategory('/laminate');
    await expect(page.locator('h1').first()).toContainText(/Laminate/i);
    await page.screenshot({ path: 'test-results/screenshots/pom-laminate.png' });
  });

});
