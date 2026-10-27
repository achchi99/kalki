/* Shartli kutish (qat'iy `waitForTimeout` o'rniga): yuk ostida sekin mashinada ham barqaror, tez mashinada ortiqcha kutmaydi.
 *
 *   import { kut, barqaror } from './kut.mjs';
 *   const st = await kut(() => stOf(p), (s) => s.q === 'Jinsingiz?');          // shart bajarilguncha so'raydi, oxirgi qiymatni qaytaradi
 *   await barqaror(p, '#kcalBtn');                                             // element joyi 2 kadr ketma-ket o'zgarmaguncha (animatsiya tugadi)
 *
 * Shart vaqtida bajarilmasa — oxirgi qiymat qaytadi (assert keyin aniq xabar bilan yiqiladi). */
export async function kut(get, ok, { timeout = 10000, step = 100 } = {}) {
  const t0 = Date.now(); let v;
  for (;;) { try { v = await get(); if (ok(v)) return v; } catch (e) { if (Date.now() - t0 > timeout) throw e; }
    if (Date.now() - t0 > timeout) return v; await new Promise((r) => setTimeout(r, step)); }
}
export async function barqaror(p, sel, { timeout = 10000, frames = 3 } = {}) {
  await p.waitForFunction(([s, n]) => new Promise((res) => { let last = null, same = 0; const tick = () => { const e = document.querySelector(s); if (!e) return res(false); const r = e.getBoundingClientRect(), k = [r.top, r.left, r.width, r.height].map(Math.round).join(); same = k === last ? same + 1 : 0; last = k; if (same >= n) return res(true); requestAnimationFrame(tick); }; tick(); }), [sel, frames], { timeout });
}
