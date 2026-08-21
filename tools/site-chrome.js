/* kalki.uz — saytning YAGONA sarlavha va footer manbasi.
 *
 * MUAMMO. Sarlavha har sahifada qo'lda yozilgan edi va vaqt o'tib 12 xil
 * variantga bo'linib ketdi: index.html da logotip katta ("Kalki.uz"),
 * ichki sahifalarda kichik va bosh harflarda ("● KALKI.UZ"); nav
 * konteyneri esa sahifa konteynerining kengligini olardi — 31 sahifada
 * bu 560 px edi, ya'ni 8 ta havola keng ekranda ham ikki qatorga sinardi.
 * Mobilda ikkalasi vertikal yig'ilgani uchun farq ko'rinmasdi.
 *
 * YECHIM. Sarlavhaning UMUMIY qismi — #topmenu, logotip va til tugmasi —
 * shu fayldan yoziladi. Sahifaga xos qism (kategoriya nishoni, sarlavha,
 * tavsif, breadcrumb) tegilmaydi: u ichki sahifaning o'z mazmuni.
 * Xuddi shu sabab bilan #xnav ("Boshqa kalkulyatorlar" footer bloki, 50
 * sahifada) ham shu yerdan generatsiya qilinadi — u ham qo'lda 50 marta
 * ko'chirilgan va yangi kalkulyator qo'shilganda unutilib qolardi
 * (masalan staj-kalkulyator hech qayerning footerida yo'q edi).
 *
 * Naqsh tools/og-tags.js dan olingan: bitta manba -> barcha sahifaga
 * yoziladi, idempotent, standart holatda HECH NARSA YOZMAYDI.
 *
 *   node tools/site-chrome.js           # tekshiradi, farq bo'lsa kod 1
 *   node tools/site-chrome.js --write   # yozadi (npm run ship)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { sitePages, ROOT } = require('./render');

const WRITE = process.argv.indexOf('--write') > -1;

/* ---------------- Kanonik nav ---------------- */
const NAV_LINKS = [
  ['./', '🏠 Asosiy', '🏠 Главная'],
  ['./#cat-moliya', 'Moliya', 'Финансы'],
  ['./#cat-qurilish', 'Qurilish', 'Стройка'],
  ['./#cat-kommunal', 'Kommunal', 'Коммуналка'],
  ['./#cat-hayot', 'Hayotiy', 'Жизнь'],
  ['hujjatlar', '📝 Hujjatlar generatori', '📝 Генератор документов'],
  ['shablonlar', '📄 Shablonlar', '📄 Шаблоны'],
  ['blog', '📰 Maqolalar', '📰 Статьи'],
];

function navHtml(active) {
  const items = NAV_LINKS.map(([href, uz, ru]) => '<a href="' + href + '"'
    + (href === active ? ' class="tm-on"' : '')
    + ' data-tm-uz="' + uz + '" data-tm-ru="' + ru + '">' + uz + '</a>').join('');
  return '<nav id="topmenu" aria-label="Bo\'limlar"><div class="tm-in">' + items + '</div></nav>';
}

/* ---------------- Kanonik logotip qatori ----------------
   #topmenu dan keyin, <header> dan OLDIN turadi va sahifa konteyneriga
   BOG'LIQ EMAS — talab shu: nav va logotip qatori sahifa kengligidan
   qat'i nazar bir xil max-width va padding olsin. */
const SITEBAR = '<div id="sitebar"><div class="topbar">'
  + '<a class="logo" href="./">Kalki<span class="dot">.uz</span></a>'
  + '<div class="lang-seg" role="group" aria-label="Til / Язык">'
  + '<button type="button" id="langUz" class="on">UZ</button>'
  + '<button type="button" id="langRu">RU</button>'
  + '</div></div></div>';

