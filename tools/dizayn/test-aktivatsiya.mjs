// KalkiFit «Aktivatsiya voronkasi» o'lchovi — server (functions/api/stat.js + migrations/aktivatsiya.sql, D1 shim), tarmoqsiz:
// migratsiya (eski qatorlar o'lchanmagan), hodisalar whitelist'i, ilk kundagi ovqat soni (0,1,2,3+), birinchi ovqat BIR marta (faqat ilk-kogorta), bosh ekran belgisi,
// voronka hisobi (platforma bo'yicha, yetilgan kogorta), taqqoslashlar, davr aralashuvi (eski qurilmalar «o'lchanmagan», 0 emas), migratsiyasiz fallback.   node tools/dizayn/test-aktivatsiya.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { d1 } from './d1-sqlite.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/stat.js')).href);
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const R = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE_SQL = [R('migrations/stat.sql'), R('migrations/admin-stat.sql'), R('migrations/manba.sql'), R('migrations/qidiruv.sql'), 'CREATE TABLE push_obuna (id TEXT PRIMARY KEY, kun TEXT)'], AKT = R('migrations/aktivatsiya.sql');
const DAY = 86400000, NOW = Date.parse('2026-11-10T10:00:00Z'), K = (ms) => API.tosh(ms), at = (d, h = 10) => Date.parse(K(NOW - d * DAY) + 'T00:00:00Z') - 5 * 3600000 + h * 3600000;
const U = (i) => '00000000-0000-4000-8000-' + String(i).padStart(12, '0');
const UA = { veb: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130', android: 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile', 'ios-pwa': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1.15' };
const req = (body) => new Request('https://kalki.uz/api/stat', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'Content-Type': 'application/json', 'User-Agent': UA[body.p] || UA.veb }, body: JSON.stringify(body) });
const ENV = (db) => ({ KALKIFIT_DB: db, IP_HASH_SALT: 'sir-tuz', KALKIFIT_ADMIN_PASSWORD: 'admin-sir', STAT_PRUNE_P: '0', KALKI_AI_KV: { get: async () => null, put: async () => {}, delete: async () => {} } });
const send = (env, i, p, h, ms, extra = {}) => API.qabul(req(Object.assign({ q: U(i), p, t: 'uz', h }, extra)), env, ms);

/* 1. migratsiya: eski qatorlar — yangi ustunlar NULL (o'lchanmagan), ilk = 0; qayta yurgizish xato bermaydi (SQLite ADD COLUMN — bir marta; test yangi DB'da) */
const db = d1(BASE_SQL), env = ENV(db);
{ const old = U(900); await send(env, 900, 'veb', [['faol', '', 1], ['ovqat_qoshildi', 'qidiruv', 2]], at(5));          // migratsiyadan OLDIN yozilgan qator (ustunlar yo'q)
  db.raw.exec(AKT); const r = db.raw.prepare('SELECT * FROM stat_qurilma').all()[0];
  assert.deepEqual([r.ilk, r.bk_ovqat, r.birinchi_usul, r.ob_ovqat_vaqt, r.pwa_ornatilgan], [0, null, null, null, null], 'eski qator: o\'lchanmagan (NULL), 0 emas');
  const cols = db.raw.prepare("SELECT name FROM pragma_table_info('stat_qurilma')").all().map((x) => x.name); for (const c of ['bk_ovqat', 'birinchi_usul', 'ob_ovqat_vaqt', 'pwa_ornatilgan', 'ilk']) assert.ok(cols.includes(c), c);
  assert.ok(!cols.some((c) => /ovqat_nom|matn|ism|vazn|yosh|ip\b|email/.test(c)), 'shaxsiy ustun yo\'q');
  log('Migratsiya: ilk, bk_ovqat, birinchi_usul, ob_ovqat_vaqt, pwa_ornatilgan; eski qator — NULL/0 (o\'lchanmagan); shaxsiy ma\'lumot ustuni yo\'q'); }

