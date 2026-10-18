#!/usr/bin/env node
/* kalki.uz — test ishga tushirgich (CLAUDE.md "Testlar" bo'limi).
 *
 *   npm run test:tez     o'zgargan fayllarga qarab kerakli testlarni tanlaydi (maqsad < 15 daqiqa)
 *   npm run test:toliq   to'liq to'plam (parallel, 3 ta bir vaqtda)
 *   node tools/testlar.js tez --list        faqat nima tanlanishini ko'rsatadi
 *   node tools/testlar.js tez --base main   o'zgarishlarni main bilan solishtiradi (standart: origin/main bilan merge-base)
 *   node tools/testlar.js toliq --only pages,katta     (to'plamdan tanlab)
 *   TEST_JOBS=2 — bir vaqtda nechta test jarayoni (standart 3; server 4 yadro, xotira ~7,5 GB)
 *
 * QOIDALAR: bitta test yiqilsa — tuzat va FAQAT shuni qayta yurgiz (`--only <id>`); to'liq to'plamni qayta boshlama.
 * 15b (prerender: ru/oila-byudjet random demo soni) e'tiborga olinmaydi. Golden farqi faqat qadam matni yoki sanaga bog'liq
 * bo'lsa — xato emas ("ogohlantirish" sifatida chiqadi; qayta yozish: node tools/dizayn/oltin.mjs record . <slug>). */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawn, execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const MODE = args[0] === 'toliq' ? 'toliq' : 'tez';
