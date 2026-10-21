import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { AddContactModal } from './add-contact-modal.page';
import { EditContactModal } from './edit-contact-modal.page';

export class PhoneBookPage extends BasePage {
  readonly addModal: AddContactModal;
  readonly editModal: EditContactModal;

  // Main Directory & Table Locators
  readonly contactsTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly searchInput: Locator;

  // Header Summary Stat Locators
  readonly totalContactsStat: Locator;
  readonly workContactsStat: Locator;
  readonly familyContactsStat: Locator;
  readonly otherContactsStat: Locator;
  readonly totalContactsCard: Locator;
  readonly workContactsCard: Locator;
  readonly familyContactsCard: Locator;
  readonly otherContactsCard: Locator;

  // View & Filter Action Controls
  readonly openAddModalButton: Locator;
  readonly viewTableButton: Locator;
  readonly viewCardsButton: Locator;
  readonly togglePanesButton: Locator;
  readonly toggleSearchBuilderButton: Locator;
  readonly searchPanesContainer: Locator;
  readonly searchBuilderContainer: Locator;
  readonly searchToolsLayoutRow: Locator;
  readonly searchBuilderAddButton: Locator;
  readonly searchBuilderClearAllButton: Locator;

  // Centered Birthday Insights Pop-up Locators
  readonly dobFactModal: Locator;
  readonly activeDobModal: Locator;
  readonly closeDobModalHeaderButton: Locator;
  readonly closeDobModalFooterButton: Locator;
  readonly dobModalFactText: Locator;
  readonly dobModalStarSignTitle: Locator;
  readonly dobModalStarSignTraits: Locator;
  readonly btnModalNextDobFact: Locator;

  // Backwards Compatibility Aliases
  readonly dobFactAlert: Locator;
  readonly dobFactText: Locator;
  readonly btnNextDobFact: Locator;
  readonly btnRefreshAlertFact: Locator;

  // Table Sub-Locators & Controls
  readonly childRows: Locator;
  readonly responsiveControls: Locator;
  readonly editButtons: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.addModal = new AddContactModal(page);
    this.editModal = new EditContactModal(page);

    // Main Directory & Table Locators
    this.contactsTable = page.locator('#contactsTable');
    this.tableHeaders = page.locator('#contactsTable thead th');
    this.tableRows = page.locator('#contactsTable tbody tr');
    this.searchInput = page.getByPlaceholder('Search contacts...');

    // Header Summary Stat Locators
    this.totalContactsStat = page.locator('#stat-total');
    this.workContactsStat = page.locator('#stat-work');
    this.familyContactsStat = page.locator('#stat-family');
    this.otherContactsStat = page.locator('#stat-other');
    this.totalContactsCard = page.locator('.stat-box.stat-total');
    this.workContactsCard = page.locator('.stat-box.stat-work');
    this.familyContactsCard = page.locator('.stat-box.stat-family');
    this.otherContactsCard = page.locator('.stat-box.stat-other');

    // View & Filter Action Controls
    this.openAddModalButton = page.getByRole('button', { name: 'Add Contact' });
    this.viewTableButton = page.getByRole('button', { name: 'Table View' });
    this.viewCardsButton = page.getByRole('button', { name: 'Card View' });
    this.togglePanesButton = page.getByRole('button', { name: 'Filter Panes' });
    this.toggleSearchBuilderButton = page.getByRole('button', { name: 'Search Builder' });
    this.searchPanesContainer = page.locator('.dtsp-panesContainer');
    this.searchBuilderContainer = page.locator('.dtsb-searchBuilder');
    this.searchToolsLayoutRow = page
      .locator('div.dt-container > div.columns, div.dt-container .dt-layout-row')
      .filter({ has: this.searchPanesContainer })
      .filter({ has: this.searchBuilderContainer });
    this.searchBuilderAddButton = page.locator('.dtsb-searchBuilder button.dtsb-add');
    this.searchBuilderClearAllButton = page.locator('.dtsb-searchBuilder button.dtsb-clearAll');

