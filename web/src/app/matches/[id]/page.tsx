import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlipText } from "@/components/FlipText";
import { FormColumn, HeadToHead, MissingList, Verdict } from "@/components/ForecastBlocks";
import { pointsPerGame } from "@/lib/forecast";
import { LocalTime } from "@/components/LocalTime";
import { OutboundButton } from "@/components/OutboundButton";
import { ProbBar } from "@/components/ProbBar";
import { getBookmaker } from "@/lib/bookmakers";
import { getMatch, getMatchDetail } from "@/lib/data";
import { getArticle } from "@/content/articles";
import type { MatchDetail } from "@/lib/data";
import { edge, isSuspect, isValue, margin, odds, OUTCOMES, outcomeLabel, pct, verdict, type Match, type Probs1x2 } from "@/lib/matches";
import { site } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getMatch((await params).id);
  if (!m) return { title: "Матч не найден" };
  const chances = m.fair ? ` Шансы: ${m.home} ${pct(m.fair.home)}, ничья ${pct(m.fair.draw)}, ${m.away} ${pct(m.fair.away)}.` : "";
  return {
    title: `Прогноз на матч ${m.home} — ${m.away} ${dayRu(m.commenceTime)}: шансы, форма, статистика`,
    description: `${m.league.label}, ${dayRu(m.commenceTime)}.${chances} Форма команд, личные встречи, кто не сыграет и коэффициенты.`,
    alternates: { canonical: `/matches/${m.id}` },
  };
}

