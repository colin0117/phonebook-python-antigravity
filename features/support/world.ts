import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { BrowserContext, Page, APIResponse } from '@playwright/test';
import { PhoneBookPage } from '../pages/PhoneBookPage';

export interface CustomWorld extends World {
  context: BrowserContext;
  page: Page;
  phoneBookPage: PhoneBookPage;
  createdContactIds: number[];
  initialFactText?: string;
  lastApiResponse?: APIResponse;
  lastDialogMessage?: string;
}

export class CustomWorldClass extends World implements CustomWorld {
  context!: BrowserContext;
  page!: Page;
  phoneBookPage!: PhoneBookPage;
  createdContactIds: number[] = [];
  initialFactText?: string;
  lastApiResponse?: APIResponse;
  lastDialogMessage?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorldClass);
