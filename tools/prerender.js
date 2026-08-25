/* kalki.uz — prerender.
 *
 * Sahifani jsdom'da yuklaydi, ~950 ms kutadi va JS ishlagandan keyingi DOM'ni
 * qaytaradi. Maqsad: Googlebot sahifani statik holda ko'rsin.
 *
 * STANDART HOLATDA HECH NARSA YOZILMAYDI — natija diskdagi fayl bilan
 * solishtiriladi va farq bo'lsa chiqish kodi 1 bo'ladi. Sababi: o'zi
 * tekshirayotgan narsani tuzatib qo'yadigan vosita yolg'on xotirjamlik
 * beradi (ilgari verify-all shu sababdan "yiqildi, keyin o'zi tuzatdi"
 * holatiga tushgan). Yozish faqat aniq bayroq bilan.
 *
 *   node tools/prerender.js --all              # tekshiradi, yozmaydi
 *   node tools/prerender.js --all --write      # yozadi (npm run ship)
 *   node tools/prerender.js kredit-kalkulyator.html --write
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { load, loadHtml, sitePages, ROOT } = require('./render');

/* Variant A: RU uchun alohida URL (/ru/<nom>). Bosqichma-bosqich ko'chiriladi —
   bu ro'yxatda YO'Q sahifa uchun ru/ fayl generatsiya qilinmaydi va eski
   (localStorage'ga asoslangan, joyida almashtiruvchi) til-tugma xatti-harakati
   o'zgarmasdan qoladi. Ro'yxat AYNAN shu yerda, sabab: 6 ta maqola sahifasi
   (avto-bojxona-2026 va sh.k.) hali RU tarjimasiga ega emas (data-i="" == 0,
   faqat nav/footer tarjima qilingan) — ularga RU sahifa yasash Google'ga
   noto'g'ri til signali beradi. Bu — alohida kontent-tarjima vazifasi.
   1-bosqich (pilot): 4 sahifa. 2-bosqich: GSC eksporti (Страницы.csv,
   2026-08-25) bo'yicha eng ko'p ko'rsatilgan (impressions) va past
   pozitsiyadagi 12 sahifa qo'shildi — bu yerda RU URL qo'shilishi eng
   tez natija berish ehtimoli yuqori. */
const RU_PAGES = [
  'index.html',
  'kredit-kalkulyator.html',
  'ipoteka-kalkulyator.html',
  'oylik-soliq-kalkulyator.html',
  'ariza-namunasi.html',
  'uy-qurish-kalkulyator.html',
  'beton-kalkulyator.html',
  'gisht-kalkulyator.html',
  'alkogol-kalkulyator.html',
  'yer-konvertor.html',
  'quyosh-panel-kalkulyator.html',
  'ishonchnoma-namunasi.html',
  'remont-kalkulyator.html',
  'omonat-kalkulyator.html',
  'pensiya-kalkulyator.html',
  'bojxona-kalkulyator.html',
  // 2-bosqichdan keyin shoshilinch qo'shildi: ariza-namunasi va
  // ishonchnoma-namunasi'ning RU breadcrumb'i /ru/hujjatlar'ga ishora
  // qilardi, bu sahifa hali RU_PAGES'da yo'q edi (404).
  'hujjatlar.html',
  // 3-bosqich: GSC Страницы.csv navbatida 12-o'rindan keyingi eng ko'p
  // ko'rsatilgan 14 sahifa.
  'homiladorlik-kalkulyator.html',
  'elektr-xarajat-kalkulyator.html',
  'bola-puli-kalkulyator.html',
  'zakot-qurbonlik-kalkulyator.html',
  'toy-kalkulyator.html',
  'kaloriya-kalkulyator.html',
  'konditsioner-kalkulyator.html',
  'tom-kalkulyator.html',
  'talabnoma-namunasi.html',
  'chorva-kalkulyator.html',
  'maktab-kalkulyator.html',
  'marosim-kalkulyator.html',
  'staj-kalkulyator.html',
  'avto-xarajat-kalkulyator.html',
];

/* ru/<nom>.html /ru/... manzilida joylashadi — bir bosqich chuqurroq katalog.
   Manba sahifadagi nisbiy asset havolalari (masalan src="assets/lang.js")
   shu holicha qolsa, brauzer ularni /ru/assets/lang.js deb noto'g'ri hal
   qiladi (404). Faqat HAQIQIY asset fayllari (kengaytmasi bor: .js/.css/...)
   ildizga nisbatan mutlaqqa o'zgartiriladi — sahifalararo nisbiy havolalar
   (masalan href="ipoteka-kalkulyator", kengaytmasiz) TEGILMAYDI, chunki ular
   aynan shu nisbiylik tufayli /ru/ ichida qolib ketishi kerak.
   MATN darajasida, jsdom yuklashdan OLDIN qilinadi — aks holda simulyatsiya
   ham xuddi shu 404 bilan RU holatiga o'ta olmay qoladi. */
function rewriteAssetPaths(html) {
  return html.replace(/(src|href)="(assets\/[^"]+|favicon\.svg|manifest\.json|ga\.js|apple-touch-icon\.png)"/g,
    '$1="/$2"');
}

