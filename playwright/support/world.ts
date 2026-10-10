import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { BrowserContext, Page, APIResponse } from '@playwright/test';
import { PhoneBookPage } from '../pages/phone-book.page';
import { ApiHelper } from '../utils/api-helper';
import { BddFixtures } from '../fixtures/bdd-fixtures';

export interface CustomWorld extends World {
  context: BrowserContext;
  page: Page;
  phoneBookPage: PhoneBookPage;
  api: ApiHelper;
  fixtures: BddFixtures;
  createdContactIds: number[];
  initialFactText?: string;
  lastApiResponse?: APIResponse;
  lastDialogMessage?: string;
  recordedStats?: Record<string, number>;
}

export class CustomWorldClass extends World implements CustomWorld {
  context!: BrowserContext;
  page!: Page;
  phoneBookPage!: PhoneBookPage;
  api!: ApiHelper;
  fixtures!: BddFixtures;
  createdContactIds: number[] = [];
  initialFactText?: string;
  lastApiResponse?: APIResponse;
  lastDialogMessage?: string;
  recordedStats?: Record<string, number>;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorldClass);

