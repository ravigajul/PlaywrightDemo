import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Global timeout per test — flooranddecor.com can be slow
  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  workers: 2,
  fullyParallel: false,
  retries: 1,

  use: {
    baseURL: 'https://www.flooranddecor.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    navigationTimeout: 30_000,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  projects: [
    // ── Desktop Browsers ──
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/tier8-config-power.spec.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/tier5-multi-browser.spec.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/tier5-multi-browser.spec.ts'],
    },

    // ── Mobile Devices ──
    {
      name: 'mobile-iphone',
      use: { ...devices['iPhone 15 Pro'] },
      testMatch: ['**/tier5-multi-browser.spec.ts'],
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 7'] },
      testMatch: ['**/tier5-multi-browser.spec.ts'],
    },

    // ── Parallel demo project ──
    {
      name: 'parallel-demo',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/tier8-config-power.spec.ts'],
    },
  ],

  outputDir: 'test-results/',
});
