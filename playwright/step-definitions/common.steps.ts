import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Shared fixture setup step used across feature suites
Given('a contact exists named {string} with phone {string}', async function (this: CustomWorld, fullName: string, phone: string) {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || 'Test';

  const response = await this.context.request.post('/api/contacts', {
    data: {
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      email: `${firstName.toLowerCase()}@fixture.test`,
      date_of_birth: '1990-05-15',
      category: 'Work',
      notes: 'Automated test fixture'
    }
  });

  expect(response.ok()).toBeTruthy();
});

// Shared navigation step
Given('I navigate to the phone book application', async function (this: CustomWorld) {
  await this.phoneBookPage.goto();
});

// Shared search step
When('I search for {string} in the search box', async function (this: CustomWorld, searchTerm: string) {
  await this.phoneBookPage.search(searchTerm);
});

// Utility step to pause execution and open Playwright Inspector for manual verification
Then('the tests are paused for manual verification', { timeout: -1 }, async function (this: CustomWorld) {
  await this.page.pause();
});
