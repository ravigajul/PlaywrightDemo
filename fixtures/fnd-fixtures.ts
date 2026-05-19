import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CategoryPage } from '../pages/CategoryPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { StoreLocatorPage } from '../pages/StoreLocatorPage';

type FndFixtures = {
  homePage: HomePage;
  categoryPage: CategoryPage;
  searchResultsPage: SearchResultsPage;
  storeLocatorPage: StoreLocatorPage;
  readyHomePage: HomePage;
};

export const test = base.extend<FndFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },

  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },

  storeLocatorPage: async ({ page }, use) => {
    await use(new StoreLocatorPage(page));
  },

  // Pre-navigated home page with overlays dismissed
  readyHomePage: async ({ page }, use) => {
    const hp = new HomePage(page);
    await hp.goto('/');
    await page.waitForTimeout(1500);
    await hp.dismissOverlays();
    await use(hp);
  },
});

export { expect } from '@playwright/test';
