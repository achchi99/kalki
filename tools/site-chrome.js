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
/* sitePages() ga kirmaydigan (sitemap/prerender'siz), lekin sarlavha va footer olishi kerak bo'lgan fayllar.
   404.html istalgan chuqurlikdagi manzilda ko'rsatiladi, shuning uchun unda HAMMA yo'l ABSOLYUT bo'lishi shart. */
const CHROME_EXTRA = ['404.html'];
function absolutize(s) {
  return s.replace(/\b(href|src)="([^"]*)"/g, (m, attr, v) => {
    if (!v || /^([a-z][a-z0-9+.\-]*:|\/|#|\?)/i.test(v)) return m;
    return attr + '="/' + v.replace(/^\.\//, '') + '"';
  });
}

/* ---------------- Kanonik footer ----------------
   Har havolada data-lf-uz / data-lf-ru bor: ilgari bu blokda hech qanday
   i18n atributi YO'Q edi, shuning uchun RU rejimda o'zbekcha qolib ketardi.
   Matnni assets/footer-lang.js almashtiradi. */
const LEGAL = [
  ['blog', 'Maqolalar', 'Статьи'],
  ['biz-haqimizda', 'Biz haqimizda', 'О нас'],
  ['maxfiylik', 'Maxfiylik', 'Конфиденциальность'],
  ['shartlar', 'Foydalanish shartlari', 'Условия использования'],
  ['hamkorlik', 'Hamkorlik', 'Партнёрство'],
  // Aloqa — FAQAT Telegram @achchi90 (info@kalki.uz ishlamaydi, 2026-10-13 da olib tashlandi).
  // Kanal @kalki_uz — alohida, "Telegram kanali" sifatida (footer ustunida).
  ['https://t.me/achchi90', 'Aloqa uchun: Telegram @achchi90', 'Связь: Telegram @achchi90', ' target="_blank" rel="noopener" style="' + 'color:#33403A;font-size:14px;font-weight:700;text-decoration:none;padding:8px 12px;background:#EEF2EF;border-radius:8px;display:inline-block;white-space:normal;overflow-wrap:break-word;max-width:100%' + '"'],
];
const LEGAL_A = 'color:#33403A;font-size:14px;font-weight:700;text-decoration:none;padding:8px 12px;background:#EEF2EF;border-radius:8px;display:inline-block;white-space:nowrap';

const LEGAL_HTML = '<div id="legal-links" style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">'
  + LEGAL.map(([href, uz, ru, extra]) => '<a href="' + href + '"'
    + (extra ? extra : ' style="' + LEGAL_A + '"')
    + ' data-lf-uz="' + uz + '" data-lf-ru="' + ru + '">' + uz + '</a>').join('')
  + '</div>';

/* Mualliflik qatori ikki tilni bitta satrda saqlardi ("Achchi loyihasi ·
   Проект Achchi") — endi tilga qarab BITTASI ko'rsatiladi. */
