#!/usr/bin/env bash
# kalki.uz — disk to'lib qolsa Telegram admin guruhiga ogohlantirish (cron: har kuni 09:00).
# Token va chat_id skript ichida YO'Q: ishga tushganda ~/infodigest-bot/.env dan o'qiladi (BOT_TOKEN, DIGEST_ADMIN_GROUP_ID).
# Ishlatish: bash tools/disk-ogohlantir.sh [--sinov]   (--sinov: chegaradan qat'i nazar, belgilangan sinov xabari)
# Chegara: DISK_CHEGARA (standart 85 %). Bir kunda bir marta; 95 % dan oshsa — har safar.
set -u
CH="${DISK_CHEGARA:-85}"; ENV="${DISK_ENV:-$HOME/infodigest-bot/.env}"; ST="$HOME/.disk-ogohlantir.stamp"
foiz=$(df --output=pcent / | tail -1 | tr -dc '0-9'); bosh=$(df -h --output=avail / | tail -1 | tr -d ' ')
sinov=0; [ "${1:-}" = "--sinov" ] && sinov=1
bugun=$(date +%F)
if [ $sinov = 0 ]; then
  [ "$foiz" -ge "$CH" ] || exit 0
  [ "$foiz" -ge 95 ] || ! grep -qx "$bugun" "$ST" 2>/dev/null || exit 0
fi
envget() { grep -E "^$1=" "$ENV" 2>/dev/null | tail -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'; }
TOKEN=$(envget BOT_TOKEN); CHAT=$(envget DIGEST_ADMIN_GROUP_ID)
[ -n "$TOKEN" ] && [ -n "$CHAT" ] || { echo "disk-ogohlantir: token/chat topilmadi ($ENV)" >&2; exit 1; }
top=$(du -xh --max-depth=1 "$HOME" 2>/dev/null | sort -rh | sed -n 2,4p | awk '{printf "%s %s; ", $1, $2}')
if [ $sinov = 1 ]; then txt="[SINOV] Disk ogohlantirishi ishlayapti. Hozir: ${foiz}% band, ${bosh} bo'sh."
else txt="Server diski ${foiz}% band (${bosh} bo'sh). Eng kattalar: ${top} Tozalash: bash ~/projects/kalki/tools/disk-tozala.sh"; fi
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "chat_id=${CHAT}" --data-urlencode "text=${txt}")
[ "$code" = 200 ] && { echo "$bugun" > "$ST"; echo "yuborildi"; } || { echo "disk-ogohlantir: Telegram HTTP $code" >&2; exit 1; }
