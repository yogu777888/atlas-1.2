import Link from "next/link";
import { Fragment } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

/** Page masthead: trail, the one H1, a short lead and, on wide screens, figures on the right. */
export function PageHead({
  crumbs,
  title,
  lead,
  aside,
  animate = false,
}: {
  crumbs?: { label: string; href: string }[];
  title: React.ReactNode;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
  /** Words rise in one after another (for plain-string titles) */
  animate?: boolean;
}) {
  return (
    <header className="border-b border-line pt-6 pb-7 sm:pt-8">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className={`grid items-end gap-x-12 gap-y-6 ${aside ? "lg:grid-cols-[minmax(0,1fr)_auto]" : ""} ${crumbs ? "mt-5" : ""}`}>
        <div className="min-w-0">
          <h1 className="text-[clamp(30px,4.2vw,48px)] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance">
            {animate && typeof title === "string" ? words(title) : title}
          </h1>
          {lead && <div className="fade-up mt-3 max-w-[60ch] text-base text-pretty text-muted [animation-delay:250ms]">{lead}</div>}
        </div>
        {aside && <div className="fade-up [animation-delay:400ms]">{aside}</div>}
      </div>
    </header>
  );
}

/** Headline split into words that rise in one after another. */
export function words(text: string, offset = 0) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      <span className="word-rise" style={{ animationDelay: `${(offset + i) * 70}ms` }}>
        {w}
      </span>{" "}
    </Fragment>
  ));
}

/** Big figures with small labels, like the masthead of a data desk. */
export function Stats({ items }: { items: { label: React.ReactNode; value: React.ReactNode; unit?: string }[] }) {
  return (
    <dl className="flex flex-wrap gap-x-7 gap-y-3">
      {items.map((it, i) => (
        <div key={i} className="grid gap-0.5">
          <dt className="text-xs text-muted">{it.label}</dt>
          <dd className="num text-[34px] leading-none font-bold">
            {it.value}
            {it.unit && <small className="ml-1 font-sans text-[13px] font-medium text-muted">{it.unit}</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Section heading with an optional note and a link on the right. */
export function SectionHead({ title, sub, href, cta, id, level = 2 }: { title: string; sub?: React.ReactNode; href?: string; cta?: string; id?: string; level?: 2 | 3 }) {
  const H = `h${level}` as "h2" | "h3";
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <div className="min-w-0 space-y-1">
        <H id={id} className={`scroll-mt-24 font-extrabold tracking-[-0.03em] text-balance ${level === 2 ? "text-[clamp(22px,2.6vw,30px)]" : "text-xl"}`}>
          {title}
        </H>
        {sub && <p className="max-w-[62ch] text-sm text-pretty text-muted">{sub}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="link-more">
          {cta} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

/** Questions and answers, marked up as FAQPage so search can show them. */
export function Faq({ items, title = "Частые вопросы", id = "faq" }: { items: { q: string; a: string }[]; title?: string; id?: string }) {
  return (
    <section aria-labelledby={id}>
      <SectionHead title={title} id={id} />
      <div className="card divide-y divide-line">
        {items.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line-strong text-muted transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="-mt-1 max-w-[70ch] px-5 pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
    </section>
  );
}

/** Small print at the bottom of a page. */
export function Fine({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs leading-relaxed text-subtle ${className}`}>{children}</p>;
}
