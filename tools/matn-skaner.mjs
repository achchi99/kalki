// Matn tozaligi skaneri: lotin/kirill aralashmasi va /cyr/ translit qoldiqlari.
//   node tools/matn-skaner.mjs            # jadval (istisnolar tools/matn-istisno.json dan chiqarib tashlanadi)
//   node tools/matn-skaner.mjs --json     # mashina o'qiydigan natija
//   node tools/matn-skaner.mjs --all      # istisnolarni ham ko'rsatadi (SHUBHALI belgisi bilan)
// Qoida 1 (hamma fayl): bitta so'z ichida lotin+kirill harflari.
// Qoida 2 (UZ ildiz sahifa): lotin matn ichida alohida kirill so'z (ko'rinadigan matn, title/description, JSON-LD, skript satrlari).
// Qoida 3 (/cyr/): kirill matn ichida qolgan lotin so'z va noto'g'ri translit izlari (оъ, ёъ, гъ, qолган ' belgisi).
// Ko'rinadigan matn + title/meta/H1/answerbox/JSON-LD matn maydonlari; URL, class, id, kod qismlari tekshirilmaydi.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const { JSDOM } = require('jsdom');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ARGS = process.argv.slice(2);
const BRAND = new Set(['Word', 'Excel', 'PDF', 'CSV', 'Kalki', 'Telegram', 'Google', 'Cloudflare', 'Analytics', 'AdSense', 'Web', 'cookie']);
// /cyr/ va ЎЗ rejimida lotincha qolishi MUMKIN bo'lgan YAGONA so'zlar: brend, fayl formati, til belgisi (assets/translit.js DEFAULT_ABBR bilan mos)
const CYR_OK = new Set(['AI', 'Kalki', 'kalki', 'uz', 'info', 'Word', 'Excel', 'PDF', 'CSV', 'Telegram', 'UZ', 'RU']);
const EXC = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/matn-istisno.json'), 'utf8'));

const LAT = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F', CYR = '\u0400-\u04FF\u0492\u0493\u049A\u049B\u04B2\u04B3\u04E2\u04E3\u040E\u045E';
const APOS = "'\u2019\u02BB\u2018\u02BC`";
const RE_WORD = new RegExp(`[${LAT}${CYR}][${LAT}${CYR}${APOS}]*`, 'g');
const hasLat = (s) => new RegExp(`[${LAT}]`).test(s), hasCyr = (s) => new RegExp(`[${CYR}]`).test(s);
const cnt = (s, re) => (s.match(re) || []).length;
const LAT_LOOK = { 'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y', 'к': 'k', 'В': 'B', 'Н': 'H', 'М': 'M', 'Т': 'T', 'А': 'A', 'Е': 'E', 'О': 'O', 'Р': 'P', 'С': 'C', 'Х': 'X', 'К': 'K', 'і': 'i', 'ѕ': 's' };
const CYR2LAT = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: "'", ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: "o'", қ: 'q', ғ: "g'", ҳ: 'h' };
const toLatin = (w) => [...w].map((c) => { const l = c.toLowerCase(); const m = CYR2LAT[l]; if (m === undefined) return c; return c === l ? m : m.charAt(0).toUpperCase() + m.slice(1); }).join('');
const lookToLatin = (w) => [...w].map((c) => LAT_LOOK[c] || c).join('');

