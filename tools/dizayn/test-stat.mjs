// KalkiFit anonim statistika: server (functions/api/stat.js) — whitelist, rate-limit, demo/preview/bot hisoblanmasligi, xom mijoz_id saqlanmasligi, 100 kunlik tozalash,
// DAU/WAU/retention hisobi, admin himoyasi; mijoz (assets/stat-kun.js) — demo/preview/webdriver o'chiq, navbat; PR matni (assets/stat-pr.js) — faqat haqiqiy raqamlar, UZ/ЎЗ/RU.
//   node tools/dizayn/test-stat.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url'; import { createRequire } from 'node:module';
import { d1 } from './d1-sqlite.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/stat.js')).href), C = require(path.join(ROOT, 'assets/stat-kun.js')), PR = require(path.join(ROOT, 'assets/stat-pr.js')), TR = require(path.join(ROOT, 'assets/translit.js'));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const SQL = [fs.readFileSync(path.join(ROOT, 'migrations/stat.sql'), 'utf8'), fs.readFileSync(path.join(ROOT, 'migrations/admin-stat.sql'), 'utf8'), fs.readFileSync(path.join(ROOT, 'migrations/qidiruv.sql'), 'utf8'), 'CREATE TABLE push_obuna (id TEXT PRIMARY KEY, endpoint TEXT, p256dh TEXT, auth TEXT, til TEXT, akkaunt_id TEXT, yaratilgan INTEGER, oxirgi_hafta TEXT, xato INTEGER);'];
const DAY = 86400000, NOW = Date.parse('2026-10-22T10:00:00Z'), K = (ms) => API.tosh(ms);
const U = (i) => '00000000-0000-4000-8000-' + String(i).padStart(12, '0');
const req = (body, h = {}) => new Request('https://kalki.uz/api/stat', { method: 'POST', headers: Object.assign({ Origin: 'https://kalki.uz', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile' }, h), body: JSON.stringify(body) });
const ENV = (db) => ({ KALKIFIT_DB: db, IP_HASH_SALT: 'sir-tuz', KALKIFIT_ADMIN_PASSWORD: 'admin-sir', STAT_PRUNE_P: '0', KALKI_AI_KV: (() => { const m = new Map(); return { get: async (k) => (m.has(k) ? m.get(k) : null), put: async (k, v) => { m.set(k, v); }, delete: async (k) => { m.delete(k); } }; })() });
/* 1. whitelist */
{ assert.ok(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [['faol', '', 1], ['ovqat_qoshildi', 'qidiruv', 2], ['ai_sorov', 'rasm.limit', 1], ['buyurtma_hamkor', 'uzum', 1], ['qadam_ulandi', 'hc', 1], ['ilova_yangilandi', '1.0.4', 1]] }));
  for (const bad of [[['erkin_matn', '', 1]], [['ovqat_qoshildi', 'osh 300 g', 1]], [['ai_sorov', 'rasm', 1]], [['buyurtma_hamkor', 'evil', 1]], [['faol', 'x', 1]], [['push_yuborildi', '', 1]], [['ovqat_qoshildi', 'qidiruv', 50]]]) assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: bad }), null, JSON.stringify(bad));
  assert.equal(API.tozala({ q: 'ali@mail.uz', p: 'veb', t: 'uz', h: [['faol', '', 1]] }), null, 'mijoz_id faqat UUID'); assert.equal(API.tozala({ q: U(1), p: 'windows', t: 'uz', h: [] }), null); assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'en', h: [] }), null);
  assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: new Array(31).fill(['faol', '', 1]) }), null, '≤ 30 qator');
  log('Whitelist: faqat ruxsat etilgan hodisa va kalitlar (usul, AI tur.natija, hamkor, manba, versiya); erkin matn, taom/porsiya, server hodisasi (push_yuborildi), n > 20, UUID bo\'lmagan id, noma\'lum platforma/til, 30+ qator — rad'); }
