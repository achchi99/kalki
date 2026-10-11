# AI ariza yordamchisi — 1-bosqich: tekshiruv va model sinovi (2026-10)

Bu hujjat faqat o'qish/sinov natijasi. Saytga hech narsa qo'shilmagan (endpoint, tugma, nginx o'zgarishi yo'q).

## 1. Deploy xulosasi

### 1.1 kalki.uz qayerdan beriladi

**Xulosa: Cloudflare'dan (taxminan Cloudflare Pages). Hetzner serverdagi nginx'dan EMAS.**

Dalillar:
- `curl -sI https://kalki.uz` → `server: cloudflare`, `cf-ray: ...-CDG`, `cf-cache-status: DYNAMIC`, `cache-control: public, max-age=0, must-revalidate` (Pages'ga xos).
- `dig +short kalki.uz` → `104.21.46.97`, `172.67.137.88` (Cloudflare diapazoni); `dig NS kalki.uz` → `margaret.ns.cloudflare.com`, `ram.ns.cloudflare.com`.
- `curl -sI https://kalki.pages.dev` → 200 va xuddi shu sarlavhalar (`access-control-allow-origin: *`, `cache-control: public, max-age=0, must-revalidate`). Demak sayt Cloudflare Pages loyihasida turibdi. (Aniq "Pages" yoki "Workers static assets" ekanini serverdan ajratib bo'lmaydi — taxmin: Pages.)
- Shu server (`ubuntu-4gb-nbg1-1`, Hetzner, Nürnberg) nginx'ida: `/etc/nginx/sites-enabled/` = `default`, `kpgen.conf`, `zehnlab.uz.conf`. `grep -rl kalki /etc/nginx` — hech narsa topilmadi. `/var/www/` ichida faqat `html` va `zehnlab`. Ya'ni kalki bloki ham, root papkasi ham yo'q.

### 1.2 `git push` dan keyin sayt qanday yangilanadi

**Taxmin: Cloudflare Pages'ning GitHub integratsiyasi** (push → Cloudflare o'zi oladi va chiqaradi). Serverdan tasdiqlab bo'lmaydi — Cloudflare dashboard'da tekshirish kerak.

Dalillar (nima YO'Q):
- `git remote -v` → `git@github.com:achchi99/kalki` (origin).
- `.git/hooks/` ichida faqat `*.sample` fayllar; `core.hooksPath` o'rnatilmagan.
- `.github/workflows/` yo'q; repoda `wrangler.*`, `functions/` yo'q.
- `crontab -l` da kalki bilan bog'liq vazifa yo'q (faqat `~/.claude.json` zaxirasi).
- `package.json`da deploy skripti yo'q; `npm run ship` faqat lokal build (prerender, OG, sw-versiya) — natija commit qilinadi, ya'ni Cloudflare tayyor statik fayllarni oladi.
- `dist`/build papkasi yo'q: root'ning o'zi chiqariladi (taxmin).

### 1.3 Shu serverda kelajakda `/api/...` ochish mumkinmi (faqat imkoniyat)

- nginx 1.28.3 o'rnatilgan, ishlayapti (80/443). Boshqa loyihalar (kpgen.uz → `proxy_pass http://127.0.0.1:8010`) shu usulda ishlaydi, ya'ni yangi `server`/`location` + `proxy_pass` qo'shish texnik jihatdan oddiy. Konfiguratsiyani o'zgartirish `sudo` talab qiladi; hozirgi sessiyada parolsiz sudo yo'q (`sudo -n` rad etdi) — tekshirilmagan, o'zgartirilmagan.
- Band portlar (`ss -ltn`): 22, 80, 443, 8000, 8010, 8120 (uvicorn), 8443 (ssh), 8778 (python), shuningdek tasodifiy yuqori portlar. Masalan 8130 bo'sh (tekshirildi).
- Node: serverda `v22.23.2` (`.nvmrc` ham `22.23.2`). Global `fetch` bor, qo'shimcha kutubxonasiz ishlaydi.
- **Muhim cheklov:** kalki.uz trafigi Cloudflare'ga boradi, bu serverga emas. Shu serverdagi nginx'ga `location /api` qo'shish o'z-o'zidan kalki.uz/api ni ishlatmaydi. Variantlar (faqat imkoniyat, tavsiya emas): (a) alohida subdomen (masalan `api.kalki.uz` → DNS'da shu serverning IP'si, CORS sozlab); (b) Cloudflare Pages Functions (`functions/` papkasi shu repoda) yoki Cloudflare Worker — server kerak emas; (c) kalki.uz ustida Cloudflare Worker route'i orqali `/api/*` ni shu serverga yo'naltirish.
- Serverda ham IPv4 `178.104.154.105` (kpgen.conf dan), ham IPv6 bor.
