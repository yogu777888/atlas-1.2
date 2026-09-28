import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookLogo } from "@/components/BookLogo";
import { Rating } from "@/components/Rating";
import { bookmakers, getBookmaker, goLink } from "@/lib/bookmakers";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return bookmakers.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = getBookmaker((await params).slug);
  if (!b) return {};
  return {
    title: `${b.name} review ${new Date().getFullYear()}: odds, bonus & payouts`,
    description: `${b.name} rated ${b.rating}/5. ${b.bonus.headline}. Average margin ~${(b.avgMargin * 100).toFixed(1)}%, payouts ${b.payout}.`,
    alternates: { canonical: `/bookmakers/${b.slug}` },
  };
}

export default async function BookmakerPage({ params }: Props) {
  const b = getBookmaker((await params).slug);
  if (!b) notFound();

  const facts = [
    { k: "Rating", v: <Rating value={b.rating} /> },
    { k: "Avg. margin", v: `~${(b.avgMargin * 100).toFixed(1)}%` },
    { k: "Payout speed", v: b.payout },
    { k: "Min. deposit", v: b.minDeposit },
    { k: "License", v: b.license },
    { k: "Founded", v: String(b.founded) },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "Organization", name: b.name, url: b.homepage },
    author: { "@type": "Organization", name: site.name },
    reviewRating: { "@type": "Rating", ratingValue: b.rating, bestRating: 5 },
  };

  return (
    <div className="container-x pt-12">
      <Link href="/bookmakers" className="text-sm text-muted hover:text-fg">
        ← All bookmakers
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex items-center gap-4">
            <BookLogo slug={b.slug} size="lg" />
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">{b.name}</h1>
              <p className="mt-1 text-sm text-muted">{b.features.join(" · ")}</p>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.k} className="bg-surface p-4">
                <dt className="text-xs text-subtle">{f.k}</dt>
                <dd className="mt-1 font-mono text-sm">{f.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <p className="font-medium text-accent">What we like</p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {b.pros.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="text-accent">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <p className="font-medium text-danger">Watch out for</p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {b.cons.map((c) => (
                  <li key={c} className="flex gap-2.5">
                    <span className="text-danger">−</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 max-w-2xl space-y-4 leading-relaxed text-muted">
            <h2 className="text-xl font-semibold tracking-tight text-fg">Verdict</h2>
            <p>
              {b.name} runs an average match-winner margin of around {(b.avgMargin * 100).toFixed(1)}%
              {b.avgMargin <= 0.03 ? ", which puts it among the sharpest prices anywhere" : b.avgMargin <= 0.05 ? ", which is competitive for a mainstream book" : ", so it pays to compare before you bet"}.
              {" "}{b.pros[0]}. The main trade-off: {b.cons[0].toLowerCase()}.
            </p>
            <p>
              Use tag.bet to check whether {b.name} actually has the best price on the match you care about — on any given game, a
              different book often does.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full opacity-25 blur-3xl" style={{ background: b.color }} />
            <p className="eyebrow">Welcome offer</p>
            <p className="mt-3 text-2xl leading-tight font-semibold tracking-tight">{b.bonus.headline}</p>
            <p className="mt-2 text-sm text-muted">{b.bonus.detail}</p>
            {b.bonus.code && (
              <p className="mt-4 rounded-lg border border-dashed border-line-strong px-3 py-2 text-center font-mono text-sm">
                <span className="text-subtle">CODE </span>
                {b.bonus.code}
              </p>
            )}
            <a href={goLink(b.slug, `review-${b.slug}`)} target="_blank" rel="sponsored nofollow noopener" className="btn-primary mt-6 h-11 w-full">
              Visit {b.name}
            </a>
            <p className="mt-3 text-[11px] leading-snug text-subtle">{b.bonus.terms}</p>
          </div>
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
