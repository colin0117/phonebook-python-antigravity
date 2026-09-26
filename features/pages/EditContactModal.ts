import { Locator, Page } from '@playwright/test';

export class EditContactModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly categorySelect: Locator;
  readonly notesTextarea: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('#editContactModal');
    this.firstNameInput = page.locator('#edit_first_name');
    this.lastNameInput = page.locator('#edit_last_name');
    this.phoneInput = page.locator('#edit_phone_number');
    this.emailInput = page.locator('#edit_email');
    this.dateOfBirthInput = page.locator('#edit_date_of_birth');
    this.categorySelect = page.locator('#edit_category');
    this.notesTextarea = page.locator('#edit_notes');
    this.saveButton = this.modal.getByRole('button', { name: 'Save Changes' });
  }

  async fillField(field: string, value: string) {
    const normalized = field.toLowerCase();
    if (normalized.includes('first')) {
      await this.firstNameInput.fill(value);
    } else if (normalized.includes('last')) {
      await this.lastNameInput.fill(value);
    } else if (normalized.includes('phone')) {
      await this.phoneInput.fill(value);
    } else if (normalized.includes('email')) {
      await this.emailInput.fill(value);
    } else if (normalized.includes('birth') || normalized.includes('dob')) {
      await this.dateOfBirthInput.fill(value);
    } else if (normalized.includes('category')) {
      await this.categorySelect.selectOption(value);
    } else if (normalized.includes('notes')) {
      await this.notesTextarea.fill(value);
    }
  }

  async clearField(field: string) {
    const normalized = field.toLowerCase();
    if (normalized.includes('first')) {
      await this.firstNameInput.fill('');
    } else if (normalized.includes('last')) {
      await this.lastNameInput.fill('');
    } else if (normalized.includes('phone')) {
      await this.phoneInput.fill('');
    } else if (normalized.includes('email')) {
      await this.emailInput.fill('');
    } else if (normalized.includes('birth') || normalized.includes('dob')) {
      await this.dateOfBirthInput.fill('');
    } else if (normalized.includes('notes')) {
      await this.notesTextarea.fill('');
    }
  }

  async fillForm(fields: { Field: string; Value: string }[]) {
    for (const item of fields) {
      await this.fillField(item.Field, item.Value);
    }
  }

  async save() {
    await Promise.all([
      this.page.waitForEvent('framenavigated'),
      this.saveButton.click()
    ]);
  }

  async attemptSubmit() {
    await this.saveButton.click();
    await this.page.waitForTimeout(200);
  }
}
