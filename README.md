# Floor & Decor — Playwright Capability Demo

A progressive, 8-tier TypeScript demo showcasing Playwright's full capability stack — from basic navigation to network interception, visual regression, and parallel execution — using [flooranddecor.com](https://www.flooranddecor.com/) as the live target.

Designed for a **30–45 minute client presentation**.

---

## Quick Start

```bash
npm install
npx playwright install chromium firefox webkit

# Create visual baselines (required once before Tier 6)
npm run tier6:update

# Then run any tier individually:
npm run tier1
```

---

## Project Structure

```text
PlaywrightDemo/
├── playwright.config.ts        # Global config: browsers, retries, trace, video, HTML report
├── tests/
│   ├── tier1-navigation.spec.ts
│   ├── tier2-locators.spec.ts
│   ├── tier3-user-flows.spec.ts
│   ├── tier4-network.spec.ts
│   ├── tier5-multi-browser.spec.ts
│   ├── tier6-visual.spec.ts
│   ├── tier7-pom.spec.ts
│   └── tier8-config-power.spec.ts
├── pages/                      # Page Object Model classes
│   ├── BasePage.ts
│   ├── HomePage.ts
│   ├── CategoryPage.ts
│   ├── SearchResultsPage.ts
│   └── StoreLocatorPage.ts
├── fixtures/
│   ├── fnd-fixtures.ts         # Custom Playwright fixtures
│   └── index.ts
└── mocks/
    ├── search-suggestions.json # Stub for search API interception
    └── product-grid.json       # Stub for product grid API
```

---

## Demo Tiers

### Tier 1 — Navigation & Basic Assertions

**File:** `tests/tier1-navigation.spec.ts` | **Command:** `npm run tier1`

The foundation of every Playwright test. Demonstrates the core building blocks.

| Test | Concept |
| ---- | ------- |
| Homepage loads with correct title | `page.goto()`, `toHaveTitle()` |
| Homepage URL is correct | `toHaveURL()` |
| Main navigation links are visible | `waitForSelector()`, `toBeVisible()` |
| Navigate to Tile category page | Direct URL navigation, `toContainText()` |
| Navigate to Wood category page | `toContainText()` vs `toHaveText()` |
| Full-page screenshot of homepage | `page.screenshot({ fullPage: true })` |
| Viewport screenshot of tile category | `page.screenshot({ fullPage: false })` |

---

### Tier 2 — Locator Strategies

**File:** `tests/tier2-locators.spec.ts` | **Command:** `npm run tier2`

Eight ways to find the same element — Playwright's locator API is the most powerful in the industry.

| Test | Locator Type |
| ---- | ------------ |
| getByRole — nav link by ARIA role | `getByRole('link', { name })` |
| getByText — element by visible text | `getByText()`, `toContainText()` |
| CSS locator — class pattern matching | `[class*="x"]` — resilient to obfuscation |
| XPath locator — structural selection | `//h1[...]` — the escape hatch |
| Chained locators — scoped search | `parent.locator(child)` |
| filter locator — hasText refinement | `.filter({ hasText: /pattern/ })` |
| Search input focus | `toBeFocused()` |
| nth selector | `.nth(2)` |
| locator.count() | Counting matched elements |

---

### Tier 3 — User Flows & Interactions

**File:** `tests/tier3-user-flows.spec.ts` | **Command:** `npm run tier3`

Real users don't just click — they type, hover, scroll, and use keyboards.

| Test | Concept |
| ---- | ------- |
| Search with human-like delay | `pressSequentially(text, { delay: 80 })` |
| Keyboard navigation with Tab | `page.keyboard.press('Tab')` |
| Hover reveals megamenu | `locator.hover()`, screenshot of hover state |
| URL-driven filter | Direct URL with query params for resilient filter testing |
| Scroll via page.evaluate | `page.evaluate(() => window.scrollTo(...))` |
| Store locator — zip code search | Form fill + submit pattern |
| Cart element accessibility | Text content assertions on navigation elements |
| Extract DOM data with evaluate | `page.evaluate()` returning structured data |

---

### Tier 4 — Network Interception & API Mocking

**File:** `tests/tier4-network.spec.ts` | **Command:** `npm run tier4`

