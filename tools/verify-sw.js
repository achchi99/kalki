/* kalki.uz — sw.js statik tahlili.
 *
 * Service worker jsdom'da ishlamaydi, shuning uchun bu yerda kod naqshlari
 * tekshiriladi. Qo'lda tekshirish ro'yxati: docs/sw-check.md
 *
 *   node tools/verify-sw.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');
const src = fs.readFileSync(SW, 'utf8');

const fails = [];
const warns = [];
const ok = [];
const T = (cond, name, extra) => (cond ? ok : fails).push(name + (extra ? ' — ' + extra : ''));

/* 1. Versiya */
const vm = src.match(/const SW_VERSION = '([^']*)';\s*\/\* sw-version:auto \*\//);
T(!!vm && vm[1].length >= 6, '1. SW_VERSION avtomatik yoziladigan qatorda', vm ? vm[1] : 'topilmadi');

const names = [...src.matchAll(/'(kalki-[a-z]+-)'\s*\+\s*SW_VERSION/g)].map((m) => m[1]);
T(names.length >= 1, '2. kesh nomlari versiyalangan', names.join(', ') || 'yo\'q');
const hardcoded = src.match(/'kalki-[a-z]*v?\d+'/g);
T(!hardcoded, '3. qo\'lda yozilgan kesh nomi yo\'q', hardcoded ? hardcoded.join(', ') : '');

/* 4. activate da eski keshlarni tozalash */
const act = (src.match(/addEventListener\('activate'[\s\S]*?\n\}\);/) || [''])[0];
T(/caches\.keys\(\)/.test(act) && /caches\.delete/.test(act), '4. activate eski keshlarni o\'chiradi');
T(/KEEP\.indexOf\(k\) === -1|!KEEP\.includes\(k\)/.test(act), '4b. joriy versiyaga tegishli bo\'lmagan HAMMASI o\'chadi');

/* 5. skipWaiting + claim */
T(/self\.skipWaiting\(\)/.test(src), '5a. skipWaiting bor');
T(/self\.clients\.claim\(\)/.test(src), '5b. clients.claim bor');

/* 6. Navigatsiya network-first bo'lsin (cache-first EMAS) */
const nav = (src.match(/mode === 'navigate'[\s\S]*?\n    return;/) || [''])[0];
T(/^\s*e\.respondWith\(\s*\n?\s*fetch\(/m.test(nav), '6. navigatsiya network-first (fetch birinchi)');
T(!/caches\.match\([^)]*\)\.then\(\(?m\)? => m \|\| fetch/.test(nav), '6b. navigatsiyada cache-first naqsh yo\'q');

/* 7. assets/*.js cache-first BO'LMASIN */
const assetBranch = (src.match(/if \(isAsset\(p\)\)[\s\S]*?\n    return;/) || [''])[0];
T(/staleWhileRevalidate/.test(assetBranch), '7. assets/*.js stale-while-revalidate', assetBranch ? 'ok' : 'shox topilmadi');
T(!/cacheFirst\(e\.request, STATIC\)/.test(assetBranch), '7b. assets cacheFirst bilan berilmaydi');

/* 8. partners.json network-first */
const pj = (src.match(/partners\.json[\s\S]*?\n    return;/) || [''])[0];
T(/networkFirst/.test(pj), '8. partners.json network-first');

/* 9. respondWith(undefined) bo'lmasin */
T(/Response\.error\(\)/.test(src), '9. tarmoq yo\'q + kesh bo\'sh holatida Response.error()');

/* 10. Tashqi domen ushlanmaydi */
T(/url\.origin !== self\.location\.origin\)\s*return/.test(src), '10. tashqi domenlar ushlanmaydi');

/* 11. Precache ro'yxatidagi har bir fayl mavjud */
const listSrc = src.slice(src.indexOf('const ASSETS = ['), src.indexOf('];', src.indexOf('const ASSETS = [')));
// Ro'yxatda satrlar bilan bir qatorda konstanta nomi ham bo'lishi mumkin
// (masalan OFFLINE) — ularni e'londan qidirib topamiz, aks holda tekshiruv
// "precache da yo'q" deb yolg'on gapirardi.
const consts = {};
[...src.matchAll(/^const ([A-Z_][A-Z0-9_]*) = '([^']*)';/gm)].forEach((m) => { consts[m[1]] = m[2]; });
const list = listSrc.split('\n').slice(1).map((ln) => {
  const q = ln.match(/'([^']+)'/);
  if (q) return q[1];
  const id = ln.match(/^\s*([A-Z_][A-Z0-9_]*)\s*,\s*$/);
  return id && consts[id[1]] ? consts[id[1]] : null;
}).filter(Boolean);
const missing = [];
list.forEach((u) => {
  if (u === '/') { if (!fs.existsSync(path.join(ROOT, 'index.html'))) missing.push(u); return; }
  const rel = u.replace(/^\//, '');
  if (fs.existsSync(path.join(ROOT, rel)) || fs.existsSync(path.join(ROOT, rel + '.html'))) return;
  missing.push(u);
});
T(missing.length === 0, '11. precache ro\'yxatidagi barcha fayllar mavjud (' + list.length + ' ta)',
  missing.length ? 'YO\'Q: ' + missing.join(', ') : '');

/* 12. sitemap.xml <-> precache qamrovi.
   Bu OGOHLANTIRISH emas, XATO. Ilgari ogohlantirish edi va shu sababdan
   uch sahifa (elektr-xarajat, maktab, marosim) uzoq vaqt precache'siz
   qolib ketgan — hech kim ogohlantirishni o'qimaydi.
   Ataylab tashqarida qoladigan sahifalar render.js dagi SPECIAL_PAGES da
   sanab o'tilgan, shunda "unutildi" va "ataylab" farqlanadi. */
const { SPECIAL_PAGES } = require('./render');

const smPath = path.join(ROOT, 'sitemap.xml');
const sm = fs.existsSync(smPath) ? fs.readFileSync(smPath, 'utf8') : '';
const smPaths = [...sm.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => {
  try { return new URL(m[1]).pathname; } catch (e) { return m[1]; }
});
T(smPaths.length > 0, '12. sitemap.xml o\'qildi', smPaths.length + ' URL');

const smNotPre = smPaths.filter((p) => list.indexOf(p) === -1);
T(smNotPre.length === 0, '12b. sitemap.xml dagi har bir sahifa precache\'da',
  smNotPre.length ? 'YO\'Q: ' + smNotPre.join(', ') : '');

// Teskari yo'nalish: diskda bor, lekin sitemap'da ham, istisnoda ham yo'q
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const toPath = (f) => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));
const notInSitemap = htmlFiles
  .filter((f) => SPECIAL_PAGES.indexOf(f) === -1)
  .filter((f) => smPaths.indexOf(toPath(f)) === -1);
