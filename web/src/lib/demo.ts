/**
 * Demo data for running the site without the sstats API (no key, or the API is
 * unreachable). Each club league gets a plausible season, played up to today,
 * in the same shape sstats returns, so demo pages go through the same code as
 * live ones. Goals follow a Poisson model from made-up team strengths; the odds
 * are that model's chances with a bookmaker margin. Deterministic per league.
 */
import { CLUB_LEAGUES, leagueSourceId, type ClubLeague } from "./leagues";
import type { SsGame } from "./sstats/types";

const ROSTERS: Record<ClubLeague, string[]> = {
  rpl: ["Зенит", "Краснодар", "Спартак", "Локомотив", "ЦСКА", "Динамо", "Ростов", "Рубин", "Балтика", "Ахмат", "Крылья Советов", "Акрон", "Динамо Махачкала", "Пари НН", "Сочи", "Оренбург"],
  epl: ["Ливерпуль", "Арсенал", "Манчестер Сити", "Челси", "Ньюкасл", "Астон Вилла", "Тоттенхэм", "Манчестер Юнайтед", "Брайтон", "Ноттингем Форест", "Борнмут", "Фулхэм", "Брентфорд", "Кристал Пэлас", "Эвертон", "Вест Хэм", "Вулверхэмптон", "Лидс", "Бернли", "Сандерленд"],
  laliga: ["Реал Мадрид", "Барселона", "Атлетико", "Атлетик", "Вильярреал", "Бетис", "Реал Сосьедад", "Сельта", "Жирона", "Осасуна", "Севилья", "Валенсия", "Райо Вальекано", "Мальорка", "Хетафе", "Эспаньол", "Алавес", "Леванте", "Эльче", "Овьедо"],
  seriea: ["Интер", "Наполи", "Милан", "Ювентус", "Аталанта", "Рома", "Лацио", "Болонья", "Фиорентина", "Комо", "Торино", "Удинезе", "Дженоа", "Кальяри", "Лечче", "Сассуоло", "Верона", "Парма", "Кремонезе", "Пиза"],
  bundesliga: ["Бавария", "Байер", "Боруссия Д", "РБ Лейпциг", "Айнтрахт", "Штутгарт", "Фрайбург", "Боруссия М", "Вольфсбург", "Вердер", "Хоффенхайм", "Майнц", "Аугсбург", "Унион Берлин", "Хайденхайм", "Санкт-Паули", "Кёльн", "Гамбург"],
  ligue1: ["ПСЖ", "Марсель", "Монако", "Лилль", "Лион", "Ницца", "Ланс", "Ренн", "Страсбург", "Нант", "Тулуза", "Брест", "Осер", "Анже", "Гавр", "Лорьян", "Метц", "Париж"],
};

/** First round of each league, month and day (the season's year is added). */
const START: Record<ClubLeague, [number, number]> = { rpl: [6, 18], epl: [7, 15], laliga: [7, 15], seriea: [7, 22], bundesliga: [7, 22], ligue1: [7, 15] };
const KICKOFFS = ["14:30", "17:00", "19:30", "22:00"];
const MARGIN = 1.055;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const poissonPmf = (l: number, k: number) => {
  let p = Math.exp(-l);
  for (let i = 1; i <= k; i++) p *= l / i;
  return p;
};

function samplePoisson(l: number, r: () => number): number {
  let k = 0, p = Math.exp(-l), s = p;
  const u = r();
  while (u > s && k < 9) {
    k++;
    p *= l / k;
    s += p;
  }
  return k;
}

/** Match chances from two expected-goal figures: 1X2, over 2.5 goals, both teams to score. */
export function poissonChances(lh: number, la: number) {
  let home = 0, draw = 0, away = 0, under = 0;
  for (let h = 0; h <= 9; h++)
    for (let a = 0; a <= 9; a++) {
      const p = poissonPmf(lh, h) * poissonPmf(la, a);
      if (h > a) home += p;
      else if (h === a) draw += p;
      else away += p;
      if (h + a <= 2) under += p;
    }
  const sum = home + draw + away;
  return { home: home / sum, draw: draw / sum, away: away / sum, over25: 1 - under, btts: (1 - Math.exp(-lh)) * (1 - Math.exp(-la)) };
}

type DemoGame = SsGame & { xg: [number, number] };

