// Only the fields tag.bet uses. Full schema: https://api.sstats.net (OpenAPI).

export type SsPrice = { name: string; value: number };
export type SsBet = { marketId: number; marketName: string | null; odds: SsPrice[] };

export type SsTeam = { id: number; name: string; country?: { code: string; name: string } | null };

export type SsGame = {
  id: number;
  date: string | null;
  dateUtc: number | null; // seconds
  status: number | null;
  homeTeam: SsTeam;
  awayTeam: SsTeam;
  season: { year: number; league: { id: number; name: string; country: { code: string; name: string } | null } | null };
  roundName: string | null;
  odds: SsBet[] | null;
};

export type SsBookmakerOdds = { bookmakerId: number; bookmakerName: string; odds: SsBet[] };

export type SsGlicko = {
  homeWinProbability: number | null;
  awayWinProbability: number | null;
  homeXg: number | null;
  awayXg: number | null;
};

export type PariOddsItem = { id: number; value: number; isBlocked?: boolean; isDeleted?: boolean };
export type PariMatch = {
  matchInfo: {
    eventId: number;
    startDate: string;
    status: string;
    tournament: { id: number; name: string; url: string | null };
    homeTeam: { id: number; name: string };
    awayTeam: { id: number; name: string };
    url: string | null;
    lastUpdate: string | null;
  };
  currentOdds: PariOddsItem[] | null;
};

export type PariMarket = {
  id: number;
  name: string;
  description: string | null;
  hasParameter: boolean;
  outcomes: { id: number; name: string; period: string; parameter: number | null }[];
};
