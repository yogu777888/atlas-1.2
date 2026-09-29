import { NextResponse, type NextRequest } from "next/server";
import { getLeague } from "@/lib/leagues";
import { paths } from "@/lib/routes";

/** Old list URL: /matches?league=rpl → /prognozy/rpl, /matches?value=1 → /prognozy/vygodnye */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const league = getLeague(sp.get("league"));
  const to = league ? paths.league(league.slug) : sp.get("value") === "1" ? paths.valueBets : paths.forecasts;
  return NextResponse.redirect(new URL(to, req.url), 301);
}
