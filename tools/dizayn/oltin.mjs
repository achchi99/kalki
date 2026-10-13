// Oltin testlar: kalkulyator natijalari, generator matni/yuklashlari, AI blok (mock).
//   node tools/dizayn/oltin.mjs record  <ildiz-papka> [slug ...]   -> tools/dizayn/oltin/<slug>.<til>.json (yozadi)
//   node tools/dizayn/oltin.mjs compare <ildiz-papka> [slug ...]   -> oltin fayllar bilan solishtiradi
// <ildiz-papka>: statik sayt ildizi (eski build uchun `main` worktree; yangi uchun repo).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const [MODE, ROOTARG, ...ONLY] = process.argv.slice(2);
const ROOT = path.resolve(ROOTARG);
const HERE = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const GOLD = path.join(HERE, 'oltin');
const PAGES = JSON.parse(fs.readFileSync(path.join(HERE, 'pages.json'), 'utf8'));
fs.mkdirSync(GOLD, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.xlsx': 'application/octet-stream', '.docx': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru' || p === '/ru/') p = '/ru/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const browser = track(await chromium.launch());
const NONDET = new Set(['oila-byudjet-kalkulyator']);   // eski main ham o'zi bilan mos kelmaydi (tasodifiy/sanaga bog'liq qiymatlar)
const norm = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