/* 2. whitelist */
{ const ok = (h) => API.tozala({ q: U(1), p: 'veb', t: 'uz', h }); assert.ok(ok([['ilk_ochilish', '', 1]])); for (const k of ['qidiruv.d5', 'oxirgilar.d30', 'rasm.d120', 'matn.dx', 'ovoz.dn', 'menyu.d5', 'odatdagi.d5', 'kechagidek.d30', 'boshqa.dx']) assert.ok(ok([['birinchi_ovqat', k, 1]]), k);
  for (const k of ['qidiruv', 'osh.d5', 'qidiruv.d6', 'qidiruv.d5.x', 'Qidiruv.d5', 'plov 300 g.d5', '']) assert.equal(ok([['birinchi_ovqat', k, 1]]), null, k); assert.equal(ok([['ilk_ochilish', 'x', 1]]), null);
  assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [['faol', '', 1]], i: 1 }).i, 1); assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [['faol', '', 1]], i: 0 }).i, 0); assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [['faol', '', 1]] }).i, null, 'belgisiz — null (o\'lchanmagan)'); assert.equal(API.tozala({ q: U(1), p: 'veb', t: 'uz', h: [['faol', '', 1]], i: 'ha' }).i, null);
  log('Whitelist: ilk_ochilish; birinchi_ovqat faqat «usul.guruh» (d5/d30/d120/dx/dn) — erkin matn, ovqat nomi, boshqa guruh rad; bosh ekran belgisi i: 1 | 0 | null'); }

/* 3. ilk kogorta: ovqat soni 0/1/2/3+, hodisa bir marta, bosh ekran */
{ const d0 = at(3), first = (i, p, evs, inst) => send(env, i, p, [['faol', '', 1], ['ilk_ochilish', '', 1], ['yangi_foydalanuvchi', 'dir', 1], ['onboarding_tugadi', '', 1]].concat(evs || []), d0, inst == null ? {} : { i: inst });
  await first(1, 'veb', [], 0); await first(2, 'veb', [['ovqat_qoshildi', 'qidiruv', 1]], 1); await first(3, 'android', [['ovqat_qoshildi', 'rasm', 2]], 1); await first(4, 'ios-pwa', [['ovqat_qoshildi', 'qidiruv', 5]], 1); await first(5, 'veb', [['ovqat_qoshildi', 'qidiruv', 1]]);
  const get = async (i) => db.raw.prepare('SELECT * FROM stat_qurilma WHERE q = ? ORDER BY kun').all(await API.qurilma(env, U(i)));
  let r = await get(1); assert.deepEqual([r.length, r[0].ilk, r[0].bk_ovqat, r[0].pwa_ornatilgan], [1, 1, 0, 0], 'ovqatsiz — 0, bosh ekran yo\'q — 0'); assert.equal((await get(2))[0].bk_ovqat, 1); assert.equal((await get(3))[0].bk_ovqat, 2); assert.equal((await get(4))[0].bk_ovqat, 3, '5 ta — 3+ (3)'); assert.equal((await get(5))[0].pwa_ornatilgan, null, 'belgi yuborilmadi — o\'lchanmagan');
  /* shu kunning ikkinchi paketi: ovqat qo'shiladi (ilk bayrog'i paketda yo'q — qatorda bor) va bosh ekran 0 → 1 */
  await send(env, 1, 'veb', [['ovqat_qoshildi', 'qidiruv', 1]], d0 + 3600000, { i: 1 }); r = (await get(1))[0]; assert.deepEqual([r.bk_ovqat, r.pwa_ornatilgan, r.ilk], [1, 1, 1], 'ilk kunning keyingi paketlari ham sanaladi; bosh ekran 0 → 1'); await send(env, 1, 'veb', [['ovqat_qoshildi', 'qidiruv', 1]], d0 + 7200000, { i: 0 }); r = (await get(1))[0]; assert.equal(r.pwa_ornatilgan, 1, '1 → 0 ga qaytmaydi (MAX)');
  await send(env, 1, 'veb', [['ovqat_qoshildi', 'qidiruv', 5]], d0 + 3 * 3600000); assert.equal((await get(1))[0].bk_ovqat, 3, 'cheklov 3');
  /* ikkinchi kun: ilk = 0, bk_ovqat o'zgarmaydi (faqat ilk kun) */
  await send(env, 2, 'veb', [['faol', '', 1], ['ovqat_qoshildi', 'qidiruv', 4]], d0 + DAY); const r2 = await get(2); assert.equal(r2.length, 2); assert.deepEqual(r2.map((x) => [x.ilk, x.bk_ovqat]), [[1, 1], [0, null]], 'ikkinchi kun qatori: o\'lchanmaydi');
  log('Ilk kun: ovqat soni 0 / 1 / 2 / 3+ (5 ta → 3), keyingi paketlar qo\'shiladi, 2-kun qatori NULL; bosh ekran 0/1/NULL (1 → 0 ga qaytmaydi)'); }

