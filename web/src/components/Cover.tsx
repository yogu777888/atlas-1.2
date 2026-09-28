import { FlipMark } from "./Logo";

/**
 * Cover for articles and tools: one key number on the scoreboard grid instead
 * of a stock photo. `size="lg"` is the article header version.
 */
export function Cover({ figure, caption, size = "md", visual }: { figure: string; caption: string; size?: "md" | "lg"; visual?: React.ReactNode }) {
  const lg = size === "lg";
  return (
    <div className={`relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-line bg-surface-2 ${lg ? "min-h-56 p-8 sm:p-10" : "min-h-44 p-6"}`}>
      <div className="bg-grid absolute inset-0 opacity-70 [mask-image:none]" aria-hidden />
      {visual ? (
        <div className="relative self-end">{visual}</div>
      ) : (
        <FlipMark className={`relative self-end ${lg ? "size-4" : "size-3"}`} />
      )}
      <div className="relative">
        <p className={`font-extrabold tracking-[-0.045em] tabular-nums ${lg ? "text-5xl sm:text-6xl" : "text-4xl"}`}>{figure}</p>
        <p className={`mt-2 text-muted ${lg ? "text-sm" : "line-clamp-2 text-xs"}`}>{caption}</p>
      </div>
    </div>
  );
}
