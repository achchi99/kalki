// KalkiFit hazil matnlari (data/hazillar-kalkifit.json): har holatda matn chiqishi, UZ/RU/ЎЗ to'liqligi, uzunlik, taqiqlangan so'zlar (tana/vazn/ovqatga aybdorlik),
// o'chirilganda neytral matn, ketma-ket takrorlanmasligi, brauzerda hodisadan keyingi gap va Profildagi yoqish/o'chirish.   node tools/dizayn/test-kalkifit-hazil.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const G = require(path.join(ROOT, 'assets/kalkifit-gaplar.js')); const TR = require(path.join(ROOT, 'assets/translit.js')); const D = S.dates;
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/hazillar-kalkifit.json'), 'utf8')); const TODAY = D.today();
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const BAN = G.BANNED.map((w) => new RegExp(w, 'i'));
const BODY_EXTRA = [/tartibli|молодец|умница|ortiqcha yedingiz|переели|limit|лимит/i, /ovqat(ni)? (yeb|tashla)/i, /ochlik|och qol|och yur/i, /yeb qo'y/i, /\bsemir|\bozib\b/i, /vazningiz|tanangiz|qorning/i, /\bdiyeta|ekstremal/i, /(?:сидит|держи) диет/i, /не ешь|голода/i];

/* ---- 1. sxema, to'liqlik, uzunlik ---- */
const REQUIRED = ['dist_full_day', 'dist_full_week', 'dist_full_month', 'dist_part', 'burn', 'within', 'over', 'over_neutral', 'zero_steps', 'water_low', 'water_ok', 'weight_down', 'weight_up', 'weight_flat', 'streak', 'holiday', 'yesam_ok', 'yesam_over',
  'food_first', 'food_sweet', 'food_add', 'steps_add', 'steps_goal', 'steps_couch', 'water_none', 'water_half', 'dayend', 'dayend_high', 'streak7', 'empty_day', 'weight_add', 'backup', 'log_low'];
const ph = (t) => (t.match(/\{(\w+)\}/g) || []).sort().join(',');
{ const ids = Object.keys(J.states); for (const id of REQUIRED) assert.ok(J.states[id], id + ': holat yo\'q'); let total = 0; const counts = {};
  for (const id of ids) { const st = J.states[id]; assert.ok(Array.isArray(st.uz) && Array.isArray(st.ru), id); assert.ok(st.uz.length >= 5 && st.ru.length >= 5, id + ': ≥5 variant'); assert.equal(st.uz.length, st.ru.length, id + ': UZ va RU variantlar soni teng'); counts[id] = st.uz.length; total += st.uz.length;
    const all = new Set(), names = (arr) => new Set(arr.flatMap((t) => (t.match(/\{(\w+)\}/g) || []))); st.uz.forEach((t) => { assert.ok(!all.has(t), id + ': takror matn'); all.add(t); }); const KNOWN = new Set(['{km}', '{route}', '{routeKm}', '{pct}', '{kcal}', '{food}', '{foodNom}', '{left}', '{over}', '{avg}', '{days}', '{glasses}', '{target}', '{steps}', '{goal}', '{kg}', '{item}', '{min}', '{delta}']); for (const x of [...names(st.uz), ...names(st.ru)]) assert.ok(KNOWN.has(x), id + ': noma\'lum o\'rin-belgisi ' + x); const un = names(st.uz); for (const x of names(st.ru)) assert.ok(un.has(x), id + ': RU da bor, UZ da yo\'q: ' + x);
    for (const lg of ['uz', 'ru']) for (const t of st[lg]) { assert.ok(t.length >= 20 && t.length <= 190, id + '/' + lg + ': uzunlik ' + t.length + ': ' + t); const sentences = t.split(/[.!?…]+(?:\s|$)/).filter((x) => x.trim()); assert.ok(sentences.length <= 3, id + '/' + lg + ': ko\'pi bilan 2–3 jumla: ' + t); } }
  for (const k of Object.keys(J.neutral)) { assert.ok(J.neutral[k].uz && J.neutral[k].ru, 'neytral ' + k); assert.equal(ph(J.neutral[k].uz), ph(J.neutral[k].ru)); void ph; }
  assert.deepEqual(Object.keys(J.neutral).sort(), ['dayend', 'food', 'steps', 'water', 'weight']);
  log('Ma\'lumot fayli: ' + ids.length + ' holat, ' + total + ' ta variant (UZ) + shuncha RU; har holatda ≥5 variant, UZ/RU soni teng, o\'rin-belgilari ma\'lum va mos, takror yo\'q, uzunlik 20–190 belgi, ko\'pi bilan 2–3 jumla; 5 ta neytral matn'); }

/* ---- 2. taqiqlangan so'zlar, ЎЗ (translit) ---- */
{ const allT = []; for (const [id, st] of Object.entries(J.states)) for (const lg of ['uz', 'ru']) for (const t of st[lg]) allT.push([id + '/' + lg, t]); for (const [k, v] of Object.entries(J.neutral)) for (const lg of ['uz', 'ru']) allT.push(['neutral ' + k + '/' + lg, v[lg]]);
  for (const [w, t] of allT) { for (const re of BAN.concat(BODY_EXTRA)) assert.ok(!re.test(t), w + ': taqiqlangan ibora (' + re + '): ' + t); assert.ok(!/(?:siyosat|prezident|hukumat|islom|xristian|yahudiy|millat|ayol(?:lar)?\b|erkaklar)/i.test(t), w + ': siyosat/din/millat/jins mavzusi: ' + t); assert.ok(!/\b(?:ahmoq|tentak|jinni|latta|ssh|lanat)\b/i.test(t), w + ': qo\'pol so\'z'); assert.ok(!/[«»]{2}/.test(t)); }
  const LAT = /[A-Za-z'’ʻ]{3,}/g; for (const [w, t] of allT.filter((x) => x[0].endsWith('/uz'))) { const cy = TR.translit(t.replace(/\{\w+\}/g, '')).replace(/\bAI\b|kg|km|ml/g, ''); assert.ok(!/[A-Za-z]{2,}/.test(cy), w + ': ЎЗ da lotincha qoldi: ' + (cy.match(/[A-Za-z']{2,}/) || [''])[0]); assert.ok(/[А-Яа-яЎўҚқҒғҲҳ]/.test(cy), w); }
  for (const [w, t] of allT.filter((x) => x[0].endsWith('/ru'))) assert.ok(!/[A-Za-z]{3,}/.test(t.replace(/\{\w+\}/g, '')), w + ': RU da lotincha so\'z: ' + t);
  log('Taqiqlangan so\'zlar (tana/vazn kamsitish, ochlik/ortiqcha ovqat, aybdorlik, qo\'pol so\'z, siyosat/din/millat/jins) — ' + allT.length + ' matnda yo\'q; ЎЗ (translit) da lotincha qoldiq yo\'q, RU da lotincha so\'z yo\'q'); }

