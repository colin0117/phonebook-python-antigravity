import { Given, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Then('I should see the following summary stat cards in the header bar:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes() as { 'Card Label': string; Selector: string }[];

  for (const row of rows) {
    const label = row['Card Label'].trim();
    const selector = row['Selector'].trim();
    const card = this.phoneBookPage.getStatCard(label);
    const statValue = this.phoneBookPage.page.locator(selector);

    await expect(card, `Expected summary card "${label}" to be visible`).toBeVisible();
    await expect(card.locator('.heading'), `Expected summary card heading to match "${label}"`).toHaveText(label);
    await expect(statValue, `Expected stat value element "${selector}" to be visible`).toBeVisible();

    const text = (await statValue.innerText()).trim();
    expect(Number.isNaN(parseInt(text, 10)), `Expected "${label}" stat (${selector}) to display a valid number, got "${text}"`).toBeFalsy();
  }
});

Then('the {string} summary stat should equal the sum of {string}, {string}, and {string}', async function (
  this: CustomWorld,
  totalLabel: string,
  cat1Label: string,
  cat2Label: string,
  cat3Label: string
) {
  const total = await this.phoneBookPage.getStatCount(totalLabel);
  const count1 = await this.phoneBookPage.getStatCount(cat1Label);
  const count2 = await this.phoneBookPage.getStatCount(cat2Label);
  const count3 = await this.phoneBookPage.getStatCount(cat3Label);

  expect(total, `Expected "${totalLabel}" (${total}) to equal ${cat1Label} (${count1}) + ${cat2Label} (${count2}) + ${cat3Label} (${count3})`).toBe(
    count1 + count2 + count3
  );
});

Then('each summary stat card should match the actual number of contacts in that category', async function (this: CustomWorld) {
  const contacts = await this.api.getAllContacts();
  const expectedTotal = contacts.length;
  const expectedWork = contacts.filter(c => c.category === 'Work').length;
  const expectedFamily = contacts.filter(c => c.category === 'Family').length;
  const expectedOther = contacts.filter(c => c.category !== 'Work' && c.category !== 'Family').length;

  const actualStats = await this.phoneBookPage.getAllStatCounts();

  expect(actualStats['Total Contacts'], 'Expected Total Contacts stat to match API contact count').toBe(expectedTotal);
  expect(actualStats['Work'], 'Expected Work stat to match API Work contact count').toBe(expectedWork);
  expect(actualStats['Family'], 'Expected Family stat to match API Family contact count').toBe(expectedFamily);
  expect(actualStats['Friends & Others'], 'Expected Friends & Others stat to match API non-Work/Family contact count').toBe(expectedOther);
});

Given('I record the current summary stat counts', async function (this: CustomWorld) {
  this.recordedStats = await this.phoneBookPage.getAllStatCounts();
});

Then('the summary stat counts should have changed by:', async function (this: CustomWorld, dataTable: DataTable) {
  expect(this.recordedStats, 'Expected baseline summary stats to have been recorded').toBeDefined();
  const baseline = this.recordedStats!;
  const current = await this.phoneBookPage.getAllStatCounts();

  const rows = dataTable.hashes() as { 'Card Label': string; Change: string }[];
  for (const row of rows) {
    const label = row['Card Label'].trim();
    const expectedDelta = parseInt(row['Change'].trim(), 10);
    const previousValue = baseline[label];
    const currentValue = current[label];

    expect(
      currentValue,
      `Expected "${label}" stat to change by ${row['Change']} (from ${previousValue} to ${previousValue + expectedDelta}), but got ${currentValue}`
    ).toBe(previousValue + expectedDelta);
  }
});
