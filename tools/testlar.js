#!/usr/bin/env node
/* kalki.uz — test ishga tushirgich (CLAUDE.md "Testlar" bo'limi).
 *
 *   npm run test:tez     o'zgargan fayllarga qarab kerakli testlarni tanlaydi (maqsad < 15 daqiqa)
 *   npm run test:toliq   to'liq to'plam (parallel, 3 ta bir vaqtda)
 *   node tools/testlar.js tez --list        faqat nima tanlanishini ko'rsatadi
 *   node tools/testlar.js tez --base main   o'zgarishlarni main bilan solishtiradi (standart: origin/main bilan merge-base)
 *   node tools/testlar.js toliq --only pages,katta     (to'plamdan tanlab)
 *   TEST_JOBS=N — kafolatlangan ishchilar soni (standart: yadrolar − 1); TEST_JOBS_MAX — yuk ruxsat bersa ko'pi bilan (standart: 3 × ishchi)
 *   TEST_RETRY=0 — yiqilgan testni qayta urinmaslik (standart: 1 marta, natijada «qayta urinib o'tdi» deb belgilanadi)
 *
 * Tezlik (docs/testlar.md): og'ir sahifa testlari (pages, kontrast, katta, golden, qadam) slug bo'yicha, katta ilova testlari (kalkifit, verify-all)
 *   mustaqil bo'limlar bo'yicha (`bolak`, TEST_BOLAK=i/n) BO'LAKLARGA bo'linadi; eng uzunlari birinchi boshlanadi.
 *   Ishga tushirish YUKGA qarab: kamida TEST_JOBS, ko'pi bilan TEST_JOBS_MAX jarayon — bo'sh CPU ≥ 20 % va bo'sh xotira ≥ 1500 MB bo'lsa yangisi qo'shiladi
 *   (testlarning ~75 % vaqti kutish — CPU kam ishlatadi, shuning uchun jarayonlar yadrodan ko'p bo'lishi mumkin).
 *   Har ishga alohida vaqtinchalik papka (TMPDIR) va skrinshot papkasi (SKRINSHOT_DIR) — testlar bir-biriga va repoga yozmaydi.
 *   Yurish paytida kod o'zgarsa (tools/kod-kuzat.cjs) — yurish to'xtatiladi: eski kod natijasi kerak emas.
 *   Har test uchun CPU vaqti ham o'lchanadi; eng sekin 15 ta: node tools/testlar.js sekin   (oxirgi yurish: <tmp>/kalki-test-vaqt.json)
 *
 * QOIDALAR: bitta test yiqilsa — tuzat va FAQAT shuni qayta yurgiz (`--only <id>`); to'liq to'plamni qayta boshlama.
 * 15b (prerender: ru/oila-byudjet random demo soni) e'tiborga olinmaydi. Golden farqi faqat qadam matni yoki sanaga bog'liq
 * bo'lsa — xato emas ("ogohlantirish" sifatida chiqadi; qayta yozish: node tools/dizayn/oltin.mjs record . <slug>). */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawn, execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (args[0] === 'sekin') {                           // oxirgi yurishdagi eng sekin 15 ta test
  try { const j = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'kalki-test-vaqt.json'), 'utf8')); console.log('Oxirgi yurish (' + j.mode + '), devor vaqti ' + (j.wall / 60).toFixed(1) + ' daqiqa');
    j.results.slice().sort((a, b) => b.s - a.s).slice(0, 15).forEach((r, i) => console.log(String(i + 1).padStart(2) + '. ' + r.id.padEnd(20) + String(r.s.toFixed(0)).padStart(6) + 's' + (r.cpu != null ? '  cpu ' + r.cpu.toFixed(0) + 's' : '') + (r.parts > 1 ? '  [' + r.parts + ' bo\'lak]' : ''))); } catch (e) { console.log('Hali yurish yo\'q: avval node tools/testlar.js tez|toliq'); }
  process.exit(0);
}
const MODE = args[0] === 'toliq' ? 'toliq' : 'tez';
const flag = (n) => { const i = args.indexOf('--' + n); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const CORES = os.cpus().length;
const JOBS_N = Math.max(1, Number(process.env.TEST_JOBS) || Math.max(2, CORES - 1));          // ishchilar: yadrolar − 1 (bittasi tizim va boshqa servislarga)
const JOBS_MAX = Math.max(JOBS_N, Number(process.env.TEST_JOBS_MAX) || JOBS_N * 3);        // yuk ruxsat bersa (kutish-bog'liq testlar) — ko'proq
const RETRY = process.env.TEST_RETRY === '0' ? 0 : 1;
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
   t: taxminiy vaqt (soniya) — katta tartibida boshlanadi; mutex: bir vaqtda ishlamasligi kerak bo'lganlar («ketma-ket» guruh: hozir bo'sh —
   ilgari sticky/v2/pwa docs/ ga yozardi, endi SKRINSHOT_DIR); shard: slug bo'laklari; bolak: bo'lim bo'laklari (TEST_BOLAK); noRetry: qayta urinilmaydi
   (deterministik: golden, verify-all). */