async function newPage(extraRoutes) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', acceptDownloads: true, locale: 'uz' });
  const page = await ctx.newPage(); page.on('dialog', (d) => d.dismiss().catch(() => {}));
  await page.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me|lex\.uz/, (r) => r.abort());
  if (extraRoutes) await extraRoutes(page); return page;
}
// ---------- kalkulyator ----------
const EXCL = ['.res-skel', '.answerbox', '.ab-card', '.seo', '#seoBlock', '#articleLink', '#related', '#fbcall', '#xnav', '#datanote', '.cta-tg', '.how', '#smeta-cta', '#tgcta', '.tgcta', '#partners-slot', '[id^="partners"]', '.partners', '#breadcrumb', 'script', 'style', 'noscript', 'svg', '.foot-note', '.aiz', '#sf2', 'footer', '#legal-links', '#copyline', '.noprint-skip', '.calc-top-skip', '.aip', '#aiPromo'];
async function snapshot(page) {
  return page.evaluate((excl) => {
    const m = document.querySelector('main') || document.body; const c = m.cloneNode(true);
    excl.forEach((s) => c.querySelectorAll(s).forEach((e) => e.remove()));
    const vis = [...document.querySelectorAll('main input[type=text], main input[type=number], main textarea, main select')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => (e.id || e.name || '?') + '=' + e.value);
    return { text: c.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(), inputs: vis };
  }, EXCL);
}
async function applySet(page, set) {
  if (set === 'odatiy') return;
  const pick = (n, set) => (set === 'chegara' ? 0 : n - 1);
  // seg / mat-item / select / checkbox
  const segs = await page.locator('main .seg:visible').count();
  for (let i = 0; i < segs; i++) { const bs = page.locator('main .seg:visible').nth(i).locator('button'); const n = await bs.count(); if (n) await bs.nth(pick(n, set)).click({ timeout: 1500 }).catch(() => {}); }
  const mats = page.locator('main .mat-item:visible'); const mn = await mats.count(); if (mn) await mats.nth(pick(mn, set)).click({ timeout: 1500 }).catch(() => {});
  const sels = page.locator('main select:visible'); const sn = await sels.count();
  for (let i = 0; i < sn; i++) { const o = await sels.nth(i).locator('option').count(); if (o) await sels.nth(i).selectOption({ index: pick(o, set) }).catch(() => {}); }
  const cbs = page.locator('main input[type=checkbox]:visible'); const cn = await cbs.count();
  for (let i = 0; i < cn; i++) await (set === 'katta' ? cbs.nth(i).check() : cbs.nth(i).uncheck()).catch(() => {});
  await page.waitForTimeout(120);
  const ins = page.locator('main input[type=text]:visible, main input[type=number]:visible'); const n = await ins.count();
  for (let i = 0; i < n; i++) { const el = ins.nth(i); const id = (await el.getAttribute('id')) || ''; if (/search|qidir/i.test(id)) continue; const ro = await el.getAttribute('readonly'); if (ro !== null) continue;
    // chegara: 0; katta: joriy qiymatning 10 barobari (qiymat yo'q bo'lsa 1 000 000), 1e9 dan oshmasin — jadval/grafikli sahifalar qotib qolmasin
    const cur = parseFloat(String(await el.inputValue()).replace(/[^\d.]/g, '')) || 0;
    const val = set === 'chegara' ? '0' : String(Math.min(Math.round((cur || 100000) * 10), 1e9));
    await el.fill(val, { timeout: 1500 }).catch(() => {}); }
}
async function runCalc(url) {
  const page = await newPage(); const out = {}; const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await page.goto(BASE + url, { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  for (const set of ['odatiy', 'chegara', 'katta']) {
    if (set !== 'odatiy') { await page.goto(BASE + url, { waitUntil: 'networkidle' }); await page.waitForTimeout(300); }
    await applySet(page, set);
    const btn = page.locator('main .calc-btn:visible').first(); if (await btn.count()) await btn.click({ timeout: 1500 }).catch(() => {});
    await page.waitForTimeout(350); out[set] = await snapshot(page);
  }
  out.xato = errs; await page.context().close(); return out;
}
// ---------- generator (docgen) ----------
async function fillGen(page, atypeVal) {
  const sel = page.locator('#dgf-atype'); if (atypeVal !== undefined && (await sel.count())) { await sel.selectOption(atypeVal); await page.waitForTimeout(250); }
  const els = page.locator('#formHost [data-f]'); const n = await els.count();
  for (let i = 0; i < n; i++) { const e = els.nth(i); const id = (await e.getAttribute('data-f')) || ''; if (id === 'atype') continue; if (!(await e.isVisible())) continue;
    const tag = await e.evaluate((x) => x.tagName), type = (await e.getAttribute('type')) || '';
    try {
      if (tag === 'SELECT') { const o = await e.locator('option').count(); await e.selectOption({ index: Math.min(1, o - 1) }); }
      else if (type === 'date') await e.fill('2026-03-15');
      else if ((await e.getAttribute('inputmode')) === 'numeric') await e.fill('1500000');
      else await e.fill('Namuna ' + id);
    } catch (e2) {}
  }
  await page.waitForTimeout(300);
}
const zipText = (file) => { try { const x = execFileSync('python3', ['-c', "import zipfile,sys;print(zipfile.ZipFile(sys.argv[1]).read('word/document.xml').decode('utf8'))", file], { maxBuffer: 1 << 26 }).toString(); return norm(x.replace(/<w:tab\/>/g, ' ').replace(/<\/w:p>/g, ' ¶ ').replace(/<[^>]+>/g, '')); } catch (e) { return 'ZIP-XATO'; } };
async function dl(page, sel) { const w = page.waitForEvent('download', { timeout: 25000 }).catch(() => null); await page.click(sel, { timeout: 4000 }).catch(() => {}); const d = await w; if (!d) return null; const f = path.join(os.tmpdir(), 'oltin-' + Date.now() + '-' + d.suggestedFilename()); await d.saveAs(f); const buf = fs.readFileSync(f); return { name: d.suggestedFilename(), size: buf.length, file: f, pages: (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length }; }
async function runGen(url, lang) {
  const page = await newPage(); const out = { variantlar: {} }; const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await page.goto(BASE + url, { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  const opts = (await page.locator('#dgf-atype option').evaluateAll((os) => os.map((o) => o.value).filter(Boolean))).slice(0, 3);
  const variants = opts.length ? opts : [undefined];
  for (let vi = 0; vi < variants.length; vi++) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
    await fillGen(page, variants[vi]);
    const v = { atype: variants[vi] || null, hujjat: norm(await page.locator('#docBody').textContent()), qolgan: norm(await page.locator('#dgLeft').textContent().catch(() => '')) };
    if (lang === 'uz' && vi === 0) {
      const w = await dl(page, '#wordBtn'); if (w) { v.word = { text: zipText(w.file), kib: Math.round(w.size / 1024), nom: w.name }; fs.unlinkSync(w.file); }
      const p = await dl(page, '.receipt-actions .pdfbtn'); if (p) { v.pdf = { sahifa: p.pages, kib: Math.round(p.size / 1024), nom: p.name }; fs.unlinkSync(p.file); }
    }
    out.variantlar[variants[vi] || 'asosiy'] = v;
  }
  out.xato = errs; await page.context().close(); return out;
}
// ---------- AI blok (mock) ----------
async function runAi() {
  const reqs = []; const page = await newPage(async (p) => { await p.route('**/api/ariza', async (r) => { reqs.push(JSON.parse(r.request().postData() || '{}')); await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ matn: 'Mock ariza matni. Iltimosimni qanoatlantirishingizni so\'rayman.' }) }); }); });
  await page.goto(BASE + '/ariza-namunasi', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  const o = { korinadi: await page.isVisible('#aiAriza').catch(() => false) };
  if (o.korinadi) {
    o.sarlavha = norm(await page.locator('.aiz-title').textContent()); o.chiplar = await page.locator('.aiz-chip').allTextContents();
    await page.click('.aiz-chip >> nth=0'); await page.click('.aiz-seg button[data-s="kirill"]'); await page.click('#aizGo');
    await page.waitForFunction(() => document.getElementById('dgf-erkinMatn') && document.getElementById('dgf-erkinMatn').value.includes('Mock'), null, { timeout: 8000 }).catch(() => {});
    o.maydon = await page.inputValue('#dgf-erkinMatn').catch(() => null); o.tugmalar = await page.evaluate(() => ['aizView', 'aizAgain', 'aizCopy'].map((i) => !document.getElementById(i).hidden));
  }
  o.sorov = reqs.map((r) => ({ kalitlar: Object.keys(r).sort(), yozuv: r.yozuv, turi: r.turi, idUuid: /^[0-9a-f-]{36}$/.test(r.mijoz_id || ''), vaziyatUzunligi: (r.vaziyat || '').length }));
  await page.goto(BASE + '/ru/ariza-namunasi', { waitUntil: 'networkidle' }); await page.waitForTimeout(400); o.ruKorinadi = await page.isVisible('#aiAriza').catch(() => false);
  await page.context().close(); return o;
}
// ---------- asosiy ----------
const targets = PAGES.filter((p) => (p.tur === 'kalkulyator' || p.tur === 'generator') && p.slug !== 'hisob-siyosati-generatori' && (!ONLY.length || ONLY.includes(p.slug)));
let bad = 0; const sum = [];
for (const p of targets) {
  for (const lang of p.ru ? ['uz', 'ru'] : ['uz']) {
    const url = lang === 'ru' ? '/ru/' + p.slug : '/' + p.slug; const f = path.join(GOLD, `${p.slug}.${lang}.json`);
    let res; try { res = p.tur === 'kalkulyator' ? await runCalc(url) : await runGen(url, lang); } catch (e) { res = { xato: ['ISHLAMADI: ' + String(e).slice(0, 160)] }; }
    if (MODE === 'record') { fs.writeFileSync(f, JSON.stringify(res, null, 1)); console.log('yozildi', p.slug, lang, (JSON.stringify(res).length / 1024).toFixed(0) + 'KB', res.xato && res.xato.length ? 'XATO:' + res.xato[0] : ''); sum.push([p.slug, lang, 'yozildi']); }
    else {
      if (!fs.existsSync(f)) { console.log('YO\'Q', p.slug, lang); bad++; continue; }
      const g = JSON.parse(fs.readFileSync(f, 'utf8')); const diffs = [];
      const EM = /[\u{1F100}-\u{1F2FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}]\s?/gu; // emoji ikonkalar olib tashlandi — solishtiruvda e'tiborsiz
      const tokSort = (x) => (typeof x === 'string' ? x.split(/\s+/).filter(Boolean).sort().join(' ') : x);   // matn: so'zlar to'plami (qo'shimcha bloklar gridning pastiga ko'chgan — tartib farqi hisobga olinmaydi)
      const cmp = (a, b, k) => { if (/\.matn$/.test(k)) { a = tokSort(typeof a === 'string' ? a.replace(EM, '') : a); b = tokSort(typeof b === 'string' ? b.replace(EM, '') : b); } const sa0 = (JSON.stringify(a) || '').replace(EM, ''), sb0 = (JSON.stringify(b) || '').replace(EM, ''); if (sa0 !== sb0) { const sa = sa0, sb = sb0; let i = 0; while (sa[i] === sb[i]) i++; if (/\.matn$/.test(k)) { const cnt = (t) => t.split(' ').reduce((m, w) => (m.set(w, (m.get(w) || 0) + 1), m), new Map()); const ca = cnt(sa), cb = cnt(sb), d = []; for (const w of new Set([...ca.keys(), ...cb.keys()])) { const x = (cb.get(w) || 0) - (ca.get(w) || 0); if (x) d.push((x > 0 ? '+' : '') + x + ' ' + w); } diffs.push(k + ' so\'z farqi: ' + d.slice(0, 15).join(' | ')); return; }
        diffs.push(k + ' @' + i + ' eski=' + sa.slice(Math.max(0, i - 40), i + 70) + ' | yangi=' + sb.slice(Math.max(0, i - 40), i + 70)); } };
      if (p.tur === 'kalkulyator') for (const s of ['odatiy', 'chegara', 'katta']) { cmp(g[s]?.text, res[s]?.text, s + '.matn'); cmp(g[s]?.inputs, res[s]?.inputs, s + '.kirish'); }
      else for (const k of Object.keys(g.variantlar || {})) { const a = g.variantlar[k], b = (res.variantlar || {})[k] || {}; cmp(a.hujjat, b.hujjat, k + '.hujjat'); cmp(a.qolgan, b.qolgan, k + '.qolgan'); if (a.word) { cmp(a.word.text, b.word?.text, k + '.word-matn'); } if (a.pdf) { cmp(a.pdf.sahifa, b.pdf?.sahifa, k + '.pdf-sahifa'); if (!b.pdf || Math.abs(a.pdf.kib - b.pdf.kib) > Math.max(15, a.pdf.kib * 0.35)) diffs.push(k + '.pdf-hajm eski=' + a.pdf.kib + 'KB yangi=' + b.pdf?.kib + 'KB'); } }
      if ((res.xato || []).length > (g.xato || []).length) diffs.push('yangi JS xato: ' + res.xato.join(' | '));
      if (NONDET.has(p.slug) && diffs.length) { console.log('ND   ' + p.slug + ' ' + lang + ' — eski main ham har yugurishda boshqa raqam beradi (deterministik emas); alohida tekshiriladi'); continue; }
      console.log((diffs.length ? 'FARQ ' : 'OK   ') + p.slug + ' ' + lang); diffs.forEach((d) => console.log('     ' + d.slice(0, 330))); if (diffs.length) bad++; sum.push([p.slug, lang, diffs.length ? 'FARQ' : 'OK']);
    }
  }
}
if (!ONLY.length || ONLY.includes('ariza-namunasi')) {
  const f = path.join(GOLD, 'ariza-namunasi.ai.json'); const res = await runAi();
  if (MODE === 'record') { fs.writeFileSync(f, JSON.stringify(res, null, 1)); console.log('yozildi AI blok', JSON.stringify(res).slice(0, 160)); }
  else { const EMO = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu; const st = (o) => ({ ...o, sarlavha: (o.sarlavha || '').replace(EMO, '').trim() }); const g = st(JSON.parse(fs.readFileSync(f, 'utf8'))); res.sarlavha = (res.sarlavha || '').replace(EMO, '').trim(); const same = JSON.stringify(g) === JSON.stringify(res); console.log((same ? 'OK   ' : 'FARQ ') + 'AI blok'); if (!same) { bad++; console.log('   eski=' + JSON.stringify(g).slice(0, 300) + '\n   yangi=' + JSON.stringify(res).slice(0, 300)); } }
}
await browser.close(); srv.close();
if (MODE === 'compare') { console.log(bad ? bad + ' ta FARQ' : 'oltin testlar: hammasi mos'); process.exit(bad ? 1 : 0); }
