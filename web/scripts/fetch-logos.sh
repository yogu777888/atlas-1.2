#!/usr/bin/env bash
# Downloads square brand icons for the bookmakers into public/bookmakers/.
# Tries Yandex's favicon service first (reliable in Russia), then Google's.
# Replace them later with official logos from each partner programme's promo kit.
set -u
cd "$(dirname "$0")/../public" && mkdir -p bookmakers && cd bookmakers || exit 1

books="fonbet:fon.bet winline:winline.ru pari:pari.ru betboom:betboom.ru ligastavok:ligastavok.ru marathon:marathonbet.ru olimpbet:olimp.bet betcity:betcity.ru"

for pair in $books; do
  slug=${pair%%:*}; domain=${pair#*:}
  ok=""
  for url in "https://favicon.yandex.net/favicon/v2/${domain}?size=120" "https://www.google.com/s2/favicons?domain=${domain}&sz=128"; do
    if curl -sfL --max-time 15 "$url" -o "$slug.tmp" && [ "$(wc -c < "$slug.tmp")" -gt 400 ] && head -c 8 "$slug.tmp" | grep -q "PNG"; then
      mv "$slug.tmp" "$slug.png"; ok="$url"; break
    fi
  done
  rm -f "$slug.tmp"
  if [ -n "$ok" ]; then echo "✓ $slug  ($(wc -c < "$slug.png" | tr -d ' ') байт)"; else echo "✗ $slug — не скачался, останется плашка с буквами"; fi
done
echo
echo "Готово. Перезапустите сайт (Ctrl+C, затем npm run dev)."
