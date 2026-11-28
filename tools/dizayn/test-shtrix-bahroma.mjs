// Bahroma «Medovik» pintasi (320 g) shtrix-kodi 4870233467477: migrations/shtrix-bahroma-medovik.sql → /api/shtrix o'z jadvalimizdan beradi (OFF'ga bormaydi), qiymat yorliq bo'yicha
// (data/manba/yorliq.json «bahroma-medovik-pinta»: 280/4,3/15,3/31), ilovadagi mahsulot bilan bir xil (mz-bahroma-plombir-pinta).   node tools/dizayn/test-shtrix-bahroma.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'); const SH = await import(pathToFileURL(path.join(ROOT, 'functions/api/shtrix.js')).href); const { makeD1 } = await import('./d1-shim.mjs');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8'), KOD = '4870233467477';
const env = { KALKIFIT_DB: makeD1(rd('migrations/shtrix.sql')), KALKI_AI_KV: { get: async () => null, put: async () => {}, delete: async () => {} } };
let calls = 0; globalThis.fetch = async () => { calls++; return new Response('{}', { status: 404 }); };
const sql = rd('migrations/shtrix-bahroma-medovik.sql'); await env.KALKIFIT_DB.prepare(sql.split('\n').filter((l) => !l.startsWith('--')).join(' ').replace(/datetime\('now'\)/g, "'2026-11-28'")).run();
for (const til of ['uz', 'ru', 'kirill']) {
  const r = await SH.onRequest({ request: new Request('https://kalki.uz/api/shtrix?kod=' + KOD + '&til=' + til, { headers: { 'CF-Connecting-IP': '9.9.9.9' } }), env }); const j = await r.json();
  assert.equal(r.status, 200); assert.equal(j.manba, 'oz', til + ': o\'z jadval'); assert.match(j.mahsulot.nom, /Medovik/i, til + ': nom'); assert.equal(j.mahsulot.brend, 'Bahroma');
  assert.deepEqual([j.mahsulot.k, j.mahsulot.p, j.mahsulot.f, j.mahsulot.c, j.mahsulot.qadoq], [280, 4.3, 15.3, 31, 320], til + ': qiymat'); assert.equal(j.mahsulot.tasdiqlangan, true);
}
assert.equal(calls, 0, 'Open Food Facts\'ga so\'rov yo\'q');
const Y = JSON.parse(rd('data/manba/yorliq.json')).yorliq['bahroma-medovik-pinta']; assert.deepEqual([Y.k, Y.p, Y.f, Y.c], [280, 4.3, 15.3, 31], 'yorliq.json bilan bir xil');
const f = JSON.parse(rd('data/ovqatlar.json')).foods.find((x) => x.i === 'mz-bahroma-plombir-pinta'); assert.deepEqual([f.k, f.p, f.f, f.c], [280, 4.3, 15.3, 31], 'ilovadagi mahsulot bilan bir xil');
console.log('OK   shtrix 4870233467477 → Bahroma Medovik (o\'z jadval, 280/4,3/15,3/31; OFF\'ga bormaydi)');
