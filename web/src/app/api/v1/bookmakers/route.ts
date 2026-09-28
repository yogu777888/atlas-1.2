import { NextResponse } from "next/server";
import { adInfo, bookmakersByRating, goLink } from "@/lib/bookmakers";
import { site } from "@/lib/site";

export async function GET() {
  const bookmakers = bookmakersByRating().map((b) => {
    const ad = adInfo(b);
    return {
      slug: b.slug,
      name: b.name,
      color: b.color,
      ink: b.ink,
      monogram: b.monogram,
      rating: b.rating,
      payout: b.payout,
      minDeposit: b.minDeposit,
      avgMargin: b.avgMargin,
      features: b.features,
      pros: b.pros,
      cons: b.cons,
      bonus: b.bonus,
      // Partner links are ads: only exposed together with their marking
      ad: ad ? { link: `${site.url}${goLink(b.slug, "api")}`, erid: ad.erid, advertiser: ad.advertiser } : null,
    };
  });
  return NextResponse.json({ bookmakers }, { headers: { "Cache-Control": "public, s-maxage=300" } });
}
