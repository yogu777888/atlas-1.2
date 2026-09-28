import { NextResponse, type NextRequest } from "next/server";
import { dataSource, getMatches } from "@/lib/data";

export async function GET(req: NextRequest) {
  const matches = await getMatches(req.nextUrl.searchParams.get("league") ?? undefined);
  return NextResponse.json(
    { source: dataSource(), generatedAt: new Date().toISOString(), matches },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } },
  );
}
