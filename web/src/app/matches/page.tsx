import type { Metadata } from "next";
import { LeagueTabs } from "@/components/LeagueTabs";
import { MatchTable } from "@/components/MatchTable";
import { dataSource, getMatches } from "@/lib/data";
import { getLeague } from "@/lib/leagues";
import { site } from "@/lib/site";

export const revalidate = 300;

type Props = { searchParams: Promise<{ league?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const l = getLeague((await searchParams).league);
  return {
    title: l ? `${l.label}: разбор матчей и коэффициенты` : "Матчи: разбор и коэффициенты",
    description: `Шансы команд по мировому рынку и коэффициенты PARI${l ? " — " + l.label : ""}. Видно, где коэффициент выше справедливого.`,
    alternates: { canonical: l ? `/matches?league=${l.key}` : "/matches" },
  };
}

export default async function MatchesPage({ searchParams }: Props) {
  const l = getLeague((await searchParams).league);
  const matches = await getMatches(l?.key);

  return (
    <div className="container-x pt-14">
      <p className="eyebrow">{dataSource() === "live" ? "Актуальные данные" : "Демо-данные"} · футбол</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{l ? l.label : "Ближайшие матчи"}</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Шансы считаем по коэффициентам мировых букмекеров, очищенным от маржи. Рядом — коэффициенты PARI: зелёным отмечены те,
        что выше справедливой цены.
      </p>
      <div className="mt-8 mb-5">
        <LeagueTabs active={l?.key} />
      </div>
      <MatchTable matches={matches} />
      <p className="mt-6 text-xs text-subtle">{site.warning}</p>
    </div>
  );
}
