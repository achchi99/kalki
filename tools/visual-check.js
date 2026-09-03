/* kalki.uz — real brauzer (Playwright/Chromium) orqali vizual tekshiruv.
 *
 * verify-all.js jsdom bilan ishlaydi va DOM/matn xatolarini topadi, lekin
 * layout'ni (overlap, overflow, chinakam CSS hisoblanishi) ko'rmaydi — shu
 * turdagi buglar (masalan b710d3e, 9b6f8c2, 13a463b commitlari) faqat real
 * brauzerda topilgan edi. Bu skript o'sha tekshiruvni avtomatlashtiradi.
 *
 * Bayroqsiz chaqirilgan boshqa tools/ skriptlari HECH NARSA YOZMAYDI degan
 * qoida shu yerga tegishli emas — bu vosita sayt manba fayllariga tegmaydi,
 * faqat docs/screenshots/ ga skrinshot chiqaradi (git'ga tushmaydi).
 *
 * Talab: npm i (playwright + o'zi yuklab olgan Chromium)
 *
 * Foydalanish:
 *   node tools/visual-check.js <sahifa> [<sahifa2> ...] [--lang=uz,ru] [--viewport=desktop,mobile]
 *   node tools/visual-check.js kredit-kalkulyator --lang=uz,ru --viewport=desktop,mobile
 *
 * verify-all/ship'ga QO'SHILMAGAN — qo'lda ishga tushiriladigan vosita.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const { RU_PAGES } = require('./prerender.js');

const ROOT = path.resolve(__dirname, '..');
const SCREEN_DIR = path.join(ROOT, 'docs', 'screenshots');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 320, height: 640 },
};

/* O'tmishda haqiqiy brauzerda topilgan overlap buglariga (b710d3e, 9b6f8c2)
   aloqador landmark'lar. Ancestor/descendant juftlar overlap hisoblanmaydi —
   faqat bir-biriga aloqasiz elementlar taqqoslanadi. */
const LANDMARK_SELECTORS = ['header', 'nav', 'main', 'footer', '.answerbox', '.form-card', '.premium-badge'];

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split(/[?#]/)[0]);
      const file = path.join(ROOT, rel === '/' ? '/index.html' : rel);
      if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, body) => {
        if (err) { res.writeHead(404); res.end(); return; }
        const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(body);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function urlForPage(name, lang) {
  const file = name.endsWith('.html') ? name : name + '.html';
  if (lang === 'uz') return '/' + file;
  if (!RU_PAGES.includes(file)) return null;
  return '/ru/' + file;
}

async function checkOne(browser, base, name, lang, viewportName) {
  const url = urlForPage(name, lang);
  const out = { page: name, lang, viewport: viewportName, url: url ? base + url : null };
  if (!url) {
    out.skipped = 'RU_PAGES ro\'yxatida yo\'q';
    return out;
  }

  const context = await browser.newContext({ viewport: VIEWPORTS[viewportName] });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  try {
    await page.goto(base + url, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    out.error = 'goto muvaffaqiyatsiz: ' + e.message;
    await context.close();
    return out;
  }

  const overflowW = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  out.overflow = overflowW > 1; // 1px — scrollbar/rounding tolerantligi
  out.overflowPx = overflowW;

  out.overlaps = await page.evaluate((selectors) => {
    function rectsIntersect(a, b) {
      const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      return ix > 4 && iy > 4; // 4px tolerantlik — chegara/soyalar false-positive bermasin
    }
    const els = [];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) els.push({ sel, el, r });
      });
    });
    const bad = [];
    for (let i = 0; i < els.length; i++) {
      for (let j = i + 1; j < els.length; j++) {
        const a = els[i], b = els[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue; // ota-bola — bug emas
        if (rectsIntersect(a.r, b.r)) bad.push(a.sel + ' <-> ' + b.sel);
      }
    }
    return bad;
  }, LANDMARK_SELECTORS);

  out.consoleErrors = consoleErrors;

  fs.mkdirSync(SCREEN_DIR, { recursive: true });
  const shotFile = name.replace(/\.html$/, '') + '-' + lang + '-' + viewportName + '.png';
  out.screenshot = path.join('docs', 'screenshots', shotFile);
  await page.screenshot({ path: path.join(ROOT, out.screenshot), fullPage: true });

  await context.close();
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  const pages = [];
  for (const a of args) {
    const m = a.match(/^--([a-z]+)=(.+)$/);
    if (m) flags[m[1]] = m[2].split(',');
    else pages.push(a);
  }
  if (!pages.length) {
    console.log('foydalanish: node tools/visual-check.js <sahifa> [...] [--lang=uz,ru] [--viewport=desktop,mobile]');
    return 1;
  }
  const langs = flags.lang || ['uz', 'ru'];
  const viewports = flags.viewport || ['desktop', 'mobile'];

  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();

  const results = [];
  for (const name of pages) {
    for (const lang of langs) {
      for (const vp of viewports) {
        results.push(await checkOne(browser, base, name, lang, vp));
      }
    }
  }

  await browser.close();
  server.close();

  console.log(JSON.stringify(results, null, 2));

  const bad = results.filter((r) => r.error || r.overflow || (r.overlaps && r.overlaps.length) || (r.consoleErrors && r.consoleErrors.length));
  console.log('\n' + results.length + ' tekshiruv, ' + bad.length + ' muammoli, ' + (results.length - bad.length) + ' toza');
  return bad.length ? 1 : 0;
}

main().then((code) => process.exit(code));
