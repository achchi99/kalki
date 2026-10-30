/* kalki.uz — service worker.
 *
 * VERSIYA QO'LDA YOZILMAYDI. Quyidagi qator tools/sw-version.js tomonidan
 * assets/ papkasi mazmunining hash'idan yoziladi (npm run ship / prerender).
 * Qo'lda oshiriladigan raqam ertami-kechmi unutiladi va shunda foydalanuvchi
 * brauzerida eski kod muzlab qoladi.
 */
const SW_VERSION = 'f28dc84d';   /* sw-version:auto */

const STATIC = 'kalki-static-' + SW_VERSION;    // HTML qobiq + assets
const RUNTIME = 'kalki-runtime-' + SW_VERSION;  // rasm, og, boshqa
const PENDING = 'kalkifit-pending';       // bildirishnoma bosilganini ilovaga yetkazish (iOS openWindow manzilni e'tiborsiz qoldirishi mumkin)
const KEEP = [STATIC, RUNTIME, PENDING];

/* Precache — birinchi ochishda oflayn ishlashi uchun. Ro'yxatdagi har bir
   yo'l haqiqatan mavjudligini tools/verify-sw.js tekshiradi. */
/* '/offline' — '.html' SIZ. Cloudflare Pages '/offline.html' ni 308 bilan '/offline' ga
   yo'naltiradi; keshga redirected:true javob tushadi va brauzer uni navigatsiyada
   rad etadi (iOS standalone'da — qora ekran). Ro'yxatga faqat 200 beradigan yo'l. */
const OFFLINE = '/offline';

