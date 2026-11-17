// KalkiFit v87: (A1) «lagan» → «tarelka» (birlik, eski yozuvning porsiya matni ko'rsatishda); (A2) choy/qahva «Qo'shimcha» qatori (shakar 0–3 q., asal, navvot, sut, limon, murabbo — kkal darhol,
// yozuv nomi «… + 2 q. shakar, sut», tahrirda tiklanadi, ovqatda yo'q); (A4) ichimlik o'lchami tez tanlovda (kichik/o'rta/katta); (B) yangiliklar oynasi — faqat oxirgi 3 yozuv, eng yangisi «Yangi»;
// (C) bir xillik maslahati: 5/6 kun bir guruh + bugun yana → karta (chip/kontekst bilan almashadi), muqobil chip → guruh qidiruvi, yopish, «kerak emas» (Profil'da qayta yoqiladi), haftalik cheklov,
// yangi foydalanuvchi (<7 kun) — yo'q, sabzavot — yo'q, oqsil qoidasi (5 kun < 70 %), statistika; RU/ЎЗ; 360 px.   node tools/dizayn/test-kalkifit-v87.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const T0 = D.today(); const N = require(path.join(ROOT, 'assets/app-yangilik.js'));
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const DB = S.normFoods(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods); const by = Object.fromEntries(DB.map((f) => [f.id, f]));
const kc = (id, u, q = 1) => { const f = by[id], x = f.u.find((y) => y[0] === u); return { kcal: Math.round(f.k * x[1] * q / 100), p: f.p * x[1] * q / 100 }; };
/* days: { -1: [[fid, unit, qty]], … } — o'tgan kunlar ovqati (kkal/oqsil bazadan) */
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age == null ? 30 : o.age) * 864e5; st.prefs = Object.assign({ yemayK: 1, jokes: false, suvFrom: T0, hwSeen: T0, ttAsked: 1, lpTip: 1, fc: { done: 1 } }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }; S.addWeight(st, T0, 80);
  Object.keys(o.days || {}).forEach((k) => { const d = D.addDays(T0, +k); o.days[k].forEach(([fid, u, q], i) => { const v = kc(fid, u, q || 1); S.addFood(st, d, { fid, unit: u, qty: q || 1, g: 100, kcal: v.kcal, p: v.p, f: 1, c: 1, meal: 'l', ts: i + 1 }); }); });
  (o.food || []).forEach((e, i) => S.addFood(st, T0, Object.assign({ meal: 'l', ts: i + 1, est: false, p: 1, f: 1, c: 1 }, e))); return st; }
