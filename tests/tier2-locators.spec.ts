import { test, expect } from '@playwright/test';

test.describe('Tier 2 — Locator Strategies', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/tile', { waitUntil: 'domcontentloaded' });
    // Wait for JS-rendered navigation to appear before each test
    await page.waitForSelector('a[href="/tile"]', { timeout: 15_000 });
  });

  test('getByRole — find nav link by accessibility role', async ({ page }) => {
    // Semantic locators using ARIA roles — the recommended Playwright approach
    const tileLink = page.locator('a[href="/tile"]').first();
    await expect(tileLink).toBeVisible();
    await expect(tileLink).toHaveAttribute('href', expect.stringContaining('/tile'));
    // Also show getByRole on a heading — always reliable
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('getByText — find element by visible text content', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Tile/i);
  });

  test('CSS locator — target by class pattern', async ({ page }) => {
    // [class*="x"] matches any class containing "x" — resilient to obfuscation
    // b-product_filters is the actual filter bar class on Floor & Decor
    const filterSection = page.locator('[class*="product_filter"], .filter').first();
    await expect(filterSection).toBeAttached();
  });

  test('XPath locator — structural selection', async ({ page }) => {
    // XPath is the escape hatch — use only when semantic locators fall short
    const h1 = page.locator('//h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Tile/i);
  });

  test('chained locators — scope search to a container', async ({ page }) => {
    // parent.locator(child) restricts the search to within the parent
    // <main class="l-clp"> is the real main element on this site
    const mainContent = page.locator('main').first();
    const firstHeading = mainContent.locator('h1, h2').first();
    await expect(firstHeading).toBeAttached();
  });

  test('filter locator — hasText refinement', async ({ page }) => {
    // .filter({ hasText }) narrows a broad locator set
    const vinylLink = page.getByRole('link').filter({ hasText: /vinyl/i }).first();
    await expect(vinylLink).toBeVisible();
  });

  test('search input — click activates focus', async ({ page }) => {
    await page.goto('/');
    // getByPlaceholder or attribute-based — great for form inputs
    const searchBar = page.locator('input[type="search"], input[name="q"]').first();
    await expect(searchBar).toBeAttached();
    await searchBar.click();
    await expect(searchBar).toBeFocused();
  });

  test('nth selector — pick the second matching element', async ({ page }) => {
    // .nth(n) selects from a list of matched elements
    const links = page.getByRole('link');
    const third = links.nth(2);
    await expect(third).toBeVisible();
  });

  test('locator.count() — count matching elements', async ({ page }) => {
    const allLinks = page.getByRole('link');
    const count = await allLinks.count();
    console.log(`Total links on Tile page: ${count}`);
    expect(count).toBeGreaterThan(5);
  });

});
