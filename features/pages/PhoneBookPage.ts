import { Locator, Page } from '@playwright/test';
import { AddContactModal } from './AddContactModal';
import { EditContactModal } from './EditContactModal';

export class PhoneBookPage {
  readonly page: Page;
  readonly addModal: AddContactModal;
  readonly editModal: EditContactModal;

  readonly contactsTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly openAddModalButton: Locator;
  readonly searchInput: Locator;
  readonly totalContactsStat: Locator;
  readonly viewTableButton: Locator;
  readonly viewCardsButton: Locator;
  readonly togglePanesButton: Locator;
  readonly dobFactAlert: Locator;
  readonly dobFactText: Locator;
  readonly dobFactToast: Locator;
  readonly dobFactModal: Locator;
  readonly dobModalFactText: Locator;
  readonly dobModalStarSignTitle: Locator;
  readonly dobModalStarSignTraits: Locator;
  readonly btnNextDobFact: Locator;
  readonly btnModalNextDobFact: Locator;
  readonly btnRefreshAlertFact: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addModal = new AddContactModal(page);
    this.editModal = new EditContactModal(page);

    this.contactsTable = page.locator('#contactsTable');
    this.tableHeaders = page.locator('#contactsTable thead th');
    this.tableRows = page.locator('#contactsTable tbody tr');
    this.openAddModalButton = page.getByRole('button', { name: 'Add Contact' });
    this.searchInput = page.getByPlaceholder('Search contacts...');
    this.totalContactsStat = page.locator('#stat-total');
    this.viewTableButton = page.getByRole('button', { name: 'Table View' });
    this.viewCardsButton = page.getByRole('button', { name: 'Card View' });
    this.togglePanesButton = page.getByRole('button', { name: 'Filter Panes' });
    this.dobFactModal = page.locator('#dobFactModal');
    this.dobFactAlert = page.locator('#dobFactModal');
    this.dobFactText = page.locator('#dobModalFactText');
    this.dobFactToast = page.locator('#dobFactToast');
    this.dobModalFactText = page.locator('#dobModalFactText');
    this.dobModalStarSignTitle = page.locator('#dobModalStarSignTitle');
    this.dobModalStarSignTraits = page.locator('#dobModalStarSignTraits');
    this.btnNextDobFact = page.locator('#btnModalNextDobFact');
    this.btnModalNextDobFact = page.locator('#btnModalNextDobFact');
    this.btnRefreshAlertFact = page.locator('#btnModalNextDobFact');
  }

  async dismissDobFactModalIfOpen() {
    try {
      const modal = this.page.locator('#dobFactModal.is-active');
      if (await modal.isVisible()) {
        const closeBtn = modal.locator('#closeDobFactModalBtn, #closeDobFactModalHeader').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          await this.page.keyboard.press('Escape');
        }
        await modal.waitFor({ state: 'hidden', timeout: 2000 }).catch(async () => {
          await this.page.evaluate(() => {
            document.querySelector('#dobFactModal')?.classList.remove('is-active');
          });
        });
      }
    } catch {
      await this.page.evaluate(() => {
        document.querySelector('#dobFactModal')?.classList.remove('is-active');
      }).catch(() => {});
    }
  }

  async goto() {
    await this.page.goto('/');
    await this.contactsTable.waitFor({ state: 'visible' });
  }

  async search(term: string) {
    await this.dismissDobFactModalIfOpen();
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(300); // Allow DataTables search debounce
  }

  async openAddContactModal() {
    await this.dismissDobFactModalIfOpen();
    await this.openAddModalButton.click();
    await this.addModal.modal.waitFor({ state: 'visible' });
  }

  getRowForContact(name: string): Locator {
    return this.tableRows.filter({ hasText: name });
  }

  async clickEditFor(name: string) {
    await this.dismissDobFactModalIfOpen();
    const row = this.getRowForContact(name);
    const rowEditBtn = row.getByRole('button', { name: 'Edit' });
    if (await rowEditBtn.isVisible()) {
      await rowEditBtn.click();
    } else {
      const childRow = this.getChildRowForContact(name);
      if (!(await childRow.isVisible())) {
        await this.toggleResponsiveContainer(name);
      }
      await childRow.getByRole('button', { name: 'Edit' }).click();
    }
    await this.editModal.modal.waitFor({ state: 'visible' });
  }

  async clickDeleteAndHandleDialog(name: string, accept: boolean): Promise<string> {
    await this.dismissDobFactModalIfOpen();
    let dialogMessage = '';

    const dialogPromise = new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        dialogMessage = dialog.message();
        if (accept) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
        resolve(dialogMessage);
      });
    });

    const row = this.getRowForContact(name).first();
    const rowDelBtn = row.getByRole('button', { name: 'Delete' }).first();
    let deleteBtnToClick = rowDelBtn;
    if (!(await rowDelBtn.isVisible())) {
      const childRow = this.getChildRowForContact(name).first();
      if (!(await childRow.isVisible())) {
        await this.toggleResponsiveContainer(name);
      }
      deleteBtnToClick = childRow.getByRole('button', { name: 'Delete' }).first();
    }

    if (accept) {
      await Promise.all([
        this.page.waitForEvent('framenavigated'),
        deleteBtnToClick.click()
      ]);
      await this.contactsTable.waitFor({ state: 'visible' });
    } else {
      await deleteBtnToClick.click();
      await this.page.waitForTimeout(300);
    }

    return await dialogPromise;
  }

  async clickDeleteFor(name: string) {
    return await this.clickDeleteAndHandleDialog(name, true);
  }

  async setViewport(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
    await this.page.waitForTimeout(300);
  }

  async switchToCardView() {
    await this.dismissDobFactModalIfOpen();
    await this.viewCardsButton.click();
    await this.contactsTable.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(300);
  }

  async switchToTableView() {
    await this.dismissDobFactModalIfOpen();
    await this.viewTableButton.click();
    await this.contactsTable.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(300);
  }

  async toggleResponsiveContainer(contactName: string) {
    await this.dismissDobFactModalIfOpen();
    const row = this.getRowForContact(contactName);
    const control = row.locator('.dtr-control');
    await control.click();
    await this.page.waitForTimeout(300);
  }

  getChildRowForContact(contactName: string): Locator {
    const row = this.getRowForContact(contactName);
    return row.locator('+ tr.child');
  }

  getDetailsListForContact(contactName: string): Locator {
    return this.getChildRowForContact(contactName).locator('ul.dtr-details');
  }

  async getHeaderTexts(): Promise<string[]> {
    const texts = await this.tableHeaders.allInnerTexts();
    return texts.map(t => t.trim());
  }

  async getTotalCountFromStat(): Promise<number> {
    const text = await this.totalContactsStat.innerText();
    return parseInt(text.trim(), 10);
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }
}
