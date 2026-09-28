# tag.bet

**Every line. One tag.** — сервис сравнения коэффициентов букмекеров: находим лучшую цену на каждый исход,
ловим «вилки» (sure bets) и показываем бонусы. Зарабатываем на партнёрских (affiliate) программах букмекеров.

```
web/   Next.js 16 — сайт tag.bet + JSON API для приложения
ios/   SwiftUI — нативное iPhone-приложение (iOS 17+)
docs/  плейбук запуска: партнёрки, App Store, юридические моменты
```

## Сайт (web/)

```bash
cd web
cp .env.example .env.local   # заполните по мере готовности
npm install
npm run dev                  # http://localhost:3000
npm test                     # юнит-тесты математики коэффициентов
npm run build
```

Без `ODDS_API_KEY` сайт работает на реалистичных демо-коэффициентах (помечены как DEMO).
С ключом от [the-odds-api.com](https://the-odds-api.com) — на живых данных.

**Что есть:**

| Страница | Что делает |
|---|---|
| `/` | Лендинг: hero с живым сравнением, доска коэффициентов, рейтинг БК, бонусы, промо приложения, FAQ |
| `/odds`, `/odds?sport=…` | Все матчи, лучшая цена подсвечена, маржа, вкладка «Sure bets» |
| `/odds/[id]` | Матч: лучшие цены, таблица всех БК, калькулятор разбивки ставки для вилки |
| `/bookmakers`, `/bookmakers/[slug]` | Рейтинг и обзоры БК (SEO, schema.org Review) |
| `/bonuses` | Бонусы с условиями |
| `/go/[slug]?src=…` | **Трекер партнёрских кликов**: гео-блок, sub-id, лог, вебхук |
| `/api/v1/odds`, `/api/v1/bookmakers`, `/api/v1/config` | API для iOS |
| `/responsible-gambling`, `/disclosure`, `/privacy`, `/terms` | Обязательные страницы |

Плюс: 18+ age gate, sitemap.xml, robots.txt, OG-картинка, JSON-LD, security-заголовки.

### Как подключить партнёрку

1. Регистрируетесь в партнёрской программе БК (см. `docs/launch-playbook.md`).
2. Копируете свою трекинговую ссылку в `.env`: `AFF_BET365=https://...`
3. Всё. Все кнопки на сайте и в приложении идут через `/go/bet365`, который подставит sub-id
   (`src_clickId`) — в отчёте партнёрки будет видно, с какой кнопки пришёл игрок.
4. Параметр sub-id у каждой сети свой — поле `subIdParam` в `web/src/lib/bookmakers.ts`.

⚠️ Бонусы, промокоды и списки стран в `web/src/lib/bookmakers.ts` — **заглушки**. Перед запуском
замените их точными формулировками от вашего affiliate-менеджера.

### Деплой

Vercel: импортируйте репозиторий, **Root Directory = `web`**, добавьте переменные окружения,
подключите домен `tag.bet`. Гео-блокировка использует заголовок `x-vercel-ip-country`
(на Cloudflare — `cf-ipcountry`, тоже поддерживается).

## iPhone-приложение (ios/)

Нужен Mac с Xcode 16+ и [XcodeGen](https://github.com/yonaskolb/XcodeGen):

```bash
brew install xcodegen
cd ios
xcodegen            # сгенерирует TagBet.xcodeproj
open TagBet.xcodeproj
```

- В Debug приложение ходит на `http://localhost:3000` (запустите `npm run dev`), в Release — на `https://tag.bet`.
- Впишите свой `DEVELOPMENT_TEAM` в `project.yml`, bundle id — `bet.tag.app`.
- Экраны: Odds (виды спорта, поиск, вилки, избранное), матч (лучшие цены, все БК, калькулятор вилки),
  Bonuses (копирование промокода), Books (рейтинг + обзоры), More (ответственная игра, раскрытие).
- Ссылки на БК открываются в in-app Safari и **выключаются удалённо** по стране через `/api/v1/config`
  (`APP_LINKS_DISABLED_COUNTRIES=US,FR`) — без обновления приложения. Это важно для ревью App Store.

> Код приложения написан под iOS 17 SDK, но в этой среде (Linux) не компилировался — первая сборка в Xcode
> может потребовать мелких правок.