const nodeJs = ['tools/test-avto.js', 'tools/test-doc-checks.js', 'tools/test-doc-handoff.js', 'tools/test-elektr-tarif.js', 'tools/test-gaz-tarif.js', 'tools/test-konditsioner-tanlash.js', 'tools/test-prognoz.js', 'tools/translit-test.js', 'tools/test-baza-hisob.js'];
const T = (id, file, o) => Object.assign({ id, cmd: ['node', file], t: 60 }, o || {});
const ALL = [
  T('verify-all', 'tools/verify-all.js', { t: 560, note15b: true, bolak: 3, noRetry: true }),          // repo barmoq izi (24-band) — testlar repoga yozmaydi; bo'limlar bo'yicha 3 bo'lak
  T('pages', D + 'test-pages.mjs', { t: 900, slugs: 'args', shard: 4 }),
  T('kontrast', D + 'test-kontrast.mjs', { t: 900, slugs: 'comma', shard: 4 }),
  T('kontrast-katta', D + 'test-kontrast.mjs', { t: 900, slugs: 'comma', shard: 4, env: { KATTA: '1' } }),
  T('katta', D + 'test-katta.mjs', { t: 900, slugs: 'args', shard: 3 }),
  T('golden', D + 'oltin.mjs', { t: 900, golden: true, shard: 3, noRetry: true }),
  T('sticky', D + 'test-sticky.mjs', { t: 400, shots: true }),   // skrinshotlar SKRINSHOT_DIR ga (runner: vaqtinchalik papka) — repo o'zgarmaydi, verify-all bilan birga yura oladi
  T('mobil', D + 'test-mobil.mjs', { t: 240 }),
  T('qadam', D + 'test-qadam.mjs', { t: 200, slugs: 'args', shard: 2 }),
  T('modetip', D + 'test-modetip.mjs', { t: 40 }),
  T('sarlavha', D + 'test-sarlavha.mjs', { t: 90 }),
  T('v2', D + 'test-v2.mjs', { t: 150, shots: true }),
  T('cyr', D + 'test-cyr.mjs', { t: 60 }),
  T('sw', D + 'test-sw.mjs', { t: 40 }),
  T('pwa', D + 'test-pwa.mjs', { t: 40, shots: true }),
  T('404', D + 'test-404.mjs', { t: 30 }),
  T('elektr', D + 'test-elektr.mjs'), T('gaz', D + 'test-gaz.mjs'), T('prognoz', D + 'test-prognoz.mjs', { t: 120 }),
  T('konditsioner', D + 'test-konditsioner.mjs'), T('quyosh', D + 'test-quyosh.mjs'), T('avto-elektro', D + 'test-avto-elektro.mjs'),
  T('ishonch', D + 'test-ishonch.mjs'), T('nasiya', D + 'test-nasiya.mjs', { t: 45 }),
  T('menyu-hover', D + 'test-menyu-hover.mjs', { t: 60 }),
  T('sodda', D + 'test-sodda.mjs', { t: 70 }),
  T('rozgor-core', D + 'test-rozgor-core.mjs', { t: 15 }), T('rozgor', D + 'test-rozgor.mjs', { t: 90 }),
  T('kalkifit-core', D + 'test-kalkifit-core.mjs', { t: 20 }), T('kalkifit-api', D + 'test-kalkifit-api.mjs', { t: 5 }), T('orinbosar', D + 'test-orinbosar.mjs', { t: 5 }), T('yeymiz-malumot', D + 'test-yeymiz-malumot.mjs', { t: 10 }), T('hisob', D + 'test-hisob.mjs', { t: 30 }), T('onboarding2', D + 'test-onboarding2.mjs', { t: 300 }), T('onboarding-parda', D + 'test-onboarding-parda.mjs', { t: 20 }), T('retsept', D + 'test-retsept.mjs', { t: 150 }), T('retsept-core', 'tools/test-retsept-core.js', { t: 5 }), T('retsept-api', D + 'test-retsept-api.mjs', { t: 5 }), T('soddalik2', D + 'test-soddalik2.mjs', { t: 150 }), T('yemaydi', D + 'test-yemaydi.mjs', { t: 300 }), T('yeymiz', D + 'test-yeymiz.mjs', { t: 300 }), T('uyda-pp', D + 'test-uyda-pp.mjs', { t: 200 }), T('ux-v44', D + 'test-ux-v44.mjs', { t: 300 }), T('qator-bosish', D + 'test-qator-bosish.mjs', { t: 300 }), T('plato', D + 'test-plato.mjs', { t: 300 }), T('plato-core', 'tools/test-plato-core.js', { t: 10 }), T('tartib', D + 'test-tartib.mjs', { t: 300 }), T('tartib-core', 'tools/test-tartib-core.js', { t: 10 }), T('limit-v51', 'tools/test-limit-v51.js', { t: 10 }), T('limit-v62', 'tools/test-limit-v62.js', { t: 10 }), T('tarix2', 'tools/test-tarix2.js', { t: 10 }), T('baza1', D + 'test-baza1.mjs', { t: 15 }), T('baza2', D + 'test-baza2.mjs', { t: 15 }), T('baza3', D + 'test-baza3.mjs', { t: 15 }), T('tarix2-ui', D + 'test-tarix2.mjs', { t: 110 }), T('limit-v62-ui', D + 'test-limit-v62.mjs', { t: 60 }), T('qadam-idempotent', 'tools/test-qadam-idempotent.js', { t: 10 }), T('qidiruv-topilmadi', 'tools/test-qidiruv-topilmadi.js', { t: 10 }), T('v52-ui', D + 'test-v52.mjs', { t: 250 }), T('afsona', D + 'test-afsona.mjs', { t: 300 }), T('mashq', 'tools/test-mashq.js', { t: 15 }), T('mashq-ui', D + 'test-mashq.mjs', { t: 300 }), T('tahrir', D + 'test-tahrir.mjs', { t: 120 }), T('batareya', D + 'test-batareya.mjs', { t: 60 }), T('mashq2', D + 'test-mashq2.mjs', { t: 90 }), T('qadam-idempotent-ui', D + 'test-qadam-idempotent.mjs', { t: 200 }), T('limit-v51-ui', D + 'test-limit-v51.mjs', { t: 300 }), T('qadam-karta', D + 'test-qadam-karta.mjs', { t: 300 }), T('profil-v50', D + 'test-profil-v50.mjs', { t: 300 }), T('orinbosar-ui', D + 'test-orinbosar-ui.mjs', { t: 120 }), T('push', D + 'test-push.mjs', { t: 5 }), T('kalkifit-dizayn2', D + 'test-kalkifit-dizayn2.mjs', { t: 200 }), T('push-ui', D + 'test-push-ui.mjs', { t: 150 }), T('kalkifit', D + 'test-kalkifit.mjs', { t: 250, bolak: 4 }), T('kalkifit-qidiruv', D + 'test-kalkifit-qidiruv.mjs', { t: 60 }), T('kalkifit-porsiya', D + 'test-kalkifit-porsiya.mjs', { t: 120 }), T('kalkifit-odatdagi', D + 'test-kalkifit-odatdagi.mjs', { t: 120 }), T('kalkifit-baza', D + 'test-kalkifit-baza.mjs', { t: 200 }), T('kalkifit-idish', D + 'test-kalkifit-idish.mjs', { t: 200 }), T('kalkifit-soddalik', D + 'test-kalkifit-soddalik.mjs', { t: 300 }), T('kalkifit-hazil', D + 'test-kalkifit-hazil.mjs', { t: 200 }), T('kalkifit-tuzatish', D + 'test-kalkifit-tuzatish.mjs', { t: 300 }), T('install', D + 'test-install.mjs', { t: 90 }), T('migrate', D + 'test-migrate.mjs', { t: 120 }), T('zaxira', D + 'test-zaxira.mjs', { t: 300 }), T('zaxira-api', D + 'test-zaxira-api.mjs', { t: 20 }), T('ilova', D + 'test-ilova.mjs', { t: 200 }), T('til', D + 'test-til.mjs', { t: 200 }), T('til-ekran', D + 'test-til-ekran.mjs', { t: 90 }), T('qadam-auto', D + 'test-qadam-auto.mjs', { t: 120 }), T('baza-kengaytma', D + 'test-baza-kengaytma.mjs', { t: 20 }), T('ai-limit', D + 'test-ai-limit.mjs', { t: 20 }), T('rasm-variant', D + 'test-rasm-variant.mjs', { t: 120 }), T('rasm-android', D + 'test-rasm-android.mjs', { t: 120 }), T('joylashuv', D + 'test-kalkifit-joylashuv.mjs', { t: 300 }), T('android-sifat', D + 'test-kalkifit-android-sifat.mjs', { t: 200 }), T('qadam-ulash', D + 'test-qadam-ulash.mjs', { t: 200 }), T('suv-ichimlik', D + 'test-suv-ichimlik.mjs', { t: 200 }), T('kun-karta', D + 'test-kun-karta.mjs', { t: 200 }), T('haftalik', D + 'test-haftalik.mjs', { t: 200 }), T('menyu', D + 'test-menyu.mjs', { t: 200 }), T('ovoz', D + 'test-ovoz.mjs', { t: 260 }), T('hikoya', D + 'test-hikoya.mjs', { t: 200 }), T('google', D + 'test-google.mjs', { t: 260 }), T('stat', D + 'test-stat.mjs', { t: 60 }), T('admin', D + 'test-admin.mjs', { t: 10 }), T('admin-ui', D + 'test-admin-ui.mjs', { t: 40 }), T('stat-ui', D + 'test-stat-ui.mjs', { t: 150 }), T('baza-turk', D + 'test-baza-turk.mjs', { t: 30 }), T('sut-sport', D + 'test-sut-sport.mjs', { t: 200 }), T('akkaunt-api', D + 'test-akkaunt-api.mjs', { t: 60 }), T('akkaunt-ui', D + 'test-akkaunt-ui.mjs', { t: 300 }), T('akkaunt-b-ui', D + 'test-akkaunt-b-ui.mjs', { t: 500 }), T('tema', D + 'test-tema.mjs', { t: 400 }), T('ilovalar-ui', D + 'test-ilovalar-ui.mjs', { t: 60 }), T('yangilik', D + 'test-yangilik.mjs', { t: 200 }), T('yangilik-qoida', D + 'test-yangilik-qoida.mjs', { t: 5 }), T('tanishtiruv', D + 'test-kalkifit-tanishtiruv.mjs', { t: 120 }), T('qidiruv-sifat', 'tools/test-qidiruv-sifat.js', { t: 10 }), T('qidiruv-miqdor', 'tools/test-qidiruv-miqdor.js', { t: 5 }), T('kalkifit-imkoniyatlar', D + 'test-kalkifit-imkoniyatlar.mjs', { t: 60 }), T('qoshish', D + 'test-kalkifit-qoshish.mjs', { t: 150 }),   // KalkiFit ilovasi: hisob (5 soat mintaqasi), AI endpoint, Playwright
    // Ro'zg'or ilovasi: hisob (5 soat mintaqasi) va Playwright   // oila-byudjet: sodda oqim (390px), saqlash/ulashish moslik   // yuqori menyu dropdown: kursor sekin tushganda yopilmasligi (nav.js / site.css)
  T('links-runtime', D + 'test-links-runtime.mjs'), T('download', D + 'test-download.mjs'),
  T('verify-404', 'tools/verify-404.js', { t: 20 }),
  T('cyr-aralash', 'tools/test-cyr-aralash.js', { t: 5 }),      // ЎЗ: bitta so'zda lotin+kirill yo'q; o'zbekcha matnda link/app/dark/TG/UZS yo'q
  { id: 'node-testlar', cmd: ['sh', '-c', nodeJs.map((f) => 'node ' + f).join(' && ')], t: 30 }
];
const byId = Object.fromEntries(ALL.map((j) => [j.id, j]));
/* rejalashtirish tartibi: oxirgi to'liq yurishdagi HAQIQIY vaqt (tools/testlar-vaqt.json) — eng uzun test birinchi boshlanadi */
try { const est = readJson('tools/testlar-vaqt.json').vaqt; ALL.forEach((j) => { if (est[j.id] > 0) j.t = est[j.id] * (j.shard || j.bolak || 1); }); } catch (e) { /* eski taxminlar */ }          // est — bo'lak boshiga; j.t — butun test

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
  'assets/nasiya-hisob.js': ['nasiya'], 'assets/orinbosar-core.js': ['orinbosar', 'orinbosar-ui'], 'assets/cheklov-core.js': ['yeymiz-malumot', 'yeymiz'], 'assets/yeymiz-core.js': ['yeymiz-malumot', 'yeymiz', 'uyda-pp'], 'assets/uyda-pp-core.js': ['uyda-pp'], 'data/uyda-pp.json': ['uyda-pp'], 'tools/uyda-pp-manba.js': ['uyda-pp'], 'tools/uyda-pp-yasa.js': ['uyda-pp'], 'data/yeymiz.json': ['yeymiz-malumot', 'yeymiz'], 'assets/kalkifit-retsept.js': ['retsept', 'soddalik2'], 'assets/retsept-core.js': ['retsept-core', 'retsept-api', 'retsept'], 'data/retsept-masalliq.json': ['retsept-core', 'retsept-api', 'retsept'], 'functions/api/retsept.js': ['retsept-api'], 'tools/retsept-yasa.js': ['retsept-core'], 'assets/kalkifit-demo.js': ['soddalik2'], 'assets/kalkifit-intro.js': ['soddalik2', 'tanishtiruv'], 'assets/kalkifit-yeymiz.js': ['tartib', 'uyda-pp', 'retsept', 'yemaydi', 'onboarding2', 'yeymiz', 'orinbosar-ui', 'push-ui', 'kalkifit-soddalik', 'menyu', 'stat-ui'], 'assets/hisob-kun.js': ['hisob', 'yeymiz', 'onboarding2'], 'assets/num-slider.js': ['onboarding2', 'kalkifit', 'kalkifit-soddalik'], 'tools/dizayn/ob-yordam.mjs': ['onboarding2', 'kalkifit', 'yeymiz'], 'functions/api/hisob.js': ['hisob', 'admin'], 'functions/_lib/admin-auth.js': ['admin', 'stat', 'hisob', 'akkaunt-api', 'push'], 'functions/_lib/qurilma-tur.js': ['admin', 'stat'], 'functions/api/admin/[amal].js': ['admin', 'admin-ui'], 'admin/kalkifit-statistika.html': ['admin', 'admin-ui', 'stat-ui'], 'tools/dizayn/test-admin-ui.mjs': ['admin-ui'], 'admin/kalkifit-takliflar.html': ['admin'], 'migrations/admin-stat.sql': ['admin', 'stat'], 'migrations/manba.sql': ['admin', 'stat', 'admin-ui'], 'tools/hisob-hisobot.js': ['hisob'], 'migrations/hisob.sql': ['hisob'], 'migrations/push-yeymiz.sql': ['push'], 'assets/uyda-core.js': ['yeymiz-malumot', 'yeymiz'], 'data/cheklov-teglar.json': ['yeymiz-malumot', 'yeymiz', 'yemaydi'], 'data/uyda.json': ['yeymiz-malumot', 'yeymiz'], 'tools/cheklov-teglar.js': ['yeymiz-malumot'], 'tools/uyda-yasa.js': ['yeymiz-malumot'], 'assets/partners.json': ['yeymiz-malumot'], 'assets/rozgor-core.js': ['rozgor-core', 'rozgor'], 'assets/rozgor-app.js': ['rozgor'], 'assets/app-install.js': ['install', 'migrate', 'kalkifit', 'rozgor'], 'assets/app-backup.js': ['zaxira', 'zaxira-api', 'akkaunt-b-ui', 'kalkifit', 'rozgor'], 'assets/app-yangilik.js': ['yangilik', 'yangilik-qoida', 'kalkifit', 'rozgor', 'kalkifit-soddalik'], 'data/yangiliklar-kalkifit.json': ['yangilik', 'yangilik-qoida'], 'data/yangiliklar-rozgor.json': ['yangilik', 'yangilik-qoida'], 'assets/app-akkaunt.js': ['profil-v50', 'akkaunt-ui', 'akkaunt-b-ui', 'kalkifit', 'rozgor', 'google'], 'functions/api/akkaunt/[amal].js': ['akkaunt-api', 'akkaunt-ui', 'akkaunt-b-ui', 'google'], 'functions/_lib/akkaunt-konvert.js': ['akkaunt-api'], 'functions/_lib/akkaunt-store.js': ['akkaunt-api'], 'functions/_lib/akkaunt-email.js': ['akkaunt-api'], 'functions/_lib/akkaunt-kalit.js': ['akkaunt-api'], 'tools/akkaunt-export.js': ['akkaunt-api'], 'tools/akkaunt-import.js': ['akkaunt-api'], 'tools/akkaunt-kalit.js': ['akkaunt-api'], 'migrations/akkaunt.sql': ['akkaunt-api', 'akkaunt-ui', 'akkaunt-b-ui'], 'functions/api/zaxira.js': ['zaxira-api'], 'functions/_lib/zaxira-store.js': ['zaxira-api'], 'tools/zaxira-export.js': ['zaxira-api'], 'assets/css/appkit.css': ['rozgor', 'kalkifit', 'ilovalar-ui', 'tema', 'akkaunt-ui', 'akkaunt-b-ui'], 'assets/css/rozgor.css': ['rozgor', 'tema'], 'tools/dizayn/tema-istisno.json': ['tema'], 'assets/kalkifit-core.js': ['tarix2', 'tarix2-ui', 'qidiruv-sifat', 'qidiruv-miqdor', 'kalkifit-core', 'kalkifit', 'kalkifit-qidiruv', 'kalkifit-odatdagi', 'kalkifit-idish', 'tartib-core', 'plato-core', 'tartib', 'limit-v51', 'limit-v51-ui', 'qadam-idempotent', 'qadam-idempotent-ui', 'qidiruv-topilmadi', 'v52-ui', 'mashq', 'mashq-ui', 'limit-v62', 'limit-v62-ui'], 'assets/app-native.js': ['limit-v62-ui', 'qadam-karta', 'qadam-auto', 'ilova', 'push-ui', 'rasm-android', 'android-sifat', 'qadam-ulash', 'haftalik', 'kun-karta'], 'assets/kalkifit-gaplar.js': ['kalkifit-hazil', 'kalkifit', 'suv-ichimlik', 'kun-karta'], 'assets/kalkifit-kunkarta.js': ['kun-karta'], 'assets/kalkifit-hafta.js': ['haftalik', 'hikoya', 'limit-v51-ui', 'mashq-ui'], 'assets/kalkifit-menyu.js': ['menyu'], 'assets/kalkifit-ovoz.js': ['ovoz'], 'assets/kalkifit-hikoya.js': ['hikoya', 'plato'], 'assets/kalkifit-plato.js': ['tarix2', 'mashq', 'limit-v51', 'limit-v62', 'limit-v51-ui', 'plato-core', 'plato', 'kalkifit', 'cyr-aralash', 'tartib-core'], 'tools/test-tartib-core.js': ['tartib-core'], 'tools/test-limit-v51.js': ['limit-v51'], 'tools/test-limit-v62.js': ['limit-v62'], 'tools/test-tarix2.js': ['tarix2'], 'tools/dizayn/test-baza1.mjs': ['baza1'], 'tools/dizayn/test-baza2.mjs': ['baza2'], 'tools/dizayn/test-baza3.mjs': ['baza3'], 'tools/ovqatlar-kengaytma4.js': ['baza3'], 'tools/ovqatlar-kengaytma3.js': ['baza2'], 'tools/ikonka-toplam.js': ['baza2', 'baza3'], 'data/ikonka-reja.txt': ['baza2', 'baza3'], 'tools/ovqatlar-kengaytma2.js': ['baza1'], 'tools/ovqatlar-alias.json': ['baza1'], 'tools/dizayn/test-tarix2.mjs': ['tarix2-ui'], 'tools/dizayn/test-limit-v62.mjs': ['limit-v62-ui'], 'tools/limit-tahlil.js': ['limit-v62'], 'tools/test-qadam-idempotent.js': ['qadam-idempotent'], 'tools/test-qidiruv-topilmadi.js': ['qidiruv-topilmadi'], 'tools/dizayn/test-v52.mjs': ['v52-ui'], 'tools/dizayn/test-afsona.mjs': ['afsona'], 'tools/test-mashq.js': ['mashq'], 'tools/dizayn/test-mashq.mjs': ['mashq-ui'], 'assets/kalkifit-afsona.js': ['afsona', 'cyr-aralash'], 'data/afsonalar.json': ['afsona', 'cyr-aralash'], 'tools/afsona-yasa.py': ['afsona'], 'tools/dizayn/test-qadam-idempotent.mjs': ['qadam-idempotent-ui'], 'tools/dizayn/test-limit-v51.mjs': ['limit-v51-ui'], 'tools/dizayn/test-tartib.mjs': ['tartib'], 'tools/dizayn/plato-demo.cjs': ['plato-core', 'plato'], 'tools/test-plato-core.js': ['plato-core'], 'tools/dizayn/test-plato.mjs': ['plato'], 'functions/api/ovoz.js': ['ovoz'], 'functions/_lib/google-id.js': ['google'], 'migrations/push-hafta.sql': ['haftalik', 'push'], 'data/suv-ulush.json': ['suv-ichimlik'], 'functions/api/stat.js': ['limit-v62-ui', 'stat', 'admin', 'admin-ui'], 'migrations/stat.sql': ['stat'], 'assets/stat-kun.js': ['stat', 'stat-ui'], 'assets/stat-pr.js': ['stat'], 'admin/kalkifit-statistika.html': ['stat'], 'tools/suv-yasa.js': ['suv-ichimlik'], 'data/hazillar.json': ['tarix2', 'kalkifit-hazil', 'cyr-aralash'], 'tools/ovqatlar-turk.js': ['baza-turk', 'baza-kengaytma', 'kalkifit-baza', 'yeymiz-malumot', 'orinbosar'], 'tools/ovqatlar-kengaytma.js': ['baza-kengaytma', 'kalkifit-baza', 'yeymiz-malumot', 'orinbosar'], 'data/manba/yorliq.json': ['baza-kengaytma'], 'functions/api/kalkifit-quota.js': ['ai-limit', 'retsept-api', 'kalkifit-api'], 'functions/api/kalkifit-rasm.js': ['ai-limit', 'kalkifit-api', 'rasm-variant', 'menyu'], 'functions/api/kalkifit-menyu.js': ['menyu', 'ai-limit'], 'functions/api/retsept.js': ['ai-limit', 'retsept-api'], 'functions/api/qidiruv.js': ['ai-limit', 'qidiruv-miqdor'], 'functions/_lib/soz-norm.js': ['qidiruv-miqdor', 'stat', 'admin-ui'], 'assets/kalkifit-app.js': ['tarix2-ui', 'limit-v62-ui', 'mashq2', 'batareya', 'tahrir', 'mashq-ui', 'afsona', 'v52-ui', 'qadam-idempotent-ui', 'limit-v51-ui', 'kalkifit-imkoniyatlar', 'qator-bosish', 'plato', 'tartib', 'qadam-karta', 'profil-v50', 'tanishtiruv', 'qoshish', 'retsept', 'yemaydi', 'onboarding2', 'yeymiz', 'kalkifit', 'kalkifit-qidiruv', 'kalkifit-porsiya', 'kalkifit-odatdagi', 'kalkifit-baza', 'kalkifit-idish', 'kalkifit-soddalik', 'kalkifit-hazil', 'kalkifit-tuzatish', 'orinbosar-ui', 'push-ui', 'kalkifit-dizayn2', 'til', 'til-ekran', 'qadam-auto', 'rasm-variant', 'rasm-android', 'baza-turk', 'sut-sport', 'ilova', 'joylashuv', 'android-sifat', 'qadam-ulash', 'suv-ichimlik', 'stat', 'stat-ui', 'kun-karta', 'haftalik', 'menyu', 'ovoz', 'hikoya'], 'assets/css/kalkifit.css': ['tarix2-ui', 'mashq2', 'batareya', 'tahrir', 'mashq-ui', 'afsona', 'v52-ui', 'plato', 'tartib', 'qadam-karta', 'profil-v50', 'kalkifit-imkoniyatlar', 'qoshish', 'joylashuv', 'retsept', 'yemaydi', 'onboarding2', 'yeymiz', 'kalkifit', 'kalkifit-porsiya', 'kalkifit-soddalik', 'kalkifit-tuzatish', 'tema'], 'data/hazillar.json': ['tarix2', 'kalkifit', 'kalkifit-hazil'], 'assets/app-kit.js': ['rozgor', 'kalkifit', 'ux-v44'], 'assets/css/appkit.css': ['rozgor', 'kalkifit', 'kalkifit-soddalik', 'tema', 'akkaunt-ui', 'akkaunt-b-ui'], 'data/ovqatlar.json': ['baza1', 'baza2', 'baza3', 'qidiruv-topilmadi', 'qidiruv-sifat', 'qidiruv-miqdor', 'kalkifit-core', 'kalkifit', 'kalkifit-qidiruv', 'node-testlar', 'kalkifit-baza', 'sut-sport', 'yeymiz-malumot'], 'data/baza-oilalar.json': ['sut-sport', 'kalkifit-baza', 'node-testlar', 'yeymiz-malumot'], 'data/baza-retseptlar.json': ['sut-sport', 'kalkifit-baza', 'node-testlar', 'yeymiz-malumot'], 'data/baza-masalliq.json': ['sut-sport', 'node-testlar', 'yeymiz-malumot'], 'data/manba/usda-sr-legacy.json': ['sut-sport', 'node-testlar'], 'tools/ovqatlar-build.js': ['sut-sport', 'kalkifit-baza', 'node-testlar'], 'tools/ovqatlar-manba.json': ['sut-sport', 'node-testlar'], 'tools/baza-v2.js': ['sut-sport', 'kalkifit-baza', 'node-testlar'], 'tools/cheklov-teglar.js': ['sut-sport', 'yeymiz-malumot'], 'functions/api/kalkifit.js': ['kalkifit-api', 'kalkifit-baza', 'ovoz', 'ai-limit'], 'data/baza-retseptlar.json': ['node-testlar'], 'data/baza-masalliq.json': ['node-testlar'], 'tools/baza-hisob.js': ['node-testlar'], 'tools/baza-v2.js': ['node-testlar', 'kalkifit-core'], 'tools/ovqatlar-build.js': ['kalkifit-core', 'kalkifit-qidiruv'], 'assets/mode-tip.js': ['modetip'], 'assets/elektr-tarif.js': ['elektr', 'node-testlar'], 'assets/gaz-tarif.js': ['gaz', 'node-testlar'],
  'assets/tier-bar.js': ['elektr', 'gaz'], 'assets/prognoz.js': ['prognoz', 'elektr', 'gaz', 'node-testlar'], 'assets/konditsioner.js': ['konditsioner', 'node-testlar'],
  'assets/translit.js': ['cyr', 'node-testlar', 'cyr-aralash'], 'assets/cyr.js': ['cyr'], 'assets/pwa-install.js': ['pwa'], 'assets/sw-boot.js': ['sw', 'pwa'],
  'assets/avto-rasm.js': ['avto-elektro', 'node-testlar'], 'assets/hisobsiyosati.js': ['golden:hisob-siyosati-generatori'], 'assets/csvexport.js': ['download'],
  'assets/ai-ariza.js': ['ishonch'], 'assets/ai-promo.js': ['ishonch'], 'assets/doc-checks.js': ['node-testlar'], 'assets/doc-handoff.js': ['node-testlar'],
  'assets/datanote.js': [], 'assets/partners.js': [], 'assets/tgcta.js': [], 'assets/crosslink.js': ['links-runtime']
};
/* sahifaning o'ziga xos testi: sahifa o'zgarsa shu test ham tanlanadi */
const PAGE_TESTS = { 'index': ['ilovalar-ui'], 'rozgor': ['rozgor', 'rozgor-core'], 'kalkifit': ['kalkifit', 'kalkifit-core', 'kalkifit-qidiruv', 'kalkifit-porsiya', 'kalkifit-odatdagi', 'kalkifit-baza', 'kalkifit-idish', 'kalkifit-soddalik', 'kalkifit-hazil', 'kalkifit-tuzatish'], 'kaloriya-kalkulyator': ['kalkifit'], 'oila-byudjet-kalkulyator': ['sodda', 'rozgor'], 'naqd-nasiya-kredit-kalkulyator': ['nasiya'] };
/* Bularning birortasi o'zgarsa — umumiy ta'sir: test:toliq (CLAUDE.md) */
const UMUMIY = [/^tools\/site-chrome\.js$/, /^assets\/css\/(?!rozgor\.css|appkit\.css|kalkifit\.css)/, /^sw\.js$/, /^tools\/prerender\.js$/, /^assets\/tarif-core\.js$/, /^assets\/(nav|lang|footer-lang|calc-v2|answerbox|docgen|icons)\./, /^tools\/render\.js$/, /^tools\/chunked\.js$/, /^tools\/test-cleanup\.cjs$/, /^tools\/dizayn\/parallel\.mjs$/, /^package\.json$/];
const slugOf = (f) => { const m = /^(?:ru\/|cyr\/)?([a-z0-9-]+)\.html$/.exec(f); return m ? m[1] : null; };

