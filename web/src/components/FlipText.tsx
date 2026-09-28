/**
 * Scoreboard flip: each character drops in like a split-flap tile, left to
 * right. Pure CSS, so the settled value is what renders without motion
 * (reduced-motion users and crawlers see the final text).
 */
export function FlipText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-flex [perspective:400px]" aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden className="inline-block origin-top animate-flip" style={{ animationDelay: `${delay + i * 70}ms` }}>
          {ch}
        </span>
      ))}
    </span>
  );
}
