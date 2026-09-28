import type { Metadata } from "next";
import { BonusCard } from "@/components/BonusCard";
import { bookmakersByRating } from "@/lib/bookmakers";

export const metadata: Metadata = {
  title: "Best betting bonuses & free bets",
  description: "Welcome offers from top sportsbooks, ranked by real value with the key terms up front.",
  alternates: { canonical: "/bonuses" },
};

export default function BonusesPage() {
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Welcome offers</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Bonuses, minus the fine print.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        The key terms are right on the card. A bonus is only worth it if you were going to bet anyway — never chase one.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmakersByRating().map((b) => (
          <BonusCard key={b.slug} b={b} source="bonuses" />
        ))}
      </div>
    </div>
  );
}
