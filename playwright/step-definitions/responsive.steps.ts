import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I resize the viewport to {int} by {int} pixels', async function (this: CustomWorld, width: number, height: number) {
  await this.phoneBookPage.setViewport(width, height);
});

Then('the contact row for {string} should display essential columns:', async function (this: CustomWorld, contactName: string, dataTable: DataTable) {
  const row = this.phoneBookPage.getRowForContact(contactName);
  const classes = dataTable.hashes().map(r => r['Cell Class'].trim());
  for (const cls of classes) {
    const cell = row.locator(`.${cls}`);
    await expect(cell, `Expected essential cell .${cls} to be visible on main row`).toBeVisible();
  }
});

Then('the contact row for {string} should hide non-essential columns from the main row:', async function (this: CustomWorld, contactName: string, dataTable: DataTable) {
  const row = this.phoneBookPage.getRowForContact(contactName);
  const classes = dataTable.hashes().map(r => r['Cell Class'].trim());
  for (const cls of classes) {
    const cell = row.locator(`.${cls}`);
    await expect(cell, `Expected cell .${cls} to be hidden on main row`).toBeHidden();
  }
});

When('I expand the responsive container for {string}', async function (this: CustomWorld, contactName: string) {
  await this.phoneBookPage.toggleResponsiveContainer(contactName);
});

Then('the openable container for {string} should display the fields:', async function (this: CustomWorld, contactName: string, dataTable: DataTable) {
  const detailsList = this.phoneBookPage.getDetailsListForContact(contactName);
  await expect(detailsList, 'Expected responsive details list to be visible').toBeVisible();
  const fieldNames = dataTable.hashes().map(r => r['Field Name'].trim());
  for (const field of fieldNames) {
    const item = detailsList.locator('li', { hasText: field });
    await expect(item, `Expected openable container to display field "${field}"`).toBeVisible();
  }
});

Then('the openable container for {string} should contain {string}', async function (this: CustomWorld, contactName: string, expectedText: string) {
  const detailsList = this.phoneBookPage.getDetailsListForContact(contactName);
  await expect(detailsList, 'Expected responsive details list to be visible').toBeVisible();
  await expect(detailsList).toContainText(expectedText);
});

When('I switch to Card View', async function (this: CustomWorld) {
  await this.phoneBookPage.switchToCardView();
});

When('I switch to Table View', async function (this: CustomWorld) {
  await this.phoneBookPage.switchToTableView();
});

Then('the contact card for {string} should display all fields:', async function (this: CustomWorld, contactName: string, dataTable: DataTable) {
  const card = this.phoneBookPage.getRowForContact(contactName);
  const classes = dataTable.hashes().map(r => r['Cell Class'].trim());
  for (const cls of classes) {
    const field = card.locator(`.${cls}`);
    await expect(field, `Expected card field .${cls} to be visible in Card View`).toBeVisible();
  }
});

Then('the contact card for {string} should contain {string}', async function (this: CustomWorld, contactName: string, expectedText: string) {
  const card = this.phoneBookPage.getRowForContact(contactName);
  await expect(card).toContainText(expectedText);
});
