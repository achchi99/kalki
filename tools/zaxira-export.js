#!/usr/bin/env node
/* kalki.uz — Zaxira (bulutga saqlash) yozuvlarini BARCHASINI bitta JSON va/yoki SQL faylga eksport qiladi (boshqa serverga ko'chirish uchun).
 *   node tools/zaxira-export.js [--db kalkifit] [--out zaxira-export] [--format json|sql|both] [--dialect postgres|sqlite]
 *   node tools/zaxira-export.js --sqlite path/to/local.sqlite        (lokal D1 nusxasidan; wrangler kerak emas)
 * D1 (remote) uchun `npx wrangler login` bo'lishi kerak. Yozuvlar SHIFRLANGAN holda ko'chadi — qayta shifrlash shart emas (id va kalit koddan olinadi).
 * Chiqish: <out>.json ({ v, jadval, yozuvlar:[{id, ilova, blob, versiya, yangilangan}] }) va <out>.sql (CREATE TABLE + INSERT ... ON CONFLICT). Fayllar kod/ochiq ma'lumot saqlamaydi, lekin
 * baribir maxfiy deb hisoblang (kimdir shifrlangan blob'larni ko'chirib olishi mumkin). */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const COLS = ['id', 'ilova', 'blob', 'versiya', 'yangilangan'];
const DDL = {
  sqlite: 'CREATE TABLE IF NOT EXISTS zaxira (id TEXT PRIMARY KEY, ilova TEXT NOT NULL, blob TEXT NOT NULL, versiya INTEGER NOT NULL DEFAULT 1, yangilangan INTEGER NOT NULL);\nCREATE INDEX IF NOT EXISTS zaxira_yangilangan ON zaxira (yangilangan);',
  postgres: 'CREATE TABLE IF NOT EXISTS zaxira (id TEXT PRIMARY KEY, ilova TEXT NOT NULL, blob TEXT NOT NULL, versiya INTEGER NOT NULL DEFAULT 1, yangilangan BIGINT NOT NULL);\nCREATE INDEX IF NOT EXISTS zaxira_yangilangan ON zaxira (yangilangan);'
};
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
function clean(r) { const o = {}; for (const c of COLS) o[c] = r[c]; o.versiya = Number(o.versiya); o.yangilangan = Number(o.yangilangan); return o; }
function toJson(rows) { return JSON.stringify({ v: 1, jadval: 'zaxira', eksport: new Date().toISOString(), soni: rows.length, yozuvlar: rows.map(clean) }); }
function toSql(rows, dialect) {
  const out = ['-- kalki.uz zaxira eksporti (' + rows.length + ' yozuv), dialekt: ' + (dialect || 'postgres'), 'BEGIN;', DDL[dialect || 'postgres']];
  for (const r0 of rows) { const r = clean(r0); out.push('INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (' + [q(r.id), q(r.ilova), q(r.blob), r.versiya, r.yangilangan].join(', ') + ') ON CONFLICT (id) DO UPDATE SET ilova = EXCLUDED.ilova, blob = EXCLUDED.blob, versiya = EXCLUDED.versiya, yangilangan = EXCLUDED.yangilangan;'); }
  out.push('COMMIT;'); return out.join('\n') + '\n';
}
function readSqlite(file) { const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(file, { readOnly: true }); try { return db.prepare('SELECT id, ilova, blob, versiya, yangilangan FROM zaxira ORDER BY id').all(); } finally { db.close(); } }
function readD1(dbName) {                                       // sahifalab (blob'lar katta bo'lishi mumkin): 20 tadan
  const all = []; let last = '';
  for (;;) {
    const sql = "SELECT id, ilova, blob, versiya, yangilangan FROM zaxira WHERE id > '" + last + "' ORDER BY id LIMIT 20";
    const raw = execFileSync('npx', ['wrangler', 'd1', 'execute', dbName, '--remote', '--json', '--command', sql], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const j = JSON.parse(raw.slice(raw.indexOf('['))); const rows = (j[0] && j[0].results) || []; all.push(...rows); if (rows.length < 20) break; last = rows[rows.length - 1].id;
  }
  return all;
}
function main(argv) {
  const a = {}; for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; }
  const out = a.out || 'zaxira-export', fmt = a.format || 'both', dialect = a.dialect || 'postgres';
  const rows = a.sqlite ? readSqlite(a.sqlite) : readD1(a.db || 'kalkifit');
  if (fmt === 'json' || fmt === 'both') fs.writeFileSync(out + '.json', toJson(rows));
  if (fmt === 'sql' || fmt === 'both') fs.writeFileSync(out + '.sql', toSql(rows, dialect));
  console.log('Eksport: ' + rows.length + ' yozuv → ' + out + (fmt === 'both' ? '.json, .sql' : '.' + fmt) + ' (' + dialect + ')');
}
module.exports = { toJson, toSql, readSqlite, DDL, COLS };
if (require.main === module) try { main(process.argv.slice(2)); } catch (e) { console.error('Xato: ' + (e && e.message || e)); process.exit(1); }
