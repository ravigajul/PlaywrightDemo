import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  readonly resultsHeading: Locator;
  readonly productCards: Locator;
  readonly filterButton: Locator;
  readonly clearAllFilters: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsHeading = page.locator('h1, [class*="results-count"]').first();
    this.productCards = page.locator('.product-tile, [class*="product-tile"]');
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.clearAllFilters = page.getByRole('button', { name: /clear all/i });
    this.noResultsMessage = page.getByText(/0 products found|no results/i);
  }

  async waitForProductGrid() {
    await this.page.waitForSelector(
      '.product-tile, [class*="product-tile"], .no-results',
      { timeout: 15_000 }
    );
  }

  async getProductCount(): Promise<number> {
    return this.page.locator('.product-tile, [class*="product-tile"]').count();
  }

  async applyPriceFilter(min: number, max: number) {
    const minInput = this.page.locator('input[name="min"], input[placeholder*="min" i]');
    const maxInput = this.page.locator('input[name="max"], input[placeholder*="max" i]');
    const applyBtn = this.page.getByRole('button', { name: /apply/i });
    await minInput.fill(String(min));
    await maxInput.fill(String(max));
    await applyBtn.click();
    await this.page.waitForLoadState('networkidle');
  }
}
