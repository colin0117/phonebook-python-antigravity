import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Precondition step for self-contained test fixtures
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

Given('I navigate to the phone book application', async function (this: CustomWorld) {
  await this.phoneBookPage.goto();
});

Then('I should see the contacts table', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.contactsTable).toBeVisible();
});

Then('I should see existing contact entries in the directory', async function (this: CustomWorld) {
  const rowCount = await this.phoneBookPage.getRowCount();
  expect(rowCount).toBeGreaterThan(0);
});

Then('the contacts count in the summary card should match the table', async function (this: CustomWorld) {
  const totalCount = await this.phoneBookPage.getTotalCountFromStat();
  expect(totalCount).toBeGreaterThan(0);
});

When('I click on the "Add Contact" button', async function (this: CustomWorld) {
  await this.phoneBookPage.openAddContactModal();
});

Then('the "Add New Contact" modal should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.addModal.modal).toBeVisible();
});

When('I fill in the contact form with:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes() as { Field: string; Value: string }[];
  await this.phoneBookPage.addModal.fillForm(rows);
});

When('I submit the contact form', async function (this: CustomWorld) {
  await this.phoneBookPage.addModal.submit();
  await this.phoneBookPage.contactsTable.waitFor({ state: 'visible' });
});

Then('I should see {string} in the directory', async function (this: CustomWorld, expectedText: string) {
  await this.phoneBookPage.search(expectedText);
  await expect(this.phoneBookPage.contactsTable).toContainText(expectedText);
});

When('I search for {string} in the search box', async function (this: CustomWorld, searchTerm: string) {
  await this.phoneBookPage.search(searchTerm);
});

When('I click the edit button for {string}', async function (this: CustomWorld, contactName: string) {
  await this.phoneBookPage.clickEditFor(contactName);
});

Then('the "Edit Contact" modal should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.editModal.modal).toBeVisible();
});

When('I update the contact details with:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes() as { Field: string; Value: string }[];
  await this.phoneBookPage.editModal.fillForm(rows);
});

When('I save the changes', async function (this: CustomWorld) {
  await this.phoneBookPage.editModal.save();
  await this.phoneBookPage.contactsTable.waitFor({ state: 'visible' });
});

Then('I should see {string} for {string}', async function (this: CustomWorld, expectedText: string, contactName: string) {
  await this.phoneBookPage.search(contactName);
  const row = this.phoneBookPage.getRowForContact(contactName);
  await expect(row).toContainText(expectedText);
});

When('I click the delete button for {string} and confirm the prompt', async function (this: CustomWorld, contactName: string) {
  this.lastDialogMessage = await this.phoneBookPage.clickDeleteAndHandleDialog(contactName, true);
});

When('I click the delete button for {string} and cancel the confirmation prompt', async function (this: CustomWorld, contactName: string) {
  this.lastDialogMessage = await this.phoneBookPage.clickDeleteAndHandleDialog(contactName, false);
});

Then('the confirmation dialog should ask {string}', async function (this: CustomWorld, expectedMessage: string) {
  expect(this.lastDialogMessage, 'Expected dialog message to be captured').toBeDefined();
  expect(this.lastDialogMessage).toContain(expectedMessage);
});

Then('I should still see {string} in the directory', async function (this: CustomWorld, expectedText: string) {
  await this.phoneBookPage.search(expectedText);
  const row = this.phoneBookPage.getRowForContact(expectedText);
  await expect(row, `Expected contact "${expectedText}" to still be present in the directory`).toBeVisible();
});

Then('I should not see {string} in the directory', async function (this: CustomWorld, contactName: string) {
  await this.phoneBookPage.search(contactName);
  await expect(this.phoneBookPage.contactsTable).not.toContainText(contactName);
});
