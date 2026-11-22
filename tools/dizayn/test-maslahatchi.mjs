// KalkiFit «Lola» maslahatchisi (v95): 1) makro holatlari — YAGONA manba (kam / deyarli / bajarildi / oshdi): barcha chegaraviy qiymatlarda matn raqamga zid emas,
// Bugun belgisi (▾ ✓ ▴) va «Maslahat» yorlig'i bir xil; 2) uslub — har matn kaliti har uslubda (uz/ru × hazil/jiddiy, ≥ 4 variant, takrorsiz, neytralga qaytmaydi), eslatmalar;
// 3) jonli maslahatchi — ovqat qo'shilgach «yozyapti…» → javob (taom nomi + raqam), avatar ifodasi, savol → javob ta'siri, reduced-motion.
//   node tools/dizayn/test-maslahatchi.mjs   (SKRINSHOT_DIR — ixtiyoriy)
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), M = require(path.join(ROOT, 'assets/kalkifit-maslahat.js')), X = require(path.join(ROOT, 'assets/kalkifit-maslahat-matn.js'));
const { server, seed, T0, D } = await import(pathToFileURL(path.join(ROOT, 'tools/dizayn/sigmaslik-yadro.mjs')));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const LS = ['uz', 'ru'], MODES = ['hazil', 'jiddiy'];

/* ---------- 1. holat: barcha chegaralar ---------- */
for (const g of [10, 55, 100, 130, 141, 160, 355]) for (let v10 = 0; v10 <= g * 16; v10++) {
  const v = v10 / 10, st = M.holat(v, g), vr = Math.round(v), gr = Math.round(g), mk = M.makro({ p: v, f: v, c: v }, { p: g, f: g, c: g }).p;
  const exp = vr * 100 >= gr * 115 ? 'oshdi' : vr >= gr ? 'bajarildi' : vr * 100 >= gr * 85 ? 'deyarli' : 'kam'; assert.equal(st, exp, v + '/' + g);
  assert.equal(mk.left, Math.max(0, gr - vr)); assert.equal(M.yetdi(st), vr >= gr, 'bajarildi faqat yetganda: ' + v + '/' + g);
  assert.equal(M.belgi(st), vr >= gr ? (st === 'oshdi' ? 'up' : 'ok') : 'dn');
}
assert.deepEqual([M.holat(141, 160), M.makro({ p: 141 }, { p: 160 }).p.left], ['deyarli', 19], '141/160 — deyarli, yana 19 g');
assert.equal(M.holat(159.6, 160), 'bajarildi'); assert.equal(M.holat(159.4, 160), 'deyarli'); assert.equal(M.holat(136, 160), 'deyarli'); assert.equal(M.holat(135.9, 160), 'deyarli'); assert.equal(M.holat(135.4, 160), 'kam'); assert.equal(M.holat(184, 160), 'oshdi'); assert.equal(M.holat(183.4, 160), 'bajarildi');
/* matn raqamga zid emas: har holat matni (oqsil/yog'/uglevod × til × uslub × variant) */
const DONE = /bajarildi|bajardingiz|(?<!deyarli )yetdingiz|(?<!почти )выполнен|в норме|(?<!почти )достигнут|норма есть/i, LEFT = /yana \d+ ?g\b|ещё \d+ ?г|\d+ ?g qoldi|осталось \d/i;
for (const L of LS) for (const m of MODES) for (const k of ['p', 'f', 'c']) for (const [v, g] of [[141, 160], [130, 160], [90, 160], [160, 160], [175, 160], [200, 160]]) {
  const mk = M.makro({ [k]: v }, { [k]: g })[k], list = X[L][m]['mk_' + k + '_' + mk.st]; assert.ok(list && list.length >= 4, L + m + k + mk.st);
  list.forEach((tpl, i) => { const t = M.say('mk_' + k + '_' + mk.st, { left: mk.left, x: mk.x, v: Math.round(v), g }, { lang: L, mode: m, i });
    if (!M.yetdi(mk.st)) assert.ok(!DONE.test(t), 'yetmagan — «bajarildi» yo\'q: ' + t); if (M.yetdi(mk.st)) assert.ok(!LEFT.test(t), 'yetgan — «yana N g» yo\'q: ' + t);
    if (k === 'p' && mk.st === 'deyarli') assert.ok(t.includes(String(mk.left)), 'deyarli — qoldiq soni: ' + t); });
}
for (const L of LS) for (const m of MODES) { const xs = M.xulosa({ tot: { kcal: 2000, p: 141, f: 50, c: 250 }, goals: { p: 160, f: 60, c: 250 }, limit: 2000, floor: 1200, foods: [{ name: 'Osh', kcal: 900 }] }, L, m); assert.ok(!/141 \/ 160/.test(xs.yaxshi), 'kun xulosasi: 141/160 — «bajarildi» emas'); }
log('Holat (yagona manba): kam < 85 % · deyarli 85–99 % (yana N g) · bajarildi 100–114 % · oshdi ≥ 115 % — ekrandagi butun sonlar bilan; 141/160 = deyarli, yana 19 g; matn hech bir chegarada raqamga zid emas');

