import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { PhoneBookPage } from '../pages/PhoneBookPage';

setDefaultTimeout(60 * 1000);

let browser: Browser;

BeforeAll(async function () {
  const isHeaded = process.env.HEADED === 'true';
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

Before(async function (this: CustomWorld) {
  const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5000';
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    baseURL: baseURL
  });
  this.page = await this.context.newPage();
  this.phoneBookPage = new PhoneBookPage(this.page);
  this.createdContactIds = [];
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({
      path: `reports/screenshot-${Date.now()}.png`,
      fullPage: true
    });
    this.attach(screenshot, 'image/png');
  }

  // Teardown: Clean up any test fixture contacts (tagged with Test, Create, Update, Delete)
  try {
    const res = await this.context.request.get('/api/contacts');
    if (res.ok()) {
      const body = await res.json();
      const testContacts = (body.data || []).filter((c: any) => {
        const lastName = c.last_name || '';
        return (
          lastName.includes('Test') ||
          lastName.includes('Create') ||
          lastName.includes('Update') ||
          lastName.includes('Delete')
        );
      });
      for (const tc of testContacts) {
        await this.context.request.delete(`/api/contacts/${tc.id}`);
      }
    }
  } catch (err) {
    // Ignore cleanup error on teardown
  }

  if (this.page) {
    await this.page.close();
  }
  if (this.context) {
    await this.context.close();
  }
});
