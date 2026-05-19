import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(urlPath: string = '/') {
    await this.page.goto(urlPath, { waitUntil: 'domcontentloaded' });
  }

  async takeScreenshot(name: string) {
    const dir = 'test-results/screenshots';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await this.page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
  }

  async dismissOverlays() {
    const selectors = [
      '[aria-label="Close"]',
      '[class*="modal"] button[class*="close"]',
      '[class*="overlay"] button[class*="close"]',
      'button[class*="dismiss"]',
      '[data-testid="close-button"]',
    ];
    for (const sel of selectors) {
      const btn = this.page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click().catch(() => {});
        break;
      }
    }
  }
}
