// Build handbook.html from parts, check every page for overflow, print A5 PDF.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dir = __dirname;
const parts = fs.readdirSync(path.join(dir, 'parts')).filter(f => f.endsWith('.html')).sort();
const html = parts.map(f => fs.readFileSync(path.join(dir, 'parts', f), 'utf8')).join('\n') + '\n</body></html>';
fs.writeFileSync(path.join(dir, 'handbook.html'), html);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const page = await browser.newPage({deviceScaleFactor: 2});
  await page.goto('file://' + path.join(dir, 'handbook.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((p, i) => {
      const b = p.querySelector('.body');
      if (!b) return;
      const over = b.scrollHeight - b.clientHeight;
      const wide = b.scrollWidth - b.clientWidth;
      // free space: distance from last child bottom to body bottom
      const kids = [...b.children];
      const last = kids.length ? Math.max(...kids.map(k => k.getBoundingClientRect().bottom)) : b.getBoundingClientRect().top;
      const free = b.getBoundingClientRect().bottom - last;
      out.push({ n: i + 1, id: p.dataset.id || '', over, wide, free: Math.round(free) });
    });
    return out;
  });
  let bad = 0;
  for (const r of report) {
    const flag = r.over > 1 || r.wide > 1 ? '  <-- OVERFLOW' : '';
    if (flag) bad++;
    console.log(`p${String(r.n).padStart(2)} ${r.id.padEnd(16)} over=${r.over} wide=${r.wide} free=${r.free}px${flag}`);
  }
  console.log(`pages=${report.length} overflowing=${bad}`);
  await page.pdf({ path: path.join(dir, 'Guild-Translation-Handbook-A5.pdf'), width: '148mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  if (process.argv.includes('--png')) {
    const pages = process.argv[process.argv.indexOf('--png') + 1] || '';
    await page.setViewportSize({ width: 560, height: 794 });
    const els = await page.$$('.page');
    const want = pages ? pages.split(',').map(Number) : els.map((_, i) => i + 1);
    fs.mkdirSync(path.join(dir, 'png'), { recursive: true });
    for (const n of want) await els[n - 1].screenshot({ path: path.join(dir, 'png', `p${String(n).padStart(2, '0')}.png`) });
  }
  await browser.close();
})();
