import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { BonusCard } from "@/components/BonusCard";
import { BookmakerRow } from "@/components/BookmakerRow";
import { Features } from "@/components/Features";
import { LocalTime } from "@/components/LocalTime";
import { FlipText } from "@/components/FlipText";
import { FlipMark } from "@/components/Logo";
import { MatchTable } from "@/components/MatchTable";
import { ProbBar } from "@/components/ProbBar";
import { SectionHeading } from "@/components/SectionHeading";
import { BONUS_TERMS, bookmakersByRating } from "@/lib/bookmakers";
import { dataSource, getMatches } from "@/lib/data";
import { leagues } from "@/lib/leagues";
import { edge, hasValue, odds, OUTCOMES, outcomeLabel, plural, verdict, type Match } from "@/lib/matches";
import { articles } from "@/content/articles";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const revalidate = 300;

const faqs = [
  { q: "Откуда берутся шансы?", a: "Из коэффициентов крупных мировых букмекеров. Мы убираем из них маржу и усредняем — получается оценка рынка, которая обычно точнее любого эксперта." },
  { q: "Что значит жёлтый коэффициент?", a: "Коэффициент PARI выше справедливого: на длинной дистанции такие ставки выгоднее средних. Это не гарантия выигрыша в конкретном матче." },
  { q: "tag.bet — это букмекер?", a: "Нет. Мы не принимаем ставки и не храним деньги. Мы разбираем матчи и рассказываем о легальных букмекерах." },
  { q: "Как tag.bet зарабатывает?", a: "Некоторые букмекеры платят нам за привлечённых клиентов. Такие ссылки помечены как реклама. На расчёт шансов это не влияет." },
];

