// Cloudflare D1 o'rniga testlarda: node:sqlite (xotirada) ustiga D1 API (prepare/bind/run/first/all). Faqat testlar uchun.
import { DatabaseSync } from 'node:sqlite';
export function makeD1(schemaSql) {
  const db = new DatabaseSync(':memory:'); db.exec(schemaSql);
  const stmt = (q, args) => ({
    run: async () => { const r = db.prepare(q).run(...args); return { meta: { changes: Number(r.changes) } }; },
    first: async () => db.prepare(q).get(...args) || null,
    all: async () => ({ results: db.prepare(q).all(...args) })
  });
  return { prepare: (q) => Object.assign(stmt(q, []), { bind: (...a) => stmt(q, a) }), _raw: db };
}
