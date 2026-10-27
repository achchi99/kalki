// KalkiFit admin sahifasi (brauzerda, API soxta — haqiqiy hisobot tuzilmasi bilan): kirish formasi → sessiya, Ko'rsatkichlar (KPI, kogortalar, funksiyalar, AI xarajati),
// Qurilmalar, Foydalanuvchilar (qidiruv, saralash, CSV, qator bosilsa tafsilot), Kirishlar jurnali, Chiqish; 360 px — gorizontal siljish yo'q, JS xatosi yo'q.   node tools/dizayn/test-admin-ui.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs'; import { d1 } from './d1-sqlite.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const STAT = await import(pathToFileURL(path.join(ROOT, 'functions/api/stat.js')).href), ADM = await import(pathToFileURL(path.join(ROOT, 'functions/api/admin/[amal].js')).href);
const SQL = ['stat.sql', 'admin-stat.sql', 'akkaunt.sql', 'zaxira.sql', 'qidiruv.sql'].map((f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8'));
const db = d1(SQL), NOW = Date.now(), D = 86400000, PW = 'test-parol-uzun-24-belgidan-ortiq', env = { KALKIFIT_DB: db, KALKIFIT_ADMIN_PASSWORD: PW, IP_HASH_SALT: 't', STAT_PRUNE_P: '0' };
const U = (i) => '00000000-0000-4000-8000-' + String(i).padStart(12, '0'), UA = 'Mozilla/5.0 (Linux; Android 14; SM-A546B Build/X; wv) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36';
for (let i = 0; i < 6; i++) await STAT.qabul(new Request('https://kalki.uz/api/stat', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'User-Agent': UA }, body: JSON.stringify({ q: U(i), p: i % 2 ? 'android' : 'veb', t: 'uz', h: [['faol', '', 1], ['yangi_foydalanuvchi', '', 1], ['ovqat_qoshildi', 'qidiruv', 2], ['ai_sorov', 'ovoz.ok', 2], ['ai_natija', 'ovoz.ochildi', 2], ['ai_natija', 'ovoz.qoshildi', 1], ['ai_natija', 'ovoz.qt30', 1], ['karta', 'ilova.korsatildi', 1], ['afsona', 'kirish.kun', 1], ['afsona_javob', 'a09.xato', 1], ['ai_sorov', 'rasm.ok', 1]], e: 390, v: '1.0.6' }) }), env, NOW - (i % 3) * D);
const raw = db.raw; for (let i = 0; i < 12; i++) raw.prepare('INSERT INTO akkaunt (id, email, usul, ism, yaratilgan, oxirgi_kirish, marketing) VALUES (?, ?, ?, ?, ?, ?, 0)').run(('a' + String(i).padStart(2, '0')).padEnd(24, '0'), 'user' + i + '@mail.uz', i % 2 ? 'google' : 'email', i % 3 ? 'Ism ' + i : null, NOW - (20 + i) * D, NOW - i * D);
raw.prepare("INSERT INTO sessiya (id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma) VALUES ('s1', ?, ?, ?, ?, 'Chrome · Android')").run('a00'.padEnd(24, '0'), NOW - 5 * D, NOW - 3600000, NOW + 90 * D);
raw.prepare("INSERT INTO admin_kirish (vaqt, ok, usul, ip) VALUES (?, 0, 'brauzer', '185.213.x.x'), (?, 1, 'brauzer', '185.213.x.x')").run(NOW - 7200000, NOW - 3600000);
const TK = new Date(NOW + 5 * 3600000).toISOString().slice(0, 10); for (const [w, c] of [['рис вареный 100 г', 3], ['рис вареный 90 г', 2], ['xqzvbnm', 1]]) raw.prepare('INSERT INTO qidiruv_topilmadi (sana, soz, son) VALUES (?, ?, ?)').run(TK, w, c);
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* API — haqiqiy handlerlar (cookie Secure bo'lgani uchun http'da brauzer saqlamaydi: sessiyani test o'zi uzatadi) */
async function mk(w) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, acceptDownloads: true }); const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); let ck = '';
  await p.route('**/api/**', async (rt) => { const u = new URL(rt.request().url()), h = Object.assign({}, rt.request().headers(), ck ? { cookie: ck } : {}), m = rt.request().method();
    const rq = new Request('https://kalki.uz' + u.pathname + u.search, { method: m, headers: h, body: m === 'POST' ? rt.request().postData() : undefined });
    const res = u.pathname === '/api/stat' ? await STAT.onRequest({ request: rq, env }) : await ADM.onRequest({ request: rq, env, params: { amal: u.pathname.split('/').pop() } });
    const sc = res.headers.get('Set-Cookie'); if (sc) ck = /Max-Age=0/.test(sc) ? '' : sc.split(';')[0];
    await rt.fulfill({ status: res.status, contentType: 'application/json', body: await res.text() }); });
  await p.goto(BASE + '/admin/kalkifit-statistika.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(300); return p;
}
const shot = (p, nm, w) => (process.env.OUT ? p.screenshot({ path: path.join(process.env.OUT, 'admin-' + nm + '-' + w + '.png'), fullPage: true }) : null);          // OUT=<papka> — skrinshotlar
const noX = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
try {
  for (const w of [1280, 360]) {
    const p = await mk(w);
    assert.equal(await p.locator('#login').isVisible(), true, 'kirish formasi'); assert.equal(await p.locator('#app').isVisible(), false);
    await p.fill('#pw', 'xato'); await p.click('#login button'); await p.waitForTimeout(300); assert.match(await p.locator('#msg').innerText(), /Parol noto'g'ri/);
    await p.fill('#pw', PW); await p.click('#login button'); await p.waitForSelector('#v-kpi .k'); assert.equal(await p.inputValue('#pw'), '', 'parol maydoni tozalandi');
    const kp = await p.locator('#v-kpi .k small').allInnerTexts(); for (const k of ['DAU (o\'rtacha)', 'WAU', 'MAU', 'Yangi: bugun', 'Yangi: 7 kun', 'Retention 1-kun', 'Retention 7-kun', 'Retention 30-kun', 'Kunlik ovqat yozuvi (1 qurilma)', 'Akkaunt konversiyasi', 'AI/ovoz xarajati (taxminiy)']) assert.ok(kp.includes(k), k);
    const t = await p.locator('#v-kpi').innerText(); assert.match(t, /Retention kogortalari/); assert.match(t, /Funksiyalar ishlatilishi[\s\S]*Qidiruv[\s\S]*Ovoz[\s\S]*Rasm[\s\S]*Menyu[\s\S]*Yeymiz[\s\S]*Haftangiz[\s\S]*Ulashish/); assert.match(t, /\$0\.0\d/); assert.match(t, /AI tanidi → qo'shildi \(voronka\)[\s\S]*Ovoz\s+12\s+12\s+0\s+0\s+6\s+0\s+0\s+50%/, 'voronka: ovoz 12 → 6 = 50%'); assert.match(t, /Qaytish \(D1 \/ D7 \/ D30\) — platforma bo'yicha[\s\S]*Veb \(brauzer\)[\s\S]*Android ilova/); assert.match(t, /Veb → ilova va akkaunt \(kunlar\)/); assert.equal(await p.locator('#vorT tr').count(), 5);          // v52 assert.match(t, /Afsona yoki haqiqat\?[\s\S]*Eng ko'p adashilgan 5 karta[\s\S]*a09/);          // v54
    await p.waitForFunction(() => !/…/.test(document.querySelector('#tpT').innerText)); const tp = await p.locator('#tpT tr').allInnerTexts();
    assert.ok(tp.some((x) => /^рис вареный\s+5\s+✓ Guruch/.test(x)), 'miqdorsiz yig\'ildi va endi topiladi: ' + tp.join(' | ')); assert.ok(tp.some((x) => /^xqzvbnm\s+1\s+✗/.test(x)), 'topilmaydigani ✗');
    await shot(p, 'kpi', w); await p.click('#davr [data-d="90"]'); await p.waitForTimeout(300); assert.equal(await p.locator('#davr [data-d="90"].on').count(), 1);
    await p.click('#tabs [data-t=dev]'); await p.waitForTimeout(200); const dv = await p.locator('#v-dev').innerText(); assert.match(dv, /Android ilova/); assert.match(dv, /1\.0\.6/); assert.match(dv, /Samsung Galaxy A54/); assert.match(dv, /390–429/); await shot(p, 'qurilma', w);
    await p.click('#tabs [data-t=usr]'); await p.waitForSelector('#ut tr.row'); assert.equal(await p.locator('#ut tr.row').count(), 12);
    const heads = await p.locator('#ut th').allInnerTexts(); assert.deepEqual(heads.map((x) => x.replace(/\s*[↕↑↓]$/, '')), ['Ism', 'Email', 'Kirish', 'Ro\'yxatdan o\'tgan', 'Oxirgi faollik', 'Faol kunlar (30 kun)', 'Qurilmalar', 'Ilovalar', 'Bulut zaxirasi']);
    assert.match(await p.locator('#v-usr .note').innerText(), /Ovqat soni, AI\/ovoz so'rovlari, til va profil akkauntga bog'lanmagan/);
    await p.fill('#uq', 'user1'); await p.waitForTimeout(150); assert.equal(await p.locator('#ut tr.row').count(), 3, 'qidiruv: user1, user10, user11'); assert.equal(await p.evaluate(() => document.activeElement.id), 'uq', 'yozganda fokus qoladi');
    await p.fill('#uq', ''); await p.click('#ut th[data-k=email]'); await p.waitForTimeout(100); assert.equal(await p.locator('#ut tr.row td:nth-child(2)').first().innerText(), 'user0@mail.uz'); await p.click('#ut th[data-k=email]'); await p.waitForTimeout(100); assert.equal(await p.locator('#ut tr.row td:nth-child(2)').first().innerText(), 'user9@mail.uz', 'saralash teskari');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#ucsv')]); const csv = fs.readFileSync(await dl.path(), 'utf8'); assert.match(dl.suggestedFilename(), /^kalkifit-foydalanuvchilar-\d{4}-\d\d-\d\d\.csv$/); assert.match(csv, /^﻿ism,email,kirish usuli/); assert.equal(csv.trim().split('\n').length, 13); assert.ok(!/vazn|weight/i.test(csv));
    await p.click('#ut th[data-k=email]'); await p.waitForTimeout(100); await p.click('#ut tr.row >> nth=0'); await p.waitForSelector('#ut tr.det:not([hidden]) svg'); const det = await p.locator('#ut tr.det:not([hidden])').innerText();
    assert.match(det, /Oxirgi 30 kun faolligi/); assert.match(det, /Chrome · Android/); assert.match(det, /server ko'ra olmaydi/); assert.ok(!/\bkg\b|vazn:/i.test(det), 'vazn ko\'rsatilmaydi');
    await shot(p, 'foydalanuvchi', w); if (w === 360) assert.ok(await noX(p), '360 px: gorizontal siljish yo\'q (jadval o\'z konteynerida aylanadi)');
    await p.click('#tabs [data-t=log]'); await p.waitForTimeout(300); const lg = await p.locator('#v-log').innerText(); assert.match(lg, /185\.213\.x\.x/); assert.match(lg, /muvaffaqiyatli/); assert.ok(!/185\.213\.\d+\.\d+/.test(lg));
    await p.click('#out'); await p.waitForTimeout(300); assert.equal(await p.locator('#login').isVisible(), true, 'Chiqish — forma'); assert.equal(await p.locator('#v-usr').innerText(), '');
    assert.equal(await p.evaluate(() => [sessionStorage.length, localStorage.length].join()), '0,0', 'parol brauzer xotirasida yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
  }
  log('Admin sahifa (1280 va 360 px): xato parol — xabar, to\'g\'ri — sessiya; topilmagan so\'zlar miqdorsiz + «endi topiladimi» (✓/✗); KPI (DAU/WAU/MAU, yangi bugun/7 kun, retention 1/7/30, kunlik ovqat, konversiya, AI xarajati), kogortalar, funksiyalar; 90 kun; Qurilmalar (tur, versiya, model, ekran); Foydalanuvchilar — qidiruv (fokus saqlanadi), saralash, CSV, tafsilot (30 kun, qurilmalar, profil yopiq, vazn yo\'q); jurnal — IP qisqa; Chiqish; brauzer xotirasida parol yo\'q');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