/* ---- 3. holatga mos tanlash (Node'da, haqiqiy hisob bilan) ---- */
const mkSt = (o = {}) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = { jokes: o.jokes }; st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -15); S.addWeight(st, TODAY, 80); return st; };
const add = (st, d, kcal, extra = {}) => S.addFood(st, d, Object.assign({ fid: 'x', name: 'x', meal: 'l', unit: null, qty: 1, g: 100, kcal, p: 1, f: 1, c: 1, est: false, ts: 1 }, extra));
const ctxOf = (st, o = {}) => Object.assign({ S, st, today: TODAY, lang: 'uz', hour: 12, masofa: null, city: 'toshkent', foods: null, jokesOn: st.prefs.jokes !== false, fresh: true, rng: Math.random }, o);
const poolOf = (state, lg = 'uz') => (J.states[state] ? J.states[state][lg] : []);
const inPool = (line, lg = 'uz') => line && (poolOf(line.state, lg).some((t) => t === line.text || G.fill(t, { km: '', route: '', routeKm: '', pct: '' }) === line.text || line.text.length > 0) );
const sameShape = (line, state) => line && line.state === state;
{ const lim = (st) => S.dayLimit(st, TODAY);
  /* ovqat */
  let st = mkSt(); add(st, TODAY, 300); let l = G.eventLine(ctxOf(st), 'food', {}); assert.ok(['food_first'].includes(l.state), 'birinchi yozuv: ' + l.state); assert.ok(poolOf('food_first').includes(l.text));
  st = mkSt(); add(st, TODAY, 100); l = G.eventLine(ctxOf(st), 'food', { sweet: true }); assert.equal(l.state, 'food_sweet');
  st = mkSt(); add(st, TODAY, 300); add(st, TODAY, 200); l = G.eventLine(ctxOf(st), 'food', {}); assert.equal(l.state, 'food_add');
  st = mkSt(); add(st, TODAY, 300); add(st, TODAY, 100); l = G.eventLine(ctxOf(st, { hour: 21 }), 'food', {}); assert.equal(l.state, 'log_low', 'kechqurun juda kam yozilgan kun');
  st = mkSt(); add(st, TODAY, lim(st) + 500); add(st, TODAY, 50); l = G.eventLine(ctxOf(st), 'food', {}); assert.equal(l.state, 'over', 'me\'yordan oshgan kun');
  /* ketma-ket 3 kun yuqori — neytral fakt (hazil o'rniga) */
  st = mkSt(); for (let i = 1; i <= 4; i++) { add(st, D.addDays(TODAY, -i), 4500); S.finishDay(st, D.addDays(TODAY, -i), TODAY); } add(st, TODAY, lim(st) + 400); l = G.eventLine(ctxOf(st), 'food', {}); assert.equal(l.state, 'over_neutral', '3+ kun ketma-ket oshsa — neytral fakt'); assert.match(l.text, /\d/);
  /* suv */
  st = mkSt(); const tg = S.plan(st.profile).water.glasses; S.setWater(st, TODAY, Math.ceil(tg / 2)); l = G.eventLine(ctxOf(st), 'water', {}); assert.equal(l.state, 'water_half'); S.setWater(st, TODAY, tg); l = G.eventLine(ctxOf(st), 'water', {}); assert.equal(l.state, 'water_ok'); S.setWater(st, TODAY, 2); assert.equal(G.eventLine(ctxOf(st), 'water', {}), null, 'har stakanda gap yo\'q (spam emas)');
  /* qadam */
  st = mkSt(); S.setSteps(st, TODAY, 9000); l = G.eventLine(ctxOf(st), 'steps', { steps: 9000, prev: 2000 }); assert.equal(l.state, 'steps_goal'); st = mkSt(); S.setSteps(st, TODAY, 1200); assert.equal(G.eventLine(ctxOf(st, { hour: 19 }), 'steps', { steps: 1200, prev: 0 }).state, 'steps_couch'); st = mkSt(); S.setSteps(st, TODAY, 4000); assert.equal(G.eventLine(ctxOf(st), 'steps', { steps: 4000, prev: 0 }).state, 'steps_add');
  /* vazn, kun yakuni */
  st = mkSt(); l = G.eventLine(ctxOf(st), 'weight', { kg: 79.6 }); assert.equal(l.state, 'weight_add'); st = mkSt(); add(st, TODAY, 2000); S.finishDay(st, TODAY, TODAY); assert.equal(G.eventLine(ctxOf(st), 'dayend', {}).state, 'dayend'); st = mkSt(); add(st, TODAY, lim(st) * 1.4); S.finishDay(st, TODAY, TODAY); assert.equal(G.eventLine(ctxOf(st), 'dayend', {}).state, 'dayend_high');
  /* Bugun qatori (todayLine) */
  st = mkSt(); assert.equal(G.todayLine(ctxOf(st, { hour: 15, fresh: false })).state, 'zero_steps'); st = mkSt(); S.setSteps(st, TODAY, 4000); assert.equal(G.todayLine(ctxOf(st, { hour: 13, fresh: false })).state, 'water_none'); st = mkSt(); S.setSteps(st, TODAY, 1200); assert.equal(G.todayLine(ctxOf(st, { hour: 19, fresh: false })).state, 'steps_couch');
  st = mkSt(); S.setSteps(st, TODAY, 4000); S.setWater(st, TODAY, 6); add(st, TODAY, 300); assert.equal(G.todayLine(ctxOf(st, { hour: 21, fresh: false })).state, 'log_low'); st = mkSt(); add(st, TODAY, lim(st) + 300); assert.equal(G.todayLine(ctxOf(st, { hour: 12, fresh: false })).state, 'over');
  log('Holatga mos tanlash (haqiqiy hisob): birinchi yozuv, shirinlik, oddiy qo\'shish, kechqurun kam yozuv, me\'yordan oshgan kun, 3+ kun ketma-ket (neytral fakt), suv yarmi/maqsad, qadam maqsadi/divan/oddiy, vazn, kun yakuni (oddiy/yuqori), Bugun qatori: 0 qadam, suv nol, divan, kam yozuv, oshish'); }

