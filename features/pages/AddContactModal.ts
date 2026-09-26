import { Locator, Page } from '@playwright/test';

export class AddContactModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly categorySelect: Locator;
  readonly notesTextarea: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('#addContactModal');
    this.firstNameInput = page.locator('#addContactForm input[name="first_name"]');
    this.lastNameInput = page.locator('#addContactForm input[name="last_name"]');
    this.phoneInput = page.locator('#addContactForm input[name="phone_number"]');
    this.emailInput = page.locator('#addContactForm input[name="email"]');
    this.dateOfBirthInput = page.locator('#addContactForm input[name="date_of_birth"]');
    this.categorySelect = page.locator('#addContactForm select[name="category"]');
    this.notesTextarea = page.locator('#addContactForm textarea[name="notes"]');
    this.submitButton = this.modal.getByRole('button', { name: 'Save Contact' });
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

  async fillForm(fields: { Field: string; Value: string }[]) {
    for (const item of fields) {
      await this.fillField(item.Field, item.Value);
    }
  }

  async submit() {
    await Promise.all([
      this.page.waitForEvent('framenavigated'),
      this.submitButton.click()
    ]);
  }

  async attemptSubmit() {
    await this.submitButton.click();
    await this.page.waitForTimeout(200);
  }
}
