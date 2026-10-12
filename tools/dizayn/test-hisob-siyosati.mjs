// hisob-siyosati-generatori (o'z JS'i): eski main bilan yangi nusxaning hujjat matni bir xilligi.
// node tools/dizayn/test-hisob-siyosati.mjs <main-worktree-yo'li>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const OLD = path.resolve(process.argv[2]); const NEW = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const serve = (root) => new Promise((ok) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(root, p), path.join(root, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); }); s.listen(0, () => ok([s, s.address().port])); });
const [s1, p1] = await serve(OLD), [s2, p2] = await serve(NEW);
const b = await chromium.launch(); const EM = /[\u{1F100}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]\s?/gu;
async function run(port, url) {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort());
  await p.goto(`http://localhost:${port}${url}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); const out = {};
  for (const fa of ['savdo', 'ishlab_chiqarish', 'xizmat']) for (const q of ['yoq', 'ha']) {
    await p.locator(`#segFaoliyat button[data-val="${fa}"]`).click(); await p.locator(`#segQqs button[data-val="${q}"]`).click();
    await p.fill('#orgName', 'Namuna MChJ'); await p.fill('#stir', '123456789'); await p.waitForTimeout(250);
    for (const tab of ['#tabBup', '#tabNup']) { await p.locator(tab).click(); await p.waitForTimeout(200);
      out[`${fa}/${q}/${tab}`] = (await p.locator('#docBody').innerText()).replace(EM, '').replace(/\s+/g, ' ').trim(); } }
  out.xato = errs; await c.close(); return out;
}
let bad = 0;
for (const lang of ['uz', 'ru']) {
  const u = (lang === 'ru' ? '/ru/' : '/') + 'hisob-siyosati-generatori'; const a = await run(p1, u), n = await run(p2, u);
  const diffs = Object.keys(a).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(n[k]));
  console.log((diffs.length ? 'FARQ ' : 'OK   ') + 'hisob-siyosati-generatori ' + lang + ' — ' + (Object.keys(a).length - 1) + ' variant, hujjat matni' + (diffs.length ? ': ' + diffs.join(', ') : ' bir xil')); bad += diffs.length;
}
await b.close(); s1.close(); s2.close(); process.exit(bad ? 1 : 0);
