import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  sub,
  href,
  cta,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl space-y-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {sub && <p className="text-pretty text-muted">{sub}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="text-sm text-muted transition hover:text-fg">
          {cta} →
        </Link>
      )}
    </div>
  );
}
