import { badgeOf, logoOf } from "@/lib/badges";
import { Crest } from "./Crest";

const LIGHT = /^#(f|e)/i;

/** Whether a team has any mark: flag, crest or club colours. */
export const hasMark = (name: string) => !!logoOf(name) || !("initial" in badgeOf(name));

/**
 * Flag for a national team, the crest for a club (its two colours while the
 * crest is unknown or fails to load); nothing for a team we have no mark for.
 */
export function TeamMark({ name, size = 16 }: { name: string; size?: number }) {
  const logo = logoOf(name);
  if (logo) {
    return (
      <Crest src={logo} size={size}>
        <Plain name={name} size={size} />
      </Crest>
    );
  }
  return <Plain name={name} size={size} />;
}

function Plain({ name, size }: { name: string; size: number }) {
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
      {!hasMark(home) ? null : (
        <span className="mr-1.5 inline-block align-[-0.15em]">
          <TeamMark name={home} size={size} />
        </span>
      )}
      {home} —{" "}
      {!hasMark(away) ? null : (
        <span className="mr-1.5 inline-block align-[-0.15em]">
          <TeamMark name={away} size={size} />
        </span>
      )}
      {away}
    </span>
  );
}