const flag = (n) => { const i = args.indexOf('--' + n); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const JOBS_N = Math.max(1, Number(process.env.TEST_JOBS) || 3);
const ONLY = flag('only') ? String(flag('only')).split(',') : null;
const LIST = !!flag('list');
const D = 'tools/dizayn/';

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const V2 = readJson(D + 'v2-pages.json').map((f) => f.replace(/\.html$/, ''));
const PAGES = readJson(D + 'pages.json');
const GOLD = new Set(fs.readdirSync(path.join(ROOT, D + 'oltin')).map((f) => f.replace(/\.(uz|ru)\.json$/, '')));
const STEPS = readJson('data/qadamlar.json');
const TYPE = Object.fromEntries(PAGES.map((p) => [p.slug, p.tur]));

/* ---------- test ro'yxati (to'liq to'plam) ----------
   t: taxminiy vaqt (soniya) — katta tartibida boshlanadi; mutex: bir vaqtda ishlamasligi kerak bo'lganlar
   (verify-all repo barmoq izini tekshiradi — rasm yozuvchi testlar bilan birga yurmasin). */
const nodeJs = ['tools/test-avto.js', 'tools/test-doc-checks.js', 'tools/test-doc-handoff.js', 'tools/test-elektr-tarif.js', 'tools/test-gaz-tarif.js', 'tools/test-konditsioner-tanlash.js', 'tools/test-prognoz.js', 'tools/translit-test.js', 'tools/test-baza-hisob.js'];
const T = (id, file, o) => Object.assign({ id, cmd: ['node', file], t: 60 }, o || {});
const ALL = [
  T('verify-all', 'tools/verify-all.js', { t: 560, mutex: 'repo', note15b: true }),
  T('pages', D + 'test-pages.mjs', { t: 900, slugs: 'args' }),
  T('kontrast', D + 'test-kontrast.mjs', { t: 900, slugs: 'comma' }),
  T('kontrast-katta', D + 'test-kontrast.mjs', { t: 900, slugs: 'comma', env: { KATTA: '1' } }),
  T('katta', D + 'test-katta.mjs', { t: 900, slugs: 'args' }),
  T('golden', D + 'oltin.mjs', { t: 900, golden: true }),
  T('sticky', D + 'test-sticky.mjs', { t: 400, mutex: 'repo', shots: true }),   // gisht skrinshotlarini docs/ ga yozadi -> verify-all bilan birga yurmaydi
  T('mobil', D + 'test-mobil.mjs', { t: 240 }),
  T('qadam', D + 'test-qadam.mjs', { t: 200, slugs: 'args' }),
  T('modetip', D + 'test-modetip.mjs', { t: 40 }),
  T('sarlavha', D + 'test-sarlavha.mjs', { t: 90 }),
  T('v2', D + 'test-v2.mjs', { t: 150, mutex: 'repo', shots: true }),
  T('cyr', D + 'test-cyr.mjs', { t: 60 }),
  T('sw', D + 'test-sw.mjs', { t: 40 }),
  T('pwa', D + 'test-pwa.mjs', { t: 40, mutex: 'repo', shots: true }),
  T('404', D + 'test-404.mjs', { t: 30 }),
  T('elektr', D + 'test-elektr.mjs'), T('gaz', D + 'test-gaz.mjs'), T('prognoz', D + 'test-prognoz.mjs', { t: 120 }),
  T('konditsioner', D + 'test-konditsioner.mjs'), T('quyosh', D + 'test-quyosh.mjs'), T('avto-elektro', D + 'test-avto-elektro.mjs'),
  T('ishonch', D + 'test-ishonch.mjs'), T('nasiya', D + 'test-nasiya.mjs', { t: 45 }),
  T('menyu-hover', D + 'test-menyu-hover.mjs', { t: 60 }),
  T('sodda', D + 'test-sodda.mjs', { t: 70 }),
  T('rozgor-core', D + 'test-rozgor-core.mjs', { t: 15 }), T('rozgor', D + 'test-rozgor.mjs', { t: 90 }),
  T('kalkifit-core', D + 'test-kalkifit-core.mjs', { t: 20 }), T('kalkifit-api', D + 'test-kalkifit-api.mjs', { t: 5 }), T('kalkifit', D + 'test-kalkifit.mjs', { t: 250 }), T('kalkifit-qidiruv', D + 'test-kalkifit-qidiruv.mjs', { t: 60 }), T('kalkifit-porsiya', D + 'test-kalkifit-porsiya.mjs', { t: 120 }), T('kalkifit-odatdagi', D + 'test-kalkifit-odatdagi.mjs', { t: 120 }), T('kalkifit-baza', D + 'test-kalkifit-baza.mjs', { t: 200 }), T('kalkifit-idish', D + 'test-kalkifit-idish.mjs', { t: 200 }), T('kalkifit-soddalik', D + 'test-kalkifit-soddalik.mjs', { t: 300 }), T('kalkifit-hazil', D + 'test-kalkifit-hazil.mjs', { t: 200 }), T('kalkifit-tuzatish', D + 'test-kalkifit-tuzatish.mjs', { t: 300 }), T('install', D + 'test-install.mjs', { t: 90 }), T('migrate', D + 'test-migrate.mjs', { t: 120 }), T('zaxira', D + 'test-zaxira.mjs', { t: 300 }), T('zaxira-api', D + 'test-zaxira-api.mjs', { t: 20 }), T('tema', D + 'test-tema.mjs', { t: 400 }), T('ilovalar-ui', D + 'test-ilovalar-ui.mjs', { t: 60 }), T('yangilik', D + 'test-yangilik.mjs', { t: 200 }), T('yangilik-qoida', D + 'test-yangilik-qoida.mjs', { t: 5 }),   // KalkiFit ilovasi: hisob (5 soat mintaqasi), AI endpoint, Playwright
    // Ro'zg'or ilovasi: hisob (5 soat mintaqasi) va Playwright   // oila-byudjet: sodda oqim (390px), saqlash/ulashish moslik   // yuqori menyu dropdown: kursor sekin tushganda yopilmasligi (nav.js / site.css)
  T('links-runtime', D + 'test-links-runtime.mjs'), T('download', D + 'test-download.mjs'),
  T('verify-404', 'tools/verify-404.js', { t: 20 }),
  { id: 'node-testlar', cmd: ['sh', '-c', nodeJs.map((f) => 'node ' + f).join(' && ')], t: 30 }
];
const byId = Object.fromEntries(ALL.map((j) => [j.id, j]));

/* ---------- o'zgargan fayllar ---------- */
function git(...a) { try { return execFileSync('git', a, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch (e) { return ''; } }
function changedFiles() {
  if (flag('files')) return { files: String(flag('files')).split(','), base: '--files' };   // sinov uchun: o'zgargan fayllar ro'yxatini qo'lda berish
  const set = new Set();
  let base = flag('base');
  if (!base || base === true) {
    const mb = git('merge-base', 'HEAD', 'origin/main').trim(), head = git('rev-parse', 'HEAD').trim(), br = git('rev-parse', '--abbrev-ref', 'HEAD').trim();
    // feature branch: main'dan ajralgandan beri; main'ning o'zida (yoki branch'da hali commit yo'q) — oxirgi commit + saqlanmagan o'zgarishlar
    base = mb && mb !== head ? mb : (br && br !== 'main' && mb ? head : 'HEAD~1');
  }
  git('diff', '--name-only', base).split('\n').forEach((f) => f && set.add(f));
  git('diff', '--name-only').split('\n').forEach((f) => f && set.add(f));               // saqlanmagan o'zgarishlar
  git('ls-files', '--others', '--exclude-standard').split('\n').forEach((f) => f && set.add(f));
  return { files: [...set], base };
}

/* assets/<modul>.js -> shu modulning testlari. Ro'yxatda YO'Q assets/*.js — umumiy hisoblanadi (to'liq to'plam). */
const MODULE_TESTS = {
  'assets/nasiya-hisob.js': ['nasiya'], 'assets/rozgor-core.js': ['rozgor-core', 'rozgor'], 'assets/rozgor-app.js': ['rozgor'], 'assets/app-install.js': ['install', 'migrate', 'kalkifit', 'rozgor'], 'assets/app-backup.js': ['zaxira', 'zaxira-api', 'kalkifit', 'rozgor'], 'assets/app-yangilik.js': ['yangilik', 'yangilik-qoida', 'kalkifit', 'rozgor', 'kalkifit-soddalik'], 'data/yangiliklar-kalkifit.json': ['yangilik', 'yangilik-qoida'], 'data/yangiliklar-rozgor.json': ['yangilik', 'yangilik-qoida'], 'functions/api/zaxira.js': ['zaxira-api'], 'functions/_lib/zaxira-store.js': ['zaxira-api'], 'tools/zaxira-export.js': ['zaxira-api'], 'assets/css/appkit.css': ['rozgor', 'kalkifit', 'ilovalar-ui', 'tema'], 'assets/css/rozgor.css': ['rozgor', 'tema'], 'tools/dizayn/tema-istisno.json': ['tema'], 'assets/kalkifit-core.js': ['kalkifit-core', 'kalkifit', 'kalkifit-qidiruv', 'kalkifit-odatdagi', 'kalkifit-idish'], 'assets/kalkifit-app.js': ['kalkifit', 'kalkifit-qidiruv', 'kalkifit-porsiya', 'kalkifit-odatdagi', 'kalkifit-baza', 'kalkifit-idish', 'kalkifit-soddalik', 'kalkifit-hazil', 'kalkifit-tuzatish'], 'assets/css/kalkifit.css': ['kalkifit', 'kalkifit-porsiya', 'kalkifit-soddalik', 'kalkifit-tuzatish', 'tema'], 'assets/kalkifit-gaplar.js': ['kalkifit', 'kalkifit-hazil'], 'data/hazillar-kalkifit.json': ['kalkifit', 'kalkifit-hazil'], 'assets/app-kit.js': ['rozgor', 'kalkifit'], 'assets/css/appkit.css': ['rozgor', 'kalkifit', 'kalkifit-soddalik', 'tema'], 'data/ovqatlar.json': ['kalkifit-core', 'kalkifit', 'kalkifit-qidiruv', 'node-testlar', 'kalkifit-baza'], 'functions/api/kalkifit.js': ['kalkifit-api', 'kalkifit-baza'], 'data/baza-retseptlar.json': ['node-testlar'], 'data/baza-masalliq.json': ['node-testlar'], 'tools/baza-hisob.js': ['node-testlar'], 'tools/baza-v2.js': ['node-testlar', 'kalkifit-core'], 'tools/ovqatlar-build.js': ['kalkifit-core', 'kalkifit-qidiruv'], 'functions/api/kalkifit.js': ['kalkifit-api'], 'assets/mode-tip.js': ['modetip'], 'assets/elektr-tarif.js': ['elektr', 'node-testlar'], 'assets/gaz-tarif.js': ['gaz', 'node-testlar'],
  'assets/tier-bar.js': ['elektr', 'gaz'], 'assets/prognoz.js': ['prognoz', 'elektr', 'gaz', 'node-testlar'], 'assets/konditsioner.js': ['konditsioner', 'node-testlar'],
  'assets/translit.js': ['cyr', 'node-testlar'], 'assets/cyr.js': ['cyr'], 'assets/pwa-install.js': ['pwa'], 'assets/sw-boot.js': ['sw', 'pwa'],
  'assets/avto-rasm.js': ['avto-elektro', 'node-testlar'], 'assets/hisobsiyosati.js': ['golden:hisob-siyosati-generatori'], 'assets/csvexport.js': ['download'],
  'assets/ai-ariza.js': ['ishonch'], 'assets/ai-promo.js': ['ishonch'], 'assets/doc-checks.js': ['node-testlar'], 'assets/doc-handoff.js': ['node-testlar'],
  'assets/datanote.js': [], 'assets/partners.js': [], 'assets/tgcta.js': [], 'assets/crosslink.js': ['links-runtime']
};
/* sahifaning o'ziga xos testi: sahifa o'zgarsa shu test ham tanlanadi */
const PAGE_TESTS = { 'index': ['ilovalar-ui'], 'rozgor': ['rozgor', 'rozgor-core'], 'kalkifit': ['kalkifit', 'kalkifit-core', 'kalkifit-qidiruv', 'kalkifit-porsiya', 'kalkifit-odatdagi', 'kalkifit-baza', 'kalkifit-idish', 'kalkifit-soddalik', 'kalkifit-hazil', 'kalkifit-tuzatish'], 'kaloriya-kalkulyator': ['kalkifit'], 'oila-byudjet-kalkulyator': ['sodda', 'rozgor'], 'naqd-nasiya-kredit-kalkulyator': ['nasiya'] };
/* Bularning birortasi o'zgarsa — umumiy ta'sir: test:toliq (CLAUDE.md) */
const UMUMIY = [/^tools\/site-chrome\.js$/, /^assets\/css\/(?!rozgor\.css|appkit\.css|kalkifit\.css)/, /^sw\.js$/, /^tools\/prerender\.js$/, /^assets\/tarif-core\.js$/, /^assets\/(nav|lang|footer-lang|calc-v2|answerbox|docgen|icons)\./, /^tools\/render\.js$/, /^tools\/chunked\.js$/, /^tools\/test-cleanup\.cjs$/, /^tools\/dizayn\/parallel\.mjs$/, /^package\.json$/];
const slugOf = (f) => { const m = /^(?:ru\/|cyr\/)?([a-z0-9-]+)\.html$/.exec(f); return m ? m[1] : null; };

function selectTez() {
  const { files, base } = changedFiles();
  const why = [], pick = new Map(), slugs = new Set(); let escalate = null;
  const add = (id, slugList) => { const cur = pick.get(id) || { slugs: new Set() }; (slugList || []).forEach((s) => cur.slugs.add(s)); pick.set(id, cur); };
  add('verify-all'); add('cyr'); add('yangilik-qoida');      // yangiliklar qoidasi: ilova kodi o'zgarsa yozuv shart (CLAUDE.md)
  for (const f of files) {
    const um = UMUMIY.find((re) => re.test(f)); if (um) { escalate = escalate || f; continue; }
    const s = slugOf(f); if (s && !['404', 'offline'].includes(s)) { slugs.add(s); continue; }
    if (MODULE_TESTS[f]) { MODULE_TESTS[f].forEach((id) => { if (id.startsWith('golden:')) { slugs.add(id.slice(7)); } else add(id); }); why.push(f + ' → ' + (MODULE_TESTS[f].join(', ') || '—')); continue; }
    if (/^assets\/[^/]+\.js$/.test(f)) { escalate = escalate || f; continue; }                    // ro'yxatda yo'q umumiy modul
    const tm = /^tools\/dizayn\/test-([a-z0-9-]+)\.mjs$/.exec(f); if (tm && byId[tm[1]]) { add(tm[1]); why.push(f + ' → ' + tm[1]); continue; }
    if (f === 'data/qadamlar.json') { add('qadam'); add('modetip'); why.push(f + ' → qadam, modetip'); continue; }
    if (f === 'index.html' || f === 'sitemap.xml' || f === 'ru/index.html') { add('v2'); continue; }
    if (f === 'tools/verify-all.js') continue;
  }
  if (slugs.size > 25) escalate = escalate || ('>25 sahifa o\'zgargan (' + slugs.size + ')');
  if (escalate) return { escalate, files, base };
  const sl = [...slugs];
  const v2s = sl.filter((s) => V2.includes(s));
  if (v2s.length) { add('pages', v2s); add('kontrast', v2s); add('katta', v2s); }
  const gs = sl.filter((s) => GOLD.has(s)); if (gs.length) add('golden', gs);
  sl.forEach((s) => (PAGE_TESTS[s] || []).forEach((id) => add(id)));
  const qs = sl.filter((s) => STEPS.steps[s]); if (qs.length) add('qadam', qs);
  if (sl.includes('index')) add('v2');
  return { pick, slugs: sl, files, base, why };
}

/* ---------- ishga tushirish ---------- */
function jobSpec(job, slugs) {
  const cmd = job.cmd.slice(); const env = Object.assign({}, process.env, job.env || {});
  if (slugs && slugs.length) {
    if (job.slugs === 'args') cmd.push(...slugs);
    else if (job.slugs === 'comma') cmd.push(slugs.join(','));
    else if (job.golden) cmd.push('compare', '.', ...slugs);
  } else if (job.golden) cmd.push('compare', '.');
  return { cmd, env };
}
const strip = (s) => s.split('\n').filter((l) => !/INFO:CONSOLE|^\[pid=|^\s*$/.test(l));
function runJob(job, slugs) {
  const { cmd, env } = jobSpec(job, slugs); const t0 = Date.now();
  return new Promise((resolve) => {
    const p = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] }); let out = '';
    const kill = setTimeout(() => { try { p.kill('SIGKILL'); } catch (e) {} out += '\n[TIMEOUT]'; }, 55 * 60 * 1000);
    p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { out += d; });
    p.on('close', (rc) => { clearTimeout(kill); resolve({ job, slugs, rc: rc == null ? 1 : rc, ms: Date.now() - t0, out }); });
  });
}
const SKIP_PAGE_LINE = /^\s*(OK|ok)\b/;
/* Golden: farq faqat qadam matni / bugungi sanaga bog'liq bo'lsa — ogohlantirish (xato emas) */
function goldenVerdict(out) {
  const lines = out.split('\n'); let cur = null; const bad = [], warn = new Set();
  const words = (slug) => { const w = new Set(); const st = STEPS.steps[slug] || []; st.forEach((x) => { x.uz.split(/\s+/).concat(x.ru.split(/\s+/)).forEach((a) => w.add(a)); });
    (STEPS.modes[slug] || []).forEach((g) => g.tips.forEach((t) => t.uz.split(/\s+/).concat(t.ru.split(/\s+/)).forEach((a) => w.add(a)))); return w; };
  for (const l of lines) {
    const m = /^FARQ (\S+) (uz|ru)/.exec(l); if (m) { cur = m[1]; continue; }
    if (!cur || !l.startsWith('     ')) continue;
    if (/so'z farqi:/.test(l)) {
      const W = words(cur);
      for (const it of l.split('farqi:')[1].split('|')) { const mm = /\s*[+-]\d+ (.*)/.exec(it); if (!mm) continue; const w = mm[1].trim();
        if (W.has(w) || /^[^\wа-яёўқғҳ]*$/i.test(w) || /["×]$|\d/.test(w) || W.has(w.replace(/["”]+$/, ''))) continue;   // qadam so'zi / yopishgan belgi / son (sana)
        bad.push(cur + ': ' + w); }
      warn.add(cur); continue;
    }
    const mm = /eski=(.*?) \| yangi=(.*)$/.exec(l);                                      // hujjat matni: faqat raqam farqi (sana) bo'lsa — ogohlantirish
    if (mm && mm[1].replace(/\d+/g, '#') === mm[2].replace(/\d+/g, '#').slice(0, mm[1].length)) { warn.add(cur); continue; }
    if (/kirish @/.test(l)) { warn.add(cur); continue; }
    bad.push(cur + ': ' + l.trim().slice(0, 120));
  }
  return { bad, warn: [...warn] };
}
function verdict(r) {
  const out = strip(r.out);
  if (r.job.golden) { const g = goldenVerdict(r.out); if (r.rc !== 0 && !g.bad.length) return { ok: true, note: g.warn.length ? 'farq faqat qadam matni/sana: ' + g.warn.join(', ') : '' }; if (r.rc === 0) return { ok: true, note: '' }; return { ok: false, tail: g.bad.slice(0, 12) }; }
  if (r.job.note15b) { const fails = out.filter((l) => /^FAIL /.test(l)); const real = fails.filter((l) => !/^FAIL 15b\b/.test(l));
    if (r.rc === 0) return { ok: true, note: '' };
    if (fails.length && !real.length) return { ok: true, note: '15b (flaky) e\'tiborsiz' };
    return { ok: false, tail: (real.length ? real : out.slice(-8)).slice(0, 8).map((l) => l.slice(0, 220)) }; }
  if (r.rc === 0) return { ok: true, note: '' };
  const tail = out.filter((l) => !SKIP_PAGE_LINE.test(l)).slice(-14).map((l) => l.slice(0, 220));
  return { ok: false, tail };
}

