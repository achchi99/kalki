#!/usr/bin/env bash
# kalki.uz — disk to'lib qolsa Telegram admin guruhiga ogohlantirish (cron: har kuni 09:00).
# Token va chat_id skript ichida YO'Q: ishga tushganda ~/infodigest-bot/.env dan o'qiladi (BOT_TOKEN, DIGEST_ADMIN_GROUP_ID).
# Ishlatish: bash tools/disk-ogohlantir.sh [--sinov]   (--sinov: chegaradan qat'i nazar, belgilangan sinov xabari)
# Chegara: DISK_CHEGARA (standart 85 %). Har bir disk uchun bir kunda bir marta; 95 % dan oshsa — har safar.
# Tekshiriladigan disklar: / va mount qilingan Hetzner volume'lar (/mnt/HC_Volume_*). DISK_YOLLAR="/ /boshqa" bilan almashtirish mumkin.
set -u
CH="${DISK_CHEGARA:-85}"; ENV="${DISK_ENV:-$HOME/infodigest-bot/.env}"; ST="$HOME/.disk-ogohlantir.stamp"
sinov=0; [ "${1:-}" = "--sinov" ] && sinov=1
bugun=$(date +%F)
YOLLAR="${DISK_YOLLAR:-/ $(findmnt -rn -o TARGET 2>/dev/null | grep '^/mnt/HC_Volume_' | tr '\n' ' ')}"

envget() { grep -E "^$1=" "$ENV" 2>/dev/null | tail -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'; }
yubor() {
  local TOKEN CHAT code
  TOKEN=$(envget BOT_TOKEN); CHAT=$(envget DIGEST_ADMIN_GROUP_ID)
  [ -n "$TOKEN" ] && [ -n "$CHAT" ] || { echo "disk-ogohlantir: token/chat topilmadi ($ENV)" >&2; return 1; }
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://api.telegram.org/bot${TOKEN}/sendMessage" --data-urlencode "chat_id=${CHAT}" --data-urlencode "text=$1")
  [ "$code" = 200 ] || { echo "disk-ogohlantir: Telegram HTTP $code" >&2; return 1; }
}

xato=0
for yol in $YOLLAR; do
  mountpoint -q "$yol" || continue
  foiz=$(df --output=pcent "$yol" | tail -1 | tr -dc '0-9'); bosh=$(df -h --output=avail "$yol" | tail -1 | tr -d ' ')
  if [ "$yol" = / ]; then nom="Server diski"; else nom="Volume $yol"; fi
  belgi="$bugun $yol"
  if [ $sinov = 0 ]; then
    [ "$foiz" -ge "$CH" ] || continue
    if [ "$foiz" -lt 95 ]; then
      grep -qxF "$belgi" "$ST" 2>/dev/null && continue
      [ "$yol" = / ] && grep -qxF "$bugun" "$ST" 2>/dev/null && continue   # eski format (faqat sana)
    fi
    if [ "$yol" = / ]; then
      top=$(du -xh --max-depth=1 "$HOME" 2>/dev/null | sort -rh | sed -n 2,4p | awk '{printf "%s %s; ", $1, $2}')
    else
      top=$(du -xh --max-depth=2 "$yol" 2>/dev/null | sort -rh | sed -n 2,4p | awk '{printf "%s %s; ", $1, $2}')
    fi
    txt="${nom} ${foiz}% band (${bosh} bo'sh). Eng kattalar: ${top} Tozalash: bash ~/projects/kalki/tools/disk-tozala.sh"
  else
    txt="[SINOV] Disk ogohlantirishi ishlayapti. ${nom}: ${foiz}% band, ${bosh} bo'sh."
  fi
  if yubor "$txt"; then
    [ $sinov = 0 ] && echo "$belgi" >> "$ST"
    echo "yuborildi: $yol"
  else
    xato=1
  fi
done
# stamp fayli o'smasin: faqat bugungi yozuvlar qoladi
if [ -f "$ST" ]; then grep "^$bugun" "$ST" > "$ST.tmp" 2>/dev/null; mv "$ST.tmp" "$ST"; fi
exit $xato
