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
const list = (listSrc.match(/'([^']+)'/g) || []).map((x) => x.slice(1, -1));
const missing = [];
list.forEach((u) => {
  if (u === '/') { if (!fs.existsSync(path.join(ROOT, 'index.html'))) missing.push(u); return; }
  const rel = u.replace(/^\//, '');
  if (fs.existsSync(path.join(ROOT, rel)) || fs.existsSync(path.join(ROOT, rel + '.html'))) return;
  missing.push(u);
});
T(missing.length === 0, '11. precache ro\'yxatidagi barcha fayllar mavjud (' + list.length + ' ta)',
  missing.length ? 'YO\'Q: ' + missing.join(', ') : '');

/* 12. Precache va haqiqiy sahifalar orasidagi farq — ogohlantirish */
const pages = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && f !== 'yandex_5489ebe17687cac1.html')
  .map((f) => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '')));
const notPre = pages.filter((p) => list.indexOf(p) === -1);
if (notPre.length) warns.push('precache da yo\'q sahifalar (' + notPre.length + '): ' + notPre.join(', '));

/* 13. controllerchange himoyasi sahifalarda */
const html = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const withSw = html.filter((f) => fs.readFileSync(path.join(ROOT, f), 'utf8').includes("'serviceWorker' in navigator"));
const withCc = withSw.filter((f) => fs.readFileSync(path.join(ROOT, f), 'utf8').includes('controllerchange'));
T(withSw.length > 0 && withSw.length === withCc.length,
  '13. SW ro\'yxatga oluvchi sahifalarda controllerchange himoyasi', withCc.length + '/' + withSw.length);

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