/* 4. birinchi ovqat: faqat ilk-kogorta, bir marta; eski qurilma ta'sir qilmaydi */
{ const d0 = at(3); await send(env, 1, 'veb', [['birinchi_ovqat', 'qidiruv.d5', 1]], d0 + 60000); await send(env, 1, 'veb', [['birinchi_ovqat', 'rasm.dx', 1]], d0 + 120000);
  await send(env, 3, 'android', [['birinchi_ovqat', 'rasm.d30', 1]], d0 + 60000); await send(env, 800, 'veb', [['faol', '', 1], ['birinchi_ovqat', 'qidiruv.d5', 1]], d0);          // 800: ilk emas (eski qurilma)
  const g = async (i) => db.raw.prepare('SELECT birinchi_usul, ob_ovqat_vaqt FROM stat_qurilma WHERE q = ?').all(await API.qurilma(env, U(i))).map((x) => ({ ...x }));
  assert.deepEqual(await g(1), [{ birinchi_usul: 'qidiruv', ob_ovqat_vaqt: 'd5' }], 'ikkinchi hodisa bilan qayta yozilmaydi'); assert.deepEqual(await g(3), [{ birinchi_usul: 'rasm', ob_ovqat_vaqt: 'd30' }]); assert.deepEqual(await g(800), [{ birinchi_usul: null, ob_ovqat_vaqt: null }], 'eski qurilma (ilk emas) — o\'lchanmaydi');
  const hod = db.raw.prepare("SELECT hodisa, kalit, SUM(son) AS son FROM stat_kun WHERE hodisa IN ('birinchi_ovqat', 'ilk_ochilish') GROUP BY hodisa, kalit ORDER BY hodisa, kalit").all(); assert.ok(hod.some((x) => x.hodisa === 'ilk_ochilish' && x.son === 5));
  log('Birinchi ovqat: usul + vaqt guruhi faqat ilk-kogortaga, bir marta (qayta yuborilsa o\'zgarmaydi); eski qurilma — o\'lchanmaydi; stat_kun da ham yig\'iladi'); }