/* ---------- 2. matnlar: har kalit × til × uslub ---------- */
const KEYS = Object.keys(X.uz.jiddiy); assert.ok(KEYS.length >= 90, 'kalitlar: ' + KEYS.length);
const BAN = /semiz|ozg'in|yalqov|dangasa|ochko'z|\buyat|aybdor|gunoh|jazo|ahmoq|tentak|xunuk|figura|badan|qorin|\bsemir|vazningiz|tanangiz|\bkilo|halol|ҳалол|cho'chqa|choshqa|толст|живот|талия|фигур|ленив|обжор|стыд|позор|виноват|наказ|свин|бекон|голод|диет|переел|объел/i;
const SAMPLE = { x: 18, p: 45, k: 1200, min: 1500, sh: 52, src: 'somsa va qazi', Src: 'Somsa va qazi', n: 3, left: 400, l: 2400, name: 'Osh', pg: 22, pleft: 30, fg: 24, v: 120, g: 130, f: 'Osh', m: 'nonushta', M: 'Nonushta' };
for (const L of LS) for (const m of MODES) {
  assert.deepEqual(Object.keys(X[L][m]).sort(), KEYS.slice().sort(), L + m + ': kalitlar to\'plami bir xil');
  for (const k of KEYS) { const a = X[L][m][k]; assert.ok(Array.isArray(a) && a.length >= 4, L + m + k + ' ≥ 4 variant'); assert.equal(new Set(a).size, a.length, L + m + k + ' takror');
    const other = X[L][m === 'hazil' ? 'jiddiy' : 'hazil'][k]; a.forEach((s) => { assert.ok(!other.includes(s), L + k + ': hazil va jiddiy bir xil: ' + s); const t = M.fillD(s, SAMPLE); assert.ok(!/\{\w+\}/.test(t), L + m + k + ' bo\'sh joy: ' + t); assert.ok(!BAN.test(t), L + m + k + ' taqiqlangan so\'z: ' + t); assert.ok(t.length <= 210, L + m + k + ' uzun: ' + t); if (L === 'uz') assert.ok(!/[а-яё]/i.test(t), 'UZ kirill: ' + t); });
    for (let i = 0; i < a.length; i++) assert.equal(M.say(k, SAMPLE, { lang: L, mode: m, i }), M.fillD(a[i], SAMPLE)); }
}
/* qoida kartalari va kun xulosasi — tanlangan uslub to'plamidan (neytralga qaytmaydi) */
const tplRe = (s) => new RegExp('^' + s.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{\w+\\?\}/g, '.*') + '$', 's');
const inSet = (t, L, m, key) => X[L][m][key].some((s) => tplRe(s).test(t));
for (const L of LS) for (const m of MODES) for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'kam']) for (let i = 0; i < 5; i++) { const t = M.matn({ id, data: { x: 18, p: 45, sh: 52, k: 900, min: 1500, src: [{ name: 'Somsa' }] } }, L, m, i); assert.ok(inSet(t.b, L, m, 'r_' + id) && inSet(t.t, L, m, 'rt_' + id), L + m + id + i + ': ' + t.b); }
for (let k = 0; k < 40; k++) { const last = k % 5; assert.notEqual(M.variant('a', 'hazil', last, k), last, 'ketma-ket takrorlanmaydi'); }
for (const L of LS) for (const m of MODES) { const xs = M.xulosa({ tot: { kcal: 2400, p: 110, f: 80, c: 260 }, goals: { p: 100, f: 60, c: 250 }, limit: 2000, floor: 1200, foods: [{ name: 'Osh', kcal: 900, f: 30 }] }, L, m); assert.ok(inSet(xs.yaxshi, L, m, 'x_okP') && inSet(xs.ogdi, L, m, 'x_offK') && inSet(xs.ertaga, L, m, 'x_nxK'), L + m + ' xulosa: ' + JSON.stringify(xs)); }
/* ilova ishlatadigan har kalit matnlarda bor */
const APP = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8');
const used = new Set([...APP.matchAll(/say\('([a-z]\w*)'/g)].map((x) => x[1]).filter((k) => !/_$/.test(k)).concat([...APP.matchAll(/key = '(re_\w+)'/g)].map((x) => x[1]), [...APP.matchAll(/key: '((?:m|cel|c)_\w+)'/g)].map((x) => x[1]),
  ['g_morning', 'g_day', 'g_evening', 'g_night', 'q_full', 'q_mood', 'qr_full_yes', 'qr_full_mid', 'qr_full_no', 'qr_mood_good', 'qr_mood_ok', 'qr_mood_bad', 'd_over', 'd_low', 'd_ok', 'd_empty'],
  ['p', 'f', 'c'].flatMap((k) => M.STATES.map((s) => 'mk_' + k + '_' + s)), [...APP.matchAll(/tl\w+: '(t_\w+)'/g)].map((x) => x[1]), Object.keys(M.XT.uz).map((k) => 'x_' + k), ['a', 'b', 'c', 'd', 'e', 'f', 'kam'].flatMap((r) => ['r_' + r, 'rt_' + r])));
for (const k of used) assert.ok(KEYS.includes(k), 'ilovadagi kalit matnlarda yo\'q: ' + k);
assert.ok(used.size >= 90, 'ishlatilgan kalitlar: ' + used.size);
/* eslatmalar */
const ES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eslatmalar.json'), 'utf8')), Q = await import(pathToFileURL(path.join(ROOT, 'functions/_lib/eslatma-qoida.js')));
for (const L of LS) for (const k of ['b', 'l', 's', 'd', 'x']) { const a = ES.matn_hazil[L][k]; assert.equal(a.length, 5); assert.equal(new Set(a).size, 5); a.forEach((t) => { assert.ok(!ES.matn[L][k].includes(t)); assert.ok(!BAN.test(t), t); assert.ok(t.length <= 90, t); if (k === 'x') assert.ok(/\{m\}|\{M\}/.test(t), t); }); }
for (const L of LS) { const h = S.remText(ES, L, { meal: 'l', n: 2 }, 'hazil').b, j = S.remText(ES, L, { meal: 'l', n: 2 }, 'jiddiy').b; assert.ok(ES.matn_hazil[L].l.includes(h) && ES.matn[L].l.includes(j)); assert.ok(ES.matn_hazil[L].x.length && !/\{m\}/.test(Q.matn(ES, L, { kind: 'x', miss: 'b', meal: 'd' }, 1, null, 'hazil').b)); }
assert.equal(Q.jadvalTekshir({ b: 510, l: null, d: 1170, u: 'hazil' }), '{"b":510,"l":null,"s":null,"d":1170,"u":"hazil"}'); assert.equal(Q.uslubOf({ jadval: '{"b":510,"u":"hazil"}' }), 'hazil'); assert.equal(Q.uslubOf({ jadval: '{"b":510}' }), 'jiddiy');
log('Matnlar: ' + KEYS.length + ' kalit × uz/ru × hazil/jiddiy (≥ 4 variant, takrorsiz, hazil ≠ jiddiy, taqiqlangan so\'zsiz); qoida kartasi va kun xulosasi tanlangan uslubdan; ilovadagi ' + used.size + ' kalit hammasi bor; eslatmalar (hazil to\'plami, jadvaldagi uslub)');

/* ---------- brauzer ---------- */
const { srv, BASE } = await server(); const b = track(await chromium.launch());
const OUT = process.env.SKRINSHOT_DIR || ''; const shot = async (p, nm) => { if (OUT) try { await p.screenshot({ path: path.join(OUT, nm) }); } catch (e) {} };
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: o.reduced ? 'reduce' : 'no-preference' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', a.st); localStorage.setItem('kalki_lang', a.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {}
    const R = Date, off = new R(new R().setHours(a.hour, 0, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...x) { if (x.length === 0) super(R.now() + off); else super(...x); } static now() { return R.now() + off; } } window.Date = D2; }, { st: JSON.stringify(o.st), lang: o.lang || 'ru', hour: o.hour == null ? 15 : o.hour });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (o.lang === 'uz' ? '/kalkifit' : '/ru/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForSelector('#bjuCard'); await p.waitForTimeout(700); return p;
}
const stP = (prof) => { const s0 = seed({ profile: prof }); return S.plan(s0.profile).macros.p; };
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
try {
  /* 4. Bugun belgisi va «Maslahat» yorlig'i — bir xil manba (chegaralarda) */
  const PG = stP({}); for (const [v, want] of [[Math.round(PG * 0.88), 'deyarli'], [PG - 0.6, 'deyarli'], [PG - 0.4, 'bajarildi'], [PG, 'bajarildi'], [Math.round(PG * 0.8), 'kam'], [Math.round(PG * 1.2), 'oshdi']]) {
    const st = seed({ food: [[T0, 'non', 'b', 400, 0, 5, 60], [T0, 'tovuq', 'l', 600, v, 10, 0]] }); st.prefs.mslMode = 'jiddiy';
    const p = await open({ st }); const row = await p.locator('#bjuCard .mk-row[data-m=p]').evaluate((e) => [e.className.match(/mk-(kam|deyarli|bajarildi|oshdi)/)[1], e.querySelector('.mk-st').className, e.getAttribute('aria-label')]);
    assert.equal(row[0], want, v + '/' + PG + ' Bugun'); assert.ok(row[1].includes(want === 'bajarildi' ? 'mk-ok' : want === 'oshdi' ? 'mk-up' : 'mk-dn'), 'belgi: ' + row[1]);
    await p.click('.rz-tab[data-v=advice]'); await p.waitForSelector('#advMk'); const lab = await txt(p, '#advMk .mk-row[data-m=p] .adv-st'), tip = await txt(p, '#advMk .mk-row[data-m=p]');
    assert.equal(lab, { kam: 'мало', deyarli: 'почти', bajarildi: 'выполнено', oshdi: 'много' }[want], 'Совет yorlig\'i'); assert.ok(row[2].includes(lab), 'aria-label = yorliq');
    if (want === 'deyarli' || want === 'kam') { assert.ok(!DONE.test(tip), 'yetmagan — «выполнена» yo\'q: ' + tip); assert.ok(tip.includes(String(Math.round(PG) - Math.round(v))), 'qoldiq: ' + tip); } else assert.ok(!/ещё \d+ г/.test(tip), tip);
    if (v === Math.round(PG * 0.88)) await shot(p, 'maslahat-deyarli.png'); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('Bugun ▾ ✓ ▴ va «Совет» yorlig\'i bir manbadan: ' + Math.round(PG * 0.88) + '/' + Math.round(PG) + ' — ▾ «почти, ещё N г»; ' + (PG - 0.4) + ' → ✓ «выполнено»; kam / ko\'p');

  /* 5. ovqat qo'shilgach — «yozyapti…» → javob (taom nomi), uslub; reduced-motion — darhol */
  for (const m of MODES) for (const reduced of [false, true]) { if (reduced && m === 'jiddiy') continue;
    const st = seed({ food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'osh', 'l', 500, 15, 20, 60]] }); st.prefs.mslMode = m;
    const p = await open({ st, reduced }); await p.click('#mainAdd'); await p.waitForTimeout(500); await p.fill('#rzSheet #fdQ', 'яйцо'); await p.waitForTimeout(800); await p.locator('[data-act=fadd]').first().click(); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    if (!reduced) { assert.equal(await p.locator('#lolaB[data-typing]').count(), 1, 'yozyapti…'); assert.equal(await p.locator('.lola-av').first().getAttribute('data-mood'), 'think'); const h0 = await p.locator('#lolaB').evaluate((e) => e.offsetHeight); await shot(p, 'lola-yozyapti-' + m + '.png'); await p.waitForTimeout(1500); assert.equal(await p.locator('#lolaB').evaluate((e) => e.offsetHeight), h0, 'matn chiqqanda balandlik o\'zgarmaydi'); }
    else { await p.waitForTimeout(200); }
    assert.equal(await p.locator('#lolaB[data-typing]').count(), 0); const t = await txt(p, '#lolaB'); const ev = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_lola')).ev);
    assert.ok(/^re_/.test(ev.key) && inSet(t, 'ru', m, ev.key), m + ': javob ' + ev.key + ' — ' + t); assert.ok(!inSet(t, 'ru', m === 'hazil' ? 'jiddiy' : 'hazil', ev.key), 'boshqa uslubdan emas'); assert.ok(/яйц/i.test(t) || !/\{name\}/.test(X.ru[m][ev.key].join('')), 'taom nomi: ' + t);
    assert.ok(['happy', 'think', 'worry'].includes(await p.locator('.lola-av').first().getAttribute('data-mood'))); if (!reduced) await shot(p, 'lola-javob-' + m + '.png'); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('Ovqat qo\'shilgach: «Лола печатает…» (avatar o\'ylanadi, balandlik oldindan band) → javob tanlangan uslubda, taom nomi bilan; reduced-motion — darhol');

  /* 6. savol → javob ta'siri; ✕ — 4 kun so'ramaydi */
  { const st = seed({ food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'osh', 'l', 500, 15, 20, 60]] }); st.prefs.mslMode = 'hazil';
    let p = await open({ st, hour: 16 }); await p.waitForSelector('.lola-ans'); assert.equal(await p.locator('.lola-ans [data-act=lolaans]').count(), 3); const q = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_lola')).q);
    await p.locator('.lola-ans [data-act=lolaans]').nth(q.id === 'full' ? 2 : 2).click(); await p.waitForTimeout(400); const L = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_lola')));
    assert.ok(L.q.a && L.fx.d, 'javob saqlandi'); assert.ok(q.id === 'full' ? L.fx.hungry : L.fx.soft, 'ta\'sir: ' + JSON.stringify(L.fx)); const t = await txt(p, '#advCard .lola-b'); assert.ok(inSet(t, 'ru', 'hazil', 'qr_' + q.id + '_' + L.q.a), 'javobga javob: ' + t); await shot(p, 'lola-savol-javob.png');
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('#bjuCard'); await p.waitForTimeout(500); assert.equal(await p.locator('.lola-ans').count(), 0, 'shu kuni savol qayta yo\'q'); await p.context().close();
    const st2 = seed({ food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'osh', 'l', 500, 15, 20, 60]] }); p = await open({ st: st2, hour: 16 }); await p.waitForSelector('.lola-qx'); await p.click('.lola-qx'); await p.waitForTimeout(300); const L2 = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_lola'))); assert.equal(L2.qpause, D.addDays(T0, 4)); assert.equal(await p.locator('.lola-ans').count(), 0); await p.context().close(); }
  log('Savol (2 kunda ≤ 1): 3 javob tugmasi → javobga mos javob, ta\'siri saqlanadi (och — oqsil taklifi / kayfiyat — tanbehsiz kun); «Не сейчас» — 4 kun so\'ralmaydi');

  /* 7. «Совет» — suhbat: Lola boshida (salom pufakchasi), keyin makro tahlil; o'chirilgan — Lola yo'q */
  { const st = seed({ food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'osh', 'l', 500, 15, 20, 60]] }); st.prefs.mslMode = 'jiddiy';
    let p = await open({ st, hour: 10 }); await p.click('.rz-tab[data-v=advice]'); await p.waitForSelector('.lola-chat .lola-h'); const g = await txt(p, '.lola-chat .lola-g'); assert.ok(inSet(g, 'ru', 'jiddiy', 'g_morning'), 'salom: ' + g);
    const tops = await p.evaluate(() => [document.querySelector('.lola-chat').getBoundingClientRect().top, document.getElementById('advMk').getBoundingClientRect().top]); assert.ok(tops[0] < tops[1], 'Lola — makro tahlildan oldin'); await shot(p, 'lola-sovet.png'); assert.deepEqual(p.errs, []); await p.context().close();
    st.prefs.mslMode = 'off'; p = await open({ st }); assert.equal(await p.locator('.lola-h').count(), 0, 'o\'chirilgan — Lola yo\'q'); await p.context().close(); }
  log('«Совет» — suhbat: tepada Lola (salom + bugungi so\'z), keyin makro tahlil; «O\'chirilgan» — Lola ko\'rinmaydi');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