const COPY_HTML = '<div id="copyline" style="margin-top:12px;font-size:var(--t-xs,14px);color:var(--t-muted,#3F4F46);font-weight:600">'
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
  ['kredit-limit-kalkulyator', 'Kredit limit / Кредитный лимит'],
  ['ipoteka-kalkulyator', 'Ipoteka / Ипотека'],
  ['ipoteka-yoki-ijara-kalkulyator', "Ipoteka yoki ijara / Ипотека или аренда"],
  ['ijara-stavkalari', "Ijara stavkalari / Ставки аренды"],
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
  ['gaz-xarajat-kalkulyator', 'Gaz xarajati / Расход газа'],
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
  ['tatil-puli-kalkulyator', 'Ta\'til puli / Компенсация за отпуск'],
  ['kasallik-varaqasi-kalkulyator', 'Kasallik varaqasi / Больничный лист'],
  ['dekret-puli-kalkulyator', 'Dekret puli / Декретные выплаты'],
  ['ishdan-boshatish-kompensatsiyasi-kalkulyator', 'Ishdan bo\'shatish komp. / Компенсация при увольнении'],
  ['aliment-kalkulyator', 'Aliment / Алименты'],
  ['yhxx-jarima-kalkulyator', 'YHXX jarimalari / Штрафы ПДД'],
  ['avto-rasmiylashtirish', 'Avtomobil rasmiylashtirish'],
  ['hisob-siyosati-generatori', 'Hisob siyosati / Учётная политика'],
  // FAZA 4.3: ariza klasteri pilot bosqichi — 3 ta yangi hujjat namunasi.
  ['tatil-arizasi-namunasi', 'Ta\'til arizasi / Заявление на отпуск'],
  ['moddiy-yordam-arizasi-namunasi', 'Moddiy yordam arizasi / Заявление на матпомощь'],
  ['oquv-tatili-arizasi-namunasi', 'O\'quv ta\'tili arizasi / Заявление на учебный отпуск'],
  ['tolov-hisobi-namunasi', 'To\'lov uchun hisob / Счёт на оплату'],
  ['hujjatlar', '📝 Hujjatlar generatori / Генератор документов'],
  ['shablonlar', '📄 Shablonlar'],
  ['blog', '📰 Maqolalar / Статьи'],
];
/* ---------------- V2 (dizayn-2026): yangi sarlavha va footer ----------------
   Barcha sahifalar (tools/dizayn/v2-pages.json) — eski kanonik variant olib tashlangan (cleanup, 2026-10).
   Sarlavha bitta qator (logo | menyu | til | burger); #topmenu va #sitebar identifikatorlari
   saqlangan, shuning uchun sahifalarning o'z til skriptlari (#topmenu a[data-tm-uz]) ishlayveradi. */
// V2 sahifalar ro'yxati tools/dizayn/v2-pages.json da (partiyalab to'ldiriladi); sahifa turi — tools/dizayn/pages.json
const V2_PAGES = JSON.parse(fs.readFileSync(path.join(__dirname, 'dizayn', 'v2-pages.json'), 'utf8'));
const PAGE_TYPES = JSON.parse(fs.readFileSync(path.join(__dirname, 'dizayn', 'pages.json'), 'utf8'));
function v2Active(f) {
  const t = (PAGE_TYPES.find((p) => p.file === f) || {}).tur;
  if (f === 'blog.html' || t === 'maqola') return 'blog';
  if (f === 'shablonlar.html' || f === 'hujjatlar.html' || t === 'generator') return 'hujjatlar';
  if (t === 'kalkulyator') return './#kategoriyalar';
  return '';
}
const V2_LINKS = [
  ['./#kategoriyalar', 'Kalkulyatorlar', 'Калькуляторы', [
    ['./#cat-moliya', 'Moliya', 'Финансы'], ['./#cat-qurilish', 'Qurilish', 'Стройка'], ['./#cat-kommunal', 'Kommunal', 'Коммуналка'],
    ['./#cat-hayot', 'Hayotiy', 'Жизнь'], ['./#cat-huquqiy', 'Huquqiy', 'Юридические']]],
  ['hujjatlar', 'Hujjatlar', 'Документы', [
    ['hujjatlar', 'Hujjat generatorlari', 'Генератор документов'], ['shablonlar', 'Shablonlar', 'Шаблоны']]],
  ['blog', 'Maqolalar', 'Статьи', null],
];
const CHEV = '<svg class="ic" aria-hidden="true"><use href="/assets/icons.svg#i-chevron-down"></use></svg>';
function v2A(href, uz, ru, active) {
  return '<a href="' + href + '"' + (href === active ? ' class="tm-on" aria-current="page"' : '') + ' data-tm-uz="' + uz + '" data-tm-ru="' + ru + '">' + uz + '</a>';
}
function headerV2Html(f) {
  const active = v2Active(f);
  const slug = f.replace(/\.html$/, '');
  const items = V2_LINKS.map(([href, uz, ru, sub]) => {
    if (!sub) return '<li>' + v2A(href, uz, ru, active) + '</li>';
    return '<li class="has-sub">' + v2A(href, uz, ru, active)
      + '<button type="button" class="tm2-chev" aria-expanded="false" aria-label="' + uz + '">' + CHEV + '</button>'
      + '<ul class="tm2-sub">' + sub.map(([h, u, r]) => '<li>' + v2A(h, u, r, '') + '</li>').join('') + '</ul></li>';
  }).join('');
  // UZ | ЎЗ | RU — uchala segment HAR sahifada. ЎЗ oddiy <a href> (JS'siz ham ochiladi, rel=nofollow:
  // bot ?lang=cyr nusxalarini kezmasin); assets/lang.js uni bosishda holatni (?p=) saqlab o'tkazadi.
  const langSeg = '<div class="lang-seg lang-seg-3" role="group" aria-label="Til / Язык" data-cyr="skip">'
    + '<button type="button" id="langUz" class="on">UZ</button>'
    + '<a id="langCyr" href="' + (f === '404.html' ? '?lang=cyr' : '/' + (slug === 'index' ? '' : slug) + '?lang=cyr') + '" rel="nofollow" hreflang="uz-Cyrl" lang="uz-Cyrl">ЎЗ</a>'
    + '<button type="button" id="langRu">RU</button></div>';
  return '<div id="sitebar" class="sb2"><div class="sb2-in">'
    + '<a class="logo" href="./" data-cyr="skip">Kalki<span class="dot">.uz</span></a>'
    + '<nav id="topmenu" aria-label="Bo\'limlar"><ul class="tm2">' + items + '</ul></nav>'
    + langSeg
    + '<button type="button" class="sb2-burger" aria-expanded="false" aria-controls="topmenu" aria-label="Menyu"><svg class="ic" aria-hidden="true"><use href="/assets/icons.svg#i-menu"></use></svg></button>'
    + '</div></div>';
}
/* "Barcha kalkulyatorlar": yig'iladigan <details>, kategoriyalar bo'yicha guruhlangan oddiy ro'yxat.
   Havolalar soni XNAV_LINKS bilan bir xil (SEO uchun hech biri kamaymaydi); UZ/RU yorliqlar aralash emas —
   har havolada data-lf-uz/ru (matnni assets/footer-lang.js joriy tilga qo'yadi). */
