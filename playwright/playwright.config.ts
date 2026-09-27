import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5000',
    extraHTTPHeaders: {
      'Accept': 'application/json'
    }
  },
  projects: [
    {
      name: 'api',
      testMatch: /.*\.spec\.ts/
    }
  ]
});
