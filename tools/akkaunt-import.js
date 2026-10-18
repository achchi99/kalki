#!/usr/bin/env node
/* kalki.uz — AKKAUNT eksportini (tools/akkaunt-export.js .json fayli) yangi bazaga YUKLASH. Qo'llanma: docs/akkaunt-kochirish.md
 *   node tools/akkaunt-import.js <eksport.json> --to sqlite --db yangi.sqlite     SQLite fayliga to'g'ridan-to'g'ri (jadvallar migrations/akkaunt.sql dan yaratiladi)
 *   node tools/akkaunt-import.js <eksport.json> --to sql --dialect postgres --out yuklash.sql     SQL fayl (psql -f yuklash.sql; yoki sqlite3 / wrangler d1 execute --file)
 *   node tools/akkaunt-import.js <eksport.json> --to sqlite --db yangi.sqlite --tekshir      yuklagach qatorlar sonini va tarkibini eksport bilan solishtiradi
 * Qayta yurgizish xavfsiz (ON CONFLICT → yangilanadi, ikkilanmaydi). Mavjud boshqa jadvallarga tegmaydi. */
'use strict';
const fs = require('fs'), E = require('./akkaunt-export.js');
function load(file) { const j = JSON.parse(fs.readFileSync(file, 'utf8')); if (!j || j.v !== 1 || !j.jadvallar || !Array.isArray(j.jadvallar.akkaunt)) throw new Error('Eksport fayli noto\'g\'ri (v:1 va jadvallar.akkaunt kerak)'); for (const t of Object.keys(j.jadvallar)) if (!E.COLS[t]) throw new Error('Noma\'lum jadval: ' + t); return j.jadvallar; }
function toSqlite(data, dbFile) {
  const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(dbFile); let n = 0;
  try {
    db.exec(E.DDL.sqlite()); db.exec('BEGIN');
    for (const t of Object.keys(data)) {
      const cs = E.COLS[t], upd = cs.filter((c) => E.keyCols(t).indexOf(c) < 0).map((c) => c + ' = excluded.' + c).join(', ');
      const st = db.prepare('INSERT INTO ' + t + ' (' + cs.join(', ') + ') VALUES (' + cs.map(() => '?').join(', ') + ') ON CONFLICT(' + E.KEY[t] + ') DO UPDATE SET ' + upd);
      for (const r of data[t]) { st.run(...cs.map((c) => E.clean(t, r)[c])); n++; }
    }
    db.exec('COMMIT');
  } catch (e) { try { db.exec('ROLLBACK'); } catch (x) {} throw e; } finally { db.close(); }
  return n;
}
const cmp = (t, x, y) => { for (const c of E.keyCols(t)) { if (x[c] < y[c]) return -1; if (x[c] > y[c]) return 1; } return 0; };
function verify(data, dbFile) { const got = E.readSqlite(dbFile, Object.keys(data)); for (const t of Object.keys(data)) { const a = JSON.stringify(data[t].map((r) => E.clean(t, r)).sort((x, y) => cmp(t, x, y) < 0 ? -1 : 1)), b = JSON.stringify(got[t].map((r) => E.clean(t, r))); if (a !== b) throw new Error('Tekshiruv: "' + t + '" jadvali eksportga mos emas'); } return true; }
function main(argv) {
  const a = {}, pos = []; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; else pos.push(argv[i]); }
  if (!pos[0]) throw new Error('Foydalanish: node tools/akkaunt-import.js <eksport.json> --to sqlite --db fayl.sqlite | --to sql --out fayl.sql [--dialect postgres|sqlite] [--tekshir]');
  const data = load(pos[0]);
  if (a.to === 'sqlite') { if (!a.db || a.db === true) throw new Error('--db <fayl.sqlite> kerak'); const n = toSqlite(data, a.db); if (a.tekshir) verify(data, a.db); console.log('Yuklandi: ' + n + ' qator → ' + a.db + (a.tekshir ? ' (tekshiruv: mos ✓)' : '')); }
  else if (a.to === 'sql') { const out = a.out && a.out !== true ? a.out : 'akkaunt-yuklash.sql'; fs.writeFileSync(out, E.toSql(data, a.dialect || 'postgres'), { mode: 0o600 }); console.log('SQL yozildi: ' + out + ' (' + (a.dialect || 'postgres') + ')'); }
  else throw new Error('--to sqlite yoki --to sql kerak');
}
module.exports = { load, toSqlite, verify };
if (require.main === module) try { main(process.argv.slice(2)); } catch (e) { console.error('Xato: ' + (e && e.message || e)); process.exit(1); }
