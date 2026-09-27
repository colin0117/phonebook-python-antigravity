import { Page } from '@playwright/test';

/**
 * Base Page Object Model class providing shared page reference and common helpers.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a relative path on the target application.
   */
  async navigate(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Returns current page title.
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}
