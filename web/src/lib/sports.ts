export type SportKey = "soccer" | "hockey" | "basketball" | "tennis" | "mma";

export type Sport = {
  key: SportKey;
  label: string;
  emoji: string;
  /** Whether a draw is priced in the main market (hockey is priced on regulation time) */
  hasDraw: boolean;
};

export const sports: Sport[] = [
  { key: "soccer", label: "Футбол", emoji: "⚽", hasDraw: true },
  { key: "hockey", label: "Хоккей", emoji: "🏒", hasDraw: true },
  { key: "basketball", label: "Баскетбол", emoji: "🏀", hasDraw: false },
  { key: "tennis", label: "Теннис", emoji: "🎾", hasDraw: false },
  { key: "mma", label: "ММА", emoji: "🥊", hasDraw: false },
];

export function getSport(key: string | undefined | null): Sport | undefined {
  return sports.find((s) => s.key === key);
}