Watch Playwright intercept the actual API calls Floor & Decor's website makes. No back-end needed.

| Test | Concept |
| ---- | ------- |
| Observe XHR/fetch API calls | `page.on('request')` — live console output of all API traffic |
| Spy on search suggestion API | `page.waitForResponse()` — capture response + timing |
| Mock search API response | `route.fulfill()` — inject custom JSON from `mocks/search-suggestions.json` |
| Block all images for speed test | `route.abort()` — measure load time delta |
| Inject custom request headers | `route.continue({ headers })` |
| Simulate 3G network (Chrome only) | CDP `Network.emulateNetworkConditions` |

> **Showpiece moment:** The console output from the "observe" test live-prints every API call the website makes, demonstrating Playwright's full network visibility.

---

### Tier 5 — Cross-Browser & Mobile Emulation

**File:** `tests/tier5-multi-browser.spec.ts` | **Command:** `npm run tier5`

One test file, five environments. Write once, run everywhere.

| Test | Concept |
| ---- | ------- |
| Homepage title — every browser | Same test runs on Chromium, Firefox, WebKit, iPhone, Pixel |
| Tile navigation — all browsers | Cross-browser functional parity |
| Mobile responsive layout | `isMobile` fixture — test adapts to device context |
| Viewport dimensions | `viewport` fixture — assert device dimensions |
| iPad landscape — inline context | `browser.newContext({ ...devices['iPad...'] })` |
| Geolocation — Atlanta coordinates | `{ geolocation, permissions: ['geolocation'] }` |
| Dark mode emulation | `{ colorScheme: 'dark' }` |

**Projects configured in `playwright.config.ts`:**

- `chromium` — Desktop Chrome (runs Tiers 1–7)
- `firefox` — Desktop Firefox (Tier 5 only)
- `webkit` — Desktop Safari (Tier 5 only)
- `mobile-iphone` — iPhone 15 Pro (Tier 5 only)
- `mobile-android` — Pixel 7 (Tier 5 only)
- `parallel-demo` — Desktop Chrome (Tier 8 only)

---

### Tier 6 — Visual Regression Testing

**File:** `tests/tier6-visual.spec.ts` | **Command:** `npm run tier6`

Pixel-perfect assertions. Catch visual regressions automatically — no human eyes needed.

| Test | Concept |
| ---- | ------- |
| Homepage full-page snapshot | `toHaveScreenshot()` with `fullPage: true` |
| Tile category viewport snapshot | Masking dynamic areas (store name, prices) |
| Header component snapshot | Element-level screenshot — isolate a component |
| Before/after filter comparison | Sequential screenshots proving UI change |
| Wood category with threshold | `threshold: 0.2`, `maxDiffPixelRatio: 0.05` |

**Workflow:**

```bash
npm run tier6:update   # First run — writes baseline PNGs to tests/tier6-visual.spec.ts-snapshots/
npm run tier6          # Subsequent runs — pixel-by-pixel comparison against baselines
```

Baselines are committed to the repo and compared on CI.

---

### Tier 7 — Page Object Model + Custom Fixtures

**File:** `tests/tier7-pom.spec.ts` | **Command:** `npm run tier7`

Enterprise-grade test architecture. Tests read like a specification, not automation code.

| Test | Concept |
| ---- | ------- |
| readyHomePage fixture | Pre-navigated, overlay-dismissed page ready to use |
| `searchFor()` one-liner | POM method replaces 3 lines of raw locator + fill + press |
| CategoryPage.gotoCategory() | URL navigation encapsulated in POM |
| `getFirstProductTitle()` | Compound locator chain hidden in POM method |
| StoreLocatorPage.searchByZip() | Form interaction pattern in POM |
| Composed fixtures — search journey | Two page objects compose a full user flow |
| `hoverOverNavItem()` | Hover interaction via POM method |

**Architecture:**

```text
test (imports from fixtures/)
  → readyHomePage fixture (auto-navigates + dismisses overlays)
      → HomePage POM (owns all selectors + actions)
          → BasePage (shared: goto, screenshot, dismissOverlays)
```

---

### Tier 8 — Configuration Power Features

**File:** `tests/tier8-config-power.spec.ts` | **Command:** `npm run tier8`

