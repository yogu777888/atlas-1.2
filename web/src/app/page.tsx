import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { BankChart } from "@/components/BankChart";
import { Board, BoardLegend } from "@/components/Board";
import { BoardFilter } from "@/components/BoardFilter";
import { Standings } from "@/components/Standings";
import { TeamMark } from "@/components/TeamMark";
import { getSeason, standings } from "@/lib/season";
import { BookmakerMini } from "@/components/BookmakerRow";
import { Calibration } from "@/components/Calibration";
import { MatchCard } from "@/components/MatchCard";
import { Faq, SectionHead, Stats, words } from "@/components/Page";
import { articles } from "@/content/articles";
import { badgeOf } from "@/lib/badges";
import { bookmakersByRating } from "@/lib/bookmakers";
import { dataSource, getMatchDetail, getMatches, type MatchDetail } from "@/lib/data";
import { mskTime } from "@/lib/dates";
import { marketCheck, whatIfFact } from "@/lib/insights";
import { getLeague, isClubTop, leagues } from "@/lib/leagues";
import { hasValue, plural, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { POPULAR, teamSlug } from "@/lib/teams";
import { tools } from "@/lib/tools";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Прогнозы на футбол по цифрам: шансы на матчи недели · tag.bet" },
  description:
    "Прогнозы на футбол на неделю: шансы на матчи РПЛ, АПЛ, Лиги чемпионов и других топ-лиг по коэффициентам мировых букмекеров, форма команд и составы.",
  alternates: { canonical: "/" },
};

const BOARD_ROWS = 14;

const MAJOR = new Set(["Россия", "Англия", "Франция", "Германия", "Испания", "Италия", "Португалия", "Нидерланды", "Бельгия", "Хорватия", "Сербия", "Швейцария", "Австрия", "Дания", "Швеция", "Норвегия", "Польша", "Чехия", "Турция", "Украина", "Шотландия", "Уэльс", "Бразилия", "Аргентина", "Уругвай", "Колумбия", "Мексика", "США", "Япония", "Южная Корея", "Марокко", "Сенегал", "Казахстан", "Беларусь", "Грузия", "Армения", "Узбекистан", "Венгрия", "Греция", "Румыния", "Словакия", "Словения", "Ирландия", "Исландия", "Финляндия", "Эквадор", "Чили", "Перу", "Парагвай", "Канада", "Австралия", "Иран", "Саудовская Аравия", "Египет", "Нигерия", "Кот-д'Ивуар", "Гана", "Камерун", "Алжир", "Тунис"]);

/** Each calculator as a tiny equation: what you type in → what you get */
const TOOL_EQ: Record<string, { in: string[]; out: string; text: string }> = {
  marzha: { in: ["1.90", "3.60", "4.20"], out: "4,2%", text: "Коэффициенты на все исходы → маржа и честные шансы." },
  veroyatnost: { in: ["1.90"], out: "52,6%", text: "Любой формат коэффициента → вероятность исхода." },
  ekspress: { in: ["1.90", "×", "1.90", "×", "1.90"], out: "6.86", text: "События экспресса → итоговый коэффициент и его маржа." },
};

const faqs = [
  {
    q: "Откуда берутся шансы?",
    a: "Из коэффициентов крупных мировых букмекеров. Мы переводим их в вероятности, убираем маржу и берём среднее. Букмекеры рискуют своими деньгами, поэтому их общая оценка обычно точнее мнения любого отдельного человека.",
  },
  {
    q: "Что значит коэффициент на жёлтом фоне?",
    a: "Легальный букмекер платит за этот исход больше, чем следует из шансов рынка. На длинной дистанции такие ставки выгоднее остальных, но отдельная ставка всё равно может проиграть.",
  },
  { q: "Как часто обновляются прогнозы?", a: "Список матчей и коэффициенты обновляются каждые пять минут. Перед ставкой проверьте коэффициент в купоне букмекера: он мог измениться." },
  { q: "tag.bet — это букмекер?", a: "Нет. Мы не принимаем ставки и не храним деньги игроков. Мы считаем шансы на матчи и рассказываем о легальных букмекерах." },
  {
    q: "Как tag.bet зарабатывает?",
    a: "Некоторые букмекеры платят нам за новых клиентов, которые пришли по нашей ссылке. Такие ссылки помечены как реклама. На шансы и оценки это не влияет.",
  },
];

