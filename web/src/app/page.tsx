import Link from "next/link";
import { BonusCard } from "@/components/BonusCard";
import { BookLogo } from "@/components/BookLogo";
import { BookmakerRow } from "@/components/BookmakerRow";
import { LocalTime } from "@/components/LocalTime";
import { OddsTable } from "@/components/OddsTable";
import { SectionHeading } from "@/components/SectionHeading";
import { bookmakers, bookmakersByRating } from "@/lib/bookmakers";
import { bookMargin, formatOdds, formatPct } from "@/lib/odds/math";
import { getEvents, oddsSource } from "@/lib/odds/provider";
import type { EventSummary } from "@/lib/odds/types";
import { site } from "@/lib/site";

export const revalidate = 120;

const features = [
  { title: "Лучший коэффициент — отмечен", body: "Каждый исход сравниваем у всех букмекеров. Самая высокая цена подсвечена — та же ставка, больше выплата.", span: "md:col-span-2" },
  { title: "Вилки", body: "Когда лучшие коэффициенты в сумме дают меньше 100%, мы это отмечаем и считаем, как распределить сумму.", span: "" },
  { title: "Маржа букмекера", body: "Показываем, сколько каждая контора закладывает в линию, — видно, кто даёт честную цену.", span: "" },
  { title: "Бонусы без мелкого шрифта", body: "Ключевые условия — прямо на карточке, до перехода на сайт букмекера.", span: "" },
  { title: "Только легальные букмекеры", body: "Все конторы на сайте имеют лицензию ФНС России. Никаких офшоров.", span: "md:col-span-2" },
];

const faqs = [
  { q: "tag.bet — это букмекер?", a: "Нет. Мы не принимаем ставки и не храним деньги. Мы сравниваем коэффициенты легальных российских букмекеров и рассказываем о них." },
  { q: "Как tag.bet зарабатывает?", a: "Некоторые букмекеры платят нам за привлечённых клиентов. Такие ссылки помечены как реклама. На коэффициенты и на то, какая цена отмечена как лучшая, это не влияет — это просто математика." },
  { q: "Насколько свежие коэффициенты?", a: "Коэффициенты обновляются регулярно, но линия меняется постоянно. Перед ставкой всегда проверяйте итоговый коэффициент в купоне букмекера." },
  { q: "Что такое вилка?", a: "Ситуация, когда разные букмекеры оценивают матч настолько по-разному, что ставки на все исходы по лучшим коэффициентам дают небольшую гарантированную прибыль. Вилки редки, быстро исчезают, а букмекеры могут ограничивать таких игроков." },
];

