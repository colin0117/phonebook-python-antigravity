import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Then('the SearchPanes filter container should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.searchPanesContainer).toBeVisible();
});

Then('the SearchBuilder query container should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.searchBuilderContainer).toBeVisible();
});

Then('the SearchBuilder query container should be hidden', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.searchBuilderContainer).toBeHidden();
});

Then('SearchPanes and SearchBuilder should be aligned side by side in the same layout row', async function (this: CustomWorld) {
  const sharedRow = this.phoneBookPage.page.locator('.dt-layout-row', {
    has: this.phoneBookPage.searchPanesContainer
  }).filter({
    has: this.phoneBookPage.searchBuilderContainer
  });
  await expect(sharedRow, 'Expected SearchPanes and SearchBuilder to share a single .dt-layout-row').toBeVisible();

  const panesBox = await this.phoneBookPage.searchPanesContainer.boundingBox();
  const builderBox = await this.phoneBookPage.searchBuilderContainer.boundingBox();
  expect(panesBox).not.toBeNull();
  expect(builderBox).not.toBeNull();
  expect(Math.abs(panesBox!.y - builderBox!.y), 'Expected SearchPanes and SearchBuilder to be on the same horizontal row').toBeLessThan(20);
});

Then('the SearchBuilder "Add Condition" button should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.searchBuilderAddButton).toBeVisible();
});

When('I click the "Search Builder" toggle button', async function (this: CustomWorld) {
  await this.phoneBookPage.toggleSearchBuilderButton.click();
});

When('I add a SearchBuilder condition where {string} {string} {string}', async function (
  this: CustomWorld,
  column: string,
  condition: string,
  value: string
) {
  await this.phoneBookPage.addSearchBuilderCondition(column, condition, value);
});

When('I clear all SearchBuilder conditions', async function (this: CustomWorld) {
  await this.phoneBookPage.clearSearchBuilder();
});

When('I select the {string} category in SearchPanes', async function (this: CustomWorld, category: string) {
  await this.phoneBookPage.selectSearchPaneCategory(category);
});

Then('the directory table should display {string}', async function (this: CustomWorld, expectedText: string) {
  await expect(this.phoneBookPage.contactsTable).toContainText(expectedText);
});

Then('the directory table should not display {string}', async function (this: CustomWorld, unexpectedText: string) {
  await expect(this.phoneBookPage.contactsTable).not.toContainText(unexpectedText);
});