/* 2. qabul: xom mijoz_id yo'q, hisoblanmaydiganlar, rate-limit */
const db = d1(SQL), env = ENV(db);
{ let r = await API.qabul(req({ q: U(1), p: 'veb', t: 'uz', h: [['faol', '', 1], ['yangi_foydalanuvchi', '', 1], ['ovqat_qoshildi', 'qidiruv', 1]] }), env, NOW); assert.equal(r.status, 204);
  const rows = db.raw.prepare('SELECT * FROM stat_qurilma').all(); assert.equal(rows.length, 1); assert.match(rows[0].q, /^[0-9a-f]{16}$/); const dump = JSON.stringify(db.raw.prepare("SELECT * FROM stat_qurilma").all()) + JSON.stringify(db.raw.prepare('SELECT * FROM stat_kun').all());
  assert.ok(!dump.includes(U(1)) && !dump.includes('000000000001'), 'xom mijoz_id saqlanmaydi'); assert.equal(rows[0].q, await API.qurilma(env, U(1)), 'xesh — sirli tuz bilan'); assert.notEqual(rows[0].q, await API.qurilma({ IP_HASH_SALT: 'boshqa' }, U(1)), 'tuz o\'zgarsa xesh boshqa');
  assert.deepEqual(db.raw.prepare('SELECT hodisa, kalit, platforma, son FROM stat_kun ORDER BY hodisa').all().map((x) => Object.values(x)), [['ovqat_qoshildi', 'qidiruv', 'veb', 1], ['yangi_foydalanuvchi', '', 'veb', 1]], 'faol — faqat qurilma qatori (stat_kun ga emas)');
  const cols = db.raw.prepare("SELECT name FROM pragma_table_info('stat_qurilma')").all().map((x) => x.name).concat(db.raw.prepare("SELECT name FROM pragma_table_info('stat_kun')").all().map((x) => x.name)); assert.ok(!cols.some((c) => /ip|email|ism|vazn|yosh|ovqat|mijoz/.test(c)), 'shaxsiy ustun yo\'q: ' + cols);
  const before = db.raw.prepare('SELECT COUNT(*) AS n FROM stat_kun').get().n;
  for (const [h, why] of [[{ Origin: 'https://oqsil.kalki-10y.pages.dev' }, 'preview'], [{ 'User-Agent': 'Mozilla/5.0 HeadlessChrome/130' }, 'headless'], [{ 'User-Agent': 'Googlebot/2.1' }, 'bot'], [{ Origin: 'https://evil.example' }, 'begona sayt'], [{ Origin: '' }, 'Origin yo\'q']]) {
    r = await API.qabul(req({ q: U(2), p: 'veb', t: 'uz', h: [['faol', '', 1], ['suv_qoshildi', '', 1]] }, h), env, NOW); assert.equal(r.status, 204, why); }
  assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM stat_qurilma').get().n, 1, 'preview/headless/bot/begona — hisoblanmadi'); assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM stat_kun').get().n, before);
  r = await API.qabul(new Request('https://kalki.uz/api/stat', { method: 'POST', headers: { Origin: 'https://kalki.uz' }, body: '{bad' }), env, NOW); assert.equal(r.status, 204, 'buzuq JSON — jim');
  for (let i = 0; i < 25; i++) await API.qabul(req({ q: U(3), p: 'android', t: 'ru', h: [['suv_qoshildi', '', 20]] }), env, NOW);
  const s3 = db.raw.prepare("SELECT son FROM stat_kun WHERE hodisa = 'suv_qoshildi' AND platforma = 'android'").get().son; assert.ok(s3 <= API.DEV_CAP && s3 >= 380, 'rate-limit: qurilma kuniga ≤ ' + API.DEV_CAP + ' hodisa (' + s3 + ')');
  log('Qabul: 204 (har doim jim); qurilma = 16 belgili xesh (sirli tuz bilan), xom mijoz_id va shaxsiy ustun yo\'q; preview (*.pages.dev), headless, bot, begona Origin — hisoblanmaydi; buzuq JSON jim; qurilma kuniga ≤ 400 hodisa'); }