const XN_GROUPS = [
  ['Moliya', 'Финансы', 'var(--cat-moliya)', ['oila-byudjet-kalkulyator', 'kredit-kalkulyator', 'kredit-limit-kalkulyator', 'ipoteka-kalkulyator', 'ipoteka-yoki-ijara-kalkulyator', 'ijara-stavkalari', 'omonat-kalkulyator', 'oylik-soliq-kalkulyator', 'qqs-kalkulyator', 'bojxona-kalkulyator']],
  ['Qurilish va yer', 'Стройка и земля', 'var(--cat-qurilish)', ['uy-qurish-kalkulyator', 'gisht-kalkulyator', 'beton-kalkulyator', 'tom-kalkulyator', 'remont-kalkulyator', 'yer-konvertor', 'chorva-kalkulyator']],
  ['Kommunal va avto', 'Коммуналка и авто', 'var(--cat-kommunal)', ['konditsioner-kalkulyator', 'yoqilgi-kalkulyator', 'quyosh-panel-kalkulyator', 'avto-xarajat-kalkulyator', 'elektr-xarajat-kalkulyator', 'gaz-xarajat-kalkulyator', 'avto-rasmiylashtirish']],
  ['Kundalik hayot', 'Жизнь', 'var(--cat-hayot)', ['dtm-kalkulyator', 'universitet-kontrakt-kalkulyator', 'grant-ololmadim', 'bola-puli-kalkulyator', 'kaloriya-kalkulyator', 'homiladorlik-kalkulyator', 'pensiya-kalkulyator', 'staj-kalkulyator', 'zakot-qurbonlik-kalkulyator', 'toy-kalkulyator', 'marosim-kalkulyator', 'maktab-kalkulyator', 'alkogol-kalkulyator']],
  ['Huquqiy', 'Юридические', 'var(--cat-huquqiy)', ['tatil-puli-kalkulyator', 'kasallik-varaqasi-kalkulyator', 'dekret-puli-kalkulyator', 'ishdan-boshatish-kompensatsiyasi-kalkulyator', 'aliment-kalkulyator', 'yhxx-jarima-kalkulyator']],
  ['Hujjatlar va maqolalar', 'Документы и статьи', 'var(--muted)', ['hisob-siyosati-generatori', 'tatil-arizasi-namunasi', 'moddiy-yordam-arizasi-namunasi', 'oquv-tatili-arizasi-namunasi', 'tolov-hisobi-namunasi', 'hujjatlar', 'shablonlar', 'blog']],
];
const EMOJI_V2 = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]\s?/gu;
function xnavV2Html(selfSlug) {
  const label = {};
  XNAV_LINKS.forEach(([h, l]) => { const parts = l.replace(EMOJI_V2, '').split(' / '); label[h] = [parts[0].trim(), (parts[1] || parts[0]).trim()]; });
  const seen = new Set();
  const groups = XN_GROUPS.map(([uz, ru, cc, slugs], gi) => {
    const lis = slugs.filter((h) => h !== selfSlug && label[h]).map((h) => { seen.add(h); const [u, r] = label[h];
      return '<li><a href="' + h + '"' + lf(u, r) + '>' + u + '</a></li>'; }).join('');
    const home = gi === XN_GROUPS.length - 1 && selfSlug !== '' ? '<li><a href="./"' + lf('Bosh sahifa', 'Главная') + '>Bosh sahifa</a></li>' : '';
    return '<div style="--cc:' + cc + '"><div class="xn-t"' + lf(uz, ru) + '>' + uz + '</div><ul>' + home + lis + '</ul></div>';
  }).join('');
  const missing = XNAV_LINKS.map(([h]) => h).filter((h) => h !== selfSlug && !seen.has(h));
  if (missing.length) throw new Error('xnav V2: guruhsiz havola: ' + missing.join(', '));
  return '<details id="xnav" class="allcalc"><summary><span' + lf('Barcha kalkulyatorlar', 'Все калькуляторы') + '>Barcha kalkulyatorlar</span></summary>'
    + '<div class="ac-body"><div class="xn-groups">' + groups + '</div></div></details>';
}
const FBCALL_V2 = '<div id="fbcall" class="cta-tg"><div class="cta-tx">'
  + '<div class="cta-h"' + lf('Kalkulyator yoki shablon kerakmi?', 'Нужен калькулятор или шаблон?') + '>Kalkulyator yoki shablon kerakmi?</div>'
  + '<div class="cta-d"' + lf('Yangi kalkulyator, hujjat shabloni yoki xato — yozing, tez tayyorlaymiz.', 'Нужен новый калькулятор, шаблон или нашли ошибку — напишите, быстро сделаем.') + '>Yangi kalkulyator, hujjat shabloni yoki xato — yozing, tez tayyorlaymiz.</div></div>'
  + '<a class="btn btn-gold" href="https://t.me/achchi90">Telegram</a></div>';

