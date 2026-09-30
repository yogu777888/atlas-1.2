import { badgeOf } from "@/lib/badges";

const LIGHT = /^#(f|e)/i;

/** Flag for a national team, the club's two colours for a club; nothing for a team we have no mark for (a letter in a circle looked like a broken image). */
export function TeamMark({ name, size = 16 }: { name: string; size?: number }) {
  const b = badgeOf(name);
  const box = { width: size, height: size };
  if ("flag" in b) {
    return <span className={`fi fi-${b.flag} fis inline-block shrink-0 rounded-full bg-cover ring-1 ring-fg/15`} style={box} aria-hidden />;
  }
  if ("colors" in b) {
    const [a, c] = b.colors;
    return (
      <span
        className={`inline-block shrink-0 rounded-full ring-1 ${LIGHT.test(a) && LIGHT.test(c) ? "ring-fg/25" : "ring-fg/10"}`}
        style={{ ...box, background: `linear-gradient(135deg, ${a} 0 50%, ${c} 50% 100%)` }}
        aria-hidden
      />
    );
  }
  return null;
}

/** "◐ Зенит — ◐ Спартак", one line that truncates as a whole */
export function Teams({ home, away, size = 16, className = "" }: { home: string; away: string; size?: number; className?: string }) {
  return (
    <span className={`block truncate ${className}`}>
      {"initial" in badgeOf(home) ? null : (
        <span className="mr-1.5 inline-block align-[-0.15em]">
          <TeamMark name={home} size={size} />
        </span>
      )}
      {home} —{" "}
      {"initial" in badgeOf(away) ? null : (
        <span className="mr-1.5 inline-block align-[-0.15em]">
          <TeamMark name={away} size={size} />
        </span>
      )}
      {away}
    </span>
  );
}
