// Renders every screen with web fonts allowed and blocked, then checks readability.
const { test, expect } = require('@playwright/test');
const fs = require('fs'), path = require('path');

const MIN_PX = 12;
const pages = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.dc.html')).sort();

for (const file of pages) {
  for (const fonts of ['webfonts', 'system-fonts']) {
    test(`${file} · ${fonts}`, async ({ page, isMobile }, info) => {
      const errors = [], blocked = new Set();
      page.on('pageerror', e => errors.push(e.message));
      // Requests we abort below are logged as console errors; those are expected. Chromium tags them
      // with the request URL, Firefox names it in the message ("downloadable font: download failed").
      const expected = m => blocked.has(m.location().url) || [...blocked].some(u => m.text().includes(u));
      page.on('console', m => m.type() === 'error' && !expected(m) && errors.push(m.text()));
      // Simulate users who block remote/document fonts (common on Linux setups).
      if (fonts === 'system-fonts') await page.route(/\.(woff2?|ttf|otf)(\?.*)?$|fonts\.css$/, r => (blocked.add(r.request().url()), r.abort()));

      await page.goto('/' + encodeURI(file), { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.body.innerText.trim().length > 40, null, { timeout: 15_000 });
      await page.waitForTimeout(400);

      const report = await page.evaluate((min) => {
        const small = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const el = walker.currentNode.parentElement;
          const text = walker.currentNode.textContent.trim();
          if (!el || !text || el.closest('svg')) continue;
          const cs = getComputedStyle(el), r = el.getBoundingClientRect();
          if (cs.visibility === 'hidden' || cs.display === 'none' || !r.width || !r.height) continue;
          const px = parseFloat(cs.fontSize);
          if (px < min) small.push(`${px}px "${text.slice(0, 40)}"`);
        }
        const doc = document.documentElement;
        return { small: [...new Set(small)].slice(0, 20), overflowX: doc.scrollWidth - window.innerWidth };
      }, MIN_PX);

      // CSS scale keeps long pages under the 32767px screenshot limit on 3x mobile devices.
      await page.screenshot({ path: info.outputPath('page.png'), fullPage: true, scale: 'css' });

      expect(errors, 'console / page errors').toEqual([]);
      expect(report.small, `text smaller than ${MIN_PX}px`).toEqual([]);
      if (report.overflowX > 1) {
        const msg = `page scrolls sideways by ${report.overflowX}px`;
        if (isMobile) info.annotations.push({ type: 'warning', description: msg });
        else expect(report.overflowX, msg).toBeLessThanOrEqual(1);
      }
    });
  }
}
