// KalkiFit v67 «Yorliqdan qo'shish» — server (tarmoqsiz, D1 shim): AI yorliq rejimi (faqat raqamlar, 100 g ga keltirish, mantiqsizini rad etish),
// MAXFIYLIK (rasm KV/D1 ga yozilmaydi, taklif API rasm maydonini qabul qilmaydi), taklif → admin «Bazaga qo'shish» → umumiy baza (GET), statistika hodisalari.
// node tools/dizayn/test-yorliq-api.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const RASM = await imp('functions/api/kalkifit-rasm.js'), YQ = await imp('functions/api/kalkifit-yorliq.js'), ADM = await imp('functions/api/kalkifit-admin.js'), STAT = await imp('functions/api/stat.js');
const { makeD1 } = await import('./d1-shim.mjs'); const SCHEMA = fs.readFileSync(path.join(ROOT, 'migrations/yorliq.sql'), 'utf8');
let n = 0; const T = async (name, fn) => { try { await fn(); n++; console.log('OK  ', n + '.', name); } catch (e) { console.log('XATO ' + name + ': ' + (e && e.stack || e)); process.exit(1); } };
const kv = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, String(v)); }, delete: async (k) => { m.delete(k); }, m }; };
const ADMIN = 'admin-sinov-parol', ORIGIN = 'https://kalki.uz';
const req = (url, { method = 'POST', body, headers = {} } = {}) => new Request('https://kalki.uz' + url, { method, headers: Object.assign(method === 'POST' ? { 'Content-Type': 'application/json', Origin: ORIGIN } : {}, { 'CF-Connecting-IP': '5.5.5.5' }, headers), body: method === 'POST' ? JSON.stringify(body) : undefined });
const rd = async (res) => { const t = await res.text(); let j = null; try { j = JSON.parse(t); } catch (e) {} return { s: res.status, j, t, h: res.headers }; };
const L = RASM._test;

await T('AI yorliq: javobdan FAQAT 100 g raqamlari; porsiya asosida — 100 g ga keltiriladi; kJ/qadoq/birlik; mantiqsiz (900+ kkal, makro > 100 g) va «yorliq emas» — null', async () => {
  assert.match(L.SYSTEM_YORLIQ, /taxmin qilma/); assert.match(L.SYSTEM_YORLIQ, /100 g/);
  assert.deepEqual(L.sanitizeLabel(L.extractObj('```json\n{"yorliq":true,"nom":"Musaffo qatiq 2,5%","kcal":53,"oqsil":"2,9","yog":2.5,"uglevod":4.7,"asos":"100","qadoq":450,"birlik":"g"}\n```')),
    { nom: 'Musaffo qatiq 2,5%', kcal: 53, o: 2.9, y: 2.5, u: 4.7, qadoq: 450, birlik: 'g' });
  const p = L.sanitizeLabel({ yorliq: true, nom: 'Batonchik', kcal: 200, oqsil: 4, yog: 10, uglevod: 24, asos: 'porsiya', porsiya_g: 40, qadoq: 40 }); assert.equal(p.kcal, 500); assert.equal(p.o, 10); assert.equal(p.y, 25); assert.equal(p.u, 60);
  assert.equal(L.sanitizeLabel({ yorliq: false }), null); assert.equal(L.sanitizeLabel({ yorliq: true, kcal: 1500, oqsil: 1, yog: 1, uglevod: 1 }), null); assert.equal(L.sanitizeLabel({ yorliq: true, kcal: 300, oqsil: 80, yog: 30, uglevod: 10 }), null);
  assert.equal(L.sanitizeLabel({ yorliq: true, kcal: 42, oqsil: null, yog: null, uglevod: 10.6, birlik: 'ml', qadoq: 500 }).o, null, 'yozilmagan makro — null (taxmin qilinmaydi)');
  assert.equal(L.sanitizeLabel({ yorliq: true, nom: '<b>X</b>', kcal: 100, oqsil: 1, yog: 1, uglevod: 20 }).nom, 'bX/b');
});