/* 3. DAU/WAU/MAU, yangi, retention, 100 kunlik tozalash */
{ const db2 = d1(SQL), e2 = ENV(db2), day = (i) => NOW - i * DAY;
  const go = (id, i, ev = [['faol', '', 1]], p = 'veb', t = 'uz') => API.qabul(req({ q: U(id), p, t, h: ev }), e2, day(i));
  // 4 ta yangi qurilma 10 kun oldin: 1,2 ertasi qaytdi; 1 — 7-kuni ham; 3,4 qaytmadi
  for (const id of [11, 12, 13, 14]) await go(id, 10, [['faol', '', 1], ['yangi_foydalanuvchi', '', 1], ['onboarding_tugadi', '', 1]].slice(0, id === 14 ? 2 : 3));
  await go(11, 9); await go(12, 9); await go(11, 3); await go(20, 0, [['faol', '', 1]], 'android', 'ru'); await go(21, 0, [['faol', '', 1]], 'ios-pwa', 'cyr'); await go(11, 0);
  const k30 = await API.kpi(db2, K(day(29)), K(day(0)), K(NOW));
  assert.equal(k30.yangi, 4); assert.equal(k30.ret1, 50, '1-kun retention: 4 dan 2 = 50%'); assert.equal(k30.ret7, 25, '7-kun: 4 dan 1 = 25%'); assert.equal(k30.onboarding, 75, 'onboarding: 3/4'); assert.equal(k30.mau, 6); assert.equal(k30.wau, 3, 'WAU: so\'nggi 7 kun — 11, 20, 21');
  const k1 = await API.kpi(db2, K(NOW), K(NOW), K(NOW)); assert.equal(k1.dau, 3, 'bugungi DAU = 3');
  const rep = await API.hisobot(db2, 30, NOW); assert.equal(rep.seriya.length, 30); assert.equal(rep.seriya.at(-1).dau, 3); assert.equal(rep.seriya.find((x) => x.kun === K(day(10))).yangi, 4);
  assert.deepEqual(rep.platforma.map((x) => [x.k, x.n]).sort(), [['android', 1], ['ios-pwa', 1], ['veb', 4]]);
  // 100 kunlik tozalash: 105 kun oldingi qator stat_yig ga o'tadi va o'chadi
  assert.equal(API.KEEP_DAYS, 100); await go(30, 105, [['faol', '', 1], ['yangi_foydalanuvchi', '', 1]]); await go(31, 105); assert.equal(db2.raw.prepare('SELECT COUNT(*) AS n FROM stat_qurilma WHERE kun = ?').get(K(day(105))).n, 2);
  await API.tozalash(db2, NOW); assert.equal(db2.raw.prepare('SELECT COUNT(*) AS n FROM stat_qurilma WHERE kun < ?').get(K(day(100))).n, 0, '100 kundan eski qurilma qatorlari o\'chdi');
  assert.deepEqual({ ...db2.raw.prepare('SELECT dau, yangi FROM stat_yig WHERE kun = ?').get(K(day(105))) }, { dau: 2, yangi: 1 }, 'yig\'ma son qoldi'); assert.equal(db2.raw.prepare('SELECT COUNT(*) AS n FROM stat_qurilma WHERE kun = ?').get(K(day(10))).n, 4, '100 kun ichidagilar qoladi');
  const all = await API.hisobot(db2, 0, NOW); assert.equal(all.kpi.yangi, 5, 'Hammasi: eski (yig\'ma) yangi ham hisobda');
  log('Hisob: DAU (bugun 3), WAU 3, MAU 6, yangi 4, onboarding 75%, 1-kun retention 50%, 7-kun 25%, 30 kunlik seriya, platforma ulushi; 100 kundan eski qurilma qatorlari o\'chadi, sonlari stat_yig da qoladi («Hammasi» davrida ham)'); }
/* 4. admin himoyasi */
{ const env3 = Object.assign(ENV(d1(SQL)), { KALKI_AI_KV: (() => { const m = {}; return { get: async (k) => m[k] || null, put: async (k, v) => { m[k] = v; } }; })() });
  const g = (h) => API.onRequest({ request: new Request('https://kalki.uz/api/stat?davr=7', { headers: h || {} }), env: env3 });
  assert.equal((await g()).status, 401); assert.equal((await g({ 'X-Admin-Password': 'xato' })).status, 401); const ok = await g({ 'X-Admin-Password': 'admin-sir' }); assert.equal(ok.status, 200); const j = await ok.json(); assert.equal(j.davr, 7); assert.ok(j.kpi && j.seriya && j.push);
  for (let i = 0; i < 3; i++) await g({ 'X-Admin-Password': 'x' + i }); assert.equal((await g({ 'X-Admin-Password': 'admin-sir' })).status, 200, '4 xato (yuqoridagi bilan) — hali ochiq'); await g({ 'X-Admin-Password': 'x5' }); assert.equal((await g({ 'X-Admin-Password': 'admin-sir' })).status, 429, '5 xato urinishdan keyin — 429');
  assert.equal((await API.onRequest({ request: new Request('https://kalki.uz/api/stat', { method: 'PUT' }), env: env3 })).status, 405); assert.equal((await API.onRequest({ request: new Request('https://kalki.uz/api/stat'), env: {} })).status, 503);
  const page = fs.readFileSync(path.join(ROOT, 'admin/kalkifit-statistika.html'), 'utf8'); assert.match(page, /noindex,nofollow/); assert.match(page, /\/api\/admin\/kirish/); assert.ok(!/X-Admin-Password/.test(page), 'sahifa — HttpOnly sessiya (parol sarlavhada yuborilmaydi)'); assert.ok(!/admin-sir|KALKIFIT_ADMIN_PASSWORD/.test(page), 'sahifada parol yo\'q');
  log('Admin: parolsiz/noto\'g\'ri — 401, 5 xato — 429 (15 daqiqa), to\'g\'ri parol — hisobot; sahifa noindex, sessiya orqali, parol sahifada yo\'q'); }
