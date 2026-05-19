import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Tier 8 runs under the 'parallel-demo' project (see playwright.config.ts)
// which uses Desktop Chrome with workers=2.
//
// DEMO COMMANDS:
//   npm run tier8                    → run all power features
//   npm run report                   → open HTML report in browser
//   npx playwright show-trace <zip>  → open trace viewer

test.describe('Tier 8 — Config Power Features', () => {

  test.beforeAll(() => {
    fs.mkdirSync('test-results/screenshots', { recursive: true });
  });

  // ── PARALLEL EXECUTION DEMO ──
  // These 4 tests run concurrently with workers=2 (pairs at a time)
  test('parallel: homepage check', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Floor & Decor/i);
    console.log('[Worker] homepage ✓');
  });

  test('parallel: tile page check', async ({ page }) => {
    await page.goto('/tile');
    await expect(page.locator('h1').first()).toBeVisible();
    console.log('[Worker] /tile ✓');
  });

  test('parallel: wood page check', async ({ page }) => {
    await page.goto('/wood');
    await expect(page.locator('h1').first()).toBeVisible();
    console.log('[Worker] /wood ✓');
  });

  test('parallel: vinyl page check', async ({ page }) => {
    await page.goto('/vinyl');
    await expect(page.locator('h1').first()).toBeVisible();
    console.log('[Worker] /vinyl ✓');
  });

  // ── HTML REPORT DEMO ──
  // test.info().attach() embeds artifacts directly into the HTML report
  test('HTML report — attach screenshots and metadata', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Attach a screenshot — it appears inline in playwright-report/index.html
    const screenshot = await page.screenshot();
    await test.info().attach('homepage-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });

    // Attach plain text data
    const title = await page.title();
    await test.info().attach('page-title', {
      body: Buffer.from(title),
      contentType: 'text/plain',
    });

    console.log('\nRun `npm run report` to open the HTML report with embedded screenshots.');
    await expect(page).toHaveTitle(/Floor & Decor/i);
  });

  // ── TRACE VIEWER DEMO ──
  // Every action below is recorded when trace:'on-first-retry' fires
  // Run with --trace=on to always capture: npx playwright test tier8 --trace=on
  test('trace viewer — step-by-step action replay', async ({ page }) => {
    await page.goto('/');
    // Each step becomes a frame in the trace viewer timeline
    const searchBar = page.locator('input[type="search"], input[name="q"]').first();
    await searchBar.click();
    // pressSequentially is on Locator — types each character with a delay (visible in trace)
    await searchBar.pressSequentially('hardwood', { delay: 50 });
    await page.keyboard.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/screenshots/trace-final-state.png' });
    console.log('\nTrace captured — run: npx playwright show-trace <test-results/.../trace.zip>');
  });

  // ── API TESTING DEMO ──
  // Playwright's APIRequestContext — no browser needed, pure HTTP
  test('API test — site availability via request fixture', async ({ request }) => {
    const response = await request.get('https://www.flooranddecor.com/');
    console.log('\n=== Playwright API Test (no browser) ===');
    console.log('Status:', response.status());
    console.log('Content-Type:', response.headers()['content-type']);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Floor');
  });

  // ── RETRY + VIDEO DEMO ──
  // To demo retries live: change the toHaveTitle assertion to something wrong.
  // On retry Playwright captures video + trace automatically (per config).
  test('retry demo — intentionally toggle this to fail for live demo', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // ← To demo retries: change to `toHaveTitle('THIS WILL FAIL')` then run
    await expect(page).toHaveTitle(/Floor & Decor/i);
    console.log('\nTip: Change assertion above to force a retry and capture video+trace.');
  });

  // ── ANNOTATIONS DEMO ──
  test('annotations — tag tests with metadata', async ({ page }) => {
    test.info().annotations.push({
      type: 'story',
      description: 'FND-001: Homepage accessibility',
    });
    test.info().annotations.push({
      type: 'severity',
      description: 'critical',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Floor & Decor/i);
    console.log('\nAnnotations appear in the HTML report alongside the test result.');
  });

});
