// Doimiy qoida: ilova kodi o'zgarsa — yangiliklar JSON'iga yozuv qo'shilishi shart (CLAUDE.md «Ilovalarga yangi funksiya qoidasi»). Aks holda test yiqiladi.
// Taqqoslash: main'dan ajralgan joydan (merge-base) hozirgi holatgacha (commitlar + saqlanmagan o'zgarishlar). Faqat `design:` / `matn:` bilan boshlanuvchi commitlar (ko'rinish/imlo) istisno.
// Qo'shimcha: yangi yozuv versiyasi oldingisidan katta bo'lsin.   node tools/dizayn/test-yangilik-qoida.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const git = (...a) => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return null; } };
const RULES = {
  kalkifit: { json: 'data/yangiliklar-kalkifit.json', code: [/^assets\/kalkifit-[a-z]+\.js$/, /^assets\/css\/kalkifit\.css$/] },
  rozgor: { json: 'data/yangiliklar-rozgor.json', code: [/^assets\/rozgor-[a-z]+\.js$/, /^assets\/css\/rozgor\.css$/] }
};
const SHARED = [/^assets\/app-(kit|install|backup|yangilik)\.js$/, /^assets\/css\/appkit\.css$/];       // ikkala ilovaga ta'sir: kamida bitta JSON o'zgarishi kerak
export function check(opts) {
  const { files, commits, jsonChanged, latestBase, latestNow } = opts; const errs = [];
  const exempt = (c) => /^(design|matn):/i.test(c.subject);
  const touching = (re) => files.filter((f) => re.some((r) => r.test(f)));
  const realCommits = (re) => commits.filter((c) => !exempt(c) && c.files.some((f) => re.some((r) => r.test(f))));
  const dirty = (re) => opts.dirty.filter((f) => re.some((r) => r.test(f)));
  for (const [app, r] of Object.entries(RULES)) {
    const need = realCommits(r.code).length > 0 || dirty(r.code).length > 0;
    if (need && !jsonChanged[app]) errs.push(app + ': ilova kodi o\'zgargan (' + (touching(r.code).join(', ') || '—') + '), lekin ' + r.json + ' ga yozuv qo\'shilmagan');
    if (jsonChanged[app] && !(latestNow[app] > latestBase[app])) errs.push(app + ': ' + r.json + ' o\'zgargan, lekin yangi versiya (v) oldingisidan katta emas');
  }
  const sharedNeed = realCommits(SHARED).length > 0 || dirty(SHARED).length > 0;
  if (sharedNeed && !jsonChanged.kalkifit && !jsonChanged.rozgor) errs.push('umumiy kit o\'zgargan, lekin hech bir yangiliklar JSON\'iga yozuv qo\'shilmagan');
  return errs;
}
const readLatest = (txt) => { try { return Math.max(0, ...JSON.parse(txt).items.map((e) => e.v)); } catch (e) { return 0; } };
/* ---- qoidaning o'zini tekshirish (sintetik holatlar) ---- */
{ const base = { files: [], commits: [], dirty: [], jsonChanged: { kalkifit: false, rozgor: false }, latestBase: { kalkifit: 1, rozgor: 1 }, latestNow: { kalkifit: 1, rozgor: 1 } };
  assert.deepEqual(check(base), [], 'o\'zgarish yo\'q — yiqilmaydi');
  const c = (subject, ...files) => ({ subject, files });
  assert.equal(check({ ...base, commits: [c('feat: x', 'assets/kalkifit-app.js')], files: ['assets/kalkifit-app.js'] }).length, 1, 'kod o\'zgardi, yozuv yo\'q → yiqiladi');
  assert.deepEqual(check({ ...base, commits: [c('feat: x', 'assets/kalkifit-app.js')], jsonChanged: { kalkifit: true, rozgor: false }, latestNow: { kalkifit: 2, rozgor: 1 }, files: ['assets/kalkifit-app.js'] }), [], 'yozuv qo\'shilgan → o\'tadi');
  assert.equal(check({ ...base, commits: [c('feat: x', 'assets/kalkifit-app.js')], jsonChanged: { kalkifit: true, rozgor: false }, latestNow: { kalkifit: 1, rozgor: 1 }, files: ['assets/kalkifit-app.js'] }).length, 1, 'versiya o\'smagan → yiqiladi');
  assert.deepEqual(check({ ...base, commits: [c('design: rang', 'assets/css/kalkifit.css')], files: ['assets/css/kalkifit.css'] }), [], 'design: istisno'); assert.deepEqual(check({ ...base, commits: [c('matn: imlo', 'assets/rozgor-app.js')], files: ['assets/rozgor-app.js'] }), [], 'matn: istisno');
  assert.equal(check({ ...base, dirty: ['assets/rozgor-core.js'], files: ['assets/rozgor-core.js'] }).length, 1, 'saqlanmagan o\'zgarish ham hisobga olinadi'); assert.equal(check({ ...base, commits: [c('fix: y', 'assets/app-kit.js')], files: ['assets/app-kit.js'] }).length, 1, 'umumiy kit → kamida bitta JSON');
  assert.deepEqual(check({ ...base, commits: [c('fix: y', 'assets/app-kit.js')], jsonChanged: { kalkifit: false, rozgor: true }, latestNow: { kalkifit: 1, rozgor: 2 }, files: ['assets/app-kit.js'] }), []); assert.deepEqual(check({ ...base, commits: [c('feat: z', 'assets/rozgor-app.js')], files: ['assets/rozgor-app.js'], jsonChanged: { kalkifit: true, rozgor: false }, latestNow: { kalkifit: 2, rozgor: 1 } }).length, 1, 'boshqa ilovaning JSON\'i hisobga olinmaydi');
  console.log('OK   qoida mantiqi (sintetik holatlar)'); }
