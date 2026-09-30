/**
 * Team against team: the rows of the comparison, a verdict in words, and which
 * pairs get their own indexed page.
 */
import { plural } from "./matches";
import type { Row } from "./season";
import { standings, type Season } from "./season";
import { per90, type PlayerRow, type TeamProfile } from "./stats";
import { POPULAR, teamSlug } from "./teams";

export type CompareRow = {
  label: string;
  /** Small note under the label */
  hint?: string;
  l: number | null;
  r: number | null;
  fmt: (x: number) => string;
  /** Less is better (goals conceded, cards) */
  lower?: boolean;
  /** No better side, only a difference (possession) */
  neutral?: boolean;
};

/** Which side a row favours: -1 left, 1 right, 0 level or not comparable. */
export function sideOf(row: CompareRow): -1 | 0 | 1 {
  if (row.l === null || row.r === null || row.neutral || row.fmt(row.l) === row.fmt(row.r)) return 0;
  const leftBetter = row.lower ? row.l < row.r : row.l > row.r;
  return leftBetter ? -1 : 1;
}

/** How many rows each side wins. */
export function tally(rows: CompareRow[]) {
  const s = rows.map(sideOf);
  return { left: s.filter((x) => x === -1).length, right: s.filter((x) => x === 1).length, total: rows.filter((r) => r.l !== null && r.r !== null && !r.neutral).length };
}

export const dec = (d = 1) => (x: number) => x.toFixed(d).replace(".", ",");
const pctF = (x: number) => `${Math.round(x)}%`;
const share = (x: number) => `${Math.round(x * 100)}%`;

/** Canonical order of a pair: Russian alphabetical, so each pair has one address. */
export function pairOrder(a: string, b: string): [string, string] {
  return a.localeCompare(b, "ru") <= 0 ? [a, b] : [b, a];
}

export const pairSlug = (a: string, b: string) => {
  const [x, y] = pairOrder(a, b);
  return `${teamSlug(x)}-vs-${teamSlug(y)}`;
};

export function parsePair(slug: string): [string, string] | null {
  const m = slug.match(/^([a-z0-9-]+?)-vs-([a-z0-9-]+)$/);
  return m && m[1] !== m[2] ? [m[1], m[2]] : null;
}

/** Full comparison rows. `ra`/`rb` are the teams' rows in this season's table. */
export function teamRows(a: TeamProfile, b: TeamProfile, ra?: Row | null, rb?: Row | null, short = false): CompareRow[] {
  const ppg = (r?: Row | null) => (r && r.played ? r.points / r.played : null);
  const rows: CompareRow[] = [
    { label: "Очки за игру", hint: "в этом сезоне", l: ppg(ra), r: ppg(rb), fmt: dec(2) },
    { label: "Форма", hint: "очки за игру, 5 матчей", l: a.form, r: b.form, fmt: dec(1) },
    { label: "Забивает", hint: "голов за игру", l: a.gf, r: b.gf, fmt: dec(2) },
    { label: "Пропускает", hint: "голов за игру", l: a.ga, r: b.ga, fmt: dec(2), lower: true },
    { label: "Создаёт моментов", hint: "xG за игру", l: a.xg, r: b.xg, fmt: dec(2) },
    { label: "Даёт создать", hint: "xG соперников за игру", l: a.xga, r: b.xga, fmt: dec(2), lower: true },
    { label: "Удары", hint: "за игру", l: a.shots, r: b.shots, fmt: dec(1) },
    { label: "Удары в створ", hint: "за игру", l: a.sot, r: b.sot, fmt: dec(1) },
    { label: "Угловые", hint: "за игру", l: a.corners, r: b.corners, fmt: dec(1) },
    { label: "Владение мячом", hint: "в среднем", l: a.poss, r: b.poss, fmt: pctF, neutral: true },
    { label: "Сухие матчи", hint: "без пропущенных", l: a.cleanSheets * 100, r: b.cleanSheets * 100, fmt: pctF },
    { label: "Жёлтые карточки", hint: "за игру", l: a.yellow, r: b.yellow, fmt: dec(1), neutral: true },
  ];
  const keep = short ? ["Очки за игру", "Форма", "Забивает", "Пропускает", "Создаёт моментов", "Удары в створ", "Угловые"] : null;
  return rows.filter((r) => (r.l !== null || r.r !== null) && (!keep || keep.includes(r.label)));
}

const goalsWord = (n: number) => plural(n, ["гол", "гола", "голов"]);

/** Two or three sentences: who is stronger on the numbers, and the one thing that cuts the other way. */
export function verdictText(an: string, bn: string, a: TeamProfile, b: TeamProfile, rows: CompareRow[]): string[] {
  const t = tally(rows);
  const out: string[] = [];
  if (Math.abs(t.left - t.right) <= 1) out.push(`${an} и ${bn} почти равны по цифрам: ${t.left} ${plural(t.left, ["параметр", "параметра", "параметров"])} за ${an}, ${t.right} — за ${bn}.`);
  else {
    const [win, lose, w, l] = t.left > t.right ? [an, bn, t.left, t.right] : [bn, an, t.right, t.left];
    out.push(`По цифрам сильнее ${win}: лучше по ${w} ${plural(w, ["параметру", "параметрам", "параметрам"])} из ${t.total}, ${lose} — по ${l}.`);
  }
  // The strongest counterpoint: form going the other way
  if (a.form !== null && b.form !== null && Math.abs(a.form - b.form) >= 0.8) {
    const [hot, cold, h, c] = a.form > b.form ? [an, bn, a.form, b.form] : [bn, an, b.form, a.form];
    out.push(`В последних пяти матчах ${hot} набирает ${dec(1)(h)} очка за игру, ${cold} — ${dec(1)(c)}.`);
  }
  for (const [n, p] of [[an, a], [bn, b]] as const) {
    if (p.luck !== null && Math.abs(p.luck) >= 3) {
      const k = Math.round(Math.abs(p.luck));
      out.push(
        p.luck > 0
          ? `${n} забил на ${k} ${goalsWord(k)} больше, чем «положено» по качеству моментов (xG). Обычно такой перебор со временем выравнивается.`
          : `${n} забил на ${k} ${goalsWord(k)} меньше, чем по качеству моментов (xG): команда создаёт больше, чем реализует.`,
      );
      break;
    }
  }
  return out;
}

/** One line about a scorer: goals per 90, shots, recent goals. */
export function scorerLine(p: PlayerRow): string {
  const parts = [`${dec(2)(per90(p.goals, p.min))} за 90 мин`, `${dec(1)(p.shots / p.apps)} удара за матч`];
  if (p.assists) parts.push(`${p.assists} ${plural(p.assists, ["передача", "передачи", "передач"])}`);
  return parts.join(" · ");
}

/** Pairs worth their own indexed page: the top six of the table and the famous clubs of the league, each with each. */
export function featuredPairs(season: Season): [Row, Row][] {
  const table = standings(season.games);
  const top = table.filter((r, i) => i < 6 || POPULAR.includes(r.name));
  const out: [Row, Row][] = [];
  for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) out.push(pairOrder(top[i].name, top[j].name)[0] === top[i].name ? [top[i], top[j]] : [top[j], top[i]]);
  return out;
}
