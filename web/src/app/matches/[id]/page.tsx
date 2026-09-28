import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalTime } from "@/components/LocalTime";
import { OutboundButton } from "@/components/OutboundButton";
import { ProbBar } from "@/components/ProbBar";
import { getBookmaker } from "@/lib/bookmakers";
import { getMatch, getMatchDetail } from "@/lib/data";
import { edge, odds, OUTCOMES, outcomeLabel, pct, verdict } from "@/lib/matches";
import { site } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getMatch((await params).id);
  if (!m) return { title: "Матч не найден" };
  return {
    title: `${m.home} — ${m.away}: прогноз и коэффициенты`,
    description: `${m.league.label}. ${verdict(m) ?? ""} Шансы по мировому рынку и коэффициенты PARI.`,
    alternates: { canonical: `/matches/${m.id}` },
  };
}

export default async function MatchPage({ params }: Props) {
  const m = await getMatch((await params).id);
  if (!m) notFound();
  const d = await getMatchDetail(m);
  const fair = d.world ?? m.fair;
  const pari = getBookmaker("pari")!;

  return (
    <div className="container-x pt-12">
      <Link href={`/matches?league=${m.league.key}`} className="text-sm text-muted hover:text-fg">
        ← {m.league.label}
      </Link>

      <header className="mt-6">
        <p className="text-sm text-subtle">
          {m.league.label} · <LocalTime iso={m.commenceTime} />
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {m.home} <span className="text-subtle">—</span> {m.away}
        </h1>
        {verdict({ ...m, fair }) && <p className="mt-4 text-lg text-muted">{verdict({ ...m, fair })}</p>}
      </header>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {/* Market chances */}
        <section className="card p-6">
          <h2 className="font-medium">Шансы по мировому рынку</h2>
          <p className="mt-1 text-sm text-muted">
            {d.worldBooks > 0 ? `Среднее по ${d.worldBooks} международным букмекерам` : "Средний коэффициент рынка"}, маржа убрана.
          </p>
          {fair ? (
            <div className="mt-6 space-y-4">
              <ProbBar p={fair} />
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                {OUTCOMES.map((o) => (
                  <div key={o} className="rounded-xl bg-surface-2 p-3">
                    <p className="truncate text-xs text-subtle">{outcomeLabel(m, o)}</p>
                    <p className="mt-1 font-mono text-lg tabular-nums">{pct(fair[o])}</p>
                    <p className="font-mono text-xs text-subtle">справедл. {odds(1 / fair[o])}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-subtle">Рынок по матчу ещё не открылся.</p>
          )}
        </section>

        {/* PARI */}
        <section className="card p-6">
          <h2 className="font-medium">Коэффициенты PARI</h2>
          <p className="mt-1 text-sm text-muted">Легальный букмекер. Зелёным — коэффициент выше справедливого.</p>
          {m.pari ? (
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {OUTCOMES.map((o) => {
                const price = m.pari!.odds[o];
                const value = fair ? edge(price, fair[o]) : null;
                const good = value !== null && value > 0;
                return (
                  <div key={o} className={`rounded-xl border p-3 ${good ? "border-accent/40 bg-accent/10" : "border-line bg-surface-2"}`}>
                    <p className="truncate text-xs text-subtle">{outcomeLabel(m, o)}</p>
                    <p className={`mt-1 font-mono text-2xl tabular-nums ${good ? "text-accent" : ""}`}>{odds(price)}</p>
                    {value !== null && (
                      <p className={`font-mono text-xs ${good ? "text-accent" : "text-subtle"}`}>
                        {value > 0 ? "+" : ""}
                        {(value * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-sm text-subtle">PARI пока не открыл линию на этот матч.</p>
          )}
          <div className="mt-6">
            <OutboundButton b={pari} source={`match-${m.id}`} label="Сделать ставку в PARI" className="h-10 w-full" />
          </div>
        </section>
      </div>

      {d.glicko && (
        <section className="card mt-4 p-6">
          <h2 className="font-medium">Сила команд по рейтингу</h2>
          <p className="mt-1 text-sm text-muted">Независимая оценка по рейтингу Glicko-2 — по результатам прошлых матчей, без учёта коэффициентов.</p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <Stat label={m.home} value={pct(d.glicko.home)} sub={d.glicko.homeXg !== null ? `xG ${d.glicko.homeXg.toFixed(2)}` : undefined} />
            {d.glicko.draw !== null && <Stat label="Ничья" value={pct(d.glicko.draw)} />}
            <Stat label={m.away} value={pct(d.glicko.away)} sub={d.glicko.awayXg !== null ? `xG ${d.glicko.awayXg.toFixed(2)}` : undefined} />
          </div>
        </section>
      )}

      <section className="mt-10 max-w-2xl space-y-3 text-sm leading-relaxed text-muted">
        <h2 className="text-base font-medium text-fg">Как читать эту страницу</h2>
        <p>
          Букмекеры закладывают в коэффициенты маржу. Мы берём коэффициенты многих контор, убираем маржу и получаем «справедливые»
          шансы. Если коэффициент PARI выше справедливого, ставка на этот исход математически выгоднее средней — но это не гарантия
          выигрыша в конкретном матче.
        </p>
      </section>

      <p className="mt-8 text-xs text-subtle">Коэффициенты меняются. Проверяйте итоговый коэффициент в купоне букмекера. {site.warning}</p>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-4">
      <p className="truncate text-xs text-subtle">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums">{value}</p>
      {sub && <p className="font-mono text-xs text-subtle">{sub}</p>}
    </div>
  );
}