/* Til yuklagichi (<head>, render-blok EMAS, juda qisqa): saqlangan/URL tilini <html> ga darrov yozadi.
   ЎЗ (cyr) rejimida sahifaning ichki tili uz, yozuvi kirill: lang.js tayyor bo'lguncha lotin
   miltillamasligi uchun tana yashiriladi (RU bilan bir xil usul, 0.9 s dan keyin baribir ochiladi). */
const LANGBOOT = String.raw`<script id="langboot">
(function(){try{
  var s=localStorage.getItem('kalki_lang')||localStorage.getItem('lang')||localStorage.getItem('siteLang');
  var l=(s==='ru'||s==='uz'||s==='cyr')?s:'uz';
  if(/^\/ru\//.test(location.pathname))l='ru';
  var q=/[?&]lang=(uz|ru|cyr)\b/.exec(location.search||'');
  if(q)l=q[1];
  var h=document.documentElement;
  if(l==='cyr'){h.setAttribute('data-lang','uz');h.setAttribute('data-script','cyr');h.lang='uz';}
  else{h.setAttribute('data-lang',l);h.lang=l;}
}catch(e){}})();
</script>
<style id="langcss">html[data-lang="ru"] body,html[data-script="cyr"] body{visibility:hidden;animation:kalkiLangReveal 0s linear .9s forwards}
html[data-lang="ru"][data-lang-ready] body,html[data-script="cyr"][data-lang-ready] body{visibility:visible;animation:none}
@keyframes kalkiLangReveal{to{visibility:visible}}
</style>`;