/* sw.js: har relizda faqat SW_VERSION qatori avtomatik o'zgaradi (tools/sw-version.js) — bu sahifalar ko'rinishi/ishiga ta'sir qilmaydi.
   Boshqa har qanday sw.js o'zgarishi — umumiy (to'liq to'plam). */
function swFaqatVersiya(base) {
  const d = (git('diff', '-U0', base, '--', 'sw.js') + git('diff', '-U0', '--', 'sw.js')).split('\n').filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l));
  return d.length > 0 && d.every((l) => /^[+-]const SW_VERSION = '[0-9a-f]+';\s*\/\* sw-version:auto \*\/\s*$/.test(l));
}
function selectTez() {
  const { files, base } = changedFiles();
  const why = [], pick = new Map(), slugs = new Set(); let escalate = null;
  const add = (id, slugList) => { const cur = pick.get(id) || { slugs: new Set() }; (slugList || []).forEach((s) => cur.slugs.add(s)); pick.set(id, cur); };
  add('verify-all'); add('cyr'); add('cyr-aralash'); add('yangilik-qoida');      // yangiliklar qoidasi: ilova kodi o'zgarsa yozuv shart (CLAUDE.md)
  for (const f of files) {
    if (f === 'sw.js' && swFaqatVersiya(base)) { add('sw'); add('pwa'); why.push('sw.js → sw, pwa (faqat SW_VERSION o\'zgargan — sahifalarga ta\'sir yo\'q; mos kelishini check:sw va verify-all 7-band tekshiradi)'); continue; }
    const um = UMUMIY.find((re) => re.test(f)); if (um) { escalate = escalate || f; continue; }
    if (/^ilova\//.test(f) || f === 'assets/css/ilova.css' || f === 'assets/app-native.js' || f === 'tools/ilova-yangila.js') { add('ilova'); if (f === 'assets/css/ilova.css') add('tema'); if (f === 'assets/app-native.js') { add('kalkifit'); } continue; }
    const s = slugOf(f); if (s && !['404', 'offline'].includes(s)) { slugs.add(s); continue; }
    if (MODULE_TESTS[f]) { MODULE_TESTS[f].forEach((id) => { if (id.startsWith('golden:')) { slugs.add(id.slice(7)); } else add(id); }); why.push(f + ' → ' + (MODULE_TESTS[f].join(', ') || '—')); continue; }
    if (/^assets\/[^/]+\.js$/.test(f)) { escalate = escalate || f; continue; }                    // ro'yxatda yo'q umumiy modul
    const tm = /^tools\/dizayn\/test-([a-z0-9-]+)\.mjs$/.exec(f); if (tm && byId[tm[1]]) { add(tm[1]); why.push(f + ' → ' + tm[1]); continue; }
    if (/^(tools\/(push-yubor|webpush)\.js|migrations\/push\.sql|functions\/api\/push\/|migrations\/push-hafta\.sql|data\/baliq-kuni\.json)/.test(f)) { add('push'); why.push(f + ' → push'); continue; }
    if (/^data\/(ovqatlar|oqsil-manba|orinbosar|baza-[a-z-]+)\.json$|^data\/manba\/|^tools\/(oqsil-teglar|orinbosar-yasa|baza-[a-z-]+|ovqatlar-[a-z-]+)\.(js|json|py)$/.test(f)) { add('kalkifit-baza'); add('orinbosar'); why.push(f + ' → kalkifit-baza, orinbosar'); continue; }
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
let jobSeq = 0, TMP_ROOT = null;
function jobSpec(job, slugs, bolak) {
  if (!TMP_ROOT) TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'kalki-test-'));
  const cmd = job.cmd.slice(); const tmp = path.join(TMP_ROOT, 'j' + (++jobSeq)); fs.mkdirSync(path.join(tmp, 'skrinshot'), { recursive: true });
  const env = Object.assign({}, process.env, job.env || {}, { TMPDIR: tmp, SKRINSHOT_DIR: path.join(tmp, 'skrinshot'), TEST_ISH: String(jobSeq), TEST_ID: job.id }, bolak ? { TEST_BOLAK: bolak } : {});          // har ish — o'z vaqtinchalik papkasi
  if (slugs && slugs.length) {
    if (job.slugs === 'args') cmd.push(...slugs);
    else if (job.slugs === 'comma') cmd.push(slugs.join(','));
    else if (job.golden) cmd.push('compare', '.', ...slugs);
  } else if (job.golden) cmd.push('compare', '.');
  return { cmd, env, tmp };
}
const strip = (s) => s.split('\n').filter((l) => !/INFO:CONSOLE|^\[pid=|^\s*$/.test(l));
const TIME_BIN = fs.existsSync('/usr/bin/time') ? '/usr/bin/time' : null;                  // CPU vaqtini o'lchash (bola jarayonlar bilan: Chromium ham)
const CPU_RE = /^@@CPU ([\d.]+) ([\d.]+)$/m, CG_RE = /^@@CG (\d+)$/m;
/* haqiqiy CPU (Chromium bolalari bilan — ular /usr/bin/time ga ko'rinmaydi): har ish alohida cgroup'da (systemd-run --user --scope) */
const CG_OK = process.env.TEST_CGROUP !== '0' && (() => { try { execFileSync('systemd-run', ['--user', '--scope', '-q', 'true'], { stdio: 'ignore', timeout: 5000 }); return true; } catch (e) { return false; } })();
const RUNNING = new Set();
function runJob(job, slugs, bolak) {
  let { cmd, env, tmp } = jobSpec(job, slugs, bolak); const t0 = Date.now();
  if (TIME_BIN) cmd = [TIME_BIN, '-f', '@@CPU %U %S', ...cmd];
  if (CG_OK) cmd = ['systemd-run', '--user', '--scope', '-q', '--collect', 'sh', '-c', '"$@"; rc=$?; f=/sys/fs/cgroup$(cut -d: -f3 /proc/self/cgroup)/cpu.stat; [ -r "$f" ] && echo "@@CG $(sed -n 1p "$f" | cut -d" " -f2)" >&2; exit $rc', 'sh', ...cmd];
  return new Promise((resolve) => {
    const p = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'], detached: true }); let out = ''; RUNNING.add(p);          // detached: guruh bilan o'ldirish (Chromium bolalari ham)
    const kill = setTimeout(() => { killTree(p); out += '\n[TIMEOUT]'; }, 55 * 60 * 1000);
    p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { out += d; });
    p.on('close', (rc) => { RUNNING.delete(p); clearTimeout(kill); try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* */ } const m = CPU_RE.exec(out); if (m) out = out.replace(CPU_RE, ''); const cg = CG_RE.exec(out); if (cg) out = out.replace(CG_RE, ''); const bv = /^bo'limlar vaqti \(s\): (.*)$/m.exec(out); resolve({ job, slugs, rc: rc == null ? 1 : rc, ms: Date.now() - t0, cpu: cg ? Number(cg[1]) / 1e6 : (m ? Number(m[1]) + Number(m[2]) : null), cpuTo: !!cg, out, bolim: bv ? Object.fromEntries(bv[1].split(', ').map((x) => { const i = x.lastIndexOf(' '); return [x.slice(0, i), Number(x.slice(i + 1))]; })) : null }); });
  });
}
function killTree(p) { try { process.kill(-p.pid, 'SIGKILL'); } catch (e) { try { p.kill('SIGKILL'); } catch (e2) { /* */ } } }
function killAll() { RUNNING.forEach(killTree); }
['SIGINT', 'SIGTERM'].forEach((sg) => process.on(sg, () => { killAll(); process.exit(130); }));
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

/* ---------- bo'laklash: slug ro'yxati bor testlar N ta mustaqil jarayonga bo'linadi (interleaved — og'ir/yengil sahifalar aralash) ---------- */
function expand(items) {
  const out = [];
  for (const it of items) {
    const job = it.job, n = job.shard || 1;
    if (job.bolak > 1 && !(it.slugs && it.slugs.length)) { for (let i = 1; i <= job.bolak; i++) out.push({ job, slugs: null, bolak: i + '/' + job.bolak, part: i + '/' + job.bolak, t: Math.round(job.t / job.bolak) }); continue; }          // bo'lim bo'laklari (TEST_BOLAK)
    if (n < 2 || !(job.slugs || job.golden)) { out.push(it); continue; }
    const all = it.slugs && it.slugs.length ? it.slugs : (job.golden ? [...GOLD].sort() : V2);
    const k = Math.min(n, Math.ceil(all.length / 4));                                       // kamida 4 slug / bo'lak
    if (k < 2) { out.push({ job, slugs: it.slugs && it.slugs.length ? it.slugs : (job.golden ? null : all) }); continue; }
    for (let i = 0; i < k; i++) out.push({ job, slugs: all.filter((_, j) => j % k === i), part: (i + 1) + '/' + k, t: Math.round(job.t / k) });
  }
  return out;
}
/* ---------- yukga qarab ishga tushirish: /proc/stat dan CPU bo'shligi, /proc/meminfo dan xotira ---------- */
let cpuPrev = null, idleNow = 0; const idleHist = []; const LOAD = { n: 0, idle: 0, jobs: 0 };       // yurish davomida o'rtacha: bo'sh CPU va parallel jarayonlar
function cpuIdleSample() {
  try { const l = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0].split(/\s+/).slice(1).map(Number); const idle = l[3] + (l[4] || 0), tot = l.reduce((a, b) => a + b, 0);
    if (cpuPrev) { const dt = tot - cpuPrev.tot; if (dt > 0) { idleHist.push((idle - cpuPrev.idle) / dt); if (idleHist.length > 3) idleHist.shift(); idleNow = Math.min(...idleHist); } } cpuPrev = { idle, tot }; } catch (e) { idleNow = 1; }          // oxirgi ~6 s ning ENG kami — qisqa bo'shliqqa aldanib ortiqcha jarayon qo'shilmasin
}
function memAvailMB() { try { const m = /MemAvailable:\s+(\d+)/.exec(fs.readFileSync('/proc/meminfo', 'utf8')); return m ? Number(m[1]) / 1024 : 9999; } catch (e) { return 9999; } }
const MEM_MIN = Number(process.env.TEST_MEM_MIN) || 1500, IDLE_MIN = Number(process.env.TEST_IDLE_MIN) || 0.2;
async function schedule(items) {                     // items: [{job, slugs, part?, t?}]
  const queue = items.slice().sort((a, b) => (b.t || b.job.t) - (a.t || a.job.t)); const running = new Set(); const results = []; let lastStart = 0;
  cpuIdleSample(); const tick = setInterval(() => { cpuIdleSample(); LOAD.n++; LOAD.idle += idleNow; LOAD.jobs += running.size; pump(); }, 2000);
  const label = (it) => it.job.id + (it.part ? '#' + it.part : '');
  let pump; await new Promise((resolveAll) => {
    pump = () => {
      for (let i = 0; i < queue.length; ) {
        const n = running.size, now = Date.now();
        const allow = n < JOBS_N || (n < JOBS_MAX && idleNow >= IDLE_MIN && memAvailMB() >= MEM_MIN && now - lastStart > 4000);       // yangi jarayon CPU'ni to'ldirguncha 4 s kutiladi
        if (!allow) break;
        const it = queue[i]; const mx = it.job.mutex;
        const conflict = mx && [...running].some((r) => r.job.mutex === mx);
        if (conflict) { i++; continue; }
        queue.splice(i, 1); running.add(it); lastStart = now;
        console.log('▶ ' + label(it) + (it.slugs && it.slugs.length ? ' (' + it.slugs.length + ' sahifa)' : ''));
        runJob(it.job, it.slugs, it.bolak).then((r) => { const v = verdict(r); r.v = v; r.part = it.part; r.it = it; results.push(r); running.delete(it);
          console.log((v.ok ? '✔ ' : '✘ ') + label(it) + '  ' + (r.ms / 1000).toFixed(1) + 's' + (r.cpu != null ? ' (cpu ' + r.cpu.toFixed(0) + 's)' : '') + (v.note ? '  — ' + v.note : ''));
          if (!v.ok) (v.tail || []).forEach((l) => console.log('     ' + l));
          pump(); });
      }
      if (!queue.length && !running.size) resolveAll();
    };
    pump();
  });
  clearInterval(tick);
  return results;
}
/* bo'laklarni bitta testga birlashtirish (jadval/yiqilgan ro'yxati test id'si bo'yicha) */
function merge(results) {
  const by = new Map();
  for (const r of results) { const g = by.get(r.job.id) || { id: r.job.id, ms: 0, cpu: 0, hasCpu: false, ok: true, parts: 0, wall: 0, v: { ok: true }, retried: false }; g.ms += r.ms; g.parts++; if (r.retried) g.retried = true; g.wall = Math.max(g.wall, r.ms); if (r.cpu != null) { g.cpu += r.cpu; g.hasCpu = true; } if (!r.v.ok) { g.ok = false; g.v = r.v; } by.set(r.job.id, g); }
  return [...by.values()];
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
  console.log('Tanlangan testlar (' + items.length + '): ' + items.map((it) => it.job.id + (it.slugs && it.slugs.length ? '[' + it.slugs.length + ']' : '')).join(', ') + '  | ishchilar: ' + JOBS_N + ' (yuk ruxsat bersa ' + JOBS_MAX + ' gacha)');
  if (LIST) return;
  const watch = require('./kod-kuzat.cjs').kuzat({ onChange: (f) => { console.log('\n! Kod o\'zgardi (' + f + ') — yurish to\'xtatildi: eski kod natijasi kerak emas. Yangi o\'zgarishlar bilan qayta boshlang.'); killAll(); cleanup(); if (TMP_ROOT) try { fs.rmSync(TMP_ROOT, { recursive: true, force: true }); } catch (e) { /* */ } process.exit(3); } });
  let results = await schedule(expand(items));
  /* yiqilganlar — bir marta qayta (yuk ostidagi beqarorlik); o'tsa «qayta urinib o'tdi» deb belgilanadi, ikkinchi marta ham yiqilsa — haqiqiy xato */
  const again = RETRY ? results.filter((r) => !r.v.ok && !r.job.noRetry) : [];
  if (again.length) {
    console.log('\n↻ Qayta urinish (1 marta): ' + again.map((r) => r.job.id + (r.part ? '#' + r.part : '')).join(', '));
    const re = await schedule(again.map((r) => r.it));
    results = results.filter((r) => !again.includes(r)).concat(re.map((r) => { r.retried = true; r.first = again.find((a) => a.it === r.it); return r; }));
  }
  watch.stop(); cleanup(); if (TMP_ROOT) try { fs.rmSync(TMP_ROOT, { recursive: true, force: true }); } catch (e) { /* */ }
  const wall = (Date.now() - t0) / 1000;
  const G = merge(results);
  console.log('\n=== NATIJA (' + MODE + ') ===  (soniya: yig\'indi vaqt | cpu = CPU-soniya | bo\'laklar)');
  G.sort((a, b) => b.ms - a.ms).forEach((g) => console.log((g.ok ? (g.retried ? 'OK*   ' : 'OK    ') : 'YIQILDI') + '  ' + String((g.ms / 1000).toFixed(1)).padStart(7) + 's  ' + (g.hasCpu ? 'cpu ' + String(g.cpu.toFixed(0)).padStart(5) + 's  ' : '') + g.id + (g.parts > 1 ? '  [' + g.parts + ' bo\'lak, eng uzuni ' + (g.wall / 1000).toFixed(0) + 's]' : '')));
  if (LOAD.n) console.log('Yuk: o\'rtacha parallel jarayon ' + (LOAD.jobs / LOAD.n).toFixed(1) + ', o\'rtacha bo\'sh CPU ' + (LOAD.idle / LOAD.n * 100).toFixed(0) + '% (boshqa servislar ham CPU ishlatadi: ps -eo pcpu,args --sort=-pcpu | head)');
  const sum = results.reduce((s, r) => s + r.ms, 0) / 1000, cpuSum = results.reduce((s, r) => s + (r.cpu || 0), 0); const failed = G.filter((g) => !g.ok);
  console.log('Jami devor vaqti: ' + (wall / 60).toFixed(1) + ' daqiqa (testlar yig\'indisi ' + (sum / 60).toFixed(1) + ' daqiqa, CPU ' + (cpuSum / 60).toFixed(1) + ' daqiqa)');
  const flaky = G.filter((g) => g.ok && g.retried); if (flaky.length) console.log('OK* — qayta urinib o\'tdi (birinchi urinishda yiqilgan, beqaror): ' + flaky.map((g) => g.id).join(', ') + '  — sababini tekshiring: ' + results.filter((r) => r.retried && r.first && r.v.ok).map((r) => r.job.id + ': ' + ((r.first.v.tail || []).find((l) => /Error|assert|Timeout|expected/i.test(l)) || (r.first.v.tail || [])[0] || '').trim().slice(0, 140)).join(' | '));
  if (failed.length) console.log('Yiqilgan: ' + failed.map((g) => g.id).join(', ') + '\nQayta yurgizish: node tools/testlar.js ' + MODE + ' --only ' + failed.map((g) => g.id).join(','));
  else console.log('Hammasi o\'tdi.');
  const bolimV = {}; results.forEach((r) => { if (r.bolim) bolimV[r.job.id] = Object.assign(bolimV[r.job.id] || {}, Object.fromEntries(Object.entries(r.bolim).map(([k, v]) => [k, Math.round(v)]))); });
  if (flag('yangila-vaqt') && !failed.length) {          // to'liq yurish: test vaqtlari; har yurish: bo'lim vaqtlari (bolak) — bo'laklar tenglashadi
    const old = readJson('tools/testlar-vaqt.json'), o = Object.assign({}, old.vaqt); if (MODE === 'toliq' && !ONLY) G.forEach((g) => { o[g.id] = Math.round(g.ms / 1000 / g.parts); });
    fs.writeFileSync(path.join(ROOT, 'tools/testlar-vaqt.json'), JSON.stringify({ izoh: old.izoh, vaqt: o, bolim: Object.assign({}, old.bolim, bolimV) }, null, 1) + '\n'); console.log('tools/testlar-vaqt.json yangilandi'); }
  try { fs.writeFileSync(path.join(os.tmpdir(), 'kalki-test-vaqt.json'), JSON.stringify({ mode: MODE, wall, results: G.map((g) => ({ id: g.id, s: g.ms / 1000, wall: g.wall / 1000, cpu: g.hasCpu ? g.cpu : null, parts: g.parts, ok: g.ok, retried: g.retried })), load: LOAD.n ? { jobs: LOAD.jobs / LOAD.n, idle: LOAD.idle / LOAD.n } : null }, null, 1)); } catch (e) { /* tmp */ }
  process.exit(failed.length ? 1 : 0);
})();