/* 5. mijoz moduli */
{ const SENT = []; const mem = () => { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; };
  const win = (o) => Object.assign({ location: { hostname: 'kalki.uz', search: '' }, navigator: { userAgent: 'Mozilla/5.0 Chrome', webdriver: false, sendBeacon: (u, b) => { SENT.push(u); return true; } }, Blob: class { constructor(a) { this.a = a; } }, addEventListener() {}, document: { addEventListener() {} } }, o || {});
  for (const [w, why] of [[win({ location: { hostname: 'kalki.uz', search: '?demo=1' } }), 'demo'], [win({ location: { hostname: 'oqsil.kalki-10y.pages.dev', search: '' } }), 'preview'], [win({ navigator: { userAgent: 'x', webdriver: true } }), 'webdriver'], [win({ navigator: { userAgent: 'Mozilla HeadlessChrome' } }), 'headless']]) {
    const s = C.create({ win: w, storage: mem(), cid: () => U(1) }); assert.equal(s.disabled(), true, why); assert.equal(s.add('faol'), false); }
  const w = win(), st = mem(), s = C.create({ win: w, storage: st, cid: () => U(1), platform: () => 'android', lang: () => 'ru', delay: 1e9 }); assert.equal(s.disabled(), false);
  assert.equal(s.faol(), true); assert.equal(s.faol(), false, 'faol — kuniga 1 marta'); s.add('ovqat_qoshildi', 'qidiruv'); s.add('ovqat_qoshildi', 'qidiruv'); assert.deepEqual(s.queue(), [['faol', '', 1], ['ovqat_qoshildi', 'qidiruv', 2]], 'bir xillari birlashadi');
  assert.equal(s.flush(), true); assert.deepEqual(SENT, ['/api/stat'], 'sendBeacon'); assert.deepEqual(s.queue(), []);
  const src = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'); assert.ok(src.includes('STAT.faol()'), 'faol — kuniga 1'); for (const h of ['yangi_foydalanuvchi', 'til_tanlandi', 'onboarding_tugadi', 'onboarding_keyinroq', 'ovqat_qoshildi', 'qidiruv_topilmadi', 'ai_sorov', 'suv_qoshildi', 'qadam_ulandi', 'baliq_kuni_obuna', 'baliq_kuni_bekor', 'push_bosildi', 'ilova_yangilandi', 'hazil_yopildi']) assert.ok(src.includes("'" + h + "'"), 'ilovada hodisa ulanmagan: ' + h);
  log('Mijoz: demo, preview, webdriver/headless — o\'chiq; «faol» kuniga 1; bir xil hodisalar birlashadi; sendBeacon; ilovada asosiy hodisalar ulangan'); }
