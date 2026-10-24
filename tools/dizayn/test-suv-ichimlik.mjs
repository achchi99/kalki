// KalkiFit v24: ichimlik va suyuq taomlar kunlik SUV hisobiga (data/suv-ulush.json: id → 0…1; hisoblanadi, saqlanmaydi):
//  jadval (choy/qahva/sharbat/sut/ayron… 1.0; sho'rva/mastava/chalop 0.6; pivo/vino 0; qolgani 0), choy 250 ml → +250, sho'rva 300 g → +180, pivo → 0,
//  yozuvni o'chirish → suv kamayadi, porsiya o'zgarishi → suv yangilanadi, qo'lda «+250 ml» alohida, eski kunlar o'zgarmaydi (suvFrom), rasm/AI yozuvi (nomi bo'yicha),
//  karta: umumiy son + «Suv N · Ichimliklar M», bosilsa ro'yxat + izoh (UZ/ЎЗ/RU), birinchi ichimlikka yengil hazil-maslahat.   node tools/dizayn/test-suv-ichimlik.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const TODAY = D.today(), YEST = D.addDays(TODAY, -1);
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/suv-ulush.json'), 'utf8')), FOODS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods, HZ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/hazillar.json'), 'utf8'));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. jadval */
{ const by = Object.fromEntries(FOODS.map((f) => [f.i, f])), u = J.ulush;
  for (const id of Object.keys(u)) assert.ok(by[id], 'bazada yo\'q: ' + id); for (const v of Object.values(u)) assert.ok(v >= 0 && v <= 1);
  for (const id of ['suv', 'choy', 'kofe', 'latte', 'kapuchino', 'espresso', 'kompot', 'sharbat-olma', 'sharbat-apelsin', 'nektar-mango', 'limonad', 'kola', 'coca-cola', 'energetik', 'red-bull', 'ayron', 'qatiq', 'kefir', 'sut', 'kakao', 'kvas', 'protein-kokteyl-tayyor', 'tr-choy', 'tr-qahva', 'kokos-suvi', 'yashil-choy']) assert.equal(u[id], 1, id + ' → 1.0');
  for (const id of ['shurva', 'mastava', 'moshxorda', 'chalop', 'mampar', 'unash', 'qaynatma-baliq', 'tovuq-shurva', 'borsch', 'kesma', 'tr-mercimek']) assert.equal(u[id], 0.6, id + ' → 0.6');
  for (const id of ['pivo', 'vino']) assert.equal(u[id], 0, id + ' → 0 (spirtli)'); for (const id of ['osh', 'non', 'somsa', 'kabob', 'tuxum', 'olma', 'yogurt-tabiiy', 'smetana', 'protein-kukun', 'lagmon']) assert.ok(!u[id], id + ' → 0 (jadvalda yo\'q)');
  const ich = FOODS.filter((f) => f.t === 'i' && f.i !== 'pivo' && f.i !== 'vino' && !f.al); for (const f of ich) assert.equal(u[f.i], 1, 'barcha ichimliklar 1.0: ' + f.i);
  for (const f of FOODS) if (f.al && u[f.al.f] != null) assert.equal(u[f.i], u[f.al.f], 'alias ' + f.i);
  log('Jadval data/suv-ulush.json: ' + Object.keys(u).length + ' yozuv — suv/choy/qahva/kompot/sharbat/nektar/limonad/gazli/energetik/ayron/qatiq/kefir/sut/kakao/kvas/protein kokteyl 1.0; sho\'rva/mastava/chalop/mampar… 0.6; pivo/vino 0; qolgani yo\'q (=0)'); }
