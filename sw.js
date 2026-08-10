/* kalki.uz — service worker.
 *
 * VERSIYA QO'LDA YOZILMAYDI. Quyidagi qator tools/sw-version.js tomonidan
 * assets/ papkasi mazmunining hash'idan yoziladi (npm run ship / prerender).
 * Qo'lda oshiriladigan raqam ertami-kechmi unutiladi va shunda foydalanuvchi
 * brauzerida eski kod muzlab qoladi.
 */
const SW_VERSION = '6771dc53';   /* sw-version:auto */

const STATIC = 'kalki-static-' + SW_VERSION;    // HTML qobiq + assets
const RUNTIME = 'kalki-runtime-' + SW_VERSION;  // rasm, og, boshqa
const KEEP = [STATIC, RUNTIME];

/* Precache — birinchi ochishda oflayn ishlashi uchun. Ro'yxatdagi har bir
   yo'l haqiqatan mavjudligini tools/verify-sw.js tekshiradi. */
const ASSETS = [
  '/',
  '/assets/docgen.js',
  '/assets/lang.js',
  '/assets/datanote.js',
  '/assets/tgcta.js',
  '/assets/sw-boot.js',
  '/assets/partners.js',
  '/favicon.svg',
  '/manifest.json',
  '/ga.js',
  '/alkogol-kalkulyator',
  '/ariza-namunasi',
  '/avto-bojxona-2026',
  '/avto-oldi-sotdi-shartnomasi-namunasi',
  '/avto-xarajat-kalkulyator',
  '/beton-kalkulyator',
  '/biz-haqimizda',
  '/blog',
  '/bojxona-kalkulyator',
  '/bola-puli-kalkulyator',
  '/bolalar-nafaqasi-2026',
  '/chorva-kalkulyator',
  '/davo-arizasi-namunasi',
  '/dtm-2026',
  '/dtm-kalkulyator',
  '/elektr-xarajat-kalkulyator',
  '/gisht-kalkulyator',
  '/hamkorlik',
  '/homiladorlik-kalkulyator',
  '/hujjatlar',
  '/ijara-shartnomasi-namunasi',
  '/ipoteka-2026',
  '/ipoteka-kalkulyator',
  '/ishdan-boshash-arizasi-namunasi',
  '/ishonchnoma-namunasi',
  '/kaloriya-kalkulyator',
  '/konditsioner-kalkulyator',
  '/kredit-kalkulyator',
  '/maktab-kalkulyator',
  '/marosim-kalkulyator',
  '/maxfiylik',
  '/mehnat-shartnomasi-namunasi',
  '/oila-byudjet-kalkulyator',
  '/omonat-kalkulyator',
  '/oylik-soliq-kalkulyator',
  '/pensiya-kalkulyator',
  '/qqs-2026',
  '/qqs-kalkulyator',
  '/quyosh-panel-kalkulyator',
  '/remont-kalkulyator',
  '/shablonlar',
  '/shartlar',
  '/tavsifnoma-namunasi',
  '/tilxat-namunasi',
  '/tom-kalkulyator',
  '/topshirish-qabul-dalolatnomasi-namunasi',
  '/toy-byudjeti-2026',
  '/toy-kalkulyator',
  '/universitet-kontrakt-kalkulyator',
  '/uy-qurish-kalkulyator',
  '/xizmat-korsatish-shartnomasi-namunasi',
  '/yer-konvertor',
  '/yoqilgi-kalkulyator',
  '/zakot-qurbonlik-kalkulyator'
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

  // HTML sahifalar — network-first, oflaynda keshdan, oxirgi chora sifatida '/'
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((r) => {
        if (cacheable(r)) { const cl = r.clone(); caches.open(STATIC).then((c) => c.put(p, cl)); }
        return r;
      }).catch(() => caches.match(p).then((m) => m || caches.match('/')))
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
