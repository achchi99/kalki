/* kalki.uz — ichki (sayt bo'lmagan) fayllarni tarqatmaslik.
 *
 * Cloudflare Pages repo ildizini to'liq tarqatadi (build papkasi yo'q), shuning uchun tools/, docs/,
 * CLAUDE.md, package*.json, fix.py ochiq turgan edi. Bu middleware ularga 404 qaytaradi.
 *
 * MUHIM: yangi ichki fayl/papka qo'shilsa, ikkala joyga: GIZLI (shu fayl) va _routes.json "include".
 * _routes.json middleware'ni FAQAT shu yo'llar va /api/* uchun ishga tushiradi — oddiy sahifalar
 * Functions kvotasiga tushmaydi. tools/verify-all.js (band 36) ikkalasi mosligini tekshiradi. */
const GIZLI = /^\/(tools|docs|functions)(\/|$)|^\/(CLAUDE\.md|package(-lock)?\.json|fix\.py|_routes\.json)$|^\/\.(?!well-known(\/|$))/i;   // nuqtali fayllar (.nvmrc, .gitignore...) ham yopiq; .well-known ochiq

export async function onRequest(ctx) {
  const p = new URL(ctx.request.url).pathname;
  if (GIZLI.test(p)) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' }
    });
  }
  return ctx.next();
}
