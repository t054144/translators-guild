// Build handbook.html, fill page references, check overflow, print B5 PDF.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const dir = __dirname;
const parts = fs.readdirSync(path.join(dir, 'parts')).filter(f => f.endsWith('.html')).sort();
fs.writeFileSync(path.join(dir, 'handbook.html'), parts.map(f => fs.readFileSync(path.join(dir, 'parts', f), 'utf8')).join('\n') + '\n</body></html>');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(dir, 'handbook.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Automatic page flow: move overflowing blocks onto continuation pages.
  await page.evaluate(() => {
    for (const p of [...document.querySelectorAll('.page')]) {
      let cur = p, guard = 0;
      while (guard++ < 10) {
        const b = cur.querySelector('.body'); if (!b) break;
        if (b.scrollHeight <= b.clientHeight + 1 || b.children.length < 2) break;
        const np = document.createElement('section'); np.className = 'page'; np.dataset.id = (p.dataset.id || '') + '+';
        if (p.dataset.title) np.innerHTML = `<div class="rh"><span>${p.dataset.title}</span><span class="ar">${p.dataset.ar || ''}</span></div>`;
        const nb = document.createElement('div'); nb.className = 'body'; np.appendChild(nb);
        const pn = document.createElement('div'); pn.className = 'pn'; np.appendChild(pn);
        cur.after(np);
        while (b.scrollHeight > b.clientHeight + 1 && b.children.length > 1) nb.prepend(b.lastElementChild);
        let last = b.lastElementChild;
        while (last && b.children.length > 1 && (/^H[12]$/.test(last.tagName) || (last.tagName === 'P' && last.nextElementSibling === null && /:$/.test(last.textContent.trim())))) { nb.prepend(last); last = b.lastElementChild; }
        cur = np;
      }
    }
  });
  // [data-ref="id"] -> page number of the .page containing #id
  const missing = await page.evaluate(() => {
    const pages = [...document.querySelectorAll('.page')], miss = [];
    document.querySelectorAll('[data-ref]').forEach(el => {
      const t = document.getElementById(el.dataset.ref);
      if (!t) { miss.push(el.dataset.ref); return; }
      el.textContent = pages.indexOf(t.closest('.page')) + 1;
    });
    return miss;
  });
  if (missing.length) console.log('MISSING REFS', [...new Set(missing)].join(' '));
  const rep = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
    const b = p.querySelector('.body'); if (!b) return { n: i + 1, id: p.dataset.id, over: 0, free: -1 };
    const last = Math.max(b.getBoundingClientRect().top, ...[...b.children].map(k => k.getBoundingClientRect().bottom));
    return { n: i + 1, id: p.dataset.id, over: b.scrollHeight - b.clientHeight, free: Math.round(b.getBoundingClientRect().bottom - last) };
  }));
  let bad = 0;
  for (const r of rep) { const f = r.over > 1 ? '  <-- OVERFLOW' : ''; if (f) bad++; console.log(`p${String(r.n).padStart(2)} ${String(r.id).padEnd(14)} over=${r.over} free=${r.free}${f}`); }
  console.log(`pages=${rep.length} overflowing=${bad}`);
  await page.pdf({ path: path.join(dir, 'Translation-Handbook.pdf'), width: '176mm', height: '250mm', printBackground: true, preferCSSPageSize: true });
  const i = process.argv.indexOf('--png');
  if (i > -1) {
    fs.mkdirSync(path.join(dir, 'png'), { recursive: true });
    const els = await page.$$('.page');
    const want = (process.argv[i + 1] || '').split(',').filter(Boolean).map(Number);
    for (const n of (want.length ? want : els.map((_, k) => k + 1))) await els[n - 1].screenshot({ path: path.join(dir, 'png', `p${String(n).padStart(2, '0')}.png`) });
  }
  await browser.close();
})();
