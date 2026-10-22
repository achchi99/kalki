// D1 (Cloudflare) API'sining kichik imitatsiyasi — node:sqlite ustida (testlar uchun): prepare().bind().run/all/first, batch.
import { DatabaseSync } from 'node:sqlite';
export function d1(sqlFiles = []) {
  const db = new DatabaseSync(':memory:');
  for (const s of sqlFiles) db.exec(s);
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    run: async () => { const r = db.prepare(sql).run(...args); return { success: true, meta: { changes: r.changes } }; },
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    first: async () => db.prepare(sql).get(...args) || null,
    _exec: () => db.prepare(sql).run(...args)
  });
  return { raw: db, prepare: (sql) => stmt(sql), batch: async (list) => { db.exec('BEGIN'); try { list.forEach((s) => s._exec()); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } return list.map(() => ({ success: true })); } };
}
