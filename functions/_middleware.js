/* kalki.uz — ichki (sayt bo'lmagan) fayllarni tarqatmaslik.
 *
 * Cloudflare Pages repo ildizini to'liq tarqatadi (build papkasi yo'q), shuning uchun tools/, docs/,
 * CLAUDE.md, package*.json, fix.py ochiq turgan edi. Bu middleware ularga 404 qaytaradi.
 *
 * MUHIM: yangi ichki fayl/papka qo'shilsa, ikkala joyga: GIZLI (shu fayl) va _routes.json "include".
 * _routes.json middleware'ni FAQAT shu yo'llar va /api/* uchun ishga tushiradi — oddiy sahifalar
 * Functions kvotasiga tushmaydi. tools/verify-all.js (band 36) ikkalasi mosligini tekshiradi. */
const GIZLI = /^\/(tools|docs|functions)(\/|$)|^\/(CLAUDE\.md|package(-lock)?\.json|fix\.py|_routes\.json)$|^\/404(\.html)?$|^\/\.(?!well-known(\/|$))/i;   // nuqtali fayllar (.nvmrc, .gitignore...) ham yopiq; .well-known ochiq

/* Yopiq yo'llarga ham saytning o'z 404 sahifasi beriladi (ASSETS dan). /404.html Pages'da /404 ga
   yo'naltiriladi, shuning uchun 2 martagacha qo'lda kuzatamiz. Topilmasa oddiy matn. */
async function sahifa404(ctx, url) {
  try {
    let res = await ctx.env.ASSETS.fetch(new URL('/404.html', url));
    for (let i = 0; i < 2 && res.status >= 300 && res.status < 400; i++) {
      const loc = res.headers.get('Location');
      if (!loc) break;
      res = await ctx.env.ASSETS.fetch(new URL(loc, url));
    }
    const html = await res.text();
    if (html.indexOf('<title>Sahifa topilmadi') > -1) {
      return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } });
    }
  } catch (e) { /* oddiy matnga tushamiz */ }
  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' }
  });
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (GIZLI.test(url.pathname)) return sahifa404(ctx, url);
  return ctx.next();
}
