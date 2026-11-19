// KalkiFit v78 «Baza tekshirildi»: ustuvor ro'yxatdagi har taomda tekshirilgan+manba, porsiya grammlari oqilona; qidiruv («фиттер», «лавашелло», «курт», «кофе», sinonimlar);
// «Xato topdingizmi?» formasi (API tekshiruvi + brauzer: ✓ belgi, manba oynasi, forma, anonim yuborish).   node tools/dizayn/test-baza-ishonch.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = process.env.INSTALL_BASE || 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); }; const num = (s) => Number(String(s).replace(/[^\d.,-]/g, '').replace(',', '.'));
const AI0 = { ovqatlar: [{ nom: 'Qwerty olma', porsiya: '1 dona (150 g)', g: 150, kcal: 80, o: 0.4, y: 0.2, u: 20 }, { nom: 'Zxcv kek', porsiya: '1 bo\'lak', kcal: 300, o: 4, y: 15, u: 40 }] };
async function mk(w = 360, h = 640) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = { tipsDone: true, jokes: false }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80);
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); await c.addInitScript((s) => { localStorage.setItem('kalki_fit', JSON.stringify(s)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); }, st);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/kalkifit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AI) })); await p.route('**/api/kalkifit-taklif', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(500); return p; }
const more = async (p) => { if (await p.locator('#pwMore[hidden]').count()) { await p.click('[data-act=pwmore]'); await p.waitForTimeout(120); } };
const textMode = async (p, q) => { await p.fill('#fdQ', q); await p.waitForTimeout(250); await p.click('[data-act=fqai]'); await p.waitForTimeout(1100); };
const kc = async (p) => { await p.waitForTimeout(280); return num(await p.locator('#fdKcal').innerText()); }; const qv = async (p) => num(await p.inputValue('#fdQty')); const stOf = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__kalkifit.state)));
const dayKcal = async (p) => { const s = await stOf(p); return Math.round(s.days[TODAY].food.reduce((a, e) => a + e.kcal, 0)); };
const A = require(path.join(ROOT, 'tools/baza-audit.js')), M = require(path.join(ROOT, 'tools/baza-mantiq.js'));
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')), DB = S.normFoods(J.foods); S.buildIndex(DB); const by = Object.fromEntries(DB.map((f) => [f.id, f]));
const U = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/baza-ustuvor.json'), 'utf8')).ids;
const kk = (f, u) => { const x = f.u.find((q) => q[0] === u); return x ? Math.round(f.k * x[1] / 100) : null; };
try {
  /* 1. ustuvor ro'yxat: tekshirilgan + manba + oqilona porsiya */
  assert.ok(U.length >= 300, 'ustuvor ro\'yxat ~300 taom: ' + U.length);
  const yomon = [];
  for (const id of U) { const f = by[id]; if (!f) { yomon.push(id + ': bazada yo\'q'); continue; } if (f.tekshirilgan !== true) yomon.push(id + ': tekshirilgan yo\'q'); if (!f.manba || f.manba.length < 5) yomon.push(id + ': manba yo\'q'); const g = A.gate(f); if (g.length) yomon.push(id + ': ' + g.join('; ')); }
  assert.equal(yomon.length, 0, 'ustuvor ro\'yxat:\n' + yomon.join('\n'));
  log('ustuvor ro\'yxat (' + U.length + ' taom): hammasida tekshirilgan=true + manba, makro ≈ kkal, porsiya grammlari oraliqda');
  /* 2. standart porsiyalar real */
  assert.equal(by.non.u.find((x) => x[0] === 'dona')[1], 350); assert.equal(by.non.u.find((x) => x[0] === 'bolak')[1], 88, 'chorak obi non');
  assert.ok(by.shashlik.u.some((x) => x[0] === 'six' && x[1] === 80) && !by.shashlik.u.some((x) => x[0] === 'dona'), '1 six shashlik 80 g');
  assert.deepEqual(by.qurt.u.filter((x) => x[0] !== 'g100'), [['dona_s', 12], ['dona_l', 25]], 'qurt: kichik 12 g, katta 25 g');
  assert.ok(kk(by.qurt, 'dona_s') >= 35 && kk(by.qurt, 'dona_s') <= 50 && kk(by.qurt, 'dona_l') >= 75 && kk(by.qurt, 'dona_l') <= 100, 'qurt kkal birlikka mos');
  for (const id of ['mastava', 'moshxorda', 'shurva', 'kafe-mastava']) assert.ok(by[id].u.filter((x) => x[0] !== 'g100').every((x) => x[0] === 'kosa'), id + ': faqat kosa');
  log('porsiyalar: obi non 350 g (chorak 88 g), 1 six shashlik 80 g, qurt 12/25 g, sho\'rvalar faqat kosa');
  /* 3. chuchvara: standart — sho'rvada, 1 kosa oqilona; suvsiz/qovurma alohida */
  const ch = by.chuchvara, cd = S.famVariant(ch, S.famDefault(ch)); assert.equal(cd.vr, 'goshtli.shorvada'); assert.ok(kk(cd, 'kosa') >= 350 && kk(cd, 'kosa') <= 520, 'chuchvara 1 kosa (sho\'rvada): ' + kk(cd, 'kosa'));
  for (const v of ['goshtli.qaynatma', 'goshtli.qovurma']) { const x = S.famVariant(ch, { ichi: 'goshtli', berilishi: v.split('.')[1] }); assert.ok(kk(x, 'kosa') <= 650 && x.u.find((q) => q[0] === 'kosa')[1] <= 250, v + ' kosa kichikroq'); }
  assert.ok(ch.fam.fn['goshtli.qaynatma'].n.includes('suvsiz') && ch.fam.fn['goshtli.qovurma'].n.includes('qovurilgan'), 'variant nomlari aniq');
  log('chuchvara: standart sho\'rvada 1 kosa ≈ ' + kk(cd, 'kosa') + ' kkal; suvsiz va qovurilgani alohida nom bilan');
  /* 4. qidiruv */
  const top = (q) => S.search(DB, q, { limit: 6 }); const ids = (q) => top(q).map((x) => x.id);
  assert.equal(ids('фиттер')[0], 'tm-evos-lavash-fitter'); assert.equal(ids('fitter')[0], 'tm-evos-lavash-fitter'); assert.equal(ids('лавашелло')[0], 'tm-evos-lavash-lavashello'); assert.equal(ids('lavashello')[0], 'tm-evos-lavash-lavashello');
  assert.ok(by['tm-evos-lavash-fitter'].k !== by['tm-evos-lavash-lavashello'].k, 'ikki xil kkal'); assert.ok(!ids('фиттер').includes('tm-evos-lavash-yengil') && !ids('лавашелло').includes('tm-evos-lavash-yengil'), 'eski birlashtirilgan qator ko\'rinmaydi'); assert.ok(by['tm-evos-lavash-yengil'].h === 1, 'eski id tarix uchun saqlanadi');
  for (const q of ['курт', 'Курт', 'курут', 'qurt', 'qurut', 'kurt', 'kurut']) assert.equal(ids(q)[0], 'qurt', q); assert.equal(by.qurt.r, 'Курт');
  for (const q of ['кофе', 'Кофе', 'kofe', 'qahva', 'coffee']) { assert.equal(ids(q)[0], 'kofe', q); const f = S.famVariant(by.kofe, S.famDefault(by.kofe)); assert.ok(kk(f, 'chashka') <= 3, q + ': qora qahva ' + kk(f, 'chashka') + ' kkal'); }
  assert.ok(!by.kofe.u.some((x) => x[0] === 'stakan'), 'qahva oilasida stakan va chashka aralashmaydi'); assert.ok(!DB.some((f) => !f.h && (f.r.trim() === 'Кофе' || f.n.trim() === 'Qahva')), 'nomi shunchaki «Кофе»/«Qahva» qator yo\'q');
  for (const [q, id] of [['чучвара', 'chuchvara'], ['пельмени', 'pelmeni'], ['мастава', 'mastava'], ['нарын', 'norin'], ['самса', 'somsa'], ['palov', 'osh'], ['плов', 'osh'], ['shurpa', 'shurva'], ['шурпа', 'shurva']]) assert.ok(ids(q).slice(0, 2).includes(id), q + ' → ' + ids(q).join(','));
  log('qidiruv: «фиттер» ≠ «лавашелло» (alohida kkal), «курт/курут/qurt», «кофе» → shakarsiz qora (2 kkal), sinonimlar (palov/plov/osh, shurpa/sho\'rva, pelmen/chuchvara)');
  /* 5. «A / B» yo'q, «миска» yo'q */
  assert.equal(M.tekshir(J.foods).f.length, 0); assert.equal(M.tekshir(J.foods).h.length, 0); for (const f of ['assets/kalkifit-app.js', 'functions/api/kalkifit.js']) assert.ok(!/миск/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), f + ': «миска»');
  /* 6. xato-xabar API: kirish tekshiruvi */
  const X = await import(path.join(ROOT, 'functions/api/kalkifit-xato.js')); const ok = X.validate({ id: 'qurt', turi: 'k,p', izoh: 'juda ko\'p <b>', til: 'ru' }); assert.deepEqual([ok.id, ok.turi, ok.izoh, ok.til], ['qurt', 'k,p', 'juda ko\'p b', 'ru']);
  for (const bad of [null, {}, { id: 'qurt' }, { id: 'qurt', turi: 'x' }, { id: '../x', turi: 'k' }, { id: 'a'.repeat(80), turi: 'k' }, [1]]) assert.equal(X.validate(bad), null, JSON.stringify(bad));
  assert.equal(X.validate({ id: 'qurt', turi: 'n', izoh: 'x'.repeat(500), mijoz_id: 'abc' }).izoh.length, 200); assert.ok(!('mijoz_id' in X.validate({ id: 'qurt', turi: 'n', mijoz_id: 'abc' })), 'shaxsiy maydon o\'tmaydi');
  log('«Xato topdingizmi?» API: tur k/p/n, izoh ≤ 200, anonim (mijoz_id o\'tmaydi), noto\'g\'ri kirish rad');
  /* 7. brauzer: ✓ belgi, manba oynasi, forma */
  const p = await mk(); let sent = null; await p.route('**/api/kalkifit-xato', async (r) => { sent = JSON.parse(r.request().postData()); await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await p.click('#mainAdd').then(() => p.click('#rzSheet #fdQ')); await p.waitForTimeout(400); await p.fill('#fdQ', 'qurt'); await p.waitForTimeout(250); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForTimeout(300);
  assert.equal(await txt(p, '#fdName'), 'Qurt (kurut)'); assert.equal(await p.locator('.sl-tzb').count(), 1, 'manba belgisi'); assert.match(await txt(p, '.sl-tzb'), /^Manba: USDA$/);
  const chips = (await p.locator('#fdUnits .rz-chip').allInnerTexts()).map((x) => x.trim()); assert.ok(chips.includes('kichik') && chips.includes('katta'), chips.join('|'));
  await p.click('.sl-tzb'); await p.waitForTimeout(300); const sh = await txt(p, '#rzSheet'); assert.match(sh, /Manba: USDA · Manba va hisob/); assert.match(sh, /172182/, 'manba: USDA fdc_id'); await p.click('[data-act=pwswapx]'); await p.waitForTimeout(300);
  await p.click('.sl-tzl'); await p.waitForTimeout(300); await p.click('[data-act=xtsend]'); await p.waitForTimeout(200); assert.equal(sent, null, 'hech narsa tanlanmasa yuborilmaydi'); assert.match(await txt(p, '#xtMsg'), /Kamida/);
  await p.click('[data-act=xtk][data-k=k]'); await p.fill('#xtNote', 'kkal kam'); await p.click('[data-act=xtsend]'); await p.waitForTimeout(500);
  assert.ok(sent && sent.id === 'qurt' && sent.turi === 'k' && sent.izoh === 'kkal kam', JSON.stringify(sent)); assert.ok(!('mijoz_id' in sent) && !('cid' in sent), 'anonim'); assert.deepEqual(p.errs, []);
  log('taom kartasi: «Manba: USDA» → manba (USDA 172182), «Xato topdingizmi?» → forma → anonim yuborish; qurt «kichik/katta»'); await p.context().close();
  /* 8. «кофе» qatori: oxirgi yeyilgan variant (kapuchino) nomi bilan chiqadi — «Qahva · 72 kkal» emas */
  { const q = await mk(); await q.click('#mainAdd').then(() => q.click('#rzSheet #fdQ')); await q.waitForTimeout(400); await q.fill('#fdQ', 'kapuchino'); await q.waitForTimeout(250); await q.click('[data-act=pickfood] >> nth=0'); await q.waitForTimeout(300); await q.click('#fsave'); await q.waitForTimeout(600);
    await q.click('#mainAdd').then(() => q.click('#rzSheet #fdQ')); await q.waitForTimeout(400); await q.fill('#fdQ', 'kofe'); await q.waitForTimeout(300); const row = await txt(q, '[data-act=pickfood] >> nth=0'); assert.ok(/Kapuchino/i.test(row) && /72/.test(row), 'oxirgi variant nomi bilan: ' + row); assert.ok(!/^Qahva\s*[·\d]/.test(row), row);
    await q.fill('#fdQ', 'qahva'); await q.waitForTimeout(300); log('«kofe» qatori oxirgi variantni nomi bilan ko\'rsatadi: ' + row); await q.context().close(); }
  console.log(`\n${n} ta tekshiruv guruhi o'tdi`);
} finally { await b.close(); srv.close(); }
async function txt(p, sel) { const l = p.locator(sel).first(); if (!(await l.count())) return null; return (await l.innerText()).replace(/\s+/g, ' ').trim(); }
