import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Board } from "@/components/Board";
import { CompareBars } from "@/components/CompareBars";
import { Scorers } from "@/components/Scorers";
import { FlipText } from "@/components/FlipText";
import { FormColumn, HeadToHead, MissingList, Verdict } from "@/components/ForecastBlocks";
import { OutboundButton } from "@/components/OutboundButton";
import { Fine, SectionHead } from "@/components/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TeamMark } from "@/components/TeamMark";
import { getArticle } from "@/content/articles";
import { getBookmaker } from "@/lib/bookmakers";
import { findMatch, getMatchDetail, getMatches, type MatchDetail } from "@/lib/data";
import { dayMonth, dayMonthYear, mskDay, mskTime, whenRu } from "@/lib/dates";
import { pointsPerGame } from "@/lib/forecast";
import { pairSlug, teamRows } from "@/lib/compare";
import { CLUB_LEAGUES, isClubTop, type ClubLeague } from "@/lib/leagues";
import { getSeason, standings } from "@/lib/season";
import { pairStats } from "@/lib/stats-store";
import { edge, isSuspect, isValue, margin, moved, odds, OUTCOMES, outcomeLabel, parseMatchRef, pct, plural, probClass, UPSET, verdict, winnerOf, type Match, type Probs1x2 } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";
import { teamSlug } from "@/lib/teams";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

/** Nothing at build time: each forecast is rendered on its first visit and then cached. */
export function generateStaticParams() {
  return [];
}

async function load(slug: string) {
  const ref = parseMatchRef(slug);
  if (!ref || !("live" in ref)) return null;
  return findMatch(ref.live);
}

const vs = (m: Match) => `${m.home} — ${m.away}`;
const score = (m: Match) => (m.score ? `${m.score.home}:${m.score.away}` : "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await load((await params).slug);
  if (!m) return { title: "Матч не найден" };
  const f = m.fair;
  const chances = f ? `${m.home} ${pct(f.home)}, ничья ${pct(f.draw)}, ${m.away} ${pct(f.away)}` : "";
  const date = dayMonthYear(m.commenceTime);
  const league = m.league.label.replace(" УЕФА", "");
  if (m.status === "finished" && m.score) {
    return {
      title: `${vs(m)} ${score(m)}, ${date}: прогноз и итог матча`,
      description: `${vs(m)} ${score(m)} (${league}, ${date}).${chances ? ` Перед матчем рынок давал: ${chances}.` : ""} Форма команд и личные встречи.`,
      alternates: { canonical: paths.match(m.slug) },
    };
  }
  return {
    title: `Прогноз на матч ${vs(m)} ${date}`,
    description: `Прогноз на матч ${vs(m)}, ${league}, ${dayMonth(m.commenceTime)}.${chances ? ` Шансы по рынку: ${chances}.` : ""} Голы, форма команд, личные встречи и кто не сыграет.`,
    alternates: { canonical: paths.match(m.slug) },
  };
}