/* ---- haqiqiy repo ---- */
const root = git('rev-parse', '--show-toplevel');
if (!root) { console.log('OK   git yo\'q — repo tekshiruvi o\'tkazib yuborildi'); process.exit(0); }
const mb = git('merge-base', 'HEAD', 'origin/main') || git('merge-base', 'HEAD', 'main');
if (!mb) { console.log('OK   asos (main) topilmadi — repo tekshiruvi o\'tkazib yuborildi'); process.exit(0); }
const files = (git('diff', '--name-only', mb) || '').split('\n').filter(Boolean).concat((git('ls-files', '--others', '--exclude-standard') || '').split('\n').filter(Boolean));
const dirty = [...(git('diff', '--name-only', 'HEAD') || '').split('\n'), ...(git('ls-files', '--others', '--exclude-standard') || '').split('\n')].filter(Boolean);
const commits = (git('log', '--format=%H%x09%s', mb + '..HEAD') || '').split('\n').filter(Boolean).map((l) => { const [h, ...s] = l.split('\t'); return { subject: s.join('\t'), files: (git('diff-tree', '--no-commit-id', '--name-only', '-r', h) || '').split('\n').filter(Boolean) }; });
const jsonChanged = {}, latestBase = {}, latestNow = {};
for (const [app, r] of Object.entries(RULES)) { const now = fs.existsSync(path.join(ROOT, r.json)) ? fs.readFileSync(path.join(ROOT, r.json), 'utf8') : ''; const old = git('show', mb + ':' + r.json); latestNow[app] = readLatest(now); latestBase[app] = old ? readLatest(old) : 0; jsonChanged[app] = (old || '').trim() !== now.trim(); }
const errs = check({ files, commits, dirty, jsonChanged, latestBase, latestNow });
if (errs.length) { console.log('XATO yangiliklar qoidasi:\n - ' + errs.join('\n - ') + '\n(CLAUDE.md «Ilovalarga yangi funksiya qoidasi»: har relizda data/yangiliklar-*.json ga yozuv qo\'shing; faqat ko\'rinish/imlo bo\'lsa commit nomi design:/matn: bilan boshlansin)'); process.exit(1); }
console.log('OK   repo: ilova kodi o\'zgarishlariga mos yangilik yozuvlari bor (asos ' + mb.slice(0, 7) + ', ' + commits.length + ' commit)');