export default async function Home() {
  const events = await getEvents();
  const top = bookmakersByRating();
  const hero = events.find((e) => e.outcomes.length === 3) ?? events[0];
  const avgBookMargin = bookmakers.reduce((s, b) => s + b.avgMargin, 0) / bookmakers.length;
  const avgBestMargin = events.length ? events.reduce((s, e) => s + Math.max(e.bestMargin, -0.05), 0) / events.length : 0;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute top-[-20%] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-violet/15 blur-[120px]" aria-hidden />
        <div className="container-x relative grid items-center gap-14 pt-20 pb-24 lg:grid-cols-[1.15fr_1fr] lg:pt-28">
          <div className="animate-rise">
            <Link href="/odds" className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pr-3 pl-1.5 text-xs text-muted backdrop-blur hover:text-fg">
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-accent">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" />
                {oddsSource() === "live" ? "LIVE" : "ДЕМО"}
              </span>
              {bookmakers.length} букмекеров · {events.length} матчей в линии →
            </Link>
            <h1 className="text-gradient text-5xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              Лучший коэффициент.
              <br />
              С одного взгляда.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-pretty text-muted">
              tag.bet сравнивает линии легальных российских букмекеров и отмечает самую высокую цену на каждый исход. Та же
              ставка — больше выплата.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/odds" className="btn-primary h-11 px-6">
                Сравнить коэффициенты
              </Link>
              <Link href="/bookmakers" className="btn-ghost h-11 px-6">
                Рейтинг букмекеров
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              <Stat label="Букмекеров" value={String(bookmakers.length)} />
              <Stat label="Средняя маржа" value={formatPct(avgBookMargin)} />
              <Stat label="Маржа по лучшим ценам" value={formatPct(avgBestMargin)} accent />
            </dl>
          </div>

          {hero && (
            <div className="animate-rise [animation-delay:150ms]">
              <div className="card relative p-5 shadow-2xl shadow-black/60">
                <div className="flex items-center justify-between text-xs text-subtle">
                  <span>{hero.league}</span>
                  <LocalTime iso={hero.commenceTime} />
                </div>
                <p className="mt-2 text-lg font-semibold tracking-tight">
                  {hero.home} <span className="text-subtle">—</span> {hero.away}
                </p>
                <div className="mt-5 space-y-1.5">
                  {hero.books.slice(0, 6).map((book) => (
                    <div key={book.bookmaker} className="grid grid-cols-[1.5rem_1fr_repeat(3,3.75rem)] items-center gap-2">
                      <BookLogo slug={book.bookmaker} size="sm" />
                      <span className="truncate text-xs text-muted">{bookmakers.find((b) => b.slug === book.bookmaker)?.name}</span>
                      {hero.outcomes.map((o) => {
                        const isBest = hero.best.find((b) => b.outcome === o)?.bookmaker === book.bookmaker;
                        const price = book.prices[o];
                        return (
                          <span key={o} className={`odds-pill min-w-0 py-1 text-xs ${isBest ? "odds-pill-best" : "text-muted"}`}>
                            {price ? formatOdds(price) : "—"}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3 text-sm">
                  <span className="text-accent/80">Маржа по лучшим ценам</span>
                  <span className="font-mono font-semibold text-accent">{formatPct(hero.bestMargin)}</span>
                </div>
                <div className="absolute -top-3 -right-3 rotate-6 rounded-lg bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-accent-ink shadow-lg">
                  ЛУЧШАЯ ЦЕНА
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-subtle">
                Средняя маржа букмекеров на этот матч {formatPct(avgMargin(hero))} → по отмеченным ценам{" "}
                <span className="text-accent">{formatPct(hero.bestMargin)}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Logos strip */}
      <section className="border-y border-line bg-surface/40">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6">
          {bookmakers.map((b) => (
            <Link key={b.slug} href={`/bookmakers/${b.slug}`} className="flex items-center gap-2 text-sm text-subtle transition hover:text-fg">
              <BookLogo slug={b.slug} size="sm" /> {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Odds */}
      <section className="container-x pt-24">
        <SectionHeading eyebrow="Линия" title="Лучшая цена на каждый матч." sub="Зелёным отмечен самый высокий коэффициент на рынке. Нажмите на матч, чтобы сравнить всех букмекеров." href="/odds" cta="Все матчи" />
        <OddsTable events={events.slice(0, 8)} />
      </section>

      {/* Features bento */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Зачем tag.bet" title="Разница в коэффициентах — это ваши деньги." />
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className={`card relative overflow-hidden p-7 ${f.span}`}>
              <h3 className="text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
          <div className="card flex flex-col justify-between bg-gradient-to-br from-violet/15 to-transparent p-7">
            <p className="text-sm text-muted">Ответственная игра</p>
            <p className="mt-6 text-sm leading-relaxed">Лимиты, паузы и честные слова о рисках. Мы за то, чтобы ставить с умом, а не больше.</p>
            <Link href="/responsible-gambling" className="mt-4 text-sm text-accent hover:underline">
              Наш подход →
            </Link>
          </div>
        </div>
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className={`mt-1 font-mono text-xl tabular-nums ${accent ? "text-accent" : ""}`}>{value}</dd>
    </div>
  );
}

function avgMargin(e: EventSummary): number {
  const margins = e.books.map((b) => bookMargin(b, e.outcomes)).filter((m): m is number => m !== null);
  return margins.reduce((a, b) => a + b, 0) / Math.max(1, margins.length);
}
