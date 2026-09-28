import { after, NextResponse, type NextRequest } from "next/server";
import { affiliateUrl, envKeyFor, getBookmaker, isAvailableIn } from "@/lib/bookmakers";
import { countryFromHeaders } from "@/lib/geo";

/**
 * Affiliate click tracker: /go/<bookmaker>?src=<placement>
 *
 * Every outbound CTA goes through here so we can (1) block operators that
 * don't serve the visitor's country, (2) tag the click with a sub-id the
 * affiliate network reports back, and (3) log the click for attribution.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const bookmaker = getBookmaker(slug);
  if (!bookmaker) return NextResponse.redirect(new URL("/bookmakers", req.url));

  const country = countryFromHeaders(req.headers);
  if (!isAvailableIn(bookmaker, country)) {
    return NextResponse.redirect(new URL(`/bookmakers?geo=blocked&b=${bookmaker.slug}`, req.url));
  }

  const source = (req.nextUrl.searchParams.get("src") ?? "direct").replace(/[^\w-]/g, "").slice(0, 48) || "direct";
  const clickId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const target = new URL(affiliateUrl(bookmaker));
  // Only tag real affiliate links; the homepage fallback has no network to report to
  if (process.env[envKeyFor(bookmaker.slug)]) target.searchParams.set(bookmaker.subIdParam, `${source}_${clickId}`);

  const click = {
    type: "affiliate_click",
    clickId,
    bookmaker: bookmaker.slug,
    source,
    country,
    platform: source.startsWith("ios") ? "ios" : "web",
    referer: req.headers.get("referer"),
    at: new Date().toISOString(),
  };
  console.log(JSON.stringify(click));

  const webhook = process.env.CLICK_WEBHOOK_URL;
  if (webhook) {
    after(() =>
      fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(click) }).catch((err) =>
        console.error("[go] click webhook failed", err),
      ),
    );
  }

  return NextResponse.redirect(target, {
    status: 302,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" },
  });
}
