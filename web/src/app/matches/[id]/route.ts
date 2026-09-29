import { NextResponse, type NextRequest } from "next/server";
import { findMatch } from "@/lib/data";
import { paths } from "@/lib/routes";

/** Old match URL: /matches/ss-1632014 → /prognoz/<home>-<away>-1632014 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const n = Number((await ctx.params).id.replace(/^ss-/, ""));
  if (!Number.isInteger(n) || n <= 0) return NextResponse.redirect(new URL(paths.forecasts, req.url), 301);
  const m = await findMatch(n).catch(() => null);
  return NextResponse.redirect(new URL(paths.match(m ? m.slug : String(n)), req.url), 301);
}