T(notInSitemap.length === 0, '12c. har bir sahifa sitemap.xml da (yoki SPECIAL_PAGES da)',
  notInSitemap.join(', '));

// SPECIAL_PAGES sitemap'ga TUSHMASLIGI kerak
const specialInSitemap = SPECIAL_PAGES.filter((f) => smPaths.indexOf(toPath(f)) > -1
  || smPaths.indexOf('/' + f) > -1);
T(specialInSitemap.length === 0, '12d. SPECIAL_PAGES sitemap.xml ga kirmagan', specialInSitemap.join(', '));

/* 12e. offline.html — navigatsiya uzilganda qaytariladigan sahifa */
const off = path.join(ROOT, 'offline.html');
const offSrc = fs.existsSync(off) ? fs.readFileSync(off, 'utf8') : '';
T(!!offSrc, '12e. offline.html mavjud');
T(list.indexOf('/offline.html') > -1, '12f. offline.html precache\'da');
T(/<meta name="robots" content="[^"]*noindex/.test(offSrc), '12g. offline.html noindex');
T(/caches\.match\(OFFLINE\)/.test(src) && !/\|\| caches\.match\('\/'\)/.test(src),
  '12h. navigatsiya uzilganda offline.html qaytariladi ("/" emas)');
T(!/https?:\/\/(?!kalki\.uz)/.test(offSrc.replace(/<!--[\s\S]*?-->/g, '')),
  '12i. offline.html tashqi resurs so\'ramaydi');

/* 13. SW ro'yxatdan o'tkazish YAGONA joyda: assets/sw-boot.js */
const html = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const inline = html.filter((f) => {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  return /serviceWorker\.register/.test(s) || /addEventListener\('controllerchange'/.test(s);
});
T(inline.length === 0, '13. sahifalarda inline SW kodi yo\'q', inline.join(', '));

const bootPath = path.join(ROOT, 'assets', 'sw-boot.js');
const boot = fs.existsSync(bootPath) ? fs.readFileSync(bootPath, 'utf8') : '';
const withBoot = html.filter((f) => fs.readFileSync(path.join(ROOT, f), 'utf8').includes('assets/sw-boot.js'));
T(!!boot && withBoot.length > 0, '13b. assets/sw-boot.js mavjud va sahifalarga ulangan', withBoot.length + ' sahifa');

/* 13c. Iflos holat himoyasi. Deploy foydalanuvchi maydonlarni to'ldirgan
   paytga to'g'ri kelsa, avtomatik qayta yuklash kiritilgan ma'lumotni
   yo'q qiladi — bu versiya nomuvofiqligidan og'irroq zarar. */
T(/addEventListener\('controllerchange'/.test(boot), '13c. sw-boot.js controllerchange ni tinglaydi');
T(/isTrusted/.test(boot),
  '13d. bayroq faqat HAQIQIY foydalanuvchi hodisasidan yoqiladi (isTrusted)');
T(/if \(reloaded\) return;/.test(boot), '13e. qayta yuklash guard\'i (cheksiz sikl yo\'q)');
T(/userTouched \|\| holds > 0/.test(boot), '13f. iflos holatda qayta yuklash o\'rniga chiziq');
T(/sw_update_deferred/.test(boot), '13g. kechiktirilgan yangilanish GA ga yoziladi');

/* 14. Versiya assets bilan mos */
const { execFileSync } = require('child_process');
let vOk = true, vMsg = '';
try {
  execFileSync(process.execPath, [path.join(__dirname, 'sw-version.js'), '--check'], { stdio: 'pipe' });
} catch (e) {
  vOk = false;
  vMsg = String((e.stdout || '').toString()).trim();
}
T(vOk, '14. sw versiyasi assets/ mazmuniga mos', vMsg);

/* hisobot */
console.log('=== sw.js statik tahlili ===');
ok.forEach((x) => console.log('OK   ' + x));
warns.forEach((x) => console.log('!    ' + x));
fails.forEach((x) => console.log('FAIL ' + x));
console.log('\n' + (fails.length ? fails.length + ' ta muammo' : 'hammasi joyida')
  + (warns.length ? ' (' + warns.length + ' ogohlantirish)' : ''));
process.exit(fails.length ? 1 : 0);
