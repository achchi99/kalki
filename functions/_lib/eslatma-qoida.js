/* kalki.uz — v88 «Ovqat eslatmalari» (veb-push): SOF qoidalar — functions/api/push/[amal].js va tools/push-yubor.js --eslatma ikkalasi ishlatadi.
 * Server faqat shuni biladi: eslatma vaqtlari, vaqt mintaqasi (daqiqa), bugun qaysi ovqat YOZILGANI (bitmask) — ovqat tarkibi, kkal, profil YO'Q.
 * Qator (push_eslatma): { tz, jadval: '{"b":510,"l":810,"s":null,"d":1170}', siyrak, kun, yozildi, ishlangan, yuborildi, bosildi, bosilmagan }
 * Qoidalar (assets/kalkifit-core.js remDay bilan bir xil): yozilgan ovqatga eslatma yo'q; kechki eslatma o'tkazib yuborilganini eslatadi; kuniga ≤ 3;
 * 3 kun ketma-ket (eslatma bo'lgan kunlar) birorta ham bosilmasa — siyrak (faqat kechki). */
import KalkiIsm from '../../assets/kalkifit-ism.js';
export const BIT = { b: 1, l: 2, s: 4, d: 8 }, MEALS = ['b', 'l', 's', 'd'], OYNA = 45, MAX = 3, SIYRAK = 3;
const two = (n) => String(n).padStart(2, '0');
export function mahalliy(nowMs, tz) {                  // tz — UTC dan daqiqa (Toshkent +300) → { kun: 'YYYY-MM-DD', min }
  const d = new Date(nowMs + (Number.isFinite(+tz) ? +tz : 300) * 60000);
  return { kun: d.getUTCFullYear() + '-' + two(d.getUTCMonth() + 1) + '-' + two(d.getUTCDate()), min: d.getUTCHours() * 60 + d.getUTCMinutes() };
}
export function jadvalOf(row) { let j = {}; try { j = JSON.parse(row.jadval || '{}') || {}; } catch (e) { j = {}; } const o = {}; MEALS.forEach((k) => { const t = Math.round(+j[k]); o[k] = Number.isFinite(t) && j[k] !== null && t >= 0 && t < 1440 ? t : null; }); return o; }
export function jadvalTekshir(j) {                      // mijozdan: { b: daqiqa|null, … } → JSON yoki null
  if (!j || typeof j !== 'object') return null; const o = {}; let n = 0;
  for (const k of MEALS) { const v = j[k]; if (v === null || v === undefined || v === false) { o[k] = null; continue; } const t = Math.round(+v); if (!Number.isFinite(t) || t < 0 || t > 1439) return null; o[k] = t; n++; }
  if (j.u === 'hazil' || j.u === 'jiddiy') o.u = j.u;
  if (typeof j.n === 'string') { const n = j.n.replace(/\s+/g, ' ').trim(); if (n.length >= 2 && n.length <= 16 && /^[\p{L}'ʻ’ -]+$/u.test(n)) o.n = n; }          // v97: maslahatchi ismi (sarlavha)          // v95: eslatma uslubi (maslahatchi sozlamasi)
  return n ? JSON.stringify(o) : null;
}
/* kun almashdi: kechagi natija (yuborildi > 0 bo'lsa bosildimi) → bosilmagan / siyrak; hisoblagichlar nolga. → { row, ev: [[hodisa, kalit]] } */
export function yangiKun(row, kun) {
  const r = Object.assign({}, row), ev = [];
  if (r.kun === kun) return { row: r, ev };
  if (r.kun && (r.yuborildi || 0) > 0) { r.bosilmagan = r.bosildi ? 0 : (r.bosilmagan || 0) + 1; if (!r.siyrak && r.bosilmagan >= SIYRAK) { r.siyrak = 1; ev.push(['eslatma', 'siyraklashdi']); } }
  r.kun = kun; r.yozildi = 0; r.ishlangan = 0; r.yuborildi = 0; r.bosildi = 0;
  return { row: r, ev };
}
/* hozir nima qilish kerak: → [{ meal, amal: 'yubor' | 'otkaz', kind: 'm' | 'x', miss }] (bir chaqiruvda ko'pi bilan bitta yuborish) */
export function tanla(row, nowMs) {
  const L = mahalliy(nowMs, row.tz), j = jadvalOf(row), out = []; if (row.kun !== L.kun) return out;
  const on = MEALS.filter((k) => j[k] !== null), ev = row.siyrak ? (j.d !== null ? 'd' : on.slice().sort((a, b) => j[b] - j[a])[0]) : null;
  const allowed = (row.siyrak ? (ev ? [ev] : []) : ['d', 'b', 'l', 's'].filter((k) => on.includes(k)).slice(0, MAX));
  for (const k of on.slice().sort((a, b) => j[a] - j[b])) {
    if (row.ishlangan & BIT[k]) continue; if (L.min < j[k] || L.min >= j[k] + OYNA) continue;
    if (!allowed.includes(k)) { out.push({ meal: k, amal: 'jim' }); continue; }
    const logged = (row.yozildi & BIT[k]) !== 0;
    if (k === 'd' || row.siyrak) { let miss = null; ['b', 'l', 's'].forEach((m) => { if (j[m] !== null && !(row.yozildi & BIT[m])) miss = m; }); if (miss) { out.push({ meal: k, amal: 'yubor', kind: 'x', miss }); continue; } }
    if (logged) { out.push({ meal: k, amal: 'otkaz' }); continue; }
    if ((row.yuborildi || 0) >= MAX) { out.push({ meal: k, amal: 'jim' }); continue; }
    out.push({ meal: k, amal: 'yubor', kind: 'm', miss: null });
  }
  return out;
}
export function ismOf(row) { try { const j = JSON.parse(row.jadval || '{}') || {}; return typeof j.n === 'string' && j.n.length >= 2 && j.n.length <= 16 ? j.n : null; } catch (e) { return null; } }
export function uslubOf(row) { try { const j = JSON.parse(row.jadval || '{}') || {}; return j.u === 'hazil' ? 'hazil' : 'jiddiy'; } catch (e) { return 'jiddiy'; } }
export function matn(tx, til, it, n, translit, uslub, ism) {        // tx — data/eslatmalar.json; v95: uslub 'hazil' — tx.matn_hazil
  const L = til === 'ru' ? 'ru' : 'uz', M = uslub === 'hazil' && tx.matn_hazil && tx.matn_hazil[L] ? tx.matn_hazil : tx.matn, list = M[L][it.kind === 'x' ? 'x' : it.meal]; let b = list[Math.abs(n || 0) % list.length];
  if (it.kind === 'x') { const nm = tx.ovqat[L][it.miss] || ''; b = b.replace('{m}', nm).replace('{M}', nm.charAt(0).toUpperCase() + nm.slice(1)); }
  const cy = (x) => til === 'cyr' && translit ? translit(String(x).replace(/[‘’ʻ`´]/g, "'")) : x;
  const nm = ism ? KalkiIsm.yozuv(ism, til === 'ru' ? 'ru' : 'uz') : '';          // v105: ism joriy yozuvda (uz — lotin, ru — kirill, cyr — translit)
  return { t: cy(nm ? nm + ' · ' + tx.sarlavha[L] : tx.sarlavha[L]), b: cy(b) };
}
export function url(til, it, kun) { return (til === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?eslatma=' + (it.kind === 'x' ? it.miss : it.meal) + '&k=' + kun; }
