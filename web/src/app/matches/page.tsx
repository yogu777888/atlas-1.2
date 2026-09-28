import type { Metadata } from "next";
import { LeagueTabs } from "@/components/LeagueTabs";
import { MatchTable } from "@/components/MatchTable";
import { dataSource, getMatches } from "@/lib/data";
import { hasValue } from "@/lib/matches";
import { getLeague } from "@/lib/leagues";
import { site } from "@/lib/site";

export const revalidate = 300;

type Props = { searchParams: Promise<{ league?: string; value?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const l = getLeague((await searchParams).league);
  return {
    title: l ? `${l.label}: разбор матчей и коэффициенты` : "Матчи: разбор и коэффициенты",
    description: `Шансы команд по мировому рынку и коэффициенты PARI${l ? " — " + l.label : ""}. Видно, где коэффициент выше справедливого.`,
    alternates: { canonical: l ? `/matches?league=${l.key}` : "/matches" },
  };
}

export default async function MatchesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const l = getLeague(sp.league);
  const valueOnly = !l && sp.value === "1";
  const all = await getMatches(l?.key);
  const matches = valueOnly ? all.filter(hasValue) : all;

  return (
    <div className="container-x pt-14">
      <p className="eyebrow">{dataSource() === "live" ? "Актуальные данные" : "Демо-данные"} · футбол</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{l ? l.label : valueOnly ? "Выгодные коэффициенты" : "Ближайшие матчи"}</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Шансы считаем по коэффициентам мировых букмекеров, очищенным от маржи. Рядом — коэффициенты PARI: жёлтым отмечены те,
        что выше справедливой цены.
      </p>
      <div className="mt-8 mb-5">
        <LeagueTabs active={valueOnly ? "value" : l?.key} />
      </div>
      <MatchTable matches={matches} />
      <p className="mt-6 text-xs text-subtle">{site.warning}</p>
    </div>
  );
}
