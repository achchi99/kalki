/* Server tomonidagi natija hisobi (admin: xato ulushi, oxirgi 24 soat): stat_kun 'rasm_srv', kalit '<natija>.<soat>' (Toshkent). Natija: ok | provayder | band | vaqt | hajm | format | ichki. Rasm/javob YOZILMAYDI. */
export async function rasmStat(env, natija, now) {
  try { if (!env.KALKIFIT_DB) return; const t = new Date((now || Date.now()) + 5 * 3600 * 1000).toISOString(), kun = t.slice(0, 10), soat = t.slice(11, 13);
    await env.KALKIFIT_DB.prepare("INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, 'rasm_srv', ?, 'server', 1) ON CONFLICT(kun, hodisa, kalit, platforma) DO UPDATE SET son = son + 1").bind(kun, natija + '.' + soat).run(); } catch (e) { /* statistika yozilmadi — so'rovga ta'sir qilmaydi */ }
}
