import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAVE_DIR = path.join(__dirname, 'public', 'tutorial');
const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 1280, height: 900 };

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickNavButton(page, labelText) {
  const buttons = await page.$$('nav button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes(labelText)) {
      await btn.click();
      await delay(800);
      return;
    }
  }
  console.warn(`  Warning: Nav button containing "${labelText}" not found`);
}

async function takeScreenshot(page, filename, options = {}) {
  const savePath = path.join(SAVE_DIR, filename);
  await page.screenshot({
    path: savePath,
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    ...options,
  });
  console.log(`  Saved: ${filename}`);
}

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Auto-accept confirm dialogs (demo data loading triggers one)
  page.on('dialog', async dialog => {
    console.log(`  Dialog: "${dialog.message()}" -> accepting`);
    await dialog.accept();
  });

  try {
    // 1. Navigate to the app
    console.log('Navigating to app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(1000);

    // 2. Load demo data: click "デモデータ" button, then "B木工製作所"
    console.log('Loading demo data...');

    // Click the demo data dropdown button
    const demoButton = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll('button')];
      return buttons.find(b => b.textContent.includes('デモデータ'));
    });

    if (demoButton) {
      await demoButton.click();
      await delay(500);

      // Click "B木工製作所（木工家具・BtoB）"
      const bmokuButton = await page.evaluateHandle(() => {
        const buttons = [...document.querySelectorAll('button')];
        return buttons.find(b => b.textContent.includes('B木工製作所'));
      });

      if (bmokuButton) {
        await bmokuButton.click();
        await delay(1500);
        console.log('  Demo data loaded.');
      } else {
        console.warn('  Warning: B木工製作所 button not found');
      }
    } else {
      console.warn('  Warning: デモデータ button not found');
    }

    // 3. Take screenshots of each page

    // Settings page
    console.log('Capturing settings page...');
    await clickNavButton(page, '設定');
    await takeScreenshot(page, 'settings.png');

    // Step 0
    console.log('Capturing Step 0...');
    await clickNavButton(page, 'Step 0');
    await takeScreenshot(page, 'step0.png');

    // Step 0 - scroll down for Top5
    console.log('Capturing Step 0 Top5 section...');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = main.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(500);
    await takeScreenshot(page, 'step0-top5.png');

    // Scroll back to top
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    // Step 1
    console.log('Capturing Step 1...');
    await clickNavButton(page, 'Step 1');
    await takeScreenshot(page, 'step1.png');

    // Step 2
    console.log('Capturing Step 2...');
    await clickNavButton(page, 'Step 2');
    await takeScreenshot(page, 'step2.png');

    // Step 2 - scroll to chart area
    console.log('Capturing Step 2 chart...');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = main.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(500);
    await takeScreenshot(page, 'step2-chart.png');

    // Scroll back to top
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    // Step 3
    console.log('Capturing Step 3...');
    await clickNavButton(page, 'Step 3');
    await delay(500);
    await takeScreenshot(page, 'step3.png');

    // Step 3 - try to click on positioning map tab and capture
    console.log('Capturing Step 3 positioning map...');
    const mapTab = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll('button')];
      return buttons.find(b =>
        b.textContent.includes('ポジショニングマップ') ||
        b.textContent.includes('マップ') ||
        b.textContent.includes('戦略キャンバス')
      );
    });
    const mapTabExists = await page.evaluate(el => el instanceof HTMLElement, mapTab);
    if (mapTabExists) {
      await mapTab.click();
      await delay(800);
    }
    // Scroll down to capture the map/canvas area
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 400;
      window.scrollBy(0, 400);
    });
    await delay(500);
    await takeScreenshot(page, 'step3-map.png');

    // Scroll back to top
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    // Export page
    console.log('Capturing Export page...');
    await clickNavButton(page, '出力');
    await takeScreenshot(page, 'export.png');

    console.log('\nAll screenshots captured successfully!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

main();
