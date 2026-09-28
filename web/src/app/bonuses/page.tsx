import type { Metadata } from "next";
import { BonusCard } from "@/components/BonusCard";
import { bookmakersByRating } from "@/lib/bookmakers";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Бонусы букмекеров для новых игроков",
  description: "Приветственные бонусы и фрибеты легальных букмекеров России с ключевыми условиями.",
  alternates: { canonical: "/bonuses" },
};

export default function BonusesPage() {
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Бонусы</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Бонусы без мелкого шрифта.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Бонус имеет смысл, только если вы и так собирались делать ставку. Никогда не играйте ради бонуса и всегда читайте условия отыгрыша.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmakersByRating().map((b) => (
          <BonusCard key={b.slug} b={b} source="bonuses" />
        ))}
      </div>
      <p className="mt-8 text-xs text-subtle">{site.warning}</p>
    </div>
  );
}
