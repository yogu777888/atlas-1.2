import Link from "next/link";
import { adInfo, goLink, type Bookmaker } from "@/lib/bookmakers";
import { AdMark } from "./AdMark";

/**
 * CTA to a bookmaker. Renders the partner link with its ad marking only when
 * the link, erid and advertiser are configured; otherwise links to our review.
 */
export function OutboundButton({ b, source, label, className = "" }: { b: Bookmaker; source: string; label: string; className?: string }) {
  const ad = adInfo(b);
  if (!ad) {
    return (
      <Link href={`/bookmakers/${b.slug}`} className={`btn-ghost ${className}`}>
        Обзор {b.name}
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
