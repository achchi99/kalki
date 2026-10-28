// KalkiFit v62 (brauzer): (1) iPhone — qadam oynasida ixtiyoriy «Активная энергия» maydoni; kiritilsa «Hisob» qatori ⌚ +N, «qanday chiqdi?» oynasida qadam/mashg'ulot o'rniga BITTA soat qatori (ikki marta emas), yig'indi = halqa;
// (2) Android — soat sarfi (Health Connect, soxta ko'prik): «⌚ Soatingiz bormi?» → ruxsat → kun oxirida (20:00 dan) qurilma ≥ 10% kam bo'lsa limit kamayadi va oynada «Soatingiz ma'lumoti bo'yicha −N»; eski APK — «yangilang»;
// (3) eski foydalanuvchida 7 kunlik o'rtacha limit > 8% o'zgarsa — Bugun'da bir martalik izoh kartasi («Tushunarli» bilan yo'qoladi, qaytmaydi); oddiy holatda / yangi foydalanuvchida — yo'q.
// 360/390 px, katta shrift, UZ/ЎЗ/RU.   node tools/dizayn/test-limit-v62.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), D = S.dates, T0 = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
const nb = (x) => String(x).replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim(), num = (x) => +String(x).replace(/[^\d−-]/g, '').replace('−', '-');
function seed(o = {}) {
  const st = S.emptyState(); st.setup = true; st.created = o.fresh ? Date.now() : Date.now() - 20 * 864e5; st.trackStart = D.addDays(T0, -19);
  st.prefs = Object.assign({ tipsDone: true, jokes: false, yemayK: 1, introDone: true, lpTip: 1, suvFrom: T0, ttAsked: 1, hwSeen: T0, h_backup: Date.now(), jobAsked: 1, fw: { x: ['ovoz', 'rasm', 'menyu', 'yeymiz', 'hafta', 'kunkarta', 'google'] }, afT: 1, limV62: o.lim ? undefined : 1 }, o.prefs || {});
  if (o.lim) delete st.prefs.limV62; st.afsona = { a: {}, ok: {}, dq: { d: T0, id: 'a01', x: 1 } };
  st.profile = Object.assign({ sex: 'm', age: 35, height: 183, weight: 100, act: 2, goal: 'keep', job: 'sit', tartib: 'std' }, o.profile || {}); S.addWeight(st, D.addDays(T0, -19), st.profile.weight);
  S.addFood(st, T0, { meal: 'l', fid: 'osh', name: 'Osh', kcal: 640, p: 19, f: 25, c: 80, g: 300 }); if (o.fill) o.fill(st); return st;
}
/* br: 'none' (veb/iPhone) | 'plugin' (Android, Qadam + 1.0.7 energiya) | 'old' (Android, energiya metodlari yo'q) */
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', userAgent: o.br && o.br !== 'none' ? undefined : IOS, colorScheme: o.th || 'light' });
  if (o.at) await c.clock.setFixedTime(o.at);
  await c.addInitScript((a) => { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); if (a.lang) localStorage.setItem('kalki_lang', a.lang); }
    if (a.br === 'none') return; const q = window.__q = { calls: [], eg: false, en: a.en || [] };
    const H = [{ name: 'Share' }, { name: 'Qadam' }]; window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: H, nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m); if (pl !== 'Qadam') return Promise.reject(new Error('yo\'q'));
      if (m === 'isAvailable') return Promise.resolve({ available: true, granted: true, enabled: true, source: 'hc', hc: 'ok', hcGranted: true, sensor: true, sensorGranted: true });
      if (m === 'setEnabled') return Promise.resolve({ enabled: true }); if (m === 'getToday') return Promise.resolve({ qadam: a.steps || 0, sana: a.T0 }); if (m === 'getDays') return Promise.resolve({ source: 'hc', kunlar: [{ sana: a.T0, qadam: a.steps || 0 }] });
      if (a.br === 'old') return Promise.reject(new Error('not implemented'));
      if (m === 'energiyaHolat') return Promise.resolve({ hc: 'ok', granted: q.eg }); if (m === 'energiyaUlash') { q.eg = true; return Promise.resolve({ hc: 'ok', granted: true }); }
      if (m === 'getEnergy') return Promise.resolve({ granted: q.eg, kunlar: q.eg ? q.en : [] }); return Promise.reject(new Error('?')); } };
  }, { st: o.st, br: o.br || 'none', lang: o.lang, T0, en: o.en, steps: o.steps });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : o.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForSelector('#kChips'); await p.waitForTimeout(o.wait || 600);
  if (o.big) { await p.evaluate(() => document.documentElement.classList.add('fs-big')); await p.waitForTimeout(150); }
  return p;
}
const kind = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return !s.hidden && s.classList.contains('open') ? s.getAttribute('data-kind') : null; });
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const fit = (p) => p.evaluate(() => { const sh = document.getElementById('rzSheet'), W = document.documentElement.clientWidth, bad = [...sh.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > W + 0.5 || r.left < -0.5); }).map((e) => e.id || e.className).slice(0, 3); return { bad, hs: document.documentElement.scrollWidth > innerWidth + 1 }; });
const howRows = (p) => p.locator('#hwRows .hw-r').evaluateAll((l) => l.map((r) => [r.querySelector('.ic').textContent, r.querySelector('.m b').textContent, r.querySelector('.m small').textContent, r.querySelector('.v').textContent]));
const at21 = () => { const d = new Date(); d.setHours(21, 5, 0, 0); return d; };
try {
  /* 1. iPhone: qadam oynasida «Aktiv energiya» → kredit qadam + mashg'ulot O'RNIGA */
  const iph = seed({ prefs: { qm: 'on' }, fill: (st) => S.addEx(st, T0, { t: 'zal', min: 69, lv: 1 }) });
  let p = await open({ st: iph }); await p.click('[data-act=stepin]'); await p.waitForTimeout(450); assert.equal(await kind(p), 'stepin');
  assert.equal(nb(await p.locator('.si-ae span').innerText()), "Soatingiz bor bo'lsa — «Активная энергия», kkal (ixtiyoriy)"); assert.match(nb(await p.locator('.si-aeh').innerText()), /qadam va mashg'ulot o'rniga/);
  await p.fill('#siN', '15780'); await p.fill('#siAe', '690'); await p.click('[data-act=sisave]'); await p.waitForTimeout(600);
  let st = await stOf(p); assert.equal(st.days[T0].ae, 690); assert.equal(st.days[T0].steps, 15780); const dp = S.dayPlan(st, T0);
  assert.equal(dp.stepCredit + dp.exCredit, 0); assert.ok(dp.aeCredit > 0); assert.equal(nb(await p.locator('#kChips').innerText()), '🍽 640 ⌚ +' + dp.aeCredit.toLocaleString('ru').replace(/\s/g, ' ') + ' Hisob ›');
  await p.click('#kChips'); await p.waitForTimeout(450); let rows = await howRows(p);
  assert.deepEqual(rows.map((r) => r[0]), ['🎯', '⌚', '🍽'], 'qadam va mashg\'ulot qatorlari yo\'q — bitta soat qatori'); assert.equal(rows[1][1], 'Soat · aktiv 690'); assert.equal(num(rows[1][3]), dp.aeCredit);
  const rem = num(await p.locator('#hwRes b').innerText()); assert.equal(num(rows[0][3]) + num(rows[1][3]) + num(rows[2][3]), rem, 'yig\'indi = halqa'); assert.equal(rem, dp.limit - 640);
  await p.click('[data-act=xkform]'); await p.waitForTimeout(400); assert.match(nb(await p.locator('#xkRows').innerText()), /Soat: aktiv energiya 690 − kundalik [\d ]+, × 0,7/); assert.match(nb(await p.locator('#xkFormula').innerText()), new RegExp('= ' + dp.limit.toLocaleString('ru').replace(/\s/g, ' ') + ' kkal'));
  assert.deepEqual(p.errs, []); await p.context().close();
  ok('iPhone: «Активная энергия» 690 → ⌚ +' + dp.aeCredit + ' (qadam ' + 15780 + ' va zal 69 daq krediti 0 — ikki marta emas); oyna: 🎯 · ⌚ · 🍽, yig\'indi = halqa; formula oynasida soat qatori');
  for (const [lang, lab] of [['ru', 'Есть часы — «Активная энергия», ккал (необязательно)'], ['cyr', null]]) {
    for (const w of [360, 390]) {
      p = await open({ st: iph, lang, w, big: true }); await p.click('[data-act=stepin]'); await p.waitForTimeout(450); const l = nb(await p.locator('.si-ae span').innerText()); if (lab) assert.equal(l, lab); else assert.match(l, /^Соатингиз бор бўлса — «Активная энергия», ккал \(ихтиёрий\)$/, l);
      await p.locator('#siAe').focus(); await p.waitForTimeout(150); const f = await fit(p); assert.deepEqual(f.bad, [], lang + ' ' + w); assert.ok(!f.hs); assert.deepEqual(p.errs, []); await p.context().close();
    }
  }
  ok('Maydon: RU / ЎЗ matni, 360/390 px katta shriftda sig\'adi (gorizontal siljish yo\'q)');
  /* 2. Android: soat ulash, kun oxirida solishtirish */
  const andr = seed({ prefs: { qa: 'on' } }); p = await open({ st: andr, br: 'plugin', steps: 15780, en: [{ sana: T0, tot: 1600, totH: 20.9, src: 'com.huawei.health' }], at: at21() });
  await p.click('#kChips'); await p.waitForTimeout(450); assert.equal(await p.locator('#hcEon').count(), 1, '«⌚ Soatingiz bormi?» havolasi'); assert.equal(nb(await p.locator('#hcEon').innerText()), '⌚ Soatingiz bormi? Sarfini ulash ›');
  const before = S.dayPlan(await stOf(p), T0, null, { now: at21() }).limit; await p.click('#hcEon'); await p.waitForTimeout(900);
  st = await stOf(p); assert.equal(st.prefs.hcE, 'on'); assert.deepEqual(st.days[T0].dev, { tot: 1600, totH: 20.9, src: 'com.huawei.health' }); assert.ok((await p.evaluate(() => window.__q.calls)).includes('Qadam.getEnergy'));
  const d2 = S.dayPlan(st, T0, null, { now: at21() }); assert.ok(d2.dev && d2.limit < before, 'limit kamaydi: ' + before + ' → ' + d2.limit);
  if (await kind(p) !== 'xkcal') { await p.click('#kChips'); await p.waitForTimeout(450); } rows = await howRows(p); const dv = rows.find((r) => r[1] === "Soatingiz ma'lumoti bo'yicha");
  assert.ok(dv, JSON.stringify(rows)); assert.equal(num(dv[3]), -d2.dev.cut); assert.match(dv[2], /soat sarfi [\d ]+ kkal — hisobdan 10%\+ kam/); assert.equal(rows.reduce((a, r) => a + num(r[3]), 0), num(await p.locator('#hwRes b').innerText()), 'yig\'indi = halqa');
  assert.equal(await p.locator('#hcEis').count(), 1, 'ulangan holat yozuvi'); assert.deepEqual(p.errs, []); await p.context().close();
  ok('Android: «⌚ Soatingiz bormi?» → ruxsat → Health Connect sarfi (1 600 kkal, 20,9 soat) → 21:00 da limit ' + before + ' → ' + d2.limit + ' (−' + d2.dev.cut + '), oynada «Soatingiz ma\'lumoti bo\'yicha»');
  const morn = new Date(); morn.setHours(11, 0, 0, 0); p = await open({ st: seed({ prefs: { qa: 'on', hcE: 'on' }, fill: (s) => S.setDev(s, T0, { tot: 700, totH: 11, src: 'com.huawei.health' }) }), br: 'plugin', steps: 3000, at: morn }); assert.ok((await stOf(p)).days[T0].dev, 'soat ma\'lumoti bor');
  await p.click('#kChips'); await p.waitForTimeout(450); assert.ok(!(await howRows(p)).some((r) => r[0] === '⌚'), 'kunduzi (20:00 gacha) — solishtirilmaydi'); await p.context().close();
  p = await open({ st: andr, br: 'old' }); await p.click('#kChips'); await p.waitForTimeout(450); await p.click('#hcEon'); await p.waitForTimeout(500); assert.match(nb(await p.locator('.rz-toast, #rzToast').first().innerText()), /ilovani yangilang \(1\.0\.7\)/); assert.equal((await stOf(p)).prefs.hcE, undefined); await p.context().close();
  p = await open({ st: iph }); await p.click('#kChips'); await p.waitForTimeout(450); assert.equal(await p.locator('#hcEon').count(), 0, 'vebda yo\'q'); await p.context().close();
  ok('Kunduzi solishtirilmaydi; eski APK — «ilovani yangilang (1.0.7)»; veb/iPhone — havola yo\'q');
  /* 3. bir martalik izoh kartasi (> 8%) */
  const act = (st) => { for (let i = 0; i < 7; i++) { const d = D.addDays(T0, -i); S.setSteps(st, d, 20000); S.addEx(st, d, { t: 'zal', min: 90, lv: 2 }); } };
  const busy = seed({ lim: true, prefs: { qm: 'on' }, profile: { sex: 'f', weight: 60, height: 163, goal: 'lose' }, fill: act }); const r = S.limShift(busy, T0); assert.ok(r.pct < -0.08);
  p = await open({ st: busy }); assert.equal(await p.locator('#limCard').count(), 1); const ct = nb(await p.locator('#limCard b').innerText()); assert.equal(ct, "Kunlik me'yoringiz yangilandi: " + r.old.toLocaleString('ru').replace(/\s/g, ' ') + ' → ' + r.cur.toLocaleString('ru').replace(/\s/g, ' ') + ' kkal');
  const cw = await p.locator('#limCard').evaluate((e) => { const q = e.getBoundingClientRect(); return q.right <= document.documentElement.clientWidth + 0.5 && q.left >= 0; }); assert.ok(cw);
  await p.click('#limCard [data-act=lmok]'); await p.waitForTimeout(400); assert.equal(await p.locator('#limCard').count(), 0); await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('#kChips'); assert.equal(await p.locator('#limCard').count(), 0, 'qaytmaydi'); await p.context().close();
  p = await open({ st: busy, lang: 'ru', w: 360, big: true }); assert.match(nb(await p.locator('#limCard b').innerText()), /^Дневная норма обновилась: [\d ]+ → [\d ]+ ккал$/); assert.ok(await p.locator('#limCard').evaluate((e) => e.getBoundingClientRect().right <= document.documentElement.clientWidth + 0.5)); await p.context().close();
  p = await open({ st: seed({ lim: true }) }); assert.equal(await p.locator('#limCard').count(), 0, 'oddiy holat (−3,5%) — izoh yo\'q'); assert.equal((await stOf(p)).prefs.limV62, 1); await p.context().close();
  p = await open({ st: seed({ lim: true, fresh: true, prefs: { qm: 'on' }, profile: { sex: 'f', weight: 60, height: 163, goal: 'lose' }, fill: act }) }); assert.equal(await p.locator('#limCard').count(), 0, 'yangi foydalanuvchi — izoh yo\'q'); await p.context().close();
  ok('Izoh kartasi: 7 kun o\'rtacha ' + r.old + ' → ' + r.cur + ' (' + (r.pct * 100).toFixed(1) + '%) — bir marta, «Tushunarli» bilan yo\'qoladi, qaytmaydi (RU 360 katta shrift ham); oddiy holat va yangi foydalanuvchida yo\'q');
} finally { await b.close(); srv.close(); }
console.log('limit-v62-ui: ' + n + ' guruh OK');
