// KalkiFit v88 «Ovqat eslatmalari» — sof mantiq va server: S.remPlan/remDay (yozilgan bo'lsa kelmaydi, kechki — o'tkazib yuborilgan, ≤3/kun, siyrak), S.remSparseDue,
// matnlar (har kuni boshqacha, uz/ru), functions/_lib/eslatma-qoida.js (vaqt mintaqasi, kun almashinuvi, siyraklashish), /api/push/eslatma|yozildi|bosildi (D1 mock),
// tools/push-yubor.js --eslatma (yuborish/o'tkazish/siyrak, statistika), maxfiylik va sw.js.   node tools/dizayn/test-eslatma.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), D = S.dates, TX = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eslatmalar.json'), 'utf8'));
const Q = await import(pathToFileURL(path.join(ROOT, 'functions/_lib/eslatma-qoida.js')).href), Y = require(path.join(ROOT, 'tools/push-yubor.js'));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const at = (d, hh, mm = 0) => { const p = D.parse(d); return new Date(p.y, p.m - 1, p.d, hh, mm).getTime(); };
const T0 = '2026-11-18', st0 = () => { const st = S.emptyState(); st.setup = true; return st; };
/* 1. sozlama: standart vaqtlar (08:30 / 13:30 / 19:30, tamaddi o'chiq), noto'g'ri qiymat — standart */
let c = S.remCfg({}); assert.equal(c.on, false); assert.deepEqual([c.m.b.t, c.m.l.t, c.m.d.t, c.m.s.t], [510, 810, 1170, 990]); assert.deepEqual([c.m.b.on, c.m.l.on, c.m.d.on, c.m.s.on], [true, true, true, false]);
c = S.remCfg({ on: 1, m: { b: { on: false, t: 9999 }, s: { on: true, t: 600 } } }); assert.equal(c.m.b.t, 510); assert.equal(c.m.b.on, false); assert.equal(c.m.s.t, 600);
log('sozlama: standart 08:30 / 13:30 / 19:30 (tamaddi ixtiyoriy, o\'chiq), noto\'g\'ri vaqt — standart');
/* 2. reja: yozilgan ovqatga yo'q; kechki — o'tkazib yuborilgan (tushlik); o'tgan vaqt — yo'q; ertangi kunlar — hammasi */
let st = st0(); S.addFood(st, T0, { fid: 'non', meal: 'b', kcal: 200 }); c = S.remCfg({ on: 1 });
let pl = S.remPlan(st, c, at(T0, 9, 0), 2), today = pl.filter((x) => x.date === T0);
assert.deepEqual(today.map((x) => x.meal + x.kind), ['lm', 'dx']); assert.equal(today[1].miss, 'l'); assert.equal(new Date(today[0].at).getHours() * 60 + new Date(today[0].at).getMinutes(), 810);
assert.deepEqual(pl.filter((x) => x.date !== T0).map((x) => x.meal), ['b', 'l', 'd']);
S.addFood(st, T0, { fid: 'osh', meal: 'l', kcal: 600 }); today = S.remPlan(st, c, at(T0, 9, 0), 1); assert.deepEqual(today.map((x) => x.meal + x.kind), ['dm'], 'tushlik yozildi — tushlik eslatmasi yo\'q, kechki oddiy');
S.addFood(st, T0, { fid: 'osh', meal: 'd', kcal: 600 }); assert.deepEqual(S.remPlan(st, c, at(T0, 9, 0), 1), [], 'hammasi yozilgan — bugun eslatma yo\'q');
assert.deepEqual(S.remPlan(st0(), c, at(T0, 20, 0), 1), [], '20:00 da bugungi vaqtlar o\'tgan');
log('reja: yozilgan ovqatga eslatma yo\'q; kechki eslatma o\'tkazib yuborilgan tushlikni eslatadi; o\'tgan vaqt rejaga kirmaydi; ertangi kunlar — 3 ta');
/* 3. ≤ 3/kun (4 ta yoqilgan — tamaddi tushadi), siyrak — faqat kechki; o'chiq — hech narsa */
c = S.remCfg({ on: 1, m: { s: { on: true, t: 990 } } }); assert.deepEqual(S.remPlan(st0(), c, at(T0, 6, 0), 1).map((x) => x.meal), ['b', 'l', 'd']);
c = S.remCfg({ on: 1, sp: 1 }); assert.deepEqual(S.remPlan(st0(), c, at(T0, 6, 0), 2).map((x) => x.meal + x.kind), ['dx', 'dm'], 'siyrak: bugun — o\'tkazib yuborilgan nonushta/tushlik, ertaga — faqat kechki');
assert.deepEqual(S.remPlan(st0(), S.remCfg({ on: 0 }), at(T0, 6, 0), 7), []);
log('kuniga ≤ 3 (tamaddi yoqilsa ham — kechki/asosiylar ustun), siyrak — kuniga 1 ta (kechki), o\'chiq — rejasiz');
/* 4. vaqt mintaqasi va kun almashinuvi: reja qurilma vaqtida; 23:50 dan keyingi kun; oy oxiri */
const pl2 = S.remPlan(st0(), S.remCfg({ on: 1 }), at('2026-11-30', 23, 50), 2); assert.deepEqual(pl2.map((x) => x.date + x.meal), ['2026-12-01b', '2026-12-01l', '2026-12-01d']);
assert.equal(new Date(pl2[0].at).getDate(), 1); assert.equal(new Date(pl2[0].at).getHours(), 8);
log('kun almashinuvi: 30-noyabr 23:50 → 1-dekabr 08:30 / 13:30 / 19:30 (qurilmaning mahalliy vaqti)');
/* 5. siyraklashish: 3 kun ketma-ket yuborilgan va bosilmagan; bittasi bosilgan yoki yuborilmagan kun — yo'q */
const lg = (a) => Object.fromEntries(a.map(([o, s, cl]) => [D.addDays(T0, -o), { s, c: cl }]));
assert.equal(S.remSparseDue(lg([[1, 2], [2, 1], [3, 3]]), T0), true); assert.equal(S.remSparseDue(lg([[1, 2], [2, 1, 1], [3, 3]]), T0), false); assert.equal(S.remSparseDue(lg([[1, 2], [2, 0], [3, 3]]), T0), false); assert.equal(S.remSparseDue(lg([[1, 2], [2, 1]]), T0), false);
log('siyraklashish: 3 kun ketma-ket bosilmasa — ha; bitta bosilgan yoki eslatmasiz kun bo\'lsa — yo\'q');
/* 6. matnlar: har ovqatga 5 variant (uz/ru), kun bo'yicha aylanadi; o'tkazib yuborilgan — nomi bilan; qisqa */
for (const L of ['uz', 'ru']) { for (const k of ['b', 'l', 's', 'd', 'x']) { assert.equal(TX.matn[L][k].length, 5, L + k); TX.matn[L][k].forEach((t) => { assert.ok(t.length <= 70, t); assert.doesNotMatch(t, /halol|ҳалол/i); }); } }
const it = { meal: 'd', kind: 'x', miss: 'l', n: 3 }; assert.match(S.remText(TX, 'uz', it).b, /[Tt]ushlik/); assert.match(S.remText(TX, 'ru', it).b, /обед/i);
const days = new Set([0, 1, 2, 3, 4].map((i) => S.remText(TX, 'uz', { meal: 'b', kind: 'm', n: i }).b)); assert.equal(days.size, 5, 'har kuni boshqacha');
const plN = S.remPlan(st0(), S.remCfg({ on: 1 }), at(T0, 6, 0), 3).filter((x) => x.meal === 'b').map((x) => S.remText(TX, 'uz', x).b); assert.equal(new Set(plN).size, 3, 'ketma-ket kunlarda nonushta matni takrorlanmaydi');
log('matnlar: har ovqatga 5 variant (uz/ru, ≤ 70 belgi), ketma-ket kunlar har xil, kechki — «tushlik yozilmagan» kabi nom bilan');
/* 7. server qoidasi: vaqt mintaqasi (Toshkent +300, Moskva +180), oyna 45 daqiqa, yozilgan — o'tkaz, kechki — o'tkazib yuborilgan, kun almashinuvi va siyrak */
const utc = (s) => Date.parse(s + 'Z'); assert.deepEqual(Q.mahalliy(utc('2026-11-18T19:10:00'), 300), { kun: '2026-11-19', min: 10 }, 'UTC 19:10 = Toshkent 00:10 ertasi');
assert.deepEqual(Q.mahalliy(utc('2026-11-18T19:10:00'), 180), { kun: '2026-11-18', min: 1330 });
const row = (o) => Object.assign({ tz: 300, jadval: JSON.stringify({ b: 510, l: 810, s: null, d: 1170 }), siyrak: 0, kun: '2026-11-18', yozildi: 0, ishlangan: 0, yuborildi: 0, bosildi: 0, bosilmagan: 0 }, o);
assert.deepEqual(Q.tanla(row(), utc('2026-11-18T03:35:00')).map((a) => a.meal + a.amal), ['byubor'], '08:35 Toshkent — nonushta');
assert.deepEqual(Q.tanla(row(), utc('2026-11-18T04:20:00')), [], '09:20 — oyna (45 daq) o\'tgan');
assert.deepEqual(Q.tanla(row({ yozildi: 1 }), utc('2026-11-18T03:35:00')).map((a) => a.meal + a.amal), ['botkaz'], 'nonushta yozilgan — o\'tkaz');
assert.deepEqual(Q.tanla(row({ yozildi: 1 + 8 }), utc('2026-11-18T14:31:00')).map((a) => a.meal + a.amal + (a.miss || '')), ['dyuborl'], 'kechki: tushlik yozilmagan — eslatadi');
assert.deepEqual(Q.tanla(row({ yozildi: 1 + 2 + 8 }), utc('2026-11-18T14:31:00')).map((a) => a.meal + a.amal), ['dotkaz'], 'hammasi yozilgan — kechki ham yo\'q');
assert.deepEqual(Q.tanla(row({ siyrak: 1 }), utc('2026-11-18T03:35:00')).map((a) => a.meal + a.amal), ['bjim'], 'siyrak: nonushta yuborilmaydi');
assert.deepEqual(Q.tanla(row({ ishlangan: 1 }), utc('2026-11-18T03:40:00')), [], 'bir marta');
let y = Q.yangiKun(row({ yuborildi: 2, bosildi: 0, bosilmagan: 2 }), '2026-11-19'); assert.equal(y.row.siyrak, 1); assert.deepEqual(y.ev, [['eslatma', 'siyraklashdi']]); assert.equal(y.row.yozildi, 0);
y = Q.yangiKun(row({ yuborildi: 2, bosildi: 1, bosilmagan: 2 }), '2026-11-19'); assert.equal(y.row.siyrak, 0); assert.equal(y.row.bosilmagan, 0);
y = Q.yangiKun(row({ yuborildi: 0, bosilmagan: 2 }), '2026-11-19'); assert.equal(y.row.bosilmagan, 2, 'eslatmasiz kun hisobga olinmaydi');
assert.equal(Q.jadvalTekshir({ b: 510, l: null, d: 1170 }), '{"b":510,"l":null,"s":null,"d":1170}'); assert.equal(Q.jadvalTekshir({ b: 2000 }), null); assert.equal(Q.jadvalTekshir({}), null);
assert.equal(Q.url('ru', { meal: 'd', kind: 'x', miss: 'l' }, '2026-11-18'), '/ru/kalkifit?eslatma=l&k=2026-11-18');
log('server qoidasi: Toshkent/Moskva vaqti, 45 daqiqalik oyna, yozilgan — o\'tkazadi, kechki — o\'tkazib yuborilgan, siyrak — faqat kechki, kun almashganda 3-bosilmagan kun → siyrak');
/* 8. API: eslatma (obunasiz — 404), yozildi/bosildi faqat bugungi kun, ochir — qator ham o'chadi */
class DB { constructor() { this.ob = []; this.es = []; }
  prepare(sql) { const self = this; const mk = (a) => ({ async run() { return self.run(sql, a); }, async first() { return self.first(sql, a); } }); return Object.assign(mk([]), { bind: (...a) => mk(a) }); }
  first(sql, a) { if (/FROM push_obuna WHERE id/.test(sql)) return this.ob.find((x) => x.id === a[0]) || null; if (/FROM push_eslatma WHERE id/.test(sql)) return this.es.find((x) => x.id === a[0]) || null; if (/FROM sessiya/.test(sql)) return null; return null; }
  run(sql, a) {
    if (/INSERT INTO push_obuna/.test(sql)) { if (!this.ob.find((x) => x.id === a[0])) this.ob.push({ id: a[0], endpoint: a[1], til: a[4] }); }
    else if (/INSERT INTO push_eslatma/.test(sql)) { const i = this.es.findIndex((x) => x.id === a[0]), r = { id: a[0], tz: a[1], jadval: a[2], siyrak: a[3], bosilmagan: a[4], kun: null, yozildi: 0, ishlangan: 0, yuborildi: 0, bosildi: 0 }; if (i < 0) this.es.push(r); else Object.assign(this.es[i], { tz: a[1], jadval: a[2], siyrak: a[3], bosilmagan: a[4] }); }
    else if (/UPDATE push_eslatma SET kun/.test(sql)) { const r = this.es.find((x) => x.id === a[8]); Object.assign(r, { kun: a[0], yozildi: a[1], ishlangan: a[2], yuborildi: a[3], bosildi: a[4], bosilmagan: a[5], siyrak: a[6] }); }
    else if (/DELETE FROM push_eslatma/.test(sql)) this.es = this.es.filter((x) => x.id !== a[0]);
    else if (/DELETE FROM push_obuna/.test(sql)) this.ob = this.ob.filter((x) => x.id !== a[0]);
    return { meta: { changes: 1 } }; } }
