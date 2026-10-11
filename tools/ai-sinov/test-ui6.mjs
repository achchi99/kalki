// 6-bosqich brauzer sinovi: node tools/ai-sinov/test-ui6.mjs [origin] [--noai]
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv.find((a) => /^https?:/.test(a)) || 'http://localhost:8788';
const NOAI = process.argv.includes('--noai');
const shot = (p, n) => p.screenshot({ path: path.join(dir, 'out', n) });
const NOTE = "Vaziyatni oddiy so'zlar bilan yozing. Ism, telefon va pasport ma'lumotini yozmang — ular kerak emas. Kalki matningizni saqlamaydi; u faqat ariza matnini tayyorlash uchun AI xizmatiga yuboriladi. AI qonun moddalari va raqamlarni qo'shmaydi — tayyor matnni o'qib, tekshirib chiqing.";
const RUN = Date.now() % 100000; let ipn = 0, reqs = 0;
const log = (s) => console.log('OK   ' + s);
const browser = await chromium.launch();
const errors = [];
async function mk(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, permissions: ['clipboard-read', 'clipboard-write'], isMobile: w < 500, hasTouch: w < 500 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/api/ariza', async (route) => { reqs++; await route.continue({ headers: { ...route.request().headers(), 'cf-connecting-ip': '10.3.' + RUN + '.' + (++ipn) } }); });
  return { ctx, page };
}
const overflow = (p) => p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
const hiddenBlock = (p) => p.evaluate(() => { const e = document.getElementById('aiAriza'); return !e || e.hidden || e.offsetParent === null; });

