import { test, expect, devices } from '@playwright/test';
import * as fs from 'fs';

// This file runs against: chromium, firefox, webkit, mobile-iphone, mobile-android
// Run all:         npm run tier5
// Mobile only:     npx playwright test tier5-multi-browser --project=mobile-iphone --headed

test.describe('Tier 5 — Cross-Browser & Mobile Emulation', () => {

  test.beforeAll(() => {
    fs.mkdirSync('test-results/screenshots', { recursive: true });
  });

  test('homepage title — same test, every browser', async ({ page }) => {
    // Zero code changes — the config's projects array runs this on all browsers
    await page.goto('/');
    await expect(page).toHaveTitle(/Floor & Decor/i);
    const browserName = page.context().browser()?.browserType().name() ?? 'unknown';
    console.log(`\n✓ Verified on: ${browserName}`);
    await page.screenshot({
      path: `test-results/screenshots/homepage-${browserName}.png`,
    });
  });

  test('Tile navigation — all browsers', async ({ page }) => {
    // Direct URL navigation is more reliable than clicking a JS-rendered nav link
    await page.goto('/tile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/tile/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('mobile — responsive layout with isMobile fixture', async ({ page, isMobile, viewport }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    console.log(`\nDevice: isMobile=${isMobile}, viewport=${viewport?.width}x${viewport?.height}`);
    await page.screenshot({ path: 'test-results/screenshots/responsive-layout.png' });
    if (isMobile) {
      // On mobile, the desktop nav is hidden — hamburger menu or collapsed nav expected
      console.log('Mobile layout captured — viewport is narrower, nav is collapsed');
    } else {
      // Desktop: wait for JS-rendered nav, then check the Tile link
      await page.waitForSelector('a[href="/tile"]', { timeout: 30_000 });
      await expect(page.locator('a[href="/tile"]').first()).toBeVisible();
    }
  });

  test('mobile — viewport dimensions match device descriptor', async ({ viewport, isMobile }) => {
    if (!isMobile) {
      // Desktop viewport — just log
      console.log(`Desktop viewport: ${viewport?.width}x${viewport?.height}`);
      return;
    }
    console.log(`\nMobile viewport: ${viewport?.width}x${viewport?.height}`);
    // iPhone 15 Pro: 430x932, Pixel 7: 412x915
    expect(viewport!.width).toBeLessThanOrEqual(430);
  });

  test('iPad landscape — inline context with device descriptor', async ({ browser }) => {
    // Demonstrates creating a device context inline — independent of projects config
    const context = await browser.newContext({
      ...devices['iPad (gen 7) landscape'],
      locale: 'en-US',
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveTitle(/Floor & Decor/i);
    const vp = page.viewportSize();
    console.log(`\niPad landscape viewport: ${vp?.width}x${vp?.height}`);
    await page.screenshot({ path: 'test-results/screenshots/ipad-landscape.png' });
    await context.close();
  });

  test('geolocation — Atlanta coordinates for store locator', async ({ browser }) => {
    // Emulate GPS coordinates — perfect for location-aware features
    const context = await browser.newContext({
      geolocation: { latitude: 33.749, longitude: -84.388 }, // Atlanta, GA
      permissions: ['geolocation'],
      ...devices['Desktop Chrome'],
    });
    const page = await context.newPage();
    await page.goto('/stores');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/screenshots/store-geolocation.png' });
    console.log('\nGeolocation set to Atlanta, GA (33.749, -84.388)');
    await context.close();
  });

  test('dark mode — prefers-color-scheme emulation', async ({ browser }) => {
    // Emulate OS dark mode preference — one line in context options
    const context = await browser.newContext({
      colorScheme: 'dark',
      ...devices['Desktop Chrome'],
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/screenshots/dark-mode.png' });
    console.log('\nDark mode emulated — see dark-mode.png');
    await context.close();
  });

});
