export function LogoMark({ className = "size-7" }: { className?: string }) {
  // A price tag whose hole doubles as the "." in tag.bet
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
      <path
        d="M9 9.5h7.6c.5 0 1 .2 1.4.6l5.5 5.5c.8.8.8 2 0 2.8l-5.6 5.6c-.8.8-2 .8-2.8 0L9.6 18.5c-.4-.4-.6-.9-.6-1.4V9.5Z"
        fill="var(--color-accent-ink)"
      />
      <circle cx="13" cy="13.5" r="1.7" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <LogoMark />
      <span className="text-[17px]">
        tag<span className="text-accent">.</span>bet
      </span>
    </span>
  );
}
