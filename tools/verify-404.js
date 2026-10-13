/* kalki.uz — haqiqiy 404 sahifa va havolalar yaxlitligi tekshiruvi.
 *
 *   node tools/verify-404.js                       # LOKAL: Cloudflare Pages tartibini fayllar bo'yicha taqlid qiladi
 *   node tools/verify-404.js https://<preview>     # JONLI: haqiqiy HTTP javoblarni tekshiradi (ketma-ket 6 ta so'rov)
 *
 * Nima uchun kerak: 404.html bo'lmaganda Pages har qanday noma'lum manzilga bosh sahifani 200 bilan
 * qaytaradi ("soft 404") va buzuq ichki havolalarni YASHIRADI. 404.html bilan ular haqiqiy 404 bo'ladi,
 * shuning uchun avval havolalar yaxlitligi tekshiriladi.
 *
 * Lokal bandlar:
 *  a) sitemap.xml dagi HAR BIR URL haqiqiy faylga yechiladi (Pages'da 200);
 *  b) 404.html bor, <meta name="robots" content="noindex"> bor, hamma yo'l absolyut, 3 ta noma'lum yo'l
 *     (/yoq-sahifa, /ru/yoq-sahifa, /assets/yoq.js) hech qanday faylga yechilmaydi (=> 404.html, 404);
 *  c) 404.html sitemap.xml da YO'Q;
 *  d) barcha sahifalardagi ichki <a href> haqiqiy faylga yechiladi (RU/cyr nisbiy havolalar xatosi). */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const UNKNOWN = ['/yoq-sahifa', '/ru/yoq-sahifa', '/assets/yoq.js'];

/* Pages: p, p.html, p/index.html. Yopiq (GIZLI) yo'llar ham 404 beradi — ular bu yerda "mavjud emas". */
const GIZLI = (() => {
  try {
    const m = fs.readFileSync(path.join(ROOT, 'functions', '_middleware.js'), 'utf8').match(/const GIZLI = \/(.*)\/(\w*);/);
    return m ? new RegExp(m[1], m[2]) : null;
  } catch (e) { return null; }
})();
function resolves(u) {
  let p = decodeURIComponent(u.split('?')[0].split('#')[0]);
  if (p === '') p = '/';
  if (GIZLI && GIZLI.test(p)) return false;
  const base = p.replace(/\/$/, '');
  const cand = [p, base + '.html', base + '/index.html'];
  if (p === '/') cand.unshift('/index.html');
  return cand.some((c) => {
    const f = path.join(ROOT, c);
    return f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile();
  });
}
/* _redirects (Cloudflare Pages): "/manba /nishon 301" qoidalari; `*` va :splat qo'llab-quvvatlanadi.
   Faqat testlar uchun taqlid (server haqiqiy Pages'da). Qoida bo'lmasa null. */
function redirectRules() {
  try {
    return fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
      .map((l) => { const [src, dst, st] = l.split(/\s+/); return { src, dst, st: st || '302' }; });
  } catch (e) { return []; }
}
function redirectTarget(p) {
  for (const r of redirectRules()) {
    if (r.src.indexOf('*') > -1) {
      const re = new RegExp('^' + r.src.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('(.*)') + '$');
      const m = p.match(re);
      if (m) return r.dst.replace(':splat', m[1] || '');
    } else if (r.src === p) return r.dst;
  }
  return null;
}
/* Yuklab olish havolalari: statik <a href=*.xlsx|docx|pdf|zip|csv> / <a download> (sahifaning o'z joyiga nisbatan
   yechiladi) va skript satrlaridagi fayl nomlari (ildizga nisbatan). Brauzerda yasaladigan fayl nomlari
   (kalki-*.csv — blob) havola emas, GENERATED. */
