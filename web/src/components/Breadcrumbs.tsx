import Link from "next/link";
import { site } from "@/lib/site";

/** Visible trail plus BreadcrumbList markup, so search shows the path instead of the raw URL. */
export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const trail = [{ label: "Главная", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Навигация" className="text-sm text-subtle">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((t, i) => (
            <li key={t.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i < trail.length - 1 ? (
                <Link href={t.href} className="hover:text-fg">
                  {t.label}
                </Link>
              ) : (
                <span className="text-muted" aria-current="page">
                  {t.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.label, item: `${site.url}${t.href}` })),
          }),
        }}
      />
    </>
  );
}