The config is a superpower. Everything impressive here comes from `playwright.config.ts`.

| Test | Concept |
| ---- | ------- |
| 4 parallel worker tests | `workers: 2` — tests run concurrently |
| HTML report with attachments | `test.info().attach()` — screenshots embedded in report |
| Trace viewer demo | Multi-step recording for step-by-step replay |
| API test (no browser) | `request` fixture — pure HTTP, zero browser overhead |
| Retry demo | Toggle assertion to force retry + auto trace capture |
| Test annotations | `test.info().annotations.push()` — metadata in report |

**After running:**

```bash
npm run report   # Opens playwright-report/index.html with embedded screenshots
npx playwright show-trace test-results/<folder>/trace.zip   # Replay every action
```

**Config highlights (`playwright.config.ts`):**

```typescript
retries: 1,                    // Auto-retry flaky tests
trace: 'on-first-retry',       // Capture trace on retry — full DOM replay
video: 'retain-on-failure',    // Record video, keep only on failure
screenshot: 'only-on-failure', // Auto-screenshot on failure
reporter: [['html', ...]],     // Rich HTML report with timeline
workers: 2,                    // Parallel execution
```

---

## Presentation Flow (30–45 min)

| # | Segment | Command | Time |
| - | ------- | ------- | ---- |
| 1 | Open `playwright.config.ts` — explain the power of one config | — | 3 min |
| 2 | Tier 1 — Basic run, open HTML report live | `npm run tier1` | 5 min |
| 3 | Tier 2 — Walk through each locator strategy | `npm run tier2` | 5 min |
| 4 | Tier 3 — Live typing, hover screenshot, store locator | `npm run tier3` | 5 min |
| 5 | Tier 4 — Show intercepted API calls in console (**WOW moment**) | `npm run tier4` | 7 min |
| 6 | Tier 5 — Three browsers + iPhone side-by-side | `npm run tier5` | 5 min |
| 7 | Tier 6 — Create baseline, then compare | `npm run tier6:update && npm run tier6` | 3 min |
| 8 | Tier 7 — POM code walkthrough alongside test | `npm run tier7` | 4 min |
| 9 | Tier 8 — Parallel workers, open HTML report, show trace viewer | `npm run tier8 && npm run report` | 5 min |

---

## NPM Scripts Reference

| Script | What it does |
| ------ | ------------ |
| `npm run tier1` | Run Tier 1 on Chromium (headed) |
| `npm run tier2` | Run Tier 2 on Chromium (headed) |
| `npm run tier3` | Run Tier 3 on Chromium (headed) |
| `npm run tier4` | Run Tier 4 on Chromium (headed) |
| `npm run tier5` | Run Tier 5 on all 5 browser/device projects (headed) |
| `npm run tier6:update` | Create/update visual regression baselines |
| `npm run tier6` | Run visual comparison against baselines |
| `npm run tier7` | Run Tier 7 on Chromium (headed) |
| `npm run tier8` | Run Tier 8 on parallel-demo project |
| `npm run report` | Open `playwright-report/index.html` |
| `npm test` | Run all tiers across all projects |

---

## Key Playwright APIs Covered

| API | Tier |
| --- | ---- |
| `page.goto()`, `toHaveTitle()`, `toHaveURL()` | 1 |
| `getByRole()`, `getByText()`, `filter()`, `.nth()` | 2 |
| `pressSequentially()`, `hover()`, `keyboard.press()`, `page.evaluate()` | 3 |
| `page.on('request')`, `waitForResponse()`, `route.fulfill()`, `route.abort()`, `route.continue()` | 4 |
| `devices`, `browser.newContext()`, `isMobile`, `viewport`, `colorScheme`, `geolocation` | 5 |
| `toHaveScreenshot()`, `mask`, `maxDiffPixelRatio`, `threshold` | 6 |
| `test.extend()`, custom fixtures, Page Object Model | 7 |
| `test.info().attach()`, `test.info().annotations`, `request` fixture, CDP session | 8 |

---

## Tech Stack

- **[Playwright](https://playwright.dev/)** v1.52+
- **TypeScript** v5.9
- **Target site:** [flooranddecor.com](https://www.flooranddecor.com/) (Salesforce Commerce Cloud / SFCC)