/* 2. hisob (core) */
const mk = (o = {}) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = Object.assign({ suvFrom: TODAY, tipsDone: true }, o.prefs || {}); st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 80); return st; };
const add = (st, e, d = TODAY) => S.addFood(st, d, Object.assign({ meal: 'l', unit: 'g100', qty: 1, kcal: 10, p: 0, f: 0, c: 0, est: false, ts: 1 }, e));
{ let st = mk(); const c = add(st, { fid: 'choy', unit: 'piyola', qty: 1, g: 250 }); assert.deepEqual([S.waterInfo(st, TODAY).drink, S.waterInfo(st, TODAY).ml], [250, 250], 'choy 250 ml → suv +250');
  const sh = add(st, { fid: 'shurva', unit: 'kosa', qty: 1, g: 300 }); assert.equal(S.waterInfo(st, TODAY).drink, 430, 'sho\'rva 300 g → +180');
  const pv = add(st, { fid: 'pivo', g: 330 }); assert.equal(S.waterInfo(st, TODAY).drink, 430, 'pivo → 0'); const os = add(st, { fid: 'osh', g: 350 }); assert.equal(S.waterInfo(st, TODAY).drink, 430, 'osh → 0');
  S.setWater(st, TODAY, 2); let w = S.waterInfo(st, TODAY); assert.deepEqual([w.manual, w.drink, w.ml, w.glasses], [500, 430, 930, 3], 'qo\'lda +250 ml alohida (2 stakan = 500) + ichimliklar');
  S.removeFood(st, TODAY, sh.id); assert.equal(S.waterInfo(st, TODAY).drink, 250, 'yozuv o\'chirildi → suv kamaydi'); S.removeFood(st, TODAY, c.id); assert.equal(S.waterInfo(st, TODAY).ml, 500, 'faqat qo\'lda qoldi');
  const ch2 = add(st, { fid: 'choy', unit: 'piyola', qty: 1, g: 200 }); assert.equal(S.waterInfo(st, TODAY).drink, 200); ch2.qty = 2; ch2.g = 400; assert.equal(S.waterInfo(st, TODAY).drink, 400, 'porsiya o\'zgardi → suv yangilandi');
  add(st, { fid: 'choy', g: 250 }, YEST); assert.equal(S.waterInfo(st, YEST).drink, 0, 'eski kun (suvFrom dan oldin) o\'zgarmaydi'); st.prefs.suvFrom = undefined; assert.equal(S.waterInfo(st, TODAY).drink, 0, 'suvFrom yo\'q — hisoblanmaydi');
  st.prefs.suvFrom = TODAY; const ai = add(st, { fid: null, name: 'Choy (1 piyola)', g: 250 }); assert.equal(S.waterInfo(st, TODAY).drink, 400, 'sfid yo\'q yozuv — ilova nomi bo\'yicha topgunicha 0'); ai.sfid = 'choy'; assert.equal(S.waterInfo(st, TODAY).drink, 650, 'sfid (rasm/AI/retsept yozuvi) → hisoblanadi');
  const vf = add(st, { fid: 'sut', unit: 'stakan', qty: 1, g: 250, vr: 'x' }); assert.equal(S.waterInfo(st, TODAY).items.length, 3); assert.ok(S.waterInfo(st, TODAY).items.every((i) => i.ml > 0));
  log('Hisob: choy 250 ml → +250; sho\'rva 300 g → +180; pivo/osh → 0; qo\'lda stakan alohida; o\'chirsa kamayadi; porsiya o\'zgarsa yangilanadi; eski kunlar va suvFrom yo\'q holat → o\'zgarmaydi; rasm/AI yozuvi (sfid) hisoblanadi'); }
