// KalkiFit v68 «Birinchi kun ishonchi»: noaniq miqdor («non» → 876 kkal emas, «Qancha edi?»), ko'p taomli gap («Topilmadi» yo'q), tez boshlash (namunaviy profil/vazn
// tarixni ifloslamaydi + eski yozuvlar migratsiyasi), 0 kg → «—», halqaning 4 holati, bosh ekran tartibi, matnlar (Kaloriya hisobi, limitlar, kun tartibi, Imkoniyatlar raqamsiz),
// haftalik xulosa «yetarli emas», vitamin kartasi pastda, maxfiylik matni; 360 px + katta shrift (RU, ЎЗ).   node tools/dizayn/test-birinchi-kun.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const Dt = S.dates, TODAY = Dt.today();
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const DB = S.normFoods(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods); S.buildIndex(DB); const by = Object.fromEntries(DB.map((f) => [f.id, f]));

/* ---------- yadro ---------- */
{ const non = S.famVariant ? (by.non.fam ? S.famVariant(by.non, S.famDefault(by.non), null) : by.non) : by.non, a = S.ambOpts(non, 'dona');
  assert.deepEqual(a.opts.map((x) => x.k), ['tilim', 'chorak', 'yarim', 'butun']); assert.equal(a.opts[a.def].k, 'chorak'); assert.equal(a.opts[3].kcal, 876); assert.ok(a.opts[a.def].kcal < 300);
  const so = S.ambOpts(by.somsa, 'dona'); assert.deepEqual(so.opts.map((x) => x.k), ['yarim', 'butun']); assert.equal(S.ambOpts(by.osh, 'likop'), null, 'lagan/kosa — o\'zi porsiya'); assert.equal(S.ambOpts(by.tuxum, 'dona'), null, '1 dona ≤ 250 kkal');
  assert.equal(S.parseText('non', DB, {}).items[0].nq, true); assert.equal(S.parseText('2 ta non', DB, {}).items[0].nq, undefined); assert.equal(S.parseText('yarimta non', DB, {}).items[0].nq, undefined);
  const amb = DB.filter((f) => !f.h && !f.al && S.ambOpts(f, ((f.b || []).find((b) => b.d) || {}).k || f.u[0][0])); assert.ok(amb.length >= 60 && amb.some((f) => f.id === 'lavash-tovuq') && amb.some((f) => f.id === 'burger'), '«Qancha edi?» taomlari: ' + amb.length);
  log('Yadro: non → 1 tilim · chorak · yarim · butun (taxminiy — chorak, 219 kkal; butun 876); somsa, lavash, burger — yarim/butun; lagan/kosa taomlari va kichik birlik — yo\'q; «non» — miqdorsiz, «2 ta non» / «yarimta non» — miqdorli (' + amb.length + ' taom)'); }
{ const mk = (o) => { const st = S.emptyState(); st.setup = true; st.created = Date.now(); st.profile = { sex: o.sex || 'm', age: 30, height: 175, weight: o.pw, act: 2, goal: 'keep' }; st.trackStart = o.ts; st.prefs = o.prefs || {}; o.ws.forEach((w) => S.addWeight(st, w[0], w[1])); return S.migrate(JSON.parse(JSON.stringify(st))); };
  const d0 = '2026-10-20'; let s = mk({ pw: 75, ts: d0, prefs: { taxminiy: { t: 1, n: 0 } }, ws: [[d0, 75]] }); assert.deepEqual(s.weights, [], 'namunaviy yozuv tarixdan yashirildi'); assert.deepEqual(s.wHid, [{ d: d0, kg: 75, sabab: 'ob' }], 'o\'chirilmagan — wHid da');
  s = mk({ pw: 75, ts: d0, prefs: { taxminiy: { t: 1, n: 0 } }, ws: [[d0, 75], ['2026-10-25', 74.2]] }); assert.deepEqual(s.weights.map((w) => w.kg), [74.2], 'keyingi haqiqiy o\'lchovlar qoladi');
  s = mk({ pw: 75, ts: d0, prefs: {}, ws: [[d0, 75]] }); assert.equal(s.weights.length, 1, 'aniqlashtirilgan (taxminiy yo\'q) — tegilmaydi'); s = mk({ pw: 80, ts: d0, prefs: { taxminiy: { t: 1 } }, ws: [[d0, 80]] }); assert.equal(s.weights.length, 1, 'namunaviy emas (80 kg) — tegilmaydi');
  s = mk({ sex: 'f', pw: 62, ts: d0, prefs: { taxminiy: { t: 1 } }, ws: [[d0, 62]] }); assert.deepEqual(s.weights, []); const s2 = S.migrate(JSON.parse(JSON.stringify(s))); assert.deepEqual(s2.wHid, s.wHid, 'qayta yuklashda saqlanadi (takrorlanmaydi)');
  log('Migratsiya: «Keyinroq» namunaviy vazni (75/62 kg, boshlang\'ich kun) tarixdan yashiriladi — o\'chirilmaydi (wHid); haqiqiy o\'lchovlar, aniqlashtirilgan profil va boshqa vazn — tegilmaydi'); }

