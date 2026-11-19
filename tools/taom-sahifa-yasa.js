#!/usr/bin/env node
/* kalki.uz — TAOM KALORIYA sahifalari (pilot, 50 ta): /kaloriya/<taom> (UZ) va /ru/kaloriya/<taom> (RU) + indeks /kaloriya/.
 *   node tools/taom-sahifa-yasa.js          — yozadi (kaloriya/, ru/kaloriya/, data/taom-sahifalar.json, sitemap.xml)
 *   node tools/taom-sahifa-yasa.js --quru   — faqat tekshiradi (qaysi taom o'tdi / o'tmadi va nega)
 * BITTA manba — data/ovqatlar.json (KalkiFit bazasi): kkal/oqsil/yog'/uglevod 100 g da, porsiyalar (u), manba (ms/m), oila variantlari (fam).
 * SIFAT QOIDASI: manbasi (ms) va real porsiyasi (u, g100 dan boshqa) bo'lmagan taomga sahifa YARATILMAYDI (thin content yo'q).
 * Har sahifada majburiy bloklar: H1 «… kaloriyasi — 1 <birlik> ≈ N kkal», makrolar, porsiyalar jadvali, manba (retsept bo'yicha / manbadan), o'xshash taomlar,
 * «Qanday yengilroq», FAQ (JSON-LD), «KalkiFit'da yozish» (deep link /kalkifit?taom=<id>, joy kodi taom-<id>). Matnda tibbiy da'vo yo'q. */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8'), wr = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };
const QURU = process.argv.includes('--quru');
const DB = JSON.parse(rd('data/ovqatlar.json')), F = Object.fromEntries(DB.foods.map((f) => [f.i, f]));
/* tanlov: milliy taomlar ustuvor, keyin non, sut mahsulotlari, shirinliklar, ko'cha taomlari, salat, meva — hammasi KalkiFit'da «top» (eng ko'p yoziladigan) ro'yxatidan */
const TOIFA = [
  ['milliy', 'Milliy taomlar', 'Национальные блюда', ['osh', 'somsa', 'manti', 'chuchvara', 'lagmon', 'shurva', 'mastava', 'moshxorda', 'moshkichiri', 'norin', 'dimlama', 'qozon-kabob', 'shashlik', 'jigar-kabob', 'lyulya', 'tandir-gosht', 'qovurdoq', 'dolma', 'qazi', 'sumalak', 'halim', 'xonim', 'beshbarmoq', 'jiz', 'jarkop', 'shovla', 'shirguruch', 'ugra-osh', 'chalop']],
  ['non', 'Non va xamir', 'Хлеб и выпечка', ['non', 'lavash-non', 'boglirsoq']],
  ['sut', 'Sut mahsulotlari', 'Молочные продукты', ['qatiq', 'suzma', 'qurt', 'ayron']],
  ['shirin', 'Shirinliklar', 'Сладости', ['chakchak', 'paxlava', 'xalva', 'navvot']],
  ['kocha', "Ko'cha taomlari", 'Уличная еда', ['chebureki', 'belyashi', 'lavash-tovuq', 'doner']],
  ['salat', 'Salatlar', 'Салаты', ['achichuk', 'koreys-sabzi', 'olivye']],
  ['meva', 'Poliz va mevalar', 'Бахчевые и фрукты', ['qovun', 'tarvuz', 'anor']],
];
const UN = { uz: { g100: 'g', dona_s: 'kichik', dona_l: 'katta', kosa: 'kosa', likop: 'tarelka', dona: 'dona', bolak: "bo'lak", stakan: 'stakan', qoshiq: 'osh qoshiq', piyola: 'piyola', porsiya: 'porsiya', tilim: 'tilim', six: 'six' },
  ru: { g100: 'г', dona_s: 'малый', dona_l: 'большой', kosa: 'коса', likop: 'тарелка', dona: 'шт.', bolak: 'кусок', stakan: 'стакан', qoshiq: 'ст. ложка', piyola: 'пиала', porsiya: 'порция', tilim: 'ломтик', six: 'шампур' } };
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const d1 = (x) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',').replace(/,0$/, '');
const BASE = 'https://kalki.uz';

/* ---------- tekshiruv (sifat qoidasi) ---------- */
function ok(f) {
  if (!f) return 'bazada yo\'q';
  if (!(f.k > 0) || f.p == null || f.f == null || f.c == null) return 'makro to\'liq emas';
  if (!f.ms || !f.ms.u || !f.ms.r) return 'manba (ms) yo\'q';
  if (!(f.u || []).some((u) => u[0] !== 'g100' && u[1] > 0 && UN.uz[u[0]])) return 'real porsiya yo\'q';
  return '';
}
const sel = [], rad = [];
for (const [tk, , , ids] of TOIFA) for (const id of ids) { const why = ok(F[id]); if (why) rad.push([id, why]); else sel.push({ id, tk, f: F[id] }); }
if (QURU) { console.log('o\'tdi:', sel.length, '| o\'tmadi:', rad.length ? rad.map((x) => x.join(' — ')).join('; ') : 'yo\'q'); process.exit(0); }