/* 5. voronka: platforma bo'yicha, yetilgan kogorta, taqqoslashlar */
const db2 = d1(BASE_SQL.concat(AKT)), env2 = ENV(db2);
{ const put = async (i, p, d, o = {}) => { const ms = at(d); await send(env2, i, p, [['faol', '', 1], ['ilk_ochilish', '', 1]].concat(o.ob ? [['onboarding_tugadi', '', 1]] : [], o.food ? [['ovqat_qoshildi', o.us || 'qidiruv', o.food]] : [], o.bo ? [['birinchi_ovqat', o.bo, 1]] : []), ms, o.i == null ? {} : { i: o.i });
    for (const k of o.back || []) await send(env2, i, p, [['faol', '', 1]], ms + k * DAY); };
  // 10 kun oldin (D1/D3/D7 yetilgan): veb A: ovqat 3 + qaytdi 1,3,7 + pwa; veb B: ovqat 1, qaytdi 1; veb C: ovqatsiz, qaytmadi; android D: ovqat 2 qaytdi 1; PWA E: ob yo'q
  await put(10, 'veb', 10, { ob: 1, food: 3, bo: 'qidiruv.d5', i: 1, back: [1, 3, 7] }); await put(11, 'veb', 10, { ob: 1, food: 1, bo: 'oxirgilar.d30', i: 0, back: [1] }); await put(12, 'veb', 10, { ob: 1, i: 0 }); await put(13, 'android', 10, { ob: 1, food: 2, bo: 'rasm.d5', i: 1, back: [1] }); await put(14, 'ios-pwa', 10, { i: 1 });
  // 2 kun oldin (D1 yetilgan, D3/D7 yetilmagan): ovqat 1, qaytdi; ovqatsiz, qaytmadi. Bugun: yangi (tugamagan kun)
  await put(15, 'veb', 2, { ob: 1, food: 1, bo: 'ovoz.dx', back: [1] }); await put(16, 'veb', 2, { ob: 1 }); await put(17, 'veb', 0, { ob: 1, food: 1, bo: 'qidiruv.d5' });
  // eski qurilma (ilk yo'q) — voronkaga kirmaydi, «eski» sifatida sanaladi
  await send(env2, 700, 'veb', [['faol', '', 1], ['ovqat_qoshildi', 'qidiruv', 3]], at(20)); await send(env2, 701, 'veb', [['faol', '', 1]], at(5));
  const A = await API.aktivatsiya(db2, '2000-01-01', K(NOW), K(NOW)); assert.equal(A.bosh, K(NOW - 10 * DAY), 'o\'lchov boshi = birinchi ilk kun'); assert.equal(A.eski, 2, 'eski qurilmalar soni (0 emas, voronkada yo\'q)');
  const V = A.voronka, J = V.jami; assert.equal(J.yangi, 8); assert.deepEqual(J.ob, { n: 7, N: 8 }, 'onboarding tugadi (14 — ob yo\'q)'); assert.deepEqual([J.b1, J.b3], [{ n: 4, N: 7 }, { n: 1, N: 7 }], 'ilk kunda ≥1 / ≥3 — faqat tugagan kunlar (bugungi 17 kirmaydi)');
  assert.deepEqual(J.d1, { n: 4, N: 7 }, 'D1: yetilgan 7 ta (bugungi kogorta yo\'q): A, B, D, 15 qaytdi'); assert.deepEqual(J.d3, { n: 1, N: 5 }, 'D3: faqat 10 kun oldingi 5 ta'); assert.deepEqual(J.d7, { n: 1, N: 5 });
  assert.deepEqual([V.veb.yangi, V['ios-pwa'].yangi, V.android.yangi], [6, 1, 1]); assert.deepEqual(V.veb.d7, { n: 1, N: 3 }); assert.deepEqual(V.android.d1, { n: 1, N: 1 }); assert.deepEqual(V['ios-pwa'].d1, { n: 0, N: 1 }, 'PWA: qaytmadi');
  assert.deepEqual(J.tq_ovqat, { bor: { n: 4, N: 4 }, yoq: { n: 0, N: 3 } }, '(a) ovqat kiritganlar D1 4/4 (10, 11, 13, 15), kiritmaganlar 0/3 (12, 14, 16)');
  assert.deepEqual(J.tq_pwa.bor, { d1: { n: 2, N: 3 }, d7: { n: 1, N: 3 } }); assert.deepEqual(J.tq_pwa.yoq, { d1: { n: 1, N: 2 }, d7: { n: 0, N: 2 } }); assert.equal(J.tq_pwa.olchanmagan, 3, '(b) bosh ekran belgisi yo\'q: 15, 16, 17');
  assert.deepEqual(J.usul, { qidiruv: 2, oxirgilar: 1, rasm: 1, ovoz: 1 }); assert.equal(J.usul_jami, 5);
  assert.deepEqual(J.vaqt, { d5: 2, d30: 1, d120: 0, dx: 1, dn: 0, yoq: 3 }, 'vaqt guruhlari (tugagan kunlar): 0–5 daq 2, 5–30 1, 2 soat+ 1, birinchi kuni yo\'q 3'); assert.equal(J.vaqt_N, 7);
  const empty = V.android.tq_pwa.yoq.d7; assert.deepEqual(empty, { n: 0, N: 0 }, 'kogorta yo\'q — N = 0 (admin: «yetilmagan»)');
  /* davr aralashuvi: davr o'lchov boshlanishidan keyin boshlansa — faqat shu davr; hech narsa yo'q */
  const A2 = await API.aktivatsiya(db2, K(NOW - 3 * DAY), K(NOW), K(NOW)); assert.equal(A2.voronka.jami.yangi, 3, 'davr o\'lchov boshlanishidan keyin boshlansa — faqat shu davr (2 kun oldingi 2 ta + bugun 1 ta)'); assert.equal(A2.voronka.jami.d7.N, 0, 'shu davrda D7 yetilgan kogorta yo\'q');
  const Ez = d1(BASE_SQL.concat(AKT)); await send(ENV(Ez), 5, 'veb', [['faol', '', 1]], at(2)); const A3 = await API.aktivatsiya(Ez, '2000-01-01', K(NOW), K(NOW)); assert.deepEqual([A3.bosh, A3.voronka, A3.eski], [null, null, 1], 'ilk hodisa hali kelmagan — voronka null («o\'lchanmagan»), eski = 1');
  const rep = await API.hisobot(db2, 0, NOW); assert.ok(rep.aktivatsiya && rep.aktivatsiya.voronka.jami.yangi === 8, 'hisobotda');
  log('Voronka: ilk 8 → onboarding 7 → ≥1 ovqat 4/7 → ≥3 ovqat 1/7 → D1 4/7, D3 1/5, D7 1/5 (platforma bo\'yicha ham); taqqoslash (a) 4/4 vs 0/3, (b) bosh ekran D1/D7; usul va vaqt guruhlari; eski qurilmalar «eski» (voronkada yo\'q); ilk hodisasiz — null'); }

