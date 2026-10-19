import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const b = track(await chromium.launch());
const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = { tipsDone: true, jokes: false }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80);
for (const dark of [false]) {
const c = await b.newContext({ viewport: { width: 360, height: 700 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light' }); await c.addInitScript((s) => { localStorage.setItem('kalki_fit', JSON.stringify(s)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); }, st);
const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/hisob', (r) => r.fulfill({ status: 204, body: '' }));
await p.goto('http://localhost:' + srv.address().port + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
const sh = async (n) => { await p.waitForTimeout(450); await p.screenshot({ path: '/tmp/claude-1000/-home-asror-projects-kalki/f37a65f9-62d3-59dc-9906-9015ae13b0de/scratchpad/' + n + '.png' }); };
await p.evaluate(() => window.scrollTo(0, 0)); await sh('1-bugun');
await p.click('[data-act=yechip][data-c=kabob]'); await sh('2-yeymiz'); await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(400);
await p.click('[data-act=yechip][data-c=baliq]'); await sh('3-baliq'); await p.click('[data-act=fw1]'); await sh('4-buyurtma'); await p.click('[data-act=fwback]'); await p.click('[data-act=fw2]'); await sh('5-kafe'); await p.click('[data-act=fwback]'); await p.click('[data-act=fw3]'); await p.click('[data-act=fwrec][data-id=duxovka]'); await sh('6-retsept'); await p.click('[data-act=fw3]'); await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(400);
await p.click('#mainAdd'); await p.waitForTimeout(400); await p.fill('#fdQ', 'osh'); await p.waitForTimeout(300); await p.click('[data-act=pickfood] >> nth=0'); await sh('7-orniga'); await p.click('[data-act=yevopen]'); await sh('8-variantlar');
await c.close(); }
await b.close(); srv.close();