/* ---------- brauzer ---------- */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 2 * 864e5; st.prefs = Object.assign({ tipsDone: true, jokes: false, yemayK: 1, introDone: true }, o.prefs || {}); st.profile = Object.assign({ sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: 72 }, o.profile || {}); st.trackStart = o.ts || Dt.addDays(TODAY, -1); (o.ws || [[Dt.addDays(TODAY, -1), 80]]).forEach((w) => S.addWeight(st, w[0], w[1])); if (o.kc) S.addFood(st, TODAY, { fid: null, name: 'Osh', meal: 'l', unit: null, qty: 1, g: 400, kcal: o.kc, p: 20, f: 30, c: 80 }); return st; }
async function mk(o = {}) { const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((a) => { try { if (sessionStorage.getItem('__t')) return; sessionStorage.setItem('__t', '1'); if (a.st) localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); if (a.big) localStorage.setItem('kalki_fs', 'big'); } catch (e) {} }, { st: o.st, lang: o.lang, big: !!o.big });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/retsept', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"limit":5,"qoldi":4}' })); await p.route(/\/api\/(?!retsept)/, (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + (o.url || '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p; }
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const tx = (p, s) => p.locator(s).first().innerText().then((x) => x.replace(/\s+/g, ' ').trim());
async function search(p, q) { if (!(await p.locator('#rzSheet #fdQ').count())) { await p.click('#mainAdd'); await p.waitForTimeout(400); } await p.fill('#fdQ', q); await p.waitForTimeout(500); }
try {
  /* 1. non: qidiruv qatori, [+] → oyna (qo'shmaydi), «Qancha edi?», 876 emas; tanlanmasa — taxminiy yozuv */
  let p = await mk({ st: seed() });
  await search(p, 'non'); const r0 = await tx(p, '#fdRes .sl-rw'); assert.match(r0, /^Non .*≈ Chorak · 219 kkal/, r0); assert.doesNotMatch(await p.locator('#fdRes').innerText(), /876/);
  await p.locator('#fdRes .sl-rw').first().locator('.sl-pl').click(); await p.waitForTimeout(600); assert.equal((await stOf(p)).days[TODAY], undefined, '[+] darhol qo\'shmadi'); assert.ok(await p.locator('#fdName').count(), 'porsiya oynasi ochildi');
  assert.equal(await tx(p, '#fdKcal'), '219'); assert.match(await tx(p, '#fdAmb'), /Qancha edi\? Hozircha taxminiy miqdor/); assert.deepEqual((await p.locator('#fdQuick .kq-chip b').allInnerTexts()), ['1 tilim', 'Chorak', 'Yarim', 'Butun', 'Gramm']); assert.equal(await p.locator('#fdQuick .kq-chip.on').count(), 0, 'hech biri tanlanmagan');
  await p.click('#fdQuick [data-v="1"][data-u=dona]'); await p.waitForTimeout(400); assert.equal(await tx(p, '#fdKcal'), '876', 'butun — o\'zi tanlasa'); assert.equal(await p.locator('#fdAmbN').count(), 0, 'izoh yo\'qoldi');
  await p.click('#fdQuick [data-v="0.5"]'); await p.waitForTimeout(300); await p.click('#fsave'); await p.waitForTimeout(600); let e = (await stOf(p)).days[TODAY].food[0]; assert.deepEqual([e.kcal, e.aq], [438, undefined], 'tanlangan — taxminiy emas');
  await search(p, 'somsa'); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForTimeout(500); await p.click('#fsave'); await p.waitForTimeout(600); e = (await stOf(p)).days[TODAY].food[1]; assert.equal(e.aq, 1, 'tanlanmagan — aq'); assert.equal(e.kcal, 178);
  assert.match(await p.locator('#rzMain').innerText(), /miqdor taxminiy/); assert.deepEqual(p.errs, []);
  log('«non»: qatorda «≈ Chorak · 219 kkal» (876 yo\'q), [+] darhol qo\'shmaydi — «Qancha edi?» oynasi (1 tilim · chorak · yarim · butun, hech biri tanlanmagan), butun faqat tanlansa 876; tanlanmasa — «miqdor taxminiy» belgisi');
  /* 2. ko'p taomli gap: «Topilmadi» yo'q; matn oqimida non — «Qancha edi?» chiplari */
  await search(p, '2 ta tuxum va non'); let t = await p.locator('#fdRes').innerText(); assert.match(t, /Hammasini qo'shish/); assert.doesNotMatch(t, /Topilmadi/);
  await p.click('#fdAi'); await p.waitForTimeout(700); t = await p.locator('#rzSheet').innerText(); assert.match(t, /Qancha edi\?/); assert.match(t, /Non · obi non\s+≈ Chorak\s+219 kkal/, 'non — taxminiy chorak (876 emas)'); await p.click('[data-act=itamb][data-k="2"]'); await p.waitForTimeout(300); assert.match(await p.locator('#txOut').innerText(), /438/); assert.equal(await p.locator('[data-act=itamb]').count(), 0);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500); await search(p, 'osh va qwertyzz'); assert.match(await p.locator('#fdRes').innerText(), /Topilmadi|Hammasini/); await p.context().close();
  log('Ko\'p taomli gap: «2 ta tuxum va non» — faqat «Hammasini qo\'shish» («Topilmadi» yo\'q); matn oqimida non — «Qancha edi?», yarim → 438');
  /* 3. tez boshlash: vazn tarixi bo'sh, profil «Kiritilmagan», halqada «Vaqtinchalik hisob», bitta yumshoq taklif */
  p = await mk({}); await p.waitForSelector('[data-act=obsex]'); await p.click('[data-act=obsex][data-v=m]'); await p.click('[data-act=oblater]'); await p.waitForSelector('#mainAdd'); await p.waitForTimeout(900);
  let st = await stOf(p); assert.deepEqual(st.weights, [], 'namunaviy vazn tarixga yozilmadi'); assert.ok(st.prefs.taxminiy);
  assert.equal(await p.locator('#kcNote').count(), 0, 'v70: halqa ostida tushuntirish yo\'q'); assert.equal(await p.locator('#taxChip').count(), 1); assert.match(await tx(p, '#taxChip'), /Hisobni sizga moslaymiz · Profilni to'ldirish/);
  const ring = await p.locator('#kcalBtn').innerText(); assert.match(ring, /Kunlik maqsad/); assert.ok(!/Birinchi ovqatni yozing/.test(ring), 'v70: ring ichida «Birinchi ovqatni yozing» yo\'q');
  await p.click('.rz-tab[data-v=profile]'); await p.waitForTimeout(500); assert.equal(await p.locator('.pf-ti').count(), 0, 'v70: bo\'sh profil — 4 ta katak o\'rniga bitta karta'); assert.match(await tx(p, '#pfHero'), /Hisobni sizga moslaymiz[\s\S]*Yosh, bo'y va vazningizni kiriting[\s\S]*Profilni to'ldirish/);
  await p.click('.rz-tab[data-v=history]'); await p.waitForTimeout(500); t = await p.locator('#rzMain').innerText(); assert.doesNotMatch(t, /\b75\b[^\n]*kg|75,0/); assert.match(await tx(p, '#hkCard'), /Haftalik xulosa uchun hali yozuv yetarli emas/); assert.equal(await p.locator('#hkCard[data-act]').count(), 0);
  const ord = await p.evaluate(() => { const a = [...document.querySelectorAll('#rzMain section, #rzMain .sl-sec')]; return [a.findIndex((x) => x.querySelector('[data-fk=supp], [data-act=feat][data-fk=supp]') || /Vitamin/.test(x.innerText)), a.length]; }); assert.equal(await p.locator('#rzMain [data-act=supp]').count(), 0, 'v70: vitamin kartasi Tarix\'da yo\'q (Imkoniyatlar → Bilim)');
  assert.deepEqual(p.errs, []); await p.context().close();
  log('Tez boshlash: vazn tarixi bo\'sh, profil plitkalari «Kiritilmagan», halqada «Vaqtinchalik hisob», bitta yumshoq taklif; Tarix: 75 kg yo\'q, haftalik xulosa «yetarli emas» (bosilmaydi), vitamin kartasi pastda');
  /* 4. eski foydalanuvchi: namunaviy yozuv tarixdan yashirildi; 0 kg → «—» */
  p = await mk({ st: seed({ prefs: { taxminiy: { t: 1, n: 0 } }, profile: { weight: 75 }, ts: Dt.addDays(TODAY, -3), ws: [[Dt.addDays(TODAY, -3), 75]] }) }); st = await stOf(p); await p.click('.rz-tab[data-v=history]'); await p.waitForTimeout(500);
  assert.match(await p.locator('.sl-weight').innerText(), /Hali vazn kiritilmagan|vazn/i); assert.doesNotMatch(await p.locator('.sl-weight').innerText(), /75/); await p.context().close();
  p = await mk({ st: seed({ profile: { weight: 0, goalWeight: null }, ws: [] }) }); await p.click('.rz-tab[data-v=profile]'); await p.waitForTimeout(500); const t4 = (await p.locator('.pf-ti b').allInnerTexts())[3]; assert.equal(t4, '—'); assert.doesNotMatch(await p.locator('#rzMain').innerText(), /\b0[,.]0 kg|\b0 kg/); await p.context().close();
  log('Eski foydalanuvchi: «Keyinroq» namunaviy 75 kg Tarixda yo\'q (o\'chirilmagan); vazn 0 — «—» (0 kg emas)');
  /* 5. halqa 4 holati + bosh ekran tartibi + matnlar */
  for (const [kc, re1] of [[0, /Kunlik maqsad[\s\S]*kkal/], [900, /Qoldi[\s\S]*kkal/], [3600, /Maqsaddan[\s\S]*kkal yuqori/]]) { p = await mk({ st: seed({ kc }) }); const rt = await p.locator('#kcalBtn').innerText(); assert.match(rt, re1, kc + ': ' + rt); assert.equal(await p.locator('#kcNote').count(), 0);
    if (kc === 900) { const pos = await p.evaluate(() => ['.sl-big', '#bjuCard', '#mealTot', '#actRow', '#wCard'].map((s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY + document.getElementById('rzMain').scrollTop : -1; })); assert.ok(pos.every((x, i) => x >= 0 && (i === 0 || x > pos[i - 1])), 'tartib: halqa → BJU → ovqatlar → qadam/mashg\'ulot → suv: ' + pos);
      assert.deepEqual(await p.locator('#actRow button b').allInnerTexts(), ['Qadam', "Mashg'ulot"]); assert.match(await tx(p, '#kChips'), /^Yeyildi [\d ]+ · Maqsad [\d ]+ ›$/); assert.equal(await p.locator('#ftBtn .n').count(), 0, 'Imkoniyatlar — raqamsiz');
      await p.click('#mainAdd'); await p.waitForTimeout(800); assert.match(await tx(p, '#phBtn'), /Bugun yana 4 ta rasm/); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
      await p.click('.rz-tab[data-v=profile]'); await p.waitForTimeout(500); const pt = await p.locator('#rzMain').innerText(); assert.match(pt, /Ovqat vaqtlariga ajratilmagan/); assert.doesNotMatch(pt, /Farqi yo'q/); assert.match(pt, /Yozuvlaringiz shu qurilmada saqlanadi\. AI \(matn, rasm, ovoz\) uchun yuborilgani saqlanmaydi\./); assert.equal(await p.locator('.rz-priv a[href="/maxfiylik#kalkifit-ai"]').count(), 1);
      assert.doesNotMatch(pt, /Nega sekin ozyapman/); }
    assert.deepEqual(p.errs, []); await p.context().close(); }
  log('Halqa: ovqat yo\'q — «Kunlik maqsad … Birinchi ovqatni yozing», «kkal qoldi», «Maqsaddan … kkal yuqori», ostida «kiritilgan ovqatlar bo\'yicha»; tartib halqa → BJU → ovqatlar → qadam/mashg\'ulot (ixcham qator) → suv; «Kaloriya hisobi ›», Imkoniyatlar raqamsiz, «Bugun yana 4 ta rasm», «Vaqtlarga ajratmaslik», maxfiylik matni + havola');
  /* 6. 360 px + katta shrift: «Qancha edi?» sig'adi (RU, ЎЗ) */
  for (const [lang, re] of [['ru', /Сколько было\?/], ['cyr', /Қанча эди\?/]]) { p = await mk({ st: seed(), w: 360, h: 640, big: true, lang, url: '/kalkifit' }); await search(p, lang === 'ru' ? 'хлеб' : 'non'); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForTimeout(600);
    assert.match(await p.locator('#rzSheet').innerText(), re); const ov = await p.evaluate(() => { const sh = document.getElementById('rzSheet'); return [...sh.querySelectorAll('#fdQuick *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).length + (sh.scrollWidth - sh.clientWidth > 1 ? 100 : 0); }); assert.equal(ov, 0, lang + ': sig\'adi'); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('360 px + katta shrift (RU, ЎЗ): «Qancha edi?» chiplari sig\'adi, gorizontal siljish yo\'q');
} finally { await b.close(); srv.close(); }
console.log('\nHammasi o\'tdi: ' + n + ' ta tekshiruv');