/* ---------------- Kanonik CSS ---------------- */
const CHROME_CSS = `<style id="chromecss">
/* Sarlavhaning umumiy qismi — barcha sahifada AYNAN bir xil.
   tools/site-chrome.js dan yoziladi, qo'lda tahrirlanmaydi. */
:root{--nav-max:1120px;--nav-bg:#0B120E;--nav-pad:20px}
#topmenu{background:var(--nav-bg)}
#topmenu .tm-in{max-width:var(--nav-max);margin:0 auto;padding:8px var(--nav-pad);display:flex;flex-wrap:wrap;align-items:center;gap:4px}
#topmenu a{display:inline-block;color:#CBD5CE;font-size:13px;font-weight:800;line-height:1.25;text-decoration:none;padding:6px 11px;border-radius:8px;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:background .15s,color .15s}
#topmenu a:hover{background:rgba(255,255,255,.09);color:#fff}
#topmenu a.tm-on{background:rgba(255,255,255,.14);color:#fff}
#sitebar{background:var(--nav-bg)}
#sitebar .topbar{max-width:var(--nav-max);margin:0 auto;padding:14px var(--nav-pad) 18px;display:flex;align-items:center;justify-content:space-between;gap:16px}
#sitebar .logo{font-size:24px;font-weight:800;letter-spacing:-.01em;color:#fff;text-decoration:none;white-space:nowrap;line-height:1.2}
#sitebar .logo .dot{color:#D99A2B}
#sitebar .lang-seg{display:flex;background:rgba(255,255,255,.13);border-radius:10px;padding:3px;gap:3px;flex:none}
#sitebar .lang-seg button{border:0;background:transparent;font:inherit;font-size:13px;font-weight:800;color:#BFD3C9;padding:7px 14px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;letter-spacing:.04em}
#sitebar .lang-seg button.on{background:#fff;color:#0E3B2E}
#sitebar .lang-seg button:focus-visible{outline:2px solid #D99A2B;outline-offset:2px}
@media (max-width:640px){
  :root{--nav-pad:12px}
  #topmenu .tm-in{gap:3px;padding:7px var(--nav-pad)}
  #topmenu a{font-size:12px;padding:5px 9px;border-radius:7px}
  #sitebar .topbar{padding:12px var(--nav-pad) 14px}
  #sitebar .logo{font-size:21px}
}
@media (max-width:420px){
  :root{--nav-pad:9px}
  #topmenu a{font-size:11px;padding:4px 7px}
}
</style>`;

/* ---------------- Kanonik footer ----------------
   Har havolada data-lf-uz / data-lf-ru bor: ilgari bu blokda hech qanday
   i18n atributi YO'Q edi, shuning uchun RU rejimda o'zbekcha qolib ketardi.
   Matnni assets/footer-lang.js almashtiradi. */
const LEGAL = [
  ['blog', 'Maqolalar', 'Статьи'],
  ['biz-haqimizda', 'Biz haqimizda', 'О нас'],
  ['maxfiylik', 'Maxfiylik', 'Конфиденциальность'],
  ['shartlar', 'Foydalanish shartlari', 'Условия использования'],
  ['https://t.me/kalki_uz', 'Aloqa', 'Контакты'],
  ['hamkorlik', 'Hamkorlik', 'Партнёрство'],
  ['mailto:info@kalki.uz', 'info@kalki.uz', 'info@kalki.uz'],
];
const LEGAL_A = 'color:#33403A;font-size:14px;font-weight:700;text-decoration:none;padding:8px 12px;background:#EEF2EF;border-radius:8px;display:inline-block;white-space:nowrap';

const LEGAL_HTML = '<div id="legal-links" style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">'
  + LEGAL.map(([href, uz, ru]) => '<a href="' + href + '" style="' + LEGAL_A + '"'
    + ' data-lf-uz="' + uz + '" data-lf-ru="' + ru + '">' + uz + '</a>').join('')
  + '</div>';

/* Mualliflik qatori ikki tilni bitta satrda saqlardi ("Achchi loyihasi ·
   Проект Achchi") — endi tilga qarab BITTASI ko'rsatiladi. */
const COPY_HTML = '<div id="copyline" style="margin-top:12px;font-size:12px;color:#8A968F;font-weight:600">'
  + '<span data-lf-uz="© 2026 Kalki.uz — Achchi loyihasi. Barcha huquqlar himoyalangan."'
  + ' data-lf-ru="© 2026 Kalki.uz — проект Achchi. Все права защищены.">'
  + '© 2026 Kalki.uz — Achchi loyihasi. Barcha huquqlar himoyalangan.</span></div>';

