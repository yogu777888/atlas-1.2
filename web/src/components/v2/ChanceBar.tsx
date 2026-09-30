import { OUTCOMES, outcomeLabel, probClass, type Match, type Probs1x2 } from "@/lib/matches";

/**
 * The three chances as one bar: home, draw, away side by side, each as wide
 * as its chance and coloured on the probability scale. One shape per match
 * instead of three boxes, and the favourite reads at a glance.
 */
export function ChanceBar({ m, fair = m.fair, size = "md", labels = false }: { m: Match; fair?: Probs1x2 | null; size?: "sm" | "md" | "lg"; labels?: boolean }) {
  if (!fair) return <span className="block h-2 rounded-full bg-surface-2" aria-label="Шансов пока нет" />;
  const h = { sm: "h-6 text-[13px]", md: "h-7 text-sm", lg: "h-9 text-lg" }[size];
  return (
    <span className="block" role="img" aria-label={OUTCOMES.map((o) => `${outcomeLabel(m, o)} ${Math.round(fair[o] * 100)}%`).join(", ")}>
      <span className={`flex gap-[3px] ${h}`}>
        {OUTCOMES.map((o, i) => (
          <span
            key={o}
            className={`pc grow-x num flex min-w-0 items-center justify-center overflow-hidden font-bold first:rounded-l-md last:rounded-r-md ${probClass(fair[o])}`}
            style={{ flex: `${Math.max(fair[o], 0.06)} 1 0`, animationDelay: `${i * 90}ms` }}
          >
            {fair[o] >= 0.1 ? Math.round(fair[o] * 100) : ""}
          </span>
        ))}
      </span>
      {labels && (
        <span className="mt-1 flex gap-[3px] text-[11px] text-subtle">
          {OUTCOMES.map((o) => (
            <span key={o} className="min-w-0 truncate text-center" style={{ flex: `${Math.max(fair[o], 0.06)} 1 0` }}>
              {o === "draw" ? "ничья" : o === "home" ? "П1" : "П2"}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
