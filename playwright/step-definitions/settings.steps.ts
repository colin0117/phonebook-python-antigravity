import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I have opened the Application Settings modal in read-only mode', async function (this: CustomWorld) {
  this.settings = await this.api.getSettings();
  if (!this.settings.settings_display_enabled) {
    return 'skipped';
  }
  await this.phoneBookPage.goto();
  await this.phoneBookPage.openSettingsModal();
});

Given('I have opened the Application Settings modal in editing mode', async function (this: CustomWorld) {
  this.settings = await this.api.getSettings();
  if (!this.settings.settings_display_enabled) {
    return 'skipped';
  }
  await this.phoneBookPage.goto();
  await this.phoneBookPage.openSettingsModal();
  await this.phoneBookPage.clickEditSettings();
});

Then('the "Settings" header button should be hidden', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.openSettingsModalButton).toBeHidden();
});

Then('the "Settings" header button should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.openSettingsModalButton).toBeVisible();
});

When('I click the "Settings" button in the header', async function (this: CustomWorld) {
  await this.phoneBookPage.openSettingsModal();
});

Then('the "Application Settings" modal should be visible', async function (this: CustomWorld) {
  await expect(this.phoneBookPage.settingsModal).toBeVisible();
});

Then('the Application Settings modal should be in {string} mode', async function (
  this: CustomWorld,
  expectedMode: string
) {
  await expect(this.phoneBookPage.settingsModeBadge).toContainText(expectedMode);
  if (expectedMode === 'Read-Only') {
    await expect(this.phoneBookPage.editSettingsButton).toBeVisible();
    await expect(this.phoneBookPage.saveSettingsButton).toBeHidden();
    await expect(this.phoneBookPage.settingsTableBody.locator('.setting-toggle-btn')).toHaveCount(0);
  } else {
    await expect(this.phoneBookPage.editSettingsButton).toBeHidden();
    await expect(this.phoneBookPage.saveSettingsButton).toBeVisible();
    const toggleCount = await this.phoneBookPage.settingsTableBody.locator('.setting-toggle-btn').count();
    expect(toggleCount).toBeGreaterThanOrEqual(6);
  }
});

Then('the Application Settings modal should remain in {string} mode', async function (
  this: CustomWorld,
  expectedMode: string
) {
  await expect(this.phoneBookPage.settingsModeBadge).toContainText(expectedMode);
  await expect(this.phoneBookPage.saveSettingsButton).toBeVisible();
});

When('I click the "Edit Settings" button in the Application Settings modal', async function (this: CustomWorld) {
  await this.phoneBookPage.clickEditSettings();
});

When('I toggle the {string} setting in the Application Settings modal', async function (
  this: CustomWorld,
  settingKey: string
) {
  this.settingsModified = true;
  await this.phoneBookPage.toggleSettingInModal(settingKey);
});

When('I click "Save Settings" and cancel the confirmation prompt', async function (this: CustomWorld) {
  this.lastDialogMessage = await this.phoneBookPage.clickSaveSettingsAndHandleDialog(false);
});

When('I click "Save Settings" and confirm the prompt', async function (this: CustomWorld) {
  this.settingsModified = true;
  this.lastDialogMessage = await this.phoneBookPage.clickSaveSettingsAndHandleDialog(true);
});

Then('the settings confirmation dialog should ask {string}', async function (
  this: CustomWorld,
  expectedMessage: string
) {
  expect(this.lastDialogMessage).toBeDefined();
  expect(this.lastDialogMessage).toContain(expectedMessage);
});

Then('the database value for setting {string} should remain unchanged', async function (
  this: CustomWorld,
  settingKey: string
) {
  const latest = await this.api.getSettings();
  expect(Boolean(latest[settingKey])).toBe(Boolean(this.initialSettings[settingKey]));
});

Then('the database value for setting {string} should reflect the toggled value', async function (
  this: CustomWorld,
  settingKey: string
) {
  const latest = await this.api.getSettings();
  const expectedToggled = !Boolean(this.initialSettings[settingKey]);
  expect(Boolean(latest[settingKey])).toBe(expectedToggled);

  const row = this.phoneBookPage.settingsTableBody.locator(`tr[data-setting-key="${settingKey}"]`);
  await expect(row.locator('.setting-value-cell')).toContainText(expectedToggled ? 'true' : 'false');
});

Then('the Application Settings modal should display all database settings keys, descriptions, and values', async function (
  this: CustomWorld
) {
  const items = await this.api.getSettingsItems();
  expect(items.length).toBeGreaterThanOrEqual(6);

  for (const item of items) {
    const row = this.phoneBookPage.settingsTableBody.locator(`tr[data-setting-key="${item.setting_key}"]`);
    await expect(row, `Expected settings modal row for "${item.setting_key}" to be visible`).toBeVisible();
    await expect(row).toContainText(item.setting_key);
    if (item.description) {
      await expect(row).toContainText(item.description);
    }
    await expect(row.locator('.setting-value-cell')).toContainText(item.setting_value);
  }
});

Then('the UI elements on the page should match the values displayed in the Application Settings panel', async function (
  this: CustomWorld
) {
  const dupRow = this.phoneBookPage.settingsTableBody.locator('tr[data-setting-key="duplicates_enabled"]');
  await expect(dupRow).toBeVisible();
  const displayedDupValue = (await dupRow.locator('.setting-value-cell').innerText()).trim().toLowerCase();

  if (displayedDupValue.includes('true')) {
    await expect(this.phoneBookPage.openDuplicatesModalButton).toBeVisible();
  } else {
    await expect(this.phoneBookPage.openDuplicatesModalButton).toBeHidden();
  }
});

Then('the Settings button and Application Settings panel should dynamically match the active database settings', async function (
  this: CustomWorld
) {
  this.settings = await this.api.getSettings();

  if (!this.settings.settings_display_enabled) {
    await expect(this.phoneBookPage.openSettingsModalButton).toBeHidden();
    return;
  }

  await expect(this.phoneBookPage.openSettingsModalButton).toBeVisible();
  await this.phoneBookPage.openSettingsModal();
  await expect(this.phoneBookPage.settingsModal).toBeVisible();

  const items = await this.api.getSettingsItems();
  for (const item of items) {
    const row = this.phoneBookPage.settingsTableBody.locator(`tr[data-setting-key="${item.setting_key}"]`);
    await expect(row).toBeVisible();
    await expect(row.locator('.setting-value-cell')).toContainText(item.setting_value);
  }
});