const ASSETS = [
  '/',
  '/ru/',
  OFFLINE,
  '/assets/docgen.js',
  '/assets/css/tokens.css',
  '/assets/css/site.css',
  '/assets/css/typo.css',
  '/assets/icons.svg',
  '/assets/nav.js',
  '/assets/calc-v2.js',
  '/assets/answerbox.js',
  '/assets/crosslink.js',
  '/assets/lang.js',
  '/assets/translit.js',
  '/assets/cyr.js',
  '/assets/datanote.js',
  '/assets/tarif-core.js',
  '/assets/elektr-tarif.js',
  '/assets/gaz-tarif.js',
  '/assets/tier-bar.js',
  '/assets/prognoz.js',
  '/assets/nasiya-hisob.js',
  '/assets/rozgor-core.js',
  '/assets/app-kit.js',
  '/assets/app-install.js',
  '/assets/app-native.js',
  '/assets/app-backup.js',
  '/assets/app-akkaunt.js',
  '/assets/app-yangilik.js',
  '/assets/rozgor-app.js',
  '/assets/kalkifit-core.js',
  '/assets/kalkifit-app.js',
  '/assets/kalkifit-gaplar.js',
  '/assets/kalkifit-kunkarta.js',
  '/assets/kalkifit-hafta.js',
  '/assets/kalkifit-hikoya.js',
  '/assets/kalkifit-plato.js',
  '/assets/kalkifit-afsona.js',
  '/assets/kalkifit-menyu.js',
  '/assets/kalkifit-ovoz.js',
  '/assets/orinbosar-core.js',
  '/assets/cheklov-core.js',
  '/assets/yeymiz-core.js',
  '/assets/uyda-core.js',
  '/assets/uyda-pp-core.js',
  '/assets/hisob-kun.js',
  '/assets/stat-kun.js',
  '/assets/num-slider.js',
  '/assets/kalkifit-yeymiz.js',
  '/assets/kalkifit-demo.js',
  '/assets/retsept-core.js',
  '/assets/kalkifit-retsept.js',
  '/assets/kalkifit-intro.js',
  '/data/orinbosar.json',
  '/data/oqsil-manba.json',
  '/data/cheklov-teglar.json',
  '/data/yeymiz.json',
  '/data/uyda.json',
  '/data/uyda-pp.json',
  '/data/retsept-masalliq.json',
  '/data/masofalar.json',
  '/data/yangiliklar-kalkifit.json',
  '/data/hazillar.json',
  '/data/afsonalar.json',
  '/data/suv-ulush.json',
  '/data/yangiliklar-rozgor.json',
  '/data/qoshimchalar.json',
  '/assets/css/appkit.css',
  '/assets/css/rozgor.css',
  '/assets/css/kalkifit.css',
  '/assets/ovqat/achchiq-chuchuk-128.webp',
  '/assets/ovqat/anor-128.webp',
  '/assets/ovqat/ayron-128.webp',
  '/assets/ovqat/banan-128.webp',
  '/assets/ovqat/burger-128.webp',
  '/assets/ovqat/chak-chak-128.webp',
  '/assets/ovqat/chuchvara-128.webp',
  '/assets/ovqat/dimlama-128.webp',
  '/assets/ovqat/guruch-128.webp',
  '/assets/ovqat/holva-128.webp',
  '/assets/ovqat/hot-dog-128.webp',
  '/assets/ovqat/kartoshka-fri-128.webp',
  '/assets/ovqat/kok-choy-128.webp',
  '/assets/ovqat/lagmon-128.webp',
  '/assets/ovqat/lavash-128.webp',
  '/assets/ovqat/manti-128.webp',
  '/assets/ovqat/mastava-128.webp',
  '/assets/ovqat/moshxorda-128.webp',
  '/assets/ovqat/navvot-128.webp',
  '/assets/ovqat/norin-128.webp',
  '/assets/ovqat/obi-non-128.webp',
  '/assets/ovqat/olivye-128.webp',
  '/assets/ovqat/olma-128.webp',
  '/assets/ovqat/osh-128.webp',
  '/assets/ovqat/patir-128.webp',
  '/assets/ovqat/pitsa-128.webp',
  '/assets/ovqat/qatiq-128.webp',
  '/assets/ovqat/qatlama-128.webp',
  '/assets/ovqat/qora-choy-128.webp',
  '/assets/ovqat/qovun-128.webp',
  '/assets/ovqat/qovurdoq-128.webp',
  '/assets/ovqat/qozon-kabob-128.webp',
  '/assets/ovqat/shashlik-128.webp',
  '/assets/ovqat/shorva-128.webp',
  '/assets/ovqat/somsa-gosht-128.webp',
  '/assets/ovqat/somsa-qovoq-128.webp',
  '/assets/ovqat/suzma-128.webp',
  '/assets/ovqat/tarvuz-128.webp',
  '/assets/ovqat/tovuq-128.webp',
  '/assets/ovqat/tuxum-128.webp',
  '/assets/ovqat/uzum-128.webp',
  '/assets/ovqat/xurmo-128.webp',
  '/data/ovqatlar.json',
  '/kalkifit.webmanifest',
  '/assets/icons/kalkifit-192.png',
  '/assets/icons/kalkifit-512.png',
  '/assets/icons/kalkifit-apple-180.png',
  '/rozgor.webmanifest',
  '/ru/rozgor.webmanifest',
  '/assets/icons/rozgor-192.png',
  '/assets/icons/rozgor-512.png',
  '/assets/icons/rozgor-apple-180.png',
  '/assets/mode-tip.js',
  '/data/qadamlar.json',
  '/assets/konditsioner.js',
  '/assets/tgcta.js',
  '/assets/sw-boot.js',
  '/assets/footer-lang.js',
  '/assets/partners.js',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-512.png',
  '/assets/icons/apple-touch-icon-180.png',
  '/assets/pwa-install.js',
  '/ga.js',
  '/aliment-kalkulyator',
  '/ru/aliment-kalkulyator',
  '/cyr/aliment-kalkulyator',
  '/alkogol-kalkulyator',
  '/ru/alkogol-kalkulyator',
  '/ariza-namunasi',
  '/ru/ariza-namunasi',
  '/cyr/ariza-namunasi',
  '/avto-bojxona-2026',
  '/avto-oldi-sotdi-shartnomasi-namunasi',
  '/avto-rasmiylashtirish',
  '/ru/avto-rasmiylashtirish',
  '/avto-xarajat-kalkulyator',
  '/ru/avto-xarajat-kalkulyator',
  '/beton-kalkulyator',
  '/ru/beton-kalkulyator',
  '/cyr/beton-kalkulyator',
  '/biz-haqimizda',
  '/blog',
  '/bojxona-kalkulyator',
  '/ru/bojxona-kalkulyator',
  '/bola-puli-kalkulyator',
  '/ru/bola-puli-kalkulyator',
  '/bolalar-nafaqasi-2026',
  '/chorva-kalkulyator',
  '/ru/chorva-kalkulyator',
  '/davo-arizasi-namunasi',
  '/dekret-puli-kalkulyator',
  '/ru/dekret-puli-kalkulyator',
  '/dtm-2026',
  '/dtm-kalkulyator',
  '/ru/dtm-kalkulyator',
  '/elektr-xarajat-kalkulyator',
  '/ru/elektr-xarajat-kalkulyator',
  '/gaz-xarajat-kalkulyator',
  '/ru/gaz-xarajat-kalkulyator',
  '/naqd-nasiya-kredit-kalkulyator',
  '/ru/naqd-nasiya-kredit-kalkulyator',
  '/rozgor',
  '/ru/rozgor',
  '/kalkifit',
  '/ru/kalkifit',
  '/gisht-kalkulyator',
  '/ru/gisht-kalkulyator',
  '/grant-ololmadim',
  '/ru/grant-ololmadim',
  '/hamkorlik',
  '/hisob-siyosati-generatori',
  '/ru/hisob-siyosati-generatori',
  '/homiladorlik-kalkulyator',
  '/ru/homiladorlik-kalkulyator',
  '/hujjatlar',
  '/ru/hujjatlar',
  '/ijara-shartnomasi-namunasi',
  '/ru/ijara-shartnomasi-namunasi',
  '/ipoteka-2026',
  '/ipoteka-kalkulyator',
  '/ru/ipoteka-kalkulyator',
  '/ipoteka-yoki-ijara-kalkulyator',
  '/ru/ipoteka-yoki-ijara-kalkulyator',
  '/ijara-stavkalari',
  '/ru/ijara-stavkalari',
  '/ishdan-boshash-arizasi-namunasi',
  '/ru/ishdan-boshash-arizasi-namunasi',
  '/ishdan-boshatish-kompensatsiyasi-kalkulyator',
  '/ru/ishdan-boshatish-kompensatsiyasi-kalkulyator',
  '/ish-haqi-malumotnomasi-namunasi',
  '/ru/ish-haqi-malumotnomasi-namunasi',
  '/ishonchnoma-namunasi',
  '/ru/ishonchnoma-namunasi',
  '/kadr-buyruqlari-namunasi',
  '/ru/kadr-buyruqlari-namunasi',
  '/kafolat-xati-namunasi',
  '/kaloriya-kalkulyator',
  '/ru/kaloriya-kalkulyator',
  '/kasallik-varaqasi-kalkulyator',
  '/ru/kasallik-varaqasi-kalkulyator',
  '/konditsioner-kalkulyator',
  '/ru/konditsioner-kalkulyator',
  '/kredit-kalkulyator',
  '/ru/kredit-kalkulyator',
  '/cyr/kredit-kalkulyator',
  '/kredit-limit-kalkulyator',
  '/ru/kredit-limit-kalkulyator',
  '/maktab-kalkulyator',
  '/ru/maktab-kalkulyator',
  '/marosim-kalkulyator',
  '/ru/marosim-kalkulyator',
  '/maxfiylik',
  '/mehnat-shartnomasi-namunasi',
  '/ru/mehnat-shartnomasi-namunasi',
  '/moddiy-yordam-arizasi-namunasi',
  '/ru/moddiy-yordam-arizasi-namunasi',
  '/tolov-hisobi-namunasi',
  '/ru/tolov-hisobi-namunasi',
  '/oila-byudjet-kalkulyator',
  '/ru/oila-byudjet-kalkulyator',
  '/omonat-kalkulyator',
  '/ru/omonat-kalkulyator',
  '/oquv-tatili-arizasi-namunasi',
  '/ru/oquv-tatili-arizasi-namunasi',
  '/oylik-soliq-kalkulyator',
  '/ru/oylik-soliq-kalkulyator',
  '/pensiya-kalkulyator',
  '/ru/pensiya-kalkulyator',
  '/qqs-2026',
  '/qqs-kalkulyator',
  '/ru/qqs-kalkulyator',
  '/qurilish-pudrat-shartnomasi-namunasi',
  '/quyosh-panel-kalkulyator',
  '/ru/quyosh-panel-kalkulyator',
  '/remont-kalkulyator',
  '/ru/remont-kalkulyator',
  '/shablonlar',
  '/shartlar',
  '/staj-kalkulyator',
  '/ru/staj-kalkulyator',
  '/talabnoma-namunasi',
  '/ru/talabnoma-namunasi',
  '/tatil-arizasi-namunasi',
  '/ru/tatil-arizasi-namunasi',
  '/tatil-puli-kalkulyator',
  '/ru/tatil-puli-kalkulyator',
  '/tavsifnoma-namunasi',
  '/tilxat-namunasi',
  '/ru/tilxat-namunasi',
  '/tom-kalkulyator',
  '/ru/tom-kalkulyator',
  '/topshirish-qabul-dalolatnomasi-namunasi',
  '/tushuntirish-xati-namunasi',
  '/toy-byudjeti-2026',
  '/toy-kalkulyator',
  '/ru/toy-kalkulyator',
  '/universitet-kontrakt-kalkulyator',
  '/ru/universitet-kontrakt-kalkulyator',
  '/uy-oldi-sotdi-shartnomasi',
  '/uy-qurish-kalkulyator',
  '/ru/uy-qurish-kalkulyator',
  '/xizmat-korsatish-shartnomasi-namunasi',
  '/yer-konvertor',
  '/ru/yer-konvertor',
  '/yhxx-jarima-kalkulyator',
  '/ru/yhxx-jarima-kalkulyator',
  '/yoqilgi-kalkulyator',
  '/ru/yoqilgi-kalkulyator',
  '/zakot-qurbonlik-kalkulyator',
  '/ru/zakot-qurbonlik-kalkulyator',
  '/ru/avto-oldi-sotdi-shartnomasi-namunasi',
  '/ru/davo-arizasi-namunasi',
  '/ru/kafolat-xati-namunasi',
  '/ru/qurilish-pudrat-shartnomasi-namunasi',
  '/ru/tavsifnoma-namunasi',
  '/ru/topshirish-qabul-dalolatnomasi-namunasi',
  '/ru/tushuntirish-xati-namunasi',
  '/ru/uy-oldi-sotdi-shartnomasi',
  '/ru/xizmat-korsatish-shartnomasi-namunasi',
  '/ru/biz-haqimizda',
  '/ru/blog',
  '/ru/hamkorlik',
  '/ru/maxfiylik',
  '/ru/shablonlar',
  '/ru/shartlar'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC)
      // cache:'reload' — brauzer HTTP keshini aylanib o'tadi (Cloudflare statik fayllarni 4 soat beradi;
      // aks holda yangi versiyaning keshiga eski nusxa tushib qoladi)
      // c.add() o'rniga fetch+put: yo'naltirilgan javob ham "toza" holda saqlansin
      .then((c) => Promise.allSettled(ASSETS.map((u) =>
        fetch(new Request(u, { cache: 'reload' })).then((r) => {
          if (!r.ok) throw new Error(u + ' ' + r.status);
          return c.put(u, unredirect(r));
        }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => KEEP.indexOf(k) === -1).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Faqat 200 (ok) va yo'naltirilmagan javob keshlanadi: noma'lum manzilning 404 sahifasi (404.html)
   hech qachon keshga tushmaydi va precache ro'yxatida ham YO'Q. */
function cacheable(r) { return r && r.ok && !r.redirected; }

/* Navigatsiyaga redirected:true javob BERILMAYDI: Safari (ayniqsa bosh ekrandan
   ochilgan standalone ilova) va Chrome uni rad etadi — sahifa o'rniga bo'sh/qora
   ekran. Bunday javob tanasi va sarlavhalari bilan yangi Response'ga o'raladi. */
function unredirect(r) {
  if (!r || !r.redirected) return r;
  return r.blob().then((b) => new Response(b, { status: r.status, statusText: r.statusText, headers: r.headers }));
}

/* Hech narsa topilmasa ham navigatsiyaga HTML qaytadi: Response.error() iOS
   standalone'da qora ekran bo'lib ko'rinadi (brauzer xato sahifasi yo'q). */
function lastResort() {
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Kalki.uz</title><body style="font:16px system-ui,sans-serif;background:#F1F2EE;color:#16211C;padding:40px 20px;text-align:center">'
    + '<p>Internet aloqasi yo\'q. / Нет подключения к интернету.</p>'
    + '<p><button onclick="location.reload()" style="font:inherit;padding:10px 18px">Qayta urinish / Повторить</button></p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function isAsset(p) { return /^\/assets\/.*\.(js|css)$/.test(p); }
function isImage(p) { return /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf)$/.test(p); }

/* network-first: kontent va tuzatilgan buglar darhol yetib borsin */
function networkFirst(req, cacheName, fallbackPath) {
  return fetch(req, { cache: 'no-cache' }).then((r) => {
    if (cacheable(r)) { const cl = r.clone(); caches.open(cacheName).then((c) => c.put(req, cl)); }
    return r;
  }).catch(() => caches.match(req).then((m) => {
    if (m) return m;
    if (fallbackPath) return caches.match(fallbackPath);
    return Response.error();      // undefined qaytarilmasin
  }));
}

/* stale-while-revalidate: tez ochiladi, fonda albatta yangilanadi */
function staleWhileRevalidate(req, cacheName) {
  return caches.match(req).then((cached) => {
    const net = fetch(req, { cache: 'no-cache' }).then((r) => {   // HTTP keshni tekshirib (ETag) oladi
      if (cacheable(r)) { const cl = r.clone(); caches.open(cacheName).then((c) => c.put(req, cl)); }
      return r;
    }).catch(() => cached || Response.error());
    return cached || net;
  });
}

/* cache-first: o'zgarmaydigan resurslar (rasm, og, shrift) */
function cacheFirst(req, cacheName) {
  return caches.match(req).then((cached) => {
    if (cached) return cached;
    return fetch(req).then((r) => {
      if (cacheable(r)) { const cl = r.clone(); caches.open(cacheName).then((c) => c.put(req, cl)); }
      return r;
    }).catch(() => Response.error());
  });
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Manrope shrifti (Google Fonts): CSS ham, fayllar ham keshlanadi — oflaynda ham bir xil ko'rinish.
  // Boshqa tashqi domenlar (GA, AdSense) umuman ushlanmaydi: keshlash statistikani buzadi.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(RUNTIME).then((c) => c.match(e.request).then((m) => {
      const net = fetch(e.request).then((r) => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => m || Response.error());
      return m || net;
    })));
    return;
  }
  if (url.origin !== self.location.origin) return;

  const p = url.pathname;

  // APK va versiya.json (/ilova/): HECH QACHON keshlanmaydi (katta fayl; versiya tekshiruvi har doim yangi bo'lsin) — brauzer to'g'ridan-to'g'ri tarmoqdan oladi.
  if (/^\/ilova\/.+\.(apk|json)$/i.test(p)) return;

  // HTML sahifalar — network-first, oflaynda keshdan.
  //
  // Oxirgi chora ILGARI '/' edi: odam so'ragan sahifa o'rniga bosh sahifani
  // ko'rar va nima bo'lganini tushunmasdi ("bosdim, boshqa joyga tushdim").
  // Endi aniq oflayn sahifasi qaytariladi — u tarmoq yo'qligini aytadi va
  // "Qayta urinish" tugmasini beradi.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((r) => {
        if (cacheable(r)) { const cl = r.clone(); caches.open(STATIC).then((c) => c.put(p, cl)); }
        return unredirect(r);
      }).catch(() => caches.match(p)
        .then((m) => m || caches.match(OFFLINE))
        .then((m) => (m ? unredirect(m) : lastResort())))   // undefined/Response.error() qaytarilmasin
    );
    return;
  }

  // Hamkor ro'yxati — network-first. Yangilanish barcha sahifalarda darhol
  // ko'rinishi kerak; keshdan berilsa muddati tugagan taklif qolib ketardi.
  if (p.indexOf('/assets/partners.json') === 0) {
    e.respondWith(networkFirst(e.request, STATIC));
    return;
  }

  // assets/*.js va *.css — stale-while-revalidate
  if (isAsset(p)) {
    e.respondWith(staleWhileRevalidate(e.request, STATIC));
    return;
  }

  // Rasm, og:image, shrift — cache-first
  if (isImage(p)) {
    e.respondWith(cacheFirst(e.request, RUNTIME));
    return;
  }

  e.respondWith(staleWhileRevalidate(e.request, RUNTIME));
});