/* ---------------- Kanonik "Boshqa kalkulyatorlar" footer ----------------
   MUAMMO. Bu blok har sahifada QO'LDA ko'chirilgan edi (50 ta sahifada).
   Vaqt o'tib bir-biridan uzoqlashadi: masalan yangi staj-kalkulyator.html
   qo'shilganda uni HAMMA joyga qo'lda qo'shish unutilgan edi. Endi bitta
   ro'yxatdan — CALCS bilan bir xil tarkib (index.html dagi CALCS massivi
   qo'lda bu yerda ham saqlanadi, chunki u brauzer-JS massivi va build
   vaqtida import qilib bo'lmaydi) — barcha sahifaga yoziladi, joriy
   sahifaning o'zi ro'yxatdan chiqarib tashlanadi. */
const XNAV_LINKS = [
  ['oila-byudjet-kalkulyator', 'Oila byudjeti / Семейный бюджет'],
  ['kredit-kalkulyator', 'Kredit / Кредит'],
  ['ipoteka-kalkulyator', 'Ipoteka / Ипотека'],
  ['omonat-kalkulyator', 'Omonat / Депозит'],
  ['oylik-soliq-kalkulyator', 'Ish haqi / Зарплата'],
  ['qqs-kalkulyator', 'QQS / НДС'],
  ['bojxona-kalkulyator', 'Bojxona / Растаможка'],
  ['uy-qurish-kalkulyator', 'Uy qurish / Стройка дома'],
  ['gisht-kalkulyator', 'G\'isht / Кирпич'],
  ['beton-kalkulyator', 'Beton / Бетон'],
  ['tom-kalkulyator', 'Tom materiali / Кровля'],
  ['remont-kalkulyator', 'Remont / Ремонт'],
  ['yer-konvertor', 'Yer / Земля'],
  ['chorva-kalkulyator', 'Chorvachilik / Откорм скота'],
  ['konditsioner-kalkulyator', 'Konditsioner / Кондиционер'],
  ['yoqilgi-kalkulyator', 'Yoqilg\'i / Топливо'],
  ['quyosh-panel-kalkulyator', 'Quyosh paneli / Солнечные панели'],
  ['avto-xarajat-kalkulyator', 'Avto saqlash / Содержание авто'],
  ['elektr-xarajat-kalkulyator', 'Elektr xarajati / Электроэнергия'],
  ['dtm-kalkulyator', 'DTM ball / Балл ДТМ'],
  ['universitet-kontrakt-kalkulyator', 'Universitet kontrakti / Контракт вуза'],
  ['grant-ololmadim', 'Grant ololmadim / Не прошёл на грант'],
  ['bola-puli-kalkulyator', 'Bola puli / Детское пособие'],
  ['kaloriya-kalkulyator', 'Kaloriya / Калории'],
  ['homiladorlik-kalkulyator', 'Homiladorlik / Беременность'],
  ['pensiya-kalkulyator', 'Pensiya / Пенсия'],
  ['staj-kalkulyator', 'Mehnat staji / Трудовой стаж'],
  ['zakot-qurbonlik-kalkulyator', 'Zakot va Qurbonlik / Закят и Курбан'],
  ['toy-kalkulyator', 'To\'y / Свадьба'],
  ['marosim-kalkulyator', 'Marosim / Мероприятие'],
  ['maktab-kalkulyator', 'Maktab / Школа'],
  ['alkogol-kalkulyator', 'Alkogol / Алкоголь'],
  ['hujjatlar', '📝 Hujjatlar generatori / Генератор документов'],
  ['shablonlar', '📄 Shablonlar'],
  ['blog', '📰 Maqolalar / Статьи'],
];
const XNAV_TITLE = '<div style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#5C6B63;margin-bottom:12px">Boshqa kalkulyatorlar · Другие калькуляторы</div>';
const XNAV_HOME_A = '<a href="./" style="font-size:13px;font-weight:800;color:#fff;background:#16211C;border:1px solid #16211C;border-radius:99px;padding:7px 13px;text-decoration:none;flex:none;max-width:100%">🏠 Kalki.uz</a>';
const XNAV_A_STYLE = 'font-size:13px;font-weight:700;color:#16211C;background:#fff;border:1px solid #DDE5E0;border-radius:99px;padding:7px 13px;text-decoration:none;flex:none;max-width:100%';

function xnavHtml(selfSlug) {
  const pills = XNAV_LINKS
    .filter(([href]) => href !== selfSlug)
    .map(([href, label]) => '<a href="' + href + '" style="' + XNAV_A_STYLE + '">' + label + '</a>')
    .join('');
  const home = selfSlug === '' ? '' : XNAV_HOME_A;
  return '<nav id="xnav" style="margin-top:36px;padding-top:18px;border-top:1px solid #DDE5E0">'
    + XNAV_TITLE + '<div style="display:flex;flex-wrap:wrap;gap:8px">' + home + pills + '</div></nav>';
}

