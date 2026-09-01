/* kalki.uz — yakuniy tekshiruv.
 *
 * HECH NARSA YOZMAYDI. Bu shunchaki xushmuomalalik emas: ilgari 6-band
 * yiqilgach 7-band sw-version.js ni yozish rejimida chaqirib faylni
 * tuzatib qo'ygan va ikkinchi yugurishda "hammasi OK" chiqargan — ya'ni
 * tekshiruv o'z natijasini yashirgan. O'z natijasini yashiradigan tekshiruv
 * tekshiruv emas. Buni band 16 ning o'zi ham sinab ko'radi.
 *
 *   node tools/verify-all.js          # hammasi
 *   node tools/verify-all.js --fast   # prerender barqarorligisiz (tez)
 *
 * --check eski nom sifatida qabul qilinadi, standart holat bilan bir xil.
 * Chiqish kodi 0 — hammasi joyida, 1 — muammo bor.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { load, loadHtml, sitePages, SPECIAL_PAGES } = require('./render');
const { RU_PAGES } = require('./prerender');

const ROOT = path.resolve(__dirname, '..');
const FAST = process.argv.indexOf('--fast') > -1;
const LAT = /[a-zA-Z]/, CYR = /[Ѐ-ӿ]/;

const results = [];
const add = (okv, name, extra) => results.push({ ok: !!okv, name, extra: extra || '' });

/* Repo holatining barmoq izi — band 16 shu bilan "hech nima yozilmadi" ni
   isbotlaydi. .git va node_modules hisobga olinmaydi. */
function fingerprint() {
  const out = {};
  const walk = (dir, rel) => {
    for (const name of fs.readdirSync(dir).sort()) {
      if (name === '.git' || name === 'node_modules') continue;
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) { walk(full, rel + name + '/'); continue; }
      out[rel + name] = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex');
    }
  };
  walk(ROOT, '');
  return out;
}
function fpDiff(a, b) {
  const changed = [];
  Object.keys(b).forEach((k) => { if (a[k] !== b[k]) changed.push(a[k] ? k : k + ' (yangi)'); });
  Object.keys(a).forEach((k) => { if (!(k in b)) changed.push(k + ' (o\'chdi)'); });
  return changed;
}