/* ---- «Baliq kuni» va «Haftalik xulosa» eslatmalari (Web Push). Har biri haftada 1 ta; server: tools/push-yubor.js. Xabar: { t, b, u, tag } ---- */
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = {}; }
  const u = typeof d.u === 'string' && d.u.charAt(0) === '/' ? d.u : '/kalkifit';
  e.waitUntil(self.registration.showNotification(String(d.t || 'KalkiFit').slice(0, 60), { body: String(d.b || '').slice(0, 200), icon: '/assets/icons/kalkifit-192.png', badge: '/assets/icons/kalkifit-192.png', tag: String(d.tag || 'baliq-kuni'), data: { u } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close(); const u = (e.notification.data && e.notification.data.u) || '/kalkifit';
  e.waitUntil((async () => {
    const k = /[?&]hafta=1\b/.test(u) ? 'hafta' : 'baliq';          // «Haftangiz xulosasi tayyor» yoki «Baliq kuni»
    try { const c = await caches.open(PENDING); await c.put('/__pending/' + k, new Response(String(Date.now()))); } catch (_) { /* kesh yo'q — manzil parametri yetarli */ }
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) { if (/\/kalkifit/.test(c.url) && 'focus' in c) { await c.focus(); try { c.postMessage({ t: k }); } catch (_) { /* ilova keshdagi belgini o'zi o'qiydi */ } return; } }
    await self.clients.openWindow(u);
  })());
});
