import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Then('the row for {string} should display a {string} warning badge', async function (
  this: CustomWorld,
  contactName: string,
  badgeText: string
) {
  const row = this.phoneBookPage.getRowForContact(contactName);
  const badge = row.locator('.duplicate-row-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText(badgeText);
});

When('I click the "Duplicates" button', async function (this: CustomWorld) {
  await this.phoneBookPage.openDuplicatesModal();
});

Then('the "Duplicate Contacts" modal should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.duplicatesModal).toBeVisible();
});

Then(
  'the Duplicates modal should list a {string} group for {string} with {string} and {string}',
  async function (
    this: CustomWorld,
    groupType: string,
    groupValue: string,
    contactA: string,
    contactB: string
  ) {
    const card = this.phoneBookPage.duplicatesGroupsContainer
      .locator('.duplicate-group-card')
      .filter({ hasText: groupType })
      .filter({ hasText: groupValue })
      .first();
    await expect(card).toBeVisible();
    await expect(card).toContainText(contactA);
    await expect(card).toContainText(contactB);
  }
);