/* ---------- hisoblar ---------- */
const mainUnit = (f) => { const u = f.u.filter((x) => x[0] !== 'g100' && UN.uz[x[0]]); const pr = ['likop', 'kosa', 'dona', 'six', 'porsiya', 'bolak', 'piyola', 'stakan', 'tilim', 'qoshiq', 'dona_s', 'dona_l']; u.sort((a, b) => pr.indexOf(a[0]) - pr.indexOf(b[0])); return u[0]; };
const per = (f, g) => ({ k: f.k * g / 100, p: f.p * g / 100, f: f.f * g / 100, c: f.c * g / 100 });
const ulush = (f) => { const P = f.p * 4, Y = f.f * 9, C = f.c * 4, T = P + Y + C || 1; return { p: P / T, f: Y / T, c: C / T }; };
const isRetsept = (f) => !!(f.rc || /^(Retsept|Hisob|Standart retsept)/.test(f.m || '') || /^(Retsept|Standart retsept)/.test((f.ms && f.ms.u) || ''));
function variants(f) {          // oila (fam) variantlari: eng yengil, standart, eng og'ir — kkal/100 g bo'yicha
  if (!f.fam || !f.fam.g) return [];
  const ax = f.fam.ax || [], g = f.fam.g, keys = Object.keys(g); if (keys.length < 2) return [];
  const lab = (k, L) => k.split('.').map((v, i) => { const a = ax[i]; if (!a) return ''; const o = (a.o || []).find((x) => x.i === v); return (L === 'ru' ? a.r : a.n) + ': ' + (o ? (L === 'ru' ? o.r : o.n) : v); }).filter(Boolean).join(', ');
  const def = ax.map((a) => a.d).join('.'), sorted = keys.slice().sort((a, b) => g[a].k - g[b].k), pick = [sorted[0], g[def] ? def : null, sorted[sorted.length - 1]].filter((v, i, arr) => v && arr.indexOf(v) === i);
  return pick.map((k) => ({ k, kc: g[k].k, p: g[k].p, f: g[k].f, c: g[k].c, uz: lab(k, 'uz'), ru: lab(k, 'ru'), def: k === def }));
}
function similar(it) {          // shu toifadan kkal (asosiy porsiya) bo'yicha eng yaqin 3–4 ta
  const mk = (x) => { const u = mainUnit(x.f); return per(x.f, u[1]).k; }, me = mk(it);
  const by = (arr) => arr.map((x) => ({ x, d: Math.abs(mk(x) - me) })).sort((a, b) => a.d - b.d).map((y) => y.x);
  const same = by(sel.filter((x) => x.tk === it.tk && x.id !== it.id)).slice(0, 4);          // avval shu toifadan; kam bo'lsa — boshqa toifadan kkal bo'yicha eng yaqinlari
  return same.length >= 3 ? same : same.concat(by(sel.filter((x) => x.tk !== it.tk && x.id !== it.id)).slice(0, 3 - same.length));
}
const SOUP = ['lagmon', 'shurva', 'mastava', 'moshxorda', 'ugra-osh', 'chalop', 'halim', 'sumalak', 'shirguruch', 'ayron'];
const FRIED = ['somsa', 'chebureki', 'belyashi', 'boglirsoq', 'chakchak', 'paxlava', 'jiz', 'qovurdoq', 'qozon-kabob'];
const MEAT = ['shashlik', 'jigar-kabob', 'lyulya', 'tandir-gosht', 'qazi', 'norin', 'beshbarmoq', 'dolma', 'dimlama', 'doner', 'lavash-tovuq', 'manti', 'chuchvara', 'xonim', 'osh', 'shovla', 'moshkichiri', 'jarkop'];
function tips(it, L) {          // 2–3 aniq, raqamli maslahat (tibbiy da'vo yo'q)
  const f = it.f, u = mainUnit(f), out = [], vs = variants(f), un = UN[L][u[0]], ru = L === 'ru';
  const light = vs.length ? vs[0] : null, dv = vs.find((v) => v.def);
  if (light && dv && dv.kc - light.kc >= 8) out.push(ru ? 'Вариант «' + light.ru + '» — ' + nf(light.kc) + ' ккал на 100 г вместо ' + nf(dv.kc) + ': 1 ' + un + ' (' + u[1] + ' г) легче примерно на ' + nf((dv.kc - light.kc) * u[1] / 100) + ' ккал.' : '«' + light.uz + '» varianti — 100 g da ' + nf(light.kc) + ' kkal (odatiy ' + nf(dv.kc) + '): 1 ' + un + ' (' + u[1] + ' g) taxminan ' + nf((dv.kc - light.kc) * u[1] / 100) + ' kkal yengilroq.');
  if (u[1] >= 150 && ['milliy', 'kocha', 'non', 'salat'].includes(it.tk)) out.push(ru ? 'Половина порции (' + Math.round(u[1] / 2) + ' г) — ' + nf(per(f, u[1] / 2).k) + ' ккал; добавьте овощной салат, чтобы наесться.' : 'Yarim porsiya (' + Math.round(u[1] / 2) + ' g) — ' + nf(per(f, u[1] / 2).k) + ' kkal; to\'yish uchun yoniga sabzavot salati qo\'shing.');
  if (SOUP.includes(it.id)) out.push(ru ? 'Снимите жир с поверхности супа: 1 ст. ложка жира — около 90 ккал.' : 'Kosaning ustidagi yog\'ni oling: 1 osh qoshiq yog\' — taxminan 90 kkal.');
  else if (FRIED.includes(it.id)) out.push(ru ? 'Жареное и слоёное тесто — основная часть калорий: выбирайте запечённый или тандырный вариант и один кусок вместо двух.' : 'Kaloriyaning katta qismi qovurilgan yoki qatlamli xamirda: tandirda pishganini tanlang va ikkitasi o\'rniga bittasini yeng.');
  else if (MEAT.includes(it.id)) out.push(ru ? 'Ешьте с овощами вместо второй лепёшки: 1 кусок нона (88 г) — около 257 ккал.' : 'Ikkinchi non o\'rniga sabzavot bilan yeng: 1 bo\'lak non (88 g) — taxminan 257 kkal.');
  else if (it.tk === 'shirin') out.push(ru ? 'Сладкое — в начале дня и небольшим кусочком: 30 г — ' + nf(per(f, 30).k) + ' ккал.' : 'Shirinlikni kunning birinchi yarmida va kichik bo\'lakda: 30 g — ' + nf(per(f, 30).k) + ' kkal.');
  else if (it.tk === 'sut') out.push(ru ? 'Для перекуса удобно: стакан или пиала — точное число калорий в таблице выше.' : 'Tamaddi uchun qulay: stakan yoki piyola — aniq kaloriya yuqoridagi jadvalda.');
  else if (it.tk === 'meva') out.push(ru ? 'Сладкие бахчевые лучше есть отдельно от плотной еды — так проще следить за порцией.' : 'Shirin poliz mevalarini to\'q ovqatdan alohida yeng — porsiyani kuzatish osonroq.');
  if (it.tk === 'meva') out.push(ru ? 'Нарежьте порцию заранее: 1 ' + un + ' (' + u[1] + ' г) — ' + nf(per(f, u[1]).k) + ' ккал, две — ' + nf(per(f, u[1] * 2).k) + '.' : 'Porsiyani oldindan kesib qo\'ying: 1 ' + un + ' (' + u[1] + ' g) — ' + nf(per(f, u[1]).k) + ' kkal, ikkitasi — ' + nf(per(f, u[1] * 2).k) + '.');
  if (it.tk === 'salat') out.push(ru ? 'Главный источник калорий в салате — масло: 1 ст. ложка масла — около 90 ккал, заправляйте меньше.' : 'Salatdagi asosiy kaloriya — yog\'da: 1 osh qoshiq yog\' taxminan 90 kkal, kamroq soling.');
  if (it.tk === 'non') out.push(ru ? 'Половина ' + (u[0] === 'dona' ? 'штуки' : 'порции') + ' (' + Math.round(u[1] / 2) + ' г) — ' + nf(per(f, u[1] / 2).k) + ' ккал; к супу обычно хватает куска.' : 'Yarim ' + un + ' (' + Math.round(u[1] / 2) + ' g) — ' + nf(per(f, u[1] / 2).k) + ' kkal; sho\'rva bilan odatda bir bo\'lak yetadi.');
  if (out.length < 2) out.push(ru ? '100 г — ' + nf(f.k) + ' ккал: если взвесить порцию на кухонных весах, счёт будет точнее.' : '100 g — ' + nf(f.k) + ' kkal: porsiyani oshxona tarozisida tortsangiz, hisob aniqroq bo\'ladi.');
  return out.slice(0, 3);
}
function lead(it, L) {          // o'ziga xos 1–2 jumla: retsept tarkibi / manba + kaloriyaning asosiy manbasi
  const f = it.f, sh = ulush(f), top = [['p', sh.p], ['f', sh.f], ['c', sh.c]].sort((a, b) => b[1] - a[1])[0], ru = L === 'ru';
  const nm = { uz: { p: 'oqsil', f: 'yog\'', c: 'uglevod' }, ru: { p: 'белки', f: 'жиры', c: 'углеводы' } }[L];
  let s1 = '';
  const mr = /^Retsept[^:]*:\s*([^.]+)\./.exec(f.m || '');
  if (!ru && mr) s1 = 'Hisob o\'rtacha uy retseptiga asoslangan: ' + mr[1].trim() + '.';
  else if (ru) { const r = /^(Рецепт[^:]*|Расчёт[^:]*):\s*([^.]+)\./.exec(f.ms.r || ''); if (r && !/\d\s*г\b|fdc|USDA/i.test(r[2])) s1 = 'Расчёт по среднему домашнему рецепту: ' + r[2].trim() + '.'; else s1 = isRetsept(f) ? 'Значения рассчитаны по стандартному рецепту из исходных продуктов.' : 'Значения взяты из таблицы состава продуктов.'; }
  else s1 = isRetsept(f) ? 'Qiymat masalliqlardan standart retsept bo\'yicha hisoblangan.' : 'Qiymat mahsulot tarkibi jadvalidan olingan.';
  const s2 = ru ? 'Больше всего энергии дают ' + nm[top[0]] + ' — ' + Math.round(top[1] * 100) + ' % калорий.' : 'Kaloriyaning eng katta qismi — ' + nm[top[0]] + 'dan (' + Math.round(top[1] * 100) + ' %).';
  return s1 + ' ' + s2;
}