await T('MAXFIYLIK: yorliq rasmi KV/D1 ga yozilmaydi (faqat limit hisoblagichlari), modelga faqat bir marta uzatiladi; limit — taom rasmi bilan UMUMIY (ai hisobi)', async () => {
  const K = kv(), sent = []; const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, o) => { sent.push({ url: String(url), body: o && o.body }); return new Response(JSON.stringify({ content: [{ type: 'text', text: '{"yorliq":true,"nom":"Nestle yogurt","kcal":98,"oqsil":3,"yog":2.6,"uglevod":15.6,"asos":"100","qadoq":290,"birlik":"g"}' }] }), { status: 200 }); };
  const db = makeD1(SCHEMA); const env = { ANTHROPIC_API_KEY: 'x', KALKI_AI_KV: K, KALKIFIT_DB: db, IP_HASH_SALT: 't' };
  const IMG = '/9j/' + 'A'.repeat(4000);
  try {
    const r = await rd(await RASM.onRequest({ request: req('/api/kalkifit-rasm', { body: { img: IMG, tur: 'yorliq', til: 'uz', mijoz_id: '11111111-2222-4333-8444-555555555555' } }), env }));
    assert.equal(r.s, 200, r.t); assert.deepEqual(r.j.yorliq, { nom: 'Nestle yogurt', kcal: 98, o: 3, y: 2.6, u: 15.6, qadoq: 290, birlik: 'g' }); assert.equal(r.j.limit, 5); assert.equal(r.j.qoldi, 4);
    assert.equal(sent.length, 1); assert.match(sent[0].body, /ozuqaviy qiymat/i, 'yorliq tizim matni');
    for (const [k, v] of K.m) { assert.ok(!k.includes('AAAA') && !String(v).includes('AAAA'), 'KV da rasm yo\'q: ' + k); assert.match(k, /^(img:site|ai:(cid|ip)):/, 'faqat limit kaliti: ' + k); assert.match(String(v), /^\d+$/); }
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM yorliq_taklif').first()).n, 0, 'rasm so\'rovi taklif yozmaydi');
    /* oddiy taom rasmi xuddi shu ai hisobidan: 5 tadan 2 tasi ishlatildi */
    globalThis.fetch = async () => new Response(JSON.stringify({ content: [{ type: 'text', text: '[]' }] }), { status: 200 });
    const r2 = await rd(await RASM.onRequest({ request: req('/api/kalkifit-rasm', { body: { img: IMG, til: 'uz', mijoz_id: '11111111-2222-4333-8444-555555555555' } }), env })); assert.equal(r2.j.qoldi, 3, 'umumiy hisob');
  } finally { globalThis.fetch = realFetch; }
  const src = fs.readFileSync(path.join(ROOT, 'functions/api/kalkifit-rasm.js'), 'utf8'); assert.ok(!/\.put\([^)]*img|KALKIFIT_DB/.test(src), 'rasm endpointi D1 ga/KV ga rasm yozmaydi');
});

const env = { KALKI_AI_KV: kv(), KALKIFIT_DB: makeD1(SCHEMA), KALKIFIT_ADMIN_PASSWORD: ADMIN, IP_HASH_SALT: 't' };
const post = async (body, h) => rd(await YQ.onRequest({ request: req('/api/kalkifit-yorliq', { body, headers: h }), env }));
await T('Taklif API: faqat nom + 100 g raqamlari; rasm maydoni, 4/9/4 ga mos kelmagan, mantiqsiz qiymat va boshqa Origin — rad', async () => {
  const ok = { nom: 'Musaffo qatiq 2,5%', kcal: 53, o: 2.9, y: 2.5, u: 4.7, g: 450, manba: 'rasm', til: 'uz' };
  assert.equal((await post(ok)).s, 200); assert.equal((await post(Object.assign({}, ok, { manba: 'qolda' }))).s, 200);
  assert.equal((await post(Object.assign({}, ok, { img: '/9j/AAAA' }))).s, 400, 'rasm qabul qilinmaydi'); assert.equal((await post(Object.assign({}, ok, { kcal: 300 }))).s, 400, '4/9/4');
  assert.equal((await post(Object.assign({}, ok, { kcal: 950, o: 0, y: 100, u: 5 }))).s, 400); assert.equal((await post({ nom: 'x', kcal: 50, o: 1, y: 1, u: 9 })).s, 400, 'qisqa nom');
  assert.equal((await post(ok, { Origin: 'https://evil.example' })).s, 403);
  await post({ nom: 'Musaffo qatiq 2,5%', kcal: 60, o: 3, y: 3.2, u: 4.7, manba: 'qolda', til: 'uz' });
  await post({ nom: 'Lays chips smetana', kcal: 536, o: 6.5, y: 33, u: 52, g: 150, manba: 'rasm', til: 'ru' });
  const rows = (await env.KALKIFIT_DB.prepare('SELECT * FROM yorliq_taklif ORDER BY nom, kcal').all()).results;
  assert.equal(rows.length, 3); const q = rows.find((r) => r.kcal === 53); assert.equal(q.jami, 2); assert.equal(q.rasm, 1); assert.equal(q.g, 450);
  assert.deepEqual(Object.keys(q).sort(), ['birinchi', 'birlik', 'g', 'h', 'holat', 'jami', 'kalit', 'kat', 'kcal', 'nom', 'nom_ru', 'nom_uz', 'o_sum', 'oxirgi', 'rasm', 'til', 'u_sum', 'y_sum'], 'shaxsiy maydon yo\'q');
});