const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/push/[amal].js')).href), db = new DB(), env = { KALKIFIT_DB: db, VAPID_PUBLIC_KEY: 'x', SITE_ORIGINS: 'https://kalki.uz' };
const EP = 'https://fcm.googleapis.com/fcm/send/abcdefghijk123', ID = crypto.createHash('sha256').update(EP).digest('hex');
const call = async (amal, body) => { const r = await API.onRequest({ request: new Request('https://kalki.uz/api/push/' + amal, { method: 'POST', headers: { Origin: 'https://kalki.uz', 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), env, params: { amal } }); return { s: r.status, j: await r.json() }; };
assert.equal((await call('eslatma', { endpoint: EP, tz: 300, jadval: { b: 510, l: 810, d: 1170 } })).s, 404, 'obunasiz — yo\'q');
db.ob.push({ id: ID, endpoint: EP, til: 'uz' });
assert.equal((await call('eslatma', { endpoint: EP, tz: 300, jadval: { b: 9999 } })).s, 400); let r = await call('eslatma', { endpoint: EP, tz: 300, jadval: { b: 510, l: 810, d: 1170 } }); assert.equal(r.s, 200); assert.equal(db.es.length, 1); assert.equal(db.es[0].tz, 300);
const L = Q.mahalliy(Date.now(), 300);
r = await call('yozildi', { endpoint: EP, kun: L.kun, ovqat: 'l' }); assert.equal(r.j.ok, true); assert.equal(db.es[0].yozildi, 2); assert.equal(db.es[0].kun, L.kun);
r = await call('yozildi', { endpoint: EP, kun: '2020-01-01', ovqat: 'b' }); assert.equal(r.j.ok, false, 'eski kun — qabul qilinmaydi'); assert.equal(db.es[0].yozildi, 2);
assert.equal((await call('yozildi', { endpoint: EP, kun: L.kun, ovqat: 'x' })).s, 400);
db.es[0].bosilmagan = 2; r = await call('bosildi', { endpoint: EP, kun: L.kun }); assert.equal(db.es[0].bosildi, 1); assert.equal(db.es[0].bosilmagan, 0);
db.es[0].siyrak = 1; r = await call('eslatma', { endpoint: EP, tz: 300, jadval: { b: 510, l: 810, d: 1170 } }); assert.equal(r.j.siyrak, 1, 'siyrak saqlanadi'); r = await call('eslatma', { endpoint: EP, tz: 300, jadval: { b: 510, l: 810, d: 1170 }, toliq: true }); assert.equal(r.j.siyrak, 0, '«Hammasini qaytarish»');
r = await call('eslatma', { endpoint: EP, ochir: true }); assert.equal(db.es.length, 0); await call('eslatma', { endpoint: EP, tz: 300, jadval: { d: 1170 } }); await call('ochir', { endpoint: EP }); assert.equal(db.es.length, 0, 'obuna o\'chsa — eslatma qatori ham');
const src = fs.readFileSync(path.join(ROOT, 'functions/api/push/[amal].js'), 'utf8'); assert.doesNotMatch(src.slice(src.indexOf("amal === 'eslatma' || amal === 'yozildi'")), /kcal|fid|taom|name/, 'server taom ma\'lumotini qabul qilmaydi');
log('API: obunasiz — 404; jadval tekshiruvi; «yozildi» faqat belgi va faqat bugungi kun; «bosildi» — hisoblagich nolga; siyrak saqlanadi, «toliq» qaytaradi; obuna o\'chsa qator ham');
/* 9. cron (--eslatma): vaqti kelganiga BITTA push, yozilganiga — o'tkazildi, siyrak, statistika; matn til bo'yicha (ЎЗ — translit) */
const rowsC = [row({ id: 'a', endpoint: 'e1', p256dh: 'p', auth: 'q', til: 'uz', kun: '2026-11-17', yuborildi: 1, bosilmagan: 2 }), row({ id: 'b', endpoint: 'e2', p256dh: 'p', auth: 'q', til: 'cyr', yozildi: 1 }), row({ id: 'c', endpoint: 'e3', p256dh: 'p', auth: 'q', til: 'ru' })];
const sent = [], sqls = []; const q = async (sql, p) => { sqls.push([sql, p]); return /SELECT e\.\*/.test(sql) ? rowsC.map((x) => Object.assign({}, x)) : []; };
const res = await Y.eslatmaYubor(q, {}, async (sub, p) => { sent.push([sub.endpoint, p]); return { ok: true }; }, utc('2026-11-18T03:35:00'), false, { qoida: Q, tx: TX });
assert.deepEqual(sent.map((x) => x[0]), ['e3'], 'a — siyrak bo\'ldi (nonushta yo\'q), b — yozilgan, c — yuboriladi');
assert.match(sent[0][1].b, /завтрак|Завтрак/i); assert.equal(sent[0][1].u, '/ru/kalkifit?eslatma=b&k=2026-11-18'); assert.equal(sent[0][1].tag, 'eslatma-b');
assert.equal(res.stat['yuborildi.b'], 1); assert.equal(res.stat.otkazildi, 1); assert.equal(res.stat.siyraklashdi, 1);
const upA = sqls.find(([s, p]) => /UPDATE push_eslatma/.test(s) && p[7] === 'a'); assert.equal(upA[1][6], 1, 'a: siyrak = 1'); assert.equal(upA[1][0], '2026-11-18');
assert.ok(sqls.some(([s, p]) => /INSERT INTO stat_kun/.test(s) && p[1] === 'yuborildi.b'), 'statistika (faqat son)');
const sent2 = []; await Y.eslatmaYubor(async (sql) => /SELECT e\.\*/.test(sql) ? [row({ id: 'k', endpoint: 'e4', til: 'cyr', yozildi: 1 + 8 })] : [], {}, async (s, p) => { sent2.push(p); return { ok: true }; }, utc('2026-11-18T14:35:00'), false, { qoida: Q, tx: TX });
assert.equal(sent2.length, 1); assert.match(sent2[0].b, /[Тт]ушлик/, 'ЎЗ: kechki — «Тушлик» (translit)'); assert.equal(sent2[0].u, '/kalkifit?eslatma=l&k=2026-11-18');
log('cron: vaqti kelganiga bitta push (ru/ЎЗ matn, ?eslatma=…), yozilganiga — o\'tkazildi, 3-bosilmagan kun — siyrak, statistika faqat son');
/* 10. sw.js, maxfiylik, yangilik */
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'); assert.match(sw, /eslatma=\(\[blsd\]\)/); assert.match(sw, /\{ t: k, m: em\[1\] \}/);
for (const f of ['maxfiylik.html', 'ru/maxfiylik.html']) { const h = fs.readFileSync(path.join(ROOT, f), 'utf8'); assert.match(h, f.startsWith('ru') ? /Напоминания о еде/ : /Ovqat eslatmalari/); assert.match(h, f.startsWith('ru') ? /на сервер ничего не отправляется/ : /serverga hech narsa yuborilmaydi/); }
assert.equal(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/yangiliklar-kalkifit.json'), 'utf8')).items[0].bn.uz, 'Ovqat vaqtida eslatma');
log('sw.js: bosilganda ?eslatma=… ilovaga uzatiladi; maxfiylik (uz/ru): veb — faqat vaqt va «yozildi» belgisi, Android — serverga hech narsa; yangilik yozuvi');
console.log('\nTAYYOR:', n, 'guruh');