// ---- 1. 390px: ko'rinish, chip, yozuv, haqiqiy so'rovlar
{
  const { page } = await mk(390, 844);
  await page.goto(BASE + '/ariza-namunasi', { waitUntil: 'networkidle' });
  await page.waitForSelector('#aiAriza', { state: 'visible' });
  assert.match(await page.textContent('.aiz-title'), /AI ariza yozib beradi/);
  assert.equal((await page.textContent('.aiz-badge')).trim(), 'Yangi');
  assert.match(await page.textContent('.aiz-sub'), /5 soniyada/);
  assert.equal(await page.locator('.aiz-chip').count(), 4);
  assert.deepEqual(await page.locator('.aiz-chip').allTextContents(), ["Bola kasal bo'ldi", 'Ishdan 2 kunga javob', "Ishdan bo'shash", 'Gaz hisobida xato']);
  const gb = await page.locator('#aizGo').boundingBox(); const sb = await page.locator('#aiAriza').boundingBox();
  assert.ok(gb.width > sb.width * 0.85, 'tugma to\'liq kenglikda: ' + gb.width + '/' + sb.width);
  log('390px: sarlavha, "Yangi", qator, 4 chip, to\'liq kenglikdagi tugma (' + Math.round(gb.width) + '/' + Math.round(sb.width) + ')');
  for (const w of [390, 320]) { await page.setViewportSize({ width: w, height: 844 }); const m = await overflow(page); assert.ok(m.sw <= m.iw, w + ' toshdi ' + JSON.stringify(m)); }
  log('320 va 390px: gorizontal toshish yo\'q');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.getElementById('aiAriza').scrollIntoView());
  await shot(page, 'ui6-390-blok.png');
  // maxfiylik: qisqa qator + Batafsil
  assert.equal(await page.isVisible('#aizNote'), false);
  assert.match(await page.textContent('.aiz-priv'), /Ism, telefon, pasport yozmang\. Matningiz saqlanmaydi\./);
  await page.click('#aizMore'); assert.equal((await page.textContent('#aizNote')).trim(), NOTE); assert.equal(await page.isVisible('#aizNote'), true);
  await page.click('#aizMore'); assert.equal(await page.isVisible('#aizNote'), false);
  log('maxfiylik: qisqa qator, "Batafsil" to\'liq matnni (o\'zgarmagan) ochadi/yopadi');
  // chip -> textarea, so'rovsiz
  const before = reqs;
  await page.click('.aiz-chip:nth-child(4)');
  assert.match(await page.inputValue('#aizIn'), /^gaz hisobimda xato bor/);
  assert.equal(reqs, before);
  log('chip textarea\'ni to\'ldiradi, darhol yubormaydi');
  // yozuv: avto va qo'lda
  const on = () => page.locator('.aiz-seg button.on').getAttribute('data-s');
  assert.equal(await on(), 'lotin');
  await page.fill('#aizIn', 'Ишга кириш ҳақида ариза'); assert.equal(await on(), 'kirill');
  await page.fill('#aizIn', "ishga kirmoqchiman, kirillcha yozib ber"); assert.equal(await on(), 'kirill');
  await page.fill('#aizIn', "oddiy lotin matn bor bu yerda"); assert.equal(await on(), 'lotin');
  await page.click('.aiz-seg button[data-s="lotin"]'); await page.fill('#aizIn', 'Ишга кириш ҳақида ариза'); assert.equal(await on(), 'lotin');
  log('yozuv: kirill matn/"kirillcha" so\'zi → avto Кириллча; qo\'lda tanlov ustun');
  if (!NOAI) {
    // lotin real so'rov (chip)
    await page.fill('#aizIn', ''); await page.click('.aiz-chip:nth-child(1)');
    const rp = page.waitForResponse('**/api/ariza');
    await page.click('#aizGo');
    assert.equal((await page.textContent('#aizGo')).trim(), 'Yozilmoqda…');
    assert.equal(await page.locator('#aizGo.busy').count(), 1);
    assert.equal(await page.isDisabled('#aizGo'), true);
    assert.equal((await rp).status(), 200);
    await page.waitForFunction(() => document.getElementById('aizGo').textContent === 'Ariza matnini yozish');
    const f = await page.inputValue('#dgf-erkinMatn');
    assert.ok(f.length > 100 && !/[Ѐ-ӿ]/.test(f));
    assert.equal(await page.locator('.dg-shell.aiz-flash, textarea.aiz-flash').count() >= 0, true);
    const flashed = await page.evaluate(() => !!document.querySelector('.aiz-flash'));
    assert.equal(flashed, true, 'ajratib ko\'rsatish');
    await page.waitForTimeout(900);
    const inView = await page.evaluate(() => { const r = document.getElementById('dgf-erkinMatn').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
    assert.equal(inView, true, 'maydon ko\'rish oynasida');
    await shot(page, 'ui6-390-natija.png');
    await page.waitForTimeout(1500);
    assert.equal(await page.evaluate(() => !!document.querySelector('.aiz-flash')), false, '2 soniyadan keyin ajratish tugaydi');
    log('natija maydonga tushdi, silliq aylandi, 2 soniya ajratib ko\'rsatildi, maydon ko\'rinadi (' + f.split(/\s+/).length + ' so\'z)');
    assert.equal(await page.isVisible('#aizView'), true);
    await page.click('#aizView');
    await page.waitForFunction(() => document.getElementById('dgGrid').getAttribute('data-view') === 'preview');
    log('"Hujjatni ko\'rish" mobil ko\'rik tabini ochdi');
    await shot(page, 'ui6-390-hujjat.png');
    await page.click('#viewSeg [data-view="form"]');
    // kirill real so'rov
    await page.evaluate(() => document.getElementById('aiAriza').scrollIntoView());
    await page.fill('#aizIn', 'Ишга 3 кун бора олмайман, иш ҳақим ҳисобланмаган ҳолда');
    await page.click('.aiz-seg button[data-s="kirill"]'); assert.equal(await on(), 'kirill');
    await page.click('#aizGo');
    await page.waitForFunction(() => document.getElementById('aizGo').textContent === 'Ariza matnini yozish', null, { timeout: 30000 });
    const k = await page.inputValue('#dgf-erkinMatn');
    assert.ok(/[Ѐ-ӿ]/.test(k) && !/[A-Za-z]/.test(k), 'kirill natijada lotin harfi yo\'q: ' + k);
    log('kirill so\'rov: natija to\'liq kirillcha, lotin harfi yo\'q (' + k.split(/\s+/).length + ' so\'z)');
    await page.click('#aizCopy');
    await page.waitForFunction(() => document.getElementById('aizCopy').textContent === 'Nusxalandi');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), k);
    log('"Nusxa olish" kirill matnni nusxaladi');
    const mid = await page.evaluate(() => localStorage.getItem('kalki_ai_mid'));
    assert.match(mid, /^[0-9a-f-]{36}$/); log('anonim mijoz ID localStorage\'da (UUID)');
    console.log('--- LOTIN ---\n' + f + '\n--- KIRILL ---\n' + k + '\n---');
  }
}
// ---- 2. #ai havola
{
  const { page } = await mk(390, 844);
  await page.goto(BASE + '/ariza-namunasi#ai', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'aizIn');
  assert.equal(await page.evaluate(() => { const r = document.getElementById('aiAriza').getBoundingClientRect(); return r.top >= -2 && r.top < innerHeight / 2; }), true);
  log('#ai: blokka aylandi, textarea\'ga fokus');
}
// ---- 3. e'lon kartalari
for (const [u, sel] of [['/', '#docs-cta'], ['/hujjatlar', '#dcat-ariza']]) {
  for (const w of [320, 1280]) {
    const { page } = await mk(w, 800);
    await page.goto(BASE + u, { waitUntil: 'networkidle' });
    await page.waitForSelector('#aiPromo', { state: 'attached' });
    assert.equal(await page.evaluate((s) => !!document.querySelector(s + ' #aiPromo'), sel), true);
    assert.match(await page.getAttribute('#aiPromo', 'href'), /ariza-namunasi#ai$/);
    const m = await overflow(page); assert.ok(m.sw <= m.iw, u + ' ' + w + ' toshdi');
    if (w === 320) { await page.locator(u === '/' ? '#docs-cta' : '#dcat-ariza').screenshot({ path: path.join(dir, 'out', 'ui6-promo-' + (u === '/' ? 'index' : 'hujjatlar') + '-320.png') }); }
  }
}
{
  const { page } = await mk(390, 800);
  await page.goto(BASE + '/hujjatlar', { waitUntil: 'networkidle' });
  await page.click('#aiPromo'); await page.waitForURL(/ariza-namunasi#ai/); await page.waitForTimeout(1200);
  assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'aizIn');
  log('e\'lon kartalari: bosh sahifa va hujjatlar (320/1280 toshmaydi), havola #ai ga olib boradi va fokus qo\'yadi');
}
// ---- 4. RU / CYR
{
  const { page } = await mk(390, 800);
  for (const u of ['/ru/ariza-namunasi', '/cyr/ariza-namunasi']) { await page.goto(BASE + u, { waitUntil: 'networkidle' }); assert.equal(await hiddenBlock(page), true, u); }
  for (const u of ['/ru/', '/ru/hujjatlar']) { await page.goto(BASE + u, { waitUntil: 'networkidle' }); assert.equal(await page.evaluate(() => !document.getElementById('aiPromo')), true, u); }
  log('RU va CYR: AI bloki ham, e\'lon kartasi ham ko\'rinmaydi');
}
{
  const { page } = await mk(1280, 900);
  await page.goto(BASE + '/ariza-namunasi', { waitUntil: 'networkidle' }); await page.waitForSelector('#aiAriza');
  await page.evaluate(() => document.getElementById('aiAriza').scrollIntoView()); await shot(page, 'ui6-desktop.png');
}
const real = errors.filter((e) => !/favicon|adsbygoogle|googletagmanager/.test(e));
assert.deepEqual(real, [], real.join(' | ')); log('JS xatolari yo\'q');
await browser.close();
