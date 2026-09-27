import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AddContactModal extends BasePage {
  readonly modal: Locator;
  readonly form: Locator;
  readonly alert: Locator;
  readonly closeIcon: Locator;

  // Form Fields
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly categorySelect: Locator;
  readonly notesTextarea: Locator;

  // Action Buttons
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.locator('#addContactModal');
    this.form = page.locator('#addContactForm');
    this.alert = page.locator('#modalAlert');
    this.closeIcon = this.modal.locator('button.delete');

    // Form Fields
    this.firstNameInput = this.form.locator('input[name="first_name"]');
    this.lastNameInput = this.form.locator('input[name="last_name"]');
    this.phoneInput = this.form.locator('input[name="phone_number"]');
    this.emailInput = this.form.locator('input[name="email"]');
    this.dateOfBirthInput = this.form.locator('input[name="date_of_birth"]');
    this.categorySelect = this.form.locator('select[name="category"]');
    this.notesTextarea = this.form.locator('textarea[name="notes"]');

    // Action Buttons
    this.submitButton = this.modal.getByRole('button', { name: 'Save Contact' });
    this.cancelButton = this.modal.getByRole('button', { name: 'Cancel' });
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
  }
}
