import Link from "next/link";
import { BonusCard } from "@/components/BonusCard";
import { BookLogo } from "@/components/BookLogo";
import { BookmakerRow } from "@/components/BookmakerRow";
import { LocalTime } from "@/components/LocalTime";
import { OddsTable } from "@/components/OddsTable";
import { PhoneMockup } from "@/components/PhoneMockup";
import { SectionHeading } from "@/components/SectionHeading";
import { bookmakers, bookmakersByRating } from "@/lib/bookmakers";
import { bookMargin, formatOdds, formatPct } from "@/lib/odds/math";
import type { EventSummary } from "@/lib/odds/types";
import { getEvents, oddsSource } from "@/lib/odds/provider";
import { site } from "@/lib/site";

export const revalidate = 120;

const features = [
  { title: "Best price, tagged", body: "Every outcome is scanned across every book. The highest price gets the tag — you never leave value on the table.", span: "md:col-span-2" },
  { title: "Sure-bet radar", body: "When the best prices add up to less than 100%, we flag it and split your stake for a locked-in return.", span: "" },
  { title: "Margin X-ray", body: "See exactly how much each bookmaker keeps on every market, so you know who's giving you a fair deal.", span: "" },
  { title: "Offers worth taking", body: "Welcome bonuses ranked by real value, with the terms up front. No fine-print surprises.", span: "" },
  { title: "Built for your pocket", body: "A native iPhone app with every price, the sure-bet radar and your starred matches one tap away.", span: "md:col-span-2" },
];

const faqs = [
  { q: "Is tag.bet a bookmaker?", a: "No. We don't take bets or hold money. We compare prices from licensed bookmakers and link you to them." },
  { q: "How does tag.bet make money?", a: "Some bookmakers pay us a commission when you open an account through our links. It never affects the odds shown or which price gets tagged as best — that's pure maths." },
  { q: "How fresh are the odds?", a: "Prices refresh every few minutes. Always confirm the final price on the bookmaker's bet slip before you place a bet." },
  { q: "What is a sure bet?", a: "When different bookmakers disagree enough, backing every outcome at the best price can guarantee a small profit. They're rare, disappear fast and bookmakers may limit accounts that take them." },
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
                {oddsSource() === "live" ? "LIVE" : "DEMO"}
              </span>
              {bookmakers.length} books · {events.length} events priced right now →
            </Link>
            <h1 className="text-gradient text-5xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              Every line.
              <br />
              One tag.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-pretty text-muted">
              tag.bet scans the world&apos;s top sportsbooks and tags the best price on every outcome. Same bet, bigger payout — in one tap.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/odds" className="btn-primary h-11 px-6">
                Compare odds now
              </Link>
              <Link href="#app" className="btn-ghost h-11 px-6">
                Get the iPhone app
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              <Stat label="Sportsbooks" value={String(bookmakers.length)} />
              <Stat label="Avg book margin" value={formatPct(avgBookMargin)} />
              <Stat label="Margin at best price" value={formatPct(avgBestMargin)} accent />
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
                  {hero.home} <span className="text-subtle">vs</span> {hero.away}
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
                  <span className="text-accent/80">Best-price margin</span>
                  <span className="font-mono font-semibold text-accent">{formatPct(hero.bestMargin)}</span>
                </div>
                <div className="absolute -top-3 -right-3 rotate-6 rounded-lg bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-accent-ink shadow-lg">
                  TAGGED
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-subtle">
                Average bookmaker margin on this match {formatPct(avgMargin(hero))} → at tagged prices{" "}
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
        <SectionHeading eyebrow="Odds board" title="The best price for every match, tagged." sub="Green is the highest price on the market right now. Tap any match to see every bookmaker side by side." href="/odds" cta="All odds" />
        <OddsTable events={events.slice(0, 8)} />
      </section>

      {/* Features bento */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Why tag.bet" title="Betting has an information problem. We fixed it." />
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className={`card relative overflow-hidden p-7 ${f.span}`}>
              <span className="font-mono text-xs text-subtle">0{i + 1}</span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{f.body}</p>
              {i === 0 && <div className="absolute -right-10 -bottom-16 size-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />}
            </div>
          ))}
          <div className="card flex flex-col justify-between bg-gradient-to-br from-violet/15 to-transparent p-7">
            <p className="text-sm text-muted">Responsible by design</p>
            <p className="mt-6 text-sm leading-relaxed">
              Deposit-limit reminders, cool-off links and zero dark patterns. We&apos;d rather you bet smart than bet more.
            </p>
            <Link href="/responsible-gambling" className="mt-4 text-sm text-accent hover:underline">
              Our approach →
            </Link>
          </div>
        </div>
      </section>

      {/* Bookmakers */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Rankings" title="Top-rated sportsbooks" sub="Ranked on price quality, payout speed, markets and how they treat winning players." href="/bookmakers" cta="All reviews" />
        <div className="card divide-y divide-line overflow-hidden">
          {top.slice(0, 5).map((b, i) => (
            <BookmakerRow key={b.slug} b={b} rank={i + 1} source="home-rank" />
          ))}
        </div>
      </section>

      {/* Bonuses */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="Welcome offers" title="Bonuses worth your time" href="/bonuses" cta="All bonuses" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top
            .filter((b) => b.bonus.code || !b.bonus.headline.startsWith("Best odds"))
            .slice(0, 3)
            .map((b) => (
              <BonusCard key={b.slug} b={b} source="home-bonus" />
            ))}
        </div>
      </section>

      {/* App */}
      <section id="app" className="container-x scroll-mt-20 pt-28">
        <div className="card relative grid items-center gap-12 overflow-hidden px-6 py-14 sm:px-12 lg:grid-cols-2">
          <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="relative">
            <p className="eyebrow">tag.bet for iPhone</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">The sharpest line is in your pocket.</h2>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              {["Best price tagged on every match", "Sure-bet radar with stake splitter", "Star the matches you follow", "Native, fast, no ads, no clutter"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-full bg-accent/15 text-[10px] text-accent">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              {site.appStoreUrl ? (
                <a href={site.appStoreUrl} className="btn-primary h-12 px-6">
                  Download on the App Store
                </a>
              ) : (
                <span className="btn-ghost h-12 cursor-default px-6">Coming soon to the App Store</span>
              )}
            </div>
          </div>
          <div className="relative">
            <PhoneMockup events={events} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pt-28">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." />
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
