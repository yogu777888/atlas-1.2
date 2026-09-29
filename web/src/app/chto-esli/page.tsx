import type { Metadata } from "next";
import Link from "next/link";
import { BankChart } from "@/components/BankChart";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlipText } from "@/components/FlipText";
import { getLeague, leagueSourceId } from "@/lib/leagues";
import { plural } from "@/lib/matches";
import { site } from "@/lib/site";
import { demoSeason, leagueTable, ledger, SEASONS, seasonGames, STAKE, type Played } from "@/lib/whatif";

export const revalidate = 3600;

const LEAGUES = ["rpl", "epl", "laliga", "seriea", "bundesliga", "ligue1"] as const;

type Props = { searchParams: Promise<{ league?: string; season?: string; team?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const l = getLeague(sp.league) ?? getLeague("rpl")!;
  return {
    title: `А что, если бы вы ставили на свою команду? ${l.label}`,
    description: `Сколько бы вы выиграли или проиграли, если бы весь сезон ставили на свою команду в ${l.label}. Посчитано по реальным коэффициентам и результатам.`,
    alternates: { canonical: "/chto-esli" },
  };
}

const rub = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ru-RU")} ₽`;
const pctSigned = (x: number) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x * 100).toFixed(1).replace(".", ",")}%`;
const tone = (n: number) => (n >= 0 ? "text-pitch" : "text-danger");

export default async function WhatIfPage({ searchParams }: Props) {
  const sp = await searchParams;
  const leagueKey = LEAGUES.includes(sp.league as (typeof LEAGUES)[number]) ? sp.league! : "rpl";
  const league = getLeague(leagueKey)!;
  const season = SEASONS.find((s) => String(s.year) === sp.season) ?? SEASONS[0];

  let games: Played[] = [];
  let demo = false;
  try {
    games = await seasonGames(leagueSourceId(leagueKey)!, season.year);
  } catch {
    games = demoSeason();
    demo = true;
  }
  const table = leagueTable(games);
  const teamId = Number(sp.team) || table[0]?.id;
  const team = table.find((t) => t.id === teamId);
  const back = team ? ledger(games, team.id) : null;
  const against = team ? ledger(games, team.id, "lose") : null;
  const draw = team ? ledger(games, team.id, "draw") : null;
  const inPlus = table.filter((t) => t.profit > 0).length;
  const avgRoi = table.length ? table.reduce((s, t) => s + t.roi, 0) / table.length : 0;
  const href = (p: { league?: string; season?: number; team?: number }) =>
    `/chto-esli?league=${p.league ?? leagueKey}&season=${p.season ?? season.year}${p.team ? `&team=${p.team}` : ""}`;

  return (
    <div className="container-x pt-12">
      <Breadcrumbs items={[{ label: "А что, если", href: "/chto-esli" }]} />
      <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">А что, если бы вы ставили на свою команду?</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Берём все матчи сезона, реальные коэффициенты закрытия линии и результаты, и считаем, что стало бы с банком, если ставить по {STAKE} ₽ на каждый
        матч команды.
        {demo && " Сейчас показаны демо-данные."}
      </p>

      {/* pickers */}
      <div className="mt-8 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Лига">
          {LEAGUES.map((k) => {
            const l = getLeague(k)!;
            const on = k === leagueKey;
            return (
              <Link key={k} href={href({ league: k, team: undefined })} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${on ? "border-fg bg-fg text-bg" : "border-line text-muted hover:text-fg"}`}>
                {l.short}
              </Link>
            );
          })}
          <span className="mx-1 w-px shrink-0 bg-line" aria-hidden />
          {SEASONS.map((s) => (
            <Link key={s.year} href={href({ season: s.year, team: undefined })} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm tabular-nums transition ${s.year === season.year ? "border-fg bg-fg text-bg" : "border-line text-muted hover:text-fg"}`}>
              {s.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" aria-label="Команда">
          {[...table].sort((a, b) => a.name.localeCompare(b.name, "ru")).map((t) => (
            <Link key={t.id} href={href({ team: t.id })} className={`rounded-lg border px-2.5 py-1 text-sm transition ${t.id === team?.id ? "border-accent bg-accent/10 text-accent" : "border-line text-muted hover:text-fg"}`}>
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      {!games.length && <p className="card mt-8 p-8 text-center text-muted">По этому сезону пока нет сыгранных матчей с коэффициентами. Выберите прошлый сезон.</p>}

      {team && back && against && draw && (
        <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="card p-6">
            <p className="text-xl font-semibold tracking-tight">{team.name}</p>
            <p className="mt-1 text-muted">
              Ставка {STAKE} ₽ на победу в каждом матче сезона {season.label}. Итог:
            </p>
            <p className={`mt-2 text-6xl font-extrabold tracking-[-0.04em] tabular-nums ${tone(back.profit)}`}>
              <FlipText text={rub(back.profit)} delay={100} />
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Fact k="Матчей" v={String(back.steps.length)} />
              <Fact k="Выиграно ставок" v={`${back.wins} из ${back.steps.length}`} />
              <Fact k="Средний кэф" v={back.avgPrice.toFixed(2)} />
              <Fact k="Доходность" v={pctSigned(back.roi)} />
            </dl>
            <div className="mt-6">
              <BankChart steps={back.steps} />
              <p className="mt-1 text-xs text-subtle">Банк после каждого матча. Пунктир — ноль, с которого вы начали.</p>
            </div>
          </div>
          <div className="grid content-start gap-4">
            <Alt title="А если ставить против них" profit={against.profit} roi={against.roi} />
            <Alt title="А если на ничью в их матчах" profit={draw.profit} roi={draw.roi} />
            <p className="rounded-2xl border border-line p-5 text-sm leading-relaxed text-muted">
              Это прошлое, а не подсказка на будущее: коэффициенты уже учитывают силу команды. Ставить на «везучую» в прошлом сезоне команду — не стратегия.
            </p>
          </div>
        </section>
      )}

      {table.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            На кого было выгодно ставить: {league.label}, {season.label}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            В плюсе {inPlus} из {table.length} {plural(table.length, ["команды", "команд", "команд"])}. В среднем ставка на победу возвращала {pctSigned(avgRoi)} — это и есть
            комиссия букмекера, которую платит тот, кто ставит всегда.
          </p>
          <ol className="card mt-5 divide-y divide-line overflow-hidden">
            {table.map((t, i) => (
              <li key={t.id}>
                <Link href={href({ team: t.id })} className={`grid grid-cols-[2rem_minmax(0,1fr)_auto_5rem] items-center gap-3 px-5 py-3 text-sm transition hover:bg-white/[0.025] ${t.id === team?.id ? "bg-accent/5" : ""}`}>
                  <span className="text-subtle tabular-nums">{i + 1}</span>
                  <span className="truncate font-medium">{t.name}</span>
                  <span className={`font-semibold tabular-nums ${tone(t.profit)}`}>{rub(t.profit)}</span>
                  <span className="text-right text-xs text-subtle tabular-nums">{pctSigned(t.roi)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-10 text-xs text-subtle">
        Коэффициенты закрытия линии — средние по рынку за несколько минут до начала матча. Реальный результат у конкретного букмекера отличается. {site.warning}
      </p>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <dt className="text-xs text-subtle">{k}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

function Alt({ title, profit, roi }: { title: string; profit: number; roi: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className={`mt-1 text-3xl font-extrabold tracking-[-0.03em] tabular-nums ${tone(profit)}`}>{rub(profit)}</p>
      <p className="text-xs text-subtle tabular-nums">доходность {pctSigned(roi)}</p>
    </div>
  );
}