async function schedule(items) {                     // items: [{job, slugs}]
  const queue = items.slice().sort((a, b) => b.job.t - a.job.t); const running = new Set(); const results = []; let busyMutex = null;
  await new Promise((resolveAll) => {
    const pump = () => {
      for (let i = 0; i < queue.length && running.size < JOBS_N; ) {
        const it = queue[i]; const mx = it.job.mutex;
        const conflict = mx && [...running].some((r) => r.job.mutex === mx);
        if (conflict) { i++; continue; }
        queue.splice(i, 1); running.add(it); const t0 = Date.now();
        console.log('▶ ' + it.job.id + (it.slugs && it.slugs.length ? ' (' + it.slugs.length + ' sahifa)' : ''));
        runJob(it.job, it.slugs).then((r) => { const v = verdict(r); r.v = v; results.push(r); running.delete(it);
          console.log((v.ok ? '✔ ' : '✘ ') + it.job.id + '  ' + (r.ms / 1000).toFixed(1) + 's' + (v.note ? '  — ' + v.note : ''));
          if (!v.ok) (v.tail || []).forEach((l) => console.log('     ' + l));
          pump(); });
      }
      if (!queue.length && !running.size) resolveAll();
    };
    pump();
  });
  return results;
}
function cleanup() { git('checkout', '--', 'docs/dizayn-skrinshot'); }

