import { NextResponse, type NextRequest } from "next/server";
import { getEvents, getSureBets, oddsSource } from "@/lib/odds/provider";
import { getSport } from "@/lib/sports";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const sport = getSport(params.get("sport"));
  const events = params.get("view") === "surebets" ? await getSureBets() : await getEvents(sport?.key);
  return NextResponse.json(
    { source: oddsSource(), generatedAt: new Date().toISOString(), events },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