// ---- matn manbalari ----
function sources(file, html) {
  const dom = new JSDOM(html); const d = dom.window.document; const out = []; // {kind, text}
  const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'TEMPLATE', 'CODE', 'PRE', 'svg']);
  const w = d.createTreeWalker(d.body || d.documentElement, 4 /* SHOW_TEXT */);
  let n; while ((n = w.nextNode())) { let p = n.parentNode, ok = true; while (p && p.nodeType === 1) { if (skip.has(p.nodeName) || skip.has(p.nodeName.toLowerCase())) { ok = false; break; } p = p.parentNode; } const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (ok && t) out.push({ kind: 'matn', text: t }); }
  if (d.title) out.push({ kind: 'title', text: d.title });
  for (const [sel, kind] of [['meta[name="description"]', 'description'], ['meta[property="og:title"]', 'og:title'], ['meta[property="og:description"]', 'og:description'], ['meta[name="twitter:title"]', 'twitter:title'], ['meta[name="twitter:description"]', 'twitter:description']]) { const e = d.querySelector(sel); if (e && e.getAttribute('content')) out.push({ kind, text: e.getAttribute('content') }); }
  const KEYS = new Set(['name', 'description', 'text', 'headline', 'abstract', 'alternativeHeadline', 'caption', 'applicationCategory']);
  const walk = (o, k) => { if (typeof o === 'string') { if (KEYS.has(k) && /[\p{L}]/u.test(o)) out.push({ kind: 'json-ld', text: o }); } else if (Array.isArray(o)) o.forEach((x) => walk(x, k)); else if (o && typeof o === 'object') for (const [kk, v] of Object.entries(o)) walk(v, kk); };
  for (const s of d.querySelectorAll('script[type="application/ld+json"]')) { try { walk(JSON.parse(s.textContent)); } catch (e) { /* o'tkazamiz */ } }
  const ab = d.querySelector('#answerbox-data'); if (ab) { try { const j = JSON.parse(ab.textContent); for (const [lg, v] of Object.entries(j)) if (v && v.text) out.push({ kind: 'answerbox-' + lg, text: v.text, lang: lg }); } catch (e) { /* */ } }
  // inline skriptlar: kirill "orol" (so'zlar ketma-ketligi) lotin harflar bilan o'ralgan bo'lsa (qo'shtirnoq/qavs-kod chegarasisiz) — aralash matn
  const strs = [];
  const ISL = new RegExp(`[${LAT}]{2,}[ (]([${CYR}]+(?:[ ][${CYR}]+)*)[ ,.;:)]+[${LAT}]{2,}`, 'g');
  for (const s of d.querySelectorAll('script:not([type]), script[type="text/javascript"]')) {
    const code = s.textContent.replace(/<\/?[a-zA-Z][^>]*>/g, ' '); let m;
    while ((m = ISL.exec(code))) { const i = m.index; const nb = m[0].match(new RegExp(`[${LAT}]{2,}`, 'g')) || []; if (nb.length >= 2 && BRAND.has(nb[0]) && BRAND.has(nb[nb.length - 1])) continue;   // Word и Excel kabi: ikki tomoni brend/format nomi
     const win = code.slice(Math.max(0, i - 70), i + m[0].length + 70).replace(m[1], ''); if (cnt(win, new RegExp(`[${LAT}]`, 'g')) < 1.5 * cnt(win, new RegExp(`[${CYR}]`, 'g'))) continue;   // atrof asosan kirill (ruscha satr) — o'tkazamiz
      strs.push({ kind: 'skript-satr', text: code.slice(Math.max(0, i - 25), i + m[0].length + 25).replace(/\s+/g, ' '), island: m[1] }); }
  }
  return { visible: out, strs };
}
const isExc = (page, rule, word) => EXC.find((e) => (e.sahifa === '*' || e.sahifa === page || (e.sahifa.endsWith('*') && page.startsWith(e.sahifa.slice(0, -1)))) && e.qoida === rule && (e.soz === '*' || e.soz === word));

const files = [];
for (const f of fs.readdirSync(ROOT).filter((x) => x.endsWith('.html') && !x.startsWith('yandex'))) files.push(f);
for (const dir of ['ru', 'cyr']) if (fs.existsSync(path.join(ROOT, dir))) for (const f of fs.readdirSync(path.join(ROOT, dir)).filter((x) => x.endsWith('.html'))) files.push(dir + '/' + f);
const rows = [];
const add = (page, rule, kind, word, ctx, fix) => { const exc = isExc(page, rule, word); if (exc && !ARGS.includes('--all')) return; rows.push({ sahifa: page, qoida: rule, joy: kind, topilgan: word, kontekst: ctx, taklif: fix, shubhali: exc ? exc.izoh : '' }); };
const ctxOf = (t, w) => { const i = t.indexOf(w); return t.slice(Math.max(0, i - 28), i + w.length + 22); };

