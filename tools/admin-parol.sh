#!/usr/bin/env bash
# kalki.uz — KalkiFit admin parolini O'ZINGIZ o'rnatish. Parol ekranga, logga va repoga chiqmaydi.
#   bash tools/admin-parol.sh
# Nima qiladi: parolni 2 marta so'raydi (ko'rinmaydi) → ~/.kalkifit-admin-pass (chmod 600) → Cloudflare secret KALKIFIT_ADMIN_PASSWORD (production + preview).
# Kuchga kirishi uchun keyin yangi deploy kerak (bo'sh commit + push) — eski sessiyalar ham bekor bo'ladi.
set -euo pipefail
F="$HOME/.kalkifit-admin-pass"; T="$HOME/.cf-token"
[ -r "$T" ] || { echo "~/.cf-token topilmadi"; exit 1; }
read -rsp "Yangi admin parol (kamida 16 belgi): " P1; echo
read -rsp "Yana bir marta: " P2; echo
[ "$P1" = "$P2" ] || { echo "Parollar mos emas — hech narsa o'zgarmadi."; exit 1; }
[ ${#P1} -ge 16 ] || { echo "Juda qisqa (${#P1} belgi). Kamida 16 belgi — hech narsa o'zgarmadi."; exit 1; }
umask 077; printf '%s' "$P1" > "$F.new" && chmod 600 "$F.new" && mv "$F.new" "$F"; unset P1 P2
export CLOUDFLARE_API_TOKEN="$(cat "$T")"
cd "$(dirname "$0")/.."
for E in production preview; do
  if [ "$E" = preview ]; then npx wrangler pages secret put KALKIFIT_ADMIN_PASSWORD --project-name kalki --env preview < "$F" >/dev/null 2>&1 && echo "✓ Cloudflare ($E)" || { echo "✗ Cloudflare ($E) — xato"; exit 1; }
  else npx wrangler pages secret put KALKIFIT_ADMIN_PASSWORD --project-name kalki < "$F" >/dev/null 2>&1 && echo "✓ Cloudflare ($E)" || { echo "✗ Cloudflare ($E) — xato"; exit 1; }; fi
done
echo "✓ Saqlandi: $F (chmod 600). Endi deploy kerak: git commit --allow-empty -m 'admin parol yangilandi' && git push origin main"