/* ---------------- Yordamchilar ---------------- */
function block(s, startTag, endTag) {
  const i = s.indexOf(startTag);
  if (i < 0) return null;
  const j = s.indexOf(endTag, i);
  if (j < 0) return null;
  return { i, j: j + endTag.length, text: s.slice(i, j + endTag.length) };
}

function activeHref(nav) {
  const m = nav.match(/<a href="([^"]*)"[^>]*class="tm-on"/);
  return m ? m[1] : null;
}

/* <div ...> dan boshlab mos keluvchi </div> ni chuqurlikni sanab topadi.
   Oddiy indexOf('</div>') yetarli emas: .topbar ichida lang-seg div'i bor,
   #sitebar ichida esa .topbar. Birinchi urinishda shu sabab ikkinchi
   yugurishda bo'sh <div id="sitebar"></div> qobig'i qolib ketgan edi. */
function matchDiv(s, start) {
  const open = /<div\b/gi, close = /<\/div>/gi;
  let depth = 0, i = start;
  while (i < s.length) {
    open.lastIndex = i; close.lastIndex = i;
    const o = open.exec(s), c = close.exec(s);
    if (!c) return -1;
    if (o && o.index < c.index) { depth++; i = o.index + 4; continue; }
    depth--; i = c.index + 6;
    if (depth === 0) return i;
  }
  return -1;
}

function cutDiv(s, marker) {
  const i = s.indexOf(marker);
  if (i < 0) return s;
  const start = s.lastIndexOf('<div', i);
  const end = matchDiv(s, start);
  if (end < 0) return s;
  return s.slice(0, start) + s.slice(end);
}