/* ---------- sayt qobig'i (blog sahifasidan; nisbiy havolalar mutlaqga) ---------- */
function shell(L) {
  const src = rd(L === 'ru' ? 'ru/blog.html' : 'blog.html'), pre = L === 'ru' ? '/ru/' : '/';
  const fix = (h) => h.replace(/href="\.\/(#[^"]*)?"/g, (m, a) => 'href="' + pre + (a || '') + '"').replace(/href="(?!https?:|\/|#|mailto:|tel:)([^"]+)"/g, 'href="' + pre + '$1"');
  const sb = fix(src.slice(src.indexOf('<div id="sitebar"'), src.indexOf('</div></div>', src.indexOf('<div id="sitebar"')) + 12));
  const ft = fix(src.slice(src.indexOf('<footer id="sf2">'), src.indexOf('</footer>') + 9));
  const boot = src.slice(src.indexOf('<script id="langboot">'), src.indexOf('</style>', src.indexOf('<style id="langcss">')) + 8);
  return { sb, ft, boot };
}
const SH = { uz: shell('uz'), ru: shell('ru') };
function langSeg(sb, L, slug) {          // UZ | ЎЗ | RU — shu sahifaning juftlariga
  const uz = '/kaloriya/' + slug, ru = '/ru/kaloriya/' + slug;
  return sb.replace(/<div class="lang-seg[\s\S]*?<\/div>/, '<div class="lang-seg lang-seg-3" role="group" aria-label="Til / Язык" data-cyr="skip"><button type="button" id="langUz"' + (L === 'uz' ? ' class="on"' : '') + '>UZ</button><a id="langCyr" href="' + uz + '?lang=cyr" rel="nofollow" hreflang="uz-Cyrl" lang="uz-Cyrl">ЎЗ</a><button type="button" id="langRu"' + (L === 'ru' ? ' class="on"' : '') + '>RU</button></div>');
}
const CSS = `.tk-main{max-width:760px;padding-top:8px;padding-bottom:40px}.tk-bc{display:flex;flex-wrap:wrap;gap:4px;font-size:var(--t-xs,14px);font-weight:600;color:var(--t-muted,#3F4F46);margin:14px 0 6px}.tk-bc a{color:#33403A;text-decoration:none}.tk-bc a:hover{text-decoration:underline}.tk-bc .sep{color:#B9C2BC}
.tk-main h1{font-size:clamp(1.5rem,5vw,2rem);line-height:1.2;margin:6px 0 10px;color:var(--ink,#0E3B2E)}.tk-lead{color:var(--text,#1A2822);max-width:62ch;margin:0 0 16px}
.tk-card{background:var(--surface,#fff);border:1px solid var(--line,#DDE5E0);border-radius:14px;padding:16px;margin:0 0 14px}.tk-card h2{font-size:1.125rem;margin:0 0 10px;color:var(--ink,#0E3B2E)}
.tk-m4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.tk-m4 div{background:var(--bg,#F1F2EE);border-radius:12px;padding:10px 6px;text-align:center}.tk-m4 b{display:block;font-size:1.25rem}.tk-m4 small{font-size:var(--t-xs,13px);color:var(--muted,#526459)}
.tk-bar{display:flex;height:10px;border-radius:6px;overflow:hidden;margin:12px 0 4px}.tk-bar i:nth-child(1){background:#3E7CB1}.tk-bar i:nth-child(2){background:#D99A2B}.tk-bar i:nth-child(3){background:#5FA67A}.tk-bar-l{display:flex;gap:12px;flex-wrap:wrap;font-size:var(--t-xs,13px);color:var(--muted,#526459)}
.tk-t{width:100%;border-collapse:collapse;font-size:.9375rem}.tk-t th,.tk-t td{padding:8px 6px;border-bottom:1px solid var(--line,#DDE5E0);text-align:right}.tk-t th:first-child,.tk-t td:first-child{text-align:left}.tk-t th{font-size:var(--t-xs,13px);color:var(--muted,#526459);font-weight:700}.tk-t tr.on td{font-weight:800}
.tk-cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px;background:#E8F2EC;border:0}.tk-cta p{margin:0;flex:1 1 220px}.tk-go{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:12px;background:#1E6B45;color:#fff;font-weight:800;text-decoration:none}.tk-go:hover{background:#17583A}
.tk-src{font-size:.9375rem;color:var(--text,#1A2822)}.tk-src small{display:block;color:var(--muted,#526459);margin-top:6px}.tk-sim{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}.tk-sim a{display:block;padding:10px 12px;border:1px solid var(--line,#DDE5E0);border-radius:12px;text-decoration:none;color:var(--ink,#0E3B2E)}.tk-sim a small{display:block;color:var(--muted,#526459)}
.tk-faq details{border-bottom:1px solid var(--line,#DDE5E0);padding:10px 0}.tk-faq summary{font-weight:700;cursor:pointer}.tk-faq p{margin:8px 0 0}.tk-more{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px}.tk-more a{font-weight:700}
.tk-ix input{width:100%;min-height:48px;border:1.5px solid var(--line,#DDE5E0);border-radius:12px;padding:0 14px;font:inherit;font-size:1rem;margin:0 0 14px}.tk-ix ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}.tk-ix li a{display:flex;justify-content:space-between;gap:8px;padding:10px 12px;border:1px solid var(--line,#DDE5E0);border-radius:12px;text-decoration:none;color:var(--ink,#0E3B2E);background:var(--surface,#fff)}.tk-ix li a small{color:var(--muted,#526459);white-space:nowrap}.tk-ix h2{font-size:1.125rem;margin:18px 0 8px}
@media (max-width:420px){.tk-m4{grid-template-columns:repeat(2,1fr)}.tk-t{font-size:.875rem}.tk-t th,.tk-t td{padding:7px 4px}}`;
function head(L, o) {
  const sh = SH[L];
  return '<!doctype html>\n<html lang="' + L + '" data-lang="' + L + '" data-ru-page="1"><head>\n<meta charset="UTF-8">\n' + sh.boot + '\n<script src="/assets/lang.js" defer></script>\n<script src="/assets/footer-lang.js" defer></script>\n<script src="/assets/sw-boot.js" defer></script>\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n<title>' + esc(o.title) + '</title>\n<meta name="description" content="' + esc(o.desc) + '">\n<link rel="canonical" href="' + o.url[L] + '">\n'
    + '<link rel="alternate" hreflang="uz" href="' + o.url.uz + '"><link rel="alternate" hreflang="ru" href="' + o.url.ru + '"><link rel="alternate" hreflang="x-default" href="' + o.url.uz + '">\n'
    + '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">\n'
    + '<link rel="stylesheet" href="/assets/css/tokens.css"><link rel="stylesheet" href="/assets/css/site.css"><script src="/assets/nav.js" defer></script><link rel="stylesheet" href="/assets/css/typo.css">\n'
    + '<meta property="og:type" content="website"><meta property="og:site_name" content="Kalki.uz"><meta property="og:title" content="' + esc(o.title) + '"><meta property="og:description" content="' + esc(o.desc) + '"><meta property="og:url" content="' + o.url[L] + '"><meta property="og:image" content="' + BASE + '/assets/og/kaloriya-kalkulyator.png?v=3"><meta name="twitter:card" content="summary_large_image">\n'
    + '<script src="/ga.js"></script>\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9398566611367796" crossorigin="anonymous"></script>\n'
    + o.ld.map((x) => '<script type="application/ld+json">' + JSON.stringify(x) + '</script>').join('\n') + '\n<style id="tkcss">' + CSS + '</style>\n</head>\n<body class="v2 typo2">\n' + langSeg(sh.sb, L, o.slug) + '\n';
}
const foot = (L) => SH[L].ft + '\n</body></html>\n';
const T = {
  uz: { home: 'Asosiy', all: 'Taomlar kaloriyasi', h1: (n, u, k) => n + ' kaloriyasi — 1 ' + u + ' ≈ ' + k + ' kkal', per100: '100 g da', kcal: 'kkal', P: 'oqsil', Y: "yog'", C: 'uglevod', g: 'g',
    titleTail: ' | Kalki.uz', desc: (n, k, u, g, kp) => n + ' kaloriyasi: 100 g — ' + k + ' kkal, 1 ' + u + ' (' + g + ' g) ≈ ' + kp + " kkal. Oqsil, yog', uglevod, porsiyalar jadvali, manba va yengilroq variant.",
    portions: 'Porsiyalar', unit: 'Porsiya', gr: 'gramm', var: 'Variantlar (uyda tayyorlashga qarab)', varN: '100 g da, kkal', cta: 'Har kuni nima yeganingizni KalkiFit\'da yozing — kunlik me\'yor o\'zi hisoblanadi.', go: "KalkiFit'da yozish", src: 'Manba', srcR: "Retsept bo'yicha hisoblangan, ±15 % — uy retsepti va porsiyaga qarab farq qiladi.", srcD: "Qiymat mahsulot tarkibi jadvalidan olingan; tayyorlanishiga qarab ±10–15 % farq bo'lishi mumkin.",
    sim: "O'xshash taomlar", light: 'Qanday yengilroq qilish mumkin', faq: 'Savollar', calc: "Kunlik me'yorni hisoblash", allL: 'Barcha taomlar', perU: (u) => '1 ' + u,
    q1: (n, u) => '1 ' + u + ' ' + n.toLowerCase() + ' necha kaloriya?', a1: (u, g, k) => '1 ' + u + ' (taxminan ' + g + ' g) — ' + k + " kkal. Aniq raqam porsiya hajmi va retseptga bog'liq.",
    q2: (n) => n + "da qancha oqsil, yog' va uglevod bor?", a2: (p, f, c) => '100 g da: oqsil ' + p + " g, yog' " + f + ' g, uglevod ' + c + ' g.',
    q3: (n) => n + ' kunlik me\'yorning qancha qismi?', a3: (k, pc) => '2 000 kkal kunlik me\'yorda 1 porsiya (' + k + ' kkal) — taxminan ' + pc + ' %. O\'z me\'yoringizni kaloriya kalkulyatorida hisoblang.',
    ixT: 'Taomlar kaloriyasi — milliy taomlar, non, sut, shirinliklar', ixD: "50 ta taomning kaloriyasi: osh, somsa, manti, lag'mon, sho'rva va boshqalar — 100 g da va porsiyada, oqsil, yog', uglevod.", ixH: 'Taomlar kaloriyasi', ixL: "O'zbek taomlarining kaloriyasi va oqsil, yog', uglevodi — 100 g da va odatiy porsiyada. Qiymatlar KalkiFit bazasidan, manbasi bilan.", ixQ: 'Taom nomini yozing…' },
  ru: { home: 'Главная', all: 'Калорийность блюд', h1: (n, u, k) => 'Калорийность: ' + n.toLowerCase() + ' — 1 ' + u + ' ≈ ' + k + ' ккал', per100: 'на 100 г', kcal: 'ккал', P: 'белки', Y: 'жиры', C: 'углеводы', g: 'г',
    titleTail: ' | Kalki.uz', desc: (n, k, u, g, kp) => n + ': калорийность 100 г — ' + k + ' ккал, 1 ' + u + ' (' + g + ' г) ≈ ' + kp + ' ккал. Белки, жиры, углеводы, таблица порций, источник и как сделать легче.',
    portions: 'Порции', unit: 'Порция', gr: 'грамм', var: 'Варианты (зависит от приготовления)', varN: 'на 100 г, ккал', cta: 'Записывайте, что едите, в KalkiFit — дневная норма считается сама.', go: 'Записать в KalkiFit', src: 'Источник', srcR: 'Рассчитано по рецепту, ±15 % — зависит от домашнего рецепта и порции.', srcD: 'Значение из таблицы состава продуктов; в зависимости от приготовления возможна разница ±10–15 %.',
    sim: 'Похожие блюда', light: 'Как сделать легче', faq: 'Вопросы', calc: 'Рассчитать дневную норму', allL: 'Все блюда', perU: (u) => '1 ' + u,
    q1: (n, u) => 'Сколько калорий в 1 ' + u + ' (' + n.toLowerCase() + ')?', a1: (u, g, k) => '1 ' + u + ' (около ' + g + ' г) — ' + k + ' ккал. Точное число зависит от размера порции и рецепта.',
    q2: (n) => 'Сколько белков, жиров и углеводов: ' + n.toLowerCase() + '?', a2: (p, f, c) => 'На 100 г: белки ' + p + ' г, жиры ' + f + ' г, углеводы ' + c + ' г.',
    q3: () => 'Какую часть дневной нормы составляет порция?', a3: (k, pc) => 'При норме 2 000 ккал 1 порция (' + k + ' ккал) — примерно ' + pc + ' %. Свою норму рассчитайте в калькуляторе калорий.',
    ixT: 'Калорийность блюд — национальные блюда, хлеб, молочное, сладости', ixD: 'Калорийность 50 блюд: плов, самса, манты, лагман, шурпа и другие — на 100 г и в порции, белки, жиры, углеводы.', ixH: 'Калорийность блюд', ixL: 'Калорийность узбекских блюд и БЖУ — на 100 г и в обычной порции. Значения из базы KalkiFit, с источником.', ixQ: 'Введите название блюда…' },
};
const name = (f, L) => (L === 'ru' ? f.r : f.n);
const pageUrl = (id) => ({ uz: BASE + '/kaloriya/' + id, ru: BASE + '/ru/kaloriya/' + id });
const pre = (L) => (L === 'ru' ? '/ru' : '');

function foodPage(it, L) {
  const f = it.f, X = T[L], u = mainUnit(f), un = UN[L][u[0]], pu = per(f, u[1]), nm = name(f, L), sh = ulush(f), vs = variants(f), sim = similar(it), tp = tips(it, L);
  const url = pageUrl(it.id), h1 = X.h1(nm, un, nf(pu.k)), title = h1 + X.titleTail, desc = X.desc(nm, nf(f.k), un, u[1], nf(pu.k));
  const faq = [[X.q1(nm, un), X.a1(un, u[1], nf(pu.k))], [X.q2(nm), X.a2(d1(f.p), d1(f.f), d1(f.c))], [X.q3(nm), X.a3(nf(pu.k), Math.round(pu.k / 2000 * 100))]];
  const ld = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: X.home, item: BASE + pre(L) + '/' }, { '@type': 'ListItem', position: 2, name: X.all, item: BASE + pre(L) + '/kaloriya/' }, { '@type': 'ListItem', position: 3, name: nm, item: url[L] }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }];
  const units = f.u.filter((x) => UN[L][x[0]]).map((x) => x[0] === 'g100' ? ['100 ' + X.g, 100] : [X.perU(UN[L][x[0]]), x[1]]);
  const rows = units.map(([lab, g]) => { const v = per(f, g); return '<tr' + (g === u[1] && lab !== '100 ' + X.g ? ' class="on"' : '') + '><td>' + esc(lab) + '</td><td>' + nf(g) + '</td><td>' + nf(v.k) + '</td><td>' + d1(v.p) + '</td><td>' + d1(v.f) + '</td><td>' + d1(v.c) + '</td></tr>'; }).join('');
  const kf = 'taom-' + it.id, deep = pre(L) + '/kalkifit?taom=' + encodeURIComponent(it.id);
  let h = head(L, { title, desc, url, ld, slug: it.id }) + '<main class="wrap tk-main" id="main">\n'
    + '<nav class="tk-bc" aria-label="Breadcrumb"><a href="' + pre(L) + '/">' + esc(X.home) + '</a><span class="sep">›</span><a href="' + pre(L) + '/kaloriya/">' + esc(X.all) + '</a><span class="sep">›</span><span>' + esc(nm) + '</span></nav>\n'
    + '<h1 data-kf-k="' + kf + '">' + esc(h1) + '</h1>\n<p class="tk-lead">' + esc(lead(it, L)) + '</p>\n'
    + '<section class="tk-card" id="tkMacro"><h2>' + esc(X.per100) + '</h2><div class="tk-m4"><div><b>' + nf(f.k) + '</b><small>' + X.kcal + '</small></div><div><b>' + d1(f.p) + ' ' + X.g + '</b><small>' + X.P + '</small></div><div><b>' + d1(f.f) + ' ' + X.g + '</b><small>' + X.Y + '</small></div><div><b>' + d1(f.c) + ' ' + X.g + '</b><small>' + X.C + '</small></div></div>'
    + '<div class="tk-bar" aria-hidden="true"><i style="flex:' + sh.p.toFixed(3) + '"></i><i style="flex:' + sh.f.toFixed(3) + '"></i><i style="flex:' + sh.c.toFixed(3) + '"></i></div><div class="tk-bar-l"><span>' + X.P + ' ' + Math.round(sh.p * 100) + ' %</span><span>' + X.Y + ' ' + Math.round(sh.f * 100) + ' %</span><span>' + X.C + ' ' + Math.round(sh.c * 100) + ' %</span></div></section>\n'
    + '<section class="tk-card" id="tkPors"><h2>' + esc(X.portions) + '</h2><table class="tk-t"><thead><tr><th>' + X.unit + '</th><th>' + X.g + '</th><th>' + X.kcal + '</th><th>' + X.P + '</th><th>' + X.Y + '</th><th>' + X.C + '</th></tr></thead><tbody>' + rows + '</tbody></table></section>\n'
    + (vs.length >= 2 ? '<section class="tk-card" id="tkVar"><h2>' + esc(X.var) + '</h2><table class="tk-t"><thead><tr><th></th><th>' + esc(X.varN) + '</th><th>' + esc(X.perU(un)) + '</th></tr></thead><tbody>' + vs.map((v) => '<tr' + (v.def ? ' class="on"' : '') + '><td>' + esc(v[L]) + '</td><td>' + nf(v.kc) + '</td><td>' + nf(v.kc * u[1] / 100) + '</td></tr>').join('') + '</tbody></table></section>\n' : '')
    + '<section class="tk-card tk-cta" id="tkCta"><p>' + esc(X.cta) + '</p><a class="tk-go" id="tkGo" href="' + deep + '" data-kf="' + kf + '">' + esc(X.go) + ' ›</a></section>\n'
    + '<section class="tk-card tk-src" id="tkSrc"><h2>' + esc(X.src) + '</h2><p>' + esc(L === 'ru' ? f.ms.r : f.ms.u) + '<small>' + esc(isRetsept(f) ? X.srcR : X.srcD) + '</small></p></section>\n'
    + '<section class="tk-card" id="tkSim"><h2>' + esc(X.sim) + '</h2><div class="tk-sim">' + sim.map((s) => { const su = mainUnit(s.f); return '<a href="' + pre(L) + '/kaloriya/' + s.id + '">' + esc(name(s.f, L)) + '<small>1 ' + esc(UN[L][su[0]]) + ' ≈ ' + nf(per(s.f, su[1]).k) + ' ' + X.kcal + '</small></a>'; }).join('') + '</div></section>\n'
    + '<section class="tk-card" id="tkLight"><h2>' + esc(X.light) + '</h2><ul>' + tp.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></section>\n'
    + '<section class="tk-card tk-faq" id="tkFaq"><h2>' + esc(X.faq) + '</h2>' + faq.map(([q, a]) => '<details><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>').join('') + '</section>\n'
    + '<p class="tk-more"><a href="' + pre(L) + '/kaloriya-kalkulyator">' + esc(X.calc) + ' ›</a><a href="' + pre(L) + '/kaloriya/">' + esc(X.allL) + ' ›</a></p>\n</main>\n' + foot(L);
  return h;
}
function indexPage(L) {
  const X = T[L], url = { uz: BASE + '/kaloriya/', ru: BASE + '/ru/kaloriya/' };
  const ld = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: X.home, item: BASE + pre(L) + '/' }, { '@type': 'ListItem', position: 2, name: X.all, item: url[L] }] }];
  let body = '';
  for (const [tk, uzN, ruN] of TOIFA) { const its = sel.filter((x) => x.tk === tk); if (!its.length) continue; body += '<h2>' + esc(L === 'ru' ? ruN : uzN) + '</h2><ul>' + its.map((it) => { const u = mainUnit(it.f); return '<li data-q="' + esc((it.f.n + ' ' + it.f.r + ' ' + (it.f.a || []).slice(0, 8).join(' ')).toLowerCase()) + '"><a href="' + pre(L) + '/kaloriya/' + it.id + '">' + esc(name(it.f, L)) + '<small>1 ' + esc(UN[L][u[0]]) + ' ≈ ' + nf(per(it.f, u[1]).k) + ' ' + X.kcal + '</small></a></li>'; }).join('') + '</ul>'; }
  return head(L, { title: X.ixT + X.titleTail, desc: X.ixD, url, ld, slug: '' }).replace(/href="\/kaloriya\/\?lang=cyr"/, 'href="/kaloriya/?lang=cyr"') + '<main class="wrap tk-main tk-ix" id="main">\n<nav class="tk-bc" aria-label="Breadcrumb"><a href="' + pre(L) + '/">' + esc(X.home) + '</a><span class="sep">›</span><span>' + esc(X.all) + '</span></nav>\n<h1 data-kf-k="taom-indeks">' + esc(X.ixH) + '</h1>\n<p class="tk-lead">' + esc(X.ixL) + '</p>\n'
    + '<input type="search" id="tkQ" placeholder="' + esc(X.ixQ) + '" aria-label="' + esc(X.ixQ) + '" autocomplete="off">\n<div id="tkList">' + body + '</div>\n<p class="tk-more"><a href="' + pre(L) + '/kaloriya-kalkulyator">' + esc(X.calc) + ' ›</a></p>\n</main>\n'
    + '<script>(function(){var q=document.getElementById(\'tkQ\');if(!q)return;q.addEventListener(\'input\',function(){var v=q.value.trim().toLowerCase(),ls=document.querySelectorAll(\'#tkList li\');for(var i=0;i<ls.length;i++){var t=ls[i].getAttribute(\'data-q\')+\' \'+ls[i].textContent.toLowerCase();ls[i].hidden=!!v&&t.indexOf(v)<0}var hs=document.querySelectorAll(\'#tkList h2\');for(var j=0;j<hs.length;j++){var ul=hs[j].nextElementSibling,any=ul&&[].some.call(ul.children,function(x){return!x.hidden});hs[j].hidden=!any;if(ul)ul.hidden=!any}})})();</script>\n' + foot(L);
}

