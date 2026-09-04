/* kalki.uz — service worker.
 *
 * VERSIYA QO'LDA YOZILMAYDI. Quyidagi qator tools/sw-version.js tomonidan
 * assets/ papkasi mazmunining hash'idan yoziladi (npm run ship / prerender).
 * Qo'lda oshiriladigan raqam ertami-kechmi unutiladi va shunda foydalanuvchi
 * brauzerida eski kod muzlab qoladi.
 */
const SW_VERSION = '7b87d8cf';   /* sw-version:auto */

const STATIC = 'kalki-static-' + SW_VERSION;    // HTML qobiq + assets
const RUNTIME = 'kalki-runtime-' + SW_VERSION;  // rasm, og, boshqa
const KEEP = [STATIC, RUNTIME];

/* Precache — birinchi ochishda oflayn ishlashi uchun. Ro'yxatdagi har bir
   yo'l haqiqatan mavjudligini tools/verify-sw.js tekshiradi. */
const OFFLINE = '/offline.html';

const ASSETS = [
  '/',
  '/ru/',
  OFFLINE,
  '/assets/docgen.js',
  '/assets/lang.js',
  '/assets/datanote.js',
  '/assets/tgcta.js',
  '/assets/sw-boot.js',
  '/assets/footer-lang.js',
  '/assets/partners.js',
  '/favicon.svg',
  '/manifest.json',
  '/ga.js',
  '/aliment-kalkulyator',
  '/ru/aliment-kalkulyator',
  '/alkogol-kalkulyator',
  '/ru/alkogol-kalkulyator',
  '/ariza-namunasi',
  '/ru/ariza-namunasi',
  '/avto-bojxona-2026',
  '/avto-oldi-sotdi-shartnomasi-namunasi',
  '/avto-xarajat-kalkulyator',
  '/ru/avto-xarajat-kalkulyator',
  '/beton-kalkulyator',
  '/ru/beton-kalkulyator',
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
  '/maktab-kalkulyator',
  '/ru/maktab-kalkulyator',
  '/marosim-kalkulyator',
  '/ru/marosim-kalkulyator',
  '/maxfiylik',
  '/mehnat-shartnomasi-namunasi',
  '/ru/mehnat-shartnomasi-namunasi',
  '/moddiy-yordam-arizasi-namunasi',
  '/ru/moddiy-yordam-arizasi-namunasi',
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
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u))))
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

function cacheable(r) { return r && r.ok && !r.redirected; }

function isAsset(p) { return /^\/assets\/.*\.(js|css)$/.test(p); }
function isImage(p) { return /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf)$/.test(p); }

/* network-first: kontent va tuzatilgan buglar darhol yetib borsin */
function networkFirst(req, cacheName, fallbackPath) {
  return fetch(req).then((r) => {
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
    const net = fetch(req).then((r) => {
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

  // Tashqi domenlar (GA, AdSense, shriftlar) umuman ushlanmaydi:
  // keshlash statistikani buzadi.
  if (url.origin !== self.location.origin) return;

  const p = url.pathname;

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
        return r;
      }).catch(() => caches.match(p)
        .then((m) => m || caches.match(OFFLINE))
        .then((m) => m || Response.error()))   // undefined qaytarilmasin
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
