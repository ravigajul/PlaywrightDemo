import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class StoreLocatorPage extends BasePage {
  readonly zipInput: Locator;
  readonly searchButton: Locator;
  readonly storeCards: Locator;
  readonly useMyLocationButton: Locator;

  constructor(page: Page) {
    super(page);
    this.zipInput = page
      .locator('input[placeholder*="zip" i], input[placeholder*="city" i], input[type="text"]')
      .first();
    this.searchButton = page.getByRole('button', { name: /search|find/i }).first();
    this.storeCards = page.locator('.store-result, [class*="store-tile"], [class*="store-card"]');
    this.useMyLocationButton = page.getByText(/use my location/i);
  }

  async searchByZip(zip: string) {
    await this.zipInput.fill(zip);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getStoreCount(): Promise<number> {
    return this.storeCards.count();
  }
}