function urlFor(name, lang) {
  var slug = name.replace(/\.html$/, '');
  if (slug === 'index') slug = '';
  return lang === 'ru' ? 'https://kalki.uz/ru/' + slug : 'https://kalki.uz/' + slug;
}

/* canonical/og:url'ni RU manziliga qayta yozadi (faqat RU chiqishida),
   hreflang(uz/ru/x-default) qo'shadi va data-ru-page belgisini qo'yadi —
   bu belgi orqali assets/lang.js tugma navigatsiya qilish kerakligini biladi.
   Ikkala tomonda (uz manba va ru chiqish) ham chaqiriladi. */
function injectSeoLinks(doc, name, forLang) {
  var uzUrl = urlFor(name, 'uz');
  var ruUrl = urlFor(name, 'ru');
  if (forLang === 'ru') {
    var canon = doc.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', ruUrl);
    var ogUrl = doc.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', ruUrl);
    // Ba'zi JSON-LD bloklari (masalan hujjatlar.html'dagi CollectionPage)
    // "url"ni JS orqali emas, statik holda o'ziga ishora qiladi — app-ld
    // kabi JS-hisoblab yozadigan bloklar buni allaqachon to'g'ri yozgan
    // (qayta yozish shunchaki bir xil qiymatni tasdiqlaydi, zararsiz).
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      var data;
      try { data = JSON.parse(s.textContent); } catch (e) { return; }
      if (data && data.url === uzUrl) {
        data.url = ruUrl;
        s.textContent = JSON.stringify(data);
      }
    });
  }
  doc.querySelectorAll('link[data-hreflang-gen]').forEach((el) => el.remove());
  var head = doc.head;
  function addAlt(hreflang, href) {
    var l = doc.createElement('link');
    l.setAttribute('rel', 'alternate');
    l.setAttribute('hreflang', hreflang);
    l.setAttribute('href', href);
    l.setAttribute('data-hreflang-gen', '1');
    head.appendChild(l);
  }
  addAlt('uz', uzUrl);
  addAlt('ru', ruUrl);
  addAlt('x-default', uzUrl);
  doc.documentElement.setAttribute('data-ru-page', '1');
}

/* Bir sahifaning prerender natijasini QAYTARADI (yozmaydi).
   htmlIn berilsa diskdan emas, o'sha matndan yuklanadi — prerender
   barqarorligini faylga tegmasdan tekshirish uchun. */
async function renderOne(name, htmlIn) {
  const file = path.join(ROOT, name);
  // shim bilan yuklaymiz: hamkor bloki haqiqatan to'ladi, so'ng quyidagi
  // data-prerender="skip" mantiqi uni bo'shatadi — ya'ni tozalash haqiqiy
  // sharoitda sinaladi, "fetch yo'q edi" degan tasodif hisobiga emas.
  const { dom, errors } = htmlIn == null
    ? await load(file, { shims: true })
    : await loadHtml(htmlIn, name, { shims: true });
  const doc = dom.window.document;

  // Prerender paytida qo'shilib qolishi mumkin bo'lgan GA teglari olib tashlanadi.
  doc.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach((s) => s.remove());

  // data-prerender="skip" konteynerlari ichi BO'SHATILADI (konteynerning o'zi
  // qoladi). Sababi: prerender JS ishlagandan keyingi DOM'ni yozadi, ya'ni
  // hamkor bloki HTML ichiga muzlab qolardi — JSON yangilansa ham sahifalarda
  // eski hamkorlar turaverar, muddati tugagan taklif abadiy qolar va Google
  // statik HTML'dagi sponsored havolalarni indekslardi.
  doc.querySelectorAll('[data-prerender="skip"]').forEach((el) => {
    el.innerHTML = '';
    el.setAttribute('hidden', '');
    el.removeAttribute('style');
  });

  // Prerender UZ holatini yozadi — RU faqat brauzerda tanlanadi.
  doc.documentElement.setAttribute('lang', 'uz');
  doc.documentElement.setAttribute('data-lang', 'uz');
  doc.documentElement.removeAttribute('data-lang-ready');

  if (RU_PAGES.indexOf(name) > -1) injectSeoLinks(doc, name, 'uz');

  // Fayl oxiridagi '\n' qayta o'qilganda parser uni <body> ichiga ko'chiradi,
  // shuning uchun har prerenderda bitta bo'sh qator to'planib borardi va
  // natija beqaror bo'lardi. Body oxiridagi bo'sh matn tugunlari olib tashlanadi.
  const body = doc.body;
  while (body && body.lastChild && body.lastChild.nodeType === 3 && !body.lastChild.data.trim()) {
    body.removeChild(body.lastChild);
  }

  const out = '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  dom.window.close();
  return { out, errors };
}

