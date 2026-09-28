import { NextResponse } from "next/server";
import { sstats } from "@/lib/sstats/client";
import type { PariMarket } from "@/lib/sstats/types";

/** Development helper: lists PARI markets without parameters, to verify the П1/X/П2 mapping. */
export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "not available" }, { status: 404 });
  const markets = await sstats<PariMarket[]>("/Pari/odds/market-types", {}, 86_400);
  return NextResponse.json(
    markets.filter((m) => !m.hasParameter).slice(0, 15).map((m) => ({ id: m.id, name: m.name, description: m.description, outcomes: m.outcomes.map((o) => `${o.id}: ${o.name} (${o.period})`) })),
  );
}
