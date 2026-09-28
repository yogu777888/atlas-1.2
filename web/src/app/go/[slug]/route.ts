import { after, NextResponse, type NextRequest } from "next/server";
import { adInfo, getBookmaker } from "@/lib/bookmakers";

/**
 * Partner click tracker: /go/<bookmaker>?src=<placement>
 *
 * Every outbound CTA goes through here to (1) refuse unmarked ads — without an
 * erid the visitor lands on our review instead, (2) tag the click with a sub-id
 * the partner programme reports back, and (3) log the click for attribution.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const bookmaker = getBookmaker(slug);
  if (!bookmaker) return NextResponse.redirect(new URL("/bookmakers", req.url));

  const ad = adInfo(bookmaker);
  if (!ad) return NextResponse.redirect(new URL(`/bookmakers/${bookmaker.slug}`, req.url));

  const source = (req.nextUrl.searchParams.get("src") ?? "direct").replace(/[^\w-]/g, "").slice(0, 48) || "direct";
  const clickId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const target = new URL(ad.url);
  target.searchParams.set(bookmaker.subIdParam, `${source}_${clickId}`);

  const click = { type: "partner_click", clickId, bookmaker: bookmaker.slug, source, erid: ad.erid, at: new Date().toISOString() };
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