export default async function Home() {
  const matches = await getMatches();
  const top = bookmakersByRating();
  const hero = pickHero(matches);
  const topCount = matches.filter((m) => m.league.key !== "other").length;
  const otherCount = matches.length - topCount;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute top-[-20%] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]" aria-hidden />
        <div className="container-x relative grid items-center gap-14 pt-20 pb-24 lg:grid-cols-[1.1fr_1fr] lg:pt-28">
          <div className="animate-rise">
            <Link href="/matches" className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pr-3 pl-1.5 text-xs text-muted backdrop-blur hover:text-fg">
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-accent">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" />
                {dataSource() === "live" ? "LIVE" : "ДЕМО"}
              </span>
              {topCount
                ? `${topCount} ${plural(topCount, ["матч", "матча", "матчей"])} топ-лиг на неделе${otherCount ? ` · ещё ${otherCount} в других турнирах` : ""}`
                : `${matches.length} ${plural(matches.length, ["матч", "матча", "матчей"])} на неделе`}{" "}
              →
            </Link>
            <h1 className="text-gradient text-5xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              Разбор матча
              <br />
              за 30 секунд.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-pretty text-muted">
              Реальные шансы команд по мировому рынку и коэффициенты легального букмекера рядом. Сразу видно, где коэффициент
              выгоднее справедливого.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/matches" className="btn-primary h-11 px-6">
                Смотреть матчи
              </Link>
              <Link href="/bookmakers" className="btn-ghost h-11 px-6">
                Рейтинг букмекеров
              </Link>
            </div>
          </div>
          {hero ? <HeroCard m={hero} /> : <EmptyHero />}
        </div>
      </section>

      {/* Leagues strip */}
      <section className="border-y border-line bg-surface/40">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-5">
          {leagues.map((l) => (
            <Link key={l.key} href={`/matches?league=${l.key}`} className="text-sm text-subtle transition hover:text-fg">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Matches */}
      <section className="container-x pt-24">
        <SectionHeading eyebrow="Ближайшие матчи" title="Шансы и коэффициенты рядом." sub="Полоска — вероятности П1 / X / П2 по мировому рынку. Справа коэффициенты PARI; жёлтые выше справедливых." href="/matches" cta="Все матчи" />
        <MatchTable matches={matches.slice(0, 8)} />
      </section>

      {/* Features */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Зачем tag.bet" title="Ставить — ваше решение. Понимать шансы — наша работа." />
        <Features />
      </section>

      {/* Bookmakers */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Рейтинг" title="Лучшие легальные букмекеры" sub="Оцениваем коэффициенты, скорость выплат, линию и удобство." href="/bookmakers" cta="Весь рейтинг" />
        <div className="card divide-y divide-line overflow-hidden">
          {top.slice(0, 5).map((b, i) => (
            <BookmakerRow key={b.slug} b={b} rank={i + 1} source="home-rank" />
          ))}
        </div>
      </section>

      {/* Bonuses */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Бонусы" title="Предложения для новых игроков" href="/bonuses" cta="Все бонусы" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.slice(0, 3).map((b) => (
            <BonusCard key={b.slug} b={b} source="home-bonus" />
          ))}
        </div>
        <p className="mt-4 text-xs text-subtle">{BONUS_TERMS}</p>
      </section>

      {/* Learn */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Разобраться" title="Как букмекер считает коэффициенты." sub="Короткие статьи с формулами и примерами — и калькуляторы, чтобы проверить на своих цифрах." href="/articles" cta="Все статьи" />
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {["marzha-bukmekera", "valuinaya-stavka", "ekspress-matematika"].map((slug) => {
            const a = articles.find((x) => x.slug === slug)!;
            return <ArticleCard key={slug} a={a} />;
          })}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm text-subtle">Калькуляторы:</span>
          {tools.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-line-strong hover:text-fg">
              {t.short}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Вопросы" title="Частые вопросы" />
        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map((f) => (
            <details key={f.q} className="card group p-5 open:border-line-strong">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-subtle transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-xs text-subtle">{site.warning}</p>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            }),
          }}
        />
      </section>
    </>
  );
}

function EmptyHero() {
  return (
    <div className="card flex animate-rise flex-col items-center justify-center gap-4 p-10 text-center [animation-delay:150ms]">
      <FlipMark className="size-16" />
      <p className="text-lg font-semibold tracking-tight">Линия на ближайшие дни ещё не открыта</p>
      <p className="max-w-xs text-sm text-muted">Как только букмекеры выставят коэффициенты на матчи топ-лиг, разбор появится здесь.</p>
    </div>
  );
}

function HeroCard({ m }: { m: Match }) {
  return (
    <div className="animate-rise [animation-delay:150ms]">
      <Link href={`/matches/${m.id}`} className="card relative block p-6 shadow-2xl shadow-black/60 transition hover:border-line-strong">
        <div className="flex items-center justify-between text-xs text-subtle">
          <span>{m.league.label}</span>
          <LocalTime iso={m.commenceTime} />
        </div>
        <p className="mt-2 text-xl font-semibold tracking-tight">
          {m.home} <span className="text-subtle">—</span> {m.away}
        </p>
        {verdict(m) && <p className="mt-1 text-sm text-muted">{verdict(m)}</p>}
        {m.fair && (
          <div className="mt-6">
            <p className="mb-2 text-xs text-subtle">Шансы по мировому рынку</p>
            <ProbBar p={m.fair} />
          </div>
        )}
        {m.pari && (
          <div className="mt-6">
            <p className="mb-2 text-xs text-subtle">Коэффициенты PARI</p>
            <div className="grid grid-cols-3 gap-2">
              {OUTCOMES.map((o, i) => {
                const price = m.pari!.odds[o];
                const good = m.fair ? edge(price, m.fair[o]) > 0 : false;
                return (
                  <div key={o} className={`rounded-xl border p-2.5 text-center ${good ? "border-accent/40 bg-accent/10" : "border-line bg-surface-2"}`}>
                    <p className="truncate text-[11px] text-subtle">{outcomeLabel(m, o)}</p>
                    <p className={`text-lg font-semibold tabular-nums ${good ? "text-accent" : ""}`}>
                      <FlipText text={odds(price)} delay={700 + i * 180} />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <span className="mt-6 inline-block text-sm text-accent">Полный разбор →</span>
      </Link>
    </div>
  );
}

/**
 * The showcase match: top leagues first, then one PARI prices above fair, then any
 * with market chances. Skips kick-offs in the next 30 minutes so it isn't stale on arrival.
 */
function pickHero(matches: Match[]): Match | undefined {
  const soon = Date.now() + 30 * 60_000;
  const pool = matches.filter((m) => m.fair && Date.parse(m.commenceTime) > soon);
  const score = (m: Match) => (m.league.key !== "other" ? 4 : 0) + (m.pari ? 2 : 0) + (hasValue(m) ? 1 : 0);
  return [...pool].sort((a, b) => score(b) - score(a) || a.commenceTime.localeCompare(b.commenceTime))[0] ?? matches[0];
}
