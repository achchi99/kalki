/* kalki.uz — og:image teglarini sahifalarga qo'yadi.
 *
 * tools/og-manifest.json dan har sahifaning rasm versiyasini oladi.
 * Telegram og:image'ni URL bo'yicha keshlaydi va eski rasmni OYLAB ko'rsatadi,
 * shuning uchun URL versiya parametri bilan yoziladi: ...png?v=3
 *
 * Idempotent: qayta ishga tushirilsa dublikat teg qo'shmaydi, borini yangilaydi.
 *
 *   node tools/og-tags.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(__dirname, 'og-manifest.json');
const BASE = 'https://kalki.uz/';

if (!fs.existsSync(MANIFEST)) {
  console.error('og-manifest.json yo\'q — avval: node tools/og-images.js');
  process.exit(2);
}
const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

function attrEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

// Prerender'dan keyin atribut formati o'zgaradi, shuning uchun namunani
// prerender qilingan fayldan oldik: <meta property="og:image" content="...">
const RE = {
  ogImage: /[ \t]*<meta property="og:image"[^>]*>\r?\n?/g,
  ogW: /[ \t]*<meta property="og:image:width"[^>]*>\r?\n?/g,
  ogH: /[ \t]*<meta property="og:image:height"[^>]*>\r?\n?/g,
  ogAlt: /[ \t]*<meta property="og:image:alt"[^>]*>\r?\n?/g,
  twCard: /[ \t]*<meta name="twitter:card"[^>]*>\r?\n?/g,
  twImage: /[ \t]*<meta name="twitter:image"[^>]*>\r?\n?/g,
};

let changed = 0, missing = [], noHead = [];
const slugs = Object.keys(man).sort();

for (const slug of slugs) {
  const file = path.join(ROOT, slug + '.html');
  if (!fs.existsSync(file)) { missing.push(slug); continue; }
  const entry = man[slug];
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  // Eski teglar olib tashlanadi — keyin bittadan qayta qo'yiladi (dublikat bo'lmaydi)
  Object.keys(RE).forEach((k) => { s = s.replace(RE[k], ''); });

  // og:image URL ABSOLYUT bo'lishi shart — nisbiy yo'l ishlamaydi.
  const url = BASE + 'assets/og/' + slug + '.png?v=' + (entry.v || 1);
  const block =
    '<meta property="og:image" content="' + url + '">\n'
    + '<meta property="og:image:width" content="1200">\n'
    + '<meta property="og:image:height" content="630">\n'
    + '<meta property="og:image:alt" content="' + attrEsc(entry.title) + '">\n'
    + '<meta name="twitter:card" content="summary_large_image">\n'
    + '<meta name="twitter:image" content="' + url + '">\n';

  // og:url dan keyin, bo'lmasa </head> oldiga
  const anchor = s.match(/<meta property="og:url"[^>]*>\r?\n?/);
  if (anchor) {
    s = s.replace(anchor[0], anchor[0] + block);
  } else if (s.indexOf('</head>') > -1) {
    s = s.replace('</head>', block + '</head>');
  } else {
    noHead.push(slug);
    continue;
  }

  if (s !== before) { fs.writeFileSync(file, s, 'utf8'); changed++; }
}

console.log('sahifalar: ' + slugs.length + ' | teglari yangilandi: ' + changed);
if (missing.length) console.log('HTML topilmadi: ' + missing.join(', '));
if (noHead.length) console.log('</head> topilmadi: ' + noHead.join(', '));
