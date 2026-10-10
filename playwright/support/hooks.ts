import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import * as path from 'path';
import { CustomWorld } from './world';
import { PhoneBookPage } from '../pages/phone-book.page';
import { ApiHelper } from '../utils/api-helper';
import { BddFixtures } from '../fixtures/bdd-fixtures';

setDefaultTimeout(60 * 1000);

let browser: Browser;
let isHeaded = false;

BeforeAll(async function () {
  isHeaded = process.env.HEADED === 'true' || process.env.HEADLESS === 'false';
  browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 100 : 0
  });
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});

Before(async function (this: CustomWorld, scenario) {
  const hasPauseStep = scenario.pickle.steps.some(
    step => step.text === 'the tests are paused for manual verification'
  );
  if (hasPauseStep && !isHeaded) {
    if (browser) {
      await browser.close();
    }
    isHeaded = true;
    browser = await chromium.launch({
      headless: false,
      slowMo: 100
    });
  }

  const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5000';
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    baseURL: baseURL
  });
  this.page = await this.context.newPage();
  this.phoneBookPage = new PhoneBookPage(this.page);
  this.api = new ApiHelper(this.context.request);
  this.fixtures = new BddFixtures(this.context.request);
  this.createdContactIds = [];
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({
      path: path.resolve(__dirname, `../reports/screenshot-${Date.now()}.png`),
      fullPage: true
    });
    this.attach(screenshot, 'image/png');
  }

  // Teardown: Clean up test fixture contacts
  try {
    await this.api.cleanupContactsMatching(lastName => (
      lastName.includes('Test') ||
      lastName.includes('Create') ||
      lastName.includes('Update') ||
      lastName.includes('Delete') ||
      lastName.includes('Del')
    ));
  } catch {
    // Ignore cleanup error on teardown
  }

  if (this.page) {
    await this.page.close();
  }
  if (this.context) {
    await this.context.close();
  }
});
