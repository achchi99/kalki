// KalkiFit admin: kirish (cookie 12 soat, 5 xato → 15 daqiqa blok, jurnal — IP qisqartirilgan, eski parol ishlamaydi), barcha admin endpointlar bitta tekshiruvda,
// qurilma turi (User-Agent → tur/OS/brauzer/model/ekran/APK versiyasi; IP saqlanmaydi), foydalanuvchilar API (faqat akkaunt jadvallari; vazn/profil yo'q),
// hisobot: 7/30/90, kogortalar, funksiyalar, AI xarajati, konversiya, qurilmalar.   node tools/dizayn/test-admin.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { d1 } from './d1-sqlite.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'), imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const AUTH = await imp('functions/_lib/admin-auth.js'), QT = await imp('functions/_lib/qurilma-tur.js'), ADM = await imp('functions/api/admin/[amal].js'), STAT = await imp('functions/api/stat.js');
const HIS = await imp('functions/api/hisob.js'), QID = await imp('functions/api/qidiruv.js'), KFA = await imp('functions/api/kalkifit-admin.js'), PUSH = await imp('functions/api/push/[amal].js');
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const SQL = ['stat.sql', 'admin-stat.sql', 'akkaunt.sql', 'zaxira.sql', 'qidiruv.sql', 'hisob.sql', 'kalkifit-taklif.sql', 'push.sql'].map((f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8'));
function kvMock() { const m = new Map(); return { m, get: async (k) => (m.has(k) ? m.get(k).v : null), put: async (k, v, o) => { m.set(k, { v, ttl: o && o.expirationTtl }); }, delete: async (k) => { m.delete(k); } }; }
const PW = 'yangi-kuchli-parol-24-belgidan-uzun!', OLD = 'eski-parol';
const mkEnv = (db, kv, pw = PW) => ({ KALKIFIT_DB: db, KALKI_AI_KV: kv, KALKIFIT_ADMIN_PASSWORD: pw, IP_HASH_SALT: 'tuz', STAT_PRUNE_P: '0' });
const rq = (url, o = {}) => new Request('https://kalki.uz' + url, Object.assign({ headers: Object.assign({ 'CF-Connecting-IP': o.ip || '185.213.44.7', Origin: 'https://kalki.uz' }, o.h || {}) }, o.m ? { method: o.m } : {}, o.body ? { body: JSON.stringify(o.body), method: 'POST' } : {}));
const adm = (amal, o) => ADM.onRequest({ request: rq('/api/admin/' + amal, o), env: o.env, params: { amal } });
const cookieOf = (r) => (r.headers.get('Set-Cookie') || '').split(';')[0];
try {
  /* 1. qurilma turi */
  { const T = (ua, p, v) => QT.turOf(ua, p || 'veb', v);
    let d = T('Mozilla/5.0 (Linux; Android 14; SM-A546B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36', 'android', '1.0.6');
    assert.deepEqual([d.tur, d.os, d.model, d.ver, d.br], ['android-ilova', 'Android 14', 'Samsung Galaxy A54', '1.0.6', 'Ilova (WebView)']);
    d = T('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'); assert.deepEqual([d.tur, d.os, d.br, d.model, d.ver], ['android-brauzer', 'Android 10', 'Chrome 131', '', ''], 'Chrome «K» — model yo\'q');
    d = T('Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36'); assert.equal(d.br, 'Samsung Internet 26');
    d = T('Mozilla/5.0 (Linux; Android 13; 23021RAAEG Build/TKQ1) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 Telegram-Android/11.2'); assert.equal(d.br, 'Telegram'); assert.equal(d.model, '23021RAAEG');
    d = T('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'); assert.deepEqual([d.tur, d.os, d.br, d.model], ['iphone-safari', 'iOS 18.1', 'Safari 18', '']);
    d = T('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', 'ios-pwa'); assert.deepEqual([d.tur, d.os], ['iphone-pwa', 'iOS 17.5']);
    d = T('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1'); assert.equal(d.tur, 'iphone-boshqa');
    d = T('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'); assert.deepEqual([d.tur, d.os, d.br], ['kompyuter', 'Windows', 'Edge 130']);
    d = T('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'); assert.deepEqual([d.tur, d.os, d.br], ['kompyuter', 'macOS', 'Safari 18']);
    d = T('Mozilla/5.0 (Linux; Android 14) Chrome/130', 'android', '1.0.6; DROP'); assert.equal(d.ver, '', 'versiya — faqat 1.0.6 ko\'rinishida');
    assert.deepEqual([359, 360, 390, 412, 800, 1280, 1920, 0, 99999].map(QT.ekranOf), ['<360', '360–389', '390–429', '390–429', '768–1023', '1024–1439', '1440+', '', '']);
    log('Qurilma turi: Android ilova (versiya, model «Samsung Galaxy A54»), Android brauzer (Chrome «K» — model yo\'q, Samsung Internet, Telegram), iPhone Safari / PWA / boshqa brauzer, kompyuter (Windows/macOS, Edge/Safari); ekran guruhlari; erkin versiya matni rad'); }
  /* 2. kirish: cookie 12 soat, imzo, eski parol, blok, jurnal */
  { const db = d1(SQL), kv = kvMock(), env = mkEnv(db, kv), now = Date.now();
    let r = await adm('kirish', { env, body: { parol: 'xato' } }); assert.equal(r.status, 401); assert.equal(r.headers.get('Set-Cookie'), null);
    r = await adm('kirish', { env, body: { parol: PW } }); assert.equal(r.status, 200); const sc = r.headers.get('Set-Cookie');
    assert.match(sc, /^kf_adm=v1\.\d{13}\.[0-9a-f]{64}; Path=\/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict$/, 'cookie: 12 soat, HttpOnly, Secure, SameSite=Strict: ' + sc); assert.equal(r.headers.get('X-Robots-Tag'), 'noindex, nofollow');
    assert.ok(!sc.includes(PW) && !JSON.stringify(await r.clone().json()).includes(PW), 'parol javobda yo\'q');
    const ck = cookieOf(r), tok = decodeURIComponent(ck.split('=')[1]);
    r = await adm('foydalanuvchilar', { env, h: { Cookie: ck } }); assert.equal(r.status, 200, 'cookie bilan kirildi');
    r = await adm('holat', { env, h: { Cookie: ck } }); assert.equal((await r.json()).kirgan, true);
    assert.equal(await AUTH.tokenOk(PW, tok, now + 11.9 * 3600000), true); assert.equal(await AUTH.tokenOk(PW, tok, now + 12.1 * 3600000), false, '12 soatdan keyin — sessiya tugaydi');
    assert.equal(await AUTH.tokenOk(OLD, tok, now), false, 'parol almashsa — eski sessiya bekor'); assert.equal(await AUTH.tokenOk(PW, tok.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a')), now), false, 'soxta imzo');
    const fake = 'v1.' + (now + 10 * 365 * 86400000) + '.' + tok.split('.')[2]; assert.equal(await AUTH.tokenOk(PW, fake, now), false, 'muddati uzaytirilgan token');
    r = await adm('foydalanuvchilar', { env, h: { 'X-Admin-Password': OLD } }); assert.equal(r.status, 401, 'eski parol bilan kirish ishlamaydi');
    r = await adm('chiqish', { env, m: 'POST', h: { Cookie: ck } }); assert.match(r.headers.get('Set-Cookie'), /^kf_adm=; Path=\/; Max-Age=0/);
    /* blok: yangi IP dan 5 xato → 6-sida to'g'ri parol ham 429; KV TTL 15 daqiqa */
    const e2 = mkEnv(d1(SQL), kvMock());
    for (let i = 0; i < 5; i++) { r = await adm('kirish', { env: e2, ip: '94.158.52.10', body: { parol: 'x' + i } }); assert.equal(r.status, 401, 'xato ' + (i + 1)); }
    r = await adm('kirish', { env: e2, ip: '94.158.52.10', body: { parol: PW } }); assert.equal(r.status, 429, '5 xatodan keyin — blok (to\'g\'ri parol ham)');
    r = await STAT.onRequest({ request: rq('/api/stat?davr=7', { ip: '94.158.52.10', h: { 'X-Admin-Password': PW } }), env: e2 }); assert.equal(r.status, 429, 'blok boshqa admin endpointlarda ham');
    const ttl = [...e2.KALKI_AI_KV.m.values()].map((x) => x.ttl); assert.deepEqual(ttl, [900], 'blok 15 daqiqa (KV TTL 900 s), kalit — IP xeshi');
    assert.ok(![...e2.KALKI_AI_KV.m.keys()].some((k) => k.includes('94.158')), 'KV kalitida IP ochiq emas');
    r = await adm('kirish', { env: e2, ip: '94.158.99.1', body: { parol: PW } }); assert.equal(r.status, 200, 'boshqa manzil bloklanmagan');
    const jr = e2.KALKIFIT_DB.raw.prepare('SELECT ok, usul, ip FROM admin_kirish ORDER BY id').all(); assert.ok(jr.length >= 7); assert.ok(jr.every((x) => /^\d{1,3}\.\d{1,3}\.x\.x$/.test(x.ip)), 'jurnal: IP qisqartirilgan: ' + JSON.stringify(jr.slice(0, 2)));
    assert.deepEqual(jr.map((x) => x.ok), [0, 0, 0, 0, 0, 0, 1]); assert.equal(jr[5].usul, 'blok');
    const cols = e2.KALKIFIT_DB.raw.prepare("SELECT name FROM pragma_table_info('admin_kirish')").all().map((x) => x.name); assert.deepEqual(cols, ['id', 'vaqt', 'ok', 'usul', 'ip']);
    assert.equal(AUTH.ipQisqa('2a02:4780:12:a::5'), '2a02:4780:x'); assert.equal(AUTH.ipQisqa(''), '');
    r = await adm('jurnal', { env: e2, ip: '94.158.99.1', h: { 'X-Admin-Password': PW } }); const jl = (await r.json()).kirishlar; assert.equal(jl.length, 7); assert.ok(jl[0].vaqt >= jl[6].vaqt, 'yangisi birinchi');
    log('Kirish: to\'g\'ri parol → HttpOnly/Secure/SameSite=Strict cookie, 12 soat (imzo paroldan: parol almashsa eski sessiya bekor; soxta/uzaytirilgan token rad); eski parol — 401; 5 xato → 15 daqiqa blok (barcha admin endpointlarda), boshqa manzil ishlaydi; jurnal: vaqt, natija, usul, IP faqat 94.158.x.x'); }
  /* 3. barcha admin endpointlar bitta tekshiruvda */
  { const db = d1(SQL), env = mkEnv(db, kvMock()); const ck = cookieOf(await adm('kirish', { env, body: { parol: PW } }));
    const EP = [['stat', STAT.onRequest, '/api/stat?davr=7'], ['hisob', HIS.onRequest, '/api/hisob?kun=7'], ['qidiruv', QID.onRequest, '/api/qidiruv?kun=7'], ['takliflar', KFA.onRequest, '/api/kalkifit-admin?holat=hammasi'], ['push', PUSH.onRequest, '/api/push/holat', { amal: 'holat' }]];
    for (const [nm, fn, url, params] of EP) {
      assert.equal((await fn({ request: rq(url), env, params })).status, 401, nm + ': kirishsiz — 401');
      assert.equal((await fn({ request: rq(url, { h: { 'X-Admin-Password': OLD } }), env, params })).status, 401, nm + ': eski parol — 401');
      assert.equal((await fn({ request: rq(url, { h: { Cookie: ck } }), env, params })).status, 200, nm + ': sessiya bilan — 200');
      assert.equal((await fn({ request: rq(url, { ip: '10.1.1.1', h: { 'X-Admin-Password': PW } }), env, params })).status, 200, nm + ': CLI sarlavhasi (yangi parol) — 200'); }
    log('Admin endpointlar (statistika, hisob, qidiruv, takliflar, push holati): kirishsiz va eski parol — 401, sessiya cookie yoki yangi parol sarlavhasi (CLI) — 200'); }
  /* 4. foydalanuvchilar: faqat akkaunt jadvallari */
  { const db = d1(SQL), env = mkEnv(db, kvMock()), now = Date.now(), D = 86400000, raw = db.raw;
    raw.prepare("INSERT INTO akkaunt (id, email, usul, ism, yaratilgan, oxirgi_kirish, marketing) VALUES ('a1b2c3d4e5f60718293a4b5c', 'ali@mail.uz', 'google', 'Ali', ?, ?, 1), ('ffeeddccbbaa998877665544', 'vali@mail.uz', 'email', NULL, ?, ?, 0)").run(now - 40 * D, now - 2 * D, now - 5 * D, now - 5 * D);
    raw.prepare("INSERT INTO sessiya (id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma) VALUES ('s1', 'a1b2c3d4e5f60718293a4b5c', ?, ?, ?, 'Chrome · Android'), ('s2', 'a1b2c3d4e5f60718293a4b5c', ?, ?, ?, 'Safari · iOS')").run(now - 30 * D, now - 3600000, now + 100 * D, now - 10 * D, now - 9 * D, now + 100 * D);
    raw.prepare("INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES ('z1', 'kalkifit', 'SHIFRLANGAN', 1, ?)").run(now - 7200000);
    raw.prepare("INSERT INTO akkaunt_ilova (akkaunt_id, ilova, zaxira_id, kod_konvert, rejim, ulangan) VALUES ('a1b2c3d4e5f60718293a4b5c', 'kalkifit', 'z1', 'KONVERT', 'konvert', ?)").run(now - 20 * D);
    for (const [d, h] of [[1, 'kirish'], [1, 'kirish_google'], [3, 'ulandi_kalkifit'], [12, 'kirish'], [45, 'kirish']]) raw.prepare("INSERT INTO audit (vaqt, akkaunt_id, hodisa) VALUES (?, 'a1b2c3d4e5f60718293a4b5c', ?)").run(now - d * D, h);
    const ck = cookieOf(await adm('kirish', { env, body: { parol: PW } }));
    let r = await adm('foydalanuvchilar', { env, h: { Cookie: ck } }), j = await r.json(), u = j.foydalanuvchilar;
    assert.equal(u.length, 2); assert.equal(u[0].email, 'ali@mail.uz'); assert.deepEqual([u[0].ism, u[0].usul, u[0].sessiyalar, u[0].ilovalar, u[0].faol_kun30], ['Ali', 'google', 2, ['kalkifit'], 5]);
    assert.deepEqual(u[0].qurilmalar.sort(), ['Chrome · Android', 'Safari · iOS']); assert.equal(u[0].oxirgi, now - 3600000, 'oxirgi faollik — eng so\'nggi sessiya/kirish/zaxira'); assert.equal(u[0].zaxira_oxirgi, now - 7200000);
    const dump = JSON.stringify(j); assert.ok(!/SHIFRLANGAN|KONVERT|vazn|weight|kod_konvert|blob/i.test(dump), 'zaxira, konvert, vazn — javobda yo\'q');
    r = await adm('foydalanuvchilar', { env, h: { Cookie: ck }, ...{} });
    r = await ADM.onRequest({ request: rq('/api/admin/foydalanuvchilar?id=a1b2c3d4e5f60718293a4b5c', { h: { Cookie: ck } }), env, params: { amal: 'foydalanuvchilar' } }); const t = await r.json();
    assert.equal(t.faollik.length, 30); assert.equal(t.faollik.filter((x) => x.n).length, 5, '30 kun: 3 kun hodisa + 2 sessiyaning oxirgi kuni (45 kun oldingisi — hisobda yo\'q)'); assert.equal(t.faollik.filter((x) => x.n).length, u[0].faol_kun30, 'ro\'yxat va tafsilot bir xil'); assert.equal(t.profil, null, 'profil — server ko\'rmaydi'); assert.equal(t.qurilmalar.length, 2); assert.equal(t.ilovalar[0].zaxira, now - 7200000);
    assert.ok(!/SHIFRLANGAN|KONVERT|zaxira_id/.test(JSON.stringify(t)));
    r = await ADM.onRequest({ request: rq("/api/admin/foydalanuvchilar?id=x' OR 1=1", { h: { Cookie: ck } }), env, params: { amal: 'foydalanuvchilar' } }); assert.equal(r.status, 400);
    r = await adm('foydalanuvchilar', { env }); assert.equal(r.status, 401);
    log('Foydalanuvchilar: ism, email, kirish usuli, ro\'yxatdan o\'tgan, oxirgi faollik (sessiya/kirish/zaxira), faol kunlar (30), qurilmalar, ilovalar, bulut zaxirasi; tafsilot — 30 kunlik faollik, qurilmalar, ilovalar; zaxira blobi, konvert, vazn va profil qaytarilmaydi; noto\'g\'ri id — 400; kirishsiz — 401'); }
  /* 5. statistika: qurilma turi saqlanadi, IP yo'q; hisobot yangi bo'limlar */
  { const db = d1(SQL), env = mkEnv(db, kvMock()), NOW = Date.now(), D = 86400000, U = (i) => '00000000-0000-4000-8000-' + String(i).padStart(12, '0');
    const send = (id, i, h, p, ua, extra) => STAT.qabul(new Request('https://kalki.uz/api/stat', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'CF-Connecting-IP': '185.213.44.7', 'Content-Type': 'application/json', 'User-Agent': ua }, body: JSON.stringify(Object.assign({ q: U(id), p, t: 'uz', h }, extra || {})) }), env, NOW - i * D);
    const AND = 'Mozilla/5.0 (Linux; Android 14; SM-A546B Build/UP1A; wv) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36', IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Version/18.1 Mobile/15E148 Safari/604.1';
    await send(1, 8, [['faol', '', 1], ['yangi_foydalanuvchi', '', 1], ['ovqat_qoshildi', 'qidiruv', 3], ['ai_sorov', 'rasm.ok', 2], ['ai_sorov', 'ovoz.ok', 4]], 'android', AND, { e: 412, v: '1.0.6' });
    await send(1, 7, [['faol', '', 1], ['haftalik_ochildi', '', 1]], 'android', AND, { e: 412, v: '1.0.6' });
    await send(2, 8, [['faol', '', 1], ['yangi_foydalanuvchi', '', 1], ['yeymiz_segment', 'kafe', 1], ['ai_sorov', 'menyu.ok', 1]], 'veb', IOS, { e: 390 });
    await send(3, 0, [['faol', '', 1], ['kun_kartochka_ulashildi', '', 1]], 'ios-pwa', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', { e: 375 });
    const rows = db.raw.prepare('SELECT * FROM stat_qurilma ORDER BY kun').all(); assert.ok(rows.every((x) => x.tur), 'tur yozildi'); assert.ok(!JSON.stringify(rows).includes('185.213'), 'IP saqlanmaydi');
    const a = rows.find((x) => x.tur === 'android-ilova'); assert.deepEqual([a.os, a.model, a.ver, a.ekran], ['Android 14', 'Samsung Galaxy A54', '1.0.6', '390–429']);
    const h = await STAT.hisobot(db, 30, NOW); assert.equal(h.davr, 30); assert.equal((await STAT.hisobot(db, 90, NOW)).davr, 90, '90 kunlik davr');
    assert.deepEqual(h.qurilmalar.tur.map((x) => x.k).sort(), ['android-ilova', 'iphone-pwa', 'iphone-safari']); assert.deepEqual(h.qurilmalar.versiya.map((x) => [x.k, x.n]), [['1.0.6', 1]]); assert.ok(h.qurilmalar.model.some((x) => x.k === 'Samsung Galaxy A54'));
    assert.deepEqual([h.foydalanish.qidiruv, h.foydalanish.ovoz, h.foydalanish.rasm, h.foydalanish.menyu, h.foydalanish.yeymiz, h.foydalanish.haftangiz, h.foydalanish.ulashish], [3, 4, 2, 1, 1, 1, 1]);
    assert.equal(h.xarajat.jami, Math.round((2 * STAT.NARX.rasm + 4 * STAT.NARX.ovoz + STAT.NARX.menyu) * 100) / 100, 'AI xarajati: muvaffaqiyatli so\'rov × taxminiy narx');
    assert.equal(h.kpi.ret1, 50, '1-kun retention'); assert.ok(h.kogorta.length >= 2 && h.kogorta.some((c) => c.jami === 2 && c.d1 === 50), 'kogortalar: ' + JSON.stringify(h.kogorta.slice(0, 2)));
    assert.equal(h.kpi.yangi_bugun, 0); assert.ok(h.kpi.ovqat_kun > 0); assert.ok(h.konversiya && h.konversiya.yangi === 2);
    log('Statistika: qurilma turi/OS/model/ekran/APK versiyasi saqlanadi (IP yo\'q); hisobot 7/30/90: qurilmalar (tur, versiya, model…), funksiyalar (qidiruv, ovoz, rasm, menyu, Yeymiz, Haftangiz, ulashish), AI xarajati, retention 1/7/30 va kogortalar, kunlik ovqat yozuvi, akkaunt konversiyasi'); }
  /* 6. admin sahifalar: noindex, parol brauzerda saqlanmaydi */
  { for (const f of ['admin/kalkifit-statistika.html', 'admin/kalkifit-takliflar.html']) { const s = fs.readFileSync(path.join(ROOT, f), 'utf8'); assert.match(s, /<meta name="robots" content="noindex,nofollow/); assert.ok(!/sessionStorage\.setItem\(|localStorage\.setItem\(/.test(s), f + ': parol brauzerda saqlanmaydi'); assert.ok(!/X-Admin-Password/.test(s), f + ': sarlavha emas — sessiya'); }
    const hd = fs.readFileSync(path.join(ROOT, '_headers'), 'utf8'); assert.match(hd, /\/admin\/\*\n  X-Robots-Tag: noindex/); assert.match(hd, /\/api\/admin\/\*\n  X-Robots-Tag: noindex/); assert.match(fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8'), /Disallow: \/admin\//);
    const repo = ['functions', 'admin', 'assets', 'tools', 'migrations'].flatMap((d) => fs.readdirSync(path.join(ROOT, d), { recursive: true }).filter((f) => /\.(js|mjs|html|sql)$/.test(f)).map((f) => path.join(ROOT, d, f)));
    const home = process.env.HOME || ''; let real = ''; try { real = fs.readFileSync(path.join(home, '.kalkifit-admin-pass'), 'utf8').trim(); } catch (e) {}
    if (real && real.length >= 24) for (const f of repo) assert.ok(!fs.readFileSync(f, 'utf8').includes(real), 'haqiqiy parol repoda: ' + path.relative(ROOT, f));
    log('Admin sahifalar: noindex (meta, X-Robots-Tag, robots.txt), parol brauzer xotirasida saqlanmaydi (HttpOnly sessiya); haqiqiy parol repodagi hech bir faylda yo\'q'); }
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; }