export default async function MatchPage({ params }: Props) {
  const m = await getMatch((await params).id);
  if (!m) notFound();
  const d = await getMatchDetail(m);
  const fair = d.world ?? m.fair;
  const pari = getBookmaker("pari")!;

  return (
    <div className="container-x pt-12">
      <Breadcrumbs
        items={[
          { label: "Прогнозы", href: "/matches" },
          { label: `${m.home} — ${m.away}`, href: `/matches/${m.id}` },
        ]}
      />

      <header className="mt-6">
        <p className="text-sm text-subtle">
          {m.league.label} · <LocalTime iso={m.commenceTime} />
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Прогноз на матч {m.home} <span className="text-subtle">—</span> {m.away}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">Вывод по цифрам рынка и статистике, а не мнение эксперта. Это оценка шансов, а не гарантия результата.</p>
      </header>

      {fair && (
        <section className="mt-8" aria-labelledby="verdict">
          <h2 id="verdict" className="sr-only">
            Наш вывод
          </h2>
          <Verdict items={picks(m, fair, d)} />
        </section>
      )}

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {/* Market chances */}
        <section className="card p-6">
          <h2 className="font-medium">Шансы по мировому рынку</h2>
          <p className="mt-1 text-sm text-muted">
            {d.worldBooks > 0 ? `Среднее по ${d.worldBooks} международным букмекерам` : "Средний коэффициент рынка"}, маржа убрана.
          </p>
          {fair ? (
            <div className="mt-6 space-y-4">
              <ProbBar p={fair} />
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                {OUTCOMES.map((o) => (
                  <div key={o} className="rounded-xl bg-surface-2 p-3">
                    <p className="truncate text-xs text-subtle">{outcomeLabel(m, o)}</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{pct(fair[o])}</p>
                    <p className="text-xs text-subtle tabular-nums">справедл. {odds(1 / fair[o])}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-subtle">Рынок по матчу ещё не открылся.</p>
          )}
        </section>

        {/* PARI */}
        <section className="card p-6">
          <h2 className="font-medium">Коэффициенты букмекера</h2>
          <p className="mt-1 text-sm text-muted">Легальный букмекер. Жёлтым — коэффициент выше справедливого.</p>
          {m.pari ? (
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {OUTCOMES.map((o, i) => {
                const price = m.pari!.odds[o];
                const value = fair ? edge(price, fair[o]) : null;
                const good = fair ? isValue(price, fair[o]) : false;
                const suspect = fair ? isSuspect(price, fair[o]) : false;
                return (
                  <div key={o} className={`rounded-xl border p-3 ${good ? "border-accent/40 bg-accent/10" : "border-line bg-surface-2"}`}>
                    <p className="truncate text-xs text-subtle">{outcomeLabel(m, o)}</p>
                    <p className={`mt-1 text-2xl font-semibold tabular-nums ${good ? "text-accent" : ""}`}>
                      <FlipText text={odds(price)} delay={200 + i * 180} />
                    </p>
                    {value !== null && (
                      <p className={`text-xs tabular-nums ${good ? "text-accent" : "text-subtle"}`} title={suspect ? "Слишком большой разрыв с рынком: скорее всего, линия устарела. Не отмечаем как выгодный." : undefined}>
                        {suspect ? "проверяем" : `${value > 0 ? "+" : ""}${(value * 100).toFixed(1)}%`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-sm text-subtle">Букмекер пока не открыл линию на этот матч.</p>
          )}
          <div className="mt-6">
            <OutboundButton b={pari} source={`match-${m.id}`} label="Сделать ставку в PARI" className="h-10 w-full" />
          </div>
        </section>
      </div>

      {(d.form.home.length > 0 || d.form.away.length > 0) && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Форма команд</h2>
          <p className="mt-1 text-sm text-muted">Последние матчи во всех турнирах.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormColumn team={m.home} games={d.form.home} />
            <FormColumn team={m.away} games={d.form.away} />
          </div>
        </section>
      )}

      {d.h2h.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Личные встречи</h2>
          <div className="mt-5">
            <HeadToHead games={d.h2h} home={m.home} />
          </div>
        </section>
      )}

      {d.missing.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Кто не сыграет</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MissingList team={m.home} list={d.missing.filter((p) => p.team === "home")} />
            <MissingList team={m.away} list={d.missing.filter((p) => p.team === "away")} />
          </div>
        </section>
      )}

      {d.glicko && (
        <section className="card mt-4 p-6">
          <h2 className="font-medium">Сила команд по рейтингу</h2>
          <p className="mt-1 text-sm text-muted">Независимая оценка по рейтингу Glicko-2 — по результатам прошлых матчей, без учёта коэффициентов.</p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <Stat label={m.home} value={pct(d.glicko.home)} sub={d.glicko.homeXg !== null ? `xG ${d.glicko.homeXg.toFixed(2)}` : undefined} />
            {d.glicko.draw !== null && <Stat label="Ничья" value={pct(d.glicko.draw)} />}
            <Stat label={m.away} value={pct(d.glicko.away)} sub={d.glicko.awayXg !== null ? `xG ${d.glicko.awayXg.toFixed(2)}` : undefined} />
          </div>
        </section>
      )}

      <section className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="max-w-2xl space-y-3 leading-relaxed text-muted">
          <h2 className="text-xl font-semibold tracking-tight text-fg">Коротко о матче</h2>
          {summary(m, fair, d).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-sm text-subtle">Как мы это считаем</p>
          {explainers.map((a) => (
            <ArticleLink key={a!.slug} slug={a!.slug} />
          ))}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Link href="/methodology" className="text-accent hover:underline">
              Методика целиком →
            </Link>
            <Link href="/tools/marzha" className="text-muted hover:text-fg">
              Посчитать маржу самому →
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `${m.home} — ${m.away}`,
            sport: "Football",
            startDate: m.commenceTime,
            eventStatus: "https://schema.org/EventScheduled",
            superEvent: { "@type": "SportsEvent", name: m.league.label },
            homeTeam: { "@type": "SportsTeam", name: m.home },
            awayTeam: { "@type": "SportsTeam", name: m.away },
            url: `${site.url}/matches/${m.id}`,
          }),
        }}
      />
      <p className="mt-8 text-xs text-subtle">Коэффициенты меняются. Проверяйте итоговый коэффициент в купоне букмекера. {site.warning}</p>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <p className="truncate text-xs text-subtle">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-subtle tabular-nums">{sub}</p>}
    </div>
  );
}

const explainers = ["koefficient-v-veroyatnost", "valuinaya-stavka"].map(getArticle).filter(Boolean);

function ArticleLink({ slug }: { slug: string }) {
  const a = getArticle(slug)!;
  return (
    <Link href={`/articles/${a.slug}`} className="group flex items-center justify-between gap-4 rounded-xl border border-line p-4 transition hover:border-line-strong">
      <span className="min-w-0">
        <span className="block text-xs text-subtle">
          {a.cover.figure} · {a.minutes} мин
        </span>
        <span className="block font-medium group-hover:text-accent">{a.title}</span>
      </span>
      <span className="text-muted">→</span>
    </Link>
  );
}

/** "5 октября" in Moscow time, for titles. */
function dayRu(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "Europe/Moscow" });
}

function timeRu(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" });
}

/**
 * A few plain sentences built only from this match's numbers, so every page
 * says something specific instead of boilerplate.
 */
function summary(m: Match, fair: Probs1x2 | null, d: MatchDetail): string[] {
  const out = [`${m.league.label}. Матч начнётся ${dayRu(m.commenceTime)} в ${timeRu(m.commenceTime)} по Москве.`];
  const hp = pointsPerGame(d.form.home), ap = pointsPerGame(d.form.away);
  if (hp !== null && ap !== null) {
    const f = (x: number) => x.toFixed(1).replace(".", ",");
    out.push(`В последних матчах ${m.home} набирает ${f(hp)} очка за игру, ${m.away} — ${f(ap)}.${Math.abs(hp - ap) >= 0.8 ? ` По форме заметно сильнее ${hp > ap ? m.home : m.away}.` : ""}`);
  }
  if (!fair) {
    out.push("Мировой рынок по этому матчу ещё не сформировался — шансы появятся, когда букмекеры откроют линию.");
    return out;
  }
  out.push(`По мировому рынку шансы такие: ${m.home} — ${pct(fair.home)}, ничья — ${pct(fair.draw)}, ${m.away} — ${pct(fair.away)}. ${verdict({ ...m, fair }) ?? ""}`.trim());
  if (d.glicko) {
    const gap = d.glicko.home - fair.home;
    out.push(
      Math.abs(gap) < 0.06
        ? `Рейтинг Glicko-2 оценивает матч так же, как рынок: ${m.home} — ${pct(d.glicko.home)}.`
        : `Рейтинг Glicko-2 ${gap > 0 ? `сильнее верит в ${m.home}` : `сильнее верит в ${m.away}`}: ${m.home} — ${pct(d.glicko.home)}, ${m.away} — ${pct(d.glicko.away)}. Рейтинг не учитывает составы и мотивацию, рынок — учитывает.`,
    );
  }
  if (m.pari) {
    const good = OUTCOMES.filter((o) => isValue(m.pari!.odds[o], fair[o]));
    out.push(`Маржа букмекера на исход матча — ${(margin(m.pari.odds) * 100).toFixed(1).replace(".", ",")}%.`);
    out.push(
      good.length
        ? `Выше справедливой цены: ${good.map((o) => `${outcomeLabel(m, o)} по ${odds(m.pari!.odds[o])} (${(edge(m.pari!.odds[o], fair[o]) * 100).toFixed(1).replace(".", ",")}%)`).join(", ")}. Это перевес на длинной дистанции, а не гарантия результата.`
        : OUTCOMES.some((o) => isSuspect(m.pari!.odds[o], fair[o]))
          ? "Один из коэффициентов букмекера сильно расходится с рынком — скорее всего, линия устарела. Проверьте итоговый коэффициент в купоне."
          : "Все коэффициенты легального букмекера ниже справедливых: явно выгодной ставки на исход здесь нет.",
    );
  }
  return out;
}

/** The three headline calls: result, goals, both teams to score. Wording stays probabilistic. */
function picks(m: Match, fair: Probs1x2, d: MatchDetail) {
  const p = (x: number) => pct(x);
  const max = Math.max(fair.home, fair.draw, fair.away);
  const fav = fair.home === max ? m.home : fair.away === max ? m.away : null;
  const items = [
    max < 0.4 || !fav
      ? { label: "Исход", value: p(max), text: "Равный матч: у рынка нет явного фаворита." }
      : { label: "Исход", value: p(max), text: `Фаворит — ${fav}. Такой шанс на победу даёт рынок.` },
  ];
  const o = d.goals.over25;
  if (o !== null) {
    items.push(
      o >= 0.55
        ? { label: "Голы", value: p(o), text: "Скорее больше 2,5 гола: результативный матч." }
        : o <= 0.45
          ? { label: "Голы", value: p(1 - o), text: "Скорее меньше 2,5 гола: закрытая игра." }
          : { label: "Голы", value: "50/50", text: "Больше или меньше 2,5 гола — примерно поровну." },
    );
  }
  const b = d.goals.btts;
  if (b !== null) {
    items.push(
      b >= 0.55
        ? { label: "Обе забьют", value: p(b), text: "Скорее забьют обе команды." }
        : b <= 0.45
          ? { label: "Обе забьют", value: p(1 - b), text: "Скорее хотя бы одна команда останется без гола." }
          : { label: "Обе забьют", value: "50/50", text: "Забьют ли обе — поровну." },
    );
  }
  return items;
}
