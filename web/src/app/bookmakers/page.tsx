import type { Metadata } from "next";
import { BookmakerRow } from "@/components/BookmakerRow";
import { bookmakersByRating } from "@/lib/bookmakers";

export const metadata: Metadata = {
  title: "Best betting sites, ranked",
  description: "Independent reviews of the top sportsbooks — ranked on odds quality, payouts, markets and how they treat winners.",
  alternates: { canonical: "/bookmakers" },
};

const criteria = [
  { k: "Price quality", v: "Average margin across thousands of markets we track." },
  { k: "Payout speed", v: "How quickly withdrawals land, by method." },
  { k: "Winner-friendly", v: "Whether they limit accounts that win." },
  { k: "Licensing", v: "Only regulated operators make the list." },
];

export default async function BookmakersPage({ searchParams }: { searchParams: Promise<{ geo?: string; b?: string }> }) {
  const { geo, b } = await searchParams;
  const list = bookmakersByRating();
  const blocked = geo === "blocked" ? list.find((x) => x.slug === b) : undefined;

  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Reviews</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Best betting sites, ranked.</h1>
      <p className="mt-3 max-w-2xl text-muted">No pay-to-rank. The order below comes from our scoring model — commissions never move a bookmaker up the list.</p>

      {blocked && (
        <div className="mt-8 rounded-xl border border-danger/30 bg-danger/10 px-5 py-4 text-sm">
          {blocked.name} doesn&apos;t accept customers from your country. Here are the sportsbooks available to you.
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {criteria.map((c) => (
          <div key={c.k} className="rounded-xl border border-line p-4">
            <p className="text-sm font-medium">{c.k}</p>
            <p className="mt-1 text-xs text-muted">{c.v}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 divide-y divide-line overflow-hidden">
        {list.map((bm, i) => (
          <BookmakerRow key={bm.slug} b={bm} rank={i + 1} source="bookmakers-list" />
        ))}
      </div>
    </div>
  );
}