(async () => {
  const t0 = Date.now(); let items = [];
  const stray = (() => { try { return execFileSync('sh', ['-c', 'pgrep -fa "[c]hromium|[c]hrome-headless|[w]orkerd|[w]rangler" | grep -v "pgrep" | wc -l']).toString().trim(); } catch (e) { return '?'; } })();
  if (stray !== '0') console.log('! Ogohlantirish: osilib qolgan brauzer/wrangler jarayonlari: ' + stray + '  (tozalash: ps -eo pid,etimes,args | grep -E "[c]hrom|[w]orkerd" ; kill <pid>)');
  if (MODE === 'toliq') items = ALL.map((job) => ({ job, slugs: null }));
  else {
    const sel = selectTez();
    if (sel.escalate) { console.log('! Umumiy fayl o\'zgargan (' + sel.escalate + ') → to\'liq to\'plam (CLAUDE.md qoidasi).'); items = ALL.map((job) => ({ job, slugs: null })); }
    else {
      console.log('Asos: ' + sel.base + ' | o\'zgargan fayllar: ' + sel.files.length + ' | sahifalar: ' + (sel.slugs.join(', ') || '—'));
      sel.why.forEach((w) => console.log('  ' + w));
      items = [...sel.pick.entries()].map(([id, v]) => ({ job: byId[id], slugs: [...v.slugs] }));
    }
  }
  if (ONLY) items = items.filter((it) => ONLY.includes(it.job.id));
  console.log('Tanlangan testlar (' + items.length + '): ' + items.map((it) => it.job.id + (it.slugs && it.slugs.length ? '[' + it.slugs.length + ']' : '')).join(', ') + '  | parallel: ' + JOBS_N);
  if (LIST) return;
  const results = await schedule(items); cleanup();
  const wall = (Date.now() - t0) / 1000;
  console.log('\n=== NATIJA (' + MODE + ') ===');
  results.sort((a, b) => b.ms - a.ms).forEach((r) => console.log((r.v.ok ? 'OK    ' : 'YIQILDI') + '  ' + String((r.ms / 1000).toFixed(1)).padStart(7) + 's  ' + r.job.id));
  const sum = results.reduce((s, r) => s + r.ms, 0) / 1000; const failed = results.filter((r) => !r.v.ok);
  console.log('Jami devor vaqti: ' + (wall / 60).toFixed(1) + ' daqiqa (testlar yig\'indisi ' + (sum / 60).toFixed(1) + ' daqiqa)');
  if (failed.length) console.log('Yiqilgan: ' + failed.map((r) => r.job.id).join(', ') + '\nQayta yurgizish: node tools/testlar.js ' + MODE + ' --only ' + failed.map((r) => r.job.id).join(','));
  else console.log('Hammasi o\'tdi.');
  try { fs.writeFileSync(path.join(os.tmpdir(), 'kalki-test-vaqt.json'), JSON.stringify({ mode: MODE, wall, results: results.map((r) => ({ id: r.job.id, s: r.ms / 1000, ok: r.v.ok })) }, null, 1)); } catch (e) { /* tmp */ }
  process.exit(failed.length ? 1 : 0);
})();
