/**
 * The flip: a yellow split-flap tile from a scoreboard. It is the dot in the
 * wordmark, the favicon, and the marker for odds priced above fair.
 */
export function FlipMark({ className = "size-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="var(--color-accent)" />
      <rect y="15.2" width="32" height="1.6" fill="var(--color-bg)" />
    </svg>
  );
}

/** "tag", the flip in place of the dot, "bet". */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-4xl" : "text-[27px]";
  return (
    <span className={`inline-flex items-baseline font-extrabold leading-none tracking-[-0.055em] ${text}`} aria-label="tag.bet">
      <span aria-hidden="true">tag</span>
      <FlipMark className="mr-[0.05em] ml-[0.08em] size-[0.34em] self-baseline" />
      <span aria-hidden="true">bet</span>
    </span>
  );
}
