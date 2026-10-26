// KalkiFit v52 (brauzer): AI natija voronkasi (ovoz / rasm / matn: ochildi → tahrir / o'chirdi → qo'shildi / yopildi + soniya), ovoz natija ekrani (aytilgan gap, «2 tilim non» — tilim),
// veb → ilova (Android brauzer: APK sahifasi) / bosh ekran (iPhone Safari: 2 qadam + nusxa) kartalari (3+ kun, 5+ ovqat; yopsa 14 kun, ko'pi bilan 2 marta), akkauntsizlarga «Google bilan saqlang» (5+ kun).
//   node tools/dizayn/test-v52.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(ROOT + '/assets/kalkifit-core.js'), D = S.dates, T0 = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
const ANDB = 'Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const IMG = path.join(ROOT, 'assets/ovqat', fs.readdirSync(path.join(ROOT, 'assets/ovqat')).find((f) => /-256\.webp$/.test(f)));
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 864e5; st.prefs = Object.assign({ tipsDone: true, jokes: false, lpTip: 1, yemayK: 1, introDone: true, ttAsked: 1, suvFrom: T0, hwSeen: T0, h_hafta: Date.now(), h_backup: Date.now() }, o.prefs || {}); st.profile = { sex: 'm', age: 32, height: 175, weight: 82, act: 2, goal: 'lose' }; st.trackStart = D.addDays(T0, -15); S.addWeight(st, T0, 82);
  for (let i = 0; i < (o.days || 0); i++) for (let j = 0; j < (o.per || 2); j++) S.addFood(st, D.addDays(T0, -i), { meal: 'l', fid: 'non', name: 'Non', kcal: 200, p: 6, f: 2, c: 40, g: 80, ts: j + 1 }); return st; }
