import { NextResponse, type NextRequest } from "next/server";
import { bookmakersByRating, goLink, isAvailableIn } from "@/lib/bookmakers";
import { countryFromHeaders } from "@/lib/geo";
import { site } from "@/lib/site";

export async function GET(req: NextRequest) {
  const country = countryFromHeaders(req.headers);
  const platform = req.nextUrl.searchParams.get("platform") === "ios" ? "ios" : "api";
  const bookmakers = bookmakersByRating().map((b) => ({
    slug: b.slug,
    name: b.name,
    color: b.color,
    ink: b.ink,
    monogram: b.monogram,
    rating: b.rating,
    license: b.license,
    payout: b.payout,
    minDeposit: b.minDeposit,
    avgMargin: b.avgMargin,
    features: b.features,
    pros: b.pros,
    cons: b.cons,
    bonus: b.bonus,
    available: isAvailableIn(b, country),
    link: `${site.url}${goLink(b.slug, `${platform}-bookmakers`)}`,
  }));
  return NextResponse.json(
    { country, bookmakers },
    // Response depends on the visitor's country, so never share it between users
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
