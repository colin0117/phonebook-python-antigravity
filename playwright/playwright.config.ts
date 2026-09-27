import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './features',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
    headless: process.env.HEADED !== 'true'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
