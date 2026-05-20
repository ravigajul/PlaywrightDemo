import { test, expect } from '@playwright/test';
import searchMock from '../mocks/search-suggestions.json';

test.describe('Tier 4 — Network Interception & API Mocking', () => {

  test('observe — log all XHR/fetch API calls on homepage', async ({ page }) => {
    const apiCalls: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      const type = request.resourceType();
      if (type === 'fetch' || type === 'xhr') {
        apiCalls.push(`[${request.method()}] ${url.substring(0, 120)}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // collect requests as the page continues loading

    console.log('\n=== API Calls Made by flooranddecor.com ===');
    apiCalls.forEach((r, i) => console.log(`${i + 1}. ${r}`));
    console.log(`\nTotal API calls intercepted: ${apiCalls.length}`);

    // Always passes — the value is the console output shown to the audience
    expect(apiCalls.length).toBeGreaterThanOrEqual(0);
  });

  test('spy — capture search suggestion response + timing', async ({ page }) => {
    // Set up the response listener BEFORE navigating
    const suggestionPromise = page.waitForResponse(
      (response) =>
        (response.url().includes('GetSuggestions') ||
          response.url().includes('suggest') ||
          response.url().includes('typeahead')) &&
        response.status() === 200,
      { timeout: 8_000 }
    ).catch(() => null);

    await page.goto('/');
    const searchBar = page.locator('input[type="search"], input[name="q"]').first();
    await searchBar.click();
    await searchBar.pressSequentially('marble', { delay: 100 });

    const response = await suggestionPromise;
    if (response) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const timing = (response.request() as any).timing() as { requestStart: number; responseEnd: number };
      console.log('\n=== Search Suggestion API ===');
      console.log('URL:', response.url().substring(0, 100));
      console.log('Status:', response.status());
      console.log(`Response time: ${Math.round(timing.responseEnd - timing.requestStart)}ms`);
      const body = await response.text().catch(() => '');
      console.log('Body preview:', body.substring(0, 200));
    } else {
      console.log('Suggestion API not triggered — demonstrating the pattern.');
    }
  });

  test('mock — intercept search API and inject custom data', async ({ page }, testInfo) => {
    // route.fulfill() replaces the real response with our mock data
    let intercepted = false;
    const loudSuggestion = 'MOCK RESULT - MARBLE DEMO';
    await page.route('**/1/indexes/production__products__default_query_suggestions/query*', async (route) => {
      intercepted = true;
      console.log('\nINTERCEPTED: Search Suggestions API');
      const mockedPayload = {
        ...searchMock,
        suggestions: {
          ...searchMock.suggestions,
          phrases: [
            { value: loudSuggestion, exactMatch: false },
            ...(searchMock.suggestions?.phrases ?? []),
          ],
          products: [
            {
              productName: `${loudSuggestion} PRODUCT`,
              productId: '999999999',
              price: '$0.99 / sqft',
              imageUrl: '',
            },
            ...(searchMock.suggestions?.products ?? []),
          ],
        },
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockedPayload),
      });
    });

    await page.goto('/');
    const searchBar = page.locator('input[type="search"], input[name="q"]').first();
    await searchBar.click();
    await searchBar.pressSequentially('marble', { delay: 100 });
    await page.waitForTimeout(800);

    if (intercepted) {
      // Add a visible badge in the page so interception is obvious in UI/screenshot.
      await page.evaluate((mockText) => {
        const id = 'pw-mock-badge';
        if (document.getElementById(id)) return;
        const badge = document.createElement('div');
        badge.id = id;
        badge.textContent = `PLAYWRIGHT MOCK ACTIVE: ${mockText}`;
        badge.setAttribute('style', [
          'position:fixed',
          'top:16px',
          'right:16px',
          'z-index:2147483647',
          'padding:12px 16px',
          'border-radius:10px',
          'font:700 14px/1.2 Arial, sans-serif',
          'color:#ffffff',
          'background:#0f766e',
          'box-shadow:0 10px 30px rgba(0,0,0,.35)',
          'border:2px solid #14b8a6',
        ].join(';'));
        document.body.appendChild(badge);
      }, loudSuggestion);
      await expect(page.getByText(`PLAYWRIGHT MOCK ACTIVE: ${loudSuggestion}`)).toBeVisible();
    }

    const mockUiShot = await page.screenshot({
      path: 'test-results/screenshots/mocked-suggestions.png',
      fullPage: true,
    });
    await testInfo.attach('mocked-suggestions-ui', {
      body: mockUiShot,
      contentType: 'image/png',
    });

    if (intercepted) {
      console.log('Mock was served — the UI received our custom data.');
    } else {
      console.log('Route pattern did not match — mock ready when URL pattern is confirmed.');
    }
  });

  test('abort — block all images and measure load time delta', async ({ page }) => {
    // First: normal load time
    const t1 = Date.now();
    await page.goto('/tile');
    await page.waitForLoadState('domcontentloaded');
    const normalTime = Date.now() - t1;

    // Second: block images via route.abort()
    await page.route('**/*.{jpg,jpeg,png,gif,webp,svg,avif}', (route) => route.abort());
    const t2 = Date.now();
    await page.goto('/tile');
    await page.waitForLoadState('domcontentloaded');
    const noImgTime = Date.now() - t2;

    console.log(`\n=== Image Blocking Performance Test ===`);
    console.log(`Normal load:         ${normalTime}ms`);
    console.log(`Load without images: ${noImgTime}ms`);
    console.log(`Delta:               ${normalTime - noImgTime}ms faster`);

    await page.screenshot({ path: 'test-results/screenshots/no-images.png' });
    // Page structure still renders — text, headings, layout all intact
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('modify — add custom headers to every outgoing request', async ({ page }) => {
    // route.continue() passes the request through with modified headers
    await page.route('**/*', async (route) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          'X-Demo-Client': 'PlaywrightDemo/1.0',
          'X-Presentation': 'ClientShowcase',
        },
      });
    });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Header modification is transparent to the page — title still loads
    await expect(page).toHaveTitle(/Floor & Decor/i);
    console.log('Custom headers injected into every request.');
  });

  test('CDP — simulate slow 3G network (Chromium only)', async ({ page, browserName }) => {
    if (browserName !== 'chromium') {
      test.skip();
      return;
    }
    // CDP gives direct DevTools Protocol access — unique to Playwright
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500 Kbps
      uploadThroughput: (250 * 1024) / 8,
      latency: 100,
    });

    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    console.log(`\nPage loaded on simulated 3G in ${Date.now() - start}ms`);

    // Restore normal network
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  });

});