/* 6. PR matni */
{ const rep = { davr: 7, dan: '2026-10-16', gacha: '2026-10-22', kpi: { dau: 41.3, wau: 120, mau: 260, yangi: 55, onboarding: 72.5, ret1: 38, ret7: 21, apk: 14, ai: 90, baliq: 33 }, oldingi: { yangi: 50 }, funksiyalar: [{ hodisa: 'ovqat_qoshildi', kalit: 'qidiruv', son: 400 }, { hodisa: 'suv_qoshildi', kalit: '', son: 120 }], platforma: [{ k: 'veb', n: 60 }, { k: 'android', n: 40 }], til: [{ k: 'uz', n: 70 }, { k: 'ru', n: 30 }] };
  const uz = PR.build(rep, 'uz'), ru = PR.build(rep, 'ru'), cy = PR.build(rep, 'cyr', TR.translit), L = uz.split('\n');
  assert.ok(L.length >= 8 && L.length <= 11, '8–10 qator (+sarlavha): ' + L.length); assert.match(uz, /kuniga o'rtacha 41,3, haftasiga 120, oyiga 260/); assert.match(uz, /Yangi foydalanuvchilar: 55 \(oldingi davrga nisbatan \+10%\)/); assert.match(uz, /Eng ko'p ishlatilgan funksiya: ovqat yozish \(400 marta\)/); assert.match(uz, /veb 60%, Android 40%, iPhone 0%/);
  assert.match(ru, /Новых пользователей: 55 \(\+10% к прошлому периоду\)/); assert.match(cy, /Фаол фойдаланувчилар/); assert.ok(!/[a-z]{4,}/.test(cy.replace(/KalkiFit|Android|iPhone|AI/g, '')), 'ЎЗ — kirill');
  const empty = PR.build({ davr: 1, dan: '2026-10-22', gacha: '2026-10-22', kpi: { dau: 0, wau: 0, mau: 0, yangi: 0, onboarding: null, ret1: null, ret7: null, apk: 0, ai: 0, baliq: 0 }, oldingi: null, funksiyalar: [], platforma: [], til: [] }, 'uz');
  assert.equal(empty.split('\n').length, 1, 'raqam yo\'q bo\'lsa — o\'ylab topilgan qator yo\'q (faqat sarlavha)'); assert.doesNotMatch(uz + ru, /halol|ҳалол/i);
  log('PR matni: 8–10 qator, faqat haqiqiy raqamlar (yo\'q qiymat — qator yo\'q), o\'zgarish % oldingi davrga, UZ/RU, ЎЗ — translit'); }
/* v52: AI natija voronkasi, qaytish (D1/D7/D30) platforma bo'yicha, veb → ilova / akkaunt kunlar bo'yicha */
{ const db3 = d1(SQL), e3 = ENV(db3), day = (i) => NOW - i * DAY;
  const go = (id, i, ev, p = 'veb') => API.qabul(req({ q: U(id), p, t: 'uz', h: ev }), e3, day(i));
  assert.ok(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [['ai_natija', 'ovoz.ochildi', 1], ['ai_natija', 'rasm.qt30', 1], ['ai_natija', 'menyu.yt180', 1], ['ai_natija', 'matn.bosh', 1], ['karta', 'ilova.bosildi', 1], ['karta', 'akkaunt.korsatildi', 1]] }));
  for (const bad of [['ai_natija', 'ovoz', 1], ['ai_natija', 'retsept.ochildi', 1], ['ai_natija', 'ovoz.qt5', 1], ['karta', 'ilova', 1], ['karta', 'boshqa.bosildi', 1]]) assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [bad] }), null, bad.join(' '));
  await go(1, 1, [['faol', '', 1], ['ai_sorov', 'ovoz.ok', 4], ['ai_natija', 'ovoz.ochildi', 4], ['ai_natija', 'ovoz.tahrir', 2], ['ai_natija', 'ovoz.qoshildi', 3], ['ai_natija', 'ovoz.qt30', 3], ['ai_natija', 'ovoz.yopildi', 1], ['ai_natija', 'ovoz.yt10', 1], ['ovqat_qoshildi', 'ovoz', 3]]);
  await go(2, 1, [['ai_sorov', 'rasm.ok', 5], ['ai_natija', 'rasm.ochildi', 5], ['ai_natija', 'rasm.qoshildi', 4], ['ai_natija', 'rasm.bosh', 1], ['ai_natija', 'matn.ochildi', 2], ['ai_natija', 'matn.qoshildi', 1]], 'android');
  const v = await API.voronka(db3, K(day(29)), K(NOW)), V = Object.fromEntries(v.map((x) => [x.usul, x]));
  assert.deepEqual([V.ovoz.tanidi, V.ovoz.ochildi, V.ovoz.tahrir, V.ovoz.qoshildi, V.ovoz.yopildi, V.ovoz.ovqat, V.ovoz.foiz, V.ovoz.qt['30'], V.ovoz.yt['10']], [4, 4, 2, 3, 1, 3, 75, 3, 1], 'ovoz: 4 tanidi → 3 qo\'shildi = 75%');
  assert.deepEqual([V.rasm.foiz, V.rasm.bosh], [80, 1]); assert.equal(V.matn.foiz, 50, 'matn: ochildi asos (lokal tahlil)'); assert.equal(V.menyu.foiz, null, 'ma\'lumot yo\'q — null');
  /* qaytish platforma bo'yicha: veb 2 yangi (1 ta ertasi qaytdi), android 1 yangi (7-kuni qaytdi) */
  for (const [id, p] of [[41, 'veb'], [42, 'veb'], [43, 'android']]) await go(id, 10, [['faol', '', 1], ['yangi_foydalanuvchi', '', 1]], p);
  await go(41, 9, [['faol', '', 1]]); await go(43, 3, [['faol', '', 1]], 'android');
  const q = Object.fromEntries((await API.retPlat(db3, K(day(29)), K(NOW), K(NOW))).map((x) => [x.platforma, x]));
  assert.deepEqual([q.veb.yangi, q.veb.d1, q.veb.d7], [2, 50, 0]); assert.deepEqual([q.android.yangi, q.android.d1, q.android.d7], [1, 0, 100]); assert.equal(q['ios-pwa'].d1, null, 'iPhone: yangi yo\'q — null'); assert.equal(q.veb.d30, null, '30 kun o\'tmagan — null');
  /* kunlar bo'yicha konversiya */
  await go(44, 2, [['faol', '', 1], ['karta', 'ilova.korsatildi', 1], ['karta', 'ilova.bosildi', 1], ['apk_yuklandi', '', 1], ['karta', 'akkaunt.korsatildi', 1]]);
  const kk = await API.konvKun(db3, K(day(29)), K(NOW)), r2 = kk.find((x) => x.kun === K(day(2)));
  assert.equal(kk.length, 30); assert.deepEqual([r2.veb, r2.ilova_k, r2.ilova_b, r2.apk, r2.akk_k, r2.akk_b], [1, 1, 1, 1, 1, 0]); assert.equal(kk.find((x) => x.kun === K(day(10))).yangi_android, 1);
  const rep = await API.hisobot(db3, 30, NOW); assert.ok(Array.isArray(rep.voronka) && Array.isArray(rep.qaytish) && Array.isArray(rep.konv_kun), 'hisobotda yangi bo\'limlar');
  log('v52: ai_natija (ovoz/rasm/matn/menyu × ochildi/tahrir/ochirildi/qoshildi/yopildi/bosh/qt·yt soniya) va karta (ilova/ekran/akkaunt × ko\'rsatildi/bosildi/yopildi) — qat\'iy; voronka (ovoz 75%, rasm 80%, matn — ochildi asos), D1/D7/D30 platforma bo\'yicha, kunlik konversiya'); }