export default async function Home() {
  const [matches, fact, check] = await Promise.all([getMatches(), whatIfFact().catch(() => null), marketCheck().catch(() => null)]);
  const live = dataSource() === "live";
  const main = matches.filter((m) => m.league.key !== "other");
  const board = (main.length ? main : matches).slice(0, BOARD_ROWS);
  const featured = pickFeatured(main.length ? main : matches);
  const detail: MatchDetail | null = featured ? await getMatchDetail(featured).catch(() => null) : null;
  const valueCount = matches.filter(hasValue).length;
  const chips = leagues
    .map((l) => ({ key: l.key, short: l.short, label: `Все прогнозы на ${l.acc}`, href: paths.league(l.slug), count: board.filter((m) => m.league.key === l.key).length }))
    .filter((l) => l.count > 0);
  const top = bookmakersByRating();
  const popular = matches.filter((m) => POPULAR.includes(m.home) || POPULAR.includes(m.away)).slice(0, 5);
  const rplTable = popular.length ? [] : await getSeason("rpl").then((s) => standings(s.games)).catch(() => []);

  return (
    <div className="container-x">
      <header className="grid items-end gap-x-12 gap-y-5 border-b border-line pt-7 pb-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h1 className="text-[clamp(28px,3.4vw,40px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">{words("Прогнозы на футбол по цифрам")}</h1>
          <p className="fade-up mt-2 max-w-[62ch] text-[15px] text-pretty text-muted [animation-delay:300ms]">
            Шансы на каждый матч РПЛ, топ-лиг Европы и Лиги чемпионов. Считаем их по коэффициентам мировых букмекеров без маржи и отмечаем,
            где легальный букмекер платит больше честной цены.
          </p>
        </div>
        <div className="fade-up [animation-delay:450ms]">
          <Stats
            items={[
              { label: "Матчей на неделе", value: matches.length },
              { label: "Выше честной цены", value: valueCount },
              live
                ? { label: <><span className="mr-1.5 inline-block size-[7px] animate-pulse-dot rounded-full bg-p4 align-middle" />Обновлено</>, value: mskTime(new Date().toISOString()), unit: "мск" }
                : { label: "Данные", value: "демо" },
            ]}
          />
        </div>
      </header>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="board-title">
          <h2 id="board-title" className="sr-only">
            Прогнозы на ближайшие матчи
          </h2>
          <BoardFilter chips={chips} legend={<BoardLegend odds={board.some((m) => m.pari)} />}>
            <Board
              matches={board}
              empty={
                <>
                  На ближайшую неделю матчей топ-лиг нет. Загляните в <Link href={paths.league("sbornye")} className="font-semibold underline">матчи сборных</Link>.
                </>
              }
            />
          </BoardFilter>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-subtle">Шансы — среднее по мировому рынку без маржи. Коэффициенты — легального букмекера.</p>
            {matches.length > board.length && (
              <Link href={paths.forecasts} className="link-more">
                Все прогнозы на неделю <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </section>

        <aside className="grid gap-5 lg:sticky lg:top-20">
          {featured && (
            <div className="hidden sm:block">
              <MatchCard m={featured} d={detail} />
            </div>
          )}
          <article className="card p-5">
            <span className="kicker">Где ставить</span>
            <div className="mt-2">
              <BookmakerMini list={top.slice(0, 3)} />
            </div>
            <p className="mt-2 text-[11px] text-subtle">Только букмекеры с лицензией ФНС России.</p>
            <Link href={paths.bookmakers} className="link-more mt-3">
              Весь рейтинг <span aria-hidden>→</span>
            </Link>
          </article>
        </aside>
      </div>

      <section className="mt-block">
        <SectionHead title="Ваша команда" sub="Прогноз на следующий матч, форма и что было бы, если ставить на неё весь сезон." href={paths.teams} cta="Все команды" />
        <nav aria-label="Популярные команды" className="flex flex-wrap gap-1.5">
          {POPULAR.map((t) => (
            <Link key={t} href={paths.team(teamSlug(t))} className="chip px-3.5 py-2 hover:-translate-y-0.5">
              <TeamMark name={t} size={16} />
              {t}
            </Link>
          ))}
        </nav>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex flex-col">
            <p className="mb-2 text-sm font-semibold text-fg-2">{popular.length ? "Ближайшие матчи этих команд" : "Топ-лиги на паузе · верх таблицы РПЛ"}</p>
            <div>{popular.length ? <Board matches={popular} /> : rplTable.length > 0 && <Standings rows={rplTable} limit={6} />}</div>
            <Link href={popular.length ? paths.forecasts : paths.league("rpl")} className="link-more mt-3 self-start">
              {popular.length ? "Все прогнозы на неделю" : "Таблица и прогнозы на РПЛ"} <span aria-hidden>→</span>
            </Link>
          </div>
          {fact && (
            <div className="flex flex-col">
              <p className="mb-2 text-sm font-semibold text-fg-2">
                А что, если · {getLeague(fact.league)?.short} {fact.season}
              </p>
              <WhatIfCard fact={fact} />
            </div>
          )}
        </div>
      </section>

      <section className="mt-block">
        <SectionHead title="Насколько точны эти шансы" href={paths.method} cta="Как мы считаем" />
        <div data-reveal className="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line md:grid-cols-[1.7fr_1fr]">
          <div className="grid items-center gap-x-8 gap-y-3 bg-surface p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {check ? (
              <>
                <div>
                <h3 className="font-bold">Проверяем рынок на прошлом сезоне</h3>
                <p className="mt-1.5 text-sm text-muted">
                  {check.near60
                    ? `Исходы, которым рынок давал ${Math.round(check.near60.from * 100)}–${Math.round(check.near60.to * 100)}%, сбылись в ${Math.round(check.near60.actual * 100)}% случаев. `
                    : ""}
                  Каждая точка — группа исходов из {check.games.toLocaleString("ru-RU")} {plural(check.games, ["матча", "матчей", "матчей"])} сезона {check.season}. Чем ближе точки к диагонали, тем честнее шансы.
                </p>
                {check.demo && <p className="mt-2 text-[11px] text-subtle">Демо-данные: график посчитан на модельном сезоне.</p>}
                </div>
                <Calibration bins={check.bins} className="mx-auto max-w-[380px]" />
              </>
            ) : (
              <div>
                <h3 className="font-bold">Проверяем рынок на прошлом сезоне</h3>
                <p className="mt-1.5 text-sm text-muted">График появится, когда загрузятся результаты прошлого сезона.</p>
              </div>
            )}
          </div>
          <div className="grid gap-px">
          <div className="bg-surface p-5">
            <h3 className="font-bold">Шансы считает рынок</h3>
            <p className="mt-1.5 text-sm text-muted">
              Мы берём коэффициенты десятков букмекеров, убираем из них маржу и усредняем. Эксперты и «инсайды» в расчёте не участвуют, поэтому шансы
              одинаково считаются для любого матча.
            </p>
          </div>
          <div className="bg-surface p-5">
            <h3 className="font-bold">Только легальные букмекеры</h3>
            <p className="mt-1.5 text-sm text-muted">
              У всех, о ком мы пишем, есть лицензия ФНС России. Партнёрские ссылки помечены как реклама, а коэффициенты и шансы от них не зависят.
            </p>
          </div>
          </div>
        </div>
      </section>

      <section className="mt-block">
        <SectionHead title="Разобраться за пять минут" href={paths.articles} cta="Все статьи" />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {["kak-chitat-prognoz", "marzha-bukmekera", "valuinaya-stavka"].map((slug) => (
            <ArticleCard key={slug} a={articles.find((x) => x.slug === slug)!} />
          ))}
        </div>
        <div className="mt-12">
          <SectionHead title="Калькуляторы" level={3} sub="Проверьте маржу, вероятность и экспресс на своих коэффициентах." href={paths.tools} cta="Все калькуляторы" />
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => {
              const eq = TOOL_EQ[t.slug];
              return (
                <Link key={t.slug} href={paths.tool(t.slug)} data-reveal className="card group p-5 transition-colors hover:border-fg">
                  <span className="num flex flex-wrap items-center gap-1.5 text-lg font-semibold" aria-hidden>
                    {eq.in.map((x, k) => (
                      <span key={k} className={x === "×" ? "text-subtle" : "rounded-md bg-surface-2 px-2 py-0.5 ring-1 ring-line"}>
                        {x}
                      </span>
                    ))}
                    <span className="px-0.5 text-subtle">→</span>
                    <span className="rounded-md bg-hi px-2 py-0.5 font-bold">{eq.out}</span>
                  </span>
                  <b className="mt-4 block leading-snug font-bold">
                    <span className="transition-[box-shadow] duration-300 group-hover:shadow-[inset_0_-0.4em_0_var(--color-hi)]">{t.title}</span>
                  </b>
                  <small className="mt-1 block text-sm text-muted">{eq.text}</small>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-block">
        <Faq items={faqs} />
      </div>
    </div>
  );
}

function WhatIfCard({ fact }: { fact: NonNullable<Awaited<ReturnType<typeof whatIfFact>>> }) {
  const { ledger: l, team } = fact;
  const rub = `${l.profit > 0 ? "+" : l.profit < 0 ? "−" : ""}${Math.abs(l.profit).toLocaleString("ru-RU")} ₽`;
  return (
    <article className="card p-5">
      <p>
        100 ₽ на победу команды {team.name} в каждом матче сезона, {l.steps.length} {plural(l.steps.length, ["матч", "матча", "матчей"])}:
      </p>
      <p className={`num mt-1 text-[56px] leading-none font-bold ${l.profit >= 0 ? "text-win" : "text-loss"}`}>{rub}</p>
      <div className="mt-3">
        <BankChart steps={l.steps} />
      </div>
      <p className="mt-3 text-sm text-muted">
        Посчитано по коэффициентам закрытия линии и реальным результатам{fact.demo ? " (сейчас демо-данные)" : ""}.{" "}
        <Link href={`${paths.whatIf}?league=${fact.league}&season=${fact.year}&team=${team.id}`} className="font-semibold text-fg underline decoration-hi decoration-2 underline-offset-4">
          Посчитать для своей команды
        </Link>
      </p>
    </article>
  );
}

/**
 * The match of the day: club top leagues first, then national teams, then one
 * with a price above fair. Skips kick-offs in the next 30 minutes.
 */
function pickFeatured(matches: Match[]): Match | undefined {
  const soon = Date.now() + 30 * 60_000;
  const pool = matches.filter((m) => m.fair && Date.parse(m.commenceTime) > soon);
  // Teams we have Russian names for are the ones readers know; "Belize — St. Vincent" is never the match of the day
  // Teams readers know: a club with a colour badge, or a national side from Europe or the big football countries
  const known = (m: Match) => [m.home, m.away].every((t) => MAJOR.has(t) || "colors" in badgeOf(t));
  const score = (m: Match) =>
    (isClubTop(m.league.key) ? 5 : m.league.key === "intl" ? 4 : 0) + (known(m) ? 4 : -6) + (m.pari ? 2 : 0) + (hasValue(m) ? 1 : 0) + (POPULAR.includes(m.home) || POPULAR.includes(m.away) ? 2 : 0);
  return [...pool].sort((a, b) => score(b) - score(a) || a.commenceTime.localeCompare(b.commenceTime))[0] ?? matches[0];
}
