import type { Metadata } from "next";
import { OddsTable } from "@/components/OddsTable";
import { SportTabs } from "@/components/SportTabs";
import { getEvents, getSureBets, oddsSource } from "@/lib/odds/provider";
import { getSport } from "@/lib/sports";

export const revalidate = 120;

type Props = { searchParams: Promise<{ sport?: string; view?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { sport, view } = await searchParams;
  const s = getSport(sport);
  if (view === "surebets") return { title: "Sure bets right now", description: "Live arbitrage opportunities across top sportsbooks." };
  return {
    title: s ? `${s.label} odds comparison` : "Odds comparison",
    description: `Compare ${s ? s.label.toLowerCase() + " " : ""}betting odds from the top sportsbooks and get the best price on every outcome.`,
    alternates: { canonical: s ? `/odds?sport=${s.key}` : "/odds" },
  };
}

export default async function OddsPage({ searchParams }: Props) {
  const { sport, view } = await searchParams;
  const s = getSport(sport);
  const surebets = view === "surebets";
  const events = surebets ? await getSureBets() : await getEvents(s?.key);

  return (
    <div className="container-x pt-14">
      <p className="eyebrow">{oddsSource() === "live" ? "Live odds" : "Demo odds"} · match winner</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        {surebets ? "Sure bets" : s ? `${s.label} odds` : "Compare odds"}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        {surebets
          ? "Matches where backing every outcome at the best available price returns more than you stake. They move fast — always check prices on the bet slip."
          : "The highest price on each outcome is tagged in green. Margin shows what you'd give away backing every outcome at those prices — lower is better."}
      </p>
      <div className="mt-8 mb-5">
        <SportTabs active={s?.key} view={view} />
      </div>
      <OddsTable events={events} empty={surebets ? "No sure bets on the board right now. Check back soon." : undefined} />
    </div>
  );
}
