#!/usr/bin/env bash
# Downloads square brand icons for the bookmakers into public/bookmakers/.
# Order: the site's own apple-touch-icon (180×180), then Yandex and Google favicon services.
# Replace them later with official logos from each partner programme's promo kit.
set -u
cd "$(dirname "$0")/../public" && mkdir -p bookmakers && cd bookmakers || exit 1

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
books="fonbet:www.fon.bet winline:winline.ru pari:www.pari.ru betboom:betboom.ru ligastavok:www.ligastavok.ru marathon:www.marathonbet.ru olimpbet:www.olimp.bet betcity:betcity.ru"

# Absolute URL for an href found on https://$1
absolute() {
  case "$2" in
    http*) echo "$2" ;;
    //*) echo "https:$2" ;;
    /*) echo "https://$1$2" ;;
    *) echo "https://$1/$2" ;;
  esac
}

# Candidate icon URLs: <link rel="apple-touch-icon"> from the homepage, well-known paths, then services.
candidates() {
  local d=$1 html href
  html=$(curl -sL --max-time 15 -A "$UA" "https://$d/" 2>/dev/null | tr '\n' ' ')
  for rel in 'apple-touch-icon' 'icon'; do
    href=$(printf '%s' "$html" | grep -oiE "<link[^>]+rel=\"?[^\"]*$rel[^\"]*\"?[^>]*>" | grep -oiE 'href="[^"]+"' | head -1 | cut -d'"' -f2)
    [ -n "$href" ] && absolute "$d" "$href"
  done
  echo "https://$d/apple-touch-icon.png"
  echo "https://$d/apple-touch-icon-precomposed.png"
  echo "https://favicon.yandex.net/favicon/v2/${d#www.}?size=120"
  echo "https://www.google.com/s2/favicons?domain=${d#www.}&sz=128"
}

for pair in $books; do
  slug=${pair%%:*}; domain=${pair#*:}
  rm -f "$slug".png "$slug".svg "$slug".webp "$slug".jpg
  saved=""; last=""
  while read -r url; do
    [ -z "$url" ] && continue
    code=$(curl -sL --max-time 15 -A "$UA" -o "$slug.tmp" -w "%{http_code}" "$url" 2>/dev/null)
    size=$(wc -c < "$slug.tmp" 2>/dev/null | tr -d ' ')
    type=$(file -b --mime-type "$slug.tmp" 2>/dev/null)
    case "$type" in
      image/png) ext=png ;; image/svg+xml) ext=svg ;; image/webp) ext=webp ;; image/jpeg) ext=jpg ;; *) ext="" ;;
    esac
    if [ "$code" = "200" ] && [ -n "$ext" ] && [ "${size:-0}" -gt 150 ]; then
      mv "$slug.tmp" "$slug.$ext"; saved="$slug.$ext ($size байт) ← $url"; break
    fi
    last="$url → HTTP $code, $type, ${size:-0} байт"
  done < <(candidates "$domain")
  rm -f "$slug.tmp"
  if [ -n "$saved" ]; then echo "✓ $saved"; else echo "✗ $slug — последний ответ: $last"; fi
done
echo
echo "Готово. Обновите страницу сайта."