async function open({ st = seed(), lang = 'uz', w = 390, h = 844, scheme = 'light', ls = {} } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); Object.keys(o.ls).forEach((k) => localStorage.setItem(k, o.ls[k])); } } catch (e) {} }, { st, lang, ls });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ limit: 5, qoldi: 3, yoqilgan: true }) }));
  await p.route('**/assets/stat-kun.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: "window.__ev=[];window.KalkiStat={create:function(){var o={add:function(h,k){window.__ev.push(h+'.'+(k||''))},disabled:function(){return false},manba:function(){}};return new Proxy(o,{get:function(t,p){return p in t?t[p]:function(){return null}}})}};" }));
  await p.goto(BASE + (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit') + (lang === 'cyr' ? '?lang=cyr' : ''), { waitUntil: 'networkidle' }); await p.waitForTimeout(800); return p;
}
const evs = (p) => p.evaluate(() => window.__ev || []);
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const num = (s) => +String(s).replace(/[^\d]/g, '');
async function pick(p, q, id) { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', q); await p.waitForTimeout(500); await p.click('#rzSheet [data-act=pickfood][data-id="' + id + '"]'); await p.waitForSelector('#fdKcal'); await p.waitForTimeout(250); }
const noOver = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
try {
  /* 1. A2 qo'shimchalar: choy → «Qo'shimcha · 1 piyolaga», kkal darhol, yozuv nomi, tahrirda tiklanadi */
  let p = await open(); await pick(p, 'choy', 'choy');
  assert.equal(await p.locator('#fdAd').count(), 1, 'choyda qo\'shimcha qatori'); assert.match(await txt(p, '#fdAdW'), /Qo'shimcha · 1 piyolaga/);
  assert.deepEqual((await p.locator('#fdAd .rz-chip').allInnerTexts()).map((x) => x.replace(/\s+/g, ' ').trim()), ['Shakarsiz', '1 q. shakar +16', '2 q. shakar +33', '3 q. shakar +49', 'Asal +21', 'Navvot +19', 'Sut +18', 'Limon +3', 'Murabbo +19']);
  const k0 = num(await txt(p, '#fdKcal')); await p.click('#fdAd [data-k=sh][data-v="2"]'); await p.waitForTimeout(350); const k1 = num(await txt(p, '#fdKcal')); assert.equal(k1 - k0, 33, '2 q. shakar → +33 kkal (' + k0 + '→' + k1 + ')');
  await p.click('#fdAd [data-k=su]'); await p.waitForTimeout(350); const k2 = num(await txt(p, '#fdKcal')); assert.equal(k2 - k0, 51, '+ sut → +51');
  assert.equal(await p.getAttribute('#fdAd [data-k=sh][data-v="2"]', 'aria-pressed'), 'true'); assert.ok(await noOver(p));
  await p.click('#fsave'); await p.waitForTimeout(700); let s1 = await stOf(p), e1 = s1.days[T0].food.slice(-1)[0];
  assert.deepEqual(e1.ad, { sh: 2, su: 1 }); assert.equal(e1.kcal, k2); assert.match(await txt(p, '#rzMain [data-act=editfood]'), /Choy.* \+ 2 q\. shakar, sut/);
  await p.click('#rzMain [data-act=editfood]'); await p.waitForSelector('#fdAd'); assert.equal(await p.getAttribute('#fdAd [data-k=sh][data-v="2"]', 'aria-pressed'), 'true', 'tahrirda tiklandi'); assert.equal(num(await txt(p, '#fdKcal')), k2);
  await p.click('#fdAd [data-k=sh][data-v="0"]'); await p.waitForTimeout(300); await p.click('#fsave'); await p.waitForTimeout(600); s1 = await stOf(p); e1 = s1.days[T0].food.slice(-1)[0]; assert.deepEqual(e1.ad, { su: 1 }); assert.equal(e1.kcal, k2 - 33);
  assert.deepEqual(p.errs, []); await p.context().close();
  p = await open(); await pick(p, 'osh', 'osh'); assert.equal(await p.locator('#fdAd').count(), 0, 'oshda qo\'shimcha yo\'q'); await p.context().close();
  p = await open({ lang: 'ru' }); await pick(p, 'чай', 'choy'); assert.match(await txt(p, '#fdAdW'), /Добавки · на порцию/); await p.click('#fdAd [data-k=sh][data-v="1"]'); await p.click('#fdAd [data-k=as]'); await p.waitForTimeout(300); await p.click('#fsave'); await p.waitForTimeout(600);
  assert.match(await txt(p, '#rzMain [data-act=editfood]'), /\+ 1 л\. сахара, мёд/); await p.context().close();
  log('Qo\'shimcha (choy): 9 chip bir bosishda, kkal darhol (+33 shakar, +18 sut), yozuv «Choy + 2 q. shakar, sut», tahrirda tiklanadi va o\'zgaradi; oshda yo\'q; RU');
  /* 2. A4 o'lcham: kafe kapuchino — Kichik / O'rta / Katta tez tanlovda */
  p = await open(); await pick(p, 'капучино', 'kapuchino-kafe');
  const qs = (await p.locator('#fdQuick .kq-chip b').allInnerTexts()); assert.deepEqual(qs.slice(0, 3), ['Kichik', "O'rta", 'Katta'], qs.join('|'));
  const ks = (await p.locator('#fdQuick .kq-chip small').allInnerTexts()).slice(0, 3).map(num); assert.ok(ks[0] < ks[1] && ks[1] < ks[2], 'kkal o\'sadi ' + ks);
  await p.click('#fdQuick .kq-chip >> nth=2'); await p.waitForTimeout(300); assert.equal(num(await txt(p, '#fdKcal')), ks[2]); assert.match(await txt(p, '#fdInfo'), /katta \(450 ml\)/); assert.equal(await p.locator('#fdAd').count(), 1, 'qahvada ham qo\'shimcha');
  await p.context().close(); log('O\'lcham: kapuchino — Kichik/O\'rta/Katta (250/350/450 ml) tez tanlovda, kkal o\'sadi; qahvada qo\'shimcha qatori');
  /* 3. A1 «tarelka»: birlik nomi, eski yozuvning porsiya matni (o'zgarmaydi — faqat ko'rinishda) */
  p = await open({ st: seed({ food: [{ fid: null, name: 'Osh', pt: '1 lagan', kcal: 700, g: 350 }] }) });
  assert.match(await txt(p, '#rzMain [data-act=editfood]'), /1 tarelka/); assert.equal((await stOf(p)).days[T0].food[0].pt, '1 lagan', 'saqlangan yozuv o\'zgarmagan');
  await pick(p, 'osh', 'osh'); await p.click('[data-act=pwmore]'); await p.waitForTimeout(300); const ut = await txt(p, '#fdUnits'); assert.match(ut, /tarelka/); assert.doesNotMatch(await p.evaluate(() => document.body.innerText), /\blagan/i, 'sahifada «lagan» yo\'q');
  await p.context().close();
  p = await open({ lang: 'cyr', st: seed({ food: [{ fid: null, name: 'Osh', pt: '1 lagan', kcal: 700, g: 350 }] }) }); assert.match(await txt(p, '#rzMain [data-act=editfood]'), /1 тарелка/); await p.context().close();
  log('«lagan» → «tarelka»: birlik chipida, eski yozuv porsiya matni ko\'rinishda (saqlangani o\'zgarmaydi); ЎЗ — «тарелка»');
  /* 4. B yangiliklar: faqat oxirgi 3 yozuv (eng yangisi «Yangi» + sana), o'tkazib yuborganga ham 3 dan ortiq emas */
  const NJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/yangiliklar-kalkifit.json'), 'utf8')).items; assert.ok(NJ.length > 3, 'JSON\'dagi eski yozuvlar o\'chirilmagan');
  const r3 = N.recent(NJ).map((e) => e.v), top3 = NJ.map((e) => e.v).sort((a, c) => c - a).slice(0, 3); assert.deepEqual(r3, top3);
  const allow = new Set(N.recent(NJ).flatMap((e) => e.items.map((x) => x.uz))); assert.ok(N.unseenItems(NJ, 0).every((x) => allow.has(x.uz)), 'o\'tkazib yuborgan foydalanuvchiga ham faqat oxirgi 3 yozuv');
  p = await open({ ls: { kalki_news_kalkifit: '{"shown":0,"read":0}' } }); await p.waitForSelector('#ygPop', { timeout: 5000 }); await p.click('#ygPop [data-act=ygopen]'); await p.waitForSelector('.yg-sheet');
  assert.equal(await p.locator('.yg-sheet .yg-e').count(), 3); assert.equal(await p.locator('.yg-sheet .yg-e.yg-new .yg-nb').innerText(), 'Yangi'); assert.equal(await p.locator('.yg-sheet .yg-e.yg-old').count(), 2);
  assert.ok(await p.locator('.yg-sheet .yg-e').first().locator('.yg-tt').count(), 'sarlavha'); for (let i = 0; i < 3; i++) assert.ok((await p.locator('.yg-sheet .yg-e').nth(i).locator('li').count()) <= 2, '1–2 jumla');
  assert.match(await txt(p, '.yg-sheet .yg-new .yg-d'), /Yangi \d\d\.\d\d\.\d{4}/); assert.ok(await noOver(p)); assert.deepEqual(p.errs, []); await p.context().close();
  log('Yangiliklar: oynada faqat oxirgi 3 yozuv (eng yangisi «Yangi» + sana, 2 tasi xira), har biri sarlavha + ≤ 2 jumla; JSON\'dagi eskilari qolgan; o\'tkazib yuborgan ham faqat 3 ni ko\'radi');
  /* 5. C bir xillik: 5/6 kun kartoshka + bugun yana → karta, muqobil chiplar, chip/kontekst yo'q */
  const KD6 = { '-1': [['kartoshka', 'likop']], '-2': [['kartoshka', 'likop']], '-4': [['kartoshka', 'likop']], '-5': [['kartoshka', 'likop']], '-6': [['kartoshka', 'likop']], '-3': [['salat-sabzavot', 'likop']] };
  assert.ok(by.kartoshka.gr.includes('kartoshka') && by.kartoshka.u.some((x) => x[0] === 'likop'), 'kartoshka guruhi va porsiya birligi');
  p = await open({ st: seed({ days: KD6 }) }); await pick(p, 'kartoshka', 'kartoshka'); await p.click('#fsave'); await p.waitForTimeout(900);
  assert.equal(await p.locator('#bxCard').count(), 1, 'karta chiqdi'); assert.match(await txt(p, '#bxCard'), /Kartoshka bilan oltinchi kun/); assert.equal(await p.locator('#rzChip:not([hidden]), #rzChipIn').count(), 0, 'kontekst chip almashgan');
  const gs = await p.locator('#bxCard [data-act=bxgo]').evaluateAll((l) => l.map((x) => x.getAttribute('data-g'))); assert.ok(gs.length >= 2 && gs.length <= 3 && gs.every((g) => ['baliq', 'tovuq', 'dukkakli', 'tuxum'].includes(g)), gs.join());
  assert.ok((await evs(p)).includes('bixil.korsatildi.kartoshka')); let sb = await stOf(p); assert.equal(sb.prefs.bx.last, T0); assert.ok(await noOver(p));
  await p.click('#bxCard [data-act=bxgo] >> nth=0'); await p.waitForSelector('#rzSheet #fdQ'); await p.waitForTimeout(500); assert.match(await txt(p, '#fdRecent'), new RegExp((gs[0] === 'baliq' ? 'Baliq' : gs[0] === 'tovuq' ? 'Tovuq' : gs[0] === 'dukkakli' ? 'Dukkakli' : 'Tuxum') + " — kunlik qoldiqqa sig'adiganlar", 'i'));
  assert.ok(await p.locator('#fdRecent [data-act=pickfood]').count() >= 2, 'guruh taomlari'); const ids = await p.locator('#fdRecent [data-act=pickfood]').evaluateAll((l) => l.map((x) => x.getAttribute('data-id'))); assert.ok(ids.every((id) => by[id] && by[id].gr.includes(gs[0])), ids.join());
  assert.ok((await evs(p)).includes('bixil.chip_bosildi')); assert.deepEqual(p.errs, []); await p.context().close();
  log('Bir xillik: 5/6 kun kartoshka + bugun → «Kartoshka bilan oltinchi kun» kartasi, 2–3 muqobil chip (baliq/tovuq/dukkakli/tuxum), kontekst chip yo\'q; chip → shu guruh taomlari (qoldiqqa sig\'adigan); statistika');
  /* 6. yopish; «kerak emas» → Profil'da o'chiq, qayta yoqiladi; haftalik cheklov; yangi foydalanuvchi; sabzavot */
  p = await open({ st: seed({ days: KD6 }) }); await pick(p, 'kartoshka', 'kartoshka'); await p.click('#fsave'); await p.waitForTimeout(800); await p.click('#bxCard [data-act=bxx]'); await p.waitForTimeout(300);
  assert.equal(await p.locator('#bxCard').count(), 0); assert.ok((await evs(p)).includes('bixil.yopildi')); await p.context().close();
  p = await open({ st: seed({ days: KD6 }) }); await pick(p, 'kartoshka', 'kartoshka'); await p.click('#fsave'); await p.waitForTimeout(800); await p.click('#bxCard [data-act=bxoff]'); await p.waitForTimeout(300);
  assert.equal(await p.locator('#bxCard').count(), 0); assert.equal((await stOf(p)).prefs.bx.off, 1); assert.ok((await evs(p)).includes('bixil.ochirildi')); assert.match(await txt(p, '#rzToast'), /Profil → Eslatmalar/);
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); assert.equal(await p.getAttribute('#bxRow [data-act=bxtog]', 'aria-checked'), 'false'); await p.click('#bxRow [data-act=bxtog]'); await p.waitForTimeout(300);
  assert.equal((await stOf(p)).prefs.bx.off, undefined, 'qayta yoqildi'); assert.ok((await evs(p)).includes('bixil.yoqildi')); await p.context().close();
  const once = async (o, why) => { const pp = await open({ st: seed(o) }); await pick(pp, o.q || 'kartoshka', o.id || 'kartoshka'); await pp.click('#fsave'); await pp.waitForTimeout(800); assert.equal(await pp.locator('#bxCard').count(), 0, why); await pp.context().close(); };
  await once({ days: KD6, prefs: { bx: { last: D.addDays(T0, -3) } } }, 'haftada 1 marta');
  await once({ days: KD6, age: 5 }, 'birinchi 7 kun — yo\'q');
  await once({ days: { '-1': [['salat-sabzavot', 'likop'], ['tovuq-kokrak', 'porsiya', 3]], '-2': [['salat-sabzavot', 'likop'], ['tovuq-kokrak', 'porsiya', 3]], '-3': [['salat-sabzavot', 'likop'], ['tovuq-kokrak', 'porsiya', 3]], '-4': [['salat-sabzavot', 'likop'], ['tovuq-kokrak', 'porsiya', 3]], '-5': [['salat-sabzavot', 'likop'], ['tovuq-kokrak', 'porsiya', 3]], '-6': [['salat-sabzavot', 'likop'], ['tovuq-kokrak', 'porsiya', 3]] }, q: 'salat', id: 'salat-sabzavot' }, 'sabzavot — foydali odat, karta yo\'q');
  await once({ days: { '-1': [['kartoshka', 'likop']], '-2': [['kartoshka', 'likop']], '-4': [['kartoshka', 'likop']], '-5': [['kartoshka', 'likop']] } }, '4/6 kun — yetmaydi');
  log('Yopish (yopildi), «Bunday maslahat kerak emas» → o\'chadi, Profil → Eslatmalar\'da qayta yoqiladi; haftada 1 marta; birinchi 7 kun, sabzavot, 4/6 kun — karta yo\'q');
  /* 7. oqsil qoidasi: 5 kun ketma-ket oqsil < 70 % (guruh qoidasi yo'q) → oqsilli takliflar */
  const OL = { '-1': [['olma', 'dona']], '-2': [['olma', 'dona']], '-3': [['olma', 'dona']], '-4': [['olma', 'dona']], '-5': [['olma', 'dona']] };
  p = await open({ st: seed({ days: OL }) }); await pick(p, 'olma', 'olma'); await p.click('#fsave'); await p.waitForTimeout(800);
  assert.match(await txt(p, '#bxCard'), /5 kundirki oqsil maqsaddan kam/); const g2 = await p.locator('#bxCard [data-act=bxgo]').evaluateAll((l) => l.map((x) => x.getAttribute('data-g'))); assert.ok(g2.length >= 2 && g2.every((g) => ['tovuq', 'baliq', 'tuxum', 'dukkakli'].includes(g)), g2.join());
  assert.ok((await evs(p)).includes('bixil.korsatildi.oqsil')); await p.context().close();
  p = await open({ lang: 'ru', st: seed({ days: KD6 }) }); await pick(p, 'картошка', 'kartoshka'); await p.click('#fsave'); await p.waitForTimeout(800); assert.match(await txt(p, '#bxCard'), /Картошка — шестой день подряд/); assert.match(await txt(p, '#bxCard'), /Такие советы не нужны/); await p.context().close();
  p = await open({ lang: 'cyr', w: 360, scheme: 'dark', st: seed({ days: KD6 }) }); await pick(p, 'kartoshka', 'kartoshka'); await p.click('#fsave'); await p.waitForTimeout(800); assert.match(await txt(p, '#bxCard'), /Картошка билан олтинчи кун/); assert.ok(await noOver(p)); await p.context().close();
  log('Oqsil: 5 kun < 70 % → «5 kundirki oqsil maqsaddan kam» + tovuq/baliq/tuxum/dukkakli; RU, ЎЗ (360 px, tungi)');
  /* 8. birlashtirish: qo'shimcha (e.ad) va prefs.bx yo'qolmaydi */
  const a = seed(), c = seed(); S.addFood(a, T0, { fid: 'choy', unit: 'piyola', qty: 1, g: 200, kcal: 35, meal: 'b', ad: { sh: 2, xx: 5 } }); a.prefs.bx = { off: 1 };
  assert.deepEqual(a.days[T0].food[0].ad, { sh: 2 }, 'addFood tozalaydi'); S.stamp(a); S.stamp(c); const m = S.mergeStates(a, c); const fe = Object.values(m.days).flatMap((x) => x.food).find((e) => e.fid === 'choy');
  assert.deepEqual(fe && fe.ad, { sh: 2 }, 'merge: ad saqlanadi'); log('Birlashtirish: e.ad saqlanadi (addFood noma\'lum kalitni tashlaydi)');
  console.log('\nTAYYOR:', n, 'guruh');
} finally { await b.close(); srv.close(); }
