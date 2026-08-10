/* kalki.uz — og:image avtomatik generatsiyasi.
 *
 * O'zbekistonda havola asosan Telegram va WhatsApp orqali tarqaladi. Rasm
 * bo'lmasa havola oq to'rtburchak bo'lib ko'rinadi va bosilmaydi.
 *
 * SVG shablon -> PNG (@resvg/resvg-js). Puppeteer ishlatilmaydi: og'ir, sekin
 * va CI'da beqaror.
 *
 *   node tools/og-images.js            # tekshiradi, HECH NARSA YOZMAYDI
 *   node tools/og-images.js --write    # o'zgarganlarini yasaydi (npm run ship)
 *   node tools/og-images.js --write --force   # hammasini qayta yasaydi
 *
 * --check eski nom sifatida qabul qilinadi, standart holat bilan bir xil.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Resvg } = require('@resvg/resvg-js');
const { sitePages } = require('./render');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'og');
const MANIFEST = path.join(__dirname, 'og-manifest.json');
const W = 1200, H = 630;
const MAX_BYTES = 300 * 1024;

// Shablon versiyasi. O'zgartirsangiz — barcha rasmlar qayta yasaladi.
const TPL_VERSION = 1;

const FORCE = process.argv.indexOf('--force') > -1;
const CHECK = process.argv.indexOf('--write') === -1;

/* ---------- shrift ----------
   Tizim shriftiga TAYANMAYMIZ: serverda o'sha shrift bo'lmasa harflar
   kvadratchaga aylanadi va buni faqat rasm ochilgandan keyin bilib qolasiz.
   Shuning uchun fayl aniq ko'rsatiladi va topilmasa skript TO'XTAYDI. */
function findFonts() {
  const local = path.join(__dirname, 'fonts');
  if (fs.existsSync(local)) {
    const f = fs.readdirSync(local).filter((x) => /\.(ttf|otf)$/i.test(x)).map((x) => path.join(local, x));
    if (f.length) return f;
  }
  const candidates = [
    ['C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/arial.ttf'],
    ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'],
    ['/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'],
    ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf'],
  ];
  for (const set of candidates) {
    if (set.every((p) => fs.existsSync(p))) return set;
  }
  return null;
}

const FONTS = findFonts();
if (!FONTS) {
  console.error('SHRIFT TOPILMADI. tools/fonts/ ga lotin va kirill qo\'llab-quvvatlaydigan');
  console.error('.ttf fayl qo\'ying (masalan Manrope yoki DejaVuSans) va qayta ishga tushiring.');
  console.error('Shriftsiz rasm yasash — harflar kvadratchaga aylanishi demak.');
  process.exit(2);
}
const FONT_FAMILY = /arial/i.test(FONTS[0]) ? 'Arial' : (/dejavu/i.test(FONTS[0]) ? 'DejaVu Sans'
  : (/liberation/i.test(FONTS[0]) ? 'Liberation Sans' : path.basename(FONTS[0]).replace(/[-_].*$/, '')));

/* ---------- kategoriyalar ---------- */
const CATS = {
  moliya:    { bg: '#0E3B2E', accent: '#D99A2B', uz: 'Moliya' },
  qurilish:  { bg: '#8C3B2A', accent: '#F0C070', uz: 'Qurilish' },
  kommunal:  { bg: '#1D4E6B', accent: '#7FD1E8', uz: 'Kommunal' },
  hayot:     { bg: '#2C3A5E', accent: '#9DB4E8', uz: 'Hayotiy' },
  hujjat:    { bg: '#5B3A63', accent: '#D9A7E8', uz: 'Hujjatlar' },
  umumiy:    { bg: '#16211C', accent: '#D99A2B', uz: 'Kalki.uz' },
};

// data-cat yo'q sahifalar uchun qo'lda moslash
const CAT_BY_FILE = {
  'index.html': 'umumiy',
  'hujjatlar.html': 'hujjat',
  'shablonlar.html': 'hujjat',
  'blog.html': 'umumiy',
  'biz-haqimizda.html': 'umumiy',
  'hamkorlik.html': 'umumiy',
  'maxfiylik.html': 'umumiy',
  'shartlar.html': 'umumiy',
  'ipoteka-2026.html': 'moliya',
  'qqs-2026.html': 'moliya',
  'avto-bojxona-2026.html': 'moliya',
  'dtm-2026.html': 'hayot',
  'bolalar-nafaqasi-2026.html': 'hayot',
  'toy-byudjeti-2026.html': 'hayot',
};

/* ---------- SVG yordamchilari ---------- */
// Sarlavhalarda &, ', <, " uchraydi. Ekranlanmasa SVG parse qilinmaydi va
// skript yarim yo'lda to'xtaydi — shuning uchun har bir matn majburiy ekranlanadi.
function xml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// SVG'da avtomatik matn o'rash yo'q — qo'lda hisoblaymiz.
// Qalin sans shriftda o'rtacha belgi kengligi ~0.55em; keng harflar uchun zaxira.
function wrap(text, fontSize, maxWidth, maxLines) {
  const per = fontSize * 0.55;
  const limit = Math.max(8, Math.floor(maxWidth / per));
  // Limitdan uzun yagona so'z qatorga sig'maydi va rasmdan chiqib ketardi —
  // uni majburan bo'lamiz (hozircha bunday sarlavha yo'q, lekin kelajakda
  // paydo bo'lsa buzilishni faqat rasm ochilgandan keyin ko'rardik).
  const words = [];
  String(text).split(/\s+/).filter(Boolean).forEach((w) => {
    while (w.length > limit) { words.push(w.slice(0, limit - 1) + '-'); w = w.slice(limit - 1); }
    words.push(w);
  });
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length <= limit) { cur = next; continue; }
    if (cur) lines.push(cur);
    cur = w;
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length > maxLines) lines.length = maxLines;
  // Sig'magan qism qolgan bo'lsa oxirini … bilan qisqartiramiz
  const joined = lines.join(' ');
  const all = words.join(' ');
  if (joined.length < all.length && lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (last.length > 4 && last.length + 1 > limit) last = last.slice(0, -1);
    lines[maxLines - 1] = last.replace(/[\s,;:—-]+$/, '') + '…';
  }
  return lines;
}

