import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('the database setting {string} is {string}', async function (
  this: CustomWorld,
  settingKey: string,
  expectedValueStr: string
) {
  this.settings = await this.api.getSettings();
  const expectedBool = expectedValueStr.trim().toLowerCase() === 'true';
  const actualVal = Boolean(this.settings[settingKey]);

  if (actualVal !== expectedBool) {
    // Dynamically skip this scenario because the target environment's DB setting does not match
    return 'skipped';
  }
});

Given('the following duplicate test contacts exist:', async function (
  this: CustomWorld,
  dataTable: DataTable
) {
  const rows = dataTable.hashes();
  for (const row of rows) {
    const response = await this.api.createContact({
      first_name: row['First Name'].trim(),
      last_name: row['Last Name'].trim(),
      phone_number: row['Phone Number'].trim(),
      email: (row['Email'] || '').trim(),
      date_of_birth: (row['Date of Birth'] || '').trim() || null,
      category: (row['Category'] || 'Work').trim(),
      notes: 'Duplicate settings BDD fixture'
    });
    expect(response.ok()).toBeTruthy();
  }
});

Then('the "Duplicates" toolbar button should be hidden', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.openDuplicatesModalButton).toBeHidden();
});

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

Then('the row for {string} should not display a {string} warning badge', async function (
  this: CustomWorld,
  contactName: string,
  _badgeText: string
) {
  const row = this.phoneBookPage.getRowForContact(contactName);
  const badge = row.locator('.duplicate-row-badge');
  await expect(badge).toBeHidden();
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

Then('the duplicate detection UI and modal groups should match the active database settings', async function (
  this: CustomWorld
) {
  this.settings = await this.api.getSettings();

  if (!this.settings.duplicates_enabled) {
    await expect(this.phoneBookPage.openDuplicatesModalButton).toBeHidden();
    await this.phoneBookPage.search('CfgName-Test');
    const row = this.phoneBookPage.getRowForContact('CfgName-Test');
    await expect(row.locator('.duplicate-row-badge')).toBeHidden();
    return;
  }

  await expect(this.phoneBookPage.openDuplicatesModalButton).toBeVisible();
  await this.phoneBookPage.openDuplicatesModal();
  await expect(this.phoneBookPage.duplicatesModal).toBeVisible();

  const checks = [
    {
      enabled: Boolean(this.settings.duplicates_match_name),
      groupType: 'Duplicate Name',
      groupValue: 'CfgName-Test, Alan'
    },
    {
      enabled: Boolean(this.settings.duplicates_match_phone),
      groupType: 'Duplicate Phone Number',
      groupValue: '+1 (555) 919-5555'
    },
    {
      enabled: Boolean(this.settings.duplicates_match_email),
      groupType: 'Duplicate Email',
      groupValue: 'shared.cfg@cfg.test'
    },
    {
      enabled: Boolean(this.settings.duplicates_match_dob),
      groupType: 'Duplicate Date of Birth',
      groupValue: '1932-08-04'
    }
  ];

  for (const check of checks) {
    const groupCard = this.phoneBookPage.duplicatesGroupsContainer
      .locator('.duplicate-group-card')
      .filter({ hasText: check.groupType })
      .filter({ hasText: check.groupValue });

    if (check.enabled) {
      await expect(
        groupCard.first(),
        `Expected "${check.groupType}" for "${check.groupValue}" to be present when setting is enabled`
      ).toBeVisible();
    } else {
      await expect(
        groupCard,
        `Expected "${check.groupType}" for "${check.groupValue}" NOT to be present when setting is disabled`
      ).toHaveCount(0);
    }
  }
});