const pages = sitePages;
function runTool(args) {
  try {
    const out = execFileSync(process.execPath, args.map((a) => (a.endsWith('.js') ? path.join(__dirname, a) : a)),
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status == null ? 1 : e.status, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

(async () => {
  const list = pages();
  const fpBefore = fingerprint();

  /* ---------- 1. Matn tozaligi ---------- */
  {
    const esc = [], mixed = [];
    // Matn tozaligi SPECIAL_PAGES ga ham tegishli: ular ham foydalanuvchiga
    // ko'rinadi, faqat sayt navigatsiyasidan tashqarida turadi.
    for (const f of list.concat(SPECIAL_PAGES)) {
      const p = path.join(ROOT, f);
      if (!fs.existsSync(p)) continue;
      const src = fs.readFileSync(p, 'utf8');
      if ((src.match(/\\u[0-9a-fA-F]{4}/g) || []).length) esc.push(f);
      const words = src.match(/[\p{L}’']{2,}/gu) || [];
      const bad = [...new Set(words.filter((w) => LAT.test(w) && CYR.test(w)))];
      if (bad.length) mixed.push(f + ': ' + bad.slice(0, 4).join(' '));
    }
    add(!esc.length, '1. 0 ta buzuq \\uXXXX escape', esc.join(', '));
    add(!mixed.length, '2. 0 ta aralash alifboli so\'z', mixed.join(' | '));
  }

  /* ---------- 2. GA teglari, h1, footer ---------- */
  {
    const ga = [], noFoot = [];
    for (const f of list) {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      if ((src.match(/googletagmanager/g) || []).length) ga.push(f + ' (gtag)');
      if ((src.match(/src="ga\.js"/g) || []).length > 1) ga.push(f + ' (ga.js x2)');
      if (!src.includes('id="legal-links"')) noFoot.push(f);
    }
    add(!ga.length, '3. dublikat GA tegi yo\'q', ga.join(', '));
    add(!noFoot.length, '4. barcha sahifada footer bloki (' + list.length + ')', noFoot.join(', '));
  }

  /* ---------- 3. Bo'sh h1 (render qilingan holatda) ---------- */
  {
    const bad = [];
    for (const f of list) {
      const { dom } = await load(path.join(ROOT, f), { shims: true });
      const hs = [...dom.window.document.querySelectorAll('h1')];
      if (!hs.length || hs.some((h) => !(h.textContent || '').trim())) bad.push(f);
      dom.window.close();
    }
    add(!bad.length, '5. bo\'sh h1 yo\'q (' + list.length + ' sahifa render qilindi)', bad.join(', '));
  }

  /* ---------- 4. sw.js ---------- */
  {
    const r = runTool(['verify-sw.js']);
    const fails = (r.out.match(/^FAIL .*/gm) || []);
    add(r.code === 0, '6. sw.js statik tahlili', fails.join(' | '));
  }

  /* ---------- 5. sw versiyasi avtomatik va barqaror ---------- */
  {
    const before = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    const r1 = runTool(['sw-version.js']);
    const r2 = runTool(['sw-version.js']);
    const after = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    add(r1.code === 0 && r2.code === 0 && before === after,
      '7. sw versiyasi assets bilan mos va barqaror (hash)',
      before !== after ? 'tekshiruv faylni o\'zgartirdi' : (r1.code ? 'npm run ship kerak' : ''));
  }

  /* ---------- 6. Hamkorlar ---------- */
  {
    const r = runTool(['check-partners.js', '--no-net']);
    const errs = (r.out.match(/^   !! .*/gm) || []).map((x) => x.trim());
    add(r.code === 0, '8. check-partners (fallback qamrovi, note_verified, zakot taqiqi)', errs.join(' | '));
  }

  /* ---------- 7. og:image ---------- */
  {
    const ogDir = path.join(ROOT, 'assets', 'og');
    const imgs = fs.existsSync(ogDir) ? fs.readdirSync(ogDir).filter((f) => f.endsWith('.png')) : [];
    const big = imgs.filter((f) => fs.statSync(path.join(ogDir, f)).size > 300 * 1024);
    add(imgs.length >= list.length && !big.length,
      '9. og:image ' + imgs.length + ' ta, hammasi 300 KB ichida', big.join(', '));

    const noOg = list.filter((f) => {
      const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
      return !/property="og:image" content="https:\/\/kalki\.uz\/assets\/og\/[^"]+\?v=\d+"/.test(s);
    });
    add(!noOg.length, '10. og:image absolyut URL va versiya parametri bilan', noOg.join(', '));
  }

  /* ---------- 8. Hamkor bloki: prerenderda muzlamagan ---------- */
  {
    const bad = [];
    for (const f of list) {
      const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
      if (!s.includes('data-prerender="skip"')) continue;
      if (/data-pt="/.test(s) || /utm_source=kalki\.uz/.test(s)) bad.push(f);
    }
    add(!bad.length, '11. diskdagi HTML\'da hamkor havolasi yo\'q', bad.join(', '));
  }

  /* ---------- 9. METRICS holatlari ----------
     Ilgari bu band hamkorlik.html ni vaqtincha qayta yozib, keyin
     tiklardi. Jarayon yarim yo'lda uzilsa fayl o'zgargan holda qolib
     ketardi. Endi barcha holatlar XOTIRADA render qilinadi. */
  {
    const f = path.join(ROOT, 'hamkorlik.html');
    const orig = fs.readFileSync(f, 'utf8');
    const withM = (body) => orig.replace(/var METRICS = \{[\s\S]*?\n  \};/, body);

    const { dom: d1 } = await loadHtml(orig, 'hamkorlik.html', { shims: true });
    add(!d1.window.document.querySelector('.stat-box'),
      '12. METRICS to\'liq null -> blok yashiriladi');
    d1.window.close();

    const partial = withM('var METRICS = {\n    period: "2026-07",\n    users: 12400,\n    pageviews: null,\n    mobileShare: 87,\n    topPages: [],\n    updated: "' + new Date().toISOString().slice(0, 10) + '"\n  };');
    const { dom: d2 } = await loadHtml(partial, 'hamkorlik.html', { shims: true });
    const rows = [...d2.window.document.querySelectorAll('.stat-row')];
    add(rows.length === 2 && !rows.some((r) => /ko’rishlari|Просмотр/.test(r.textContent)),
      '13. qisman to\'ldirilgan -> faqat mavjud qatorlar', rows.length + ' qator');
    d2.window.close();

    const stale = withM('var METRICS = {\n    period: "2026-04",\n    users: 100,\n    pageviews: null,\n    mobileShare: null,\n    topPages: [],\n    updated: "2026-04-01"\n  };');
    const { dom: d3 } = await loadHtml(stale, 'hamkorlik.html', { shims: true });
    add(!!d3.window.document.querySelector('.stat-stale'), '14. updated 60 kundan eski -> eslatma chiqadi');
    d3.window.close();
  }

  /* ---------- 10. Prerender barqarorligi va diskdagi holat ---------- */
  if (!FAST) {
    const r = runTool(['prerender-twice.js', '--all']);
    add(r.code === 0 && /barqaror/.test(r.out), '15. prerender ikki yugurishda bayt-bayt bir xil',
      (r.out.match(/^FARQ .*/gm) || []).join(' | '));

    const p = runTool(['prerender.js', '--all']);
    add(p.code === 0, '15b. diskdagi HTML prerender natijasiga mos',
      (p.out.match(/^ESKI .*/gm) || []).map((x) => x.slice(5).split(' ')[0]).join(', '));
  } else {
    results.push({ ok: true, name: '15. prerender barqarorligi (--fast: o\'tkazildi)', extra: '' });
    results.push({ ok: true, name: '15b. diskdagi HTML prerenderga mos (--fast: o\'tkazildi)', extra: '' });
  }

  /* ---------- 11. og teglari va rasmlari ---------- */
  {
    const t = runTool(['og-tags.js']);
    add(t.code === 0, '16. og teglari sahifalarda dolzarb', (t.out.match(/eskirgan: [1-9]\d*/) || [''])[0]);
    const i = runTool(['og-images.js']);
    add(i.code === 0, '17. og rasmlari dolzarb va 300 KB ichida',
      (i.out.match(/^.*(eskirgan|katta).*$/gm) || []).join(' | '));
  }

  /* ---------- 12. Sarlavha (header) kanonik variant bilan bir xil ----------
     tools/site-chrome.js kanonik #topmenu, #sitebar va footer'ni bitta
     manbadan yozadi. Bu band uni --check rejimida (yozmasdan) qayta
     ishga tushiradi: har qanday sahifa kanonikdan farq qilsa — masalan
     birov qo'lda header'ga tegib qo'ysa — shu yerda ushlanadi. Aynan shu
     naqsh (og-tags.js) allaqachon 16-bandda ishlatilgan. */
  {
    const r = runTool(['site-chrome.js']);
    add(r.code === 0, '19. barcha sahifada sarlavha kanonik variant bilan bir xil',
      (r.out.match(/^ESKI .*/gm) || []).concat(r.out.match(/^  .*/gm) || []).slice(0, 6).join(' | '));
  }

  /* ---------- 13. RU rejimda tarjimasiz qolgan matn yo'q ----------
     Umumiy naqsh: data-lf-uz / data-lf-ru (footer-lang.js). RU tanlangach
     har bir shunday elementning matni AYNAN data-lf-ru qiymatiga teng
     bo'lishi, UZ tanlangach esa data-lf-uz ga teng bo'lishi kerak.
     Bitta elementning ham eskirib qolishi footerda "Maqolalar" kabi
     o'zbekcha so'z RU sahifada turib qolishiga olib kelardi. */
  {
    const bad = [];
    for (const f of list) {
      // RU_PAGES'dagi sahifalarda til-tugma endi joyida bosmaydi, /ru/...ga
      // navigatsiya qiladi (Variant A) — RU holati allaqachon ru/<f> fayliga
      // build vaqtida yozilgan, shuni to'g'ridan-to'g'ri tekshiramiz.
      const ruMigrated = RU_PAGES.indexOf(f) > -1;
      // ru/<f> haqiqiy joylashuvi 'ru/'+f — load() esa path.basename() ishlatib
      // buni yo'qotib qo'yardi, natijada lang.js location.pathname'ni UZ deb
      // o'ylab, markHtml('uz') orqali RU holatini o'zi qaytarib qo'yardi
      // (production'da haqiqiy /ru/... manzilda bu muammo yo'q).
      const { dom } = ruMigrated
        ? await loadHtml(fs.readFileSync(path.join(ROOT, 'ru', f), 'utf8'), 'ru/' + f, { shims: true })
        : await load(path.join(ROOT, f), { shims: true });
      const w = dom.window, d = w.document;
      const els = [...d.querySelectorAll('[data-lf-uz]')];
      if (els.length) {
        if (!ruMigrated) {
          const wait = (ms) => new Promise((res) => w.setTimeout(res, ms));
          const ru = d.getElementById('langRu');
          if (ru) { ru.click(); await wait(500); }
        }
        els.forEach((e) => {
          const want = e.getAttribute('data-lf-ru');
          if (want && e.textContent.trim() !== want.trim()) bad.push(f + ': "' + e.textContent.trim().slice(0, 24) + '"');
        });
      }
      dom.window.close();
    }
    add(!bad.length, '20. RU rejimda footer/legal matni tarjima qilingan (' + list.length + ' sahifa)',
      bad.slice(0, 6).join(' | '));
  }

  /* ---------- 21. RU_PAGES: canonical/hreflang/data-ru-page izchilligi ----------
     Variant A migratsiyasi (/ru/... alohida URL). Har bir RU_PAGES a'zosi
     uchun: (a) ru/<f> fayli diskda mavjud, (b) uz manbada va ru chiqishida
     hreflang(uz/ru/x-default) va data-ru-page="1" bor, (c) ru chiqishida
     canonical/og:url /ru/... ga, uz manbada o'ziga ishora qiladi. */
  {
    const bad = [];
    for (const f of RU_PAGES) {
      const ruFile = path.join(ROOT, 'ru', f);
      if (!fs.existsSync(ruFile)) { bad.push(f + ': ru/' + f + ' yo\'q'); continue; }
      const uzHtml = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const ruHtml = fs.readFileSync(ruFile, 'utf8');
      const slug = f.replace(/\.html$/, '') === 'index' ? '' : f.replace(/\.html$/, '');
      const uzUrl = 'https://kalki.uz/' + slug;
      const ruUrl = 'https://kalki.uz/ru/' + slug;
      if (!uzHtml.includes('data-ru-page="1"')) bad.push(f + ': uz manbada data-ru-page yo\'q');
      if (!ruHtml.includes('data-ru-page="1"')) bad.push(f + ': ru chiqishida data-ru-page yo\'q');
      if (!ruHtml.includes('lang="ru"')) bad.push(f + ': ru chiqishida <html lang="ru"> yo\'q');
      [uzHtml, ruHtml].forEach((h, i) => {
        const tag = i === 0 ? 'uz' : 'ru';
        ['hreflang="uz"', 'hreflang="ru"', 'hreflang="x-default"'].forEach((hl) => {
          if (!h.includes(hl)) bad.push(f + ' (' + tag + '): ' + hl + ' yo\'q');
        });
      });
      if (!ruHtml.includes('href="' + ruUrl + '"')) bad.push(f + ': ru canonical /ru/... ga emas');
      if (!uzHtml.includes('href="' + uzUrl + '"')) bad.push(f + ': uz canonical o\'ziga emas');
    }
    add(!bad.length, '21. RU_PAGES: canonical/hreflang/data-ru-page izchilligi (' + RU_PAGES.length + ' sahifa)',
      bad.slice(0, 10).join(' | '));
  }

  /* ---------- 22. RU sahifada JS ishga tushgandan keyin ham asosiy
     kontent rus tilida qoladi ----------
     2026-08'da topilgan bug: har sahifaning o'z inline skripti
     `var lang='uz'` deb qattiq yozilgan edi (yoki assets/docgen.js'dagi
     umumiy KD.page() shunday edi) — prerender /ru/... faylga to'g'ri
     lang="ru" yozib qo'ysa ham, sahifa brauzerda qayta ishga tushganda
     bu skript document.documentElement.lang'ni "uz"ga qaytarib, asosiy
     kontentni o'zbekchaga almashtirib qo'yardi. Band 20 buni ushlamadi,
     chunki u FAQAT footer'dagi [data-lf-uz] elementlarni tekshiradi
     (alohida footer-lang.js orqali boshqariladi, sahifaning o'z tilini
     boshqaruvchi asosiy skriptdan mustaqil) — shu sabab bug 4 hafta
     davomida sezilmay qoldi. Bu band esa JS to'liq ishga tushgandan
     keyingi holatni ikki yo'l bilan tekshiradi: (a) <html lang> ru'da
     qolganmi, (b) <h1>/<main>dagi matnda kamida bitta kirill harfi bormi
     (o'zbekcha lotin yozuvida kirill umuman bo'lmaydi). */
  {
    const bad = [];
    for (const f of RU_PAGES) {
      const ruFile = path.join(ROOT, 'ru', f);
      if (!fs.existsSync(ruFile)) continue; // band 21 buni allaqachon ushlaydi
      const { dom } = await loadHtml(fs.readFileSync(ruFile, 'utf8'), 'ru/' + f, { shims: true });
      const w = dom.window, d = w.document;
      if (d.documentElement.lang !== 'ru') {
        bad.push(f + ': JSdan keyin <html lang> = "' + d.documentElement.lang + '"');
      } else {
        const sampleEl = d.querySelector('h1') || d.querySelector('main');
        const sample = (sampleEl && sampleEl.textContent || '').trim();
        if (sample && !CYR.test(sample)) {
          bad.push(f + ': asosiy matnda kirill yo\'q — "' + sample.slice(0, 30) + '"');
        }
      }
      dom.window.close();
    }
    add(!bad.length, '22. RU sahifada JS ishga tushgandan keyin ham asosiy kontent rus tilida (' + RU_PAGES.length + ' sahifa)',
      bad.slice(0, 8).join(' | '));
  }

  /* ---------- CTR: title/description uzunligi va noyobligi ----------
     2026-08 CTR ishidan keyingi doimiy band. Google 50-65 belgidan
     uzun title'ni "…" bilan kesadi, description 120-165 oralig'ida eng
     yaxshi ko'rinadi. Takrorlanuvchi title/description ikkita sahifani
     qidiruv natijasida bir-biridan ajratib bo'lmay qoladi — Google
     ko'pincha ulardan birini indeksdan chetlab qo'yadi. index.html
     brend bosh sahifa sifatida chegaradan ozroq chiqishi mumkin, shu
     sabab uzunlik tekshiruvidan chetlanadi (lekin noyoblikka kiradi). */
  {
    const bad = [];
    const titles = new Map(), descs = new Map();
    for (const f of list) {
      const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const tm = html.match(/<title>([^<]*)<\/title>/);
      const dm = html.match(/<meta name="description" content="([^"]*)"/);
      if (!tm || !dm) { bad.push(f + ': title/description topilmadi'); continue; }
      const t = tm[1], d = dm[1];
      if (f !== 'index.html') {
        if (t.length < 30 || t.length > 65) bad.push(f + ': title ' + t.length + ' belgi');
        if (d.length < 120 || d.length > 165) bad.push(f + ': description ' + d.length + ' belgi');
      }
      if (titles.has(t)) bad.push(f + ': title takror (' + titles.get(t) + ' bilan)'); else titles.set(t, f);
      if (descs.has(d)) bad.push(f + ': description takror (' + descs.get(d) + ' bilan)'); else descs.set(d, f);
    }
    add(!bad.length, '23. title/description uzunligi va noyobligi (' + list.length + ' sahifa)',
      bad.slice(0, 8).join(' | '));
  }

  /* ---------- 14. tools/ hech nima yozmadi ----------
     Yuqoridagi bandlarning HAMMASI shu oynada bajarildi: prerender,
     prerender-twice, sw-version, og-tags, og-images, check-partners,
     verify-sw va hamkorlik.html METRICS holatlari. Agar ulardan biri
     bayroqsiz holda diskka tegsa — shu yerda ko'rinadi. */
  {
    const changed = fpDiff(fpBefore, fingerprint());
    add(changed.length === 0, '24. bayroqsiz chaqirilgan tools/ skriptlari hech nima yozmadi',
      changed.slice(0, 8).join(', '));
  }

  /* ---------- 25. RU sahifada UZ matn qoldig'i (title/meta/JSON-LD/statik blok) ----------
     2026-08'da topilgan bug: bir nechta sahifaning applyLang()'i title/meta
     description'ni yangilasa ham, og:title/twitter:title'ni yangilamasdi
     (deyarli sayt bo'ylab, 63/64 sahifa) — bundan tashqari bir nechta
     sahifada document.title umuman yangilanmasdi, ba'zi sahifalarda esa
     ko'rinadigan kontent (seoBlock, FAQ JSON-LD, related havolalar) UZ
     holicha qolib ketardi. Band 20/22 buni ushlamaydi, chunki ular faqat
     asosiy kontent/footer'ni tekshiradi, meta teglar va JSON-LD'ni emas.
     Bu band JS ijro etmasdan (band 22'dan farqli — bu yerga JS shart emas,
     chunki tekshirilayotgan qiymatlar allaqachon prerender vaqtida diskka
     yozilgan) statik HTML'ni o'qiydi va RU sahifadagi title/meta/JSON-LD/
     seoBlock/faqBlock/related/articleLink matnlarida kamida bitta kirill
     harfi bor-yo'qligini tekshiradi — agar yo'q bo'lsa va matn UZ-safe
     ro'yxatidan (brend nomi, PDF/Word/Excel, raqamlar) tashqari bo'lsa,
     bu UZ matn qoldig'i hisoblanadi. */
  {
    const { JSDOM: JSDOM25 } = require('jsdom');
    function isUzSafe(s) {
      if (!s) return true;
      const stripped = s
        .replace(/Kalki\.uz/gi, '')
        .replace(/\bPDF\b/gi, '')
        .replace(/\bWord\b/gi, '')
        .replace(/\bExcel\b/gi, '')
        .replace(/\bNSBU\s*№?\s*\d*/gi, '')
        .replace(/\bUZS\b/gi, '')
        .replace(/[0-9\s.,%\-–—:;()«»"'/№+@]/g, '');
      return stripped.trim().length === 0;
    }
    function textNoEmoji(s) {
      return String(s || '').replace(/\p{Extended_Pictographic}/gu, '').replace(/→/g, '').trim();
    }
    const bad = [];
    for (const f of RU_PAGES) {
      const ruFile = path.join(ROOT, 'ru', f);
      if (!fs.existsSync(ruFile)) continue; // band 21 buni allaqachon ushlaydi
      const doc = new JSDOM25(fs.readFileSync(ruFile, 'utf8')).window.document;
      const found = [];
      function check(label, text) {
        if (text == null) return;
        text = String(text).trim();
        if (!text) return;
        if (!CYR.test(text) && !isUzSafe(text)) found.push(label + ': "' + text.slice(0, 50) + '"');
      }
      check('title', doc.title);
      ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].forEach((k) => {
        const sel = k.indexOf('og:') === 0 ? 'meta[property="' + k + '"]' : 'meta[name="' + k + '"]';
        const m = doc.querySelector(sel);
        check('meta[' + k + ']', m && m.getAttribute('content'));
      });
      doc.querySelectorAll('script[type="application/ld+json"]').forEach((sc) => {
        let data;
        try { data = JSON.parse(sc.textContent); } catch (e) { return; }
        const id = sc.id || data['@type'] || 'ld+json';
        (function walk(obj, pfx) {
          if (obj == null) return;
          if (typeof obj === 'string') { check(pfx, obj); return; }
          if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, pfx + '[' + i + ']')); return; }
          if (typeof obj === 'object') {
            for (const k of ['name', 'text', 'description', 'headline']) if (obj[k] != null) check(pfx + '.' + k, obj[k]);
            if (obj.mainEntity) walk(obj.mainEntity, pfx + '.mainEntity');
            if (obj.acceptedAnswer) walk(obj.acceptedAnswer, pfx + '.acceptedAnswer');
            if (obj.step) walk(obj.step, pfx + '.step');
            if (obj.itemListElement) walk(obj.itemListElement, pfx + '.itemListElement');
          }
        })(data, id);
      });
      const ab = doc.querySelector('.ab-text');
      check('answerbox', ab && ab.textContent);
      ['seoBlock', 'faqBlock'].forEach((id) => {
        const el = doc.getElementById(id);
        if (!el) return;
        el.querySelectorAll('h2, p').forEach((n, i) => check(id + '[' + i + ']', n.textContent));
      });
      ['related', 'articleLink'].forEach((id) => {
        const el = doc.getElementById(id);
        if (!el) return;
        el.querySelectorAll('a').forEach((a, i) => check(id + ' a[' + i + ']', textNoEmoji(a.textContent)));
      });
      if (found.length) bad.push(f + ' — ' + found.slice(0, 3).join(', '));
    }
    add(!bad.length, '25. RU sahifada UZ matn qoldig\'i yo\'q (title/meta/JSON-LD/statik blok, ' + RU_PAGES.length + ' sahifa)',
      bad.slice(0, 6).join(' | '));
  }

  /* ---------- hisobot ---------- */
  console.log('=== kalki.uz yakuniy tekshiruv ===');
  results.forEach((r) => console.log((r.ok ? 'OK   ' : 'FAIL ') + r.name + (r.extra ? ' — ' + r.extra : '')));
  const bad = results.filter((r) => !r.ok).length;
  console.log('\n' + (bad ? bad + ' ta band yiqildi' : results.length + ' band: hammasi o\'tdi'));
  process.exit(bad ? 1 : 0);
})();
