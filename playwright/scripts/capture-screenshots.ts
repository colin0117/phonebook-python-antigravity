import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function capture() {
  const screenshotsDir = path.resolve(__dirname, '../../docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1020 },
    deviceScaleFactor: 2 // High resolution crisp display
  });

  const page = await context.newPage();

  // 1. Capture Main Directory Screen
  console.log('Navigating to http://127.0.0.1:5000...');
  await page.goto('http://127.0.0.1:5000', { waitUntil: 'networkidle' });
  await page.waitForSelector('#contactsTable tbody tr');
  await page.waitForTimeout(600);

  const mainPath = path.join(screenshotsDir, 'main-directory.png');
  await page.screenshot({ path: mainPath, fullPage: false });
  console.log(`Main directory screenshot saved to ${mainPath}`);

  // 2. Trigger Birthday Insights Modal
  console.log('Triggering Birthday Insights Pop-up...');
  await page.evaluate(async () => {
    const res = await fetch('/api/dob-facts?dob=1992-04-18');
    const data = await res.json();
    sessionStorage.setItem('pending_dob_fact', JSON.stringify({
      name: 'Alice Johnson',
      dob: '1992-04-18',
      dob_details: data.data,
      fact: data.data.primary_fact
    }));
  });

  // Reload page so index.html processes pending_dob_fact from sessionStorage
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#dobFactModal.is-active', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(600);

  const modalPath = path.join(screenshotsDir, 'birthday-insights.png');
  await page.screenshot({ path: modalPath, fullPage: false });
  console.log(`Birthday insights screenshot saved to ${modalPath}`);

  await browser.close();
}

capture().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