// PWA (assets/pwa-install.js faqat tugma/ko'rsatma yaratadi; /cyr/ da prerender skriptni olib tashlaydi — faqat <link> qoladi)
const PWA_HEAD = '<link rel="manifest" href="/manifest.webmanifest" id="pwamf"><link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon-180.png" id="pwaicon">'
  + '<meta name="apple-mobile-web-app-title" content="Kalki" id="pwatitle"><script src="/assets/pwa-install.js" defer="" id="pwainst"></script>';
const V2_LINKS_TAGS = '<link rel="stylesheet" href="/assets/css/tokens.css" id="v2tokens"><link rel="stylesheet" href="/assets/css/site.css" id="v2site"><script src="/assets/nav.js" defer="" id="v2nav"></script><link rel="stylesheet" href="/assets/css/typo.css" id="typocss">';
function lf(uz, ru) { return ' data-lf-uz="' + uz + '" data-lf-ru="' + ru + '"'; }
function fLink(href, uz, ru) { return '<li><a href="' + href + '"' + lf(uz, ru) + '>' + uz + '</a></li>'; }
const FOOTER_V2 = '<footer id="sf2"><div class="sf2-in">'
  + '<div class="sf2-brand" data-cyr="skip">Kalki<span class="dot">.uz</span></div>'
  + '<p' + lf("O'zbekiston uchun bepul kalkulyatorlar va hujjat namunalari.", 'Бесплатные калькуляторы и образцы документов для Узбекистана.') + ">O'zbekiston uchun bepul kalkulyatorlar va hujjat namunalari.</p>"
  + '<div class="sf2-cols" style="margin-top:32px">'
  + '<div><div class="sf2-t"' + lf('Kategoriyalar', 'Категории') + '>Kategoriyalar</div><ul>'
  + fLink('./#cat-moliya', 'Moliya', 'Финансы') + fLink('./#cat-qurilish', 'Qurilish va yer', 'Стройка и земля') + fLink('./#cat-kommunal', 'Kommunal va avto', 'Коммуналка и авто')
  + fLink('./#cat-hayot', 'Kundalik hayot', 'Жизнь') + fLink('./#cat-huquqiy', 'Huquqiy', 'Юридические') + '</ul></div>'
  + '<div><div class="sf2-t"' + lf('Hujjatlar', 'Документы') + '>Hujjatlar</div><ul>'
  + fLink('hujjatlar', 'Hujjat generatorlari', 'Генератор документов') + fLink('shablonlar', 'Shablonlar', 'Шаблоны')
  + fLink('ariza-namunasi', 'Ariza yozish', 'Написать заявление') + fLink('blog', 'Maqolalar', 'Статьи') + '</ul></div>'
  + '<div><div class="sf2-t"' + lf('Aloqa', 'Связь') + '>Aloqa</div><ul>'
  + '<li><a href="https://t.me/kalki_uz"' + lf('Telegram kanali', 'Telegram-канал') + '>Telegram kanali</a></li>'
  + '<li><a href="https://t.me/achchi90"' + lf('Aloqa: @achchi90', 'Связь: @achchi90') + '>Aloqa: @achchi90</a></li>'
  + fLink('hamkorlik', 'Hamkorlik', 'Партнёрство') + '</ul></div>'
  + '</div>'
  + '<p class="sf2-note"' + lf("Hisob-kitoblar ma'lumot uchun. Rasmiy qaror uchun mutaxassisga murojaat qiling.", 'Расчёты носят справочный характер. Для официального решения обратитесь к специалисту.') + ">Hisob-kitoblar ma'lumot uchun. Rasmiy qaror uchun mutaxassisga murojaat qiling.</p>"
  + '@@LEGAL@@@@COPY@@'
  + '</div></footer>';

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
function rebuildV2(f, src) {
  let s = src;
  const notes = [];
  const nav0 = s.indexOf('<nav id="topmenu"'), sb0 = s.indexOf('<div id="sitebar"');
  const anchor = Math.min(...[nav0, sb0].filter((x) => x >= 0));
  if (!isFinite(anchor)) return { s, notes: ['topmenu/sitebar yo\'q'] };
  s = cutDiv(s, 'id="sitebar"');
  const nav = block(s, '<nav id="topmenu"', '</nav>');
  if (nav) s = s.slice(0, nav.i) + s.slice(nav.j);
  s = s.slice(0, anchor) + headerV2Html(f) + s.slice(anchor);

  // til yuklagichi (langboot + langcss): bitta kanonik nusxa
  const lb = block(s, '<script id="langboot">', '</script>');
  const lc = block(s, '<style id="langcss">', '</style>');
  if (lb && lc && lc.i > lb.i) s = s.slice(0, lb.i) + LANGBOOT + s.slice(lc.j);
  else if (lb && !lc) s = s.slice(0, lb.i) + LANGBOOT + s.slice(lb.j);     // langcss'siz sahifa (avto-rasmiylashtirish)
  else notes.push('langboot topilmadi');

  // CSS va nav.js: eski chromecss o'rniga tokens.css + site.css
  const ch = block(s, '<style id="chromecss">', '</style>');
  if (ch) s = s.slice(0, ch.i) + s.slice(ch.j);
  const V2_OLD = V2_LINKS_TAGS.replace(/<link rel="stylesheet" href="\/assets\/css\/typo\.css" id="typocss">$/, '');
  if (s.indexOf(V2_LINKS_TAGS) < 0 && s.indexOf(V2_OLD) > -1 && s.indexOf('id="typocss"') < 0) s = s.replace(V2_OLD, V2_LINKS_TAGS);   // joyida: typo.css qo'shiladi, tartib o'zgarmaydi
  if (s.indexOf(V2_LINKS_TAGS) < 0) {
    s = s.replace(/<link rel="stylesheet" href="\/assets\/css\/tokens\.css" id="v2tokens">/, '')
         .replace(/<link rel="stylesheet" href="\/assets\/css\/site\.css" id="v2site">/, '')
         .replace(/<script src="\/assets\/nav\.js" defer="" id="v2nav"><\/script>/, '')
         .replace(/<link rel="stylesheet" href="\/assets\/css\/typo\.css" id="typocss">/, '');
    // prerender hreflang teglarini oxirida qo'shadi — bizning teglar ulardan OLDIN turadi
    const hl = s.indexOf('<link rel="alternate" hreflang');
    const hd = hl > -1 ? hl : s.indexOf('</head>');
    s = s.slice(0, hd) + V2_LINKS_TAGS + '\n' + s.slice(hd);
  }

  // PWA: manifest + apple-touch-icon (eski yo'llar o'rniga), o'rnatish tugmasi skripti
  if (s.indexOf(PWA_HEAD) < 0) {
    s = s.replace(/<link rel="manifest"[^>]*>/g, '').replace(/<link rel="apple-touch-icon"[^>]*>/g, '')
         .replace(/<meta name="apple-mobile-web-app-title"[^>]*>/g, '').replace(/<script src="\/assets\/pwa-install\.js"[^>]*><\/script>/g, '');
    const hl2 = s.indexOf('<link rel="alternate" hreflang');
    const hd2 = hl2 > -1 ? hl2 : s.indexOf('</head>');
    s = s.slice(0, hd2) + PWA_HEAD + '\n' + s.slice(hd2);
  }

  // <body class="v2 typo2">
  s = s.replace(/<body([^>]*)>/, (m, a) => /class="[^"]*\bv2\b/.test(a) ? m
    : (/class="/.test(a) ? '<body' + a.replace(/class="/, 'class="v2 ') + '>' : '<body class="v2"' + a + '>'));
  s = s.replace(/<body([^>]*)>/, (m, a) => /class="[^"]*\btypo2\b/.test(a) ? m : '<body' + a.replace(/class="([^"]*)"/, 'class="$1 typo2"') + '>');

  // footer: eski legal-links, copyline va <footer> olib tashlanadi, yangi #sf2 </main> dan keyin
  while (s.indexOf('<div id="legal-links"') > -1) s = cutDiv(s, 'id="legal-links"');
  s = s.replace(/<div (?:id="copyline" )?style="margin-top:12px;font-size:var(--t-xs,14px);color:var(--t-muted,#3F4F46);font-weight:600">[\s\S]*?<\/div>/, '');
  s = s.replace(/<footer id="sf2">[\s\S]*?<\/footer>/, '').replace(/<footer>[\s\S]*?<\/footer>/, '');
  const me = s.indexOf('</main>');
  if (me < 0) notes.push('</main> yo\'q');
  else s = s.slice(0, me + 7) + FOOTER_V2.replace('@@LEGAL@@', LEGAL_HTML).replace('@@COPY@@', COPY_HTML) + s.slice(me + 7);

  // footer-lang.js
  const LANGTAG = '<script src="assets/lang.js" defer=""></script>\n';
  const FLTAG = '<script src="assets/footer-lang.js" defer=""></script>\n';
  if (s.indexOf('assets/footer-lang.js') < 0) {
    if (s.indexOf(LANGTAG) > -1) s = s.replace(LANGTAG, LANGTAG + FLTAG);
    else notes.push('lang.js tegi topilmadi');
  }
  // "Barcha kalkulyatorlar" (<details>): eski <nav id="xnav"> yoki yangi <details id="xnav"> o'rniga
  const selfSlug = f === 'index.html' ? '' : f.replace(/\.html$/, '');
  const xn = block(s, '<nav id="xnav"', '</nav>') || block(s, '<details id="xnav"', '</details>');
  if (xn) s = s.slice(0, xn.i) + xnavV2Html(selfSlug) + s.slice(xn.j);
  // Telegram chaqiruvi: eski inline #fbcall o'rniga yagona V2 blok (</main> dan oldin, foot-note'dan oldin)
  for (let i = s.indexOf('<div id="fbcall"'); i > -1; i = s.indexOf('<div id="fbcall"')) {
    let end = matchDiv(s, i);
    if (end < 0) break;
    if (s[end] === '\n') end++;      // bizning qo'shgan yangi qatorimiz: idempotentlik uchun birga olinadi
    s = s.slice(0, i) + s.slice(end);
  }
  // foot-note <details> ichida bo'lsa (masalan "Qanday hisoblandi?"), Telegram bloki uning ICHIGA tushmasin
  const mend = s.indexOf('</main>');
  const fn = s.lastIndexOf('<p class="foot-note"', mend);
  const topLevel = fn > -1 && s.slice(fn, mend).indexOf('</details>') < 0;
  const at = topLevel ? fn : mend;
  if (at > -1 && f !== '404.html') s = s.slice(0, at) + FBCALL_V2 + '\n' + s.slice(at);   // 404 da Telegram chaqiruvi kerak emas
  return { s, notes };
}

function rebuild(f, src) {
  if (CHROME_EXTRA.indexOf(f) > -1) {
    const r = rebuildV2(f, src);
    return { s: absolutize(r.s), notes: r.notes };
  }
  if (V2_PAGES.indexOf(f) < 0) throw new Error('tools/dizayn/v2-pages.json da yo\'q (barcha sahifalar V2 bo\'lishi kerak)');
  return rebuildV2(f, src);
}

function main() {
  const list = sitePages().concat(CHROME_EXTRA);
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

module.exports = { V2_PAGES, LEGAL_HTML, COPY_HTML, XNAV_LINKS, rebuild, main };
