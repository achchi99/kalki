/* kalki.uz — jsdom render harness (build va tekshiruv vositasi).
 *
 * Sahifani haqiqiy DOM'da ishga tushiradi. Resurslar tarmoqdan emas, DISKDAN
 * olinadi; ga.js va googletagmanager BLOKLANADI — prerender natijasiga GA tegi
 * tushmasligi kerak (ilgari shu sababdan 216 ta ortiqcha teg to'plangan).
 *
 * Talab: npm i jsdom
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole, requestInterceptor } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://kalki.uz/';
const BLOCK = [/\/ga\.js(\?|$)/, /googletagmanager/, /html2canvas/, /jspdf/, /docx\.umd/];

const MIME = {
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const serveLocal = requestInterceptor((request) => {
  const url = request.url;
  if (BLOCK.some((re) => re.test(url))) {
    return new Response('', { headers: { 'Content-Type': 'text/javascript' } });
  }
  if (!url.startsWith(ORIGIN)) return new Response('', { status: 204 });
  const rel = decodeURIComponent(url.slice(ORIGIN.length).split(/[?#]/)[0]);
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) return new Response('', { status: 403 });
  try {
    const body = fs.readFileSync(file);
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    return new Response(body, { headers: { 'Content-Type': type } });
  } catch (e) {
    return new Response('', { status: 404 });
  }
});

/* jsdom'da window.fetch va IntersectionObserver yo'q, brauzerda bor.
   Hamkor blokining haqiqiy yo'li sinalishi uchun shim qo'yamiz — bu faqat
   build vositasida, sayt kodiga hech narsa qo'shilmaydi. */
function installShims(dom, { ioAuto = true } = {}) {
  const w = dom.window;
  if (typeof w.fetch !== 'function') {
    w.fetch = function (url) {
      return new Promise((res, rej) => {
        try {
          const rel = String(url).replace(/^https?:\/\/[^/]+\//, '').split(/[?#]/)[0];
          const body = fs.readFileSync(path.join(ROOT, rel), 'utf8');
          res({
            ok: true, status: 200,
            json: () => Promise.resolve(JSON.parse(body)),
            text: () => Promise.resolve(body),
          });
        } catch (e) { rej(e); }
      });
    };
  }
  if (typeof w.IntersectionObserver !== 'function') {
    w.IntersectionObserver = function (cb) {
      this.observe = function (el) {
        if (!ioAuto) return;
        w.setTimeout(() => cb([{ target: el, isIntersecting: true, intersectionRatio: 1 }]), 0);
      };
      this.unobserve = function () {};
      this.disconnect = function () {};
    };
  }
}

function load(file, { wait = 950, quiet = true, shims = false, ioAuto = true } = {}) {
  const html = fs.readFileSync(file, 'utf8');
  const vc = new VirtualConsole();
  const errors = [];
  // Tashqi shrift/AdSense yuklanmasligi kutilgan holat — sahifa xatosi emas.
  const EXPECTED = /Could not load (script|link|img).*(fonts\.googleapis|googlesyndication|gstatic)/;
  vc.on('jsdomError', (e) => {
    const m = String((e && e.message) || e);
    if (!EXPECTED.test(m)) errors.push(m);
  });
  if (!quiet) vc.sendTo(console);
  const dom = new JSDOM(html, {
    url: ORIGIN + path.basename(file).replace(/\.html$/, ''),
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    resources: { interceptors: [serveLocal] },
  });
  if (shims) installShims(dom, { ioAuto });
  return new Promise((res) => setTimeout(() => res({ dom, errors }), wait));
}

module.exports = { load, installShims, ROOT, ORIGIN };
