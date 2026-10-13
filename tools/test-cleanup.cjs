/* Testlar ochgan jarayonlarni (Chromium, wrangler pages dev, boshqa bolalar) HAR HOLDA yopadi:
 * assert/xato (uncaughtException, unhandledRejection), Ctrl+C va `timeout` (SIGINT/SIGTERM/SIGHUP).
 * Oddiy tugash — skriptning o'zidagi browser.close() (bu yerda faqat zaxira).
 *
 *   const { track } = require('./test-cleanup.cjs');             // ESM: import { track } from '../test-cleanup.cjs';
 *   const browser = track(await chromium.launch());               // close() yoki kill() bor har qanday obyekt
 *   const wr = track(spawn('npx', ['wrangler', 'pages', 'dev', ...]));   // ChildProcess -> SIGKILL
 *
 * QOIDA (CLAUDE.md): bir vaqtda faqat BITTA wrangler pages dev; test oldidan
 * `pgrep -fa "[w]rangler|[w]orkerd"` bilan eskisi qolmaganini tekshiring. */
'use strict';
const items = [];
let closing = null;

function track(x) { items.push(x); return x; }

function closeAll() {
  if (closing) return closing;
  closing = Promise.all(items.splice(0).reverse().map((x) => {
    const hang = new Promise((r) => setTimeout(r, 5000).unref());   // osilib qolgan close() chiqishni to'smasin
    const done = (async () => {
      try {
        if (typeof x.close === 'function') await x.close();
        else if (typeof x.kill === 'function') x.kill('SIGKILL');
      } catch (e) { /* allaqachon yopilgan */ }
    })();
    return Promise.race([done, hang]);
  }));
  return closing;
}

function leave(code, show) {
  return (e) => {
    if (show && e) console.error(e && e.stack ? e.stack : e);
    closeAll().then(() => process.exit(code), () => process.exit(code));
  };
}
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((s) => process.on(s, leave(130, false)));
process.on('uncaughtException', leave(1, true));
process.on('unhandledRejection', leave(1, true));

module.exports = { track, closeAll };
