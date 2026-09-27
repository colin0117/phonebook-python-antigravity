import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Then('I should see the following column headers in the contacts table:', async function (this: CustomWorld, dataTable: DataTable) {
  const expectedHeaders = dataTable.hashes().map(r => r['Column Header'].trim());
  const headerTexts = await this.phoneBookPage.getHeaderTexts();

  for (const expected of expectedHeaders) {
    const found = headerTexts.some(h => h.includes(expected));
    expect(found, `Expected column header "${expected}" to be present in table headers: [${headerTexts.join(', ')}]`).toBeTruthy();
  }
});

Then('each contact row in the table should display all field cells:', async function (this: CustomWorld, dataTable: DataTable) {
  const expectedClasses = dataTable.hashes().map(r => r['Cell Class'].trim());
  const firstRow = this.phoneBookPage.tableRows.first();

  for (const cls of expectedClasses) {
    const cell = firstRow.locator(`.${cls}`);
    await expect(cell, `Expected row to contain cell with class ".${cls}"`).toBeVisible();
  }
});

Then('the new contact form should display all input fields:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes();

  for (const row of rows) {
    const selector = `#addContactForm ${row['Selector']}`;
    const element = this.phoneBookPage.page.locator(selector);
    await expect(element, `Expected field "${row['Field Name']}" (${selector}) to be visible on new record form`).toBeVisible();
    await expect(element, `Expected field "${row['Field Name']}" to be editable`).toBeEnabled();
  }
});

Then('the Category dropdown on the new contact form should contain the options:', async function (this: CustomWorld, dataTable: DataTable) {
  const expectedOptions = dataTable.hashes().map(r => r['Option'].trim());
  const optionLocators = this.phoneBookPage.addModal.categorySelect.locator('option');
  const optionTexts = (await optionLocators.allInnerTexts()).map(t => t.trim());

  for (const expected of expectedOptions) {
    expect(optionTexts, `Expected Category dropdown to contain option "${expected}"`).toContain(expected);
  }
});

Then('the edit contact form should display all input fields:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes();

  for (const row of rows) {
    const selector = `#editContactForm ${row['Selector']}`;
    const element = this.phoneBookPage.page.locator(selector);
    await expect(element, `Expected field "${row['Field Name']}" (${selector}) to be visible on edit record form`).toBeVisible();
    await expect(element, `Expected field "${row['Field Name']}" to be editable`).toBeEnabled();
  }
});

Then('the edit contact form should be pre-populated with:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes();

  for (const row of rows) {
    const fieldName = row['Field Name'].toLowerCase();
    const expectedValue = row['Expected Value'];

    if (fieldName.includes('first')) {
      await expect(this.phoneBookPage.editModal.firstNameInput).toHaveValue(expectedValue);
    } else if (fieldName.includes('last')) {
      await expect(this.phoneBookPage.editModal.lastNameInput).toHaveValue(expectedValue);
    } else if (fieldName.includes('phone')) {
      await expect(this.phoneBookPage.editModal.phoneInput).toHaveValue(expectedValue);
    } else if (fieldName.includes('birth') || fieldName.includes('dob')) {
      await expect(this.phoneBookPage.editModal.dateOfBirthInput).toHaveValue(expectedValue);
    }
  }
});

When('I attempt to submit the new contact form', async function (this: CustomWorld) {
  await this.phoneBookPage.addModal.attemptSubmit();
});

Then('the field {string} on the new contact form should be invalid', async function (this: CustomWorld, fieldName: string) {
  const normalized = fieldName.toLowerCase();
  let inputLocator = this.phoneBookPage.addModal.firstNameInput;
  if (normalized.includes('last')) {
    inputLocator = this.phoneBookPage.addModal.lastNameInput;
  } else if (normalized.includes('phone')) {
    inputLocator = this.phoneBookPage.addModal.phoneInput;
  } else if (normalized.includes('email')) {
    inputLocator = this.phoneBookPage.addModal.emailInput;
  }
  const isValid = await inputLocator.evaluate((el: HTMLInputElement) => el.checkValidity());
  expect(isValid, `Expected field "${fieldName}" to be invalid`).toBeFalsy();
});

Then('the field {string} on the new contact form should be valid', async function (this: CustomWorld, fieldName: string) {
  const normalized = fieldName.toLowerCase();
  let inputLocator = this.phoneBookPage.addModal.firstNameInput;
  if (normalized.includes('last')) {
    inputLocator = this.phoneBookPage.addModal.lastNameInput;
  } else if (normalized.includes('phone')) {
    inputLocator = this.phoneBookPage.addModal.phoneInput;
  } else if (normalized.includes('email')) {
    inputLocator = this.phoneBookPage.addModal.emailInput;
  }
  const isValid = await inputLocator.evaluate((el: HTMLInputElement) => el.checkValidity());
  expect(isValid, `Expected field "${fieldName}" to be valid`).toBeTruthy();
});

Then('the "Add New Contact" modal should remain open', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.addModal.modal).toBeVisible();
});

When('I clear the field {string} on the edit contact form', async function (this: CustomWorld, fieldName: string) {
  await this.phoneBookPage.editModal.clearField(fieldName);
});

When('I attempt to submit the edit contact form', async function (this: CustomWorld) {
  await this.phoneBookPage.editModal.attemptSubmit();
});

Then('the field {string} on the edit contact form should be invalid', async function (this: CustomWorld, fieldName: string) {
  const normalized = fieldName.toLowerCase();
  let inputLocator = this.phoneBookPage.editModal.firstNameInput;
  if (normalized.includes('last')) {
    inputLocator = this.phoneBookPage.editModal.lastNameInput;
  } else if (normalized.includes('phone')) {
    inputLocator = this.phoneBookPage.editModal.phoneInput;
  } else if (normalized.includes('email')) {
    inputLocator = this.phoneBookPage.editModal.emailInput;
  }
  const isValid = await inputLocator.evaluate((el: HTMLInputElement) => el.checkValidity());
  expect(isValid, `Expected field "${fieldName}" on edit modal to be invalid`).toBeFalsy();
});

Then('the "Edit Contact" modal should remain open', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.editModal.modal).toBeVisible();
});

When('I send an API request to create a contact missing required fields:', async function (this: CustomWorld, dataTable: DataTable) {
  const data = dataTable.rowsHash();
  const response = await this.context.request.post('/api/contacts', { data });
  this.lastApiResponse = response;
});

When('I request DOB facts without the "dob" parameter', async function (this: CustomWorld) {
  const response = await this.context.request.get('/api/dob-facts');
  this.lastApiResponse = response;
});

When('I request DOB facts with an invalid date {string}', async function (this: CustomWorld, invalidDob: string) {
  const response = await this.context.request.get(`/api/dob-facts?dob=${encodeURIComponent(invalidDob)}`);
  this.lastApiResponse = response;
});

Then('the API response status should be {int}', async function (this: CustomWorld, expectedStatus: number) {
  expect(this.lastApiResponse).toBeDefined();
  expect(this.lastApiResponse!.status()).toBe(expectedStatus);
});

Then('the API error message should contain {string}', async function (this: CustomWorld, expectedText: string) {
  expect(this.lastApiResponse).toBeDefined();
  const json = await this.lastApiResponse!.json();
  expect(json.status).toBe('error');
  expect(json.message.toLowerCase()).toContain(expectedText.toLowerCase());
});
