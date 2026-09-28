export type SportKey = "soccer" | "basketball" | "tennis" | "mma" | "football";

export type Sport = {
  key: SportKey;
  label: string;
  emoji: string;
  /** the-odds-api.com sport keys pulled for this tab */
  oddsApiKeys: string[];
  /** Whether a draw is a priced outcome in the match-winner market */
  hasDraw: boolean;
};

export const sports: Sport[] = [
  { key: "soccer", label: "Football", emoji: "⚽", oddsApiKeys: ["soccer_epl", "soccer_uefa_champs_league", "soccer_spain_la_liga"], hasDraw: true },
  { key: "basketball", label: "Basketball", emoji: "🏀", oddsApiKeys: ["basketball_nba", "basketball_euroleague"], hasDraw: false },
  { key: "tennis", label: "Tennis", emoji: "🎾", oddsApiKeys: ["tennis_atp_us_open", "tennis_wta_us_open"], hasDraw: false },
  { key: "mma", label: "MMA", emoji: "🥊", oddsApiKeys: ["mma_mixed_martial_arts"], hasDraw: false },
  { key: "football", label: "NFL", emoji: "🏈", oddsApiKeys: ["americanfootball_nfl"], hasDraw: false },
];

export function getSport(key: string | undefined | null): Sport | undefined {
  return sports.find((s) => s.key === key);
}