/* ---------- yozish (faqat to'g'ridan-to'g'ri yurgizilganda; testlar require qilsa — yozmaydi) ---------- */
if (require.main === module) {
const out = [];
for (const it of sel) for (const L of ['uz', 'ru']) { wr((L === 'ru' ? 'ru/' : '') + 'kaloriya/' + it.id + '.html', foodPage(it, L)); out.push(it.id); }
wr('kaloriya/index.html', indexPage('uz')); wr('ru/kaloriya/index.html', indexPage('ru'));
wr('data/taom-sahifalar.json', JSON.stringify({ v: 1, ids: sel.map((x) => x.id) }) + '\n');
{ let s = rd('sitemap.xml'); const day = new Date().toISOString().slice(0, 10); s = s.replace(/\s*<url><loc>https:\/\/kalki\.uz\/(ru\/)?kaloriya\/[^<]*<\/loc>[^\n]*<\/url>/g, '');
  const add = ['/kaloriya/', '/ru/kaloriya/'].concat(...sel.map((x) => ['/kaloriya/' + x.id, '/ru/kaloriya/' + x.id])).map((p) => '  <url><loc>' + BASE + p + '</loc><lastmod>' + day + '</lastmod><changefreq>monthly</changefreq><priority>' + (/\/kaloriya\/$/.test(p) ? '0.7' : '0.6') + '</priority></url>').join('\n');
  s = s.replace('</urlset>', add + '\n</urlset>'); wr('sitemap.xml', s); }
console.log('sahifalar:', sel.length, '× 2 til + indeks | o\'tmadi:', rad.length ? rad.map((x) => x.join(' — ')).join('; ') : 'yo\'q');
}
module.exports = { TOIFA, ok, mainUnit };
