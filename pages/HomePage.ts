import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly cartIcon: Locator;
  readonly storeLocatorLink: Locator;
  readonly navTile: Locator;
  readonly navStone: Locator;
  readonly navWood: Locator;
  readonly navLaminate: Locator;
  readonly navVinyl: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('input[type="search"], input[name="q"]').first();
    this.cartIcon = page.locator('a.minicart-link, [class*="cart"] a, [class*="minicart"]').first();
    this.navTile = page.getByRole('link', { name: 'Tile', exact: true }).first();
    this.navStone = page.getByRole('link', { name: 'Stone', exact: true }).first();
    this.navWood = page.getByRole('link', { name: 'Wood', exact: true }).first();
    this.navLaminate = page.getByRole('link', { name: 'Laminate', exact: true }).first();
    this.navVinyl = page.getByRole('link', { name: 'Vinyl', exact: true }).first();
    this.storeLocatorLink = page.getByRole('link', { name: /find a store|stores/i }).first();
  }

  async searchFor(term: string) {
    await this.searchInput.click();
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }

  async hoverOverNavItem(name: 'Tile' | 'Stone' | 'Wood' | 'Laminate' | 'Vinyl') {
    const href = `/${name.toLowerCase()}`;
    await this.page.waitForSelector(`a[href="${href}"]`, { timeout: 15_000 });
    await this.page.locator(`a[href="${href}"]`).first().hover();
  }

  async getCartCount(): Promise<string> {
    const text = await this.cartIcon.textContent().catch(() => null);
    return text?.trim() ?? 'Cart';
  }
}