/* v54: «Afsona yoki haqiqat?» — ko'rsatildi, javoblar, to'g'ri %, eng ko'p adashilgan 5 ta, ulashildi, kunning savoli orqali kirish % */
{ const db4 = d1(SQL), e4 = ENV(db4), day = (i) => NOW - i * DAY; const go = (id, ev) => API.qabul(req({ q: U(id), p: 'veb', t: 'uz', h: ev }), e4, day(1));
  for (const bad of [['afsona', 'boshqa', 1], ['afsona_javob', 'a1.ok', 1], ['afsona_javob', 'a01.togri', 1], ['afsona', 'kirish.sayt', 1]]) assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [bad] }), null, bad.join(' '));
  await go(51, [['afsona', 'korsatildi', 3], ['afsona', 'kirish.kun', 3], ['afsona', 'kirish.feat', 1], ['afsona', 'ulashildi', 1], ['afsona_javob', 'a01.ok', 4], ['afsona_javob', 'a02.xato', 3], ['afsona_javob', 'a02.ok', 1], ['afsona_javob', 'a09.xato', 5], ['afsona_javob', 'a09.ok', 5], ['afsona_javob', 'a14.xato', 1]]);
  const a = await API.afsona(db4, K(day(29)), K(NOW));
  assert.deepEqual([a.korsatildi, a.javob, a.ok, a.foiz, a.ulashildi, a.kun_foiz], [3, 19, 10, 52.6, 1, 75]); assert.deepEqual(a.adash.map((x) => [x.id, x.xato, x.jami, x.foiz]), [['a09', 5, 10, 50], ['a02', 3, 4, 75], ['a14', 1, 1, 100]]);
  assert.ok((await API.hisobot(db4, 30, NOW)).afsona, 'hisobotda');
  log('v54: afsona (korsatildi/kirish.kun|feat/ulashildi) va afsona_javob (aNN.ok|xato) — qat\'iy; javoblar 19, to\'g\'ri 52,6%, eng ko\'p adashilgan (a09, a02, a14), kunning savoli orqali kirish 75%'); }
console.log('\n' + n + '/' + n + ' OK');