await T('Admin «Yorliq takliflari»: 2+ marta kelgani va bir nom turli qiymat bilan — ajratiladi; «Bazaga qo\'shish» bir bosishda → GET umumiy baza (manba «yorliq (foydalanuvchi)»); rad', async () => {
  const H = { 'X-Admin-Password': ADMIN }, get = async (qs) => rd(await ADM.onRequest({ request: req('/api/kalkifit-admin' + qs, { method: 'GET', headers: H }), env }));
  assert.equal((await rd(await ADM.onRequest({ request: req('/api/kalkifit-admin?yorliq=yangi', { method: 'GET' }), env }))).s, 401, 'parolsiz — yo\'q');
  const l = (await get('?yorliq=yangi')).j.yorliqlar; assert.equal(l.length, 3); const q = l.find((x) => x.kcal === 53);
  assert.equal(q.jami, 2); assert.equal(q.nom_son, 2, 'bir nom — 2 xil qiymat'); assert.equal(l[0].h, q.h, '2+ marta kelgani birinchi');
  const act = async (b) => rd(await ADM.onRequest({ request: req('/api/kalkifit-admin', { body: Object.assign({ tur: 'yorliq' }, b), headers: H }), env }));
  assert.equal((await act({ h: q.h, amal: 'qoshish', kat: 's', nom_uz: 'Musaffo qatiq (2,5%)', nom_ru: 'Катык Musaffo 2,5%' })).s, 200);
  const ch = l.find((x) => x.kcal === 536); assert.equal((await act({ h: ch.h, amal: 'rad' })).s, 200);
  const g = await rd(await YQ.onRequest({ request: req('/api/kalkifit-yorliq', { method: 'GET' }), env })); assert.equal(g.s, 200); assert.match(g.h.get('Cache-Control'), /max-age=600/);
  assert.equal(g.j.taomlar.length, 1); const f = g.j.taomlar[0];
  assert.equal(f.n, 'Musaffo qatiq (2,5%)'); assert.equal(f.r, 'Катык Musaffo 2,5%'); assert.equal(f.k, 53); assert.equal(f.p, 2.9); assert.equal(f.t, 's'); assert.equal(f.e, 0); assert.deepEqual(f.u, [['qadoq', 450], ['g100', 100]]); assert.match(f.ms.u, /yorlig'i \(foydalanuvchi/); assert.match(f.i, /^yq-[0-9a-f]{10}$/);
  assert.equal((await get('?yorliq=qoshildi')).j.yorliqlar.length, 1); assert.equal((await get('?yorliq=rad')).j.yorliqlar.length, 1);
  assert.equal((await act({ h: ch.h, amal: 'ochirish' })).s, 200); assert.equal((await get('?yorliq=hammasi')).j.yorliqlar.length, 2);
});

await T('Statistika: yorliq (rasm/qo\'lda/taklif), tarmoq_qidiruv (qat\'iy ro\'yxat), ai_sorov yorliq.* — qabul; erkin matn — rad', async () => {
  const H = STAT.HODISA; for (const k of ['rasm', 'qolda', 'taklif']) assert.ok(H.yorliq.test(k)); assert.ok(!H.yorliq.test('boshqa'));
  for (const k of ['evos', 'maxway', 'oqtepa', 'bellissimo', 'kfc', 'feedup']) assert.ok(H.tarmoq_qidiruv.test(k), k); assert.ok(!H.tarmoq_qidiruv.test('evos lavash')); assert.ok(H.ai_sorov.test('yorliq.ok') && H.ai_sorov.test('yorliq.bosh'));
  const app = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'), tm = /var TM_RE = \{([^}]+)\}/.exec(app)[1]; for (const k of tm.match(/\b([a-z]+):/g).map((x) => x.slice(0, -1))) assert.ok(H.tarmoq_qidiruv.test(k), 'ilova kaliti serverda bor: ' + k);
});
console.log('\nHammasi o\'tdi: ' + n + ' ta tekshiruv');