/* 6. migratsiya yurgizilmagan bo'lsa statistika to'xtamaydi, hisobot null */
{ const dbM = d1(BASE_SQL), envM = ENV(dbM); const r = await send(envM, 1, 'veb', [['faol', '', 1], ['ilk_ochilish', '', 1], ['ovqat_qoshildi', 'qidiruv', 1], ['birinchi_ovqat', 'qidiruv.d5', 1]], at(1), { i: 1 }); assert.equal(r.status, 204);
  assert.equal(dbM.raw.prepare('SELECT COUNT(*) AS n FROM stat_qurilma').get().n, 1, 'eski INSERT ga tushdi — qurilma qatori yozildi'); assert.equal(dbM.raw.prepare("SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ovqat_qoshildi'").get().n, 1);
  assert.equal(await API.aktivatsiya(dbM, '2000-01-01', K(NOW), K(NOW)), null, 'ustunlar yo\'q — null («o\'lchanmagan»)'); log('Migratsiyasiz (aktivatsiya.sql yo\'q): hodisalar yozilishda davom etadi, hisobot null — statistika to\'xtamaydi'); }

/* 7. maxfiylik: yangi ustunlar faqat qat'iy belgilar */
{ const bad = db2.raw.prepare("SELECT birinchi_usul AS u, ob_ovqat_vaqt AS v FROM stat_qurilma WHERE birinchi_usul IS NOT NULL").all(); assert.ok(bad.every((x) => /^(qidiruv|oxirgilar|rasm|matn|ovoz|menyu|odatdagi|kechagidek|retsept|tavsiya|boshqa)$/.test(x.u) && /^(d5|d30|d120|dx|dn)$/.test(x.v)), 'faqat whitelist belgilari');
  const dump = JSON.stringify(db2.raw.prepare('SELECT * FROM stat_qurilma').all()); assert.ok(!dump.includes('0000000') && !/osh|plov|somsa/i.test(dump), 'xom mijoz_id va ovqat nomi saqlanmaydi'); log('Maxfiylik: yangi ustunlarda faqat qat\'iy belgilar (usul, vaqt guruhi, 0/1/3+); xom mijoz_id, ovqat nomi, matn yo\'q'); }
console.log('\nHammasi o\'tdi: ' + n + ' ta tekshiruv');
