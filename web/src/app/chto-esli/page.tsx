import type { Metadata } from "next";
import Link from "next/link";
import { BankChart } from "@/components/BankChart";
import { FlipText } from "@/components/FlipText";
import { Fine, PageHead, SectionHead } from "@/components/Page";
import { CLUB_LEAGUES, getLeague, type ClubLeague } from "@/lib/leagues";
import { plural } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { getSeason } from "@/lib/season";
import { site } from "@/lib/site";
import { teamSlug } from "@/lib/teams";
import { leagueTable, ledger, seasons, STAKE, toPlayed } from "@/lib/whatif";

export const revalidate = 3600;

type Props = { searchParams: Promise<{ league?: string; season?: string; team?: string }> };

export const metadata: Metadata = {
  title: "А что, если бы вы ставили на свою команду весь сезон",
  description:
    "Сколько принесли бы ставки на вашу команду, если ставить на неё в каждом матче сезона. РПЛ и пять главных лиг Европы, реальные коэффициенты и результаты.",
  alternates: { canonical: paths.whatIf },
};

const rub = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ru-RU")} ₽`;
const pctSigned = (x: number) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x * 100).toFixed(1).replace(".", ",")}%`;
const tone = (n: number) => (n >= 0 ? "text-win" : "text-loss");

export default async function WhatIfPage({ searchParams }: Props) {
  const sp = await searchParams;
  const leagueKey: ClubLeague = (CLUB_LEAGUES as readonly string[]).includes(sp.league ?? "") ? (sp.league as ClubLeague) : "rpl";
  const league = getLeague(leagueKey)!;
  const options = seasons();
  const season = options.find((s) => String(s.year) === sp.season) ?? options[0];

  const data = await getSeason(leagueKey, season.year);
  const games = toPlayed(data.games);
  const table = leagueTable(games);
  const teamId = Number(sp.team) || table[0]?.id;
  const team = table.find((t) => t.id === teamId);
  const back = team ? ledger(games, team.id) : null;
  const against = team ? ledger(games, team.id, "lose") : null;
  const draw = team ? ledger(games, team.id, "draw") : null;
  const inPlus = table.filter((t) => t.profit > 0).length;
  const avgRoi = table.length ? table.reduce((s, t) => s + t.roi, 0) / table.length : 0;
  const href = (p: { league?: string; season?: number; team?: number }) =>
    `${paths.whatIf}?league=${p.league ?? leagueKey}&season=${p.season ?? season.year}${p.team ? `&team=${p.team}` : ""}`;

  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "А что, если", href: paths.whatIf }]}
        title="А что, если бы вы ставили на свою команду весь сезон"
        lead={
          <>
            Берём все матчи сезона, коэффициенты закрытия линии и результаты. Считаем, что стало бы с банком, если ставить по {STAKE} ₽ на каждый
            матч команды.{data.demo && " Сейчас показаны демо-данные."}
          </>
        }
      />

      <div className="mt-6 space-y-3">
        <nav className="flex flex-wrap gap-1.5" aria-label="Лига и сезон">
          {CLUB_LEAGUES.map((k) => (
            <Link key={k} href={href({ league: k, team: undefined })} className="chip" aria-current={k === leagueKey ? "page" : undefined}>
              {getLeague(k)!.short}
            </Link>
          ))}
          <span className="mx-1 w-px shrink-0 bg-line" aria-hidden />
          {options.map((s) => (
            <Link key={s.year} href={href({ season: s.year, team: undefined })} className="chip num text-[15px]" aria-current={s.year === season.year ? "page" : undefined}>
              {s.label}
            </Link>
          ))}
        </nav>
        <nav className="flex flex-wrap gap-1.5" aria-label="Команда">
          {[...table]
            .sort((a, b) => a.name.localeCompare(b.name, "ru"))
            .map((t) => (
              <Link key={t.id} href={href({ team: t.id })} className="chip px-2.5 py-1" aria-current={t.id === team?.id ? "page" : undefined}>
                {t.name}
              </Link>
            ))}
        </nav>
      </div>

      {!games.length && <p className="card mt-8 p-8 text-center text-muted">В этом сезоне ещё нет сыгранных матчей с коэффициентами. Выберите прошлый сезон.</p>}

      {team && back && against && draw && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="card p-5 sm:p-6">
            <p className="text-xl font-extrabold tracking-tight">
              <Link href={paths.team(teamSlug(team.name))} className="underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-hi">
                {team.name}
              </Link>
            </p>
            <p className="mt-1 text-muted">
              {STAKE} ₽ на победу в каждом матче сезона {season.label}. Итог:
            </p>
            <p className={`num mt-2 text-[64px] leading-none font-bold ${tone(back.profit)}`}>
              <FlipText text={rub(back.profit)} delay={100} />
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Fact k="Матчей" v={String(back.steps.length)} />
              <Fact k="Выиграно ставок" v={`${back.wins} из ${back.steps.length}`} />
              <Fact k="Средний коэффициент" v={back.avgPrice.toFixed(2)} />
              <Fact k="Доходность" v={pctSigned(back.roi)} />
            </dl>
            <div className="mt-5">
              <BankChart steps={back.steps} />
              <p className="mt-1 text-xs text-subtle">Банк после каждого матча. Пунктир — ноль, с которого вы начали.</p>
            </div>
          </div>
          <div className="grid content-start gap-4">
            <Alt title="А если ставить против них" profit={against.profit} roi={against.roi} />
            <Alt title="А если на ничью в их матчах" profit={draw.profit} roi={draw.roi} />
            <p className="card p-5 text-sm leading-relaxed text-muted">
              Это прошлое, а не подсказка на будущее. Коэффициенты уже учитывают силу команды, поэтому ставить на ту, что везла в прошлом сезоне, —
              не стратегия.
            </p>
          </div>
        </section>
      )}

      {table.length > 0 && (
        <section className="mt-block">
          <SectionHead
            title={`На кого было выгодно ставить: ${league.label}, ${season.label}`}
            sub={`В плюсе ${inPlus} из ${table.length} ${plural(table.length, ["команды", "команд", "команд"])}. В среднем ставка на победу возвращала ${pctSigned(avgRoi)}: это и есть маржа букмекера, которую платит тот, кто ставит всегда.`}
          />
          <ol className="card divide-y divide-line overflow-hidden">
            {table.map((t, i) => (
              <li key={t.id}>
                <Link
                  href={href({ team: t.id })}
                  className={`grid grid-cols-[2rem_minmax(0,1fr)_auto_4.5rem] items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-surface-2 ${t.id === team?.id ? "bg-hi/25" : ""}`}
                >
                  <span className="num text-base text-subtle">{i + 1}</span>
                  <span className="truncate font-semibold">{t.name}</span>
                  <span className={`num text-lg font-bold ${tone(t.profit)}`}>{rub(t.profit)}</span>
                  <span className="num text-right text-sm text-subtle">{pctSigned(t.roi)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Fine className="mt-12">
        Коэффициенты закрытия — средние по рынку за несколько минут до начала матча. У конкретного букмекера результат был бы другим. {site.warning}
      </Fine>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3 ring-1 ring-line">
      <dt className="text-xs text-subtle">{k}</dt>
      <dd className="num mt-0.5 text-lg font-bold">{v}</dd>
    </div>
  );
}

function Alt({ title, profit, roi }: { title: string; profit: number; roi: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className={`num mt-1 text-4xl font-bold ${tone(profit)}`}>{rub(profit)}</p>
      <p className="text-xs text-subtle">доходность {pctSigned(roi)}</p>
    </div>
  );
}