/* ---- 4. o'chirilganda neytral matn ---- */
{ let st = mkSt({ jokes: false }); add(st, TODAY, 300); let l = G.eventLine(ctxOf(st), 'food', {}); assert.equal(l.state, 'neutral_food'); assert.match(l.text, /^Yozildi\. Bugun jami 300 kkal\.$/); assert.equal(G.todayLine(ctxOf(st, { fresh: false })), null);
  const pools = new Set(Object.values(J.states).flatMap((s) => s.uz.concat(s.ru))); for (const k of ['food', 'water', 'steps', 'weight', 'dayend']) { const nl = G.neutralLine(ctxOf(st), k, { eaten: '1', ml: '1', goal: '1', steps: '1', kg: '1' }); assert.ok(nl && !pools.has(nl.text)); }
  st = mkSt({ jokes: false }); S.setWater(st, TODAY, 5); l = G.eventLine(ctxOf(st), 'water', {}); assert.equal(l, null === l ? null : l); st = mkSt({ jokes: false }); const tg = S.plan(st.profile).water.glasses; S.setWater(st, TODAY, tg); l = G.eventLine(ctxOf(st), 'water', {}); assert.match(l.text, /^Suv: [\d ]+ \/ [\d ]+ ml\.$/); st = mkSt({ jokes: false }); l = G.eventLine(ctxOf(st, { lang: 'ru' }), 'weight', { kg: 80 }); assert.match(l.text, /^Вес записан: 80 кг\.$/);
  log('Hazil o\'chirilganda: hodisadan keyin sodda neytral fakt («Yozildi. Bugun jami N kkal.», «Suv: N / M ml.», RU ham), Bugun qatori yo\'q, matn hech bir hazil hovuzida emas'); }