    // Centered Birthday Insights Pop-up Locators
    this.dobFactModal = page.locator('#dobFactModal');
    this.activeDobModal = page.locator('#dobFactModal.is-active');
    this.closeDobModalHeaderButton = page.locator('#closeDobFactModalHeader');
    this.closeDobModalFooterButton = page.locator('#closeDobFactModalBtn');
    this.dobModalFactText = page.locator('#dobModalFactText');
    this.dobModalStarSignTitle = page.locator('#dobModalStarSignTitle');
    this.dobModalStarSignTraits = page.locator('#dobModalStarSignTraits');
    this.btnModalNextDobFact = page.locator('#btnModalNextDobFact');

    // Backwards Compatibility Aliases
    this.dobFactAlert = page.locator('#dobFactModal');
    this.dobFactText = page.locator('#dobModalFactText');
    this.btnNextDobFact = page.locator('#btnModalNextDobFact');
    this.btnRefreshAlertFact = page.locator('#btnModalNextDobFact');

    // Table Sub-Locators
    this.childRows = page.locator('#contactsTable tbody tr.child');
    this.responsiveControls = page.locator('#contactsTable tbody .dtr-control');
    this.editButtons = page.locator('#contactsTable tbody .btn-edit');
    this.deleteButtons = page.locator('#contactsTable tbody .btn-delete');
  }

  // ---------------------------------------------------------------------------
  // Dedicated Locator Helpers (Parameterised Element Resolvers)
  // ---------------------------------------------------------------------------

  getRowForContact(name: string): Locator {
    return this.tableRows.filter({ hasText: name }).first();
  }

  getChildRowForContact(name: string): Locator {
    return this.getRowForContact(name).locator('+ tr.child').first();
  }

  getDetailsListForContact(name: string): Locator {
    return this.getChildRowForContact(name).locator('ul.dtr-details');
  }

  getEditButton(container: Locator): Locator {
    return container.getByRole('button', { name: 'Edit' }).first();
  }

  getDeleteButton(container: Locator): Locator {
    return container.getByRole('button', { name: 'Delete' }).first();
  }

  getResponsiveControl(row: Locator): Locator {
    return row.locator('.dtr-control').first();
  }

  // ---------------------------------------------------------------------------
  // Page Actions (Condition-Driven, Zero Arbitrary Sleep)
  // ---------------------------------------------------------------------------

  async dismissDobFactModalIfOpen() {
    try {
      if (await this.activeDobModal.isVisible()) {
        if (await this.closeDobModalFooterButton.isVisible()) {
          await this.closeDobModalFooterButton.click();
        } else if (await this.closeDobModalHeaderButton.isVisible()) {
          await this.closeDobModalHeaderButton.click();
        } else {
          await this.page.keyboard.press('Escape');
        }
        await this.activeDobModal.waitFor({ state: 'hidden', timeout: 2000 }).catch(async () => {
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
    await this.navigate('/');
    await this.contactsTable.waitFor({ state: 'visible' });
  }

  async search(term: string) {
    await this.dismissDobFactModalIfOpen();
    await this.searchInput.fill(term);
  }

  async openAddContactModal() {
    await this.dismissDobFactModalIfOpen();
    await this.openAddModalButton.click();
    await this.addModal.modal.waitFor({ state: 'visible' });
  }

  async clickEditFor(name: string) {
    await this.dismissDobFactModalIfOpen();
    const row = this.getRowForContact(name);
    const rowEditBtn = this.getEditButton(row);

    if (await rowEditBtn.isVisible()) {
      await rowEditBtn.click();
    } else {
      const childRow = this.getChildRowForContact(name);
      if (!(await childRow.isVisible())) {
        await this.toggleResponsiveContainer(name);
      }
      await this.getEditButton(childRow).click();
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

    const row = this.getRowForContact(name);
    const rowDelBtn = this.getDeleteButton(row);
    let deleteBtnToClick = rowDelBtn;

    if (!(await rowDelBtn.isVisible())) {
      const childRow = this.getChildRowForContact(name);
      if (!(await childRow.isVisible())) {
        await this.toggleResponsiveContainer(name);
      }
      deleteBtnToClick = this.getDeleteButton(childRow);
    }

    if (accept) {
      await Promise.all([
        this.page.waitForEvent('framenavigated'),
        deleteBtnToClick.click()
      ]);
      await this.contactsTable.waitFor({ state: 'visible' });
    } else {
      await deleteBtnToClick.click();
    }

    return await dialogPromise;
  }

  async clickDeleteFor(name: string) {
    return await this.clickDeleteAndHandleDialog(name, true);
  }

  async setViewport(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }

  async switchToCardView() {
    await this.dismissDobFactModalIfOpen();
    await this.viewCardsButton.click();
    await expect(this.contactsTable).toHaveClass(/cards-view/);
  }

  async switchToTableView() {
    await this.dismissDobFactModalIfOpen();
    await this.viewTableButton.click();
    await expect(this.contactsTable).not.toHaveClass(/cards-view/);
  }

  async toggleResponsiveContainer(contactName: string) {
    await this.dismissDobFactModalIfOpen();
    const row = this.getRowForContact(contactName);
    const control = this.getResponsiveControl(row);
    const childRow = this.getChildRowForContact(contactName);
    const willOpen = !(await childRow.isVisible());

    await control.click();
    if (willOpen) {
      await childRow.waitFor({ state: 'visible' });
    } else {
      await childRow.waitFor({ state: 'hidden' });
    }
  }

  async getHeaderTexts(): Promise<string[]> {
    const texts = await this.tableHeaders.allInnerTexts();
    return texts.map(t => t.trim());
  }

  async getTotalCountFromStat(): Promise<number> {
    const text = await this.totalContactsStat.innerText();
    return parseInt(text.trim(), 10);
  }

  getStatCard(label: string): Locator {
    const normalized = label.toLowerCase();
    if (normalized.includes('total')) {
      return this.totalContactsCard;
    } else if (normalized.includes('work')) {
      return this.workContactsCard;
    } else if (normalized.includes('family')) {
      return this.familyContactsCard;
    }
    return this.otherContactsCard;
  }

  async getStatCount(label: string): Promise<number> {
    const normalized = label.toLowerCase();
    let locator = this.otherContactsStat;
    if (normalized.includes('total')) {
      locator = this.totalContactsStat;
    } else if (normalized.includes('work')) {
      locator = this.workContactsStat;
    } else if (normalized.includes('family')) {
      locator = this.familyContactsStat;
    }
    const text = await locator.innerText();
    return parseInt(text.trim(), 10);
  }

  async getAllStatCounts(): Promise<Record<string, number>> {
    return {
      'Total Contacts': await this.getStatCount('Total Contacts'),
      'Work': await this.getStatCount('Work'),
      'Family': await this.getStatCount('Family'),
      'Friends & Others': await this.getStatCount('Friends & Others')
    };
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async addSearchBuilderCondition(columnLabel: string, conditionLabel: string, value: string) {
    await this.dismissDobFactModalIfOpen();
    await this.searchBuilderAddButton.click();

    const criteria = this.searchBuilderContainer.locator('.dtsb-criteria').last();
    const dataSelect = criteria.locator('select.dtsb-data');
    await dataSelect.selectOption({ label: columnLabel });

    const conditionSelect = criteria.locator('select.dtsb-condition');
    await conditionSelect.waitFor({ state: 'visible' });
    await conditionSelect.selectOption({ label: conditionLabel });

    const valueControl = criteria.locator('.dtsb-value').first();
    await valueControl.waitFor({ state: 'visible' });
    const tagName = await valueControl.evaluate(el => el.tagName.toLowerCase());
    if (tagName === 'select') {
      await valueControl.selectOption({ label: value });
    } else {
      await valueControl.fill(value);
      await valueControl.dispatchEvent('input');
      await valueControl.dispatchEvent('change');
    }
  }

  async clearSearchBuilder() {
    await this.dismissDobFactModalIfOpen();
    if (await this.searchBuilderClearAllButton.isVisible()) {
      await this.searchBuilderClearAllButton.click();
    }
  }

  async selectSearchPaneCategory(category: string) {
    await this.dismissDobFactModalIfOpen();
    const paneRow = this.searchPanesContainer.locator('tr', { hasText: category }).first();
    await paneRow.click();
  }

  async toggleFilterPanes() {
    await this.dismissDobFactModalIfOpen();
    await this.togglePanesButton.click();
  }

  async toggleSearchBuilder() {
    await this.dismissDobFactModalIfOpen();
    await this.toggleSearchBuilderButton.click();
  }
}