export default async function MatchPage({ params }: Props) {
  const { slug } = await params;
  const m = await load(slug);
  if (!m) notFound();
  if (slug !== m.slug) permanentRedirect(paths.match(m.slug));

  const club = CLUB_LEAGUES.find((k): k is ClubLeague => k === m.league.key);
  const withStats = !!club && !!m.homeId && !!m.awayId && m.status !== "finished";
  const [d, upcoming, pair, season] = await Promise.all([
    getMatchDetail(m),
    getMatches().catch(() => [] as Match[]),
    withStats ? pairStats(club!, m.homeId!, m.awayId!).catch(() => null) : Promise.resolve(null),
    withStats ? getSeason(club!).catch(() => null) : Promise.resolve(null),
  ]);
  const fair = d.world ?? m.fair;
  const pari = getBookmaker("pari")!;
  const finished = m.status === "finished" && !!m.score;
  const teamLink = isClubTop(m.league.key);
  const sameDay = upcoming.filter((x) => x.id !== m.id && (finished ? x.league.key === m.league.key : mskDay(x.commenceTime) === mskDay(m.commenceTime))).slice(0, 6);

  return (
    <div className="container-x">
      <header className="border-b border-line pt-6 pb-7 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: "Прогнозы", href: paths.forecasts },
            ...(m.league.key !== "other" ? [{ label: m.league.key === "intl" ? "Сборные" : m.league.short, href: paths.league(m.league.slug) }] : []),
            { label: vs(m), href: paths.match(m.slug) },
          ]}
        />
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{m.league.label.replace(" УЕФА", "")}</span>
          <span aria-hidden>·</span>
          <span>{m.status === "scheduled" ? `${whenRu(m.commenceTime)} мск` : `${dayMonthYear(m.commenceTime)}, ${mskTime(m.commenceTime)} мск`}</span>
          {m.status === "live" && <StatusPill tone="live">Идёт матч{m.score ? `, ${score(m)}` : ""}</StatusPill>}
          {m.status === "off" && <StatusPill>Матч перенесён или отменён</StatusPill>}
        </p>
        <h1 className="mt-2 text-[clamp(30px,4.2vw,48px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
          {finished ? (
            <>
              {vs(m)} <span className="num font-bold whitespace-nowrap">{score(m)}</span>
            </>
          ) : (
            `Прогноз на матч ${vs(m)}`
          )}
        </h1>
        <p className="mt-3 max-w-[64ch] text-base text-pretty text-muted">{lead(m, fair)}</p>
        {teamLink && (
          <p className="mt-3 flex flex-wrap gap-1.5">
            {[m.home, m.away].map((t) => (
              <Link key={t} href={paths.team(teamSlug(t))} className="chip">
                <TeamMark name={t} size={14} />
                {t}: форма и матчи
              </Link>
            ))}
          </p>
        )}
      </header>

      {finished && fair && m.score && <Outcome m={m} fair={fair} />}

      {!finished && fair && (
        <section className="mt-7" aria-labelledby="verdict">
          <h2 id="verdict" className="sr-only">
            Коротко: исход, голы, обе забьют
          </h2>
          <Verdict items={picks(m, fair, d)} />
        </section>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="font-bold">Шансы по мировому рынку</h2>
          <p className="mt-1 text-sm text-muted">
            {d.worldBooks > 1 ? `Среднее по ${d.worldBooks} международным букмекерам` : "Средний коэффициент рынка"}, маржа убрана.
            {finished ? " Коэффициенты закрытия линии, перед самым началом матча." : ""}
          </p>
          {fair ? (
            <div className="mt-5 grid grid-cols-3 gap-1.5 text-center">
              {OUTCOMES.map((o, i) => (
                <div key={o} className={`rounded-lg px-1 py-2.5 ${probClass(fair[o])}`}>
                  <p className="truncate text-xs">{o === "draw" ? "Ничья" : outcomeLabel(m, o)}</p>
                  <p className="num mt-0.5 text-[34px] leading-none font-bold">
                    <FlipText text={pct(fair[o])} delay={200 + i * 160} />
                  </p>
                  <p className="num mt-1 text-sm opacity-80">честный {odds(1 / fair[o])}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-subtle">Рынок по этому матчу ещё не сформировался. Шансы появятся, когда букмекеры откроют линию.</p>
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-bold">Коэффициенты легального букмекера</h2>
          <p className="mt-1 text-sm text-muted">Жёлтым отмечен коэффициент выше честного. Под ним — перевес над честной ценой и то, как коэффициент изменился с открытия линии.</p>
          {m.pari ? (
            <div className="mt-5 grid grid-cols-3 gap-1.5 text-center">
              {OUTCOMES.map((o) => {
                const price = m.pari!.odds[o];
                const value = fair ? edge(price, fair[o]) : null;
                const good = fair ? isValue(price, fair[o]) : false;
                const suspect = fair ? isSuspect(price, fair[o]) : false;
                return (
                  <div key={o} className="rounded-lg bg-surface-2 px-1 py-2.5 ring-1 ring-line">
                    <p className="truncate text-xs text-muted">{o === "draw" ? "Ничья" : outcomeLabel(m, o)}</p>
                    <p className="mt-0.5">
                      <span className={`num rounded-[3px] px-1 text-[34px] leading-none font-bold ${good ? "hl" : ""}`}>{odds(price)}</span>
                    </p>
                    {m.pari!.open && moved(price, m.pari!.open[o]) !== 0 && (
                      <p className={`num text-xs ${moved(price, m.pari!.open[o]) > 0 ? "text-win" : "text-loss"}`}>
                        {moved(price, m.pari!.open[o]) > 0 ? "▲" : "▼"} было {odds(m.pari!.open[o])}
                      </p>
                    )}
                    {value !== null && (
                      <p className="num mt-1 text-sm text-muted" title={suspect ? "Слишком большой разрыв с рынком: скорее всего, линия устарела" : undefined}>
                        {suspect ? "проверяем" : `${value > 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(1).replace(".", ",")}%`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-subtle">{finished ? "После матча линия закрыта." : "Букмекер ещё не открыл линию на этот матч."}</p>
          )}
          {!finished && m.pari && (
            <div className="mt-5">
              <OutboundButton b={pari} source={`match-${m.sstatsId}`} label="Сделать ставку в PARI" className="h-10 w-full" fallback={null} />
            </div>
          )}
        </section>
      </div>

      {pair?.ok && (
        <section className="mt-block">
          <SectionHead
            title="Сравнение команд"
            sub={`Средние за последние ${Math.min(pair.a.games, pair.b.games)} ${plural(Math.min(pair.a.games, pair.b.games), ["матч", "матча", "матчей"])} ${m.league.gen} у каждой команды${pair.demo ? " (демо-данные)" : ""}. Тёмная полоса — у кого показатель лучше.`}
            href={paths.pair(pairSlug(m.home, m.away))}
            cta="Полное сравнение"
          />
          <CompareBars
            left={m.home}
            right={m.away}
            rows={teamRows(pair.a.profile!, pair.b.profile!, season ? standings(season.games).find((r) => r.id === m.homeId) : null, season ? standings(season.games).find((r) => r.id === m.awayId) : null, true)}
          />
        </section>
      )}

      {pair?.ok && (
        <section className="mt-block">
          <SectionHead title="Кто может забить" sub="Лучшие бомбардиры команд в последних матчах чемпионата. Красным отмечены игроки, которые пропустят матч." />
          <Scorers
            sides={[
              { team: m.home, players: pair.a.scorers, games: pair.a.games, missing: d.missing.filter((x) => x.team === "home") },
              { team: m.away, players: pair.b.scorers, games: pair.b.games, missing: d.missing.filter((x) => x.team === "away") },
            ]}
          />
        </section>
      )}

      {(d.form.home.length > 0 || d.form.away.length > 0) && (
        <section className="mt-block">
          <SectionHead title="Форма команд" sub={finished ? "Матчи перед этой игрой, во всех турнирах." : "Последние матчи во всех турнирах."} />
          <div className="grid gap-4 md:grid-cols-2">
            <FormColumn team={m.home} games={d.form.home} href={teamLink ? paths.team(teamSlug(m.home)) : undefined} />
            <FormColumn team={m.away} games={d.form.away} href={teamLink ? paths.team(teamSlug(m.away)) : undefined} />
          </div>
        </section>
      )}

      {d.h2h.length > 0 && (
        <section className="mt-block">
          <SectionHead title="Личные встречи" />
          <HeadToHead games={d.h2h} home={m.home} />
        </section>
      )}

      {d.missing.length > 0 && !finished && (
        <section className="mt-block">
          <SectionHead title="Кто не сыграет" sub="Травмы и дисквалификации по данным к началу матча." />
          <div className="grid gap-4 md:grid-cols-2">
            <MissingList team={m.home} list={d.missing.filter((p) => p.team === "home")} />
            <MissingList team={m.away} list={d.missing.filter((p) => p.team === "away")} />
          </div>
        </section>
      )}

      {d.glicko && (
        <section className="card mt-8 p-5 sm:p-6">
          <h2 className="font-bold">Сила команд по рейтингу Glicko-2</h2>
          <p className="mt-1 text-sm text-muted">Второе мнение: рейтинг считается только по прошлым результатам и не знает о травмах и составах.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Stat label={m.home} value={pct(d.glicko.home)} sub={d.glicko.homeXg !== null ? `ожидаемые голы ${d.glicko.homeXg.toFixed(2).replace(".", ",")}` : undefined} />
            {d.glicko.draw !== null && <Stat label="Ничья" value={pct(d.glicko.draw)} />}
            <Stat label={m.away} value={pct(d.glicko.away)} sub={d.glicko.awayXg !== null ? `ожидаемые голы ${d.glicko.awayXg.toFixed(2).replace(".", ",")}` : undefined} />
          </div>
        </section>
      )}

      <section className="mt-block grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="max-w-[68ch] space-y-3 leading-relaxed text-fg-2">
          <h2 className="text-xl font-extrabold tracking-tight text-fg">Коротко о матче</h2>
          {summary(m, fair, d).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-fg-2">Как мы это считаем</p>
          {["kak-chitat-prognoz", "valuinaya-stavka"].map((slug) => (
            <ArticleLink key={slug} slug={slug} />
          ))}
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
            <Link href={paths.method} className="link-more">
              Методика целиком <span aria-hidden>→</span>
            </Link>
            <Link href={paths.tool("marzha")} className="link-more">
              Посчитать маржу самому <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {sameDay.length > 0 && (
        <section className="mt-block">
          <SectionHead
            title={finished ? `Ближайшие матчи: ${m.league.short}` : `Ещё прогнозы на ${dayMonth(m.commenceTime)}`}
            href={finished && m.league.key !== "other" ? paths.league(m.league.slug) : paths.forecasts}
            cta="Все прогнозы"
          />
          <Board matches={sameDay} />
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: vs(m),
            sport: "Football",
            startDate: m.commenceTime,
            eventStatus: m.status === "off" ? "https://schema.org/EventPostponed" : "https://schema.org/EventScheduled",
            superEvent: { "@type": "SportsEvent", name: m.league.label },
            homeTeam: { "@type": "SportsTeam", name: m.home },
            awayTeam: { "@type": "SportsTeam", name: m.away },
            competitor: [
              { "@type": "SportsTeam", name: m.home },
              { "@type": "SportsTeam", name: m.away },
            ],
            url: `${site.url}${paths.match(m.slug)}`,
          }),
        }}
      />
      <Fine className="mt-12">Прогноз — это оценка шансов, а не гарантия результата. Коэффициенты меняются: проверяйте итоговый коэффициент в купоне букмекера. {site.warning}</Fine>
    </div>
  );
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone?: "live" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${tone === "live" ? "bg-loss text-white" : "bg-surface-2 text-fg-2 ring-1 ring-line"}`}>
      {tone === "live" && <span className="size-1.5 animate-pulse-dot rounded-full bg-white" aria-hidden />}
      {children}
    </span>
  );
}

/** After the final whistle: what happened next to what the market expected. */
function Outcome({ m, fair }: { m: Match; fair: Probs1x2 }) {
  const won = winnerOf(m.score!);
  const chance = fair[won];
  const fav = OUTCOMES.reduce((a, b) => (fair[a] >= fair[b] ? a : b));
  const note =
    won === fav
      ? `Рынок угадал: этот исход был самым вероятным (${pct(chance)}).`
      : chance < UPSET
        ? `Сенсация: рынок давал этому исходу всего ${pct(chance)}.`
        : `Фаворитом был другой исход, но у случившегося было ${pct(chance)}: такое случается примерно раз в ${Math.max(2, Math.round(1 / chance))} ${plural(Math.max(2, Math.round(1 / chance)), ["матч", "матча", "матчей"])}.`;
  return (
    <section className="mt-7 grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center" aria-label="Итог матча">
      <div className="card flex items-center gap-4 px-6 py-4">
        <span className="num text-[64px] leading-none font-bold">
          <FlipText text={score(m)} delay={100} />
        </span>
        <span className="text-sm text-muted">
          Итоговый
          <br />
          счёт
        </span>
      </div>
      <div className="card p-5">
        <p className="text-sm font-semibold text-fg-2">Что говорил рынок перед матчем</p>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
          {OUTCOMES.map((o) => (
            <div key={o} className={`rounded-lg px-1 py-1.5 ${o === won ? "ring-2 ring-fg ring-offset-2" : ""} ${probClass(fair[o])}`}>
              <p className="truncate text-[11px]">{o === "draw" ? "Ничья" : outcomeLabel(m, o)}</p>
              <p className="num text-2xl font-bold">{pct(fair[o])}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{note}</p>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3.5 ring-1 ring-line">
      <p className="truncate text-xs text-muted">{label}</p>
      <p className="num mt-0.5 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-subtle">{sub}</p>}
    </div>
  );
}

function ArticleLink({ slug }: { slug: string }) {
  const a = getArticle(slug);
  if (!a) return null;
  return (
    <Link href={paths.article(a.slug)} className="card group flex items-center justify-between gap-4 p-4 transition-colors hover:border-line-strong">
      <span className="min-w-0">
        <span className="block text-xs text-subtle">
          <span className="num text-sm font-bold text-fg-2">{a.cover.figure}</span> · {a.minutes} мин
        </span>
        <span className="block font-semibold group-hover:underline group-hover:decoration-hi group-hover:decoration-2 group-hover:underline-offset-4">{a.title}</span>
      </span>
      <span className="text-subtle transition group-hover:translate-x-[3px] group-hover:text-fg" aria-hidden>
        →
      </span>
    </Link>
  );
}

/** First paragraph: the answer to "who is the favourite" (or "what happened"), in one or two sentences. */
function lead(m: Match, fair: Probs1x2 | null): string {
  if (!fair) return `${m.league.label.replace(" УЕФА", "")}, ${dayMonth(m.commenceTime)}. Рынок по матчу ещё не сформировался: шансы появятся, когда букмекеры откроют линию.`;
  const line = `${m.home} — ${pct(fair.home)}, ничья — ${pct(fair.draw)}, ${m.away} — ${pct(fair.away)}.`;
  if (m.status === "finished" && m.score) {
    const won = winnerOf(m.score);
    const what = won === "draw" ? "вничью" : won === "home" ? "победой хозяев" : "победой гостей";
    return `Матч закончился ${what}, ${score(m)}. Перед игрой рынок давал такие шансы: ${line}`;
  }
  const v = verdict({ ...m, fair });
  return `${v ?? ""} Шансы по мировому рынку: ${line}`.trim();
}

/**
 * A few plain sentences built only from this match's numbers, so every page
 * says something specific instead of boilerplate.
 */
function summary(m: Match, fair: Probs1x2 | null, d: MatchDetail): string[] {
  const finished = m.status === "finished";
  const out = [
    finished
      ? `${m.league.label.replace(" УЕФА", "")}. Матч прошёл ${dayMonthYear(m.commenceTime)}.`
      : `${m.league.label.replace(" УЕФА", "")}. Матч начнётся ${dayMonth(m.commenceTime)} в ${mskTime(m.commenceTime)} по московскому времени.`,
  ];
  const hp = pointsPerGame(d.form.home), ap = pointsPerGame(d.form.away);
  if (hp !== null && ap !== null) {
    const f = (x: number) => x.toFixed(1).replace(".", ",");
    out.push(
      `Очки за игру в последних матчах: ${m.home} — ${f(hp)}, ${m.away} — ${f(ap)}.${Math.abs(hp - ap) >= 0.8 ? ` По форме заметно сильнее ${hp > ap ? m.home : m.away}.` : " По форме команды близки."}`,
    );
  }
  if (!fair) {
    out.push("Мировой рынок по этому матчу ещё не сформировался, поэтому шансов пока нет.");
    return out;
  }
  if (d.glicko) {
    const gap = d.glicko.home - fair.home;
    out.push(
      Math.abs(gap) < 0.06
        ? `Рейтинг Glicko-2 оценивает матч почти так же, как рынок: ${m.home} — ${pct(d.glicko.home)} на победу.`
        : `По рейтингу Glicko-2 расклад другой: ${m.home} — ${pct(d.glicko.home)}, ${m.away} — ${pct(d.glicko.away)}. Рейтинг не учитывает составы и мотивацию, а рынок учитывает.`,
    );
  }
  const o = d.goals.over25;
  if (o !== null) {
    out.push(
      o >= 0.55
        ? `Рынок ждёт результативную игру: шанс, что будет больше 2,5 гола, — ${pct(o)}.`
        : o <= 0.45
          ? `Рынок ждёт закрытую игру: шанс, что будет меньше 2,5 гола, — ${pct(1 - o)}.`
          : `Больше или меньше 2,5 гола — рынок видит почти поровну (${pct(o)} на больше).`,
    );
  }
  if (m.pari && !finished) {
    const good = OUTCOMES.filter((x) => isValue(m.pari!.odds[x], fair[x]));
    out.push(`Маржа легального букмекера на исход матча — ${(margin(m.pari.odds) * 100).toFixed(1).replace(".", ",")}%.`);
    out.push(
      good.length
        ? `Выше честной цены: ${good.map((x) => `${x === "draw" ? "ничья" : outcomeLabel(m, x)} по ${odds(m.pari!.odds[x])} (перевес ${(edge(m.pari!.odds[x], fair[x]) * 100).toFixed(1).replace(".", ",")}%)`).join(", ")}. Это преимущество на длинной дистанции, а не обещание результата.`
        : OUTCOMES.some((x) => isSuspect(m.pari!.odds[x], fair[x]))
          ? "Один из коэффициентов букмекера сильно расходится с рынком. Скорее всего, линия устарела: проверьте коэффициент в купоне."
          : "Все коэффициенты букмекера ниже честных: выгодной ставки на исход здесь нет.",
    );
  }
  return out;
}

/** The headline calls: result, goals, both teams to score. Wording stays probabilistic. */
function picks(m: Match, fair: Probs1x2, d: MatchDetail) {
  const max = Math.max(fair.home, fair.draw, fair.away);
  const fav = fair.home === max ? m.home : fair.away === max ? m.away : null;
  const items: { label: string; value: string; text: string; level?: string }[] = [
    max < 0.4 || !fav
      ? { label: "Исход", value: pct(max), text: "Равный матч: явного фаворита у рынка нет.", level: probClass(max) }
      : { label: "Исход", value: pct(max), text: `Фаворит — ${fav}. Такой шанс на победу даёт рынок.`, level: probClass(max) },
  ];
  const o = d.goals.over25;
  if (o !== null) {
    items.push(
      o >= 0.55
        ? { label: "Голы", value: pct(o), text: "Скорее больше 2,5 гола.", level: probClass(o) }
        : o <= 0.45
          ? { label: "Голы", value: pct(1 - o), text: "Скорее меньше 2,5 гола.", level: probClass(1 - o) }
          : { label: "Голы", value: "50/50", text: "Больше или меньше 2,5 гола — почти поровну." },
    );
  }
  const b = d.goals.btts;
  if (b !== null) {
    items.push(
      b >= 0.55
        ? { label: "Обе забьют", value: pct(b), text: "Скорее забьют обе команды.", level: probClass(b) }
        : b <= 0.45
          ? { label: "Обе забьют", value: pct(1 - b), text: "Скорее хотя бы одна команда не забьёт.", level: probClass(1 - b) }
          : { label: "Обе забьют", value: "50/50", text: "Забьют ли обе — почти поровну." },
    );
  }
  return items;
}
