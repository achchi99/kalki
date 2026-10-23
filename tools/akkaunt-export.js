#!/usr/bin/env node
/* kalki.uz — AKKAUNT ma'lumotlarini eksport (boshqa serverga/VPS'ga ko'chirish uchun). Qo'llanma: docs/akkaunt-kochirish.md
 *   node tools/akkaunt-export.js [--db kalkifit] [--out akkaunt-export] [--format json|sql|both] [--dialect postgres|sqlite]
 *                                [--sessions] [--audit] [--ilovalar]   ← sessiyalar/audit ixtiyoriy (odatda foydalanuvchilar qaytadan kirishadi)
 *   node tools/akkaunt-export.js --sqlite path/to/local.sqlite      (lokal D1 nusxasidan; wrangler kerak emas)
 * --ilovalar: akkaunt↔zaxira ulanishlari (gibrid konvertlar bilan). ⚠ Konvertlar SERVER KALITI (AKKAUNT_MASTER_KEYS) bilan shifrlangan — kalit ham yangi serverga ko'chirilmasa ochilmaydi.
 * D1 (remote) uchun `npx wrangler login` bo'lishi kerak. Eksport QILINADI: akkaunt (+ ixtiyoriy sessiya, audit). Eksport QILINMAYDI: kirish_kodi (10 daqiqalik kodlar) va limit_hisob (vaqtinchalik).
 * ⚠ Fayl EMAIL manzillari va marketing rozilik tarixini saqlaydi — MAXFIY: shifrlangan diskda saqlang, ishlatgach o'chiring, repoga/chatga yubormang. Sessiya fayli (--sessions) token xeshlarini saqlaydi.
 * Chiqish: <out>.json ({ v, jadvallar:{ akkaunt:[...], sessiya:[...] } }) va <out>.sql (CREATE TABLE + INSERT ... ON CONFLICT). Ichkaridagi kutubxona funksiyalarini tools/akkaunt-import.js ham ishlatadi. */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const COLS = {
  akkaunt: ['id', 'email', 'usul', 'google_sub', 'ism', 'ism_qolda', 'yaratilgan', 'oxirgi_kirish', 'marketing', 'marketing_vaqt', 'marketing_matn_v'],
  sessiya: ['id', 'akkaunt_id', 'yaratilgan', 'oxirgi', 'muddat_abs', 'qurilma'],
  audit: ['id', 'vaqt', 'akkaunt_id', 'hodisa'],
  akkaunt_ilova: ['akkaunt_id', 'ilova', 'zaxira_id', 'kod_konvert', 'rejim', 'master_v', 'ulangan']
};
const KEY = { akkaunt: 'id', sessiya: 'id', audit: 'id', akkaunt_ilova: 'akkaunt_id, ilova' };
const keyCols = (t) => KEY[t].split(', ');
const keyOf = (t, r) => keyCols(t).map((c) => r[c]).join('|');
const INTS = { akkaunt: ['yaratilgan', 'oxirgi_kirish', 'marketing', 'marketing_vaqt'], sessiya: ['yaratilgan', 'oxirgi', 'muddat_abs'], audit: ['id', 'vaqt'], akkaunt_ilova: ['master_v', 'ulangan'] };
const SQLITE_DDL = () => fs.readFileSync(path.join(__dirname, '..', 'migrations', 'akkaunt.sql'), 'utf8').split('\n').filter((l) => !/^\s*--\s/.test(l) || true).join('\n');
const PG_DDL = [
  'CREATE TABLE IF NOT EXISTS akkaunt (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, usul TEXT NOT NULL DEFAULT \'email\', google_sub TEXT UNIQUE, ism TEXT, ism_qolda INTEGER NOT NULL DEFAULT 0, yaratilgan BIGINT NOT NULL, oxirgi_kirish BIGINT NOT NULL, marketing INTEGER NOT NULL DEFAULT 0, marketing_vaqt BIGINT, marketing_matn_v TEXT);',
  'CREATE TABLE IF NOT EXISTS kirish_kodi (id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL, maqsad TEXT NOT NULL, kod_hash TEXT NOT NULL, yaratilgan BIGINT NOT NULL, muddat BIGINT NOT NULL, urinish INTEGER NOT NULL DEFAULT 0, ishlatilgan INTEGER NOT NULL DEFAULT 0);',
  'CREATE INDEX IF NOT EXISTS kirish_kodi_email ON kirish_kodi (email, maqsad);', 'CREATE INDEX IF NOT EXISTS kirish_kodi_muddat ON kirish_kodi (muddat);',
  'CREATE TABLE IF NOT EXISTS sessiya (id TEXT PRIMARY KEY, akkaunt_id TEXT NOT NULL, yaratilgan BIGINT NOT NULL, oxirgi BIGINT NOT NULL, muddat_abs BIGINT NOT NULL, qurilma TEXT NOT NULL DEFAULT \'\');',
  'CREATE INDEX IF NOT EXISTS sessiya_akkaunt ON sessiya (akkaunt_id);',
  'CREATE TABLE IF NOT EXISTS limit_hisob (kalit TEXT PRIMARY KEY, soni INTEGER NOT NULL, oyna_boshi BIGINT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS audit (id BIGSERIAL PRIMARY KEY, vaqt BIGINT NOT NULL, akkaunt_id TEXT, hodisa TEXT NOT NULL);', 'CREATE INDEX IF NOT EXISTS audit_akkaunt ON audit (akkaunt_id);'
].join('\n');
const DDL = { sqlite: SQLITE_DDL, postgres: () => PG_DDL };
const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");
function clean(table, r) { const o = {}; for (const c of COLS[table]) { let v = r[c]; if (v === undefined) v = null; if (v !== null && INTS[table].indexOf(c) > -1) v = Number(v); o[c] = v; } return o; }
function toJson(data) { const jadvallar = {}, soni = {}; for (const t of Object.keys(data)) { jadvallar[t] = data[t].map((r) => clean(t, r)); soni[t] = data[t].length; } return JSON.stringify({ v: 1, eksport: new Date().toISOString(), soni, jadvallar }); }
function toSql(data, dialect) {
  dialect = dialect || 'postgres'; const out = ['-- kalki.uz akkaunt eksporti, dialekt: ' + dialect + '. MAXFIY: email manzillari bor.', 'BEGIN;', DDL[dialect]()];
  for (const t of Object.keys(data)) for (const r0 of data[t]) {
    const r = clean(t, r0), cs = COLS[t], upd = cs.filter((c) => keyCols(t).indexOf(c) < 0).map((c) => c + ' = EXCLUDED.' + c).join(', ');
    out.push('INSERT INTO ' + t + ' (' + cs.join(', ') + ') VALUES (' + cs.map((c) => q(r[c])).join(', ') + ') ON CONFLICT (' + KEY[t] + ') DO UPDATE SET ' + upd + ';');
  }
  if (dialect === 'postgres' && data.audit && data.audit.length) out.push("SELECT setval(pg_get_serial_sequence('audit','id'), (SELECT COALESCE(MAX(id),1) FROM audit));");
  out.push('COMMIT;'); return out.join('\n') + '\n';
}
function readSqlite(file, tables) { const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(file, { readOnly: true }); try { const o = {}; for (const t of tables) o[t] = db.prepare('SELECT ' + COLS[t].join(', ') + ' FROM ' + t + ' ORDER BY ' + KEY[t]).all(); return o; } finally { db.close(); } }
function readD1(dbName, tables) {                                   // sahifalab, 200 tadan
  const o = {};
  for (const t of tables) {
    const all = []; let last = t === 'audit' ? 0 : '';
    for (;;) {
      const kx = keyCols(t).join(" || '|' || "); const sql = 'SELECT ' + COLS[t].join(', ') + ' FROM ' + t + ' WHERE ' + kx + ' > ' + (typeof last === 'number' ? last : "'" + String(last).replace(/'/g, "''") + "'") + ' ORDER BY ' + kx + ' LIMIT 200';
      const raw = execFileSync('npx', ['wrangler', 'd1', 'execute', dbName, '--remote', '--json', '--command', sql], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
      const j = JSON.parse(raw.slice(raw.indexOf('['))); const rows = (j[0] && j[0].results) || []; all.push(...rows); if (rows.length < 200) break; last = keyOf(t, rows[rows.length - 1]);
    }
    o[t] = all;
  }
  return o;
}
function main(argv) {
  const a = {}; for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; }
  const out = a.out || 'akkaunt-export', fmt = a.format || 'both', dialect = a.dialect || 'postgres', tables = ['akkaunt'].concat(a.sessions ? ['sessiya'] : [], a.audit ? ['audit'] : [], a.ilovalar ? ['akkaunt_ilova'] : []);
  const data = a.sqlite ? readSqlite(a.sqlite, tables) : readD1(a.db || 'kalkifit', tables);
  if (fmt === 'json' || fmt === 'both') fs.writeFileSync(out + '.json', toJson(data), { mode: 0o600 });
  if (fmt === 'sql' || fmt === 'both') fs.writeFileSync(out + '.sql', toSql(data, dialect), { mode: 0o600 });
  console.log('Eksport: ' + tables.map((t) => t + ' ' + data[t].length).join(', ') + ' → ' + out + (fmt === 'both' ? '.json, .sql' : '.' + fmt) + ' (' + dialect + ')\nDiqqat: fayl email manzillarini saqlaydi — maxfiy; ishlatgach o\'chiring.');
}
module.exports = { COLS, KEY, keyOf, keyCols, DDL, toJson, toSql, readSqlite, readD1, clean };
if (require.main === module) try { main(process.argv.slice(2)); } catch (e) { console.error('Xato: ' + (e && e.message || e)); process.exit(1); }