const leagueIndex = (key: ClubLeague) => CLUB_LEAGUES.indexOf(key);
/** Team ids and game ids are made up but stable: league index in the high digits. */
export const demoTeamId = (key: ClubLeague, i: number) => 9_000 + leagueIndex(key) * 100 + i;
const demoGameId = (key: ClubLeague, year: number, n: number) => 90_000_000 + (year % 100) * 100_000 + leagueIndex(key) * 10_000 + n;

const cache = new Map<string, DemoGame[]>();

/** A whole double round-robin season; games before `now` are finished. */
export function demoSeasonGames(key: ClubLeague, year: number, now = Date.now()): DemoGame[] {
  const hourBucket = Math.floor(now / 3_600_000);
  const ck = `${key}:${year}:${hourBucket}`;
  const hit = cache.get(ck);
  if (hit) return hit;

  const teams = ROSTERS[key];
  const n = teams.length;
  const r = rng(1_000 + leagueIndex(key) * 97 + year);
  // Stronger teams first in the roster; a little noise so tables aren't identical every year
  const strength = teams.map((_, i) => 0.42 - (0.8 * i) / (n - 1) + (r() - 0.5) * 0.12);
  const league = { id: leagueSourceId(key) ?? 0, name: key, country: null };

  // Circle method: team 0 stays, the rest rotate
  const order = teams.map((_, i) => i);
  const rounds: [number, number][][] = [];
  for (let k = 0; k < n - 1; k++) {
    const pairs: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = order[i], b = order[n - 1 - i];
      pairs.push(k % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(pairs);
    order.splice(1, 0, order.pop()!);
  }
  const all = [...rounds, ...rounds.map((p) => p.map(([a, b]) => [b, a] as [number, number]))];

  const [month, day] = START[key];
  const out: DemoGame[] = [];
  let g = 0;
  all.forEach((pairs, round) => {
    pairs.forEach(([h, a], i) => {
      const dayOffset = round * 7 + (i % 3); // Saturday to Monday
      const [hh, mm] = KICKOFFS[(i + round) % KICKOFFS.length].split(":").map(Number);
      const start = Date.UTC(year, month, day + dayOffset, hh - 3, mm); // Moscow time
      const lh = Math.exp(Math.log(1.35) + strength[h] - strength[a] + 0.12);
      const la = Math.exp(Math.log(1.35) + strength[a] - strength[h]);
      const c = poissonChances(lh, la);
      const done = start + 2 * 3_600_000 < now;
      const hg = samplePoisson(lh, r), ag = samplePoisson(la, r);
      out.push({
        id: demoGameId(key, year, ++g),
        date: new Date(start).toISOString(),
        dateUtc: Math.floor(start / 1000),
        status: done ? 8 : 2,
        homeTeam: { id: demoTeamId(key, h), name: teams[h] },
        awayTeam: { id: demoTeamId(key, a), name: teams[a] },
        season: { year, league },
        roundName: `Regular Season - ${round + 1}`,
        odds: [{ marketId: 1, marketName: "Match Winner", odds: [
          { name: "Home", value: +(1 / (c.home * MARGIN)).toFixed(2) },
          { name: "Draw", value: +(1 / (c.draw * MARGIN)).toFixed(2) },
          { name: "Away", value: +(1 / (c.away * MARGIN)).toFixed(2) },
        ] }],
        homeResult: done ? hg : null,
        awayResult: done ? ag : null,
        xg: [lh, la],
      });
    });
  });
  cache.set(ck, out);
  return out;
}

/** Upcoming demo games across the club leagues between two instants. */
export function demoUpcoming(fromMs: number, toMs: number, now = Date.now()): DemoGame[] {
  const year = new Date(now).getUTCMonth() >= 6 ? new Date(now).getUTCFullYear() : new Date(now).getUTCFullYear() - 1;
  return CLUB_LEAGUES.flatMap((k) => demoSeasonGames(k, year, now)).filter((g) => g.dateUtc! * 1000 >= fromMs && g.dateUtc! * 1000 < toMs);
}

/** Any demo game by id (this season or the last one). */
export function demoGame(id: number, now = Date.now()): DemoGame | null {
  const year = 2000 + Math.floor((id - 90_000_000) / 100_000);
  const key = CLUB_LEAGUES[Math.floor((id % 100_000) / 10_000)];
  if (!key || year < 2020) return null;
  return demoSeasonGames(key, year, now).find((g) => g.id === id) ?? null;
}

/** A bookmaker's price in demo mode: the model price, nudged a few percent either way (now and then above fair). */
export function demoPrice(price: number, salt: number): number {
  const r = rng(salt)();
  return +(price * (0.96 + r * 0.11)).toFixed(2);
}