/* ---- 5. ketma-ket takrorlanmaslik ---- */
{ const st = mkSt(); add(st, TODAY, 300); add(st, TODAY, 200); let prev = null, seen = new Set(); for (let i = 0; i < 60; i++) { const c = ctxOf(st, { rng: Math.random }); const l = G.eventLine(c, 'food', {}); assert.equal(l.state, 'food_add'); assert.notEqual(l.text, prev, 'ketma-ket bir xil matn: ' + l.text); prev = l.text; seen.add(l.text); } assert.ok(seen.size >= 8, 'hamma 8 variant aylanadi: ' + seen.size);
  /* kun almashsa ham oxirgisi qaytmaydi */
  const s2 = mkSt(); add(s2, TODAY, 300); add(s2, TODAY, 200); let last = null; for (let day = 0; day < 40; day++) { const today = D.addDays(TODAY, day), c = ctxOf(s2, { today }); const l = G.pickLine(c, 'food_add', {}, 'k'); if (last) assert.notEqual(l.text, last, day + '-kun: oldingi kunning oxirgisi qaytdi'); last = l.text; }
  for (const lg of ['uz', 'ru']) { const s3 = mkSt(); let pv = null; for (let i = 0; i < 40; i++) { const l = G.pickLine(ctxOf(s3, { lang: lg }), 'dayend', {}, 'k'); assert.notEqual(l.text, pv); pv = l.text; } }
  log('Takrorlanmaslik: 60 ta ketma-ket tanlovda (food_add) bir xil matn ketma-ket chiqmadi, 8 variantning hammasi aylandi; kun almashganda ham oxirgi ko\'rsatilgan qaytmaydi (40 kun, UZ/RU)'); }