function svgFor(title, cat, sub) {
  const c = CATS[cat] || CATS.umumiy;
  // Uzun sarlavhada shrift kichrayadi — 3 qatorga sig'sin
  const size = title.length > 44 ? 54 : (title.length > 28 ? 62 : 72);
  const lines = wrap(title, size, W - 160, 3);
  const lh = Math.round(size * 1.22);
  const blockH = lines.length * lh;
  let y = Math.round((H - blockH) / 2) + size - 6;

  const tspans = lines.map((ln) => {
    const t = '<text x="80" y="' + y + '" font-family="' + xml(FONT_FAMILY) + '" font-size="' + size
      + '" font-weight="700" fill="#FFFFFF">' + xml(ln) + '</text>';
    y += lh;
    return t;
  }).join('');

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">'
    + '<rect width="' + W + '" height="' + H + '" fill="' + c.bg + '"/>'
    + '<rect x="0" y="0" width="14" height="' + H + '" fill="' + c.accent + '"/>'
    + '<circle cx="1080" cy="120" r="190" fill="#FFFFFF" opacity="0.05"/>'
    + '<circle cx="1150" cy="560" r="150" fill="' + c.accent + '" opacity="0.10"/>'
    + tspans
    + (sub ? '<text x="80" y="' + (H - 108) + '" font-family="' + xml(FONT_FAMILY)
        + '" font-size="26" font-weight="400" fill="' + c.accent + '">' + xml(sub) + '</text>' : '')
    + '<text x="80" y="' + (H - 52) + '" font-family="' + xml(FONT_FAMILY)
      + '" font-size="30" font-weight="700" fill="#FFFFFF">kalki.uz</text>'
    + '<text x="' + (W - 80) + '" y="' + (H - 52) + '" text-anchor="end" font-family="' + xml(FONT_FAMILY)
      + '" font-size="26" font-weight="400" fill="#FFFFFF" opacity="0.72">' + xml(c.uz) + '</text>'
    + '</svg>';
}

/* ---------- sahifalar ---------- */
function pages() {
  return sitePages()
    .map((f) => {
      const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const m = s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      const title = m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
      const dc = (s.match(/<body[^>]*data-cat="([^"]+)"/) || [])[1];
      const cat = CAT_BY_FILE[f] || dc || 'umumiy';
      const isCalc = /kalkulyator|konvertor/.test(f);
      const isDoc = cat === 'hujjat' && /namunasi/.test(f);
      const sub = isDoc ? 'Onlayn to\u2019ldiring \u00b7 Word va PDF'
        : (isCalc ? 'Bepul \u00b7 Ro\u2019yxatdan o\u2019tmasdan' : '');
      return { file: f, slug: f.replace(/\.html$/, ''), title: title, cat: cat, sub: sub };
    });
}

/* ---------- asosiy ---------- */
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
if (!CHECK && !fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const list = pages();
let made = 0, skipped = 0, tooBig = [], noTitle = [];

for (const p of list) {
  if (!p.title) { noTitle.push(p.file); continue; }
  const svg = svgFor(p.title, p.cat, p.sub);
  const hash = crypto.createHash('sha1').update(svg).update(String(TPL_VERSION)).digest('hex').slice(0, 12);
  const prev = manifest[p.slug];
  const outFile = path.join(OUT_DIR, p.slug + '.png');

  // Hash o'zgarmagan sahifa qayta yasalmaydi — aks holda har yugurishda
  // 54 ta PNG o'zgarib, git tarixi keraksiz shishadi.
  if (!FORCE && prev && prev.hash === hash && fs.existsSync(outFile)) { skipped++; continue; }
  if (CHECK) { made++; continue; }

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: FONT_FAMILY },
  }).render().asPng();

  fs.writeFileSync(outFile, png);
  if (png.length > MAX_BYTES) tooBig.push(p.slug + ' (' + Math.round(png.length / 1024) + ' KB)');

  // Telegram og:image'ni URL bo'yicha keshlaydi va eski rasmni oylab
  // ko'rsatadi — shuning uchun rasm o'zgarganda versiya oshiriladi.
  manifest[p.slug] = { title: p.title, cat: p.cat, hash: hash, tpl: TPL_VERSION, v: prev ? (prev.v || 1) + 1 : 1 };
  made++;
}

if (!CHECK) fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log('shrift: ' + FONTS.map((f) => path.basename(f)).join(', ') + '  (family: ' + FONT_FAMILY + ')');
console.log('sahifalar: ' + list.length + ' | yasaldi: ' + made + ' | o\'zgarmagan: ' + skipped);
if (noTitle.length) console.log('h1 yo\'q: ' + noTitle.join(', '));
if (tooBig.length) console.log('!! 300 KB dan katta: ' + tooBig.join(', '));
else if (!CHECK) console.log('hammasi 300 KB ichida');

// Muammo topilsa chiqish kodi 1 — CI va odam uchun aniq signal.
// Tekshiruv rejimida "yasalishi kerak" ham muammo: demak repodagi rasmlar eskirgan.
const problems = noTitle.length + tooBig.length + (CHECK ? made : 0);
if (CHECK && made) console.log(made + ' ta rasm eskirgan yoki yo\'q — npm run ship');
process.exit(problems ? 1 : 0);