/* 3. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
async function open(state, { url = '/kalkifit', w = 360, hour = 15 } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1');
    const R = Date; const off = new R(new R().setHours(x.hour, 5, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } catch (e) {} }, { st: state, hour });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').replace(/ /g, ' ').trim() : null; };
const num = (s) => +String(s).replace(/\D/g, '');
const wml = async (p) => num((await txt(p, '#wTxt b')));
const addFood = async (p, q) => { await p.click('#mainAdd').then(() => p.click('#rzSheet #fdQ')); await p.waitForTimeout(400); await p.fill('#fdQ', q); await p.waitForTimeout(300); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForTimeout(300); await p.click('#fsave'); await p.waitForTimeout(900); };
try {
  const st0 = () => { const st = mk({ prefs: { suvFrom: undefined, jokes: true } }); delete st.prefs.suvFrom; return st; };
  let p = await open(st0()); assert.equal(await wml(p), 0); assert.equal(await p.locator('#wSplit').count(), 0, 'ichimlik yo\'q — qator yo\'q'); assert.ok((await p.evaluate(() => window.__kalkifit.state.prefs.suvFrom)) === TODAY, 'suvFrom bugun qo\'yildi');
  await addFood(p, 'choy'); const jl = await txt(p, '#jLine'); const w1 = await wml(p);          // birinchi ichimlik hazili — ovqatdan keyingi 4 s'lik pufakda assert.ok(w1 >= 150 && w1 <= 300, 'choy qo\'shildi → suv kartasida son ko\'paydi: ' + w1); const ent = await p.evaluate(() => { const x = window.__kalkifit.state.days[Object.keys(window.__kalkifit.state.days).pop()]; return x.food[0]; }); assert.equal(w1, Math.round(ent.g), 'karta = yozuv ml (' + ent.g + ')');
  assert.match(await txt(p, '#wSplit'), new RegExp('^Suv 0 · Ichimliklar ' + String(w1).replace(/(\d)(?=(\d{3})+$)/, '$1 ') + '$')); 
  /* qo'lda +250 */
  await p.click('.sl-w [data-act=wadd]'); await p.waitForTimeout(500); assert.equal(await wml(p), w1 + 250, 'qo\'lda +250 avvalgidek alohida'); assert.match(await txt(p, '#wSplit'), /^Suv 250 · Ichimliklar /);
  /* karta → ro'yxat + izoh */
  await p.click('.sl-w [data-act=wopen]'); await p.waitForSelector('#wList'); const sh = await txt(p, '#rzSheet'); assert.match(sh, /Ichimliklar va suyuq taomlar/); assert.match(sh, /Choy/); assert.match(sh, new RegExp(String(w1).replace(/(\d)(?=(\d{3})+$)/, '$1 ') + ' ml')); assert.match(sh, /Choy, qahva, sut va sharbat ham suv hisobiga kiradi\./); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  /* birinchi ichimlikka hazil */
  assert.ok(jl && HZ.items.filter((x) => x.holat === 'ichimlik_suvga_qoshildi').some((x) => x.uz === jl), 'birinchi ichimlikka yengil hazil-maslahat: ' + jl); assert.equal(await p.evaluate(() => window.__kalkifit.state.prefs.suvIntro), 1);
  await addFood(p, 'kefir'); assert.equal(await p.evaluate(() => window.__kalkifit.state.prefs.suvIntro), 1, 'bir marta (suvIntro) — qayta chiqmaydi');
  /* yozuvni o'chirish → suv kamayadi; porsiya o'zgarishi → suv yangilanadi */
  const before = await wml(p); await p.click('.sl-meal .sl-row >> nth=0'); await p.waitForSelector('[data-act=fdel]'); await p.click('[data-act=fdel]'); await p.waitForTimeout(700); const delConfirm = p.locator('[data-act=fdelok], #fdDelOk'); if (await delConfirm.count()) await delConfirm.first().click(); await p.waitForTimeout(700); const afterDel = await wml(p); assert.ok(afterDel < before, 'yozuv o\'chirilgach suv kamaydi: ' + before + ' → ' + afterDel);
  const bef2 = afterDel; await p.click('.sl-meal .sl-row >> nth=0'); await p.waitForSelector('[data-act=pwq], #fdQty, .sl-pw'); const qv = p.locator('[data-act=pwq]'); if (await qv.count() > 1) { await qv.last().click(); await p.waitForTimeout(300); } await p.click('#fsave, [data-act=pwsave]').catch(() => {}); await p.waitForTimeout(900);
  const aft2 = await wml(p); assert.notEqual(aft2, bef2, 'porsiya o\'zgardi → suv yangilandi: ' + bef2 + ' → ' + aft2); assert.deepEqual(p.errs, []); await p.context().close();
  log('Brauzer: choy yozildi → karta (= yozuv ml) + «Suv 0 · Ichimliklar N»; qo\'lda +250 alohida; karta → ro\'yxat «Choy … N ml» + izoh; birinchi ichimlikka hazil-maslahat (ikkinchisiga yo\'q); yozuv o\'chirilsa suv kamayadi; porsiya o\'zgarsa yangilanadi');
  /* sho'rva va pivo (qidiruv orqali) */
  p = await open(st0()); await addFood(p, 'sho\'rva'); const ws = await wml(p); const e2 = await p.evaluate(() => { const x = window.__kalkifit.state.days[Object.keys(window.__kalkifit.state.days).pop()]; return x.food[0]; }); assert.equal(ws, Math.round(e2.g * 0.6), 'sho\'rva — porsiya grammining 60%: ' + e2.g + ' g → ' + ws); await p.context().close();
  p = await open(st0()); await addFood(p, 'pivo'); assert.equal(await wml(p), 0, 'pivo — suv hisobiga kirmaydi'); assert.equal(await p.locator('#wSplit').count(), 0); await p.context().close();
  log('Qidiruv orqali: sho\'rva → porsiya grammining 60% i suv hisobiga; pivo → 0 (hisobga kirmaydi)');
  /* rasm/AI yozuvi: nomi bo'yicha */
  { const st = st0(); S.addFood(st, TODAY, { fid: null, name: 'Choy (1 piyola)', g: 250, kcal: 30, est: true, meal: 'b', ts: 1 }); S.addFood(st, TODAY, { fid: null, name: 'Palov (1 likopcha)', g: 300, kcal: 500, est: true, meal: 'l', ts: 2 }); p = await open(st); assert.equal(await wml(p), 250, 'AI/rasm yozuvi «Choy (…)» → bazadagi choy bo\'yicha suvga'); assert.equal(await p.evaluate(() => window.__kalkifit.state.days[Object.keys(window.__kalkifit.state.days).pop()].food.map((e) => e.sfid).join('|')), 'choy|'); await p.context().close(); }
  /* eski kun o'zgarmaydi */
  { const st = st0(); S.addFood(st, YEST, { fid: 'choy', unit: 'piyola', qty: 1, g: 250, kcal: 2, meal: 'b', ts: 1 }); p = await open(st); assert.equal(await p.evaluate((y) => window.__kalkifit.S.waterInfo(window.__kalkifit.state, y).drink, YEST), 0, 'kecha yozilgan choy — suvga qo\'shilmaydi (yangi qoida bugundan)'); await p.context().close(); }
  log('Rasm/AI yozuvi («Choy (1 piyola)») nomi bo\'yicha baza taomiga mos keladi va suvga qo\'shiladi (sfid); kechagi kun o\'zgarmaydi (suvFrom = bugun)');
  /* uch til izohi + sig'ish */
  const st1 = st0(); S.addFood(st1, TODAY, { fid: 'choy', unit: 'piyola', qty: 2, g: 500, kcal: 4, meal: 'b', ts: 1 });
  for (const [url, ex] of [['/kalkifit', /Choy, qahva, sut va sharbat ham suv hisobiga kiradi\./], ['/ru/kalkifit', /Чай, кофе, молоко и сок тоже входят в дневной счёт воды\./], ['/kalkifit?lang=cyr', /Чой, қаҳва, сут ва шарбат ҳам сув ҳисобига киради\./]]) {
    p = await open(st1, { url }); await p.click('.sl-w [data-act=wopen]'); await p.waitForSelector('#wList'); const t = await txt(p, '#rzSheet'); assert.match(t, ex, url); if (url === '/ru/kalkifit') assert.match(await txt(p, '#wSplit') || (await p.keyboard.press('Escape'), await p.waitForTimeout(300), await txt(p, '#wSplit')), /^Вода 0 · Напитки 500$/);
    await p.context().close(); }
  p = await open(st1, { w: 360 }); await p.evaluate(() => document.documentElement.classList.add('fs-big')); await p.waitForTimeout(400); const fit = await p.evaluate(() => { const c = document.getElementById('wCard').getBoundingClientRect(), s = document.getElementById('wSplit').getBoundingClientRect(); return { ok: s.right <= c.right + 0.5 && s.left >= c.left - 0.5, sw: document.documentElement.scrollWidth <= innerWidth }; }); assert.ok(fit.ok && fit.sw, '«Suv N · Ichimliklar M» qatori 360 px katta shriftda kartaga sig\'adi'); await p.context().close();
  log('Karta izohi UZ/ЎЗ/RU («Choy, qahva, sut va sharbat ham suv hisobiga kiradi.» / RU / ЎЗ translit), RU «Вода 0 · Напитки 500»; 360 px katta shriftda qator kartaga sig\'adi');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