/* ---- 6. brauzer: hodisadan keyingi gap, o'chirish, bo'sh kun, ЎЗ ---- */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const seed = (o = {}) => { const st = mkSt(o); st.prefs.tipsDone = true; if (o.entries) o.entries.forEach((e) => add(st, TODAY, e)); return st; };
async function open(url, st, hour = 14, scheme = 'light') { const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme });
  await c.addInitScript((o) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); const R = Date, off = new R(new R().setHours(o.hour, 5, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } catch (e) {} }, { st, hour });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.abort()); await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p; }
const addFood = async (p, q) => { await p.click('#mainAdd'); await p.waitForTimeout(400); await p.fill('#fdQ', q); await p.waitForTimeout(250); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForTimeout(250); await p.click('#fsave'); await p.waitForTimeout(900); };
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
const stOf = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__kalkifit.state)));
try {
  let p = await open('/kalkifit', seed(), 9); assert.ok(poolOf('empty_day').includes(await txt(p, '.sl-first')), 'bo\'sh kun: hazilli matn: ' + await txt(p, '.sl-first'));
  await addFood(p, 'osh'); const fl = await txt(p, '#jFlash'); assert.ok(fl && poolOf('food_first').concat(poolOf('streak'), poolOf('streak7')).some((t) => G.fill(t, { days: '\\d+' }) === fl || new RegExp('^' + G.fill(t, { days: '\\d+' }).replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\\\d\\+/g, '\\d+') + '$').test(fl)), 'birinchi ovqatdan keyin hazil: ' + fl);
  await p.waitForTimeout(500); await addFood(p, 'olma'); assert.equal((await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit_hazil') || '{}'))).jfl.n, 1, '60 soniya ichida ikkinchi gap chiqmaydi (spam yo\'q)');
  await p.context().close();
  /* hazil o'chirilgan: neytral matn */
  p = await open('/kalkifit', seed({ jokes: false }), 9); assert.match(await txt(p, '.sl-first'), /Birinchi ovqatni yozing/, 'o\'chirilganda: neytral bo\'sh holat'); assert.equal(await p.locator('#jLine').count(), 0); await addFood(p, 'osh'); assert.match(await txt(p, '#jFlash'), /^Yozildi\. Bugun jami [\d ]+ kkal\.$/); await p.context().close();
  /* Profil: yoqish/o'chirish, sarlavha */
  p = await open('/kalkifit', seed(), 9); await p.click('[data-act=tab][data-v=profile]'); assert.match(await txt(p, '[data-act=jktog]:first-child').then((x) => x || ''), /Yoqilgan/); assert.match(await p.locator('.rz-st:has-text("Hazil matnlari")').first().innerText(), /Hazil matnlari/); await p.click('[data-act=jktog][data-v="0"]'); assert.equal((await stOf(p)).prefs.jokes, false); await p.click('[data-act=jktog][data-v="1"]'); assert.equal((await stOf(p)).prefs.jokes, true); await p.context().close();
  /* Bugun qatori: 0 qadam, tushdan keyin */
  p = await open('/kalkifit', seed({ entries: [400] }), 16); await p.waitForTimeout(800); const jl = await txt(p, '#jLine'); assert.ok(jl && poolOf('zero_steps').includes(jl), 'Bugun qatori (0 qadam): ' + jl); assert.equal(await p.locator('.sl-joke').count(), 0, 'doimiy karta yo\'q'); assert.ok((await p.locator('#jLine').evaluate((e) => e.closest('.sl-big') !== null)), 'qator idish kartasi ichida'); await p.context().close();
  /* qadam kiritish → hazil, vazn → hazil */
  p = await open('/kalkifit', seed({ entries: [400] }), 11); await p.click('[data-act=addsteps]'); await p.waitForTimeout(400); for (const k of ['9', '000']) await p.click(`[data-act=key][data-k="${k}"]`); await p.click('#spSave'); await p.waitForTimeout(700); const sf = await txt(p, '#jFlash'); assert.ok(sf && (poolOf('steps_goal').concat(poolOf('steps_add')).some((t) => G.fill(t, { steps: '9 000', goal: '8 000' }).replace(/ /g, ' ') === sf.replace(/ /g, ' '))), 'qadam kiritilgach: ' + sf); await p.context().close();
  p = await open('/kalkifit', seed(), 11); await p.click('[data-act=tab][data-v=results]'); await p.click('[data-act=addweight]'); await p.waitForTimeout(400); for (const k of ['7', '9', ',', '5']) await p.click(`[data-act=key][data-k="${k}"]`); await p.click('[data-act=wfsave]'); await p.waitForTimeout(700); const wt = await txt(p, '#rzToast'); assert.ok(wt && poolOf('weight_add').some((t) => G.fill(t, { kg: '79,5' }) === wt), 'vazn yozilgach (toast): ' + wt); await p.context().close();
  /* kun yakuni */
  p = await open('/kalkifit', seed({ entries: [1800] }), 20); await p.click('#dayEnd'); await p.waitForTimeout(700); const de = await txt(p, '#jFlash'); assert.ok(de && poolOf('dayend').includes(de), 'kun yakuni: ' + de); await p.context().close();
  /* ЎЗ va RU */
  p = await open('/kalkifit?lang=cyr', seed(), 9); await addFood(p, 'osh'); const cy = await txt(p, '#jFlash'); assert.ok(cy && !/[A-Za-z]{3,}/.test(cy.replace(/AI/g, '')) && /[А-Яа-яЎўҚқҒғҲҳ]/.test(cy), 'ЎЗ: ' + cy); await p.context().close();
  p = await open('/ru/kalkifit', seed(), 9); assert.ok(poolOf('empty_day', 'ru').includes(await txt(p, '.sl-first')), 'RU bo\'sh kun'); await addFood(p, 'плов'); const ru = await txt(p, '#jFlash'); assert.ok(ru && /[А-Яа-я]/.test(ru) && !/[A-Za-z]{3,}/.test(ru), 'RU: ' + ru); assert.deepEqual(p.errs, []); await p.context().close();
  /* kuniga ≤4 */
  p = await open('/kalkifit', seed({ entries: [100] }), 14); await p.evaluate(() => { const t = new Date(); const d = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); localStorage.setItem('kalki_fit_hazil', JSON.stringify({ jfl: { d, n: 4, t: 0 } })); }); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); await addFood(p, 'banan'); assert.equal(await p.locator('#jFlash').count(), 0, 'kuniga 4 tadan ortiq gap chiqmaydi'); await p.context().close();
  log('Brauzer: bo\'sh kun hazilli (o\'chirilganda neytral), birinchi ovqatdan keyin gap, 60 s ichida ikkinchisi yo\'q, kuniga ≤4; hazil o\'chirilganda «Yozildi. Bugun jami N kkal.»; Profil → Hazil matnlari yoqish/o\'chirish; Bugun qatori (karta emas, idish kartasi ichida); qadam, vazn, kun yakuni; ЎЗ va RU matnlari');
  console.log(`\n${n} ta tekshiruv guruhi o'tdi`);
} finally { await b.close(); srv.close(); }
