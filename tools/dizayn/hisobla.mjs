// Umumiy yordamchi: sahifada "birinchi oltin kirish" bilan natijani chiqaradi (kontrast va sticky testlari uchun).
// Qaytaradi: true — natija kartasi ko'rindi.
export async function natijaKo(p) { return p.evaluate(() => { const r = document.querySelector('.res-col .receipt, .res-col .norm-banner, #receipt'); if (!r && !document.querySelector('.res-col')) return true;   // natija kartasi yo'q sahifa (grant, yer-konvertor): natija jonli
  return !!r && r.offsetHeight > 0; }); }
export async function hisobla(p) {
  await p.evaluate(() => document.querySelectorAll('main details').forEach((d) => { d.open = true; }));
  const click = async () => { const b = p.locator('main #calcBtn:visible, main .calc-btn:visible, main button:visible:text-matches("Hisobla|Рассчита|Hisob-kitob", "i")').first(); if (await b.count()) await b.click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(450); };
  await click(); if (await natijaKo(p)) return true;
  // tanlovlar: seg/mat-item/chips/select (ikkinchi variant), keyin maydonlar
  for (const sel of ['main .scen-card:visible', 'main .mat-item:visible', 'main .chip:visible', 'main .seg:visible button:not(.on)', 'main .seg:visible button']) { const l = p.locator(sel); if (await l.count()) await l.first().click({ timeout: 1000 }).catch(() => {}); }
  const sels = p.locator('main select:visible'); const sn = await sels.count(); for (let i = 0; i < sn; i++) { const o = await sels.nth(i).locator('option').count(); if (o > 1) await sels.nth(i).selectOption({ index: 1 }).catch(() => {}); }
  const ins = p.locator('main input:visible'); const n = await ins.count(); let di = 0, ni = 0;
  for (let i = 0; i < n; i++) { const e = ins.nth(i); const t = ((await e.getAttribute('type')) || 'text').toLowerCase(); if (await e.getAttribute('readonly') !== null) continue;
    if (t === 'date') await e.fill(di++ % 2 === 0 ? '2018-01-10' : '2024-03-15').catch(() => {});
    else if (t === 'number') await e.fill(ni++ === 0 ? '5000000' : '10').catch(() => {});
    else if (t === 'text') { if (/search|qidir/i.test((await e.getAttribute('id')) || '')) continue; await e.fill(ni++ === 0 ? '5000000' : '5').catch(() => {}); } }
  await click(); if (await natijaKo(p)) return true;
  // oxirgi urinish: kichikroq qiymatlar
  for (let i = 0; i < n; i++) { const e = ins.nth(i); const t = ((await e.getAttribute('type')) || 'text').toLowerCase(); if (t === 'number' || t === 'text') await e.fill(i === 0 ? '3000000' : '3').catch(() => {}); }
  await click(); return natijaKo(p);
}
