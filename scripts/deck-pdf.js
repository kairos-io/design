// Renders a deck to PDF, one slide per page: npm run pdf -- "My Talk.dc.html"
const path = require('path');
const { chromium } = require('@playwright/test');

const deck = process.argv[2] || 'Kairos - Talk Deck.dc.html';
const out = path.join(__dirname, '..', 'dist', path.basename(deck).replace(/\.dc\.html$/, '') + '.pdf');
process.env.PORT = process.env.PORT || '4174';
require('../tests/serve.js');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const res = await page.goto(`http://localhost:${process.env.PORT}/${encodeURIComponent(deck)}`, { waitUntil: 'networkidle' });
  if (!res.ok()) throw new Error(`${deck}: HTTP ${res.status()}`);
  await page.waitForFunction(() => customElements.get('deck-stage') && document.querySelector('deck-stage section'));
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await browser.close();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(path.relative(process.cwd(), out));
  process.exit(0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
