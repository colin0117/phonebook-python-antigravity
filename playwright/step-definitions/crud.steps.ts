import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Then('I should see the contacts table', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.contactsTable).toBeVisible();
});

Then('I should see existing contact entries in the directory', async function (this: CustomWorld) {
  const rowCount = await this.phoneBookPage.getRowCount();
  expect(rowCount).toBeGreaterThan(0);
});

Then('the contacts count in the summary card should match the table', async function (this: CustomWorld) {
  const totalCount = await this.phoneBookPage.getTotalCountFromStat();
  const contacts = await this.api.getAllContacts();
  expect(totalCount).toBe(contacts.length);
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

When('I click the edit button for {string}', async function (this: CustomWorld, contactName: string) {
  await this.phoneBookPage.clickEditFor(contactName);
});

Then('the "Edit Contact" modal should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.editModal.modal).toBeVisible();
});

When('I close the "Edit Contact" modal', async function (this: CustomWorld) {
  await this.phoneBookPage.editModal.close();
});

When('I update the contact details with:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes() as { Field: string; Value: string }[];
  await this.phoneBookPage.editModal.fillForm(rows);
});

When('I save the changes', async function (this: CustomWorld) {
  await this.phoneBookPage.editModal.save();
  await this.phoneBookPage.contactsTable.waitFor({ state: 'visible' });
});

When('I inline edit the {string} cell for {string} to {string}', async function (
  this: CustomWorld,
  fieldName: string,
  contactName: string,
  newValue: string
) {
  await this.phoneBookPage.inlineEditCell(contactName, fieldName, newValue, 'enter');
});

When('I inline edit the {string} cell for {string} to {string} using {string}', async function (
  this: CustomWorld,
  fieldName: string,
  contactName: string,
  newValue: string,
  commitMethod: string
) {
  const mode = commitMethod.toLowerCase() === 'blur' ? 'blur' : 'enter';
  await this.phoneBookPage.inlineEditCell(contactName, fieldName, newValue, mode);
});

When('I start inline editing the {string} cell for {string} to {string} and press Escape', async function (
  this: CustomWorld,
  fieldName: string,
  contactName: string,
  tempValue: string
) {
  await this.phoneBookPage.cancelInlineEditWithEscape(contactName, fieldName, tempValue);
});

Then('the {string} cell for {string} should have a separate icon link for {string} and editable text', async function (
  this: CustomWorld,
  fieldName: string,
  contactName: string,
  schemePrefix: string
) {
  const cell = this.phoneBookPage.getCellForContact(contactName, fieldName);
  const iconLink = cell.locator('a.contact-icon-link');
  const editableText = cell.locator('.editable-cell-text');

  await expect(iconLink).toBeVisible();
  const href = await iconLink.getAttribute('href');
  expect(href?.startsWith(schemePrefix), `Expected icon link href "${href}" to start with "${schemePrefix}"`).toBeTruthy();

  await expect(editableText).toBeVisible();
  // Ensure the editable text is NOT inside the <a> element
  const textInsideAnchor = await editableText.evaluate(el => !!el.closest('a'));
  expect(textInsideAnchor, 'Expected editable cell text not to be wrapped in an <a> tag').toBe(false);
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
