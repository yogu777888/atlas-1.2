import { FlipMark } from "./Logo";

/**
 * Cover for articles and tools: one key number on the scoreboard grid instead
 * of a stock photo. `size="lg"` is the article header version.
 */
export function Cover({ figure, caption, size = "md" }: { figure: string; caption: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <div className={`relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-line bg-surface-2 ${lg ? "p-8 sm:p-10" : "min-h-36 p-6"}`}>
      <div className="bg-grid absolute inset-0 opacity-70 [mask-image:none]" aria-hidden />
      <FlipMark className={`absolute ${lg ? "top-6 right-6 size-4" : "top-5 right-5 size-3"}`} />
      <div className="relative">
        <p className={`font-extrabold tracking-[-0.045em] tabular-nums ${lg ? "text-5xl sm:text-6xl" : "text-4xl"}`}>{figure}</p>
        <p className={`mt-2 text-muted ${lg ? "text-sm" : "line-clamp-2 text-xs"}`}>{caption}</p>
      </div>
    </div>
  );
}