/* ---------------- Sahifani qayta yig'ish ---------------- */
function rebuild(f, src) {
  let s = src;
  const notes = [];

  /* 1. Avvalgi yugurishning natijasini butunlay olib tashlaymiz, so'ng
        toza holatdan qayta yozamiz — shunda amal IDEMPOTENT bo'ladi. */
  s = cutDiv(s, 'id="sitebar"');       // migratsiya qilingan holat
  s = cutDiv(s, 'class="topbar"');     // eski holat: <header> ichida
  if (s.indexOf('class="topbar"') > -1) return { s, notes: ['ortiqcha .topbar qoldi'] };

  /* 2. nav o'rniga kanonik nav + logotip qatori */
  const nav = block(s, '<nav id="topmenu"', '</nav>');
  if (!nav) return { s, notes: ['topmenu yo\'q'] };
  const active = activeHref(nav.text);
  s = s.slice(0, nav.i) + navHtml(active) + SITEBAR + s.slice(nav.j);

  /* 3. CSS bloki: eski tmcss o'rniga kanonik chromecss */
  const tm = block(s, '<style id="tmcss">', '</style>');
  if (tm) s = s.slice(0, tm.i) + CHROME_CSS + s.slice(tm.j);
  else {
    const ch = block(s, '<style id="chromecss">', '</style>');
    if (ch) s = s.slice(0, ch.i) + CHROME_CSS + s.slice(ch.j);
    else {
      const hd = s.indexOf('</head>');
      s = s.slice(0, hd) + CHROME_CSS + '\n' + s.slice(hd);
    }
  }

  /* 4. .wrap max-width -> CSS o'zgaruvchisi */
  const wm = s.match(/\.wrap\{max-width:(\d+px);/);
  if (wm) {
    s = s.replace(/\.wrap\{max-width:\d+px;/, '.wrap{max-width:var(--wrap-max);');
    // qiymat sahifaning o'z :root ida bir marta e'lon qilinadi
    if (s.indexOf('--wrap-max:') < 0) {
      const r = s.match(/:root\{/);
      if (r) s = s.replace(':root{', ':root{--wrap-max:' + wm[1] + ';');
      else notes.push(':root topilmadi, --wrap-max qo\'yilmadi');
    }
  }

  /* 5. footer — barcha legal-links bloklari olib tashlanadi, so'ng
        bittasi birinchisining o'rniga qo'yiladi. "Barchasi", chunki
        blog.html da ikkita nusxa bor edi va bitta nusxani almashtirish
        har yugurishda boshqa natija berardi. */
  const firstAt = s.indexOf('<div id="legal-links"');
  if (firstAt < 0) notes.push('legal-links yo\'q');
  else {
    let n = 0;
    while (s.indexOf('<div id="legal-links"') > -1) { s = cutDiv(s, 'id="legal-links"'); n++; }
    if (n > 1) notes.push(n + ' ta legal-links bor edi, bittaga keltirildi');
    s = s.slice(0, firstAt) + LEGAL_HTML + s.slice(firstAt);
  }

  /* Mualliflik qatori ikki ko'rinishda uchraydi:
     a) 44 sahifada alohida <div> — to'liq almashtiriladi;
     b) index.html da <footer> ichidagi <span> — unga i18n atributi qo'yiladi.
     Qolgan 12 sahifada u umuman yo'q (maqola va huquqiy sahifalar) — bu
     xato emas, shuning uchun ogohlantirish ham berilmaydi. */
  const cp = s.match(/<div (?:id="copyline" )?style="margin-top:12px;font-size:12px;color:#8A968F;font-weight:600">[\s\S]*?<\/div>/);
  if (cp) s = s.replace(cp[0], COPY_HTML);
  else {
    const SPAN = '<span>© 2026 Kalki.uz — Achchi loyihasi</span>';
    if (s.indexOf(SPAN) > -1) {
      s = s.replace(SPAN, '<span data-lf-uz="© 2026 Kalki.uz — Achchi loyihasi"'
        + ' data-lf-ru="© 2026 Kalki.uz — проект Achchi">© 2026 Kalki.uz — Achchi loyihasi</span>');
    }
  }

  /* 6. footer-lang.js skripti */
  const LANGTAG = '<script src="assets/lang.js" defer=""></script>\n';
  const FLTAG = '<script src="assets/footer-lang.js" defer=""></script>\n';
  if (s.indexOf('assets/footer-lang.js') < 0) {
    if (s.indexOf(LANGTAG) > -1) s = s.replace(LANGTAG, LANGTAG + FLTAG);
    else notes.push('lang.js tegi topilmadi');
  }

  /* 7. "Boshqa kalkulyatorlar" footer — faqat oldin ham bo'lgan sahifada
        almashtiriladi (bo'lmagan sahifaga qo'shilmaydi, masalan blog
        maqolalari va huquqiy sahifalarda bu blok ataylab yo'q). */
  const xn = block(s, '<nav id="xnav"', '</nav>');
  if (xn) {
    const selfSlug = f === 'index.html' ? '' : f.replace(/\.html$/, '');
    s = s.slice(0, xn.i) + xnavHtml(selfSlug) + s.slice(xn.j);
  }

  return { s, notes };
}

/* ---------------- Asosiy ----------------
   require.main tekshiruvi bilan himoyalangan: verify-all.js bu faylni
   modul sifatida (CLI'ni ishga tushirmasdan) require qiladi — kanonik
   sarlavha bilan bir xillikni tekshirish uchun rebuild() ni chaqiradi. */
function main() {
  const list = sitePages();
  let changed = 0;
  const problems = [];

  for (const f of list) {
    const p = path.join(ROOT, f);
    const src = fs.readFileSync(p, 'utf8');
    let r;
    try { r = rebuild(f, src); } catch (e) { problems.push(f + ': ' + e.message); continue; }
    if (r.notes.length) problems.push(f + ': ' + r.notes.join(', '));
    if (r.s !== src) {
      changed++;
      if (WRITE) fs.writeFileSync(p, r.s, 'utf8');
      else console.log('ESKI ' + f);
    }
  }

  console.log('sahifalar: ' + list.length + ' | ' + (WRITE ? 'yangilandi: ' : 'kanonikdan farq qiladi: ') + changed);
  if (problems.length) { console.log('MUAMMO:'); problems.forEach((x) => console.log('  ' + x)); }
  if (!WRITE && changed) console.log('sarlavha kanonik emas — npm run ship');

  return (problems.length || (!WRITE && changed)) ? 1 : 0;
}

if (require.main === module) process.exit(main());

module.exports = { CHROME_CSS, SITEBAR, navHtml, LEGAL_HTML, COPY_HTML, XNAV_LINKS, xnavHtml, rebuild, main };