/* RU sahifasining prerender natijasini QAYTARADI (yozmaydi). Manba bitta —
   xuddi shu UZ fayl — faqat KalkiLang.setLang('ru') chaqirilib, sahifaning
   o'zi ishlatadigan HAQIQIY runtime mexanizm orqali RU holatiga o'tkaziladi
   (b.click() emas, ochiq API — production kodda ham xuddi shu yo'l).

   Sahifa 'ru/<nom>' manzili sifatida YUKLANADI (haqiqiy joylashuvni
   taqlid qiladi) — ikki sababga ko'ra: (1) assets/lang.js'ning yangi
   navigatsiya mantig'i location.pathname'ga qarab qaror qiladi — agar
   yo'l /ru/ ostida ekanini "bilmasa", setLang('ru') xato ravishda haqiqiy
   navigatsiyaga urinib, jsdom xatosini beradi; (2) bcjs kabi skriptlar
   breadcrumb JSON-LD manzilini location.pathname'dan hisoblaydi — to'g'ri
   /ru/... manzil faqat shunda chiqadi. */
async function renderOneRu(name) {
  const file = path.join(ROOT, name);
  const html = rewriteAssetPaths(fs.readFileSync(file, 'utf8'));
  const { dom, errors } = await loadHtml(html, 'ru/' + name, { shims: true });
  const doc = dom.window.document;
  const w = dom.window;

  w.KalkiLang.setLang('ru', { silent: false });
  // Kechikib bog'lanadigan tinglovchilar (bcjs, faqschema va h.k.) allaqachon
  // ulangan (load() 950ms kutgan) — qo'shimcha kutish faqat repaint ichidagi
  // sinxron ishlarni yakunlash uchun ehtiyot chorasi.
  await new Promise((res) => w.setTimeout(res, 350));

  doc.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach((s) => s.remove());
  doc.querySelectorAll('[data-prerender="skip"]').forEach((el) => {
    el.innerHTML = '';
    el.setAttribute('hidden', '');
    el.removeAttribute('style');
  });

  doc.documentElement.setAttribute('lang', 'ru');
  doc.documentElement.setAttribute('data-lang', 'ru');
  doc.documentElement.removeAttribute('data-lang-ready');
  injectSeoLinks(doc, name, 'ru');

  const body = doc.body;
  while (body && body.lastChild && body.lastChild.nodeType === 3 && !body.lastChild.data.trim()) {
    body.removeChild(body.lastChild);
  }

  const out = '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  dom.window.close();
  return { out, errors };
}

const pages = sitePages;

async function main() {
  const args = process.argv.slice(2);
  const WRITE = args.indexOf('--write') > -1;
  let names = args.filter((a) => a.charAt(0) !== '-');
  if (args.indexOf('--all') > -1) names = pages();
  if (!names.length) {
    console.log('foydalanish: node tools/prerender.js <fayl.html> ... | --all  [--write]');
    return 1;
  }

  let bad = 0, stale = 0;
  for (const n of names) {
    const file = path.join(ROOT, n);
    try {
      const r = await renderOne(n);
      if (r.errors.length) bad++;
      const cur = fs.readFileSync(file, 'utf8');
      const same = cur === r.out;
      if (!same) {
        stale++;
        if (WRITE) fs.writeFileSync(file, r.out, 'utf8');
      }
      const tag = r.errors.length ? 'ERR ' : (same ? 'OK  ' : (WRITE ? 'YOZ ' : 'ESKI'));
      console.log(tag + n + ' (' + r.out.length + ')'
        + (r.errors.length ? ' ' + JSON.stringify(r.errors.slice(0, 2)) : ''));
    } catch (e) { bad++; console.log('FAIL ' + n + ' ' + e.message); }
  }

  // RU (Variant A): faqat RU_PAGES ro'yxatidagi va shu chaqiriqda so'ralgan
  // sahifalar uchun, natija ru/<nom> fayliga yoziladi.
  const ruNames = names.filter((n) => RU_PAGES.indexOf(n) > -1);
  if (ruNames.length) {
    const ruDir = path.join(ROOT, 'ru');
    if (WRITE && !fs.existsSync(ruDir)) fs.mkdirSync(ruDir, { recursive: true });
    for (const n of ruNames) {
      const outFile = path.join(ruDir, n);
      try {
        const r = await renderOneRu(n);
        if (r.errors.length) bad++;
        const cur = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : null;
        const same = cur === r.out;
        if (!same) {
          stale++;
          if (WRITE) fs.writeFileSync(outFile, r.out, 'utf8');
        }
        const tag = r.errors.length ? 'ERR ' : (same ? 'OK  ' : (WRITE ? 'YOZ ' : 'ESKI'));
        console.log(tag + 'ru/' + n + ' (' + r.out.length + ')'
          + (r.errors.length ? ' ' + JSON.stringify(r.errors.slice(0, 2)) : ''));
      } catch (e) { bad++; console.log('FAIL ru/' + n + ' ' + e.message); }
    }
  }

  if (!WRITE && stale) {
    console.log('\n' + stale + ' fayl prerender natijasidan farq qiladi — npm run ship');
  }
  return (bad || (!WRITE && stale)) ? 1 : 0;
}

if (require.main === module) {
  main().then((code) => process.exit(code)).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { renderOne, renderOneRu, pages, RU_PAGES, urlFor };
