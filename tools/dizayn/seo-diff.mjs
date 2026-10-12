// SEO invariantlari: HEAD (yoki berilgan ref) va ishchi nusxa orasidagi farq (statik HTML, JS ishlatilmaydi).
// node tools/dizayn/seo-diff.mjs [ref=HEAD]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const REF = process.argv[2] || 'HEAD';
const PAGES = ['index.html', 'shablonlar.html', 'gisht-kalkulyator.html', 'ru/index.html', 'ru/shablonlar.html', 'ru/gisht-kalkulyator.html'];
const get = (f, ref) => ref ? execFileSync('git', ['show', ref + ':' + f], { maxBuffer: 1 << 26 }).toString() : fs.readFileSync(f, 'utf8');
function facts(html) {
  const d = new JSDOM(html).window.document;
  const q = (s, a) => { const e = d.querySelector(s); return e ? (a ? e.getAttribute(a) : e.textContent.trim()) : null; };
  const hrefs = new Set([...d.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|mailto:|tel:|#)/.test(h)).map((h) => h.replace(/^\.\//, '').replace(/#.*$/, '') || './'));
  const ld = [...d.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.trim()).sort();
  const abText = q('#answerbox .ab-text'), abMeta = q('#answerbox .ab-meta'), abData = q('#answerbox-data');
  // hujjat tartibi: H1 → #answerbox → forma (o'zaro nisbiy joylashuv o'zgarmasligi kerak)
  const order = ['h1', '#answerbox', '.form-card'].map((sel) => [sel, d.querySelector(sel)]).filter(([, e]) => e)
    .sort((a, b) => (a[1].compareDocumentPosition(b[1]) & 4 ? -1 : 1)).map(([sel]) => sel);
  return { title: d.title, desc: q('meta[name="description"]', 'content'), h1: [...d.querySelectorAll('h1')].map((h) => h.textContent.trim()), canonical: q('link[rel="canonical"]', 'href'),
    hreflang: [...d.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.getAttribute('hreflang') + '=' + l.getAttribute('href')).sort(), robots: q('meta[name="robots"]', 'content'),
    ogtitle: q('meta[property="og:title"]', 'content'), ogimg: q('meta[property="og:image"]', 'content'), ld, abText, abMeta, abData, order, hrefs };
}
let bad = 0;
for (const f of PAGES) {
  const a = facts(get(f, REF)), b = facts(get(f));
  const rows = [];
  for (const k of ['title', 'desc', 'h1', 'canonical', 'hreflang', 'robots', 'ogtitle', 'ogimg', 'ld', 'abText', 'abMeta', 'abData', 'order']) {
    const same = JSON.stringify(a[k]) === JSON.stringify(b[k]);
    if (!same) { bad++; rows.push(k + ': FARQ\n   eski=' + JSON.stringify(a[k]).slice(0, 160) + '\n   yangi=' + JSON.stringify(b[k]).slice(0, 160)); }
  }
  const lost = [...a.hrefs].filter((h) => !b.hrefs.has(h)), added = [...b.hrefs].filter((h) => !a.hrefs.has(h));
  if (lost.length) { bad++; rows.push('ICHKI HAVOLA YO\'QOLDI (' + lost.length + '): ' + lost.slice(0, 12).join(', ')); }
  console.log((rows.length ? 'FARQ ' : 'OK   ') + f + ' — ichki havolalar ' + a.hrefs.size + ' → ' + b.hrefs.size + (added.length ? ' (+' + added.length + ': ' + added.slice(0, 6).join(', ') + ')' : ''));
  rows.forEach((r) => console.log('   ' + r));
}
console.log(bad ? bad + ' ta farq' : 'SEO invariantlari o\'zgarmagan');