async function open(st, o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', userAgent: o.ua || IOS, colorScheme: o.th || 'light' });
  await c.addInitScript((a) => { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', a.st); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); localStorage.setItem('kalki_stat_test', '1'); localStorage.removeItem('kalki_stat_q'); } }, { st: JSON.stringify(st), lang: o.lang });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); p.nav = [];
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.route('**/ilova**', (r) => { p.nav.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>ilova</title>' }); });
  await p.route('**/api/**', (r) => { const u = r.request().url();
    if (/kalkifit-rasm/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o.photoEmpty ? { limit: 5, qoldi: 4, ovqatlar: [] } : { limit: 5, qoldi: 4, ovqatlar: [{ nom: 'Osh (palov)', porsiya: '1 likop', g: 350, kcal: 620, o: 18, y: 28, u: 70, ehtimol: 0.8 }] }) });
    if (/\/api\/kalkifit(\?|$)/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ limit: 15, qoldi: 13, ovqatlar: [{ nom: 'Qandaydir taom', porsiya: '1 porsiya', kcal: 300, o: 10, y: 10, u: 40 }] }) });
    if (/akkaunt\/sessiya/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o.akk ? { yoqilgan: true, kirgan: o.akk === 'in' } : { yoqilgan: false }) });
    if (/\/api\/ovoz/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: '{"yoqilgan":true,"limit":15,"qoldi":14}' });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"limit":5,"qoldi":4}' }); });
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p;
}
const Q = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_stat_q') || '[]').map((x) => x[0] + ':' + x[1]));
const ev = async (p, h) => (await Q(p)).filter((x) => x.startsWith(h + ':')).map((x) => x.slice(h.length + 1));
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
try {
  /* 1. ovoz: natija ekrani (aytilgan gap, matn maydoni yo'q, «2 tilim non» — oq non tilimi) → tahrir → o'chirish → qo'shish */
  let p = await open(seed({ days: 1 })); await p.click('#mainAdd'); await p.waitForTimeout(400); await p.evaluate(() => window.__kalkifit.voiceTest('bir kosa osh, ikki tilim non va choy')); await p.waitForTimeout(700);
  const sh = await p.locator('#rzSheet').innerText(); assert.match(sh, /^Ovoz bilan qo'shish/); assert.match(sh, /Siz aytdingiz:\s*«?bir kosa osh, ikki tilim non va choy»?/); assert.equal(await p.locator('#rzSheet #txQ').count(), 0, 'matn maydoni yo\'q');
  assert.equal(await p.locator('#rzSheet .rz-btn.primary').count(), 1, 'asosiy tugma bitta'); const rows = await p.locator('#rzSheet .sl-ti').allInnerTexts(); assert.equal(rows.length, 3); assert.match(rows[1].replace(/\s+/g, ' '), /Non · buxanka \(oq non\) 2 tilim 159 kkal/, '2 tilim non — 2 lepyoshka emas: ' + rows[1]);
  assert.deepEqual(await ev(p, 'ai_natija'), ['ovoz.ochildi']);
  await p.click('#rzSheet [data-act=itedit][data-i="0"]'); await p.waitForTimeout(400); await p.click('#rzSheet [data-act=pwdone] >> nth=0'); await p.waitForTimeout(400); await p.click('#rzSheet [data-act=txdel][data-i="2"]'); await p.waitForTimeout(300);
  await p.click('#rzSheet [data-act=txsave]'); await p.waitForTimeout(600); assert.equal((await stOf(p)).days[T0].food.length, 2 + 2);
  assert.deepEqual((await ev(p, 'ai_natija')).sort(), ['ovoz.ochildi', 'ovoz.ochirildi', 'ovoz.qoshildi', 'ovoz.qt10', 'ovoz.tahrir']); assert.deepEqual(await ev(p, 'ovqat_qoshildi'), ['ovoz']);
  /* matnni tuzatish → maydon chiqadi */
  await p.click('#mainAdd'); await p.waitForTimeout(400); await p.evaluate(() => window.__kalkifit.voiceTest('bir kosa osh')); await p.waitForTimeout(500); await p.click('#rzSheet [data-act=vtxedit]'); await p.waitForTimeout(300); assert.equal(await p.locator('#rzSheet #txQ').inputValue(), 'bir kosa osh');
  await p.keyboard.press('Escape'); await p.waitForTimeout(600); const e2 = await ev(p, 'ai_natija'); assert.ok(e2.includes('ovoz.yopildi') && e2.includes('ovoz.yt10'), 'qo\'shmasdan yopildi: ' + e2.join(','));
  assert.deepEqual(p.errs, []); await p.context().close();
  ok('Ovoz: «Ovoz bilan qo\'shish» + «Siz aytdingiz: «…»» (matn maydoni va 2-tugma yo\'q), «ikki tilim non» → 2 tilim oq non (159 kkal, 2 lepyoshka emas); voronka: ochildi → tahrir → o\'chirdi → qo\'shildi (<10 s), yopilsa — yopildi');
  /* 2. rasm: ochildi → qo'shildi; bo'sh natija → bosh */
  p = await open(seed({ days: 1 }), { w: 360, h: 640, lang: 'ru', th: 'dark' }); await p.click('#mainAdd'); await p.waitForTimeout(400); await p.setInputFiles('#phIn', IMG); await p.waitForTimeout(1500);
  assert.equal(await p.locator('#phAiLeft').count(), 0, 'natijada limit qatori yo\'q'); const br = await p.evaluate(() => { const b2 = document.querySelector('#rzSheet [data-act=txsave]').getBoundingClientRect(); return b2.bottom <= innerHeight + 1 && b2.top >= 0; }); assert.ok(br, '«Добавить всё» ekranda');
  assert.deepEqual(await ev(p, 'ai_natija'), ['rasm.ochildi']); assert.ok((await ev(p, 'ai_sorov')).includes('rasm.ok'));
  await p.click('#rzSheet [data-act=txsave]'); await p.waitForTimeout(500); assert.ok((await ev(p, 'ai_natija')).includes('rasm.qoshildi')); await p.context().close();
  p = await open(seed({ days: 1 }), { photoEmpty: true }); await p.click('#mainAdd'); await p.waitForTimeout(400); await p.setInputFiles('#phIn', IMG); await p.waitForTimeout(1500); assert.deepEqual(await ev(p, 'ai_natija'), ['rasm.bosh']); await p.context().close();
  ok('Rasm (RU 360×640 tungi): natijada «Добавить всё» ekranda, limit qatori yo\'q; voronka: ochildi → qo\'shildi; hech narsa tanilmasa — bosh');
  /* 3. veb → ilova (Android brauzer): 3+ kun, 5+ ovqat; bosilsa APK sahifasi va qaytmaydi */
  p = await open(seed({ days: 2, per: 3 }), { ua: ANDB }); assert.equal(await p.locator('#crd_ilova').count(), 0, '2 kun — hali yo\'q'); await p.context().close();
  p = await open(seed({ days: 3, per: 1 }), { ua: ANDB }); assert.equal(await p.locator('#crd_ilova').count(), 0, '3 ovqat — hali yo\'q'); await p.context().close();
  p = await open(seed({ days: 3, per: 2 }), { ua: ANDB }); assert.match((await p.locator('#crd_ilova').innerText()).replace(/\s+/g, ' '), /Ilovani o'rnating — qadam avtomatik, eslatmalar/); assert.deepEqual(await ev(p, 'karta'), ['ilova.korsatildi']);
  await p.click('#crd_ilova [data-act=crdgo]'); await p.waitForTimeout(800); assert.ok(p.nav.some((u) => /\/ilova\?from=kalkifit/.test(u)), 'APK sahifasi'); await p.context().close();
  ok('Android brauzer: 3+ kun va 5+ ovqat → «Ilovani o\'rnating — qadam avtomatik, eslatmalar» → APK sahifasi (/ilova); kam bo\'lsa — yo\'q');
  /* 4. iPhone Safari: bosh ekran — 2 qadam + nusxa; yopsa 14 kun, ikkinchi yopishdan keyin — hech qachon */
  const iSt = seed({ days: 3, per: 2 }); p = await open(iSt); assert.equal(await p.locator('#crd_ekran').count(), 1); await p.click('#crd_ekran [data-act=crdgo]'); await p.waitForTimeout(500);
  assert.equal(await p.locator('#rzSheet .crd-steps li').count(), 2); assert.equal(await p.locator('#rzSheet [data-act=crdcopy]').count(), 1); assert.match(await p.locator('#rzSheet').innerText(), /Bosh ekranga qo'shish/); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  assert.equal(await p.locator('#crd_ekran').count(), 0, 'bosilgandan keyin qaytmaydi'); assert.deepEqual((await ev(p, 'karta')).sort(), ['ekran.bosildi', 'ekran.korsatildi']); await p.context().close();
  const s2 = seed({ days: 3, per: 2 }); p = await open(s2); await p.click('#crd_ekran [data-act=crdno]'); await p.waitForTimeout(300); assert.equal(await p.locator('#crd_ekran').count(), 0); let s3 = await stOf(p); assert.equal(s3.prefs.crd.ekran.n, 1); await p.context().close();
  s3.prefs.crd.ekran.t = Date.now() - 13 * 864e5; p = await open(s3); assert.equal(await p.locator('#crd_ekran').count(), 0, '13 kun — qaytmaydi'); await p.context().close();
  s3.prefs.crd.ekran.t = Date.now() - 15 * 864e5; p = await open(s3); assert.equal(await p.locator('#crd_ekran').count(), 1, '14 kundan keyin — yana'); await p.click('#crd_ekran [data-act=crdno]'); await p.waitForTimeout(300); s3 = await stOf(p); await p.context().close();
  s3.prefs.crd.ekran.t = Date.now() - 40 * 864e5; p = await open(s3); assert.equal(await p.locator('#crd_ekran').count(), 0, '2 marta yopilgan — boshqa chiqmaydi'); await p.context().close();
  ok('iPhone Safari: «Bosh ekranga qo\'shing» → 2 qadam + «Ma\'lumotlarimni nusxalash»; yopsa 14 kun qaytmaydi, 2-yopishdan keyin — hech qachon');
  /* 5. akkaunt: akkauntsiz, 5+ kun → «Google bilan saqlang»; kirgan — yo'q; bir vaqtda bitta karta */
  const aSt = seed({ days: 5, per: 1 }); aSt.prefs.crd = { ilova: { ok: 1, t: Date.now() } }; p = await open(aSt, { akk: 'out', ua: ANDB }); await p.waitForTimeout(900);
  assert.match((await p.locator('#crd_akkaunt').innerText()).replace(/\s+/g, ' '), /Ma'lumotlaringiz yo'qolmasin — Google bilan saqlang/); assert.equal(await p.locator('#rzMain .crd, #rzMain .nudge').count(), 1, 'bitta karta');
  await p.click('#crd_akkaunt [data-act=crdno]'); await p.waitForTimeout(300); assert.equal(await p.locator('#crd_akkaunt').count(), 0); await p.context().close();
  const a4 = seed({ days: 4, per: 2 }); a4.prefs.crd = { ilova: { ok: 1, t: Date.now() } }; p = await open(a4, { akk: 'out', ua: ANDB }); await p.evaluate(() => window.__kalkifit.render()); await p.waitForTimeout(300); assert.equal(await p.locator('#crd_akkaunt').count(), 0, '4 kun — hali yo\'q'); await p.context().close();
  p = await open(aSt, { akk: 'in', ua: ANDB }); await p.evaluate(() => window.__kalkifit.render()); await p.waitForTimeout(300); assert.equal(await p.locator('#crd_akkaunt').count(), 0, 'kirgan — yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
  ok('Akkaunt: akkauntsiz 5+ kun → «Ma\'lumotlaringiz yo\'qolmasin — Google bilan saqlang» (Bugun\'da bitta karta); 4 kun yoki kirgan — yo\'q; yopsa 14 kun');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
