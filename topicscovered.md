# Playwright Capabilities Covered in This Demo

## Tier 1 — Navigation & Assertions

- `page.goto()` — navigate to a URL
- `toHaveTitle()` — assert page title
- `toHaveURL()` — assert current URL
- `toBeVisible()` — assert element is visible
- `toContainText()` — assert text content
- `page.screenshot()` — full page and viewport screenshots

## Tier 2 — Locator Strategies

- `getByRole()` — locate by ARIA role (semantic, recommended)
- `getByText()` — locate by visible text
- CSS selector with `[class*="x"]` — pattern matching, resilient to obfuscation
- XPath `//h1[...]` — structural selection (escape hatch)
- Chained locators `parent.locator(child)` — scoped search
- `.filter({ hasText })` — narrow down a list of matches
- `.nth(n)` — pick the nth matching element
- `.count()` — count how many elements match
- `toBeFocused()` — assert keyboard focus

## Tier 3 — User Interactions

- `pressSequentially(text, { delay })` — human-like typing with delay
- `locator.hover()` — hover to reveal dropdowns/menus
- `page.keyboard.press('Tab')` — keyboard navigation
- `page.evaluate()` — run JavaScript directly in the browser
- URL parameter-based filtering — resilient filter testing
- Form fill + submit pattern
- Text content assertions on dynamic elements

## Tier 4 — Network Interception & Mocking

- `page.on('request')` — spy on every outgoing request
- `page.waitForResponse()` — capture and inspect an API response
- `route.fulfill()` — mock an API with custom JSON (no back-end needed)
- `route.abort()` — block resource types (e.g. images) entirely
- `route.continue({ headers })` — modify outgoing request headers
- CDP `Network.emulateNetworkConditions` — simulate 3G / slow networks

## Tier 5 — Cross-Browser & Mobile Emulation

- Multi-browser execution — Chromium, Firefox, WebKit from one config
- `devices['iPhone 15 Pro']` — iPhone emulation
- `devices['Pixel 7']` — Android emulation
- `devices['iPad (gen 7) landscape']` — tablet emulation
- `isMobile` fixture — test logic adapts to device type
- `viewport` fixture — assert screen dimensions
- `geolocation` + `permissions` — GPS coordinate emulation
- `colorScheme: 'dark'` — dark mode emulation

## Tier 6 — Visual Regression Testing

- `toHaveScreenshot()` — pixel-by-pixel comparison against a saved baseline
- `fullPage: true/false` — full scroll vs viewport only
- Element-level screenshots — isolate a single component
- `mask: [locator]` — exclude dynamic areas from comparison
- `maxDiffPixelRatio` — allow a % of pixels to differ (anti-aliasing tolerance)
- `threshold` — per-pixel colour difference tolerance
- `animations: 'disabled'` — freeze CSS animations for deterministic snapshots
- `--update-snapshots` flag — regenerate baselines after intentional UI changes

## Tier 7 — Page Object Model & Fixtures

- `BasePage` — shared methods across all pages (goto, screenshot, dismissOverlays)
- Page Object classes — encapsulate selectors and actions per page
- `test.extend()` — create custom Playwright fixtures
- `readyHomePage` fixture — pre-navigated, overlay-dismissed, ready to use
- Composed fixtures — multiple page objects forming a full user journey
- Tests read as business language, not selector code

## Tier 8 — Configuration & Power Features

- `workers: N` — parallel test execution
- `retries: N` — automatic retry on failure
- `trace: 'on-first-retry'` — capture full DOM replay on retry
- `video: 'retain-on-failure'` — record video, keep only on failure
- `screenshot: 'only-on-failure'` — auto-screenshot failed tests
- `reporter: 'html'` — rich HTML report with timeline and attachments
- `test.info().attach()` — embed screenshots/files directly into the report
- `test.info().annotations` — tag tests with metadata (story ID, severity)
- `request` fixture — API testing with no browser at all
- Trace Viewer — step-by-step action replay with DOM snapshots, network panel, console
