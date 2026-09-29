import Link from "next/link";
import { paths } from "@/lib/routes";
import type { Row } from "@/lib/season";
import { TeamMark } from "./TeamMark";

const PILL = { W: "bg-p5", D: "bg-draw", L: "bg-loss" } as const;
const NAME = { W: "победа", D: "ничья", L: "поражение" } as const;

/** League table: place, team (links to its page), games, W/D/L, goals, points and the last five results. */
export function Standings({ rows, highlight, limit }: { rows: Row[]; highlight?: number; limit?: number }) {
  const list = limit ? rows.slice(0, limit) : rows;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[340px] text-sm">
        <thead className="bg-surface-2 text-[11px] text-subtle">
          <tr className="border-b border-line">
            <th className="w-10 py-2 pl-4 text-left font-medium">#</th>
            <th className="py-2 text-left font-medium">Команда</th>
            <th className="px-2 py-2 text-center font-medium" title="Игры">И</th>
            <th className="hidden px-2 py-2 text-center font-medium sm:table-cell" title="Победы">В</th>
            <th className="hidden px-2 py-2 text-center font-medium sm:table-cell" title="Ничьи">Н</th>
            <th className="hidden px-2 py-2 text-center font-medium sm:table-cell" title="Поражения">П</th>
            <th className="px-1.5 py-2 text-center font-medium" title="Забито и пропущено">Мячи</th>
            <th className="px-2 py-2 text-center font-semibold text-fg-2" title="Очки">О</th>
            <th className="hidden py-2 pr-4 pl-2 text-left font-medium md:table-cell">Форма</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r, i) => (
            <tr key={r.id} className={`border-b border-[#eef1ec] last:border-0 ${r.id === highlight ? "bg-hi/25" : ""}`}>
              <td className="num py-2 pl-4 text-base font-semibold text-subtle">{i + 1}</td>
              <td className="py-2 pr-2 whitespace-nowrap">
                <Link href={paths.team(r.slug)} className="inline-flex items-center gap-2 font-semibold underline decoration-transparent decoration-2 underline-offset-4 transition hover:decoration-hi">
                  <TeamMark name={r.name} size={14} />
                  {r.name}
                </Link>
              </td>
              <td className="num px-2 py-2 text-center text-base">{r.played}</td>
              <td className="num hidden px-2 py-2 text-center text-base sm:table-cell">{r.won}</td>
              <td className="num hidden px-2 py-2 text-center text-base sm:table-cell">{r.drawn}</td>
              <td className="num hidden px-2 py-2 text-center text-base sm:table-cell">{r.lost}</td>
              <td className="num px-2 py-2 text-center text-base whitespace-nowrap text-muted">
                {r.gf}:{r.ga}
              </td>
              <td className="num px-2 py-2 text-center text-lg font-bold">{r.points}</td>
              <td className="hidden py-2 pr-4 pl-2 md:table-cell">
                <span className="flex gap-[3px]" aria-label={r.form.map((f) => NAME[f]).join(", ")}>
                  {r.form.map((f, j) => (
                    <i key={j} className={`size-2.5 rounded-sm ${PILL[f]}`} aria-hidden />
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
