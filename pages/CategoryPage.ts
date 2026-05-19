import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CategoryPage extends BasePage {
  readonly pageHeading: Locator;
  readonly productTiles: Locator;
  readonly facetSidebar: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1').first();
    // clp-tiles is the actual product/subcategory tile class on Floor & Decor
    this.productTiles = page.locator('[class*="tile"], [class*="clp-tile"]');
    this.facetSidebar = page.locator('.refinements, [class*="refinement"], .filter-sidebar').first();
    this.breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]');
  }

  async gotoCategory(urlPath: string) {
    await this.page.goto(urlPath, { waitUntil: 'domcontentloaded' });
  }

  async clickFacet(facetLabel: string) {
    await this.page.getByText(facetLabel, { exact: false }).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async getFirstProductTitle(): Promise<string | null> {
    // Wait for tiles to render then grab the first link text
    await this.page.waitForSelector('[class*="tile"] a', { timeout: 10_000 });
    const first = this.page.locator('[class*="tile"] a').first();
    return first.textContent();
  }
}