const FILE_EXT = /\.(xlsx|xls|docx|doc|pdf|zip|csv|pptx)(?=$|[?#])/i;
const GENERATED = /^\/kalki-[\w.\-]+\.csv$/i;
const MAGIC = { xlsx: '504b0304', docx: '504b0304', pptx: '504b0304', zip: '504b0304', pdf: '25504446' };
function downloadRefs() {
  const refs = [];
  const pages = [];
  for (const d of ['', 'ru', 'cyr']) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html') && !/^(yandex|404)/.test(x))) pages.push((d ? d + '/' : '') + f);
  }
  for (const pg of pages) {
    const html = fs.readFileSync(path.join(ROOT, pg), 'utf8');
    const slug = '/' + pg.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    const dirUrl = slug.endsWith('/') ? slug : path.posix.dirname(slug).replace(/\/?$/, '/');
    for (const m of html.replace(/<script[\s\S]*?<\/script>/g, '').matchAll(/<a\b[^>]*?\shref=["']([^"'#][^"']*)["'][^>]*>/g)) {
      const u = m[1].trim();
      if (/^(https?:|mailto:|tel:|javascript:|\/\/)/.test(u) || !(FILE_EXT.test(u) || /\sdownload\b/.test(m[0]))) continue;
      if (!FILE_EXT.test(u)) continue;               // download atributli, lekin fayl emas (masalan sahifaga) — bu bandda emas
      refs.push({ url: u.startsWith('/') ? u.split(/[?#]/)[0] : new URL(u, 'https://x' + dirUrl).pathname, page: pg, kind: 'a' });
    }
    for (const sc of html.matchAll(/<script(?![^>]*type="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/g)) {
      for (const m of sc[1].matchAll(/["'`]([^"'`\s<>]{3,120}\.(?:xlsx|xls|docx|pdf|zip|csv|pptx))["'`]/gi)) {
        const u = m[1].startsWith('/') ? m[1] : '/' + m[1];
        if (!GENERATED.test(u)) refs.push({ url: u, page: pg, kind: 'skript' });
      }
    }
  }
  return refs;
}
const sitemapUrls = () => [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/kalki\.uz([^<]*)<\/loc>/g)].map((m) => m[1] || '/');

function local() {
  const out = [];
  const T = (ok, name, extra) => out.push({ ok, name, extra: extra || '' });
  const urls = sitemapUrls();

  const miss = urls.filter((u) => !resolves(u));
  T(miss.length === 0, 'a) sitemap.xml dagi har bir URL haqiqiy faylga yechiladi (' + urls.length + ' ta)', miss.slice(0, 5).join(', '));

  const f404 = path.join(ROOT, '404.html');
  const src = fs.existsSync(f404) ? fs.readFileSync(f404, 'utf8') : '';
  T(!!src, 'b1) 404.html ildizda bor');
  T(/<meta name="robots" content="[^"]*noindex/.test(src), 'b2) 404.html noindex');
  T(/<title>Sahifa topilmadi/.test(src), 'b3) 404.html sarlavhasi "Sahifa topilmadi"');
  const rel = (src.match(/\b(?:href|src)="(?![a-z][a-z0-9+.\-]*:|\/|#|\?)[^"]*"/gi) || []);
  T(rel.length === 0, 'b4) 404.html da nisbiy yo\'l yo\'q (istalgan chuqurlikda ko\'rsatiladi)', rel.slice(0, 3).join(' '));
  T(/id="sitebar"/.test(src) && /<footer id="sf2"/.test(src), 'b5) 404.html da sarlavha va footer bor (site-chrome)');
  const shown = UNKNOWN.filter((u) => resolves(u));
  T(shown.length === 0, 'b6) noma\'lum yo\'llar fayl topmaydi => 404.html (404): ' + UNKNOWN.join(', '), shown.join(', '));

  T(urls.indexOf('/404') === -1 && urls.indexOf('/404.html') === -1, 'c) 404.html sitemap.xml da yo\'q');

  // d) ichki havolalar
  const bad = {};
  let total = 0;
  const pages = [];
  for (const d of ['', 'ru', 'cyr']) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html') && !/^yandex/.test(x))) pages.push((d ? d + '/' : '') + f);
  }
  for (const pg of pages) {
    const h = fs.readFileSync(path.join(ROOT, pg), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
    const slug = '/' + pg.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    const dirUrl = slug.endsWith('/') ? slug : path.posix.dirname(slug).replace(/\/?$/, '/');   // dirname('/x') = '/' (qo'sh '//' bo'lmasin)
    for (const m of h.matchAll(/<a\b[^>]*?\shref=["']([^"'#][^"']*)["']/g)) {
      const u = m[1].trim();
      if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/|\?)/.test(u)) continue;
      const abs = u.startsWith('/') ? u : new URL(u, 'https://x' + dirUrl).pathname;
      total++;
      if (!resolves(abs)) (bad[abs] = bad[abs] || new Set()).add(pg);
    }
  }
  const keys = Object.keys(bad);
  T(keys.length === 0, 'd) ichki havolalar haqiqiy faylga yechiladi (' + total + ' ta, ' + pages.length + ' sahifa)',
    keys.slice(0, 4).map((k) => k + ' <- ' + [...bad[k]][0]).join(' | ') + (keys.length > 4 ? ' … jami ' + keys.length : ''));
  // e) yuklab olish havolalari: haqiqiy fayl, to'g'ri turi (zip/pdf imzosi), HTML emas
  const refs = downloadRefs();
  const uniq = [...new Set(refs.map((r) => r.url))];
  const dlBad = [];
  for (const u of uniq) {
    const ext = (u.match(/\.(\w+)$/) || [])[1].toLowerCase();
    if (!resolves(u)) { dlBad.push(u + ' (fayl yo\'q)'); continue; }
    const buf = fs.readFileSync(path.join(ROOT, u));
    if (MAGIC[ext] && buf.slice(0, 4).toString('hex') !== MAGIC[ext]) dlBad.push(u + ' (tur mos emas / HTML)');
    else if (buf.length < 200) dlBad.push(u + ' (juda kichik)');
  }
  T(dlBad.length === 0, 'e) yuklab olish havolalari haqiqiy faylga yechiladi va turi mos (' + uniq.length + ' noyob fayl, ' + refs.length + ' havola)', dlBad.slice(0, 4).join(', '));
  return out;
}

async function live(base) {
  const out = [];
  const T = (ok, name, extra) => out.push({ ok, name, extra: extra || '' });
  base = base.replace(/\/$/, '');
  const get = (u) => fetch(base + u, { redirect: 'manual' });

  const urls = sitemapUrls();
  const bad = [];
  for (const u of urls) {                       // ketma-ket: server va tarmoq tejaladi
    try { const r = await get(u); if (r.status !== 200) bad.push(u + ' ' + r.status); } catch (e) { bad.push(u + ' ' + e.message); }
  }
  T(bad.length === 0, 'a) sitemap.xml dagi har bir URL 200 (' + urls.length + ' ta)', bad.slice(0, 5).join(', '));

  for (const u of UNKNOWN) {
    try {
      const r = await get(u); const body = await r.text();
      T(r.status === 404, 'b) ' + u + ' -> 404', 'status ' + r.status);
      if (u.indexOf('/assets/') !== 0) T(/<meta name="robots" content="[^"]*noindex/.test(body) && /Sahifa topilmadi/.test(body), 'b) ' + u + ' 404 sahifasida noindex va matn bor');
    } catch (e) { T(false, 'b) ' + u, e.message); }
  }
  const dlBad = [];
  const uniq = [...new Set(downloadRefs().map((r) => r.url))];
  for (const u of uniq) {
    try {
      const r = await get(u); const ct = (r.headers.get('content-type') || '').split(';')[0]; const buf = Buffer.from(await r.arrayBuffer());
      const ext = (u.match(/\.(\w+)$/) || [])[1].toLowerCase();
      const ok = r.status === 200 && !/text\/html/.test(ct) && buf.length > 200 && (!MAGIC[ext] || buf.slice(0, 4).toString('hex') === MAGIC[ext]);
      if (!ok) dlBad.push(u + ' ' + r.status + ' ' + ct);
    } catch (e) { dlBad.push(u + ' ' + e.message); }
  }
  T(dlBad.length === 0, 'e) yuklab olish fayllari: 200, haqiqiy tur (HTML emas), imzo mos (' + uniq.length + ' ta)', dlBad.slice(0, 4).join(' | '));
  try { const r = await get('/404'); T(r.status === 404, 'c) /404 ning o\'zi ham 404 (soft-404 emas)', 'status ' + r.status); } catch (e) { T(false, 'c) /404', e.message); }
  try { const r = await get('/sitemap.xml'); const body = await r.text(); T(!/\/404/.test(body), 'c) 404 sitemap.xml da yo\'q'); } catch (e) { T(false, 'c) sitemap.xml', e.message); }
  return out;
}

function report(rows) {
  rows.forEach((r) => console.log((r.ok ? 'OK   ' : 'FAIL ') + r.name + (r.extra ? ' — ' + r.extra : '')));
  const bad = rows.filter((r) => !r.ok).length;
  console.log(bad ? bad + ' ta band yiqildi' : 'hammasi joyida');
  return bad ? 1 : 0;
}

if (require.main === module) {
  const arg = process.argv[2];
  if (arg) live(arg).then((r) => process.exit(report(r)), (e) => { console.error(e); process.exit(2); });
  else process.exit(report(local()));
}
module.exports = { local, live, resolves, redirectTarget, redirectRules, downloadRefs };
