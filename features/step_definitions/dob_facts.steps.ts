import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Then('the birthday discovery pop-up should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.dobFactModal, 'Expected DOB fact pop-up modal to be visible').toBeVisible({ timeout: 10000 });
});

Then('the pop-up should display the star sign {string}', async function (this: CustomWorld, starSign: string) {
  await expect(this.phoneBookPage.dobFactModal).toContainText(starSign);
  const text = await this.phoneBookPage.dobFactModal.innerText();
  expect(text.length, 'Expected star sign text to be present').toBeGreaterThan(5);
});

Then('the pop-up should display a fun fact pulled from the web', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.dobModalFactText, 'Expected web fact text to be visible').toBeVisible();
  const text = await this.phoneBookPage.dobModalFactText.innerText();
  expect(text.length, 'Expected web fact text to have meaningful content').toBeGreaterThan(10);
  this.initialFactText = text;
});

When('I click the refresh button for the next fun fact in the pop-up', async function (this: CustomWorld) {
  await this.phoneBookPage.btnModalNextDobFact.click();
  await this.phoneBookPage.page.waitForTimeout(300);
});

Then('the pop-up should display an updated fun fact', async function (this: CustomWorld) {
  const newText = await this.phoneBookPage.dobModalFactText.innerText();
  expect(newText.length, 'Expected refreshed fact text to be present').toBeGreaterThan(10);
  expect(newText, 'Expected refreshed fact to differ from initial fact').not.toEqual(this.initialFactText);
});
