/**
 * Capture Play-Store-ready phone screenshots from screens.html.
 *
 * Output: assets/screenshots/0X-name.png at 1080x1920 (Play Console minimum).
 *
 * Run:  node scripts/screenshots/capture.js
 */
const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const HTML = path.resolve(__dirname, 'screens.html');
const OUT_DIR = path.resolve(ROOT, 'assets', 'screenshots');

const SCREENS = [
  { id: 'screen-1', name: '01-home' },
  { id: 'screen-2', name: '02-prayers' },
  { id: 'screen-3', name: '03-archive' },
  { id: 'screen-4', name: '04-settings-dark' },
  { id: 'screen-5', name: '05-onboarding' },
];

(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto('file://' + HTML);

  for (const s of SCREENS) {
    const el = await page.$(`#${s.id}`);
    if (!el) {
      console.error(`missing ${s.id}`);
      continue;
    }
    const out = path.join(OUT_DIR, `${s.name}.png`);
    await el.screenshot({ path: out, type: 'png' });
    const stat = await fs.stat(out);
    console.log(`wrote ${path.relative(ROOT, out)}  (${(stat.size / 1024).toFixed(0)} KB)`);
  }

  await browser.close();
  console.log('done.');
})();
