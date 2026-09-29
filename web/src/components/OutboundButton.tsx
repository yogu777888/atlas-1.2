import Link from "next/link";
import { adInfo, goLink, type Bookmaker } from "@/lib/bookmakers";
import { paths } from "@/lib/routes";
import { AdMark } from "./AdMark";

/**
 * CTA to a bookmaker. Renders the partner link with its ad marking only when
 * the link, erid and advertiser are configured. Until then it shows `fallback`
 * (by default a link to our review), or `note` when there is nowhere better to go.
 */
export function OutboundButton({
  b,
  source,
  label,
  className = "",
  fallback,
  note,
}: {
  b: Bookmaker;
  source: string;
  label: string;
  className?: string;
  fallback?: { label: string; href: string } | null;
  note?: string;
}) {
  const ad = adInfo(b);
  if (!ad) {
    if (note) return <p className="rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-xs text-subtle">{note}</p>;
    if (fallback === null) return null;
    const f = fallback ?? { label: `Обзор ${b.name}`, href: paths.bookmaker(b.slug) };
    return (
      <Link href={f.href} className={`btn-ghost ${className}`}>
        {f.label}
      </Link>
    );
  }
  return (
    <div className="grid gap-1.5">
      <a href={goLink(b.slug, source)} rel="sponsored nofollow noopener" target="_blank" className={`btn-primary ${className}`}>
        {label}
      </a>
      <AdMark ad={ad} />
    </div>
  );
}
