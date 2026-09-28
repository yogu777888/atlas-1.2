/** The tag silhouette: a price tag pointing left, with its string hole. */
const TAG_PATH =
  "M13.2 6H24a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H13.2a3 3 0 0 1-2.2-1l-6.4-7.6a2 2 0 0 1 0-2.8L11 7a3 3 0 0 1 2.2-1Z";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g transform="rotate(-14 16 16)">
        <path d={TAG_PATH} fill="var(--color-accent)" />
        <circle cx="12.6" cy="16" r="2.3" fill="var(--color-bg)" />
      </g>
    </svg>
  );
}

/** Tag mark + wordmark with the accent dot. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-3xl" : "text-[19px]";
  const mark = size === "lg" ? "size-10" : "size-7";
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold tracking-[-0.035em] ${text}`}>
      <LogoMark className={`${mark} -ml-1`} />
      <span>
        tag<span className="text-accent">.</span>bet
      </span>
    </span>
  );
}
