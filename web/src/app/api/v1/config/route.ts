import { NextResponse, type NextRequest } from "next/server";
import { bookmakers, isAvailableIn } from "@/lib/bookmakers";
import { countryFromHeaders } from "@/lib/geo";
import { site } from "@/lib/site";

/**
 * Remote config for the iOS app. Lets us switch off outbound bookmaker links
 * per country without shipping an app update (App Store guideline 5.3).
 */
export async function GET(req: NextRequest) {
  const country = countryFromHeaders(req.headers);
  const killList = (process.env.APP_LINKS_DISABLED_COUNTRIES ?? "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
  const anyAvailable = bookmakers.some((b) => isAvailableIn(b, country));
  const linksEnabled = anyAvailable && !(country && killList.includes(country));

  return NextResponse.json(
    {
      country,
      affiliateLinksEnabled: linksEnabled,
      minimumAppVersion: process.env.APP_MIN_VERSION ?? "1.0.0",
      responsibleGamblingUrl: `${site.url}/responsible-gambling`,
      helplineUrl: "https://www.gamblingtherapy.org",
      disclosureUrl: `${site.url}/disclosure`,
    },
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