for (const page of files) {
  const lang = page.startsWith('ru/') ? 'ru' : page.startsWith('cyr/') ? 'cyr' : 'uz';
  const { visible, strs } = sources(page, fs.readFileSync(path.join(ROOT, page), 'utf8'));
  const seen = new Set();
  for (const s of [...visible, ...strs]) {
    if (s.island) { if (lang === 'uz') for (const w of s.island.split(' ')) { const key = '2s|' + w; if (seen.has(key)) continue; seen.add(key); add(page, 2, s.kind, w, s.text, 'lotincha: ' + toLatin(w)); } continue; }
    const words = s.text.match(RE_WORD) || [];
    // 1-qoida: aralash so'z
    for (const w of words) {
      if (hasLat(w) && hasCyr(w)) { const key = '1|' + w; if (seen.has(key)) continue; seen.add(key); add(page, 1, s.kind, w, ctxOf(s.text, w), lang === 'cyr' ? 'lotin harflarni kirillga' : lookToLatin(w)); }
    }
    if (lang === 'ru') continue;   // RU: faqat 1-qoida
    const nl = cnt(s.text, new RegExp(`[${LAT}]`, 'g')), nc = cnt(s.text, new RegExp(`[${CYR}]`, 'g'));
    const lang2 = s.lang || lang;
    if (lang === 'uz') {
      // 2-qoida: lotin ustun satrda alohida kirill so'z (answerbox-ru kabi ruscha maydonlar tashqarida)
      if (lang2 === 'ru') continue;
      if (nl > nc) for (const w of words) if (hasCyr(w) && !hasLat(w)) { const key = '2|' + w; if (seen.has(key)) continue; seen.add(key); add(page, 2, s.kind, w, ctxOf(s.text, w), 'lotincha: ' + toLatin(w)); }
    } else {
      // 3-qoida: /cyr/ — kirill ustun satrda lotin so'z va translit izlari
      if (nc >= nl) for (const w of words) {
        if (hasLat(w) && !hasCyr(w) && !/^[A-Za-z]$/.test(w) && !CYR_OK.has(w)) { const key = '3a|' + w; if (seen.has(key)) continue; seen.add(key); add(page, 3, s.kind, w, ctxOf(s.text, w), 'kirillga o\'giring yoki istisnoga'); }
        if (hasCyr(w)) {
          const bad = [[/[ёЁ][ъЪ]/, 'ёъ → йў'], [/[оО][ъЪ](?!\w*\b[а-я]*[аиуэ])/, 'оъ → ў'], [/[гГ][ъЪ]/, 'гъ → ғ'], [/^[ъЪ]/, 'so\'z boshida ъ'], [new RegExp(`[${CYR}][${APOS}]|[${APOS}][${CYR}]`), 'qolgan apostrof']];
          for (const [re, why] of bad) if (re.test(w)) { const key = '3b|' + w + why; if (seen.has(key)) continue; seen.add(key); add(page, 3, s.kind, w, ctxOf(s.text, w), why); }
        }
      }
    }
  }
}
if (ARGS.includes('--json')) console.log(JSON.stringify(rows, null, 1));
else {
  const real = rows.filter((r) => !r.shubhali);
  const grp = {}; for (const r of rows) (grp[r.sahifa] = grp[r.sahifa] || []).push(r);
  console.log('| sahifa | qoida | joy | topilgan | kontekst | taklif |\n|---|---|---|---|---|---|');
  for (const r of rows) console.log(`| ${r.sahifa} | ${r.qoida} | ${r.joy} | ${r.topilgan} | …${r.kontekst.replace(/\|/g, '/')}… | ${r.taklif}${r.shubhali ? ' [SHUBHALI: ' + r.shubhali + ']' : ''} |`);
  console.log(`\nJami: ${real.length} ta topilma${rows.length !== real.length ? ' (+' + (rows.length - real.length) + ' ta istisno)' : ''}, ${Object.keys(grp).length} sahifa`);
}
process.exit(0);
