// KalkiFit onboarding testlari uchun umumiy yordamchilar (slayder: assets/num-slider.js). Aniq qiymat — qiymatni bosib, kichik maydonga yozish orqali.
export async function sld(p, id, v) { const s = `[data-sld=${id}]`; await p.click(`${s} [data-sld-act=edit]`); await p.fill(`${s} .sld-in`, String(v).replace('.', ',')); await p.press(`${s} .sld-in`, 'Enter'); await p.waitForTimeout(90); }
export const sldVal = (p, id) => p.locator(`[data-sld=${id}] input[type=hidden]`).inputValue();
/* onboarding'ni natija ekraniga qadar yuritadi: o = { sex, preg, age, h, w, act, goal, yemay: ['baliq', ...] | null } */
export async function onb(p, o) {
  await p.click(`[data-act=obsex][data-v=${o.sex}]`); if (o.preg) await p.check('#obPreg'); await p.click('[data-act=obnext]');
  await sld(p, 'obAge', o.age); await p.click('[data-act=obnext]'); await sld(p, 'obHeight', o.h); await p.click('[data-act=obnext]'); await sld(p, 'obWeight', o.w); await p.click('[data-act=obnext]');
  await p.click(`[data-act=obact][data-v="${o.act}"]`); await p.click('[data-act=obnext]');
  if (o.goal) await p.click(`[data-act=obgoal][data-v=${o.goal}]`); await p.click('[data-act=obnext]');
  for (const t of o.yemay || []) await p.click(`[data-act=obyntog][data-t=${t}]`); await p.click('[data-act=obnext]'); await p.waitForTimeout(900);
}
